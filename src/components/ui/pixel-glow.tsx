import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { drawGlow } from '@/lib/effects/glow'
import { isMotionAllowed } from '@/lib/effects/motion'

/** Піксельне сяйво: малюється лише коли блок у вікні, кадр раз на 100 мс. Без руху кадр статичний. */
export function PixelGlow() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dark = theme === 'dark'
    let visible = false
    let last = 0
    let raf = 0
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
    })
    observer.observe(cv)
    drawGlow(cv, 0, dark, false)
    const frame = (t: number) => {
      if (visible && t - last > 100) {
        last = t
        drawGlow(cv, t, dark, isMotionAllowed())
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [theme])

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 size-full [image-rendering:pixelated]" />
}
