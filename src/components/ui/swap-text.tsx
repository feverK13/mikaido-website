import { useLayoutEffect, useRef } from 'react'
import { decode } from '@/lib/effects/decode'
import { typeText } from '@/lib/effects/type-text'

type SwapTextProps = {
  text: string
  /** decode: розшифрування (назва, ціна). type: друк (рядок «для кого»). */
  mode: 'decode' | 'type'
  className?: string
}

/** Текст, що змінюється ефектом. Кожна зміна пише в новий вузол, тому старий ефект не перебиває останній вибір. Для читачів екрана текст дає окремий рядок поруч. */
export function SwapText({ text, mode, className }: SwapTextProps) {
  const wrap = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const host = wrap.current
    if (!host) return
    const node = document.createElement('span')
    host.replaceChildren(node)
    if (first.current) {
      first.current = false
      node.textContent = text
    } else if (mode === 'decode') decode(node, text)
    else void typeText(node, text)
  }, [text, mode])

  return <span ref={wrap} aria-hidden="true" className={className} />
}
