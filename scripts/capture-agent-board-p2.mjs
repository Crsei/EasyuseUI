import assert from "node:assert/strict"
import { chromium } from "@playwright/test"
import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
const root = path.resolve(import.meta.dirname, "..")
const output = path.join(root, "public/blog/agent-board/p2")
await mkdir(output, { recursive: true })
const registry = JSON.parse(
  await readFile(path.join(root, "registry.json"), "utf8"),
)
const byName = new Map(registry.items.map((item) => [item.name, item]))
const closure = new Set()
function include(name) {
  if (closure.has(name)) return
  closure.add(name)
  for (const dependency of byName.get(name)?.registryDependencies ?? [])
    include(dependency)
}
include("agent-board-workspace")
const files = [
  ...new Set(
    [...closure]
      .flatMap((name) => byName.get(name)?.files.map((file) => file.path) ?? [])
      .concat([
        "styles/theme.css",
        "registry.json",
        "lib/component-manifest.ts",
        "components/docs/demo-loader.tsx",
        "scripts/agent-board-consumer.mjs",
        "package.json",
        "pnpm-lock.yaml",
        "app/workspace/agents/page.tsx",
        "app/workspace/agents/scale/page.tsx",
        "components/site/site-frame.tsx",
        "components/site/site-i18n-provider.tsx",
        "lib/site-i18n-messages.ts",
        ...[
          "fixtures.ts",
          "use-agent-board-example.ts",
          "agent-board-demo.tsx",
          "p2-fixtures.ts",
          "scale-demo.tsx",
          "p2-demos.tsx",
        ].map((name) => "components/examples/agent-board/" + name),
        "tests/agent-board-p2.spec.ts",
        "tests/agent-board.spec.ts",
        "scripts/capture-agent-board-p2.mjs",
      ]),
  ),
].sort()
const hashes = await Promise.all(
  files.map(async (file) => ({
    file,
    sha256: createHash("sha256")
      .update(await readFile(path.join(root, file)))
      .digest("hex"),
  })),
)
const sourceSnapshotId = createHash("sha256")
  .update(JSON.stringify(hashes))
  .digest("hex")
