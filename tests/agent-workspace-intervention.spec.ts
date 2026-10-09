import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const route = "/examples/agent-workbench/regions/intervention/"
const root = (page: Page) => page.locator("[data-intervention-lab]")
const input = (page: Page) =>
  page.locator("[data-intervention-composer] textarea")
const queue = (page: Page) => page.locator("[data-queue-preview]")
const approval = (page: Page) => page.locator("[data-approval-record]")
const strip = (page: Page) => page.locator("[data-attention-strip]")
const source = (page: Page, name: "approval" | "queue") =>
  page.locator(`[data-${name}-source]`)
const confirm = (page: Page, name: "approval" | "queue") =>
  source(page, name)
    .getByRole("button", { name: "确认本地来源", exact: true })
    .click()

test("region entry identifies an isolated fixture and Review locates without approving", async ({
  page,
}) => {
  await page.goto("/examples/agent-workbench/regions/?region=composer")
  await page
    .getByRole("link", { name: "审批与队列 fixture", exact: true })
    .click()
  await expect(page).toHaveURL(new RegExp(`${route}$`))
  await expect(root(page)).toContainText("不连接 Pi，不执行命令")
  const history = page.getByLabel("对话记录", { exact: true })
  const oldTop = await history.evaluate((node) => node.scrollTop)
  expect(oldTop).toBeGreaterThan(100)
  await strip(page).getByRole("button", { name: "查看审批记录" }).click()
  await expect(
    page.locator('[data-follow-tail-id="fixture-approval-record"]'),
  ).toBeFocused()
  expect(await history.evaluate((node) => node.scrollTop)).toBeLessThan(oldTop)
  await expect(
    approval(page).getByRole("button", { name: "批准", exact: true }),
  ).toBeEnabled()
  await expect(
    source(page, "approval").getByRole("button", { name: "确认本地来源" }),
  ).toBeDisabled()
  await expect(approval(page)).not.toContainText(
    "fixture-secret-do-not-display",
  )
  await expect(approval(page)).toContainText("[REDACTED]")
})

