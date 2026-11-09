/* Пакети: єдине джерело цін, обсягу, строків і умов для сайту.
   Дані з docs/product-marketing.md, розділ «Пакети й ціни». Суми не змінювати. */

export type PackageId = 'start' | 'business' | 'pro' | 'catalog'

export type PackageData = {
  id: PackageId
  name: string
  price: string
  audience: string
  scope: string
  term: string
  revisions: string
  pulse: string
  payment: string
}

export const PACKAGES: PackageData[] = [
  {
    id: 'start',
    name: 'Старт',
    price: '25 000 грн',
    audience: 'Експерт, ФОП, майстер',
    scope: 'Лендінг до 7 блоків або до 3 сторінок',
    term: 'до 3 тижнів',
    revisions: '2 до макета + 1 на тестовій',
    pulse: '1 місяць',
    payment: '100% (−5%) або 50/50',
  },
  {
    id: 'business',
    name: 'Бізнес',
    price: '45 000 грн',
    audience: 'Салон, клініка, студія, сервіс',
    scope: 'До 6 сторінок',
    term: '4-7 тижнів',
    revisions: '2 до макета + 1 на тестовій',
    pulse: '2 місяці',
    payment: '100% (−5%) або 50/50',
  },
  {
    id: 'pro',
    name: 'Профі',
    price: 'від 60 000 грн',
    audience: 'Центр, школа, B2B, кілька напрямів',
    scope: 'До 12 сторінок, дві мови, блог',
    term: '5-8 тижнів',
    revisions: '3 до макета + 2 на тестовій',
    pulse: '3 місяці',
    payment: '100% (−5%) або 30/40/30',
  },
  {
    id: 'catalog',
    name: 'Каталог',
    price: 'від 76 000 грн',
    audience: 'Малий магазин, виробник, майстерня',
    scope: 'Каталог до 150 товарів, кошик, пошук, фільтри',
    term: '6-9 тижнів',
    revisions: '3 до макета + 2 на тестовій',
    pulse: '3 місяці',
    payment: '100% (−5%) або 30/40/30',
  },
]

/** Рядки умов картки пакета: назва і значення. */
export const packageRows = (p: PackageData): [string, string][] => [
  ['Обсяг', p.scope],
  ['Строк', p.term],
  ['Правки', p.revisions],
  ['Пульс', p.pulse],
  ['Оплата', p.payment],
]
