import { expect, test, type Page } from "@playwright/test"
const app = "/app/"
const input = (page: Page) => page.getByRole("textbox", { name: "消息输入", exact: true }).filter({ visible: true }).first()
function captureScripts(page: Page) {
  const scripts = new Map<string, Buffer>()
  const pending: Promise<void>[] = []
  page.on("response", (response) => {
    if (new URL(response.url()).pathname.endsWith(".js"))
      pending.push(
        response
          .body()
          .then((body) => {
            scripts.set(response.url(), body)
          })
          .catch(() => {}),
      )
  })
  return { scripts, pending }
}

for (const route of [app]) {
  test(`route resources exclude CRM messages: ${route}`, async ({ page }) => {
    const { scripts, pending } = captureScripts(page)
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(route)
    if (route === app) {
      await input(page).fill("retained task draft")
      await page
        .getByRole("navigation", { name: "工作台工具", exact: true })
        .getByRole("button", { name: "工作台设置", exact: true })
        .click()
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "外观与布局", exact: true })
        .click()
      await page
        .getByRole("combobox", { name: "语言", exact: true })
        .selectOption("en")
      await expect(page.locator("html")).toHaveAttribute("lang", "en")
      await page.keyboard.press("Escape")
      await expect(page.getByRole("dialog")).toBeHidden()
      await page.keyboard.press("Tab")
      await page.getByRole("button", { name: "Home", exact: true }).click()
      await expect(
        page
          .getByRole("textbox", { name: "Message input", exact: true })
          .filter({ visible: true })
          .first(),
      ).toHaveValue("retained task draft")
    } else {
      await page
        .getByRole("combobox", { name: "语言", exact: true })
        .first()
        .selectOption("en")
      await expect(page.locator("html")).toHaveAttribute("lang", "en")
    }
    await page.waitForLoadState("networkidle")
    await Promise.all(pending)
    expect(scripts.size).toBeGreaterThan(0)
    expect(
      [...scripts.values()].some((body) => body.includes("crm.localOnly")),
    ).toBe(false)
    if (route === app)
      expect(
        [...scripts.values()].some((body) =>
          body.includes("site.redesign.sourceOwnership"),
        ),
      ).toBe(false)
    expect(errors).toEqual([])
  })
}

test("unopened panels stay unloaded; visited editors and drafts survive navigation", async ({
  page,
}) => {
  const { scripts, pending } = captureScripts(page)
  await page.goto(app)
  await input(page).fill("home draft")
  await expect(page.locator('[data-workbench-module="session"]')).toHaveCount(0)
  await expect(page.locator('[data-workbench-view="review"]')).toHaveCount(0)
  await expect(page.locator('[data-workbench-view="settings"]')).toHaveCount(0)
  await page.waitForLoadState("networkidle")
  await Promise.all(pending)
  expect(
    [...scripts.values()].some((body) =>
      body.includes('"data-workbench-view":"review"'),
    ),
  ).toBe(false)
  expect(
    [...scripts.values()].some((body) =>
      body.includes('"data-workbench-view":"settings"'),
    ),
  ).toBe(false)
  await page
    .getByRole("navigation", { name: "工作台工具", exact: true })
    .getByRole("link", { name: "会话", exact: true })
    .click()
  // The old page stays editable until Next commits the requested URL state.
  await expect(page.locator("main[data-workbench-page]")).toHaveAttribute(
    "data-workbench-page",
    "session",
  )
  await input(page).fill("session draft")
  await input(page).evaluate((field) =>
    field.setAttribute("data-instance", "retained"),
  )
  await expect(page.locator('[data-workbench-view="review"]')).toHaveCount(0)
  await expect(page.locator('[data-workbench-view="artifacts"]')).toHaveCount(0)
  await page
    .getByRole("navigation", { name: "工作台工具", exact: true })
    .getByRole("link", { name: "变更", exact: true })
    .click()
  await expect(
    page
      .locator('[data-workbench-view="review"]')
      .getByRole("button", { name: "并排差异", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("navigation", { name: "工作台工具", exact: true })
    .getByRole("button", { name: "工作台设置", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "外观与布局", exact: true })
    .click()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.keyboard.press("Tab")
  await page
    .getByRole("navigation", { name: "Workbench tools", exact: true })
    .getByRole("link", { name: "Sessions", exact: true })
    .click()
  await expect(page).toHaveURL(/page=session/)
  const englishInput = page
    .getByRole("textbox", { name: "Message input", exact: true })
    .filter({ visible: true })
    .first()
  await expect(englishInput).toHaveValue("session draft")
  await expect(englishInput).toHaveAttribute("data-instance", "retained")
  await page.goBack()
  await expect(page.locator("main[data-workbench-page]")).toHaveAttribute(
    "data-workbench-page",
    "review",
  )
  await page.goForward()
  await expect(page).toHaveURL(/page=session/)
  await expect(englishInput).toHaveAttribute("data-instance", "retained")
  await page.getByRole("button", { name: "Home", exact: true }).click()
  await expect(englishInput).toHaveValue("home draft")
})

test("a failed review module retries locally without clearing the session draft", async ({
  page,
  browser,
}, testInfo) => {
  const probe = await browser.newContext({
    baseURL: String(testInfo.project.use.baseURL),
  })
  const probePage = await probe.newPage()
  const { scripts, pending } = captureScripts(probePage)
  await probePage.goto(`${app}?page=review&panel=changes`)
  await expect(
    probePage
      .locator('[data-workbench-view="review"]')
      .getByRole("button", { name: "并排差异", exact: true }),
  ).toBeVisible()
  await probePage.waitForLoadState("networkidle")
  await Promise.all(pending)
  const chunk = [...scripts].find(([, body]) =>
    body.includes('"data-workbench-view":"review"'),
  )?.[0]
  await probe.close()
  expect(
    chunk,
    "Locate the actual review chunk in this production build",
  ).toBeTruthy()
  await page.route(chunk!, (route) => route.abort("failed"))
  await page.goto(`${app}?page=session`)
  await input(page).fill("retained after load failure")
  await page
    .getByRole("navigation", { name: "工作台工具", exact: true })
    .getByRole("link", { name: "变更", exact: true })
    .click()
  await expect(
    page
      .getByRole("alert")
      .getByText("网络错误：该区域加载失败。", { exact: true }),
  ).toBeVisible()
  await page.unroute(chunk!)
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(
    page
      .locator('[data-workbench-view="review"]')
      .getByRole("button", { name: "并排差异", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("navigation", { name: "工作台工具", exact: true })
    .getByRole("link", { name: "会话", exact: true })
    .click()
  await expect(input(page)).toHaveValue("retained after load failure")
})
