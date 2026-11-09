import { lazy, Suspense } from 'react'
import { HomePage } from '@/features/home/home-page'
import { AppProvider } from './provider'

/* Сторінка перегляду компонентів: лише в dev, у production-збірку не потрапляє. */
const Preview = import.meta.env.DEV
  ? lazy(() => import('@/features/preview/preview').then((m) => ({ default: m.Preview })))
  : null

const isPreviewRoute = () => window.location.pathname === '/__preview'

export function App() {
  return (
    <AppProvider>
      {Preview && isPreviewRoute() ? (
        <Suspense fallback={null}>
          <Preview />
        </Suspense>
      ) : (
        <HomePage />
      )}
    </AppProvider>
  )
}
