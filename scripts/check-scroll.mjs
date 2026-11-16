/* Перевіряє появу блоків Головної при скролі в трьох режимах: десктоп, мобільний, мобільний з reduced motion.
   Запуск: npm run check:scroll. Блок (beat) = полотно-накриття z-[6] у DissolveReveal і RevealHeading.
   «У вікні» = блок заходить у живу зону (48 px від країв вікна, 0 на самому початку й у кінці сторінки).
   Видимий = полотно сховано (hidden), у предків opacity 1, у блока немає transform. */
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = 5190
const SETTLE = 1500
const MODES = [
  { name: 'desktop', mobile: false, reduce: false, options: { viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' } },
  {
    name: 'mobile',
    mobile: true,
    reduce: false,
    options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'no-preference' },
  },
  {
    name: 'mobile-reduce',
    mobile: true,
    reduce: true,
    options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' },
  },
]

/** Повертає перелік блоків у вікні, які не повністю видимі. */
const PROBE = () => {
  const vh = innerHeight
  const y = scrollY
  const atTop = y <= 1
  const atEnd = vh + y >= document.documentElement.scrollHeight - 2
  const top = atTop ? 0 : 48
  const bottom = atEnd ? 0 : 48
  const bad = []
  let inWindow = 0
  for (const cv of document.querySelectorAll('canvas.z-\\[6\\]')) {
    const host = cv.parentElement
    if (!host || host.closest('[inert]')) continue
    const r = host.getBoundingClientRect()
    if (!(r.top < vh - bottom && r.bottom > top)) continue
    inWindow++
    let opacity = 1
    for (let e = host; e; e = e.parentElement) opacity *= Number(getComputedStyle(e).opacity)
    const transform = getComputedStyle(host).transform
    if (!cv.hidden || opacity < 1 || (transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)')) {
      bad.push(`${(host.textContent ?? '').trim().slice(0, 24) || host.tagName}@${Math.round(r.top)}`)
    }
  }
  return { bad, inWindow, y: Math.round(y) }
}


/** Скільки пікселів блока видно в момент початку виходу (полотно блока, що було сховане, знову з'являється). Повільний скрол по сторінці в один бік. */
async function measureExit(page, sign) {
  await page.evaluate(() => {
    window.__exits = []
    const vh = innerHeight
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        const cv = m.target
        if (m.oldValue === null || cv.hidden) continue
        const r = cv.parentElement.getBoundingClientRect()
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0)
        if (visible > 0) window.__exits.push(Math.round(visible))
      }
    })
    for (const cv of document.querySelectorAll('canvas[class*="z-[6]"]')) mo.observe(cv, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true })
  })
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  await page.evaluate(([y]) => scrollTo({ top: y, behavior: 'instant' }), [sign > 0 ? 0 : max])
  await page.waitForTimeout(800)
  await page.evaluate(
    ([sg]) =>
      new Promise((resolve) => {
        let n = 0
        const step = () => {
          const before = scrollY
          scrollTo({ top: before + sg * 12, behavior: 'instant' })
          if (scrollY === before || ++n > 2500) return resolve()
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }),
    [sign],
  )
  await page.waitForTimeout(1000)
  const list = await page.evaluate(() => window.__exits)
  const avg = list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0
  return { n: list.length, avg, min: Math.min(...list), max: Math.max(...list) }
}

const results = []
const record = (mode, check, ok, detail = '') => results.push({ Режим: mode, Перевірка: check, Результат: ok ? 'OK' : 'ПАДАЄ', Деталі: ok ? '' : detail })

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()

async function open(mode, delay = process.env.EXIT_DELAY) {
  const context = await browser.newContext(mode.options)
  await context.addInitScript(() => localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() })))
  if (delay !== undefined) await context.addInitScript(`window.MK_EXIT_DELAY_PX = ${Number(delay)}`)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(SETTLE)
  return { context, page, errors }
}

