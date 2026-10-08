import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

async function demo(page: Page, slug: string) {
  await page.goto(`/docs/${slug}/`)
  await expect(page.locator(`[data-demo-loader="${slug}"]`)).toHaveAttribute(
    "data-demo-mounted",
    "true",
  )
  return page.locator(`[data-demo-loader="${slug}"]`)
}

test("table selection preserves hidden IDs and separates activation, links and sorting", async ({
  page,
}) => {
  const root = await demo(page, "data-table")
  await expect(root.getByRole("columnheader")).toHaveCount(10)
  await root
    .getByRole("checkbox", { name: "选择 Alpha worker", exact: true })
    .check()
  await expect(root.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha",
  )
  await expect(root.locator("[data-active-row]")).toContainText("未选择")
  await expect(
    root.getByRole("checkbox", { name: "选择当前可选行" }),
  ).toHaveAttribute("aria-checked", "mixed")
  await root
    .getByRole("button", { name: "查看 Alpha worker", exact: true })
    .click()
  await expect(root.locator("[data-active-row]")).toContainText("alpha")
  await root.getByRole("link", { name: "Grace Hopper" }).click()
  await expect(root.locator("[data-active-row]")).toContainText("alpha")
  await root.getByRole("textbox", { name: "筛选名称" }).fill("Beta")
  await root.getByRole("checkbox", { name: "选择当前可选行" }).check()
  await expect(root.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha, beta",
  )
  await root.getByRole("checkbox", { name: "选择当前可选行" }).uncheck()
  await expect(root.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha",
  )
  await root.getByRole("textbox", { name: "筛选名称" }).fill("")
  await expect(
    root.getByRole("checkbox", { name: "选择 Gamma worker", exact: true }),
  ).toBeDisabled()
  await root.getByRole("button", { name: "任务", exact: true }).click()
  await expect(
    root.getByRole("columnheader", { name: "任务" }),
  ).toHaveAttribute("aria-sort", "ascending")
  await root.getByRole("button", { name: "模拟刷新失败" }).click()
  await expect(root.getByRole("alert")).toContainText("目录刷新失败")
  await expect(root.locator("tbody tr")).toHaveCount(3)
  await root.getByRole("button", { name: "重试读取" }).click()
  await expect(root.getByRole("alert")).toHaveCount(0)
  await root.getByRole("button", { name: "切换无结果" }).click()
  await expect(root.locator("[data-data-state=empty]")).toBeVisible()
  await expect(root.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha",
  )
})

test("checkbox three states and numeric displays expose truthful accessible values", async ({
  page,
}) => {
  let root = await demo(page, "checkbox")
  const box = root.getByRole("checkbox", { name: "启用通知" })
  await box.focus()
  await page.keyboard.press("Space")
  await expect(box).toBeChecked()
  await expect(
    root.getByRole("checkbox", { name: "部分选择" }),
  ).toHaveAttribute("aria-checked", "mixed")
  root = await demo(page, "segment-bar")
  await expect(root.getByRole("meter")).toHaveAttribute("aria-valuenow", "72")
  await expect(
    root.getByRole("img", { name: "Unknown health: 未知" }),
  ).not.toHaveAttribute("aria-valuenow")
  root = await demo(page, "rating-display")
  await expect(
    root.getByRole("img", { name: "评分: 一共 5 星，当前 4.5 星" }),
  ).toBeVisible()
  root = await demo(page, "sparkline")
  await expect(root.getByRole("img", { name: /最近任务量/ })).toBeVisible()
  await expect(root.locator("svg").first().locator("rect")).toHaveCount(6)
  await expect(root.getByRole("img", { name: /Empty values/ })).toContainText(
    "没有可用数值",
  )
  root = await demo(page, "avatar")
  await expect(root.getByRole("img", { name: "Grace Hopper" })).toHaveText("GH")
})

