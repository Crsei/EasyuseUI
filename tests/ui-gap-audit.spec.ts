import { expect, test, type Locator, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
async function scene(page: Page) {
  await page.goto("/examples/component-contracts/")
  await expect(page.locator('[data-fixture="table"] tbody tr')).toHaveCount(2)
}
async function inside(locator: Locator, height: number) {
  const box = (await locator.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(height + 1)
}
async function hit(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((el) => {
        const b = el.getBoundingClientRect()
        return el.contains(
          document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
        )
      }),
    )
    .toBe(true)
}

test("short viewport dialogs retain actions, drafts and modal focus", async ({
  page,
}) => {
  for (const height of [844, 320, 240]) {
    await page.setViewportSize({ width: 390, height })
    await scene(page)
    const opener = page.getByRole("button", { name: "打开长表单", exact: true })
    await opener.click()
    const dialog = page.getByRole("dialog", { name: "长表单与错误恢复" })
    await inside(dialog, height)
    await inside(dialog.getByRole("button", { name: "关闭弹窗" }), height)
    const draft = dialog.getByRole("textbox", { name: "示例草稿" })
    await draft.fill("保留草稿")
    await dialog.getByRole("button", { name: "追加错误" }).click()
    const submit = dialog.getByRole("button", { name: "提交本地示例" })
    await inside(submit, height)
    await hit(submit)
    const scroll = await page.evaluate(() => window.scrollY)
    await submit.focus()
    await page.keyboard.press("Shift+Tab")
    await page.keyboard.press("Tab")
    await expect(submit).toBeFocused()
    await submit.click()
    await expect(page.locator("[data-submitted]")).toHaveText("1")
    await draft.focus()
    await page.keyboard.press("PageDown")
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll)
    await page.keyboard.press("Escape")
    await expect(opener).toBeFocused()
    await opener.click()
    await expect(draft).toHaveValue("保留草稿")
    await page.keyboard.press("Escape")
    await page
      .getByRole("button", { name: "打开命令搜索", exact: true })
      .click()
    const palette = page.getByRole("dialog")
    await inside(palette, height)
    await inside(palette.getByRole("button", { name: "关闭弹窗" }), height)
    await page.keyboard.press("Escape")
    await expect(
      page.getByRole("button", { name: "打开命令搜索", exact: true }),
    ).toBeFocused()
  }
})
test("nested layers follow hit testing, theme and Escape ownership", async ({
  page,
}) => {
  await scene(page)
  const outer = page.getByRole("button", { name: "打开对象抽屉", exact: true })
  await outer.click()
  const sheet = page.getByRole("dialog", { name: "对象检查" })
  const inner = sheet.getByRole("button", { name: "打开嵌套对话框" })
  await inner.click()
  const dialog = page.getByRole("dialog", { name: "嵌套详情" })
  const more = dialog.getByRole("button", { name: "打开补充说明" })
  await hit(more)
  expect(
    await dialog.evaluate((el) => Number(getComputedStyle(el).zIndex)),
  ).toBeGreaterThan(
    await sheet.evaluate((el) => Number(getComputedStyle(el).zIndex)),
  )
  expect(
    await dialog.evaluate((el) =>
      el.closest("[data-eu-theme]")?.getAttribute("data-eu-theme"),
    ),
  ).toBe("dark")
  await more.click()
  const supplement = page.getByRole("dialog", { name: "补充说明" })
  await hit(supplement.getByRole("button", { name: "提交本地示例" }))
  await page.keyboard.press("Escape")
  await expect(supplement).not.toBeVisible()
  await expect(more).toBeFocused()
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(inner).toBeFocused()
  await expect(sheet).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(outer).toBeFocused()
})
test("panel token and reduced motion govern dialog lifecycle", async ({
  page,
}) => {
  await scene(page)
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--motion-panel", "470ms"),
  )
  const opener = page.getByRole("button", { name: "打开长表单", exact: true })
  await opener.click()
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toContain("0.47s")
  await page.keyboard.press("Escape")
  await expect(opener).toBeFocused()
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (let i = 0; i < 3; i++) {
    await opener.click()
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toMatch(/^(0s|1e-05s)$/)
    await page.keyboard.press("Escape")
    await expect(opener).toBeFocused()
  }
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await opener.click()
  await hit(page.getByRole("dialog").getByRole("button", { name: "关闭弹窗" }))
})
test("toolbar arrows skip disabled commands and preserve input caret", async ({
  page,
}) => {
  await scene(page)
  const toolbar = page.getByRole("toolbar", { name: "画布命令" }).first()
  const save = toolbar.getByRole("button", { name: "保存布局" })
  await save.focus()
  await page.keyboard.press("ArrowRight")
  const input = toolbar.getByRole("textbox")
  await expect(input).toBeFocused()
  await input.fill("abcd")
  await page.keyboard.press("ArrowLeft")
  expect(
    await input.evaluate((el) => (el as HTMLInputElement).selectionStart),
  ).toBe(3)
  await expect(input).toBeFocused()
  await save.focus()
  await page.keyboard.press("Tab")
  expect(
    await toolbar.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(false)
})
test("overflow preserves focused commands and invokes only once", async ({
  page,
}) => {
  await scene(page)
  const root = page.locator('[data-fixture="command-toolbar"]')
  const align = root.getByRole("button", { name: "对齐所选对象" })
  await align.focus()
  // Resize the actual fixture container, leaving the focused command untouched.
  await root
    .locator(":scope > div")
    .evaluate((el) => ((el as HTMLElement).style.width = "280px"))
  const more = root.getByRole("button", { name: "更多命令" })
  await expect(more).toBeFocused()
  await more.click()
  const undo = page.getByRole("menuitem", { name: "撤销", exact: true })
  await undo.click()
  await expect(root.locator("[data-command-count]")).toHaveText("1")
  await more.click()
  await expect(
    page.getByRole("menuitem", { name: "撤销", exact: true }),
  ).toBeDisabled()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(350)
  await more.click()
  await page.getByRole("menuitem", { name: "模拟失败" }).click()
  await expect(root.getByRole("alert")).toContainText("模拟失败")
  await more.click()
  await page.getByRole("menuitem", { name: "撤销", exact: true }).focus()
  await root
    .locator(":scope > div")
    .evaluate((el) => ((el as HTMLElement).style.width = "1400px"))
  await page.keyboard.press("Escape")
  await expect(
    root.getByRole("button", { name: "撤销", exact: true }),
  ).toBeFocused()
})
test("nested resizable panels clamp, cancel and restore preferences", async ({
  page,
}) => {
  await scene(page)
  const root = page.locator('[data-fixture="resizable"]'),
    handle = root.getByRole("separator", { name: "主从分栏" }),
    vertical = root.getByRole("separator", { name: "上下分栏" })
  await handle.focus()
  await page.keyboard.press("End")
  await expect(handle).toHaveAttribute("aria-valuenow", "480")
  await vertical.focus()
  await page.keyboard.press("Home")
  await expect(vertical).toHaveAttribute("aria-valuenow", "80")
  await root.getByRole("button", { name: "缩窄容器" }).click()
  await expect
    .poll(async () => Number(await handle.getAttribute("aria-valuenow")))
    .toBeLessThan(200)
  await root.getByRole("button", { name: "扩大容器" }).click()
  await expect(handle).toHaveAttribute("aria-valuenow", "480")
  await root.getByRole("button", { name: "收起首面板" }).click()
  await expect(handle).toHaveAttribute("aria-valuenow", "0")
  await root.getByRole("button", { name: "恢复首面板" }).click()
  await expect(handle).toHaveAttribute("aria-valuenow", "480")
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(box.x - 60, box.y + 20)
  const accepted = await handle.getAttribute("aria-valuenow")
  await handle.dispatchEvent("pointercancel", { pointerId: 1 })
  await page.mouse.move(box.x - 120, box.y + 20)
  await page.mouse.up()
  await expect(handle).toHaveAttribute("aria-valuenow", accepted!)
  await root.evaluate((el) => ((el as HTMLElement).dir = "rtl"))
  await handle.focus()
  const before = Number(await handle.getAttribute("aria-valuenow"))
  await page.keyboard.press("ArrowRight")
  await expect(handle).toHaveAttribute("aria-valuenow", String(before - 8))
})
test("inspector dimensions and confirmation retain their contracts", async ({
  page,
}) => {
  await scene(page)
  const root = page.locator('[data-fixture="shell"]'),
    handle = root.getByRole("separator", { name: "调整 Inspector 宽度" })
  await handle.focus()
  await expect(handle).toHaveAttribute("aria-valuemin", "300")
  await expect(handle).toHaveAttribute("aria-valuemax", "360")
  await expect(handle).toHaveAttribute("aria-valuenow", "300")
  await page.keyboard.press("End")
  await expect(handle).toHaveAttribute("aria-valuenow", "360")
  const panel = root.getByRole("complementary", { name: "Inspector" })
  expect((await panel.boundingBox())!.width).toBe(360)
  await page.keyboard.press("Home")
  expect((await panel.boundingBox())!.width).toBe(300)
  const confirm = root.getByRole("button", { name: "打开确认" })
  await confirm.click()
  const dialog = page.getByRole("alertdialog", { name: "确认本地操作" })
  await hit(dialog.getByRole("button", { name: "取消", exact: true }))
  await page.keyboard.press("Escape")
  await expect(confirm).toBeFocused()
})
test("table controls preserve selection, query identity and interactive cells", async ({
  page,
}) => {
  await scene(page)
  const root = page.locator('[data-fixture="table"]')
  await expect(root).toContainText("总数未知")
  await root.getByRole("checkbox", { name: "选择当前可选行" }).check()
  await expect(root.locator("[data-selected-ids]")).toContainText(
    "outside-page",
  )
  const cell = root.getByRole("button", {
    name: "任务 initial-1-0",
    exact: true,
  })
  await cell.click()
  await expect(root.locator("[data-cell-count]")).toHaveText("1")
  expect(await root.locator("button button").count()).toBe(0)
  await root.getByRole("button", { name: "下一页", exact: true }).click()
  await expect(root.locator("[data-query-key]")).toContainText("cursor-2")
  await expect(root.locator("[data-selected-ids]")).toContainText("initial-1-0")
  await root.getByRole("button", { name: "名称", exact: true }).click()
  await expect(root.locator("[data-query-key]")).toContainText(
    '"title","asc",1,2,null',
  )
  await root.getByRole("button", { name: "列设置", exact: true }).click()
  const controls = page.getByRole("dialog", { name: "列设置" })
  await controls.getByRole("checkbox", { name: "状态", exact: true }).uncheck()
  await controls.getByRole("button", { name: "向前移动状态" }).focus()
  await page.keyboard.press("Enter")
  await controls.getByRole("checkbox", { name: "状态", exact: true }).check()
  const width = controls.getByRole("spinbutton", { name: "名称列宽度" })
  await width.focus()
  await page.keyboard.press("ArrowUp")
  await expect(width).toHaveValue("248")
  await page.keyboard.press("Escape")
  const headers = await root.getByRole("columnheader").allTextContents()
  expect(headers.indexOf("状态")).toBeLessThan(
    headers.findIndex((text) => text.includes("名称")),
  )
  await root.getByRole("button", { name: "查询A：延迟返回" }).click()
  await root.getByRole("button", { name: "查询B：立即返回" }).click()
  await root.getByRole("button", { name: "完成迟到A" }).click()
  await expect(root.locator("tbody")).toContainText("fast-1-0")
  await expect(root.locator("tbody")).not.toContainText("slow")
  await root.getByRole("button", { name: "模拟刷新失败" }).click()
  await expect(root.getByRole("alert")).toContainText("读取失败")
  await expect(root.locator("tbody tr")).toHaveCount(2)
})
test("forced colors retain focus, selection, errors and labels", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ forcedColors: "active" })
  await scene(page)
  const states = page.locator('[data-fixture="states"]'),
    selected = states.getByRole("button", { name: "已选择的操作" })
  await page.keyboard.press("Tab")
  await selected.focus()
  expect(
    await selected.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe("none")
  await expect(selected).toHaveAttribute("aria-pressed", "true")
  expect(
    await selected.evaluate((el) => getComputedStyle(el).textDecorationLine),
  ).toContain("underline")
  const input = states.getByRole("textbox", { name: "示例草稿" })
  await input.focus()
  expect(
    await input.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe("none")
  await expect(input).toHaveAttribute("aria-describedby", "fixture-field-error")
  await expect(states.getByRole("button", { name: "暂无权限" })).toBeDisabled()
  await expect(
    states.getByRole("button", { name: "正在处理，等待调用方" }),
  ).toContainText("正在处理")
  const tree = states.getByRole("treeitem").first()
  await tree.focus()
  expect(
    await tree.evaluate(
      (el) => getComputedStyle(el.querySelector("[class*=row]")!).outlineStyle,
    ),
  ).not.toBe("none")
  await page.screenshot({
    path: testInfo.outputPath("forced-colors.png"),
    fullPage: true,
  })
  const results = await new AxeBuilder({ page })
    .include("#main-content")
    .analyze()
  expect(results.violations).toEqual([])
})
test("lightweight chart distinguishes zero and missing reasons with a table", async ({
  page,
}) => {
  await scene(page)
  const chart = page.getByRole("figure", { name: "已计算的轻量指标" }),
    table = chart.getByRole("table")
  await expect(
    table.getByRole("row", { name: "实际零值 0", exact: true }),
  ).toBeVisible()
  for (const name of ["未知", "未采集", "无权限", "缺失区间"])
    await expect(table.getByRole("row").filter({ hasText: name })).toHaveCount(
      1,
    )
  await expect(chart.locator("svg path")).toHaveCount(2)
  await expect(chart.locator("svg circle")).toHaveCount(3)
  await expect(chart.locator("..")).toHaveAttribute(
    "data-data-state",
    "partial",
  )
})
test("coarse pointer dialogs and splitters preserve touch target sizes", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: false,
    viewport: { width: 390, height: 240 },
  })
  const page = await context.newPage()
  await page.goto("/examples/component-contracts/")
  await page.getByRole("button", { name: "打开长表单", exact: true }).tap()
  const dialog = page.getByRole("dialog")
  for (const name of ["关闭弹窗", "提交本地示例"]) {
    const button = dialog.getByRole("button", { name })
    await inside(button, 240)
    await expect
      .poll(async () => (await button.boundingBox())!.height)
      .toBeGreaterThanOrEqual(44)
  }
  await dialog.getByRole("button", { name: "关闭弹窗" }).tap()
  const handle = page
    .locator('[data-fixture="resizable"]')
    .getByRole("separator", { name: "主从分栏" })
  await handle.scrollIntoViewIfNeeded()
  expect((await handle.boundingBox())!.width).toBeGreaterThanOrEqual(44)
  await handle.tap()
  await expect(handle).toBeFocused()
  const client = await context.newCDPSession(page)
  const bounds = (await handle.boundingBox())!
  const x = bounds.x + bounds.width / 2,
    y = Math.max(80, Math.min(200, bounds.y + bounds.height / 2))
  const before = Number(await handle.getAttribute("aria-valuenow"))
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  })
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x - 24, y }],
  })
  await expect
    .poll(async () => Number(await handle.getAttribute("aria-valuenow")))
    .toBeLessThan(before)
  const accepted = await handle.getAttribute("aria-valuenow")
  await client.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  })
  await expect(handle).toHaveAttribute("aria-valuenow", accepted!)
  await context.close()
})

test("locale and long command labels preserve caller drafts and table rows", async ({
  page,
}) => {
  await scene(page)
  const root = page.locator('[data-fixture="command-toolbar"]')
  await root.getByRole("textbox").fill("用户草稿 unchanged")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(root.getByRole("textbox")).toHaveValue("用户草稿 unchanged")
  await root.getByRole("button", { name: "Narrow container" }).click()
  await root.getByRole("button", { name: "More commands" }).click()
  const long = page.getByRole("menuitem", { name: "Align selected objects" })
  await expect(long).toBeVisible()
  await hit(long)
  await page.keyboard.press("Escape")
  await expect(page.locator('[data-fixture="table"] tbody tr')).toHaveCount(2)
})
