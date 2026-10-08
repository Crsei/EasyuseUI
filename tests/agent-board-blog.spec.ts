import { expect, test } from "@playwright/test"

test("Agent article exposes source-bound captures, reports and the workspace entry", async ({
  page,
  request,
}) => {
  await page.goto("/blog/agent-board-showcase/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Agent 运行看板：从状态到人工介入",
  )
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  const response = await request.get("/blog/agent-board/validation.json")
  expect(response.ok()).toBe(true)
  const report = await response.json()
  expect(report.sourceSnapshotId).toMatch(/^[0-9a-f]{64}$/)
  expect(report.checks.finalAgentBrowser.passed).toBe(20)
  expect(report.checks.independentInstall.status).toBe("passed")
  const captures = await (
    await request.get("/blog/agent-board/captures.json")
  ).json()
  expect(captures.sourceSnapshotId).toBe(report.sourceSnapshotId)
  expect(captures.captures).toHaveLength(12)
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  for (const capture of captures.captures) {
    const image = page
      .locator("main img")
      .nth(captures.captures.indexOf(capture))
    await expect(image).toHaveJSProperty(
      "src",
      new URL(capture.file, page.url()).href,
    )
    await image.scrollIntoViewIfNeeded()
    await expect(image).not.toHaveJSProperty("naturalWidth", 0)
  }
  for (const link of await page.locator("main a[download]").all()) {
    expect((await request.get((await link.getAttribute("href"))!)).ok()).toBe(
      true,
    )
  }
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Agent runs: from runtime status to human attention",
  )
  await page
    .getByRole("link", { name: "Open the Agent board example", exact: true })
    .click()
  await expect(page).toHaveURL(/\/workspace\/agents\/$/)
  await expect(
    page.getByRole("textbox", { name: "Search runs", exact: true }),
  ).toBeVisible()
})
