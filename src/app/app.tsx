import { lazy, Suspense } from 'react'
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
        <main className="mx-auto max-w-[1200px] px-space-4 py-space-7">
          <h1 className="font-display text-h48 max-md:text-h30">Mikaido</h1>
          <p className="mt-space-4 font-px text-px11 uppercase text-spark">[заповнити]</p>
        </main>
      )}
    </AppProvider>
  )
}
