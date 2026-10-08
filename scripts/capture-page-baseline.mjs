import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { gzipSync } from "node:zlib"
import { chromium } from "@playwright/test"

const [snapshotDir, outputDir, phase = "before"] = process.argv.slice(2)
if (!snapshotDir || !outputDir)
  throw new Error(
    "Usage: node scripts/capture-page-baseline.mjs <built-source-snapshot> <output-dir> [before|after]",
  )
await mkdir(outputDir, { recursive: true })
const source = JSON.parse(
  await readFile(path.join(snapshotDir, "source-snapshot.json"), "utf8"),
)
const port = await new Promise((resolve) => {
  const socket = createServer().listen(0, "127.0.0.1", () => {
    const address = socket.address()
    socket.close(() => resolve(address.port))
  })
})
const server = spawn(
  process.execPath,
  [path.join(snapshotDir, "scripts/preview.mjs")],
  {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  },
)
let browser
try {
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve)
    server.once("exit", (code) => reject(new Error(`Preview exited ${code}`)))
  })
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      "/usr/bin/google-chrome",
    args: ["--disable-dev-shm-usage"],
  })
  const samples = []
  for (const route of ["/components/", "/dictionary/", "/docs/button/"]) {
    for (let sample = 0; sample < 3; sample++) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        colorScheme: "light",
        reducedMotion: "reduce",
      })
      const page = await context.newPage()
      const scripts = new Map()
      const pending = []
      const responseFailures = []
      page.on("response", (response) => {
        if (new URL(response.url()).pathname.endsWith(".js"))
          pending.push(
            response
              .body()
              .then((bytes) =>
                scripts.set(new URL(response.url()).pathname, {
                  path: new URL(response.url()).pathname,
                  bytes: bytes.length,
                  gzipBytes: gzipSync(bytes).length,
                }),
              )
              .catch((error) => responseFailures.push(String(error))),
          )
      })
      const started = performance.now()
      await page.goto(`http://127.0.0.1:${port}${route}`)
      await page
        .getByRole("combobox", { name: "语言", exact: true })
        .first()
        .selectOption("en")
      await page.locator('html[lang="en"]').waitFor()
      const navigationToLanguageHandlerMs = performance.now() - started
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .first()
        .selectOption("zh-CN")
      await page.waitForLoadState("networkidle")
      page.removeAllListeners("response")
      await Promise.all(pending)
      if (responseFailures.length) throw new Error(responseFailures.join("; "))
      const mountedCanvas = await page.locator(".react-flow").count()
      const mountedDemos = await page
        .locator('[data-demo-mounted="true"]')
        .count()
      const legacyPreviewRegions = await page
        .locator("article > div:first-child")
        .count()
      const resources = [...scripts.values()]
      samples.push({
        route,
        sample,
        navigationToLanguageHandlerMs,
        mountedCanvas,
        mountedDemos,
        legacyPreviewRegions,
        jsBytes: resources.reduce((sum, item) => sum + item.bytes, 0),
        estimatedGzipJsBytes: resources.reduce(
          (sum, item) => sum + item.gzipBytes,
          0,
        ),
        resources,
      })
      if (sample === 0) {
        const slug = route.split("/").filter(Boolean).join("-")
        await page.screenshot({
          path: path.join(outputDir, `${phase}-${slug}-light.png`),
        })
        await page.evaluate(() =>
          document.documentElement.classList.add("dark"),
        )
        await page.screenshot({
          path: path.join(outputDir, `${phase}-${slug}-dark.png`),
        })
      }
      await context.close()
    }
  }
  const report = {
    schemaVersion: 1,
    phase,
    capturedAt: new Date().toISOString(),
    sourceSnapshotId: source.snapshotId,
    head: source.head,
    environment: {
      browser: browser.version(),
      os: os.type(),
      release: os.release(),
      arch: os.arch(),
      node: process.version,
      viewport: { width: 1440, height: 1000 },
      theme: "light",
      locale: "zh-CN",
      sharedHost: true,
    },
    method:
      "3 fresh browser contexts per route; confirm hydration by switching zh-CN -> en -> zh-CN. Capture JS responses after network idle. gzip bytes are computed estimates, not measured transport compression. Timing includes browser automation and is an observation, not TTI or a CI budget.",
    sampleCount: 3,
    samples,
  }
  await writeFile(
    path.join(outputDir, `${phase}.json`),
    JSON.stringify(report, null, 2) + "\n",
  )
  console.log(
    JSON.stringify(
      samples.map(
        ({
          route,
          sample,
          mountedCanvas,
          jsBytes,
          estimatedGzipJsBytes,
          navigationToLanguageHandlerMs,
        }) => ({
          route,
          sample,
          mountedCanvas,
          jsBytes,
          estimatedGzipJsBytes,
          navigationToLanguageHandlerMs,
        }),
      ),
      null,
      2,
    ),
  )
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
