import { expect, test, type Page } from "@playwright/test"

const sample = (page: Page, name: "baseline" | "modified") =>
  page.locator(`[data-style-sample="${name}"]`)

async function changeNumber(page: Page, name: string, value: number | string) {
  const input = page.getByRole("spinbutton", {
    name: `${name}数值`,
    exact: true,
  })
  await input.fill(String(value))
  await input.press("Enter")
}

test("style workbench compares actual styles without changing A or project tokens", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/style-workbench/")
  const a = sample(page, "baseline")
  const b = sample(page, "modified")
  await expect(a).toHaveCSS("border-radius", "6px")
  await expect(b).toHaveCSS("border-radius", "6px")
  await expect(page.getByRole("region", { name: "参数差异" })).toContainText(
    "当前 A 与 B 相同",
  )
  const projectRadius = await page
    .locator("html")
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--control-radius"),
    )
  await page.getByRole("slider", { name: "圆角", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(b).toHaveCSS("border-radius", "7px")
  await changeNumber(page, "圆角", 20)
  await changeNumber(page, "控件高度", 44)
  await changeNumber(page, "内边距", 24)
  await expect(b).toHaveCSS("border-radius", "20px")
  await expect(b).toHaveCSS("padding", "24px")
  await expect(
    b.getByRole("button", { name: "示例按钮", exact: true }),
  ).toHaveCSS("height", "44px")
  await expect(a).toHaveCSS("border-radius", "6px")
  await expect(
    a.getByRole("button", { name: "示例按钮", exact: true }),
  ).toHaveCSS("height", "32px")
  await expect(
    page.getByRole("row", { name: "圆角 6px 20px +14px", exact: true }),
  ).toBeVisible()
  expect(
    await page
      .locator("html")
      .evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--control-radius"),
      ),
  ).toBe(projectRadius)
  await a.getByRole("textbox", { name: "示例输入" }).fill("相同内容")
  await expect(b.getByRole("textbox", { name: "示例输入" })).toHaveValue(
    "相同内容",
  )
  await b.getByRole("button", { name: "筛选值", exact: true }).click()
  await expect(
    a.getByRole("button", { name: "筛选值", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await page.screenshot({
    path: "test-results/style-workbench-desktop.png",
    fullPage: true,
  })
  await page.getByRole("button", { name: "重置 B", exact: true }).click()
  await expect(b).toHaveCSS("border-radius", "6px")
  await expect(
    page.getByRole("button", { name: "重置 B", exact: true }),
  ).toBeDisabled()
  expect(errors).toEqual([])
})

test("shadow, material and typography controls export their actual CSS and JSON", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/style-workbench/")
  const b = sample(page, "modified")
  await page.getByRole("button", { name: "内凹表面", exact: true }).click()
  await changeNumber(page, "水平偏移", -6)
  await changeNumber(page, "扩散范围", -2)
  await changeNumber(page, "阴影不透明度", 25)
  await expect(b).toHaveCSS(
    "box-shadow",
    "rgba(0, 0, 0, 0.25) -6px 2px 8px -2px inset",
  )
  await page.getByRole("button", { name: "颜色与材质", exact: true }).click()
  await page.getByLabel("表面颜色", { exact: true }).fill("#b1d5ff")
  await changeNumber(page, "表面不透明度", 60)
  await changeNumber(page, "背景模糊", 12)
  await expect(b).toHaveCSS("background-color", "rgba(177, 213, 255, 0.6)")
  await expect(b).toHaveCSS("backdrop-filter", "blur(12px)")
  await page.getByRole("button", { name: "字体", exact: true }).click()
  await changeNumber(page, "字号", 18)
  await changeNumber(page, "行高", 28)
  await changeNumber(page, "字重", 600)
  await expect(b).toHaveCSS("font-size", "18px")
  await expect(b).toHaveCSS("line-height", "28px")
  await expect(b).toHaveCSS("font-weight", "600")
  await page.getByRole("button", { name: "复制 CSS", exact: true }).click()
  const css = await page.getByLabel("当前 CSS", { exact: true }).textContent()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(css)
  expect(css).toContain("inset -6px 2px 8px -2px rgba(0, 0, 0, 0.25)")
  await page.getByRole("button", { name: "参数 JSON", exact: true }).click()
  await page.getByRole("button", { name: "复制参数 JSON", exact: true }).click()
  const parameters = JSON.parse(
    await page.evaluate(() => navigator.clipboard.readText()),
  )
  expect(parameters.modified).toMatchObject({
    shadowX: -6,
    shadowInset: true,
    surfaceColor: "#b1d5ff",
    backdropBlur: 12,
    fontSize: 18,
  })
  expect(parameters.baseline.fontSize).toBe(14)
  await page.getByRole("button", { name: "阴影", exact: true }).click()
  await page.getByRole("checkbox", { name: "启用阴影", exact: true }).uncheck()
  await expect(b).toHaveCSS("box-shadow", "none")
  await expect(
    page.getByRole("checkbox", { name: "内阴影", exact: true }),
  ).toBeDisabled()
})

test("presets can become A and numeric edits clamp, snap and recover from empty input", async ({
  page,
}) => {
  await page.goto("/style-workbench/")
  await page.getByRole("button", { name: "胶囊控件", exact: true }).click()
  await page.getByRole("button", { name: "B 设为基准 A", exact: true }).click()
  await expect(sample(page, "baseline")).toHaveCSS("border-radius", "24px")
  await expect(page.getByText("A 已固定", { exact: true })).toBeVisible()
  await changeNumber(page, "圆角", 999)
  await expect(sample(page, "modified")).toHaveCSS("border-radius", "48px")
  await changeNumber(page, "圆角", "")
  await expect(
    page.getByRole("spinbutton", { name: "圆角数值", exact: true }),
  ).toHaveValue("48")
  await changeNumber(page, "内边距", 19)
  await expect(sample(page, "modified")).toHaveCSS("padding", "20px")
  await page.getByRole("button", { name: "重置 B", exact: true }).click()
  await expect(sample(page, "modified")).toHaveCSS("border-radius", "24px")
  await page.getByRole("button", { name: "恢复项目默认", exact: true }).click()
  await expect(sample(page, "baseline")).toHaveCSS("border-radius", "6px")
  await expect(sample(page, "modified")).toHaveCSS("border-radius", "6px")
})

test("theme changes refresh A and unedited B values while keeping explicit edits and pinned A", async ({
  page,
}) => {
  await page.goto("/style-workbench/")
  await changeNumber(page, "圆角", 16)
  const a = sample(page, "baseline")
  const b = sample(page, "modified")
  const lightSurface = await a.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  await page.getByRole("button", { name: "切换深浅主题", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(a).not.toHaveCSS("background-color", lightSurface)
  await expect(b).toHaveCSS("border-radius", "16px")
  await expect(b).toHaveCSS(
    "background-color",
    await a.evaluate((element) => getComputedStyle(element).backgroundColor),
  )
  await page.getByRole("button", { name: "阴影", exact: true }).click()
  await expect(
    page.getByRole("spinbutton", { name: "阴影不透明度数值", exact: true }),
  ).toHaveValue("40")
  await page.getByRole("button", { name: "B 设为基准 A", exact: true }).click()
  const pinnedSurface = await a.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  await page.getByRole("button", { name: "切换深浅主题", exact: true }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await expect(a).toHaveCSS("background-color", pinnedSurface)
  await page.getByRole("button", { name: "恢复项目默认", exact: true }).click()
  await expect(a).toHaveCSS("background-color", lightSurface)
})

test("dictionary links to the workbench and the portable demo adapts to narrow containers", async ({
  page,
}) => {
  await page.goto("/dictionary/")
  await page.getByRole("searchbox", { name: "搜索视觉词典" }).fill("阴影")
  await page
    .getByRole("button", {
      name: "查看 Drop / Box Shadow · 外投影",
      exact: true,
    })
    .click()
  await page.getByRole("link", { name: "调整参数并对比", exact: true }).click()
  await expect(page).toHaveURL(/\/style-workbench\/$/)
  await expect(sample(page, "baseline")).toBeVisible()
  await page.goto("/docs/style-workbench/")
  await expect(sample(page, "baseline")).toBeVisible()
  await page.getByRole("button", { name: "柔和浮层", exact: true }).click()
  await expect(sample(page, "modified")).toHaveCSS("border-radius", "12px")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.setViewportSize({ width: 768, height: 1000 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test("workbench remains usable on touch, in dark theme and with reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto("http://127.0.0.1:3011/style-workbench/")
  await expect(sample(page, "baseline")).toBeVisible()
  await page.getByRole("button", { name: "紧凑平面", exact: true }).tap()
  for (const target of [
    page.getByRole("button", { name: "尺寸与间距", exact: true }),
    page.getByRole("slider", { name: "圆角", exact: true }),
    page.getByRole("spinbutton", { name: "圆角数值", exact: true }),
    sample(page, "modified").getByRole("button", {
      name: "示例按钮",
      exact: true,
    }),
    sample(page, "modified").getByRole("textbox", {
      name: "示例输入",
      exact: true,
    }),
  ]) {
    const box = await target.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.width).toBeGreaterThanOrEqual(44)
  }
  await page.screenshot({
    path: "test-results/style-workbench-mobile.png",
    fullPage: true,
  })
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await context.close()
})
