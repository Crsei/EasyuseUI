import { expect, test } from "@playwright/test"

test("workspace opens the new session and preserves draft identity through review navigation", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/workspace/")
  const workbench = page.locator("[data-workbench-page]")
  await expect(workbench).toHaveAttribute("data-workbench-page", "session")
  await expect(page.getByText("本地交互示例", { exact: true })).toBeVisible()
  await expect(page.locator("[data-site-header]")).toHaveCount(0)
  await expect(
    page.getByRole("combobox", { name: "数据状态", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "展开底部面板", exact: true }),
  ).toBeVisible()
  const box = (await workbench.boundingBox())!
  expect(box.y).toBe(0)
  expect(box.height).toBe(page.viewportSize()!.height)

  const composer = page.getByRole("textbox", { name: "消息输入", exact: true })
  await composer.fill("入口迁移后保留的草稿")
  await composer.evaluate((node) =>
    node.setAttribute("data-entry-instance", "retained"),
  )
  const changes = page
    .getByRole("link", { name: "变更", exact: true })
    .filter({ visible: true })
  await expect(changes).toHaveAttribute("href", /^\/workspace\/\?.*page=review/)
  await changes.focus()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/workspace\/\?.*page=review/)
  await expect(workbench).toHaveAttribute("data-workbench-page", "review")
  await page
    .getByRole("link", { name: "会话", exact: true })
    .filter({ visible: true })
    .click()
  await expect(workbench).toHaveAttribute("data-workbench-page", "session")
  await expect(composer).toHaveValue("入口迁移后保留的草稿")
  await expect(composer).toHaveAttribute("data-entry-instance", "retained")
  await page.reload()
  await expect(workbench).toHaveAttribute("data-workbench-page", "session")

  await page.goto("/workspace/?page=invalid")
  await page.getByRole("button", { name: "返回有效示例", exact: true }).click()
  await expect(page).toHaveURL(/\/workspace\/?$/)
  await expect(workbench).toHaveAttribute("data-workbench-page", "session")
  await page.goto("/examples/agent-workbench/app/")
  await expect(workbench).toHaveAttribute("data-workbench-page", "home")
  expect(errors).toEqual([])
})

test("workspace mobile retains the composer across locale and theme changes while explicit queries win", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  try {
    await page.goto("/workspace/")
    const composer = page.getByRole("textbox", {
      name: "消息输入",
      exact: true,
    })
    await composer.fill("My 未发送 draft")
    await composer.evaluate((node) =>
      node.setAttribute("data-entry-instance", "mobile"),
    )
    await page.getByRole("button", { name: "示例设置", exact: true }).click()
    const settings = page.getByRole("dialog")
    await settings
      .getByRole("combobox", { name: "外观", exact: true })
      .selectOption("dark")
    await settings
      .getByRole("combobox", { name: "语言", exact: true })
      .selectOption("en")
    await page.keyboard.press("Escape")
    const englishComposer = page.getByRole("textbox", {
      name: "Message input",
      exact: true,
    })
    await expect(englishComposer).toHaveValue("My 未发送 draft")
    await expect(englishComposer).toHaveAttribute(
      "data-entry-instance",
      "mobile",
    )
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath("workspace-mobile-dark-en.png"),
    })

    await page.goto("/workspace/?page=home")
    await expect(page.locator("[data-workbench-page]")).toHaveAttribute(
      "data-workbench-page",
      "home",
    )
    await page.goto("/workspace/?page=session&session=session-report")
    await expect(page.locator("[data-workbench-page]")).toHaveAttribute(
      "data-session-id",
      "session-report",
    )
  } finally {
    await context.close()
  }
})

