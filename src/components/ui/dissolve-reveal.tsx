import type { HTMLAttributes } from 'react'
import { useBeat } from '@/hooks/use-beat'
import { cn } from '@/lib/utils'

type DissolveRevealProps = HTMLAttributes<HTMLDivElement> & {
  /** Викликається щоразу, коли поява закінчилась. */
  onRevealed?: () => void
  /** Викликається, коли поява починається (розчинення ще йде). first: перша поява блока. */
  onEnterStart?: (first: boolean) => void
}

/** Обгортка ключового блока: поверх нього полотно кольору фону. Блок розчиняється, коли заходить у екран, і
    розчиняється назад, коли сцену залишають (Mikaido.dissolve, керує режисер сцен). */
export function DissolveReveal({ className, children, onRevealed, onEnterStart, ...props }: DissolveRevealProps) {
  const { host, canvas } = useBeat<HTMLDivElement>({ onEntered: onRevealed, onEnterStart })

  return (
    <div ref={host} className={cn('relative', className)} {...props}>
      {children}
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-[6] h-[calc(100%+2px)] w-[calc(100%+2px)] [image-rendering:pixelated]"
      />
    </div>
  )
}
