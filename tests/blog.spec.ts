import { expect, test } from "@playwright/test"
import { metricChange, type Metric } from "../lib/blog-model"
import { countNewIds } from "../lib/use-follow-tail"
import { publishedPosts } from "../lib/blog"

test("metrics distinguish unknown, zero, incompatible and regression", () => {
  const metric: Metric = {
    key: "time",
    label: { "zh-CN": "耗时" },
    unit: "ms",
    direction: "lower",
    before: 100,
    after: 80,
    target: null,
    statistic: "p95",
    sampleCount: 30,
    evidenceId: "report",
    beforeContext: "fixed",
    afterContext: "fixed",
  }
  expect(metricChange(metric)).toBe(20)
  expect(metricChange({ ...metric, after: 120 })).toBe(-20)
  expect(metricChange({ ...metric, before: 0 })).toBeNull()
  expect(metricChange({ ...metric, after: null })).toBeNull()
  expect(metricChange({ ...metric, afterContext: "different" })).toBeNull()
  expect(metricChange({ ...metric, direction: "higher" })).toBe(-20)
  expect(countNewIds(["a", "b"], ["b", "a", "c"])).toBe(1)
})

test("Blog search and filters restore from URL, back and locale changes", async ({
  page,
}) => {
  await page.goto("/blog/")
  const query = page.getByRole("searchbox", { name: "搜索优化方案" })
  await query.fill("Demo")
  await page
    .getByRole("combobox", { name: "分类", exact: true })
    .selectOption("performance")
  await expect(page).toHaveURL(/q=Demo/)
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    page.getByRole("searchbox", { name: "Search improvements" }),
  ).toHaveValue("Demo")
  await page
    .getByRole("link", {
      name: "Loading component demos on demand",
      exact: true,
    })
    .click()
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Loading component demos on demand",
  )
  await expect(page.getByRole("note")).toContainText("original Chinese")
  await page.goBack()
  await expect(
    page.getByRole("searchbox", { name: "Search improvements" }),
  ).toHaveValue("Demo")
  await expect(
    page.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("performance")
  await page.reload()
  await expect(
    page.getByRole("searchbox", { name: "Search improvements" }),
  ).toHaveValue("Demo")
  await page
    .getByRole("searchbox", { name: "Search improvements" })
    .fill("no-such-article")
  await expect(
    page.getByText("No matching articles", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Clear filters", exact: true }).click()
  await expect(page.locator("main ol > li")).toHaveCount(publishedPosts.length)
})

test("static Blog and catalog load no engine; one preview mounts and closes", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/blog/on-demand-demos/")
  await expect(page.locator(".react-flow")).toHaveCount(0)
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  await page.getByRole("button", { name: "加载演示", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "保存更改", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "关闭演示", exact: true }).click()
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  await page.goto("/components/")
  await expect(page.locator(".react-flow")).toHaveCount(0)
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  await page
    .getByRole("textbox", { name: "搜索组件", exact: true })
    .fill("Button")
  const entry = page.locator('[data-component-entry="button"]')
  await entry.getByRole("button", { name: "预览", exact: true }).click()
  await expect(
    entry.getByRole("button", { name: "保存更改", exact: true }),
  ).toBeVisible()
  await entry.getByRole("button", { name: "收起预览", exact: true }).click()
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  expect(errors).toEqual([])
})

test("draft and unknown posts stay absent from pages and sitemap", async ({
  request,
  page,
}) => {
  expect((await request.get("/blog/theme-isolation-draft/")).status()).toBe(404)
  expect((await request.get("/blog/unknown/")).status()).toBe(404)
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).toContain("/blog/on-demand-demos/")
  expect(sitemap).not.toContain("theme-isolation-draft")
  await page.goto("/blog/")
  await expect(page.locator("main")).not.toContainText("主题隔离工作稿")
})

