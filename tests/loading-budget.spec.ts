import { expect, test } from "@playwright/test"
import { gzipSync } from "node:zlib"
import budgets from "../config/performance-budgets.json" with { type: "json" }
// These are transferred JavaScript bodies, including automatic navigation prefetch.
// CSS class markers remain in the minified React Flow engine, so zero DOM alone cannot pass.
for (const [route, budget] of Object.entries(
  budgets.initialJsEstimatedGzipBytes,
)) {
  test(`initial loading budget and no Canvas engine: ${route}`, async ({
    page,
  }, testInfo) => {
    const resources = new Map<string, Buffer>(),
      pending: Promise<void>[] = [],
      failures: string[] = []
    page.on("response", (response) => {
      if (new URL(response.url()).pathname.endsWith(".js"))
        pending.push(
          response
            .body()
            .then((body) => {
              resources.set(response.url(), body)
            })
            .catch((error) => {
              failures.push(String(error))
            }),
        )
    })
    await page.goto(route)
    await expect(
      page.getByRole("button", { name: "搜索文档", exact: true }),
    ).toBeEnabled()
    await page
      .getByRole("combobox", { name: "语言", exact: true })
      .first()
      .selectOption("en")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await page.waitForLoadState("networkidle")
    await Promise.all(pending)
    expect(failures).toEqual([])
    const engine = () =>
      [...resources.values()].filter((body) =>
        body.includes("react-flow__renderer"),
      )
    expect(
      engine(),
      "Initial page must not download the Canvas engine",
    ).toHaveLength(0)
    const estimatedGzipBytes = [...resources.values()].reduce(
      (sum, body) => sum + gzipSync(body).length,
      0,
    )
    await testInfo.attach("initial-js.json", {
      body: JSON.stringify(
        { route, estimatedGzipBytes, budget, resources: [...resources.keys()] },
        null,
        2,
      ),
      contentType: "application/json",
    })
    expect(estimatedGzipBytes).toBeLessThanOrEqual(budget)
    if (route === "/") {
      await page
        .getByRole("button", { name: "Search documentation", exact: true })
        .click()
      await page.getByRole("dialog").getByRole("combobox").fill("Canvas")
      await expect(page.getByRole("option").first()).toBeVisible()
      await page.waitForLoadState("networkidle")
      await Promise.all(pending)
      expect(
        engine(),
        "Opening static search must not download the Canvas engine",
      ).toHaveLength(0)
      await expect(page.locator(".react-flow")).toHaveCount(0)
    }

    if (route === "/components/") {
      await page
        .getByRole("textbox", { name: "Search components", exact: true })
        .fill("WorkflowCanvas")
      await page
        .locator('[data-component-entry="workflow-canvas"]')
        .getByRole("button", { name: "Preview", exact: true })
        .click()
      await expect(page.locator(".react-flow")).toHaveCount(1)
      await page.waitForLoadState("networkidle")
      await Promise.all(pending)
      expect(
        engine().length,
        "Detector must recognize the engine after an explicit preview",
      ).toBeGreaterThan(0)
    }
  })
}
