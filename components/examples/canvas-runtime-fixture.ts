import { canvasId } from "@/lib/canvas-model"
import type {
  CanvasRuntimeAdapter,
  CanvasRunSnapshot,
} from "@/lib/canvas-runtime"

export type CanvasFixtureScenario =
  "success" | "failure" | "approval" | "unknown" | "disconnect"
/** Deterministic local fixtures. Queries explicitly advance fixture stages, never real services. */
export function createCanvasRuntimeFixture() {
  let scenario: CanvasFixtureScenario = "success"
  let snapshot: CanvasRunSnapshot | undefined
  let previous: CanvasRunSnapshot | undefined
  const starts = new Map<string, CanvasRunSnapshot>()
  let stopped = false
  let decided = false
  let offline = false
  const calls = { run: 0, stop: 0, decide: 0, query: 0 }
  function change(status: string, action: string) {
    if (!snapshot) throw new Error("No run")
    snapshot = {
      ...snapshot,
      sequence: snapshot.sequence + 1,
      status,
      events: [
        ...snapshot.events,
        {
          id: canvasId("event"),
          sequence: snapshot.sequence + 1,
          time: "12:00:00",
          action,
          status,
        },
      ],
    }
    return structuredClone(snapshot)
  }
  const adapter: CanvasRuntimeAdapter = {
    scopes: ["all", "node", "from", "to"],
    async run(request) {
      calls.run++
      previous = snapshot ? structuredClone(snapshot) : undefined
      stopped = decided = offline = false
      snapshot = {
        documentId: request.document.id,
        documentRevision: request.document.revision,
        runId: canvasId("fixture-run"),
        sequence: 1,
        status: "running",
        nodes: Object.fromEntries(
          request.document.nodes.map((node, index) => [
            node.id,
            {
              status: index === 0 ? "completed" : "queued",
              attemptId: `attempt-${node.id}`,
              input: {
                text: "本地 fixture 输入",
                api_key: "fixture-secret-never-display",
              },
            },
          ]),
        ),
        edges: Object.fromEntries(
          request.document.edges.map((edge) => [edge.id, { status: "queued" }]),
        ),
        events: [
          {
            id: "start",
            sequence: 1,
            time: "12:00:00",
            action: "本地 fixture 已接受运行请求",
            status: "running",
          },
        ],
        variables: { result: "仅用于验证 UI，不是模型输出" },
        receipt: request.requestId,
      }
      starts.set(request.requestId, snapshot)
      if (scenario === "unknown")
        throw new Error("Lost response after accepting start")
      return structuredClone(snapshot)
    },
    async reconcileStart(requestId) {
      return structuredClone(starts.get(requestId) ?? null)
    },
    async query(runId) {
      calls.query++
      if (!snapshot || snapshot.runId !== runId)
        throw new Error("Run not found")
      if (scenario === "disconnect" && !offline) {
        offline = true
        throw new Error("Offline")
      }
      if (stopped) {
        snapshot.nodes = Object.fromEntries(
          Object.entries(snapshot.nodes).map(([id, node]) => [
            id,
            {
              ...node,
              status: node.status === "completed" ? "completed" : "cancelled",
            },
          ]),
        )
        return change("cancelled", "来源确认已停止（fixture）")
      }
      const targetId = snapshot.nodes.approval
        ? "approval"
        : snapshot.nodes.tool
          ? "tool"
          : (Object.keys(snapshot.nodes)[1] ?? Object.keys(snapshot.nodes)[0])
      if ((scenario === "approval" || scenario === "unknown") && !decided) {
        snapshot.nodes = {
          ...snapshot.nodes,
          [targetId]: {
            ...snapshot.nodes[targetId],
            status: "waiting",
            approval: {
              id: "approval-1",
              scope: "示例文件写入，不执行真实写操作",
              risk: "仅验证显式审批与重复请求保护",
            },
          },
        }
        return change("waiting", "等待人工审批（fixture）")
      }
      const status = scenario === "failure" ? "failed" : "completed"
      snapshot.nodes = Object.fromEntries(
        Object.entries(snapshot.nodes).map(([id, node]) => [
          id,
          {
            ...node,
            status:
              status === "failed" && id === targetId ? "failed" : "completed",
            approval: undefined,
            output: {
              result: "fixture 输出",
              authorization: "Bearer fixture-secret",
              nested: { password: "private" },
            },
            error:
              status === "failed" && id === targetId
                ? "示例工具失败：token=private-token"
                : undefined,
            tokens: id === "agent" ? 128 : undefined,
            duration: "0.2s",
            trace: Array.from(
              { length: 240 },
              (_, index) => `trace ${index}`,
            ).join("\n"),
          },
        ]),
      )
      snapshot.edges = Object.fromEntries(
        Object.keys(snapshot.edges ?? {}).map((id) => [id, { status }]),
      )
      return change(status, `来源确认${status}（fixture）`)
    },
    async stop({ runId }) {
      calls.stop++
      if (!snapshot || snapshot.runId !== runId)
        throw new Error("Run not found")
      stopped = true
      return change(
        snapshot.status,
        "停止请求已收到，等待执行器确认（fixture）",
      )
    },
    async decide({ runId, nodeId, attemptId, approvalId, decision }) {
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
      stopped = decision === "reject"
      snapshot.nodes = {
        ...snapshot.nodes,
        [nodeId]: {
          ...node,
          status: decision === "reject" ? "cancelled" : "running",
          approval: undefined,
        },
      }
      const result = change(
        decision === "reject" ? "cancelled" : "running",
        "审批决定已确认（fixture）",
      )
      if (scenario === "unknown") throw new Error("Lost decision response")
      return result
    },
  }
  return {
    adapter,
    setScenario(value: CanvasFixtureScenario) {
      scenario = value
    },
    getSnapshot: () => snapshot && structuredClone(snapshot),
    getPrevious: () => previous && structuredClone(previous),
    getCalls: () => ({ ...calls }),
  }
}
