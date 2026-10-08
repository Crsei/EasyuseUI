import { writeFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import { buildCanvasIndexes } from "@/lib/canvas-index"
import { layoutCanvasDAG } from "@/lib/canvas-layout"
import {
  basicCanvasDocument,
  canvasDefinitions,
  stressCanvasDocument,
  stressDefinitions,
} from "@/components/examples/canvas-fixtures"
import {
  applyCanvasCommand,
  createCanvasHistory,
  commitCanvasHistory,
  stepCanvasHistory,
} from "@/lib/canvas-commands"

test("indexes preserve first definitions, issue ordering, self-loop and fallback-port compatibility", () => {
  const graph = basicCanvasDocument()
  graph.nodes.push({ ...graph.nodes[0], title: "Duplicate" })
  graph.edges.push({
    id: "self",
    source: "missing",
    target: "missing",
    sourcePort: "out",
    targetPort: "in",
  })
  const indexes = buildCanvasIndexes(
    graph,
    [...canvasDefinitions, { ...canvasDefinitions[0], label: "Duplicate" }],
    [
      {
        nodeId: graph.nodes[0].id,
        severity: "error",
        code: "fixture",
        message: "first",
      },
      {
        nodeId: graph.nodes[0].id,
        severity: "warning",
        code: "fixture",
        message: "second",
      },
    ],
  )
  expect(indexes.nodeById.get(graph.nodes[0].id)?.title).toBe(
    graph.nodes[0].title,
  )
  expect(indexes.definitionByType.get(canvasDefinitions[0].type)).toBe(
    canvasDefinitions[0],
  )
  expect(
    indexes.issuesByNodeId
      .get(graph.nodes[0].id)
      ?.map((issue) => issue.message),
  ).toEqual(["first", "second"])
  expect(
    indexes.fallbackPortsByNodeId.get("missing")?.map((port) => port.id),
  ).toEqual(["out"])
  const replaced = {
    ...graph,
    edges: [
      {
        id: "fresh",
        source: "missing",
        target: "other",
        sourcePort: "new",
        targetPort: "in",
      },
    ],
  }
  expect(
    buildCanvasIndexes(
      replaced,
      canvasDefinitions,
      [],
    ).fallbackPortsByNodeId.get("missing")?.[0].id,
  ).toBe("new")
})

test("DAG layout changes coordinates only and commits as one undoable transaction", async () => {
  const graph = basicCanvasDocument()
  const saved = structuredClone(graph)
  const result = await layoutCanvasDAG(graph, canvasDefinitions, {
    measurements: { [graph.nodes[0].id]: { width: 320, height: 240 } },
    fixedNodeIds: [graph.nodes[0].id],
  })
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.reason)
  expect(graph).toEqual(saved)
  expect(result.positions[graph.nodes[0].id]).toEqual(graph.nodes[0].position)
  const changed = applyCanvasCommand(
    graph,
    { type: "move", positions: result.positions },
    canvasDefinitions,
  )
  expect(changed.ok).toBe(true)
  if (!changed.ok) throw new Error("layout command failed")
  expect(changed.document.edges).toEqual(saved.edges)
  expect(
    changed.document.nodes.map((node) => ({ ...node, position: null })),
  ).toEqual(saved.nodes.map((node) => ({ ...node, position: null })))
  const history = commitCanvasHistory(
    createCanvasHistory(graph),
    changed.document,
  )
  const undone = stepCanvasHistory(history, "undo")
  expect({ ...undone.document, revision: 0 }).toEqual({ ...saved, revision: 0 })
})

test("DAG rejects cycles, child scopes and overflowing frames; cancellation leaves input intact", async () => {
  const graph = basicCanvasDocument()
  const cyclic = {
    ...graph,
    edges: [
      ...graph.edges,
      {
        id: "cycle",
        source: graph.nodes.at(-1)!.id,
        target: graph.nodes[0].id,
        sourcePort: "out",
        targetPort: "in",
      },
    ],
  }
  expect(await layoutCanvasDAG(cyclic, canvasDefinitions)).toEqual({
    ok: false,
    reason: "cycle",
  })
  expect(
    await layoutCanvasDAG(
      { ...graph, nodes: [{ ...graph.nodes[0], type: "subflow:child" }] },
      canvasDefinitions,
    ),
  ).toEqual({ ok: false, reason: "subflow" })
  const grouped = {
    ...graph,
    frames: [
      {
        id: "frame",
        title: "Group",
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
      },
    ],
    nodes: graph.nodes.map((node) => ({ ...node, parentId: "frame" })),
  }
  expect(await layoutCanvasDAG(grouped, canvasDefinitions)).toEqual({
    ok: false,
    reason: "groupCapacity",
  })
  const controller = new AbortController(),
    large = stressCanvasDocument(1000),
    saved = structuredClone(large)
  const promise = layoutCanvasDAG(large, stressDefinitions, {
    signal: controller.signal,
  })
  controller.abort()
  await expect(promise).rejects.toHaveProperty("name", "AbortError")
  expect(large).toEqual(saved)
})

