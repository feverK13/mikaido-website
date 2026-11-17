import { useEffect, useRef } from 'react'
import { isContainerScroll, scrollPos, scrollTarget } from '@/lib/scroll-root'

/** Тимчасовий dev-оверлей ?debug=viewport: числа вікна, safe-area і шапки. Лише в dev, у збірку не потрапляє. */
export function ViewportDebug() {
  const out = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'
    document.body.appendChild(probe)
    const update = () => {
      const style = getComputedStyle(probe)
      const header = document.querySelector('header')?.getBoundingClientRect()
      const vv = window.visualViewport
      const rows: [string, string | number][] = [
        ['safe-area top', style.paddingTop],
        ['safe-area bottom', style.paddingBottom],
        ['innerHeight', innerHeight],
        ['visualViewport.height', vv ? Math.round(vv.height * 100) / 100 : 'n/a'],
        ['visualViewport.offsetTop', vv ? Math.round(vv.offsetTop * 100) / 100 : 'n/a'],
        ['scrollPos' + (isContainerScroll() ? ' (#root)' : ''), Math.round(scrollPos() * 100) / 100],
        ['header top', header ? Math.round(header.top * 100) / 100 : 'n/a'],
        ['header height', header ? Math.round(header.height * 100) / 100 : 'n/a'],
        ['documentElement.clientHeight', document.documentElement.clientHeight],
      ]
      if (out.current) out.current.textContent = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
    }
    update()
    const scroller = scrollTarget()
    scroller.addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      scroller.removeEventListener('scroll', update)
      removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
      probe.remove()
    }
  }, [])

  return (
    <pre
      ref={out}
      aria-hidden="true"
      className="pointer-events-none fixed right-2 bottom-2 z-[70] m-0 max-w-[90vw] bg-fg p-2 font-mono text-t13 leading-[1.4] text-bg"
    />
  )
}