test("sheet nested Select and Popover close one level, retain draft and restore focus", async ({
  page,
}) => {
  const root = await demo(page, "sheet")
  const trigger = root.getByRole("button", {
    name: "打开详情抽屉 · right",
    exact: true,
  })
  await trigger.click()
  const sheet = page.getByRole("dialog", { name: "节点详情 · right" })
  await expect(sheet).toBeVisible()
  await sheet
    .getByRole("textbox", { name: "草稿名称" })
    .fill("Persistent draft 中文")
  const select = sheet.getByRole("combobox", { name: "工作区", exact: true })
  await select.click()
  await expect(
    page.getByRole("option", { name: "Alpha", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("End")
  await expect(
    page.getByRole("option", { name: "Beta", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(select).toHaveText("Beta")
  await select.click()
  await page.keyboard.press("Escape")
  await expect(sheet).toBeVisible()
  await expect(select).toBeFocused()
  const more = sheet.getByRole("button", { name: "节点详情", exact: true })
  await more.click()
  await expect(page.getByRole("dialog")).toHaveCount(2)
  await page.keyboard.press("Escape")
  await expect(sheet).toBeVisible()
  await expect(more).toBeFocused()
  const body = sheet.locator("[class*=body]")
  await expect
    .poll(() => body.evaluate((el) => el.scrollHeight > el.clientHeight))
    .toBe(true)
  const headerY = (await sheet.locator("[class*=header]").boundingBox())!.y
  const footerY = (await sheet.locator("[class*=footer]").boundingBox())!.y
  await more.focus()
  await page.keyboard.press("PageDown")
  await expect
    .poll(() => body.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0)
  expect((await sheet.locator("[class*=header]").boundingBox())!.y).toBe(
    headerY,
  )
  expect((await sheet.locator("[class*=footer]").boundingBox())!.y).toBe(
    footerY,
  )
  await sheet.getByRole("button", { name: "保留草稿并关闭" }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(sheet.getByRole("textbox", { name: "草稿名称" })).toHaveValue(
    "Persistent draft 中文",
  )
})

test("dropdown checkbox and radio items use keyboard and disabled semantics", async ({
  page,
}) => {
  const root = await demo(page, "dropdown-menu")
  const trigger = root.getByRole("button", { name: "显示设置" })
  await trigger.click()
  const checkbox = page.getByRole("menuitemcheckbox", { name: "显示趋势" })
  await expect(checkbox).toBeChecked()
  await checkbox.click()
  await expect(checkbox).not.toBeChecked()
  await page.getByRole("menuitemradio", { name: "舒适", exact: true }).click()
  await expect(
    page.getByRole("menuitemradio", { name: "舒适", exact: true }),
  ).toBeChecked()
  await expect(
    page.getByRole("menuitem", { name: "不可用", exact: true }),
  ).toHaveAttribute("aria-disabled", "true")
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

test("command palette filters caller results, skips disabled items, respects IME and preserves query", async ({
  page,
}) => {
  const root = await demo(page, "command-palette")
  const trigger = root.getByRole("button", { name: "打开命令搜索" })
  await trigger.click()
  const input = page.getByRole("combobox", { name: "搜索命令" })
  await expect(input).toBeFocused()
  await input.fill("不存在")
  await expect(page.getByText("没有匹配命令", { exact: true })).toBeVisible()
  await input.fill("")
  await page.keyboard.press("End")
  await expect(input).toHaveAttribute("aria-activedescendant", /activity$/)
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true })
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(root.getByRole("status")).toHaveText("打开活动记录")
  await expect(trigger).toBeFocused()
  await trigger.click()
  await input.fill("节点")
  await page.keyboard.press("Escape")
  await trigger.click()
  await expect(input).toHaveValue("节点")
})

test("field errors associate IDs and slider commits keyboard values", async ({
  page,
}) => {
  let root = await demo(page, "field")
  const input = root.getByRole("textbox", { name: "名称" })
  await root.getByRole("button", { name: "检查输入" }).click()
  await expect(input).toHaveAttribute("aria-invalid", "true")
  await expect(input).toHaveAccessibleDescription(/请输入名称/)
  await input.fill("Unchanged draft")
  await root.getByRole("button", { name: "检查输入" }).click()
  await expect(input).not.toHaveAttribute("aria-invalid")
  await expect(input).toHaveValue("Unchanged draft")
  const budget = root.getByRole("textbox", { name: "任务额度" })
  await budget.fill("invalid amount")
  await root.getByRole("button", { name: "检查输入" }).click()
  await expect(budget).toHaveValue("invalid amount")
  await expect(budget).toHaveAttribute("aria-invalid", "true")
  root = await demo(page, "slider")
  const slider = root.getByRole("slider", { name: "并发限制" })
  await slider.focus()
  await page.keyboard.press("End")
  await expect(slider).toHaveValue("16")
  await expect(root.getByRole("status")).toHaveText("已确认数值：16")
  await page.keyboard.press("Home")
  await expect(slider).toHaveValue("1")
})

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lH8AAAAASUVORK5CYII=",
  "base64",
)
test("image upload retains valid preview after type, size and decode failures; remove recovers", async ({
  page,
}) => {
  const root = await demo(page, "image-upload")
  const input = root.locator('input[type="file"]')
  await input.setInputFiles({
    name: "first.png",
    mimeType: "image/png",
    buffer: png,
  })
  await expect(root.getByRole("img", { name: "first.png" })).toBeVisible()
  await input.setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bad"),
  })
  await expect(root.getByRole("alert")).toContainText("允许类型")
  await expect(root.getByRole("img", { name: "first.png" })).toBeVisible()
  await input.setInputFiles({
    name: "big.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(1024 * 1024 + 1),
  })
  await expect(root.getByRole("alert")).toContainText("大小限制")
  await input.setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("broken"),
  })
  await expect(root.getByRole("alert")).toContainText("无法读取图片")
  await expect(root.getByRole("img", { name: "first.png" })).toBeVisible()
  await root.getByRole("button", { name: "移除图片" }).click()
  await expect(root.getByRole("img")).toHaveCount(0)
  await expect(root.getByRole("alert")).toHaveCount(0)
  await input.setInputFiles({
    name: "second.png",
    mimeType: "image/png",
    buffer: png,
  })
  await expect(root.getByRole("img", { name: "second.png" })).toBeVisible()
})

test("table locale switch retains current row and hidden selections", async ({
  page,
}) => {
  const root = await demo(page, "data-table")
  await root
    .getByRole("checkbox", { name: "选择 Alpha worker", exact: true })
    .check()
  await root
    .getByRole("button", { name: "查看 Alpha worker", exact: true })
    .click()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(root.locator("[data-selection-ids]")).toHaveText(
    "hidden-worker, alpha",
  )
  await expect(root.locator("[data-active-row]")).toHaveText("Viewing: alpha")
  await expect(
    root.getByRole("button", { name: "View Alpha worker", exact: true }),
  ).toHaveAttribute("aria-current", "true")
})

test("sidebar width uses controlled bounds and persists separately for each workspace", async ({
  page,
}) => {
  await page.goto("/workspace/layout/")
  const handle = page.getByRole("separator", { name: "调整导航栏宽度" })
  await handle.focus()
  await page.keyboard.press("End")
  await expect(handle).toHaveAttribute("aria-valuenow", "400")
  await page.getByRole("combobox", { name: "示例工作区" }).selectOption("beta")
  await expect(handle).toHaveAttribute("aria-valuenow", "256")
  await handle.focus()
  await page.keyboard.press("Home")
  await expect(handle).toHaveAttribute("aria-valuenow", "200")
  await page.getByRole("combobox", { name: "示例工作区" }).selectOption("alpha")
  await expect(handle).toHaveAttribute("aria-valuenow", "400")
  await page.reload()
  await expect(handle).toHaveAttribute("aria-valuenow", "400")
  await handle.scrollIntoViewIfNeeded()
  const bounds = await handle.boundingBox()
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    bounds!.x + bounds!.width / 2 - 64,
    bounds!.y + bounds!.height / 2,
    { steps: 8 },
  )
  await page.mouse.up()
  await expect(handle).toHaveAttribute("aria-valuenow", "336")
  expect(
    await handle.evaluate(
      (element) =>
        document
          .getElementById(element.getAttribute("aria-controls")!)!
          .getBoundingClientRect().width,
    ),
  ).toBe(336)
})

test("dual theme and locale sheets keep portals scoped and isolate values", async ({
  page,
}) => {
  await page.goto("/benchmarks/common-components/")
  const light = page.locator('[data-common-scope="light"]')
  const dark = page.locator('[data-common-scope="dark"]')
  await dark
    .getByRole("button", { name: "Open detail sheet · right", exact: true })
    .click()
  const sheet = dark.getByRole("dialog", { name: "Worker details · right" })
  await expect(sheet).toBeVisible()
  await expect(sheet).toHaveCSS(
    "color",
    await dark.evaluate((el) => getComputedStyle(el).color),
  )
  await sheet.getByRole("combobox", { name: "Workspace", exact: true }).click()
  await expect(
    dark.getByRole("option", { name: "Beta", exact: true }),
  ).toBeVisible()
  await expect(light.getByRole("option")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.keyboard.press("Escape")
  await light
    .getByRole("button", { name: "打开详情抽屉 · right", exact: true })
    .click()
  await expect(light.getByRole("textbox", { name: "草稿名称" })).toHaveValue(
    "Alpha worker",
  )
})

test("representative table and command controls pass axe and narrow layouts", async ({
  page,
}) => {
  await demo(page, "data-table")
  const violations = (
    await new AxeBuilder({ page }).include("[data-common-table]").analyze()
  ).violations
  expect(violations).toEqual([])
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true)
  }
  await demo(page, "command-palette")
  await page.getByRole("button", { name: "打开命令搜索" }).click()
  expect(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
      .violations,
  ).toEqual([])
})

