import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/config/site'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  items: NavItem[]
  cta: { label: string; href: string }
}

const linkClass =
  'flex min-h-[52px] items-center justify-between border-t border-line text-t16 text-fg no-underline'

/** Нижня шторка меню (до 860 px) замість випадного списку. Відкривається кроками steps(6) за 240 мс. */
export function MobileMenu({ open, onClose, items, cta }: MobileMenuProps) {
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    sheet.current?.querySelector('a')?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
        aria-label="Меню"
        inert={!open}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[45] grid gap-1 border-t border-fg bg-surface px-[max(16px,env(safe-area-inset-left,0px))] pt-2 pb-[calc(18px+env(safe-area-inset-bottom,0px))] transition-[clip-path] duration-base ease-[steps(6,end)] [clip-path:inset(100%_0_0_0)]',
          open && '[clip-path:inset(0)]',
        )}
      >
        <span className="mt-1 mb-2 h-1 w-9 justify-self-center bg-line2" />
        {items.map((item) => (
          <a key={item.href} href={item.href} className={linkClass} onClick={onClose}>
            {item.label}
            <span aria-hidden="true">→</span>
          </a>
        ))}
        <a href={cta.href} className={linkClass} onClick={onClose}>
          {cta.label}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </>
  )
}
