import type { AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Посилання: підкреслення 1 px росте кроками steps(8) за 240 мс, натиснуте accent. */
export function TextLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        'bg-[linear-gradient(var(--fg),var(--fg))] bg-size-[0_1px] bg-position-[0_100%] bg-no-repeat pb-[3px] font-medium text-fg no-underline transition-[background-size] duration-base ease-[steps(8,end)] hover:bg-size-[100%_1px] active:text-accent',
        className,
      )}
      {...props}
    />
  )
}
