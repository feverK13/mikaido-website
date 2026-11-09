import { useState, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  error?: boolean
}

/** Перемикач для дій, що діють одразу і легко скасовуються. Поруч завжди текст, що вмикається. */
export function Toggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  error,
  className,
  onClick,
  ...props
}: ToggleProps) {
  const [inner, setInner] = useState(defaultChecked)
  const isChecked = checked ?? inner

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      className={cn(
        'relative h-[26px] w-[46px] flex-none cursor-pointer rounded-r2 border border-line3 bg-surface2 p-0 transition-[background-color,border-color] duration-fast ease-[steps(2,end)]',
        'after:absolute after:top-1 after:left-1 after:size-4 after:bg-muted after:transition-[transform,background-color] after:duration-fast after:ease-[steps(4,end)] after:content-[""]',
        'before:absolute before:-inset-x-1 before:-inset-y-[10px] before:content-[""] not-pointer-coarse:before:hidden',
        'hover:not-disabled:border-fg active:after:w-[18px]',
        'aria-checked:border-fg aria-checked:bg-fg aria-checked:after:translate-x-5 aria-checked:after:bg-bg',
        'disabled:cursor-not-allowed disabled:opacity-[.55]',
        error && 'border-spark',
        className,
      )}
      onClick={(event) => {
        setInner(!isChecked)
        onCheckedChange?.(!isChecked)
        onClick?.(event)
      }}
      {...props}
    />
  )
}
