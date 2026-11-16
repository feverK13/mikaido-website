import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PAGE } from '../content'

/** Липка панель якорів під шапкою: підсвічує розділ, який зараз у вікні. На вузькому екрані прокручується вбік. */
export function AnchorBar() {
  const [current, setCurrent] = useState<string>()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setCurrent(hit.target.id)
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    PAGE.anchors.forEach((a) => {
      const el = document.getElementById(a.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label={PAGE.anchorsLabel}
      className="sticky top-[var(--header-h,64px)] z-20 border-b border-line bg-bg"
    >
      <ul className="mx-auto flex w-full max-w-[calc(1200px+128px)] gap-1 overflow-x-auto px-[max(16px,env(safe-area-inset-left,0px))] min-[768px]:px-8 min-[1200px]:px-16">
        {PAGE.anchors.map((anchor) => (
          <li key={anchor.id} className="flex-none">
            <a
              href={`#${anchor.id}`}
              aria-current={current === anchor.id ? 'location' : undefined}
              className={cn(
                'relative block px-3 py-[10px] text-t14 font-medium whitespace-nowrap text-muted no-underline transition-colors duration-fast ease-out-mk hover:text-fg active:text-accent pointer-coarse:py-3',
                "after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-fg after:transition-transform after:duration-base after:ease-[steps(6,end)] after:content-[''] aria-[current=location]:text-fg aria-[current=location]:after:scale-x-100",
              )}
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
