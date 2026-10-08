"use client"
import { useRef, useState } from "react"
import { mergeRunSnapshots } from "@/lib/agent-board-view"
import type {
  AttentionAction,
  AttentionRecord,
  ActionReceipt,
} from "@/lib/agent-board-model"
import { createAgentBoardFixtures, fixtureTime } from "./fixtures"
export type ExampleScenario =
  | "normal"
  | "unknown"
  | "rejected"
  | "expired"
  | "readonly"
  | "disconnected"
  | "error"
  | "partial"
  | "loading"
  | "empty"
  | "long"
export function useAgentBoardExample() {
  const [fixture, setFixture] = useState(createAgentBoardFixtures)
  const [scenario, setScenario] = useState<ExampleScenario>("normal")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const generation = useRef(0)
  const locks = useRef(new Map<string, string>())
  const eventSequence = useRef(0)
  function reset(next: ExampleScenario = "normal") {
    generation.current++
    locks.current.clear()
    eventSequence.current = 0
    setScenario(next)
    setDrafts({})
    const nextFixture = createAgentBoardFixtures()
    if (next === "expired") nextFixture.attention[0].expired = true
    if (next === "readonly")
      nextFixture.attention[0].disabledReason = "调用方未授权当前用户处理此请求"
    if (next === "empty") nextFixture.runs = []
    if (next === "long")
      nextFixture.runs[4].title = "长标题与边界检查：".repeat(30)
    if (next === "disconnected")
      nextFixture.attention.push({
        attentionId: "attention-disconnect",
        runId: "run-3",
        revision: 1,
        kind: "disconnect",
        title: "来源连接中断",
        reason: "保留最后确认的运行状态和产物",
        allowedActions: [],
      })
    setFixture(nextFixture)
  }
  async function action(
    request: AttentionRecord,
    operation: AttentionAction | "reconcile",
  ) {
    const current = fixture.attention.find(
      (item) => item.attentionId === request.attentionId,
    )
    if (
      !current ||
      current.revision !== request.revision ||
      locks.current.has(request.attentionId) ||
      current.operation?.state === "confirmed"
    )
      return
    const unknown =
      current.operation?.state === "unknown" || current.kind === "unknown"
    if (
      operation !== "reconcile" &&
      (unknown ||
        current.expired ||
        current.disabledReason ||
        !current.allowedActions.includes(operation))
    )
      return
    const token = crypto.randomUUID()
    const version = generation.current
    locks.current.set(current.attentionId, token)
    const intent = {
      attentionId: current.attentionId,
      runId: current.runId,
      baseRevision: current.revision,
      operationId: token,
      action: operation,
      response: drafts[current.attentionId],
    }
    setFixture((before) => ({
      ...before,
      attention: before.attention.map((item) =>
        item.attentionId === current.attentionId
          ? { ...item, operation: { state: "pending" } }
          : item,
      ),
    }))
    // A local simulated receipt. No execution, storage or authority is implied.
    const receipt: ActionReceipt = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            outcome:
              operation === "reconcile"
                ? "confirmed"
                : scenario === "unknown"
                  ? "unknown"
                  : scenario === "rejected"
                    ? "rejected"
                    : "confirmed",
            message: `local-fixture · ${intent.operationId}`,
          }),
        220,
      ),
    )
    if (
      generation.current !== version ||
      locks.current.get(current.attentionId) !== token
    )
      return
    locks.current.delete(current.attentionId)
    setFixture((before) => ({
      ...before,
      attention: before.attention.map((item) =>
        item.attentionId === current.attentionId &&
        item.revision === intent.baseRevision
          ? {
              ...item,
              operation: { state: receipt.outcome, message: receipt.message },
            }
          : item,
      ),
    }))
  }
  function advance() {
    eventSequence.current++
    const sequence = eventSequence.current
    setFixture((before) => {
      const run = before.runs.find((item) => item.runId === "run-3")
      const updated = run
        ? {
            ...run,
            revision: run.revision + 1,
            stage: {
              ...run.stage,
              name: `来源阶段 ${sequence}`,
              planVersion: `v${sequence + 1}`,
            },
          }
        : undefined
      const event = {
        id: `event-${sequence}`,
        time: fixtureTime,
        type: "fixture",
        action: `示例事件 ${sequence}`,
        status: "waiting",
      }
      return {
        ...before,
        runs: mergeRunSnapshots(
          before.runs,
          updated
            ? [updated, { ...updated, revision: 0, title: "STALE RESPONSE" }]
            : [],
        ),
        events: {
          ...before.events,
          "run-5": [
            ...new Map(
              [...(before.events["run-5"] ?? []), event, event].map((item) => [
                item.id,
                item,
              ]),
            ).values(),
          ],
        },
      }
    })
  }
  return {
    fixture,
    scenario,
    reset,
    advance,
    drafts,
    setDraft: (id: string, value: string) =>
      setDrafts((before) => ({ ...before, [id]: value })),
    action,
  }
}
