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

test("P2 article binds comparable rendering samples, eight captures and the large-list entry", async ({
  page,
  request,
}) => {
  const captures = await (
    await request.get("/blog/agent-board/p2/captures.json")
  ).json()
  const measured = await (
    await request.get("/blog/agent-board/p2/measurements.json")
  ).json()
  const report = await (
    await request.get("/blog/agent-board/p2/validation.json")
  ).json()
  expect(captures.sourceSnapshotId).toMatch(/^[0-9a-f]{64}$/)
  expect(measured.sourceSnapshotId).toBe(captures.sourceSnapshotId)
  expect(report.sourceSnapshotId).toBe(captures.sourceSnapshotId)
  expect(report.checks.agentRegression.passed).toBe(30)
  expect(report.checks.independentInstall.status).toBe("passed")
  expect(captures.captures).toHaveLength(8)
  expect(measured.samples).toHaveLength(6)
  for (const mode of ["native", "virtual"]) {
    const samples = measured.samples.filter(
      (sample: { mode: string }) => sample.mode === mode,
    )
    expect(samples).toHaveLength(3)
    for (const sample of samples) {
      expect(sample.loadedCount).toBe(1000)
      expect(sample.viewport).toEqual({ width: 1440, height: 1000 })
      expect(sample.sourceSnapshotId).toBe(captures.sourceSnapshotId)
      expect(sample.activations).toBe(1)
      expect(sample.mountedRows).toBe(
        mode === "native"
          ? measured.results.mountedRows.before
          : measured.results.mountedRows.after,
      )
    }
  }
  expect(
    new Set(
      measured.samples.map((sample: { rowHeight: number }) => sample.rowHeight),
    ).size,
  ).toBe(1)
  expect(measured.results.mountedRows.before).toBe(1000)
  expect(measured.results.mountedRows.after).toBeLessThan(30)
  await page.goto("/blog/agent-board-showcase/")
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  const metric = page.getByRole("row").filter({ hasText: "挂载运行行数" })
  await expect(metric).toContainText("1,000")
  await expect(metric.getByRole("cell").nth(1)).toHaveText(
    String(measured.results.mountedRows.after),
  )
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "首条详情打开步骤" })
      .locator('[data-change="unchanged"]'),
  ).toBeVisible()
  for (const capture of captures.captures) {
    const image = page.locator(`main img[src$="${capture.file}"]`)
    await image.scrollIntoViewIfNeeded()
    await expect(image).not.toHaveJSProperty("naturalWidth", 0)
    expect((await request.get(capture.file)).ok()).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole("link", { name: "打开 1,000 条运行的列表对照示例", exact: true })
    .click()
  await expect(page).toHaveURL(/\/workspace\/agents\/scale\/$/)
  await expect(
    page.getByRole("region", { name: "虚拟运行列表", exact: true }),
  ).toBeVisible()
})
