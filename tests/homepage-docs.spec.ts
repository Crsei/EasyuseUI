import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import docs from "../lib/docs-index.json" with { type: "json" }
import files from "../lib/docs-code-index.json" with { type: "json" }
import { docGuides } from "../lib/doc-guides"
import { exampleManifest } from "../lib/example-manifest"

for (const width of [1440, 1280, 768, 390]) {
  for (const theme of ["light", "dark"] as const) {
    for (const locale of ["zh-CN", "en"] as const) {
      test(`site reading layout ${width} ${theme} ${locale}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
        await page.addInitScript(
          ({ theme, locale }) => {
            localStorage.setItem("theme", theme)
            localStorage.setItem("easyuseui-locale", locale)
          },
          { theme, locale },
        )
        const errors: string[] = []
        page.on("pageerror", (error) => errors.push(error.message))
        for (const route of ["/", "/docs/button/"]) {
          await page.goto(route)
          await expect(page.locator("html")).toHaveAttribute("lang", locale)
          await expect(page.locator("html")).toHaveClass(new RegExp(theme))
          const header = page.locator("[data-site-header]")
          expect((await header.boundingBox())!.height).toBeLessThanOrEqual(66)
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true)
          if (route === "/") {
            const image = page.locator("main img").first()
            await expect(image).toHaveAttribute(
              "src",
              new RegExp(`-desktop-${theme}\\.jpg$`),
            )
            await expect
              .poll(() =>
                image.evaluate((img) => (img as HTMLImageElement).currentSrc),
              )
              .toMatch(
                new RegExp(
                  `-${width < 768 ? "mobile" : "desktop"}-${theme}\\.jpg$`,
                ),
              )
            await expect
              .poll(() =>
                image.evaluate((img) => (img as HTMLImageElement).naturalWidth),
              )
              .toBeGreaterThan(0)
            expect((await image.boundingBox())!.y).toBeLessThan(
              width === 390 ? 844 : 900,
            )
            await expect(
              page.locator(".react-flow,[data-demo-mounted=true]"),
            ).toHaveCount(0)
          } else {
            await expect(
              page.getByRole("heading", { name: "Button", exact: true }),
            ).toBeVisible()
            await expect(
              page.locator("#installation,#usage,#api,#example,#source"),
            ).toHaveCount(5)
            const sidebar = page.locator("aside[data-docs-sidebar]")
            if (width >= 768) await expect(sidebar).toBeVisible()
            else
              await expect(
                page.getByRole("button", {
                  name: locale === "en" ? "Documentation menu" : "文档目录",
                  exact: true,
                }),
              ).toBeVisible()
          }
        }
        expect(errors).toEqual([])
      })
    }
  }
}

test("primary navigation, gallery and generated guides keep canonical routes", async ({
  page,
  request,
}) => {
  await page.goto("/")
  await expect(
    page.getByRole("navigation", { name: "主导航" }).getByRole("link"),
  ).toHaveCount(4)
  await page.goto("/examples/")
  await expect(page.locator("[data-example]")).toHaveCount(
    exampleManifest.length,
  )
  for (const example of exampleManifest)
    await expect(
      page.locator(`[data-example="${example.id}"]`).getByRole("link").first(),
    ).toHaveAttribute("href", example.href)
  await expect(
    page.getByRole("link", { name: "Work Items", exact: true }),
  ).toHaveAttribute("href", "/examples/work-items/")
  for (const guide of docGuides) {
    const response = await request.get(`/docs/${guide.slug}/`)
    expect(response.ok()).toBe(true)
    const html = await response.text()
    expect(html).toContain(`rel="canonical"`)
    for (const section of guide.sections)
      expect(html).toContain(`id="${section.id}"`)
  }
  const sitemap = await (await request.get("/sitemap.xml")).text()
  for (const entry of docs) expect(sitemap).toContain(entry.docPath)
  const search = await (await request.get("/docs-search.json")).json()
  expect(
    search.items.some(
      (entry: { href: string }) => entry.href === "/docs/tool-call/#source",
    ),
  ).toBe(true)
})

test("search loads on demand, accepts aliases, retains query and respects composition", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  )
  await page.goto("/")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("zh-CN")
  expect(requests).not.toContain("/docs-search.json")
  await page.keyboard.press("Control+k")
  const dialog = page.getByRole("dialog"),
    input = dialog.getByRole("combobox")
  await expect(input).toBeFocused()
  await input.fill("审批")
  await expect(dialog.getByRole("option").first()).toContainText("ToolCall")
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
  })
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "搜索文档", exact: true }),
  ).toBeFocused()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click()
  await expect(input).toHaveValue("审批")
  await input.press("ArrowDown")
  await input.press("Home")
  await input.press("Enter")
  await expect(page).toHaveURL(/\/docs\/tool-call\/$/)
  await expect(page.locator("#preview")).toHaveCount(1)
  expect(requests.filter((path) => path === "/docs-search.json")).toHaveLength(
    1,
  )
})

test("search waits for hydration before accepting the first click", async ({
  page,
}) => {
  let release: () => void = () => {}
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/_next/static/chunks/app/layout-*.js", async (route) => {
    await ready
    await route.continue()
  })
  try {
    await page.goto("/", { waitUntil: "commit" })
    const search = page.getByRole("button", { name: "搜索文档", exact: true })
    await expect(search).toBeDisabled()
    release()
    await expect(search).toBeEnabled()
    await search.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("combobox")).toBeFocused()
  } finally {
    release()
  }
})

test("failed search index offers retry, empty suggestions and directory fallback", async ({
  page,
}) => {
  let first = true
  await page.route("**/docs-search.json", (route) => {
    if (first) {
      first = false
      return route.abort()
    }
    return route.continue()
  })
  await page.goto("/")
  await page.getByRole("button", { name: "搜索文档", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("alert")).toBeVisible()
  await expect(dialog.getByRole("link")).toHaveAttribute("href", "/components/")
  const input = dialog.getByRole("combobox")
  await input.fill("retained recovery query")
  await dialog.getByRole("button", { name: "重试", exact: true }).click()
  await expect(input).toHaveValue("retained recovery query")
  await input.fill("unlikely-empty-query-92854")
  await expect(dialog.getByRole("option")).toHaveCount(0)
  await expect(dialog).toContainText("Button")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "搜索文档", exact: true }),
  ).toBeFocused()
})

test("mobile site and docs drawers restore focus, touch targets and active links", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto(test.info().project.use.baseURL + "/docs/button/")
  const menu = page.getByRole("button", { name: "打开站点菜单", exact: true })
  await menu.click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("link").first()).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(menu).toBeFocused()
  const directory = page.getByRole("button", { name: "文档目录", exact: true })
  expect((await directory.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await directory.click()
  await expect(
    dialog.getByRole("link", { name: "Button", exact: true }),
  ).toHaveAttribute("aria-current", "page")
  await dialog.getByRole("textbox").fill("工具调用")
  await dialog.getByRole("link", { name: "ToolCall", exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/tool-call\/$/)
  await expect(dialog).toBeHidden()
  await page.getByRole("button", { name: "文档目录", exact: true }).click()
  await expect(dialog).toBeVisible()
  await expect
    .poll(() =>
      dialog.evaluate((element) => element.contains(document.activeElement)),
    )
    .toBe(true)
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "文档目录", exact: true }),
  ).toBeFocused()
  await context.close()
})

test("preview retains a draft across code and locale changes; reset is explicit", async ({
  page,
}) => {
  await page.goto("/docs/input/")
  const preview = page.locator("#preview"),
    input = preview.getByRole("textbox", { name: "项目名称", exact: true })
  await input.fill("Retained draft")
  await preview.getByRole("button", { name: "示例代码", exact: true }).click()
  await expect(preview.locator('[data-demo-mounted="true"]')).toHaveCount(1)
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await preview.getByRole("button", { name: "Preview", exact: true }).click()
  await expect(
    preview.getByRole("textbox", { name: "Project name", exact: true }),
  ).toHaveValue("Retained draft")
  await preview.getByRole("button", { name: "Reset demo", exact: true }).click()
  await expect(
    preview.getByRole("textbox", { name: "Project name", exact: true }),
  ).not.toHaveValue("Retained draft")
})

test("source resources are explicit, retryable and copy the complete selected file", async ({
  page,
}) => {
  const paths: string[] = []
  page.on("request", (r) => paths.push(new URL(r.url()).pathname))
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          ;(window as unknown as { copied: string }).copied = text
        },
      },
    })
  })
  await page.goto("/docs/tool-call/")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("zh-CN")
  expect(paths.some((path) => path.startsWith("/docs-code/"))).toBe(false)
  let first = true
  await page.route("**/docs-code/*.json", (route) => {
    if (first) {
      first = false
      return route.abort()
    }
    return route.continue()
  })
  const source = page.locator("#source [data-source-browser]")
  await source
    .getByRole("button", { name: "读取所选文件", exact: true })
    .click()
  await expect(source.getByRole("alert")).toBeVisible()
  await source.getByRole("button", { name: "重试", exact: true }).click()
  await expect(source.locator("[data-source-loaded]")).toContainText(
    "export function ToolCall",
  )
  await source.getByRole("button", { name: "复制代码", exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { copied: string }).copied),
    )
    .toContain("export function ToolCall")
  await source
    .getByRole("button", { name: "展开完整代码", exact: true })
    .click()
  await expect(
    source.getByRole("button", { name: "收起代码", exact: true }),
  ).toHaveAttribute("aria-expanded", "true")
  const file = (files as Record<string, { id: string; path: string }[]>)[
    "tool-call"
  ][2]
  await source.getByRole("combobox").selectOption(file.id)
  await expect(source.locator("[data-source-loaded]")).toHaveCount(0)
  await source
    .getByRole("button", { name: "读取所选文件", exact: true })
    .click()
  await expect(source.locator("[data-source-loaded]")).toBeVisible()
  await source.getByRole("button", { name: "复制代码", exact: true }).click()
  await expect(source.getByRole("status")).toContainText("已复制")
})

test("source late responses cannot replace another selected file; copy failure is visible", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("blocked")
        },
      },
    })
  })
  let release: () => void = () => {}
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  const sourceFiles = (files as Record<string, { id: string; url: string }[]>)[
    "tool-call"
  ].filter((file) => file.id !== "")
  await page.route("**" + sourceFiles[0].url, async (route) => {
    await pending
    await route.continue()
  })
  await page.goto("/docs/tool-call/")
  const source = page.locator("#source [data-source-browser]")
  await source
    .getByRole("button", { name: "读取所选文件", exact: true })
    .click()
  await expect(
    source.getByRole("button", { name: "正在读取源码…", exact: true }),
  ).toBeDisabled()
  await source.getByRole("combobox").selectOption(sourceFiles[2].id)
  await source
    .getByRole("button", { name: "读取所选文件", exact: true })
    .click()
  await expect(source.locator("[data-source-loaded]")).toBeVisible()
  release()
  await page.waitForLoadState("networkidle")
  await expect(source.getByRole("combobox")).toHaveValue(sourceFiles[2].id)
  await source.getByRole("button", { name: "复制代码", exact: true }).click()
  await expect(source.getByRole("status")).toContainText("复制失败")
})

test("TOC anchors clear the sticky header and directory state survives history", async ({
  page,
}) => {
  await page.goto("/docs/button/")
  const nav = page.locator("aside[data-docs-sidebar]")
  await nav.getByText("数据与任务", { exact: true }).click()
  await page
    .getByRole("navigation", { name: "本页目录", exact: true })
    .getByRole("link", { name: "API", exact: true })
    .click()
  await expect(page).toHaveURL(/#api$/)
  await expect
    .poll(() =>
      page.locator("#api").evaluate((el) => el.getBoundingClientRect().top),
    )
    .toBeGreaterThanOrEqual(63)
  const before = await page.evaluate(() => scrollY)
  await page.getByRole("link", { name: "Input", exact: true }).first().click()
  await expect(page).toHaveURL(/\/docs\/input\/$/)
  await expect(
    page.getByRole("heading", { name: "Input", exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/docs\/button\/#api$/)
  await expect(
    page.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before - 100)
  await page.goForward()
  await expect(
    page.getByRole("heading", { name: "Input", exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible()
  await page.locator('#api a[href="#source"]').first().click()
  await expect(page).toHaveURL(/#source$/)
  await nav.getByRole("link", { name: "Input", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Input", exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/button\/#source$/)
  await expect(
    page.getByRole("heading", { name: "Button", exact: true }),
  ).toBeVisible()
  await expect(
    nav
      .locator("details")
      .filter({ has: page.getByText("数据与任务", { exact: true }) }),
  ).toHaveAttribute("open", "")
})

test("catalog display and purpose filters preserve legacy URL state and explicit previews", async ({
  page,
}) => {
  await page.goto("/components/?category=canvas&q=WorkflowCanvas")
  await page.getByRole("button", { name: "列表", exact: true }).click()
  await expect(page).toHaveURL(/display=list/)
  await expect(page).toHaveURL(/category=canvas/)
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  await page
    .getByRole("combobox", { name: "用途分组", exact: true })
    .selectOption("canvas")
  await page
    .locator('[data-component-entry="workflow-canvas"]')
    .getByRole("button", { name: "预览", exact: true })
    .click()
  await expect(page.locator(".react-flow")).toHaveCount(1)
  await expect(page).toHaveURL(/preview=workflow-canvas/)
  await page.getByRole("button", { name: "网格", exact: true }).click()
  await expect(page.locator(".react-flow")).toHaveCount(1)
  await page.reload()
  await expect(page.locator(".react-flow")).toHaveCount(1)
})

for (const route of [
  "/",
  "/docs/button/",
  "/docs/data-table/",
  "/docs/tool-call/",
  "/docs/work-items-workspace/",
  "/docs/workflow-canvas/",
  "/docs/installation/",
  "/examples/",
]) {
  test(`documentation AA scan ${route}`, async ({ page }) => {
    await page.goto(route)
    await page
      .getByRole("combobox", { name: "语言", exact: true })
      .selectOption("en")
    if (route.startsWith("/docs/") && route !== "/docs/installation/") {
      const demo = page.locator("#preview [data-demo-loader]")
      await expect(demo).toHaveAttribute("data-demo-mounted", "true")
      await expect(demo).toHaveAttribute("aria-busy", "false")
      if (route === "/docs/workflow-canvas/")
        await expect(
          page.locator("#preview [data-canvas-ready]"),
        ).toHaveAttribute("data-canvas-ready", "true")
    }
    for (const theme of ["light", "dark"]) {
      if (theme === "dark")
        await page
          .getByRole("button", {
            name: "Toggle light and dark theme",
            exact: true,
          })
          .click()
      // Scan the loaded preview after fonts and layout settle. Scanning during
      // a deferred mount can miss its controls or inspect an incomplete graph.
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
      })
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
      expect(
        results.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((n) => n.target),
        })),
      ).toEqual([])
    }
  })
}

test("hidden retained preview pauses the local demonstration clock", async ({
  page,
}) => {
  const time = new Date("2026-10-09T00:00:00Z")
  await page.clock.install({ time })
  await page.goto("/docs/task-panel/")
  const preview = page.locator("#preview")
  const progress = preview.getByRole("progressbar")
  await expect(progress).toHaveAttribute("aria-valuenow", "67")
  await page.clock.pauseAt(new Date(time.getTime() + 60000))
  await preview
    .getByRole("button", { name: "重试发布组件清单", exact: true })
    .click()
  await preview.getByRole("button", { name: "示例代码", exact: true }).click()
  await page.clock.runFor(4000)
  await expect(preview.locator('[data-demo-mounted="true"]')).toHaveCount(1)
  await preview.getByRole("button", { name: "预览", exact: true }).click()
  await expect(progress).toHaveAttribute("aria-valuenow", "67")
  await page.clock.runFor(1000)
  await expect(progress).toHaveAttribute("aria-valuenow", "100")
})

test("skip link and search shortcut respect native editor focus", async ({
  page,
}) => {
  await page.goto("/")
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("link", { name: "跳转到主要内容", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/#main-content$/)
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "文档", exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/$/)
  await expect(
    page.getByRole("heading", { name: "介绍", exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/#main-content$/)
  await expect(page.locator("[data-home-scenes]")).toBeVisible()
  await page.goto("/docs/input/")
  const input = page
    .locator("#preview")
    .getByRole("textbox", { name: "项目名称", exact: true })
  await input.fill("Native draft")
  await input.press("Control+k")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(input).toHaveValue("Native draft")
})
