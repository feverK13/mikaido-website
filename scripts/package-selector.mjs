/* Перевірки блоку вибору пакета.
   Запуск: npm run test:selector. Лише частина: SEL_ONLY=desktop|mobile|general npm run test:selector.
   Теми light і dark, рух no-preference і reduce. Десктоп: 1280x620, 1366x657, 1440x789, 1536x730, 1920x950, 1920x1080, 1366x768, 1280x720.
   Мобільний (touch): 390x844 і 360x640. Повертає код 1, якщо хоч одна перевірка впала. */
import { chromium } from 'playwright'
import { createServer } from 'vite'

const PORT = 5193
const THEMES = ['light', 'dark']
const MOTIONS = ['no-preference', 'reduce']
const DESKTOP = [
  [1280, 620],
  [1366, 657],
  [1440, 789],
  [1536, 730],
  [1920, 950],
  [1920, 1080],
  [1366, 768],
  [1280, 720],
]
const MOBILE = [
  [390, 844],
  [360, 640],
]
const ONLY = process.env.SEL_ONLY
const BLOCK = '#pakety-vybir'
const NAMES = ['Старт', 'Бізнес', 'Профі', 'Каталог']

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()
let failed = 0
let passed = 0

function check(label, ok, extra = '') {
  if (ok) passed++
  else {
    failed++
    console.log(`  ПАДІННЯ: ${label} ${extra}`)
  }
}

async function open(w, h, theme, motion, touch) {
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme,
    reducedMotion: motion,
    hasTouch: touch,
    isMobile: touch,
  })
  await context.addInitScript(() =>
    localStorage.setItem('mk_cookie_consent', JSON.stringify({ analytics: false, savedAt: Date.now() })),
  )
  const page = await context.newPage()
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
  await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
  await page.evaluate(() => document.fonts.ready)
  return { context, page }
}

const toBlock = async (page) => {
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), BLOCK)
  await page.waitForTimeout(1300)
}

const selected = (page) =>
  page.evaluate(
    (s) => [...document.querySelectorAll(`${s} [role=option]`)].findIndex((o) => o.getAttribute('aria-selected') === 'true'),
    BLOCK,
  )

const holoHash = (page) =>
  page.evaluate((s) => {
    const cv = document.querySelector(`${s} canvas[data-hologram]`)
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
    let h = 0
    for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7 + d[i + 3] * 11) | 0
    return h
  }, BLOCK)

const liveText = (page) => page.evaluate((s) => document.querySelector(`${s} [aria-live]`).textContent, BLOCK)

/** true, якщо подію клавіші сторінка не скасувала (скрол іде далі). */
const passesThrough = (page, key) =>
  page.evaluate((k) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })), key)

async function fit(page, label, minStage) {
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s)
    const stage = el.querySelector('canvas[data-hologram]').parentElement.getBoundingClientRect()
    return {
      inner: el.scrollHeight - el.clientHeight,
      height: el.getBoundingClientRect().height,
      vh: innerHeight,
      stage: stage.height,
      sx: document.documentElement.scrollWidth - innerWidth,
    }
  }, BLOCK)
  check(`${label}: без внутрішнього скролу`, r.inner <= 2, JSON.stringify(r))
  check(`${label}: на весь екран`, Math.abs(r.height - (r.vh - 70)) <= 3, JSON.stringify(r))
  check(`${label}: сцена не менша за ${minStage}`, r.stage >= minStage - 1, JSON.stringify(r))
  check(`${label}: без горизонтального скролу`, r.sx <= 0, JSON.stringify(r))
}

async function checkReduceVisible(page, label) {
  const hidden = await page.evaluate((s) => {
    const bad = []
    for (const el of document.querySelectorAll(`${s} *`)) {
      if (el.closest('.sr-only, [inert]') || el.textContent.trim() === '▶') continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || (cs.opacity === '0' && el.textContent.trim())) bad.push(el.className)
    }
    return bad
  }, BLOCK)
  check(`${label}: нічого не приховано`, hidden.length === 0, hidden.join('|'))
}

