import { useEffect, useRef } from 'react'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { ButtonLink } from '@/components/ui/button-link'
import { Section } from '@/components/layout/section'
import { useHologram } from '@/hooks/use-hologram'
import { decode } from '@/lib/effects/decode'
import { HERO } from '../content'

/** Перший екран: заголовок із розшифруванням, дві дії, підпис із курсором, голограма календаря, чотири факти. */
export function Hero() {
  const title = useRef<HTMLHeadingElement>(null)
  const hologram = useHologram('calendar')

  useEffect(() => {
    if (title.current) decode(title.current, HERO.title)
  }, [])

  return (
    <Section id="top" hero>
      <div className="grid grid-cols-12 items-center gap-x-5">
        <div className="col-span-full grid gap-[26px] min-[900px]:col-span-7">
          <span className="font-px text-px11 uppercase text-muted">{HERO.meta}</span>
          <h1
            ref={title}
            aria-label={HERO.title}
            className="font-display text-h48 leading-none text-balance font-semibold tracking-[-0.035em] max-md:text-h30 [&_.mk-g]:font-px [&_.mk-g]:font-normal [&_.mk-g]:tracking-normal [&_.mk-g]:text-muted"
          >
            {HERO.title}
          </h1>
          <p className="max-w-[44ch] text-t18 text-muted max-md:text-t16">{HERO.lead}</p>
          <div className="flex flex-wrap items-center gap-[10px]">
            <ButtonLink variant="primary" href={HERO.primaryCta.href}>
              {HERO.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={HERO.secondaryCta.href}>{HERO.secondaryCta.label}</ButtonLink>
            <small className="w-full text-t13 text-muted">{HERO.ctaNote}</small>
          </div>
          <span className="flex items-center gap-[10px] font-px text-px11 uppercase text-muted">
            {HERO.signature}
            <span
              aria-hidden="true"
              className="inline-block h-[1.05em] w-[0.55em] animate-[blink_1.06s_steps(1)_infinite] bg-fg align-[-0.15em]"
            />
          </span>
        </div>
        <DissolveReveal className="col-span-full mt-4 w-full max-w-[360px] justify-self-center min-[900px]:col-span-5 min-[900px]:mt-0 min-[900px]:max-w-none">
          <canvas ref={hologram} aria-label={HERO.hologramAlt} role="img" className="block aspect-square w-full" />
          <span className="absolute bottom-[6%] left-0 font-px text-px11 uppercase text-muted">
            {HERO.hologramLabel}
          </span>
        </DissolveReveal>
      </div>
      <div className="mt-[clamp(40px,6vw,72px)] grid grid-cols-2 border-t border-fg min-[900px]:grid-cols-4">
        {HERO.facts.map((fact, i) => (
          <div
            key={fact.value}
            className={
              'grid content-start gap-[6px] pt-5 pr-5 max-[899px]:pb-4 ' +
              (i > 0 ? 'border-l border-line pl-5 ' : '') +
              (i === 2 ? 'max-[899px]:border-l-0 max-[899px]:pl-0' : '')
            }
          >
            <b className="font-display text-h20 font-medium tracking-[-0.02em] leading-none md:text-h24">{fact.value}</b>
            <span className="text-t13 text-muted">{fact.label}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
