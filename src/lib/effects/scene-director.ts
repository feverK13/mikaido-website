/* Режисер сцен: двосторонні поява й зникнення блоків при скролі.

   Одиниця анімації: beat (заголовок, ключовий блок). Стани: covered → entering → shown → exiting → covered.
   - Вхід: beat заходить у «живу зону» (48 px від країв вікна) з боку, куди гортають. Старти зсунуті на 80 мс
     (стеля 400 мс) у порядку прибуття в екран. Завершення попередніх не чекаємо.
   - Вихід: коли активною стає інша сцена (секція під центром вікна), видимі beat-и тієї, яку залишили, розчиняються
     назад. Працює в обох напрямках скролу. На телефоні початок виходу затримується на EXIT_DELAY_PX.
   - Тихе скидання: beat цілком поза вікном стає covered без анімації, тож наступний вхід знову анімується.
   - Після різкого стрибка скролу (перехід за якорем, кінець сторінки) і в кінці сторінки виходів немає: усе у вікні видно.
   Геометрію не опитуємо на кожному кадрі: стан беатів і сцен дають IntersectionObserver-и, напрямок береться з різниці scrollY.
   Токени руху (80, 160, 240, 400 мс) із mikaido-theme.css. Без руху (prefers-reduced-motion) режисер не потрібен. */
import { isMotionAllowed } from './motion'

/** На скільки пікселів менше блока має лишатися видно в момент початку виходу (лише телефон, до 860 px). Підбирається вручну. */
export const EXIT_DELAY_PX = 20

declare global {
  interface Window {
    /** Перевизначає EXIT_DELAY_PX (для перевірок). */
    MK_EXIT_DELAY_PX?: number
  }
}

export const LIVE_INSET = 48
const STAGGER = 80
const STAGGER_MAX = 400
const ENTER_LAG = 160
/** Скільки пікселів треба проскролити проти поточного напрямку, щоб напрямок змінився (проти тремтіння трекпада). */
const DIR_HYSTERESIS = 24
/** Зміщення за одну подію скролу більше за цю частку вікна вважається стрибком. */
const JUMP_RATIO = 0.8
/** Скільки мс після стрибка виходів немає. */
const JUMP_SETTLE = 400
const MOBILE = '(max-width: 860px)'

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
  /** Перетинає вікно. */
  onscreen: boolean
  /** Перетинає живу зону. */
  live: boolean
  /** Позиція в документі на момент останнього спрацювання спостерігача (для порядку). */
  docTop: number
  /** Спостерігач відкладеного виходу (телефон). */
  armed?: IntersectionObserver
}

const beats = new Set<Beat>()
const byEl = new WeakMap<Element, Beat>()
const sceneRefs = new Map<Element, number>()
const centered = new Set<Element>()
let scenes: Element[] = []
let scenesDirty = true
let active: Element | null = null
let reportedActive: Element | null = null
let dir: Dir = 1
let lastY = 0
let prevY = 0
let atTop = true
let atEnd = false
let maxScroll = 0
/** До якого моменту (мс) вважаємо, що відбувся стрибок скролу: спостерігачі дають свіжі дані із запізненням на кадр-два. */
let jumpUntil = 0
let dirty = false
let raf = 0
let attached = false
let viewIO: IntersectionObserver | undefined
let liveIO: IntersectionObserver | undefined
let sceneIO: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let themeObserver: MutationObserver | undefined

const sceneOf = (el: Element): Element => el.closest('section, footer') ?? document.body
const exitDelay = () => window.MK_EXIT_DELAY_PX ?? EXIT_DELAY_PX
const hasFocus = (el: Element) => el.matches(':focus-within')

function sortedScenes(): Element[] {
  if (scenesDirty) {
    scenes = [...sceneRefs.keys()].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    scenesDirty = false
  }
  return scenes
}

function markDirty() {
  dirty = true
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    if (dirty) reconcile()
  })
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
  if (!b.onscreen) {
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

function disarm(b: Beat) {
  b.armed?.disconnect()
  b.armed = undefined
}

function reset(b: Beat) {
  clearTimeout(b.timer)
  b.want = null
  disarm(b)
  b.cancel()
  b.cancel = () => {}
  b.cover()
  b.state = 'covered'
}

/** Телефон: вихід починається, коли видимої частини блока лишається на exitDelay() px менше, ніж була на момент зміни сцени. */
function armExit(b: Beat) {
  if (b.armed) return
  const r = b.el.getBoundingClientRect()
  const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)
  const target = visible - exitDelay()
  if (target <= 0 || r.height <= 0) return
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.intersectionRect.height > target + 0.5) return
      disarm(b)
      if (b.state === 'shown' || b.state === 'entering') request(b, 'exit', 0)
    },
    { threshold: [target / r.height] },
  )
  b.armed = io
  io.observe(b.el)
}

