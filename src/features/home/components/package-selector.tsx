import { useCallback, useEffect, useRef, useState } from 'react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { ButtonLink } from '@/components/ui/button-link'
import { buttonVariants } from '@/components/ui/button-variants'
import '@/components/ui/button-a.css'
import { IconButton } from '@/components/ui/icon-button'
import { SwapText } from '@/components/ui/swap-text'
import { TextLink } from '@/components/ui/text-link'
import { Term } from '@/components/ui/term'
import { HEADER_HEIGHT } from '@/config/package-selector'
import { PK, type PackageData } from '@/content/packages'
import { useHologram } from '@/hooks/use-hologram'
import { trackEvent } from '@/lib/analytics'
import { burst } from '@/lib/effects/burst'
import { dissolve } from '@/lib/effects/dissolve'
import { isMotionAllowed } from '@/lib/effects/motion'
import { cn } from '@/lib/utils'
import { PACKAGES_SECTION as C } from '../content'

const screenColor = () => getComputedStyle(document.documentElement).getPropertyValue('--screen').trim()
const KEY_GAP = 160
const LAST = PK.length - 1
const arrowButton =
  'size-12 shrink-0 aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:text-line2 aria-disabled:active:translate-y-0 aria-disabled:active:bg-transparent'
const two = (n: number) => String(n).padStart(2, '0')

type PackageSelectorProps = {
  /** browsed: індекс пакета, який показано зараз. */
  current: number
  onCurrentChange: (index: number) => void
  /** chosen: id обраного пакета зі стану Головної. */
  chosen?: string
  onChoose?: (id: string) => void
}

function Rows({ pkg, sheet = false }: { pkg: PackageData; sheet?: boolean }) {
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
    if (!sheet && isMotionAllowed()) ref.current?.animate({ opacity: [0, 1] }, { duration: 120, easing: 'steps(3, end)' })
  }, [pkg.id, sheet])
  return (
    <div ref={ref} className={cn('border-t border-line', !sheet && 'max-[860px]:hidden')}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-line py-2 text-t14 last:border-b-0">
          <span className="text-muted">{label}</span>
          <span className="text-right">{value}</span>
        </div>
      ))}
    </div>
  )
}

/** Назва, строк, ціна, «для кого» й таблиця. live: тексти змінюються ефектами. Без live: статична копія для резервування висоти. */
function InfoContent({ pkg, live = false }: { pkg: PackageData; live?: boolean }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 max-[860px]:contents">
        <div className="flex flex-wrap items-center gap-3 max-[860px]:order-1">
          {live ? (
            <SwapText mode="decode" text={pkg.name} className="font-px text-px44 uppercase max-[860px]:text-px33" />
          ) : (
            <span className="font-px text-px44 uppercase">{pkg.name}</span>
          )}
          <Term size="sm">{pkg.term}</Term>
        </div>
        {live ? (
          <SwapText
            mode="decode"
            text={pkg.price}
            className="font-display text-h30 font-medium tracking-[-0.02em] whitespace-nowrap max-[860px]:order-3 min-[1100px]:text-h48"
          />
        ) : (
          <span className="font-display text-h30 font-medium tracking-[-0.02em] whitespace-nowrap min-[1100px]:text-h48">{pkg.price}</span>
        )}
      </div>
      {live ? (
        <SwapText mode="type" text={pkg.audience} className="block min-h-[1.5em] text-t14 text-muted max-[860px]:order-2" />
      ) : (
        <span className="block min-h-[1.5em] text-t14 text-muted">{pkg.audience}</span>
      )}
      <Rows pkg={pkg} />
    </>
  )
}

