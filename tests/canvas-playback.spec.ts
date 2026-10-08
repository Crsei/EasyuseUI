import {
  openFrozenCanvas,
  advanceStages,
  closeClockDialog,
} from "./canvas-playback-helpers"
import { expect, test, type Page } from "@playwright/test"
import {
  createCanvasRuntimeFixture,
  type CanvasFixtureScenario,
} from "../components/examples/canvas-runtime-fixture"
import { createCanvasDocument } from "../lib/canvas-model"
import type { CanvasRunRequest } from "../lib/canvas-runtime"

function request(
  scope: CanvasRunRequest["scope"] = "all",
  nodeId?: string,
): CanvasRunRequest {
  const document = createCanvasDocument("playback-test")
  document.nodes = ["c", "a", "b"].map((id, i) => ({
    id,
    type: "test",
    title: id,
    config: {},
    position: { x: i * 300, y: 0 },
  }))
  document.edges = [
    { id: "ab", source: "a", sourcePort: "out", target: "b", targetPort: "in" },
    { id: "bc", source: "b", sourcePort: "out", target: "c", targetPort: "in" },
  ]
  return { requestId: "start-test", document, scope, nodeId }
}
async function start(
  scenario: CanvasFixtureScenario = "success",
  input = request(),
) {
  const fixture = createCanvasRuntimeFixture()
  fixture.setScenario(scenario)
  await fixture.adapter.run(input)
  return fixture
}
function advance(fixture: ReturnType<typeof createCanvasRuntimeFixture>) {
  const snapshot = fixture.getSnapshot()!
  return fixture.advance(snapshot.runId, snapshot.sequence)!
}
test("fixture queries are pure and node/edge stages follow topology, not node array order", async () => {
  const fixture = await start(),
    initial = fixture.getSnapshot()!
  expect(initial.nodes.a.status).toBe("running")
  expect(initial.nodes.c.status).toBe("queued")
  expect(await fixture.adapter.query(initial.runId)).toEqual(initial)
  const transfer = advance(fixture)
  expect(transfer.nodes.a.status).toBe("completed")
  expect(transfer.nodes.b.status).toBe("queued")
  expect(transfer.edges?.ab.status).toBe("running")
  const second = advance(fixture)
  expect(second.nodes.b.status).toBe("running")
  expect(second.edges?.ab.status).toBe("completed")
  advance(fixture)
  advance(fixture)
  const end = advance(fixture)
  expect(end.status).toBe("completed")
  expect(
    Object.values(end.nodes).every((node) => node.status === "completed"),
  ).toBe(true)
  expect(fixture.advance(end.runId, end.sequence)).toBeUndefined()
  expect(fixture.getSnapshot()).toEqual(end)
})
test("fixture scopes, branching and stale stage tokens keep their execution identity", async () => {
  for (const [scope, ids] of [
    ["node", ["b"]],
    ["from", ["b", "c"]],
    ["to", ["a", "b"]],
  ] as const) {
    const fixture = await start("success", request(scope, "b"))
    expect(Object.keys(fixture.getSnapshot()!.nodes)).toEqual(ids)
  }
  const input = request()
  input.document.edges = input.document.edges.slice(0, 1)
  const fixture = await start("success", input),
    old = fixture.getSnapshot()!
  advance(fixture)
  expect(fixture.advance(old.runId, old.sequence)).toBeUndefined()
  await fixture.adapter.run({ ...input, requestId: "second" })
  expect(
    fixture.advance(old.runId, fixture.getSnapshot()!.sequence),
  ).toBeUndefined()
})
test("failure keeps unfinished nodes out of success; approval explicitly resumes or cancels", async () => {
  const failed = await start("failure")
  advance(failed)
  advance(failed)
  const end = advance(failed)
  expect(end.status).toBe("failed")
  expect(end.nodes.b.status).toBe("failed")
  expect(end.nodes.c.status).toBe("cancelled")
  expect(end.nodes.c.output).toBeUndefined()
  for (const decision of ["approve", "reject"] as const) {
    const fixture = await start("approval")
    advance(fixture)
    const waiting = advance(fixture),
      node = waiting.nodes.b
    expect(waiting.status).toBe("waiting")
    expect(fixture.advance(waiting.runId, waiting.sequence)).toBeUndefined()
    const result = await fixture.adapter.decide!({
      runId: waiting.runId,
      nodeId: "b",
      attemptId: node.attemptId,
      approvalId: node.approval!.id,
      requestId: "decision",
      decision,
    })
    expect(result.status).toBe(decision === "approve" ? "running" : "cancelled")
    expect(result.nodes.b.approval).toBeUndefined()
  }
})
test("stop acceptance, lost responses and disconnects require source confirmation", async () => {
  const fixture = await start(),
    before = fixture.getSnapshot()!
  const ack = await fixture.adapter.stop!({
    runId: before.runId,
    requestId: "stop-test",
  })
  expect(ack.status).toBe("running")
  expect(ack.requests?.["stop-test"]).toBe("submitted")
  expect(await fixture.adapter.query(before.runId)).toEqual(ack)
  const confirmed = advance(fixture)
  expect(confirmed.status).toBe("cancelled")
  expect(confirmed.requests?.["stop-test"]).toBe("confirmed")
  const lost = createCanvasRuntimeFixture()
  lost.setScenario("unknown")
  await expect(lost.adapter.run(request())).rejects.toThrow("Lost")
  expect(await lost.adapter.reconcileStart!("start-test")).toEqual(
    lost.getSnapshot(),
  )
  const offline = await start("disconnect"),
    snapshot = offline.getSnapshot()!
  expect(() => advance(offline)).toThrow("Offline")
  await expect(offline.adapter.query(snapshot.runId)).rejects.toThrow("Offline")
  expect(await offline.adapter.query(snapshot.runId)).toEqual(snapshot)
})

