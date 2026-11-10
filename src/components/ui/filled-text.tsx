import { Fragment, type ReactNode } from 'react'

/** Текст, у якому місця в квадратних дужках (`[заповнити]`, `[ПІБ]`) малюються кольором spark як незаповнені. */
export function FilledText({ children }: { children: string }): ReactNode {
  return children.split(/(\[[^\]]+\])/).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="font-px text-px11 uppercase text-spark">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
