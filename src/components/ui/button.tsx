import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { burst } from '@/lib/effects/burst'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button-variants'
import './button-a.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps

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
