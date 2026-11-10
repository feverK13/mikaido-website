/* Тексти Головної. Джерело: docs/reference/mikaido-home.html. Код текстів не вигадує.
   Ціни, пакети, питання й переваги беремо з src/content/packages.ts. */
import { DIFF, FAQ } from '@/content/packages'

export const HERO = {
  meta: '/01 Веб-студія для малого й середнього бізнесу',
  title: 'Сайт, через який Вас помічають та обирають',
  lead: 'Будуємо шлях Вашого клієнта: знайшли, повірили, записалися чи купили, повернулися. Сайт і інструменти навколо нього працюють з першого дня.',
  primaryCta: { label: 'Записатися на розмову', href: '#rozmova' },
  secondaryCta: { label: 'Пакети й ціни', href: '#pakety' },
  ctaNote: 'Розмова 30 хвилин, безкоштовно',
  signature: 'Зробимо майбутнє, яким ми його колись уявляли',
  hologramLabel: 'Онлайн-запис / Бізнес',
  hologramAlt: 'Піксельна голограма календаря запису',
  facts: [
    { value: '60 днів', label: 'гарантія на наші помилки' },
    { value: '1 рік', label: 'домен і хостинг на Вас, платимо ми' },
    { value: 'до 3 тижнів', label: 'найшвидший пакет, Старт' },
    { value: "щоп'ятниці", label: 'коротке оновлення про проєкт' },
  ],
}

export const PATH_SECTION = {
  tab: '/02 Ви купуєте не сайт',
  title: 'Ви купуєте шлях, яким клієнт приходить до Вас',
  lead: 'Сайт лише одна ланка. Інструменти навколо нього працюють від першого дня запуску.',
  stepLabel: 'Крок',
  steps: [
    { icon: 'search', title: 'Знайшли', text: 'Картка в Google, базове SEO, Search Console' },
    { icon: 'shield', title: 'Повірили', text: 'Сайт, що виглядає так само якісно, як Ви працюєте: послуги, ціни, маршрут' },
    { icon: 'calendar', title: 'Записалися чи купили', text: 'Онлайн-запис, форма зі сповіщенням у Telegram, кошик і оплата' },
    { icon: 'chat', title: 'Повернулися', text: 'Власний канал і база клієнтів, незалежні від одного акаунту в соцмережі' },
  ] as { icon: 'search' | 'shield' | 'calendar' | 'chat'; title: string; text: string }[],
  boundary: {
    main: 'Рекламу й просування ми не ведемо.',
    note: 'Якщо Ви наймете маркетолога, інструменти вже готові до його роботи.',
  },
}

export const CASES_SECTION = {
  tab: '/03 Кейси',
  title: 'Що ми вже зробили',
  lead: 'Задача партнера, як ми її закрили, технічні заміри і відгук.',
  placeholder: '[заповнити]',
  items: [
    {
      url: 'Level Up / сайт послуг',
      placeholderLabel: 'Скріншот кейсу',
      title: 'Level Up: сайт послуг із самооцінкою стану і ШІ-помічником',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
      metrics: ['швидкість завантаження', 'оцінка доступності', 'відгук партнера'],
    },
    {
      url: '[заповнити]',
      placeholderLabel: 'Скріншот кейсу',
      title: '[заповнити після письмової згоди]',
      tags: ['Сайт-портфоліо'],
      metrics: ['швидкість завантаження', 'оцінка доступності', 'відгук партнера'],
    },
  ],
  cta: { label: 'Ваш проєкт може бути наступним →', href: '#rozmova' },
  nav: {
    label: 'Перемикач кейсів',
    prev: 'Попередній кейс',
    next: 'Наступний кейс',
    status: (n: number, total: number) => `Кейс ${n} з ${total}`,
  },
}

