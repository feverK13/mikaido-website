/* Піксельне розчинення (матриця Байєра 4 × 4): 650 мс, на телефоні 450 мс.
   Логіку перенесено з docs/design-system/components/bundle.js без змін. */
import { B4 } from './bayer'
import { isCoarsePointer, isMotionAllowed } from './motion'

type DissolveOptions = {
  dur?: number
  dir?: 1 | -1
  color?: string
  cell?: number
  done?: () => void
}

export function dissolve(
  cv: HTMLCanvasElement,
  { dur, dir = 1, color = '#111216', cell, done }: DissolveOptions = {},
) {
  const coarse = isCoarsePointer()
  const duration = dur || (coarse ? 450 : 650)
  const size = cell || (coarse ? 8 : 6)
  const W = Math.max(8, Math.round(cv.clientWidth / size))
  const H = Math.max(4, Math.round(cv.clientHeight / size))
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (!ctx) return

  if (!isMotionAllowed()) {
    ctx.clearRect(0, 0, W, H)
    done?.()
    return
  }

  const t0 = performance.now()
  const frame = (now: number) => {
    const k = Math.min(1, (now - t0) / duration)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = color
    for (let i = 0; i < W; i++) {
      for (let j = 0; j < H; j++) {
        const th = B4[i % 4][j % 4] * 0.75 + (i / W) * 0.25
        if (dir > 0 ? th > k : th < k) ctx.fillRect(i, j, 1, 1)
      }
    }
    if (k < 1) {
      requestAnimationFrame(frame)
    } else {
      if (dir > 0) ctx.clearRect(0, 0, W, H)
      done?.()
    }
  }
  frame(t0)
}
