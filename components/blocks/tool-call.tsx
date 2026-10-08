"use client"

import { useId, useState } from "react"
import { ChevronRight, Terminal, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { previewText, redact } from "@/lib/redact"
import styles from "./tool-call.module.css"

export type ToolCallRecord = {
  id: string
  name: string
  status: string
  target?: string
  arguments?: unknown
  output?: unknown
  stage?: string
  elapsed?: string
  duration?: string
  exitCode?: number
  error?: string
  outputTruncated?: boolean
  outcome?: "known" | "unknown"
  receipt?: string
}
type Operation = () => void | Promise<void>
export type ToolCallProps = {
  call: ToolCallRecord
  defaultExpanded?: boolean
  data?: Omit<DataRegionProps, "children" | "hasContent">
  permission?: {
    scope: string
    risk: string
    onApprove?: Operation
    onReject?: Operation
  }
  onCancel?: Operation
  onRetry?: Operation
  onReconcile?: Operation
  onDownload?: (redactedOutput: string) => void
}
export function ToolCall({
  call,
  defaultExpanded = false,
  data,
  permission,
  onCancel,
  onRetry,
  onReconcile,
  onDownload,
}: ToolCallProps) {
  const id = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [full, setFull] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState<{ key: string; label: string }>()
  const [feedback, setFeedback] = useState("")
  const [actionError, setActionError] = useState("")
  const [uncertainKey, setUncertainKey] = useState<string>()
  const key = `${call.id}:${call.status}:${call.outcome ?? "known"}:${permission?.scope ?? ""}`
  const waitingConfirmation = submitted?.key === key
  const output = redact(call.output)
  const preview = previewText(output)
  const unknown = call.outcome === "unknown" || uncertainKey === key
  async function operate(label: string, action: Operation) {
    if (pending || waitingConfirmation) return
    setPending(true)
    setActionError("")
    try {
      await action()
      setSubmitted({ key, label })
      setFeedback(`${label}请求已提交，等待来源确认。`)
    } catch {
      setUncertainKey(key)
      setActionError(
        `${label}请求失败，结果尚未确认。请查询状态后再决定下一步。`,
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <div className={styles.call} data-call-id={call.id}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        aria-controls={`${id}-body`}
        onClick={() => setExpanded(!expanded)}
      >
        <Terminal size={16} aria-hidden="true" />
        <span className={styles.name}>{redact(call.name)}</span>
        {call.target && (
          <span className={styles.target}>{redact(call.target)}</span>
        )}
        <RuntimeStatusBadge status={call.status} />
        {unknown && <span className={styles.warning}>结果未确认</span>}
        <span className={styles.duration}>
          {redact(call.duration ?? call.elapsed ?? "—")}
        </span>
        <ChevronRight
          size={16}
          className={styles.chevron}
          data-open={expanded}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div id={`${id}-body`} className={styles.body}>
          <DataRegion
            {...data}
            error={
              data?.error
                ? {
                    ...data.error,
                    message: redact(data.error.message),
                    reason: redact(data.error.reason),
                  }
                : undefined
            }
            hasContent={
              call.arguments !== undefined || call.output !== undefined
            }
            partialDescription="部分输出 · 仍在接收或尚未完整读取。"
            loadingLabel="正在加载工具详情"
          >
            {(call.stage || call.elapsed) && (
              <p className={styles.stage}>
                {redact(call.stage ?? "当前阶段未提供")} ·{" "}
                {redact(call.elapsed ?? "耗时未知")}
              </p>
            )}
            {unknown && (
              <div className={styles.notice}>
                <p>结果未确认。先查询或对账，不能据此重试写操作。</p>
                {call.receipt && <p>Receipt：{redact(call.receipt)}</p>}
                {onReconcile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={pending}
                    disabled={waitingConfirmation}
                    onClick={() => operate("查询结果", onReconcile)}
                  >
                    查询结果
                  </Button>
                )}
              </div>
            )}
            <section>
              <h4>参数</h4>
              <pre>
                {call.arguments === undefined
                  ? "参数未提供"
                  : redact(call.arguments)}
              </pre>
            </section>
            <section>
              <div className={styles.sectionHeader}>
                <h4>输出</h4>
                {output && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="复制脱敏输出"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(output)
                        setFeedback("已复制脱敏输出。")
                      } catch {
                        setFeedback("无法访问剪贴板，请手动复制脱敏内容。")
                      }
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
              <pre>
                {output ? (full ? output : preview.text) : "工具未返回文本输出"}
              </pre>
              {(preview.truncated || call.outputTruncated) && (
                <div className={styles.notice}>
                  <p>
                    输出已截断
                    {preview.truncated
                      ? "：预览最多 200 行 / 32KiB。"
                      : "：来源只提供了部分输出。"}
                  </p>
                  {preview.truncated && !call.outputTruncated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFull(!full)}
                    >
                      {full ? "收起完整输出" : "展开完整输出"}
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDownload(output)}
                    >
                      下载脱敏输出{call.outputTruncated ? "片段" : ""}
                    </Button>
                  )}
                </div>
              )}
            </section>
            {call.exitCode !== undefined && (
              <p className={styles.stage}>Exit code：{call.exitCode}</p>
            )}
            {call.error && (
              <p role="alert" className={styles.error}>
                {redact(call.error)}
              </p>
            )}
            {!unknown && call.status === "waiting" && permission && (
              <section className={styles.permission} aria-label="工具权限请求">
                <h4>需要明确授权</h4>
                <p>作用范围：{redact(permission.scope)}</p>
                <p>风险：{redact(permission.risk)}</p>
                <div className={styles.actions}>
                  {permission.onApprove && (
                    <Button
                      size="sm"
                      loading={pending}
                      disabled={waitingConfirmation}
                      onClick={() => operate("批准", permission.onApprove!)}
                    >
                      批准
                    </Button>
                  )}
                  {permission.onReject && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending || waitingConfirmation}
                      onClick={() => operate("拒绝", permission.onReject!)}
                    >
                      拒绝
                    </Button>
                  )}
                </div>
              </section>
            )}
            <div className={styles.actions}>
              {!unknown &&
                onCancel &&
                ["queued", "starting", "running", "waiting"].includes(
                  call.status,
                ) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={pending}
                    disabled={waitingConfirmation}
                    onClick={() => operate("取消", onCancel)}
                  >
                    {waitingConfirmation && submitted.label === "取消"
                      ? "正在取消"
                      : "取消执行"}
                  </Button>
                )}
              {!unknown && call.status === "failed" && onRetry && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={pending}
                  disabled={waitingConfirmation}
                  onClick={() => operate("重试", onRetry)}
                >
                  安全重试
                </Button>
              )}
            </div>
          </DataRegion>
          <p role="status" className={styles.feedback}>
            {feedback}
          </p>
          {actionError && (
            <p role="alert" className={styles.error}>
              {actionError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
