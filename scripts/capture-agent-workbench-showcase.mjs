import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { chromium } from "@playwright/test"
const project = path.resolve(import.meta.dirname, "..")
const buildRoot = path.resolve(process.argv[2] ?? project)
const evidence = path.resolve(
  process.argv[3] ?? path.join(buildRoot, "showcase-captures"),
)
const port = Number(process.env.PORT ?? 3018)
const origin = `http://127.0.0.1:${port}`
await mkdir(evidence, { recursive: true })
await mkdir(path.join(project, "public/blog/agent-workbench-showcase"), {
  recursive: true,
})
try {
  await fetch(origin, { signal: AbortSignal.timeout(800) })
  throw new Error(`Port ${port} is occupied; inspect its owner.`)
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
      if ((await fetch(origin, { signal: AbortSignal.timeout(800) })).ok) {
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
    ].map((n) => `components/blocks/agent-workbench/${n}.tsx`),
    "components/blocks/agent-workbench/workbench.module.css",
    ...["fixtures", "reducer", "messages", "showcase-model"].map(
      (n) => `components/examples/agent-workbench/${n}.ts`,
    ),
    ...[
      "workbench-demo.tsx",
      "demo.module.css",
      "provider.tsx",
      "region-lab.tsx",
      "region-lab.module.css",
    ].map((n) => `components/examples/agent-workbench/${n}`),
  ]
  const hashes = {}
  for (const file of sourceFiles)
    hashes[file] = createHash("sha256")
      .update(await readFile(path.join(buildRoot, file)))
      .digest("hex")
  const snapshot = createHash("sha256")
    .update(JSON.stringify(hashes))
    .digest("hex")
  const scenes = [
    {
      id: "agent-coding-workbench",
      route: "app/?template=coding&page=session&session=session-filter",
      site: true,
    },
    {
      id: "agent-artifacts-workbench",
      route: "app/?template=artifacts&page=artifacts&session=session-report",
      site: true,
    },
    {
      id: "agent-console-workbench",
      route: "app/?template=console&page=inbox&session=session-report",
      site: true,
    },
    ...[
      "sidebar",
      "context",
      "conversation",
      "composer",
      "header",
      "tools",
      "files",
      "output",
      "artifacts",
      "settings",
    ].map((region) => ({
      id: `region-${region}`,
      route: `regions/?region=${region}&session=${["tools", "artifacts"].includes(region) ? "session-report" : "session-filter"}`,
      site: false,
    })),
    ...["conversation", "review", "tasks"].map((layout) => ({
      id: `layout-${layout}`,
      route: `layouts/?layout=${layout}&panel=${layout === "review" ? "changes" : "context"}`,
      site: false,
    })),
  ]
  const images = []
  for (const scene of scenes)
    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 390, height: 844 },
    ])
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: theme,
          hasTouch: viewport.name === "mobile",
          isMobile: viewport.name === "mobile",
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
        const url = `${origin}/examples/agent-workbench/${scene.route}`
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
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        }))
        if (
          errors.length ||
          fonts.status !== "loaded" ||
          fonts.horizontalOverflow
        )
          throw new Error(JSON.stringify({ url, errors, fonts }))
        const name = `${scene.id}-${viewport.name}-${theme}.jpg`
        const asset = `/blog/agent-workbench-showcase/${name}`
        await page.screenshot({
          path: path.join(project, "public", asset),
          type: "jpeg",
          quality: 82,
          fullPage: false,
        })
        if (scene.site)
          await writeFile(
            path.join(project, "public/site/scenes", name),
            await readFile(path.join(project, "public", asset)),
          )
        images.push({
          id: scene.id,
          url,
          asset,
          capturedAt: new Date().toISOString(),
          viewport: { width: viewport.width, height: viewport.height },
          theme,
          locale: "zh-CN",
          fixture: "initial stable fixture; default source case",
          fonts,
          sourceSnapshotId: snapshot,
        })
        await context.close()
      }
  const result = { sourceSnapshotId: snapshot, sourceFiles: hashes, images }
  await writeFile(
    path.join(evidence, "captures.json"),
    JSON.stringify(result, null, 2) + "\n",
  )
  await writeFile(
    path.join(project, "public/blog/agent-workbench-showcase/captures.json"),
    JSON.stringify(result, null, 2) + "\n",
  )
  console.log(
    `Captured ${images.length} actual-route images; source snapshot ${snapshot}`,
  )
} finally {
  await browser?.close()
  server.kill("SIGTERM")
  await writeFile(path.join(evidence, "preview.log"), serverLog)
}
