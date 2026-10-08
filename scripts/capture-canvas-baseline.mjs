import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:net"
import { createHash } from "node:crypto"
import os from "node:os"
import path from "node:path"
import { chromium } from "@playwright/test"

const [snapshot, output, phase = "after"] = process.argv.slice(2)
if (!snapshot || !output)
  throw new Error(
    "Usage: capture-canvas-baseline.mjs <built snapshot> <report.json> before|after",
  )
const source = JSON.parse(
  await readFile(path.join(snapshot, "source-snapshot.json"), "utf8"),
)
const hashes = {}
for (const file of [
  "components/blocks/workflow-canvas.tsx",
  "components/blocks/canvas-workspace.tsx",
  "components/examples/canvas-fixtures.tsx",
  "components/examples/canvas-workspace-demo.tsx",
  "app/benchmarks/canvas/[size]/page.tsx",
])
  hashes[file] = createHash("sha256")
    .update(await readFile(path.join(snapshot, file)))
    .digest("hex")
const listener = createServer()
await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve))
const port = listener.address().port
await new Promise((resolve) => listener.close(resolve))
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
const resume =
  process.env.CANVAS_RESUME === "1"
    ? JSON.parse(await readFile(output, "utf8"))
    : null
const samples = resume?.samples ?? []
const report = {
  schemaVersion: 1,
  phase,
  capturedAt: resume?.capturedAt ?? new Date().toISOString(),
  sourceSnapshotId: source.snapshotId,
  hashes,
  command: `node scripts/capture-canvas-baseline.mjs <built-snapshot> <report.json> ${phase}`,
  environment: {
    browser: null,
    os: os.type(),
    release: os.release(),
    node: process.version,
    viewport: { width: 1440, height: 1000 },
    theme: "light",
    locale: "zh-CN",
    sharedHost: true,
  },
  fixture:
    "condition nodes in 8 columns, directed chain plus forward half-graph branches; E=1.5N-2; no service calls",
  method:
    "3 fresh pages per size; cold navigation through engine measurements and first usable Inspector; 30 selection-to-Inspector samples ending after two rAF opportunities; 60 actual pointer moves plus committed screen position and revision change. rAF gaps and Long Tasks are observations, not compositor proof. Heap without forced GC. Each round is saved before the next starts.",
  samples,
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/benchmarks/canvas/50/`)).ok)
        break
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      "/usr/bin/google-chrome",
    args: ["--disable-dev-shm-usage"],
  })
  report.environment.browser = browser.version()
  for (const count of process.env.CANVAS_COUNTS?.split(",").map(Number) ?? [
    50, 200, 500, 1000,
  ])
    for (let round = 0; round < 3; round++) {
      const page = await browser.newPage({
        viewport: report.environment.viewport,
        colorScheme: "light",
        reducedMotion: "reduce",
      })
      page.setDefaultTimeout(120000)
      await page.addInitScript(() => {
        window.canvasLongTasks = []
        new PerformanceObserver((list) =>
          window.canvasLongTasks.push(
            ...list
              .getEntries()
              .map(({ startTime, duration }) => ({ startTime, duration })),
          ),
        ).observe({ type: "longtask", buffered: true })
      })
      await page.goto(`http://127.0.0.1:${port}/benchmarks/canvas/${count}/`)
      await page.locator('[data-canvas-ready="true"]').waitFor()
      await page.evaluate(() =>
        document.querySelector('button[aria-label="定位 节点 1"]').click(),
      )
      await page.locator('[data-inspector-object="node-0"]').waitFor()
      const coldOperableMs = await page.evaluate(() => performance.now())
      const selections = await page.evaluate(async (count) => {
        const times = []
        for (let i = 0; i < 30; i++) {
          const index = (i * 37 + 1) % count
          const button = document.querySelector(
            `button[aria-label="定位 节点 ${index + 1}"]`,
          )
          const start = performance.now()
          button.click()
          while (
            !document.querySelector(`[data-inspector-object="node-${index}"]`)
          )
            await new Promise(requestAnimationFrame)
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          )
          times.push(performance.now() - start)
        }
        return times
      }, count)
      await page.evaluate(() =>
        document.querySelector('button[aria-label="定位 节点 1"]').click(),
      )
      const node = page.locator('.react-flow__node[data-id="node-0"]')
      await node.waitFor({ state: "visible" })
      // Locate uses a zero-duration center; allow two frame opportunities before coordinates.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const before = await node.boundingBox()
      const revisionBefore = await page
        .locator("[data-canvas-workspace]")
        .getAttribute("data-revision")
      await page.evaluate(() => {
        window.canvasFrames = []
        window.canvasRecording = true
        const collect = (time) => {
          window.canvasFrames.push(time)
          if (window.canvasRecording) requestAnimationFrame(collect)
        }
        requestAnimationFrame(collect)
      })
      await page.mouse.move(before.x + 80, before.y + 20)
      await page.mouse.down()
      for (let step = 1; step <= 60; step++)
        await page.mouse.move(
          before.x + 80 + step * 2,
          before.y + 20 + step / 4,
        )
      const during = await node.boundingBox()
      await page.mouse.up()
      if (count <= 500)
        await page.waitForFunction(
          (revision) =>
            document.querySelector("[data-canvas-workspace]").dataset
              .revision !== revision,
          revisionBefore,
        )
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const after = await node.boundingBox()
      const details = await page.evaluate(() => {
        window.canvasRecording = false
        return {
          frames: window.canvasFrames,
          longTasks: window.canvasLongTasks,
          heapBytes: performance.memory?.usedJSHeapSize ?? null,
        }
      })
      if (Math.abs(during.x - before.x) < 20)
        throw new Error(`Drag did not move node at ${count}`)
      const gaps = details.frames
        .slice(1)
        .map((time, index) => time - details.frames[index])
      samples.push({
        count,
        edges: count * 1.5 - 2,
        round,
        coldOperableMs,
        selectionsMs: selections,
        drag: {
          ...details,
          gapsMs: gaps,
          screenDelta: { x: during.x - before.x, y: during.y - before.y },
          committedDelta: { x: after.x - before.x, y: after.y - before.y },
          capacityBoundary:
            count > 500
              ? "Render/selection/transient drag only: the existing 500-node/1000-edge command/import limits reject this commit."
              : null,
          revisionBefore,
          revisionAfter: await page
            .locator("[data-canvas-workspace]")
            .getAttribute("data-revision"),
        },
      })
      await writeFile(output, JSON.stringify(report, null, 2) + "\n")
      console.log(
        `${phase} ${count}/${count * 1.5 - 2} round ${round}: cold ${Math.round(coldOperableMs)}ms`,
      )
      if (round === 0)
        await page.screenshot({
          path: output.replace(/\.json$/, `-${count}.png`),
          fullPage: true,
        })
      await page.close()
    }
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
