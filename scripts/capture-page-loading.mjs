// Extends the fresh-context JS capture and real-control/two-rAF readiness
// methods in capture-page-baseline.mjs and capture-readiness.mjs.
import { spawn } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { createServer } from "node:net"
import { gzipSync } from "node:zlib"
import path from "node:path"
import os from "node:os"
import { chromium, expect } from "@playwright/test"

const [input, output, phase = "before", externalOrigin] = process.argv.slice(2)
if (!input || !output)
  throw new Error("Usage: capture-page-loading.mjs <snapshot> <output-dir> [phase] [origin]")
await mkdir(output, { recursive: true })
const root = path.resolve(input)
const source = JSON.parse(await readFile(path.join(root, "source-snapshot.json"), "utf8"))
const socket = createServer()
await new Promise((r) => socket.listen(0, "127.0.0.1", r))
const port = socket.address().port
await new Promise((r) => socket.close(r))
const origin = externalOrigin || `http://127.0.0.1:${port}`
const server = externalOrigin ? undefined : spawn(process.execPath, [path.join(root, "scripts/preview.mjs")], {
  cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "ignore",
})
const rounds = Number(process.env.PAGE_LOADING_ROUNDS || 5)
const profiles = process.env.PAGE_LOADING_LOCAL_ONLY === "1" ? ["local"] : ["local", "limited"]
const coreRoutes = ["/", "/components/", "/docs/button/", "/examples/agent-workbench/app/", "/examples/agent-workbench/app/?page=session&session=session-filter"]
const extraRoutes = ["/dictionary/", "/blog/", "/examples/agent-workbench/regions/", "/examples/agent-workbench/layouts/"]
const viewport = { width: 1440, height: 900 }
let browser
const report = {
  schemaVersion: 1, phase, sourceSnapshotId: source.snapshotId, head: source.head,
  scriptHash: createHash("sha256").update(await readFile(import.meta.filename)).digest("hex"),
  origin, capturedAt: new Date().toISOString(), rounds,
  environment: { node: process.version, os: os.type(), release: os.release(), viewport, locale: "zh-CN", theme: "light", sharedHost: true },
  network: { local: "unthrottled", limited: { latencyMs: 80, downloadBytesPerSecond: 1_000_000, uploadBytesPerSecond: 250_000 } },
  method: "Warm server; fresh browser context for every first visit/navigation round. LCP observed before interaction. Readiness requires a theme mutation or input mode selection updating a sibling summary with the draft retained, followed by two rAFs. Includes automation overhead; not whole-page TTI. Five samples: median/range, no p95. JS response bodies are decoded; gzip is an estimate; resource transfer and encoding reported separately. Navigation intent uses 500ms hover/focus before click, separately counted.",
  firstVisits: [], navigation: [], repeatedVisits: [], summaries: [],
}
const save = () => writeFile(path.join(output, `${phase}.json`), JSON.stringify(report, null, 2) + "\n")
async function contextFor(profile) {
  const context = await browser.newContext({ viewport, colorScheme: "light", reducedMotion: "reduce" })
  await context.addInitScript(() => {
    localStorage.setItem("theme", "light")
    localStorage.setItem("easyuseui-locale", "zh-CN")
    window.__loadingLcp = 0
    window.__loadingLongTasks = []
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__loadingLcp = entry.startTime
    }).observe({ type: "largest-contentful-paint", buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__loadingLongTasks.push({ start: entry.startTime, duration: entry.duration })
    }).observe({ type: "longtask", buffered: true })
  })
  const page = await context.newPage()
  if (profile === "limited") {
    const cdp = await context.newCDPSession(page)
    await cdp.send("Network.enable")
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false, latency: 80, downloadThroughput: 1_000_000, uploadThroughput: 250_000,
    })
  }
  return { context, page }
}
function resourcesFor(page) {
  const scripts = new Map(), pending = [], failures = [], errors = [], requests = []
  page.on("request", (request) => requests.push({ url: request.url(), type: request.resourceType() }))
  page.on("requestfailed", (request) => failures.push({ url: request.url(), failure: request.failure() }))
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() })
    if (new URL(response.url()).pathname.endsWith(".js")) pending.push(response.body().then((body) => {
      scripts.set(response.url(), { url: response.url(), decodedBytes: body.length, estimatedGzipBytes: gzipSync(body).length, encoding: response.headers()["content-encoding"] || "identity", crm: body.includes("crm.localOnly"), canvas: body.includes("react-flow__renderer") })
    }).catch((error) => failures.push({ url: response.url(), error: String(error) })))
  })
  return { scripts, pending, failures, errors, requests }
}
const rafs = (page) => page.evaluate(async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return performance.now()
})
async function usable(page, route) {
  const attempts = []
  if (route.includes("/agent-workbench/app/") || route.includes("/agent-workbench/layouts/")) {
    // Native input value alone does not prove hydration. An input mode choice must
    // update the separate React-rendered summary while retaining the draft.
    const settings = page.locator("[data-composer-settings]:visible").first()
    const summary = settings.locator("summary")
    await summary.click()
    const model = settings.getByRole("combobox", { name: "输入模式", exact: true })
    const previous = await model.inputValue()
    const choice = await model.locator("option:not([disabled])").evaluateAll((options, previous) => {
      const next = options.find((o) => o.value !== previous)
      return { value: next.value, label: next.textContent.trim() }
    }, previous)
    const field = page.getByRole("textbox", { name: "消息输入", exact: true }).filter({ visible: true }).first()
    await field.fill("loading-probe")
    await model.selectOption(choice.value)
    await expect(summary).toContainText(choice.label)
    await expect(field).toHaveValue("loading-probe")
    await model.selectOption(previous)
    await summary.click()
    await field.fill("")
  } else {
    for (let attempt = 0; attempt < 10; attempt++) {
      attempts.push(await page.evaluate(() => performance.now()))
      await page.getByRole("button", { name: "切换深浅主题", exact: true }).click()
      try {
        await page.waitForFunction(() => document.documentElement.classList.contains("dark"), {}, { timeout: 250 })
        break
      } catch { if (attempt === 9) throw new Error("Theme control never responded") }
    }
  }
  return { usableMs: await rafs(page), attempts }
}
async function metrics(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0]
    const resources = performance.getEntriesByType("resource")
    return { ttfbMs: nav.responseStart, fcpMs: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null, lcpBeforeInteractionMs: window.__loadingLcp || null, loadMs: nav.loadEventEnd || null, resourceTransfers: resources.filter((entry) => entry.name.split("?")[0].endsWith(".js")).map((entry) => ({ url: entry.name, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize })), longTasks: window.__loadingLongTasks }
  })
}
async function finishResources(network) {
  await Promise.all(network.pending)
  const scripts = [...network.scripts.values()]
  return { jsDecodedBytes: scripts.reduce((sum, s) => sum + s.decodedBytes, 0), estimatedGzipJsBytes: scripts.reduce((sum, s) => sum + s.estimatedGzipBytes, 0), jsRequestCount: scripts.length, requestCount: network.requests.length, scripts, failures: network.failures, pageErrors: network.errors }
}
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${origin}/`)).ok) break } catch {}
    if (i === 99) throw new Error("Preview unavailable")
    await new Promise((r) => setTimeout(r, 100))
  }
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/google-chrome", args: ["--disable-dev-shm-usage"] })
  report.environment.browser = browser.version()
  for (const profile of profiles) for (const route of [...coreRoutes, ...(profile === "local" ? extraRoutes : [])]) {
    // Warm HTTP/server separately from browser cache.
    await fetch(`${origin}${route}`)
    for (let round = 0; round < rounds; round++) {
      const { context, page } = await contextFor(profile)
      const network = resourcesFor(page)
      await page.goto(`${origin}${route}`, { waitUntil: "load" })
      const initial = await metrics(page)
      const ready = await usable(page, route)
      await page.waitForTimeout(250)
      const resourceMetrics = await metrics(page)
      const sample = { profile, route, round, ...initial, ...ready, ...await finishResources(network), resourceTransfers: resourceMetrics.resourceTransfers, longTasks: resourceMetrics.longTasks }
      report.firstVisits.push(sample)
      await save()
      console.log(`${phase} ${profile} ${route} ${round}: ${Math.round(ready.usableMs)}ms, ${sample.jsDecodedBytes} JS bytes`)
      if (round === 0 && profile === "local") await page.screenshot({ path: path.join(output, `${phase}-${route.replace(/[^a-z0-9]+/gi, "-") || "home"}.png`) })
      await context.close()
    }
  }
  if (process.env.PAGE_LOADING_SKIP_NAV !== "1") for (const intent of [false, true]) for (let round = 0; round < rounds; round++) {
    const { context, page } = await contextFor("local")
    const network = resourcesFor(page)
    await page.goto(origin, { waitUntil: "load" })
    await usable(page, "/")
    for (const [route, selector, target] of [
      ["/components/", '[data-site-header] nav a[href="/components/"]', "h1"],
      ["/docs/button/", '[data-component-entry="button"] a[href="/docs/button/"]', "h1"],
    ]) {
      const link = page.locator(selector).first()
      // Position pointer elsewhere before click to keep the no-intent case cold.
      await page.mouse.move(0, 0)
      const requestStart = network.requests.length, scriptsBefore = new Set(network.scripts.keys())
      if (intent) { await link.hover(); await link.focus(); await page.waitForTimeout(500) }
      const intentRequests = network.requests.length - requestStart
      const start = await page.evaluate(() => performance.now())
      await link.click()
      await expect(page).toHaveURL(new RegExp(route))
      await page.locator(target).first().waitFor()
      const titleMs = await rafs(page) - start
      await page.getByRole("combobox", { name: "语言", exact: true }).first().selectOption("en")
      await expect(page.locator("html")).toHaveAttribute("lang", "en")
      const controlMs = await rafs(page) - start
      await page.getByRole("combobox", { name: "Language", exact: true }).first().selectOption("zh-CN")
      await page.waitForTimeout(250)
      await Promise.all(network.pending)
      report.navigation.push({ round, intent, route, titleMs, controlMs, intentRequests, requestCount: network.requests.length - requestStart, addedScripts: [...network.scripts.values()].filter((s) => !scriptsBefore.has(s.url)), failures: [...network.failures], pageErrors: [...network.errors], longTasks: (await metrics(page)).longTasks.filter((task) => task.start >= start) })
      await save()
    }
    await page.goBack()
    await expect(page.locator('[data-component-entry="button"]')).toBeVisible()
    const start = await page.evaluate(() => performance.now())
    await page.locator('[data-component-entry="button"] a[href="/docs/button/"]').first().click()
    await page.locator("h1").first().waitFor()
    report.repeatedVisits.push({ round, route: "/docs/button/", usableMs: await rafs(page) - start, intent })
    await context.close()
  }
  for (const route of [...new Set(report.firstVisits.map((s) => s.route))]) for (const profile of profiles) {
    const samples = report.firstVisits.filter((s) => s.route === route && s.profile === profile)
    if (!samples.length) continue
    const fields = ["ttfbMs", "fcpMs", "lcpBeforeInteractionMs", "loadMs", "usableMs", "jsDecodedBytes", "estimatedGzipJsBytes", "jsRequestCount"]
    const values = Object.fromEntries(fields.map((field) => {
      const sorted = samples.map((s) => s[field]).filter((v) => v != null).sort((a, b) => a - b)
      return [field, { median: sorted[Math.floor(sorted.length / 2)] ?? null, min: sorted[0] ?? null, max: sorted.at(-1) ?? null }]
    }))
    report.summaries.push({ route, profile, samples: samples.length, ...values })
  }
  await save()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
