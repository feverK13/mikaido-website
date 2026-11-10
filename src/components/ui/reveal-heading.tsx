import { useEffect, useRef, type ElementType } from 'react'
import { decode } from '@/lib/effects/decode'
import { isMotionAllowed } from '@/lib/effects/motion'
import { onReveal } from '@/lib/effects/reveal'

type RevealHeadingProps = {
  text: string
  as?: ElementType
  className?: string
}

/** Заголовок, що розшифровується один раз, коли потрапляє у вікно (Mikaido.decode). До цього сховано, висота зарезервована. */
export function RevealHeading({ text, as: Tag = 'h2', className }: RevealHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const motion = isMotionAllowed()

  useEffect(() => {
    const el = ref.current
    if (!el || !isMotionAllowed()) return
    return onReveal(el, () => {
      el.style.minHeight = `${el.offsetHeight}px`
      el.style.visibility = ''
      decode(el, text)
      setTimeout(() => (el.style.minHeight = ''), 950)
    })
  }, [text])

  return (
    <Tag ref={ref} aria-label={text} style={motion ? { visibility: 'hidden' } : undefined} className={className}>
      {text}
    </Tag>
  )
}
