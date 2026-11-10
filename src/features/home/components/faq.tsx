import { Section, SectionHeader } from '@/components/layout/section'
import { Accordion } from '@/components/ui/accordion'
import { TextLink } from '@/components/ui/text-link'
import { FAQ_SECTION as C } from '../content'

const items = C.items.map((item) => ({ id: `faq-${item.id}`, question: item.question, answer: item.answer }))

/** Секція «Часті питання»: три відповіді в акордеоні й посилання на всі. */
export function Faq() {
  return (
    <Section id="pytannya">
      <SectionHeader tab={C.tab} title={C.title} />
      <Accordion items={items} />
      <TextLink href={C.moreHref} className="justify-self-start">
        {C.moreLabel}
      </TextLink>
    </Section>
  )
}
