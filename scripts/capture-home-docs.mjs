import { chromium } from "@playwright/test"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createHash } from "node:crypto"
import { gzipSync } from "node:zlib"
import { spawn } from "node:child_process"
import path from "node:path"
const phase = process.env.CAPTURE_PHASE || "after"
const port = Number(process.env.CAPTURE_PORT || 33121)
const output = path.resolve(
  process.env.CAPTURE_OUTPUT || "public/blog/homepage-and-docs",
)
const sceneOutput =
  process.env.SCENE_OUTPUT && path.resolve(process.env.SCENE_OUTPUT)
const origin = `http://127.0.0.1:${port}`
const files = [
  "app/page.tsx",
  "app/docs/[slug]/page.tsx",
  "app/docs/layout.tsx",
  "components/site/header.tsx",
  "components/docs/sidebar.tsx",
  "components/docs/component-preview.tsx",
  "components/docs/source-browser.tsx",
  "components/docs/component-browser.tsx",
  "components/docs/docs-search.tsx",
  "lib/component-manifest.ts",
  "lib/doc-guides.ts",
  "lib/example-manifest.ts",
  "components/examples/agent-board/agent-board-demo.tsx",
  "components/examples/work-items/work-items-demo.tsx",
  "components/examples/work-items/fixtures.ts",
  "components/examples/canvas-workspace-demo.tsx",
  "styles/theme.css",
  "app/globals.css",
  "app/layout.tsx",
  "components/site/site.module.css",
  "components/site/site-footer.tsx",
  "components/site/site-i18n-provider.tsx",
  "components/docs/docs.module.css",
  "components/docs/docs-toc.tsx",
  "components/docs/doc-page.tsx",
  "components/examples/canvas-playback.tsx",
  "components/examples/demo-visibility.tsx",
  "lib/docs-index.json",
  "lib/docs-code-index.json",
  "lib/guide-navigation.json",
  "config/performance-budgets.json",
  "app/docs/page.tsx",
  "app/docs/installation/page.tsx",
  "app/examples/page.tsx",
  "components/docs/component-doc.tsx",
  "components/docs/guide-doc.tsx",
  "components/docs/docs-directory.tsx",
  "components/site/home/scene-preview.tsx",
  "components/site/home/scene-image.tsx",
  "components/site/home/component-thumbnail.tsx",
  "components/site/example-gallery.tsx",
  "components/site/navigation-drawer.tsx",
  "components/site/site-localized.tsx",
  "components/examples/task-panel-demo.tsx",
  "lib/site-i18n-messages.ts",
  "lib/site-i18n-metadata.ts",
  "lib/site-navigation.ts",
  "lib/site.ts",
  "scripts/capture-home-docs.mjs",
]
async function snapshot() {
  const sources = {}
  for (const file of files)
    if (existsSync(file))
      sources[file] = createHash("sha256")
        .update(await readFile(file))
        .digest("hex")
  return {
    version: process.env.SOURCE_VERSION || null,
    files: sources,
    id: createHash("sha256").update(JSON.stringify(sources)).digest("hex"),
  }
}
await mkdir(output, { recursive: true })
const source = await snapshot()
const server = spawn(process.execPath, ["scripts/preview.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
})
let browser
const screenshots = [],
  samples = [],
  errors = []
