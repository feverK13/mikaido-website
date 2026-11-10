import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { PixelIcon } from './pixel-icon/pixel-icon'

type PixelNavButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  direction: 'prev' | 'next'
  /** Назва дії: «Попередній кейс», «Наступний кейс». */
  'aria-label': string
}

const CORNERS =
  '[clip-path:polygon(0_4px,4px_4px,4px_0,calc(100%-4px)_0,calc(100%-4px)_4px,100%_4px,100%_calc(100%-4px),calc(100%-4px)_calc(100%-4px),calc(100%-4px)_100%,4px_100%,4px_calc(100%-4px),0_calc(100%-4px))]'

/** Піксельна кнопка перемикання зі скошеними кроками кутами. Доступна: темна заливка. Недоступна (aria-disabled, фокус не губиться): пласка світла, без нахилу вниз. */
export function PixelNavButton({ direction, className, type = 'button', disabled = false, onClick, ...props }: PixelNavButtonProps) {
  return (
    <button
      type={type}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'grid size-12 cursor-pointer place-items-center border-0 bg-fg text-bg transition-transform duration-instant ease-linear',
        CORNERS,
        '[@media(hover:hover)]:hover:bg-fg/85 active:translate-y-[2px]',
        'aria-disabled:translate-y-0 aria-disabled:cursor-not-allowed aria-disabled:bg-surface2 aria-disabled:text-line2 [@media(hover:hover)]:aria-disabled:hover:bg-surface2',
        className,
      )}
      {...props}
    >
      <PixelIcon name="arrow" size={24} className={direction === 'prev' ? '-scale-x-100' : undefined} />
    </button>
  )
}
