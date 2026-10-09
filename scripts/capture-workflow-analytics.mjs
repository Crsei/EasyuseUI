import fs from "node:fs/promises"
import path from "node:path"
import { chromium } from "@playwright/test"
import { analyticsSourceSnapshot } from "./workflow-analytics-snapshot.mjs"
const root = path.resolve(import.meta.dirname, ".."),
  destination = path.join(root, "public/blog/workflow-analytics/full"),
  origin = process.env.WORKFLOW_ANALYTICS_ORIGIN ?? "http://127.0.0.1:3016",
  snapshot = await analyticsSourceSnapshot()
await fs.mkdir(destination, { recursive: true })
const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--disable-dev-shm-usage"],
  }),
  screens = [],
  performanceRows = []
try {
  for (const width of [1440, 1024, 768, 390])
    for (const theme of ["light", "dark"])
      for (const locale of ["zh-CN", "en"]) {
        const context = await browser.newContext({
            viewport: { width, height: 1000 },
            reducedMotion: "reduce",
          }),
          page = await context.newPage()
        await page.addInitScript(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        )
        await page.goto(origin + "/examples/workflow-analytics/")
        await page.locator(".recharts-line").first().waitFor()
        if (locale === "en")
          await page
            .getByRole("button", { name: "English", exact: true })
            .click()
        await page.waitForFunction(
          (theme) => document.documentElement.classList.contains(theme),
          theme,
        )
        await page.evaluate(() => document.fonts.ready)
        const file = `overview-${width}-${theme}-${locale}.png`
        await page.screenshot({ path: path.join(destination, file) })
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        )
        if (overflow) throw new Error(`Horizontal overflow: ${file}`)
        screens.push({
          file,
          viewport: { width, height: 1000 },
          theme,
          locale,
          capturedAt: new Date().toISOString(),
          sourceSnapshotId: snapshot.sourceSnapshotId,
          fixture: "workflow-fixture-90d-v2; alpha; 30d; asOf; Asia/Shanghai",
        })
        if (locale === "zh-CN" && (width === 1440 || width === 390))
          await fs.copyFile(
            path.join(destination, file),
            path.join(
              root,
              `public/site/scenes/workflow-analytics-${width === 1440 ? "desktop" : "mobile"}-${theme}.png`,
            ),
          )
        await context.close()
      }
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    }),
    page = await context.newPage()
  for (const view of [
    "agents",
    "resources",
    "delivery",
    "flow",
    "risk",
    "custom",
    "builder",
    "traceability",
    "charts",
  ]) {
    await page.goto(
      origin + `/examples/workflow-analytics/?view=${view}&range=90d`,
    )
    await page.waitForSelector("[data-showcase-view]")
    await page.waitForFunction(
      () => document.querySelectorAll('[aria-busy="true"]').length === 0,
    )
    if (view === "builder")
      await page.getByRole("button", { name: "预览查询", exact: true }).click()
    if (view === "charts")
      await page
        .getByRole("button", { name: "加载此图预览", exact: true })
        .click()
    const file = `scene-${view}.png`
    await page.screenshot({ path: path.join(destination, file) })
    screens.push({
      file,
      view,
      viewport: { width: 1440, height: 1000 },
      theme: "light",
      locale: "zh-CN",
      capturedAt: new Date().toISOString(),
      sourceSnapshotId: snapshot.sourceSnapshotId,
      fixture: "workflow-fixture-90d-v2; alpha; 90d",
    })
  }
  for (const widgets of [4, 8, 12])
    for (const points of [100, 1000, 10000]) {
      await page.goto(origin + "/examples/workflow-analytics/benchmark/")
      await page.locator(".recharts-line").first().waitFor()
      await page
        .getByLabel("Widgets", { exact: true })
        .selectOption(String(widgets))
      await page
        .getByLabel("Points", { exact: true })
        .selectOption(String(points === 100 ? 1000 : 100))
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const start = performance.now()
      await page
        .getByLabel("Points", { exact: true })
        .selectOption(String(points))
      await page.waitForFunction(
        ({ widgets, points }) =>
          document.querySelectorAll("[data-chart-frame]").length === widgets &&
          document.querySelectorAll("circle[data-chart-point]").length >=
            points,
        { widgets, points },
      )
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const chartPaintMs = performance.now() - start
      const filterStart = performance.now()
      const previous = await page
        .locator("[data-performance-ready]")
        .getAttribute("data-performance-ready")
      await page
        .getByRole("button", { name: "Filter benchmark", exact: true })
        .click()
      await page.waitForFunction(
        (previous) =>
          document
            .querySelector("[data-performance-ready]")
            .getAttribute("data-performance-ready") !== previous,
        previous,
      )
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const filterMs = performance.now() - filterStart
      const drillStart = performance.now()
      await page
        .getByRole("button", { name: /查看来源:/ })
        .first()
        .click()
      await page.getByRole("dialog").waitFor()
      const drilldownMs = performance.now() - drillStart
      performanceRows.push({
        widgets,
        points,
        totalPointsRendered: Math.ceil(points / widgets) * widgets,
        chartPaintMs,
        filterMs,
        drilldownMs,
        drilldownRecords: 1,
        theme: "light",
        locale: "zh-CN",
        viewport: { width: 1440, height: 1000 },
        sourceSnapshotId: snapshot.sourceSnapshotId,
      })
    }
  await context.close()
  const report = {
    ...snapshot,
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    environment: { node: process.version, platform: process.platform },
    screens,
    performanceRows,
    method:
      "Screenshot matrix: 4 widths × 2 themes × 2 locales; additional scenes. Browser timings include Playwright interaction and two RAFs; chart timing is a point-count update after preparing the target widget layout; drilldown opens one synthetic source record; total points distributed across widgets; one sample each. Baseline observations, no before/after or service capacity claims.",
  }
  await fs.writeFile(
    path.join(destination, "capture.json"),
    JSON.stringify(report, null, 2) + "\n",
  )
  console.log(
    JSON.stringify({
      sourceSnapshotId: snapshot.sourceSnapshotId,
      screens: screens.length,
      performanceRows: performanceRows.length,
    }),
  )
} finally {
  await browser.close()
}