test("Canvas text, Inspector and logs retain native shortcuts; canvas context edits still work", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  const canvas = page.locator("[data-canvas-editor-context]")
  await expect(canvas).toHaveAttribute("data-canvas-ready", "true")
  const workspace = page.locator("[data-canvas-workspace]")
  const revision = await workspace.getAttribute("data-revision")
  await page.evaluate(() => {
    const text =
      document.querySelector(
        "[data-canvas-workspace] [data-canvas-node] strong",
      ) ?? document.querySelector("[data-canvas-workspace] h2")!
    const range = document.createRange()
    range.selectNodeContents(text)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
  })
  await canvas.focus()
  await page.keyboard.press("Control+a")
  await page.keyboard.press("Delete")
  await expect(workspace).toHaveAttribute("data-revision", revision!)
  await page.evaluate(() => window.getSelection()?.removeAllRanges())
  await canvas.focus()
  await page.keyboard.press("Control+a")
  await page.keyboard.press("Delete")
  await expect(workspace).toHaveAttribute("data-node-count", "0")
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(workspace).not.toHaveAttribute("data-node-count", "0")
})

test("layout preview can cancel, apply and undo without changing graph semantics", async ({
  page,
}, testInfo) => {
  await page.goto("/benchmarks/canvas/50/")
  const workspace = page.locator("[data-canvas-workspace]")
  await expect(page.locator("[data-canvas-ready=true]")).toBeVisible()
  const revision = await workspace.getAttribute("data-revision")
  const arrange = async () => {
    await page.getByRole("button", { name: "更多工具", exact: true }).click()
    await page
      .getByRole("menuitem", { name: "整理当前流程（DAG）", exact: true })
      .click()
    await expect(page.locator('[data-layout-preview="preview"]')).toBeVisible()
  }
  const taskStart = Date.now()
  await arrange()
  await expect(workspace).toHaveAttribute("data-revision", revision!)
  await page.getByRole("button", { name: "取消布局", exact: true }).click()
  await expect(page.locator("[data-layout-preview]")).toHaveCount(0)
  await expect(workspace).toHaveAttribute("data-revision", revision!)
  await arrange()
  await page.getByRole("button", { name: "应用布局", exact: true }).click()
  await expect(workspace).toHaveAttribute(
    "data-revision",
    String(Number(revision) + 1),
  )
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(page.locator("[data-layout-preview]")).toHaveCount(0)
  await page.getByRole("button", { name: "重做编辑", exact: true }).click()
  await expect(workspace).toHaveAttribute("data-revision", String(Number(revision) + 3))
  const file = testInfo.outputPath("layout-task.json")
  await writeFile(file, JSON.stringify({ method: "Automated local UI task from first menu click through cancel, preview, apply, undo and redo; includes automation overhead, not a human usability benchmark", nodes: 50, edges: 73, steps: 8, durationMs: Date.now() - taskStart }, null, 2))
  await testInfo.attach("layout-task", { path: file, contentType: "application/json" })
})


test("a layout preview becomes invalid when the source document is replaced", async ({ page }) => {
  await page.goto("/benchmarks/canvas/50/")
  await expect(page.locator("[data-canvas-ready=true]")).toBeVisible()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "更多工具", exact: true }).click()
  await page.getByRole("menuitem", { name: "整理当前流程（DAG）", exact: true }).click()
  await expect(page.locator('[data-layout-preview="preview"]')).toBeVisible()
  await page.getByRole("button", { name: "200 节点", exact: true }).click()
  await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute("data-node-count", "200")
  await expect(page.locator("[data-layout-preview]")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "应用布局", exact: true })).toHaveCount(0)
})
