import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { test, expect } from "@playwright/test"
import { agentWorkbenchShowcasePost } from "../content/blog/agent-workbench-showcase"

test("showcase capture and distribution evidence match the delivered source", async ({
  request,
}) => {
  const response = await request.get(
    "/blog/agent-workbench-showcase/captures.json",
  )
  expect(response.ok()).toBe(true)
  const captures = await response.json()
  expect(captures.images).toHaveLength(64)
  expect(captures.sourceSnapshotId).toBe(
    agentWorkbenchShowcasePost.sourceSnapshotId,
  )
  expect(
    createHash("sha256")
      .update(JSON.stringify(captures.sourceFiles))
      .digest("hex"),
  ).toBe(captures.sourceSnapshotId)
  for (const [file, sha] of Object.entries(captures.sourceFiles))
    expect(
      createHash("sha256")
        .update(await readFile(file))
        .digest("hex"),
      file,
    ).toBe(sha)
  for (const capture of captures.images) {
    expect(capture.sourceSnapshotId).toBe(captures.sourceSnapshotId)
    expect(capture.fonts.status).toBe("loaded")
    expect(capture.fonts.horizontalOverflow).toBe(false)
    expect((await request.get(capture.asset)).ok(), capture.asset).toBe(true)
  }
  const payload = await (
    await request.get("/blog/agent-workbench-showcase/portable-payloads.json")
  ).json()
  expect(payload.changed).toEqual([])
  expect(payload.before).toEqual(payload.after)
  expect(Object.keys(payload.after)).toHaveLength(843)
  expect(payload.beforeBytes).toBe(4_578_792)
  expect(payload.afterBytes).toBe(payload.beforeBytes)
  expect(payload.sourceSnapshotId).toBe(captures.sourceSnapshotId)
  const verification = await (
    await request.get("/blog/agent-workbench-showcase/verification.json")
  ).json()
  expect(verification.sourceSnapshotId).toBe(captures.sourceSnapshotId)
  expect(verification.workbench.expected).toBe(174)
  expect(verification.workbench.unexpected).toBe(0)
  expect(verification.workbench.skipped).toBe(0)
  expect(verification.workbench.flaky).toBe(0)
  expect(verification.servicesConnected).toEqual([])
})

test("showcase article renders bilingual captions and working evidence at desktop and mobile widths", async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/blog/agent-workbench-showcase/")
    await page
      .getByRole("combobox", { name: /语言|Language/, exact: true })
      .selectOption("zh-CN")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      agentWorkbenchShowcasePost.title["zh-CN"],
    )
    await page
      .getByRole("combobox", { name: "语言", exact: true })
      .selectOption("en")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      agentWorkbenchShowcasePost.title.en!,
    )
    await expect(page.locator("main")).toContainText(
      "not a performance comparison of the same page",
    )
    for (const screenshot of await page.locator("main figure img").all()) {
      await screenshot.scrollIntoViewIfNeeded()
      await expect(screenshot).not.toHaveJSProperty("naturalWidth", 0)
    }
    for (const link of await page.locator("main a[download]").all())
      expect((await request.get((await link.getAttribute("href"))!)).ok()).toBe(
        true,
      )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})
