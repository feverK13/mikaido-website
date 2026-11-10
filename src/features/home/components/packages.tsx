import { useState } from 'react'
import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { TextLink } from '@/components/ui/text-link'
import { PK } from '@/content/packages'
import { PACKAGES_SECTION as C } from '../content'
import { PackageConsole } from './package-console'

type PackagesProps = { onDiscuss?: (id: string) => void }

/** Секція «Пакети»: меню-консоль із карткою пакета, список того, що є завжди, і посилання на повні умови з вибраним пакетом. */
export function Packages({ onDiscuss }: PackagesProps) {
  const [current, setCurrent] = useState(1)
  return (
    <Section id="pakety">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal>
        <PackageConsole current={current} onCurrentChange={setCurrent} onDiscuss={onDiscuss} />
      </DissolveReveal>
      <DissolveReveal>
        <ul className="mt-4 flex flex-wrap gap-x-[22px] gap-y-[10px] text-t14 text-muted">
          {C.always.map((item) => (
            <li key={item.text} className="inline-flex items-center gap-2">
              <PixelIcon name={item.icon} size={24} className="block text-fg" />
              {item.text}
            </li>
          ))}
        </ul>
      </DissolveReveal>
      <DissolveReveal>
        <TextLink href={`${C.fullHref}?pkg=${PK[current].id}#tablytsia`} className="justify-self-start">
          {C.fullLabel}
        </TextLink>
      </DissolveReveal>
    </Section>
  )
}
