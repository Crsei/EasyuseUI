import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createServer } from "node:net"
import path from "node:path"
import os from "node:os"
import { createHash } from "node:crypto"
import { chromium } from "@playwright/test"
const [snapshotArgument, output, phase = "after"] = process.argv.slice(2)
if (!snapshotArgument || !output)
  throw new Error(
    "Usage: capture-stream-baseline.mjs <snapshot> <output.json> before|after",
  )
const snapshot = path.resolve(snapshotArgument)
const source = JSON.parse(
  await readFile(path.join(snapshot, "source-snapshot.json"), "utf8"),
)
const captureScriptHash = createHash("sha256")
  .update(await readFile(import.meta.filename))
  .digest("hex")
const fixtureHash = createHash("sha256")
  .update(
    await readFile(
      path.join(snapshot, "components/examples/stream-performance-demo.tsx"),
    ),
  )
  .digest("hex")
const portServer = createServer()
await new Promise((resolve) => portServer.listen(0, "127.0.0.1", resolve))
const port = portServer.address().port
await new Promise((resolve) => portServer.close(resolve))
const server = spawn(
  process.execPath,
  [path.join(snapshot, "scripts/preview.mjs")],
  {
    cwd: snapshot,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  },
)
let browser
try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/benchmarks/streams/`)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (!ready) throw new Error("Isolated snapshot preview did not become ready")
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined),
    args: ["--disable-dev-shm-usage"],
  })
  const samples = []
  const writeReport = async () =>
    writeFile(
      output,
      JSON.stringify(
        {
          schemaVersion: 2,
          phase,
          capturedAt: new Date().toISOString(),
          sourceSnapshotId: source.snapshotId,
          fixtureHash,
          captureScriptHash,
          environment: {
            browser: browser.version(),
            os: os.type(),
            release: os.release(),
            node: process.version,
            viewport: { width: 1440, height: 1000 },
            theme: "light",
            locale: "zh-CN",
            sharedHost: true,
          },
          method:
            "3 fresh pages/count/component, 30 samples each append/history update/prepend unless scenarios-only; start before flushSync and end after two rAF opportunities. Keyboard Home establishes a reading position before long content is revealed in two passes and Activity details expanded; 30 same-frame append commits are separately measured. Full DOM before; explicit revision and optional CSS deferral after. Heap without forced GC; not proof of compositor paint, real-time transport or stable CI.",
          scenariosOnly: process.env.STREAM_SCENARIOS_ONLY === "1",
          counts: process.env.STREAM_COUNTS || "1000,5000,10000",
          samples,
        },
        null,
        2,
      ) + "\n",
    )
  for (const kind of ["conversation", "activity"]) {
    for (const count of process.env.STREAM_COUNTS?.split(",").map(Number) ?? [
      1000, 5000, 10000,
    ]) {
      for (let round = 0; round < 3; round++) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 1000 },
          reducedMotion: "reduce",
        })
        page.setDefaultTimeout(120000)
        await page.goto(`http://127.0.0.1:${port}/benchmarks/streams/`)
        await page.waitForFunction(() => !!window.streamFixture)
        const result = await page
          .evaluate(
            async ({ kind, count, phase, scenariosOnly }) => {
              const paint = () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                )
              const start = performance.now()
              window.streamFixture.configure(count, kind, phase === "after")
              await paint()
              const mountMs = performance.now() - start
              const measurements = []
              window.streamCaptureSample = { mountMs, measurements }
              for (const operation of scenariosOnly
                ? []
                : ["append", "update", "prepend"]) {
                for (let index = 0; index < 30; index++) {
                  const start = performance.now()
                  window.streamFixture.update(operation, index)
                  await paint()
                  measurements.push({
                    operation,
                    index,
                    ms: performance.now() - start,
                  })
                }
              }
              window.streamCaptureSample = { mountMs, measurements }
              return { mountMs, measurements }
            },
            {
              kind,
              count,
              phase,
              scenariosOnly: process.env.STREAM_SCENARIOS_ONLY === "1",
            },
          )
          .catch(async (error) => {
            const partial = await page
              .evaluate(() => window.streamCaptureSample ?? null)
              .catch(() => null)
            samples.push({
              kind,
              count,
              round,
              ...(partial ?? {}),
              measurementError: error.message,
            })
            await writeReport()
            throw error
          })
        // Move to a reading position through the real keyboard before expanding.
        // An immediate scrollIntoView after a following update races the tail observer.
        const history = page.locator(
          kind === "activity"
            ? '[aria-label="Activity 时间线"]'
            : '[aria-label="对话记录"]',
        )
        await history.focus()
        await page.keyboard.press("Control+Home")
        await page.waitForFunction((kind) => {
          const history = document.querySelector(
            kind === "activity"
              ? '[aria-label="Activity 时间线"]'
              : '[aria-label="对话记录"]',
          )
          return !!history && history.scrollTop === 0
        }, kind)
        const scenario = await page
          .evaluate(
            async ({ kind }) => {
              const paint = () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                )
              const longStart = performance.now()
              window.streamFixture.update("long", 0)
              const longRecord = document.querySelectorAll(
                kind === "activity" ? "[data-event-id]" : "[data-message-id]",
              )[2]
              if (kind === "activity")
                longRecord
                  ?.querySelector('button[aria-expanded="false"]')
                  ?.click()
              // Reveal the beginning, then allow intrinsic sizes and anchors to settle.
              longRecord?.scrollIntoView({ block: "start" })
              await paint()
              longRecord?.scrollIntoView({ block: "start" })
              await paint()
              const longContentMs = performance.now() - longStart
              const expanded =
                kind === "activity"
                  ? !!longRecord?.querySelector('button[aria-expanded="true"]')
                  : longRecord?.textContent.includes("Long content line")
              const bounds = longRecord?.getBoundingClientRect()
              const longVisible =
                !!bounds && bounds.bottom > 0 && bounds.top < innerHeight
              if (!expanded || !longVisible)
                throw new Error(
                  "Long fixture did not become visible and expanded",
                )
              const burstStart = performance.now()
              for (let index = 0; index < 30; index++)
                window.streamFixture.update("append", index + 300)
              await paint()
              return {
                deferred: !!document.querySelector("[data-defer-offscreen]"),
                longContentMs,
                expanded,
                longVisible,
                burst30CommitsMs: performance.now() - burstStart,
                renderedRecords: document.querySelectorAll(
                  "[data-event-id], [data-message-id]",
                ).length,
                heapBytes: performance.memory?.usedJSHeapSize ?? null,
              }
            },
            { kind },
          )
          .catch(async (error) => {
            samples.push({
              kind,
              count,
              round,
              ...result,
              scenarioError: error.message,
            })
            await writeReport()
            throw error
          })
        samples.push({ kind, count, round, ...result, ...scenario })
        await writeReport()
        console.log(
          `${phase} ${kind} ${count} round ${round}: mount ${Math.round(result.mountMs)}ms`,
        )
        await page.close()
      }
    }
  }
  await writeReport()
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
