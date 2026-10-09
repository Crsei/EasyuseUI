import { expect, test } from "@playwright/test"
test("groups retain sibling actions and controlled draft through locale", async ({
  page,
}) => {
  await page.goto("/docs/input-group/")
  const root = page.locator('[data-demo-loader="input-group"]')
  const input = root.locator('input[name="draft"]')
  await input.fill("Caller 中文")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(input).toHaveValue("Caller 中文")
  await root.getByRole("button", { name: "Read form values" }).click()
  await expect(root.locator("output")).toHaveText("Caller 中文")
  await expect(root.locator("button button")).toHaveCount(0)
  await page.goto("/docs/button-group/")
  const group = page.locator('[data-demo-loader="button-group"]')
  await group.getByRole("button", { name: "Next", exact: true }).click()
  await expect(group.locator("output")).toHaveText("next")
  await expect(
    group.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled()
})
test("toggle and toggle groups implement keyboard and single/multiple states", async ({
  page,
}) => {
  await page.goto("/docs/toggle/")
  const root = page.locator('[data-demo-loader="toggle"]')
  const bold = root.getByRole("button", { name: "粗体", exact: true })
  await bold.focus()
  await page.keyboard.press("Space")
  await expect(bold).toHaveAttribute("aria-pressed", "true")
  await expect(root.getByRole("button", { name: "不可用" })).toBeDisabled()
  await page.goto("/docs/toggle-group/")
  const groups = page.locator('[data-demo-loader="toggle-group"]')
  const single = groups.getByRole("group", { name: "单选", exact: true })
  await single.getByRole("button", { name: "粗体" }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(single.getByRole("button", { name: "斜体" })).toBeFocused()
  await page.keyboard.press("Space")
  await expect(single.getByRole("button", { name: "粗体" })).toHaveAttribute(
    "aria-pressed",
    "false",
  )
  await expect(single.getByRole("button", { name: "斜体" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  const multiple = groups.getByRole("group", { name: "多选", exact: true })
  await multiple.getByRole("button", { name: "粗体" }).click()
  await multiple.getByRole("button", { name: "斜体" }).click()
  await expect(groups.locator("output")).toHaveText(
    '{"single":["italic"],"multi":["bold","italic"]}',
  )
})
test("OTP uses native insertion, paste, deletion, validation and form submission", async ({
  page,
}) => {
  await page.goto("/docs/input-otp/")
  const root = page.locator('[data-demo-loader="input-otp"]')
  const input = root.getByRole("textbox", { name: "一次性验证码", exact: true })
  await input.fill("123456")
  await input.focus()
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("Backspace")
  await expect(input).toHaveValue("12346")
  await input.fill("654321")
  await root.getByRole("button", { name: "读取表单值" }).click()
  await expect(root.locator("output")).toHaveText("654321")
  await input.fill("abc123")
  expect(
    await input.evaluate((el: HTMLInputElement) => el.validity.patternMismatch),
  ).toBe(true)
  await expect(root.getByRole("textbox", { name: "不可用" })).toBeDisabled()
  await expect(input).toHaveAttribute("autocomplete", "one-time-code")
  await input.fill("")
  await input.focus()
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
  await page.evaluate(() => navigator.clipboard.writeText("987654"))
  await page.keyboard.press("Control+V")
  await expect(input).toHaveValue("987654")
  await page.keyboard.press("Home")
  await page.keyboard.press("Delete")
  await expect(input).toHaveValue("87654")
})
