import { domAnimation, LazyMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { CookieConsentProvider } from '@/features/cookies/cookie-consent-provider'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <CookieConsentProvider>{children}</CookieConsentProvider>
    </LazyMotion>
  )
}
