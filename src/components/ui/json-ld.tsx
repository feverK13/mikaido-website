import { useEffect } from 'react'

/** Додає в head структуровані дані JSON-LD і прибирає їх при виході зі сторінки. Дані лише наші, не користувача. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data).replace(/</g, '\u003c')
    document.head.appendChild(script)
    return () => script.remove()
  }, [data])
  return null
}
