"use client"

import { Bot } from "lucide-react"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import styles from "./entity-row.module.css"

export type AgentRecord = {
  id: string
  name: string
  status: string
  model?: string
  provider?: string
  stage?: string
  elapsed?: string
  activeSessionCount?: number
  aggregate?: boolean
  offline?: boolean
  updatedAt?: string
}
export type AgentRowProps = {
  agent: AgentRecord
  compact?: boolean
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
  action?: {
    label: string
    onAction: () => void
    busy?: boolean
    disabledReason?: string
  }
}
export function AgentRow({
  agent,
  compact,
  selected,
  disabled,
  onSelect,
  action,
}: AgentRowProps) {
  const name = agent.name.trim() || "未命名 Agent"
  const description = [
    agent.id,
    agent.model ?? "未配置模型",
    agent.provider,
    agent.stage,
    agent.elapsed,
    agent.offline
      ? `连接离线 · 最后更新 ${agent.updatedAt ?? "未知"}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <div className={styles.row} data-entity-id={agent.id}>
      <Item
        title={name}
        description={compact ? undefined : description}
        leading={
          <span className={styles.identity}>
            <Bot />
          </span>
        }
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
        ariaLabel={`${name} ${agent.id}`}
        trailing={
          <>
            {agent.aggregate && <span className={styles.aggregate}>汇总</span>}
            <RuntimeStatusBadge status={agent.status} />
            <span className={styles.load} aria-label="活跃 Session 数">
              {agent.activeSessionCount ?? "—"}
            </span>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onAction}
                disabled={Boolean(action.disabledReason)}
                loading={action.busy}
              >
                {action.label}
              </Button>
            )}
          </>
        }
      />
      {compact && !agent.model && <p className={styles.reason}>未配置模型</p>}
      {compact && agent.offline && (
        <p className={styles.reason}>
          连接离线 · 最后更新 {agent.updatedAt ?? "未知"}
        </p>
      )}
      {action?.disabledReason && (
        <p className={styles.reason}>
          {action.label}不可用：{action.disabledReason}
        </p>
      )}
    </div>
  )
}
