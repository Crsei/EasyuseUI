import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator } from "@playwright/test"
import { authExampleMessages } from "../components/examples/auth-errors/messages"

const base = "/examples/auth-errors/"
const pages = [
  ["login", "欢迎回来"],
  ["register", "创建你的账户"],
  ["forgot-password", "忘记密码？"],
  ["401", "请先登录"],
  ["403", "你没有访问权限"],
  ["404", "这个页面不见了"],
  ["500", "遇到了一点问题"],
  ["503", "服务暂时不可用"],
] as const

async function fillLogin(form: Locator) {
  await form.getByLabel(/^邮箱/).fill("reader@example.com")
  await form.getByLabel(/^密码/).fill("short")
}

for (const [screen, title] of pages) {
  test(`${screen}: independent desktop page, localized metadata and accessible recovery`, async ({
    page,
  }, info) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    const response = await page.goto(`${base}${screen}/`)
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { name: title, level: 1, exact: true }),
    ).toBeVisible()
    await expect(page.locator("[data-site-header]")).toHaveCount(0)
    await expect(page).toHaveTitle(
      new RegExp(authExampleMessages["zh-CN"][screen].replace(/^\d+ \/ /, "")),
    )
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.getByRole("combobox", { name: "语言" }).selectOption("en")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(
      page.getByText("Local demo · No authentication or email service"),
    ).toBeVisible()
    if (/^\d/.test(screen)) {
      await expect(
        page.getByText(`HTTP ${screen}`, { exact: true }),
      ).toBeVisible()
      const recovery = page.locator(`[data-error-code="${screen}"]`)
      await expect(recovery.getByRole("link").first()).toHaveAttribute(
        "href",
        screen === "401" || screen === "403" ? `${base}login/` : base,
      )
    }
    await page
      .getByRole("button", { name: "Toggle light and dark theme" })
      .click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.setViewportSize({ width: 1024, height: 768 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: info.outputPath(`${screen}-dark-en.png`),
      fullPage: true,
    })
    expect(errors).toEqual([])
  })
}

test("registration validates, focuses errors, reveals passwords and accepts terms using keyboard", async ({
  page,
}) => {
  await page.goto(`${base}register/`)
  const form = page.getByRole("form", { name: "创建你的账户", exact: true })
  await form.getByRole("button", { name: "创建账户", exact: true }).click()
  await expect(form.getByLabel(/^姓名/)).toBeFocused()
  await expect(form.getByLabel(/^邮箱/)).toHaveAttribute("aria-invalid", "true")
  await form.getByLabel(/^姓名/).fill("测试用户")
  await form.getByLabel(/^邮箱/).fill("reader@example.com")
  await form.getByLabel(/^密码/).fill("12345678")
  await form.getByLabel(/^确认密码/).fill("12345679")
  await form.getByRole("button", { name: "显示密码", exact: true }).click()
  await expect(form.getByLabel(/^密码/)).toHaveAttribute("type", "text")
  await form.getByRole("button", { name: "创建账户", exact: true }).click()
  await expect(form.getByLabel(/^确认密码/)).toBeFocused()
  await expect(
    form.getByText("两次输入的密码需要一致。", { exact: true }),
  ).toBeVisible()
  await form.getByLabel(/^确认密码/).fill("12345678")
  await form.getByText("查看示例使用条款", { exact: true }).click()
  await expect(form.getByText(/此条款仅用于演示/)).toBeVisible()
  const terms = form.getByRole("checkbox", { name: "我已阅读并接受使用条款" })
  await terms.focus()
  await page.keyboard.press("Space")
  await expect(terms).toBeChecked()
  await form.getByLabel(/^确认密码/).focus()
  await page.keyboard.press("Enter")
  await expect(form.getByText(/本地演示：注册表单验证通过/)).toBeVisible()
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0)
  await expect(form.getByLabel(/^密码/)).toHaveValue("")
})

