import { Section, SectionHeader } from '@/components/layout/section'
import { Accordion } from '@/components/ui/accordion'
import { FAQ_SECTION as C } from '../content'

const items = C.items.map((item, i) => ({ id: `faq-${i}`, question: item.question, answer: item.answer }))

/** Секція «Часті питання»: п'ять відповідей в акордеоні. */
export function Faq() {
  return (
    <Section id="pytannya">
      <SectionHeader tab={C.tab} title={C.title} />
      <Accordion items={items} />
    </Section>
  )
}