async function settings(page: Page) {
  await page.getByRole("button", { name: "播放设置", exact: true }).click()
  await page.clock.runFor(250)
  return page.getByRole("dialog")
}
const playback = (page: Page) => page.locator("[data-canvas-playback]")

test("automatic stages, pure queries, pause, one step, speed and effect switching preserve one run", async ({
  page,
}) => {
  await openFrozenCanvas(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "1")
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "1")
  await page.clock.runFor(1000)
  const effect = page.locator('[data-canvas-edge-effect="flow"]')
  await expect(effect).toHaveCount(1)
  const offset = await effect.evaluate(
    (el) => getComputedStyle(el).strokeDashoffset,
  )
  await expect
    .poll(() => effect.evaluate((el) => getComputedStyle(el).strokeDashoffset))
    .not.toBe(offset)
  await page.getByRole("button", { name: "暂停演示", exact: true }).click()
  await expect(playback(page)).toHaveAttribute("data-canvas-playback", "paused")
  const sequence = await playback(page).getAttribute("data-playback-sequence")
  await expect(effect).toHaveCSS("animation-play-state", "paused")
  await page.clock.runFor(5000)
  await expect(playback(page)).toHaveAttribute(
    "data-playback-sequence",
    sequence!,
  )
  const dialog = await settings(page)
  await dialog.getByLabel("连线效果", { exact: true }).selectOption("particles")
  await expect(
    page.locator('[data-canvas-edge-effect="particles"]'),
  ).toHaveCount(1)
  await dialog.getByLabel("连线效果", { exact: true }).selectOption("none")
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCount(0)
  await dialog.getByLabel("连线效果", { exact: true }).selectOption("flow")
  await dialog.getByRole("button", { name: "单步演示", exact: true }).click()
  await expect(playback(page)).toHaveAttribute(
    "data-playback-sequence",
    String(Number(sequence) + 1),
  )
  await expect(playback(page)).toHaveAttribute("data-canvas-playback", "paused")
  await dialog.getByLabel("播放速度", { exact: true }).selectOption("2")
  await closeClockDialog(page)
  await page.getByRole("button", { name: "继续演示", exact: true }).click()
  await page.clock.runFor(499)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "3")
  await page.clock.runFor(1)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "4")
  await advanceStages(page, 4, 500)
  await expect(playback(page)).toHaveAttribute(
    "data-canvas-playback",
    "finished",
  )
  await expect(
    page.locator('[data-canvas-node][data-execution-status="completed"]'),
  ).toHaveCount(4)
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCount(0)
})

test("failure and approval stop playback until an explicit decision", async ({
  page,
}) => {
  await openFrozenCanvas(page)
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page
    .getByLabel("运行 fixture", { exact: true })
    .selectOption("approval")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await advanceStages(page, 4)
  await expect(playback(page)).toHaveAttribute(
    "data-canvas-playback",
    "blocked",
  )
  const sequence = await playback(page).getAttribute("data-playback-sequence")
  await page.clock.runFor(10000)
  await expect(playback(page)).toHaveAttribute(
    "data-playback-sequence",
    sequence!,
  )
  await page.locator('[data-canvas-node="tool"]').click()
  await page.getByRole("button", { name: "执行详情", exact: true }).click()
  await page.getByRole("button", { name: "批准", exact: true }).click()
  await advanceStages(page, 4)
  await expect(playback(page)).toHaveAttribute(
    "data-canvas-playback",
    "finished",
  )
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByLabel("运行 fixture", { exact: true }).selectOption("failure")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await advanceStages(page, 5)
  await expect(page.locator('[data-canvas-node="tool"]')).toHaveAttribute(
    "data-execution-status",
    "failed",
  )
  await expect(page.locator('[data-canvas-node="output"]')).toHaveAttribute(
    "data-execution-status",
    "cancelled",
  )
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCount(0)
})

