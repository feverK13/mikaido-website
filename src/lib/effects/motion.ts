/* Прапорці руху. Логіку перенесено з docs/design-system/components/bundle.js без змін. */

declare global {
  interface Window {
    /** true або false примусово вмикає чи вимикає рух, незалежно від системи. */
    MK_MOTION?: boolean
  }
}

export const isCoarsePointer = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/** Чи дозволено рух: window.MK_MOTION або системне «менше руху». */
export const isMotionAllowed = () =>
  window.MK_MOTION !== undefined
    ? window.MK_MOTION !== false
    : !matchMedia('(prefers-reduced-motion: reduce)').matches