test("session sidebar owns views and groups with accessible runtime icons", async ({
  page,
}) => {
  await page.goto("/workspace/")
  const nav = page.locator('[data-session-navigation="sections"]')
  const current = nav.locator('[data-session-id="session-filter"]')
  const field = page.getByRole("textbox", { name: "消息输入", exact: true })
  await field.fill("侧栏导航草稿")
  const retained = page.locator('[data-entry-instance="sidebar"]')
  await field.evaluate((node) =>
    node.setAttribute("data-entry-instance", "sidebar"),
  )
  await expect(nav.locator('[data-session-section="running"]')).toHaveAttribute(
    "open",
    "",
  )
  await expect(
    nav.locator('[data-session-section="archived"]'),
  ).not.toHaveAttribute("open")
  await expect(
    nav.getByRole("button", { name: "最近", exact: true }),
  ).toHaveCount(0)
  await expect(
    nav.getByRole("button", { name: "执行中", exact: true }),
  ).toHaveCount(0)
  await expect(
    current.locator('[data-runtime-status="running"]'),
  ).toHaveAttribute("data-icon-only", "true")
  await expect(
    current.locator('[data-runtime-status="running"]'),
  ).toHaveAttribute("title", "执行中")
  await expect(
    current.locator('[data-runtime-status="running"] .sr-only'),
  ).toHaveText("执行中")
  await expect(
    current.getByRole("button", { name: /修复大小写过滤逻辑/ }),
  ).toHaveAccessibleName(/执行中/)
  await expect(current.locator("[data-session-views] button")).toHaveCount(4)
  const main = page.locator('[data-workbench-presentation="workspace"]')
  await expect(
    page.getByRole("tab", { name: "计划", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "更多面板", exact: true }).click()
  await expect(
    page.getByRole("menuitem", { name: "计划", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("menuitem", { name: "上下文", exact: true }),
  ).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(
    main.getByRole("button", { name: "对话", exact: true }),
  ).toHaveCount(0)
  await expect(
    main.getByRole("button", { name: "上下文", exact: true }),
  ).toHaveCount(0)
  await expect(
    main.getByRole("button", { name: "计划", exact: true }),
  ).toHaveCount(0)
  for (const view of ["context", "plan", "conversation"]) {
    const entry = current.locator(`[data-sidebar-session-view="${view}"]`)
    await entry.focus()
    await entry.press("Enter")
    await expect(entry).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator("[data-review-controls]")).toHaveCount(0)
    await expect(main.getByRole("tablist")).toHaveCount(0)
    await expect(retained).toHaveValue("侧栏导航草稿")
    await expect(retained).toHaveAttribute("data-entry-instance", "sidebar")
  }
  await current.locator('[data-sidebar-session-view="runtime"]').click()
  await expect(
    page.getByRole("region", { name: "底部工作面板", exact: true }),
  ).toHaveAttribute("data-collapsed", "false")
  await current.locator('[data-sidebar-session-view="runtime"]').click()
  await expect(
    page.getByRole("region", { name: "底部工作面板", exact: true }),
  ).toHaveAttribute("data-collapsed", "true")
  await nav
    .getByRole("textbox", { name: "搜索会话", exact: true })
    .fill("检查失败")
  await expect(
    nav.locator('[data-session-section="recent"] [data-session-id]'),
  ).toHaveCount(1)
  await expect(
    nav.locator('[data-session-section="running"] [data-session-id]'),
  ).toHaveCount(0)
  await nav.getByRole("textbox", { name: "搜索会话", exact: true }).clear()
  await nav.getByRole("button", { name: /分析资料并整理报告/ }).click()
  await expect(page.locator("main[data-session-id]")).toHaveAttribute(
    "data-session-id",
    "session-report",
  )
  await field.fill("第二个会话草稿")
  await current.getByRole("button", { name: /修复大小写过滤逻辑/ }).click()
  await expect(page.locator("main[data-session-id]")).toHaveAttribute(
    "data-session-id",
    "session-filter",
  )
  await expect(retained).toHaveValue("侧栏导航草稿")
  await page.getByRole("link", { name: "变更", exact: true }).click()
  await page.getByRole("button", { name: "添加行反馈 1", exact: true }).click()
  const feedback = page.getByRole("textbox", { name: /审阅反馈草稿/ })
  await feedback.fill("保留审阅草稿")
  await feedback.evaluate((node) =>
    node.setAttribute("data-review-instance", "retained"),
  )
  const retainedFeedback = page.locator('[data-review-instance="retained"]')
  for (const view of ["context", "plan", "conversation"]) {
    await current.locator(`[data-sidebar-session-view="${view}"]`).click()
    await expect(retainedFeedback).toHaveValue("保留审阅草稿")
  }
  await page.getByRole("link", { name: "变更", exact: true }).click()
  await expect(feedback).toBeVisible()
  await expect(feedback).toHaveValue("保留审阅草稿")
  await expect(feedback).toHaveAttribute("data-review-instance", "retained")
})

test("mobile session views close the navigation sheet and preserve the composer", async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  try {
    await page.goto("/workspace/")
    const field = page.getByRole("textbox", { name: "消息输入", exact: true })
    await field.fill("移动侧栏草稿")
    await field.evaluate((node) =>
      node.setAttribute("data-entry-instance", "mobile-views"),
    )
    const retained = page.locator('[data-entry-instance="mobile-views"]')
    for (const view of ["context", "plan", "conversation"]) {
      await page.getByRole("button", { name: "展开侧栏", exact: true }).tap()
      const sheet = page.getByRole("dialog")
      const entry = sheet.locator(`[data-sidebar-session-view="${view}"]`)
      const box = (await entry.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      await entry.tap()
      await expect(sheet).toHaveCount(0)
      await expect(retained).toHaveValue("移动侧栏草稿")
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
    await page.getByRole("button", { name: "展开侧栏", exact: true }).tap()
    await page.screenshot({
      path: info.outputPath("session-sidebar-mobile.png"),
    })
  } finally {
    await context.close()
  }
})
