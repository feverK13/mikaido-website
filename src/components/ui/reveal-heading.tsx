import { useRef, type ElementType } from 'react'
import { useBeat } from '@/hooks/use-beat'
import { decode } from '@/lib/effects/decode'
import { cn } from '@/lib/utils'

/** Скільки триває розшифрування (decode.ts); поки воно йде, нове не запускаємо. */
const DECODE_MS = 900

/** Повторна поява заголовка: розчинення 240 мс (токен) без розшифрування. */
const REPEAT_MS = 240
const busyUntil = new WeakMap<HTMLElement, number>()

/** Запускає розшифрування, якщо попереднє вже закінчилось, і резервує висоту заголовка на його час. */
function startDecode(el: HTMLElement | null, out: HTMLElement | null, text: string) {
  if (!el || !out) return
  const now = performance.now()
  if (now < (busyUntil.get(el) ?? 0)) return
  busyUntil.set(el, now + DECODE_MS)
  el.style.minHeight = `${el.offsetHeight}px`
  decode(out, text)
  setTimeout(() => (el.style.minHeight = ''), DECODE_MS + 50)
}

type RevealHeadingProps = {
  text: string
  as?: ElementType
  className?: string
}

/** Заголовок: при першому вході розшифровується під розчиненням полотна, при повторних лише розчиняється за 240 мс, на виході накривається ним назад (Mikaido.decode + dissolve).
    Висота на час розшифрування резервується. Текст лишається в дереві доступності. */
export function RevealHeading({ text, as: Tag = 'h2', className }: RevealHeadingProps) {
  const label = useRef<HTMLSpanElement>(null)
  const { host, canvas } = useBeat<HTMLHeadingElement>({
    onEnterStart: (first) => first && startDecode(host.current, label.current, text),
    repeatEnterMs: REPEAT_MS,
  })

  return (
    <Tag ref={host} aria-label={text} className={cn('relative', className)}>
      <span ref={label}>{text}</span>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-[6] h-[calc(100%+2px)] w-[calc(100%+2px)] [image-rendering:pixelated]"
      />
    </Tag>
  )
}
