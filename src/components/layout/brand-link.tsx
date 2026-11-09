import type { AnchorHTMLAttributes } from 'react'
import markSmall from '@/assets/logos/mikaido-mark-small.svg'
import markSmallSilver from '@/assets/logos/mikaido-mark-small-silver.svg'
import { cn } from '@/lib/utils'

/** Знак-посилання на початок: знак 38 px і назва MIKAIDO шрифтом Unbounded 600 з трекінгом 0,06 em.
    Знак для розмірів до 48 px: графіт у світлій темі (mikaido-mark-small.svg), срібло в темній (mikaido-mark-small-silver.svg). */
export function BrandLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      aria-label="Mikaido, на початок"
      className={cn('inline-flex items-center gap-[10px] text-fg no-underline pointer-coarse:py-[11px]', className)}
      {...props}
    >
      <img src={markSmall} alt="" width={38} height={22} className="h-auto w-[38px] dark:hidden" />
      <img src={markSmallSilver} alt="" width={38} height={22} className="hidden h-auto w-[38px] dark:block" />
      <span className="font-display text-t16 font-semibold uppercase leading-none tracking-[0.06em]">
        Mikaido
      </span>
    </a>
  )
}
