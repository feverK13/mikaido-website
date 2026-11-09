/* Колір ірису для канвасних ефектів (піксельний градієнт і голограма).
   Логіку перенесено з docs/design-system/components/bundle.js без змін. */
export type RGB = [number, number, number]

const IRIS_DARK = ['#5ECAD6', '#6B9FD4', '#D06AAE', '#E87BAD']
const IRIS_LIGHT = ['#1F95A5', '#2C63B0', '#A8407F', '#C8558E']

const hexToRgb = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]

export function iris(t: number, dark?: boolean): RGB {
  const palette = (dark ? IRIS_DARK : IRIS_LIGHT).map(hexToRgb)
  const scaled = Math.max(0, Math.min(0.999, t)) * 3
  const i = scaled | 0
  const f = scaled - i
  const a = palette[i]
  const b = palette[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}
