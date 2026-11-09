/* Етапи процесу. Тексти з docs/reference/mikaido-home.html (до 50 знаків для друку термінала). */

export type ProcessStep = { title: string; description: string }

export const PROCESS_STEPS: ProcessStep[] = [
  { title: 'Розмова', description: '30 хвилин, безкоштовно. Чесно скажемо, що підійде' },
  { title: 'Пропозиція', description: 'Одна сума й конкретні дати, діє 14 днів' },
  { title: 'Тестова версія', description: 'З першого тижня: бачите й перевіряєте до запуску' },
  { title: 'Запуск', description: 'Домен і хостинг на Вас, гарантія 60 днів' },
  { title: 'Підтримка', description: 'Пульс у подарунок, далі за бажанням' },
]
