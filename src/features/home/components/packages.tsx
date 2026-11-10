import { useEffect, useState } from 'react'
import { FULLSCREEN_MIN_HEIGHT, SNAP_ENABLED } from '@/config/package-selector'
import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { PACKAGES_SECTION as C } from '../content'
import { PackageSelector } from './package-selector'

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

  /* Прилипання до блоку: scroll-snap proximity на html, лише коли вікно не нижче 560 px. Вимикається прапорцем SNAP_ENABLED. */
  useEffect(() => {
    if (!SNAP_ENABLED) return
    const html = document.documentElement
    const query = matchMedia(`(min-height: ${FULLSCREEN_MIN_HEIGHT}px)`)
    const apply = () => {
      html.style.scrollSnapType = query.matches ? 'y proximity' : ''
    }
    apply()
    query.addEventListener('change', apply)
    return () => {
      query.removeEventListener('change', apply)
      html.style.scrollSnapType = ''
    }
  }, [])
  return (
    <Section id="pakety">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal>
        <PackageSelector current={current} onCurrentChange={setCurrent} chosen={chosen} onChoose={onChoose} />
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
    </Section>
  )
}
