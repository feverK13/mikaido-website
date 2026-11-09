import { useEffect, useState } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { cn } from '@/lib/utils'
import { MOBILE_BAR } from '../content'

/** Нижня панель дій на телефоні: з'являється, коли кнопки першого екрана вийшли з вікна, і ховається біля форми. */
export function MobileBar() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const cta = document.querySelector('#top a[href="#rozmova"]')
    const form = document.querySelector('#rozmova')
    if (!cta || !form) return
    const first = new IntersectionObserver((e) => setOn(!e[0].isIntersecting))
    const last = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) setOn(false)
    })
    first.observe(cta)
    last.observe(form)
    return () => {
      first.disconnect()
      last.disconnect()
    }
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
      <ButtonLink variant="primary" href={MOBILE_BAR.primary.href} className="min-h-12 flex-1">
        {MOBILE_BAR.primary.label}
      </ButtonLink>
    </div>
  )
}