test("touch filters and sheets keep 44px targets with reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const root = await demo(page, "data-table")
  const filter = root.getByRole("button", { name: "筛选", exact: true })
  await filter.tap()
  const sheet = page.getByRole("dialog")
  await expect(sheet).toBeVisible()
  await expect(
    sheet.getByRole("combobox", { name: "范围", exact: true }),
  ).toBeVisible()
  await expect(
    sheet.getByRole("button", { name: "关闭弹窗", exact: true }),
  ).toHaveCSS("min-height", "44px")
  await page.keyboard.press("Escape")
  const check = root.getByRole("checkbox", {
    name: "选择 Alpha worker",
    exact: true,
  })
  expect((await check.boundingBox())!.width).toBeGreaterThanOrEqual(44)
  await check.tap()
  await expect(check).toBeChecked()
  await context.close()
})

test("table loading and partial scenarios preserve independent selection", async ({
  page,
}) => {
  const root = await demo(page, "data-table")
  const state = root.getByRole("combobox", { name: "读取状态" })
  await state.click()
  await page.getByRole("option", { name: "初次加载", exact: true }).click()
  await expect(root.locator('[data-data-state="loading"]')).toBeVisible()
  await expect(root.locator("tbody tr")).toHaveCount(0)
  await state.click()
  await page.getByRole("option", { name: "部分数据", exact: true }).click()
  await expect(root.locator('[data-data-state="partial"]')).toBeVisible()
  await expect(root.locator("tbody tr")).toHaveCount(3)
  await expect(root.locator("[data-selection-ids]")).toHaveText("hidden-worker")
})

