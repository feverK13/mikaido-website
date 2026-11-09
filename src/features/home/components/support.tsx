import { Section, SectionHeader } from '@/components/layout/section'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { SUPPORT_SECTION as C } from '../content'

/** Секція «Підтримка»: три рівні з однаковою будовою карток. Без позначки «популярний». */
export function Support() {
  return (
    <Section id="pidtrymka">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <ul className="grid grid-cols-3 gap-3 max-[860px]:grid-cols-1">
        {C.tiers.map((tier) => (
          <li key={tier.name} className="grid content-start gap-3 border border-line bg-surface p-5">
            <span className="font-px text-px22 uppercase">{tier.name}</span>
            <span className="font-display text-px22 font-medium tracking-[-0.02em]">
              {tier.price} <small className="font-body text-t13 font-normal tracking-normal text-muted">{C.perMonth}</small>
            </span>
            <ul className="grid gap-2 text-t14">
              {tier.items.map((item) => (
                <li key={item} className="grid grid-cols-[16px_1fr] gap-[10px]">
                  <PixelIcon name="check" size={24} className="mt-[5px] size-3 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-[14px] text-t14 text-muted">{C.note}</p>
    </Section>
  )
}
