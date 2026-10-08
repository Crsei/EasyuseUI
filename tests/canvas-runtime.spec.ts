import { expect, test, type Page } from "@playwright/test"
import {
  acceptCanvasRunSnapshot,
  canvasRunProblem,
  type CanvasRunSnapshot,
} from "../lib/canvas-runtime"
import { createCanvasDocument } from "../lib/canvas-model"

test("authoritative snapshots reject old run/revision/sequence and deduplicate source events", () => {
  const snapshot: CanvasRunSnapshot = {
    documentId: "flow",
    documentRevision: 2,
    runId: "run-new",
    sequence: 3,
    status: "running",
    nodes: {},
    events: [
      { id: "b", sequence: 2, time: "0", action: "b", status: "running" },
      { id: "a", sequence: 1, time: "0", action: "a", status: "running" },
      {
        id: "a",
        sequence: 1,
        time: "0",
        action: "a latest",
        status: "running",
      },
    ],
  }
  const initial = { documentId: "flow", transport: "connected" as const }
  const state = acceptCanvasRunSnapshot(initial, snapshot, true)
  expect(state.snapshot?.events.map((event) => event.id)).toEqual(["a", "b"])
  for (const change of [
    { documentId: "other" },
    { runId: "old" },
    { documentRevision: 1 },
    { sequence: 2 },
    { sequence: NaN },
  ])
    expect(acceptCanvasRunSnapshot(state, { ...snapshot, ...change })).toBe(
      state,
    )
  expect(
    acceptCanvasRunSnapshot(state, { ...snapshot, status: "completed" })
      .snapshot?.status,
  ).toBe("running")
  expect(
    acceptCanvasRunSnapshot(state, {
      ...snapshot,
      sequence: 4,
      status: "completed",
    }).snapshot?.status,
  ).toBe("completed")
})
test("partial execution requires external upstream inputs and never permits an empty flow", () => {
  const document = createCanvasDocument("flow")
  expect(canvasRunProblem(document, [], "all")).toContain("没有")
  document.nodes = [
    {
      id: "target",
      type: "test",
      title: "Target",
      config: {},
      position: { x: 0, y: 0 },
    },
  ]
  const definitions = [
    {
      type: "test",
      label: "Test",
      category: "Test",
      defaults: {},
      ports: [
        {
          id: "in",
          label: "Input",
          direction: "input" as const,
          type: "string" as const,
          required: true,
        },
      ],
    },
  ]
  expect(canvasRunProblem(document, definitions, "node", "target")).toContain(
    "上游输入",
  )
  expect(
    canvasRunProblem(document, definitions, "node", "target", {
      target: { in: "provided" },
    }),
  ).toBeUndefined()
})
async function select(page: Page, title: string) {
  await page
    .getByRole("button", { name: "查找图中节点", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  const dialog = page.getByRole("dialog")
  await dialog
    .getByRole("button", { name: `定位 ${title}`, exact: true })
    .click()
  await dialog.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(dialog).toBeHidden()
}
async function execution(page: Page) {
  await page.getByRole("button", { name: "执行调试", exact: true }).click()
  return page.getByRole("region", { name: "执行调试" })
}
test("runtime normal, redaction, version ownership and late run rejection", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  const panel = await execution(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await expect(panel).toContainText("Run fixture-run")
  const first = (await panel.innerText()).match(/fixture-run-[\w-]+/)![0]
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(
    page.locator('.react-flow__edge-path[ data-execution-status="completed"]'),
  ).toHaveCount(3)
  await select(page, "Tool")
  await page.getByRole("button", { name: "执行详情", exact: true }).click()
  const inspector = page.locator('[data-inspector-object="tool"]')
  await expect(inspector).toContainText("[REDACTED]")
  await expect(inspector).not.toContainText("fixture-secret")
  await inspector.getByRole("button", { name: "Trace", exact: true }).click()
  await expect(inspector).toContainText("预览已截断")
  await page.getByRole("button", { name: "配置", exact: true }).click()
  await inspector.getByLabel("节点名称", { exact: true }).fill("Tool renamed")
  await inspector.getByRole("button", { name: "应用配置", exact: true }).click()
  await expect(panel).toContainText("旧版本结果")
  await expect(
    page.locator(".react-flow__edge-path[data-execution-status]"),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await expect(panel).not.toContainText(first)
  const current = await panel.textContent()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page
    .getByRole("button", { name: "注入旧运行事件", exact: true })
    .click()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await expect(panel).toHaveText(current!)
})
test("explicit human approval and unknown writes reconcile before another operation", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "Agent 扩展", exact: true }).click()
  await page.getByLabel("运行 fixture", { exact: true }).selectOption("unknown")
  await page.locator("[data-canvas-fixtures] > summary").click()
  const panel = await execution(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await expect(panel).toContainText("启动运行结果未确认")
  await expect(
    page.getByRole("button", { name: "运行流程", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(panel).not.toContainText("启动运行结果未确认")
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await select(page, "Human Approval")
  await page.getByRole("button", { name: "执行详情", exact: true }).click()
  const inspector = page.locator('[data-inspector-object="approval"]')
  await expect(
    inspector.getByRole("button", { name: "批准", exact: true }),
  ).toBeVisible()
  await inspector.getByRole("button", { name: "批准", exact: true }).click()
  await expect(panel).toContainText("批准结果未确认")
  await expect(
    inspector.getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(panel).not.toContainText("批准结果未确认")
  await expect(inspector).toContainText("已完成")
})
test("stop waits for source cancellation; disconnect preserves data and permits safe reread", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page
    .getByLabel("运行 fixture", { exact: true })
    .selectOption("disconnect")
  await page.locator("[data-canvas-fixtures] > summary").click()
  const panel = await execution(page)
  await page.getByRole("button", { name: "运行流程", exact: true }).click()
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(panel).toContainText("读取运行失败")
  await expect(panel).toContainText("fixture 已接受运行请求")
  await page.getByRole("button", { name: "请求停止", exact: true }).click()
  await expect(panel).toContainText("停止请求已收到")
  await expect(
    page.getByRole("button", { name: "请求停止", exact: true }),
  ).toBeDisabled()
  await expect(panel).not.toContainText("来源确认已停止")
  await page.getByRole("button", { name: "查询运行", exact: true }).click()
  await expect(panel).toContainText("来源确认已停止")
  await expect(
    page.getByRole("button", { name: "请求停止", exact: true }),
  ).toHaveCount(0)
})
test("frame collapse preserves topology and command search locates hidden members", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  const flow = page.locator(".react-flow")
  await page.locator(".react-flow__node").first().focus()
  await page.keyboard.press("Control+a")
  await page.getByRole("button", { name: "打开画布操作", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "将选中节点分组", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "关闭弹窗" })
    .click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.getByRole("button", { name: "折叠分组", exact: true }).click()
  await expect(flow.locator("[data-canvas-node]")).toHaveCount(0)
  await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute(
    "data-edge-count",
    "3",
  )
  await page.getByRole("button", { name: "命令搜索", exact: true }).click()
  await page.getByLabel("搜索命令或节点").fill("定位 Agent")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "定位 Agent", exact: true })
    .click()
  await expect(flow.locator("[data-canvas-node]")).toHaveCount(4)
  await expect(page.locator('[data-inspector-object="agent"]')).toBeVisible()
})
