import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const root = () => document.documentElement

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(root(), { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const getSnapshot = (): Theme => (root().dataset.theme === 'dark' ? 'dark' : root().dataset.theme === 'light' ? 'light' : systemTheme())

/** Задає data-theme на html з налаштувань системи, якщо тему ще не вибрано. Викликати до першого рендеру. */
export function initTheme() {
  root().dataset.theme ??= systemTheme()
}

/** Тема береться з налаштувань системи, перемикач у шапці змінює її вручну. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot)
  const toggleTheme = useCallback(() => {
    root().dataset.theme = getSnapshot() === 'dark' ? 'light' : 'dark'
  }, [])
  return { theme, toggleTheme }
}
