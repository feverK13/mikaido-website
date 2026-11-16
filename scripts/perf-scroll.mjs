/* Замір продуктивності скролу Головної: мобільна емуляція, CPU 4× повільніше, повний скрол вниз і вгору.
   Запуск: node scripts/perf-scroll.mjs. Виводить на кадр: скрипти, layout, перерахунок стилів, довгі задачі (> 50 мс),
   кількість викликів getBoundingClientRect і offset* / client* геттерів. Дані беруться з CDP Performance.getMetrics. */
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = 5191
const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  reducedMotion: 'no-preference',
})
await context.addInitScript(() => {
  localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() }))
  const counts = { rect: 0, offset: 0 }
  window.__counts = counts
  const rect = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function () {
    counts.rect++
    return rect.call(this)
  }
  for (const name of ['offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight']) {
    const proto = name.startsWith('offset') ? HTMLElement.prototype : Element.prototype
    const desc = Object.getOwnPropertyDescriptor(proto, name)
    if (!desc?.get) continue
    Object.defineProperty(proto, name, {
      ...desc,
      get() {
        counts.offset++
        return desc.get.call(this)
      },
    })
  }
  window.__long = []
  new PerformanceObserver((list) => list.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] })
})
const page = await context.newPage()
page.on('console', (m) => m.text().startsWith('y ') && console.log(m.text()))
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1500)

const cdp = await context.newCDPSession(page)
await cdp.send('Performance.enable')
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))

await page.evaluate(() => {
  window.__counts.rect = 0
  window.__counts.offset = 0
  window.__long.length = 0
})
const m0 = await metrics()
const frames = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const max = document.documentElement.scrollHeight - innerHeight
      const total = Math.ceil(max / 14)
      let n = 0
      const step = () => {
        n++
        const k = n <= total ? n : 2 * total - n
        scrollTo({ top: Math.max(0, Math.min(max, k * 14)), behavior: 'instant' })
        if (n >= 2 * total) return resolve(n)
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }),
)
const m1 = await metrics()
const { rect, offset } = await page.evaluate(() => window.__counts)
const long = await page.evaluate(() => window.__long)
const per = (k) => ((m1[k] - m0[k]) * 1000) / frames
console.log(
  JSON.stringify({
    frames,
    scriptMsPerFrame: +per('ScriptDuration').toFixed(2),
    layoutMsPerFrame: +per('LayoutDuration').toFixed(2),
    styleMsPerFrame: +per('RecalcStyleDuration').toFixed(2),
    taskMsPerFrame: +per('TaskDuration').toFixed(2),
    longTasks: long.length,
    longTaskMax: long.length ? Math.max(...long) : 0,
    rectPerFrame: +(rect / frames).toFixed(2),
    offsetPerFrame: +(offset / frames).toFixed(2),
  }),
)
await browser.close()
await server.close()
