/* Що прокручується на сторінці. Зазвичай документ. У вбудованому браузері Telegram на iPhone (html[data-iab="telegram"])
   вікно сторінки не обрізає вміст над собою, тож прокручений вгору текст видно за верхньою смугою браузера, і сторінка
   цього не може закрити. Тому там документ не прокручується, а прокручується контейнер #root (див. index.css).
   Усе, що читає позицію скролу, слухає скрол, блокує прокрутку чи прокручує сторінку, йде через цей модуль. */

export const isContainerScroll = () => document.documentElement.dataset.iab === 'telegram'

/** Елемент, що прокручується: документ або контейнер #root. */
export const scrollRoot = (): HTMLElement =>
  (isContainerScroll() && document.getElementById('root')) || document.documentElement

/** Ціль подій scroll. */
export const scrollTarget = (): Window | HTMLElement => (isContainerScroll() ? scrollRoot() : window)

/** Поточна позиція прокрутки, px. */
export const scrollPos = (): number => (isContainerScroll() ? scrollRoot().scrollTop : window.scrollY)

/** Повна висота прокручуваного вмісту, px. */
export const scrollTotal = (): number => scrollRoot().scrollHeight

/** Прокручує на початок. */
export function scrollToTop() {
  if (isContainerScroll()) scrollRoot().scrollTo(0, 0)
  else window.scrollTo(0, 0)
}

/** Блокує прокрутку сторінки (шторки, вікна). Повертає функцію, що знімає блокування. */
export function lockScroll(): () => void {
  const els = isContainerScroll() ? [document.body, scrollRoot()] : [document.body]
  const previous = els.map((el) => el.style.overflow)
  els.forEach((el) => (el.style.overflow = 'hidden'))
  return () => els.forEach((el, i) => (el.style.overflow = previous[i]))
}