function reconcile() {
  dirty = false
  const list = sortedScenes()
  const activeIdx = active ? list.indexOf(active) : -1
  const switched = reportedActive !== active
  reportedActive = active
  const noExit = performance.now() < jumpUntil || atEnd
  const mobile = matchMedia(MOBILE).matches && exitDelay() > 0

  const enters: Beat[] = []
  const exits: Beat[] = []

  for (const b of beats) {
    if (!b.onscreen) {
      if (b.state !== 'covered' || b.want || b.armed) reset(b)
      continue
    }
    const live = atTop || atEnd ? b.onscreen : b.live
    const idx = list.indexOf(b.scene)
    const behind = !noExit && (dir > 0 ? idx < activeIdx : idx > activeIdx)

    if (behind && b.want === 'enter') {
      clearTimeout(b.timer)
      b.want = null
    }
    if (!behind && b.armed) disarm(b)

    /* Вихід: активна сцена змінилась, беати сцен, що лишились позаду за напрямком руху, розчиняються. */
    if (switched && behind && (b.state === 'shown' || b.state === 'entering') && !hasFocus(b.el)) {
      if (mobile) armExit(b)
      else exits.push(b)
      continue
    }

    /* Вхід: дозволено, якщо беат в активній сцені або попереду за напрямком руху. */
    const ahead = !behind && (idx === activeIdx || (dir > 0 ? idx > activeIdx : idx < activeIdx) || noExit)
    if (live && ahead && (b.state === 'covered' || b.state === 'exiting') && b.want !== 'enter') {
      enters.push(b)
    }
  }

  /* Порядок: за появою в екрані. Донизу: зверху вниз; догори: знизу вгору. Вихід іде в порядку відходу. */
  const byArrival = (a: Beat, c: Beat) => (dir > 0 ? a.docTop - c.docTop : c.docTop - a.docTop)
  exits.sort(byArrival)
  enters.sort(byArrival)
  exits.forEach((b, i) => request(b, 'exit', Math.min(i * STAGGER, STAGGER_MAX)))
  const lag = exits.length ? ENTER_LAG : 0
  enters.forEach((b, i) => request(b, 'enter', lag + Math.min(i * STAGGER, STAGGER_MAX)))
}

function onScroll() {
  const y = scrollY
  const d = y - lastY
  if (d * dir > 0) lastY = y
  else if (Math.abs(d) >= DIR_HYSTERESIS) {
    dir = d > 0 ? 1 : -1
    lastY = y
    markDirty()
  }
  if (Math.abs(y - prevY) > innerHeight * JUMP_RATIO) {
    jumpUntil = performance.now() + JUMP_SETTLE
    markDirty()
  }
  prevY = y
  const top = y <= 1
  const end = innerHeight + y >= maxScroll - 2
  if (top !== atTop || end !== atEnd) {
    atTop = top
    atEnd = end
    markDirty()
  }
}

function measure() {
  maxScroll = document.documentElement.scrollHeight
  onScroll()
  markDirty()
}

function pickActive() {
  const list = sortedScenes()
  const hits = list.filter((s) => centered.has(s))
  if (!hits.length) return
  const next = dir > 0 ? hits[hits.length - 1] : hits[0]
  if (next !== active) {
    active = next
    markDirty()
  }
}

function attach() {
  if (attached) return
  attached = true
  lastY = prevY = scrollY

  const track =
    (key: 'onscreen' | 'live') =>
    (entries: IntersectionObserverEntry[]) => {
      for (const e of entries) {
        const b = byEl.get(e.target)
        if (!b) continue
        b[key] = e.isIntersecting
        b.docTop = e.boundingClientRect.top + scrollY
      }
      markDirty()
    }
  viewIO = new IntersectionObserver(track('onscreen'), { threshold: 0 })
  liveIO = new IntersectionObserver(track('live'), { rootMargin: `-${LIVE_INSET}px 0px -${LIVE_INSET}px 0px`, threshold: 0 })
  /* Лінія по центру вікна: секція, що її перетинає, активна. */
  sceneIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) centered.add(e.target)
        else centered.delete(e.target)
      }
      pickActive()
    },
    { rootMargin: '-49% 0px -50% 0px', threshold: 0 },
  )
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', measure)
  /* Зміна висоти сторінки (шрифти, акордеон) зсуває беати без скролу. */
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(document.body)
  themeObserver = new MutationObserver(repaintCovered)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

function detach() {
  if (!attached || beats.size) return
  attached = false
  removeEventListener('scroll', onScroll)
  removeEventListener('resize', measure)
  viewIO?.disconnect()
  liveIO?.disconnect()
  sceneIO?.disconnect()
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  cancelAnimationFrame(raf)
  raf = 0
  centered.clear()
  sceneRefs.clear()
  active = reportedActive = null
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
    onscreen: false,
    live: false,
    docTop: 0,
  }
  beats.add(b)
  byEl.set(handle.el, b)
  handle.cover()
  attach()
  sceneRefs.set(b.scene, (sceneRefs.get(b.scene) ?? 0) + 1)
  if (sceneRefs.get(b.scene) === 1) {
    scenesDirty = true
    sceneIO?.observe(b.scene)
  }
  viewIO?.observe(handle.el)
  liveIO?.observe(handle.el)
  jumpUntil = performance.now() + JUMP_SETTLE
  measure()
  return () => {
    clearTimeout(b.timer)
    disarm(b)
    b.cancel()
    beats.delete(b)
    byEl.delete(handle.el)
    viewIO?.unobserve(handle.el)
    liveIO?.unobserve(handle.el)
    const left = (sceneRefs.get(b.scene) ?? 1) - 1
    if (left <= 0) {
      sceneRefs.delete(b.scene)
      centered.delete(b.scene)
      sceneIO?.unobserve(b.scene)
      scenesDirty = true
    } else sceneRefs.set(b.scene, left)
    detach()
  }
}

/** Перемальовує накриті беати (зміна теми змінює колір фону). */
export function repaintCovered() {
  for (const b of beats) if (b.state === 'covered') b.cover()
}
