import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const root = "/examples/agent-workbench"
const input = (page: import("@playwright/test").Page) =>
  page.getByRole("textbox", { name: "消息输入", exact: true })

// These tests exercise actual mounted modules; source controls are explicitly fixtures.
test("interactive reference modules preserve selection across hover, keyboard focus and disabled controls", async ({
  page,
}) => {
  await page.goto(`${root}/regions/reference/`)
  const lab = page.locator("[data-reference-lab]")
  for (const id of [
    "MD01",
    "MD02",
    "MD03",
    "MD04",
    "MD05",
    "MD06",
    "MD07",
    "MD08",
    "MD09",
    "MD10",
    "MD11",
    "MD12",
    "MD13",
    "MD14",
    "MD15",
    "MD16",
    "MD17",
  ]) {
    await lab
      .getByRole("combobox", { name: "模块", exact: true })
      .selectOption(id)
    const region = lab.locator(`[data-reference-module="${id}"]`)
    const control = region
      .locator("button:enabled, select:enabled, summary, textarea:enabled")
      .filter({ visible: true })
      .first()
    await control.hover()
    await control.focus()
    await expect(control).toBeFocused()
    await lab
      .getByRole("combobox", { name: "交互状态", exact: true })
      .selectOption("disabled")
    const buttons = region.locator("button").filter({ visible: true })
    for (const button of await buttons.all())
      await expect(button).toBeDisabled()
    await lab
      .getByRole("combobox", { name: "交互状态", exact: true })
      .selectOption("default")
  }
  await lab
    .getByRole("combobox", { name: "模块", exact: true })
    .selectOption("MD03")
  const selected = lab.locator(
    '[data-reference-module="MD03"] [data-selected="true"]',
  )
  await expect(selected).toHaveCount(1)
  const other = lab.getByRole("button", { name: /分析资料并整理报告/ })
  await other.hover()
  await other.focus()
  await expect(selected).toHaveCount(1)
  await other.press("Enter")
  await expect(other).toHaveAttribute("aria-pressed", "true")
})

