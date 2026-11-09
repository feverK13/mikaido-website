import { Section, SectionHeader } from '@/components/layout/section'
import { CaseCard } from '@/components/ui/case-card'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { TextLink } from '@/components/ui/text-link'
import { CASES_SECTION as C } from '../content'

const placeholder = <span className="font-px text-px11 uppercase text-spark">{C.placeholder}</span>

/** Секція «Кейси»: один кейс із заглушками замірів і картка кейсу, що чекає на згоду. */
export function Cases() {
  return (
    <Section id="keisy">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <div className="grid grid-cols-[1.3fr_1fr] items-start gap-3 max-[860px]:grid-cols-1">
        <DissolveReveal>
          <CaseCard
            url={C.featured.url}
            placeholderLabel={C.featured.placeholderLabel}
            label={C.featured.label}
            title={C.featured.title}
            tags={C.featured.tags}
            metrics={C.featured.metrics.map((label) => ({ value: placeholder, label }))}
          />
        </DissolveReveal>
        <div className="grid content-start gap-[10px] border border-dashed border-line2 bg-surface p-[22px]">
          <span className="font-px text-px11 uppercase text-muted">{C.pending.label}</span>
          <b className="font-display font-medium">{C.pending.title}</b>
          <p className="text-t14 text-muted">{C.pending.text}</p>
          <TextLink href={C.pending.link.href} className="justify-self-start pointer-coarse:pt-[10px]">{C.pending.link.label}</TextLink>
        </div>
      </div>
    </Section>
  )
}
