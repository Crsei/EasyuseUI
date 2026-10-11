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
    page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }),
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
    ]) {
      await page.goto(root + route)
      await expect(page.locator("main").last()).toBeVisible()
      if (id === "PG01") {
        await expect(page.locator("[data-element-gallery] > header h1")).toBeVisible()
        await expect(page.locator("[data-preview-viewport=MD03]")).toBeVisible()
      }
      await page.evaluate(() => document.fonts.ready)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      const screenshot = `${id}-V2-${configuration.theme}-${configuration.locale}.png`
      const screenshotPath = info.outputPath(screenshot)
      await page.screenshot({ path: screenshotPath })
      await info.attach(screenshot, {
        path: screenshotPath,
        contentType: "image/png",
      })
    }
    await page.goto(`${root}/regions/reference/`)
    await expect(page.locator("[data-reference-lab]")).toBeVisible()
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    expect(accessibility.violations).toEqual([])
    await context.close()
  })
