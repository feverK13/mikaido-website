/* Піксельний сплеск при натисканні в будь-якому місці екрана, на мишці й на дотик.
   Кнопка A вже робить сплеск сама (lib/effects/burst.ts), тому її тут пропускаємо.
   Використано pointerup: під час прокручування дотиком він не спрацьовує. */
import { burst } from './burst'

export function initBurstAnywhere(): () => void {
  const onPointerUp = (e: PointerEvent) => {
    if (e.button !== 0 || !e.isPrimary) return
    const target = e.target instanceof Element ? e.target : document.body
    if (target.closest('.btn-a')) return
    burst(e, document.body)
  }
  document.addEventListener('pointerup', onPointerUp)
  return () => document.removeEventListener('pointerup', onPointerUp)
}
