import { useEffect, useRef, type RefObject } from 'react'
import { HOLO, type HologramModel } from '@/lib/effects/hologram'

let started = false

/** Монтує голограму на полотно. Цикл малювання запускається один раз на всю сторінку. */
export function useHologram(model: HologramModel): RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const item = HOLO.mount(cv, model, 'vox', { base: 'grid', scan: true, noGlitch: true })
    if (!started) {
      started = true
      HOLO.start()
    } else if (item) {
      HOLO.redraw()
    }
  }, [model])
  return ref
}
