import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Бічний відступ: 16 px на телефоні (з safe area), 32 px на планшеті, 64 px від 1200 px. Ширина до 1200 px контенту. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[calc(1200px+128px)] px-[max(16px,env(safe-area-inset-left,0px))] md:px-8 min-[1200px]:px-16',
        className,
      )}
      {...props}
    />
  )
}
