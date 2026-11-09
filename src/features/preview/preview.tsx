/* Сторінка перегляду компонентів. Лише в dev (/__preview), noindex, у production не потрапляє. */
import { useEffect, useRef, useState } from 'react'
import { decode } from '@/lib/effects/decode'
import { dissolve } from '@/lib/effects/dissolve'
import { dither } from '@/lib/effects/dither'
import { HOLO, type HologramModel } from '@/lib/effects/hologram'
import { typeText } from '@/lib/effects/type-text'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox, Radio } from '@/components/ui/checkbox'
import { Field, TextareaField } from '@/components/ui/field'
import { IconButton } from '@/components/ui/icon-button'
import { ICONS, type IconName } from '@/components/ui/pixel-icon/icons'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { Stat, Term } from '@/components/ui/term'
import { TextLink } from '@/components/ui/text-link'
import { Toggle } from '@/components/ui/toggle'

const MODELS: HologramModel[] = ['page', 'calendar', 'nodes', 'box']

function Effects() {
  const decodeRef = useRef<HTMLHeadingElement>(null)
  const typeRef = useRef<HTMLParagraphElement>(null)
  const dissolveRef = useRef<HTMLCanvasElement>(null)
  const ditherRef = useRef<HTMLCanvasElement>(null)
  const holoRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<HologramModel>('page')

  const runDecode = () => decodeRef.current && decode(decodeRef.current, 'Зробимо майбутнє')
  const runType = () => typeRef.current && void typeText(typeRef.current, '03 / зараз: перевіряємо макет')
  const runDissolve = () => {
    const cv = dissolveRef.current
    if (cv) dissolve(cv, { color: getComputedStyle(document.documentElement).getPropertyValue('--fg') })
  }

  useEffect(() => {
    const dark = () => document.documentElement.dataset.theme === 'dark'
    const paintDither = () => ditherRef.current && dither(ditherRef.current, { dark: dark() })
    paintDither()
    const observer = new MutationObserver(paintDither)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cv = holoRef.current
    if (!cv) return
    HOLO.mount(cv, model, 'vox', { base: 'grid', scan: true, noGlitch: true })
    HOLO.start()
  }, [model])

  return (
    <>
      <Block title="decode">
        <h3 ref={decodeRef} className="font-display text-h30">Зробимо майбутнє</h3>
        <div className={row}><Button onClick={runDecode}>Повторити</Button></div>
      </Block>
      <Block title="typeText">
        <p ref={typeRef} className="min-h-6 font-px text-px11 uppercase">03 / зараз: перевіряємо макет</p>
        <div className={row}><Button onClick={runType}>Повторити</Button></div>
      </Block>
      <Block title="dissolve">
        <div className="relative h-24 border border-line bg-surface p-space-4">
          Блок під розчиненням
          <canvas ref={dissolveRef} className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]" />
        </div>
        <div className={row}><Button onClick={runDissolve}>Розчинити</Button></div>
      </Block>
      <Block title="dither">
        <canvas ref={ditherRef} className="block h-[6px] w-full [image-rendering:pixelated]" />
      </Block>
      <Block title="hologram (одна на екран)">
        <canvas ref={holoRef} key={model} className="h-[280px] w-full max-w-[360px] border border-line" />
        <div className={row}>
          {MODELS.map((m) => (
            <Button key={m} size="sm" variant={m === model ? 'primary' : 'secondary'} onClick={() => setModel(m)}>
              {m}
            </Button>
          ))}
        </div>
      </Block>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-space-4 border-t border-fg pt-space-4">
      <h2 className="font-display text-h24">{title}</h2>
      <div className="grid min-w-0 gap-space-4">{children}</div>
    </section>
  )
}

const row = 'flex flex-wrap items-center gap-space-3'

