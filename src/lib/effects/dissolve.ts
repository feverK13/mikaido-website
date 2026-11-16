/* Піксельне розчинення (матриця Байєра 4 × 4): 650 мс, на телефоні 450 мс.
   Логіку перенесено з docs/design-system/components/bundle.js. Розширення без зміни типової поведінки:
   - повертає ручку: cancel() зупиняє анімацію, covered() каже, яка частина полотна зараз закрита;
   - covered у параметрах починає анімацію не з краю, а з поточного стану (зворотний хід без стрибка);
   - from: 'top' | 'bottom' додає вертикальний зсув порога замість горизонтального, тож розчинення
     тягнеться від верхнього чи нижнього краю. Без from поведінка та сама, що в еталоні. */
import { B4 } from './bayer'
import { isCoarsePointer, isMotionAllowed } from './motion'

type DissolveOptions = {
  dur?: number
  dir?: 1 | -1
  color?: string
  cell?: number
  done?: () => void
  /** Від якого краю тягнеться розчинення. */
  from?: 'top' | 'bottom'
  /** Яка частина полотна закрита на старті (0 – прозоре, 1 – повністю залите). Типово: 1 для dir 1, 0 для dir -1. */
  covered?: number
}

export type DissolveHandle = {
  cancel: () => void
  /** Частина полотна, що закрита просто зараз (0–1). */
  covered: () => number
}

const NOOP: DissolveHandle = { cancel: () => {}, covered: () => 0 }

export function dissolve(
  cv: HTMLCanvasElement,
  { dur, dir = 1, color = '#111216', cell, done, from, covered }: DissolveOptions = {},
): DissolveHandle {
  const coarse = isCoarsePointer()
  const duration = dur || (coarse ? 450 : 650)
  const size = cell || (coarse ? 8 : 6)
  const W = Math.max(8, Math.round(cv.clientWidth / size))
  const H = Math.max(4, Math.round(cv.clientHeight / size))
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (!ctx) return NOOP

  if (!isMotionAllowed()) {
    ctx.clearRect(0, 0, W, H)
    done?.()
    return NOOP
  }

  const start = Math.min(1, Math.max(0, covered ?? (dir > 0 ? 1 : 0)))
  const k0 = dir > 0 ? 1 - start : start
  let k = k0
  let stopped = false
  const t0 = performance.now()
  const frame = (now: number) => {
    if (stopped) return
    k = Math.min(1, k0 + (now - t0) / duration)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = color
    for (let i = 0; i < W; i++) {
      for (let j = 0; j < H; j++) {
        const along = from === 'top' ? j / H : from === 'bottom' ? 1 - j / H : i / W
        const th = B4[i % 4][j % 4] * 0.75 + along * 0.25
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
  return {
    cancel: () => {
      stopped = true
    },
    covered: () => (dir > 0 ? 1 - k : k),
  }
}
