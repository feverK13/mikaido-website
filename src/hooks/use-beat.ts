import { useEffect, useRef } from 'react'
import { dissolve, type DissolveHandle } from '@/lib/effects/dissolve'
import { isMotionAllowed } from '@/lib/effects/motion'
import { registerBeat } from '@/lib/effects/scene-director'

/** Тривалість зворотного розчинення при виході (токен 400 мс). */
const EXIT_MS = 400

type BeatOptions = {
  /** Починається поява (розчинення ще йде). first: це перша поява блока. */
  onEnterStart?: (first: boolean) => void
  /** Тривалість розчинення при повторних появах (мс). Без неї як при першій. */
  repeatEnterMs?: number
  /** Поява закінчилась. */
  onEntered?: () => void
}

const pageBg = () => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()

/** Підключає блок із накриттям-канвасом до режисера сцен: поява й зникнення при скролі в обидва боки. */
export function useBeat<T extends HTMLElement = HTMLElement>(options: BeatOptions = {}) {
  const host = useRef<T>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  useEffect(() => {
    const el = host.current
    const cv = canvas.current
    if (!el || !cv) return
    /* Без руху прикривати блок нема чого: він видимий одразу. */
    if (!isMotionAllowed()) {
      cv.hidden = true
      latest.current.onEntered?.()
      return
    }

    let last: DissolveHandle | null = null
    let enters = 0

    const cover = () => {
      last = null
      cv.hidden = false
      cv.width = 4
      cv.height = 4
      const ctx = cv.getContext('2d')
      if (ctx) {
        ctx.fillStyle = pageBg()
        ctx.fillRect(0, 0, 4, 4)
      }
    }

    return registerBeat({
      el,
      cover,
      enter: (from, done) => {
        cv.hidden = false
        const first = enters++ === 0
        latest.current.onEnterStart?.(first)
        const handle = dissolve(cv, {
          dur: first ? undefined : latest.current.repeatEnterMs,
          color: pageBg(),
          from,
          covered: last?.covered() ?? 1,
          done: () => {
            cv.hidden = true
            latest.current.onEntered?.()
            done()
          },
        })
        last = handle
        return handle.cancel
      },
      exit: (from, done) => {
        cv.hidden = false
        const handle = dissolve(cv, {
          dir: -1,
          dur: EXIT_MS,
          color: pageBg(),
          from,
          covered: last?.covered() ?? 0,
          done,
        })
        last = handle
        return handle.cancel
      },
    })
  }, [])
  return { host, canvas }
}
