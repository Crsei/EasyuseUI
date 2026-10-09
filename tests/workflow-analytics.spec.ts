import { test, expect } from "@playwright/test"
import path from "node:path"
import fs from "node:fs/promises"
const route = "/examples/workflow-analytics/"
const widget = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`[data-widget="${id}"]`)
test("example gallery and source docs expose installed charts on the current site", async ({
  page,
}) => {
  await page.goto("/examples/")
  const example = page.locator('[data-example="workflow-analytics"]')
  await expect(example.getByRole("link").first()).toHaveAttribute("href", route)
  await expect
    .poll(() =>
      example
        .locator("img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.goto("/docs/statistical-chart/")
  await expect(
    page.getByRole("heading", { name: "StatisticalChart", exact: true }),
  ).toBeVisible()
  await expect(
    page.locator(".recharts-scatter-symbol circle[data-chart-point]"),
  ).toHaveCount(3)
  await page.getByRole("button", { name: "示例代码", exact: true }).click()
  const source = page.locator("#preview [data-source-browser]")
  await source
    .getByRole("button", { name: "读取所选文件", exact: true })
    .click()
  await expect(source.locator("pre")).toContainText("StatisticalChart")
})
test("project dashboard provides keyboard drilldown, historical membership, pagination and five existing layouts", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(route)
  const trend = widget(page, "completion-trend")
  await expect(trend.locator(".recharts-line")).toBeVisible()
  await trend.getByRole("button", { name: "数据表", exact: true }).click()
  await trend
    .getByRole("button", { name: "查看来源 2026-10-04", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("当时属于此集合")
  await expect(dialog).toContainText("已加载 2 / 2")
  await expect(dialog).toContainText("Preserve historical membership")
  await expect(dialog).toContainText("active")
  await dialog
    .getByRole("button", { name: "打开工作视图", exact: true })
    .click()
  for (const layout of ["列表", "看板", "表格", "时间线", "日历"]) {
    await page.getByRole("radio", { name: layout, exact: true }).click()
    await expect(page.locator("body")).toContainText("WA-")
  }
  await page.getByRole("button", { name: "返回分析", exact: true }).click()
  const status = widget(page, "status-distribution")
  const cursor = status.getByRole("group", {
    name: "方向键选择数据点，Enter 查看来源",
    exact: true,
  })
  await cursor.focus()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toContainText("已加载 2 / 5")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "加载更多", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("已加载 4 / 5")
  await page.keyboard.press("Escape")
  expect(errors).toEqual([])
})
test("point selection is local until apply; legend does not change total; scope changes isolate old data", async ({
  page,
}) => {
  await page.goto(route)
  const status = widget(page, "status-distribution")
  await status.getByRole("button", { name: "状态分布", exact: true }).click()
  await expect(status).toContainText("所有系列均已隐藏")
  await expect(widget(page, "summary")).toContainText("7")
  await status.getByRole("button", { name: "状态分布", exact: true }).click()
  await status.getByRole("button", { name: "数据表", exact: true }).click()
  await status
    .getByRole("button", { name: "查看来源 已完成", exact: true })
    .click()
  await expect(widget(page, "summary")).toContainText("7")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "应用为筛选", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "清除点选筛选", exact: true }),
  ).toBeVisible()
  await expect(widget(page, "summary")).toContainText("100")
  await page.getByRole("button", { name: "清除点选筛选", exact: true }).click()
  await page.getByLabel("Project", { exact: true }).selectOption("beta")
  await expect(widget(page, "summary")).toContainText("不适用")
  await expect(page.locator("body")).not.toContainText("Ship portable charts")
  await page.getByLabel("Fixture", { exact: true }).selectOption("denied")
  await expect(page.getByText("无权查看此范围", { exact: true })).toHaveCount(4)
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0)
})
test("loading, empty, partial, history missing and refresh failure are explicit", async ({
  page,
}) => {
  await page.goto(route)
  const fixture = page.getByLabel("Fixture", { exact: true })
  await fixture.selectOption("loading")
  await expect(page.locator('[data-data-state="loading"]')).toHaveCount(4)
  await fixture.selectOption("partial")
  await expect(widget(page, "status-distribution")).toContainText("部分数据")
  await fixture.selectOption("no-history")
  await expect(widget(page, "completion-trend")).toContainText(
    "缺少完整期初状态或历史",
  )
  await fixture.selectOption("error")
  await expect(widget(page, "status-distribution")).toContainText(
    "可能不是最新数据",
  )
  await expect(
    widget(page, "status-distribution").locator(".recharts-pie"),
  ).toBeVisible()
  await widget(page, "status-distribution")
    .getByRole("button", { name: "重试读取", exact: true })
    .click()
  await expect(page.getByText("模拟刷新失败", { exact: false })).toHaveCount(0)
  await fixture.selectOption("late-response")
  await expect(page.getByText("正在读取新范围", { exact: true })).toHaveCount(4)
  await expect(page.locator(".recharts-wrapper")).toHaveCount(0)
  await fixture.selectOption("empty")
  await expect(widget(page, "status-distribution")).toContainText("全部为零")
})
for (const width of [1440, 1024, 768, 390])
  test(`responsive ${width}px, English, dark, reduced motion and screenshot`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(route)
    await expect(
      widget(page, "status-distribution").locator(".recharts-pie"),
    ).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
    const title = page.getByRole("heading", { name: "项目概览", exact: true })
    expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
      "20px",
    )
    const dir = path.resolve("public/blog/workflow-analytics")
    await fs.mkdir(dir, { recursive: true })
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: path.join(dir, `project-light-${width}.png`),
      })
      await fs.copyFile(
        path.join(dir, `project-light-${width}.png`),
        `public/site/scenes/workflow-analytics-${width === 1440 ? "desktop" : "mobile"}-light.png`,
      )
    }
    await page.getByRole("button", { name: "English", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "Project overview", exact: true }),
    ).toBeVisible()
    await page.getByRole("button", { name: "Theme", exact: true }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(
      widget(page, "status-distribution").locator(".recharts-pie"),
    ).toBeVisible()
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: path.join(dir, `project-dark-${width}.png`),
      })
      await fs.copyFile(
        path.join(dir, `project-dark-${width}.png`),
        `public/site/scenes/workflow-analytics-${width === 1440 ? "desktop" : "mobile"}-dark.png`,
      )
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false)
  })
