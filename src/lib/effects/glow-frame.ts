/* Піксельна рамка ірису для блока із закликом: прямокутник, що звужується й розширюється, а внутрішній край розсипається пробілами.
   Профіль щільності й матриця Байєра 4 × 4 такі самі, як у смузі підвалу (glow-strip.ts), а зсув матриці на піксель кожні 140 мс
   і повільна течія кольорів ірису як у сяйві гарантії (glow.ts). */
import { B4 } from './bayer'
import { iris } from './iris'

const CELL = 4
const MIN = 1.5
const MAX = 7

/** Малює один кадр. t у мс; без руху (motion = false) кадр статичний. */
export function drawGlowFrame(cv: HTMLCanvasElement, t: number, dark: boolean, motion: boolean) {
  const W = Math.max(20, Math.round(cv.clientWidth / CELL))
  const H = Math.max(12, Math.round(cv.clientHeight / CELL))
  if (cv.width !== W || cv.height !== H) {
    cv.width = W
    cv.height = H
  }
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const f = motion ? Math.floor(t / 140) : 0
  const sh = motion ? t / 6000 : 0
  const thick = motion ? MIN + (MAX - MIN) * (0.5 - 0.5 * Math.cos(t / 900)) : 4
  for (let i = 0; i < W; i++) {
    for (let j = 0; j < H; j++) {
      const d = Math.min(i, j, W - 1 - i, H - 1 - j)
      if (d >= thick) continue
      const a = (1 - d / thick) * 0.95 + (d === 0 ? 0.3 : 0)
      if (a <= B4[(i + f) % 4][(j + f) % 4]) continue
      const dx = (i - W / 2) / W
      const dy = (j - H / 2) / H
      const an = (Math.atan2(dy, dx) / Math.PI / 2 + 0.5 + sh) % 1
      const tt = an < 0.5 ? an * 2 : 2 - an * 2
      const c = iris(tt, dark)
      ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
      ctx.fillRect(i, j, 1, 1)
    }
  }
}
