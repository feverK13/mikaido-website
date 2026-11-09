/* Піксельна голограма: воксельні моделі, проєкція на піксельну сітку, ефекти голограми.
   Одна голограма на екран, ніколи фоном. На телефоні 20 кадрів/с без реакції на палець.
   Логіку перенесено з docs/design-system/components/bundle.js (об'єкт HOLO) без змін. */
import { iris } from './iris'

/** Воксель: x, y, z, s (s = 1 акцентний). */
type Voxel = [number, number, number, number]
type Model = 'page' | 'calendar' | 'nodes' | 'box'
type Style = 'vox' | 'wire' | 'dot'
type Base = 'grid' | 'marks' | 'shadow' | 'none' | 'beam'

type MountOptions = { dark?: boolean; base?: Base; scan?: boolean; noGlitch?: boolean }

type Item = {
  cv: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  vox: Voxel[]
  style: Style
  vis: boolean
  seed: number
  a0: number
  fd: boolean | undefined
  base: Base
  scan: boolean
  noGlitch: boolean
  W: number
  H: number
  d: number
}

type Point = [number, number, number, number, number]

function page(): Voxel[] {
  const v: Voxel[] = []
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 14; y++) {
      const b = x === 0 || x === 9 || y === 0 || y === 13
      const head = y >= 10 && y <= 11 && x >= 2 && x <= 7
      const l1 = y === 8 && x >= 2 && x <= 8
      const l2 = y === 6 && x >= 2 && x <= 6
      const btn = y >= 2 && y <= 3 && x >= 2 && x <= 4
      if (b || head || l1 || l2) v.push([x - 4.5, y - 6.5, 0, 0])
      if (btn) v.push([x - 4.5, y - 6.5, 0, 1])
      if (b) v.push([x - 4.5, y - 6.5, -1, 0])
    }
  }
  return v
}

function calendar(): Voxel[] {
  const v: Voxel[] = []
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 11; y++) {
      const b = x === 0 || x === 11 || y === 0 || y === 10
      const hd = y >= 8
      const cell = !b && !hd && x % 3 !== 0 && y % 3 !== 1
      if (b || hd) {
        v.push([x - 5.5, y - 5, 0, 0])
      } else if (cell) {
        const hi = x >= 7 && x <= 8 && y >= 2 && y <= 3
        v.push([x - 5.5, y - 5, 0, hi ? 1 : 0])
      }
      if (b) v.push([x - 5.5, y - 5, -1, 0])
    }
  }
  for (const rx of [3, 8]) for (let y = 10; y < 13; y++) v.push([rx - 5.5, y - 5, 0.5, 0])
  return v
}

function nodes(): Voxel[] {
  const v: Voxel[] = []
  const C: [number, number, number][] = [
    [-5, -3, 1],
    [5, -3, 1],
    [0, 4, -2],
  ]
  const seen = new Set<string>()
  const add = (x: number, y: number, z: number, s: number) => {
    const k = [Math.round(x), Math.round(y), Math.round(z)].join()
    if (!seen.has(k)) {
      seen.add(k)
      v.push([Math.round(x), Math.round(y), Math.round(z), s])
    }
  }
  C.forEach((c, i) => {
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) add(c[0] + x, c[1] + y, c[2] + z, i === 2 ? 1 : 0)
  })
  ;[
    [0, 1],
    [1, 2],
    [2, 0],
  ].forEach(([a, b]) => {
    const A = C[a]
    const B = C[b]
    for (let t = 0; t <= 1; t += 0.06)
      add(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, 0)
  })
  return v
}

function box(): Voxel[] {
  const v: Voxel[] = []
  const W = 10
  const H = 8
  const D = 8
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      for (let z = 0; z < D; z++) {
        const shell = x === 0 || x === W - 1 || y === 0 || y === H - 1 || z === 0 || z === D - 1
        if (!shell) continue
        const tape = y === H - 1 && (x === 4 || x === 5)
        v.push([x - 4.5, y - 3.5, z - 3.5, tape ? 1 : 0])
      }
    }
  }
  for (let x = 4; x <= 5; x++) for (let y = 4; y < 8; y++) v.push([x - 4.5, y - 3.5, -3.5 - 0.01, 1])
  return v
}

const MODELS: Record<Model, () => Voxel[]> = { page, calendar, nodes, box }

function edges(vox: Voxel[]): Voxel[] {
  const set = new Set(vox.map((p) => p.slice(0, 3).map(Math.round).join()))
  return vox.filter((p) => {
    const [x, y, z] = p.map(Math.round)
    const h = (a: number, b: number, c: number) => set.has([a, b, c].join())
    let full = 0
    if (h(x + 1, y, z) && h(x - 1, y, z)) full++
    if (h(x, y + 1, z) && h(x, y - 1, z)) full++
    if (h(x, y, z + 1) && h(x, y, z - 1)) full++
    return full <= 1
  })
}

