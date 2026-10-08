import { expect, test } from "@playwright/test"
test("action menu restores focus and never activates disabled actions", async ({
  page,
}) => {
  await page.goto("/docs/menu/")
  const trigger = page.getByRole("button", { name: "示例动作", exact: true })
  await trigger.click()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("End")
  await expect(
    page.getByRole("menuitem", { name: "暂不可用" }),
  ).toHaveAttribute("aria-disabled", "true")
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole("menuitem", { name: "增加计数" }).click()
  await expect(page.locator("output")).toHaveText("1")
})
test("tabs distinguish focus from selection; segmented chooses a value", async ({
  page,
}) => {
  await page.goto("/docs/tabs/")
  const first = page.getByRole("tab", { name: "概述", exact: true })
  await first.focus()
  await page.keyboard.press("ArrowRight")
  const next = page.getByRole("tab", { name: "验证", exact: true })
  await expect(next).toBeFocused()
  await expect(first).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("Enter")
  await expect(next).toHaveAttribute("aria-selected", "true")
  await expect(page.getByRole("tabpanel")).toContainText("此示例只验证")
  await page.goto("/docs/segmented/")
  await page.getByRole("radio", { name: "列表", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(
    page.getByRole("radio", { name: "网格", exact: true }),
  ).toBeChecked()
})
test("select and combobox provide keyboard selection, filtering and empty recovery", async ({
  page,
}) => {
  await page.goto("/docs/select/")
  const select = page.getByRole("combobox", { name: "选择工作区", exact: true })
  await select.click()
  await page.getByRole("option", { name: "beta", exact: true }).click()
  await expect(select).toHaveText("beta")
  await expect(select).toBeFocused()
  await page.goto("/docs/combobox/")
  const input = page.getByRole("combobox", { name: "查找工作区", exact: true })
  await input.fill("be")
  await expect(page.getByRole("option")).toHaveCount(1)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(input).toHaveValue("beta")
  await input.fill("no-result")
  await expect(page.getByText("没有匹配的词条", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(input).toBeFocused()
})
