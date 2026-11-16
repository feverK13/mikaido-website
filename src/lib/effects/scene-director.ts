/* Режисер сцен: двосторонні поява й зникнення блоків при скролі.

   Одиниця анімації: beat (заголовок, ключовий блок). Стани: covered → entering → shown → exiting → covered.
   - Вхід: beat заходить у «живу зону» (48 px від країв вікна) з боку, куди гортають. Старти зсунуті на 80 мс
     (стеля 400 мс) у порядку прибуття в екран. Завершення попередніх не чекаємо.
   - Вихід: коли активною стає інша сцена (секція під центром вікна), видимі beat-и тієї, яку залишили, розчиняються
     назад. Працює в обох напрямках скролу.
   - Тихе скидання: beat цілком поза вікном стає covered без анімації, тож наступний вхід знову анімується.
   Усі токени руху (80, 160, 240, 400 мс) із mikaido-theme.css. Без руху (prefers-reduced-motion) режисер не потрібен. */
import { isMotionAllowed } from './motion'

export const LIVE_INSET = 48
const STAGGER = 80
const STAGGER_MAX = 400
const ENTER_LAG = 160
/** Скільки пікселів треба проскролити проти поточного напрямку, щоб напрямок змінився (проти тремтіння трекпада). */
const DIR_HYSTERESIS = 24

export type BeatState = 'covered' | 'entering' | 'shown' | 'exiting'
export type Dir = 1 | -1

export type BeatHandle = {
  el: HTMLElement
  /** Анімація. from: край, від якого тягнеться розчинення. Має повернути функцію скасування. */
  enter: (from: 'top' | 'bottom', done: () => void) => () => void
  exit: (from: 'top' | 'bottom', done: () => void) => () => void
  /** Миттєво накрити (стан covered) без анімації. */
  cover: () => void
}

type Beat = BeatHandle & {
  state: BeatState
  want: 'enter' | 'exit' | null
  timer: number
  cancel: () => void
  scene: Element
  /** Геометрія поточного кадру. */
  top: number
  bottom: number
}

const beats = new Set<Beat>()
let scenes: Element[] = []
let scenesDirty = true
let active: Element | null = null
let dir: Dir = 1
let lastY = 0
let raf = 0
let attached = false
let resizeObserver: ResizeObserver | undefined
let themeObserver: MutationObserver | undefined

const sceneOf = (el: Element): Element => el.closest('section, footer') ?? document.body

function sortedScenes(): Element[] {
  if (scenesDirty) {
    scenes = [...new Set([...beats].map((b) => b.scene))].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    scenesDirty = false
  }
  return scenes
}

function activeScene(list: Element[], vh: number): Element | null {
  const mid = vh / 2
  for (const s of list) {
    const r = s.getBoundingClientRect()
    if (r.top <= mid && r.bottom > mid) return s
  }
  return active
}

function schedule() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    tick()
  })
}

function setDir(y: number) {
  const d = y - lastY
  if (d * dir > 0) lastY = y
  else if (Math.abs(d) >= DIR_HYSTERESIS) {
    dir = d > 0 ? 1 : -1
    lastY = y
  }
}

function request(b: Beat, kind: 'enter' | 'exit', delay: number) {
  if (b.want === kind) return
  clearTimeout(b.timer)
  b.want = kind
  b.timer = window.setTimeout(() => {
    if (b.want !== kind) return
    b.want = null
    run(b, kind)
  }, delay)
}

function run(b: Beat, kind: 'enter' | 'exit') {
  /* Беат міг піти з екрана, поки чекав своєї черги: тоді анімація вже нікому не потрібна. */
  const r = b.el.getBoundingClientRect()
  if (r.bottom <= 0 || r.top >= innerHeight) {
    reset(b)
    return
  }
  b.cancel()
  const edge = kind === 'enter' ? (dir > 0 ? 'bottom' : 'top') : dir > 0 ? 'top' : 'bottom'
  if (kind === 'enter') {
    b.state = 'entering'
    b.cancel = b.enter(edge, () => {
      b.state = 'shown'
      b.cancel = () => {}
    })
  } else {
    b.state = 'exiting'
    b.cancel = b.exit(edge, () => {
      b.state = 'covered'
      b.cancel = () => {}
    })
  }
}

