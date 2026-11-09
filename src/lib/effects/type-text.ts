/* Друк термінала: до 50 знаків і 3 с. Курсор один на сторінку.
   Логіку перенесено з docs/design-system/components/bundle.js (функція type) без змін. */
import { isMotionAllowed } from './motion'

export function typeText(el: HTMLElement, text?: string, { speed }: { speed?: number } = {}): Promise<void> {
  const t = text || el.dataset.t || el.textContent || ''
  if (!isMotionAllowed()) {
    el.textContent = t
    return Promise.resolve()
  }

  const ms = speed || Math.min(60, 3000 / Math.max(1, t.length))
  let count = 0
  el.textContent = ''

  return new Promise((resolve) => {
    const step = () => {
      el.textContent = t.slice(0, ++count)
      if (count < t.length) setTimeout(step, ms)
      else resolve()
    }
    step()
  })
}