async function actionsInMenuColumn(page, label) {
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s)
    const left = el.children[1].getBoundingClientRect()
    const a = [...el.children[1].querySelectorAll('a')].filter((x) => /Обговорити|Повні умови/.test(x.innerText))
    const box = a.map((x) => x.getBoundingClientRect())
    const footer = [...el.children[1].children].at(-1).getBoundingClientRect()
    const row = el.querySelector('[role=option]').getBoundingClientRect()
    return {
      count: a.length,
      tags: a.map((x) => x.tagName + ':' + x.innerText.split(' ')[0]),
      inLeft: box.every((b) => b.left >= left.left && b.right <= left.right),
      stacked: box.length === 2 && box[0].bottom <= box[1].top,
      sameHeight: box.length === 2 && Math.abs(box[0].height - box[1].height) < 1,
      full: box.length === 2 && Math.abs(box[0].width - box[1].width) < 1 && box[0].width > left.width * 0.8,
      aboveFooter: box.length === 2 && box[1].bottom <= footer.top,
      row: row.height,
      rightHas: [...el.children[2].querySelectorAll('a, button')].filter((x) => /Обговорити|Повні умови/.test(x.innerText)).length,
    }
  }, BLOCK)
  check(`${label}: дві кнопки в лівій колонці`, r.count === 2 && r.inLeft, JSON.stringify(r))
  check(`${label}: кнопки одна під одною на всю ширину`, r.stacked && r.full, JSON.stringify(r))
  check(`${label}: однакова висота кнопок`, r.sameHeight, JSON.stringify(r))
  check(`${label}: кнопки над роздільником`, r.aboveFooter, JSON.stringify(r))
  check(`${label}: обидві кнопки є посиланнями`, r.tags.every((t) => t.startsWith('A:')), r.tags.join())
  check(`${label}: у правій колонці кнопок немає`, r.rightHas === 0, JSON.stringify(r))
  check(`${label}: рядок меню не нижче 56`, r.row >= 56, String(r.row))
}

async function desktopFit() {
  for (const [w, h] of DESKTOP)
    for (const theme of THEMES)
      for (const motion of MOTIONS) {
        const label = `десктоп ${w}x${h} ${theme} ${motion}`
        const { context, page } = await open(w, h, theme, motion, false)
        await toBlock(page)
        await fit(page, label, 140)
        await actionsInMenuColumn(page, label)
        if (motion === 'reduce') await checkReduceVisible(page, label)
        await context.close()
      }
}

