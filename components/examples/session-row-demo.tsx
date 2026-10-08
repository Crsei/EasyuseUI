"use client"
import { useState } from "react"
import { SessionRow } from "@/components/blocks/session-row"
export function SessionRowDemo() {
  const [selected, setSelected] = useState("session-one")
  const [feedback, setFeedback] = useState("")
  return (
    <div>
      <SessionRow
        session={{
          id: "session-one",
          title: "实现组件构造",
          status: "running",
          updatedAt: "16:42",
          stage: "验证尺寸",
          elapsed: "02:18",
        }}
        selected={selected === "session-one"}
        onSelect={() => setSelected("session-one")}
      />
      <SessionRow
        session={{
          id: "session-two",
          title: "",
          status: "paused",
          updatedAt: "16:40",
          waitingReason: "等待继续",
        }}
        selected={selected === "session-two"}
        onSelect={() => setSelected("session-two")}
        action={{
          label: "继续",
          onAction: () =>
            setFeedback("已请求继续 · 本地演示，未调用 Runtime。"),
        }}
      />
      <SessionRow
        compact
        session={{
          id: "session-three",
          title: "紧凑 Session",
          status: "failed",
          updatedAt: "16:38",
        }}
        disabled
        onSelect={() => {}}
        action={{
          label: "重试",
          onAction: () => {},
          disabledReason: "没有重试权限",
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback}
      </p>
    </div>
  )
}
