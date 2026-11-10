/* Дані навігації й підвалу. Тексти беремо з docs/reference/mikaido-home.html.
   Невідоме лишається як [заповнити] і малюється кольором spark. */

export type NavItem = { label: string; href: string }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Пакети', href: '/#pakety' },
  { label: 'Процес', href: '/#proces' },
  { label: 'Кейси', href: '/#keisy' },
  { label: 'Умови', href: '/pakety-i-umovy' },
]

export const CTA = { label: 'Записатися', menuLabel: 'Записатися на розмову', href: '/#rozmova' }

export const SLOGAN = 'Зробимо майбутнє, яким ми його колись уявляли.'

export type FooterLink = { label: string; href: string; placeholder?: boolean }
export type FooterColumn = { title: string; links: FooterLink[] }

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Студія',
    links: [
      { label: 'Пакети', href: '/#pakety' },
      { label: 'Процес', href: '/#proces' },
      { label: 'Кейси', href: '/#keisy' },
    ],
  },
  {
    title: 'Умови',
    links: [
      { label: 'Гарантія', href: '/pakety-i-umovy#harantiya' },
      { label: 'Оплата', href: '/pakety-i-umovy#oplata' },
      { label: 'Підтримка', href: '/pakety-i-umovy#pidtrymka' },
    ],
  },
  {
    title: "Зв'язок",
    links: [
      { label: '[телефон]', href: '#', placeholder: true },
      { label: '[пошта]', href: '#', placeholder: true },
      { label: 'Telegram', href: '#' },
    ],
  },
]

export const LEGAL = {
  copyright: '© 2026 Mikaido',
  privacyLabel: 'Політика конфіденційності',
  privacyHref: '/polityka-konfidentsiynosti',
  cookiesLabel: 'Налаштування cookies',
}
