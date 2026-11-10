import { useEffect, useState } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { MOBILE_BAR } from '../content'

/** Нижня панель дій на телефоні: з'являється, коли перший екран повністю прокручено, і ховається біля форми, в секції кейсів і в блоці вибору пакета. */
export function MobileBar() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('#top')
    const cases = document.querySelector('#keisy')
    const selector = document.querySelector('#pakety-vybir')
    const form = document.querySelector('#rozmova')
    if (!hero || !form) return
    /* Панель потрібна, коли перший екран прокручено, і не потрібна біля форми та в кейсах (там своя панель). */
    const seen = { past: false, form: false, cases: false, selector: false }
    const update = () => setOn(seen.past && !seen.form && !seen.cases && !seen.selector)
    const watch = (el: Element, init: IntersectionObserverInit, set: (e: IntersectionObserverEntry) => void) => {
      const io = new IntersectionObserver((e) => {
        set(e[0])
        update()
      }, init)
      io.observe(el)
      return io
    }
    const list = [
      watch(hero, {}, (e) => (seen.past = !e.isIntersecting && e.boundingClientRect.bottom < 0)),
      watch(form, {}, (e) => (seen.form = e.isIntersecting)),
    ]
    if (cases) list.push(watch(cases, { rootMargin: '-20% 0px -20% 0px' }, (e) => (seen.cases = e.isIntersecting)))
    if (selector) list.push(watch(selector, {}, (e) => (seen.selector = e.isIntersecting)))
    return () => list.forEach((io) => io.disconnect())
  }, [])

  return (
    <div
      inert={!on}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[35] hidden translate-y-[110%] gap-2 border-t border-line bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-[max(16px,env(safe-area-inset-left,0px))] pt-[10px] pb-[calc(10px+env(safe-area-inset-bottom,0px))] transition-transform duration-base ease-[steps(5,end)] max-[860px]:flex',
        on && 'translate-y-0',
      )}
    >
      <ButtonLink href={MOBILE_BAR.secondary.href} className="min-h-12 flex-1">
        {MOBILE_BAR.secondary.label}
      </ButtonLink>
      <ButtonLink
        variant="primary"
        href={MOBILE_BAR.primary.href}
        className="min-h-12 flex-1"
        onClick={() => trackEvent('cta_click', { location: 'mobile_bar' })}
      >
        {MOBILE_BAR.primary.label}
      </ButtonLink>
    </div>
  )
}
