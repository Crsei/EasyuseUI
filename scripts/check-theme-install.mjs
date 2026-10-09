import { spawn } from "node:child_process"
import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { createServer } from "node:http"
import os from "node:os"
import path from "node:path"
import assert from "node:assert/strict"
import { chromium } from "@playwright/test"
import {
  createAnalyticsThemeConsumer,
  verifyAnalyticsThemeConsumer,
} from "./workflow-analytics-theme-consumer.mjs"

const root = path.resolve(import.meta.dirname, "..")
const modes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["host", "scoped"]
assert.ok(modes.every((mode) => ["host", "scoped"].includes(mode)))
process.env.NO_PROXY = `${process.env.NO_PROXY ?? ""},localhost,127.0.0.1`
process.env.no_proxy = process.env.NO_PROXY
const run = (cmd, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" })
    child.once("error", reject)
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    )
  })
const frozenRegistry = new Map()
for (const mode of modes) {
  for (const file of (await readdir(path.join(root, "public/r", mode)))
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    frozenRegistry.set(
      `${mode}/${file}`,
      await readFile(path.join(root, "public/r", mode, file), "utf8"),
    )
  }
}
const registryHashes = Object.fromEntries(
  [...frozenRegistry].map(([file, content]) => [
    file,
    createHash("sha256").update(content).digest("hex"),
  ]),
)
const sourceSnapshotId = createHash("sha256")
  .update(JSON.stringify(registryHashes))
  .digest("hex")
