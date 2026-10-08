import { canvasFieldProblem } from "@/lib/canvas-config"
import {
  canvasLimits,
  type CanvasConnectionPolicy,
  type CanvasDocument,
  type CanvasEdgeRecord,
  type CanvasIssue,
  type CanvasNodeDefinition,
  type CanvasNodeRecord,
  type CanvasVariable,
} from "@/lib/canvas-model"
import { redact } from "@/lib/redact"

export function upstreamCanvasNodes(
  document: CanvasDocument,
  targetId: string,
): Set<string> {
  const seen = new Set<string>()
  const pending = [targetId]
  while (pending.length) {
    const id = pending.pop()!
    for (const edge of document.edges)
      if (edge.target === id && !seen.has(edge.source)) {
        seen.add(edge.source)
        pending.push(edge.source)
      }
  }
  seen.delete(targetId)
  return seen
}

export function validateCanvasConnection(
  document: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  edge: CanvasEdgeRecord,
  ignoreId?: string,
  policy?: CanvasConnectionPolicy,
): string | undefined {
  const source = document.nodes.find((node) => node.id === edge.source)
  const target = document.nodes.find((node) => node.id === edge.target)
  if (!source || !target) return "连接引用了不存在的节点。"
  if (source.id === target.id) return "不允许节点连接自身。"
  const other = document.edges.filter((item) => item.id !== ignoreId)
  if (
    other.some(
      (item) =>
        item.source === edge.source &&
        item.sourcePort === edge.sourcePort &&
        item.target === edge.target &&
        item.targetPort === edge.targetPort,
    )
  )
    return "相同端口之间已存在连接。"
  if (
    upstreamCanvasNodes({ ...document, edges: other }, source.id).has(target.id)
  )
    return "此连接会形成回路；当前画布要求 DAG。"
  const sourceDefinition = definitions.find((item) => item.type === source.type)
  const targetDefinition = definitions.find((item) => item.type === target.type)
  const output = sourceDefinition?.ports.find(
    (port) => port.id === edge.sourcePort,
  )
  const input = targetDefinition?.ports.find(
    (port) => port.id === edge.targetPort,
  )
  if ((sourceDefinition && !output) || (targetDefinition && !input))
    return "连接引用了不存在的端口。"
  if (
    (output && output.direction !== "output") ||
    (input && input.direction !== "input")
  )
    return "连接方向必须为 output → input。"
  if (!output || !input) return "未知节点定义，不能编辑其连接。"
  try {
    if (!(policy ? policy(output, input) : output.type === input.type))
      return `端口类型不兼容：${output.type} → ${input.type}。`
  } catch {
    return "连接策略未能完成校验。"
  }
  if (
    output.maxConnections !== undefined &&
    other.filter(
      (item) => item.source === source.id && item.sourcePort === output.id,
    ).length >= output.maxConnections
  )
    return "来源端口已达到连接数量上限。"
  if (
    input.maxConnections !== undefined &&
    other.filter(
      (item) => item.target === target.id && item.targetPort === input.id,
    ).length >= input.maxConnections
  )
    return "目标端口已达到连接数量上限。"
}

export function validateCanvasVariable(
  document: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  target: CanvasNodeRecord,
  field: string,
  reference: CanvasVariable,
): string | undefined {
  const source = document.nodes.find((node) => node.id === reference.nodeId)
  if (!source) return "变量来源节点已不存在。"
  const port = definitions
    .find((item) => item.type === source.type)
    ?.ports.find(
      (item) => item.id === reference.portId && item.direction === "output",
    )
  if (!port) return "变量来源输出端口已不存在或定义未知。"
  if (port.type !== reference.type) return "变量来源类型已改变，请重新选择。"
  const targetField = definitions
    .find((item) => item.type === target.type)
    ?.fields?.find((item) => item.key === field)
  if (!targetField?.variableType) return "此配置字段不接受变量。"
  const expected = targetField.variableType
  if (expected && expected !== reference.type)
    return `字段需要 ${expected}，变量为 ${reference.type}。`
  if (!upstreamCanvasNodes(document, target.id).has(source.id))
    return "变量来源不在当前节点的可达上游。"
}

