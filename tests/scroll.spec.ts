import { expect, test, type Locator } from "@playwright/test"

async function scrollTo(viewport: Locator, top: number) {
  await viewport.evaluate((element, value) => {
    element.scrollTop = value
  }, top)
}

test("scroll lab is reachable and page progress follows document scrolling", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "滚动实验室" })
    .click()
  await expect(page).toHaveURL(/\/scroll\/$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "有点意思",
  )
  await expect(page.getByRole("region", { name: /演示/ })).toHaveCount(6)
  const progress = page.getByRole("progressbar", {
    name: "页面阅读进度",
    exact: true,
  })
  await expect(progress).toHaveAttribute("aria-valuenow", "0")
  await page
    .getByRole("navigation", { name: "滚动效果导航" })
    .getByRole("link", { name: /06/ })
    .click()
  await expect(page).toHaveURL(/#scroll-horizontal$/)
  await expect
    .poll(async () => Number(await progress.getAttribute("aria-valuenow")))
    .toBeGreaterThan(50)
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await expect(progress).toHaveAttribute("aria-valuenow", "100")
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(progress).toHaveAttribute("aria-valuenow", "0")
  expect(errors).toEqual([])
})

test("triggered cards finish fading while idle, stay visible on return, and reset", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-triggered")
  const viewport = card.getByRole("region")
  await viewport.scrollIntoViewIfNeeded()
  const items = card.locator("[data-reveal]")
  const last = items.nth(2)
  await expect(last).toHaveAttribute("data-visible", "false")
  await scrollTo(viewport, 10000)
  await expect(last).toHaveAttribute("data-visible", "true")
  // No further scroll input: a triggered animation must still finish.
  await expect(last).toHaveCSS("opacity", "1")
  await scrollTo(viewport, 0)
  await expect(last).toHaveAttribute("data-visible", "true")
  await card.getByRole("button", { name: "重置 Scroll-triggered 演示" }).click()
  await expect(last).toHaveAttribute("data-visible", "false")
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBe(0)
})

test("linked reading progress is proportional and reversible", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-linked")
  const viewport = card.getByRole("region")
  const progress = card.getByRole("progressbar")
  await viewport.scrollIntoViewIfNeeded()
  await expect(progress).toHaveAttribute("aria-valuenow", "0")
  await viewport.evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) / 2
  })
  await expect
    .poll(async () => Number(await progress.getAttribute("aria-valuenow")))
    .toBeGreaterThanOrEqual(49)
  expect(
    Number(await progress.getAttribute("aria-valuenow")),
  ).toBeLessThanOrEqual(51)
  await scrollTo(viewport, 10000)
  await expect(progress).toHaveAttribute("aria-valuenow", "100")
  await scrollTo(viewport, 0)
  await expect(progress).toHaveAttribute("aria-valuenow", "0")
  await viewport.focus()
  await page.keyboard.press("PageDown")
  await expect
    .poll(async () => Number(await progress.getAttribute("aria-valuenow")))
    .toBeGreaterThan(0)
})

test("parallax background moves at 35 percent of foreground speed", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-parallax")
  const viewport = card.getByRole("region")
  await viewport.scrollIntoViewIfNeeded()
  const background = card.locator("[data-parallax-background]")
  const foreground = card.locator("[data-parallax-foreground]")
  const startBackground = (await background.boundingBox())!
  const startForeground = (await foreground.boundingBox())!
  await scrollTo(viewport, 160)
  await expect(background).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 104)")
  const endBackground = (await background.boundingBox())!
  const endForeground = (await foreground.boundingBox())!
  expect(startForeground.y - endForeground.y).toBeCloseTo(160, 0)
  expect(startBackground.y - endBackground.y).toBeCloseTo(56, 0)
})

test("sticky letters remain pinned and the next group replaces them", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-sticky")
  const viewport = card.getByRole("region")
  await viewport.scrollIntoViewIfNeeded()
  const letterA = card.locator('[data-sticky-letter="A"]')
  const letterB = card.locator('[data-sticky-letter="B"]')
  await scrollTo(viewport, 200)
  const top = (await viewport.boundingBox())!.y + 1
  await expect
    .poll(async () => (await letterA.boundingBox())!.y)
    .toBeCloseTo(top, 0)
  await scrollTo(viewport, 245)
  await expect
    .poll(async () => (await letterA.boundingBox())!.y)
    .toBeCloseTo(top, 0)
  await scrollTo(viewport, 500)
  await expect
    .poll(async () => (await letterB.boundingBox())!.y)
    .toBeCloseTo(top, 0)
  expect((await letterA.boundingBox())!.y).toBeLessThan(top)
})

