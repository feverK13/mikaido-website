/* Знімає секцію Головної (чи сторінки Пакети й умови) або компонент і порівнює з еталоном поряд.
   Запуск:
     npm run compare -- <id секції>               секція Головної (top, shlyakh, keisy ...)
     npm run compare -- service <id секції>       секція «Пакети й умови» (макет mikaido-service.html)
     npm run compare -- component <Назва>         компонент: docs/design-system/components/<Назва>/preview.html
                                                  проти секції з h2 <Назва> на /__preview
   Результат: test-results/compare/ (еталон ліворуч, сайт праворуч).
   Рух вимкнено в обох (reducedMotion: reduce, у макеті кнопка «Без руху»), шапка й панель макета сховані. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const args = process.argv.slice(2)
let mode = 'home'
if (args[0] === 'service' || args[0] === 'component') mode = args.shift()
const id = args[0]
if (!id) {
  console.error('Вкажіть id секції або назву компонента: npm run compare -- top')
  process.exit(1)
}

const OUT = 'test-results/compare'
const PORT = 5198
const DS = resolve('docs/design-system')
const MOCKS = {
  home: pathToFileURL(resolve('docs/reference/mikaido-home.html')).href,
  service: pathToFileURL(resolve('docs/reference/mikaido-service.html')).href,
}
const SIZES = [
  { w: 1280, h: 900 },
  { w: 390, h: 844 },
]
const HIDE = '.dev,.s-hdr,header.sticky,.mbar,.msheet,.mveil,[role=dialog]{display:none!important}'

mkdirSync(OUT, { recursive: true })

/* Еталон компонента: preview.html у обгортці з токенами й бандлом дизайн-системи. */
function referenceFile(name) {
  const body = readFileSync(`${DS}/components/${name}/preview.html`, 'utf8')
  const href = (p) => pathToFileURL(`${DS}/${p}`).href
  const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${href('tokens.css')}"><link rel="stylesheet" href="${href('components/bundle.css')}">
<style>body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:16px;line-height:1.6}</style>
<script src="${href('components/bundle.js')}"></script></head><body>${body}</body></html>`
  const file = resolve(`${OUT}/ref-${name}.html`)
  writeFileSync(file, html)
  return pathToFileURL(file).href
}

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()

async function shoot(url, theme, size, kind) {
  const context = await browser.newContext({
    viewport: { width: size.w, height: size.h },
    colorScheme: theme,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  })
  await context.addInitScript(() =>
    localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() })),
  )
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  if (kind === 'mock') {
    await page.evaluate((t) => {
      document.querySelector('[data-mo=off]')?.click()
      window.setT(t)
    }, theme)
  } else {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
  }
  await page.addStyleTag({ content: HIDE })
  await page.evaluate(() => document.fonts.ready)
  let el
  if (kind === 'component-ref') el = page.locator('body')
  else if (kind === 'component-app')
    el = page.locator('section', { has: page.locator('h2', { hasText: new RegExp(id, 'i') }) }).first()
  else el = page.locator(`section#${id}`)
  await el.scrollIntoViewIfNeeded()
  // Select в еталоні показано відкритим: відкриваємо й наш. Нижню шторку (до 860 px) знімаємо цілим вікном.
  const openSelect = kind === 'component-app' && /select/i.test(id)
  if (openSelect) await el.locator('button[aria-haspopup=listbox]').first().click()
  await page.waitForTimeout(1200)
  const box = await el.boundingBox()
  const buf = openSelect && size.w < 500 ? await page.screenshot() : await el.screenshot()
  await context.close()
  return { buf, height: Math.round(box?.height ?? 0) }
}

try {
  const left = mode === 'component' ? referenceFile(id) : MOCKS[mode]
  const right = mode === 'component' ? `http://localhost:${PORT}/__preview` : `http://localhost:${PORT}/`
  const leftKind = mode === 'component' ? 'component-ref' : 'mock'
  const rightKind = mode === 'component' ? 'component-app' : 'app'
  const composer = await browser.newPage()
  for (const theme of ['light', 'dark']) {
    for (const size of SIZES) {
      const a = await shoot(left, theme, size, leftKind)
      const b = await shoot(right, theme, size, rightKind)
      const uri = (buf) => `data:image/png;base64,${buf.toString('base64')}`
      await composer.setViewportSize({ width: size.w * 2 + 24, height: 400 })
      await composer.setContent(
        `<body style="margin:0;background:#888;display:flex;gap:24px;align-items:flex-start">` +
          `<img src="${uri(a.buf)}" style="width:${size.w}px"><img src="${uri(b.buf)}" style="width:${size.w}px"></body>`,
      )
      const file = `${OUT}/${mode === 'home' ? '' : mode + '-'}${id}-${theme}-${size.w}.png`
      await composer.screenshot({ path: file, fullPage: true })
      console.log(`${file}  еталон ${a.height}px  сайт ${b.height}px  різниця ${b.height - a.height}px`)
    }
  }
} finally {
  await browser.close()
  await server.close()
}
