"use client"
import { useState } from "react"
import { AgentRow } from "@/components/blocks/agent-row"
export function AgentRowDemo() {
  const [selected, setSelected] = useState("builder")
  const [feedback, setFeedback] = useState("")
  return (
    <div>
      <AgentRow
        agent={{
          id: "builder",
          name: "Builder",
          model: "本地演示模型",
          status: "thinking",
          stage: "组织组件",
          activeSessionCount: 2,
          aggregate: true,
        }}
        selected={selected === "builder"}
        onSelect={() => setSelected("builder")}
      />
      <AgentRow
        agent={{ id: "reviewer", name: "Reviewer", status: "idle" }}
        selected={selected === "reviewer"}
        onSelect={() => setSelected("reviewer")}
        action={{
          label: "配置",
          onAction: () => setFeedback("打开配置 · 本地演示回调。"),
        }}
      />
      <AgentRow
        agent={{
          id: "offline",
          name: "断线的 Agent",
          model: "本地演示模型",
          status: "running",
          offline: true,
          updatedAt: "16:42:08",
        }}
        action={{
          label: "暂停",
          onAction: () => {},
          disabledReason: "连接离线，请先恢复连接",
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback}
      </p>
    </div>
  )
}
