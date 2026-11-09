import { useEffect, useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { NAV_ITEMS } from '@/config/site'
import { Cases } from './components/cases'
import { Contact, UNKNOWN_PACKAGE } from './components/contact'
import { Faq } from './components/faq'
import { Hero } from './components/hero'
import { MobileBar } from './components/mobile-bar'
import { Packages } from './components/packages'
import { Path } from './components/path'
import { Process } from './components/process'
import { Support } from './components/support'
import { Terms } from './components/terms'

/** Активний пункт навігації: секція, що перетинає середину вікна. */
function useCurrentSection() {
  const [current, setCurrent] = useState<string>()
  useEffect(() => {
    const observers = NAV_ITEMS.map((item) => {
      const el = document.querySelector(item.href)
      if (!el) return undefined
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) setCurrent(item.href)
        },
        { rootMargin: '-45% 0px -50% 0px' },
      )
      observer.observe(el)
      return observer
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])
  return current
}

/** Головна: шапка, секції за макетом docs/reference/mikaido-home.html, підвал. */
export function HomePage() {
  const [packageValue, setPackageValue] = useState(UNKNOWN_PACKAGE)
  const current = useCurrentSection()
  return (
    <>
      <Header current={current} />
      <main>
        <Hero />
        <Path />
        <Cases />
        <Packages onDiscuss={setPackageValue} />
        <Process />
        <Terms />
        <Support />
        <Faq />
        <Contact packageValue={packageValue} onPackageChange={setPackageValue} />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}
