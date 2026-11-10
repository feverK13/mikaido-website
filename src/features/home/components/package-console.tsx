import { useRef, useState, type KeyboardEvent } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { Term } from '@/components/ui/term'
import { PK, type PackageData } from '@/content/packages'
import { useHologram } from '@/hooks/use-hologram'
import { dissolve } from '@/lib/effects/dissolve'
import { isMotionAllowed } from '@/lib/effects/motion'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { PACKAGES_SECTION as C } from '../content'

const surface = () => getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()

type PackageConsoleProps = {
  /** Індекс вибраного пакета й зміна вибору (стан живе в секції, щоб посилання на повні умови знало вибір). */
  current: number
  onCurrentChange: (index: number) => void
  /** Викликається з id пакета, коли партнер натиснув «Обговорити»: форма підставляє пакет. */
  onDiscuss?: (name: string) => void
}

function Detail({ pkg, onDiscuss }: { pkg: PackageData; onDiscuss?: (name: string) => void }) {
  const rows: [string, string][] = [
    [C.detailRows.scope, pkg.scope],
    [C.detailRows.key, pkg.key],
    [C.detailRows.revisions, pkg.revisions],
    [C.detailRows.pulse, pkg.pulse],
    [C.detailRows.payment, pkg.payment],
  ]
  return (
    <>
      <div className="grid content-start justify-items-start gap-3 p-[22px]">
        <span className="font-px text-px33 uppercase">{pkg.name}</span>
        <Term size="sm">{pkg.term}</Term>
        <span className="text-t14 text-muted">{pkg.audience}</span>
        <span className="font-display text-h30 font-medium tracking-[-0.02em] whitespace-nowrap">{pkg.price}</span>
      </div>
      <div className="border-t border-line px-[22px] py-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-line py-[11px] text-t14 last:border-b-0">
            <span className="text-muted">{label}</span>
            <span className="text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-[10px] border-t border-line px-[22px] pt-4 pb-[22px]">
        <ButtonLink variant="primary" href={C.ctaHref} onClick={() => {
            trackEvent('select_package', { package: pkg.id, location: 'console_discuss' })
            onDiscuss?.(pkg.id)
          }}>
          {C.discussCta} {pkg.name}
        </ButtonLink>
      </div>
    </>
  )
}

/** Ігровий блок «Пакети»: меню як у консолі (стрілки, дотик) і картка пакета, що змінюється через розчинення. Голограма змінюється разом із пакетом. */
export function PackageConsole({ current, onCurrentChange, onDiscuss }: PackageConsoleProps) {
  const [swapping, setSwapping] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const swap = useRef<HTMLCanvasElement>(null)
  const options = useRef<(HTMLButtonElement | null)[]>([])
  const hologram = useHologram(C.models[PK[current].id])

  const pick = (index: number, withFlash: boolean) => {
    if (index === current || swapping) return
    trackEvent('select_package', { package: PK[index].id, location: 'console_menu' })
    if (withFlash && isMotionAllowed()) setFlash(index)
    const cv = swap.current
    if (!cv) {
      onCurrentChange(index)
      return
    }
    setSwapping(true)
    dissolve(cv, {
      dur: 140,
      dir: -1,
      color: surface(),
      cell: 6,
      done: () => {
        onCurrentChange(index)
        requestAnimationFrame(() =>
          dissolve(cv, { dur: 200, dir: 1, color: surface(), cell: 6, done: () => setSwapping(false) }),
        )
      },
    })
  }

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowDown' ? 1 : PK.length - 1)) % PK.length
    options.current[next]?.focus()
    pick(next, false)
  }

  return (
    <div className="grid grid-cols-[1fr_1.15fr] border border-fg bg-surface max-[900px]:grid-cols-1">
      <div
        role="listbox"
        aria-label={C.menuLabel}
        className="grid content-start gap-[2px] border-r border-fg bg-screen px-[18px] py-5 min-[901px]:grid-rows-[auto_repeat(4,auto)_auto_1fr] max-[900px]:border-r-0 max-[900px]:border-b"
      >
        <div aria-hidden="true" className="pb-3 pl-[34px] font-px text-px11 uppercase text-muted">{C.menuTitle}</div>
        {PK.map((pkg, i) => (
          <button
            key={pkg.id}
            ref={(el) => {
              options.current[i] = el
            }}
            type="button"
            role="option"
            aria-selected={i === current}
            onClick={() => pick(i, true)}
            onKeyDown={(e) => onKeyDown(e, i)}
            onAnimationEnd={() => setFlash(null)}
            className={cn(
              'grid min-h-[52px] w-full cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-[10px] border-0 bg-transparent px-[10px] py-3 text-left font-px leading-none text-fg uppercase transition-colors duration-instant ease-linear select-none hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] aria-selected:bg-fg aria-selected:text-bg aria-selected:hover:bg-fg',
              flash === i && 'animate-[mf_240ms_steps(1)_1]',
            )}
          >
            <span aria-hidden="true" className={cn('text-px22', i !== current && 'invisible')}>
              ▶
            </span>
            <span className="text-px22">{pkg.name}</span>
            <span className={cn('text-px11', i === current ? 'text-bg opacity-75' : 'text-muted')}>{pkg.term}</span>
          </button>
        ))}
        <div aria-hidden="true" className="mt-[10px] flex flex-wrap gap-[14px] border-t border-dashed border-line2 px-[10px] pt-4 font-px text-px11 uppercase text-muted [@media(hover:none)]:hidden">
          {C.keys.map((k) => (
            <span key={k.keys}>
              <kbd className="mr-1 rounded-r2 border border-current px-1 py-[3px] font-px text-px11">{k.keys}</kbd>
              {k.label}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="mt-auto grid place-items-center pt-3 max-[900px]:hidden">
          <canvas ref={hologram} aria-hidden="true" className="block aspect-square w-[min(100%,260px)]" />
        </div>
      </div>
      <div className="relative grid" aria-live="polite">
        <Detail key={current} pkg={PK[current]} onDiscuss={onDiscuss} />
        <canvas
          ref={swap}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3] size-full [image-rendering:pixelated]"
        />
      </div>
    </div>
  )
}
