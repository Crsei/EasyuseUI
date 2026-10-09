import { expect, test } from "@playwright/test"

test("CRM article exposes bounded evidence, bilingual comparisons and the working example", async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/blog/sales-crm-replication/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "使用 EasyuseUI 复刻 Sales CRM Companies",
  )
  const evidence = await request.get("/blog/sales-crm/verification.json")
  expect(evidence.ok()).toBe(true)
  const report = await evidence.json()
  expect(report.checks.fullBrowser.failed).toBe(0)
  expect(report.checks.fullBrowser.passed).toBeGreaterThanOrEqual(202)
  expect(report.checks.installation.status).toBe("passed")
  expect(report.checks.installation.reused).toBe(false)
  expect(report.sourceSnapshotId).toMatch(/^[0-9a-f]{64}$/)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Rebuilding Sales CRM Companies with EasyuseUI",
  )
  await expect(page.getByRole("note")).toHaveCount(0)
  const pictures = page.locator("article img")
  expect(await pictures.count()).toBeGreaterThanOrEqual(8)
  for (const picture of await pictures.all()) {
    await picture.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        picture.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBe(true)
  }
  await page
    .getByRole("link", { name: "Open the current CRM example", exact: true })
    .click()
  await expect(page).toHaveURL(/\/examples\/sales-crm\/$/)
  await expect(page.locator("[data-sales-crm]")).toHaveAttribute(
    "data-locale",
    "en",
  )
  await expect(
    page.getByRole("button", { name: "New Company", exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})
