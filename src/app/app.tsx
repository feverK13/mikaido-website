import { AppProvider } from './provider'

export function App() {
  return (
    <AppProvider>
      <main className="mx-auto max-w-[1200px] px-space-4 py-space-7">
        <h1 className="font-display text-h48 max-md:text-h30">Mikaido</h1>
        <p className="mt-space-4 font-px text-px11 uppercase text-spark">[заповнити]</p>
      </main>
    </AppProvider>
  )
}
