import { chromium } from "@playwright/test"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import assert from "node:assert/strict"
const origin = process.env.WORK_ITEMS_ORIGIN || "http://127.0.0.1:33115",
  root = path.resolve(import.meta.dirname, ".."),
  out = path.join(root, "public/blog/work-items-schedule")
await mkdir(out, { recursive: true })
const files = [
  "lib/work-items-model.ts",
  "lib/work-items-view.ts",
  "lib/schedule-date-utils.ts",
  "lib/schedule-view-model.ts",
  ...[
    "timeline.tsx",
    "timeline.module.css",
    "calendar.tsx",
    "calendar.module.css",
    "schedule-view-controls.tsx",
    "schedule.module.css",
    "work-item-timeline.tsx",
    "work-item-calendar.tsx",
    "work-item-date-range-field.tsx",
    "work-items-schedule.tsx",
    "work-items-workspace.tsx",
    "work-items-toolbar.tsx",
    "work-item-properties.tsx",
    "work-item-detail.tsx",
  ].map((f) => `components/blocks/${f}`),
  ...[
    "work-items-demo.tsx",
    "use-work-items-url.ts",
    "fixtures.ts",
    "commands.ts",
  ].map((f) => `components/examples/work-items/${f}`),
  "tests/work-items-schedule.spec.ts",
]
const hash = (data) => createHash("sha256").update(data).digest("hex")
async function snapshot() {
  return Object.fromEntries(
    await Promise.all(
      files.map(async (f) => [f, hash(await readFile(path.join(root, f)))]),
    ),
  )
}
const sources = await snapshot(),
  id = hash(JSON.stringify(sources)),
  capturedAt = new Date().toISOString(),
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      "/usr/bin/google-chrome",
    args: ["--disable-dev-shm-usage"],
  }),
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
  errors = []
page.on("pageerror", (e) => errors.push(e.message))
async function ready(query) {
  await page.goto(`${origin}/examples/work-items/?${query}`)
  await page.locator('[data-work-items-ready="true"]').waitFor()
}
async function scenario(value) {
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  await page.getByLabel("示例场景", { exact: true }).selectOption(value)
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
}
async function frames() {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
}
const shots = [],
  observations = []
