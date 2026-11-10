import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelGlow } from '@/components/ui/pixel-glow'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { TextLink } from '@/components/ui/text-link'
import { TERMS_SECTION as C } from '../content'

/** Секція «Умови»: велика цифра гарантії з піксельним сяйвом і шість відмінностей. */
export function Terms() {
  return (
    <Section id="umovy">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <div className="grid grid-cols-[1fr_2fr] gap-3 max-[900px]:grid-cols-1">
        <DissolveReveal className="grid min-h-[300px] place-items-center overflow-hidden border border-fg bg-bg">
          <PixelGlow />
          <div className="relative grid gap-2 bg-bg px-[18px] py-[14px] text-center">
            <b className="font-display text-h30 leading-none font-medium tracking-[-0.03em] min-[600px]:text-h48">
              {C.guarantee.value}
            </b>
            <span className="max-w-[28ch] text-t14 text-muted">{C.guarantee.text}</span>
          </div>
        </DissolveReveal>
        <ul className="grid grid-cols-1 content-start border border-line bg-surface">
          {C.differences.map((item) => (
            <li
              key={item.title}
              className="grid grid-cols-[24px_1fr] content-start gap-[14px] border-b border-line p-5 last:border-b-0"
            >
              <PixelIcon name={item.icon} size={24} className="block" />
              <div>
                <b className="mb-1 block font-display text-t16 font-medium">{item.title}</b>
                <p className="text-t14 text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <TextLink href={C.moreHref} className="justify-self-start">
        {C.moreLabel}
      </TextLink>
    </Section>
  )
}
