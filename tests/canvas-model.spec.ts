import { expect, test } from "@playwright/test"
import {
  applyCanvasCommand,
  copyCanvasFragment,
  createCanvasHistory,
  commitCanvasHistory,
  stepCanvasHistory,
} from "@/lib/canvas-commands"
import {
  parseCanvasDocument,
  exportCanvasDocument,
  validateCanvasConnection,
  validateCanvasDocument,
} from "@/lib/canvas-validation"
import {
  basicCanvasDocument,
  canvasDefinitions,
} from "@/components/examples/canvas-fixtures"
import type { CanvasCommand } from "@/lib/canvas-model"

const definitions = canvasDefinitions
const content = (value: ReturnType<typeof basicCanvasDocument>) => ({
  ...value,
  revision: 0,
})
test("connection policy rejects cycles, duplicate, direction, type, missing and full ports without mutations", () => {
  const document = basicCanvasDocument(),
    before = JSON.stringify(document)
  for (const edge of [
    {
      id: "bad",
      source: "agent",
      sourcePort: "result",
      target: "agent",
      targetPort: "input",
    },
    {
      id: "bad",
      source: "tool",
      sourcePort: "result",
      target: "agent",
      targetPort: "input",
    },
    { ...document.edges[0], id: "duplicate" },
    {
      id: "bad",
      source: "input",
      sourcePort: "text",
      target: "agent",
      targetPort: "model",
    },
    {
      id: "bad",
      source: "input",
      sourcePort: "missing",
      target: "agent",
      targetPort: "input",
    },
    {
      id: "bad",
      source: "input",
      sourcePort: "text",
      target: "output",
      targetPort: "input",
    },
    {
      id: "bad",
      source: "agent",
      sourcePort: "input",
      target: "output",
      targetPort: "input",
    },
  ]) {
    expect(validateCanvasConnection(document, definitions, edge)).toBeTruthy()
    const result = applyCanvasCommand(
      document,
      { type: "connect", edge },
      definitions,
    )
    expect(result.ok).toBe(false)
    expect(result.document).toBe(document)
  }
  expect(JSON.stringify(document)).toBe(before)
})
test("insert is atomic, undo/redo preserves topology and revision never reuses an old version", () => {
  const document = basicCanvasDocument(),
    definition = definitions.find((item) => item.type === "tool")!
  const node = {
    id: "inserted",
    type: "tool",
    title: "Inserted",
    position: { x: 500, y: 400 },
    config: definition.defaults,
  }
  const failed = applyCanvasCommand(
    document,
    {
      type: "insert",
      edgeId: "agent-tool",
      node,
      inputPort: "input",
      outputPort: "missing",
    },
    definitions,
  )
  expect(failed.ok).toBe(false)
  expect(failed.document).toBe(document)
  const result = applyCanvasCommand(
    document,
    {
      type: "insert",
      edgeId: "agent-tool",
      node,
      inputPort: "input",
      outputPort: "result",
    },
    definitions,
  )
  expect(result.ok).toBe(true)
  expect(result.document.nodes).toHaveLength(5)
  expect(result.document.edges).toHaveLength(4)
  const history = commitCanvasHistory(
    createCanvasHistory(document),
    result.document,
  )
  const undone = stepCanvasHistory(history, "undo"),
    redone = stepCanvasHistory(undone, "redo")
  expect(content(undone.document)).toEqual(content(document))
  expect(content(redone.document)).toEqual(content(result.document))
  expect(redone.document.revision).toBe(3)
})
test("copy remaps internal bindings and edges and rejects unselected external dependencies", () => {
  const document = basicCanvasDocument()
  document.nodes[1].bindings = {
    prompt: { nodeId: "input", portId: "text", path: [], type: "string" },
  }
  const result = applyCanvasCommand(
    document,
    {
      type: "paste",
      fragment: copyCanvasFragment(document, ["input", "agent"]),
    },
    definitions,
  )
  expect(result.ok).toBe(true)
  const copies = result.document.nodes.slice(4)
  expect(copies[1].bindings?.prompt.nodeId).toBe(copies[0].id)
  expect(result.document.edges.at(-1)?.source).toBe(copies[0].id)
  expect(new Set(result.document.nodes.map((node) => node.id)).size).toBe(6)
  const failed = applyCanvasCommand(
    document,
    { type: "paste", fragment: copyCanvasFragment(document, ["agent"]) },
    definitions,
  )
  expect(failed.ok).toBe(false)
  expect(failed.document).toBe(document)
  expect(failed.message).toContain("外部变量")
})
test("rename keeps variable identity, deleting source produces a locatable diagnostic", () => {
  const document = basicCanvasDocument()
  document.nodes[1].bindings = {
    prompt: { nodeId: "input", portId: "text", path: [], type: "string" },
  }
  const renamed = applyCanvasCommand(
    document,
    {
      type: "configure",
      nodeId: "input",
      title: "重命名",
      config: document.nodes[0].config,
    },
    definitions,
  )
  expect(renamed.ok).toBe(true)
  expect(renamed.document.nodes[1].bindings).toEqual(document.nodes[1].bindings)
  const deleted = applyCanvasCommand(
    renamed.document,
    { type: "delete", selection: { nodeIds: ["input"], edgeIds: [] } },
    definitions,
  )
  expect(deleted.ok).toBe(true)
  expect(deleted.document.edges.some((edge) => edge.source === "input")).toBe(
    false,
  )
  expect(validateCanvasDocument(deleted.document, definitions)).toContainEqual(
    expect.objectContaining({
      code: "variable",
      nodeId: "agent",
      severity: "error",
    }),
  )
})
test("frame movement is one transaction and deleting it ungroups rather than deletes members", () => {
  const document = basicCanvasDocument()
  const grouped = applyCanvasCommand(
    document,
    {
      type: "frame",
      nodeIds: ["input", "agent"],
      frame: {
        id: "frame",
        title: "Group",
        position: { x: 0, y: 0 },
        width: 720,
        height: 400,
      },
    },
    definitions,
  ).document
  const moved = applyCanvasCommand(
    grouped,
    { type: "move-frame", frameId: "frame", position: { x: 16, y: 32 } },
    definitions,
  ).document
  expect(moved.nodes[0].position).toEqual({ x: 96, y: 152 })
  expect(moved.nodes[1].position).toEqual({ x: 416, y: 152 })
  expect(moved.nodes[2]).toEqual(document.nodes[2])
  const ungrouped = applyCanvasCommand(
    moved,
    { type: "delete-frame", frameId: "frame" },
    definitions,
  ).document
  expect(ungrouped.nodes).toHaveLength(4)
  expect(ungrouped.edges).toHaveLength(3)
  expect(ungrouped.nodes.every((node) => !node.parentId)).toBe(true)
})
test("untrusted import rejects corruption and keeps unknown nodes as complete placeholders", () => {
  const document = basicCanvasDocument()
  for (const input of [
    { ...document, schemaVersion: 2 },
    { ...document, nodes: [...document.nodes, document.nodes[0]] },
    { ...document, edges: [{ ...document.edges[0], target: "missing" }] },
  ])
    expect(() =>
      parseCanvasDocument(JSON.stringify(input), definitions),
    ).toThrow()
  expect(() => parseCanvasDocument('{"__proto__":{}}', definitions)).toThrow(
    "不安全",
  )
  expect(() => parseCanvasDocument(" ".repeat(524289), definitions)).toThrow(
    "512KiB",
  )
  document.nodes[1].type = "future-agent"
  document.nodes[1].config.custom = { nested: [1, 2, 3] }
  expect(parseCanvasDocument(JSON.stringify(document), definitions)).toEqual(
    document,
  )
  expect(
    validateCanvasDocument(document, definitions).some(
      (issue) => issue.code === "unknown-type",
    ),
  ).toBe(true)
})
test("export redacts configuration secrets and never exports execution output", () => {
  const document = basicCanvasDocument()
  document.nodes[2].config.apiKey = "private-test-value"
  const output = exportCanvasDocument({
    ...document,
    execution: { output: "private-run-output" },
  } as typeof document)
  expect(output).not.toContain("private-test-value")
  expect(output).not.toContain("private-run-output")
  expect(output).toContain("[REDACTED]")
  expect(parseCanvasDocument(output, definitions).nodes).toHaveLength(4)
})
test("read-only rejects all command families including import and annotations", () => {
  const document = basicCanvasDocument(),
    node = { ...document.nodes[0], id: "new-node" }
  const commands: CanvasCommand[] = [
    { type: "add", node },
    { type: "move", positions: { input: { x: 0, y: 0 } } },
    { type: "delete", selection: { nodeIds: ["input"], edgeIds: [] } },
    { type: "configure", nodeId: "input", title: "change", config: {} },
    { type: "connect", edge: document.edges[0] },
    { type: "reconnect", edgeId: "input-agent", edge: document.edges[0] },
    {
      type: "insert",
      edgeId: "input-agent",
      node,
      inputPort: "text",
      outputPort: "text",
    },
    { type: "paste", fragment: copyCanvasFragment(document, ["input"]) },
    { type: "replace", document },
    {
      type: "frame",
      nodeIds: [],
      frame: {
        id: "frame",
        title: "F",
        position: { x: 0, y: 0 },
        width: 240,
        height: 120,
      },
    },
    { type: "move-frame", frameId: "frame", position: { x: 0, y: 0 } },
    { type: "delete-frame", frameId: "frame" },
    {
      type: "note",
      note: { id: "note", text: "Note", position: { x: 0, y: 0 } },
    },
    { type: "update-note", noteId: "note", text: "Change" },
    { type: "move-note", noteId: "note", position: { x: 0, y: 0 } },
    { type: "delete-note", noteId: "note" },
  ]
  for (const command of commands) {
    const result = applyCanvasCommand(document, command, definitions, {
      readOnly: true,
    })
    expect(result.ok).toBe(false)
    expect(result.document).toBe(document)
  }
})
