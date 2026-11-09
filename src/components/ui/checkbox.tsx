import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PixelIcon } from './pixel-icon/pixel-icon'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: ReactNode
  error?: string
}

/** Прапорець 20 × 20, уся смуга з текстом натискається. */
export function Checkbox({ children, error, className, ...props }: CheckboxProps) {
  return (
    <div className="grid gap-1">
      <label className={cn('flex cursor-pointer select-none items-start gap-space-3 text-t14', className)}>
        <input type="checkbox" className="peer sr-only" aria-invalid={error ? true : undefined} {...props} />
        <span
          className={cn(
            'grid size-5 flex-none place-items-center border border-line3 bg-surface text-bg transition-[border-color,background-color] duration-fast ease-out-mk peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100',
            error && 'border-spark',
          )}
        >
          <PixelIcon name="check" size={24} className="size-3" />
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p role="alert" className="text-t13 text-spark">
          {error}
        </p>
      )}
    </div>
  )
}

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { children: ReactNode }

const OCTAGON = '[clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]'
const DOT_OCTAGON = '[clip-path:polygon(25%_0,75%_0,100%_25%,100%_75%,75%_100%,25%_100%,0_75%,0_25%)]'

/** Радіо восьмикутне, точка з'являється кроками steps(2). */
export function Radio({ children, className, ...props }: RadioProps) {
  return (
    <label className={cn('flex cursor-pointer select-none items-start gap-space-3 text-t14', className)}>
      <input type="radio" className="peer sr-only" {...props} />
      <span
        className={cn(
          'grid size-5 flex-none place-items-center bg-line3 p-px peer-checked:bg-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
          OCTAGON,
          'before:col-start-1 before:row-start-1 before:size-[18px] before:bg-surface before:content-[""] before:[clip-path:inherit]',
          '[&>i]:col-start-1 [&>i]:row-start-1 [&>i]:size-2 [&>i]:scale-0 [&>i]:bg-fg [&>i]:transition-transform [&>i]:duration-fast [&>i]:ease-[steps(2,end)] peer-checked:[&>i]:scale-100',
        )}
      >
        <i className={DOT_OCTAGON} />
      </span>
      <span>{children}</span>
    </label>
  )
}
