import { useEffect, useRef } from 'react'
import { FOOTER_COLUMNS, LEGAL, SLOGAN } from '@/config/site'
import { useTheme } from '@/hooks/use-theme'
import { dither } from '@/lib/effects/dither'
import { cn } from '@/lib/utils'
import { BrandLink } from './brand-link'

const linkClass = 'block py-[3px] text-t14 text-fg no-underline pointer-coarse:pt-3 pointer-coarse:pb-[11px]'

type FooterProps = {
  /** Відкриває вікно налаштувань cookies (те саме, що плашка). */
  onOpenCookieSettings?: () => void
  className?: string
}

/** Підвал: піксельна смужка ірису згори (dither), знак, три колонки посилань, нижній рядок. Без анімацій появи. */
export function Footer({ onOpenCookieSettings, className }: FooterProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const paint = () => canvas.current && dither(canvas.current, { dark: theme === 'dark' })
    paint()
    addEventListener('resize', paint)
    return () => removeEventListener('resize', paint)
  }, [theme])

  return (
    <footer className={cn('grid gap-6 border-t border-fg bg-bg px-6 pt-7 pb-[18px]', className)}>
      <canvas ref={canvas} aria-hidden="true" className="block h-[6px] w-full [image-rendering:pixelated]" />
      <div className="grid grid-cols-2 gap-6 min-[761px]:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <BrandLink href="/" />
          <p className="mt-3 text-t13 text-muted">{SLOGAN}</p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <span className="mb-[10px] block font-px text-px11 uppercase text-muted">{column.title}</span>
            {column.links.map((link) => (
              <a key={link.label} href={link.href} className={cn(linkClass, link.placeholder && 'text-spark')}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-[14px] text-t13 text-muted">
        <span>{LEGAL.copyright}</span>
        <span className="flex flex-wrap gap-x-2">
          <a href={LEGAL.privacyHref} className="text-fg no-underline pointer-coarse:inline-flex pointer-coarse:min-h-tap pointer-coarse:items-center">
            {LEGAL.privacyLabel}
          </a>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="cursor-pointer border-0 bg-transparent p-0 text-t13 text-fg pointer-coarse:min-h-tap"
          >
            {LEGAL.cookiesLabel}
          </button>
        </span>
      </div>
    </footer>
  )
}
