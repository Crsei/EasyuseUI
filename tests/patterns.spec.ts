import { expect, test } from "@playwright/test"
import { redact, previewText } from "../lib/redact"

test("redaction covers nested keys, inline headers and credential URLs with byte-safe previews", () => {
  const result = redact({
    auth: {
      session_token: "private-session",
      APIKey: "private-key",
      token_count: 42,
    },
    lines: [
      "curl -H 'Cookie: session=private-cookie'",
      "https://example.test/?token=private-url&view=all",
      "Authorization: Bearer private-header",
    ],
  })
  for (const secret of [
    "private-session",
    "private-key",
    "private-cookie",
    "private-url",
    "private-header",
  ])
    expect(result).not.toContain(secret)
  expect(result).toContain('"token_count": 42')
  expect(result).toContain("view=all")
  const long = previewText("汉".repeat(20000))
  expect(long.truncated).toBe(true)
  expect(new TextEncoder().encode(long.text).length).toBeLessThanOrEqual(32768)
  expect(long.text).not.toContain("�")
})

test("Tree implements roving focus, hierarchical navigation, selection and typeahead", async ({
  page,
}) => {
  await page.goto("/docs/tree/")
  const tree = page.getByRole("tree", { name: "Session 层级演示" })
  const idea = tree.getByRole("treeitem", {
    name: "Idea / 工作台设计",
    exact: true,
  })
  const session = tree.getByRole("treeitem", {
    name: "Session / 组件实现",
    exact: true,
  })
  const run = tree.getByRole("treeitem", {
    name: "Run / 检查规范",
    exact: true,
  })
  await expect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1)
  expect((await idea.locator(":scope > div").boundingBox())!.height).toBe(32)
  await idea.focus()
  await page.keyboard.press("ArrowRight")
  await expect(session).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(run).toBeFocused()
  await page.keyboard.press("Space")
  await expect(run).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("ArrowLeft")
  await expect(session).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await expect(session).toHaveAttribute("aria-expanded", "false")
  await expect(run).toHaveCount(0)
  await page.keyboard.press("End")
  await expect(
    tree.getByRole("treeitem", { name: "尚未加载的分支", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("i")
  await page.keyboard.press("n")
  await expect(
    tree.getByRole("treeitem", { name: "Inbox", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Home")
  await expect(idea).toBeFocused()
  await expect(tree.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1)
})

test("DataRegion renders five states and preserves data with a recoverable refresh error", async ({
  page,
}) => {
  await page.goto("/docs/data-region/")
  const demo = page.getByRole("region", {
    name: "DataRegion 交互演示",
    exact: true,
  })
  const state = demo.getByLabel("数据状态", { exact: true })
  await state.selectOption("loading")
  await expect(demo.locator('[aria-busy="true"]')).toBeVisible()
  await expect(
    demo.getByLabel("正在加载", { exact: true }).locator(":scope > div"),
  ).toHaveCount(3)
  await state.selectOption("empty")
  await expect(
    demo.getByRole("heading", { name: "这里暂时没有内容", exact: true }),
  ).toBeVisible()
  await demo.getByRole("button", { name: "恢复数据", exact: true }).click()
  await state.selectOption("partial")
  await expect(demo.getByText(/当前为部分数据/)).toBeVisible()
  await demo.getByRole("button", { name: "加载更多", exact: true }).click()
  await expect(state).toHaveValue("success")
  await state.selectOption("error")
  await expect(
    demo.getByText("已读取的 Session", { exact: true }),
  ).toBeVisible()
  await expect(demo.getByRole("alert")).toContainText("最后更新：16:42:08")
  await demo.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(demo.getByRole("alert")).toHaveCount(0)
})

test("Tree moves with keyboard alternative and rejects cyclic and disabled targets", async ({
  page,
}) => {
  await page.goto("/docs/tree/")
  const tree = page.getByRole("tree", { name: "Session 层级演示" })
  await tree
    .getByRole("treeitem", { name: "Session / 组件实现", exact: true })
    .click({ position: { x: 90, y: 16 } })
  const move = page.getByRole("form", { name: "移动节点" })
  await expect(
    move.getByRole("option", { name: "Run / 检查规范", exact: true }),
  ).toBeDisabled()
  await expect(
    move.getByRole("option", { name: "受保护的节点", exact: true }),
  ).toBeDisabled()
  await move.getByLabel("目标", { exact: true }).selectOption("inbox")
  await move.getByRole("button", { name: "移动到", exact: true }).click()
  await expect(
    tree
      .getByRole("treeitem", { name: "Inbox", exact: true })
      .getByRole("treeitem", { name: "Session / 组件实现", exact: true }),
  ).toBeVisible()
  await expect(
    tree
      .getByRole("treeitem", { name: "Idea / 工作台设计", exact: true })
      .getByRole("treeitem"),
  ).toHaveCount(0)
  const locked = tree.getByRole("treeitem", {
    name: "受保护的节点",
    exact: true,
  })
  await locked.focus()
  await page.keyboard.press("Space")
  await expect(locked).toHaveAttribute("aria-selected", "false")
})

test("Tree pointer dragging uses the same controlled move and lazy failures can retry", async ({
  page,
}) => {
  await page.goto("/docs/tree/")
  const tree = page.getByRole("tree", { name: "Session 层级演示" })
  const source = tree
    .getByRole("treeitem", { name: "Run / 实现组件", exact: true })
    .locator(":scope > div")
  const inbox = tree.getByRole("treeitem", { name: "Inbox", exact: true })
  await source.dragTo(inbox.locator(":scope > div"))
  await expect(
    inbox.getByRole("treeitem", { name: "Run / 实现组件", exact: true }),
  ).toBeVisible()
  const lazy = tree.getByRole("treeitem", {
    name: "尚未加载的分支",
    exact: true,
  })
  // Expansion triggers the explicitly supplied lazy-load callback.
  await lazy.focus()
  await page.keyboard.press("ArrowRight")
  await expect(
    lazy.getByRole("treeitem", { name: "已加载 Run", exact: true }),
  ).toBeVisible()
})

test("Session and Agent rows keep dimensions, capability actions and status independent", async ({
  page,
}) => {
  await page.goto("/docs/session-row/")
  const first = page.getByRole("button", {
    name: "实现组件构造 session-one",
    exact: true,
  })
  expect((await first.locator("..").boundingBox())!.height).toBe(56)
  await page.getByRole("button", { name: "继续", exact: true }).click()
  await expect(first).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByRole("button", {
      name: "未命名 Session session-two",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false")
  await expect(
    page.getByRole("button", { name: "重试", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByText("重试不可用：没有重试权限", { exact: true }),
  ).toBeVisible()
  await page.goto("/docs/agent-row/")
  await expect(
    page.getByText(/连接离线 · 最后更新 16:42:08/).first(),
  ).toBeVisible()
  await expect(
    page.locator('[data-entity-id="offline"] [data-runtime-status]'),
  ).toHaveAttribute("data-runtime-status", "running")
  await expect(page.getByText(/未配置模型/).first()).toBeVisible()
  await expect(
    page.getByRole("button", { name: "暂停", exact: true }),
  ).toBeDisabled()
  expect(await page.locator("button button").count()).toBe(0)
})

test("Activity deduplicates, preserves old data on failure and follows only near the bottom", async ({
  page,
}) => {
  await page.goto("/docs/activity-timeline/")
  const scroll = page.getByLabel("Activity 时间线", { exact: true })
  await expect(scroll.locator("[data-event-id]")).toHaveCount(12)
  await page.getByRole("button", { name: "重复事件", exact: true }).click()
  await expect(scroll.locator("[data-event-id]")).toHaveCount(12)
  await scroll.evaluate((element) => {
    element.scrollTop = 0
    element.dispatchEvent(new Event("scroll"))
  })
  await page.getByRole("button", { name: "更新事件状态", exact: true }).click()
  await expect(
    scroll.locator('[data-event-id="event-11"] [data-runtime-status]'),
  ).toHaveAttribute("data-runtime-status", "running")
  await expect(page.getByRole("button", { name: /条新事件/ })).toHaveCount(0)
  await page.getByRole("button", { name: "追加事件", exact: true }).click()
  await expect(scroll.locator("[data-event-id]")).toHaveCount(13)
  expect(await scroll.evaluate((element) => element.scrollTop)).toBe(0)
  await page.getByRole("button", { name: /1 条新事件/ }).click()
  await expect
    .poll(() =>
      scroll.evaluate(
        (element) =>
          element.scrollHeight - element.scrollTop - element.clientHeight,
      ),
    )
    .toBeLessThanOrEqual(1)
  await page.getByRole("button", { name: "切换刷新失败", exact: true }).click()
  await expect(scroll.getByRole("alert")).toContainText("已有内容已保留")
  await expect(scroll.locator("[data-event-id]")).toHaveCount(13)
  await scroll.getByRole("button", { name: "重试读取" }).click()
  await expect(scroll.getByRole("alert")).toHaveCount(0)
  await scroll
    .getByRole("button", { name: "展开事件 读取文件 12", exact: true })
    .click()
  await expect(
    scroll.getByText("本地事件参数与输出摘要；缺失用量不按 0 处理。", {
      exact: true,
    }),
  ).toBeVisible()
})

test("Inspector changes one complete object snapshot and distinguishes selection and data errors", async ({
  page,
}) => {
  await page.goto("/docs/inspector/")
  await expect(
    page.locator('[data-inspector-object="session-one"]'),
  ).toContainText("Session / 组件实现")
  await page.getByRole("button", { name: "切换对象", exact: true }).click()
  const inspector = page.locator('[data-inspector-object="agent-two"]')
  await expect(inspector).toContainText("Agent / Reviewer")
  await expect(inspector).not.toContainText("session-one")
  await page.getByLabel("对象数据状态").selectOption("error")
  await expect(inspector.getByRole("alert")).toContainText("权限错误")
  await expect(inspector).toContainText("agent-two")
  await page.getByRole("button", { name: "清除选择", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "尚未选择对象", exact: true }),
  ).toBeVisible()
})

test("ToolCall redacts before display and clipboard, requires approval, and reconciles unknown results", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/docs/tool-call/")
  const call = page.locator('[data-call-id="call-local"]')
  await expect(call.locator("pre").first()).toContainText("[REDACTED]")
  for (const secret of [
    "demo-api-secret",
    "demo-auth-secret",
    "demo-cookie-secret",
    "demo-output-secret",
  ])
    await expect(call).not.toContainText(secret)
  await call.getByRole("button", { name: "复制脱敏输出", exact: true }).click()
  expect(
    await page.evaluate(() => navigator.clipboard.readText()),
  ).not.toContain("demo-output-secret")
  await expect(
    call.getByRole("region", { name: "工具权限请求" }),
  ).toContainText("覆盖该文件已有内容")
  await expect(call.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "waiting",
  )
  await call.getByRole("button", { name: "批准", exact: true }).click()
  await expect(call.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "running",
  )
  await call.getByRole("button", { name: "取消执行", exact: true }).click()
  await expect(
    call.getByRole("button", { name: "正在取消", exact: true }),
  ).toBeDisabled()
  await expect(call.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "running",
  )
  await page.getByLabel("工具运行状态", { exact: true }).selectOption("failed")
  await page
    .getByRole("button", { name: "切换结果未确认", exact: true })
    .click()
  await expect(call).toContainText("结果未确认")
  await expect(
    call.getByRole("button", { name: "安全重试", exact: true }),
  ).toHaveCount(0)
  await call.getByRole("button", { name: "查询结果", exact: true }).click()
  await expect(
    call.getByRole("button", { name: "安全重试", exact: true }),
  ).toBeEnabled()
})

test("ToolCall bounds long previews and only reveals available complete output", async ({
  page,
}) => {
  await page.goto("/docs/tool-call/")
  await page.getByRole("button", { name: "切换长输出", exact: true }).click()
  const call = page.locator('[data-call-id="call-local"]')
  const output = call.locator("pre").nth(1)
  await expect(call).toContainText("预览最多 200 行 / 32KiB")
  await expect(output).not.toContainText("line 240")
  expect((await output.boundingBox())!.height).toBeLessThanOrEqual(320)
  await call.getByRole("button", { name: "展开完整输出", exact: true }).click()
  await expect(output).toContainText("line 240")
  await expect(call.getByText("Exit code：0")).toHaveCount(0)
})

test("lost tool cancellation responses remain unconfirmed until reconciled", async ({
  page,
}) => {
  await page.goto("/docs/tool-call/")
  await page.getByLabel("工具运行状态", { exact: true }).selectOption("running")
  await page
    .getByRole("button", { name: "模拟取消响应丢失", exact: true })
    .click()
  const call = page.locator('[data-call-id="call-local"]')
  await call.getByRole("button", { name: "取消执行", exact: true }).click()
  await expect(call.getByRole("alert")).toContainText("结果尚未确认")
  await expect(
    call.getByRole("button", { name: "取消执行", exact: true }),
  ).toHaveCount(0)
  await expect(call.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "running",
  )
  await call.getByRole("button", { name: "查询结果", exact: true }).click()
  await expect(call.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "cancelled",
  )
})

test("Chat keeps partial content, input method behavior, messages and independent tool records", async ({
  page,
}) => {
  await page.goto("/docs/chat-message/")
  const message = page.locator('[data-message-id="agent-1"]')
  const original = await message.locator("p").first().textContent()
  await page.getByRole("button", { name: "追加演示片段", exact: true }).click()
  await expect(message).toContainText(original!)
  await expect(message).toContainText("新增一段本地演示输出")
  await page.getByRole("button", { name: "模拟中断", exact: true }).click()
  await expect(message).toHaveAttribute("data-message-state", "interrupted")
  await expect(message).toContainText(original!)
  const input = page.getByRole("textbox", { name: "消息输入", exact: true })
  await input.fill("输入法未确认")
  await input.dispatchEvent("compositionstart")
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true })
  await expect(input).toHaveValue("输入法未确认")
  await input.dispatchEvent("compositionend")
  await input.press("Shift+Enter")
  await expect(input).toHaveValue("输入法未确认\n")
  await input.press("Enter")
  await expect(input).toHaveValue("")
  await expect(page.locator("article[data-message-id]")).toHaveCount(3)
  const call = page.locator('[data-call-id="read-1"]')
  await expect(call.locator("article")).toHaveCount(0)
  await call.getByRole("button", { name: /read_file/ }).click()
  await expect(call.locator("pre").nth(1)).toContainText("Inspector: 320px")
})

test("Conversation keeps history anchors, does not pull reading to the tail and retains failed drafts", async ({
  page,
}) => {
  await page.goto("/docs/chat-message/")
  const input = page.getByRole("textbox", { name: "消息输入", exact: true })
  for (let index = 0; index < 7; index++) {
    await input.fill(`本地消息 ${index}`)
    await input.press("Enter")
    await expect(input).toHaveValue("")
  }
  const scroll = page.getByLabel("对话记录", { exact: true })
  await scroll.evaluate((element) => {
    element.scrollTop = 0
    element.dispatchEvent(new Event("scroll"))
  })
  await page.getByRole("button", { name: "追加演示片段", exact: true }).click()
  expect(await scroll.evaluate((element) => element.scrollTop)).toBe(0)
  await expect(
    page.getByRole("button", { name: "返回最新", exact: true }),
  ).toBeVisible()
  await scroll.evaluate((element) => {
    element.scrollTop = 100
    element.dispatchEvent(new Event("scroll"))
  })
  const anchor = page.locator('[data-message-id="agent-1"]')
  const before = (await anchor.boundingBox())!.y
  await page.getByRole("button", { name: "加载早期历史", exact: true }).click()
  await expect
    .poll(async () => (await anchor.boundingBox())!.y)
    .toBeCloseTo(before, 0)
  await page.getByRole("button", { name: "模拟发送失败", exact: true }).click()
  await input.fill("失败后仍需保留这段草稿")
  await input.press("Enter")
  await expect(
    page.getByRole("alert").filter({ hasText: "草稿已保留" }),
  ).toBeVisible()
  await expect(input).toHaveValue("失败后仍需保留这段草稿")
})

test("new patterns fit narrow screens, keep touch targets and reduced motion", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  try {
    for (const route of [
      "tree",
      "session-row",
      "agent-row",
      "activity-timeline",
      "inspector",
      "chat-message",
      "tool-call",
      "data-region",
    ]) {
      await page.goto(`/docs/${route}/`)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true)
      const demo = page.getByRole("region", { name: new RegExp("交互演示$") })
      for (const box of await demo.getByRole("button").evaluateAll((buttons) =>
        buttons
          .filter((button) => button.getBoundingClientRect().height > 0)
          .map((button) => ({
            height: button.getBoundingClientRect().height,
            text: button.textContent,
          })),
      ))
        expect(box.height, `${route}: ${box.text}`).toBeGreaterThanOrEqual(44)
    }
    await page.goto("/workspace/")
    await page.getByRole("button", { name: "层级视图", exact: true }).click()
    await expect(
      page.getByRole("tree", { name: "工作台 Session 层级" }),
    ).toBeVisible()
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `workspace at ${width}`,
      ).toBe(true)
    }
    await page.screenshot({
      path: testInfo.outputPath("patterns-mobile.png"),
      fullPage: true,
    })
    expect(errors).toEqual([])
  } finally {
    await context.close()
  }
})

test("all new patterns ship their source and dependency graph", async ({
  request,
}) => {
  for (const name of [
    "data-region",
    "tree",
    "session-row",
    "agent-row",
    "activity-timeline",
    "inspector",
    "chat-message",
    "tool-call",
  ]) {
    const response = await request.get(`/r/${name}.json`)
    expect(response.ok(), name).toBe(true)
    const item = await response.json()
    expect(
      item.files.some((file: { path: string }) =>
        file.path.endsWith(".module.css"),
      ),
    ).toBe(true)
    for (const file of item.files)
      expect(file.content).not.toMatch(
        /from ["'](?:next\/|@\/lib\/(?:catalog|site)|@\/components\/(?:docs|examples|site))/,
      )
    for (const dependency of item.registryDependencies)
      expect((await request.get(new URL(dependency).pathname)).ok()).toBe(true)
  }
})
