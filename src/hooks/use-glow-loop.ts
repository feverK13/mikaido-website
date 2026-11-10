import { useEffect, type RefObject } from 'react'
import { isMotionAllowed } from '@/lib/effects/motion'
import { useTheme } from './use-theme'

type Draw = (cv: HTMLCanvasElement, t: number, dark: boolean, motion: boolean) => void

/** Цикл піксельного сяйва: малює лише коли полотно у вікні, кадр раз на 100 мс. Без руху кадр статичний. */
export function useGlowLoop(ref: RefObject<HTMLCanvasElement | null>, draw: Draw) {
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
    draw(cv, 0, dark, false)
    const frame = (t: number) => {
      if (visible && t - last > 100) {
        last = t
        draw(cv, t, dark, isMotionAllowed())
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [ref, draw, theme])
}