test("command shortcut is scoped, ignores text entry and blocks actions during loading or error", async ({
  page,
}) => {
  const root = await demo(page, "command-palette")
  const draft = root.getByRole("textbox", { name: "草稿名称" })
  await draft.fill("Caller draft")
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  const state = root.getByRole("combobox", { name: "读取状态" })
  await state.click()
  await page.getByRole("option", { name: "初次加载", exact: true }).click()
  const trigger = root.getByRole("button", { name: "打开命令搜索" })
  await trigger.focus()
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await state.click()
  await page.getByRole("option", { name: "读取失败", exact: true }).click()
  await trigger.click()
  await expect(page.getByRole("alert")).toHaveText(/目录刷新失败/)
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "重试读取" }).click()
  await page.getByRole("combobox", { name: "搜索命令" }).press("Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(draft).toHaveValue("Caller draft")
})

test("superseded local image reads cannot replace a newer selection", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = FileReader.prototype.readAsDataURL
    FileReader.prototype.readAsDataURL = function (file) {
      if (file instanceof File && file.name === "slow.png")
        setTimeout(() => original.call(this, file), 400)
      else original.call(this, file)
    }
  })
  const root = await demo(page, "image-upload")
  const input = root.locator('input[type="file"]')
  await input.setInputFiles({
    name: "slow.png",
    mimeType: "image/png",
    buffer: png,
  })
  await input.setInputFiles({
    name: "latest.png",
    mimeType: "image/png",
    buffer: png,
  })
  await expect(root.getByRole("img", { name: "latest.png" })).toBeVisible()
  await page.waitForTimeout(600)
  await expect(root.getByRole("img", { name: "latest.png" })).toBeVisible()
  await expect(root.getByRole("img", { name: "slow.png" })).toHaveCount(0)
})
