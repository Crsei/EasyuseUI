import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("workbench article binds actual captures and verification to the same source", async ({
  page,
  request,
}) => {
  const captures = await (
    await request.get("/blog/agent-workbench/captures.json")
  ).json()
  const verification = await (
    await request.get("/blog/agent-workbench/verification.json")
  ).json()
  expect(captures.sourceSnapshotId).toMatch(/^[0-9a-f]{64}$/)
  expect(verification.sourceSnapshotId).toBe(captures.sourceSnapshotId)
  expect(verification.complete).toBe(true)
  expect(verification.modelTests).toBe(10)
  expect(verification.browserTests).toBe(30)
  expect(verification.fullRegression.passed).toBeGreaterThan(500)
  expect(verification.fullRegression.failed).toBe(0)
  expect(verification.independentInstall).toBe("passed")
  expect(captures.images).toHaveLength(12)
  for (const capture of captures.images) {
    expect(capture.sourceSnapshotId).toBe(captures.sourceSnapshotId)
    expect(capture.fonts.status).toBe("loaded")
    expect(capture.fonts.horizontalOverflow).toBe(false)
    expect((await request.get(capture.asset)).ok()).toBe(true)
  }
  await page.goto("/blog/agent-workbench/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Agent 工作台：从独立区域到三种完整网页",
  )
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).not.toHaveJSProperty("naturalWidth", 0)
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Agent workbench: from individual regions to three complete pages",
  )
  await page
    .getByRole("link", {
      name: "Open the region lab, layouts and complete templates",
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/\/examples\/agent-workbench\/$/)
})
