"use client"

import { useState, type ReactNode } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion, type RegionError } from "@/components/ui/data-region"
import type { DataState } from "@/lib/runtime-status"
import styles from "./inspector.module.css"

export type InspectorObject = {
  id: string
  title: string
  kind: string
  status?: string
  metadata: { label: string; value?: ReactNode; copyValue?: string }[]
}
export type InspectorProps = {
  object: InspectorObject | null
  state?: DataState
  error?: RegionError
  onRetry?: () => void
  refreshing?: boolean
  children?: ReactNode
  emptyDescription?: string
}
/** Object data is controlled; docking, resizing and modal focus belong to WorkspaceShell. */
export function Inspector({
  object,
  state = "success",
  error,
  onRetry,
  refreshing,
  children,
  emptyDescription,
}: InspectorProps) {
  // Keying the body also clears per-object copy feedback on a selection change.
  return (
    <InspectorBody
      key={object?.id ?? "no-selection"}
      object={object}
      state={state}
      error={error}
      onRetry={onRetry}
      refreshing={refreshing}
      emptyDescription={emptyDescription}
    >
      {children}
    </InspectorBody>
  )
}
function InspectorBody({
  object,
  state,
  error,
  onRetry,
  refreshing,
  children,
  emptyDescription,
}: InspectorProps) {
  const [feedback, setFeedback] = useState("")
  if (!object)
    return (
      <DataRegion
        state="empty"
        emptyTitle="尚未选择对象"
        emptyDescription={
          emptyDescription ?? "选择 Session、Agent 或 Activity 以查看详情。"
        }
      />
    )
  return (
    <div className={styles.content} data-inspector-object={object.id}>
      <section>
        <h3>当前对象 · {object.kind}</h3>
        <p className={styles.title}>{object.title}</p>
        {object.status && <RuntimeStatusBadge status={object.status} />}
      </section>
      <DataRegion
        state={state}
        hasContent={object.metadata.length > 0}
        error={error}
        onRetry={onRetry}
        refreshing={refreshing}
        loadingLabel="正在加载对象详情"
        partialDescription="对象详情尚未完整，缺失字段显示「—」。"
      >
        <section>
          <h3>Metadata</h3>
          <dl>
            {object.metadata.map((field) => (
              <div key={field.label} className={styles.field}>
                <dt>{field.label}</dt>
                <dd>
                  <span>{field.value ?? "—"}</span>
                  {field.copyValue !== undefined && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`复制${field.label}`}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(field.copyValue!)
                          setFeedback(`已复制${field.label}。`)
                        } catch {
                          setFeedback("无法访问剪贴板，请手动复制。")
                        }
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        {children}
      </DataRegion>
      <p role="status" className={styles.feedback}>
        {feedback}
      </p>
    </div>
  )
}