/** Блок вибору пакета на весь екран: меню, сцена з голограмою й опис. Керування мишею й клавіатурою; перехід голограми через розчинення, остання дія перемагає. */
export function PackageSelector({ current, onCurrentChange, chosen, onChoose }: PackageSelectorProps) {
  const pkg = PK[current]
  const [shown, setShown] = useState(current)
  const [flash, setFlash] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState(false)
  const detailsButton = useRef<HTMLButtonElement>(null)
  const closeDetails = useCallback(() => setDetails(false), [])
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
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const isChosen = pkg.id === chosen
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

  /* Свайп по сцені: поріг 40 px і |dx| більше за 1,5·|dy|. Вертикальний скрол лишається нативним (touch-action: pan-y). */
  const onSwipeEnd = (x: number, y: number) => {
    const from = swipe.current
    swipe.current = null
    if (!from) return
    const dx = x - from.x
    const dy = y - from.y
    if (Math.abs(dx) < 40 || Math.abs(dx) < 1.5 * Math.abs(dy)) return
    go(live.current.current + (dx < 0 ? 1 : -1), 'selector_swipe')
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
      if (document.querySelector('[role="dialog"]:not([inert]), dialog[open]') || document.body.style.overflow === 'hidden') return
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
      className="flex flex-col border border-fg bg-surface min-[861px]:grid min-[861px]:grid-cols-[2fr_3fr] [@media(min-height:560px)]:min-h-(--sel-min) [@media(min-height:560px)]:snap-start [@media(min-height:560px)]:scroll-mt-[70px]"
    >
      <p aria-live="polite" className="sr-only">
        {message || `${pkg.name}, ${pkg.price}, ${pkg.term}`}
      </p>
      <div className="flex min-h-0 flex-col border-r border-fg bg-screen px-[18px] py-5 max-[860px]:border-r-0 max-[860px]:border-b max-[860px]:px-4 max-[860px]:py-3">
        <div aria-hidden="true" className="flex items-center justify-between pb-3 max-[860px]:pb-2 pl-[34px] font-px text-px11 uppercase text-muted">
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
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={stage}
          aria-hidden="true"
          onPointerDown={(e) => {
            if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
          }}
          onPointerUp={(e) => onSwipeEnd(e.clientX, e.clientY)}
          onPointerCancel={() => (swipe.current = null)}
          className="relative grid min-h-[140px] flex-1 touch-pan-y place-items-center overflow-hidden bg-screen max-[860px]:basis-[140px]"
        >
          <canvas ref={hologram} data-hologram aria-hidden="true" className="block h-full max-h-full w-full max-w-[420px]" />
        </div>
        <div className="grid gap-3 border-t border-fg p-[22px] max-[860px]:gap-2 max-[860px]:px-4 max-[860px]:py-3">
          {/* Висота інфоблока статична: невидимі копії інших пакетів задають найвищий варіант, тому ефекти тексту її не рухають. */}
          <div className="grid max-[860px]:contents">
            <div className="grid gap-3 min-[861px]:[grid-area:1/1] max-[860px]:contents">
              <InfoContent pkg={pkg} live />
            </div>
            {PK.filter((p) => p.id !== pkg.id).map((p) => (
              <div key={p.id} aria-hidden="true" inert className="invisible grid gap-3 [grid-area:1/1] max-[860px]:hidden">
                <InfoContent pkg={p} />
              </div>
            ))}
          </div>
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
      {/* Телефон: панель керування внизу блоку. Вигляд як у нижніх панелей Головної. */}
      <div
        role="group"
        aria-label={C.controls.label}
        className="hidden items-center gap-2 border-t border-line bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-[max(16px,env(safe-area-inset-left,0px))] pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] max-[860px]:flex max-[860px]:col-span-full"
      >
        <IconButton
          icon="arrow"
          aria-label={C.controls.prev}
          aria-disabled={current === 0 || undefined}
          onClick={() => go(current - 1, 'selector_button')}
          className={cn(arrowButton, '[&_svg]:-rotate-90')}
        />
        <IconButton
          icon="arrow"
          aria-label={C.controls.next}
          aria-disabled={current === LAST || undefined}
          onClick={() => go(current + 1, 'selector_button')}
          className={cn(arrowButton, '[&_svg]:rotate-90')}
        />
        <button
          ref={detailsButton}
          type="button"
          aria-haspopup="dialog"
          onClick={() => setDetails(true)}
          className={cn(buttonVariants({ variant: 'secondary' }), 'min-h-12 flex-1 px-3')}
        >
          {C.controls.details}
        </button>
        <button
          type="button"
          aria-disabled={isChosen || undefined}
          onClick={(e) => {
            if (isChosen) return
            burst(e.nativeEvent, e.currentTarget)
            choose()
          }}
          className={cn(buttonVariants({ variant: 'primary' }), 'min-h-12 flex-[1.4] aria-disabled:cursor-default aria-disabled:opacity-60')}
        >
          {isChosen ? C.controls.chosen : C.controls.choose}
        </button>
      </div>
      <BottomSheet open={details} onClose={closeDetails} label={`${C.controls.details}: ${pkg.name}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-px text-px33 uppercase">{pkg.name}</span>
            <Term size="sm">{pkg.term}</Term>
          </div>
          <span className="font-display text-h30 font-medium tracking-[-0.02em] whitespace-nowrap">{pkg.price}</span>
        </div>
        <Rows pkg={pkg} sheet />
        <ButtonLink
          variant="primary"
          href={C.ctaHref}
          className="mt-3 min-h-12"
          onClick={() => {
            trackEvent('select_package', { package: pkg.id, location: 'selector_sheet_discuss' })
            onChoose?.(pkg.id)
            setDetails(false)
          }}
        >
          {C.discussCta} {pkg.name}
        </ButtonLink>
      </BottomSheet>
    </div>
  )
}
