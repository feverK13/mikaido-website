import { useRef } from 'react'
import { useGlowLoop } from '@/hooks/use-glow-loop'
import { drawGlowStrip } from '@/lib/effects/glow-strip'
import { cn } from '@/lib/utils'

/** Піксельна смужка ірису: мерехтить як сяйво гарантії. */
export function PixelStrip({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useGlowLoop(ref, drawGlowStrip)
  return <canvas ref={ref} aria-hidden="true" className={cn('block w-full [image-rendering:pixelated]', className)} />
}