const SYS_RM = matchMedia('(prefers-reduced-motion: reduce)').matches
const RM = () => (window.MK_MOTION === true ? false : window.MK_MOTION === false ? true : SYS_RM)

const items: Item[] = []

function size(it: Item) {
  const r = it.cv.getBoundingClientRect()
  const d = Math.min(devicePixelRatio || 1, 2)
  it.W = Math.max(1, Math.round(r.width * d))
  it.H = Math.max(1, Math.round(r.height * d))
  it.cv.width = it.W
  it.cv.height = it.H
  it.d = d
}

function mount(cv: HTMLCanvasElement, model: Model, style: Style, opts: MountOptions = {}) {
  const vox = MODELS[model]()
  const ctx = cv.getContext('2d')
  if (!ctx) return undefined

  const it: Item = {
    cv,
    ctx,
    vox: style === 'wire' ? edges(vox) : vox,
    style,
    vis: true,
    seed: Math.random() * 1000,
    a0: -0.6,
    fd: opts.dark,
    base: opts.base || 'beam',
    scan: !!opts.scan,
    noGlitch: !!opts.noGlitch,
    W: 0,
    H: 0,
    d: 1,
  }
  items.push(it)
  new IntersectionObserver((e) => {
    it.vis = e[0].isIntersecting
  }).observe(cv)
  size(it)
  return it
}

