import { domAnimation, LazyMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
