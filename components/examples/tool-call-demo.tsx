"use client"
import { useId, useState } from "react"
import { ToolCall } from "@/components/blocks/tool-call"
import { runtimeStatuses, type RuntimeStatus } from "@/lib/runtime-status"
import { Button } from "@/components/ui/button"
export function ToolCallDemo() {
  const id = useId()
  const [status, setStatus] = useState<RuntimeStatus>("waiting")
  const [unknown, setUnknown] = useState(false)
  const [long, setLong] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [loseCancel, setLoseCancel] = useState(false)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={loseCancel}
          onClick={() => setLoseCancel(!loseCancel)}
        >
          模拟取消响应丢失
        </Button>
        <label htmlFor={id} className="text-xs">
          工具运行状态
        </label>
        <select
          id={id}
          value={status}
          onChange={(event) => setStatus(event.target.value as RuntimeStatus)}
          className="h-8 max-w-full rounded-md border bg-surface px-2 text-xs"
        >
          {runtimeStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <Button size="sm" variant="ghost" onClick={() => setUnknown(!unknown)}>
          切换结果未确认
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setLong(!long)}>
          切换长输出
        </Button>
      </div>
      <ToolCall
        call={{
          id: "call-local",
          name: "write_file",
          target: "components/example.tsx",
          status,
          arguments: {
            path: "components/example.tsx",
            api_key: "demo-api-secret",
            headers: {
              Authorization: "Bearer demo-auth-secret",
              Cookie: "session=demo-cookie-secret",
            },
          },
          output: long
            ? Array.from(
                { length: 240 },
                (_, index) => `line ${index + 1}: local output`,
              ).join("\n")
            : "Authorization: Bearer demo-output-secret\n已读取本地演示内容",
          outcome: unknown ? "unknown" : "known",
          receipt: "local-receipt-01",
          stage: status === "running" ? "写入本地演示文件" : undefined,
          elapsed: "00:24",
        }}
        defaultExpanded
        permission={{
          scope: "写入 components/example.tsx；仅本地 UI 演示",
          risk: "覆盖该文件已有内容。此示例不会实际执行写入。",
          onApprove: () => {
            setStatus("running")
            setFeedback("批准回调触发一次 · 本地演示")
          },
          onReject: () => {
            setStatus("cancelled")
            setFeedback("拒绝回调已触发 · 本地演示")
          },
        }}
        onCancel={() => {
          if (loseCancel)
            return Promise.reject(new Error("Local demo lost response"))
          setFeedback("取消已请求 · 等待确认，不自动切换状态。")
        }}
        onRetry={() => {
          setStatus("running")
          setFeedback("安全重试回调 · 本地演示")
        }}
        onReconcile={() => {
          setUnknown(false)
          if (loseCancel) setStatus("cancelled")
          setFeedback("查询回调 · 已恢复本地已知结果。")
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback || "本地记录 · 所有动作由显式回调处理，不执行真实工具。"}
      </p>
    </div>
  )
}
