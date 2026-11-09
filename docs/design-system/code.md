# Код

Як підключити систему в сайт на React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui, motion.

## Тема Tailwind

Файл `code/mikaido-theme.css` у цій системі: токени як змінні CSS і блок `@theme` для Tailwind v4. Імпортуйте його в головний CSS після `@import "tailwindcss";`. Класи виходять такі: `bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-line3`, `font-display`, `font-px`, `rounded-r2`, `rounded-r3`, `text-t16`, `ease-out-mk`, `duration-base`.

Темна тема вмикається атрибутом `data-theme="dark"` на `html` або системним налаштуванням. Варіант `dark:` прив'язаний до того самого атрибута.

## Шрифти

Три файли з папки `fonts/`: Unbounded (змінна вага 200–900), Wix Madefor Text (400–800), Departure Mono. Кладіть їх у `public/fonts/` і підключайте через `@font-face` з `font-display: swap`. Усі три під ліцензією SIL Open Font License.

## Компоненти shadcn/ui

```
npx shadcn@latest init
npx shadcn@latest add accordion dialog drawer select switch tabs sonner
```

Після встановлення замініть у кожному компоненті кольори, кути й тривалості на токени цієї системи. Перемикач (switch) перемалюйте за компонентом Toggle: квадратний повзунок, рух `steps(4)`.

## motion

```
npm i motion
```

Підключайте через `LazyMotion` з `domAnimation`, використовуйте `m.div` замість `motion.div`. Тривалості беріть із токенів (0.08 / 0.16 / 0.24 / 0.4 / 0.65 / 0.9 с), плавність `[0.2, 0.7, 0.2, 1]`. Пружин не використовуємо.

## Ефекти

Знак, піксельні іконки, голограми, розшифрування, друк, розчинення, піксельний градієнт і сплеск кнопки лежать у `components/bundle.js` (об'єкт `window.Mikaido`, без залежностей). Для сайту переносимо їх у модулі TypeScript по одному файлу на ефект, логіку не змінюємо.

## Обов'язково перед запуском

- Атрибут `lang="uk"` на `html`.
- Назва (до 60 знаків) і опис (до 160) кожної сторінки, картинка Open Graph 1200 × 630.
- Фавікон 16 px (піксельний знак) і іконка 180 px для телефона.
- Сторінки: Головна, Пакети й умови, Дякуємо, 404, Політика конфіденційності.
- Аналітика вантажиться лише після згоди на cookies.
