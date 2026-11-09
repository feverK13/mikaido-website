import { useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Cases } from './components/cases'
import { Contact, UNKNOWN_PACKAGE } from './components/contact'
import { Faq } from './components/faq'
import { Hero } from './components/hero'
import { Packages } from './components/packages'
import { Path } from './components/path'
import { Process } from './components/process'
import { Support } from './components/support'
import { Terms } from './components/terms'

/** Головна: шапка, секції за макетом docs/reference/mikaido-home.html, підвал. */
export function HomePage() {
  const [packageValue, setPackageValue] = useState(UNKNOWN_PACKAGE)
  return (
    <>
      <Header />
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
    </>
  )
}