async function desktopBehavior(theme, motion) {
  const label = `десктоп 1366x768 ${theme} ${motion}`
  const { context, page } = await open(1366, 768, theme, motion, false)
  await toBlock(page)
  const reduce = motion === 'reduce'
  const settle = reduce ? 150 : 1300

  // клік по кожному рядку: меню, опис і голограма
  const hashes = []
  for (const i of [0, 1, 2, 3, 2, 1, 0]) {
    await page.locator(`${BLOCK} [role=option]`).nth(i).click()
    await page.waitForTimeout(settle)
    check(`${label}: клік ${i}: меню`, (await selected(page)) === i)
    check(`${label}: клік ${i}: опис`, (await liveText(page)).startsWith(NAMES[i]))
    const visible = await page.evaluate((s) => document.querySelector(s).innerText, BLOCK)
    check(`${label}: клік ${i}: назва в блоці`, visible.toUpperCase().includes(NAMES[i].toUpperCase()))
    if (reduce) {
      const hash = await holoHash(page)
      if (hashes[i] === undefined) hashes[i] = hash
      else check(`${label}: клік ${i}: голограма та сама`, hashes[i] === hash)
    }
  }
  if (reduce) check(`${label}: чотири різні голограми`, new Set(hashes.slice(0, 4)).size === 4, hashes.join())
  check(`${label}: голограма рівно одна`, (await page.locator(`${BLOCK} canvas[data-hologram]`).count()) === 1)

  // клавіші
  await page.locator('body').click({ position: { x: 3, y: 400 } }).catch(() => {})
  await toBlock(page)
  const step = async (key, want, text) => {
    await page.keyboard.press(key)
    await page.waitForTimeout(220)
    check(`${label}: ${text}`, (await selected(page)) === want, `маємо ${await selected(page)}`)
  }
  await step('Home', 0, 'Home')
  await step('ArrowDown', 1, 'ArrowDown')
  await step('ArrowDown', 2, 'ArrowDown 2')
  await step('ArrowUp', 1, 'ArrowUp')
  await step('End', 3, 'End')
  await step('1', 0, 'клавіша 1')
  await step('4', 3, 'клавіша 4')
  await step('2', 1, 'клавіша 2')
  await step('3', 2, 'клавіша 3')

  // краї: сторінка прокручується далі
  await step('Home', 0, 'Home перед краєм')
  check(`${label}: ArrowUp на першому не перехоплено`, await passesThrough(page, 'ArrowUp'))
  await step('End', 3, 'End перед краєм')
  check(`${label}: ArrowDown на останньому не перехоплено`, await passesThrough(page, 'ArrowDown'))
  await step('2', 1, 'клавіша 2 перед середнім')
  check(`${label}: ArrowDown посередині перехоплено`, !(await passesThrough(page, 'ArrowDown')))
  await page.waitForTimeout(250)
  for (const key of [' ', 'PageUp', 'PageDown', 'Tab', 'Escape'])
    check(`${label}: ${JSON.stringify(key)} не перехоплено`, await passesThrough(page, key))

  // Enter: обрати
  await step('3', 2, 'клавіша 3 для Enter')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(250)
  const chip = await page.evaluate(
    (s) => [...document.querySelectorAll(`${s} [role=option]`)].map((o) => o.innerText.includes('ОБРАНО') || o.innerText.includes('Обрано')),
    BLOCK,
  )
  check(`${label}: Enter ставить чип лише на Профі`, chip.join() === 'false,false,true,false', chip.join())
  const form = await page.evaluate(() => document.querySelector('#rozmova button[aria-haspopup=listbox]')?.innerText ?? '')
  check(`${label}: форма отримала пакет`, form.includes('Профі'), form)
  check(`${label}: озвучено «Обрано пакет»`, (await liveText(page)).startsWith('Обрано пакет'))

  // клавіші не працюють поза блоком
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(500)
  const before = await selected(page)
  check(`${label}: поза блоком клавіші не перехоплено`, await passesThrough(page, 'ArrowDown'))
  check(`${label}: поза блоком вибір не змінився`, (await selected(page)) === before)

  // 10 швидких натискань
  await toBlock(page)
  await page.keyboard.press('Home')
  await page.waitForTimeout(400)
  let maxHolo = 0
  let maxOverlay = 0
  await page.evaluate((s) => {
    window.__max = { holo: 0, all: 0 }
    const el = document.querySelector(s)
    const tick = () => {
      window.__max.holo = Math.max(window.__max.holo, el.querySelectorAll('canvas[data-hologram]').length)
      window.__max.all = Math.max(window.__max.all, el.querySelectorAll('canvas').length)
      requestAnimationFrame(tick)
    }
    tick()
  }, BLOCK)
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(25)
  }
  await page.waitForTimeout(reduce ? 200 : 1500)
  const max = await page.evaluate(() => window.__max)
  maxHolo = max.holo
  maxOverlay = max.all - max.holo
  check(`${label}: голограма завжди одна`, maxHolo === 1, `max ${maxHolo}`)
  check(`${label}: перехід один за раз`, maxOverlay <= 1, `переходів ${maxOverlay}`)
  check(`${label}: у кінці рівно один canvas`, (await page.locator(`${BLOCK} canvas`).count()) === 1)
  const last = await selected(page)
  const lastName = NAMES[last]
  if (reduce) {
    const now = await holoHash(page)
    await page.locator(`${BLOCK} [role=option]`).nth((last + 1) % 4).click()
    await page.waitForTimeout(200)
    await page.locator(`${BLOCK} [role=option]`).nth(last).click()
    await page.waitForTimeout(200)
    check(`${label}: голограма відповідає останньому вибору (${lastName})`, now === (await holoHash(page)))
  }

  await context.close()
}

async function loopStops(theme) {
  const label = `цикл голограм ${theme}`
  const { context, page } = await open(1366, 768, theme, 'no-preference', false)
  const snap = (sel) =>
    page.evaluate((q) => {
      const cv = document.querySelector(q)
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
      let h = 0
      for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 3]) | 0
      return h
    }, sel)
  const moves = async (sel) => {
    const a = await snap(sel)
    await page.waitForTimeout(700)
    return a !== (await snap(sel))
  }
  const hero = 'main section#top canvas[role=img]'
  const sel = `${BLOCK} canvas[data-hologram]`
  check(`${label}: hero малює, коли видно`, await moves(hero))
  await toBlock(page)
  check(`${label}: hero не малює, коли не видно`, !(await moves(hero)))
  check(`${label}: блок малює, коли видно`, await moves(sel))
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(600)
  check(`${label}: блок не малює, коли не видно`, !(await moves(sel)))
  await context.close()
}

