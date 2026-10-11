import { test, expect, type Page } from "@playwright/test"
import { spawn, type ChildProcess } from "node:child_process"
import { once } from "node:events"
import { writeFileSync } from "node:fs"

// This file owns one fixture Host/port; tests share its authoritative session store.
test.describe.configure({ mode: "default" })

let host: ChildProcess
const credential = "controlled-browser-service-token-0000000000"
test.beforeAll(async () => {
  host = spawn(
    process.execPath,
    ["../../services/pi-host/test/browser-host.ts"],
    {
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  let output = ""
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("fixture Host did not become ready")),
      20000,
    )
    host.stdout!.on("data", (chunk) => {
      output += chunk.toString()
      if (output.includes("ready")) {
        clearTimeout(timeout)
        resolve()
      }
    })
    host.on("exit", (code) => {
      clearTimeout(timeout)
      reject(new Error(`fixture Host exited ${code}: ${output}`))
    })
    host.stderr!.on("data", (chunk) => {
      output += chunk.toString()
    })
  })
})
test.afterAll(async () => {
  if (host?.exitCode === null) {
    host.kill("SIGTERM")
    await once(host, "exit")
  }
})
async function open(page: Page) {
  await page.addInitScript(
    ({ credential, endpoint }) => {
      sessionStorage.setItem(
        "easyuse:pi:connection",
        JSON.stringify({
          endpoint,
          token: credential,
        }),
      )
    },
    {
      credential,
      endpoint: `http://127.0.0.1:${process.env.PI_BROWSER_HOST_PORT ?? 3013}`,
    },
  )
  await page.goto("/pi/")
  await expect(page.locator("[data-pi-workspace]")).toHaveAttribute(
    "data-connection",
    "connected",
  )
}
async function newSession(page: Page) {
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/api\/pi\/projects\/[^/]+\/sessions$/.test(response.url()),
  )
  await page.getByRole("button", { name: "新建会话", exact: true }).click()
  const receipt = await (await created).json()
  expect(receipt.state).toBe("confirmed")
  await expect
    .poll(() => new URL(page.url()).searchParams.get("session"))
    .toBe(receipt.sessionId)
  await expect(page.locator("textarea")).toBeVisible()
  await expect(page.locator("[data-follow-tail-id]")).toHaveCount(0)
}
test("mounted page sends and streams with source ordering, reloads history and isolates drafts across sessions", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await open(page)
  await newSession(page)
  const textarea = page.locator("textarea")
  await textarea.fill("first browser instruction")
  await page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click()
  await expect(
    page.getByText("Fixture streaming answer", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Fixture final output", { exact: true }),
  ).toBeVisible()
  await expect(textarea).toHaveValue("")
  const ids = await page
    .locator("[data-message-id]")
    .evaluateAll((elements) =>
      elements.map((e) => e.getAttribute("data-message-id")),
    )
  const body = await page.locator("[data-follow-tail-list]").innerText()
  expect(body.indexOf("Fixture streaming answer")).toBeLessThan(
    body.indexOf("行动"),
  )
  expect(body.indexOf("行动")).toBeLessThan(body.indexOf("read"))
  expect(body.indexOf("read")).toBeLessThan(body.indexOf("输出"))
  await textarea.fill("retained per session draft")
  const selected = new URL(page.url()).searchParams.get("session")!
  await page.reload()
  await expect(textarea).toHaveValue("retained per session draft")
  await expect
    .poll(() =>
      page
        .locator("[data-message-id]")
        .evaluateAll((elements) =>
          elements.map((e) => e.getAttribute("data-message-id")),
        ),
    )
    .toEqual(ids)
  await newSession(page)
  await textarea.fill("second session draft")
  await page
    .locator(`[data-session-id='${selected}'] button[aria-pressed]`)
    .click()
  await expect(textarea).toHaveValue("retained per session draft")
  await page.getByRole("button", { name: "切换语言", exact: true }).click()
  await expect(textarea).toHaveValue("retained per session draft")
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click()
  await expect(textarea).toHaveValue("retained per session draft")
  expect(errors).toEqual([])
})
test("paging 1000 source messages retains scroll anchors, stream updates do not force history to bottom", async ({
  page,
}, testInfo) => {
  const start = Date.now()
  const snapshots = new Map<string, import("@playwright/test").Response>()
  page.on("response", (response) => {
    if (/\/api\/pi\/sessions\/[^/?]+$/.test(response.url()))
      snapshots.set(response.url(), response)
  })
  await open(page)
  const historyButton = page.getByRole("button", {
    name: /Fixture long history/,
    exact: false,
  })
  const historyId = await historyButton
    .locator("xpath=ancestor::*[@data-session-id][1]")
    .getAttribute("data-session-id")
  const priorSnapshot = [...snapshots].find(([url]) =>
    url.endsWith(`/api/pi/sessions/${historyId}`),
  )?.[1]
  const snapshotResponse = priorSnapshot
    ? Promise.resolve(priorSnapshot)
    : page.waitForResponse((response) =>
        response.url().endsWith(`/api/pi/sessions/${historyId}`),
      )
  await historyButton.click()
  await expect(page.locator("[data-follow-tail-id]")).toHaveCount(50)
  const firstInputMs = Date.now() - start
  const snapshotBytes = (await (await snapshotResponse).body()).length
  const scroller = page
    .locator("[data-follow-tail-list]")
    .locator("xpath=../..")
  await scroller.evaluate((element) => {
    element.scrollTop = 0
    element.dispatchEvent(new Event("scroll"))
  })
  const first = page.locator("[data-follow-tail-id]").first(),
    id = await first.getAttribute("data-follow-tail-id"),
    top = (await first.boundingBox())!.y
  await page.getByRole("button", { name: "加载更早记录", exact: true }).click()
  await expect(page.locator("[data-follow-tail-id]")).toHaveCount(100)
  const metrics = await page.evaluate(() => ({
    elements: document.querySelectorAll("*").length,
    mountedMessages: document.querySelectorAll("[data-follow-tail-id]").length,
    heapBytes: (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory?.usedJSHeapSize,
  }))
  const baseline = testInfo.outputPath("pi-history-baseline.json")
  writeFileSync(
    baseline,
    JSON.stringify(
      {
        sourceMessages: 1000,
        initialMountedMessages: 50,
        firstInputMs,
        snapshotBytes,
        ...metrics,
      },
      null,
      2,
    ),
  )
  await testInfo.attach("pi-history-baseline.json", {
    path: baseline,
    contentType: "application/json",
  })
  expect(
    Math.abs(
      (await page.locator(`[data-follow-tail-id='${id}']`).boundingBox())!.y -
        top,
    ),
  ).toBeLessThan(3)
  await page.locator("textarea").fill("hold with reader at old history")
  await page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click()
  await expect(
    page.getByRole("button", { name: "请求停止本轮", exact: true }),
  ).toBeEnabled()
  await expect(
    page.getByRole("button", { name: "返回最新", exact: true }),
  ).toBeVisible()
  expect(
    await scroller.evaluate(
      (e) => e.scrollHeight - e.scrollTop - e.clientHeight,
    ),
  ).toBeGreaterThan(100)
  await page.getByRole("button", { name: "请求停止本轮", exact: true }).click()
  await expect(page.getByText("已取消", { exact: true }).first()).toBeVisible()
})
test("external sessions stay read-only until copied, failed tools remain visible and IME does not send", async ({
  page,
}) => {
  await open(page)
  await page
    .getByRole("button", { name: /External historical fact/, exact: false })
    .click()
  await expect(page.locator("textarea")).toHaveCount(0)
  await page.getByRole("button", { name: "复制并继续", exact: true }).click()
  await expect(page.locator("textarea")).toBeVisible()
  const input = page.locator("textarea")
  await input.fill("tool-fail")
  await input.dispatchEvent("compositionstart")
  await input.press("Enter")
  await expect(
    page.getByText("Fixture streaming answer", { exact: true }),
  ).toHaveCount(0)
  await input.dispatchEvent("compositionend")
  await input.press("Enter")
  await expect(
    page.getByText("fixture read failed", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("[data-call-id]")).toBeVisible()
})
test("lost reply is queried using its original request ID and newer draft survives confirmation", async ({
  page,
}) => {
  await open(page)
  await newSession(page)
  let blocked = false
  let allowQueries = false
  await page.route("**/api/pi/operations/*", (route) =>
    allowQueries ? route.continue() : route.abort("failed"),
  )
  await page.route("**/api/pi/sessions/*/messages", async (route) => {
    if (blocked) {
      await route.continue()
      return
    }
    blocked = true
    await route.fetch()
    await route.abort("failed")
  })
  await page.locator("textarea").fill("lost receipt instruction")
  await page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click()
  await expect(
    page.getByRole("button", { name: "查询操作结果", exact: true }),
  ).toBeVisible()
  await page.locator("textarea").fill("newer draft while unconfirmed")
  allowQueries = true
  await page.getByRole("button", { name: "查询操作结果", exact: true }).click()
  await expect(
    page.getByText("Fixture final output", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("textarea")).toHaveValue(
    "newer draft while unconfirmed",
  )
  await expect(
    page
      .locator("[data-message-role='user']")
      .getByText("lost receipt instruction", { exact: true }),
  ).toHaveCount(1)
})
test("desktop navigation and reduced motion retain composer, locale and keyboard actions", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 700 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await open(page)
  await newSession(page)
  await page.keyboard.press("Escape")
  const input = page.locator("textarea")
  await expect(input).toBeVisible()
  await expect(page.locator("[data-follow-tail-id]")).toHaveCount(0)
  await input.fill("desktop draft")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  const send = page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }),
    bounds = (await send.boundingBox())!
  expect(bounds.height).toBeGreaterThanOrEqual(32)
  await page.getByRole("button", { name: "切换语言", exact: true }).click()
  await expect(input).toHaveValue("desktop draft")
  await page.screenshot({ path: testInfo.outputPath("pi-desktop-en.png") })
  await context.close()
})