export function Preview() {
  const [dark, setDark] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
  }

  return (
    <main className="mx-auto grid max-w-[1200px] gap-space-6 px-space-4 py-space-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-h30">Компоненти</h1>
        <IconButton icon="theme" aria-label="Змінити тему" onClick={toggleTheme} />
      </header>

      <Block title="Button">
        <div className={row}>
          <Button variant="primary" size="sm">Обрати</Button>
          <Button variant="primary">Записатися на розмову</Button>
          <Button variant="primary" size="lg">Зберегти</Button>
          <Button variant="primary" disabled>Вимкнено</Button>
        </div>
        <div className={row}>
          <Button size="sm">Дрібна</Button>
          <Button>Звичайна</Button>
          <Button size="lg">Велика</Button>
          <Button variant="ghost">Третьорядна</Button>
          <Button disabled>Вимкнено</Button>
        </div>
      </Block>

      <Block title="IconButton">
        <div className={row}>
          <IconButton icon="menu" aria-label="Меню" />
          <IconButton icon="theme" aria-label="Змінити тему" />
          <IconButton icon="close" aria-label="Закрити" />
        </div>
      </Block>

      <Block title="TextLink">
        <p>
          Читайте <TextLink href="#preview">політику конфіденційності</TextLink> перед відправкою.
        </p>
      </Block>

      <Block title="Term і Stat">
        <div className={row}>
          <Term>до 3 тижнів</Term>
          <Term size="sm">4-7 тижнів</Term>
          <Stat>01 / готово</Stat>
          <Stat now>03 / зараз</Stat>
        </div>
      </Block>

      <Block title="Field">
        <div className="grid gap-space-4 md:grid-cols-2">
          <Field label="Імʼя" placeholder="[заповнити]" />
          <Field label="Телефон" optional hint="Формат +380" inputMode="tel" />
          <Field label="Пошта" defaultValue="не пошта" error="Додайте @ і домен, наприклад name@mail.com" />
          <TextareaField label="Повідомлення" value={text} onChange={(e) => setText(e.target.value)} hint="До 240 знаків" />
        </div>
      </Block>

      <Block title="Checkbox і Radio">
        <div className="grid gap-space-3">
          <Checkbox>Погоджуюсь на обробку даних</Checkbox>
          <Checkbox defaultChecked>Вибрано</Checkbox>
          <Checkbox error="Потрібна згода на обробку даних">Згода з помилкою</Checkbox>
          <Radio name="r" defaultChecked>Старт</Radio>
          <Radio name="r">Бізнес</Radio>
        </div>
      </Block>

      <Block title="Toggle">
        <div className="grid gap-space-3">
          <label className={row}><Toggle aria-label="Аналітика" /> Аналітика</label>
          <label className={row}><Toggle defaultChecked aria-label="Увімкнено" /> Увімкнено</label>
          <label className={row}><Toggle defaultChecked disabled aria-label="Необхідні" /> Необхідні, завжди увімкнені</label>
          <label className={row}><Toggle error aria-label="Помилка" /> З помилкою</label>
        </div>
      </Block>

      <Block title="Alert">
        <Alert tone="info" title="Дані збережено">Зміни видно одразу.</Alert>
        <Alert tone="success" title="Заявку надіслано" onClose={() => {}}>Ми відповімо протягом робочого дня.</Alert>
        <Alert tone="error" title="Не вдалося надіслати">Номер має 12 цифр, перевірте код +380.</Alert>
      </Block>

      <Block title="Крайні випадки">
        <div className="grid gap-space-4 md:grid-cols-2">
          <Field
            label="Дуже довгий підпис поля, який не вміщається в один рядок на вузькому екрані телефону"
            optional
            defaultValue="averyveryverylongemailaddresswithoutanybreakpointsatall1234567890@example-domain-name.com.ua"
          />
          <Field label="Порожнє поле з помилкою" error="Заповніть поле: без нього ми не зможемо Вам відповісти" />
          <Checkbox>
            Дуже довгий текст згоди на обробку даних, який переноситься на кілька рядків, а прапорець лишається
            вирівняним по верхньому краю першого рядка
          </Checkbox>
          <Alert tone="error" title="Дуже довгий заголовок повідомлення про помилку, який переноситься" onClose={() => {}}>
            Довге пояснення без пробілів: ААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААААА
          </Alert>
        </div>
      </Block>

      <Effects />

      <Block title="PixelIcon (23)">
        <div className="flex flex-wrap gap-space-4">
          {(Object.keys(ICONS) as IconName[]).map((name) => (
            <figure key={name} className="grid justify-items-center gap-space-1">
              <PixelIcon name={name} size={24} active />
              <figcaption className="font-px text-px11 uppercase text-muted">{name}</figcaption>
            </figure>
          ))}
          <PixelIcon name="box" size={48} />
        </div>
      </Block>
    </main>
  )
}
