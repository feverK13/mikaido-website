import { useRef, useState, type FormEvent } from 'react'
import { Section } from '@/components/layout/section'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, TextareaField } from '@/components/ui/field'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { TypedText } from '@/components/ui/typed-text'
import { RevealHeading } from '@/components/ui/reveal-heading'
import { Select, type SelectOption } from '@/components/ui/select'
import { PK } from '@/content/packages'
import { navigate } from '@/lib/router'
import { trackEvent } from '@/lib/analytics'
import { CONTACT_SECTION as C } from '../content'

export const UNKNOWN_PACKAGE = 'unknown'

const options: SelectOption[] = [
  { value: UNKNOWN_PACKAGE, label: C.form.packageUnknown },
  ...PK.map((p) => ({ value: p.id, label: p.name, hint: p.term })),
]

type ContactProps = {
  /** Пакет, обраний у блоці «Пакети» або тут. */
  packageValue: string
  onPackageChange: (value: string) => void
}

/** Секція «Розмова»: три кроки після заявки й форма з мінімумом полів. Заявка поки нікуди не надсилається. */
export function Contact({ packageValue, onPackageChange }: ContactProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [about, setAbout] = useState('')
  const [agree, setAgree] = useState(false)
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  const form = useRef<HTMLFormElement>(null)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const digits = phone.replace(/\D/g, '')
    const nameBad = !name.trim()
    const phoneBad = !(digits.length === 12 && digits.startsWith('380'))
    setNameError(nameBad ? C.form.name.error : '')
    setPhoneError(phoneBad ? (digits ? C.form.phone.errorFormat : C.form.phone.errorEmpty) : '')
    const agreeBad = !agree
    setAgreeError(agreeBad ? C.form.consentError : '')
    if (nameBad || phoneBad || agreeBad) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    // TODO(step 8): real submit
    trackEvent('generate_lead', { package: packageValue })
    navigate('/dyakuyemo')
  }

  return (
    <Section id="rozmova">
      <div className="grid items-start gap-[clamp(24px,4vw,64px)] min-[901px]:grid-cols-2">
        <div className="grid gap-5">
          <span className="justify-self-start bg-fg py-[6px] pr-4 pl-[10px] font-px text-px11 uppercase text-bg [clip-path:polygon(0_0,calc(100%-10px)_0,100%_4px,100%_100%,0_100%)]">
            <TypedText text={C.tab} />
          </span>
          <RevealHeading
            text={C.title}
            className="font-display text-h30 leading-[1.02] font-semibold tracking-[-0.035em] text-balance min-[600px]:text-h48 [&_.mk-g]:font-px [&_.mk-g]:font-normal [&_.mk-g]:tracking-normal [&_.mk-g]:text-muted"
          />
          <DissolveReveal>
            <p className="max-w-[40ch] text-t18 text-muted">{C.lead}</p>
          </DissolveReveal>
          <DissolveReveal>
            <ol className="grid gap-[10px] font-px text-px11 leading-[1.7] uppercase">
              {C.steps.map((step) => (
                <li key={step.n}>
                  <span className="mr-[10px] text-accent">{step.n}</span>
                  <TypedText text={step.text} />
                </li>
              ))}
            </ol>
          </DissolveReveal>
        </div>
        <DissolveReveal>
          <form
            ref={form}
            noValidate
            onSubmit={onSubmit}
            className="grid gap-4 border border-fg bg-surface p-[clamp(18px,3vw,28px)]"
          >
                <Field
                  label={C.form.name.label}
                  autoComplete="name"
                  placeholder={C.form.name.placeholder}
                  value={name}
                  error={nameError}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError('')
                  }}
                />
                <Field
                  label={C.form.phone.label}
                  prefix={C.form.phone.prefix}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={C.form.phone.placeholder}
                  value={phone}
                  error={phoneError}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError('')
                  }}
                />
                <Select label={C.form.packageLabel} options={options} value={packageValue} onChange={onPackageChange} />
                <TextareaField
                  label={C.form.about.label}
                  optional
                  placeholder={C.form.about.placeholder}
                  hint={C.form.about.hint}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
                <Checkbox
                  checked={agree}
                  error={agreeError}
                  onChange={(e) => {
                    setAgree(e.target.checked)
                    setAgreeError('')
                  }}
                >
                  <span className="grid">
                    {C.form.consent}
                    <small className="text-t13 text-muted">{C.form.consentNote}</small>
                  </span>
                </Checkbox>
                <Button variant="primary" size="lg" type="submit" className="justify-self-start">
                  {C.form.submit}
                </Button>
          </form>
        </DissolveReveal>
      </div>
    </Section>
  )
}