test("two clients cannot execute concurrent sends twice and the rejected client retains its draft", async ({
  page,
  context,
  browser,
}) => {
  await open(page)
  await newSession(page)
  const id = new URL(page.url()).searchParams.get("session")!
  // Independent storage represents two clients reaching the Host concurrently.
  // Same-context tabs already share pending receipts and disable duplicate sends.
  const secondContext = await browser.newContext({
    storageState: await context.storageState(),
  })
  const second = await secondContext.newPage()
  await open(second)
  await expect
    .poll(() => new URL(second.url()).searchParams.get("session"))
    .toBe(id)
  await page.locator("textarea").fill("hold concurrent instruction")
  await second.locator("textarea").fill("hold concurrent instruction")
  for (const tab of [page, second])
    await expect(
      tab.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }),
    ).toBeEnabled()
  // Hold transport until both explicit user submissions exist; an early SSE update
  // should not turn a server-concurrency test into a wait on a correctly disabled button.
  let submissions = 0
  let release!: () => void
  const barrier = new Promise<void>((resolve) => {
    release = resolve
  })
  for (const tab of [page, second])
    await tab.route("**/api/pi/sessions/*/messages", async (route) => {
      if (++submissions === 2) release()
      await barrier
      await route.continue()
    })
  await Promise.all([
    page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click(),
    second.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click(),
  ])
  await expect
    .poll(async () =>
      (
        await Promise.all([
          page.locator("textarea").inputValue(),
          second.locator("textarea").inputValue(),
        ])
      ).sort(),
    )
    .toEqual(["", "hold concurrent instruction"])
  for (const tab of [page, second])
    await expect(
      tab
        .locator("[data-message-role='user']")
        .getByText("hold concurrent instruction", { exact: true }),
    ).toHaveCount(1)
  await page.getByRole("button", { name: "请求停止本轮", exact: true }).click()
  await expect(page.getByText("已取消", { exact: true }).first()).toBeVisible()
  await expect(
    second.getByText("已取消", { exact: true }).first(),
  ).toBeVisible()
  await secondContext.close()
})

