import { expect, test } from "@playwright/test"

test("Canvas engine hydrates with theme styles, named ports, an edge and controlled selection", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/docs/workflow-canvas/")
  const input = page.locator('[data-canvas-node="input"]')
  await expect(input).toBeVisible()
  await expect(input).toHaveCSS("width", "240px")
  await expect(page.locator(".react-flow__edge")).toHaveCount(1)
  await expect(page.locator(".react-flow__handle")).toHaveCount(2)
  await expect(page.locator('[aria-label="文本 输出 string"]')).toBeVisible()
  await input.click()
  await expect(input).toHaveAttribute("data-selected", "true")
  const light = await input.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  const minimap = page.locator(".react-flow__minimap")
  const lightMap = await minimap.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )
  await page.getByRole("button", { name: "切换深浅主题", exact: true }).click()
  await expect(input).not.toHaveCSS("background-color", light)
  await expect(minimap).not.toHaveCSS("background-color", lightMap)
  await page.screenshot({
    path: "test-results/canvas-foundation-dark.png",
    fullPage: true,
  })
  expect(errors).toEqual([])
})
