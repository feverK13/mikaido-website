import { useEffect, useRef, type HTMLAttributes } from 'react'
import { dissolve } from '@/lib/effects/dissolve'
import { isMotionAllowed } from '@/lib/effects/motion'
import { onReveal } from '@/lib/effects/reveal'
import { cn } from '@/lib/utils'

/* Ключові блоки розчиняються по одному: наступний чекає, поки закінчиться попередній. */
let queue: Promise<void> = Promise.resolve()

type DissolveRevealProps = HTMLAttributes<HTMLDivElement> & {
  /** Викликається, коли розчинення закінчилось. */
  onRevealed?: () => void
}

/** Обгортка ключового блока: поверх нього полотно кольору фону, яке розчиняється при появі в екрані (Mikaido.dissolve). */
export function DissolveReveal({ className, children, onRevealed, ...props }: DissolveRevealProps) {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = host.current
    const cv = canvas.current
    if (!el || !cv) return
    /* Без руху прикривати блок нема чого: він видимий одразу, без очікування прокрутки. */
    if (!isMotionAllowed()) {
      cv.hidden = true
      onRevealed?.()
      return
    }
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    cv.width = 4
    cv.height = 4
    const ctx = cv.getContext('2d')
    if (ctx) {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 4, 4)
    }

    let cancelled = false
    const stop = onReveal(el, () => {
      queue = queue.then(
        () =>
          new Promise<void>((resolve) => {
            if (cancelled) return resolve()
            dissolve(cv, {
              color: bg,
              done: () => {
                cv.hidden = true
                onRevealed?.()
                resolve()
              },
            })
          }),
      )
    })
    return () => {
      cancelled = true
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={host} className={cn('relative', className)} {...props}>
      {children}
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-[6] h-[calc(100%+2px)] w-[calc(100%+2px)] [image-rendering:pixelated]"
      />
    </div>
  )
}
