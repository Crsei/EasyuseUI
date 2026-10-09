import { expect, test } from "@playwright/test"
import components from "../lib/component-directory.json" with { type: "json" }

for (const component of components) {
  test(`${component.name} (${component.slug}) documentation automatically displays its demo`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    const response = await page.goto(component.docPath)
    expect(response?.ok()).toBe(true)
    const demo = page.locator(`[data-demo-loader="${component.slug}"]`)
    await expect(demo).toHaveAttribute("data-demo-mounted", "true")
    await expect(demo).toHaveAttribute("aria-busy", "false")
    await expect(demo.locator("[data-demo-error]")).toHaveCount(0)
    const content = demo.locator("[data-demo-content]")
    await expect(content).toBeVisible()
    expect((await content.boundingBox())!.height).toBeGreaterThan(0)
    expect(await content.locator("*").count()).toBeGreaterThan(0)
    expect(errors).toEqual([])
  })
}

test("closing, loading again and resetting an automatic Canvas preview are explicit", async ({
  page,
}) => {
  await page.goto("/docs/workflow-canvas/")
  const demo = page.locator('[data-demo-loader="workflow-canvas"]')
  await expect(demo.locator(".react-flow")).toBeVisible()
  await demo.getByRole("button", { name: "关闭演示", exact: true }).click()
  await expect(demo.locator("[data-demo-content]")).toHaveCount(0)
  await demo.getByRole("button", { name: "加载演示", exact: true }).click()
  await expect(demo.locator(".react-flow")).toBeVisible()
  await page
    .locator("#preview")
    .getByRole("button", { name: "重置演示", exact: true })
    .click()
  await expect(demo.locator(".react-flow")).toBeVisible()
})

test("the first load click waits until the demo controls are hydrated", async ({
  page,
}) => {
  let release: () => void = () => {}
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await ready
    await route.continue()
  })
  try {
    await page.goto("/blog/on-demand-demos/", { waitUntil: "commit" })
    const demo = page.locator('[data-demo-loader="button"]')
    const load = demo.getByRole("button", { name: "加载演示", exact: true })
    await expect(load).toBeDisabled()
    release()
    await expect(load).toBeEnabled()
    await load.click()
    await expect(demo.locator("[data-demo-content]")).toBeVisible()
    await expect(
      demo.getByRole("button", { name: "保存更改", exact: true }),
    ).toBeVisible()
  } finally {
    release()
  }
})
