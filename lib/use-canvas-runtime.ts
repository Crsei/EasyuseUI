"use client"

import { useEffect, useRef, useState } from "react"
import {
  canvasId,
  type CanvasDocument,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"
import {
  acceptCanvasRunSnapshot,
  canvasRunProblem,
  canvasRuntimeUnknown,
  type CanvasRuntimeAdapter,
  type CanvasRuntimeState,
  type CanvasRunSnapshot,
  type CanvasRunScope,
  type CanvasRunRequest,
} from "@/lib/canvas-runtime"

/** Optional controller. Request acceptance never implies execution completion. */
export function useCanvasRuntime(
  document: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  adapter: CanvasRuntimeAdapter,
) {
  const initial: CanvasRuntimeState = {
    documentId: document.id,
    transport: "connected",
  }
  const [stored, setStored] = useState(initial)
  const state = stored.documentId === document.id ? stored : initial
  const current = useRef(initial)
  const owner = useRef({ id: document.id, adapter, generation: 0 })
  const confirmation = useRef<
    ((snapshot: CanvasRunSnapshot) => boolean) | undefined
  >(undefined)
  const busy = useRef(false)
  const blocked = useRef(false)
  const startVersion = useRef<number | undefined>(undefined)
  const startRequest = useRef<string | undefined>(undefined)
  useEffect(() => {
    owner.current = {
      id: document.id,
      adapter,
      generation: owner.current.generation + 1,
    }
    busy.current = false
    blocked.current = false
    startRequest.current = undefined
    startVersion.current = undefined
    confirmation.current = undefined
    return () => {
      owner.current.generation++
    }
  }, [document.id, adapter])
  function latest() {
    return current.current.documentId === document.id
      ? current.current
      : initial
  }
  function commit(next: CanvasRuntimeState) {
    current.current = next
    setStored(next)
  }
  async function operate(
    label: string,
    read: boolean,
    action: () => Promise<CanvasRunSnapshot | null>,
    establish = false,
    confirm?: (snapshot: CanvasRunSnapshot) => boolean,
  ) {
    if (
      busy.current ||
      (!read && (blocked.current || canvasRuntimeUnknown(latest().snapshot)))
    )
      return
    const token = { ...owner.current }
    const active = () =>
      owner.current.generation === token.generation &&
      owner.current.id === token.id &&
      owner.current.adapter === token.adapter
    busy.current = true
    if (!read) confirmation.current = confirm
    commit({ ...latest(), pending: label, readError: undefined })
    try {
      const result = await action()
      if (!active()) return
      if (!result) {
        blocked.current = false
        confirmation.current = undefined
        startRequest.current = undefined
        commit({
          ...latest(),
          pending: undefined,
          uncertain: undefined,
          awaiting: undefined,
          readError: "来源确认此请求未创建运行。",
        })
        return
      }
      const before = latest()
      if (
        establish &&
        startVersion.current !== undefined &&
        result.documentRevision !== startVersion.current
      ) {
        blocked.current = true
        commit({
          ...before,
          pending: undefined,
          uncertain: "启动回执的文档版本不匹配，请查询原请求确认。",
        })
        return
      }
      const accepted = acceptCanvasRunSnapshot(before, result, establish)
      if (accepted === before) {
        if (!read) blocked.current = true
        commit({
          ...before,
          pending: undefined,
          readError: "来源返回的运行身份或序号不匹配，保留当前快照。",
          ...(!read
            ? { uncertain: "写请求回执不匹配；先查询确认，禁止重复提交。" }
            : {}),
        })
        return
      }
      if (
        establish ||
        !before.snapshot ||
        result.sequence > before.snapshot.sequence
      ) {
        const confirmed = !confirmation.current || confirmation.current(result)
        blocked.current = canvasRuntimeUnknown(result) || !confirmed
        if (confirmed) confirmation.current = undefined
        startRequest.current = undefined
        commit(
          confirmed
            ? accepted
            : {
                ...accepted,
                uncertain: before.uncertain,
                awaiting:
                  "操作请求已收到，尚待来源确认最终结果；请查询，不能重复提交。",
              },
        )
      } else {
        if (!read) blocked.current = true
        commit({
          ...accepted,
          ...(!read
            ? {
                awaiting: `${label}请求已提交，等待来源推进状态；查询确认前不可重复提交。`,
              }
            : {}),
        })
      }
    } catch {
      if (!active()) return
      if (!read) blocked.current = true
      commit({
        ...latest(),
        pending: undefined,
        transport: "disconnected",
        ...(read
          ? { readError: "读取运行失败，保留已有状态和输出。" }
          : { uncertain: `${label}结果未确认；先查询回执，禁止重复提交。` }),
      })
    } finally {
      if (active()) busy.current = false
    }
  }
  function run(
    scope: CanvasRunScope = "all",
    nodeId?: string,
    inputs?: CanvasRunRequest["inputs"],
  ) {
    if (busy.current || blocked.current) return
    const problem = canvasRunProblem(
      document,
      definitions,
      scope,
      nodeId,
      inputs,
    )
    if (problem || !adapter.scopes.includes(scope)) {
      commit({ ...latest(), readError: problem ?? "来源未提供此运行能力。" })
      return
    }
    const snapshot = latest().snapshot
    if (
      snapshot &&
      !["completed", "failed", "cancelled"].includes(snapshot.status)
    )
      return
    const requestId = canvasId("run-request")
    return operate(
      "启动运行",
      false,
      () => {
        startRequest.current = requestId
        startVersion.current = document.revision
        return adapter.run({
          requestId,
          document: structuredClone(document),
          scope,
          nodeId,
          inputs,
        })
      },
      true,
    )
  }
  function query() {
    if (startRequest.current && adapter.reconcileStart)
      return operate(
        "查询启动回执",
        true,
        () => adapter.reconcileStart!(startRequest.current!),
        true,
      )
    const snapshot = latest().snapshot
    if (snapshot)
      return operate("查询运行", true, () => adapter.query(snapshot.runId))
  }
  function stop() {
    const snapshot = latest().snapshot
    if (
      !snapshot ||
      !adapter.stop ||
      ["completed", "failed", "cancelled"].includes(snapshot.status)
    )
      return
    const requestId = canvasId("stop")
    return operate(
      "停止",
      false,
      () => adapter.stop!({ runId: snapshot.runId, requestId }),
      false,
      (result) =>
        ["confirmed", "rejected"].includes(
          result.requests?.[requestId] ?? "",
        ) ||
        (!canvasRuntimeUnknown(result) &&
          ["completed", "failed", "cancelled"].includes(result.status)),
    )
  }
  function decide(nodeId: string, decision: "approve" | "reject") {
    const snapshot = latest().snapshot,
      node = snapshot?.nodes[nodeId]
    if (
      !snapshot ||
      !node?.approval ||
      node.status !== "waiting" ||
      node.outcome === "unknown" ||
      !adapter.decide
    )
      return
    const requestId = canvasId("approval")
    return operate(
      decision === "approve" ? "批准" : "拒绝",
      false,
      () =>
        adapter.decide!({
          runId: snapshot.runId,
          nodeId,
          attemptId: node.attemptId,
          approvalId: node.approval!.id,
          decision,
          requestId,
        }),
      false,
      (result) =>
        ["confirmed", "rejected"].includes(
          result.requests?.[requestId] ?? "",
        ) ||
        (result.nodes[nodeId]?.attemptId === node.attemptId &&
          result.nodes[nodeId]?.status !== "waiting" &&
          !result.nodes[nodeId]?.approval &&
          !canvasRuntimeUnknown(result)),
    )
  }
  function receive(snapshot: CanvasRunSnapshot) {
    const before = latest(),
      accepted = acceptCanvasRunSnapshot(before, snapshot)
    if (accepted === before) return
    const confirmed = !confirmation.current || confirmation.current(snapshot)
    if (snapshot.sequence > (before.snapshot?.sequence ?? -1)) {
      blocked.current = canvasRuntimeUnknown(snapshot) || !confirmed
      if (confirmed) confirmation.current = undefined
    }
    commit(
      confirmed
        ? accepted
        : {
            ...accepted,
            uncertain: before.uncertain,
            awaiting: before.awaiting,
          },
    )
  }
  return { state, adapter, run, query, stop, decide, receive }
}
export type CanvasRuntimeController = ReturnType<typeof useCanvasRuntime>
