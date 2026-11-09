import { Button } from '@/components/ui/button'
import { PixelIcon } from '@/components/ui/pixel-icon/pixel-icon'
import { cn } from '@/lib/utils'
import { COOKIE_TEXT } from './content'

type CookieBannerProps = {
  /** Чи показано плашку. Відкривається шторкою steps(6) за 240 мс, зникає миттєво. */
  open: boolean
  onAcceptAll: () => void
  onNecessaryOnly: () => void
  onOpenSettings: () => void
  className?: string
}

/** Плашка cookies знизу екрана. Кнопки рівні за виглядом, кнопки A тут немає: вона підштовхувала б до згоди. */
export function CookieBanner({ open, onAcceptAll, onNecessaryOnly, onOpenSettings, className }: CookieBannerProps) {
  return (
    <div
      role="dialog"
      aria-label="Cookies"
      aria-describedby="cookie-banner-text"
      inert={!open}
      className={cn(
        'fixed right-4 bottom-4 left-4 z-40 grid max-w-[560px] gap-3 border border-fg bg-surface px-[18px] pt-[18px] pb-4 [clip-path:inset(100%_0_0_0)]',
        'max-[560px]:right-0 max-[560px]:bottom-0 max-[560px]:left-0 max-[560px]:max-w-none max-[560px]:border-x-0 max-[560px]:border-b-0',
        open ? 'transition-[clip-path] duration-base ease-[steps(6,end)] [clip-path:inset(-2px)]' : 'transition-none',
        className,
      )}
    >
      <div className="flex items-center gap-[10px]">
        <PixelIcon name="info" size={24} />
        <h3 className="text-t16 font-medium">{COOKIE_TEXT.bannerTitle}</h3>
      </div>
      <p id="cookie-banner-text" className="text-t14 text-muted">
        {COOKIE_TEXT.bannerBody}{' '}
        <a href={COOKIE_TEXT.privacyHref} className="text-fg">
          {COOKIE_TEXT.privacyLabel}
        </a>
      </p>
      <div className="grid grid-cols-2 gap-2 max-[560px]:grid-cols-1">
        <Button onClick={onAcceptAll}>{COOKIE_TEXT.acceptAll}</Button>
        <Button onClick={onNecessaryOnly}>{COOKIE_TEXT.necessaryOnly}</Button>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        className="cursor-pointer justify-self-start border-0 bg-transparent px-0 py-1 text-t14 font-medium text-fg underline decoration-1 underline-offset-[3px] active:text-accent pointer-coarse:min-h-tap"
      >
        {COOKIE_TEXT.settings}
      </button>
    </div>
  )
}