async function shot(name) {
  await frames()
  await page.screenshot({ path: path.join(out, `${name}.png`) })
  shots.push({
    file: `${name}.png`,
    capturedAt,
    sourceSnapshotId: id,
    viewport: page.viewportSize(),
    fixture: "Local deterministic Work Items",
    url: new URL(page.url()).search,
  })
}
try {
  for (const scale of ["week", "month", "quarter"]) {
    await ready(`layout=timeline&scale=${scale}`)
    await shot(`timeline-${scale}`)
  }
  await page.setViewportSize({ width: 1024, height: 900 })
  await shot("timeline-quarter-1024")
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator("[data-unscheduled] summary").click()
  await shot("timeline-unscheduled")
  await scenario("readonly")
  await shot("timeline-readonly")
  await scenario("rejected")
  await page
    .locator('[data-timeline-row="wi-004"]')
    .getByRole("button", { name: "修改 WI-004 的日期", exact: true })
    .click()
  const form = page.locator('[data-schedule-form="wi-004"]')
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-18")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page
    .locator('[data-timeline-row="wi-004"] [data-mutation="rejected"]')
    .waitFor()
  await shot("timeline-rejected")
  await page.keyboard.press("Escape")
  await scenario("unknown")
  await page
    .locator('[data-timeline-row="wi-004"]')
    .getByRole("button", { name: "修改 WI-004 的日期", exact: true })
    .click()
  const unknown = page.locator('[data-schedule-form="wi-004"]')
  await unknown.getByLabel("截止日期", { exact: true }).fill("2026-10-18")
  await unknown.getByRole("button", { name: "确认日期", exact: true }).click()
  await page
    .locator('[data-timeline-row="wi-004"] [data-mutation="unknown"]')
    .waitFor()
  await page.keyboard.press("Escape")
  await shot("timeline-unknown")
  for (const mode of ["month", "week"]) {
    await ready(`layout=calendar&mode=${mode}`)
    await page.getByRole("button", { name: "2026-10-08", exact: true }).click()
    await shot(`calendar-${mode}`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await ready("layout=calendar")
  await page.getByRole("button", { name: "2026-10-08", exact: true }).click()
  await page.locator("[data-calendar-agenda]").scrollIntoViewIfNeeded()
  await shot("calendar-agenda-390")
  await page.getByRole("button", { name: "English", exact: true }).click()
  await page.getByRole("button", { name: "Switch theme", exact: true }).click()
  await shot("calendar-agenda-390-dark-en")
  await page.getByRole("button", { name: "中文", exact: true }).click()
  await page.getByRole("button", { name: "切换主题", exact: true }).click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const count of [50, 200, 1000])
    for (const layout of ["timeline", "calendar"])
      for (let sample = 1; sample <= 3; sample++) {
        await ready(`layout=${layout}`)
        await scenario(String(count))
        await frames()
        const dom = await page.evaluate(() => ({
          elements: document.querySelectorAll("*").length,
          mounted: new Set(
            [
              ...document.querySelectorAll(
                "[data-timeline-row],[data-calendar-entry]",
              ),
            ].map(
              (el) =>
                el.getAttribute("data-timeline-row") ||
                el.getAttribute("data-calendar-entry"),
            ),
          ).size,
        }))
        const renderStart = performance.now()
        await page
          .getByRole("radio", {
            name: layout === "timeline" ? "日历" : "时间线",
            exact: true,
          })
          .check()
        await page
          .getByRole("radio", {
            name: layout === "timeline" ? "时间线" : "日历",
            exact: true,
          })
          .check()
        await frames()
        const layoutSwitchMs = performance.now() - renderStart
        if (layout === "calendar")
          await page
            .getByRole("button", { name: "2026-10-08", exact: true })
            .click()
        const owner = page.locator(
          layout === "timeline"
            ? '[data-timeline-row="wi-004"]'
            : '[data-calendar-agenda] [data-calendar-entry="wi-004"]',
        )
        await owner
          .getByRole("button", { name: "修改 WI-004 的日期", exact: true })
          .click()
        const field = page.locator('[data-schedule-form="wi-004"]')
        await field.getByLabel("截止日期", { exact: true }).fill("2026-10-15")
        const dateStart = performance.now()
        await field
          .getByRole("button", { name: "确认日期", exact: true })
          .click()
        if (layout === "timeline")
          await page
            .locator(
              '[data-timeline-row="wi-004"] [data-schedule-start][data-schedule-end="2026-10-15"]',
            )
            .waitFor()
        else
          await page
            .locator(
              '[data-calendar-day="2026-10-15"] [data-calendar-entry="wi-004"]',
            )
            .waitFor()
        await frames()
        const dateChangeMs = performance.now() - dateStart
        await page.keyboard.press("Escape")
        const viewportStart = performance.now()
        await page
          .getByRole("button", { name: "下一范围", exact: true })
          .click()
        await page
          .getByRole("button", { name: "上一范围", exact: true })
          .click()
        await frames()
        const viewportRoundTripMs = performance.now() - viewportStart
        const observation = {
          count,
          loadedCount: count,
          totalCount: count,
          layout,
          sample,
          dom,
          layoutSwitchMs: Math.round(layoutSwitchMs),
          dateChangeMs: Math.round(dateChangeMs),
          viewportRoundTripMs: Math.round(viewportRoundTripMs),
        }
        observations.push(observation)
        console.log(JSON.stringify(observation))
      }
  assert.deepEqual(errors, [])
  assert.deepEqual(await snapshot(), sources, "Sources changed during capture")
  await writeFile(
    path.join(out, "source-snapshot.json"),
    JSON.stringify({ id, capturedAt, files: sources }, null, 2) + "\n",
  )
  await writeFile(
    path.join(out, "screenshots.json"),
    JSON.stringify({ sourceSnapshotId: id, capturedAt, shots }, null, 2) + "\n",
  )
  await writeFile(
    path.join(out, "measurements.json"),
    JSON.stringify(
      {
        sourceSnapshotId: id,
        capturedAt,
        environment:
          "Shared GLIBC 2.28 host, Next 16.3.8 Webpack/WASM production preview, Chromium",
        method:
          "3 samples per count and time layout. Date edit includes Playwright, 120ms fixture receipt and two frames. Layout and range measurements are round trips. Complete local fixture, retained DOM; no service latency or SLA claim.",
        observations,
      },
      null,
      2,
    ) + "\n",
  )
  console.log(
    `PASS schedule captures ${shots.length}, observations ${observations.length}, snapshot ${id}`,
  )
} finally {
  await browser.close()
}
