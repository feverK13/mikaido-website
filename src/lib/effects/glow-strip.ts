/* Піксельна смужка ірису для підвалу: та сама механіка, що в сяйві гарантії (glow.ts):
   матриця Байєра 4 × 4 зсувається на піксель кожні 140 мс, яскравість дихає, кольори ірису повільно пливуть.
   Форма інша: горизонтальна смуга з м'якими краями замість кільця. */
import { B4 } from './bayer'
import { iris } from './iris'

/** Малює один кадр. t у мс; без руху (motion = false) кадр статичний. */
export function drawGlowStrip(cv: HTMLCanvasElement, t: number, dark: boolean, motion: boolean) {
  const W = Math.max(40, Math.round(cv.clientWidth / 4))
  const H = Math.max(6, Math.round(cv.clientHeight / 4))
  if (cv.width !== W || cv.height !== H) {
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
    const an = (i / W + sh) % 1
    const tt = an < 0.5 ? an * 2 : 2 - an * 2
    const c = iris(tt, dark)
    ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
    for (let j = 0; j < H; j++) {
      const dy = Math.abs(j - (H - 1) / 2) / (H / 2)
      const a = Math.max(0, 1 - dy / br) * 0.95
      if (a > B4[(i + f) % 4][(j + f) % 4]) ctx.fillRect(i, j, 1, 1)
    }
  }
}
