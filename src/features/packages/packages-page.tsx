import { useEffect, useMemo } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Section } from '@/components/layout/section'
import { JsonLd } from '@/components/ui/json-ld'
import { FAQ, PK } from '@/content/packages'
import { usePageMeta } from '@/hooks/use-page-meta'
import { useLocation } from '@/lib/router'
import { AnchorBar } from './components/anchor-bar'
import {
  AddonsBlock,
  CtaBlock,
  FaqBlock,
  IncludedBlock,
  PackagesBlock,
  PaymentBlock,
  SupportBlock,
  TermsBlock,
  WarrantyBlock,
} from './components/sections'
import { PAGE } from './content'

type PackagesPageProps = { onOpenCookieSettings?: () => void }

/** «Пакети й умови»: усі умови до підпису одним переліком. Розділи за порядком: пакети, що входить, доповнення, строки, оплата, гарантія, підтримка, питання. */
export function PackagesPage({ onOpenCookieSettings }: PackagesPageProps) {
  usePageMeta({ title: PAGE.metaTitle })
  const { search } = useLocation()
  const wanted = new URLSearchParams(search).get('pkg')
  const selectedId = PK.some((p) => p.id === wanted) ? (wanted ?? undefined) : undefined

  /* Висота шапки потрібна, щоб панель якорів прилипала під неї. */
  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return
    const set = () => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`)
    set()
    const observer = new ResizeObserver(set)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    }),
    [],
  )

  return (
    <>
      <Header current="/pakety-i-umovy" />
      <main id="main">
        <Section id="top" hero className="pb-[clamp(24px,3vw,40px)]">
          <h1 className="font-display text-h48 leading-none font-semibold tracking-[-0.035em] text-balance max-md:text-h30">
            {PAGE.title}
          </h1>
          <p className="max-w-[44ch] text-t18 text-muted max-md:text-t16">{PAGE.lead}</p>
        </Section>
        <AnchorBar />
        <PackagesBlock selectedId={selectedId} />
        <IncludedBlock />
        <AddonsBlock />
        <TermsBlock />
        <PaymentBlock />
        <WarrantyBlock />
        <SupportBlock />
        <FaqBlock />
        <CtaBlock />
      </main>
      <Footer onOpenCookieSettings={onOpenCookieSettings} />
      <JsonLd data={faqSchema} />
    </>
  )
}
