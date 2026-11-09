/* Розшифрування тексту: 900 мс, один раз, лише заголовок першого екрана.
   Логіку перенесено з docs/design-system/components/bundle.js без змін. */
import { isMotionAllowed } from './motion'

const POOL = '░▒▓█/<>#01АБВГҐДЕЄЖЗИІЇЙКЛМН'
const DURATION = 900

export function decode(el: HTMLElement, text?: string) {
  const t = text || el.dataset.t || el.textContent || ''
  if (!isMotionAllowed()) {
    el.textContent = t
    return
  }

  const t0 = performance.now()
  const frame = (now: number) => {
    const k = Math.min(1, (now - t0) / DURATION)
    const n = Math.floor(t.length * k)
    let glyphs = ''
    for (const ch of t.slice(n)) glyphs += ch === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0]

    el.textContent = t.slice(0, n)
    if (glyphs) {
      const span = document.createElement('span')
      span.className = 'mk-g'
      span.textContent = glyphs
      el.appendChild(span)
    }
    if (k < 1) requestAnimationFrame(frame)
  }
  frame(t0)
}
