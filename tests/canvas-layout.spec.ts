import { expect, test } from "@playwright/test"

test("canvas uses the window at desktop, wide, tablet and mobile sizes", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [1024, 768],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto("/workspace/canvas/")
    const canvas = page.locator('[aria-label="流程画布"]')
    await expect(canvas).toHaveAttribute("data-canvas-ready", "true")
    const workspace = (await page
      .locator("[data-canvas-workspace]")
      .boundingBox())!
    const drawing = (await canvas.boundingBox())!
    expect(workspace.x).toBe(0)
    expect(workspace.width).toBe(width)
    expect(workspace.y).toBeLessThan(120)
    expect(drawing.height).toBeGreaterThan(height * 0.5)
    expect(drawing.y + drawing.height).toBeLessThanOrEqual(height)
    expect(
      await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      })),
    ).toEqual({ width, height })
    await page.screenshot({
      path: `test-results/canvas-full-window-${width}.png`,
      fullPage: true,
    })
  }
  for (const path of ["project", "services", "stress"]) {
    await page.goto(`/workspace/canvas/${path}/`)
    await expect(page.locator('[aria-label="流程画布"]')).toHaveAttribute(
      "data-canvas-ready",
      "true",
    )
    await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute(
      "data-layout",
      "fill",
    )
    const box = (await page.locator("[data-canvas-workspace]").boundingBox())!
    expect(box.y + box.height).toBeLessThanOrEqual(844)
  }
  expect(errors).toEqual([])
})

test("collapsing panels preserves canvas edits, selection and resized height", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page
    .getByRole("button", { name: "查找图中节点", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "定位 Agent", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "关闭弹窗" })
    .click()
  const inspector = page.locator('[data-inspector-object="agent"]')
  await inspector.getByLabel("节点名称", { exact: true }).fill("Retained agent")
  await inspector.getByRole("button", { name: "应用配置", exact: true }).click()
  const workspace = page.locator("[data-canvas-workspace]")
  const revision = await workspace.getAttribute("data-revision")
  const canvas = page.locator('[aria-label="流程画布"]')
  const fullHeight = (await canvas.boundingBox())!.height
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  const resize = page.getByRole("separator", {
    name: "调整底部面板高度",
    exact: true,
  })
  await resize.focus()
  await resize.press("End")
  await expect(resize).toHaveAttribute("aria-valuenow", "400")
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
  await expect(resize).toBeHidden()
  expect((await canvas.boundingBox())!.height).toBe(fullHeight)
  await expect(workspace).toHaveAttribute("data-revision", revision!)
  await expect(inspector.getByLabel("节点名称", { exact: true })).toHaveValue(
    "Retained agent",
  )
  await expect(page.locator('[data-canvas-node="agent"]')).toHaveAttribute(
    "data-selected",
  )
  await page.getByRole("tab", { name: "执行调试", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "执行调试", exact: true }),
  ).toBeVisible()
  await expect(resize).toHaveAttribute("aria-valuenow", "400")
})
