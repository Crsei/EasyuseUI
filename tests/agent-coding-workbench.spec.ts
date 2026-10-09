import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { readFile, writeFile } from "node:fs/promises"
const root =
  "/examples/agent-workbench/app/?template=coding&page=session&session=session-filter"
const input = (page: Page) =>
  page.getByRole("textbox", { name: "消息输入", exact: true })
async function command(page: Page, name: string) {
  await page.getByRole("button", { name: "/ 命令菜单", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("combobox").fill(name)
  await dialog.getByRole("option").filter({ hasText: name }).first().click()
}
async function file(page: Page, name: string) {
  await command(page, name)
  const preview = page.getByRole("dialog")
  await expect(
    preview.getByRole("heading", { name, exact: true }),
  ).toBeVisible()
  return preview
}
async function source(page: Page, action: string) {
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: action, exact: true })
    .last()
    .click()
  await page.keyboard.press("Escape")
}
async function openSettings(page: Page) {
  const more = page.getByRole("button", { name: "更多工作台工具", exact: true })
  if (await more.isVisible()) {
    await more.click()
    await page.getByRole("menuitem", { name: "工作台设置", exact: true }).click()
  } else {
    await page.getByRole("navigation", { name: "工作台工具" }).getByRole("button", { name: "工作台设置", exact: true }).click()
  }
}
test("activity navigation, URL history and file docking preserve the composer instance and IME draft", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(root)
  const field = input(page)
  await field.fill("中文草稿 / not a command")
  await field.evaluate((node) => node.setAttribute("data-instance", "retained"))
  await field.dispatchEvent("compositionstart")
  await field.press("Enter")
  await field.dispatchEvent("compositionend")
  const composedDraft = await field.inputValue()
  await expect(page.locator("[data-request-id]")).toHaveCount(0)
  await page.getByRole("link", { name: "变更", exact: true }).click()
  await expect(page).toHaveURL(/page=review/)
  await page.goBack()
  await expect(field).toHaveValue(composedDraft)
  await expect(field).toHaveAttribute("data-instance", "retained")
  const preview = await file(page, "workbench.md")
  await preview.getByRole("button", { name: "固定标签", exact: true }).click()
  await expect(
    page.getByRole("tab", { name: /workbench.md @fixture-1/ }),
  ).toBeVisible()
  await expect(page.getByRole("tabpanel", { name: /workbench.md/ })).toContainText("这是可以下载的真实 fixture 文本")
  await page.goBack()
  await expect(field).toHaveValue(composedDraft)
  await expect(field).toHaveAttribute("data-instance", "retained")
  await page.goForward()
  await expect(page.getByRole("tab", { name: /workbench.md @fixture-1/ })).toBeVisible()
  await page.getByRole("button", { name: "对话", exact: true }).click()
  await expect(field).toHaveValue(composedDraft)
  await expect(field).toHaveAttribute("data-instance", "retained")
})
test("settings use shared drafts, topmost Escape and source receipts; cancel never changes effective values", async ({
  page,
}) => {
  await page.goto(root)
  await input(page).fill("Original selection")
  await page
    .getByRole("button", { name: "工作台设置", exact: true })
    .first()
    .click()
  let dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "权限", exact: true }).click()
  const select = dialog.getByRole("combobox", {
    name: "权限请求（服务确认）",
    exact: true,
  })
  await select.click()
  await expect(page.getByRole("option", { name: "Read only", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(select).toHaveAttribute("aria-expanded", "false")
  await expect(dialog).toBeVisible()
  await select.click()
  await page.getByRole("option", { name: "Read only", exact: true }).click()
  await dialog.getByRole("button", { name: "取消修改", exact: true }).click()
  await expect(select).toHaveText("Ask before writes")
  await select.click()
  await page.getByRole("option", { name: "Read only", exact: true }).click()
  await dialog.getByRole("button", { name: "应用配置", exact: true }).click()
  await expect(dialog).toContainText("等待来源确认")
  await page.keyboard.press("Escape")
  await expect(input(page)).toHaveValue("Original selection")
  await source(page, "确认丢失")
  await page
    .getByRole("button", { name: "工作台设置", exact: true })
    .first()
    .click()
  dialog = page.getByRole("dialog")
  await expect(
    dialog.getByRole("button", { name: "应用配置", exact: true }),
  ).toBeDisabled()
  await dialog
    .getByRole("button", { name: "查询操作结果", exact: true })
    .click()
  await dialog.getByRole("button", { name: "权限", exact: true }).click()
  await expect(dialog).toContainText("已生效值: read")
  await page.keyboard.press("Escape")
  await expect(input(page)).toHaveValue("Original selection")
})
test("context picker confirms a selection set, previews bytes and removes only the reference", async ({
  page,
}) => {
  await page.goto(root)
  await input(page).fill("引用前草稿")
  await page.getByRole("button", { name: "@ 添加引用", exact: true }).click()
  let dialog = page.getByRole("dialog")
  await dialog.getByRole("textbox", { name: "搜索来源" }).fill("src/filter.ts")
  await dialog.getByRole("checkbox").last().check()
  await dialog.getByRole("button", { name: "取消", exact: true }).click()
  await expect(
    page.locator("[data-composer-references] [data-invalid]", { hasText: "src/filter.ts" }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "@ 添加引用", exact: true }).click()
  dialog = page.getByRole("dialog")
  await dialog.getByRole("textbox", { name: "搜索来源" }).fill("src/filter.ts")
  await dialog.getByRole("checkbox").last().check()
  await dialog
    .getByRole("button", { name: "加入所选引用", exact: true })
    .click()
  const strip = page
    .locator('[data-composer-references] [data-invalid="false"]')
    .filter({ hasText: "src/filter.ts" })
  await strip.getByRole("button").first().click()
  dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("item.toLowerCase()")
  await page.keyboard.press("Escape")
  await strip.getByRole("button", { name: "移除 src/filter.ts" }).click()
  await expect(strip).toHaveCount(0)
  await expect(input(page)).toHaveValue("引用前草稿")
  await file(page, "filter.ts")
  await expect(page.getByRole("dialog")).toContainText("item.toLowerCase()")
})
test("typed previews download actual bytes, redact JSON, render quoted CSV and keep active content inert", async ({
  page,
}) => {
  await page.goto(root)
  let dialog = await file(page, "result.json")
  await expect(dialog).toContainText("[REDACTED]")
  await expect(dialog).not.toContainText("secret-fixture-token")
  const downloadPromise = page.waitForEvent("download")
  await dialog.getByRole("button", { name: "下载源文件", exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("result.json")
  const bytes = await readFile((await download.path())!, "utf8")
  expect(bytes).toContain('"matched":true')
  expect(bytes).not.toContain("secret-fixture-token")
  await page.keyboard.press("Escape")
  dialog = await file(page, "results.csv")
  await expect(
    dialog.getByRole("cell", { name: "Alpha, beta", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  dialog = await file(page, "preview.html")
  await expect(dialog).toContainText("window.UNSAFE_RESOURCE")
  expect(
    await page.evaluate(
      () => (window as unknown as Record<string, unknown>).UNSAFE_RESOURCE,
    ),
  ).toBeUndefined()
  await page.keyboard.press("Escape")
  dialog = await file(page, "diagram.svg")
  await expect(dialog.locator("iframe")).toHaveCount(0)
  await page.keyboard.press("Escape")
  dialog = await file(page, "pixel.png")
  await expect(dialog.getByRole("img")).toBeVisible()
  expect(
    await dialog
      .getByRole("img")
      .evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBe(1)
  await page.keyboard.press("Escape")
  dialog = await file(page, "report.pdf")
  await expect(dialog).toContainText("PDF renderer")
  await expect(
    dialog.getByRole("button", { name: "下载源文件", exact: true }),
  ).toBeDisabled()
})
test("command-to-tool-to-file navigation keeps unknown exit codes and disconnection separate from runtime", async ({
  page,
}) => {
  await page.goto(root)
  await input(page).fill("Keep the draft while viewing commands")
  await input(page).evaluate((node) => node.setAttribute("data-instance", "retained"))
  await command(page, "fixture watch")
  await expect(page).toHaveURL(/panel=terminal/)
  await expect(
    page.getByRole("region", { name: "底部工作面板", exact: true }),
  ).toHaveCount(0)
  await expect(input(page)).toHaveValue("Keep the draft while viewing commands")
  await expect(input(page)).toHaveAttribute("data-instance", "retained")
  let output = page.locator('[data-command-id="command-running-empty"]')
  await expect(output).toContainText("运行中，尚无输出")
  await expect(output.locator("[data-command-exit]")).toHaveText("—")
  await page.getByRole("button", { name: /fixture failing test/ }).click()
  output = page.locator('[data-command-id="command-failed"]')
  await expect(output.locator("[data-command-exit]")).toHaveText("2")
  await expect(output).toContainText("[REDACTED]")
  await page
    .getByRole("button", { name: /fixture disconnected output/ })
    .click()
  output = page.locator('[data-command-id="command-disconnected"]')
  await expect(output).toContainText("环境连接中断")
  await expect(output).toContainText("Partial output retained")
  await page.getByRole("button", { name: /fixture unknown outcome/ }).click()
  await expect(
    page.locator('[data-command-id="command-unknown"]'),
  ).toContainText("结果未确认")
  await page.getByRole("region", { name: "命令记录", exact: true }).getByRole("button", { name: /^run_tests/ }).click()
  output = page.locator('[data-command-id="command-tool-session-filter"]')
  await output.getByRole("button", { name: /文件 · file-filter/ }).click()
  await expect(page.getByRole("dialog")).toContainText("item.toLowerCase()")
})
test("conversation and tool command links open main output without restoring the bottom panel", async ({
  page,
}) => {
  await page.goto(root)
  // Running/exceptional calls stay outside compact read/search groups.
  await expect(page.locator('[data-follow-tail-list] [data-call-id="tool-session-filter"]')).toBeVisible()
  await page.locator("[data-follow-tail-list]").getByRole("button", { name: "命令记录", exact: true }).click()
  await expect(page).toHaveURL(/panel=terminal/)
  const output = page.locator('[data-command-id="command-tool-session-filter"]')
  await expect(output).toBeVisible()
  await output.getByRole("button", { name: "本轮工具记录", exact: true }).click()
  await expect(page).toHaveURL(/panel=activity/)
  await page
    .locator('[data-tool-target="tool-session-filter"]')
    .getByRole("button", { name: "命令记录", exact: true })
    .click()
  await expect(page).toHaveURL(/panel=terminal/)
  await expect(output).toBeVisible()
  await expect(
    page.getByRole("region", { name: "底部工作面板", exact: true }),
  ).toHaveCount(0)
  await expect(page.locator("[data-request-id]")).toHaveCount(0)
})
for (const [width, height] of [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [390, 240],
]) {
  test(`workbench dialogs retain actions and focus at ${width}x${height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height })
    await page.goto(root)
    await input(page).fill("Resize-safe draft")
    await openSettings(page)
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await dialog
      .getByRole("button", { name: "取消修改", exact: true })
      .scrollIntoViewIfNeeded()
    await expect(
      dialog.getByRole("button", { name: "取消修改", exact: true }),
    ).toBeInViewport()
    const issues = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    expect(issues.violations).toEqual([])
    await page.screenshot({
      path: info.outputPath(`settings-${width}-${height}.png`),
    })
    await page.keyboard.press("Escape")
    await expect(input(page)).toHaveValue("Resize-safe draft")
  })
}
test("bounded large file, 1000 messages and continuous output record actual interaction measurements", async ({
  page,
}, info) => {
  test.slow()
  await page.goto(root)
  await expect(input(page)).toBeEditable()
  const firstActionMs = await page.evaluate(() => performance.now())
  const start = performance.now()
  const dialog = await file(page, "large.ts")
  await expect(dialog).toContainText("来源或本地预览已截断")
  expect(await dialog.locator("[data-file-line]").count()).toBe(1000)
  const fileMs = performance.now() - start
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "加载 1,000 条历史", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-message-id]")).toHaveCount(1002)
  await command(page, "fixture continuous output")
  await expect(
    page.locator('[data-command-id="command-continuous"]'),
  ).toContainText("来源或本地预览已截断")
  const scrollResponseMs = await page.evaluate(async () => {
    const scroll = document.querySelector<HTMLElement>("[data-follow-tail-list]")?.parentElement
    if (!scroll) throw new Error("Conversation scroll region missing")
    const samples: number[] = []
    for (let i = 0; i < 10; i++) {
      const start = performance.now()
      scroll.scrollTop = i % 2 ? scroll.scrollHeight : 0
      await new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))
      samples.push(performance.now() - start)
    }
    return samples
  })
  const metrics = await page.evaluate(() => ({
    domNodes: document.querySelectorAll("*").length,
    messages: document.querySelectorAll("[data-message-id]").length,
    heapBytes: (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory?.usedJSHeapSize,
  }))
  const measured = JSON.stringify(
      {
        fileMs,
        firstActionMs,
        scrollResponseMs,
        ...metrics,
        virtualized: false,
        renderer: "bounded native text",
      },
      null,
      2,
    )
  const capacityPath = info.outputPath("measured-capacity.json")
  await writeFile(capacityPath, measured)
  await info.attach("measured-capacity", {
    path: capacityPath,
    contentType: "application/json",
  })
})

test("touch rail, navigation Sheet, locale and reduced motion retain drafts and stable focus", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto(root)
  await input(page).fill("移动端草稿")
  const rail = page.getByRole("navigation", { name: "工作台工具" })
  const fileEntry = rail
    .getByRole("button", { name: "文件", exact: true })
    .filter({ visible: true })
  const bounds = await fileEntry.boundingBox()
  expect(bounds!.width).toBeGreaterThanOrEqual(44)
  expect(bounds!.height).toBeGreaterThanOrEqual(44)
  await fileEntry.click()
  await page.getByRole("button", { name: "展开侧栏", exact: true }).click()
  let dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("tree", { name: "项目文件" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "展开侧栏", exact: true }),
  ).toBeFocused()
  await page
    .getByRole("link", { name: "会话", exact: true })
    .filter({ visible: true })
    .click()
  await page
    .getByRole("button", { name: "工作台设置", exact: true })
    .last()
    .click()
  dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "外观与布局", exact: true }).click()
  await dialog
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await dialog
    .getByRole("combobox", { name: "Appearance", exact: true })
    .selectOption("dark")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("textbox", { name: "Message input", exact: true }),
  ).toHaveValue("移动端草稿")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false)
  const issues = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze()
  expect(issues.violations).toEqual([])
  await context.close()
})

test("fast resource changes and revised source keep titles and bodies on the same identity", async ({
  page,
}) => {
  await page.goto(root)
  await command(page, "filter.ts")
  await expect(page.getByRole("dialog").getByRole("heading", { name: "filter.ts", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  const preview = await file(page, "result.json")
  await expect(preview).toContainText('"case": "Alpha"')
  await page.waitForTimeout(150)
  await expect(
    preview.getByRole("heading", { name: "result.json", exact: true }),
  ).toBeVisible()
  await expect(preview).not.toContainText("export function filter")
  await page.keyboard.press("Escape")
  const original = await file(page, "filter.ts")
  await original.getByRole("button", { name: "固定标签", exact: true }).click()
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "模拟新 Diff 版本", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "对话", exact: true }).click()
  const revised = await file(page, "filter.ts")
  await revised.getByRole("button", { name: "固定标签", exact: true }).click()
  await expect(
    page.getByRole("tab", { name: /filter.ts @diff-1/ }),
  ).toHaveCount(1)
  await expect(
    page.getByRole("tab", { name: /filter.ts @diff-2/ }),
  ).toHaveCount(1)
})
