import type {
  CanvasDocument,
  CanvasExecutionSnapshot,
  CanvasNodeDefinition,
  CanvasValue,
} from "@/lib/canvas-model"
import {
  validateCanvasDocument,
  upstreamCanvasNodes,
} from "@/lib/canvas-validation"

export type CanvasRunScope = "all" | "node" | "from" | "to"
export type CanvasRuntimeEvent = {
  id: string
  sequence: number
  time: string
  action: string
  status: string
  nodeId?: string
  detail?: unknown
}
export type CanvasNodeExecution = CanvasExecutionSnapshot["nodes"][string] & {
  input?: unknown
  output?: unknown
  details?: unknown
  trace?: unknown
  context?: number
  artifacts?: string[]
  error?: string
  approval?: { id: string; scope: string; risk: string }
}
/** A complete authoritative snapshot, never a client-inferred node/edge transition. */
export type CanvasRunSnapshot = CanvasExecutionSnapshot & {
  documentId: string
  sequence: number
  status: string
  outcome?: "known" | "unknown"
  nodes: Record<string, CanvasNodeExecution>
  events: CanvasRuntimeEvent[]
  variables?: Record<string, CanvasValue>
  receipt?: string
  requests?: Record<string, "submitted" | "confirmed" | "rejected">
}
export type CanvasRunRequest = {
  requestId: string
  document: CanvasDocument
  scope: CanvasRunScope
  nodeId?: string
  inputs?: Record<string, Record<string, CanvasValue>>
}
export type CanvasRuntimeAdapter = {
  scopes: CanvasRunScope[]
  run: (request: CanvasRunRequest) => Promise<CanvasRunSnapshot>
  query: (runId: string) => Promise<CanvasRunSnapshot>
  stop?: (request: {
    runId: string
    requestId: string
  }) => Promise<CanvasRunSnapshot>
  decide?: (request: {
    runId: string
    nodeId: string
    attemptId: string
    approvalId: string
    decision: "approve" | "reject"
    requestId: string
  }) => Promise<CanvasRunSnapshot>
  /** Query an uncertain start by idempotency key; must not start another run. */
  reconcileStart?: (requestId: string) => Promise<CanvasRunSnapshot | null>
}
export function canvasRuntimeUnknown(snapshot?: CanvasRunSnapshot) {
  return (
    snapshot?.outcome === "unknown" ||
    Object.values(snapshot?.nodes ?? {}).some(
      (node) => node.outcome === "unknown",
    )
  )
}
export type CanvasRuntimeState = {
  documentId: string
  snapshot?: CanvasRunSnapshot
  transport: "connected" | "disconnected"
  readError?: string
  uncertain?: string
  pending?: string
  awaiting?: string
}
export function acceptCanvasRunSnapshot(
  state: CanvasRuntimeState,
  next: CanvasRunSnapshot,
  establish = false,
): CanvasRuntimeState {
  if (
    next.documentId !== state.documentId ||
    !next.runId ||
    !Number.isSafeInteger(next.sequence) ||
    next.sequence < 0 ||
    !Number.isSafeInteger(next.documentRevision) ||
    next.documentRevision < 0
  )
    return state
  const old = state.snapshot
  if (
    !establish &&
    (!old ||
      old.runId !== next.runId ||
      old.documentRevision !== next.documentRevision ||
      next.sequence < old.sequence)
  )
    return state
  if (!establish && old?.sequence === next.sequence)
    return {
      ...state,
      transport: "connected",
      pending: undefined,
      readError: undefined,
    }
  const snapshot =
    !establish && old?.sequence === next.sequence
      ? old
      : {
          ...next,
          events: [
            ...new Map(
              next.events
                .filter((event) => event.sequence <= next.sequence)
                .sort((a, b) => a.sequence - b.sequence)
                .map((event) => [event.id, event]),
            ).values(),
          ].slice(-500),
        }
  return { documentId: state.documentId, snapshot, transport: "connected" }
}
export function canvasRunProblem(
  document: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  scope: CanvasRunScope,
  nodeId?: string,
  inputs?: CanvasRunRequest["inputs"],
): string | undefined {
  if (!document.nodes.length) return "画布没有可运行节点。"
  const issues = validateCanvasDocument(document, definitions)
  const invalid = issues.find(
    (issue) =>
      issue.severity === "error" ||
      issue.code === "unknown-type" ||
      issue.code === "config" ||
      (scope === "all" && issue.code === "required-port"),
  )
  if (invalid) return invalid.message
  if (scope === "all") return undefined
  const node = document.nodes.find((node) => node.id === nodeId)
  if (!node) return "请先选择一个运行节点。"
  const included = new Set([node.id])
  if (scope === "to")
    for (const id of upstreamCanvasNodes(document, node.id)) included.add(id)
  if (scope === "from") {
    let changed = true
    while (changed) {
      changed = false
      for (const edge of document.edges)
        if (included.has(edge.source) && !included.has(edge.target)) {
          included.add(edge.target)
          changed = true
        }
    }
  }
  for (const target of document.nodes.filter((node) => included.has(node.id))) {
    for (const port of definitions.find((def) => def.type === target.type)
      ?.ports ?? []) {
      if (port.direction !== "input" || !port.required) continue
      const internal = document.edges.some(
        (edge) =>
          edge.target === target.id &&
          edge.targetPort === port.id &&
          included.has(edge.source),
      )
      if (!internal && inputs?.[target.id]?.[port.id] === undefined)
        return `${target.title} / ${port.label} 缺少本次运行的上游输入，请由调用方提供。`
    }
  }
}