function reset(b: Beat) {
  clearTimeout(b.timer)
  b.want = null
  b.cancel()
  b.cancel = () => {}
  b.cover()
  b.state = 'covered'
}

function tick() {
  const vh = innerHeight
  const y = scrollY
  setDir(y)
  const atTop = y <= 1
  const atEnd = vh + y >= document.documentElement.scrollHeight - 2
  const insetTop = atTop ? 0 : LIVE_INSET
  const insetBottom = atEnd ? 0 : LIVE_INSET

  const list = sortedScenes()
  const next = activeScene(list, vh)
  const prev = active
  active = next
  const activeIdx = next ? list.indexOf(next) : -1

  const enters: Beat[] = []
  const exits: Beat[] = []

  for (const b of beats) {
    const r = b.el.getBoundingClientRect()
    b.top = r.top
    b.bottom = r.bottom
    const offscreen = r.bottom <= 0 || r.top >= vh
    if (offscreen) {
      if (b.state !== 'covered' || b.want) reset(b)
      continue
    }
    const live = r.top < vh - insetBottom && r.bottom > insetTop
    const idx = list.indexOf(b.scene)

    /* Вихід: активна сцена змінилась, беати сцен, що лишились позаду за напрямком руху, розчиняються. */
    const behind = dir > 0 ? idx < activeIdx : idx > activeIdx
    if (behind && b.want === 'enter') {
      clearTimeout(b.timer)
      b.want = null
    }
    if (prev !== next && behind && (b.state === 'shown' || b.state === 'entering') && !hasFocus(b.el)) {
      exits.push(b)
      continue
    }

    /* Вхід: дозволено, якщо беат в активній сцені або попереду за напрямком руху. */
    const ahead = idx === activeIdx || (dir > 0 ? idx > activeIdx : idx < activeIdx)
    if (live && ahead && (b.state === 'covered' || b.state === 'exiting') && b.want !== 'enter') {
      enters.push(b)
    }
  }

  /* Порядок: за появою в екрані. Донизу: зверху вниз; догори: знизу вгору. Вихід іде в порядку відходу. */
  const byArrival = (a: Beat, c: Beat) => (dir > 0 ? a.top - c.top : c.bottom - a.bottom)
  exits.sort(byArrival)
  enters.sort(byArrival)
  exits.forEach((b, i) => request(b, 'exit', Math.min(i * STAGGER, STAGGER_MAX)))
  const lag = exits.length ? ENTER_LAG : 0
  enters.forEach((b, i) => request(b, 'enter', lag + Math.min(i * STAGGER, STAGGER_MAX)))
}

const hasFocus = (el: Element) => el.matches(':focus-within')

function onScroll() {
  schedule()
}

function attach() {
  if (attached) return
  attached = true
  lastY = scrollY
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  /* Зміна висоти сторінки (шрифти, акордеон) зсуває беати без скролу. */
  resizeObserver = new ResizeObserver(onScroll)
  resizeObserver.observe(document.body)
  themeObserver = new MutationObserver(repaintCovered)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

function detach() {
  if (!attached || beats.size) return
  attached = false
  removeEventListener('scroll', onScroll)
  removeEventListener('resize', onScroll)
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  cancelAnimationFrame(raf)
  raf = 0
  active = null
}

/** Реєструє беат. Повертає функцію зняття з реєстрації. Без руху нічого не робить. */
export function registerBeat(handle: BeatHandle): () => void {
  if (!isMotionAllowed()) return () => {}
  const b: Beat = {
    ...handle,
    state: 'covered',
    want: null,
    timer: 0,
    cancel: () => {},
    scene: sceneOf(handle.el),
    top: 0,
    bottom: 0,
  }
  beats.add(b)
  scenesDirty = true
  handle.cover()
  attach()
  schedule()
  return () => {
    clearTimeout(b.timer)
    b.cancel()
    beats.delete(b)
    scenesDirty = true
    detach()
  }
}

/** Перемальовує накриті беати (зміна теми змінює колір фону). */
export function repaintCovered() {
  for (const b of beats) if (b.state === 'covered') b.cover()
}
