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
import { SKIP_LINK } from './content'

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

type HomePageProps = {
  /** Відкриває вікно налаштувань cookies з підвалу. */
  onOpenCookieSettings?: () => void
}

/** Головна: шапка, секції за макетом docs/reference/mikaido-home.html, підвал. */
export function HomePage({ onOpenCookieSettings }: HomePageProps) {
  const [packageValue, setPackageValue] = useState(UNKNOWN_PACKAGE)
  const current = useCurrentSection()
  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-[60] -translate-y-[200%] bg-fg px-4 py-2 text-t14 font-semibold text-bg no-underline focus-visible:translate-y-0"
      >
        {SKIP_LINK}
      </a>
      <Header current={current} />
      <main id="main">
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
      <Footer onOpenCookieSettings={onOpenCookieSettings} />
      <MobileBar />
    </>
  )
}
