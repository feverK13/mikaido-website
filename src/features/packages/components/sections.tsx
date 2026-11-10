import { Section, SectionHeader } from '@/components/layout/section'
import { Accordion } from '@/components/ui/accordion'
import { ButtonLink } from '@/components/ui/button-link'
import { ConditionsTable } from '@/components/ui/conditions-table'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { FilledText } from '@/components/ui/filled-text'
import { PackageCard, PackageGrid } from '@/components/ui/package-card'
import { PixelGlow } from '@/components/ui/pixel-glow'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { Term } from '@/components/ui/term'
import {
  ADDONS,
  EXTRAS,
  FAQ,
  PAYMENT,
  PK,
  PRICE_NOTE,
  REVISIONS_SHORT,
  SUP,
  WARRANTY,
  packageRows,
} from '@/content/packages'
import { trackEvent } from '@/lib/analytics'
import {
  ADDONS_BLOCK,
  CTA_BLOCK,
  FAQ_BLOCK,
  INCLUDED_BLOCK,
  PACKAGES_BLOCK,
  PAYMENT_BLOCK,
  SUPPORT_BLOCK,
  TERMS_BLOCK,
  WARRANTY_BLOCK,
} from '../content'

const L = PACKAGES_BLOCK.labels

const box = 'grid content-start gap-3 border border-line bg-surface p-5'
const label = 'font-px text-px11 uppercase text-muted'

type PackagesBlockProps = { selectedId?: string }

/** /01: чотири картки з піксельними іконками й відкрита таблиця порівняння. Вибраний пакет підсвічено. */
export function PackagesBlock({ selectedId }: PackagesBlockProps) {
  const head = [<span key="c" className="sr-only">{PACKAGES_BLOCK.tableCorner}</span>, ...PK.map((p) => p.name)]
  const rows = [
    [L.price, ...PK.map((p) => p.price)],
    [L.audience, ...PK.map((p) => p.audience)],
    [L.scope, ...PK.map((p) => p.scope)],
    [L.key, ...PK.map((p) => p.key)],
    [L.term, ...PK.map((p) => p.term)],
    [L.revisions, ...PK.map((p) => p.revisions)],
    [L.pulse, ...PK.map((p) => p.pulse)],
    [L.payment, ...PK.map((p) => p.payment)],
  ]
  const highlight = PK.findIndex((p) => p.id === selectedId)
  return (
    <Section id="pakety">
      <SectionHeader tab={PACKAGES_BLOCK.tab} title={PACKAGES_BLOCK.title} />
      <PackageGrid>
        {PK.map((p) => (
          <PackageCard
            key={p.id}
            name={p.name}
            audience={p.audience}
            price={p.price}
            priceNote={p.priceFrom ? PRICE_NOTE : undefined}
            icon={p.icon}
            rows={packageRows(p)}
            selected={p.id === selectedId}
            action={
              <ButtonLink
                href={PACKAGES_BLOCK.chooseHref(p.id)}
                className="w-full"
                onClick={() => trackEvent('select_package', { package: p.id, location: 'packages_card' })}
              >
                {PACKAGES_BLOCK.choose} {p.name}
              </ButtonLink>
            }
          />
        ))}
      </PackageGrid>
      <div id="tablytsia" className="scroll-mt-[calc(var(--header-h,64px)+64px)]">
        <h3 className="mb-3 font-display text-t16 font-medium">{PACKAGES_BLOCK.tableTitle}</h3>
        <ConditionsTable
          head={head}
          rows={rows}
          numericColumns={[]}
          stickyFirstColumn
          label={PACKAGES_BLOCK.tableTitle}
          highlightColumn={highlight >= 0 ? highlight + 1 : undefined}
        />
        <p className="mt-3 text-t13 text-muted">{PRICE_NOTE}</p>
      </div>
    </Section>
  )
}

