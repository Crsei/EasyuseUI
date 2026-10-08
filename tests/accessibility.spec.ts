import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
for (const route of [
  "/blog/",
  "/blog/on-demand-demos/",
  "/components/",
  "/workspace/layout/",
]) {
  for (const theme of ["light", "dark"] as const) {
    test(`AA automated scan: ${route} ${theme}`, async ({ page }) => {
      await page.goto(route)
      if (theme === "dark")
        await page.getByRole("button", { name: "切换深浅主题" }).click()
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
      expect(
        result.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          targets: nodes.map((node) => node.target),
        })),
      ).toEqual([])
    })
  }
}
