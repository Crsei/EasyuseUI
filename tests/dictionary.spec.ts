import { expect, test } from "@playwright/test"

test("dictionary searches Chinese aliases, filters availability, and opens real docs", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/dictionary/")
  await expect(
    page.getByRole("heading", { name: "视觉词典", exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: "test-results/dictionary-desktop.png" })
  const search = page.getByRole("searchbox", { name: "搜索视觉词典" })
  const entries = page.getByRole("region", { name: "词条列表" })
  await search.fill("胶囊")
  for (const name of [
    "Badge",
    "Tag",
    "Chip",
    "Pill / Capsule",
    "Segmented Control",
  ]) {
    await expect(
      entries.getByRole("button", { name: `查看 ${name} ·`, exact: false }),
    ).toBeVisible()
  }
  await page.getByLabel("实现情况", { exact: true }).selectOption("available")
  await expect(
    entries.getByRole("button", { name: /查看 Segmented Control/ }),
  ).toBeVisible()
  await entries
    .getByRole("button", { name: "查看 Chip · 可操作胶囊", exact: true })
    .click()
  const detail = page.getByRole("complementary", { name: "词条详情" })
  await expect(
    detail.getByRole("heading", { name: "Chip", exact: true }),
  ).toBeVisible()
  await detail.getByRole("button", { name: "加载演示", exact: true }).click()
  await detail.getByRole("button", { name: "仅看活跃", exact: true }).click()
  await expect(
    detail.getByRole("button", { name: "仅看活跃", exact: true }),
  ).toHaveAttribute("aria-pressed", "true")
  await detail.getByRole("link", { name: "打开组件文档与源码" }).click()
  await expect(page).toHaveURL(/\/docs\/chip\/$/)
  await expect(
    page.getByRole("heading", { name: "源码文件", exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test("dictionary handles no matches and category filters without stale details", async ({
  page,
}) => {
  await page.goto("/dictionary/")
  const search = page.getByRole("searchbox", { name: "搜索视觉词典" })
  await search.fill("不存在的词条123")
  await expect(page.getByText("没有匹配的词条", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("complementary", { name: "词条详情" }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "清除全部筛选", exact: true }).click()
  await expect(search).toBeFocused()
  await page
    .getByRole("navigation", { name: "词典分类" })
    .getByRole("button", { name: /效果/ })
    .click()
  await expect(
    page
      .getByRole("region", { name: "词条列表" })
      .getByRole("button", { name: /查看 Badge/ }),
  ).toHaveCount(0)
  await expect(
    page
      .getByRole("complementary", { name: "词条详情" })
      .getByRole("heading", { name: "Drop / Box Shadow", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await search.fill("pIlL")
  await expect(
    page.getByRole("button", {
      name: "查看 Pill / Capsule · 胶囊形状",
      exact: true,
    }),
  ).toBeVisible()
})

test("shadow previews use the shared token and copy the selected code", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/dictionary/")
  await page.getByRole("searchbox", { name: "搜索视觉词典" }).fill("阴影")
  await page
    .getByRole("button", {
      name: "查看 Drop / Box Shadow · 外投影",
      exact: true,
    })
    .click()
  const detail = page.getByRole("complementary", { name: "词条详情" })
  await expect(
    detail.getByText("--shadow-floating", { exact: true }),
  ).toBeVisible()
  await expect(detail.getByText("内阴影", { exact: true })).toBeVisible()
  await detail.getByRole("button", { name: "复制代码", exact: true }).click()
  await expect(
    detail.getByRole("status").filter({ hasText: "已复制" }),
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "box-shadow: var(--shadow-floating);",
  )
  const shadow = await detail
    .locator('[aria-label="Drop / Box Shadow 外观示意"] > span > span')
    .first()
    .evaluate((element) => getComputedStyle(element).boxShadow)
  expect(shadow).not.toBe("none")
  await page.getByRole("button", { name: "切换深浅主题" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await detail.getByRole("button", { name: "复制代码", exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "box-shadow: var(--shadow-floating);",
  )
  await page
    .getByRole("button", {
      name: "查看 Inset / Inner Shadow · 内阴影",
      exact: true,
    })
    .click()
  await expect(
    detail.getByRole("button", { name: "复制代码", exact: true }),
  ).toBeVisible()
  await expect(detail.getByText("已复制", { exact: true })).toHaveCount(0)
  await expect(detail.locator("pre")).toContainText("inset")
})

test("Chip separates keyboard selection and removal, blocks busy actions and restores focus", async ({
  page,
}) => {
  await page.goto("/docs/chip/")
  const demo = page.getByRole("region", { name: "Chip 交互演示" })
  const value = demo.getByRole("button", { name: "TypeScript", exact: true })
  const remove = demo.getByRole("button", {
    name: "移除 TypeScript",
    exact: true,
  })
  await value.focus()
  await page.keyboard.press("Space")
  await expect(value).toHaveAttribute("aria-pressed", "true")
  await expect(
    demo.getByRole("button", { name: "仅看活跃", exact: true }),
  ).toHaveAttribute("aria-pressed", "false")
  await page.keyboard.press("Tab")
  await expect(remove).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(value).toHaveCount(0)
  await expect(demo.getByRole("button", { name: "重置示例" })).toBeFocused()
  await expect(
    demo.getByRole("button", { name: "保存中", exact: true }),
  ).toBeDisabled()
  await expect(demo.getByText("处理中", { exact: true })).toBeVisible()
  await expect(
    demo.getByRole("button", { name: "移除 保存中", exact: true }),
  ).toBeDisabled()
  await expect(
    demo.getByRole("button", { name: "不可用", exact: true }),
  ).toBeDisabled()
  await expect(demo.locator("button button")).toHaveCount(0)
  await demo.getByRole("button", { name: "重置示例" }).click()
  await expect(value).toHaveAttribute("aria-pressed", "false")
})

test("dictionary remains usable on touch in dark theme with reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    colorScheme: "dark",
  })
  const page = await context.newPage()
  await page.goto(
    new URL("/dictionary/", test.info().project.use.baseURL as string).href,
  )
  await page.getByRole("searchbox", { name: "搜索视觉词典" }).fill("Chip")
  await page
    .getByRole("button", { name: "查看 Chip · 可操作胶囊", exact: true })
    .click()
  const detail = page.getByRole("complementary", { name: "词条详情" })
  await expect(
    detail.getByRole("heading", { name: "Chip", exact: true }),
  ).toBeFocused()
  await detail.getByRole("button", { name: "加载演示", exact: true }).tap()
  await expect(
    detail.getByRole("button", { name: "TypeScript", exact: true }),
  ).toBeVisible()
  for (const name of ["TypeScript", "移除 TypeScript"]) {
    const target = detail.getByRole("button", { name, exact: true })
    const box = await target.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await expect(detail.locator("button button")).toHaveCount(0)
  await detail
    .getByRole("button", { name: "移除 TypeScript", exact: true })
    .tap()
  await expect(
    detail.getByRole("status").filter({ hasText: "已移除" }),
  ).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: "test-results/dictionary-mobile.png",
    fullPage: true,
  })
  await context.close()
})
