import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CaseMetric = { value: ReactNode; label: ReactNode }

type CaseCardProps = {
  /** Адреса в рамці браузера. */
  url: ReactNode
  /** Справжній скріншот роботи, 2×. Поки його немає, показується заглушка зі штрихуванням. */
  screenshot?: { src: string; alt: string }
  title: ReactNode
  tags?: ReactNode[]
  metrics?: CaseMetric[]
  className?: string
}

/** Картка кейсу: рамка браузера, скріншот 16:9, опис, заміри. Назву, задачу, заміри й відгук публікуємо лише з письмової згоди власника. */
export function CaseCard({ url, screenshot, title, tags = [], metrics = [], className }: CaseCardProps) {
  return (
    <article className={cn('grid grid-cols-[minmax(0,1fr)] border border-fg bg-surface', className)}>
      <div className="flex items-center gap-3 border-b border-fg px-3 py-[10px]">
        <span aria-hidden="true" className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <i key={i} className="size-[9px] border border-fg" />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate border border-line px-[10px] py-[6px] font-px text-px11 uppercase text-muted">
          {url}
        </span>
      </div>
      {screenshot ? (
        <img src={screenshot.src} alt={screenshot.alt} className="aspect-video w-full object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="grid aspect-video place-items-center bg-[repeating-linear-gradient(135deg,var(--surface2)_0_10px,var(--surface)_10px_20px)]"
        >
          <span className="border border-dashed border-line2 bg-surface px-[10px] py-[6px] font-px text-px11 uppercase text-muted">
            Скріншот
          </span>
        </div>
      )}
      <div className="grid gap-[10px] border-t border-fg p-4">
        <b className="font-display text-t18 font-medium">{title}</b>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-[6px]">
            {tags.map((tag, i) => (
              <li key={i} className="border border-line2 px-[7px] py-1 font-px text-px11 uppercase">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {metrics.length > 0 && (
        <dl className="grid grid-cols-3 border-t border-line max-[480px]:grid-cols-1">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="grid gap-1 border-l border-line px-4 py-3 first:border-l-0 max-[480px]:border-t max-[480px]:border-l-0 max-[480px]:first:border-t-0"
            >
              <dd className="order-first font-display text-t18 font-medium">{metric.value}</dd>
              <dt className="text-t13 text-muted">{metric.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}
