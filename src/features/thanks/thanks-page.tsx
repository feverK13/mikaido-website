import { useEffect, useRef, useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Section } from '@/components/layout/section'
import { ButtonLink } from '@/components/ui/button-link'
import { usePageMeta } from '@/hooks/use-page-meta'
import { isMotionAllowed } from '@/lib/effects/motion'
import { typeText } from '@/lib/effects/type-text'
import { THANKS as C } from './content'

type ThanksPageProps = { onOpenCookieSettings?: () => void }

/** «Дякуємо»: окрема адреса для аналітики. Рядки друкуються терміналом, поки є рух. */
export function ThanksPage({ onOpenCookieSettings }: ThanksPageProps) {
  usePageMeta({ title: `${C.title} | Mikaido`, noindex: true })
  const rows = useRef<(HTMLSpanElement | null)[]>([])
  const [cursor, setCursor] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      for (let i = 0; i < C.lines.length; i++) {
        const el = rows.current[i]
        if (!el || !alive) return
        if (isMotionAllowed()) {
          await typeText(el, C.lines[i].v, { speed: 24 })
          await new Promise((r) => setTimeout(r, 260))
        }
      }
      if (alive && isMotionAllowed()) setCursor(true)
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Header />
      <main id="main">
        <Section id="top" hero className="min-h-[60vh]">
          <span className="justify-self-start bg-fg py-[6px] pr-4 pl-[10px] font-px text-px11 uppercase text-bg [clip-path:polygon(0_0,calc(100%-10px)_0,100%_4px,100%_100%,0_100%)]">
            {C.tab}
          </span>
          <h1 className="font-display text-h30 font-semibold tracking-[-0.035em] min-[600px]:text-h48">{C.title}</h1>
          <div role="status" className="grid max-w-[68ch] gap-[10px] font-px text-px11 leading-[1.8] uppercase">
            {C.lines.map((line, i) => (
              <div key={line.k}>
                <span className="mr-[10px] text-accent">{line.k}</span>
                <span
                  ref={(el) => {
                    rows.current[i] = el
                  }}
                >
                  {line.v}
                </span>
              </div>
            ))}
            {cursor && (
              <span
                aria-hidden="true"
                className="inline-block h-[1.05em] w-[0.55em] animate-[blink_1.06s_steps(1)_infinite] bg-fg"
              />
            )}
          </div>
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
