import { lazy, Suspense, useEffect } from 'react'
import { useCookieConsent } from '@/features/cookies/cookie-consent-context'
import { HomePage } from '@/features/home/home-page'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import { PackagesPage } from '@/features/packages/packages-page'
import { PrivacyPage } from '@/features/privacy/privacy-page'
import { ThanksPage } from '@/features/thanks/thanks-page'
import { trackPageView } from '@/lib/analytics'
import { useLocation, useRouterEffects } from '@/lib/router'
import { AppProvider } from './provider'

/* Сторінка перегляду компонентів: лише в dev, у production-збірку не потрапляє. */
const Preview = import.meta.env.DEV
  ? lazy(() => import('@/features/preview/preview').then((m) => ({ default: m.Preview })))
  : null

function Routes() {
  const { openSettings } = useCookieConsent()
  const { pathname } = useLocation()
  useRouterEffects()

  useEffect(() => {
    trackPageView(pathname, document.title)
  }, [pathname])

  const path = pathname.replace(/\/$/, '') || '/'
  if (import.meta.env.DEV && Preview && path === '/__preview') {
    return (
      <Suspense fallback={null}>
        <Preview />
      </Suspense>
    )
  }

  switch (path) {
    case '/':
      return <HomePage onOpenCookieSettings={openSettings} />
    case '/pakety-i-umovy':
      return <PackagesPage onOpenCookieSettings={openSettings} />
    case '/dyakuyemo':
      return <ThanksPage onOpenCookieSettings={openSettings} />
    case '/polityka-konfidentsiynosti':
      return <PrivacyPage onOpenCookieSettings={openSettings} />
    default:
      return <NotFoundPage onOpenCookieSettings={openSettings} />
  }
}

export function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  )
}
