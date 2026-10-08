import {
  canvasId,
  canvasLimits,
  emptyCanvasSelection,
  type CanvasCommand,
  type CanvasConnectionPolicy,
  type CanvasDocument,
  type CanvasFragment,
  type CanvasNodeDefinition,
  type CanvasSelection,
} from "@/lib/canvas-model"
import {
  parseCanvasDocument,
  validateCanvasConnection,
  validateCanvasConfig,
  validateCanvasVariable,
} from "@/lib/canvas-validation"

export type CanvasCommandResult = {
  ok: boolean
  document: CanvasDocument
  selection: CanvasSelection
  message: string
}
export function copyCanvasFragment(
  document: CanvasDocument,
  nodeIds: string[],
): CanvasFragment {
  const ids = new Set(nodeIds)
  return structuredClone({
    nodes: document.nodes.filter((node) => ids.has(node.id)),
    edges: document.edges.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    ),
  })
}
/** No mutation, no network, no execution. A failed command always returns the original document. */
export function applyCanvasCommand(
  document: CanvasDocument,
  command: CanvasCommand,
  definitions: CanvasNodeDefinition[],
  options?: { readOnly?: boolean; policy?: CanvasConnectionPolicy },
): CanvasCommandResult {
  const fail = (message: string): CanvasCommandResult => ({
    ok: false,
    document,
    selection: emptyCanvasSelection,
    message,
  })
  if (options?.readOnly) return fail("当前画布为只读，未修改文档。")
  let next = structuredClone(document)
  let selection = emptyCanvasSelection
  const connect = (
    edge: CanvasDocument["edges"][number],
    ignoreId?: string,
  ) => {
    const error = validateCanvasConnection(
      next,
      definitions,
      edge,
      ignoreId,
      options?.policy,
    )
    if (error) throw new Error(error)
  }
  const needNode = (id: string) => {
    const node = next.nodes.find((item) => item.id === id)
    if (!node) throw new Error("节点已不存在。")
    return node
  }
  try {
    switch (command.type) {
      case "add":
        next.nodes.push(structuredClone(command.node))
        selection = { nodeIds: [command.node.id], edgeIds: [] }
        break
      case "move":
        for (const [id, position] of Object.entries(command.positions))
          needNode(id).position = { ...position }
        break
      case "delete": {
        const ids = new Set(command.selection.nodeIds)
        next.nodes = next.nodes.filter((node) => !ids.has(node.id))
        next.edges = next.edges.filter(
          (edge) =>
            !ids.has(edge.source) &&
            !ids.has(edge.target) &&
            !command.selection.edgeIds.includes(edge.id),
        )
        break
      }
      case "configure": {
        const node = needNode(command.nodeId)
        if (!definitions.some((definition) => definition.type === node.type))
          throw new Error("未知节点不能配置；原始数据已保留。")
        Object.assign(node, {
          title: command.title,
          config: structuredClone(command.config),
          bindings: structuredClone(command.bindings ?? {}),
        })
        const configErrors = Object.values(
          validateCanvasConfig(
            node,
            definitions.find((definition) => definition.type === node.type)!,
          ),
        )
        for (const [field, reference] of Object.entries(node.bindings ?? {})) {
          const error = validateCanvasVariable(
            next,
            definitions,
            node,
            field,
            reference,
          )
          if (error) configErrors.push(error)
        }
        if (configErrors.length) throw new Error(configErrors[0])
        selection = { nodeIds: [node.id], edgeIds: [] }
        break
      }
      case "connect":
        connect(command.edge)
        next.edges.push(structuredClone(command.edge))
        selection = { nodeIds: [], edgeIds: [command.edge.id] }
        break
      case "reconnect": {
        const index = next.edges.findIndex((edge) => edge.id === command.edgeId)
        if (index < 0) throw new Error("连线已不存在。")
        const edge = { ...command.edge, id: command.edgeId }
        connect(edge, command.edgeId)
        next.edges[index] = edge
        selection = { nodeIds: [], edgeIds: [edge.id] }
        break
      }
      case "insert": {
        const edge = next.edges.find((item) => item.id === command.edgeId)
        if (!edge) throw new Error("连线已不存在。")
        next.nodes.push(structuredClone(command.node))
        next.edges = next.edges.filter((item) => item.id !== edge.id)
        const first = {
          id: canvasId("edge"),
          source: edge.source,
          sourcePort: edge.sourcePort,
          target: command.node.id,
          targetPort: command.inputPort,
          label: edge.label,
        }
        const second = {
          id: canvasId("edge"),
          source: command.node.id,
          sourcePort: command.outputPort,
          target: edge.target,
          targetPort: edge.targetPort,
        }
        connect(first)
        next.edges.push(first)
        connect(second)
        next.edges.push(second)
        selection = { nodeIds: [command.node.id], edgeIds: [] }
        break
      }
      case "paste": {
        if (!command.fragment.nodes.length) throw new Error("尚未复制节点。")
        const ids = new Map(
          command.fragment.nodes.map((node) => [node.id, canvasId("node")]),
        )
        const offset = command.offset ?? { x: 40, y: 40 }
        for (const original of command.fragment.nodes) {
          const node = structuredClone(original)
          node.id = ids.get(original.id)!
          node.position = {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y,
          }
          delete node.parentId
          for (const reference of Object.values(node.bindings ?? {})) {
            const remapped = ids.get(reference.nodeId)
            if (!remapped)
              throw new Error(
                "复制内容包含外部变量引用；请同时复制来源节点，或先移除该绑定。",
              )
            reference.nodeId = remapped
          }
          next.nodes.push(node)
        }
        for (const edge of command.fragment.edges) {
          const source = ids.get(edge.source),
            target = ids.get(edge.target)
          if (!source || !target) throw new Error("复制内容包含外部连线。")
          const copied = { ...edge, id: canvasId("edge"), source, target }
          connect(copied)
          next.edges.push(copied)
        }
        selection = { nodeIds: [...ids.values()], edgeIds: [] }
        break
      }
      case "frame":
        next.frames.push(structuredClone(command.frame))
        for (const id of command.nodeIds)
          needNode(id).parentId = command.frame.id
        selection = { nodeIds: [], edgeIds: [], frameId: command.frame.id }
        break
      case "move-frame": {
        const frame = next.frames.find((item) => item.id === command.frameId)
        if (!frame) throw new Error("Frame已不存在。")
        const dx = command.position.x - frame.position.x,
          dy = command.position.y - frame.position.y
        frame.position = { ...command.position }
        for (const node of next.nodes.filter(
          (item) => item.parentId === frame.id,
        ))
          node.position = { x: node.position.x + dx, y: node.position.y + dy }
        break
      }
      case "delete-frame":
        next.frames = next.frames.filter((item) => item.id !== command.frameId)
        for (const node of next.nodes)
          if (node.parentId === command.frameId) delete node.parentId
        break
      case "note":
        next.notes.push(structuredClone(command.note))
        selection = { nodeIds: [], edgeIds: [], noteId: command.note.id }
        break
      case "update-note": {
        const note = next.notes.find((item) => item.id === command.noteId)
        if (!note) throw new Error("便笺已不存在。")
        note.text = command.text
        break
      }
      case "move-note": {
        const note = next.notes.find((item) => item.id === command.noteId)
        if (!note) throw new Error("便笺已不存在。")
        note.position = { ...command.position }
        break
      }
      case "delete-note":
        next.notes = next.notes.filter((item) => item.id !== command.noteId)
        break
      case "replace":
        next = parseCanvasDocument(
          JSON.stringify(command.document),
          definitions,
          options?.policy,
        )
        break
    }
    // Missing bindings remain diagnostics after a source deletion, while structural corruption is rejected.
    next = parseCanvasDocument(
      JSON.stringify(next),
      definitions,
      options?.policy,
      { allowInvalidBindings: true },
    )
    if (JSON.stringify(next) === JSON.stringify(document))
      return fail("文档没有变化。")
    next.revision = document.revision + 1
    return { ok: true, document: next, selection, message: "本地草稿已修改。" }
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "编辑未完成，原图已保留。",
    )
  }
}

export type CanvasHistory = {
  document: CanvasDocument
  past: CanvasDocument[]
  future: CanvasDocument[]
}
export function createCanvasHistory(document: CanvasDocument): CanvasHistory {
  return { document: structuredClone(document), past: [], future: [] }
}
export function commitCanvasHistory(
  history: CanvasHistory,
  document: CanvasDocument,
): CanvasHistory {
  return {
    document,
    past: [...history.past, history.document].slice(-canvasLimits.history),
    future: [],
  }
}
export function stepCanvasHistory(
  history: CanvasHistory,
  direction: "undo" | "redo",
): CanvasHistory {
  const source = direction === "undo" ? history.past : history.future
  const target = source.at(-1)
  if (!target) return history
  const document = {
    ...structuredClone(target),
    revision: history.document.revision + 1,
  }
  return direction === "undo"
    ? {
        document,
        past: source.slice(0, -1),
        future: [...history.future, history.document],
      }
    : {
        document,
        future: source.slice(0, -1),
        past: [...history.past, history.document].slice(-canvasLimits.history),
      }
}
