import { expect, test } from "@playwright/test"
for (const theme of ["light", "dark"] as const) {
  test(`Menu focus and disabled state ${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem("theme", theme)
      localStorage.setItem("easyuseui:locale", "en")
    }, theme)
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme })
    await page.clock.install({ time: new Date("2026-10-08T00:00:00Z") })
    await page.goto("/docs/menu/")
    await page
      .getByRole("combobox", { name: /语言|Language/, exact: true })
      .selectOption("en")
    await page.addStyleTag({
      content:
        '* { font-family: "DejaVu Sans Mono", monospace !important; animation: none !important; transition: none !important; }',
    })
    const trigger = page.getByRole("button", {
      name: "Example actions",
      exact: true,
    })
    await trigger.focus()
    await trigger.press("ArrowDown")
    await expect(
      page.getByRole("menuitem", { name: "Increment count", exact: true }),
    ).toBeFocused()
    await page.mouse.move(0, 0)
    await expect(page.getByRole("menu")).toHaveScreenshot(`menu-${theme}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    })
  })
}
