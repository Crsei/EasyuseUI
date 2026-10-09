import { expect, test } from "@playwright/test"

test("navigation leads to the component and its source documentation", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "完整的工作界面",
  )
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("link", { name: "组件", exact: true })
    .click()
  await expect(page).toHaveURL(/\/components\/$/)
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Button", exact: true }) })
    .click()
  await expect(page).toHaveURL(/\/docs\/button\/$/)
  await expect(
    page.getByRole("heading", { name: "源码文件", exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test("loading button prevents repeated action and reports completion", async ({
  page,
}) => {
  await page.goto("/docs/button/")
  await page.getByRole("button", { name: "保存更改", exact: true }).click()
  const loading = page.getByRole("button", { name: "保存中…" })
  await expect(loading).toBeDisabled()
  await expect(loading).toHaveAttribute("aria-busy", "true")
  await expect(
    page.getByRole("button", { name: "已保存，重新保存" }),
  ).toBeEnabled()
  await expect(
    page.getByRole("status").filter({ hasText: "演示设置已保存" }),
  ).toBeVisible()
})

test("input communicates validation and accepts corrected values", async ({
  page,
}) => {
  await page.goto("/docs/input/")
  const input = page.getByRole("textbox", { name: "项目名称", exact: true })
  await input.fill("a")
  await expect(input).toHaveAttribute("aria-invalid", "true")
  await expect(input).toHaveAccessibleDescription("名称至少需要 2 个字符。")
  await input.fill("我的工作台")
  await expect(input).not.toHaveAttribute("aria-invalid", "true")
  await expect(input).toHaveAccessibleDescription("即将创建：我的工作台")
})

test("dialog supports Escape, focus restoration and confirmation", async ({
  page,
}) => {
  await page.goto("/docs/dialog/")
  const trigger = page.getByRole("button", { name: "创建项目", exact: true })
  await trigger.click()
  const dialog = page.getByRole("dialog", { name: "创建一个新项目" })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole("textbox", { name: "项目名称" })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(dialog.getByRole("button", { name: "确认创建" })).toBeDisabled()
  await dialog.getByRole("textbox").fill("Easyuse 测试")
  await dialog.getByRole("button", { name: "确认创建" }).click()
  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("status").filter({ hasText: "Easyuse 测试" }),
  ).toBeVisible()
})

test("failed task can be retried and updates progress", async ({ page }) => {
  await page.goto("/docs/task-panel/")
  const progress = page.getByRole("progressbar", { name: "任务完成进度" })
  await expect(progress).toHaveAttribute("aria-valuenow", "67")
  await page.getByRole("button", { name: "重试发布组件清单" }).click()
  await expect(
    page.getByText("正在重新生成组件清单…", { exact: true }),
  ).toBeVisible()
  await expect(progress).toHaveAttribute("aria-valuenow", "100")
})

test("theme persists and mobile layout remains within viewport", async ({
  page,
}, testInfo) => {
  await page.goto("/")
  await page.getByRole("button", { name: "切换深浅主题" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.screenshot({
    path: testInfo.outputPath("home-dark.png"),
    fullPage: true,
  })
  await page.getByRole("button", { name: "切换深浅主题" }).click()
  await page.screenshot({
    path: testInfo.outputPath("home-desktop.png"),
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.screenshot({
    path: testInfo.outputPath("home-mobile.png"),
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.goto("/docs/task-panel/")
  await page.screenshot({
    path: testInfo.outputPath("docs-mobile.png"),
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})

test("registry ships source and resolves the component dependency graph", async ({
  request,
}) => {
  const response = await request.get("/r/task-panel.json")
  expect(response.ok()).toBe(true)
  const item = await response.json()
  expect(item.files[0].content).toContain("export function TaskPanel")
  expect(
    item.registryDependencies.some((url: string) =>
      url.endsWith("/r/button.json"),
    ),
  ).toBe(true)
  const theme = await (await request.get("/r/theme.json")).json()
  expect(theme.cssVars.light.primary).toBeTruthy()
  expect(theme.cssVars.dark.primary).toBeTruthy()
  expect(theme.cssVars.theme["color-success"]).toBe("var(--success)")
  expect((await request.get("/not-a-page/")).status()).toBe(404)
})
