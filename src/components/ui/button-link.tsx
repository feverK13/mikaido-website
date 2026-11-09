import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { burst } from '@/lib/effects/burst'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button-variants'
import './button-a.css'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonVariantProps

/** Посилання з виглядом кнопки (кнопка A для головної дії, що веде на іншу секцію чи сторінку). */
export function ButtonLink({ variant, size, className, onClick, ...props }: ButtonLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'primary') burst(event.nativeEvent, event.currentTarget)
    onClick?.(event)
  }

  return (
    <a
      className={cn(buttonVariants({ variant, size }), 'no-underline', className)}
      onClick={handleClick}
      {...props}
    />
  )
}
