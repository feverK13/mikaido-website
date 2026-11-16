import { useCallback, useEffect, useRef, type PointerEvent } from 'react'

/** Зсув більше за цю частку висоти шторки закриває її. */
const CLOSE_RATIO = 0.25
/** Швидкість вниз (px/мс), за якої шторка закривається незалежно від зсуву. */
const CLOSE_VELOCITY = 0.4
/** Повернення на місце: 160 мс, easing-токен. */
const RETURN_MS = 160
/** Закриття кроками steps(6) за 240 мс (клас шторки); після нього зсув скидається. */
const CLOSE_MS = 240
/** Вікно, за яке рахується швидкість відпускання. */
const VELOCITY_WINDOW_MS = 100

type Drag = { id: number; startY: number; height: number; samples: { t: number; y: number }[] }

type Options = {
  open: boolean
  onClose: () => void
}

/** Закриття нижньої шторки жестом: pointer events, без залежностей. Тягнення вниз за ручку рухає шторку 1:1.
    Після відпускання: зсув понад 25% висоти або швидкість понад 0,4 px/мс закриває шторку тим самим кроковим переходом,
    що й відкриття; інакше вона повертається на місце за 160 мс без пружини. Рух вгору не тягне шторку.
    Повертає ref шторки й обробники для зони захоплення (на ній потрібен touch-action: none). */
export function useSheetDrag({ open, onClose }: Options) {
  const sheet = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const timer = useRef(0)

  /* Відкриття скидає залишок зсуву від попереднього закриття жестом. */
  useEffect(() => {
    if (!open) return
    clearTimeout(timer.current)
    const el = sheet.current
    if (el) {
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [open])

  useEffect(() => () => clearTimeout(timer.current), [])

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    const el = sheet.current
    if (!el || (event.pointerType === 'mouse' && event.button !== 0)) return
    clearTimeout(timer.current)
    event.currentTarget.setPointerCapture(event.pointerId)
    el.style.transition = 'none'
    drag.current = {
      id: event.pointerId,
      startY: event.clientY,
      height: el.offsetHeight,
      samples: [{ t: event.timeStamp, y: event.clientY }],
    }
  }, [])

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const d = drag.current
    const el = sheet.current
    if (!d || !el || event.pointerId !== d.id) return
    el.style.transform = `translateY(${Math.max(0, event.clientY - d.startY)}px)`
    d.samples.push({ t: event.timeStamp, y: event.clientY })
    if (d.samples.length > 12) d.samples.shift()
  }, [])

  const finish = useCallback(
    (event: PointerEvent<HTMLElement>, cancelled: boolean) => {
      const d = drag.current
      const el = sheet.current
      if (!d || !el || event.pointerId !== d.id) return
      drag.current = null
      const offset = Math.max(0, event.clientY - d.startY)
      const recent = d.samples.find((s) => event.timeStamp - s.t <= VELOCITY_WINDOW_MS) ?? d.samples[0]
      const dt = event.timeStamp - recent.t
      const velocity = dt > 0 ? (event.clientY - recent.y) / dt : 0
      if (!cancelled && (offset > d.height * CLOSE_RATIO || velocity > CLOSE_VELOCITY)) {
        el.style.transition = ''
        onClose()
        timer.current = window.setTimeout(() => {
          el.style.transform = ''
        }, CLOSE_MS + 20)
        return
      }
      el.style.transition = `transform ${RETURN_MS}ms var(--ease-out-mk)`
      el.style.transform = ''
      timer.current = window.setTimeout(() => {
        el.style.transition = ''
      }, RETURN_MS + 20)
    },
    [onClose],
  )

  const gripProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, true),
  }

  return { sheet, gripProps }
}