function draw(it: Item, t: number) {
  const { ctx, W, H, d } = it
  const dark = it.fd !== undefined ? it.fd : document.documentElement.dataset.theme === 'dark'
  ctx.clearRect(0, 0, W, H)
  const S = Math.max(3, Math.round(Math.min(W, H) / 26)) | 0
  const px =
    it.style === 'wire'
      ? Math.max(2, Math.round(S * 0.45))
      : it.style === 'dot'
        ? S
        : S - Math.max(1, Math.round(d))
  const a = RM() ? it.a0 : it.a0 + t * 0.00045
  const tilt = 0.32
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const cx = Math.round(W / 2)
  const cy = Math.round(H * 0.46)
  const pts: Point[] = it.vox.map((p) => {
    const x1 = p[0] * ca + p[2] * sa
    const z1 = -p[0] * sa + p[2] * ca
    const y1 = p[1] * ct - z1 * st
    const dep = p[1] * st + z1 * ct
    return [cx + Math.round(x1 * S), cy - Math.round(y1 * S), dep, p[1], p[3]]
  })
  pts.sort((A, B) => A[2] - B[2])
  let ymin = 1e9
  let ymax = -1e9
  for (const p of it.vox) {
    ymin = Math.min(ymin, p[1])
    ymax = Math.max(ymax, p[1])
  }

  // основа: beam / shadow / grid / marks / none
  const by = cy + Math.round((ymax - ymin) * 0.5 * S * ct) + S * 3
  const gc = dark ? '158,162,174' : '93,97,112'
  const dot = Math.max(2, d * 2)
  if (it.base === 'beam') {
    const beam = ctx.createLinearGradient(0, by, 0, cy - (ymax - ymin) * S * 0.6)
    const bc = dark ? '94,202,214' : '44,99,176'
    beam.addColorStop(0, `rgba(${bc},${dark ? 0.16 : 0.09})`)
    beam.addColorStop(1, `rgba(${bc},0)`)
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(cx - S * 3, by)
    ctx.lineTo(cx + S * 3, by)
    ctx.lineTo(cx + S * 9, cy - (ymax - ymin) * S * 0.6)
    ctx.lineTo(cx - S * 9, cy - (ymax - ymin) * S * 0.6)
    ctx.fill()
    ctx.fillStyle = `rgba(${gc},.5)`
    for (let i = 0; i < 28; i++) {
      const an = (i / 28) * Math.PI * 2
      ctx.fillRect(cx + Math.round(Math.cos(an) * S * 7) - 1, by + Math.round(Math.sin(an) * S * 1.6) - 1, dot, dot)
    }
  } else if (it.base === 'shadow') {
    // піксельна тінь самого предмета на підлозі
    const seen = new Set<string>()
    ctx.fillStyle = `rgba(${gc},${dark ? 0.28 : 0.22})`
    for (const p of it.vox) {
      const x1 = p[0] * ca + p[2] * sa
      const z1 = -p[0] * sa + p[2] * ca
      const gx = cx + Math.round((x1 * S) / 2) * 2
      const gy = by - S * 2 + Math.round((z1 * S * 0.28) / 2) * 2
      const k = gx + ',' + gy
      if (seen.has(k)) continue
      seen.add(k)
      ctx.fillRect((gx - S / 2) | 0, gy, S, Math.max(2, (S * 0.5) | 0))
    }
  } else if (it.base === 'grid') {
    // підлога-креслення: сітка точок обертається разом із предметом
    const fy = ymin - 1.5
    ctx.fillStyle = `rgba(${gc},.8)`
    for (let gx = -8; gx <= 8; gx += 2) {
      for (let gz = -8; gz <= 8; gz += 2) {
        const x1 = gx * ca + gz * sa
        const z1 = -gx * sa + gz * ca
        const y1 = fy * ct - z1 * st
        const r = Math.hypot(gx, gz)
        if (r > 8.5) continue
        ctx.globalAlpha = Math.max(0.15, 1 - r / 9)
        ctx.fillRect(cx + Math.round(x1 * S) - 1, cy - Math.round(y1 * S) - 1, dot, dot)
      }
    }
    ctx.globalAlpha = 1
  } else if (it.base === 'marks') {
    // кутові мітки креслення навколо предмета
    let x0 = 1e9
    let x9 = -1e9
    let y0 = 1e9
    let y9 = -1e9
    for (const q of pts) {
      x0 = Math.min(x0, q[0])
      x9 = Math.max(x9, q[0])
      y0 = Math.min(y0, q[1])
      y9 = Math.max(y9, q[1])
    }
    const m = S * 2
    const L = S * 2
    const lw = Math.max(1, d)
    x0 -= m
    x9 += m
    y0 -= m
    y9 += m
    ctx.fillStyle = `rgba(${gc},.8)`
    for (const [X, Y, sx, sy] of [
      [x0, y0, 1, 1],
      [x9, y0, -1, 1],
      [x0, y9, 1, -1],
      [x9, y9, -1, -1],
    ]) {
      ctx.fillRect(sx > 0 ? X : X - L, Y, L, lw)
      ctx.fillRect(X, sy > 0 ? Y : Y - L, lw, L)
    }
    ctx.fillRect(cx - S, ((y0 + y9) / 2) | 0, S * 2, lw)
    ctx.fillRect(cx, (((y0 + y9) / 2) | 0) - S, lw, S * 2)
  }

  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  const flick = RM() ? 1 : 0.9 + 0.1 * Math.sin(t / 140 + it.seed)
  const sweep = RM() ? 0.35 : ((t / 3200 + it.seed) % 1.6) - 0.3
  for (const p of pts) {
    const ty = (p[3] - ymin) / (ymax - ymin || 1)
    const front = (p[2] + 8) / 16
    let c: number[]
    let al: number
    if (it.style === 'dot') {
      const near = Math.abs(ty - (1 - sweep)) < 0.12
      c = near || p[4] ? iris(ty, dark) : dark ? [201, 204, 211] : [38, 40, 46]
      al = (0.45 + 0.5 * front) * flick
    } else if (it.style === 'wire') {
      c = p[4] ? iris(0.75, dark) : dark ? [141, 182, 236] : [44, 99, 176]
      al = (0.55 + 0.45 * front) * flick
    } else {
      c = iris(p[4] ? 0.85 : ty * 0.7, dark)
      al = (0.35 + 0.6 * front) * flick
      if (it.scan) {
        const b = Math.abs(ty - (1 - sweep))
        if (b < 0.08) al = Math.min(1, al + 0.45)
        else if (b < 0.16) al += 0.15
      }
    }
    ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.min(1, al).toFixed(3)})`
    if (it.style === 'dot') {
      ctx.beginPath()
      ctx.arc(p[0], p[1], px * 0.36, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(p[0] - (px >> 1), p[1] - (px >> 1), px, px)
    }
  }
  ctx.globalCompositeOperation = 'source-over'

  // скан-лінії
  ctx.fillStyle = dark ? 'rgba(12,13,16,.28)' : 'rgba(247,248,250,.32)'
  for (let y = 0; y < H; y += 3 * d) ctx.fillRect(0, y, W, d)

  // повільний глітч: раз на кілька секунд зсуваємо смугу
  if (!RM() && !it.noGlitch) {
    const ph = (t + it.seed * 7) % 5200
    if (ph < 130) {
      const gy = (((it.seed * 37 + Math.floor(t / 5200) * 53) % (H * 0.6)) + H * 0.15) | 0
      const gh = Math.round(S * 1.5)
      const img = ctx.getImageData(0, gy, W, gh)
      ctx.clearRect(0, gy, W, gh)
      ctx.putImageData(img, Math.round(S * (ph < 65 ? 1.2 : -0.6)), gy)
    }
  }
}

let last = 0
function loop(t: number) {
  if (t - last > 33) {
    last = t
    for (const it of items) if (it.vis && it.cv.isConnected) draw(it, t)
  }
  requestAnimationFrame(loop)
}

addEventListener('resize', () => {
  items.forEach((it) => {
    size(it)
    draw(it, performance.now())
  })
})

function start() {
  items.forEach((it) => draw(it, 0))
  requestAnimationFrame(loop)
}

function redraw() {
  items.forEach((it) => draw(it, performance.now()))
}

export const HOLO = { mount, start, redraw, models: MODELS, iris, RM, SYS_RM }
export type { Base as HologramBase, Model as HologramModel, MountOptions as HologramOptions }