test("pending creation cannot send into the old session and preserves its draft", async ({
  page,
}) => {
  await open(page)
  await newSession(page)
  const oldId = new URL(page.url()).searchParams.get("session")!
  await page.locator("textarea").fill("draft belongs to previous session")
  let deliver!: () => void, arrived!: () => void
  const gate = new Promise<void>((resolve) => {
    deliver = resolve
  })
  const ready = new Promise<void>((resolve) => {
    arrived = resolve
  })
  await page.route("**/api/pi/projects/*/sessions", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue()
      return
    }
    const response = await route.fetch()
    arrived()
    await gate
    await route.fulfill({ response })
  })
  await page.getByRole("button", { name: "新建会话", exact: true }).click()
  await ready
  await expect(
    page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }),
  ).toBeDisabled()
  await expect(page.locator("textarea")).toHaveValue(
    "draft belongs to previous session",
  )
  deliver()
  await expect
    .poll(() => new URL(page.url()).searchParams.get("session") !== oldId)
    .toBe(true)
  await expect(page.locator("textarea")).toHaveValue("")
  await page
    .locator(`[data-session-id='${oldId}'] button[aria-pressed]`)
    .click()
  await expect(page.locator("textarea")).toHaveValue(
    "draft belongs to previous session",
  )
})

