import { expect, test } from "@playwright/test"

test("Button dimensions, selection and icon tooltip match the contract", async ({
  page,
}) => {
  await page.goto("/docs/button/")
  for (const [name, height, font] of [
    ["小号 28", 28, "12px"],
    ["标准 32", 32, "13px"],
    ["大号 36", 36, "14px"],
  ] as const) {
    const button = page.getByRole("button", { name, exact: true })
    expect((await button.boundingBox())!.height).toBe(height)
    await expect(button).toHaveCSS("border-radius", "6px")
    await expect(button).toHaveCSS("font-size", font)
  }
  const toggle = page.getByRole("button", { name: "切换选中状态" })
  await expect(toggle).toHaveAttribute("aria-pressed", "false")
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-pressed", "true")
  await toggle.focus()
  await expect(toggle).toBeFocused()
  const icon = page.getByRole("button", { name: "切换深浅主题" })
  expect((await icon.boundingBox())!.width).toBe(32)
  expect((await icon.boundingBox())!.height).toBe(32)
  await page.keyboard.press("Tab")
  await icon.focus()
  await expect(
    page.getByRole("tooltip").filter({ hasText: "切换深浅主题" }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("tooltip")).toBeHidden()
})

test("Item sizes and semantics preserve independent trailing actions", async ({
  page,
}) => {
  await page.goto("/docs/item/")
  const row = page
    .getByRole("button", { name: /Component Specification 双行 Item/ })
    .locator("..")
  expect((await row.boundingBox())!.height).toBe(56)
  await expect(row).toHaveAttribute("data-selected", "true")
  const second = page.getByRole("button", { name: "Design Rules", exact: true })
  expect((await second.locator("..").boundingBox())!.height).toBe(40)
  await second.click()
  await expect(second).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "查看规范操作" }).click()
  await expect(second).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByRole("status").filter({ hasText: "独立的尾部操作" }),
  ).toBeVisible()
  const staticRow = page
    .locator('[data-interactive="false"]')
    .filter({ hasText: "静态信息，不接收点击" })
  expect((await staticRow.boundingBox())!.height).toBe(32)
  await expect(staticRow).toHaveAttribute("data-interactive", "false")
  await expect(
    page.getByRole("button", { name: "不可选择", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "正在读取对象", exact: true }),
  ).toBeDisabled()
  const withError = page.getByRole("button", {
    name: "保留已读取内容",
    exact: true,
  })
  await expect(withError).toHaveAccessibleDescription(
    "请求错误：演示读取中断。已有内容保留，请重新读取。",
  )
  await page.getByText("查看错误", { exact: true }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "已有内容保留" }),
  ).toBeVisible()
  expect(await page.locator("button button").count()).toBe(0)
})

test("runtime badges share semantic tokens and unknown values remain explicit", async ({
  page,
  request,
}) => {
  await page.goto("/docs/runtime-status-badge/")
  const badges = page.locator("[data-runtime-status]")
  await expect(badges).toHaveCount(11)
  await expect(
    page.getByText("未知状态 (unrecognized)", { exact: true }),
  ).toBeVisible()
  const info = await page
    .locator('[data-runtime-status="running"]')
    .evaluate((element) => getComputedStyle(element).color)
  expect(
    await page
      .locator('[data-runtime-status="starting"]')
      .evaluate((element) => getComputedStyle(element).color),
  ).toBe(info)
  const response = await request.get("/r/theme.json")
  const theme = await response.json()
  expect(theme.cssVars.light["control-height"]).toBe("32px")
  expect(theme.cssVars.light["item-height-double"]).toBe("56px")
  expect(theme.cssVars.light["workspace-inspector-width"]).toBe("320px")
  expect(theme.cssVars.theme["spacing-control"]).toBe("var(--control-height)")
  expect(theme.cssVars.theme["color-warning"]).toBe("var(--warning)")
  expect(theme.cssVars.dark.background).toBe("#0a0a0a")
})

test("workspace selection, local creation and runtime state stay in sync with Inspector", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/workspace/shell/")
  const inspector = page.getByRole("complementary", {
    name: "Inspector",
    exact: true,
  })
  await expect(inspector).toBeVisible()
  await page
    .getByRole("button", { name: /检查 Session 层级 session-tree/ })
    .click()
  await expect(inspector).toContainText("检查 Session 层级")
  await expect(inspector.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "waiting",
  )
  await page.getByLabel("运行状态", { exact: true }).selectOption("failed")
  await expect(page.locator('[data-runtime-status="failed"]')).toHaveCount(2)
  await page.getByRole("button", { name: "新建 Session", exact: true }).click()
  await expect(inspector).toContainText("本地 Session 4")
  await expect(inspector.locator("[data-runtime-status]")).toHaveAttribute(
    "data-runtime-status",
    "idle",
  )
  await page
    .getByRole("navigation", { name: "工作台页面" })
    .getByRole("button", { name: "Agents", exact: true })
    .click()
  await page.getByRole("button", { name: /Reviewer agent-reviewer/ }).click()
  await expect(inspector).toContainText("Reviewer")
  await page.getByRole("button", { name: "清除对象选择" }).click()
  await expect(inspector).toContainText("尚未选择对象")
  expect(errors).toEqual([])
})

