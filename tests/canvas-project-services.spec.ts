import { expect, test, type Page } from "@playwright/test"
import {
  canvasProjectDefinitions,
  exportCanvasProject,
  parseCanvasProject,
  validateCanvasProject,
} from "../lib/canvas-project"
import {
  createCanvasPersistence,
  type CanvasWriteResult,
} from "../lib/canvas-services"
import { createCanvasDocument } from "../lib/canvas-model"
import { canvasFieldProblem } from "../lib/canvas-config"
import {
  advancedCanvasDefinitions,
  nestedCanvasProject,
} from "../components/examples/canvas-project-fixtures"

test("nested graph boundaries, container restrictions, recursion, and project round trip", () => {
  const project = nestedCanvasProject()
  expect(validateCanvasProject(project, advancedCanvasDefinitions)).toEqual([])
  expect(
    parseCanvasProject(exportCanvasProject(project), advancedCanvasDefinitions),
  ).toEqual(project)
  const secretLabels = structuredClone(project)
  secretLabels.flows[1].title = "password=private-flow-name"
  secretLabels.flows[1].inputs[0].label = "Bearer private-boundary-token"
  const exported = exportCanvasProject(secretLabels)
  expect(exported).not.toContain("private-flow-name")
  expect(exported).not.toContain("private-boundary-token")
  expect(exported).toContain("[REDACTED]")
  expect(() =>
    parseCanvasProject(exported, advancedCanvasDefinitions),
  ).not.toThrow()
  const definitions = canvasProjectDefinitions(
    project,
    advancedCanvasDefinitions,
  )
  expect(
    definitions
      .find((def) => def.type === "iteration:leaf")!
      .ports.map((port) => port.type),
  ).toEqual(["array", "array"])
  const recursive = structuredClone(project)
  recursive.flows[2].document.nodes.push({
    id: "recursive",
    type: "subflow:root",
    title: "Recursive",
    position: { x: 960, y: 0 },
    config: {},
  })
  expect(
    validateCanvasProject(recursive, advancedCanvasDefinitions).join(" "),
  ).toContain("递归")
  expect(() =>
    parseCanvasProject(
      exportCanvasProject(recursive),
      advancedCanvasDefinitions,
    ),
  ).toThrow("递归")
  const boundary = structuredClone(project)
  boundary.flows[1].inputs[0].nodeId = "missing"
  expect(
    validateCanvasProject(boundary, advancedCanvasDefinitions).join(" "),
  ).toContain("边界")
  const escaped = structuredClone(project)
  escaped.flows[2].document.nodes[1].bindings = {
    prompt: { nodeId: "root:input", portId: "text", type: "string", path: [] },
  }
  expect(
    validateCanvasProject(escaped, advancedCanvasDefinitions).length,
  ).toBeGreaterThan(0)
})
test("structured fields validate conditions/schema and code remains plain text", () => {
  expect(
    canvasFieldProblem("condition", {
      match: "all",
      clauses: [{ field: "score", operator: "gt", value: "text" }],
    }),
  ).toContain("数字")
  expect(
    canvasFieldProblem("condition", {
      match: "all",
      clauses: [{ field: "score", operator: "gt", value: "2" }],
    }),
  ).toBeUndefined()
  expect(
    canvasFieldProblem("schema", {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["missing"],
    }),
  ).toContain("Schema")
  expect(canvasFieldProblem("key-value", { "": "value" })).toBeTruthy()
  expect(
    canvasFieldProblem("code", "throw new Error('never executed')"),
  ).toBeUndefined()
})
test("storage preserves changed drafts during save, checks receipts, reconciles unknown and requires explicit conflict resolution", async () => {
  const initial = createCanvasDocument("flow")
  let resolve!: (result: CanvasWriteResult) => void,
    calls = 0
  const session = createCanvasPersistence(initial, "server-1", {
    save: (request) => {
      calls++
      return new Promise((done) => {
        resolve = (result) =>
          done(
            result.kind === "saved"
              ? {
                  kind: "saved",
                  receipt: { ...result.receipt, requestId: request.requestId },
                }
              : result,
          )
      })
    },
    querySave: async () => ({ kind: "rejected", message: "Not accepted" }),
  })
  session.setDocument({ ...initial, revision: 1 })
  const saving = session.save()
  expect(session.getSnapshot().status).toBe("saving")
  session.setDocument({ ...initial, revision: 2 })
  resolve({
    kind: "saved",
    receipt: {
      documentId: "flow",
      documentRevision: 1,
      requestId: "",
      serverRevision: "server-2",
    },
  })
  await saving
  expect(session.getSnapshot().status).toBe("dirty")
  expect(session.getSnapshot().serverRevision).toBe("server-2")
  const second = session.save()
  resolve({ kind: "conflict", serverRevision: "server-3" })
  await second
  expect(session.getSnapshot().status).toBe("conflict")
  await session.save()
  expect(calls).toBe(2)
  session.resolveConflict({ ...initial, revision: 3 }, "server-3")
  const third = session.save()
  resolve({ kind: "unknown" })
  await third
  expect(session.getSnapshot().status).toBe("unknown")
  await session.save()
  expect(calls).toBe(3)
  await session.query()
  expect(session.getSnapshot().status).toBe("error")
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
test("nested navigation retains selection/viewport and rejects recursive node additions", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/workspace/canvas/project/")
  await select(page, "调用 middle")
  const transform = await page
    .locator(".react-flow__viewport")
    .getAttribute("style")
  await page.getByRole("button", { name: "进入子流程", exact: true }).click()
  await expect(page.locator("[data-canvas-project]")).toHaveAttribute(
    "data-active-flow",
    "middle",
  )
  await select(page, "调用 leaf")
  await page.getByRole("button", { name: "进入子流程", exact: true }).click()
  await expect(page.locator("[data-canvas-project]")).toHaveAttribute(
    "data-active-flow",
    "leaf",
  )
  await page.getByRole("button", { name: "主流程", exact: true }).click()
  await expect(
    page.locator('[data-inspector-object="middle-call"]'),
  ).toBeVisible()
  await expect(page.locator(".react-flow__viewport")).toHaveAttribute(
    "style",
    transform!,
  )
  await page.getByRole("button", { name: "添加节点", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "添加 Subflow · 主流程", exact: true })
    .click()
  await expect(
    page.getByRole("status").filter({ hasText: "禁止递归" }).first(),
  ).toBeVisible()
  await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute(
    "data-node-count",
    "8",
  )
  expect(errors).toEqual([])
})
test("structured editors apply real values and preserve invalid drafts", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/project/")
  await select(page, "config")
  const panel = page.locator('[data-inspector-object="config"]')
  await panel.getByLabel("请求头 值 1", { exact: true }).fill("text/plain")
  await panel.getByRole("button", { name: "添加属性", exact: true }).click()
  await panel.getByLabel("属性 2", { exact: true }).fill("count")
  await panel.getByLabel("属性类型 2", { exact: true }).selectOption("number")
  await panel.getByLabel("必填 2", { exact: true }).check()
  await panel.getByRole("button", { name: "应用配置", exact: true }).click()
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await select(page, "config")
  await expect(panel.getByLabel("请求头 值 1", { exact: true })).toHaveValue(
    "application/json",
  )
  await expect(panel.getByLabel("属性 2", { exact: true })).toHaveCount(0)
  await select(page, "调用 middle")
  await page.getByRole("button", { name: "进入子流程", exact: true }).click()
  await select(page, "switch")
  const condition = page.locator('[data-inspector-object="switch"]')
  await condition.getByLabel("比较 1", { exact: true }).selectOption("gt")
  await condition.getByLabel("比较值 1", { exact: true }).fill("invalid")
  await condition.getByRole("button", { name: "应用配置", exact: true }).click()
  await expect(condition).toContainText("数字")
  await expect(condition.getByLabel("比较值 1", { exact: true })).toHaveValue(
    "invalid",
  )
})
test("service fixture: lost save response, explicit conflict, comment, restore confirmation and unknown publish", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/services/")
  await page.getByLabel("保存 fixture", { exact: true }).selectOption("unknown")
  await select(page, "Tool")
  const panel = page.locator('[data-inspector-object="tool"]')
  await panel.getByLabel("节点名称", { exact: true }).fill("Local draft")
  await panel.getByRole("button", { name: "应用配置", exact: true }).click()
  await page.getByRole("button", { name: "保存文档", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "保存文档", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "查询保存回执", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "服务已确认保存" }),
  ).toBeVisible()
  await page
    .getByLabel("保存 fixture", { exact: true })
    .selectOption("conflict")
  await panel.getByLabel("节点名称", { exact: true }).fill("Conflict draft")
  await panel.getByRole("button", { name: "应用配置", exact: true }).click()
  await page.getByRole("button", { name: "保存文档", exact: true }).click()
  await expect(panel.getByLabel("节点名称", { exact: true })).toHaveValue(
    "Conflict draft",
  )
  await expect(
    page.getByRole("button", { name: "保存文档", exact: true }),
  ).toBeDisabled()
  await page
    .getByRole("button", {
      name: "以当前草稿明确处理 fixture 冲突",
      exact: true,
    })
    .click()
  await page.getByRole("tab", { name: "服务接入", exact: true }).click()
  const services = page.getByRole("region", { name: "服务接入" })
  await services
    .getByLabel("讨论草稿", { exact: true })
    .fill("token=secret-value local comment")
  await services.getByRole("button", { name: "提交讨论", exact: true }).click()
  await expect(services).toContainText("[REDACTED]")
  await expect(services).not.toContainText("secret-value local comment", {
    useInnerText: true,
  })
  await services
    .getByRole("button", { name: "恢复版本 fixture-initial", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("这不是本地撤销")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "确认恢复版本", exact: true })
    .click()
  await select(page, "Tool")
  await expect(panel.getByLabel("节点名称", { exact: true })).toHaveValue(
    "Tool",
  )
  await services
    .getByRole("button", { name: "发布已保存版本", exact: true })
    .click()
  await expect(
    services.getByRole("button", { name: "发布已保存版本", exact: true }),
  ).toBeDisabled()
  await services
    .getByRole("button", { name: "查询操作回执", exact: true })
    .click()
  await expect(services).toContainText("fixture 确认未发布")
})
