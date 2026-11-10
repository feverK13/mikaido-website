/* Проганяє axe-core на всіх сторінках сайту і на /__preview в обох темах на 390 і 1280 px.
   Запуск: npm run a11y. Рух вимкнено (reducedMotion), щоб полотна розчинення не закривали текст.
   Кольори токенів скрипт не змінює: контраст лише повідомляється. */
import { AxeBuilder } from '@axe-core/playwright'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = 5192
const PAGES = (process.env.A11Y_PAGES ?? '/,/pakety-i-umovy,/polityka-konfidentsiynosti,/dyakuyemo,/nope,/__preview').split(',')
const THEMES = ['light', 'dark']
const SIZES = [390, 1280]
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()
let total = 0

try {
  for (const path of PAGES) {
    for (const theme of THEMES) {
      for (const width of SIZES) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
          hasTouch: width < 500,
          isMobile: width < 500,
        })
        await context.addInitScript(() =>
          localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() })),
        )
        const page = await context.newPage()
        await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' })
        await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(400)
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        console.log(`\n${path} ${theme} ${width}px: ${violations.length} порушень`)
        for (const v of violations) {
          total += v.nodes.length
          console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`)
          for (const n of v.nodes.slice(0, 3)) {
            const detail = n.any[0]?.message ?? n.failureSummary?.split('\n')[1] ?? ''
            console.log(`     ${n.target.join(' ')}  ${detail.slice(0, 140)}`)
          }
        }
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
  await server.close()
}

console.log(`\nУсього вузлів із порушеннями: ${total}`)
process.exitCode = total ? 1 : 0
