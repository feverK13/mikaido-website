import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { burst } from '@/lib/effects/burst'
import { cn } from '@/lib/utils'
import './button-a.css'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-space-3 whitespace-nowrap font-semibold leading-none select-none disabled:cursor-not-allowed disabled:opacity-40',
  {
    variants: {
      /** primary: кнопка A, одна на екран. secondary: рамка. ghost: без рамки. */
      variant: {
        primary: 'btn-a',
        secondary:
          'cursor-pointer rounded-r3 border border-line2 bg-transparent text-fg transition-[border-color,background-color,transform] duration-fast ease-out-mk hover:border-fg hover:bg-surface2 active:translate-y-px active:bg-line',
        ghost:
          'cursor-pointer rounded-r3 border border-transparent bg-transparent text-fg transition-[background-color,transform] duration-fast ease-out-mk hover:bg-surface2 active:translate-y-px active:bg-line',
      },
      size: {
        sm: 'min-h-[34px] text-t13 pointer-coarse:min-h-tap',
        md: 'min-h-tap text-t16',
        lg: 'min-h-tap text-t18',
      },
    },
    compoundVariants: [
      { variant: 'primary', size: 'sm', class: 'px-4 py-[10px]' },
      { variant: 'primary', size: 'md', class: 'px-[22px] py-[14px]' },
      { variant: 'primary', size: 'lg', class: 'px-7 py-[18px]' },
      { variant: ['secondary', 'ghost'], size: 'sm', class: 'px-[14px] py-[9px]' },
      { variant: ['secondary', 'ghost'], size: 'md', class: 'px-5 py-[13px]' },
      { variant: ['secondary', 'ghost'], size: 'lg', class: 'px-6 py-[17px]' },
    ],
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ variant, size, className, onClick, type = 'button', ...props }: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') burst(event.nativeEvent, event.currentTarget)
    onClick?.(event)
  }

  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleClick}
      {...props}
    />
  )
}
