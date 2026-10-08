import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("examples navigation opens the shared five-layout showcase and returns to the index", async ({
  page,
}) => {
  await page.goto("/components/")
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "示例", exact: true })
    .click()
  await expect(page).toHaveURL(/\/examples\/?$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("组件示例")
  await page.getByRole("link", { name: "Work Items", exact: true }).click()
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await expect(
    page.getByRole("navigation", { name: "主导航", exact: true }),
  ).toHaveCount(0)
  for (const [name, layout] of [
    ["看板", "board"],
    ["表格", "table"],
    ["时间线", "timeline"],
    ["日历", "calendar"],
    ["列表", "list"],
  ]) {
    await page.getByRole("radio", { name, exact: true }).check()
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe("/examples/work-items/")
    await expect
      .poll(() => new URL(page.url()).searchParams.get("layout"))
      .toBe(layout)
  }
  await page.getByRole("link", { name: "返回示例", exact: true }).click()
  await expect(page).toHaveURL(/\/examples\/?$/)
  await expect(
    page.getByRole("navigation", { name: "主导航", exact: true }),
  ).toBeVisible()
})

test("the legacy static entry preserves layout, dates, filters, object and history when forwarding", async ({
  page,
  request,
}) => {
  const shell = await request.get("/workspace/work-items/")
  expect(shell.ok()).toBe(true)
  const html = await shell.text()
  expect(html).toContain("/examples/work-items/")
  expect(html).not.toContain("data-work-items-ready")
  await page.goto("/components/")
  const params = new URLSearchParams({
    layout: "timeline",
    scale: "quarter",
    q: "Handle",
    timelineDate: "2026-10-09",
    calendarDate: "2026-11-04",
    weekends: "0",
    item: "WI-004",
  })
  await page.goto(`/workspace/work-items/?${params}#schedule`)
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await expect(page.locator('[data-detail-item="wi-004"]')).toBeVisible()
  const url = new URL(page.url())
  expect(url.pathname).toBe("/examples/work-items/")
  for (const [key, value] of params)
    expect(url.searchParams.get(key)).toBe(value)
  expect(url.hash).toBe("#schedule")
  await page.goBack()
  await expect(page).toHaveURL(/\/components\/?$/)
})

test("the examples index supports both locales, themes and coarse-pointer navigation at 390px", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  try {
    await page.goto("/examples/")
    const entry = page.getByRole("link", { name: "Work Items", exact: true })
    expect((await entry.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    for (const english of [false, true]) {
      if (english) {
        await page
          .getByRole("combobox", { name: "语言", exact: true })
          .selectOption("en")
        await page
          .getByRole("button", {
            name: "Toggle light and dark theme",
            exact: true,
          })
          .click()
      }
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        english ? "Component examples" : "组件示例",
      )
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true)
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
      expect(scan.violations).toEqual([])
      await expect(
        page.locator("button button, a button, button a, a a"),
      ).toHaveCount(0)
    }
    await entry.tap()
    await page.locator('[data-work-items-ready="true"]').waitFor()
    await expect(page).toHaveTitle("Work Items component example · EasyuseUI")
    await expect(
      page.getByRole("radio", { name: "Timeline", exact: true }),
    ).toBeVisible()
    await page
      .getByRole("link", { name: "Back to examples", exact: true })
      .tap()
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Component examples",
    )
  } finally {
    await context.close()
  }
})
