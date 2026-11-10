import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  /** Назва вікна для читачів екрана. */
  label: string
  className?: string
  children: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Нижня шторка (до 860 px). Відкривається кроками steps(6) за 240 мс. Фокус-пастка, Escape й тап по фону закривають, фокус повертається на елемент, що її відкрив, прокрутка сторінки заблокована, поки шторка відкрита. */
export function BottomSheet({ open, onClose, label, className, children }: BottomSheetProps) {
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const items = () => [...(sheet.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    items()[0]?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const list = items()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!sheet.current?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    /* Прокрутка повертається при закритті, розмонтуванні й коли вікно ширшим за 860 px (там шторки немає). */
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const wide = matchMedia('(min-width: 861px)')
    const onWide = () => wide.matches && onClose()
    wide.addEventListener('change', onWide)

    return () => {
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
      document.body.style.overflow = previous
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open, onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'pointer-events-none fixed inset-0 z-[44] bg-[color-mix(in_srgb,var(--fg)_30%,transparent)] opacity-0 transition-opacity duration-base ease-linear',
          open && 'pointer-events-auto opacity-100',
        )}
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        inert={!open}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[45] grid gap-1 border-t border-fg bg-surface px-[max(16px,env(safe-area-inset-left,0px))] pt-2 pb-[calc(18px+env(safe-area-inset-bottom,0px))] transition-[clip-path] duration-base ease-[steps(6,end)] [clip-path:inset(100%_0_0_0)]',
          open && '[clip-path:inset(0)]',
          className,
        )}
      >
        <span aria-hidden="true" className="mt-1 mb-2 h-1 w-9 justify-self-center bg-line2" />
        {children}
      </div>
    </>
  )
}