test("approval submission retains the strip; lost receipts stay locked until queried and confirmed", async ({
  page,
}) => {
  const writes: string[] = []
  page.on("request", (req) => {
    if (req.method() === "POST") writes.push(req.url())
  })
  await page.goto(route)
  await strip(page).getByRole("button").click()
  const approve = approval(page).getByRole("button", {
    name: "批准",
    exact: true,
  })
  await approve.focus()
  await approve.press("Enter")
  await expect(approval(page)).toBeFocused()
  await expect(strip(page)).toContainText("等待来源确认")
  await expect(
    approval(page).getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
  await source(page, "approval")
    .getByRole("button", { name: "模拟回执丢失" })
    .click()
  await expect(strip(page)).toContainText("先查询")
  await expect(approval(page)).toContainText("仅本次命令")
  await expect(
    source(page, "approval").getByRole("button", { name: "确认本地来源" }),
  ).toBeDisabled()
  await approval(page)
    .getByRole("button", { name: "查询结果", exact: true })
    .click()
  await expect(strip(page)).toContainText("结果未确认")
  await confirm(page, "approval")
  await expect(strip(page)).toHaveCount(0)
  await expect(approval(page)).toContainText(
    "允许一次已确认（fixture）；命令尚未执行",
  )
  await expect(approval(page)).toContainText("审批审计记录")
  await expect(
    page.locator('[data-message-id="fixture-approval-record"]'),
  ).toHaveCount(1)
  expect(writes).toEqual([])
})

test("Queue/Steer, locale and IME preserve the composer instance and submitted-version drafts", async ({
  page,
}) => {
  await page.goto(route)
  const field = input(page)
  await field.fill("原文草稿 / original")
  await field.evaluate((node) => node.setAttribute("data-instance", "stable"))
  await field.dispatchEvent("compositionstart")
  await field.press("Enter")
  await field.dispatchEvent("compositionend")
  const text = await field.inputValue()
  await expect(page.locator("[data-queue-operation]")).toHaveCount(0)
  const mode = page.locator("[data-intervention-composer] select")
  await mode.selectOption("steer")
  await expect(field).toHaveValue(text)
  await expect(field).toHaveAttribute("data-instance", "stable")
  await page
    .getByRole("combobox", { name: "示例语言", exact: true })
    .selectOption("en")
  await expect(field).toHaveValue(text)
  await expect(field).toHaveAttribute("data-instance", "stable")
  await mode.selectOption("queue")
  await page
    .getByRole("combobox", { name: "Example language", exact: true })
    .selectOption("zh-CN")
  await page
    .locator("[data-intervention-composer]")
    .getByRole("button", { name: "发送", exact: true })
    .click()
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(2)
  await field.fill("确认期间的新草稿")
  await confirm(page, "queue")
  await expect(field).toHaveValue("确认期间的新草稿")
  await queue(page).getByRole("button", { name: "展开其余消息" }).click()
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(4)
  await expect(queue(page)).toContainText(text.trim())
  await expect(field).toHaveAttribute("data-instance", "stable")
})

test("queue defaults to two; reorder, edit and cancellation await source and retain competing editor drafts", async ({
  page,
}) => {
  await page.goto(route)
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(2)
  await queue(page).getByRole("button", { name: "展开其余消息" }).click()
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(3)
  await queue(page)
    .getByRole("button", { name: "上移 fixture-q2", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await expect(
    queue(page).locator("[data-queued-prompt-id]").first(),
  ).toHaveAttribute("data-queued-prompt-id", "fixture-q1")
  await confirm(page, "queue")
  await expect(
    queue(page).locator("[data-queued-prompt-id]").first(),
  ).toHaveAttribute("data-queued-prompt-id", "fixture-q2")
  await queue(page)
    .getByRole("button", { name: "编辑 fixture-q2", exact: true })
    .click()
  const editor = queue(page).getByRole("textbox", {
    name: "队列编辑草稿",
    exact: true,
  })
  await editor.fill("要确认的编辑")
  await queue(page).getByRole("button", { name: "提交队列修改" }).click()
  await editor.fill("等待期间继续编辑")
  await confirm(page, "queue")
  await expect(editor).toHaveValue("等待期间继续编辑")
  await expect(queue(page)).toContainText("编辑草稿保留")
  await expect(
    queue(page).getByRole("button", { name: "提交队列修改" }),
  ).toBeDisabled()
  await queue(page).getByRole("button", { name: "放弃队列编辑草稿" }).click()
  await queue(page)
    .getByRole("button", { name: "取消排队 fixture-q2", exact: true })
    .click()
  await source(page, "queue")
    .getByRole("button", { name: "来源取出首条" })
    .click()
  await confirm(page, "queue")
  await expect(queue(page)).toContainText("本次请求未执行")
  await expect(
    queue(page).locator('[data-queued-prompt-id="fixture-q1"]'),
  ).toHaveCount(1)
  await expect(
    queue(page).locator('[data-queued-prompt-id="fixture-q2"]'),
  ).toHaveCount(0)
})

test("queue unknown persists through collapse; query does not unlock writes or remove content", async ({
  page,
}) => {
  await page.goto(route)
  await queue(page)
    .getByRole("button", { name: "取消排队 fixture-q1", exact: true })
    .click()
  await source(page, "queue")
    .getByRole("button", { name: "模拟回执丢失" })
    .click()
  await queue(page).getByRole("button", { name: "展开其余消息" }).click()
  await queue(page).getByRole("button", { name: "只显示前两条" }).click()
  await expect(
    queue(page).getByRole("button", { name: "编辑 fixture-q1" }),
  ).toBeDisabled()
  await queue(page).getByRole("button", { name: "查询队列结果" }).click()
  await expect(queue(page).locator("[data-queue-operation]")).toHaveAttribute(
    "data-queue-operation",
    "unknown",
  )
  await expect(
    queue(page).getByRole("button", { name: "编辑 fixture-q1" }),
  ).toBeDisabled()
  await expect(
    queue(page).locator('[data-queued-prompt-id="fixture-q1"]'),
  ).toHaveCount(1)
  await confirm(page, "queue")
  await expect(
    queue(page).locator('[data-queued-prompt-id="fixture-q1"]'),
  ).toHaveCount(0)
  await expect(
    queue(page).getByRole("button", { name: "编辑 fixture-q2" }),
  ).toBeEnabled()
})

test("queue data regions preserve existing items and recover without clearing input", async ({
  page,
}) => {
  await page.goto(route)
  await input(page).fill("读取失败时保留输入")
  const data = page.getByRole("combobox", { name: "队列读取状态", exact: true })
  await data.selectOption("error")
  await expect(queue(page)).toContainText("已有内容保留")
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(2)
  await expect(
    queue(page).getByRole("button", { name: "编辑 fixture-q1" }),
  ).toBeDisabled()
  await queue(page).getByRole("button", { name: "重试读取" }).click()
  await expect(
    queue(page).getByRole("button", { name: "编辑 fixture-q1" }),
  ).toBeEnabled()
  await data.selectOption("partial")
  await expect(queue(page)).toContainText("不能推断完整数量")
  await data.selectOption("loading")
  await expect(queue(page).locator("[data-data-state]")).toHaveAttribute(
    "aria-busy",
    "true",
  )
  await data.selectOption("empty")
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(0)
  await data.selectOption("success")
  await expect(queue(page).locator("[data-queued-prompt-id]")).toHaveCount(2)
  await expect(input(page)).toHaveValue("读取失败时保留输入")
})

test("narrow touch, short viewport, dark theme and English retain readable fixed modules", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 560 },
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  try {
    await page.goto(`${baseURL}${route}`)
    await input(page).fill("保留用户原文")
    await page
      .getByRole("combobox", { name: "示例语言", exact: true })
      .selectOption("en")
    await page
      .getByRole("button", { name: "Toggle light and dark theme", exact: true })
      .click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(input(page)).toHaveValue("保留用户原文")
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    )
    expect(overflow).toBe(false)
    await strip(page)
      .getByRole("button", { name: "Review approval record" })
      .click()
    await expect(
      page.locator('[data-follow-tail-id="fixture-approval-record"]'),
    ).toBeFocused()
    const dimensions = await queue(page)
      .getByRole("button", { name: "Edit fixture-q1", exact: true })
      .evaluate((node) => {
        const r = node.getBoundingClientRect()
        return { width: r.width, height: r.height }
      })
    expect(dimensions.width).toBeGreaterThanOrEqual(44)
    expect(dimensions.height).toBeGreaterThanOrEqual(44)
    await page.locator("[data-intervention-composer]").scrollIntoViewIfNeeded()
    await expect(
      page
        .locator("[data-intervention-composer]")
        .getByRole("button", { name: "Send", exact: true }),
    ).toBeVisible()
    await page.screenshot({
      path: ".local/intervention-evidence/mobile-dark-en.png",
      fullPage: true,
    })
  } finally {
    await context.close()
  }
})

