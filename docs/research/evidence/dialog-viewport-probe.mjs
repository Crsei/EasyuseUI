// Run from the repository root after building an isolated copy:
// node docs/research/evidence/dialog-viewport-probe.mjs /path/to/isolated/project /tmp/probe.json
// This read-only probe serves that copy's out/ on an ephemeral loopback port.
import { createServer } from "node:http"
import { readFile, stat, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(path.join(process.cwd(), "package.json"))
const { chromium } = require("@playwright/test")
const buildRoot = path.resolve(process.argv[2] ?? ".")
const output = process.argv[3]
if (!output)
  throw new Error("Provide a JSON output path as the second argument")
const root = path.join(buildRoot, "out")
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost")
    let file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`)
    if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
      res.writeHead(403).end()
      return
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html")
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] ?? "application/octet-stream",
    )
    res.end(await readFile(file))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
let browser
try {
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
      (existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined),
    args: ["--disable-dev-shm-usage"],
  })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  })
  await context.addInitScript(() => {
    localStorage.setItem("easyuseui:locale", "zh-CN")
    localStorage.setItem("theme", "light")
  })
  const page = await context.newPage()
  const results = []
  for (const scenario of [
    { slug: "dialog", triggerName: "创建项目", heights: [844, 320, 240] },
    {
      slug: "command-palette",
      triggerName: "打开命令搜索",
      heights: [844, 320, 240],
    },
  ]) {
    for (const height of scenario.heights) {
      await page.setViewportSize({ width: 390, height })
      await page.goto(
        `http://127.0.0.1:${server.address().port}/docs/${scenario.slug}/`,
      )
      const demo = page.locator(`[data-demo-loader="${scenario.slug}"]`)
      await demo.waitFor({ state: "visible" })
      const trigger = demo.getByRole("button", {
        name: scenario.triggerName,
        exact: true,
      })
      await trigger.click()
      const dialog = page.getByRole("dialog")
      await dialog.waitFor({ state: "visible" })
      const geometry = await dialog.evaluate((element) => {
        const rect = (node) => {
          const r = node.getBoundingClientRect()
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            bottom: r.bottom,
          }
        }
        const popup = rect(element)
        return {
          viewport: { width: innerWidth, height: innerHeight },
          popup,
          fitsViewport: popup.y >= 0 && popup.bottom <= innerHeight,
          overflowY: getComputedStyle(element).overflowY,
          maxHeight: getComputedStyle(element).maxHeight,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          controls: Array.from(element.querySelectorAll("button")).map(
            (button) => ({
              name:
                button.getAttribute("aria-label") ?? button.textContent.trim(),
              rect: rect(button),
            }),
          ),
        }
      })
      await page.keyboard.press("Escape")
      await dialog.waitFor({ state: "hidden" })
      geometry.component = scenario.slug
      geometry.escapeCloses = true
      geometry.focusReturns = await trigger.evaluate(
        (element) => document.activeElement === element,
      )
      results.push(geometry)
    }
  }
  await writeFile(
    output,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        browser: browser.version(),
        scope:
          "Isolated production export; original DialogDemo and CommandPaletteDemo; coarse pointer; reduced motion; no DOM injection",
        results,
      },
      null,
      2,
    )}\n`,
  )
  console.log(
    JSON.stringify(
      results.map(({ viewport, fitsViewport, escapeCloses, focusReturns }) => ({
        viewport,
        fitsViewport,
        escapeCloses,
        focusReturns,
      })),
    ),
  )
} finally {
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}
