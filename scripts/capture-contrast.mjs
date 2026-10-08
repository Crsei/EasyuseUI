import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "@playwright/test"
const [sourceDir, output] = process.argv.slice(2)
if (!sourceDir || !output)
  throw new Error(
    "Usage: node scripts/capture-contrast.mjs <source-dir> <output.json>",
  )
const css = await readFile(path.join(sourceDir, "styles/theme.css"), "utf8")
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/google-chrome",
  args: ["--disable-dev-shm-usage"],
})
try {
  const page = await browser.newPage()
  await page.setContent(
    `<style>${css}</style><div id="fixture" style="background:var(--background);color:var(--text-muted);font-size:12px">Metadata</div>`,
  )
  const samples = []
  for (const theme of ["light", "dark"])
    for (const surface of ["background", "surface", "surface-raised"]) {
      const colors = await page.evaluate(
        ({ theme, surface }) => {
          document.documentElement.className = theme === "dark" ? "dark" : ""
          const fixture = document.getElementById("fixture")
          fixture.style.background = `var(--${surface})`
          const css = getComputedStyle(fixture)
          return { foreground: css.color, background: css.backgroundColor }
        },
        { theme, surface },
      )
      const channels = (value) => value.match(/[\d.]+/g).map(Number)
      const fg = channels(colors.foreground),
        bg = channels(colors.background),
        alpha = fg[3] ?? 1
      const composite = fg
        .slice(0, 3)
        .map((channel, i) => channel * alpha + bg[i] * (1 - alpha))
      const luminance = (rgb) =>
        rgb
          .map((value) => {
            const c = value / 255
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
          })
          .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
      const a = luminance(composite),
        b = luminance(bg),
        ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      samples.push({
        theme,
        surface,
        ...colors,
        composite,
        ratio,
        passesAA: ratio >= 4.5,
      })
    }
  const report = {
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    fontSize: 12,
    method:
      "Computed colors in Chromium from actual theme.css; alpha-composite text over each token surface, then WCAG relative luminance. AA normal text >=4.5:1. This token fixture does not replace page-level audits.",
    samples,
  }
  await writeFile(output, JSON.stringify(report, null, 2) + "\n")
  console.log(
    samples.map(({ theme, surface, ratio, passesAA }) => ({
      theme,
      surface,
      ratio,
      passesAA,
    })),
  )
} finally {
  await browser.close()
}
