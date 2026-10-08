"use client"

import { MessageSquare } from "lucide-react"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import styles from "./entity-row.module.css"

export type SessionRecord = {
  id: string
  title: string
  status: string
  updatedAt: string
  agent?: string
  model?: string
  stage?: string
  elapsed?: string
  waitingReason?: string
}
export type SessionRowProps = {
  session: SessionRecord
  selected?: boolean
  disabled?: boolean
  compact?: boolean
  onSelect?: () => void
  action?: {
    label: string
    onAction: () => void
    busy?: boolean
    disabledReason?: string
  }
}
export function SessionRow({
  session,
  selected,
  disabled,
  compact,
  onSelect,
  action,
}: SessionRowProps) {
  const name = session.title.trim() || "未命名 Session"
  const description = [
    session.id,
    session.agent,
    session.model,
    session.updatedAt,
    session.stage,
    session.waitingReason,
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <div className={styles.row} data-entity-id={session.id}>
      <Item
        title={name}
        description={compact ? undefined : description}
        leading={<MessageSquare />}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
        ariaLabel={`${name} ${session.id}`}
        trailing={
          <>
            <RuntimeStatusBadge status={session.status} />
            {session.elapsed && (
              <span className={styles.elapsed}>{session.elapsed}</span>
            )}
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
      {action?.disabledReason && (
        <p className={styles.reason}>
          {action.label}不可用：{action.disabledReason}
        </p>
      )}
    </div>
  )
}
