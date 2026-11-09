import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ConditionsTableProps = {
  head: string[]
  rows: ReactNode[][]
  /** Індекси колонок із цифрами: tabular-nums і без переносу. */
  numericColumns?: number[]
  className?: string
}

/** Таблиця умов: заголовки px-11 muted, назви рядків muted, значення fg, рядки розділені line. На телефоні прокручується по горизонталі. */
export function ConditionsTable({ head, rows, numericColumns = [], className }: ConditionsTableProps) {
  return (
    <div className={cn('overflow-x-auto border border-line', className)}>
      <table className="w-full border-collapse bg-surface text-t14">
        <thead>
          <tr>
            {head.map((title) => (
              <th
                key={title}
                className="border-b border-line px-[14px] py-3 text-left align-top font-px text-px11 font-normal uppercase text-muted"
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
