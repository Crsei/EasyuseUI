import { chromium } from "@playwright/test"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
const origin = process.env.WORK_ITEMS_ORIGIN || "http://127.0.0.1:33112"
const output = path.resolve("public/blog/work-items-enhancements")
const samples = Number(process.env.WORK_ITEMS_SAMPLES || 3)
await mkdir(output, { recursive: true })
const sourcePaths = [
  "lib/work-items-model.ts",
  "lib/work-items-view.ts",
  "lib/i18n-messages.ts",
  "components/blocks/work-items-enhancements.tsx",
  "components/blocks/work-item-properties.tsx",
  "components/blocks/work-items-views.tsx",
  "components/blocks/work-items-workspace.tsx",
  "components/blocks/work-items-toolbar.tsx",
  "components/blocks/work-items.module.css",
  "components/examples/work-items/work-items-demo.tsx",
  "components/examples/work-items/use-work-items-url.ts",
  "tests/work-items-enhancements.spec.ts",
  "scripts/measure-work-items-enhancements.mjs",
]
async function hashes() {
  return Promise.all(
    sourcePaths.map(async (file) => ({
      file,
      sha256: createHash("sha256")
        .update(await readFile(file))
        .digest("hex"),
    })),
  )
}
const sources = await hashes()
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/google-chrome",
  args: ["--disable-dev-shm-usage"],
})
const measurements = [],
  screenshots = [],
  errors = []
