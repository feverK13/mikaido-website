import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ConditionsTableProps = {
  head: ReactNode[]
  rows: ReactNode[][]
  /** Індекси колонок із цифрами: tabular-nums і без переносу. */
  numericColumns?: number[]
  /** Перший стовпець закріплений при прокрутці вбік (вузький екран). */
  stickyFirstColumn?: boolean
  /** Індекс стовпця, який підсвічено (наприклад, вибраний пакет). */
  highlightColumn?: number
  /** Назва таблиці: робить прокручувану область доступною з клавіатури (регіон із tabindex). */
  label?: string
  className?: string
}

/** Таблиця умов: заголовки px-11 muted, назви рядків muted, значення fg, рядки розділені line. На телефоні прокручується по горизонталі. */
export function ConditionsTable({ head, rows, numericColumns = [], stickyFirstColumn = false, highlightColumn, label, className }: ConditionsTableProps) {
  return (
    <div
      className={cn('overflow-x-auto border border-line', className)}
      {...(label ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}
    >
      <table className="w-full border-collapse bg-surface text-t14">
        <thead>
          <tr>
            {head.map((title, i) => (
              <th
                key={i}
                className={cn(
                  'border-b border-line px-[14px] py-3 text-left align-top font-px text-px11 font-normal uppercase text-muted',
                  stickyFirstColumn && i === 0 && 'sticky left-0 z-[1] bg-surface',
                  highlightColumn === i && 'bg-surface2 text-fg',
                )}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    'border-b border-line px-[14px] py-3 text-left align-top',
                    c === 0 && 'text-muted',
                    stickyFirstColumn && c === 0 && 'sticky left-0 z-[1] bg-surface',
                    highlightColumn === c && 'bg-surface2',
                    numericColumns.includes(c) && 'whitespace-nowrap tabular-nums',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
