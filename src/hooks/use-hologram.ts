import { useEffect, useRef, type RefObject } from 'react'
import { HOLO, type HologramModel } from '@/lib/effects/hologram'

let started = false

/** Монтує голограму на полотно один раз; зміна моделі підміняє вокселі. Цикл малювання один на всю сторінку. */
export function useHologram(model: HologramModel): RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null)
  const item = useRef<ReturnType<typeof HOLO.mount>>(undefined)

  useEffect(() => {
    const cv = ref.current
    if (!cv || item.current) return
    item.current = HOLO.mount(cv, model, 'vox', { base: 'grid', scan: true, noGlitch: true })
    if (!started) {
      started = true
      HOLO.start()
    } else {
      HOLO.redraw()
    }
    // Монтуємо один раз; наступні зміни моделі обробляє ефект нижче.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (item.current) item.current.vox = HOLO.models[model]()
  }, [model])

  return ref
}