const capturedAt = new Date().toISOString()
async function frames(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
}
async function scenario(page, value) {
  if (!(await page.getByLabel("示例场景", { exact: true }).isVisible()))
    await page
      .getByRole("button", { name: "展开底部面板", exact: true })
      .click()
  await page.getByLabel("示例场景", { exact: true }).selectOption(value)
}
async function screenshot(page, name) {
  await frames(page)
  await page.screenshot({ path: path.join(output, name) })
  screenshots.push({ file: name, capturedAt })
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  })
  page.on("pageerror", (error) => errors.push(error.message))
  page.setDefaultTimeout(60_000)
  for (const count of [50, 200, 1000])
    for (let sample = 0; sample < samples; sample++) {
      // Alternate order to reduce warm-cache/order bias. Both modes use the same optimized source.
      for (const deferred of sample % 2 ? [true, false] : [false, true]) {
        await page.goto(
          `${origin}/examples/work-items/?defer=${deferred ? 1 : 0}`,
        )
        await page.locator('[data-work-items-ready="true"]').waitFor()
        let begin = performance.now()
        await scenario(page, String(count))
        await page.waitForFunction(
          (n) => document.querySelectorAll("[data-work-item]").length === n,
          count,
        )
        await frames(page)
        const renderMs = performance.now() - begin
        const loadedText = await page
          .getByText(/^已加载 \d+ \/ 示例总数 \d+$/)
          .textContent()
        const [loaded, total] = (loadedText.match(/\d+/g) ?? []).map(Number)
        await page
          .getByRole("button", { name: "收起底部面板", exact: true })
          .click()
        const domCount = await page.locator("*").count()
        async function timed(action) {
          const begin = performance.now()
          await action()
          await frames(page)
          return performance.now() - begin
        }
        const row = page.locator('[data-work-item="wi-001"]')
        const selectMs = await timed(() => row.getByRole("checkbox").check())
        const fieldUpdateMs = await timed(async () => {
          await row
            .getByRole("combobox", { name: "优先级", exact: true })
            .click()
          await page.getByRole("option", { name: "High", exact: true }).click()
          await row
            .locator('[data-mutation="pending"]')
            .waitFor({ state: "hidden" })
        })
        const boardMs = await timed(() =>
          page.getByRole("radio", { name: "看板", exact: true }).check(),
        )
        const moveMs = await timed(async () => {
          await page
            .getByRole("button", { name: "移动 WI-001", exact: true })
            .click()
          await page
            .getByRole("button", { name: "移动到 Todo", exact: true })
            .click()
          await page.keyboard.press("Escape")
          await page
            .locator('[data-board-group="todo"] [data-work-item="wi-001"]')
            .waitFor()
        })
        const groupMs = await timed(async () => {
          await page.getByRole("button", { name: "显示", exact: true }).click()
          await page
            .getByLabel("分组", { exact: true })
            .selectOption("priority")
          await page.keyboard.press("Escape")
        })
        measurements.push({
          count,
          loaded,
          total,
          deferred,
          sample: sample + 1,
          mounted: await page.locator("[data-work-item]").count(),
          domCount,
          renderMs,
          selectMs,
          fieldUpdateMs,
          boardMs,
          moveMs,
          groupMs,
        })
        console.log(
          `Measured ${count} / deferred=${deferred} / sample=${sample + 1}`,
        )
      }
    }
  await page.goto(`${origin}/examples/work-items/?layout=board&lane=priority`)
  await page.locator("[data-work-items-lane]").first().waitFor()
  await screenshot(page, "swimlanes-1440-zh-CN.png")
  await page.goto(`${origin}/examples/work-items/?children=1`)
  await scenario(page, "hierarchy")
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
  await page
    .getByRole("button", { name: "展开或折叠 WI-001 的子项", exact: true })
    .click()
  await page
    .getByRole("button", { name: "展开或折叠 WI-002 的子项", exact: true })
    .click()
  await screenshot(page, "sub-items-1440-zh-CN.png")
  await scenario(page, "batch-mixed")
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
  for (const id of ["wi-001", "wi-002", "wi-003", "wi-004"])
    await page.locator(`[data-work-item="${id}"]`).getByRole("checkbox").check()
  await page.getByRole("button", { name: "预览批量修改", exact: true }).click()
  await screenshot(page, "batch-preview-1440-zh-CN.png")
  await page.getByRole("button", { name: "确认修改 3 项", exact: true }).click()
  await page
    .getByLabel("批量修改", { exact: true })
    .getByText("已确认 1 · 拒绝 1 · 提交中 0 · 待确认 1", { exact: true })
    .waitFor()
  await screenshot(page, "batch-outcomes-1440-zh-CN.png")
  await scenario(page, "normal")
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
  await page.getByRole("button", { name: "保存的视图", exact: true }).click()
  await page
    .getByRole("textbox", { name: "视图名称", exact: true })
    .fill("团队评审")
  await page.getByRole("button", { name: "另存当前视图", exact: true }).click()
  await page.getByRole("button", { name: "团队评审", exact: true }).waitFor()
  await screenshot(page, "saved-views-1440-zh-CN.png")
  await page.close()
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  await mobile.addInitScript(() => {
    localStorage.setItem("theme", "dark")
    localStorage.setItem("easyuseui-locale", "en")
  })
  await mobile.goto(
    `${origin}/examples/work-items/?layout=board&lane=priority`,
  )
  await mobile.locator('[data-work-items-ready="true"]').waitFor()
  await screenshot(mobile, "swimlanes-390-dark-en.png")
  await mobile.close()
  const final = await hashes()
  if (JSON.stringify(sources) !== JSON.stringify(final))
    throw new Error("Source changed during capture")
  const medians = []
  const metrics = [
    "renderMs",
    "selectMs",
    "fieldUpdateMs",
    "boardMs",
    "moveMs",
    "groupMs",
  ]
  for (const count of [50, 200, 1000])
    for (const deferred of [false, true]) {
      const rows = measurements.filter(
        (row) => row.count === count && row.deferred === deferred,
      )
      medians.push({
        count,
        deferred,
        samples: rows.length,
        ...Object.fromEntries(
          metrics.map((key) => {
            const values = rows.map((row) => row[key]).sort((a, b) => a - b)
            return [key, values[Math.floor(values.length / 2)]]
          }),
        ),
      })
    }
  await writeFile(
    path.join(output, "measurements.json"),
    JSON.stringify(
      {
        capturedAt,
        origin,
        method:
          "Same-source offscreen-layout toggle; Playwright action to two frames, includes automation and 120ms fixture receipts; native full DOM, no virtualization; shared host, not a service benchmark or p95",
        measurements,
        medians,
        errors,
      },
      null,
      2,
    ) + "\n",
  )
  await writeFile(
    path.join(output, "source-snapshot.json"),
    JSON.stringify({ capturedAt, files: sources }, null, 2) + "\n",
  )
  await writeFile(
    path.join(output, "screenshots.json"),
    JSON.stringify({ capturedAt, screenshots, errors }, null, 2) + "\n",
  )
  if (errors.length) throw new Error(errors.join("\n"))
} finally {
  await browser.close()
}
