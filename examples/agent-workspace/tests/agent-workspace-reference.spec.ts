import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
const input = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: "消息输入", exact: true })
test("wide review resizes, maximizes and restores the same draft, feedback and reading position", async ({
  page,
}) => {
  await page.goto(`/app/?page=session&layout=review&panel=changes`)
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
  await page.goto(`/app/?page=session`)
  const sidebar = page.locator("[data-inspector-docked]")
  await expect(sidebar.getByRole("tab")).toHaveCount(3)
  await page.locator('[data-sidebar-session-view="context"]').click()
  await expect(
    sidebar.getByRole("tab", { name: "上下文", exact: true }),
  ).toHaveCount(0)
  await expect(
    page.locator('[data-sidebar-session-view="context"]'),
  ).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.getByRole("button", { name: "添加引用", exact: true }),
  ).toBeVisible()
  await page.locator('[data-sidebar-session-view="conversation"]').click()
  await expect(sidebar).toBeVisible()
  await expect(sidebar.getByRole("tab")).toHaveCount(3)
  await sidebar.getByRole("tab", { name: "文件", exact: true }).click()
  await expect(page).toHaveURL(/panel=files/)
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
      ["PG03", "/layouts/?layout=review&panel=changes"],
      ["PG04", "/app/?template=coding&page=session"],
      ["PG05-offline", "/pi/"],
      ["PG06", "/app/?template=coding&page=review&panel=changes"],
      ["PG07", "/app/?template=artifacts&page=artifacts"],
    ]) {
      await page.goto(route)
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
      await page.screenshot({ path: screenshotPath })
      await info.attach(screenshot, {
        path: screenshotPath,
        contentType: "image/png",
      })
    }
    await page.goto("/app/?page=session")
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    expect(accessibility.violations).toEqual([])
    await context.close()
  })