export function validateCanvasConfig(
  node: CanvasNodeRecord,
  definition: CanvasNodeDefinition,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of definition.fields ?? []) {
    if (node.bindings?.[field.key]) continue
    const value = node.config[field.key]
    if (value === undefined || value === "" || value === null) {
      if (field.required) errors[field.key] = `${field.label}不能为空。`
      continue
    }
    const structuredProblem = canvasFieldProblem(
      field.kind,
      node.config[field.key],
    )
    if (structuredProblem)
      errors[field.key] = `${field.label}：${structuredProblem}`
    if (
      field.kind === "number" &&
      (typeof value !== "number" ||
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max))
    )
      errors[field.key] =
        `${field.label}需要有效数字${field.min !== undefined || field.max !== undefined ? `（${field.min ?? "不限"}–${field.max ?? "不限"}）` : ""}。`
    if (
      ["text", "textarea", "select", "code", "expression"].includes(
        field.kind,
      ) &&
      typeof value !== "string"
    )
      errors[field.key] = `${field.label}需要文本。`
    if (
      field.kind === "select" &&
      !field.options?.some((option) => option.value === value)
    )
      errors[field.key] = `${field.label}不在可选范围内。`
  }
  try {
    for (const [index, message] of (
      definition.validate?.(node) ?? []
    ).entries())
      errors[`custom-${index}`] = message
  } catch {
    errors.custom = "节点校验器未能完成校验。"
  }
  return errors
}

export function validateCanvasDocument(
  document: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  policy?: CanvasConnectionPolicy,
): CanvasIssue[] {
  const issues: CanvasIssue[] = []
  for (const node of document.nodes) {
    const definition = definitions.find((item) => item.type === node.type)
    if (!definition) {
      issues.push({
        code: "unknown-type",
        severity: "warning",
        nodeId: node.id,
        message: `${node.title}：未知节点类型 ${node.type}，原数据已保留。`,
      })
      continue
    }
    for (const message of Object.values(validateCanvasConfig(node, definition)))
      issues.push({
        code: "config",
        severity: "warning",
        nodeId: node.id,
        message,
      })
    for (const port of definition.ports.filter(
      (item) => item.direction === "input" && item.required,
    ))
      if (
        !document.edges.some(
          (edge) => edge.target === node.id && edge.targetPort === port.id,
        )
      )
        issues.push({
          code: "required-port",
          severity: "warning",
          nodeId: node.id,
          portId: port.id,
          message: `${node.title}：必填输入「${port.label}」未连接。`,
        })
    for (const [field, reference] of Object.entries(node.bindings ?? {})) {
      const message = validateCanvasVariable(
        document,
        definitions,
        node,
        field,
        reference,
      )
      if (message)
        issues.push({
          code: "variable",
          severity: "error",
          nodeId: node.id,
          message: `${node.title} / ${field}：${message}`,
        })
    }
  }
  for (const edge of document.edges) {
    const message = validateCanvasConnection(
      document,
      definitions,
      edge,
      edge.id,
      policy,
    )
    if (message)
      issues.push({
        code: message.startsWith("未知节点") ? "unknown-port" : "connection",
        severity: message.startsWith("未知节点") ? "warning" : "error",
        edgeId: edge.id,
        nodeId: edge.target,
        message,
      })
  }
  return issues
}

