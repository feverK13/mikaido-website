/* Піксельне сяйво під цифрою гарантії: кільце кольорів ірису, що повільно обертається, в матриці Байєра 4 × 4.
   Логіку перенесено з docs/reference/mikaido-home.html (функція glow) без змін. */
import { B4 } from './bayer'
import { iris } from './iris'

/** Малює один кадр. t у мс; без руху (motion = false) кадр статичний. */
export function drawGlow(cv: HTMLCanvasElement, t: number, dark: boolean, motion: boolean) {
  const W = Math.max(40, Math.round(cv.clientWidth / 5))
  const H = Math.max(20, Math.round(cv.clientHeight / 5))
  if (cv.width !== W) {
    cv.width = W
    cv.height = H
  }
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const f = motion ? Math.floor(t / 140) : 0
  const br = motion ? 0.86 + 0.14 * Math.sin(t / 900) : 0.95
  const sh = motion ? t / 5000 : 0
  for (let i = 0; i < W; i++) {
    for (let j = 0; j < H; j++) {
      const dx = (i - W / 2) / (W * 0.46)
      const dy = (j - H / 2) / (H * 0.46)
      const r = Math.sqrt(dx * dx + dy * dy)
      const a = Math.max(0, 1 - r / br) * 0.95
      if (a > B4[(i + f) % 4][(j + f) % 4]) {
        const an = (Math.atan2(dy, dx) / Math.PI / 2 + 0.5 + sh) % 1
        const tt = an < 0.5 ? an * 2 : 2 - an * 2
        const c = iris(tt, dark)
        ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
        ctx.fillRect(i, j, 1, 1)
      }
    }
  }
}