test("all 17 reference modules expose five data states and retain the previous snapshot on errors", async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.goto(`${root}/regions/reference/`)
  for (let number = 1; number <= 17; number++) {
    const id = `MD${String(number).padStart(2, "0")}`
    await page
      .getByRole("combobox", { name: "模块", exact: true })
      .selectOption(id)
    const previewModule = page.locator(`[data-reference-module="${id}"]`)
    await expect(previewModule).toBeVisible()
    for (const state of ["loading", "empty", "partial", "error", "success"]) {
      await page
        .getByRole("combobox", { name: "数据状态", exact: true })
        .selectOption(state)
      await expect(page.locator("[data-reference-lab]")).toHaveAttribute(
        "data-data-state",
        state,
      )
      if (["loading", "empty"].includes(state))
        await expect(previewModule).toBeHidden()
      else await expect(previewModule).toBeVisible()
      if (state === "error")
        await expect(
          page.getByText("请求错误：fixture 刷新失败；保留原快照。", {
            exact: true,
          }),
        ).toBeVisible()
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test("reference turn separates public progress, adjacent read tools, confirmed changes and open output", async ({
  page,
}) => {
  await page.goto(`${root}/regions/reference/`)
  const previewModule = page.locator('[data-reference-module="MD07"]')
  await expect(previewModule).toBeVisible()
  expect(
    await previewModule
      .locator("[data-phase]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-phase"))),
  ).toEqual(["thinking", "action", "output"])
  await expect(
    previewModule.locator("summary").filter({ hasText: "Read / Search · 2" }),
  ).toBeVisible()
  await previewModule
    .getByRole("button", { name: /src\/filter.ts.*\+1/ })
    .click()
  await expect(
    page.locator('[data-reference-module="MD16"] [data-line-id="line-3"]'),
  ).toBeVisible()
  await expect(page.locator('[data-reference-module="MD16"]')).toContainText(
    "diff-1",
  )
})

test("composer and feedback retain their instances through state, module, theme and locale changes", async ({
  page,
}) => {
  await page.goto(`${root}/regions/reference/`)
  await page
    .getByRole("combobox", { name: "模块", exact: true })
    .selectOption("MD12")
  await input(page).fill("Reference draft 中文")
  await input(page).evaluate((el) =>
    el.setAttribute("data-instance", "retained"),
  )
  await page
    .getByRole("combobox", { name: "交互状态", exact: true })
    .selectOption("disabled")
  await expect(input(page)).toBeDisabled()
  await page
    .getByRole("combobox", { name: "交互状态", exact: true })
    .selectOption("unknown")
  await expect(
    page.getByRole("button", { name: "发送", exact: true }),
  ).toBeDisabled()
  await page
    .getByRole("combobox", { name: "数据状态", exact: true })
    .selectOption("error")
  await expect(input(page)).toHaveValue("Reference draft 中文")
  await page
    .getByRole("combobox", { name: "主题", exact: true })
    .selectOption("dark")
  await page
    .locator("[data-reference-lab]")
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  const englishInput = page.getByRole("textbox", {
    name: "Message input",
    exact: true,
  })
  await expect(englishInput).toHaveValue("Reference draft 中文")
  await expect(englishInput).toHaveAttribute("data-instance", "retained")
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("MD16")
  await page
    .locator('[data-reference-module="MD16"]')
    .getByRole("button", { name: "Add line feedback 2", exact: true })
    .last()
    .click()
  const feedback = page
    .getByRole("textbox", { name: /Review feedback draft/ })
    .filter({ visible: true })
  await feedback.fill("Preserved unsubmitted feedback")
  await feedback.evaluate((el) => el.setAttribute("data-instance", "feedback"))
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("MD15")
  await page
    .getByRole("combobox", { name: "Module", exact: true })
    .selectOption("MD16")
  await expect(feedback).toHaveValue("Preserved unsubmitted feedback")
  await expect(feedback).toHaveAttribute("data-instance", "feedback")
})

test("wide review resizes, maximizes and restores the same draft, feedback and reading position", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&layout=review&panel=changes`)
  const divider = page.getByRole("separator", {
    name: "调整对话与编辑器宽度",
    exact: true,
  })
  await expect(divider).toBeVisible()
  await input(page).fill("Retained split draft")
  await input(page).evaluate((el) => el.setAttribute("data-instance", "split"))
  const review = page
    .locator('[data-workbench-view="review"]')
    .filter({ visible: true })
  await review
    .getByRole("button", { name: "添加行反馈 2", exact: true })
    .last()
    .click()
  const feedback = page
    .getByRole("textbox", { name: /审阅反馈草稿/ })
    .filter({ visible: true })
  await feedback.fill("Unsubmitted review notes")
  await feedback.evaluate((el) => el.setAttribute("data-instance", "review"))
  await divider.focus()
  const history = page
    .locator('[aria-label="对话记录"]')
    .filter({ visible: true })
  await history.evaluate((el) => {
    el.scrollTop = 24
  })
  const readingPosition = await history.evaluate((el) => el.scrollTop)
  const before = Number(await divider.getAttribute("aria-valuenow"))
  await divider.press("ArrowRight")
  expect(Number(await divider.getAttribute("aria-valuenow"))).toBeGreaterThan(
    before,
  )
  const changed = await divider.getAttribute("aria-valuenow")
  await page.getByRole("button", { name: "最大化编辑器", exact: true }).click()
  await expect(divider).toHaveCount(0)
  await expect(input(page)).toBeHidden()
  await expect(feedback).toHaveValue("Unsubmitted review notes")
  await page.getByRole("button", { name: "恢复分屏", exact: true }).click()
  await expect(divider).toHaveAttribute("aria-valuenow", changed!)
  await expect(input(page)).toHaveValue("Retained split draft")
  await expect(input(page)).toHaveAttribute("data-instance", "split")
  await expect(feedback).toHaveAttribute("data-instance", "review")
  expect(await history.evaluate((el) => el.scrollTop)).toBe(readingPosition)
  await divider.press("Home")
  await expect(divider).toHaveAttribute("aria-valuenow", "440")
  await divider.press("End")
  expect(await divider.getAttribute("aria-valuenow")).toBe(
    await divider.getAttribute("aria-valuemax"),
  )
  await page.getByRole("button", { name: "复位分屏比例", exact: true }).click()
  await expect(divider).toHaveAttribute("aria-valuenow", String(before))
  await page.reload()
  await expect(divider).toHaveAttribute("aria-valuenow", String(before))
})

test("resource navigation stays compact and command, problem, tool and file links share source identities", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session`)
  const sidebar = page.locator("[data-inspector-docked]")
  await expect(sidebar.getByRole("tab")).toHaveCount(3)
  await sidebar.getByRole("button", { name: "更多面板", exact: true }).click()
  await page.getByRole("menuitem", { name: "上下文", exact: true }).click()
  await expect(sidebar.getByRole("tab")).toHaveCount(3)
  await expect(
    sidebar.getByRole("tab", { name: "上下文", exact: true }),
  ).toBeVisible()
  await sidebar.getByRole("tab", { name: "变更", exact: true }).click()
  await expect(page).toHaveURL(/panel=changes/)
  await sidebar
    .getByRole("button", { name: /src\/filter.ts/ })
    .filter({ visible: true })
    .first()
    .click()
  await expect(page).toHaveURL(/page=review/)
  await expect(
    page.locator('[data-line-id="line-3"]').filter({ visible: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "底部工作面板", exact: true }),
  ).toHaveAttribute("data-collapsed", "true")
  await page.getByRole("button", { name: /运行面板/ }).click()
  const bottom = page.getByRole("region", { name: "底部工作面板", exact: true })
  await bottom.getByRole("tab", { name: /问题/ }).click()
  await bottom.getByRole("button", { name: /fixture failing test/ }).click()
  await expect(
    bottom
      .locator('[data-command-id="command-failed"]')
      .filter({ visible: true }),
  ).toBeVisible()
  await expect(
    bottom
      .locator('[data-command-id="command-failed"] [data-command-exit]')
      .filter({ visible: true }),
  ).toHaveText("2")
  await bottom.getByRole("tab", { name: "终端", exact: true }).click()
  await expect(bottom).toContainText("尚未连接 PTY 服务")
  await bottom.getByRole("tab", { name: "测试", exact: true }).click()
  await expect(bottom).toContainText("来源未提供结构化测试报告")
  await page.getByRole("button", { name: /运行面板/ }).click()
  await expect(bottom).toHaveAttribute("data-collapsed", "true")
  await expect(bottom.locator("[data-runtime-panel]")).toHaveCount(0)
})

