/* Знімає секцію Головної і ту саму секцію з макета, склеює їх поруч (макет ліворуч, сайт праворуч).
   Запуск: npm run compare -- <id секції> (наприклад: top, shlyakh, keisy). Результат: test-results/compare/.
   Рух вимкнено в обох (reducedMotion: reduce, у макеті кнопка «Без руху»), шапка й панель макета сховані. */
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const id = process.argv[2]
if (!id) {
  console.error('Вкажіть id секції: npm run compare -- top')
  process.exit(1)
}
const OUT = 'test-results/compare'
const PORT = 5198
const MOCK = pathToFileURL(resolve('docs/reference/mikaido-home.html')).href
const SIZES = [
  { w: 1280, h: 900 },
  { w: 390, h: 844 },
]
const HIDE = '.dev,.s-hdr,header.sticky,.mbar,.msheet,.mveil,[role=dialog]{display:none!important}'

mkdirSync(OUT, { recursive: true })
const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()

async function shootSection(url, theme, size, isMock) {
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
  if (isMock) {
    await page.evaluate((t) => {
      document.querySelector('[data-mo=off]')?.click()
      window.setT(t)
    }, theme)
  } else {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
  }
  await page.addStyleTag({ content: HIDE })
  await page.evaluate(() => document.fonts.ready)
  const el = page.locator(`section#${id}`)
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  const box = await el.boundingBox()
  const buf = await el.screenshot()
  await context.close()
  return { buf, height: Math.round(box?.height ?? 0) }
}

try {
  const composer = await browser.newPage()
  for (const theme of ['light', 'dark']) {
    for (const size of SIZES) {
      const mock = await shootSection(MOCK, theme, size, true)
      const app = await shootSection(`http://localhost:${PORT}/`, theme, size, false)
      const uri = (b) => `data:image/png;base64,${b.toString('base64')}`
      await composer.setViewportSize({ width: size.w * 2 + 24, height: 400 })
      await composer.setContent(
        `<body style="margin:0;background:#888;display:flex;gap:24px;align-items:flex-start">` +
          `<img src="${uri(mock.buf)}" style="width:${size.w}px"><img src="${uri(app.buf)}" style="width:${size.w}px"></body>`,
      )
      const file = `${OUT}/${id}-${theme}-${size.w}.png`
      await composer.screenshot({ path: file, fullPage: true })
      console.log(`${file}  макет ${mock.height}px  сайт ${app.height}px  різниця ${app.height - mock.height}px`)
    }
  }
} finally {
  await browser.close()
  await server.close()
}