test("late copy response cannot navigate back to an old project; failed refresh preserves history and draft", async ({
  page,
}) => {
  await open(page)
  await page.getByRole("button", { name: /^External historical fact/ }).click()
  let deliver!: () => void, arrived!: () => void
  const gate = new Promise<void>((resolve) => {
    deliver = resolve
  })
  const responseReady = new Promise<void>((resolve) => {
    arrived = resolve
  })
  await page.route("**/api/pi/sessions/*/copy", async (route) => {
    const response = await route.fetch()
    arrived()
    await gate
    await route.fulfill({ response })
  })
  await page.getByRole("button", { name: "复制并继续", exact: true }).click()
  await responseReady
  await page
    .getByRole("combobox")
    .filter({ has: page.locator('option[value="second"]') })
    .selectOption("second")
  deliver()
  await expect(
    page
      .getByRole("combobox")
      .filter({ has: page.locator('option[value="second"]') }),
  ).toHaveValue("second")
  await expect
    .poll(() => new URL(page.url()).searchParams.get("project"))
    .toBe("second")
  await newSession(page)
  await page.locator("textarea").fill("retained after refresh failure")
  await page.getByRole("button", { name: /^(发送|加入队列|立即引导)$/ }).click()
  await expect(
    page.getByText("Fixture final output", { exact: true }),
  ).toBeVisible()
  await page.locator("textarea").fill("offline draft")
  await page.route("**/api/pi/projects/*/sessions", (route) =>
    route.abort("failed"),
  )
  await page.route("**/api/pi/sessions/*", (route) =>
    route.request().method() === "GET"
      ? route.abort("failed")
      : route.continue(),
  )
  await page.getByRole("button", { name: "刷新", exact: true }).click()
  await expect(
    page.getByText("Fixture final output", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("textarea")).toHaveValue("offline draft")
})

test("viewport matrix and short viewport keep the mounted composer reachable", async ({
  page,
}, testInfo) => {
  await open(page)
  await newSession(page)
  for (const viewport of [
    { width: 1280, height: 700 },
    { width: 1024, height: 700 },
    { width: 1440, height: 400 },
  ]) {
    await page.setViewportSize(viewport)
    const input = page.locator("textarea")
    await expect(input).toBeVisible()
    const bounds = (await input.boundingBox())!
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await page.getByRole("button", { name: "切换主题", exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath("pi-short-dark.png") })
})

test("late restored session list cannot replace a confirmed new-session selection", async ({
  page,
}) => {
  await open(page)
  await newSession(page)
  const oldId = new URL(page.url()).searchParams.get("session")
  let releaseList!: () => void
  let listArrived!: () => void
  const listGate = new Promise<void>((resolve) => {
    releaseList = resolve
  })
  const intercepted = new Promise<void>((resolve) => {
    listArrived = resolve
  })
  const restoredResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /\/projects\/first\/sessions$/.test(response.url()),
  )
  await page.route("**/api/pi/projects/first/sessions", async (route) => {
    if (route.request().method() === "GET") {
      listArrived()
      await listGate
      await route.continue()
    } else {
      const response = await route.fetch()
      releaseList()
      await restoredResponse
      await route.fulfill({ response })
    }
  })
  await page.reload()
  await intercepted
  await expect(page.locator("[data-pi-workspace]")).toHaveAttribute(
    "data-connection",
    "connected",
  )
  await newSession(page)
  const newId = new URL(page.url()).searchParams.get("session")
  expect(newId).not.toBe(oldId)
  await expect(
    page.locator(`[data-session-id="${newId}"] [data-selected="true"]`),
  ).toBeVisible()
})
