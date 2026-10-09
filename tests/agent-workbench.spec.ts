import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
const root = "/examples/agent-workbench"
const input = (page: Page) =>
  page.getByRole("textbox", { name: "消息输入", exact: true })
test("complete templates retain accessible controls on desktop and mobile", async ({
  page,
}) => {
  test.slow()
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    for (const route of [
      "template=coding&page=session&session=session-filter",
      "template=artifacts&page=artifacts&session=session-report",
      "template=console&page=inbox&session=session-report",
    ]) {
      await page.goto(`${root}/app/?${route}`)
      await expect(
        page.getByText("本地交互示例", { exact: true }),
      ).toBeVisible()
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
      expect(result.violations).toEqual([])
    }
  }
})
async function composerSettings(page: Page) {
  const details = page.locator("[data-composer-settings]:visible")
  if ((await details.getAttribute("open")) === null)
    await details.locator("summary").click()
}
async function settings(page: Page) {
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  return page.getByRole("dialog")
}
async function source(page: Page, action = "确认回执") {
  const dialog = await settings(page)
  await dialog.getByRole("button", { name: action, exact: true }).last().click()
  await page.keyboard.press("Escape")
}
async function advance(page: Page) {
  const dialog = await settings(page)
  await dialog
    .getByRole("button", { name: "推进来源场景", exact: true })
    .click()
  await page.keyboard.press("Escape")
}
async function chooseSession(page: Page, title: string) {
  await page
    .getByRole("button", { name: new RegExp(title) })
    .first()
    .click()
  const id =
    title === "分析资料并整理报告" ? "session-report" : "session-filter"
  await expect(page.locator("main[data-session-id]")).toHaveAttribute(
    "data-session-id",
    id,
  )
}
for (const region of [
  "sidebar",
  "context",
  "conversation",
  "composer",
  "header",
  "tools",
  "files",
  "output",
  "artifacts",
  "settings",
]) {
  test(`region ${region} uses live components, accessible controls and recoverable error state`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    await page.goto(`${root}/regions/?region=${region}`)
    await expect(page.getByText("本地交互示例", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "在组合布局查看", exact: true }),
    ).toBeVisible()
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([])
    await page.goto(`${root}/regions/?region=${region}&scenario=error`)
    await expect(
      page.getByText("读取失败；已有内容保留", { exact: false }).first(),
    ).toBeVisible()
    expect(errors).toEqual([])
  })
}
test("session drafts and references survive navigation, locale and layout without remounting the editor", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&session=session-filter`)
  await input(page).fill("第一会话的用户草稿")
  await input(page).evaluate((el) =>
    el.setAttribute("data-instance", "retained"),
  )
  await composerSettings(page)
  await page
    .getByRole("combobox", { name: "选择来源引用", exact: true })
    .last()
    .selectOption("ref-filter")
  await page.locator('[data-workbench-layout="review"]').click()
  await expect(
    page.locator('[data-workbench-layout="review"]'),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 15000 })
  await expect(input(page)).toHaveValue("第一会话的用户草稿")
  await expect(input(page)).toHaveAttribute("data-instance", "retained")
  await page.locator('[data-workbench-layout="conversation"]').click()
  await chooseSession(page, "分析资料并整理报告")
  await input(page).fill("第二会话草稿")
  await chooseSession(page, "修复大小写过滤逻辑")
  await expect(input(page)).toHaveValue("第一会话的用户草稿")
  const dialog = await settings(page)
  await dialog
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("textbox", { name: "Message input", exact: true }),
  ).toHaveValue("第一会话的用户草稿")
  await expect(
    page
      .getByText("src/filter.ts", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.has("draft")).toBe(false)
})
test("sending is locked after lost acknowledgement and later confirmation retains newer input", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&session=session-filter`)
  await input(page).fill("Submitted old version")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await input(page).fill("Newer unsent draft")
  await source(page, "确认丢失")
  await expect(input(page)).toHaveValue("Newer unsent draft")
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByText("Submitted old version", { exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "查询操作结果", exact: true }).click()
  await expect(input(page)).toHaveValue("Newer unsent draft")
  await expect(
    page.getByText("Submitted old version", { exact: true }),
  ).toHaveCount(1)
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeEnabled()
})
test("renaming and archiving wait for source confirmation and preserve the selected session", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&session=session-filter`)
  await input(page).fill("Keep the original session draft")
  await page
    .getByRole("button", { name: "重命名", exact: true })
    .first()
    .click()
  const name = page.getByRole("textbox", { name: "会话名称", exact: true })
  await name.fill("Source-confirmed task title")
  await name.press("Enter")
  const row = page.locator('nav [data-session-id="session-filter"]')
  await expect(row.getByText("等待来源确认", { exact: true })).toBeVisible()
  await source(page, "确认丢失")
  await expect(
    row.getByRole("button", { name: /修复大小写过滤逻辑/ }),
  ).toBeVisible()
  await chooseSession(page, "分析资料并整理报告")
  await input(page).fill("Other session draft")
  await source(page)
  await expect(
    row.getByRole("button", { name: /Source-confirmed task title/ }),
  ).toBeVisible()
  await expect(input(page)).toHaveValue("Other session draft")
  await row.locator("summary").click()
  await row.getByRole("button", { name: "归档会话", exact: true }).click()
  await expect(row).toBeVisible()
  await source(page)
  await expect(row).toHaveCount(0)
  await page.getByRole("button", { name: "归档", exact: true }).click()
  await expect(row).toBeVisible()
  await row.locator("summary").click()
  await row.getByRole("button", { name: "恢复会话", exact: true }).click()
  await source(page)
  await page.getByRole("button", { name: "最近", exact: true }).click()
  await row.getByRole("button", { name: /Source-confirmed task title/ }).click()
  await expect(page.locator("main[data-session-id]")).toHaveAttribute(
    "data-session-id",
    "session-filter",
  )
  await expect(input(page)).toHaveValue("Keep the original session draft")
})
test("send failure, invalid context and local attachment availability keep the draft recoverable", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&session=session-filter`)
  await input(page).fill("Keep this draft")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await source(page, "报告失败")
  await expect(input(page)).toHaveValue("Keep this draft")
  await composerSettings(page)
  await page
    .getByRole("combobox", { name: "选择来源引用", exact: true })
    .last()
    .selectOption("ref-stale")
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeDisabled()
  await page
    .getByRole("button", { name: "重试读取", exact: true })
    .first()
    .click()
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeEnabled()
  await page.locator('input[type="file"]').setInputFiles({
    name: "fixture.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("local data"),
  })
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeDisabled()
  const dialog = await settings(page)
  await dialog
    .getByRole("button", { name: "确认附件可用", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeEnabled()
})
test("approval stays waiting until confirmation, unknown disables duplicates, and questions have separate drafts", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&session=session-report`)
  const approval = page
    .locator('[data-attention-id="approval-report"]')
    .filter({ visible: true })
  await page.getByRole("button", { name: "批准", exact: true }).first().click()
  await expect(approval.getByText("正在提交", { exact: true })).toBeVisible()
  await source(page, "确认丢失")
  await expect(
    page.getByRole("button", { name: /查询.*结果|查询.*回执/ }).first(),
  ).toBeVisible()
  await source(page)
  await expect(
    approval.getByText("已确认请求响应；运行状态仍以来源为准。", {
      exact: true,
    }),
  ).toBeVisible()
  const question = page
    .locator('[data-attention-id="question-report"]')
    .filter({ visible: true })
  const text = question.getByRole("textbox")
  await expect(text).toBeVisible()
  await text.fill("Engineering team")
  await question.getByRole("button", { name: "回复", exact: true }).click()
  await source(page)
  await expect(
    page.getByText("Engineering team", { exact: true }),
  ).toBeVisible()
})
test("new coding task proceeds through approval, failed evidence, correction and version-bound review", async ({
  page,
}) => {
  await page.goto(`${root}/app/?template=coding&page=new`)
  await input(page).fill("修复过滤器并审阅边界")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await expect(page).toHaveURL(/page=new/)
  await source(page)
  await expect(page).toHaveURL(/session=session-created-request-/)
  await expect(
    page
      .getByRole("heading", { name: "Run focused tests", exact: true })
      .filter({ visible: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "批准", exact: true }).click()
  await source(page)
  await advance(page)
  await expect(page.getByText(/The source reports a failed test/)).toBeVisible()
  await composerSettings(page)
  await page
    .getByRole("combobox", { name: "输入模式", exact: true })
    .selectOption("send")
  await input(page).fill(
    "Normalize case before comparing, and add empty query coverage.",
  )
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await source(page)
  await advance(page)
  await expect(
    page.getByText(/Fixture source reports focused tests passed/),
  ).toBeVisible()
  await page.locator('[data-workbench-layout="review"]').click()
  await expect(
    page.locator('[data-workbench-layout="review"]'),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 15000 })
  await page
    .getByRole("button", { name: "添加行反馈 2", exact: true })
    .last()
    .click()
  await page
    .getByRole("textbox", { name: /审阅反馈草稿/ })
    .fill("Cover whitespace too")
  await page.getByRole("button", { name: "添加行反馈", exact: true }).click()
  await page
    .getByRole("button", { name: "整理到会话草稿", exact: true })
    .click()
  await expect(input(page)).toHaveValue(
    /src\/filter.ts:2 @diff-1[\s\S]*Cover whitespace too/,
  )
})
test("a changed Diff revision requires explicit relocation before feedback can enter the draft", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=review&layout=review&panel=changes`)
  await page
    .getByRole("button", { name: "添加行反馈 2", exact: true })
    .last()
    .click()
  await page
    .getByRole("textbox", { name: /审阅反馈草稿/ })
    .fill("Bound to old revision")
  await page.getByRole("button", { name: "添加行反馈", exact: true }).click()
  const dialog = await settings(page)
  await dialog
    .getByRole("button", { name: "模拟新 Diff 版本", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "整理到会话草稿", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByText("版本已变化，请重新定位", { exact: false }).first(),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "添加行反馈 2", exact: true })
    .last()
    .click()
  await page
    .getByRole("button", { name: "版本已变化，请重新定位", exact: true })
    .click()
  await page
    .getByRole("button", { name: "整理到会话草稿", exact: true })
    .click()
  await expect(input(page)).toHaveValue(/Bound to old revision/)
})
test("artifact template generates a report, locates a reference and brings review feedback back to the session", async ({
  page,
}) => {
  await page.goto(`${root}/app/?template=artifacts&page=new`)
  await input(page).fill("Analyze project research and prepare a report")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await source(page)
  await page.getByRole("button", { name: "批准", exact: true }).click()
  await source(page)
  await advance(page)
  await input(page).fill("Preserved report draft")
  await page.getByRole("button", { name: "产物", exact: true }).first().click()
  await expect(
    page.getByText("analysis-report.md", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("报告预览（本地数据）", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "定位来源引用", exact: true }).click()
  await expect(
    page
      .getByText("src/filter.ts", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  await page.getByRole("button", { name: "产物", exact: true }).first().click()
  await page
    .getByRole("button", { name: "将审阅意见带回对话", exact: true })
    .click()
  await expect(input(page)).toHaveValue(
    "Preserved report draft\n\n请补充边界条件和来源版本。",
  )
  await expect(page.getByText("run_tests", { exact: true })).toHaveCount(0)
})
test("task selection, filtering and browser history preserve the chosen object without starting a run", async ({
  page,
}) => {
  await page.goto(`${root}/app/?template=console&page=inbox`)
  await page
    .getByRole("combobox", { name: "待办筛选", exact: true })
    .selectOption("approval")
  await page.getByRole("button", { name: /Write report artifact/ }).click()
  await expect(page).toHaveURL(/session=session-report/)
  await expect(page).toHaveURL(/page=inbox/)
  await page.getByRole("button", { name: "进入会话", exact: true }).click()
  await expect(page).toHaveURL(/page=session/)
  await page.goBack()
  await expect(page).toHaveURL(/page=inbox/)
  const dialog = await settings(page)
  await expect(dialog.locator("[data-request-id]")).toHaveCount(0)
})
test("URL errors recover, all extension panels explain unavailability, and source late events cannot replace data", async ({
  page,
}) => {
  await page.goto(`${root}/app/?session=not-real&panel=bad`)
  await expect(
    page.getByRole("heading", { name: "未找到这个展示对象", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "返回有效示例", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Agent 编码工作台", exact: true }),
  ).toBeVisible()
  await page.goto(`${root}/app/?page=review&layout=review&panel=git`)
  await expect(
    page.getByText("调用方未提供此能力 · git", { exact: true }),
  ).toBeVisible()
  const dialog = await settings(page)
  await dialog
    .getByRole("button", { name: "发送迟到/重复读取事件", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByText("STALE RESPONSE MUST NOT APPEAR", { exact: true }),
  ).toHaveCount(0)
})
test("IME input, interrupted connection and unknown cancellation preserve current source status", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session`)
  await input(page).fill("中文输入")
  await input(page).dispatchEvent("compositionstart")
  await input(page).dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    keyCode: 229,
  })
  let dialog = await settings(page)
  await expect(dialog.locator("[data-request-id]")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await input(page).dispatchEvent("compositionend")
  await page.getByRole("button", { name: "请求停止本轮", exact: true }).click()
  await source(page, "确认丢失")
  await expect(
    page.locator('[data-runtime-status="running"]').first(),
  ).toBeVisible()
  await expect(input(page)).toHaveValue("中文输入")
  dialog = await settings(page)
  await dialog
    .getByRole("combobox", { name: "展示场景", exact: true })
    .selectOption("disconnected")
  await page.keyboard.press("Escape")
  await expect(input(page)).toBeDisabled()
  await expect(input(page)).toHaveValue("中文输入")
})
test("1000 history records and a long Diff report actual mounted counts and preserve historical reading", async ({
  page,
}, info) => {
  const started = Date.now()
  await page.goto(`${root}/app/?page=session&scenario=long`)
  await expect(page.locator("[data-message-id]")).toHaveCount(1002)
  const elapsed = Date.now() - started
  const history = page.getByLabel("对话记录", { exact: true })
  await history.focus()
  await history.press("Home")
  await history.press("PageUp")
  const top = await history.evaluate((el) => el.scrollTop)
  const dialog = await settings(page)
  await dialog
    .getByRole("button", { name: "追加流式来源记录", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-message-id]")).toHaveCount(1003)
  expect(await history.evaluate((el) => el.scrollTop)).toBeLessThanOrEqual(
    top + 8,
  )
  await page.locator('[data-workbench-layout="review"]').click()
  await expect(
    page.locator('[data-workbench-layout="review"]'),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 15000 })
  await expect(page.locator("[data-line-id]")).toHaveCount(1000)
  await expect(
    page
      .getByText("来源或本地预览已截断", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  await info.attach("history-and-diff-measurement", {
    body: JSON.stringify(
      {
        historyRecords: 1002,
        diffRows: 1000,
        initialNavigationAndRenderMs: elapsed,
        mode: "all records mounted with browser layout deferral; not virtualized",
      },
      null,
      2,
    ),
    contentType: "application/json",
  })
})
for (const width of [390, 768, 1024, 1280, 1440])
  test(`full workbench container fits ${width}px with drafts and accessible navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.goto(`${root}/app/?page=session`)
    await input(page).fill(`Draft ${width}`)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await expect(input(page)).toBeVisible()
    await expect(input(page)).toBeInViewport({ ratio: 1 })
    await expect(
      page.getByRole("button", { name: "发送", exact: true }),
    ).toBeInViewport({ ratio: 1 })
    await page.locator('[data-workbench-layout="review"]').click()
    await expect(
      page.locator('[data-workbench-layout="review"]'),
    ).toHaveAttribute("aria-pressed", "true", { timeout: 15000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (width < 1024) {
      await page.getByRole("button", { name: "对象属性", exact: true }).click()
      await expect(
        page.getByRole("tab", { name: "变更", exact: true }),
      ).toBeVisible()
      await page
        .getByRole("button", { name: "对话", exact: true })
        .first()
        .click()
    }
    await expect(input(page)).toHaveValue(`Draft ${width}`)
  })
test.describe("touch and reduced motion", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  })
  test("sheets trap focus, restore focus, and soft keyboard resizing retains the draft", async ({
    page,
  }) => {
    await page.goto(`${root}/app/?page=session`)
    await input(page).fill("Touch draft")
    const trigger = page.getByRole("button", { name: "示例设置", exact: true })
    await trigger.tap()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(trigger).toBeFocused()
    await input(page).tap()
    await page.setViewportSize({ width: 390, height: 500 })
    await expect(input(page)).toHaveValue("Touch draft")
    await expect(input(page)).toBeInViewport({ ratio: 1 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const box = await trigger.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})
test.describe("200 percent effective layout", () => {
  test.use({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 })
  test("1440px output at 720 CSS pixels keeps keyboard access and drafts", async ({
    page,
  }, info) => {
    await page.goto(`${root}/app/?page=session`)
    await input(page).fill("Zoomed layout draft")
    await page.locator('[data-workbench-layout="review"]').focus()
    await page.keyboard.press("Enter")
    await page.getByRole("button", { name: "对象属性", exact: true }).click()
    await expect(
      page.getByRole("tab", { name: "变更", exact: true }),
    ).toBeVisible()
    await page
      .getByRole("button", { name: "对话", exact: true })
      .first()
      .click()
    await expect(input(page)).toHaveValue("Zoomed layout draft")
    const metrics = await page.evaluate(() => ({
      cssWidth: innerWidth,
      scale: devicePixelRatio,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.cssWidth)
    await info.attach("effective-zoom-layout", {
      body: JSON.stringify({
        ...metrics,
        method:
          "1440px physical output represented by 720 CSS pixels at DPR 2; effective layout equivalent, not browser toolbar automation",
      }),
      contentType: "application/json",
    })
  })
})
