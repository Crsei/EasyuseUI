import { expect, test } from "@playwright/test"
test("legacy workspace and Pi entries mount the 17-module docs gallery without service clients", async ({
  page,
}) => {
  const connections: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("/api/pi/")) connections.push(request.url())
  })
  for (const route of [
    "/workspace/?template=artifacts&page=artifacts&session=session-report&token=secret",
    "/examples/agent-workbench/pi/",
  ]) {
    await page.goto(route)
    await expect(page.locator("[data-element-gallery]")).toBeVisible()
    await expect(page.locator("[data-gallery-module]")).toHaveCount(17)
    await expect(
      page.locator("[data-pi-workspace], [data-workbench-page]"),
    ).toHaveCount(0)
    await expect(
      page.locator("[data-independent-app], [data-independent-app-unconfigured]"),
    ).toHaveCount(0)
  }
  expect(connections).toEqual([])
})
