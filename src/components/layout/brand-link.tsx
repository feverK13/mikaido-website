import { useId, type AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/* Знак для розмірів до 48 px (шапка, підвал): ноги суцільні.
   Контури з docs/design-system/assets/Logos/mikaido-mark-small.svg. Ноги: графіт у світлій темі,
   срібло в темній (як markAt(38, {metal}) у макеті). Ірис лише в склі знака. */
function Mark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const legs = 'fill-[#26282E] dark:fill-[#C9CCD3]'

  return (
    <svg viewBox="0 0 240 140" role="img" aria-label="Знак Mikaido" className={className}>
      <defs>
        <clipPath id={`c-${id}`}>
          <polygon points="2,8 120,58 238,8 120,106" />
        </clipPath>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2=".35">
          <stop offset="0" stopColor="#5ECAD6" />
          <stop offset=".333" stopColor="#6B9FD4" />
          <stop offset=".667" stopColor="#D06AAE" />
          <stop offset="1" stopColor="#E87BAD" />
        </linearGradient>
      </defs>
      <path
        className={legs}
        fillRule="evenodd"
        d="M52 44h26a2 2 0 0 1 2 2v86a2 2 0 0 1-2 2h-26a2 2 0 0 1-2-2v-86a2 2 0 0 1 2-2z"
      />
      <path
        className={legs}
        fillRule="evenodd"
        d="M162 44h26a2 2 0 0 1 2 2v86a2 2 0 0 1-2 2h-26a2 2 0 0 1-2-2v-86a2 2 0 0 1 2-2z"
      />
      <polygon points="2,8 120,58 238,8 120,106" fill={`url(#g-${id})`} />
      <g clipPath={`url(#c-${id})`}>
        <polygon points="119,0 131,0 95,120 83,120" fill="#FFFFFF" opacity=".62" />
      </g>
    </svg>
  )
}

/** Знак-посилання на початок: знак 38 px і назва MIKAIDO шрифтом Unbounded 600 з трекінгом 0,06 em. */
export function BrandLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      aria-label="Mikaido, на початок"
      className={cn('inline-flex items-center gap-[10px] text-fg no-underline pointer-coarse:py-[11px]', className)}
      {...props}
    >
      <Mark className="h-auto w-[38px]" />
      <span className="font-display text-t16 font-semibold uppercase leading-none tracking-[0.06em]">
        Mikaido
      </span>
    </a>
  )
}
