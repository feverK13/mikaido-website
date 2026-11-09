import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Container } from './container'

type SectionProps = HTMLAttributes<HTMLElement> & {
  id: string
  /** Перший екран: інші відступи й без верхньої межі. */
  hero?: boolean
}

/** Секція сторінки: відступи 64-128 px, межа між секціями, прив'язка для якірних посилань під липку шапку. */
export function Section({ id, hero = false, className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-[88px]',
        hero
          ? 'pt-[clamp(48px,7vw,96px)] pb-[clamp(48px,6vw,80px)]'
          : 'border-t border-line py-[clamp(64px,9vw,128px)] first:border-t-0',
        className,
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  )
}

type SectionHeaderProps = {
  tab: string
  title: string
  lead?: ReactNode
}

/** Заголовок секції: мітка /NN, заголовок 30 px (24 px на телефоні), вступ 18 px. */
export function SectionHeader({ tab, title, lead }: SectionHeaderProps) {
  return (
    <div className="mb-[clamp(28px,4vw,48px)] grid grid-cols-12 gap-x-5 gap-y-[14px]">
      <div className="col-span-full flex items-center gap-[14px]">
        <span className="bg-fg py-[6px] pr-4 pl-[10px] font-px text-px11 uppercase text-bg [clip-path:polygon(0_0,calc(100%-10px)_0,100%_4px,100%_100%,0_100%)]">
          {tab}
        </span>
      </div>
      <h2 className="col-span-full font-display text-h30 leading-[1.04] text-balance font-semibold tracking-[-0.03em] max-md:text-h24 md:col-span-8">
        {title}
      </h2>
      {lead && <p className="col-span-full text-t18 text-muted md:col-span-7">{lead}</p>}
    </div>
  )
}
