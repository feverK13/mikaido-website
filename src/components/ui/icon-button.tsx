import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { PixelIcon } from './pixel-icon/pixel-icon'
import type { IconName } from './pixel-icon/icons'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  icon: IconName
  /** Назва дії: «Змінити тему», «Меню», «Закрити». */
  'aria-label': string
}

export function IconButton({ icon, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'grid size-tap cursor-pointer place-items-center rounded-r3 border border-line2 bg-transparent text-fg transition-[border-color,background-color,transform] duration-fast ease-out-mk hover:border-fg hover:bg-surface2 active:translate-y-px active:bg-line',
        className,
      )}
      {...props}
    >
      <PixelIcon name={icon} size={24} />
    </button>
  )
}
