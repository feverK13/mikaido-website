import { Section, SectionHeader } from '@/components/layout/section'
import { Accordion } from '@/components/ui/accordion'
import { ConditionsTable } from '@/components/ui/conditions-table'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { PACKAGES } from '@/config/packages'
import { PACKAGES_SECTION as C } from '../content'
import { PackageConsole } from './package-console'

const L = C.compare.labels
const head = [
  <span key="corner" className="sr-only">
    {C.compare.cornerLabel}
  </span>,
  ...PACKAGES.map((p) => p.name),
]
const rows = [
  [L.price, ...PACKAGES.map((p) => p.price)],
  [L.audience, ...C.compare.audience],
  [L.scope, ...C.compare.scope],
  [L.term, ...PACKAGES.map((p) => p.term)],
  [L.revisions, ...C.compare.revisions],
  [L.pulse, ...PACKAGES.map((p) => p.pulse)],
]

type PackagesProps = { onDiscuss?: (name: string) => void }

/** Секція «Пакети»: меню-консоль із карткою пакета, список того, що є завжди, і порівняльна таблиця в акордеоні. */
export function Packages({ onDiscuss }: PackagesProps) {
  return (
    <Section id="pakety">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal>
        <PackageConsole onDiscuss={onDiscuss} />
      </DissolveReveal>
      <ul className="mt-4 flex flex-wrap gap-x-[22px] gap-y-[10px] text-t14 text-muted">
        {C.always.map((item) => (
          <li key={item.text} className="inline-flex items-center gap-2">
            <PixelIcon name={item.icon} size={24} className="block text-fg" />
            {item.text}
          </li>
        ))}
      </ul>
      <Accordion
        className="mt-4 border-t-0 [&_button]:border-b-0"
        items={[
          {
            id: 'compare',
            question: C.compare.title,
            answer: <ConditionsTable head={head} rows={rows} numericColumns={[1, 2, 3, 4]} />,
          },
        ]}
      />
    </Section>
  )
}