function object(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name}必须是对象。`)
  return value as Record<string, unknown>
}
function text(value: unknown, name: string, max = 200): string {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error(`${name}需要非空文本，最多${max}字符。`)
  return value
}
function id(value: unknown, name: string): string {
  const result = text(value, name, 128)
  if (!/^[\w][\w-]*$/.test(result))
    throw new Error(`${name}仅支持字母、数字、下划线和短横线。`)
  return result
}
function number(
  value: unknown,
  name: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw new Error(`${name}超出有效范围。`)
  return value
}
function point(value: unknown, name: string) {
  const p = object(value, name)
  number(p.x, `${name}.x`, -1e6, 1e6)
  number(p.y, `${name}.y`, -1e6, 1e6)
}
function keys(value: Record<string, unknown>, allowed: string[], name: string) {
  for (const key of Object.keys(value))
    if (!allowed.includes(key))
      throw new Error(`${name}不支持字段 ${key}；扩展数据请放入 config。`)
}
function safeValue(value: unknown, depth = 0) {
  if (depth > 20) throw new Error("JSON 嵌套超过20层。")
  if (typeof value === "number" && !Number.isFinite(value))
    throw new Error("JSON 包含非有限数字。")
  if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        throw new Error("JSON 包含不安全字段。")
      safeValue(child, depth + 1)
    }
}
/** Checks an untrusted JSON payload before it can reach the engine or replace a draft. */
export function parseCanvasDocument(
  json: string,
  definitions: CanvasNodeDefinition[],
  policy?: CanvasConnectionPolicy,
  options?: { allowInvalidBindings?: boolean },
): CanvasDocument {
  if (new TextEncoder().encode(json).byteLength > canvasLimits.bytes)
    throw new Error("文件超过512KiB限制。")
  const raw: unknown = JSON.parse(json)
  safeValue(raw)
  const doc = object(raw, "图文档")
  keys(
    doc,
    [
      "schemaVersion",
      "id",
      "revision",
      "nodes",
      "edges",
      "frames",
      "notes",
      "viewport",
    ],
    "图文档",
  )
  if (doc.schemaVersion !== 1)
    throw new Error("不兼容的 schemaVersion；当前仅支持版本1。")
  id(doc.id, "文档ID")
  number(doc.revision, "revision", 0, Number.MAX_SAFE_INTEGER)
  if (!Number.isInteger(doc.revision)) throw new Error("revision必须是整数。")
  for (const [key, max] of [
    ["nodes", canvasLimits.nodes],
    ["edges", canvasLimits.edges],
    ["frames", canvasLimits.annotations],
    ["notes", canvasLimits.annotations],
  ] as const)
    if (!Array.isArray(doc[key]) || (doc[key] as unknown[]).length > max)
      throw new Error(`${key}必须是数组且不超过${max}项。`)
  const seen = new Set<string>()
  const records = (key: "nodes" | "edges" | "frames" | "notes") =>
    (doc[key] as unknown[]).map((value, index) => {
      const record = object(value, `${key}[${index}]`)
      const valueId = id(record.id, `${key} ID`)
      if (seen.has(valueId)) throw new Error(`ID重复：${valueId}。`)
      seen.add(valueId)
      return record
    })
  const nodes = records("nodes"),
    edges = records("edges"),
    frames = records("frames"),
    notes = records("notes")
  for (const node of nodes) {
    keys(
      node,
      ["id", "type", "title", "position", "config", "bindings", "parentId"],
      "节点",
    )
    text(node.type, "节点类型")
    text(node.title, "节点标题")
    point(node.position, "节点位置")
    object(node.config, "节点config")
    if (
      node.parentId !== undefined &&
      !frames.some((frame) => frame.id === node.parentId)
    )
      throw new Error(`节点 ${node.id} 引用了不存在的 Frame。`)
    if (node.bindings !== undefined)
      for (const value of Object.values(object(node.bindings, "变量引用"))) {
        const ref = object(value, "变量")
        keys(ref, ["nodeId", "portId", "path", "type"], "变量")
        id(ref.nodeId, "变量来源ID")
        id(ref.portId, "变量端口ID")
        text(ref.type, "变量类型")
        if (
          ![
            "string",
            "number",
            "boolean",
            "object",
            "array",
            "message",
            "tool",
            "model",
          ].includes(ref.type as string)
        )
          throw new Error("变量类型无效。")
        if (
          !Array.isArray(ref.path) ||
          !ref.path.every(
            (value) => typeof value === "string" && value.length <= 200,
          )
        )
          throw new Error("变量path必须是文本数组。")
      }
  }
  for (const edge of edges) {
    keys(
      edge,
      ["id", "source", "sourcePort", "target", "targetPort", "label"],
      "连线",
    )
    for (const key of ["source", "sourcePort", "target", "targetPort"])
      id(edge[key], key)
    if (edge.label !== undefined) text(edge.label, "连线标签")
  }
  for (const frame of frames) {
    keys(frame, ["id", "title", "position", "width", "height"], "Frame")
    text(frame.title, "Frame标题")
    point(frame.position, "Frame位置")
    number(frame.width, "Frame宽度", 240, 10000)
    number(frame.height, "Frame高度", 120, 10000)
  }
  for (const note of notes) {
    keys(note, ["id", "text", "position"], "Note")
    text(note.text, "Note正文", 4000)
    point(note.position, "Note位置")
  }
  if (doc.viewport !== undefined) {
    const viewport = object(doc.viewport, "viewport")
    point(viewport, "viewport")
    number(viewport.zoom, "zoom", 0.25, 2)
  }
  const document = raw as CanvasDocument
  const errors = validateCanvasDocument(document, definitions, policy).filter(
    (issue) =>
      issue.severity === "error" &&
      !(options?.allowInvalidBindings && issue.code === "variable"),
  )
  if (errors.length) throw new Error(errors[0].message)
  return document
}

export function exportCanvasDocument(document: CanvasDocument): string {
  // Only the versioned graph schema is exported; execution snapshots are a separate prop.
  return redact({
    schemaVersion: document.schemaVersion,
    id: document.id,
    revision: document.revision,
    nodes: document.nodes.map(
      ({ id, type, title, position, config, bindings, parentId }) => ({
        id,
        type,
        title,
        position,
        config,
        bindings,
        parentId,
      }),
    ),
    edges: document.edges,
    frames: document.frames,
    notes: document.notes,
    viewport: document.viewport,
  })
}
