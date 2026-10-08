import { expect, test } from "@playwright/test"

test("controlled layout clamps damaged preferences and persists per workspace only after actions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "easyuseui-layout-demo:alpha",
      JSON.stringify({
        inspectorWidth: 999,
        bottomPanelHeight: -50,
        inspectorOpen: true,
      }),
    )
    const writes: string[] = []
    Object.assign(window, { layoutWrites: writes })
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("easyuseui-layout-demo:")) writes.push(key)
      return original.call(this, key, value)
    }
  })
  await page.goto("/workspace/layout/")
  const width = page.getByRole("separator", { name: "调整 Inspector 宽度" })
  await expect(width).toHaveAttribute("aria-valuenow", "360")
  await expect(
    page.getByRole("separator", { name: "调整底部面板高度" }),
  ).toHaveAttribute("aria-valuenow", "200")
  expect(
    await page.evaluate(() => Reflect.get(window, "layoutWrites")),
  ).toEqual([])
  await page.getByRole("button", { name: "折叠侧栏", exact: true }).click()
  await expect(page.locator("[data-sidebar-collapsed]")).toHaveAttribute(
    "data-sidebar-collapsed",
    "true",
  )
  await page
    .getByRole("combobox", { name: "示例工作区", exact: true })
    .selectOption("beta")
  await expect(page.locator("[data-sidebar-collapsed]")).toHaveAttribute(
    "data-sidebar-collapsed",
    "false",
  )
  await page
    .getByRole("combobox", { name: "示例工作区", exact: true })
    .selectOption("alpha")
  await expect(page.locator("[data-sidebar-collapsed]")).toHaveAttribute(
    "data-sidebar-collapsed",
    "true",
  )
  const draft = page.getByRole("textbox", { name: "布局示例输入", exact: true })
  await draft.fill("Keep this draft")
  const writesBefore = await page.evaluate(
    () => Reflect.get(window, "layoutWrites").length,
  )
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    page.getByRole("textbox", { name: "Layout example input", exact: true }),
  ).toHaveValue("Keep this draft")
  await page.setViewportSize({ width: 1024, height: 900 })
  expect(
    await page.evaluate(() => Reflect.get(window, "layoutWrites").length),
  ).toBe(writesBefore)
  await page
    .getByRole("button", { name: "Open Inspector", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Open Inspector", exact: true }),
  ).toBeFocused()
})

test("layout saves user changes, restores on refresh and resets damaged JSON", async ({
  page,
}) => {
  await page.goto("/workspace/layout/")
  await page.getByRole("button", { name: "折叠侧栏", exact: true }).click()
  await page.reload()
  await expect(page.locator("[data-sidebar-collapsed]")).toHaveAttribute(
    "data-sidebar-collapsed",
    "true",
  )
  await page.evaluate(() =>
    localStorage.setItem("easyuseui-layout-demo:alpha", "{bad json"),
  )
  await page.reload()
  await expect(page.locator("[data-sidebar-collapsed]")).toHaveAttribute(
    "data-sidebar-collapsed",
    "false",
  )
  await page.getByRole("button", { name: "重置布局", exact: true }).click()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("easyuseui-layout-demo:alpha")!)
          .inspectorWidth,
    ),
  ).toBe(320)
})
