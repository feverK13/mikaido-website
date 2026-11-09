import { createContext, useContext } from 'react'

export type CookieConsentValue = {
  /** Чи дозволена аналітика. Сторонні скрипти вантажити лише при true. */
  analytics: boolean
  /** Відкриває вікно налаштувань cookies (те саме, що в плашки). */
  openSettings: () => void
}

export const CookieConsentContext = createContext<CookieConsentValue | null>(null)

export function useCookieConsent() {
  const value = useContext(CookieConsentContext)
  if (!value) throw new Error('useCookieConsent потребує CookieConsentProvider')
  return value
}
