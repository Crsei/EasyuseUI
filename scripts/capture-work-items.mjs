import { chromium } from "@playwright/test"
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
const origin = process.env.WORK_ITEMS_ORIGIN || "http://127.0.0.1:3011"
const output = path.resolve("public/blog/work-items")
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--disable-dev-shm-usage"],
})
const capturedAt = new Date().toISOString()
const screenshots = []
const errors = []
async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = path.join(directory, entry.name)
        return entry.isDirectory() ? sourceFiles(file) : file
      }),
    )
  ).flat()
}
const sources = [
  "lib/work-items-model.ts",
  "lib/work-items-view.ts",
  "lib/grouped-items-model.ts",
  "components/blocks/grouped-list.tsx",
  "components/blocks/grouped-list.module.css",
  "components/blocks/work-items-board-base.tsx",
  "components/blocks/work-items-board-base.module.css",
  "components/blocks/work-item.tsx",
  "components/blocks/work-item-properties.tsx",
  "components/blocks/work-item-detail.tsx",
  "components/blocks/work-items-views.tsx",
  "components/blocks/work-items-toolbar.tsx",
  "components/blocks/work-items-workspace.tsx",
  "components/blocks/work-items.module.css",
  "components/examples/work-items-components-demo.tsx",
  "app/examples/work-items/page.tsx",
  "tests/work-items.spec.ts",
  "scripts/work-items-consumer.mjs",
  "scripts/capture-work-items.mjs",
  ...(await sourceFiles("components/examples/work-items")),
].sort()
async function hashSources() {
  return Promise.all(
    sources.map(async (file) => ({
      file,
      sha256: createHash("sha256")
        .update(await readFile(file))
        .digest("hex"),
    })),
  )
}
const files = await hashSources()
try {
  for (const [width, height] of [
    [1440, 1000],
    [1024, 768],
    [390, 844],
  ])
    for (const theme of ["light", "dark"])
      for (const locale of ["zh-CN", "en"]) {
        const page = await browser.newPage({
          viewport: { width, height },
          reducedMotion: "reduce",
        })
        page.on("pageerror", (e) => errors.push(e.message))
        await page.addInitScript(
          ({ theme, locale }) => {
            localStorage.setItem("theme", theme)
            localStorage.setItem("easyuseui-locale", locale)
          },
          { theme, locale },
        )
        for (const layout of ["list", "board", "table"]) {
          await page.goto(`${origin}/examples/work-items/?layout=${layout}`)
          await page.locator('[data-work-items-ready="true"]').waitFor()
          await page.evaluate(
            () =>
              new Promise((r) =>
                requestAnimationFrame(() => requestAnimationFrame(r)),
              ),
          )
          const name = `${layout}-${width}-${theme}-${locale}.png`
          await page.screenshot({ path: path.join(output, name) })
          screenshots.push({
            file: name,
            layout,
            viewport: { width, height },
            theme,
            locale,
            capturedAt,
          })
        }
        await page.close()
      }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  await page.goto(`${origin}/examples/work-items/?item=WI-008`)
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await page.screenshot({
    path: path.join(output, "detail-1440-light-zh-CN.png"),
  })
  screenshots.push({
    file: "detail-1440-light-zh-CN.png",
    layout: "list",
    scenario: "detail",
    viewport: { width: 1440, height: 1000 },
    theme: "light",
    locale: "zh-CN",
    capturedAt,
  })
  for (const scenario of ["partial", "readonly", "unknown"]) {
    await page.goto(`${origin}/examples/work-items/?layout=board`)
    await page.locator('[data-work-items-ready="true"]').waitFor()
    await page
      .getByRole("button", { name: "展开底部面板", exact: true })
      .click()
    await page.getByLabel("示例场景", { exact: true }).selectOption(scenario)
    if (scenario === "unknown") {
      await page
        .getByRole("button", { name: "移动 WI-001", exact: true })
        .click()
      await page
        .getByRole("button", { name: "移动到 Todo", exact: true })
        .click()
      await page.keyboard.press("Escape")
      await page
        .locator('[data-work-item="wi-001"] [data-mutation="unknown"]')
        .waitFor()
    }
    await page
      .getByRole("button", { name: "收起底部面板", exact: true })
      .click()
    const name = `board-${scenario}-1440-light-zh-CN.png`
    await page.screenshot({ path: path.join(output, name) })
    screenshots.push({
      file: name,
      layout: "board",
      scenario,
      viewport: { width: 1440, height: 1000 },
      theme: "light",
      locale: "zh-CN",
      capturedAt,
    })
  }
  const measurements = []
  for (const count of [50, 200, 1000]) {
    await page.goto(`${origin}/examples/work-items/`)
    await page.locator('[data-work-items-ready="true"]').waitFor()
    await page
      .getByRole("button", { name: "展开底部面板", exact: true })
      .click()
    const begin = performance.now()
    await page
      .getByLabel("示例场景", { exact: true })
      .selectOption(String(count))
    await page.waitForFunction(
      (n) => document.querySelectorAll("[data-work-item]").length === n,
      count,
    )
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    )
    const renderMs = performance.now() - begin
    const domCount = await page.locator("*").count()
    async function timed(action) {
      const begin = performance.now()
      await action()
      await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r)),
          ),
      )
      return performance.now() - begin
    }
    const selectMs = await timed(() =>
      page.locator('[data-work-item="wi-001"]').getByRole("checkbox").check(),
    )
    const fieldUpdateMs = await timed(async () => {
      await page.locator('[data-work-item="wi-001"] a').click()
      const detail = page.locator('[data-detail-item="wi-001"]')
      await detail
        .getByLabel("标题", { exact: true })
        .fill("Measured field update")
      await detail
        .getByRole("button", { name: "保存标题", exact: true })
        .click()
      await page
        .locator('[data-work-item="wi-001"]')
        .getByText("Measured field update", { exact: true })
        .waitFor()
      await page
        .getByRole("button", { name: "关闭 Inspector", exact: true })
        .click()
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
    await page.getByRole("button", { name: "显示", exact: true }).click()
    const groupMs = await timed(() =>
      page.getByLabel("分组", { exact: true }).selectOption("priority"),
    )
    await page.keyboard.press("Escape")
    measurements.push({
      count,
      loaded: await page.locator("[data-work-item]").count(),
      domCount,
      renderMs,
      selectMs,
      fieldUpdateMs,
      boardMs,
      moveMs,
      groupMs,
      samples: 1,
      method:
        "Playwright action to two animation frames; includes browser automation and fixture latency (120ms); not a service benchmark",
    })
  }
  await page.close()
  await writeFile(
    path.join(output, "measurements.json"),
    JSON.stringify({ capturedAt, origin, measurements, errors }, null, 2) +
      "\n",
  )
  if (JSON.stringify(files) !== JSON.stringify(await hashSources()))
    throw new Error(
      "Source changed during capture; discard the capture and rebuild",
    )
  const sourceSnapshotId = createHash("sha256")
    .update(JSON.stringify(files))
    .digest("hex")
  await writeFile(
    path.join(output, "source-snapshot.json"),
    JSON.stringify(
      { sourceSnapshotId, files, capturedAt, screenshots },
      null,
      2,
    ) + "\n",
  )
  console.log(
    JSON.stringify({
      sourceSnapshotId,
      screenshots: screenshots.length,
      measurements,
      errors,
    }),
  )
} finally {
  await browser.close()
}
