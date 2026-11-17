/* Піксельна голограма: воксельні моделі, проєкція на піксельну сітку, ефекти голограми.
   Одна голограма на екран, ніколи фоном. На телефоні 20 кадрів/с без реакції на палець.
   Логіку перенесено з docs/design-system/components/bundle.js (об'єкт HOLO) без змін. */
import { iris } from './iris'

/** Воксель: x, y, z, s (s = 1 акцентний, s = 2 нейтральний), g (необов'язково: позиція в градієнті ірису 0..1). */
type Voxel = [number, number, number, number, number?]
type Model = 'page' | 'calendar' | 'nodes' | 'box' | 'mark'
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
  pitch: number
  W: number
  H: number
  d: number
}

type Point = [number, number, number, number, number, number | undefined]

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

/* Знак Mikaido з docs/design-system/assets/Logos/mikaido-mark-flat.svg (viewBox 240x140).
   Растеризація полотна на сітку 6 одиниць: окуляри (ромб-шеврон) товщиною 3 воксели з градієнтом ірису вздовж x,
   вигнуті назад до країв і втоплені в ніжки; дві суцільні ніжки 5x15 завтовшки 4 воксели нейтрального кольору.
   Усередині тіл порожньо: лишаємо лише поверхню. Крок вокселя менший за базовий (MARK_PITCH), тож координати
   зводимо до одиниць S. */
const MARK_PITCH = 0.6

function mark(): Voxel[] {
  const U = 6
  const poly: [number, number][] = [
    [2, 8],
    [120, 58],
    [238, 8],
    [120, 106],
  ]
  const inPoly = (x: number, y: number) => {
    let inside = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]
      const [xj, yj] = poly[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  // Градієнт SVG: x1=0 y1=0 x2=1 y2=.35 у частках рамки полігона.
  const grad = (x: number, y: number) => {
    const u = (x - 2) / 236
    const v = (y - 8) / 98
    return Math.max(0, Math.min(1, (u + v * 0.35) / (1 + 0.35 * 0.35)))
  }

  const cells = new Map<string, Voxel>()
  const put = (i: number, j: number, k: number, s: number, g?: number) => {
    cells.set([i, j, k].join(), [(i * U + U / 2 - 120) / U, -((j * U + U / 2 - 71) / U), k - 2.5, s, g])
  }

  for (let j = 0; j < 24; j++) {
    for (let i = 0; i < 40; i++) {
      const x = i * U + U / 2
      const y = j * U + U / 2
      const leg = (x >= 50 && x <= 80) || (x >= 160 && x <= 190)
      if (leg && y >= 44 && y <= 134) for (const k of [0, 1, 2, 3]) put(i, j, k, 2)
      if (inPoly(x, y)) {
        // Вигин окулярів: центр висунутий вперед, краї загинаються назад і занурюються в ніжки.
        const u = (x - 120) / 118
        const zc = Math.round(4 - 2.5 * u * u)
        for (const k of [zc - 1, zc, zc + 1]) put(i, j, k, 0, grad(x, y))
      }
    }
  }

  const has = (i: number, j: number, k: number) => cells.has([i, j, k].join())
  const out: Voxel[] = []
  for (const [key, v] of cells) {
    const [i, j, k] = key.split(',').map(Number)
    const inner =
      has(i + 1, j, k) && has(i - 1, j, k) && has(i, j + 1, k) && has(i, j - 1, k) && has(i, j, k + 1) && has(i, j, k - 1)
    if (!inner) out.push([v[0] * MARK_PITCH, v[1] * MARK_PITCH, v[2] * MARK_PITCH, v[3], v[4]])
  }
  return out
}

const MODELS: Record<Model, () => Voxel[]> = { page, calendar, nodes, box, mark }
const pitchOf = (model: Model) => (model === 'mark' ? MARK_PITCH : 1)

function edges(vox: Voxel[]): Voxel[] {
  const set = new Set(vox.map((p) => [p[0], p[1], p[2]].map(Math.round).join()))
  return vox.filter((p) => {
    const [x, y, z] = [p[0], p[1], p[2]].map(Math.round)
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
    pitch: pitchOf(model),
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
        : Math.round(S * it.pitch) - Math.max(1, Math.round(d))
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
    return [cx + Math.round(x1 * S), cy - Math.round(y1 * S), dep, p[1], p[3], p[4]]
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

  // Щільні моделі (дрібний крок вокселя, поверхня в кілька шарів) без адитивного змішування, інакше з ребра біліють.
  ctx.globalCompositeOperation = dark && it.pitch === 1 ? 'lighter' : 'source-over'
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
      c =
        p[5] !== undefined
          ? iris(p[5], dark)
          : p[4] === 2
            ? dark
              ? [201, 204, 211]
              : [38, 40, 46]
            : iris(p[4] ? 0.85 : ty * 0.7, dark)
      // Щільна модель накладає шари без адитивного змішування, тому прозорість вища, щоб колір лишався насиченим.
      const dense = it.pitch < 1
      al = (dense ? (p[4] === 2 ? 0.4 + 0.25 * front : 0.62 + 0.3 * front) : 0.35 + 0.6 * front) * flick
      if (it.scan) {
        const b = Math.abs(ty - (1 - sweep))
        if (dense) {
          // Смуга скану двома ступенями, як у решти голограм: ядро й вужчий ореол без плавного спаду.
          const k = b < 0.08 ? 0.55 : b < 0.16 ? 0.22 : 0
          if (k > 0) {
            al = al + (1 - al) * k
            const m = (dark ? 0.6 : 0.3) * k
            const to = dark ? 255 : 0
            c = [c[0] + (to - c[0]) * m, c[1] + (to - c[1]) * m, c[2] + (to - c[2]) * m]
          }
        } else if (b < 0.08) al = Math.min(1, al + 0.45)
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

export const HOLO = { mount, start, redraw, models: MODELS, pitchOf, iris, RM, SYS_RM }
export type { Base as HologramBase, Model as HologramModel, MountOptions as HologramOptions }
