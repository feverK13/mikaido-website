import { useEffect } from 'react'

type PageMeta = {
  title: string
  /** Опис для meta description. Поки тексту немає, лишається [заповнити]. */
  description?: string
  /** true: сторінка не для пошуку (Дякуємо, 404). */
  noindex?: boolean
}

function setMeta(name: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (content === null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

/** Назва, опис і robots сторінки. */
export function usePageMeta({ title, description = '[заповнити]', noindex = false }: PageMeta) {
  useEffect(() => {
    document.title = title
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex, nofollow' : null)
  }, [title, description, noindex])
}
