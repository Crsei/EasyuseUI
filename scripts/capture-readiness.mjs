import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { createServer } from "node:net"
import path from "node:path"
import os from "node:os"
import { chromium } from "@playwright/test"
const [input, output, phase] = process.argv.slice(2)
if (!input || !output || !phase)
  throw new Error(
    "Usage: capture-readiness.mjs <built-snapshot> <report.json> before|after",
  )
const root = path.resolve(input),
  source = JSON.parse(
    await readFile(path.join(root, "source-snapshot.json"), "utf8"),
  )
const socket = createServer()
await new Promise((r) => socket.listen(0, "127.0.0.1", r))
const port = socket.address().port
await new Promise((r) => socket.close(r))
const server = spawn(
  process.execPath,
  [path.join(root, "scripts/preview.mjs")],
  { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "ignore" },
)
let browser
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/components/`)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
  if (!ready) throw new Error("Snapshot preview unavailable")
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      "/usr/bin/google-chrome",
    args: ["--disable-dev-shm-usage"],
  })
  const report = {
    phase,
    capturedAt: null,
    sourceSnapshotId: source.snapshotId,
    captureScriptHash: createHash("sha256")
      .update(await readFile(import.meta.filename))
      .digest("hex"),
    environment: {
      browser: browser.version(),
      node: process.version,
      os: os.type(),
      release: os.release(),
      viewport: { width: 1440, height: 1000 },
      locale: "zh-CN",
      theme: "light",
      sharedHost: true,
    },
    method:
      "Three fresh contexts per route. From navigation time origin to a real shared-header theme button click changing the document to dark, followed by two rAF opportunities. Up to 10 attempts with a 250ms observation window account for lost pre-hydration input; retries and click times are retained. Measures one usable shared control, not full-page TTI or compositor paint. Shared host load is uncontrolled.",
    samples: [],
  }
  for (const route of ["/components/", "/dictionary/", "/docs/button/"])
    for (let round = 0; round < 3; round++) {
      const page = await browser.newPage({
        viewport: report.environment.viewport,
        reducedMotion: "reduce",
      })
      await page.addInitScript(() => {
        localStorage.setItem("theme", "light")
        localStorage.setItem("easyuseui:locale", "zh-CN")
      })
      await page.goto(`http://127.0.0.1:${port}${route}`, {
        waitUntil: "domcontentloaded",
      })
      const attempts = []
      for (let attempt = 0; attempt < 10; attempt++) {
        attempts.push(await page.evaluate(() => performance.now()))
        await page
          .getByRole("button", { name: "切换深浅主题", exact: true })
          .click()
        try {
          await page.waitForFunction(
            () => document.documentElement.classList.contains("dark"),
            {},
            { timeout: 250 },
          )
          break
        } catch {
          if (attempt === 9) throw new Error("Theme control never responded")
        }
      }
      const usableMs = await page.evaluate(async () => {
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        )
        return performance.now()
      })
      report.samples.push({ route, round, usableMs, attempts })
      report.capturedAt = new Date().toISOString()
      await writeFile(output, JSON.stringify(report, null, 2) + "\n")
      console.log(
        `${phase} ${route} round ${round}: ${Math.round(usableMs)}ms, ${attempts.length} attempt(s)`,
      )
      await page.close()
    }
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
