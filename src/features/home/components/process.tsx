import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Section, SectionHeader } from '@/components/layout/section'
import { DissolveReveal } from '@/components/ui/dissolve-reveal'
import { ICONS } from '@/components/ui/pixel-icon/icons'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { PROCESS_STEPS } from '@/config/process'
import { useTheme } from '@/hooks/use-theme'
import { B4 } from '@/lib/effects/bayer'
import { HOLO } from '@/lib/effects/hologram'
import { isCoarsePointer, isMotionAllowed } from '@/lib/effects/motion'
import { typeText } from '@/lib/effects/type-text'
import { cn } from '@/lib/utils'
import { PROCESS_SECTION as C } from '../content'

const LAST = PROCESS_STEPS.length

/** Піксельна лінія ірису під написом про запуск (dither 80 × 2). */
function WinLine({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const W = 80
    cv.width = W
    cv.height = 2
    ctx.clearRect(0, 0, W, 2)
    for (let i = 0; i < W; i++)
      for (let j = 0; j < 2; j++)
        if (B4[i % 4][j] < 0.75) {
          const c = HOLO.iris(i / W, dark)
          ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
          ctx.fillRect(i, j, 1, 1)
        }
  }, [dark])
  return <canvas ref={ref} aria-hidden="true" className="h-1 w-40 [image-rendering:pixelated]" />
}

/** Піксельна галочка: пікселі з'являються по одному (animation-delay за індексом). */
function WinCheck() {
  let q = 0
  return (
    <svg
      viewBox="0 0 12 12"
      width={24}
      height={24}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="text-accent"
    >
      {ICONS.check.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              style={{ '--i': q++ } as CSSProperties}
              className="animate-[pin_1ms_steps(1)_forwards] opacity-0 [animation-delay:calc(var(--i)*60ms)]"
            />
          ),
        ),
      )}
    </svg>
  )
}

