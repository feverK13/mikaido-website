import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isMotionAllowed } from '@/lib/effects/motion'
import { CookieBanner } from './cookie-banner'
import { CookieConsentContext } from './cookie-consent-context'
import { CookieSettings } from './cookie-settings'
import { readConsent, writeConsent, type Consent } from './consent'

/** Плашка з'являється через 1 с після першого візиту. Вибір пам'ятаємо 12 місяців. Прокрутка не вважається згодою. */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(readConsent)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (consent) return
    const timer = setTimeout(() => setBannerOpen(true), isMotionAllowed() ? 1000 : 0)
    return () => clearTimeout(timer)
  }, [consent])

  const choose = useCallback((analytics: boolean) => {
    setConsent(writeConsent(analytics))
    setBannerOpen(false)
    setSettingsOpen(false)
  }, [])

  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const value = useMemo(
    () => ({ analytics: consent?.analytics ?? false, openSettings }),
    [consent, openSettings],
  )

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieBanner
        open={bannerOpen}
        onAcceptAll={() => choose(true)}
        onNecessaryOnly={() => choose(false)}
        onOpenSettings={openSettings}
      />
      <CookieSettings
        open={settingsOpen}
        analytics={value.analytics}
        onClose={closeSettings}
        onSave={choose}
        onAcceptAll={() => choose(true)}
      />
    </CookieConsentContext.Provider>
  )
}
