import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { chromium } from "@playwright/test"
const project = path.resolve(import.meta.dirname, "..")
const buildRoot = path.resolve(process.argv[2] ?? project)
const evidence = path.resolve(
  process.argv[3] ?? path.join(buildRoot, "workbench-capture-evidence"),
)
const port = Number(process.env.PORT ?? 3017)
const origin = `http://127.0.0.1:${port}`
await mkdir(evidence, { recursive: true })
await mkdir(path.join(project, "public/site/scenes"), { recursive: true })
await mkdir(path.join(project, "public/blog/agent-workbench"), {
  recursive: true,
})
try {
  await fetch(origin, { signal: AbortSignal.timeout(800) })
  throw new Error(
    `Port ${port} is occupied; inspect its owner before capturing.`,
  )
} catch (error) {
  if (error.message.includes("occupied")) throw error
}
const server = spawn(process.execPath, ["scripts/preview.mjs"], {
  cwd: buildRoot,
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
})
let serverLog = ""
server.stdout.on("data", (chunk) => (serverLog += chunk))
server.stderr.on("data", (chunk) => (serverLog += chunk))
let browser
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(serverLog)
    try {
      const r = await fetch(origin, { signal: AbortSignal.timeout(800) })
      if (r.ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (!ready) throw new Error("Preview did not become ready")
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined),
    args: ["--disable-dev-shm-usage"],
  })
  const sourceFiles = [
    "lib/agent-workbench-model.ts",
    "components/blocks/agent-workbench.tsx",
    "components/blocks/chat-message.tsx",
    "components/blocks/chat-message.module.css",
    "components/blocks/workspace-shell.tsx",
    "components/blocks/workspace-shell.module.css",
    "styles/theme.css",
    ...[
      "navigation",
      "context",
      "conversation",
      "composer",
      "review",
      "panels",
    ].map((name) => `components/blocks/agent-workbench/${name}.tsx`),
    "components/blocks/agent-workbench/workbench.module.css",
    ...["fixtures", "reducer", "messages"].map(
      (name) => `components/examples/agent-workbench/${name}.ts`,
    ),
    "components/examples/agent-workbench/workbench-demo.tsx",
    "components/examples/agent-workbench/demo.module.css",
  ]
  const hashes = {}
  for (const file of sourceFiles)
    hashes[file] = createHash("sha256")
      .update(await readFile(path.join(buildRoot, file)))
      .digest("hex")
  const snapshot = createHash("sha256")
    .update(JSON.stringify(hashes))
    .digest("hex")
  const images = []
  // Existing Agent Board is the baseline composition for the reuse article.
  const baselineContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  })
  await baselineContext.addInitScript(() => {
    localStorage.setItem("theme", "light")
    localStorage.setItem("easyuseui-locale", "zh-CN")
  })
  const baselinePage = await baselineContext.newPage()
  await baselinePage.goto(`${origin}/workspace/agents/`)
  await baselinePage.evaluate(() => document.fonts.ready)
  await baselinePage.waitForLoadState("networkidle")
  await baselinePage.screenshot({
    path: path.join(project, "public/blog/agent-workbench/baseline-board.jpg"),
    type: "jpeg",
    quality: 82,
  })
  const baseline = {
    asset: "/blog/agent-workbench/baseline-board.jpg",
    url: `${origin}/workspace/agents/`,
    sourceSnapshotId: process.env.EASYUSEUI_BASELINE_VERSION,
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 900 },
    theme: "light",
    locale: "zh-CN",
    fixture: "Existing Agent Board fixture; unchanged baseline region sources",
  }
  if (!baseline.sourceSnapshotId)
    throw new Error(
      "Set EASYUSEUI_BASELINE_VERSION to the verified foundation commit",
    )
  await baselineContext.close()
  const templates = [
    {
      id: "agent-coding-workbench",
      template: "coding",
      page: "session",
      session: "session-filter",
    },
    {
      id: "agent-artifacts-workbench",
      template: "artifacts",
      page: "artifacts",
      session: "session-report",
    },
    {
      id: "agent-console-workbench",
      template: "console",
      page: "inbox",
      session: "session-report",
    },
  ]
  for (const scene of templates)
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 390, height: 844 },
    ])
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: theme,
          isMobile: viewport.name === "mobile",
          hasTouch: viewport.name === "mobile",
          reducedMotion: "reduce",
        })
        await context.addInitScript(
          ({ theme }) => {
            localStorage.setItem("theme", theme)
            localStorage.setItem("easyuseui-locale", "zh-CN")
          },
          { theme },
        )
        const page = await context.newPage()
        const errors = []
        page.on("pageerror", (error) => errors.push(error.message))
        const url = `${origin}/examples/agent-workbench/app/?template=${scene.template}&page=${scene.page}&session=${scene.session}`
        await page.goto(url)
        await page.getByText("本地交互示例", { exact: true }).waitFor()
        await page.waitForFunction(
          (theme) => document.documentElement.classList.contains(theme),
          theme,
        )
        await page.evaluate(() => document.fonts.ready)
        await page.waitForLoadState("networkidle")
        const fonts = await page.evaluate(() => ({
          status: document.fonts.status,
          body: getComputedStyle(document.body).fontFamily,
          faces: Array.from(document.fonts).map((f) => ({
            family: f.family,
            status: f.status,
          })),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        }))
        if (
          errors.length ||
          fonts.status !== "loaded" ||
          fonts.horizontalOverflow
        )
          throw new Error(JSON.stringify({ url, errors, fonts }))
        const name = `${scene.id}-${viewport.name}-${theme}.jpg`
        const asset = path.join(project, "public/site/scenes", name)
        await page.screenshot({
          path: asset,
          type: "jpeg",
          quality: 82,
          fullPage: false,
        })
        let blogAsset
        if (scene.template === "coding") {
          blogAsset = `/blog/agent-workbench/${viewport.name}-${theme}.jpg`
          await writeFile(
            path.join(project, "public", blogAsset),
            await readFile(asset),
          )
        }
        images.push({
          id: scene.id,
          template: scene.template,
          url,
          asset: `/site/scenes/${name}`,
          blogAsset,
          capturedAt: new Date().toISOString(),
          viewport: { width: viewport.width, height: viewport.height },
          theme,
          locale: "zh-CN",
          fixture: `initial fixture; ${scene.session}; ${scene.page}`,
          fonts,
          sourceSnapshotId: snapshot,
        })
        await context.close()
      }
  await writeFile(
    path.join(evidence, "captures.json"),
    JSON.stringify(
      { sourceSnapshotId: snapshot, sourceFiles: hashes, baseline, images },
      null,
      2,
    ) + "\n",
  )
  console.log(
    `Captured ${images.length} actual-route images after fonts loaded; source snapshot ${snapshot}`,
  )
} finally {
  await browser?.close()
  server.kill("SIGTERM")
  await writeFile(path.join(evidence, "preview.log"), serverLog)
}
