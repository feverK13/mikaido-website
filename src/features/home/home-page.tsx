import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Cases } from './components/cases'
import { Hero } from './components/hero'
import { Packages } from './components/packages'
import { Path } from './components/path'
import { Process } from './components/process'
import { Support } from './components/support'
import { Terms } from './components/terms'

/** Головна: шапка, секції за макетом docs/reference/mikaido-home.html, підвал. */
export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Path />
        <Cases />
        <Packages />
        <Process />
        <Terms />
        <Support />
      </main>
      <Footer />
    </>
  )
}