const capturedAt = new Date().toISOString()
try {
  let ready = false
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (!ready)
    throw new Error("Isolated production preview did not become ready")
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  })
  async function context(width, theme, locale) {
    const result = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: "reduce",
      colorScheme: theme,
    })
    await result.addInitScript(
      ({ theme, locale }) => {
        localStorage.setItem("theme", theme)
        localStorage.setItem("easyuseui-locale", locale)
      },
      { theme, locale },
    )
    return result
  }
  for (const route of [
    "/",
    "/docs/button/",
    "/docs/tool-call/",
    "/docs/work-items-workspace/",
    "/docs/workflow-canvas/",
    "/components/",
    "/docs/installation/",
    "/examples/",
  ]) {
    for (let sample = 0; sample < 3; sample++) {
      const ctx = await context(1440, "light", "zh-CN"),
        page = await ctx.newPage(),
        resources = new Map(),
        pending = []
      await page.addInitScript(() => {
        window.__siteMetrics = { lcp: null, cls: 0 }
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            window.__siteMetrics.lcp = entry.startTime
        }).observe({ type: "largest-contentful-paint", buffered: true })
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.__siteMetrics.cls += entry.value
        }).observe({ type: "layout-shift", buffered: true })
      })
      page.on("pageerror", (error) =>
        errors.push({ route, message: error.message }),
      )
      page.on("response", (response) => {
        if (new URL(response.url()).pathname.endsWith(".js"))
          pending.push(
            response
              .body()
              .then((bytes) => resources.set(response.url(), bytes)),
          )
      })
      const html = Buffer.from(
        await (await fetch(origin + route)).arrayBuffer(),
      )
      const started = performance.now()
      await page.goto(origin + route)
      await page.waitForLoadState("networkidle")
      await page
        .getByRole("combobox", { name: "语言", exact: true })
        .first()
        .selectOption("en")
      await page.locator('html[lang="en"]').waitFor()
      const hydrationObservationMs = performance.now() - started
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .first()
        .selectOption("zh-CN")
      await page.locator('html[lang="zh-CN"]').waitFor()
      await Promise.all(pending)
      const initialJs = [...resources.values()]
      const metrics = await page.evaluate(() => window.__siteMetrics)
      const record = {
        route,
        sample,
        htmlSha256: createHash("sha256").update(html).digest("hex"),
        jsResources: [...resources].map(([url, bytes]) => ({
          path: new URL(url).pathname,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          estimatedGzipBytes: gzipSync(bytes).length,
        })),
        htmlBytes: html.length,
        htmlEstimatedGzipBytes: gzipSync(html).length,
        jsBytes: initialJs.reduce((sum, bytes) => sum + bytes.length, 0),
        jsEstimatedGzipBytes: initialJs.reduce(
          (sum, bytes) => sum + gzipSync(bytes).length,
          0,
        ),
        engineDownloaded: initialJs.some((bytes) =>
          bytes.includes("react-flow__renderer"),
        ),
        mountedDemos: await page.locator('[data-demo-mounted="true"]').count(),
        hydrationObservationMs,
        ...metrics,
        searchReadyMs: null,
        sourceReadyMs: null,
        heavyDemoReadyMs: null,
      }
      if (phase === "after" && route === "/") {
        const searchStarted = performance.now()
        await page
          .getByRole("button", { name: "搜索文档", exact: true })
          .click()
        await page
          .locator('[role="dialog"] input[role="combobox"]')
          .fill("Button")
        await page.getByRole("option").first().waitFor()
        record.searchReadyMs = performance.now() - searchStarted
        await page.keyboard.press("Escape")
      }
      if (phase === "after" && route === "/docs/button/") {
        const sourceStarted = performance.now()
        await page
          .getByRole("button", { name: "读取所选文件", exact: true })
          .last()
          .click()
        await page.locator('[data-source-loaded="true"]').waitFor()
        record.sourceReadyMs = performance.now() - sourceStarted
      }
      if (phase === "after" && route === "/docs/workflow-canvas/") {
        const started = performance.now()
        await page
          .getByRole("button", { name: "加载演示", exact: true })
          .click()
        await page.locator(".react-flow__node").first().waitFor()
        record.heavyDemoReadyMs = performance.now() - started
      }
      samples.push(record)
      await ctx.close()
    }
  }
  for (const route of ["/", "/docs/button/"])
    for (const width of [1440, 1280, 768, 390])
      for (const theme of ["light", "dark"])
        for (const locale of ["zh-CN", "en"]) {
          const ctx = await context(width, theme, locale),
            page = await ctx.newPage()
          await page.goto(origin + route)
          await page.waitForLoadState("networkidle")
          await page.locator(`html[lang="${locale}"]`).waitFor()
          const slug = route === "/" ? "home" : "docs-button",
            file = `${phase}-${slug}-${width}-${theme}-${locale}.jpg`
          await page.screenshot({
            path: path.join(output, file),
            type: "jpeg",
            quality: 85,
          })
          screenshots.push({
            file,
            route,
            viewport: { width, height: width === 390 ? 844 : 900 },
            theme,
            locale,
            capturedAt,
            sourceSnapshotId: source.id,
          })
          await ctx.close()
        }
  if (sceneOutput) {
    await mkdir(sceneOutput, { recursive: true })
    const scenes = []
    for (const [id, route, marker] of [
      ["agent", "/workspace/agents/", "[data-run-id]"],
      [
        "work-items",
        "/examples/work-items/?layout=board",
        "[data-work-items-ready=true]",
      ],
      ["canvas", "/workspace/canvas/", ".react-flow__node"],
    ])
      for (const width of [1440, 390])
        for (const theme of ["light", "dark"]) {
          const ctx = await context(width, theme, "zh-CN"),
            page = await ctx.newPage()
          await page.goto(origin + route)
          await page.locator(marker).first().waitFor({ timeout: 15000 })
          const file = `${id}-${width === 390 ? "mobile" : "desktop"}-${theme}.jpg`
          await page.screenshot({
            path: path.join(sceneOutput, file),
            type: "jpeg",
            quality: 88,
          })
          scenes.push({
            file,
            route,
            viewport: { width, height: width === 390 ? 844 : 900 },
            theme,
            locale: "zh-CN",
            fixture: "committed local example; default state",
            sourceSnapshotId: source.id,
            capturedAt,
          })
          await ctx.close()
        }
    await writeFile(
      path.join(sceneOutput, "captures.json"),
      JSON.stringify({ source, scenes }, null, 2) + "\n",
    )
  }
  if ((await snapshot()).id !== source.id)
    throw new Error("Capture sources changed during measurement")
  if (errors.length) throw new Error(JSON.stringify(errors))
  const report = {
    schemaVersion: 1,
    phase,
    capturedAt,
    source,
    sampleCount: 3,
    environment: {
      browser: browser.version(),
      node: process.version,
      sharedHost: true,
      temporaryStorage: process.env.TMPDIR
        ? "isolated data volume"
        : "system default",
      viewport: { width: 1440, height: 900 },
    },
    method:
      "Three fresh contexts per route, production static output, no throttling. gzip bytes estimate compression of response bodies. LCP/CLS are browser observations; hydration includes network idle and a language switch. Search and source timings include automation. Shared-host samples are not p95, transport bytes, CI certification or service performance.",
    samples,
    screenshots,
  }
  await writeFile(
    path.join(output, phase + ".json"),
    JSON.stringify(report, null, 2) + "\n",
  )
  console.log(
    JSON.stringify(
      {
        phase,
        source: source.id,
        samples: samples.length,
        screenshots: screenshots.length,
        errors,
      },
      null,
      2,
    ),
  )
} finally {
  await browser?.close()
  server.kill("SIGTERM")
}
