import { workflowAnalyticsRegistryItems, createWorkflowAnalyticsConsumer, verifyWorkflowAnalyticsConsumer } from "./workflow-analytics-consumer.mjs"
import {
  workItemsRegistryItems,
  createWorkItemsConsumer,
  verifyWorkItemsConsumer,
} from "./work-items-consumer.mjs"
import { createAgentBoardConsumer, verifyAgentBoardConsumer } from "./agent-board-consumer.mjs"
import {
  commonRegistryItems,
  createCommonConsumer,
  verifyCommonConsumer,
} from "./common-components-consumer.mjs"
import { execFileSync, spawn } from "node:child_process"
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { existsSync } from "node:fs"
import { chromium } from "@playwright/test"

process.env.NO_PROXY = [
  process.env.NO_PROXY,
  process.env.no_proxy,
  "localhost",
  "127.0.0.1",
  "::1",
]
  .filter(Boolean)
  .join(",")
process.env.no_proxy = process.env.NO_PROXY

const project = path.resolve(import.meta.dirname, "..")
const fixture = await mkdtemp(path.join(os.tmpdir(), "easyuse-ui-consumer-"))
let site = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010"
).replace(/\/$/, "")
console.log(`Independent consumer: ${fixture}`)
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
await mkdir(path.join(fixture, "app"))
await writeFile(
  path.join(fixture, "package.json"),
  json({
    name: "easyuse-ui-consumer",
    private: true,
    type: "module",
    dependencies: {
      next: "16.3.8",
      react: "19.3.0",
      "react-dom": "19.3.0",
      tailwindcss: "^4.3.0",
    },
    devDependencies: {
      typescript: "^6.0.2",
      "@types/react": "^19",
      "@types/node": "^24",
      "@tailwindcss/postcss": "4.3.0",
    },
  }),
)
await writeFile(
  path.join(fixture, "tsconfig.json"),
  json({
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
  }),
)
await writeFile(
  path.join(fixture, "components.json"),
  json({
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
  }),
)
await writeFile(
  path.join(fixture, "app/globals.css"),
  '@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --color-primary: var(--primary);\n  --color-primary-foreground: var(--primary-foreground);\n  --color-muted: var(--muted);\n  --color-muted-foreground: var(--muted-foreground);\n  --color-border: var(--border);\n  --color-ring: var(--ring);\n  --color-destructive: var(--destructive);\n}\n',
)
await writeFile(
  path.join(fixture, "css.d.ts"),
  'declare module "*.css" { const classes: Record<string, string>; export default classes }\n',
)
await writeFile(
  path.join(fixture, "app/layout.tsx"),
  `import type { ReactNode } from "react"
import "./globals.css"
export default function Layout({ children }: { children: ReactNode }) { return <html lang="zh-CN"><body>{children}</body></html> }
`,
)
await writeFile(
  path.join(fixture, "next.config.mjs"),
  'export default { output: "export", trailingSlash: true }\n',
)
await writeFile(
  path.join(fixture, "postcss.config.mjs"),
  'export default { plugins: { "@tailwindcss/postcss": {} } }\n',
)
await mkdir(path.join(fixture, "app/i18n"))
await writeFile(
  path.join(fixture, "app/i18n/page.tsx"),
  `"use client"
import { useState } from "react"
import { I18nProvider, useI18n } from "@/lib/i18n-provider"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion } from "@/components/ui/data-region"
function Preview() {
 const { locale, setLocale, t } = useI18n()
 const [draft,setDraft]=useState("")
 return <><button onClick={()=>setLocale(locale === "en" ? "zh-CN" : "en")}>Switch language</button><input aria-label="Draft" value={draft} onChange={event=>setDraft(event.target.value)}/><RuntimeStatusBadge status="running"/><DataRegion state="empty"/><p>{t("i18n.items",{count:2})}</p></>
}
export default function Page(){return <I18nProvider><Preview/></I18nProvider>}
`,
)
await mkdir(path.join(fixture, "app/canvas"))
await writeFile(
  path.join(fixture, "app/canvas/page.tsx"),
  `"use client"
import { useState } from "react"
import { useCanvasRuntime } from "@/lib/use-canvas-runtime"
import type { CanvasRuntimeAdapter, CanvasRunSnapshot } from "@/lib/canvas-runtime"
import { createCanvasPersistence } from "@/lib/canvas-services"
import { useCanvasPersistence } from "@/lib/use-canvas-persistence"
import type { CanvasServicePanelProps } from "@/components/blocks/canvas-service-panel"
import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"
import { useCanvasEditor } from "@/lib/use-canvas-editor"
import { type CanvasDocument, type CanvasNodeDefinition } from "@/lib/canvas-model"
const definitions: CanvasNodeDefinition[] = [
 { type: "input", label: "Input", category: "IO", defaults: {}, ports: [{ id: "text", label: "Text", direction: "output", type: "string" }] },
 { type: "output", label: "Output", category: "IO", defaults: {}, ports: [{ id: "text", label: "Text", direction: "input", type: "string" }] }
]
const document: CanvasDocument = { schemaVersion: 1, id: "installed", revision: 0, frames: [], notes: [], nodes: [
 { id: "input", type: "input", title: "Installed input", position: { x: 0, y: 0 }, config: {} },
 { id: "output", type: "output", title: "Installed output", position: { x: 360, y: 0 }, config: {} }
], edges: [{ id: "wire", source: "input", sourcePort: "text", target: "output", targetPort: "text" }] }
let snapshot:CanvasRunSnapshot
const adapter:CanvasRuntimeAdapter={scopes:["all"],run:async request=>{snapshot={documentId:request.document.id,documentRevision:request.document.revision,runId:"installed-run",sequence:1,status:"running",nodes:Object.fromEntries(request.document.nodes.map(node=>[node.id,{status:"running",attemptId:"one"}])),edges:{wire:{status:"running"}},events:[]};return snapshot},query:async()=>{snapshot={...snapshot,sequence:2,status:"completed",nodes:Object.fromEntries(Object.entries(snapshot.nodes).map(([id,node])=>[id,{...node,status:"completed",output:{password:"installed-secret",result:"installed output"}}])),edges:{wire:{status:"completed"}}};return snapshot}}
export default function InstalledCanvas() {
 const [visualPaused,setVisualPaused]=useState(false)
 const editor = useCanvasEditor(document, definitions)
 const runtime=useCanvasRuntime(editor.document,definitions,adapter)
 const [session]=useState(()=>createCanvasPersistence(document,"installed-base",{save:async()=>({kind:"unknown"}),querySave:async()=>({kind:"rejected",message:"Fixture confirms no storage write"})}))
 const persistence=useCanvasPersistence(editor.document,session)
 const [operation,setOperation]=useState<CanvasServicePanelProps["operation"]>()
 const services:CanvasServicePanelProps={sourceLabel:"Installed local fixture",snapshot:{documentId:document.id,revision:"one",asOf:0,threads:[],presence:[],permissions:{comment:false,restore:false,share:false,publish:true}},serverRevision:"installed-base",versions:[],environments:[{id:"test",name:"Test",available:true}],environmentId:"test",operation,onCommand:async()=>{throw new Error("Unknown fixture publication")},onUncertain:command=>setOperation({requestId:command.requestId,kind:command.kind,status:"unknown"}),onQueryReceipt:async requestId=>setOperation({requestId,kind:"publish",status:"rejected",message:"Fixture confirms no publication"})}
 return <div style={{height:"100dvh"}}><CanvasWorkspace layout="fill" {...editor} definitions={definitions} runtime={runtime} executionVisuals={{edgeEffect:"particles",speed:2,paused:visualPaused}} runtimeToolbar={<button onClick={()=>setVisualPaused(value=>!value)}>Pause installed visuals</button>} persistence={persistence} services={services} /></div>
}
`,
)
await mkdir(path.join(fixture, "app/project"))
await writeFile(
  path.join(fixture, "app/project/page.tsx"),
  `"use client"
import { useState } from "react"
import { CanvasProjectWorkspace } from "@/components/blocks/canvas-project-workspace"
import type { CanvasProject } from "@/lib/canvas-project"
const initial:CanvasProject={schemaVersion:1,rootId:"root",flows:[{id:"root",title:"Installed root",inputs:[],outputs:[],document:{schemaVersion:1,id:"root",revision:0,frames:[],notes:[],edges:[],nodes:[{id:"child",title:"Child call",type:"subflow:child",position:{x:0,y:0},config:{}}]}},{id:"child",title:"Installed child",inputs:[],outputs:[],document:{schemaVersion:1,id:"child",revision:0,frames:[],notes:[],edges:[],nodes:[{id:"config",type:"config",title:"Config",position:{x:0,y:0},config:{headers:{Accept:"json"}}}]}}]}
const definitions=[{type:"config",label:"Config",category:"Config",defaults:{headers:{Accept:"json"}},ports:[],fields:[{key:"headers",label:"Headers",kind:"key-value" as const}]}]
export default function InstalledProject(){const [project,setProject]=useState(initial);return <div style={{height:"100dvh"}}><CanvasProjectWorkspace layout="fill" project={project} definitions={definitions} onChange={setProject}/></div>}
`,
)
await writeFile(
  path.join(fixture, "app/page.tsx"),
  `"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { Chip } from "@/components/ui/chip"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { TaskPanel } from "@/components/blocks/task-panel"
import { ScrollPlayground } from "@/components/blocks/scroll-playground"
import { StyleWorkbench } from "@/components/blocks/style-workbench"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { Item } from "@/components/ui/item"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion } from "@/components/ui/data-region"
import { Tree } from "@/components/ui/tree"
import { SessionRow } from "@/components/blocks/session-row"
import { AgentRow } from "@/components/blocks/agent-row"
import { ActivityTimeline } from "@/components/blocks/activity-timeline"
import { Inspector } from "@/components/blocks/inspector"
import { Conversation, ChatMessage, ChatComposer } from "@/components/blocks/chat-message"
import { ToolCall } from "@/components/blocks/tool-call"
export default function Consumer() {
  return <>
    <Button loading>Saving</Button><Input aria-label="Project" />
    <Badge tone="info" shape="pill">Installed</Badge><Tag leading="#">TypeScript</Tag>
    <Chip label="Installed chip" selected onSelectedChange={() => {}} onRemove={() => {}} />
    <Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Project</DialogTitle><DialogDescription>Settings</DialogDescription></DialogContent></Dialog>
    <TaskPanel tasks={[{ id: "one", title: "Installed", status: "completed" }]} onRetry={() => {}} />
    <ScrollPlayground pattern="linked" />
    <StyleWorkbench initialSection="shadow" />
    <WorkspaceShell title="Installed workspace" sidebar={<span>Navigation</span>} inspector={<RuntimeStatusBadge status="waiting" />}>
      <Item title="Installed session" selected onSelect={() => {}} />
      <DataRegion state="success"><span>Installed</span></DataRegion>
      <Tree label="Installed tree" nodes={[{ id: "one", label: "Session" }]} onSelect={() => {}} />
      <SessionRow session={{ id: "one", title: "Session", status: "running", updatedAt: "now" }} />
      <AgentRow agent={{ id: "agent", name: "Agent", status: "idle" }} />
      <ActivityTimeline events={[{ id: "event", time: "16:42", type: "tool", action: "Read", status: "completed" }]} />
      <Inspector object={{ id: "one", title: "Session", kind: "Session", metadata: [] }} />
      <ChatMessage id="message" role="user" content="Installed" />
      <Conversation messages={[]} composer={<ChatComposer value="" onChange={() => {}} onSend={() => {}} />} />
      <ToolCall call={{ id: "call", name: "read", status: "completed", output: "Installed" }} />
    </WorkspaceShell>
  </>
}
`,
)
execFileSync("git", ["init", "--quiet"], { cwd: fixture })
await createWorkflowAnalyticsConsumer(fixture)
await createCommonConsumer(fixture)
await createWorkItemsConsumer(fixture)
await createAgentBoardConsumer(fixture)
execFileSync("pnpm", ["install", "--ignore-scripts"], {
  cwd: fixture,
  stdio: "inherit",
})
const registryOrigin = site
const registryServer = createServer(async (request, response) => {
  try {
    const name = new URL(request.url, "http://localhost").pathname.match(
      /^\/r\/([\w-]+)\.json$/,
    )?.[1]
    if (!name) throw new Error("Invalid registry path")
    const item = JSON.parse(
      await readFile(path.join(project, "public/r", `${name}.json`), "utf8"),
    )
    item.registryDependencies = item.registryDependencies?.map((url) =>
      url.replace(`${registryOrigin}/r/`, `${site}/r/`),
    )
    response.setHeader("Content-Type", "application/json")
    response.end(JSON.stringify(item))
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => registryServer.listen(0, "127.0.0.1", resolve))
site = `http://127.0.0.1:${registryServer.address().port}`
console.log(`Registry snapshot: ${site}/r (independent of the dev server)`)
assert.equal((await fetch(`${site}/r/workflow-canvas.json`)).status, 200)
try {
  await new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      [
        "exec",
        "shadcn",
        "add",
        ...workflowAnalyticsRegistryItems.map((name) => `${site}/r/${name}.json`),
        ...commonRegistryItems.map((name) => `${site}/r/${name}.json`),
        ...workItemsRegistryItems.map((name) => `${site}/r/${name}.json`),
        `${site}/r/agent-board-workspace.json`,
        `${site}/r/task-panel.json`,
        `${site}/r/input.json`,
        `${site}/r/dialog.json`,
        `${site}/r/scroll-playground.json`,
        `${site}/r/workspace-shell.json`,
        `${site}/r/item.json`,
        `${site}/r/runtime-status-badge.json`,
        ...[
          "data-region",
          "tree",
          "session-row",
          "agent-row",
          "activity-timeline",
          "inspector",
          "chat-message",
          "tool-call",
          "badge",
          "tag",
          "chip",
          "style-workbench",
          "workflow-canvas",
          "canvas-workspace",
          "canvas-project-workspace",
          "menu",
          "popover",
          "tabs",
          "segmented",
          "select",
          "combobox",
        ].map((name) => `${site}/r/${name}.json`),
        "--cwd",
        fixture,
        "--yes",
      ],
      { cwd: project, stdio: "inherit" },
    )
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Registry CLI exited ${code}`)),
    )
  })
} finally {
  await new Promise((resolve) => registryServer.close(resolve))
}
execFileSync("pnpm", ["exec", "tsc", "--noEmit"], {
  cwd: fixture,
  stdio: "inherit",
})
const css = await readFile(path.join(fixture, "app/globals.css"), "utf8")
assert.match(css, /--success:/)
assert.match(css, /--color-success:/)
assert.match(css, /\.dark\s*\{/)
const scrollCss = await readFile(
  path.join(fixture, "components/blocks/scroll-playground.module.css"),
  "utf8",
)
assert.match(scrollCss, /scroll-snap-type: y mandatory/)
const itemCss = await readFile(
  path.join(fixture, "components/ui/item.module.css"),
  "utf8",
)
assert.match(itemCss, /--item-height-double/)
await readFile(
  path.join(fixture, "components/blocks/workspace-shell.module.css"),
  "utf8",
)
await readFile(path.join(fixture, "lib/runtime-status.ts"), "utf8")
assert.match(css, /--control-height:\s*32px/)
assert.match(css, /--spacing-control:/)
assert.match(css, /--status-thinking:/)
assert.match(css, /--pill-radius:/)
assert.match(css, /--radius-pill:/)
assert.match(css, /--label-height:/)
for (const file of [
  "components/ui/data-region.module.css",
  "components/ui/tree.module.css",
  "components/blocks/entity-row.module.css",
  "components/blocks/activity-timeline.module.css",
  "components/blocks/inspector.module.css",
  "components/blocks/chat-message.module.css",
  "components/blocks/tool-call.module.css",
  "lib/use-follow-tail.ts",
  "lib/redact.ts",
  "components/ui/badge.module.css",
  "components/ui/chip.module.css",
  "components/blocks/style-workbench.module.css",
  "lib/style-workbench-model.ts",
  "lib/canvas-model.ts",
  "components/blocks/workflow-canvas.module.css",
])
  await readFile(path.join(fixture, file), "utf8")
console.log(
  "PASS: CLI installation, dependency resolution, theme injection and consumer TypeScript check.",
)
// Build and mount the installed engine adapter; type checks alone cannot prove CSS, handles or edges.
execFileSync("pnpm", ["exec", "next", "build", "--webpack"], {
  cwd: fixture,
  stdio: "inherit",
})
const output = path.join(fixture, "out")
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
}
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname
    const file = path.resolve(
      output,
      `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
    )
    if (!file.startsWith(`${output}${path.sep}`))
      throw new Error("Invalid path")
    response.setHeader(
      "Content-Type",
      mime[path.extname(file)] ?? "application/octet-stream",
    )
    response.end(await readFile(file))
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
let browser
try {
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync("/usr/bin/google-chrome")
        ? "/usr/bin/google-chrome"
        : undefined),
    args: ["--disable-dev-shm-usage"],
  })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(`http://127.0.0.1:${server.address().port}/canvas/`)
  const wire = page.locator(".react-flow__edge-path").first()
  await wire.waitFor({ state: "attached" })
  await page.waitForFunction(() =>
    document
      .querySelector(".react-flow__edge-path")
      ?.getAttribute("d")
      ?.startsWith("M"),
  )
  assert.notEqual(
    await wire.evaluate((element) => getComputedStyle(element).stroke),
    "none",
  )
  assert.equal(
    await wire.evaluate((element) => getComputedStyle(element).strokeWidth),
    "1.5px",
  )
  const canvasBounds = await page
    .locator('[aria-label="流程画布"]')
    .boundingBox()
  assert.ok(canvasBounds.height > 500)
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
  assert.equal(
    (await page.locator('[aria-label="流程画布"]').boundingBox()).height,
    canvasBounds.height,
  )
  assert.equal(await page.locator("[data-canvas-node]").count(), 2)
  assert.equal(await page.locator(".react-flow__handle").count(), 2)
  assert.equal(
    await page
      .locator('[data-canvas-node="input"]')
      .evaluate((element) => getComputedStyle(element).width),
    "240px",
  )
  await page.locator('[data-canvas-node="input"]').click()
  await page.locator('[data-canvas-node="input"][data-selected]').waitFor()
  await page.getByRole("button", { name: "添加节点", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "添加 Output", exact: true })
    .click()
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-canvas-workspace]")
        ?.getAttribute("data-node-count") === "3",
  )
  await page.waitForFunction(
    () =>
      document.querySelector('[aria-label="画布缩放比例"]')?.textContent ===
      "100%",
  )
  await page.getByRole("button", { name: "连接端口", exact: true }).click()
  const connectDialog = page.getByRole("dialog")
  const targetOptions = connectDialog
    .getByLabel("目标输入端口")
    .locator("option")
  await connectDialog
    .getByLabel("目标输入端口")
    .selectOption(await targetOptions.last().getAttribute("value"))
  await connectDialog
    .getByRole("button", { name: "建立连接", exact: true })
    .click()
  await connectDialog.getByRole("button", { name: "关闭弹窗" }).click()
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-canvas-workspace]")
        ?.getAttribute("data-edge-count") === "2",
  )
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-canvas-workspace]")
        ?.getAttribute("data-edge-count") === "1",
  )
  await page.evaluate(() => document.documentElement.classList.add("dark"))
  assert.equal(
    await page
      .locator(".react-flow__minimap")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
    await page
      .locator("[data-canvas-node]")
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  )
  await page.screenshot({
    path: path.join(fixture, "canvas-installed.png"),
    fullPage: true,
  })
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  const animatedEdge = page.locator('[data-canvas-edge-effect="particles"]')
  await animatedEdge.waitFor({ state: "attached" })
  assert.equal(
    await animatedEdge.evaluate((el) => getComputedStyle(el).animationDuration),
    "0.6s",
  )
  assert.equal(
    await animatedEdge.evaluate((el) => getComputedStyle(el).pointerEvents),
    "none",
  )
  await page
    .getByRole("button", { name: "Pause installed visuals", exact: true })
    .click()
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-canvas-edge-effect]")
        ?.getAttribute("data-paused") !== null,
  )
  assert.equal(
    await animatedEdge.evaluate(
      (el) => getComputedStyle(el).animationPlayState,
    ),
    "paused",
  )
  await page
    .getByRole("button", { name: "Pause installed visuals", exact: true })
    .click()
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await page
    .locator('.react-flow__edge-path[data-execution-status="completed"]')
    .waitFor({ state: "attached" })
  await page
    .getByRole("button", { name: "查找图中节点", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "定位 Installed input", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "关闭弹窗" })
    .click()
  await page.getByRole("button", { name: "执行详情", exact: true }).click()
  assert.ok(
    (
      await page.locator('[data-inspector-object="input"]').innerText()
    ).includes("[REDACTED]"),
  )
  assert.ok(
    !(
      await page.locator('[data-inspector-object="input"]').innerText()
    ).includes("installed-secret"),
  )
  await page.getByRole("button", { name: "保存文档", exact: true }).click()
  await page
    .getByRole("button", { name: "查询保存回执", exact: true })
    .waitFor()
  assert.equal(
    await page
      .getByRole("button", { name: "保存文档", exact: true })
      .isDisabled(),
    true,
  )
  await page.getByRole("button", { name: "查询保存回执", exact: true }).click()
  await page.getByRole("tab", { name: "服务接入", exact: true }).click()
  const services = page.getByRole("region", { name: "服务接入" })
  await services
    .getByRole("button", { name: "发布已保存版本", exact: true })
    .click()
  await services
    .getByRole("button", { name: "查询操作回执", exact: true })
    .waitFor()
  assert.equal(
    await services
      .getByRole("button", { name: "发布已保存版本", exact: true })
      .isDisabled(),
    true,
  )
  await services
    .getByRole("button", { name: "查询操作回执", exact: true })
    .click()
  await services
    .getByText("Fixture confirms no publication", { exact: true })
    .waitFor()
  await page.goto(`http://127.0.0.1:${server.address().port}/project/`)
  await page.locator('[data-canvas-node="child"]').click()
  await page.getByRole("button", { name: "进入子流程", exact: true }).click()
  await page.waitForFunction(
    () =>
      document
        .querySelector("[data-canvas-project]")
        ?.getAttribute("data-active-flow") === "child",
  )
  await page.locator('[data-canvas-node="config"]').click()
  await page.getByLabel("Headers 值 1", { exact: true }).fill("text")
  await page.getByRole("button", { name: "应用配置", exact: true }).click()
  assert.equal(
    await page.getByLabel("Headers 值 1", { exact: true }).inputValue(),
    "text",
  )
  await page
    .getByRole("button", { name: "Installed root", exact: true })
    .click()
  await page.locator('[data-inspector-object="child"]').waitFor()
  await page.goto(`http://127.0.0.1:${server.address().port}/i18n/`)
  await page.getByLabel("Draft").fill("Business 中文 draft")
  await page.getByRole("button", { name: "Switch language" }).click()
  await page.getByText("2 items", { exact: true }).waitFor()
  assert.equal(
    await page.getByLabel("Draft").inputValue(),
    "Business 中文 draft",
  )
  await page.getByText("Running", { exact: true }).waitFor()
  await page.getByRole("button", { name: "Switch language" }).click()
  await page.getByText("执行中", { exact: true }).waitFor()
  process.env.COMMON_CONSUMER_EVIDENCE_DIR = fixture
  await verifyWorkflowAnalyticsConsumer(page, `http://127.0.0.1:${server.address().port}`)
  await verifyCommonConsumer(page, `http://127.0.0.1:${server.address().port}`)
  await verifyAgentBoardConsumer(page, `http://127.0.0.1:${server.address().port}`)
  await verifyWorkItemsConsumer(page, `http://127.0.0.1:${server.address().port}`)
  assert.deepEqual(errors, [])
  console.log(
    `PASS: installed Canvas production build, full-height layout and collapsed panels, browser mount, engine CSS, ports, edge, controlled selection, add, connect, undo, authoritative runtime/redaction, unknown save/publication reconciliation, subflow navigation and structured config. Evidence: ${fixture}/canvas-installed.png`,
  )
} finally {
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}
