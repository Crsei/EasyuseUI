import { expect, type Page } from "@playwright/test"

export async function openFrozenCanvas(page: Page) {
  const time = new Date("2026-10-08T00:00:00Z")
  await page.clock.install({ time })
  await page.goto("/workspace/canvas/")
  await expect(page.locator('[data-canvas-ready="true"]')).toBeVisible()
  await page.clock.pauseAt(new Date(time.getTime() + 60_000))
}
/** Let React commit each authoritative stage before scheduling the next virtual timer. */
export async function advanceStages(
  page: Page,
  count: number,
  interval = 1000,
) {
  const toolbar = page.locator("[data-canvas-playback]")
  await expect(toolbar).toHaveAttribute("data-playback-sequence", /^\d+$/)
  for (let index = 0; index < count; index++) {
    if ((await toolbar.getAttribute("data-canvas-playback")) !== "playing")
      return
    await expect(
      page.getByRole("button", { name: "查询运行", exact: true }),
    ).toBeEnabled()
    const sequence = Number(
      await toolbar.getAttribute("data-playback-sequence"),
    )
    await page.clock.runFor(interval)
    await expect(toolbar).toHaveAttribute(
      "data-playback-sequence",
      String(sequence + 1),
    )
  }
}
export async function closeClockDialog(page: Page) {
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "关闭弹窗", exact: true }).click()
  await page.clock.runFor(250)
  await expect(dialog).toBeHidden()
}
