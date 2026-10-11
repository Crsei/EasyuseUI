import { expect, test, type Page } from "@playwright/test"
import docs from "../lib/docs-index.json" with { type: "json" }
import crmMetadata from "../lib/site-crm-metadata.json" with { type: "json" }

const app = "/examples/agent-workbench/app/"
function expectDescriptions(page: Page, description: string) {
  return expect
    .poll(() =>
      page
        .locator('head meta[name="description"]')
        .evaluateAll(
          (nodes, expected) =>
            nodes.length > 0 &&
            nodes.every((node) => node.getAttribute("content") === expected),
          description,
        ),
    )
    .toBe(true)
}
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

for (const route of ["/", "/components/", "/docs/button/", app]) {
  test(`route resources exclude CRM messages: ${route}`, async ({ page }) => {
    const { scripts, pending } = captureScripts(page)
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(route)

      await page
        .getByRole("combobox", { name: "语言", exact: true })
        .first()
        .selectOption("en")
      await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await page.waitForLoadState("networkidle")
    await Promise.all(pending)
    expect(scripts.size).toBeGreaterThan(0)
    expect(
      [...scripts.values()].some((body) => body.includes("crm.localOnly")),
    ).toBe(false)
    expect(errors).toEqual([])
  })
}

test("navigation remains lazy after the intent experiment is disabled", async ({
  page,
}) => {
  const { scripts, pending } = captureScripts(page)
  const requests: string[] = []
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/components/"))
      requests.push(request.url())
  })
  await page.goto("/")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await page.waitForLoadState("networkidle")
  expect(requests).toHaveLength(0)
  const link = page.locator('[data-site-header] nav a[href="/components/"]')
  await link.focus()
  await page.mouse.move(0, 0)
  await link.hover()
  await link.focus()
  await page.waitForTimeout(500)
  expect(requests).toHaveLength(0)
  await Promise.all(pending)
  expect(
    [...scripts.values()].some((body) => body.includes("react-flow__renderer")),
  ).toBe(false)
  await link.click()
  await expect(page).toHaveURL(/\/components\/$/)
  await expect(page.locator('[data-component-entry="button"]')).toBeVisible()
})

test("current route metadata follows language and browser history", async ({
  page,
}) => {
  await page.goto("/docs/button/")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  const description = (slug: string) =>
    docs.find((entry) => entry.slug === slug)!.description.en
  await expectDescriptions(page, description("button"))
  await page
    .getByRole("navigation", { name: "Documentation pagination", exact: true })
    .getByRole("link")
    .filter({ hasText: "Input" })
    .click()
  await expect(page).toHaveTitle("Input · EasyuseUI")
  await expectDescriptions(page, description("input"))
  await page.goBack()
  await expect(page).toHaveTitle("Button · EasyuseUI")
  await expectDescriptions(page, description("button"))
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("zh-CN")
  await expectDescriptions(
    page,
    docs.find((entry) => entry.slug === "button")!.description["zh-CN"],
  )
})

test("CRM metadata keeps its canonical bilingual description at the CRM boundary", async ({
  page,
}) => {
  await page.goto("/examples/sales-crm/")
  await expect(page).toHaveTitle(`${crmMetadata.title} · EasyuseUI`)
  await expectDescriptions(page, crmMetadata.description["zh-CN"])
  await page
    .getByRole("button", { name: "示例说明与状态场景", exact: true })
    .click()
  await page.getByRole("combobox", { name: "语言", exact: true }).click()
  await page.getByRole("option", { name: "English", exact: true }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expectDescriptions(page, crmMetadata.description.en)
  await expect(page).toHaveTitle(`${crmMetadata.title} · EasyuseUI`)
})
