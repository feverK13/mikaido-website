import { useRef } from 'react'
import { useGlowLoop } from '@/hooks/use-glow-loop'
import { drawGlowFrame } from '@/lib/effects/glow-frame'

/** Піксельна рамка ірису, що звужується й розширюється з пробілами. Кладеться абсолютно поверх блока. */
export function PixelFrame() {
  const ref = useRef<HTMLCanvasElement>(null)
  useGlowLoop(ref, drawGlowFrame)
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]" />
}
