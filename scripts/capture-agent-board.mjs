import { chromium } from "@playwright/test"
import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
const root = path.resolve(import.meta.dirname, "..")
const output = path.join(root, "public/blog/agent-board")
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
for (const name of ["agent-board-workspace", "item-board", "grouped-list"])
  include(name)
const files = [
  ...new Set([
    ...[...closure].flatMap(
      (name) => byName.get(name)?.files.map((file) => file.path) ?? [],
    ),
    "styles/theme.css",
    "package.json",
    "pnpm-lock.yaml",
    "app/workspace/agents/page.tsx",
    "components/site/site-frame.tsx",
    "components/site/site-i18n-provider.tsx",
    "lib/site-i18n-messages.ts",
    "components/examples/agent-board/fixtures.ts",
    "components/examples/agent-board/use-agent-board-example.ts",
    "components/examples/agent-board/agent-board-demo.tsx",
    "tests/agent-board.spec.ts",
  ]),
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
const port = process.env.AGENT_BOARD_CAPTURE_PORT || "3028"
const server = spawn(process.execPath, ["scripts/preview.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "inherit"],
})
await new Promise((resolve, reject) => {
  server.stdout.on("data", () => resolve())
  server.once("error", reject)
  server.once("exit", (code) => reject(new Error(`Preview exited ${code}`)))
})
const browser = await chromium
  .launch({
    headless: true,
    executablePath: existsSync("/usr/bin/google-chrome")
      ? "/usr/bin/google-chrome"
      : undefined,
    args: ["--disable-dev-shm-usage"],
  })
  .catch((error) => {
    server.kill("SIGTERM")
    throw error
  })
const captures = []
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const origin = `http://127.0.0.1:${port}`
  async function capture(name, query = "", setup) {
    await page.goto(`${origin}/workspace/agents/${query}`)
    await page.getByLabel("搜索运行", { exact: true }).waitFor()
    if (setup) await setup()
    await page.screenshot({ path: path.join(output, name + ".png") })
    captures.push({
      name,
      file: `/blog/agent-board/${name}.png`,
      viewport: page.viewportSize(),
      theme: await page
        .locator("html")
        .evaluate((el) => (el.classList.contains("dark") ? "dark" : "light")),
      locale: await page.locator("html").getAttribute("lang"),
      fixture: "local-deterministic-v1",
      capturedAt: new Date().toISOString(),
      sourceSnapshotId,
    })
  }
  await capture("board-1440")
  await capture("list-1440", "?view=list")
  await capture("inbox-1440", "?view=inbox")
  await capture("overview-1440", "?run=run-5")
  await capture("trace-1440", "?run=run-5", async () => {
    await page.getByRole("radio", { name: "执行", exact: true }).click()
    await page.getByRole("treeitem").first().focus()
    await page.keyboard.press("ArrowRight")
    await page.getByRole("treeitem", { name: "写入报告", exact: true }).click()
  })
  await capture("artifacts-1440", "?run=run-8", () =>
    page.getByRole("radio", { name: "产物", exact: true }).click(),
  )
  await capture("insights-1440", "?view=insights")
  await capture("unknown-1440", "?run=run-5", async () => {
    await page.locator("[data-example-controls] summary").click()
    await page.getByLabel("切换场景", { exact: true }).selectOption("unknown")
    await page.getByRole("button", { name: "批准", exact: true }).click()
    await page
      .getByText("结果待确认；先核对再操作。", { exact: true })
      .waitFor()
  })
  await capture("refresh-error-1440", "", async () => {
    await page.locator("[data-example-controls] summary").click()
    await page.getByLabel("切换场景", { exact: true }).selectOption("error")
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await capture("list-390", "?view=list")
  await capture("detail-390", "?view=list&run=run-6")
  await page.setViewportSize({ width: 1440, height: 1000 })
  await capture("dark-en-1440", "?view=list", async () => {
    await page.getByRole("button", { name: "Language", exact: true }).click()
    await page.getByRole("button", { name: "Theme", exact: true }).click()
  })
  await writeFile(
    path.join(output, "captures.json"),
    JSON.stringify({ sourceSnapshotId, files: hashes, captures }, null, 2) +
      "\n",
  )
  console.log(
    `Captured ${captures.length} Agent views. Source snapshot: ${sourceSnapshotId}`,
  )
} finally {
  await browser.close()
  server.kill("SIGTERM")
}