async function mobile(w, h, theme, motion) {
  const label = `мобільний ${w}x${h} ${theme} ${motion}`
  const { context, page } = await open(w, h, theme, motion, true)
  await toBlock(page)
  const reduce = motion === 'reduce'
  const settle = reduce ? 150 : 1300
  await fit(page, label, 140)
  if (reduce) await checkReduceVisible(page, label)

  const buttons = page.locator(`${BLOCK} [role=group] button`)
  const prev = page.getByRole('button', { name: 'Попередній пакет' })
  const next = page.getByRole('button', { name: 'Наступний пакет' })
  const disabled = (loc) => loc.getAttribute('aria-disabled')

  // розміри
  const sizes = await page.evaluate((s) => {
    const out = []
    for (const b of document.querySelectorAll(`${s} [role=group] button`)) {
      const r = b.getBoundingClientRect()
      out.push([b.getAttribute('aria-label') || b.innerText, Math.round(r.width), Math.round(r.height)])
    }
    for (const o of document.querySelectorAll(`${s} [role=option]`)) out.push([o.id, Math.round(o.getBoundingClientRect().width), Math.round(o.getBoundingClientRect().height)])
    return out
  }, BLOCK)
  for (const [n, sw, sh] of sizes) check(`${label}: зона натискання ${n}`, sw >= 44 && sh >= 44, `${sw}x${sh}`)

  // ▲ ▼
  check(`${label}: початково Бізнес`, (await selected(page)) === 1)
  await prev.tap()
  await page.waitForTimeout(settle)
  check(`${label}: ▲ веде на Старт`, (await selected(page)) === 0)
  check(`${label}: ▲ aria-disabled на першому`, (await disabled(prev)) === 'true')
  await prev.tap({ force: true })
  await page.waitForTimeout(200)
  check(`${label}: ▲ на першому нічого не робить`, (await selected(page)) === 0)
  for (let i = 0; i < 3; i++) {
    await next.tap()
    await page.waitForTimeout(settle)
  }
  check(`${label}: ▼ дійшов до Каталогу`, (await selected(page)) === 3)
  check(`${label}: ▼ aria-disabled на останньому`, (await disabled(next)) === 'true')
  await next.tap({ force: true })
  await page.waitForTimeout(200)
  check(`${label}: ▼ на останньому нічого не робить`, (await selected(page)) === 3)
  check(`${label}: ▼ без disabled не вмикає ▲`, (await disabled(prev)) === null)

  // тап по рядку меню
  await page.locator(`${BLOCK} [role=option]`).nth(1).tap()
  await page.waitForTimeout(settle)
  check(`${label}: тап по рядку`, (await selected(page)) === 1)

  // свайп по сцені
  const swipe = async (dx, dy) => {
    await page.evaluate(
      ([s, dx, dy]) => {
        const stage = document.querySelector(`${s} canvas[data-hologram]`).parentElement
        const r = stage.getBoundingClientRect()
        const x = r.left + r.width / 2
        const y = r.top + r.height / 2
        const init = { bubbles: true, isPrimary: true, pointerType: 'touch', pointerId: 7 }
        stage.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientX: x, clientY: y }))
        stage.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: x + dx, clientY: y + dy }))
      },
      [BLOCK, dx, dy],
    )
    await page.waitForTimeout(settle)
  }
  await swipe(-80, 5)
  check(`${label}: свайп вліво → наступний`, (await selected(page)) === 2)
  await swipe(80, 5)
  check(`${label}: свайп вправо → попередній`, (await selected(page)) === 1)
  await swipe(-30, 0)
  check(`${label}: короткий свайп ігнорується`, (await selected(page)) === 1)
  await swipe(-60, 70)
  check(`${label}: діагональний свайп ігнорується`, (await selected(page)) === 1)
  const ta = await page.evaluate((s) => getComputedStyle(document.querySelector(`${s} canvas[data-hologram]`).parentElement).touchAction, BLOCK)
  check(`${label}: сцена pan-y`, ta === 'pan-y', ta)
  await toBlock(page)

  // Деталі
  const details = page.getByRole('button', { name: 'Деталі' })
  const sheetOpen = () => page.evaluate(() => { const d = document.querySelector('[role=dialog][aria-label^="Деталі"]'); return d ? !d.hasAttribute('inert') : false })
  const focusInside = () => page.evaluate(() => !!document.activeElement?.closest('[role=dialog][aria-label^="Деталі"]'))
  const overflow = () => page.evaluate(() => document.body.style.overflow)
  const onDetails = () => page.evaluate(() => document.activeElement?.innerText)
  await details.tap()
  await page.waitForTimeout(500)
  check(`${label}: шторка відкрилась`, await sheetOpen())
  check(`${label}: фокус у шторці`, await focusInside())
  check(`${label}: прокрутка заблокована`, (await overflow()) === 'hidden')
  const rows = await page.evaluate(() => document.querySelectorAll('[role=dialog][aria-label^="Деталі"] .border-b').length)
  check(`${label}: у шторці 5 рядків таблиці`, rows === 5, String(rows))
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    if (!(await focusInside())) check(`${label}: фокус-пастка`, false, `Tab ${i}`)
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  check(`${label}: Escape закриває`, !(await sheetOpen()))
  check(`${label}: фокус на «Деталі» після Escape`, (await onDetails()) === 'Деталі')
  check(`${label}: прокрутка повернулась`, (await overflow()) === '')
  await details.tap()
  await page.waitForTimeout(500)
  await page.touchscreen.tap(Math.round(w / 2), 20)
  await page.waitForTimeout(500)
  check(`${label}: тап по фону закриває`, !(await sheetOpen()))
  check(`${label}: фокус на «Деталі» після тапу`, (await onDetails()) === 'Деталі')
  check(`${label}: прокрутка після тапу по фону`, (await overflow()) === '')
  await details.tap()
  await page.waitForTimeout(400)
  await page.setViewportSize({ width: 1100, height: h })
  await page.waitForTimeout(500)
  check(`${label}: розширення закриває шторку`, !(await sheetOpen()))
  check(`${label}: розширення повертає прокрутку`, (await overflow()) === '')
  await page.setViewportSize({ width: w, height: h })
  await page.waitForTimeout(400)

  // Обрати
  await toBlock(page)
  await page.locator(`${BLOCK} [role=option]`).nth(2).tap()
  await page.waitForTimeout(settle)
  const choose = page.getByRole('button', { name: 'Обрати' })
  await choose.tap()
  await page.waitForTimeout(300)
  const form = await page.evaluate(() => document.querySelector('#rozmova button[aria-haspopup=listbox]')?.innerText ?? '')
  check(`${label}: «Обрати» підставила пакет у форму`, form.includes('Профі'), form)
  const done = page.getByRole('button', { name: 'Обрано' })
  check(`${label}: кнопка показує «Обрано»`, (await done.count()) === 1 && (await done.getAttribute('aria-disabled')) === 'true')
  await done.tap({ force: true })
  check(`${label}: повторний тап нічого не ламає`, (await selected(page)) === 2)

  // плаваюча панель
  const barHidden = () =>
    page.evaluate(() => {
      const bar = [...document.querySelectorAll('div.fixed')].find((d) => d.querySelector('a[href="#pakety"]') && d.querySelector('a[href="#rozmova"]'))
      return !bar || !!bar.closest('[inert]')
    })
  await toBlock(page)
  check(`${label}: плаваюча панель схована в блоці`, await barHidden())
  await page.evaluate(() => document.querySelector('#proces').scrollIntoView())
  await page.waitForTimeout(700)
  check(`${label}: панель повертається після блоку`, !(await barHidden()))
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(500)
  check(`${label}: панелі немає на першому екрані`, await barHidden())

  // вертикальний скрол по сцені (в кінці: синтетичний дотик CDP збиває подальші тапи)
  await toBlock(page)
  const cdp = await context.newCDPSession(page)
  const y0 = await page.evaluate(() => scrollY)
  const box = await page.locator(`${BLOCK} canvas[data-hologram]`).boundingBox()
  const tx = Math.round(box.x + box.width / 2)
  const ty = Math.round(box.y + box.height / 2)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] })
  for (let i = 1; i <= 10; i++)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx, y: ty - 20 * i }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(500)
  check(`${label}: вертикальний скрол по сцені працює`, (await page.evaluate(() => scrollY)) > y0)

  await context.close()
}