test("gallery mounts all eight modules; rejected login preserves drafts and unknown locks until reconciliation", async ({
  page,
}) => {
  const writes: string[] = []
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(request.url())
  })
  await page.goto(base)
  await expect(page.locator("[data-auth-mode]")).toHaveCount(3)
  await expect(page.locator("[data-error-code]")).toHaveCount(5)
  const panel = page
    .locator("section")
    .filter({ has: page.locator('[data-auth-mode="login"]') })
  const form = panel.getByRole("form")
  await panel
    .getByRole("combobox", { name: "演示结果", exact: true })
    .selectOption("error")
  await fillLogin(form)
  await form.getByRole("button", { name: "登录", exact: true }).click()
  await expect(
    form.getByRole("button", { name: "正在提交…", exact: true }),
  ).toBeDisabled()
  await expect(form.getByText(/邮箱或密码不正确/)).toBeVisible()
  await expect(form.getByLabel(/^密码/)).toHaveValue("short")
  await panel
    .getByRole("combobox", { name: "演示结果", exact: true })
    .selectOption("unknown")
  await form.getByRole("button", { name: "登录", exact: true }).click()
  await expect(form.getByText(/提交已锁定/)).toBeVisible()
  await expect(
    form.getByRole("checkbox", { name: "记住登录", exact: true }),
  ).toBeDisabled()
  await expect(
    form.getByRole("button", { name: "登录", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "切换浅色与深色主题" }).click()
  await page.getByRole("combobox", { name: "语言" }).selectOption("en")
  await expect(form.getByLabel(/^Password/)).toHaveValue("short")
  await expect(
    form.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeDisabled()
  await form
    .getByRole("button", {
      name: "Confirm no demo operation occurred and edit again",
    })
    .click()
  await expect(
    form.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled()
  expect(writes).toEqual([])
  expect(
    await page.evaluate(() => JSON.stringify(localStorage).includes("short")),
  ).toBe(false)
})

test("forgot password uses generic feedback; error retries preserve the page and navigation works", async ({
  page,
}) => {
  await page.goto(`${base}login/`)
  await page
    .locator('[data-auth-mode="login"]')
    .getByRole("link", { name: "忘记密码？" })
    .click()
  await expect(page).toHaveURL(`${base}forgot-password/`)
  await page.getByLabel(/^邮箱/).fill("unknown@example.com")
  await page.getByRole("button", { name: "发送重置链接", exact: true }).click()
  await expect(page.getByText(/如果该邮箱对应账户/)).toBeVisible()
  await page.getByRole("link", { name: "返回登录", exact: true }).click()
  await expect(page).toHaveURL(`${base}login/`)
  for (const code of [500, 503]) {
    await page.goto(`${base}${code}/`)
    await page.getByRole("button", { name: "重新尝试", exact: true }).click()
    await expect(
      page.getByRole("button", { name: "正在重试…", exact: true }),
    ).toBeDisabled()
    await expect(page.getByText(/已重试读取，仍然展示此错误/)).toBeVisible()
    await expect(page.getByText(`HTTP ${code}`, { exact: true })).toBeVisible()
  }
  await page
    .locator('[data-error-code="503"]')
    .getByRole("link", { name: "返回总览" })
    .click()
  await expect(page).toHaveURL(base)
})

test("narrow containers, short windows, zoom and reduced motion retain reachable controls", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto(`${base}register/`)
  await page.setViewportSize({ width: 640, height: 480 })
  await page.getByLabel(/^邮箱/).fill("draft@example.com")
  await page.getByLabel(/^密码/).fill("retained-password")
  await page.getByRole("button", { name: "切换浅色与深色主题" }).click()
  await expect(page.getByLabel(/^密码/)).toHaveValue("retained-password")
  await page.getByRole("combobox", { name: "语言" }).selectOption("en")
  await expect(page.getByLabel(/^Email/)).toHaveValue("draft@example.com")
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .scrollIntoViewIfNeeded()
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeInViewport()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2"
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .scrollIntoViewIfNeeded()
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeInViewport()
  await page.evaluate(() => {
    document.documentElement.style.zoom = "1"
  })
  await page.goto(base)
  await expect(page.locator("[data-auth-mode]")).toHaveCount(3)
  await page.screenshot({
    path: info.outputPath("gallery-narrow.png"),
    fullPage: true,
  })
})

test("server-rendered authentication controls stay disabled until handlers are ready", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: test.info().project.use.baseURL,
  })
  try {
    const page = await context.newPage()
    for (const mode of ["login", "register", "forgot-password"]) {
      await page.goto(`${base}${mode}/`)
      const form = page.getByRole("form")
      await expect(form.locator("input").first()).toBeDisabled()
      if (await form.getByRole("checkbox").count())
        await expect(form.getByRole("checkbox")).toBeDisabled()
      await expect(form.getByRole("button").last()).toBeDisabled()
      await expect(
        page.getByText("正在准备表单…", { exact: true }),
      ).toBeVisible()
    }
  } finally {
    await context.close()
  }
})

test("catalog demo mounts all modules and links to the complete gallery", async ({
  page,
}) => {
  await page.goto("/docs/auth-pages/")
  const loader = page.locator('[data-demo-loader="auth-pages"]')
  await expect(loader).toBeVisible()
  const load = loader.getByRole("button", { name: "加载演示", exact: true })
  if (await load.isVisible()) await load.click()
  await expect(loader.locator("[data-auth-mode]")).toHaveCount(3)
  await expect(loader.locator("[data-error-code]")).toHaveCount(5)
  await expect(loader.getByRole("heading", { level: 1 })).toHaveCount(0)
  await expect(
    loader.getByRole("link", { name: "页面总览", exact: true }),
  ).toHaveAttribute("href", base)
})
