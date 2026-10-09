// Run against the frozen reference copy, never the formal reference checkout.
import { chromium } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
const origin = process.env.CRM_REFERENCE_ORIGIN ?? "http://127.0.0.1:33210"
const directory = "public/blog/sales-crm/reference"
await mkdir(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/google-chrome",
  args: ["--disable-dev-shm-usage"],
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: "en-US",
  timezoneId: "UTC",
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
  colorScheme: "dark",
})
const page = await context.newPage()
page.setDefaultTimeout(8000)
const captures = []
const reset = () => page.goto(origin, { waitUntil: "networkidle" })
async function capture(name, steps, action) {
  await reset()
  try {
    if (action) await action()
    // The source uses JavaScript spring animations, unaffected by screenshot CSS animation disabling.
    await page.waitForTimeout(650)
    await page.screenshot({
      path: `${directory}/${name}.png`,
      animations: "disabled",
    })
    captures.push({
      name,
      steps,
      viewport: page.viewportSize(),
      geometry: await page
        .locator("aside, header, thead tr, tbody tr:first-child, [role=dialog]")
        .evaluateAll((els) =>
          els.map((e) => ({
            tag: e.tagName,
            role: e.getAttribute("role"),
            rect: JSON.parse(JSON.stringify(e.getBoundingClientRect())),
          })),
        ),
    })
  } catch (error) {
    captures.push({ name, steps, error: String(error) })
  }
}
await capture(
  "default-1440",
  "Fresh Companies route; initial Microsoft selection",
)
const environment = await page.evaluate(() => ({
  font: getComputedStyle(document.body).fontFamily,
  dpr: devicePixelRatio,
  locale: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}))
await page.setViewportSize({ width: 1920, height: 1080 })
await capture("default-1920", "Fresh Companies route")
await page.setViewportSize({ width: 1440, height: 1000 })
await capture(
  "selection",
  "Click Apple row checkbox (Microsoft remains selected)",
  async () => {
    await page
      .getByRole("checkbox", { name: "Select Apple", exact: true })
      .check()
  },
)
await capture("filters", "Open All Owners", () =>
  page.getByRole("button", { name: /All Owners/ }).click(),
)
await capture("detail", "Open Apple", () =>
  page.getByText("Apple", { exact: true }).first().click(),
)
await capture("profile", "Open current user profile", () =>
  page.getByRole("button", { name: "Open profile for Jensen Ackles" }).click(),
)
await capture("new-company", "Open New Company", () =>
  page.getByRole("button", { name: "New Company", exact: true }).click(),
)
await capture("notifications", "Open notifications", () =>
  page
    .getByRole("button", { name: /Notifications/ })
    .first()
    .click(),
)
await capture("search", "Open Search", () =>
  page.getByRole("button", { name: "Search", exact: true }).click(),
)
await page.setViewportSize({ width: 390, height: 844 })
await capture("default-390", "Fresh mobile Companies route")
await capture("mobile-navigation", "Open navigation", () =>
  page.getByRole("button", { name: "Open navigation" }).click(),
)
await capture("mobile-filters", "Open filters", () =>
  page
    .getByRole("button", { name: /Open filters|Filters/ })
    .first()
    .click(),
)
await writeFile(
  `${directory}/environment.json`,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      browser: browser.version(),
      ...environment,
      zoom: 1,
      theme: "dark",
      fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
      sourceSnapshotId:
        "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
      captures,
    },
    null,
    2,
  ) + "\n",
)
await browser.close()
console.log(
  captures.map(({ name, error }) => ({
    name,
    status: error ? error : "captured",
  })),
)
if (captures.some((c) => c.error)) process.exitCode = 1
