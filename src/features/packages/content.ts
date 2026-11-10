/* Тексти сторінки «Пакети й умови»: заголовки, мітки й пояснення.
   Ціни, пакети, підтримка, питання, переваги, доповнення й «що входить» беремо з src/content/packages.ts.
   Невідоме лишається як [заповнити] і малюється кольором spark. */

export const PAGE = {
  title: 'Пакети й умови',
  metaTitle: 'Пакети й умови | Mikaido',
  lead: 'Усі умови відомі до підпису',
  anchorsLabel: 'Розділи сторінки',
  anchors: [
    { id: 'pakety', label: 'Пакети' },
    { id: 'vkhodyt', label: 'Що входить' },
    { id: 'dopovnennia', label: 'Доповнення' },
    { id: 'stroky', label: 'Строки й правки' },
    { id: 'oplata', label: 'Оплата' },
    { id: 'harantiya', label: 'Гарантія й права' },
    { id: 'pidtrymka', label: 'Підтримка' },
    { id: 'pytannya', label: 'Питання' },
  ],
}

export const PACKAGES_BLOCK = {
  tab: '/01 Пакети',
  title: 'Чотири пакети',
  choose: 'Обрати',
  chooseHref: (id: string) => `/?pkg=${id}#rozmova`,
  tableTitle: 'Порівняння пакетів',
  tableCorner: 'Показник',
  labels: {
    price: 'Ціна',
    audience: 'Для кого',
    scope: 'Обсяг',
    key: 'Ключове',
    term: 'Строк',
    revisions: 'Правки',
    pulse: 'Пульс у подарунок',
    payment: 'Оплата',
  },
}

export const INCLUDED_BLOCK = {
  tab: '/02 Що входить і що ні',
  title: 'Що входить і що ні',
  included: 'У кожному пакеті',
  paid: 'За доплату',
  notDone: 'Не робимо',
}

export const ADDONS_BLOCK = {
  tab: '/03 Доповнення',
  title: 'Доповнення до пакета',
  note: 'Доповнення підбираємо після розмови й погоджуємо в пропозиції. Ви самі вирішуєте, що залишити, прибрати чи додати.',
  factorsLabel: 'Що впливає на вартість',
  factors: '[заповнити]',
}

export const TERMS_BLOCK = {
  tab: '/04 Строки й правки',
  title: 'Строки й правки',
  termLabel: 'Строк',
  revisionsLabel: 'Правки',
  revisionsFormat: '2 + 1',
  revisionsMeaning: 'Перша цифра: правки до макета. Друга: правки на тестовій версії.',
  notes: [
    'Строки рахуються від дня, коли ми отримали матеріали й аванс.',
    "Щоп'ятниці коротке оновлення: що зроблено, що далі і що потрібно від Вас. Разом із журналом проєкту у PDF.",
  ],
}

export const PAYMENT_BLOCK = {
  tab: '/05 Оплата',
  title: 'Оплата',
  forLabel: 'Для пакетів',
}

export const WARRANTY_BLOCK = {
  tab: '/06 Гарантія й права',
  title: 'Гарантія й права',
  covers: 'Покриває',
  notCovers: 'Не покриває',
  rightsLabel: 'Права на сайт і домен',
  glowText: 'безкоштовно виправляємо наші помилки й відновлюємо роботу підключених нами сервісів',
}

export const SUPPORT_BLOCK = {
  tab: '/07 Підтримка',
  title: 'Підтримка після запуску',
  lead: 'Перші місяці Пульсу входять у пакет. Далі обираєте рівень або відмовляєтеся, без штрафів.',
}

export const FAQ_BLOCK = {
  tab: '/08 Питання',
  title: 'Часті питання',
}

export const CTA_BLOCK = {
  title: 'Записатися на розмову',
  href: '/#rozmova',
  label: 'Записатися на розмову',
}
