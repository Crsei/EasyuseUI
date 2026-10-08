"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { ActivityTimeline } from "@/components/blocks/activity-timeline"
import { ToolCall } from "@/components/blocks/tool-call"
import { Inspector } from "@/components/blocks/inspector"
import { DataRegion } from "@/components/ui/data-region"
import { previewText, redact, redactText } from "@/lib/redact"
import { canvasRunProblem, canvasRuntimeUnknown } from "@/lib/canvas-runtime"
import type { CanvasRuntimeController } from "@/lib/use-canvas-runtime"
import type { CanvasDocument, CanvasNodeDefinition } from "@/lib/canvas-model"
import styles from "./canvas-controls.module.css"

function bounded(value: unknown) {
  if (value === undefined) return "—"
  const preview = previewText(redact(value))
  return (
    preview.text + (preview.truncated ? "\n[预览已截断：200 行 / 32KiB]" : "")
  )
}
export type CanvasExecutionPanelProps = {
  runtime: CanvasRuntimeController
  document: CanvasDocument
  definitions: CanvasNodeDefinition[]
  nodeId?: string
  readOnly?: boolean
}
export function CanvasRunControls({
  runtime,
  document,
  definitions,
  nodeId,
  readOnly,
}: CanvasExecutionPanelProps) {
  const { state, adapter } = runtime
  const [scope, setScope] = useState<"all" | "node" | "from" | "to">("all")
  const targetId = scope === "all" ? undefined : nodeId
  const problem = useMemo(
    () => canvasRunProblem(document, definitions, scope, targetId),
    [document, definitions, scope, targetId],
  )
  const active =
    state.snapshot &&
    !["completed", "failed", "cancelled"].includes(state.snapshot.status)
  const locked =
    readOnly ||
    !!state.pending ||
    !!state.uncertain ||
    !!state.awaiting ||
    canvasRuntimeUnknown(state.snapshot)
  return (
    <div className={styles.actions} aria-label="运行控制">
      <label>
        运行范围{" "}
        <select
          aria-label="运行范围"
          value={scope}
          onChange={(event) => setScope(event.target.value as typeof scope)}
        >
          {adapter.scopes.map((value) => (
            <option key={value} value={value}>
              {
                {
                  all: "整个流程",
                  node: "单个节点",
                  from: "从此节点",
                  to: "运行到此",
                }[value]
              }
            </option>
          ))}
        </select>
      </label>
      <Button
        size="sm"
        disabled={
          locked || !!active || !!problem || !adapter.scopes.includes(scope)
        }
        onClick={() => runtime.run(scope, nodeId)}
      >
        运行流程
      </Button>
      {adapter.stop && active && (
        <Button
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={runtime.stop}
        >
          请求停止
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={!!state.pending || (!state.snapshot && !state.uncertain)}
        onClick={runtime.query}
      >
        查询运行
      </Button>
      {state.snapshot && (
        <RuntimeStatusBadge status={redactText(state.snapshot.status)} />
      )}
      {problem && <span className={styles.muted}>{problem}</span>}
    </div>
  )
}
export function CanvasExecutionPanel({
  runtime,
  document,
}: CanvasExecutionPanelProps) {
  const [view, setView] = useState("Activity")
  const [feedback, setFeedback] = useState("")
  const { state } = runtime,
    snapshot = state.snapshot
  const payload =
    view === "Variables"
      ? snapshot?.variables
      : view === "Errors"
        ? Object.fromEntries(
            Object.entries(snapshot?.nodes ?? {})
              .filter(([, node]) => node.error)
              .map(([id, node]) => [id, node.error]),
          )
        : snapshot?.events.map((event) => ({
            ...event,
            detail: bounded(event.detail),
          }))
  const text = bounded(payload)
  return (
    <section className={styles.execution} aria-label="执行调试">
      <div className={styles.actions}>
        {["Activity", "Logs", "Variables", "Errors"].map((value) => (
          <Button
            key={value}
            size="sm"
            variant="ghost"
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {value}
          </Button>
        ))}
        {snapshot && (
          <span className={styles.muted}>
            Run {redactText(snapshot.runId)} · 文档 r{snapshot.documentRevision}
            {snapshot.documentRevision !== document.revision
              ? "（旧版本结果）"
              : ""}
          </span>
        )}
        {snapshot && view !== "Activity" && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text)
                setFeedback("已复制脱敏预览。")
              } catch {
                setFeedback("复制失败，请手动选择预览。")
              }
            }}
          >
            复制脱敏预览
          </Button>
        )}
      </div>
      {state.pending && (
        <p role="status">{state.pending}请求处理中，最终状态由来源确认。</p>
      )}
      {canvasRuntimeUnknown(snapshot) && (
        <p role="alert" className={styles.error}>
          执行结果未确认；查询来源后再执行写操作。
        </p>
      )}
      {state.awaiting && <p role="status">{state.awaiting}</p>}
      {state.uncertain && (
        <p role="alert" className={styles.error}>
          {state.uncertain}
        </p>
      )}
      {state.transport === "disconnected" && (
        <p className={styles.muted}>连接中断 · 保留最后快照</p>
      )}
      <DataRegion
        state={
          state.readError
            ? "error"
            : state.pending && !snapshot
              ? "loading"
              : snapshot
                ? "success"
                : "empty"
        }
        hasContent={!!snapshot}
        error={
          state.readError
            ? {
                category: "network",
                message: state.readError,
                reason: "已有运行快照保留，请安全重读。",
              }
            : undefined
        }
        onRetry={runtime.query}
        emptyTitle="尚无执行记录"
        emptyDescription="运行或查询由调用方提供的执行适配器；构图不会自动执行。"
      >
        {view === "Activity" || view === "Logs" ? (
          <ActivityTimeline
            compact
            events={(snapshot?.events ?? []).map((event) => ({
              id: event.id,
              time: redactText(event.time),
              type: view === "Logs" ? "Log" : "Execution",
              action: redactText(event.action),
              target: event.nodeId,
              status: redactText(event.status),
              details:
                event.detail === undefined ? undefined : (
                  <pre>{bounded(event.detail)}</pre>
                ),
            }))}
          />
        ) : (
          <pre className={styles.output}>{text}</pre>
        )}
      </DataRegion>
      <p role="status" className={styles.muted}>
        {feedback}
      </p>
    </section>
  )
}
export function CanvasExecutionInspector({
  runtime,
  document,
  nodeId,
  readOnly,
}: CanvasExecutionPanelProps) {
  const [view, setView] = useState("Output")
  const [feedback, setFeedback] = useState("")
  const snapshot = runtime.state.snapshot,
    execution = nodeId ? snapshot?.nodes[nodeId] : undefined
  const node = document.nodes.find((node) => node.id === nodeId)
  const payload =
    execution?.[view.toLowerCase() as "input" | "output" | "details" | "trace"]
  const text = bounded(payload)
  const unknown =
    !!runtime.state.uncertain ||
    snapshot?.outcome === "unknown" ||
    execution?.outcome === "unknown"
  const actionAllowed =
    !readOnly && !runtime.state.pending && !unknown && !!runtime.adapter.decide
  return (
    <Inspector
      object={
        node
          ? {
              id: node.id,
              title: node.title,
              kind: "Execution",
              status: execution?.status,
              metadata: [
                {
                  label: "版本",
                  value: snapshot
                    ? `r${snapshot.documentRevision}${snapshot.documentRevision !== document.revision ? " · 旧版本结果" : ""}`
                    : "—",
                },
                { label: "Run", value: snapshot?.runId ?? "—" },
                { label: "Tokens", value: execution?.tokens ?? "—" },
                { label: "Duration", value: execution?.duration ?? "—" },
                { label: "Model", value: execution?.model ?? "—" },
                { label: "Context", value: execution?.context ?? "—" },
              ],
            }
          : null
      }
      emptyDescription="选择节点查看执行输入、输出和 Trace。"
    >
      <div className={styles.actions}>
        {["Input", "Output", "Details", "Trace"].map((value) => (
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={view === value}
            key={value}
            onClick={() => setView(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      {execution ? (
        <>
          <pre className={styles.output}>{text}</pre>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text)
                setFeedback("已复制脱敏预览。")
              } catch {
                setFeedback("复制失败，请手动选择预览。")
              }
            }}
          >
            复制脱敏预览
          </Button>
          <p role="status" className={styles.muted}>
            {feedback}
          </p>
          <ToolCall
            key={`${snapshot!.runId}:${nodeId}:${execution.attemptId}:${execution.approval?.id ?? ""}`}
            defaultExpanded
            call={{
              id: `${snapshot!.runId}:${nodeId}:${execution.attemptId}`,
              name: node?.title ?? nodeId!,
              status: redactText(execution.status),
              arguments: bounded(execution.input),
              output: bounded(execution.output),
              outputTruncated: true,
              outcome: unknown ? "unknown" : execution.outcome,
              receipt: snapshot?.receipt,
              error: execution.error ? bounded(execution.error) : undefined,
              duration: execution.duration,
            }}
            permission={
              execution.approval
                ? {
                    ...execution.approval,
                    onApprove: actionAllowed
                      ? () => runtime.decide(nodeId!, "approve")
                      : undefined,
                    onReject: actionAllowed
                      ? () => runtime.decide(nodeId!, "reject")
                      : undefined,
                  }
                : undefined
            }
            onReconcile={runtime.query}
          />
          {execution.artifacts && (
            <pre className={styles.output}>{bounded(execution.artifacts)}</pre>
          )}
        </>
      ) : (
        <p className={styles.muted}>本次运行未提供该节点的执行记录。</p>
      )}
    </Inspector>
  )
}
