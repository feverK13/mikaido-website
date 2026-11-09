import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const termVariants = cva(
  'inline-flex items-center bg-tag font-px uppercase leading-none whitespace-nowrap [clip-path:polygon(0_0,calc(100%-10px)_0,100%_4px,100%_100%,0_100%)]',
  {
    variants: {
      size: {
        md: 'py-[7px] pr-[14px] pl-[9px] text-px22',
        sm: 'py-[5px] pr-3 pl-[7px] text-px11',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

type TermProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof termVariants>

/** Піксельна мітка-термін: строки, дати, ключові терміни. */
export function Term({ size, className, ...props }: TermProps) {
  return <span className={cn(termVariants({ size }), className)} {...props} />
}

type StatProps = HTMLAttributes<HTMLSpanElement> & {
  /** Поточний етап: квадрат spark, що блимає кроком steps(1). */
  now?: boolean
}

/** Стан етапу з квадратною точкою 6 px. */
export function Stat({ now = false, className, children, ...props }: StatProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-line2 px-[10px] py-[6px] font-px text-px11 uppercase leading-none',
        className,
      )}
      {...props}
    >
      <i
        className={cn('size-[6px] bg-accent', now && 'animate-[blink_1.06s_steps(1)_infinite] bg-spark')}
      />
      {children}
    </span>
  )
}
