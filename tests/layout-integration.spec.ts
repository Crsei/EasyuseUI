import { expect, test } from "@playwright/test"
test("inline command retains keyboard, IME guard and caller filtering without a dialog", async ({
  page,
}) => {
  await page.goto("/docs/command/")
  const root = page.locator('[data-demo-loader="command"]')
  const input = root.getByRole("combobox")
  await input.focus()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(root.locator("output")).toHaveText("next")
  await expect(root.getByRole("listbox")).toBeVisible()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await input.fill("读取")
  await expect(root.getByRole("option")).toHaveCount(1)
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true })
  await expect(root.locator("output")).toHaveText("next")
  await input.press("Enter")
  await expect(root.locator("output")).toHaveText("read")
})
test("sidebar collapses without removing navigation labels or current-page state", async ({
  page,
}) => {
  await page.goto("/docs/sidebar/")
  const root = page.locator('[data-demo-loader="sidebar"]')
  await root.getByRole("button", { name: "折叠侧栏" }).click()
  const sidebar = root.getByRole("complementary")
  await expect(sidebar).toHaveCSS("width", "48px")
  await expect(sidebar.getByRole("link", { name: "项目详情" })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await expect(
    sidebar.getByRole("link", { name: "操作", exact: true }),
  ).toBeVisible()
  await root.getByRole("button", { name: "展开侧栏" }).click()
  await expect(sidebar).toHaveCSS("width", "256px")
})
test("resizing supports keyboard, pointer, boundaries and cancellation", async ({
  page,
}) => {
  await page.goto("/docs/resizable/")
  const root = page.locator('[data-demo-loader="resizable"]')
  const handle = root.getByRole("separator")
  await handle.focus()
  await page.keyboard.press("ArrowRight")
  await expect(root.locator("output")).toHaveText("208")
  await page.keyboard.press("Home")
  await expect(root.locator("output")).toHaveText("120")
  await page.keyboard.press("End")
  await expect(root.locator("output")).toHaveText("320")
  const box = await handle.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 20)
  await page.mouse.down()
  await handle.dispatchEvent("pointermove", {
    pointerId: 99,
    clientX: 0,
    clientY: box!.y + 20,
  })
  await expect(handle).toHaveAttribute("aria-valuenow", "320")
  await page.mouse.move(box!.x - 40, box!.y + 20)
  await page.mouse.up()
  await expect(handle).toHaveAttribute("aria-valuenow", "278")
  await handle.dispatchEvent("pointercancel", { pointerId: 1 })
  await expect(handle).toHaveAttribute("aria-orientation", "vertical")
})
test("native scroll area supports keyboard scrolling in its own region", async ({
  page,
}) => {
  await page.goto("/docs/scroll-area/")
  const region = page
    .locator('[data-demo-loader="scroll-area"]')
    .getByRole("region", { name: "项目详情" })
  await region.focus()
  await page.keyboard.press("End")
  await expect
    .poll(() => region.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(400)
  await page.keyboard.press("Home")
  await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBe(0)
})
test("drawer uses Sheet focus and closes by its explicit swipe handle", async ({
  page,
}) => {
  await page.goto("/docs/drawer/")
  const root = page.locator('[data-demo-loader="drawer"]')
  const trigger = root.getByRole("button", { name: "打开", exact: true })
  await trigger.click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  const handle = dialog.getByRole("button", { name: "关闭抽屉" })
  // Wait for the Sheet entrance animation to settle before taking coordinates.
  await handle.hover()
  const box = await handle.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box!.x + box!.width / 2,
    box!.y + box!.height / 2 + 64,
    { steps: 5 },
  )
  await page.mouse.up()
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})
test("conversation can locate a loaded message by ID without altering selection or following history", async ({
  page,
}) => {
  await page.goto("/docs/chat-message/")
  await page.locator("summary").filter({ hasText: "消息定位示例" }).click()
  const root = page.locator("[data-conversation-navigation]")
  await root.getByRole("button", { name: "上一项" }).click()
  const first = root.locator('[data-follow-tail-id="nav-0"]')
  await expect(first).toBeFocused()
  const scroll = root.locator('div[tabindex="0"][aria-label]')
  await expect.poll(() => scroll.evaluate((el) => el.scrollTop)).toBeLessThan(8)
  await root.getByRole("button", { name: "下一项" }).click()
  await expect
    .poll(() =>
      scroll.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight),
    )
    .toBeLessThan(4)
})
