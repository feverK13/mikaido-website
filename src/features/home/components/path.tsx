import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { cn } from '@/lib/utils'
import { PATH_SECTION as C } from '../content'

/* Межі комірок: 4 колонки від 900 px, 2 колонки до 899 px, 1 колонка до 520 px. */
const cellBorders = [
  '',
  'border-l max-[520px]:border-t max-[520px]:border-l-0',
  'border-l max-[899px]:border-t max-[899px]:border-l-0',
  'border-l max-[899px]:border-t max-[520px]:border-l-0',
]

/** Секція «Шлях клієнта»: чотири кроки від пошуку до повернення й межа з маркетингом. */
export function Path() {
  return (
    <Section id="shlyakh">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal>
        <div className="grid grid-cols-4 border border-line bg-surface max-[899px]:grid-cols-2 max-[520px]:grid-cols-1">
          {C.steps.map((step, i) => (
            <div
              key={step.title}
              className={cn(
                'relative grid content-start gap-3 border-line p-[22px] min-[900px]:not-last:after:absolute min-[900px]:not-last:after:top-[44px] min-[900px]:not-last:after:-right-[7px] min-[900px]:not-last:after:z-[1] min-[900px]:not-last:after:size-3 min-[900px]:not-last:after:rotate-45 min-[900px]:not-last:after:border-t min-[900px]:not-last:after:border-r min-[900px]:not-last:after:border-line min-[900px]:not-last:after:bg-surface min-[900px]:not-last:after:content-[\'\']',
                cellBorders[i],
              )}
            >
              <PixelIcon name={step.icon} size={48} active activeTone="accent" className="block text-fg" />
              <span className="font-px text-px11 uppercase text-muted">
                {C.stepLabel} 0{i + 1}
              </span>
              <h3 className="font-display text-t18 leading-[1.3] font-medium tracking-[-0.01em]">{step.title}</h3>
              <p className="text-t14 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </DissolveReveal>
      <DissolveReveal>
        <div className="mt-4 grid max-w-[760px] grid-cols-[24px_1fr] items-start gap-4 border border-l-[3px] border-line border-l-fg bg-surface px-[18px] py-4 text-t16">
          <PixelIcon name="info" size={24} className="block" />
          <div>
            {C.boundary.main} <span className="text-muted">{C.boundary.note}</span>
          </div>
        </div>
      </DissolveReveal>
    </Section>
  )
}