export const PACKAGES_SECTION = {
  tab: '/04 Пакети',
  title: 'Чотири пакети. Одна сума й конкретні дати',
  lead: 'Кожен пакет можна розширити за доплату. Ціну й дати фіксуємо в пропозиції.',
  menuTitle: 'Оберіть пакет',
  menuLabel: 'Пакети',
  keys: [
    { keys: '↑↓', label: 'вибір' },
    { keys: 'Enter', label: 'обрати' },
  ],
  detailRows: { scope: 'Обсяг', key: 'Ключове', revisions: 'Правки', pulse: 'Пульс у подарунок', payment: 'Оплата' },
  discussCta: 'Обговорити',
  chosenLabel: 'Обрано',
  chosenAnnounce: 'Обрано пакет',
  controls: { label: 'Керування вибором пакета', prev: 'Попередній пакет', next: 'Наступний пакет', choose: 'Обрати', chosen: 'Обрано' },
  ctaHref: '#rozmova',
  /** Голограма кожного пакета: лише на Головній. */
  models: { start: 'page', business: 'calendar', pro: 'nodes', catalog: 'box' } as Record<'start' | 'business' | 'pro' | 'catalog', 'page' | 'calendar' | 'nodes' | 'box'>,
  always: [
    { icon: 'globe', text: 'Домен і хостинг на перший рік, на Вас' },
    { icon: 'shield', text: 'Гарантія 60 днів' },
    { icon: 'report', text: 'Код, доступи й інструкції після оплати' },
  ] as { icon: 'globe' | 'shield' | 'report'; text: string }[],
  fullLabel: 'Повні умови й порівняння',
  fullHref: '/pakety-i-umovy',
}

export const TERMS_SECTION = {
  tab: '/06 Умови',
  title: 'Усі умови відомі до підпису',
  lead: 'Що входить і що ні, строки, правки, гарантія й оплата.',
  guarantee: {
    value: '60 днів',
    text: 'безкоштовно виправляємо наші помилки й відновлюємо роботу підключених нами сервісів',
  },
  differences: DIFF.filter((item) => item.home),
  moreLabel: 'Усі умови: що входить, оплата, гарантія, підтримка',
  moreHref: '/pakety-i-umovy',
}

export const SKIP_LINK = 'До змісту'

export const MOBILE_BAR = {
  secondary: { label: 'Пакети', href: '#pakety' },
  primary: { label: 'Записатися', href: '#rozmova' },
}

export const FAQ_SECTION = {
  tab: '/07 Питання',
  title: 'Часті питання',
  moreLabel: 'Усі питання й відповіді',
  moreHref: '/pakety-i-umovy#pytannya',
  items: FAQ.filter((item) => item.home),
}

export const CONTACT_SECTION = {
  tab: '/08 Розмова',
  title: 'Почнімо з розмови',
  lead: '30 хвилин, безкоштовно. Розкажете про бізнес, ми чесно скажемо, чи потрібен Вам сайт і який пакет підійде.',
  steps: [
    { n: '/01', text: 'Заявка' },
    { n: '/02', text: "Ми зв'яжемося, щоб узгодити деталі" },
    { n: '/03', text: 'Розмова й пропозиція з датами' },
  ],
  form: {
    name: { label: "Ім'я", placeholder: 'Олена', error: 'Вкажіть, як до Вас звертатися' },
    phone: {
      label: 'Телефон',
      prefix: '+380',
      placeholder: '+380 67 123 45 67',
      errorEmpty: 'Вкажіть номер телефону',
      errorFormat: 'Номер має 12 цифр: +380 і ще 9',
    },
    packageLabel: 'Пакет, що цікавить',
    packageUnknown: 'Ще не знаю',
    about: {
      label: 'Коротко про бізнес',
      placeholder: 'Наприклад: салон краси, хочемо онлайн-запис',
      hint: 'Поле росте разом із текстом',
    },
    consent: "Погоджуюся з обробкою даних",
    consentError: 'Потрібна Ваша згода на обробку даних',
    consentNote: "Лише для зв'язку щодо розмови",
    submit: 'Записатися на розмову',
  },
}

export const PROCESS_SECTION = {
  tab: '/05 Процес',
  title: 'Як іде проєкт',
  lead: 'Строки рахуються від дня, коли ми отримали матеріали й аванс.',
  stepLabel: 'Етап',
  done: 'Готово',
  now: 'Зараз',
  launched: 'Проєкт запущено / далі підтримка',
  friday: {
    title: "Щоп'ятниці коротке оновлення",
    text: 'Що зроблено, що далі і що потрібно від Вас. Разом із журналом проєкту у PDF.',
  },
}
