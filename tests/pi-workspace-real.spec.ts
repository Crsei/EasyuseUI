import { test, expect } from "@playwright/test"
import { spawn, type ChildProcess } from "node:child_process"
import { once } from "node:events"
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

test.skip(
  process.env.PI_REAL_PROVIDER !== "1",
  "Requires the user's configured Pi provider; controlled tests run independently",
)
let host: ChildProcess, directory: string, token: string, configPath: string
const port = 3014
async function startHost() {
  host = spawn(
    process.execPath,
    ["--use-env-proxy", "services/pi-host/src/main.ts"],
    {
      env: { ...process.env, PI_HOST_CONFIG: configPath },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  await new Promise<void>((resolve, reject) => {
    let output = ""
    const timeout = setTimeout(
      () => reject(new Error("real Host startup timed out")),
      30000,
    )
    host.stdout!.on("data", (chunk) => {
      output += chunk.toString()
      if (output.includes(`:${port}`)) {
        clearTimeout(timeout)
        resolve()
      }
    })
    host.stderr!.on("data", (chunk) => {
      output += chunk.toString()
    })
    host.on("exit", (code) => {
      clearTimeout(timeout)
      reject(new Error(`real Host exited ${code}`))
    })
  })
  token = readFileSync(join(directory, "host", "service-token"), "utf8").trim()
}
async function stopHost() {
  if (host?.exitCode === null) {
    host.kill("SIGTERM")
    await once(host, "exit")
  }
}
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "easyuse-pi-real-"))
  const external = join(directory, "external")
  mkdirSync(external)
  writeFileSync(
    join(directory, "proof.txt"),
    "The fixture reference color is teal.\n",
  )
  writeFileSync(
    join(external, "history.jsonl"),
    [
      {
        type: "session",
        version: 3,
        id: randomUUID(),
        cwd: directory,
        timestamp: "2026-01-01T00:00:00Z",
      },
      {
        type: "message",
        id: "external-fact",
        parentId: null,
        timestamp: "2026-01-01T00:00:01Z",
        message: {
          role: "user",
          content:
            "Remember the prior context marker: ORCHID-7249. Keep it for my next question.",
          timestamp: 1767225601000,
        },
      },
    ]
      .map((entry) => JSON.stringify(entry))
      .join("\n") + "\n",
  )
  configPath = join(directory, "config.json")
  writeFileSync(
    configPath,
    JSON.stringify({
      port,
      dataDir: join(directory, "host"),
      agentDir: "~/.pi/agent",
      allowedOrigins: ["http://127.0.0.1:3010", "http://127.0.0.1:3011"],
      projects: [
        {
          projectId: "proof",
          name: "Real provider proof",
          cwd: directory,
          sessionDirs: [external],
        },
      ],
    }),
  )
  await startHost()
})
test.afterAll(async () => {
  await stopHost()
  if (directory) rmSync(directory, { recursive: true, force: true })
})
test("real provider: browser streaming, read tool, native context continuation, refresh, Host restart and source-confirmed stop", async ({
  page,
}, testInfo) => {
  test.setTimeout(240000)
  const source = join(directory, "external", "history.jsonl"),
    before = readFileSync(source),
    beforeMtime = statSync(source).mtimeMs
  await page.addInitScript(
    ({ port, token }) =>
      sessionStorage.setItem(
        "easyuse:pi:connection",
        JSON.stringify({ endpoint: `http://127.0.0.1:${port}`, token }),
      ),
    { port, token },
  )
  await page.goto("/examples/agent-workbench/pi/")
  await page
    .getByRole("button", {
      name: /Remember the prior context marker/,
      exact: false,
    })
    .click()
  await page.getByRole("button", { name: "复制并继续", exact: true }).click()
  const composer = page.locator("textarea")
  await expect(composer).toBeVisible()
  const acceptedModel = await page
    .locator("[data-composer-settings] summary")
    .innerText()
  expect(acceptedModel.length).toBeGreaterThan(0)
  await composer.fill(
    "Use the read tool to read proof.txt. Then answer with the prior context marker I asked you to remember and the color from the file. Keep the response under 40 words.",
  )
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await expect(
    page.locator("[data-message-state='streaming']").first(),
  ).toBeVisible({ timeout: 90000 })
  await expect(page.locator("[data-follow-tail-list]")).toContainText(
    "ORCHID-7249",
    { timeout: 90000 },
  )
  await expect(page.locator("[data-follow-tail-list]")).toContainText("teal", {
    timeout: 90000,
  })
  await expect(
    page
      .locator("[data-follow-tail-list] details > summary")
      .filter({ hasText: "read" }),
  ).toBeVisible({ timeout: 90000 })
  await expect(composer).toHaveValue("")
  await expect(page.locator("[data-message-state='streaming']")).toHaveCount(
    0,
    { timeout: 90000 },
  )
  const selectedId = new URL(page.url()).searchParams.get("session")!
  const ids = await page
    .locator("[data-message-id]")
    .evaluateAll((elements) =>
      elements.map((e) => e.getAttribute("data-message-id")),
    )
  await page.screenshot({
    path: testInfo.outputPath("real-provider-desktop.png"),
  })
  await page.reload()
  await expect(page.locator("[data-follow-tail-list]")).toContainText("teal")
  expect(
    await page
      .locator("[data-message-id]")
      .evaluateAll((elements) =>
        elements.map((e) => e.getAttribute("data-message-id")),
      ),
  ).toEqual(ids)
  await stopHost()
  await startHost()
  await expect(page.locator("[data-pi-workspace]")).toHaveAttribute(
    "data-connection",
    "connected",
    { timeout: 15000 },
  )
  await composer.fill(
    "Without rereading any file, what was the prior marker and the reference color? Answer in one line.",
  )
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await expect(
    page.locator("[data-message-role='agent']").last(),
  ).toContainText("ORCHID-7249", { timeout: 90000 })
  await expect(
    page.locator("[data-message-role='agent']").last(),
  ).toContainText("teal", { timeout: 90000 })
  await expect(page.locator("[data-message-state='streaming']")).toHaveCount(
    0,
    { timeout: 90000 },
  )
  expect(new URL(page.url()).searchParams.get("session")).toBe(selectedId)
  await composer.fill(
    "Please produce a detailed 2000-word explanation of how filesystem caches work, beginning now.",
  )
  await page.getByRole("button", { name: "发送", exact: true }).click()
  const stop = page.getByRole("button", { name: "请求停止本轮", exact: true })
  await expect(stop).toBeEnabled({ timeout: 30000 })
  await stop.click()
  await expect(page.getByText("已取消", { exact: true }).first()).toBeVisible({
    timeout: 30000,
  })
  await expect(page.locator("[data-message-state='streaming']")).toHaveCount(0)
  expect(readFileSync(source)).toEqual(before)
  expect(statSync(source).mtimeMs).toBe(beforeMtime)
  await page.screenshot({ path: testInfo.outputPath("real-provider-stop.png") })
})