const port = process.env.AGENT_BOARD_P2_CAPTURE_PORT || "3028"
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ["scripts/preview.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "inherit"],
})
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve)
  server.once("error", reject)
  server.once("exit", (code) => reject(Error(`Preview exited ${code}`)))
})
let browser
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: existsSync("/usr/bin/google-chrome")
      ? "/usr/bin/google-chrome"
      : undefined,
    args: ["--disable-dev-shm-usage"],
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const captures = []
  async function settle() {
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    )
  }
  async function capture(name, route, setup) {
    await page.goto(origin + route)
    await page.getByLabel("搜索运行", { exact: true }).waitFor()
    if (setup) await setup()
    await settle()
    const file = name + ".png"
    await page.screenshot({ path: path.join(output, file) })
    captures.push({
      name,
      file: `/blog/agent-board/p2/${file}`,
      sha256: createHash("sha256")
        .update(await readFile(path.join(output, file)))
        .digest("hex"),
      viewport: page.viewportSize(),
      theme: await page
        .locator("html")
        .evaluate((element) =>
          element.classList.contains("dark") ? "dark" : "light",
        ),
      locale: await page.locator("html").getAttribute("lang"),
      fixture:
        name.startsWith("virtual") || name.startsWith("native")
          ? "local-1000-source-runs-v1"
          : "local-timestamped-dependencies-v1",
      capturedAt: new Date().toISOString(),
      sourceSnapshotId,
    })
  }
  await capture(
    "dependencies-1440",
    "/workspace/agents/?view=dependencies",
    () => page.locator(".react-flow [data-canvas-node]").first().waitFor(),
  )
  await capture("history-tokens-1440", "/workspace/agents/?view=insights", () =>
    page.locator("[data-agent-history]").scrollIntoViewIfNeeded(),
  )
  await capture(
    "history-cost-1440",
    "/workspace/agents/?view=insights",
    async () => {
      const history = page.locator("[data-agent-history]")
      await history.getByRole("radio", { name: "费用", exact: true }).click()
      await history.scrollIntoViewIfNeeded()
    },
  )
  await capture("virtual-1440", "/workspace/agents/scale/?mode=virtual", () =>
    page.locator("[data-agent-virtual-list]").waitFor(),
  )
  await capture("native-1440", "/workspace/agents/scale/?mode=native", () =>
    page.waitForFunction(
      () => document.querySelectorAll("[data-run-id]").length === 1000,
    ),
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await capture(
    "dependencies-390",
    "/workspace/agents/?view=dependencies",
    () => page.locator(".react-flow [data-canvas-node]").first().waitFor(),
  )
  await capture(
    "virtual-390",
    "/workspace/agents/scale/?mode=virtual",
    async () => {
      const viewport = page.getByRole("region", {
        name: "虚拟运行列表",
        exact: true,
      })
      await viewport.focus()
      await page.keyboard.press("End")
    },
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await capture(
    "dark-history-en",
    "/workspace/agents/?view=insights",
    async () => {
      await page.getByRole("button", { name: "Language", exact: true }).click()
      await page.getByRole("button", { name: "Theme", exact: true }).click()
      await page.locator("[data-agent-history]").scrollIntoViewIfNeeded()
    },
  )
  await context.close()
  const samples = []
  for (const mode of ["native", "virtual"])
    for (let sample = 0; sample < 3; sample++) {
      const measurement = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
        colorScheme: "light",
      })
      const target = await measurement.newPage()
      await target.goto(`${origin}/workspace/agents/scale/?mode=${mode}`)
      if (mode === "native")
        await target.waitForFunction(
          () => document.querySelectorAll("[data-run-id]").length === 1000,
        )
      else await target.locator("[data-agent-virtual-list]").waitFor()
      await target.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      const mountedRows = await target.locator("[data-run-id]").count()
      const firstRow = target.locator('[data-run-id="bulk-0001"] button')
      const rowHeight = await firstRow.evaluate(
        (element) => element.getBoundingClientRect().height,
      )
      await firstRow.click()
      await target.locator('[data-agent-inspector="bulk-0001"]').waitFor()
      const activations = 1
      samples.push({
        mode,
        sample: sample + 1,
        mountedRows,
        rowHeight,
        activations,
        viewport: { width: 1440, height: 1000 },
        loadedCount: 1000,
        sourceSnapshotId,
      })
      assert.equal(
        mode === "native" ? mountedRows === 1000 : mountedRows < 30,
        true,
      )
      await measurement.close()
    }
  const median = (values) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  const contextId = `${sourceSnapshotId}:1000-waiting-source-runs:1440x1000:list-viewport-560:zh-CN:light:reduced-motion`
  const measurements = {
    sourceSnapshotId,
    capturedAt: new Date().toISOString(),
    command: "node scripts/capture-agent-board-p2.mjs",
    environment:
      "Chrome via Playwright, static Next.js Webpack export, 1440x1000, zh-CN/light/reduced motion",
    fixture: "local-1000-source-runs-v1",
    sampleCount: 3,
    samples,
    contextId,
    results: {
      mountedRows: {
        before: median(
          samples.filter((s) => s.mode === "native").map((s) => s.mountedRows),
        ),
        after: median(
          samples.filter((s) => s.mode === "virtual").map((s) => s.mountedRows),
        ),
      },
      openFirstDetailActivations: { before: 1, after: 1 },
    },
    limitations: [
      "Before/after compare native and virtual rendering of the same 1000 source snapshots, groups and AgentRunRow component in this snapshot.",
      "This measures mounted run rows and one fixed activation path, not latency, memory, server performance, real Agent execution or user acceptance.",
      "All observations and dependencies are deterministic local fixtures.",
    ],
  }
  await writeFile(
    path.join(output, "captures.json"),
    JSON.stringify({ sourceSnapshotId, files: hashes, captures }, null, 2) +
      "\n",
  )
  await writeFile(
    path.join(output, "measurements.json"),
    JSON.stringify(measurements, null, 2) + "\n",
  )
  console.log(
    JSON.stringify({
      captures: captures.length,
      sourceSnapshotId,
      results: measurements.results,
      samples: samples.length,
    }),
  )
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