test("an unavailable screenshot keeps the article and reports readable and can retry", async ({
  page,
}) => {
  await page.route(
    "**/blog/on-demand-demos/2026-10-08/before-components-light.png",
    (route) => route.abort(),
  )
  await page.goto("/blog/on-demand-demos/")
  await page
    .locator("figure")
    .filter({ hasText: "优化前，目录同时挂载所有示例。" })
    .scrollIntoViewIfNeeded()
  const failure = page.getByRole("status").filter({ hasText: "截图暂不可用" })
  await expect(failure).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "验证证据", exact: true }),
  ).toBeAttached()
  await page.unroute(
    "**/blog/on-demand-demos/2026-10-08/before-components-light.png",
  )
  await failure.getByRole("button", { name: "重试", exact: true }).click()
  await expect(failure).toHaveCount(0)
  await expect(
    page.locator('img[src$="before-components-light.png"]'),
  ).toBeVisible()
  await expect(
    page.locator('img[src$="before-components-light.png"]'),
  ).not.toHaveJSProperty("naturalWidth", 0)
})

test("article locale changes preserve the loaded workspace and local created session", async ({
  page,
}) => {
  await page.goto("/blog/controlled-layout/")
  await page.getByRole("button", { name: "加载演示", exact: true }).click()
  const demo = page.locator('[data-demo-mounted="true"]')
  await demo.getByRole("button", { name: "新建 Session", exact: true }).click()
  await expect(
    demo.getByRole("button", { name: /session-local-4/ }),
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(demo).toHaveCount(1)
  await expect(
    demo.getByRole("button", { name: /session-local-4/ }),
  ).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})

test("measurement articles fit desktop, tablet and phone with working evidence links", async ({
  page,
  request,
}) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const slug of [
      "canvas-indexes",
      "long-session-anchor",
      "theme-modes",
    ]) {
      await page.goto(`/blog/${slug}/`)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      for (const link of await page.locator("main a[download]").all()) {
        expect(
          (await request.get((await link.getAttribute("href"))!)).ok(),
        ).toBe(true)
      }
      await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
    }
  }
})

test("Blog supports narrow touch, dark theme and reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    colorScheme: "dark",
  })
  const page = await context.newPage()
  await page.goto(
    new URL("/blog/", test.info().project.use.baseURL as string).href,
  )
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await page
    .getByRole("link", {
      name: "Loading component demos on demand",
      exact: true,
    })
    .click()
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: "test-results/blog-mobile-english.png" })
  await context.close()
})

test("failed demo import retries without removing the article; closing a pending load ignores its result", async ({
  page,
}) => {
  await page.goto("/blog/on-demand-demos/")
  await page.waitForLoadState("networkidle")
  await page.route("**/_next/static/chunks/*.js", (route) =>
    route.abort("failed"),
  )
  await page.getByRole("button", { name: "加载演示", exact: true }).click()
  await expect(
    page.locator("[data-demo-loader]").getByRole("alert"),
  ).toContainText("演示加载失败")
  await expect(
    page.getByRole("heading", { name: "生产候选测量", exact: true }),
  ).toBeVisible()
  await page.unroute("**/_next/static/chunks/*.js")
  await page.getByRole("button", { name: "重试", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "保存更改", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "关闭演示", exact: true }).click()
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  await page.goto("/components/?q=Input")
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await pending
    await route.continue()
  })
  const entry = page.locator('[data-component-entry="input"]')
  await entry.getByRole("button", { name: "预览", exact: true }).click()
  await entry.getByRole("button", { name: "关闭演示", exact: true }).click()
  release()
  await page.waitForLoadState("networkidle")
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
})

test("common component article links evidence and keeps its table selection across locales", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).toContain("/blog/common-components-from-crm/")
  await page.goto("/blog/common-components-from-crm/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "从 CRM 页面提炼通用组件",
  )
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  const evidence = await request.get(
    "/blog/common-components-from-crm/2026-10-08/verification.json",
  )
  expect(evidence.ok()).toBe(true)
  const report = await evidence.json()
  expect(report.checks.fullBrowser.passed).toBeGreaterThanOrEqual(179)
  expect(report.checks.independentInstall.status).toBe("passed")
  expect(report.sourceSnapshotId).toMatch(/^[0-9a-f]{64}$/)
  await page
    .getByRole("button", { name: "加载演示", exact: true })
    .first()
    .click()
  const demo = page.locator('[data-demo-loader="data-table"]')
  await demo
    .getByRole("checkbox", { name: "选择 Alpha worker", exact: true })
    .check()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Extracting reusable components from a CRM page",
  )
  await expect(demo.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha",
  )
  await expect(page.getByRole("note")).toHaveCount(0)
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})
