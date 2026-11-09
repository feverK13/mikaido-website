import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Hero } from './components/hero'

/** Головна: шапка, секції за макетом docs/reference/mikaido-home.html, підвал. */
export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </>
  )
}