const verdict = async (page, mode, check) => {
  await page.waitForTimeout(SETTLE)
  const r = await page.evaluate(PROBE)
  record(mode.name, check, r.bad.length === 0 && r.inWindow > 0, `y=${r.y}, у вікні ${r.inWindow}, не видно: ${r.bad.join(', ')}`)
}

try {
  for (const mode of MODES) {
    if (process.env.ONLY_MODE && mode.name !== process.env.ONLY_MODE) continue
    const { context, page, errors } = await open(mode)

    if (process.env.EXIT_PROBE) {
      for (const sign of [1, -1]) console.log(mode.name, sign > 0 ? 'вниз' : 'вгору', JSON.stringify(await measureExit(page, sign)))
      await context.close()
      continue
    }

    // a) клік по кожному пункту меню
    const labels = await page.evaluate(() => [...document.querySelectorAll('header nav a')].map((a) => a.textContent.trim()))
    for (let i = 0; i < labels.length; i++) {
      if (mode.mobile) {
        await page.getByRole('button', { name: 'Меню' }).tap()
        await page.waitForTimeout(400)
        await page.locator('[role=dialog] a').nth(i).tap()
      } else {
        await page.locator('header nav a').nth(i).click()
      }
      await verdict(page, mode, `a) меню: ${labels[i]}`)
    }

    // b) миттєві переходи
    for (const [name, target] of [['кінець', 'document.documentElement.scrollHeight'], ['початок', '0'], ['середина', 'document.documentElement.scrollHeight / 2']]) {
      await page.evaluate(`scrollTo({ top: ${target}, behavior: 'instant' })`)
      await verdict(page, mode, `b) scrollTo ${name}`)
    }

    // d) швидкий скрол колесом: вниз і вгору
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(300)
    for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 600)
    await verdict(page, mode, 'd) швидко вниз')
    for (let i = 0; i < 8; i++) await page.mouse.wheel(0, -600)
    await verdict(page, mode, 'd) швидко вгору')

    // c) перезавантаження посеред сторінки
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' }))
    await page.waitForTimeout(400)
    await page.reload({ waitUntil: 'networkidle' })
    await verdict(page, mode, 'c) перезавантаження посеред')

    // e) без руху: усе видно одразу, жодного накриття
    if (mode.reduce) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await page.reload({ waitUntil: 'networkidle' })
      const covered = await page.evaluate(() => [...document.querySelectorAll('canvas.z-\\[6\\]')].filter((c) => !c.hidden).length)
      record(mode.name, 'e) reduce: жодного накриття одразу', covered === 0, `накритих: ${covered}`)
    }

    record(mode.name, 'помилки в консолі', errors.length === 0, errors.join('; '))
    await context.close()
  }
  for (const mode of MODES.filter((m) => !m.reduce && !process.env.EXIT_PROBE)) {
    /* f) затримка виходу: без неї (0) і з типовою EXIT_DELAY_PX. На телефоні середня видима частина в момент початку виходу
       менша на ~EXIT_DELAY_PX в обидва боки, на десктопі різниці немає. */
    const avg = {}
    for (const delay of [0, undefined]) {
      const { context, page } = await open(mode, delay)
      avg[delay ?? 'default'] = { down: (await measureExit(page, 1)).avg, up: (await measureExit(page, -1)).avg }
      await context.close()
    }
    for (const [key, label] of [['down', 'вниз'], ['up', 'вгору']]) {
      const diff = avg[0][key] - avg.default[key]
      const ok = mode.mobile ? diff >= 10 && diff <= 35 : Math.abs(diff) <= 6
      record(mode.name, `f) затримка виходу ${label}`, ok, `без затримки ${avg[0][key]} px, з нею ${avg.default[key]} px, різниця ${diff}`)
    }
  }
} finally {
  await browser.close()
  await server.close()
}

console.table(results)
const failed = results.filter((r) => r.Результат !== 'OK')
console.log(failed.length ? `Падає: ${failed.length} з ${results.length}` : `Усе гаразд: ${results.length} перевірок`)
process.exitCode = failed.length ? 1 : 0
