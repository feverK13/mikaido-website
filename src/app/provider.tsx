import { domAnimation, LazyMotion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { CookieConsentProvider } from '@/features/cookies/cookie-consent-provider'
import { initBurstAnywhere } from '@/lib/effects/burst-anywhere'

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => initBurstAnywhere(), [])

  return (
    <LazyMotion features={domAnimation} strict>
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </LazyMotion>
  )
}
