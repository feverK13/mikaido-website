/* Вибір щодо cookies пам'ятаємо 12 місяців. До вибору вантажаться лише необхідні cookies. */

const KEY = 'mk_cookie_consent'
const TTL_MS = 365 * 24 * 60 * 60 * 1000

export type Consent = { analytics: boolean; savedAt: number }

/** Збережений вибір або null, якщо його немає чи він старший за 12 місяців. */
export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Consent
    if (typeof value.analytics !== 'boolean' || Date.now() - value.savedAt > TTL_MS) return null
    return value
  } catch {
    return null
  }
}

export function writeConsent(analytics: boolean): Consent {
  const consent: Consent = { analytics, savedAt: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(consent))
  } catch {
    /* сховище недоступне: вибір діє до перезавантаження */
  }
  return consent
}
