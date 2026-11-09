import { useEffect, useRef } from 'react'
import { typeText } from '@/lib/effects/type-text'
import { cn } from '@/lib/utils'

export type StepItem = { title: string; description: string }

type StepsProps = {
  items: StepItem[]
  /** Індекс поточного етапу. Попередні готові, наступні попереду. Число більше за кількість етапів: усе готово. */
  current: number
  className?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

function Step({ item, index, state }: { item: StepItem; index: number; state: 'ok' | 'now' | 'next' }) {
  const description = useRef<HTMLParagraphElement>(null)

  /* Опис поточного етапу друкується терміналом. */
  useEffect(() => {
    const el = description.current
    if (!el) return
    if (state === 'now') void typeText(el, item.description)
    else el.textContent = item.description
  }, [state, item.description])

  return (
    <li
      aria-current={state === 'now' ? 'step' : undefined}
      className={cn(
        'relative grid content-start gap-2 border-l border-line p-[18px] first:border-l-0',
        'max-[860px]:border-t max-[860px]:border-l-0 max-[860px]:first:border-t-0',
        state === 'now' && 'bg-surface2',
      )}
    >
      <span
        className={cn(
          'font-px text-px11 uppercase text-muted',
          state === 'ok' && 'text-accent',
          state === 'now' && 'text-spark',
        )}
      >
        {pad(index + 1)}
        {state === 'ok' && ' / готово'}
        {state === 'now' && ' / зараз'}
      </span>
      <b className="font-display text-t16 font-medium">{item.title}</b>
      <p ref={description} className="min-h-[1.5em] text-t13 text-muted">
        {item.description}
      </p>
    </li>
  )
}

/** Етапи процесу: 5 у рядок, на телефоні стовпчиком. Стан: готово (accent), зараз (фон surface2, мітка spark), попереду. */
export function Steps({ items, current, className }: StepsProps) {
  return (
    <ol
      className={cn(
        'grid grid-cols-5 border border-line bg-surface max-[860px]:grid-cols-1',
        className,
      )}
    >
      {items.map((item, index) => (
        <Step
          key={item.title}
          item={item}
          index={index}
          state={index < current ? 'ok' : index === current ? 'now' : 'next'}
        />
      ))}
    </ol>
  )
}
