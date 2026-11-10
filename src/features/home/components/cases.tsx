import { useEffect, useRef, useState } from 'react'
import { Section, SectionHeader } from '@/components/layout/section'
import { CaseCard } from '@/components/ui/case-card'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelFrame } from '@/components/ui/pixel-frame'
import { PixelNavButton } from '@/components/ui/pixel-nav-button'
import { TextLink } from '@/components/ui/text-link'
import { dissolve } from '@/lib/effects/dissolve'
import { cn } from '@/lib/utils'
import { CASES_SECTION as C } from '../content'

const placeholder = <span className="font-px text-px11 uppercase text-spark">{C.placeholder}</span>
const LAST = C.items.length - 1
const SWAP_MS = 240

const pad = (n: number) => String(n).padStart(2, '0')

/** Чи секція кейсів у середній смузі вікна: тоді на телефоні замість панелі з якорями випливає панель перемикання кейсів. */
function useCasesActive() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const el = document.querySelector('#keisy')
    if (!el) return
    const io = new IntersectionObserver((e) => setActive(e[0].isIntersecting), { rootMargin: '-20% 0px -20% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return active
}

/** Секція «Кейси»: зліва слайдер кейсів, справа заклик у піксельній рамці й дві кнопки перемикання. Зміна кейса: розчинення 240 + 240 мс. */
export function Cases() {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const cover = useRef<HTMLCanvasElement>(null)
  const busy = useRef(false)

  const go = (to: number) => {
    const cv = cover.current
    if (!cv || busy.current || to < 0 || to > LAST || to === index) return
    busy.current = true
    setIndex(to)
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    dissolve(cv, {
      dir: -1,
      dur: SWAP_MS,
      color: bg,
      done: () => {
        setShown(to)
        requestAnimationFrame(() =>
          dissolve(cv, {
            dir: 1,
            dur: SWAP_MS,
            color: bg,
            done: () => {
              busy.current = false
            },
          }),
        )
      },
    })
  }

  const active = useCasesActive()
  const item = C.items[shown]

  return (
    <Section id="keisy">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <div className="grid grid-cols-[1.3fr_1fr] grid-rows-[auto_auto_1fr] items-start gap-3 [grid-template-areas:'card_cta''card_btns''card_.'] max-[860px]:grid-cols-1 max-[860px]:grid-rows-none max-[860px]:[grid-template-areas:'card''btns''cta']">
        <DissolveReveal className="[grid-area:card]">
          <div className="relative">
            <CaseCard
              url={item.url}
              placeholderLabel={item.placeholderLabel}
              title={item.title}
              tags={item.tags}
              metrics={item.metrics.map((label) => ({ value: placeholder, label }))}
            />
            <canvas
              ref={cover}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[5] size-full [image-rendering:pixelated]"
            />
          </div>
        </DissolveReveal>
        <DissolveReveal className="grid [grid-area:cta]">
          <div className="relative grid min-h-[140px] place-items-center p-7 text-center max-[860px]:min-h-[180px] max-[860px]:p-9">
            <PixelFrame />
            <TextLink href={C.cta.href} className="relative font-display text-h20 leading-[1.3] pointer-coarse:py-[10px] min-[600px]:text-t18 max-[860px]:min-[600px]:text-h24">
              {C.cta.label}
            </TextLink>
          </div>
        </DissolveReveal>
        <DissolveReveal className="[grid-area:btns] max-[860px]:hidden">
          <div role="group" aria-label={C.nav.label} className="flex items-center gap-3">
            <PixelNavButton direction="prev" aria-label={C.nav.prev} disabled={index === 0} onClick={() => go(index - 1)} />
            <PixelNavButton direction="next" aria-label={C.nav.next} disabled={index === LAST} onClick={() => go(index + 1)} />
            <span aria-hidden="true" className="ml-1 font-px text-px11 uppercase text-muted">
              {pad(index + 1)} / {pad(C.items.length)}
            </span>
          </div>
        </DissolveReveal>
      </div>
      <span aria-live="polite" className="sr-only">
        {C.nav.status(index + 1, C.items.length)}
      </span>
      {/* Телефон: панель перемикання замінює панель якорів, поки секція в екрані */}
      <div
        inert={!active}
        role="group"
        aria-label={C.nav.label}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[35] hidden translate-y-[110%] items-center gap-3 border-t border-line bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-[max(16px,env(safe-area-inset-left,0px))] pt-[10px] pb-[calc(10px+env(safe-area-inset-bottom,0px))] transition-transform duration-base ease-[steps(5,end)] max-[860px]:flex',
          active && 'translate-y-0',
        )}
      >
        <PixelNavButton direction="prev" aria-label={C.nav.prev} disabled={index === 0} onClick={() => go(index - 1)} className="size-auto h-12 flex-1" />
        <span aria-hidden="true" className="font-px text-px11 uppercase text-muted">
          {pad(index + 1)} / {pad(C.items.length)}
        </span>
        <PixelNavButton direction="next" aria-label={C.nav.next} disabled={index === LAST} onClick={() => go(index + 1)} className="size-auto h-12 flex-1" />
      </div>
    </Section>
  )
}