for (const configuration of [
  { width: 1440, height: 900, theme: "light", locale: "zh-CN" },
  { width: 1440, height: 900, theme: "dark", locale: "en" },
  { width: 390, height: 844, theme: "light", locale: "en" },
  { width: 390, height: 500, theme: "dark", locale: "zh-CN" },
  { width: 720, height: 450, theme: "light", locale: "zh-CN" },
])
  test(`V2 page matrix ${configuration.width}×${configuration.height} ${configuration.theme} ${configuration.locale}`, async ({
    browser,
  }, info) => {
    test.setTimeout(120_000)
    const context = await browser.newContext({
      viewport: { width: configuration.width, height: configuration.height },
      deviceScaleFactor: configuration.width === 720 ? 2 : 1,
      hasTouch: configuration.width === 390,
      reducedMotion: "reduce",
    })
    await context.addInitScript((configuration) => {
      localStorage.setItem("theme", configuration.theme)
      localStorage.setItem("easyuseui-locale", configuration.locale)
    }, configuration)
    const page = await context.newPage()
    for (const [id, route] of [
      ["PG01", "/"],
      ["PG02-R", "/regions/reference/"],
      ["PG03", "/layouts/?layout=review&panel=changes"],
      ["PG04", "/app/?template=coding&page=session"],
      ["PG05-offline", "/pi/"],
      ["PG06", "/app/?template=coding&page=review&panel=changes"],
      ["PG07", "/app/?template=artifacts&page=artifacts"],
    ]) {
      await page.goto(root + route)
      await expect(page.locator("main").last()).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      if (id === "PG04") {
        const bubble = page
          .locator('[data-message-role="user"] > div:last-child > div')
          .first()
        await expect(bubble).toHaveCSS("border-radius", "16px")
        await expect(bubble).toHaveCSS("font-size", "14px")
        await expect(bubble).toHaveCSS("line-height", "22.4px")
        if (configuration.theme === "light") {
          await expect(bubble).toHaveCSS(
            "background-color",
            "rgb(237, 244, 255)",
          )
          await expect(bubble).toHaveCSS("border-color", "rgb(219, 234, 254)")
        }
        const editor = page.getByRole("textbox", {
          name: configuration.locale === "en" ? "Message input" : "消息输入",
          exact: true,
        })
        await editor.fill("V2 retained draft")
        await expect(editor).toBeInViewport({ ratio: 1 })
        await expect(
          page.getByRole("button", {
            name: configuration.locale === "en" ? "Send" : "发送",
            exact: true,
          }),
        ).toBeInViewport({ ratio: 1 })
      }
      const screenshot = `${id}-V2-${configuration.theme}-${configuration.locale}.png`
      const screenshotPath = info.outputPath(screenshot)
      await page.screenshot({path: screenshotPath})
      await info.attach(screenshot, {path: screenshotPath, contentType: "image/png"})
    }
    await page.goto(`${root}/regions/reference/`)
    await expect(page.locator("[data-reference-lab]")).toBeVisible()
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    expect(accessibility.violations).toEqual([])
    await context.close()
  })