test("editing a revision cleans up playback; reduced motion keeps static status and touch controls", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  await openFrozenCanvas(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await page.clock.runFor(1000)
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCSS(
    "display",
    "none",
  )
  await expect(page.locator('[data-canvas-node="agent"]')).toHaveAttribute(
    "data-execution-status",
    "queued",
  )
  await page.locator('[data-canvas-node="input"]').click()
  await page.getByLabel("节点名称", { exact: true }).fill("Changed input")
  await page.getByRole("button", { name: "应用配置", exact: true }).click()
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCount(0)
  const sequence = await playback(page).getAttribute("data-playback-sequence")
  await page.clock.runFor(10000)
  await expect(playback(page)).toHaveAttribute(
    "data-playback-sequence",
    sequence!,
  )
})

test("hidden pages suspend stages; locale changes preserve the run and controls", async ({
  page,
}) => {
  await openFrozenCanvas(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  const id = await playback(page).getAttribute("data-playback-run")
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    })
    document.dispatchEvent(new Event("visibilitychange"))
  })
  await expect(playback(page)).toHaveAttribute("data-canvas-playback", "paused")
  await page.clock.runFor(10000)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "1")
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    })
    document.dispatchEvent(new Event("visibilitychange"))
  })
  await expect(playback(page)).toHaveAttribute(
    "data-canvas-playback",
    "playing",
  )
  await page.clock.runFor(999)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "1")
  await page.clock.runFor(1)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "2")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await page.getByRole("button", { name: "Pause demo", exact: true }).click()
  await page
    .getByRole("button", { name: "Playback settings", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Step demo", exact: true }),
  ).toBeEnabled()
  await page
    .getByRole("combobox", { name: "Edge effect", exact: true })
    .selectOption("particles")
  await expect(playback(page)).toHaveAttribute("data-playback-run", id!)
  await expect(playback(page)).toHaveAttribute("data-playback-sequence", "2")
})

test("animated canvas preserves box selection, Shift selection and keyboard selection", async ({
  page,
}) => {
  await openFrozenCanvas(page)
  await page.clock.resume()
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await page.clock.runFor(1000)
  await page
    .getByRole("button", { name: "切换为选择模式", exact: true })
    .click()
  const first = await page.locator('[data-canvas-node="input"]').boundingBox()
  const second = await page.locator('[data-canvas-node="agent"]').boundingBox()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  await page.mouse.move(
    Math.min(first!.x, second!.x) - 8,
    Math.min(first!.y, second!.y) - 8,
  )
  await page.mouse.down()
  await page.mouse.move(
    Math.max(first!.x + first!.width, second!.x + second!.width) + 8,
    Math.max(first!.y + first!.height, second!.y + second!.height) + 8,
    { steps: 10 },
  )
  await page.mouse.up()
  await expect(page.locator("[data-canvas-node][data-selected]")).toHaveCount(2)
  await page
    .locator('[data-canvas-node="tool"]')
    .click({ modifiers: ["Shift"] })
  await expect(page.locator("[data-canvas-node][data-selected]")).toHaveCount(3)
  await page.locator(".react-flow__node").first().focus()
  await page.keyboard.press("Control+a")
  await expect(page.locator("[data-canvas-node][data-selected]")).toHaveCount(4)
})

test.describe("playback touch controls", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  })
  test("pause, settings and step have usable touch targets", async ({
    page,
  }) => {
    await openFrozenCanvas(page)
    await page.getByRole("button", { name: "运行流程", exact: true }).tap()
    const pause = page.getByRole("button", { name: "暂停演示", exact: true })
    expect((await pause.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await pause.tap()
    const settings = page.getByRole("button", { name: "播放设置", exact: true })
    expect((await settings.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await settings.tap()
    await page.clock.runFor(250)
    const speed = page.getByRole("combobox", { name: "播放速度", exact: true })
    expect((await speed.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await page.getByRole("button", { name: "单步演示", exact: true }).tap()
    await expect(playback(page)).toHaveAttribute("data-playback-sequence", "2")
    await expect(page.locator("[data-canvas-edge-effect]")).toHaveCSS(
      "display",
      "none",
    )
  })
})

test("real timers automatically finish the run and particles visibly move", async ({
  page,
}, testInfo) => {
  await page.goto("/workspace/canvas/")
  await expect(page.locator('[data-canvas-ready="true"]')).toBeVisible()
  await page.getByRole("button", { name: "播放设置", exact: true }).click()
  await page
    .getByRole("combobox", { name: "连线效果", exact: true })
    .selectOption("particles")
  await page.getByRole("button", { name: "关闭弹窗", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  const particle = page.locator('[data-canvas-edge-effect="particles"]')
  await expect(particle).toHaveCount(1)
  const initial = await particle.evaluate(
    (el) => getComputedStyle(el).strokeDashoffset,
  )
  await expect
    .poll(() =>
      particle.evaluate((el) => getComputedStyle(el).strokeDashoffset),
    )
    .not.toBe(initial)
  await page.screenshot({
    path: testInfo.outputPath("canvas-particles-running.png"),
  })
  await expect(
    page.locator('[data-canvas-node][data-execution-status="completed"]'),
  ).toHaveCount(4, { timeout: 12000 })
  await expect(page.locator("[data-canvas-edge-effect]")).toHaveCount(0)
})