/** Секція «Процес»: етапи як точки збереження. Опис друкується терміналом, коли блок з'являється; цикл ≈30 с: 5 × 5 с, успіх 3 с, пауза 1,5 с. */
export function Process() {
  const { theme } = useTheme()
  const [stage, setStage] = useState(LAST)
  const [win, setWin] = useState(false)
  const paragraphs = useRef<(HTMLElement | null)[]>([])
  const timers = useRef<number[]>([])
  const alive = useRef(true)
  const again = useRef<() => void>(undefined)

  useEffect(() => {
    alive.current = true
    const pending = timers.current
    return () => {
      alive.current = false
      pending.forEach(clearTimeout)
    }
  }, [])

  const at = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(() => alive.current && fn(), ms))
  }, [])

  const loop = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (!isMotionAllowed()) {
      setStage(LAST)
      setWin(true)
      return
    }
    for (let k = 0; k < LAST; k++) at(k * 5000, () => setStage(k))
    at(25000, () => {
      setStage(LAST)
      setWin(true)
    })
    at(28000, () => {
      setWin(false)
      setStage(-1)
    })
    at(29500, () => again.current?.())
  }, [at])

  useEffect(() => {
    again.current = loop
  }, [loop])

  const start = useCallback(async () => {
    if (!isMotionAllowed()) {
      paragraphs.current.forEach((el, i) => el && (el.textContent = PROCESS_STEPS[i].description))
      setStage(LAST)
      return
    }
    setStage(-1)
    for (let i = 0; i < PROCESS_STEPS.length; i++) {
      const el = paragraphs.current[i]
      if (!el || !alive.current) return
      await typeText(el, PROCESS_STEPS[i].description, { speed: isCoarsePointer() ? 14 : 20 })
      await new Promise((r) => setTimeout(r, 80))
    }
    if (alive.current) loop()
  }, [loop])

  const progress = Math.min(Math.max(stage, 0), 4) / 4

  return (
    <Section id="proces">
      <SectionHeader tab={C.tab} title={C.title} lead={C.lead} />
      <DissolveReveal onRevealed={() => void start()}>
        <ol
          style={{ '--p': progress } as CSSProperties}
          className={cn(
            'relative grid grid-cols-5 max-[860px]:grid-cols-1 max-[860px]:gap-[18px]',
            /* пунктирна рейка */
            "before:absolute before:top-[10px] before:right-[10px] before:left-[10px] before:h-[2px] before:bg-[repeating-linear-gradient(90deg,var(--line2)_0_6px,transparent_6px_10px)] before:content-['']",
            'max-[860px]:before:right-auto max-[860px]:before:bottom-[10px] max-[860px]:before:h-auto max-[860px]:before:w-[2px] max-[860px]:before:bg-[repeating-linear-gradient(180deg,var(--line2)_0_6px,transparent_6px_10px)]',
            /* заповнена частина рейки */
            "after:absolute after:top-[10px] after:left-[10px] after:h-[2px] after:w-[80%] after:origin-left after:scale-x-[var(--p)] after:bg-fg after:transition-[scale] after:duration-[1400ms] after:ease-[steps(14,end)] after:content-['']",
            'max-[860px]:after:h-[calc(100%-20px)] max-[860px]:after:w-[2px] max-[860px]:after:origin-top max-[860px]:after:scale-x-100 max-[860px]:after:scale-y-[var(--p)]',
          )}
        >
          {PROCESS_STEPS.map((step, i) => {
            const ok = i < stage
            const now = i === stage
            return (
              <li
                key={step.title}
                aria-current={now ? 'step' : undefined}
                className="relative grid content-start gap-[10px] pr-[18px] max-[860px]:grid-cols-[22px_1fr] max-[860px]:gap-x-4"
              >
                <i
                  className={cn(
                    'relative z-[1] block size-[22px] border-2 border-fg bg-bg max-[860px]:row-[1/4]',
                    ok && 'bg-fg',
                    now && 'outline outline-1 outline-offset-[3px] outline-fg',
                    now &&
                      "after:absolute after:inset-[3px] after:animate-[blink_1.06s_steps(1)_infinite] after:bg-spark after:content-['']",
                  )}
                />
                <span className={cn('font-px text-px11 uppercase text-muted', ok && 'text-accent', now && 'text-spark')}>
                  {ok ? C.done : now ? C.now : `${C.stepLabel} 0${i + 1}`}
                </span>
                <b className="font-display text-t16 font-medium">{step.title}</b>
                {/* Опис спершу порожній, друкується по черзі після появи решти блока; невидимий повний текст тримає висоту */}
                <p className="grid min-h-[3em] text-t14 text-muted">
                  <span className="sr-only">{step.description}</span>
                  <span aria-hidden="true" className="invisible [grid-area:1/1]">
                    {step.description}
                  </span>
                  <span
                    aria-hidden="true"
                    ref={(el) => {
                      paragraphs.current[i] = el
                    }}
                    className="[grid-area:1/1]"
                  />
                </p>
              </li>
            )
          })}
        </ol>
      </DissolveReveal>
      <div
        aria-live="polite"
        className={cn(
          'mt-[22px] flex min-h-7 items-center gap-3 font-px text-px11 uppercase opacity-0 transition-opacity duration-base ease-[steps(3,end)]',
          win && 'opacity-100',
        )}
      >
        {win && (
          <>
            <WinCheck />
            <span>{C.launched}</span>
            <WinLine dark={theme === 'dark'} />
          </>
        )}
      </div>
      <div className="mt-[28px] grid max-w-[760px] grid-cols-[24px_1fr] items-center gap-[14px] border border-line bg-surface px-4 py-[14px]">
        <PixelIcon name="report" size={24} className="block" />
        <div>
          <b className="block font-semibold">{C.friday.title}</b>
          <span className="text-t14 text-muted">{C.friday.text}</span>
        </div>
      </div>
    </Section>
  )
}
