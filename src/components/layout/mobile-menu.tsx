import { BottomSheet } from '@/components/ui/bottom-sheet'
import type { NavItem } from '@/config/site'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  items: NavItem[]
  cta: { label: string; href: string }
}

const linkClass =
  'flex min-h-[52px] items-center justify-between border-t border-line text-t16 text-fg no-underline'

/** Нижня шторка меню (до 860 px) замість випадного списку. Оболонка спільна зі шторкою «Деталі». */
export function MobileMenu({ open, onClose, items, cta }: MobileMenuProps) {
  return (
    <BottomSheet open={open} onClose={onClose} label="Меню">
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
    </BottomSheet>
  )
}
