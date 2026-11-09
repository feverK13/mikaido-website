/* Знімає скріншоти компонентів зі сторінки /__preview для звірки з еталоном.
   Запуск: npm run shots. Лише один компонент: npm run shots -- Select (збіг за назвою секції,
   без урахування регістру). Результат: test-results/screens/.
   Чотири комбінації тема x ширина йдуть паралельно в одному Chromium, dev-сервер один.
   Теми: light, dark. Ширини: 1280 (миша) і 390 (мобільний профіль із touch).
   Стани: default, hover, active (миша затиснута), focus-visible (через Tab), disabled і error
   видно на default-знімку секції. Для ефектів рух увімкнено (reducedMotion: no-preference). */
import { mkdirSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const OUT = 'test-results/screens'
const PORT = 5199
const PAD = 12
const MAX_PER_SECTION = 6
const THEMES = ['light', 'dark']
const PROFILES = [
  { name: '1280', touch: false, options: { viewport: { width: 1280, height: 900 } } },
  {
    name: '390',
    touch: true,
    options: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  },
]
const EFFECT_SECTIONS = ['decode', 'typeText', 'dissolve', 'dither', 'hologram', 'Select', 'Steps']
const INTERACTIVE =
  'button:not([disabled]), a[href], input, textarea, [role=switch]:not([disabled])'

const FILTER = process.argv[2]?.toLowerCase()

if (!FILTER) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()
const errors = []
let count = 0

const slug = (text) => text.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'section'

async function shot(page, box, file) {
  const vp = page.viewportSize()
  const x = Math.max(0, box.x - PAD)
  const y = Math.max(0, box.y - PAD)
  const width = Math.min(vp.width - x, box.width + PAD * 2)
  const height = Math.min(vp.height - y, box.height + PAD * 2)
  await page.screenshot({ path: `${OUT}/${file}.png`, clip: { x, y, width, height } })
  count++
}

async function pressTabTo(page, handle) {
  await page.evaluate(() => document.activeElement?.blur())
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab')
    if (await handle.evaluate((el) => el === document.activeElement)) return true
  }
  return false
}

async function runCombo(theme, profile) {
  {
    {
      const context = await browser.newContext({
        ...profile.options,
        colorScheme: theme,
        reducedMotion: 'no-preference',
      })
      await context.addInitScript(() => localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() })))
      const page = await context.newPage()
      page.on('pageerror', (e) => errors.push(`${theme}/${profile.name}: ${e.message}`))
      page.on('console', (m) => m.type() === 'error' && errors.push(`${theme}/${profile.name}: ${m.text()}`))
      await page.goto(`http://localhost:${PORT}/__preview`, { waitUntil: 'networkidle' })
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
      await page.evaluate(() => document.fonts.ready)

      const sections = page.locator('section')
      const total = await sections.count()
      for (let s = 0; s < total; s++) {
        const section = sections.nth(s)
        const title = (await section.locator('h2').first().textContent()) ?? ''
        if (FILTER && !title.toLowerCase().includes(FILTER)) continue
        const base = `${theme}-${profile.name}-${String(s).padStart(2, '0')}-${slug(title)}`
        await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
        await section.scrollIntoViewIfNeeded()
        await page.waitForTimeout(150)
        await section.screenshot({ path: `${OUT}/${base}-default.png` })
        count++

        const items = section.locator(INTERACTIVE)
        const itemTotal = await items.count()
        let shown = 0
        for (let i = 0; i < itemTotal && shown < MAX_PER_SECTION; i++) {
          if (!(await items.nth(i).isVisible()) || (await items.nth(i).evaluate((e) => !!e.closest("[inert]")))) continue
          shown++
          const focusEl = await items.nth(i).elementHandle()
          const el = (await focusEl.evaluateHandle((e) => e.closest('label') ?? e)).asElement()
          await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
          const name = `${base}-${i}`
          await page.evaluate(() => document.activeElement?.blur())

          if (!profile.touch) {
            const box = await el.boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await page.waitForTimeout(320)
            await shot(page, box, `${name}-hover`)
            await page.mouse.down()
            await page.waitForTimeout(120)
            await shot(page, box, `${name}-active`)
            await page.mouse.up()
            if (EFFECT_SECTIONS.some((e) => title.startsWith(e))) {
              await page.waitForTimeout(350)
              await section.screenshot({ path: `${OUT}/${name}-after-click.png` })
              count++
            }
            await page.keyboard.press('Escape')
            await page.mouse.move(0, 0)
            await page.waitForTimeout(200)
          }

          if (await pressTabTo(page, focusEl)) {
            await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
            await page.waitForTimeout(260)
            await shot(page, await el.boundingBox(), `${name}-focus`)
          } else {
            errors.push(`${base}-${i}: Tab не дійшов до елемента`)
          }
        }
      }
      await context.close()
    }
  }
}

try {
  await Promise.all(THEMES.flatMap((theme) => PROFILES.map((profile) => runCombo(theme, profile))))
} finally {
  await browser.close()
  await server.close()
}

console.log(`Знімків: ${count}. Папка: ${OUT}`)
if (errors.length) {
  console.log('Помилки:')
  for (const e of new Set(errors)) console.log(' -', e)
  process.exitCode = 1
}
