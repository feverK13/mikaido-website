import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { SwapText } from '@/components/ui/swap-text'
import { TextLink } from '@/components/ui/text-link'
import { Term } from '@/components/ui/term'
import { HEADER_HEIGHT } from '@/config/package-selector'
import { PK, type PackageData } from '@/content/packages'
import { useHologram } from '@/hooks/use-hologram'
import { trackEvent } from '@/lib/analytics'
import { dissolve } from '@/lib/effects/dissolve'
import { isMotionAllowed } from '@/lib/effects/motion'
import { cn } from '@/lib/utils'
import { PACKAGES_SECTION as C } from '../content'

const screenColor = () => getComputedStyle(document.documentElement).getPropertyValue('--screen').trim()
const KEY_GAP = 160
const LAST = PK.length - 1
const two = (n: number) => String(n).padStart(2, '0')

type PackageSelectorProps = {
  /** browsed: індекс пакета, який показано зараз. */
  current: number
  onCurrentChange: (index: number) => void
  /** chosen: id обраного пакета зі стану Головної. */
  chosen?: string
  onChoose?: (id: string) => void
}

function Rows({ pkg }: { pkg: PackageData }) {
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const rows: [string, string][] = [
    [C.detailRows.scope, pkg.scope],
    [C.detailRows.key, pkg.key],
    [C.detailRows.revisions, pkg.revisions],
    [C.detailRows.pulse, pkg.pulse],
    [C.detailRows.payment, pkg.payment],
  ]
  /* Рядки змінюються кроками steps(3) за 120 мс. */
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (isMotionAllowed()) ref.current?.animate({ opacity: [0, 1] }, { duration: 120, easing: 'steps(3, end)' })
  }, [pkg.id])
  return (
    <div ref={ref} className="border-t border-line max-[860px]:hidden">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-line py-2 text-t14 last:border-b-0">
          <span className="text-muted">{label}</span>
          <span className="text-right">{value}</span>
        </div>
      ))}
    </div>
  )
}

