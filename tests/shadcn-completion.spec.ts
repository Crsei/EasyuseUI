import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
const ids = [
  "button-group",
  "input-group",
  "toggle",
  "toggle-group",
  "input-otp",
  "separator",
  "collapsible",
  "accordion",
  "tooltip",
  "alert-dialog",
  "hover-card",
  "context-menu",
  "skeleton",
  "spinner",
  "empty",
  "alert",
  "progress",
  "toast",
  "sonner",
  "date-calendar",
  "date-picker",
  "pagination",
  "breadcrumb",
  "menubar",
  "navigation-menu",
  "direction",
  "attachment",
  "marker",
  "questionnaire",
  "bubble",
  "card",
  "aspect-ratio",
  "carousel",
  "chart",
  "form",
  "sidebar",
  "resizable",
  "scroll-area",
  "command",
  "drawer",
]
for (const id of ids)
  test(`${id} documentation mounts with its real exports and no automated accessibility violations`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(`/docs/${id}/`)
    const root = page.locator(`[data-demo-loader="${id}"]`)
    await expect(root).toHaveAttribute("data-demo-mounted", "true")
    expect(errors).toEqual([])
    const result = await new AxeBuilder({ page })
      .include(`[data-demo-loader="${id}"]`)
      .analyze()
    expect(result.violations).toEqual([])
  })

test("coarse pointers keep 44px date targets, carousel touch navigation and reduced motion", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  try {
    const page = await context.newPage()
    await page.goto("/docs/date-calendar/")
    const day = page
      .locator('[data-demo-loader="date-calendar"] [data-date="2026-10-09"]')
      .first()
    await expect(day).toBeVisible()
    const size = await day.boundingBox()
    expect(size!.width).toBeGreaterThanOrEqual(44)
    expect(size!.height).toBeGreaterThanOrEqual(44)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.goto("/docs/carousel/")
    const root = page.locator('[data-demo-loader="carousel"]')
    await expect(root.getByRole("status")).toHaveText("1 / 3")
    const viewport = root.locator('[aria-roledescription] > div[tabindex="0"]')
    const box = await viewport.boundingBox()
    const client = await context.newCDPSession(page)
    const y = box!.y + 16
    const x = box!.x + box!.width - 24
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    })
    for (let i = 1; i <= 4; i++)
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - i * 24, y }],
      })
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    })
    await expect(root.getByRole("status")).toHaveText("2 / 3")
    await client.detach()
    await page.goto("/docs/spinner/")
    await expect(page.locator('[data-demo-loader="spinner"] svg')).toHaveCSS(
      "animation-name",
      "none",
    )
  } finally {
    await context.close()
  }
})

test("component titles retain route-owned names through navigation and locale changes", async ({
  page,
}) => {
  await page.goto("/docs/input-otp/")
  await expect(page).toHaveTitle("InputOTP · EasyuseUI")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page).toHaveTitle("InputOTP · EasyuseUI")
  await page.locator('nav a[href="/docs/accordion/"]').click()
  await expect(page).toHaveTitle("Accordion · EasyuseUI")
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("zh-CN")
  await expect(page).toHaveTitle("Accordion · EasyuseUI")
})
