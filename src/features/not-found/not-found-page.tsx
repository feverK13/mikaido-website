import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Section } from '@/components/layout/section'
import { ButtonLink } from '@/components/ui/button-link'
import { FilledText } from '@/components/ui/filled-text'
import { usePageMeta } from '@/hooks/use-page-meta'
import { NOT_FOUND as C } from './content'

type NotFoundPageProps = { onOpenCookieSettings?: () => void }

/** Сторінка 404. ASCII-режим голограми є в описі дизайн-системи, але не в бандлі, тому поки лише код піксельним шрифтом. */
export function NotFoundPage({ onOpenCookieSettings }: NotFoundPageProps) {
  usePageMeta({ title: C.title, noindex: true })
  return (
    <>
      <Header />
      <main id="main">
        <Section id="top" hero className="min-h-[60vh]">
          <h1 className="font-px text-px44 leading-none uppercase">{C.code}</h1>
          <p className="max-w-[44ch] text-t18 text-muted">
            <FilledText>{C.message}</FilledText>
          </p>
          <div className="flex flex-wrap gap-[10px]">
            <ButtonLink variant="primary" href={C.home.href}>
              {C.home.label}
            </ButtonLink>
            <ButtonLink href={C.packages.href}>{C.packages.label}</ButtonLink>
          </div>
        </Section>
      </main>
      <Footer onOpenCookieSettings={onOpenCookieSettings} />
    </>
  )
}