function List({ items, icon }: { items: string[]; icon: 'check' | 'plus' | 'close' }) {
  return (
    <ul className="grid gap-2 text-t14">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[16px_1fr] gap-[10px]">
          <PixelIcon name={icon} size={24} className="mt-[5px] size-3 text-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** /02: що входить у кожен пакет, що за доплату й чого не робимо. */
export function IncludedBlock() {
  return (
    <Section id="vkhodyt">
      <SectionHeader tab={INCLUDED_BLOCK.tab} title={INCLUDED_BLOCK.title} />
      <div className="grid grid-cols-3 gap-3 max-[860px]:grid-cols-1">
        <div className={box}>
          <span className={label}>{INCLUDED_BLOCK.included}</span>
          <List items={EXTRAS.included} icon="check" />
        </div>
        <div className={box}>
          <span className={label}>{INCLUDED_BLOCK.paid}</span>
          <List items={EXTRAS.paid} icon="plus" />
        </div>
        <div className={box}>
          <span className={label}>{INCLUDED_BLOCK.notDone}</span>
          <List items={EXTRAS.notDone} icon="close" />
        </div>
      </div>
    </Section>
  )
}

/** /03: п'ять доповнень однакової будови, без позначок «рекомендовано» і без наперед обраного. */
export function AddonsBlock() {
  return (
    <Section id="dopovnennia">
      <SectionHeader tab={ADDONS_BLOCK.tab} title={ADDONS_BLOCK.title} lead={ADDONS_BLOCK.note} />
      <ul className="grid grid-cols-3 gap-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
        {ADDONS.map((addon) => (
          <li key={addon.id} className={box}>
            <h3 className="font-display text-t16 font-medium">{addon.name}</h3>
            <p className="font-display text-h20 font-medium tracking-[-0.02em] whitespace-nowrap tabular-nums">{addon.price}</p>
            <p className="text-t14 text-muted">
              <FilledText>{addon.text}</FilledText>
            </p>
            <p className="text-t13 text-muted">{PRICE_NOTE}</p>
          </li>
        ))}
      </ul>
      <p className="text-t14 text-muted">
        {ADDONS_BLOCK.factorsLabel}: <FilledText>{ADDONS_BLOCK.factors}</FilledText>
      </p>
    </Section>
  )
}

/** /04: строки й правки кожного пакета, що означає «2 + 1». */
export function TermsBlock() {
  return (
    <Section id="stroky">
      <SectionHeader tab={TERMS_BLOCK.tab} title={TERMS_BLOCK.title} />
      <ul className="grid grid-cols-4 gap-3 max-[1060px]:grid-cols-2 max-[560px]:grid-cols-1">
        {PK.map((p) => (
          <li key={p.id} className={box}>
            <span className="font-px text-px22 uppercase">{p.name}</span>
            <div className="grid gap-1 text-t14">
              <span className="text-muted">{TERMS_BLOCK.termLabel}</span>
              <Term size="sm" className="justify-self-start">{p.term}</Term>
            </div>
            <div className="grid gap-1 text-t14">
              <span className="text-muted">{TERMS_BLOCK.revisionsLabel}</span>
              <span className="font-display text-h20 font-medium tabular-nums">{REVISIONS_SHORT[p.id]}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="max-w-[68ch] text-t16">
        <span className="font-display font-medium">{TERMS_BLOCK.revisionsFormat}</span> {TERMS_BLOCK.revisionsMeaning}
      </p>
      <ul className="grid max-w-[68ch] gap-2 text-t16 text-muted">
        {TERMS_BLOCK.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Section>
  )
}

/** /05: способи оплати. */
export function PaymentBlock() {
  return (
    <Section id="oplata">
      <SectionHeader tab={PAYMENT_BLOCK.tab} title={PAYMENT_BLOCK.title} />
      <ul className="grid grid-cols-3 gap-3 max-[860px]:grid-cols-1">
        {PAYMENT.options.map((option) => (
          <li key={option.title} className={box}>
            <span className="font-px text-px22 uppercase">{option.title}</span>
            <p className="text-t13 text-muted">
              {PAYMENT_BLOCK.forLabel}: {option.for}
            </p>
            <ul className="grid gap-2 text-t14">
              {option.stages.map((stage) => (
                <li key={stage}>
                  <FilledText>{stage}</FilledText>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <ul className="grid max-w-[68ch] gap-1 text-t16 text-muted">
        {PAYMENT.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Section>
  )
}

/** /06: велика цифра гарантії, «Покриває» і «Не покриває», права на сайт і домен. */
export function WarrantyBlock() {
  return (
    <Section id="harantiya">
      <SectionHeader tab={WARRANTY_BLOCK.tab} title={WARRANTY_BLOCK.title} />
      <div className="grid grid-cols-[1fr_2fr] gap-3 max-[900px]:grid-cols-1">
        <DissolveReveal className="grid min-h-[300px] place-items-center overflow-hidden border border-fg bg-bg">
          <PixelGlow />
          <div className="relative grid gap-2 bg-bg px-[18px] py-[14px] text-center">
            <b className="font-display text-h30 leading-none font-medium tracking-[-0.03em] min-[600px]:text-h48">
              {WARRANTY.value}
            </b>
            <span className="max-w-[28ch] text-t14 text-muted">{WARRANTY_BLOCK.glowText}</span>
          </div>
        </DissolveReveal>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
            <div className={box}>
              <span className={label}>{WARRANTY_BLOCK.covers}</span>
              <List items={WARRANTY.covers} icon="check" />
            </div>
            <div className={box}>
              <span className={label}>{WARRANTY_BLOCK.notCovers}</span>
              <List items={WARRANTY.notCovers} icon="close" />
            </div>
          </div>
          <div className={box}>
            <span className={label}>{WARRANTY_BLOCK.rightsLabel}</span>
            <p className="text-t14">{WARRANTY.rights}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/** /07: три рівні підтримки з однаковою будовою карток. */
export function SupportBlock() {
  return (
    <Section id="pidtrymka">
      <SectionHeader tab={SUPPORT_BLOCK.tab} title={SUPPORT_BLOCK.title} lead={SUPPORT_BLOCK.lead} />
      <ul className="grid grid-cols-3 gap-3 max-[860px]:grid-cols-1">
        {SUP.tiers.map((tier) => (
          <li key={tier.name} className={box}>
            <span className="font-px text-px22 uppercase">{tier.name}</span>
            <span className="font-display text-px22 font-medium tracking-[-0.02em]">
              {tier.price} <small className="font-body text-t13 font-normal tracking-normal text-muted">{SUP.perMonth}</small>
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
      <p className="text-t14 text-muted">{SUP.note}</p>
    </Section>
  )
}

const faqItems = FAQ.map((item) => ({ id: `faq-${item.id}`, question: item.question, answer: item.answer }))

/** /08: усі питання. */
export function FaqBlock() {
  return (
    <Section id="pytannya">
      <SectionHeader tab={FAQ_BLOCK.tab} title={FAQ_BLOCK.title} />
      <Accordion items={faqItems} />
    </Section>
  )
}

/** Заклик: єдина велика кнопка A на сторінці. */
export function CtaBlock() {
  return (
    <Section id="zapys">
      <div className="grid justify-items-start gap-5">
        <h2 className="font-display text-h30 leading-[1.04] font-semibold tracking-[-0.03em] text-balance max-md:text-h24">
          {CTA_BLOCK.title}
        </h2>
        <ButtonLink
          variant="primary"
          size="lg"
          href={CTA_BLOCK.href}
          onClick={() => trackEvent('cta_click', { location: 'packages_page' })}
        >
          {CTA_BLOCK.label}
        </ButtonLink>
      </div>
    </Section>
  )
}
