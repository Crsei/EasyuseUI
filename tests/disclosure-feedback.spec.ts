import { expect, test } from "@playwright/test"
test("collapsible and accordion distinguish expansion and retain keyboard control", async ({
  page,
}) => {
  await page.goto("/docs/collapsible/")
  const root = page.locator('[data-demo-loader="collapsible"]')
  const button = root.getByRole("button", { name: "展开详情" })
  await button.focus()
  await page.keyboard.press("Space")
  await expect(button).toHaveAttribute("aria-expanded", "true")
  await expect(root.getByText("保留内容与调用方状态。")).toBeVisible()
  await page.keyboard.press("Space")
  await expect(button).toHaveAttribute("aria-expanded", "false")
  await page.goto("/docs/accordion/")
  const accordion = page.locator('[data-demo-loader="accordion"]')
  await accordion.getByRole("button", { name: "操作", exact: true }).click()
  await expect(
    accordion.getByRole("button", { name: "项目详情", exact: true }),
  ).toHaveAttribute("aria-expanded", "true")
  await expect(
    accordion.getByRole("button", { name: "操作", exact: true }),
  ).toHaveAttribute("aria-expanded", "true")
  await expect(accordion.getByRole("button", { name: "不可用" })).toBeDisabled()
})
test("alert dialog traps focus, requires an explicit action and preserves pending result", async ({
  page,
}) => {
  await page.goto("/docs/alert-dialog/")
  const root = page.locator('[data-demo-loader="alert-dialog"]')
  const trigger = root.getByRole("button", { name: "打开", exact: true })
  await trigger.click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole("button", { name: "取消", exact: true }),
  ).toBeFocused()
  await dialog.getByRole("button", { name: "确认请求", exact: true }).click()
  await expect(dialog.getByRole("status")).toHaveText("待确认")
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole("button", { name: "确认请求", exact: true }),
  ).toBeDisabled()
  await dialog.getByRole("button", { name: "取消", exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})
test("tooltip and hover card expose supplemental content without hiding touch navigation", async ({
  page,
}) => {
  await page.goto("/docs/tooltip/")
  const root = page.locator('[data-demo-loader="tooltip"]')
  await root.getByRole("button", { name: "项目详情" }).focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("tooltip")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("tooltip")).not.toBeVisible()
  await page.goto("/docs/hover-card/")
  const link = page
    .locator('[data-demo-loader="hover-card"]')
    .getByRole("link", { name: "项目详情" })
  await link.hover()
  await expect(
    page.locator('[data-demo-loader="hover-card"] [data-open]').last(),
  ).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/#hover-card-details$/)
})
test("context menu works from keyboard and visible touch alternative", async ({
  page,
}) => {
  await page.goto("/docs/context-menu/")
  const root = page.locator('[data-demo-loader="context-menu"]')
  await root.getByText("项目详情", { exact: true }).focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toBeVisible()
  await page.getByRole("menuitem", { name: "读取表单值" }).click()
  await expect(root.locator("output")).toHaveText("read")
  await root.getByRole("button", { name: "操作", exact: true }).click()
  await expect(page.getByRole("menuitem", { name: "不可用" })).toHaveAttribute(
    "aria-disabled",
    "true",
  )
  await page.keyboard.press("Escape")
  await expect(
    root.getByRole("button", { name: "操作", exact: true }),
  ).toBeFocused()
})
test("feedback separates indeterminate progress, measurements and alert semantics", async ({
  page,
}) => {
  await page.goto("/docs/progress/")
  const root = page.locator('[data-demo-loader="progress"]')
  await expect(
    root.getByRole("progressbar", { name: "正在读取" }),
  ).toHaveAttribute("aria-valuenow", "40")
  await expect(
    root.getByRole("progressbar", { name: "待确认" }),
  ).not.toHaveAttribute("aria-valuenow")
  await expect(root.getByRole("meter", { name: "CPU" })).toHaveAttribute(
    "value",
    "64",
  )
  await page.goto("/docs/alert/")
  await expect(
    page.locator('[data-demo-loader="alert"] [role="alert"]'),
  ).toContainText("读取失败")
  await page.goto("/docs/spinner/")
  await expect(
    page.locator('[data-demo-loader="spinner"] [role="status"]'),
  ).toHaveText("正在加载")
})
test("shared notifications update by ID, remain pending and dismiss accessibly", async ({
  page,
}) => {
  await page.goto("/docs/toast/")
  const root = page.locator('[data-demo-loader="toast"]')
  await root.getByRole("button", { name: "打开", exact: true }).click()
  await expect(page.getByText("待确认", { exact: true })).toBeVisible()
  await root.getByRole("button", { name: "打开", exact: true }).click()
  await expect(page.getByText("待确认", { exact: true })).toHaveCount(1)
  await root
    .getByRole("button", { name: "读取失败，已有内容保留。", exact: true })
    .click()
  await expect(
    page.getByText("读取失败，已有内容保留。", { exact: true }),
  ).toHaveCount(2)
  await page.getByRole("button", { name: "关闭通知" }).click()
  await expect(page.getByRole("button", { name: "关闭通知" })).toHaveCount(0)
})
