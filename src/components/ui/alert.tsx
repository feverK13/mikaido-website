import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { IconName } from './pixel-icon/icons'
import { PixelIcon } from './pixel-icon/pixel-icon'

const alertVariants = cva(
  'grid grid-cols-[24px_1fr_auto] items-start gap-space-3 border border-l-[3px] border-line bg-surface px-4 py-[14px] text-t14',
  {
    variants: {
      tone: {
        info: 'border-l-accent text-accent',
        success: 'border-l-fg text-fg',
        error: 'border-l-spark text-spark',
      },
    },
    defaultVariants: { tone: 'info' },
  },
)

const ICON_BY_TONE: Record<NonNullable<VariantProps<typeof alertVariants>['tone']>, IconName> = {
  info: 'info',
  success: 'check',
  error: 'alert',
}

type AlertProps = VariantProps<typeof alertVariants> & {
  /** Що сталося. */
  title: string
  /** Що робити далі. */
  children?: ReactNode
  onClose?: () => void
  className?: string
}

export function Alert({ tone = 'info', title, children, onClose, className }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn(alertVariants({ tone }), className)}>
      <PixelIcon name={ICON_BY_TONE[tone ?? 'info']} size={24} />
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <b className="block font-semibold">{title}</b>
        {children && <span className="text-muted">{children}</span>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Закрити"
          onClick={onClose}
          className="relative grid size-8 cursor-pointer place-items-center border-0 bg-transparent text-muted before:absolute before:-inset-[6px] before:content-[''] hover:text-fg"
        >
          <PixelIcon name="close" size={24} className="size-3" />
        </button>
      )}
    </div>
  )
}
