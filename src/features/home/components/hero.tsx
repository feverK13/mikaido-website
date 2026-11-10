import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { ButtonLink } from '@/components/ui/button-link'
import { RevealHeading } from '@/components/ui/reveal-heading'
import { TypedText } from '@/components/ui/typed-text'
import { Section } from '@/components/layout/section'
import { useHologram } from '@/hooks/use-hologram'
import { trackEvent } from '@/lib/analytics'
import { HERO } from '../content'

/** Перший екран: заголовок із розшифруванням, дві дії, підпис із курсором, голограма календаря, чотири факти. */
export function Hero() {
  const hologram = useHologram('calendar')

  return (
    <Section id="top" hero>
      <div className="grid grid-cols-12 items-center gap-x-5 max-[899px]:flex max-[899px]:flex-col max-[899px]:items-stretch max-[899px]:gap-[26px]">
        <div className="col-span-full grid gap-[26px] max-[899px]:contents min-[900px]:col-span-7">
          <TypedText text={HERO.meta} className="grid font-px text-px11 uppercase text-muted max-[899px]:order-1" />
          <RevealHeading
            as="h1"
            text={HERO.title}
            className="font-display text-h48 leading-none max-[899px]:order-3 text-balance font-semibold tracking-[-0.035em] max-md:text-h30 [&_.mk-g]:font-px [&_.mk-g]:font-normal [&_.mk-g]:tracking-normal [&_.mk-g]:text-muted"
          />
          <DissolveReveal className="grid gap-[26px] max-[899px]:order-3">
            <p className="max-w-[44ch] text-t18 text-muted max-md:text-t16">{HERO.lead}</p>
            <div className="flex flex-wrap items-center gap-[10px]">
              <ButtonLink
                variant="primary"
                href={HERO.primaryCta.href}
                onClick={() => trackEvent('cta_click', { location: 'hero' })}
              >
                {HERO.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={HERO.secondaryCta.href}>{HERO.secondaryCta.label}</ButtonLink>
              <small className="w-full text-t13 text-muted">{HERO.ctaNote}</small>
            </div>
          </DissolveReveal>
          <TypedText
            text={HERO.signature}
            cursor
            className="grid font-px text-px11 uppercase text-muted max-[899px]:order-3"
          />
        </div>
        <DissolveReveal className="col-span-full w-full max-w-[360px] justify-self-center max-[899px]:order-2 max-[899px]:self-center min-[900px]:col-span-5 min-[900px]:mt-0 min-[900px]:max-w-none">
          <canvas ref={hologram} aria-label={HERO.hologramAlt} role="img" className="block aspect-square w-full" />
          <span className="absolute bottom-[6%] left-0 font-px text-px11 uppercase text-muted">
            {HERO.hologramLabel}
          </span>
        </DissolveReveal>
      </div>
      <DissolveReveal className="mt-[clamp(40px,6vw,72px)] grid grid-cols-2 border-t border-fg min-[900px]:grid-cols-4">
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
      </DissolveReveal>
    </Section>
  )
}
