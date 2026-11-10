import { useEffect, useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ConditionsTable } from '@/components/ui/conditions-table'
import { FilledText } from '@/components/ui/filled-text'
import { Term } from '@/components/ui/term'
import { usePageMeta } from '@/hooks/use-page-meta'
import { cn } from '@/lib/utils'
import { PRIVACY as C, type PrivacyBlock } from './content'

type PrivacyPageProps = { onOpenCookieSettings?: () => void }

function Block({ block, onOpenCookieSettings }: { block: PrivacyBlock; onOpenCookieSettings?: () => void }) {
  if (block.type === 'p') {
    return (
      <p className="text-t16 leading-[1.7]">
        <FilledText>{block.text}</FilledText>
      </p>
    )
  }
  if (block.type === 'ul') {
    return (
      <ul className="grid list-disc gap-1 pl-5">
        {block.items.map((item) => (
          <li key={item} className="text-t16 leading-[1.7]">
            <FilledText>{item}</FilledText>
          </li>
        ))}
      </ul>
    )
  }
  const table = (
    <ConditionsTable
      head={block.head}
      rows={block.rows.map((row) => row.map((cell) => <FilledText key={cell}>{cell}</FilledText>))}
      className="mt-1"
    />
  )
  if (block.type === 'table') return table
  return (
    <>
      <p className="text-t16 leading-[1.7]">
        {block.before}
        <button
          type="button"
          onClick={onOpenCookieSettings}
          className="cursor-pointer border-0 bg-transparent p-0 font-medium text-fg underline underline-offset-2 active:text-accent pointer-coarse:min-h-tap"
        >
          {block.link}
        </button>
        {block.after}
      </p>
      {table}
    </>
  )
}

/** Юридична сторінка: без ефектів, зміст збоку (на телефоні зверху), підсумок на початку, ширина рядка до 68 знаків. */
export function PrivacyPage({ onOpenCookieSettings }: PrivacyPageProps) {
  usePageMeta({ title: C.metaTitle })
  const [current, setCurrent] = useState(C.sections[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setCurrent(hit.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    C.sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header />
      <main id="main" className="mx-auto w-full max-w-[calc(1200px+128px)] px-[max(16px,env(safe-area-inset-left,0px))] py-[clamp(32px,6vw,72px)] min-[768px]:px-8 min-[1200px]:px-16">
        <div className="grid grid-cols-[240px_1fr] gap-[clamp(24px,4vw,56px)] border border-fg bg-bg p-[clamp(20px,4vw,48px)] [grid-template-areas:'nav_head''nav_art'] max-[860px]:grid-cols-1 max-[860px]:[grid-template-areas:'head''nav''art']">
          <nav
            aria-label={C.tocLabel}
            className="grid content-start gap-[2px] self-start border-l border-line [grid-area:nav] min-[861px]:sticky min-[861px]:top-[88px] max-[860px]:static max-[860px]:border-t max-[860px]:border-l-0 max-[860px]:pt-2"
          >
            {C.sections.map((section, i) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current === section.id ? 'true' : undefined}
                className={cn(
                  '-ml-px grid grid-cols-[30px_1fr] border-l-2 border-transparent py-[7px] pl-[14px] text-t14 text-muted no-underline transition-colors duration-fast ease-out-mk hover:text-fg pointer-coarse:py-3 aria-[current=true]:border-fg aria-[current=true]:text-fg',
                  'max-[860px]:border-l-0 max-[860px]:pl-0',
                )}
              >
                <span className="pt-1 font-px text-px11 uppercase">/0{i + 1}</span>
                {section.title}
              </a>
            ))}
          </nav>
          <header className="grid max-w-[68ch] content-start gap-3 [grid-area:head]">
            <span className="justify-self-start bg-fg py-[6px] pr-4 pl-[10px] font-px text-px11 uppercase text-bg [clip-path:polygon(0_0,calc(100%-10px)_0,100%_4px,100%_100%,0_100%)]">
              {C.tab}
            </span>
            <h1 className="font-display text-h30 font-semibold tracking-[-0.025em] min-[600px]:text-h48">{C.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Term size="sm">
                {C.updatedLabel}&nbsp;
                <FilledText>{C.updated}</FilledText>
              </Term>
              <span className="text-t13 text-muted">
                {C.domainLabel} <FilledText>{C.domain}</FilledText>
              </span>
            </div>
          </header>
          <article className="grid max-w-[68ch] gap-7 [grid-area:art]">
            <div className="grid gap-2 border border-l-[3px] border-line border-l-accent bg-surface px-[18px] py-4">
              <span className="font-px text-px11 uppercase text-accent">{C.summaryLabel}</span>
              <ul className="grid list-disc gap-1 pl-[18px] text-t16">
                {C.summary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            {C.sections.map((section, i) => (
              <section key={section.id} id={section.id} className="grid scroll-mt-[88px] gap-[10px]">
                <h2 className="flex items-baseline gap-3 font-display text-h20 font-medium">
                  <span className="font-px text-px11 uppercase text-muted">/0{i + 1}</span>
                  {section.title}
                </h2>
                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} onOpenCookieSettings={onOpenCookieSettings} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer onOpenCookieSettings={onOpenCookieSettings} />
    </>
  )
}