test("workspace data states keep existing content on refresh failure", async ({
  page,
}) => {
  await page.goto("/workspace/shell/")
  const control = page.getByLabel("数据状态", { exact: true })
  const first = page.getByRole("button", {
    name: /整理组件规范 session-design/,
  })
  await control.selectOption("error")
  const error = page.getByRole("alert").filter({ hasText: "已有内容已保留" })
  await expect(error).toBeVisible()
  await expect(first).toBeVisible()
  await page.getByRole("button", { name: "重试读取" }).click()
  await expect(error).toBeHidden()
  await control.selectOption("loading")
  await expect(page.locator('[aria-busy="true"]')).toBeVisible()
  await expect(page.getByLabel("正在加载工作区")).toBeVisible()
  await control.selectOption("empty")
  await expect(
    page.getByRole("heading", { name: "这里暂时没有内容" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "恢复演示数据" }).click()
  await expect(first).toBeVisible()
  await control.selectOption("partial")
  await expect(page.getByText(/当前为部分数据/)).toBeVisible()
  await page.getByRole("searchbox", { name: "搜索当前列表" }).fill("no match")
  await expect(page.getByText(/没有匹配的结果/)).toBeVisible()
})

test("desktop shell dimensions, pointer resizing, keyboard resizing and focus restore", async ({
  page,
}) => {
  await page.goto("/workspace/shell/")
  const nav = page.getByRole("complementary", { name: "工作区导航" })
  const inspector = page.getByRole("complementary", {
    name: "Inspector",
    exact: true,
  })
  await expect(inspector).toBeVisible()
  expect((await nav.boundingBox())!.width).toBe(256)
  expect((await inspector.boundingBox())!.width).toBe(320)
  const shell = page.locator("[data-sidebar-collapsed]")
  expect((await shell.locator(":scope > header").boundingBox())!.height).toBe(
    48,
  )
  await page.getByRole("button", { name: "折叠侧栏" }).click()
  await expect.poll(async () => (await nav.boundingBox())!.width).toBe(48)
  await page.getByRole("button", { name: "展开侧栏" }).click()
  const handle = page.getByRole("separator", { name: "调整 Inspector 宽度" })
  await handle.focus()
  await page.keyboard.press("ArrowLeft")
  await expect(handle).toHaveAttribute("aria-valuenow", "328")
  await page.keyboard.press("End")
  await expect
    .poll(async () => (await inspector.boundingBox())!.width)
    .toBe(360)
  await page.keyboard.press("Home")
  await expect
    .poll(async () => (await inspector.boundingBox())!.width)
    .toBe(300)
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + 4, box.y + 100)
  await page.mouse.down()
  await page.mouse.move(box.x - 100, box.y + 100)
  await expect(handle).toHaveAttribute("aria-valuenow", "360")
  await page.mouse.up()
  await inspector.getByRole("button", { name: "关闭 Inspector" }).click()
  await expect(inspector).toBeHidden()
  const opener = page.getByRole("button", { name: "打开 Inspector" })
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(inspector).toBeVisible()
})

test("chat preserves messages, distinguishes tool calls and respects IME", async ({
  page,
}) => {
  await page.goto("/workspace/shell/")
  await page
    .getByRole("navigation", { name: "工作台页面" })
    .getByRole("button", { name: "Chat", exact: true })
    .click()
  const input = page.getByRole("textbox", { name: "消息输入" })
  await input.fill("你好")
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true })
  await expect(input).toHaveValue("你好")
  await expect(page.locator("article")).toHaveCount(2)
  await input.press("Shift+Enter")
  await expect(input).toHaveValue("你好\n")
  await input.fill("保留这条本地消息")
  await input.press("Enter")
  await expect(page.locator("article")).toHaveCount(3)
  await expect(input).toHaveValue("")
  await expect(
    page.getByRole("status").filter({ hasText: "未向 Agent 发送请求" }),
  ).toBeVisible()
  const call = page.locator('[data-call-id="workspace-read"]')
  await call.getByRole("button", { name: /read_file/ }).click()
  await expect(call.locator("pre").nth(1)).toContainText("Button default: 32px")
  expect(await page.locator("button button").count()).toBe(0)
})

test("mobile drawer traps and restores focus, touch targets and narrow layouts fit", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto("/workspace/shell/")
    const opener = page.getByRole("button", { name: "打开 Inspector" })
    await expect(
      page.getByRole("complementary", { name: "Inspector", exact: true }),
    ).toHaveCount(0)
    expect((await opener.boundingBox())!.width).toBeGreaterThanOrEqual(44)
    expect((await opener.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    const create = page.getByRole("button", {
      name: "新建 Session",
      exact: true,
    })
    expect((await create.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await opener.click()
    const dialog = page.getByRole("dialog", { name: "Session", exact: true })
    await expect(dialog).toBeVisible()
    await expect.poll(async () => (await dialog.boundingBox())!.width).toBe(358)
    // Base UI redirects focus from its boundary guards asynchronously.
    const expectFocusInside = () =>
      expect
        .poll(() =>
          dialog.evaluate((element) => element.contains(document.activeElement)),
        )
        .toBe(true)
    await expectFocusInside()
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press("Tab")
      await expectFocusInside()
    }
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
    await page.getByRole("button", { name: "切换深浅主题" }).click()
    await page.mouse.click(5, 180)
    await page.screenshot({
      path: testInfo.outputPath("workspace-dark-mobile.png"),
      fullPage: true,
    })
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/docs/workspace-shell/")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  } finally {
    await context.close()
  }
})

test("workspace light and dark desktop render without overflow", async ({
  page,
}, testInfo) => {
  await page.goto("/workspace/shell/")
  await page.screenshot({
    path: testInfo.outputPath("workspace-desktop.png"),
    fullPage: true,
  })
  await page.getByRole("button", { name: "切换深浅主题" }).click()
  await page.mouse.click(5, 180)
  await page.screenshot({
    path: testInfo.outputPath("workspace-dark-desktop.png"),
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
