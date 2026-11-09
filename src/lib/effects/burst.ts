/* Піксельний сплеск при натисканні кнопки A.
   Логіку перенесено з docs/design-system/components/bundle.js без змін. */
import { isCoarsePointer, isMotionAllowed } from './motion'

const IRIS = ['#5ECAD6', '#6B9FD4', '#D06AAE', '#E87BAD']

export function burst(e: MouseEvent, el: HTMLElement) {
  if (!isMotionAllowed()) return

  const count = isCoarsePointer() ? 6 : 10
  const rect = el.getBoundingClientRect()
  const x = e.clientX || rect.left + rect.width / 2
  const y = e.clientY || rect.top + rect.height / 2

  for (let k = 0; k < count; k++) {
    const angle = (k / count) * Math.PI * 2 + Math.random() * 0.4
    const distance = 14 + Math.random() * 12
    const pixel = document.createElement('i')
    pixel.className = 'burst'
    pixel.style.left = `${x - 2}px`
    pixel.style.top = `${y - 2}px`
    pixel.style.setProperty('--c', IRIS[k % 4])
    pixel.style.setProperty('--dx', `${Math.cos(angle) * distance}px`)
    pixel.style.setProperty('--dy', `${Math.sin(angle) * distance}px`)
    document.body.appendChild(pixel)
    setTimeout(() => pixel.remove(), 400)
  }
}
