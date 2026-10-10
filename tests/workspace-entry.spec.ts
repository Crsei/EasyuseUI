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
