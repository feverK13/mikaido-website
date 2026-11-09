import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PixelIcon } from './pixel-icon/pixel-icon'

export type AccordionItem = { id: string; question: ReactNode; answer: ReactNode }

type AccordionProps = {
  items: AccordionItem[]
  className?: string
}

function AccordionRow({ item }: { item: AccordionItem }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 border-b border-line bg-transparent py-[18px] text-left font-display text-t16 font-medium text-fg active:text-accent"
      >
        <span>{item.question}</span>
        <PixelIcon name={open ? 'minus' : 'plus'} size={24} className="flex-none" />
      </button>
      <div
        id={panelId}
        role="region"
        inert={!open}
        className={cn(
          'grid grid-rows-[0fr] transition-[grid-template-rows] duration-base ease-[steps(6,end)]',
          open && 'grid-rows-[1fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-[62ch] pt-[14px] pb-5 text-t16 text-muted">{item.answer}</p>
        </div>
      </div>
    </>
  )
}

/** Акордеон: питання display t16, відповідь t16 muted до 62 знаків, розкриття кроками steps(6) за 240 мс, іконка плюс і мінус. */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('border-t border-fg', className)}>
      {items.map((item) => (
        <AccordionRow key={item.id} item={item} />
      ))}
    </div>
  )
}
