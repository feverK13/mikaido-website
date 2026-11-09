import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export type SelectOption = { value: string; label: string; /** Строк чи позначка праворуч, px-11. */ hint?: string }

type SelectProps = {
  label: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

/** Вибір зі списку. Список відкривається шторкою clip-path кроками steps(6) за 240 мс. До 860 px замість списку нижня шторка. */
export function Select({ label, options, value, onChange, className }: SelectProps) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const [active, setActive] = useState(selectedIndex)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    optionRefs.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  /* Нижня шторка до 860 px: сторінка під нею не прокручується. Блокування знімається при закритті,
     розмонтуванні й коли вікно стає ширшим за 860 px (там список випадає під полем). */
  useEffect(() => {
    if (!open) return
    const query = matchMedia('(max-width: 860px)')
    const previous = document.body.style.overflow
    const apply = () => {
      document.body.style.overflow = query.matches ? 'hidden' : previous
    }
    apply()
    query.addEventListener('change', apply)
    return () => {
      query.removeEventListener('change', apply)
      document.body.style.overflow = previous
    }
  }, [open])

  const openList = () => {
    setActive(selectedIndex)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  const choose = (index: number) => {
    onChange?.(options[index].value)
    close()
  }

  const onListKey = (event: KeyboardEvent) => {
    const last = options.length - 1
    if (event.key === 'ArrowDown') setActive((i) => Math.min(last, i + 1))
    else if (event.key === 'ArrowUp') setActive((i) => Math.max(0, i - 1))
    else if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(last)
    else if (event.key === 'Escape') close()
    else if (event.key === 'Tab') setOpen(false)
    else return
    if (event.key !== 'Tab') event.preventDefault()
  }

  return (
    <div ref={root} className={cn('relative grid gap-[6px]', className)}>
      <span id={`${id}-label`} className="text-t13 text-muted">
        {label}
      </span>
      <div className="relative">
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          onClick={() => (open ? close() : openList())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              openList()
            }
          }}
          className={cn(
            'flex min-h-tap w-full cursor-pointer items-center justify-between gap-space-3 rounded-r3 border border-line3 bg-transparent px-5 py-[13px] text-left text-t16 font-semibold leading-none text-fg transition-[border-color,background-color] duration-fast ease-out-mk hover:border-fg hover:bg-surface2',
            open && 'rounded-b-none border-fg border-b-transparent bg-surface',
          )}
        >
          <span id={`${id}-value`}>{selected?.label ?? 'Оберіть'}</span>
          <span
            aria-hidden="true"
            className={cn('inline-block transition-transform duration-base ease-[steps(4,end)]', open && 'rotate-180')}
          >
            ▾
          </span>
        </button>
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={cn(
            'pointer-events-none fixed inset-0 z-[44] bg-[color-mix(in_srgb,var(--fg)_30%,transparent)] opacity-0 transition-opacity duration-base ease-linear min-[861px]:hidden',
            open && 'pointer-events-auto opacity-100',
          )}
        />
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          inert={!open}
          onKeyDown={onListKey}
          className={cn(
            'absolute inset-x-0 top-[calc(100%-1px)] z-[5] rounded-b-r3 border border-fg bg-surface transition-[clip-path] duration-base ease-[steps(6,end)] [clip-path:inset(0_0_100%_0)]',
            'max-[860px]:fixed max-[860px]:inset-x-0 max-[860px]:top-auto max-[860px]:bottom-0 max-[860px]:z-[45] max-[860px]:rounded-none max-[860px]:border-x-0 max-[860px]:border-b-0 max-[860px]:pb-[env(safe-area-inset-bottom,0px)] max-[860px]:[clip-path:inset(100%_0_0_0)]',
            open && '[clip-path:inset(-2px)] max-[860px]:[clip-path:inset(0)]',
          )}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(el) => {
                optionRefs.current[index] = el
              }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={index === active ? 0 : -1}
              onClick={() => choose(index)}
              className="flex min-h-tap w-full cursor-pointer items-center justify-between border-0 border-t border-line bg-transparent px-[14px] py-3 text-left text-t14 text-fg first:border-t-0 hover:bg-surface2 active:bg-fg active:text-bg aria-selected:font-semibold"
            >
              {option.label}
              {option.hint && <span className="font-px text-px11 uppercase text-muted">{option.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
