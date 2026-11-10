import { useEffect, useRef } from 'react'
import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { TextLink } from '@/components/ui/text-link'
import { useTheme } from '@/hooks/use-theme'
import { drawGlow } from '@/lib/effects/glow'
import { isMotionAllowed } from '@/lib/effects/motion'
import { TERMS_SECTION as C } from '../content'

/** Піксельне сяйво: малюється лише коли блок у вікні, кадр раз на 100 мс. Без руху кадр статичний. */
function Glow() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dark = theme === 'dark'
    let visible = false
    let last = 0
    let raf = 0
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
    })
    observer.observe(cv)
    drawGlow(cv, 0, dark, false)
    const frame = (t: number) => {
      if (visible && t - last > 100) {
        last = t
        drawGlow(cv, t, dark, isMotionAllowed())
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [theme])

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 size-full [image-rendering:pixelated]" />
}

/** Секція «Умови»: велика цифра гарантії з піксельним сяйвом і шість відмінностей. */
export function Terms() {
  return (
    <Section id="umovy">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <div className="grid grid-cols-[1fr_2fr] gap-3 max-[900px]:grid-cols-1">
        <DissolveReveal className="grid min-h-[300px] place-items-center overflow-hidden border border-fg bg-bg">
          <Glow />
          <div className="relative grid gap-2 bg-bg px-[18px] py-[14px] text-center">
            <b className="font-display text-h30 leading-none font-medium tracking-[-0.03em] min-[600px]:text-h48">
              {C.guarantee.value}
            </b>
            <span className="max-w-[28ch] text-t14 text-muted">{C.guarantee.text}</span>
          </div>
        </DissolveReveal>
        <ul className="grid grid-cols-2 border border-line bg-surface max-[560px]:grid-cols-1">
          {C.differences.map((item) => (
            <li
              key={item.title}
              className="grid grid-cols-[24px_1fr] content-start gap-[14px] border-b border-line p-5 odd:border-r max-[560px]:odd:border-r-0"
            >
              <PixelIcon name={item.icon} size={24} className="block" />
              <div>
                <b className="mb-1 block font-display text-t16 font-medium">{item.title}</b>
                <p className="text-t14 text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <TextLink href={C.moreHref} className="justify-self-start">
        {C.moreLabel}
      </TextLink>
    </Section>
  )
}