const reports = []
for (const mode of modes) {
  const fixture = await mkdtemp(path.join(os.tmpdir(), `easyuse-ui-${mode}-`))
  console.log(`Independent ${mode} consumer: ${fixture}`)
  const put = async (file, content) => {
    await mkdir(path.dirname(path.join(fixture, file)), { recursive: true })
    await writeFile(
      path.join(fixture, file),
      typeof content === "string" ? content : JSON.stringify(content, null, 2),
    )
  }
  await put("package.json", {
    name: `easyuse-ui-${mode}-consumer`,
    private: true,
    type: "module",
    dependencies: {
      next: "16.3.8",
      react: "19.3.0",
      "react-dom": "19.3.0",
      tailwindcss: "4.3.0",
    },
    devDependencies: {
      typescript: "6.0.2",
      "@types/react": "19.2.14",
      "@types/node": "24.12.4",
      "@tailwindcss/postcss": "4.3.0",
    },
  })
  await put("tsconfig.json", {
    compilerOptions: {
      target: "ES2020",
      lib: ["dom", "esnext"],
      jsx: "react-jsx",
      module: "esnext",
      moduleResolution: "bundler",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      paths: { "@/*": ["./*"] },
    },
    include: ["**/*.tsx", "**/*.ts"],
  })
  await put("components.json", {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "base-vega",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      utils: "@/lib/utils",
      lib: "@/lib",
      hooks: "@/hooks",
    },
  })
  await put(
    "app/globals.css",
    `@import "tailwindcss";
:root { --background: #f9e9dc; --foreground: #231517; --primary: #773153; --primary-foreground: #fff; --muted: #eee0d4; --muted-foreground: #685350; --accent: #e8cebd; --border: #ac8e7c; --ring: #773153; --destructive: #ad2233; }
body { font-family: Arial,sans-serif; }
#host { background: var(--background); color: var(--foreground); border: 3px solid var(--primary); font-size: 17px; padding: 16px; }
`,
  )
  const hostCss = await readFile(path.join(fixture, "app/globals.css"), "utf8")
  await put(
    "app/layout.tsx",
    'import "./globals.css"\nexport default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}',
  )
  await put(
    "next.config.mjs",
    'export default { output: "export", trailingSlash: true }',
  )
  await put(
    "postcss.config.mjs",
    'export default { plugins: { "@tailwindcss/postcss": {} } }',
  )
  await put(
    "css.d.ts",
    'declare module "*.css" { const classes:Record<string,string>; export default classes }',
  )
  await put(
    "app/page.tsx",
    `"use client"
import { useState } from "react"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { I18nProvider } from "@/lib/i18n-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { WorkflowCanvas } from "@/components/blocks/workflow-canvas"
import type { CanvasSelection } from "@/lib/canvas-model"
const definitions=[{type:"item",label:"Item",category:"Test",defaults:{},ports:[]}]
const graph={schemaVersion:1 as const,id:"theme-proof",revision:0,frames:[],notes:[],edges:[],nodes:[{id:"one",type:"item",title:"Scoped node",position:{x:0,y:0},config:{}}]}
export default function Page(){const [mounted,setMounted]=useState(false); const [selection,setSelection]=useState<CanvasSelection>({nodeIds:[],edgeIds:[]});return <><div id="host">Host sentinel</div><button onClick={()=>setMounted(!mounted)}>Toggle installed components</button>{mounted && ["light","dark"].map(theme=><ThemeBoundary key={theme} id={theme} mode="${mode}" theme={theme as "light"|"dark"}><I18nProvider defaultLocale={theme === "dark" ? "en" : "zh-CN"}><Button>Installed action</Button><RuntimeStatusBadge status="running"/><Dialog><DialogTrigger>Open {theme}</DialogTrigger><DialogContent><DialogTitle>Theme {theme}</DialogTitle><DialogDescription>Scoped portal</DialogDescription></DialogContent></Dialog><div style={{height:450}}><WorkflowCanvas document={graph} definitions={definitions} selection={selection} onSelectionChange={setSelection}/></div></I18nProvider></ThemeBoundary>)}</>}
`,
  )
  await put(
    "app/primitives/page.tsx",
    `"use client"
import {useState} from "react"
import {ThemeBoundary} from "@/components/ui/theme-boundary"
import {Menu,MenuTrigger,MenuContent,MenuItem} from "@/components/ui/menu"
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle} from "@/components/ui/popover"
import {Tabs,TabsList,TabsTab,TabsPanel} from "@/components/ui/tabs"
import {Segmented,SegmentedItem} from "@/components/ui/segmented"
import {Select,SelectTrigger,SelectContent,SelectValue,SelectItem,SelectItemText} from "@/components/ui/select"
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem} from "@/components/ui/combobox"
export default function Page(){const [count,setCount]=useState(0);return <ThemeBoundary mode="${mode}" theme="dark"><Menu><MenuTrigger>Actions</MenuTrigger><MenuContent><MenuItem onClick={()=>setCount(value=>value+1)}>Increment</MenuItem></MenuContent></Menu><output>{count}</output><Popover><PopoverTrigger>Details</PopoverTrigger><PopoverContent><PopoverTitle>Installed popover</PopoverTitle></PopoverContent></Popover><Tabs defaultValue="one"><TabsList aria-label="Installed tabs"><TabsTab value="one">One</TabsTab><TabsTab value="two">Two</TabsTab></TabsList><TabsPanel value="one">First panel</TabsPanel><TabsPanel value="two">Second panel</TabsPanel></Tabs><Segmented defaultValue="list" aria-label="Installed mode"><SegmentedItem value="list">List</SegmentedItem><SegmentedItem value="grid">Grid</SegmentedItem></Segmented><Select defaultValue="alpha"><SelectTrigger aria-label="Installed select"><SelectValue/></SelectTrigger><SelectContent>{["alpha","beta"].map(item=><SelectItem key={item} value={item}><SelectItemText>{item}</SelectItemText></SelectItem>)}</SelectContent></Select><Combobox items={["alpha","beta"]}><ComboboxInput aria-label="Installed search"/><ComboboxContent><ComboboxList>{(item:string)=><ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></ThemeBoundary>}
`,
  )
  await createAnalyticsThemeConsumer(fixture, mode)
  await run("git", ["init", "--quiet"], fixture)
  await run("pnpm", ["install", "--ignore-scripts"], fixture)
  const registry = createServer(async (req, res) => {
    try {
      const name = new URL(req.url, "http://localhost").pathname.match(
        new RegExp(`^/r/${mode}/([\\w-]+)\\.json$`),
      )?.[1]
      if (!name) throw new Error("Invalid path")
      const item = JSON.parse(frozenRegistry.get(`${mode}/${name}.json`))
      item.registryDependencies = item.registryDependencies?.map((value) =>
        value.replace(
          /^https?:\/\/[^/]+/,
          `http://127.0.0.1:${registry.address().port}`,
        ),
      )
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify(item))
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise((resolve) => registry.listen(0, "127.0.0.1", resolve))
  try {
    await run(
      "pnpm",
      [
        "exec",
        "shadcn",
        "add",
        ...[
          "button",
          "dialog",
          "runtime-status-badge",
          "workflow-canvas",
          "menu",
          "popover",
          "tabs",
          "segmented",
          "select",
          "combobox",
          "statistical-chart",
          "heatmap",
        ].map(
          (name) =>
            `http://127.0.0.1:${registry.address().port}/r/${mode}/${name}.json`,
        ),
        "--cwd",
        fixture,
        "--yes",
      ],
      root,
    )
  } finally {
    await new Promise((resolve) => registry.close(resolve))
  }
  const installedCss = await readFile(
    path.join(fixture, "app/globals.css"),
    "utf8",
  )
  assert.match(installedCss, /--color-eu-background:/)
  assert.equal(
    (installedCss.match(/:root\s*\{/g) ?? []).length,
    1,
    "Installer must not add root defaults",
  )
  assert.equal(
    (installedCss.match(/--background:/g) ?? []).length,
    1,
    "Installer must not overwrite host tokens",
  )
  assert.ok(
    !installedCss.includes("--color-background:"),
    "Installer must not replace host utilities",
  )
  await run("pnpm", ["exec", "tsc", "--noEmit"], fixture)
  await run("pnpm", ["exec", "next", "build", "--webpack"], fixture)
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, "http://localhost").pathname
      const file = path.resolve(
        fixture,
        "out",
        `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
      )
      if (!file.startsWith(path.join(fixture, "out") + path.sep))
        throw new Error("Invalid path")
      res.setHeader(
        "Content-Type",
        {
          ".js": "application/javascript",
          ".css": "text/css",
          ".html": "text/html",
        }[path.extname(file)] ?? "application/octet-stream",
      )
      res.end(await readFile(file))
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined),
    args: ["--disable-dev-shm-usage"],
  })
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    })
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(`http://127.0.0.1:${server.address().port}/`)
    const styles = () =>
      page.locator("#host").evaluate((element) => {
        const css = getComputedStyle(element)
        return {
          background: css.backgroundColor,
          color: css.color,
          border: css.border,
          font: css.font,
          width: css.width,
          height: css.height,
        }
      })
    const before = await styles(),
      screenshotBefore = await page.locator("#host").screenshot()
    await page
      .getByRole("button", { name: "Toggle installed components" })
      .click()
    await page.locator("#dark [data-canvas-node]").waitFor()
    assert.deepEqual(await styles(), before)
    assert.equal(
      Buffer.compare(
        await page.locator("#host").screenshot(),
        screenshotBefore,
      ),
      0,
      "Host screenshot must remain identical",
    )
    const backgrounds = []
    for (const theme of ["light", "dark"]) {
      const boundary = page.locator(`#${theme}`)
      const surface = await boundary.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      )
      backgrounds.push(surface)
      assert.equal(
        await boundary
          .locator('[data-runtime-status="running"]')
          .evaluate((element) => {
            const reference = document.createElement("span")
            reference.style.color = "var(--eu-status-info)"
            element.parentElement.appendChild(reference)
            const result =
              getComputedStyle(element).color ===
              getComputedStyle(reference).color
            reference.remove()
            return result
          }),
        true,
        "RuntimeStatusBadge resolves the private semantic token",
      )
      assert.equal(
        await boundary
          .locator("[data-canvas-node]")
          .evaluate((element) => getComputedStyle(element).width),
        "240px",
      )
      await boundary
        .getByRole("button", { name: `Open ${theme}`, exact: true })
        .click()
      const popup = page.getByRole("dialog")
      await popup.waitFor()
      assert.equal(
        await popup.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        surface,
        "Portal inherits its own boundary",
      )
      assert.ok(
        await popup.evaluate((element) => !!element.closest("[data-eu-mode]")),
      )
      assert.notEqual(
        await popup.evaluate((element) => getComputedStyle(element).boxShadow),
        "none",
      )
      await page.keyboard.press("Escape")
      await popup.waitFor({ state: "hidden" })
      await page.waitForFunction(
        (theme) => document.activeElement?.textContent === `Open ${theme}`,
        theme,
      )
      await page
        .getByRole("button", { name: `Open ${theme}`, exact: true })
        .waitFor()
      assert.ok(
        await boundary
          .getByRole("button", { name: `Open ${theme}`, exact: true })
          .evaluate((element) => element === document.activeElement),
      )
    }
    if (mode === "scoped") assert.notEqual(backgrounds[0], backgrounds[1])
    else assert.deepEqual(backgrounds, [before.background, before.background])
    const hostAfter = await styles()
    await page.screenshot({
      path: path.join(fixture, "theme-proof.png"),
      fullPage: true,
    })
    await page.goto(`http://127.0.0.1:${server.address().port}/primitives/`)
    await page.getByRole("button", { name: "Actions", exact: true }).click()
    assert.ok(
      await page
        .getByRole("menu")
        .evaluate((element) => !!element.closest("[data-eu-mode]")),
    )
    await page.getByRole("menuitem", { name: "Increment", exact: true }).click()
    assert.equal(await page.locator("output").textContent(), "1")
    await page.getByRole("tab", { name: "Two", exact: true }).click()
    assert.equal(
      await page
        .getByRole("tabpanel", { name: "Two", exact: true })
        .textContent(),
      "Second panel",
    )
    await page.getByRole("button", { name: "Details", exact: true }).click()
    await page
      .getByRole("heading", { name: "Installed popover", exact: true })
      .waitFor()
    assert.ok(
      await page
        .getByRole("dialog")
        .evaluate((element) => !!element.closest("[data-eu-mode]")),
    )
    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Details", exact: true }).waitFor()
    await page.getByRole("radio", { name: "Grid", exact: true }).click()
    await page
      .getByRole("combobox", { name: "Installed select", exact: true })
      .click()
    await page.getByRole("option", { name: "beta", exact: true }).click()
    await page
      .getByRole("combobox", { name: "Installed search", exact: true })
      .fill("be")
    await page.getByRole("option", { name: "beta", exact: true }).click()
    assert.deepEqual(errors, [])
    await page.screenshot({
      path: path.join(fixture, "primitives-proof.png"),
      fullPage: true,
    })
    await verifyAnalyticsThemeConsumer(
      page,
      `http://127.0.0.1:${server.address().port}`,
    )
    assert.deepEqual(errors, [])
    reports.push({
      mode,
      fixture,
      browser: browser.version(),
      hostBefore: before,
      hostAfter,
      scopeBackgrounds: backgrounds,
      hostScreenshotIdentical: true,
      portal: true,
      canvas: true,
      localeProvider: true,
      runtimeStatusPrivateColor: true,
      chartPrivateColors: true,
      focusRestored: true,
      primitives: [
        "menu",
        "popover",
        "tabs",
        "segmented",
        "select",
        "combobox",
      ],
      hostCss,
    })
    console.log(
      `PASS: ${mode}, host styles/pixels unchanged; two scopes, portals, Canvas and locale provider`,
    )
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
}
await writeFile(
  process.env.THEME_REPORT ||
    path.join(os.tmpdir(), "easyuseui-theme-install-report.json"),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      sourceSnapshotId,
      registryHashes,
      reports,
    },
    null,
    2,
  ) + "\n",
)