test("touch point and data table share selection, CSV metadata and source detail", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    baseURL,
  })
  const page = await context.newPage()
  await page.goto(route)
  const status = widget(page, "status-distribution")
  await status.locator(".recharts-pie-sector").nth(2).tap()
  await expect(page.getByRole("dialog")).toContainText("Ship portable charts")
  await page.keyboard.press("Escape")
  const download = page.waitForEvent("download")
  await status.getByRole("button", { name: "导出 CSV", exact: true }).click()
  const file = await (await download).path()
  expect(file).toBeTruthy()
  const csv = await fs.readFile(file!, "utf8")
  expect(csv).toContain("fixture-snapshot-9")
  expect(csv).toContain("Asia/Shanghai")
  expect(csv).toContain("status-distribution@1")
  await context.close()
})

test("ordinary routes keep the statistical engine out of downloaded JavaScript", async ({
  browser,
  baseURL,
}) => {
  test.skip(
    !!process.env.WORKFLOW_ANALYTICS_EXTERNAL,
    "Measure production chunks only",
  )
  const report: Record<
    string,
    { jsBytes: number; statisticalEngineLoaded: boolean }
  > = {}
  for (const route of ["/", "/docs/button/", "/examples/workflow-analytics/"]) {
    const context = await browser.newContext({ baseURL })
    const page = await context.newPage()
    const bodies: Promise<string>[] = []
    page.on("response", (response) => {
      if (
        response.url().includes("/_next/") &&
        /\.js(?:\?|$)/.test(response.url())
      )
        bodies.push(response.text().catch(() => ""))
    })
    await page.goto(route)
    if (route.includes("workflow-analytics"))
      await expect(page.locator(".recharts-pie")).toBeVisible()
    else await expect(page.locator("main")).toBeVisible()
    const scripts = await Promise.all(bodies)
    report[route] = {
      jsBytes: scripts.reduce((sum, s) => sum + Buffer.byteLength(s), 0),
      statisticalEngineLoaded: scripts.some((s) =>
        s.includes("recharts-wrapper"),
      ),
    }
    await context.close()
  }
  expect(report["/"].statisticalEngineLoaded).toBe(false)
  expect(report["/docs/button/"].statisticalEngineLoaded).toBe(false)
  expect(report["/examples/workflow-analytics/"].statisticalEngineLoaded).toBe(
    true,
  )
  await fs.writeFile(
    "public/blog/workflow-analytics/bundle-isolation.json",
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        method:
          "fresh production browser contexts; decoded downloaded script bytes; no gzip equivalence",
        routes: report,
      },
      null,
      2,
    ) + "\n",
  )
})
