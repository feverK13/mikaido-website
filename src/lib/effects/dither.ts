/* Піксельний градієнт ірису замість плавних градієнтів.
   Логіку перенесено з docs/design-system/components/bundle.js без змін. */
import { B4 } from './bayer'
import { iris } from './iris'

export function dither(cv: HTMLCanvasElement, { dark = false, h = 3 }: { dark?: boolean; h?: number } = {}) {
  const w = Math.max(40, Math.round(cv.clientWidth / 3))
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, w, h)
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const a = 1 - Math.abs(j - (h - 1) / 2) / ((h - 1) / 2 || 1)
      if (a > B4[i % 4][j % 4]) {
        const col = iris(i / (w - 1), dark)
        ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`
        ctx.fillRect(i, j, 1, 1)
      }
    }
  }
}
