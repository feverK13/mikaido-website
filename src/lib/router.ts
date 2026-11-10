import { useEffect, useSyncExternalStore } from 'react'

/* Мінімальний роутер на History API: без залежностей. Внутрішні посилання (href починається з «/»)
   не перезавантажують сторінку. Якорі на тій самій сторінці (href починається з «#») лишаються звичайними. */

const EVENT = 'mk:navigate'
let visits = 0

function subscribe(callback: () => void) {
  addEventListener('popstate', callback)
  addEventListener(EVENT, callback)
  return () => {
    removeEventListener('popstate', callback)
    removeEventListener(EVENT, callback)
  }
}

const snapshot = () => `${location.pathname}${location.search}${location.hash}|${visits}`

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}) {
  history[replace ? 'replaceState' : 'pushState'](null, '', to)
  visits++
  dispatchEvent(new Event(EVENT))
}

export function useLocation() {
  const key = useSyncExternalStore(subscribe, snapshot)
  return { pathname: location.pathname, search: location.search, hash: location.hash, key }
}

/** Перехоплює кліки по внутрішніх посиланнях і прокручує до якоря чи на початок після переходу. Викликати один раз у корені. */
export function useRouterEffects() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest('a')
      const href = link?.getAttribute('href')
      if (!link || !href || !href.startsWith('/') || href.startsWith('//') || link.target || link.hasAttribute('download')) return
      event.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (target) target.scrollIntoView()
      else scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
    // key змінюється на кожен перехід, у тому числі на ту саму адресу.
  }, [pathname, hash, key])
}
