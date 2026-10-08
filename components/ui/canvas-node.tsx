"use client"

import { Box, AlertTriangle } from "lucide-react"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { CanvasPort } from "@/components/ui/canvas-port"
import type {
  CanvasNodeDefinition,
  CanvasNodeRecord,
  CanvasIssue,
} from "@/lib/canvas-model"
import { redactText } from "@/lib/redact"
import styles from "./canvas-node.module.css"

export type CanvasNodeProps = {
  node: CanvasNodeRecord
  definition?: CanvasNodeDefinition
  selected?: boolean
  readOnly?: boolean
  status?: string
  outcome?: "known" | "unknown"
  issues?: CanvasIssue[]
  fallbackPorts?: CanvasNodeDefinition["ports"]
}
export function CanvasNode({
  node,
  definition,
  selected,
  readOnly,
  status,
  outcome,
  issues = [],
  fallbackPorts = [],
}: CanvasNodeProps) {
  return (
    <div
      className={styles.node}
      data-canvas-node={node.id}
      data-selected={selected || undefined}
      data-unknown={!definition || undefined}
    >
      <header>
        <span>{definition?.icon ?? <Box size={16} />}</span>
        <strong>{redactText(node.title)}</strong>
        <small>{definition?.label ?? "未知节点"}</small>
      </header>
      <div className={styles.summary}>
        {definition
          ? redactText(definition.summary?.(node) ?? definition.label)
          : "保留原始数据；安装对应节点定义后才能配置。"}
      </div>
      <div>
        {(definition?.ports ?? fallbackPorts).map((port) => (
          <CanvasPort
            key={port.id}
            port={port}
            readOnly={readOnly || !definition}
            unknownType={!definition}
          />
        ))}
      </div>
      {(status || issues.length > 0 || outcome === "unknown") && (
        <footer>
          {status && <RuntimeStatusBadge status={status} />}
          {outcome === "unknown" && <span>结果未确认</span>}
          {issues.length > 0 && (
            <span className={styles.issue}>
              <AlertTriangle size={14} />
              {issues.length} 项校验问题
            </span>
          )}
        </footer>
      )}
    </div>
  )
}