test("snap settles on complete screens with wheel, keyboard and controls", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-snap")
  const viewport = card.getByRole("region", { name: /Scroll Snap 演示/ })
  await viewport.scrollIntoViewIfNeeded()
  const height = await viewport.evaluate((element) => element.clientHeight)
  await viewport.hover()
  await page.mouse.wheel(0, 220)
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBe(height)
  await expect(
    card.getByRole("button", { name: "跳到第 2 屏" }),
  ).toHaveAttribute("aria-pressed", "true")
  await card.getByRole("button", { name: "下一屏" }).click()
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBe(height * 2)
  await expect(card.getByRole("button", { name: "下一屏" })).toBeDisabled()
  await card.getByRole("button", { name: "跳到第 1 屏" }).click()
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBe(0)
  await viewport.focus()
  await page.keyboard.press("PageDown")
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBe(height)
})

test("vertical scrolling drives horizontal cards and resize preserves the full track", async ({
  page,
}) => {
  await page.goto("/scroll/")
  const card = page.locator("#scroll-horizontal")
  const viewport = card.getByRole("region")
  const track = card.locator("[data-horizontal-track]")
  await expect(viewport).toHaveAttribute("data-reduced-motion", "false")
  await viewport.scrollIntoViewIfNeeded()
  await viewport.hover()
  await page.mouse.wheel(0, 180)
  await expect
    .poll(() =>
      track.evaluate(
        (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
      ),
    )
    .toBeLessThan(-100)
  await scrollTo(viewport, 10000)
  const lastCard = track.locator("article").last()
  await expect
    .poll(async () => {
      const end = (await lastCard.boundingBox())!
      const box = (await viewport.boundingBox())!
      return end.x + end.width <= box.x + box.width
    })
    .toBe(true)
  await scrollTo(viewport, 0)
  await expect(track).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
  await page.setViewportSize({ width: 390, height: 844 })
  await viewport.scrollIntoViewIfNeeded()
  await scrollTo(viewport, 10000)
  await expect
    .poll(async () => {
      const end = (await lastCard.boundingBox())!
      const box = (await viewport.boundingBox())!
      return end.x + end.width <= box.x + box.width
    })
    .toBe(true)
})

test("reduced motion is respected initially and when the preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/scroll/")
  const trigger = page.locator("#scroll-triggered")
  await expect(trigger.locator("[data-reveal]").last()).toHaveCSS(
    "opacity",
    "1",
  )
  const background = page.locator("[data-parallax-background]")
  await scrollTo(page.locator("#scroll-parallax").getByRole("region"), 160)
  await expect(background).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)")
  const horizontal = page.locator("#scroll-horizontal").getByRole("region")
  await expect(horizontal).toHaveAttribute("data-reduced-motion", "true")
  await expect(horizontal).toHaveCSS("overflow-x", "auto")
  await horizontal.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  await expect
    .poll(() => horizontal.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await expect(horizontal).toHaveAttribute("data-reduced-motion", "false")
  await expect(trigger.locator("[data-reveal]").last()).toHaveAttribute(
    "data-visible",
    "false",
  )
})

test("mobile touch scrolling, dark theme, documentation and registry remain usable", async ({
  browser,
  request,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  try {
    await page.goto("/scroll/")
    await expect(page.getByRole("region", { name: /演示/ })).toHaveCount(6)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const linked = page.locator("#scroll-linked").getByRole("region")
    await linked.scrollIntoViewIfNeeded()
    const box = (await linked.boundingBox())!
    const session = await context.newCDPSession(page)
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + 240 }],
    })
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + 80 }],
    })
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    })
    await expect
      .poll(() => linked.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0)
    await page.screenshot({
      path: testInfo.outputPath("scroll-mobile.png"),
      fullPage: true,
    })
    await page.getByRole("button", { name: "切换深浅主题" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await page.screenshot({
      path: testInfo.outputPath("scroll-dark-mobile.png"),
      fullPage: true,
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.goto("/docs/scroll-playground/")
    await page.getByLabel("选择滚动效果").selectOption("horizontal")
    await expect(
      page.getByRole("region", { name: /Horizontal Scroll 演示/ }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto("/scroll/")
    await page.screenshot({
      path: testInfo.outputPath("scroll-dark-desktop.png"),
      fullPage: true,
    })
    await page.getByRole("button", { name: "切换深浅主题" }).click()
    await page.screenshot({
      path: testInfo.outputPath("scroll-desktop.png"),
      fullPage: true,
    })
  } finally {
    await context.close()
  }
  const response = await request.get("/r/scroll-playground.json")
  expect(response.ok()).toBe(true)
  const item = await response.json()
  expect(item.files).toHaveLength(2)
  expect(item.files[0].content).toContain("export function ScrollPlayground")
  expect(item.files[1].content).toContain("scroll-snap-type: y mandatory")
  expect(item.files[1].target).toBe(
    "components/blocks/scroll-playground.module.css",
  )
  expect(
    item.registryDependencies.some((url: string) =>
      url.endsWith("/r/theme.json"),
    ),
  ).toBe(true)
})
