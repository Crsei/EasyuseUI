import { chromium } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
const root = path.resolve(import.meta.dirname, "..")
// Hash the exact source served by an isolated build when the shared tree has parallel work.
const sourceRoot = process.env.CRM_SOURCE_ROOT
  ? path.resolve(process.env.CRM_SOURCE_ROOT)
  : root
const origin = process.env.CRM_REPLICA_ORIGIN ?? "http://127.0.0.1:33212"
const directory = path.join(root, "public/blog/sales-crm/replica")
await mkdir(directory, { recursive: true })
// UI source scope excludes reports/articles/images to avoid self-referential hashes.
const sourceNames =
  sourceRoot === root
    ? execFileSync(
        "git",
        ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        { cwd: root },
      )
        .toString()
        .split("\0")
    : Object.keys(
        JSON.parse(
          await readFile(path.join(sourceRoot, "source-snapshot.json"), "utf8"),
        ).files,
      )
const names = sourceNames
  .filter((name) =>
    /^(components\/(ui|blocks|examples\/sales-crm)\/|app\/examples\/sales-crm\/|styles\/|lib\/(i18n-|runtime-status|use-|utils|site-crm-messages)|components\/site\/(site-frame|site-i18n-provider)|app\/(globals.css|layout.tsx)|package.json|pnpm-lock.yaml|next.config.ts|tests\/sales-crm.spec.ts)/.test(
      name,
    ),
  )
  .sort()
const files = {}
for (const name of names)
  files[name] = createHash("sha256")
    .update(await readFile(path.join(sourceRoot, name)))
    .digest("hex")
const sourceSnapshotId = createHash("sha256")
  .update(JSON.stringify(files))
  .digest("hex")
await writeFile(
  path.join(directory, "source-scope.json"),
  JSON.stringify(
    {
      sourceSnapshotId,
      scope:
        "CRM implementation, reused primitives/blocks, shared tokens/i18n, site boundaries, layout/config and CRM tests; excludes article/report/image files",
      files,
    },
    null,
    2,
  ) + "\n",
)
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
await context.addInitScript({
  content: "localStorage.setItem('easyuseui-locale','en')",
})
const page = await context.newPage()
page.setDefaultTimeout(10000)
const captures = [],
  errors = []
page.on("pageerror", (error) => errors.push(error.message))
const reset = async () => {
  await page.goto(origin + "/examples/sales-crm/", { waitUntil: "networkidle" })
  await page.locator('[data-locale="en"]').waitFor()
}
async function capture(name, steps, action) {
  await reset()
  if (action) await action()
  await page.screenshot({
    path: `${directory}/${name}.png`,
    animations: "disabled",
  })
  captures.push({
    name,
    steps,
    viewport: page.viewportSize(),
    geometry: await page
      .locator(
        "[data-sales-crm] header, [data-sales-crm] aside, thead, tbody tr:first-child, [role=dialog]",
      )
      .evaluateAll((els) =>
        els.map((e) => ({
          tag: e.tagName,
          role: e.getAttribute("role"),
          rect: JSON.parse(JSON.stringify(e.getBoundingClientRect())),
        })),
      ),
  })
}
await capture("default-1440", "Fresh route; Microsoft selected")
const environment = await page.evaluate(() => ({
  font: getComputedStyle(document.body).fontFamily,
  dpr: devicePixelRatio,
  locale: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}))
await page.setViewportSize({ width: 1920, height: 1080 })
await capture("default-1920", "Fresh route")
await page.setViewportSize({ width: 1440, height: 1000 })
await capture("selection", "Select Apple; Microsoft remains selected", () =>
  page.getByRole("checkbox", { name: "Select Apple", exact: true }).check(),
)
await capture("filters", "Open owner select", () =>
  page.getByRole("combobox", { name: "Account Owner", exact: true }).click(),
)
await capture("detail", "Open Apple", () =>
  page.getByRole("button", { name: "View Apple", exact: true }).click(),
)
await capture("profile", "Open current user profile", () =>
  page
    .getByRole("button", {
      name: "Open profile for Jensen Ackles",
      exact: true,
    })
    .click(),
)
await capture("new-company", "Open New Company", () =>
  page.getByRole("button", { name: "New Company", exact: true }).click(),
)
await capture("notifications", "Open notifications", () =>
  page
    .getByRole("button", { name: "Notifications, 3 unread", exact: true })
    .click(),
)
await capture("search", "Open Search", () =>
  page.getByRole("button", { name: "Search", exact: true }).click(),
)
await page.setViewportSize({ width: 1024, height: 844 })
await capture("default-1024", "Desktop sidebar threshold")
await page.setViewportSize({ width: 390, height: 844 })
await capture("default-390", "Fresh mobile route")
await capture("mobile-navigation", "Open navigation", () =>
  page.getByRole("button", { name: "Open navigation", exact: true }).click(),
)
await capture("mobile-filters", "Open bottom filters", () =>
  page.getByRole("button", { name: "Filters", exact: true }).click(),
)
await writeFile(
  path.join(directory, "environment.json"),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      browser: browser.version(),
      ...environment,
      zoom: 1,
      theme: "dark",
      fixture:
        "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
      sourceSnapshotId,
      captures,
      errors,
    },
    null,
    2,
  ) + "\n",
)
await browser.close()
console.log({ sourceSnapshotId, captures: captures.length, errors })
if (errors.length) process.exitCode = 1
