import { useState } from 'react'
import { ButtonLink } from '@/components/ui/button-link'
import { IconButton } from '@/components/ui/icon-button'
import { CTA, NAV_ITEMS } from '@/config/site'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'
import { BrandLink } from './brand-link'
import { Container } from './container'
import { MobileMenu } from './mobile-menu'

const navLinkClass =
  "relative px-3 py-[10px] text-t14 font-medium text-muted no-underline transition-colors duration-fast ease-out-mk hover:text-fg active:text-accent after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-fg after:transition-transform after:duration-base after:ease-[steps(6,end)] after:content-[''] aria-[current=page]:text-fg aria-[current=page]:after:scale-x-100"

const iconButtonClass = 'aspect-square size-auto min-w-9 pointer-coarse:min-w-tap [&_svg]:size-5'

type HeaderProps = {
  /** Href активного пункту: отримує aria-current="page". */
  current?: string
  className?: string
}

/** Липка шапка: знак, навігація (до 5 пунктів), перемикач теми, кнопка A. До 860 px навігація ховається в шторку. */
export function Header({ current, className }: HeaderProps) {
  const { toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-[8px]',
          className,
        )}
      >
        <Container className="flex items-center justify-between gap-4 border-b border-fg py-[14px]">
          <BrandLink href="#top" />
          <nav aria-label="Головна навігація" className="flex gap-1 max-[860px]:hidden">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.href === current ? 'page' : undefined}
                className={navLinkClass}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-stretch gap-2">
            <IconButton icon="theme" aria-label="Змінити тему" className={iconButtonClass} onClick={toggleTheme} />
            <IconButton
              icon="menu"
              aria-label="Меню"
              aria-expanded={menuOpen}
              className={cn(iconButtonClass, 'hidden max-[860px]:grid')}
              onClick={() => setMenuOpen(true)}
            />
            <ButtonLink variant="primary" size="sm" href={CTA.href} className="max-[860px]:hidden">
              {CTA.label}
            </ButtonLink>
          </div>
        </Container>
      </header>
      {/* Шторка поза header: backdrop-filter створює контейнер для position: fixed. */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV_ITEMS}
        cta={{ label: CTA.menuLabel, href: CTA.href }}
      />
    </>
  )
}
