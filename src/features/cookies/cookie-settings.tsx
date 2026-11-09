import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { COOKIE_TEXT } from './content'

type CookieSettingsProps = {
  open: boolean
  /** Початкове значення перемикача аналітики. */
  analytics: boolean
  onClose: () => void
  onSave: (analytics: boolean) => void
  onAcceptAll: () => void
  /** false: без перехоплення фокуса й Escape (для показу всередині блоку на сторінці перегляду). */
  modal?: boolean
  className?: string
}

const FOCUSABLE = 'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'

/** Вікно налаштувань cookies: категорії з Toggle. Необхідні завжди увімкнені. */
export function CookieSettings({ open, analytics, onClose, onSave, onAcceptAll, modal = true, className }: CookieSettingsProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState(analytics)
  const [wasOpen, setWasOpen] = useState(open)

  /* При відкритті перемикач показує чинний вибір. */
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(analytics)
  }

  useEffect(() => {
    if (!open || !modal) return
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.querySelector<HTMLElement>('[role=switch]:not([disabled])')?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog.current) return
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, modal, onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'pointer-events-none fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--fg)_30%,transparent)] opacity-0 transition-opacity duration-base ease-linear',
          open && 'pointer-events-auto opacity-100',
        )}
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        inert={!open}
        className={cn(
          'pointer-events-none fixed top-1/2 left-1/2 z-[51] grid w-[min(460px,calc(100%-32px))] -translate-x-1/2 -translate-y-[46%] gap-[14px] rounded-r3 border border-line bg-surface p-5 opacity-0 shadow-modal transition-[opacity,transform] duration-base ease-out-mk',
          open && 'pointer-events-auto -translate-y-1/2 opacity-100',
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <h3 id="cookie-settings-title" className="text-t16 font-medium">
            {COOKIE_TEXT.settingsTitle}
          </h3>
          <IconButton icon="close" aria-label={COOKIE_TEXT.close} onClick={onClose} />
        </div>
        <div className="grid grid-cols-[1fr_auto] items-start gap-[14px] border-t border-line py-3">
          <div>
            <b className="block text-t16 font-semibold">{COOKIE_TEXT.necessaryTitle}</b>
            <span className="text-t13 text-muted">{COOKIE_TEXT.necessaryBody}</span>
          </div>
          <Toggle checked disabled aria-label={COOKIE_TEXT.necessaryLabel} />
        </div>
        <div className="grid grid-cols-[1fr_auto] items-start gap-[14px] border-t border-line py-3">
          <div>
            <b className="block text-t16 font-semibold">{COOKIE_TEXT.analyticsTitle}</b>
            <span className="text-t13 text-muted">{COOKIE_TEXT.analyticsBody}</span>
          </div>
          <Toggle checked={draft} onCheckedChange={setDraft} aria-label={COOKIE_TEXT.analyticsLabel} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" onClick={() => onSave(draft)}>
            {COOKIE_TEXT.saveChoice}
          </Button>
          <Button className="flex-1" onClick={onAcceptAll}>
            {COOKIE_TEXT.acceptAll}
          </Button>
        </div>
      </div>
    </>
  )
}