/** Блок вибору пакета на весь екран: меню, сцена з голограмою й опис. Керування мишею й клавіатурою; перехід голограми через розчинення, остання дія перемагає. */
export function PackageSelector({ current, onCurrentChange, chosen, onChoose }: PackageSelectorProps) {
  const pkg = PK[current]
  const [shown, setShown] = useState(current)
  const [flash, setFlash] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLCanvasElement | null>(null)
  const token = useRef(0)
  const busy = useRef(false)
  const active = useRef(false)
  const lastKey = useRef(0)
  const live = useRef({ current, onChoose, onCurrentChange })
  useEffect(() => {
    live.current = { current, onChoose, onCurrentChange }
  })
  const hologram = useHologram(C.models[PK[shown].id])

  /* Перехід голограми: старе зникає (240 мс), нове з'являється (400 мс). Новий вибір скасовує попередній перехід. */
  const transition = (to: number) => {
    const host = stage.current
    const id = ++token.current
    overlay.current?.remove()
    overlay.current = null
    if (!host || !isMotionAllowed()) {
      busy.current = false
      setShown(to)
      return
    }
    const cv = document.createElement('canvas')
    cv.setAttribute('aria-hidden', 'true')
    cv.className = 'pointer-events-none absolute inset-0 z-[3] size-full [image-rendering:pixelated]'
    host.append(cv)
    overlay.current = cv
    const color = screenColor()
    const reveal = () =>
      dissolve(cv, {
        dur: 400,
        dir: 1,
        color,
        cell: 6,
        done: () => {
          if (token.current !== id) return
          cv.remove()
          overlay.current = null
          busy.current = false
        },
      })
    if (busy.current) {
      setShown(to)
      reveal()
      return
    }
    busy.current = true
    dissolve(cv, {
      dur: 240,
      dir: -1,
      color,
      cell: 6,
      done: () => {
        if (token.current !== id) return
        setShown(to)
        reveal()
      },
    })
  }

  const go = (index: number, source: string) => {
    if (index === live.current.current || index < 0 || index > LAST) return
    trackEvent('select_package', { package: PK[index].id, location: source })
    setMessage('')
    live.current.onCurrentChange(index)
    transition(index)
  }

  const choose = () => {
    const { current: i, onChoose: fn } = live.current
    fn?.(PK[i].id)
    setMessage(`${C.chosenAnnounce} ${PK[i].name}`)
    if (isMotionAllowed()) setFlash(i)
  }

  useEffect(
    () => () => {
      token.current++
      overlay.current?.remove()
    },
    [],
  )

  /* Блок активний, коли видно щонайменше 60% його висоти. */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const need = 0.6 * Math.min(entry.boundingClientRect.height, innerHeight)
        active.current = entry.isIntersecting && entry.intersectionRect.height >= need
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!active.current || event.defaultPrevented) return
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return
      if (document.querySelector('[role="dialog"], dialog[open]') || document.body.style.overflow === 'hidden') return
      const i = live.current.current
      let to: number
      if (event.key === 'ArrowDown') {
        if (i === LAST) return
        to = i + 1
      } else if (event.key === 'ArrowUp') {
        if (i === 0) return
        to = i - 1
      } else if (event.key === 'Home') to = 0
      else if (event.key === 'End') to = LAST
      else if (/^[1-4]$/.test(event.key)) to = Number(event.key) - 1
      else if (event.key === 'Enter') {
        /* На кнопках і посиланнях Enter спрацьовує самостійно, щоб не дублювати. */
        if (target?.closest('button, a')) return
        event.preventDefault()
        choose()
        return
      } else return
      event.preventDefault()
      const now = performance.now()
      if (now - lastKey.current < KEY_GAP) return
      lastKey.current = now
      go(to, 'selector_key')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // go і choose читають актуальний стан із ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={root}
      id="pakety-vybir"
      style={{ ['--sel-min' as string]: `calc(100svh - ${HEADER_HEIGHT}px)` }}
      className="grid grid-cols-[2fr_3fr] border border-fg bg-surface max-[860px]:grid-cols-1 [@media(min-height:560px)]:min-h-(--sel-min) [@media(min-height:560px)]:snap-start [@media(min-height:560px)]:scroll-mt-[70px]"
    >
      <p aria-live="polite" className="sr-only">
        {message || `${pkg.name}, ${pkg.price}, ${pkg.term}`}
      </p>
      <div className="flex min-h-0 flex-col border-r border-fg bg-screen px-[18px] py-5 max-[860px]:border-r-0 max-[860px]:border-b max-[860px]:px-4 max-[860px]:py-4">
        <div aria-hidden="true" className="flex items-center justify-between pb-3 pl-[34px] font-px text-px11 uppercase text-muted">
          <span>{C.menuTitle}</span>
          <span className="min-[861px]:hidden">{two(current + 1)} / {two(PK.length)}</span>
        </div>
        <div
          role="listbox"
          tabIndex={0}
          aria-label={C.menuLabel}
          aria-activedescendant={`pkg-opt-${pkg.id}`}
          className="grid gap-[2px] outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
        >
          {PK.map((item, i) => (
            <div
              key={item.id}
              id={`pkg-opt-${item.id}`}
              role="option"
              aria-selected={i === current}
              onClick={() => go(i, 'selector_menu')}
              onAnimationEnd={() => setFlash(null)}
              className={cn(
                'grid min-h-16 w-full cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-[10px] px-[10px] py-3 font-px leading-none text-fg uppercase transition-colors duration-instant ease-linear select-none max-[860px]:min-h-11 max-[860px]:py-2',
                '[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] aria-selected:bg-fg aria-selected:text-bg [@media(hover:hover)]:aria-selected:hover:bg-fg',
                flash === i && 'animate-[mf_240ms_steps(1)_1]',
              )}
            >
              <span aria-hidden="true" className={cn('text-px22', i !== current && 'invisible')}>
                ▶
              </span>
              <span className="text-px33 max-[860px]:text-px22">{item.name}</span>
              <span className="flex items-center gap-2">
                {item.id === chosen && <Term size="sm" className="text-fg">{C.chosenLabel}</Term>}
                <span className={cn('text-px11', i === current ? 'text-bg opacity-75' : 'text-muted')}>{item.term}</span>
              </span>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="mt-auto flex flex-wrap items-center justify-between gap-[14px] border-t border-dashed border-line2 px-[10px] pt-4 font-px text-px11 uppercase text-muted max-[860px]:hidden">
          <span>{two(current + 1)} / {two(PK.length)}</span>
          <span className="flex flex-wrap gap-[14px] [@media(hover:none)]:hidden">
            {C.keys.map((k) => (
              <span key={k.keys}>
                <kbd className="mr-1 rounded-r2 border border-current px-1 py-[3px] font-px text-px11">{k.keys}</kbd>
                {k.label}
              </span>
            ))}
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-col">
        <div
          ref={stage}
          aria-hidden="true"
          className="relative grid min-h-[140px] flex-1 place-items-center overflow-hidden bg-screen max-[860px]:flex-none max-[860px]:basis-[32svh]"
        >
          <canvas ref={hologram} aria-hidden="true" className="block h-full max-h-full w-full max-w-[420px]" />
        </div>
        <div className="grid gap-3 border-t border-fg p-[22px] max-[860px]:p-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <SwapText mode="decode" text={pkg.name} className="font-px text-px44 uppercase max-[860px]:text-px33" />
              <Term size="sm">{pkg.term}</Term>
            </div>
            <SwapText
              mode="decode"
              text={pkg.price}
              className="font-display text-h30 font-medium tracking-[-0.02em] whitespace-nowrap min-[1100px]:text-h48"
            />
          </div>
          <SwapText mode="type" text={pkg.audience} className="block min-h-[1.5em] text-t14 text-muted" />
          <Rows pkg={pkg} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 max-[860px]:hidden">
            <ButtonLink
              variant="primary"
              href={C.ctaHref}
              onClick={() => {
                trackEvent('select_package', { package: pkg.id, location: 'selector_discuss' })
                onChoose?.(pkg.id)
              }}
            >
              {C.discussCta} {pkg.name}
            </ButtonLink>
            <TextLink href={`${C.fullHref}?pkg=${pkg.id}#tablytsia`}>{C.fullLabel}</TextLink>
          </div>
        </div>
      </div>
    </div>
  )
}
