import { useEffect, useRef } from 'react'
import { onReveal } from '@/lib/effects/reveal'
import { typeText } from '@/lib/effects/type-text'
import { cn } from '@/lib/utils'

type TypedTextProps = {
  text: string
  /** Курсор, що йде одразу за текстом на будь-якому рядку. */
  cursor?: boolean
  className?: string
}

/** Термінальний текст: друкується один раз, коли потрапляє у вікно (Mikaido.type). Невидимий повний текст тримає розмір, щоб друк не зсував сторінку. */
export function TypedText({ text, cursor = false, className }: TypedTextProps) {
  const root = useRef<HTMLSpanElement>(null)
  const typed = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = root.current
    const out = typed.current
    if (!el || !out) return
    return onReveal(el, () => void typeText(out, text))
  }, [text])

  const bar = 'ml-[10px] inline-block w-[0.55em]'
  return (
    <span ref={root} className={cn('inline-grid', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {text}
        {cursor && <span className={bar} />}
      </span>
      <span aria-hidden="true" className="[grid-area:1/1]">
        <span ref={typed} />
        {cursor && (
          <span className={cn(bar, 'h-[1.05em] animate-[blink_1.06s_steps(1)_infinite] bg-fg align-[-0.15em]')} />
        )}
      </span>
    </span>
  )
}
