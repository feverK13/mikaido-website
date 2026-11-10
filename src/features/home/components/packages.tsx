import { useState } from 'react'
import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { TextLink } from '@/components/ui/text-link'
import { PK } from '@/content/packages'
import { PACKAGES_SECTION as C } from '../content'
import { PackageConsole } from './package-console'

type PackagesProps = {
  /** Обраний пакет (id) зі стану Головної; відсутній, якщо ще не обрано. */
  chosen?: string
  /** Робить пакет обраним: форма підставляє його. */
  onChoose?: (id: string) => void
}

/** Секція «Пакети»: меню-консоль (browsed локально, chosen зі стану Головної) із карткою пакета, список того, що є завжди, і посилання на повні умови з вибраним пакетом. */
export function Packages({ chosen, onChoose }: PackagesProps) {
  /* browsed: пакет, який показано зараз (початково Бізнес). chosen живе в стані Головної. */
  const [current, setCurrent] = useState(1)
  return (
    <Section id="pakety">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal>
        <PackageConsole current={current} onCurrentChange={setCurrent} chosen={chosen} onChoose={onChoose} />
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
