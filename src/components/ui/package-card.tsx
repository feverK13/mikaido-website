import { cn } from '@/lib/utils'
import { Button } from './button'

type PackageCardProps = {
  name: string
  audience: string
  price: string
  rows: [string, string][]
  selected?: boolean
  onSelect?: () => void
  className?: string
}

const cornerOn = 'before:[border-width:0_16px_7px_0]'

/** Картка пакета: назва px-33, ціна h-24, рядки умов, дія. Обрана картка: рамка 2 px fg і скошений кут-прапорець. */
export function PackageCard({ name, audience, price, rows, selected = false, onSelect, className }: PackageCardProps) {
  return (
    <article
      className={cn(
        'relative grid min-w-0 grid-rows-[auto_auto_1fr_auto] border border-line bg-surface transition-colors duration-fast ease-out-mk',
        "before:absolute before:-top-px before:-right-px before:border-0 before:border-solid before:border-transparent before:border-r-fg before:transition-[border-width] before:duration-fast before:ease-[steps(3,end)] before:content-['']",
        'hover:border-fg hover:before:[border-width:0_16px_7px_0]',
        selected && `border-fg shadow-[inset_0_0_0_1px_var(--fg)] ${cornerOn}`,
        className,
      )}
    >
      <div className="grid justify-items-start gap-3 px-5 pt-5 pb-4">
        <h3 className="font-px text-px33 font-normal uppercase leading-none">{name}</h3>
        <p className="text-t13 text-muted">{audience}</p>
      </div>
      <p className="px-5 pb-4 font-display text-h24 font-medium tracking-[-0.02em] whitespace-nowrap tabular-nums">
        {price}
      </p>
      <dl className="border-t border-line px-5 py-1">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-3 border-b border-line py-[9px] text-t13 last:border-b-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-2 px-5 pt-4 pb-5">
        <Button className="w-full" aria-pressed={selected} onClick={onSelect}>
          Обрати
        </Button>
      </div>
    </article>
  )
}

/** Сітка карток: 4 колонки, на планшеті 2, на телефоні 1. */
export function PackageGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid grid-cols-4 gap-3 max-[1060px]:grid-cols-2 max-[560px]:grid-cols-1', className)}
      {...props}
    />
  )
}
