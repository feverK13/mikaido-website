/* Google Analytics 4. Скрипт Google вантажиться лише після згоди на cookies і лише якщо задано VITE_GA_MEASUREMENT_ID.
   Без ID чи без згоди жодна функція нічого не робить і не дає помилок. */

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ?? ''

let scriptRequested = false
let granted = false

/** Вмикає аналітику: ставить стан згоди granted і, якщо треба, підвантажує скрипт. */
export function enableAnalytics() {
  if (!MEASUREMENT_ID) return
  granted = true
  if (!scriptRequested) {
    scriptRequested = true
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      ;(window.dataLayer = window.dataLayer ?? []).push(arguments)
    }
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' })
    window.gtag('js', new Date())
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
    document.head.appendChild(script)
  }
  window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
}

function deleteGaCookies() {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))
  const host = location.hostname.split('.')
  const domains = ['', ...host.map((_, i) => '.' + host.slice(i).join('.'))]
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`
    }
  }
}

/** Вимикає аналітику: стан згоди denied і видалення cookies _ga та _ga_*. */
export function disableAnalytics() {
  granted = false
  if (!MEASUREMENT_ID || !scriptRequested) return
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  deleteGaCookies()
}

type EventParams = Record<string, string | number | boolean>

/** Єдина точка для подій. Без згоди й ID нічого не робить. У параметрах не має бути персональних даних (імені, пошти, телефону). */
export function trackEvent(name: string, params: EventParams = {}) {
  if (!MEASUREMENT_ID || !granted) return
  window.gtag?.('event', name, params)
}

/** Перегляд сторінки для SPA: викликати при зміні адреси. */
export function trackPageView(path: string, title: string) {
  trackEvent('page_view', { page_path: path, page_title: title })
}