async function landscape() {
  const label = 'низьке вікно 800x500'
  const { context, page } = await open(800, 500, 'light', 'no-preference', false)
  const r = await page.evaluate((s) => ({ snap: getComputedStyle(document.documentElement).scrollSnapType, h: document.querySelector(s).getBoundingClientRect().height }), BLOCK)
  check(`${label}: прилипання вимкнене`, !r.snap.startsWith('y'), r.snap)
  check(`${label}: висота за вмістом, не на весь екран`, r.h > 500 - 70 - 1 || Math.abs(r.h - 430) > 3, String(r.h))
  await context.close()
}

try {
  if (!ONLY || ONLY === 'general') {
    console.log('Загальне')
    for (const theme of THEMES) await loopStops(theme)
    await landscape()
  }
  if (!ONLY || ONLY === 'desktop') {
    console.log('Десктоп: вміщення')
    await desktopFit()
    console.log('Десктоп: поведінка')
    for (const theme of THEMES) for (const motion of MOTIONS) await desktopBehavior(theme, motion)
  }
  if (!ONLY || ONLY === 'mobile') {
    console.log('Мобільний')
    for (const [w, h] of MOBILE) for (const theme of THEMES) for (const motion of MOTIONS) await mobile(w, h, theme, motion)
  }
} finally {
  await browser.close()
  await server.close()
}

console.log(`\nПройшло: ${passed}, впало: ${failed}`)
process.exitCode = failed ? 1 : 0