test("200% equivalent layout and long queued text remain bounded and readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 })
  await page.goto(route)
  const text = "Long unbroken context " + "x".repeat(4000)
  await input(page).fill(text)
  await page
    .locator("[data-intervention-composer]")
    .getByRole("button", { name: "发送", exact: true })
    .click()
  await confirm(page, "queue")
  await queue(page).getByRole("button", { name: "展开其余消息" }).click()
  const row = queue(page).locator("[data-queued-prompt-id]").last()
  await expect(row.locator("p")).toHaveAttribute("title", text)
  const height = await row
    .locator("p")
    .evaluate((node) => node.getBoundingClientRect().height)
  expect(height).toBeLessThanOrEqual(40)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false)
  await expect(input(page)).toHaveValue("")
})

test("desktop module geometry and accessibility have mounted-page evidence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(route)
  await strip(page).getByRole("button").click()
  const geometry = await page
    .locator("[data-intervention-bottom-dock]")
    .evaluate((node) => {
      const p = node.parentElement!.getBoundingClientRect()
      const r = node.getBoundingClientRect()
      return { parentBottom: p.bottom, bottom: r.bottom, width: r.width }
    })
  expect(Math.abs(geometry.parentBottom - geometry.bottom)).toBeLessThan(2)
  await expect(input(page)).toBeEnabled()
  const results = await new AxeBuilder({ page })
    .include("[data-intervention-lab]")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
  expect(results.violations).toEqual([])
  await page.screenshot({
    path: ".local/intervention-evidence/desktop-approval.png",
    fullPage: true,
  })
})
