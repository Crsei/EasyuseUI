import { expect, test, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
const editor = (page: Page) => page.locator("[data-svg-workbench]")
const canvas = (page: Page) =>
  page.getByRole("group", { name: "画布", exact: true })
async function open(page: Page) {
  await page.goto("/workspace/svg/", { waitUntil: "domcontentloaded" })
  await expect(
    editor(page).locator("[data-data-state]").first(),
  ).toHaveAttribute("data-data-state", "success")
}
async function source(page: Page) {
  if (
    !(await page
      .getByRole("textbox", { name: "源码", exact: true })
      .isVisible())
  )
    await page.getByRole("button", { name: "源码", exact: true }).click()
  return page.getByRole("textbox", { name: "源码", exact: true })
}
async function apply(page: Page, text: string) {
  const input = await source(page)
  await input.fill(text)
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await expect(page.getByRole("button", { name: "取消任务" })).toHaveCount(0)
}
async function exportDialog(page: Page) {
  await page.getByRole("button", { name: "导出", exact: true }).click()
  return page.getByRole("dialog")
}
test("library copy, verified import, paint/path edits, undo, SVG export and reimport", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await open(page)
  await page.getByRole("button", { name: "lucide:check", exact: true }).click()
  await page.getByRole("button", { name: "插入副本", exact: true }).click()
  await expect(canvas(page).locator("path")).toHaveAttribute(
    "d",
    "M20 6 9 17l-5-5",
  )
  let dialog = await exportDialog(page)
  await dialog.getByRole("tab", { name: "原库使用片段" }).click()
  expect(await dialog.getByRole("textbox").inputValue()).toContain(
    'import { Check } from "lucide-react"',
  )
  await page.keyboard.press("Escape")
  const stroke = page
    .getByRole("complementary", { name: "Inspector", exact: true })
    .getByRole("textbox", { name: "描边", exact: true })
  await stroke.fill("#ff0000")
  await stroke.press("Tab")
  await expect(
    canvas(page).locator("g[data-svg-node]").first(),
  ).toHaveAttribute("stroke", "#ff0000")
  await page.getByRole("button", { name: "撤销编辑" }).click()
  await expect(
    canvas(page).locator("g[data-svg-node]").first(),
  ).toHaveAttribute("stroke", "currentColor")
  await page.getByRole("button", { name: "重做编辑" }).click()
  const text = await (await source(page)).inputValue()
  await apply(page, text.replace("M20 6 9 17l-5-5", "M1 1L23 23"))
  await expect(canvas(page).locator("path")).toHaveAttribute("d", "M1 1L23 23")
  dialog = await exportDialog(page)
  await dialog.getByRole("tab", { name: "原库使用片段" }).click()
  expect(await dialog.getByRole("textbox").inputValue()).not.toContain(
    "import { Check }",
  )
  await dialog.getByRole("tab", { name: "TSX", exact: true }).click()
  await expect(dialog.getByRole("textbox")).toHaveValue(/function SvgArtwork/)
  expect(await dialog.getByRole("textbox").inputValue()).toContain(
    'd={"M1 1L23 23"}',
  )
  await dialog.getByRole("tab", { name: "来源清单" }).click()
  expect(
    JSON.parse(await dialog.getByRole("textbox").inputValue()).sources[0]
      .modified,
  ).toBe(true)
  await dialog.getByRole("tab", { name: "SVG", exact: true }).click()
  const download = page.waitForEvent("download")
  await dialog.getByRole("button", { name: "下载文件" }).click()
  const saved = await download
  const bytes = await readFile((await saved.path())!, "utf8")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "新建空白" }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: "roundtrip.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(bytes),
  })
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await expect(canvas(page).locator("path")).toHaveAttribute("d", "M1 1L23 23")
  expect(errors).toEqual([])
})
test("imported IDs cannot collide with new library copies or drawn shapes", async ({
  page,
}) => {
  await open(page)
  await apply(
    page,
    '<svg><rect id="asset-1-1-root" width="8" height="8"/><rect id="draw-2-1" x="14" y="14" width="8" height="8"/></svg>',
  )
  await page.getByRole("button", { name: "关闭面板", exact: true }).click()
  await page.getByRole("button", { name: "lucide:check", exact: true }).click()
  await page.getByRole("button", { name: "插入副本", exact: true }).click()
  await expect(canvas(page).locator("path")).toHaveCount(1)
  await page.getByRole("button", { name: "矩形", exact: true }).click()
  const box = (await canvas(page).boundingBox())!
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6)
  await page.mouse.up()
  await expect(canvas(page).locator("rect[data-svg-node]")).toHaveCount(3)
  const ids = await canvas(page)
    .locator("[data-svg-node]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-svg-node")))
  expect(new Set(ids).size).toBe(ids.length)
})
test("invalid and stale source preserve preview and draft, locale preserves editor input", async ({
  page,
}) => {
  await open(page)
  await apply(
    page,
    '<svg viewBox="0 0 24 24"><rect id="shape" x="2" y="2" width="10" height="10"/></svg>',
  )
  await expect(canvas(page).locator("rect[data-svg-node]")).toHaveCount(1)
  const input = await source(page)
  await input.fill("<svg><script>alert(1)</script></svg>")
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await expect(
    page.getByText("超出 V1 支持范围: script", { exact: true }),
  ).toBeVisible()
  await expect(canvas(page).locator("rect[data-svg-node]")).toHaveCount(1)
  await input.fill('<svg><path id="draft" d="M1 1L2 2"/></svg>')
  await page.getByRole("button", { name: "撤销编辑" }).click()
  await expect(
    page.getByRole("button", { name: "校验并应用源码" }),
  ).toBeDisabled()
  await expect(input).toHaveValue(/id="draft"/)
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    page.getByRole("textbox", { name: "Source", exact: true }),
  ).toHaveValue(/id="draft"/)
  await expect(
    page.getByRole("button", { name: "Validate and apply source" }),
  ).toBeDisabled()
})
test("worker cancellation, timeout and late results retain document and source draft", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = globalThis as unknown as {
      svgWorkerDelay: number
      svgWorkerTerminations: number
    }
    state.svgWorkerDelay = 0
    state.svgWorkerTerminations = 0
    const NativeWorker = Worker
    const setter = Object.getOwnPropertyDescriptor(
      NativeWorker.prototype,
      "onmessage",
    )!.set!
    globalThis.Worker = class extends NativeWorker {
      timers = new Set<number>()
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options)
        Object.defineProperty(this, "onmessage", {
          set: (handler: ((event: MessageEvent) => void) | null) =>
            setter.call(this, (event: MessageEvent) => {
              const timer = window.setTimeout(() => {
                this.timers.delete(timer)
                handler?.(event)
              }, state.svgWorkerDelay)
              this.timers.add(timer)
            }),
        })
      }
      terminate() {
        this.timers.forEach(clearTimeout)
        state.svgWorkerTerminations++
        super.terminate()
      }
    }
  })
  await open(page)
  await apply(page, '<svg><rect id="safe" width="10" height="10"/></svg>')
  const revision = await editor(page).getAttribute("data-revision")
  const input = await source(page)
  const draft = '<svg><circle id="pending" cx="12" cy="12" r="4"/></svg>'
  await page.evaluate(() => {
    ;(globalThis as unknown as { svgWorkerDelay: number }).svgWorkerDelay = 6000
  })
  await input.fill(draft)
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await page.getByRole("button", { name: "取消任务", exact: true }).click()
  await expect(
    page.getByText("已取消；当前文档和草稿保留。", { exact: true }),
  ).toBeVisible()
  await expect(input).toHaveValue(draft)
  await expect(editor(page)).toHaveAttribute("data-revision", revision!)
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await expect(
    page.getByText("任务超时，可重试或缩小输入", { exact: false }),
  ).toBeVisible({ timeout: 8000 })
  await expect(input).toHaveValue(draft)
  await expect(editor(page)).toHaveAttribute("data-revision", revision!)
  await page.evaluate(() => {
    ;(globalThis as unknown as { svgWorkerDelay: number }).svgWorkerDelay = 800
  })
  await page.getByRole("button", { name: "校验并应用源码" }).click()
  await page.getByRole("button", { name: "撤销编辑" }).click()
  await expect(
    page.getByText("文档已改变，本次处理结果已丢弃。", { exact: true }),
  ).toBeVisible()
  await expect(canvas(page).locator("circle[data-svg-node]")).toHaveCount(0)
  await expect(input).toHaveValue(draft)
  expect(
    await page.evaluate(
      () =>
        (globalThis as unknown as { svgWorkerTerminations: number })
          .svgWorkerTerminations,
    ),
  ).toBeGreaterThanOrEqual(4)
})
test("draw, keyboard move, atomic drag undo, Escape cancel, layers and locks", async ({
  page,
}) => {
  await open(page)
  await page.getByRole("button", { name: "矩形", exact: true }).click()
  const box = (await canvas(page).boundingBox())!
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, {
    steps: 5,
  })
  await page.mouse.up()
  await expect(canvas(page).locator("rect[data-svg-node]")).toHaveCount(1)
  await page.getByRole("button", { name: "选择 / 移动", exact: true }).click()
  await canvas(page).focus()
  await page.keyboard.press("ArrowRight")
  const shape = canvas(page).locator("rect[data-svg-node]")
  await expect(shape).toHaveAttribute("transform", "translate(1 0)")
  const bounds = (await shape.boundingBox())!
  const revision = Number(await editor(page).getAttribute("data-revision"))
  await page.mouse.move(bounds.x + 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 42, bounds.y + bounds.height / 2, {
    steps: 8,
  })
  await page.mouse.up()
  await expect(editor(page)).toHaveAttribute(
    "data-revision",
    String(revision + 1),
  )
  await page.getByRole("button", { name: "撤销编辑" }).click()
  await expect(shape).toHaveAttribute("transform", "translate(1 0)")
  await shape.click({ position: { x: 1, y: bounds.height / 2 } })
  const original = await shape.getAttribute("transform")
  const at = (await shape.boundingBox())!
  await page.mouse.move(at.x + 1, at.y + at.height / 2)
  await page.mouse.down()
  await page.mouse.move(at.x + 30, at.y + at.height / 2)
  await page.keyboard.press("Escape")
  await page.mouse.up()
  await expect(shape).toHaveAttribute("transform", original!)
  await page.getByRole("tab", { name: "图层", exact: true }).click()
  await page.getByRole("button", { name: "锁定图层", exact: true }).click()
  await canvas(page).focus()
  await page.keyboard.press("Delete")
  await expect(shape).toHaveCount(1)
  await page.getByRole("button", { name: "解锁图层", exact: true }).click()
  await page.getByRole("button", { name: "隐藏图层", exact: true }).click()
  await expect(shape).toHaveAttribute("display", "none")
  await page.getByRole("button", { name: "显示图层", exact: true }).click()
  await expect(shape).toHaveAttribute("display", "inline")
})
test("multi-selection, grouping, layer reorder and ungroup retain geometry", async ({
  page,
}) => {
  await open(page)
  await apply(
    page,
    '<svg><rect id="a" x="1" y="1" width="4" height="4"/><circle id="b" cx="16" cy="16" r="3"/></svg>',
  )
  await page.getByRole("button", { name: "关闭面板", exact: true }).click()
  await page.getByRole("tab", { name: "图层", exact: true }).click()
  const tree = page.getByRole("tree", { name: "图层", exact: true })
  await tree.getByRole("treeitem", { name: "rect · a", exact: true }).click()
  await page.getByRole("button", { name: "上移图层", exact: true }).click()
  expect(
    await canvas(page)
      .locator(":scope > [data-svg-node]")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("data-svg-node")),
      ),
  ).toEqual(["b", "a"])
  const circle = tree.getByRole("treeitem", { name: "circle · b", exact: true })
  await circle.focus()
  await circle.press("Enter")
  await page.getByRole("button", { name: "组合选择", exact: true }).click()
  await expect(canvas(page).locator(":scope > g[data-svg-node]")).toHaveCount(1)
  await page.getByRole("button", { name: "解组", exact: true }).click()
  await expect(canvas(page).locator(":scope > [data-svg-node]")).toHaveCount(2)
})
test("optimization comparison is explicit, undoable and preserves accessible SVG content", async ({
  page,
}) => {
  await open(page)
  await apply(
    page,
    '<svg viewBox="0 0 24 24"><title>Artwork title</title><desc>Artwork description</desc><path d="M0 0L20 20"/></svg>',
  )
  const before = await (await source(page)).inputValue()
  const dialog = await exportDialog(page)
  await dialog.getByRole("button", { name: "比较优化结果" }).click()
  const comparison = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: "优化前后比较" }) })
  await expect(comparison.getByText("优化后", { exact: false })).toBeVisible()
  await comparison.getByRole("button", { name: "应用优化（可撤销）" }).click()
  await page.keyboard.press("Escape")
  await expect(canvas(page).locator("title")).toHaveText("Artwork title")
  await page.getByRole("button", { name: "撤销编辑" }).click()
  expect(await (await source(page)).inputValue()).toEqual(before)
})
test("oversized local files and external SVG references never replace the document", async ({
  page,
}) => {
  await open(page)
  await apply(page, '<svg><circle id="safe" cx="12" cy="12" r="8"/></svg>')
  await page.locator('input[type="file"]').setInputFiles({
    name: "large.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.alloc(1024 * 1024 + 1),
  })
  await expect(page.getByText("文件超过 1 MiB；文档未改变。")).toBeVisible()
  await apply(page, '<svg><use href="https://evil.invalid/image.svg#x"/></svg>')
  await expect(
    page.getByText("不允许的内容或外部引用", { exact: false }),
  ).toBeVisible()
  await expect(canvas(page).locator("circle[data-svg-node]")).toHaveCount(1)
})
test("only explicitly chosen collection loads, local search is bounded and offline edits work", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => requests.push(r.url()))
  await open(page)
  await page
    .getByRole("button", { name: "lucide:check", exact: true })
    .waitFor()
  expect(
    await page
      .locator("ul")
      .filter({ has: page.getByRole("button", { name: /^lucide:/ }) })
      .getByRole("button")
      .count(),
  ).toBeLessThanOrEqual(12)
  await page.getByRole("textbox", { name: "搜索名称、标签或分类" }).fill("todo")
  await expect(
    page.getByRole("button", { name: "lucide:check", exact: true }),
  ).toBeVisible()
  expect(
    requests.filter((url) => /iconify\.design|api\.iconify/.test(url)),
  ).toEqual([])
  await page.getByRole("textbox", { name: "搜索名称、标签或分类" }).fill("")
  await page.getByRole("combobox", { name: "来源库" }).selectOption("tabler")
  await expect(
    page.getByRole("button", { name: "tabler:check", exact: true }),
  ).toBeVisible()
  await page.context().setOffline(true)
  await page.getByRole("button", { name: "tabler:check", exact: true }).click()
  await page.getByRole("button", { name: "插入副本", exact: true }).click()
  await expect(canvas(page).locator("path")).toHaveAttribute(
    "d",
    "M5 12l5 5l10 -10",
  )
})
test("installed catalog demo exposes all five library data states and retains assets on refresh failure", async ({
  page,
}) => {
  await page.goto("/docs/svg-icon-library/", { waitUntil: "domcontentloaded" })
  await page.locator("#preview").scrollIntoViewIfNeeded()
  const demo = page.locator("#preview")
  const state = demo.getByRole("combobox", { name: "Data state", exact: true })
  await expect(
    demo.getByRole("button", { name: "lucide:check", exact: true }),
  ).toBeVisible()
  for (const value of ["loading", "empty", "partial", "error", "success"]) {
    await state.selectOption(value)
    await expect(demo.locator("[data-data-state]")).toHaveAttribute(
      "data-data-state",
      value,
    )
    if (value === "partial" || value === "error" || value === "success")
      await expect(
        demo.getByRole("button", { name: "lucide:check", exact: true }),
      ).toBeVisible()
  }
})
test("mobile and short viewports keep source, export, close and focus restoration reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await open(page)
  await expect(page.getByRole("heading", { name: "SVG 工作台" })).toBeVisible()
  await page
    .getByRole("button", { name: "源码", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  const sheet = page.getByRole("dialog")
  await sheet
    .getByRole("textbox", { name: "源码", exact: true })
    .fill('<svg><rect width="12" height="12"/></svg>')
  await sheet.getByRole("button", { name: "校验并应用源码" }).click()
  await expect(editor(page)).toHaveAttribute("data-revision", "1")
  await page.keyboard.press("Escape")
  await page.setViewportSize({ width: 390, height: 240 })
  const dialog = await exportDialog(page)
  const close = dialog.getByRole("button", { name: "关闭弹窗" })
  await expect(close).toBeInViewport()
  await dialog
    .getByRole("button", { name: "下载文件" })
    .scrollIntoViewIfNeeded()
  await expect(
    dialog.getByRole("button", { name: "下载文件" }),
  ).toBeInViewport()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "导出", exact: true }),
  ).toBeFocused()
})
test("light/dark screenshots, keyboard accessibility and production timing evidence", async ({
  page,
}, testInfo) => {
  const timings: Record<string, number[]> = {
    firstOpenMs: [],
    searchMs: [],
    applyMs: [],
    dragCommitMs: [],
  }
  for (let i = 0; i < 3; i++) {
    const started = Date.now()
    await open(page)
    await page
      .getByRole("button", { name: "lucide:check", exact: true })
      .waitFor()
    timings.firstOpenMs.push(Date.now() - started)
  }
  for (const query of ["todo", "search", "circle"]) {
    const started = Date.now()
    await page
      .getByRole("textbox", { name: "搜索名称、标签或分类" })
      .fill(query)
    await page
      .getByRole("button", {
        name: `lucide:${query === "todo" ? "check" : query}`,
        exact: true,
      })
      .waitFor()
    timings.searchMs.push(Date.now() - started)
  }
  await page.getByRole("textbox", { name: "搜索名称、标签或分类" }).fill("")
  for (let i = 0; i < 3; i++) {
    const started = Date.now()
    await apply(
      page,
      `<svg><rect id="shape" x="${i}" y="2" width="12" height="12"/></svg>`,
    )
    await expect(canvas(page).locator("rect[data-svg-node]")).toHaveAttribute(
      "x",
      String(i),
    )
    timings.applyMs.push(Date.now() - started)
  }
  await page.getByRole("button", { name: "关闭面板", exact: true }).click()
  for (let i = 0; i < 3; i++) {
    const shape = canvas(page).locator("rect[data-svg-node]")
    const box = (await shape.boundingBox())!
    const revision = await editor(page).getAttribute("data-revision")
    const started = Date.now()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      box.x + box.width / 2 + 18,
      box.y + box.height / 2 + 12,
      { steps: 8 },
    )
    await page.mouse.up()
    await expect(editor(page)).not.toHaveAttribute("data-revision", revision!)
    timings.dragCommitMs.push(Date.now() - started)
    await page.getByRole("button", { name: "撤销编辑" }).click()
  }
  await canvas(page).locator("rect[data-svg-node]").click()
  const fill = page
    .getByRole("complementary", { name: "Inspector", exact: true })
    .getByRole("textbox", { name: "填充", exact: true })
  await fill.fill("#7c7cf2")
  await fill.press("Tab")
  await expect(canvas(page).locator("rect[data-svg-node]")).toHaveAttribute(
    "fill",
    "#7c7cf2",
  )
  await page.screenshot({
    path: testInfo.outputPath("svg-workbench-light.png"),
  })
  const axe = await new AxeBuilder({ page })
    .include("[data-svg-workbench]")
    .analyze()
  expect(axe.violations).toEqual([])
  await page.evaluate(() => document.documentElement.classList.add("dark"))
  await page.getByRole("combobox", { name: "预览背景" }).selectOption("dark")
  await page.screenshot({ path: testInfo.outputPath("svg-workbench-dark.png") })
  await testInfo.attach("production-timings", {
    body: JSON.stringify(timings, null, 2),
    contentType: "application/json",
  })
})
