/* Момент появи: блок має зайти у вікно щонайменше на 48 px, і лише тоді стартує анімація (один раз).
   Спільне для розчинення, розшифрування й друку, щоб вони не починались занадто рано.
   Якщо сторінка докручена до кінця й блок у вікні, але глибше за 48 px зайти вже не може (підвал, коротка сторінка), він з'являється теж. */
export const REVEAL_OFFSET = 48

export function onReveal(el: Element, callback: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    callback()
    return () => {}
  }
  let done = false
  const fire = () => {
    if (done) return
    done = true
    cleanup()
    callback()
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) fire()
    },
    { rootMargin: `0px 0px -${REVEAL_OFFSET}px 0px`, threshold: 0 },
  )
  const atEnd = () => {
    const root = document.documentElement
    if (innerHeight + scrollY < root.scrollHeight - 2) return
    const r = el.getBoundingClientRect()
    if (r.bottom > 0 && r.top < innerHeight) fire()
  }
  const raf = requestAnimationFrame(atEnd)
  const cleanup = () => {
    io.disconnect()
    cancelAnimationFrame(raf)
    removeEventListener('scroll', atEnd)
    removeEventListener('resize', atEnd)
  }
  addEventListener('scroll', atEnd, { passive: true })
  addEventListener('resize', atEnd)
  io.observe(el)
  return cleanup
}
