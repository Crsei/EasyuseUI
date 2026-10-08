import { canvasId } from "@/lib/canvas-model"
import type { CanvasDocument } from "@/lib/canvas-model"
import type {
  CanvasRuntimeAdapter,
  CanvasRunRequest,
  CanvasRunSnapshot,
} from "@/lib/canvas-runtime"

export type CanvasFixtureScenario =
  "success" | "failure" | "approval" | "unknown" | "disconnect"
const terminal = (status: string) =>
  ["completed", "failed", "cancelled"].includes(status)

/** A serial topological presentation fixture, not a model/tool/branch executor. */
function orderFor(request: CanvasRunRequest) {
  const { document, scope, nodeId } = request
  const included = new Set(
    scope === "all" ? document.nodes.map((n) => n.id) : nodeId ? [nodeId] : [],
  )
  if (scope === "from" || scope === "to") {
    let changed = true
    while (changed) {
      changed = false
      for (const edge of document.edges) {
        const source = scope === "from" ? edge.source : edge.target
        const target = scope === "from" ? edge.target : edge.source
        if (included.has(source) && !included.has(target)) {
          included.add(target)
          changed = true
        }
      }
    }
  }
  const pending = document.nodes
    .filter((node) => included.has(node.id))
    .map((node) => node.id)
  const ordered: string[] = []
  while (pending.length) {
    const index = pending.findIndex(
      (id) =>
        !document.edges.some(
          (e) => e.target === id && pending.includes(e.source),
        ),
    )
    if (index === -1) throw new Error("Fixture requires an acyclic graph")
    ordered.push(...pending.splice(index, 1))
  }
  if (!ordered.length) throw new Error("No fixture nodes")
  return ordered
}
/** Queries are read-only; only advance() produces another local demonstration stage. */
export function createCanvasRuntimeFixture() {
  let scenario: CanvasFixtureScenario = "success",
    activeScenario: CanvasFixtureScenario = scenario
  let snapshot: CanvasRunSnapshot | undefined,
    previous: CanvasRunSnapshot | undefined
  let document: CanvasDocument | undefined
  const starts = new Map<string, string>()
  let order: string[] = [],
    index = 0,
    phase: "node" | "transfer" = "node"
  let stopped = false,
    decided = false,
    offline = false
  const calls = { run: 0, stop: 0, decide: 0, query: 0 }
  const copy = () => snapshot && structuredClone(snapshot)
  const target = () =>
    order.includes("approval")
      ? "approval"
      : order.includes("tool")
        ? "tool"
        : (order[1] ?? order[0])
  function change(status: string, action: string, nodeId?: string) {
    if (!snapshot) throw new Error("No run")
    const sequence = snapshot.sequence + 1
    snapshot = {
      ...snapshot,
      sequence,
      status,
      events: [
        ...snapshot.events,
        {
          id: canvasId("event"),
          sequence,
          time: new Date().toISOString(),
          action,
          status,
          nodeId,
        },
      ].slice(-500),
    }
    return structuredClone(snapshot)
  }
  function cancelPending() {
    if (!snapshot) return
    for (const node of Object.values(snapshot.nodes)) {
      if (!terminal(node.status)) node.status = "cancelled"
      node.approval = undefined
    }
    for (const edge of Object.values(snapshot.edges ?? {}))
      if (!terminal(edge.status)) edge.status = "cancelled"
  }
  function startNode(id: string) {
    if (!snapshot) throw new Error("No run")
    const node = snapshot.nodes[id]
    if (
      id === target() &&
      !decided &&
      ["approval", "unknown"].includes(activeScenario)
    ) {
      node.status = "waiting"
      node.approval = {
        id: "approval-1",
        scope: "示例文件写入，不执行真实写操作",
        risk: "仅验证显式审批与重复请求保护",
      }
      return change("waiting", "等待人工审批（fixture）", id)
    }
    node.status = "running"
    return change("running", "节点执行中（fixture）", id)
  }
  function advance(runId: string, sequence: number) {
    if (
      !snapshot ||
      snapshot.runId !== runId ||
      snapshot.sequence !== sequence ||
      terminal(snapshot.status)
    )
      return
    if (stopped) {
      cancelPending()
      for (const id of Object.keys(snapshot.requests ?? {}))
        snapshot.requests![id] = "confirmed"
      return change("cancelled", "来源确认已停止（fixture）")
    }
    if (snapshot.status === "waiting") return
    if (activeScenario === "disconnect" && !offline) throw new Error("Offline")
    const id = order[index]
    if (phase === "transfer") {
      for (const edge of document!.edges)
        if (edge.target === id && snapshot.edges?.[edge.id])
          snapshot.edges[edge.id].status = "completed"
      phase = "node"
      return startNode(id)
    }
    if (activeScenario === "failure" && id === target()) {
      snapshot.nodes[id].status = "failed"
      snapshot.nodes[id].error = "示例工具失败：token=private-token"
      for (const edge of document!.edges)
        if (edge.target === id && snapshot.edges?.[edge.id])
          snapshot.edges[edge.id].status = "failed"
      cancelPending()
      return change("failed", "来源确认failed（fixture）", id)
    }
    Object.assign(snapshot.nodes[id], {
      status: "completed",
      output: {
        result: "fixture 输出",
        authorization: "Bearer fixture-secret",
        nested: { password: "private" },
      },
      tokens: id === "agent" ? 128 : undefined,
      duration: "1.0s",
      trace: Array.from({ length: 240 }, (_, n) => `trace ${n}`).join("\n"),
    })
    if (++index === order.length)
      return change("completed", "来源确认completed（fixture）", id)
    const next = order[index]
    const incoming = document!.edges.filter(
      (e) => e.target === next && snapshot!.edges?.[e.id],
    )
    if (incoming.length) {
      for (const edge of incoming) snapshot.edges![edge.id].status = "running"
      phase = "transfer"
      return change("running", "节点完成，连线传递中（fixture）", id)
    }
    return startNode(next)
  }
  const adapter: CanvasRuntimeAdapter = {
    scopes: ["all", "node", "from", "to"],
    async run(request) {
      calls.run++
      order = orderFor(request)
      document = structuredClone(request.document)
      activeScenario = scenario
      previous = copy()
      stopped = decided = offline = false
      index = 0
      phase = "node"
      snapshot = {
        documentId: document.id,
        documentRevision: document.revision,
        runId: canvasId("fixture-run"),
        sequence: 1,
        status: "running",
        nodes: Object.fromEntries(
          order.map((id, i) => [
            id,
            {
              status: i === 0 ? "running" : "queued",
              attemptId: `attempt-${id}`,
              input: {
                text: "本地 fixture 输入",
                api_key: "fixture-secret-never-display",
              },
            },
          ]),
        ),
        edges: Object.fromEntries(
          document.edges
            .filter((e) => order.includes(e.source) && order.includes(e.target))
            .map((e) => [e.id, { status: "queued" }]),
        ),
        events: [
          {
            id: "start",
            sequence: 1,
            time: new Date().toISOString(),
            action: "本地 fixture 已接受运行请求",
            status: "running",
            nodeId: order[0],
          },
        ],
        variables: { result: "仅用于验证 UI，不是模型输出" },
        receipt: request.requestId,
      }
      starts.clear()
      starts.set(request.requestId, snapshot.runId)
      if (
        order[0] === target() &&
        ["approval", "unknown"].includes(activeScenario)
      )
        startNode(order[0])
      if (activeScenario === "unknown")
        throw new Error("Lost response after accepting start")
      return structuredClone(snapshot)
    },
    async reconcileStart(requestId) {
      return starts.get(requestId) === snapshot?.runId
        ? structuredClone(snapshot!)
        : null
    },
    async query(runId) {
      calls.query++
      if (!snapshot || snapshot.runId !== runId)
        throw new Error("Run not found")
      if (activeScenario === "disconnect" && !offline) {
        offline = true
        throw new Error("Offline")
      }
      return structuredClone(snapshot)
    },
    async stop({ runId, requestId }) {
      calls.stop++
      if (!snapshot || snapshot.runId !== runId || terminal(snapshot.status))
        throw new Error("Run not active")
      stopped = true
      snapshot.requests = { ...snapshot.requests, [requestId]: "submitted" }
      return change(
        snapshot.status,
        "停止请求已收到，等待执行器确认（fixture）",
      )
    },
    async decide({
      runId,
      nodeId,
      attemptId,
      approvalId,
      decision,
      requestId,
    }) {
      calls.decide++
      const node = snapshot?.nodes[nodeId]
      if (
        !snapshot ||
        snapshot.runId !== runId ||
        node?.attemptId !== attemptId ||
        node.approval?.id !== approvalId ||
        decided
      )
        throw new Error("Invalid or duplicate approval")
      decided = true
      snapshot.requests = { ...snapshot.requests, [requestId]: "confirmed" }
      node.approval = undefined
      if (decision === "reject") {
        cancelPending()
        change("cancelled", "审批决定已确认（fixture）", nodeId)
      } else {
        node.status = "running"
        change("running", "审批决定已确认（fixture）", nodeId)
      }
      if (activeScenario === "unknown")
        throw new Error("Lost decision response")
      return structuredClone(snapshot)
    },
  }
  return {
    adapter,
    advance,
    stopPending: (runId: string) =>
      snapshot?.runId === runId && stopped && !terminal(snapshot.status),
    setScenario(value: CanvasFixtureScenario) {
      scenario = value
    },
    getSnapshot: copy,
    getPrevious: () => previous && structuredClone(previous),
    getCalls: () => ({ ...calls }),
  }
}
