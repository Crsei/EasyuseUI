"use client"
import { useState, type ReactNode } from "react"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { Inspector } from "@/components/blocks/inspector"
import { AgentRunList } from "@/components/blocks/agent-run-list"
import { AttentionQueue } from "@/components/blocks/attention-queue"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"
import type { AgentRunSnapshot, AttentionRecord } from "@/lib/agent-board-model"
import type {
  PanelState,
  WorkbenchLayout,
  SessionSnapshot,
} from "@/lib/agent-workbench-model"
import {
  AgentConversation,
  type AgentConversationProps,
} from "./agent-workbench/conversation"
import { SessionHeader } from "./agent-workbench/navigation"
import styles from "./agent-workbench/workbench.module.css"
export * from "./agent-workbench/navigation"
export * from "./agent-workbench/context"
export * from "./agent-workbench/conversation"
export * from "./agent-workbench/composer"
export * from "./agent-workbench/review"
export * from "./agent-workbench/panels"
export function TaskInbox({
  runs,
  attention,
  selectedRunId,
  onSelect,
  onEnter,
}: {
  runs: readonly AgentRunSnapshot[]
  attention: readonly AttentionRecord[]
  selectedRunId?: string
  onSelect: (runId: string) => void
  onEnter: (runId: string) => void
}) {
  const { t } = useI18n()
  return (
    <section className={styles.section} aria-label={t("workbench.taskInbox")}>
      <h2 className={styles.heading}>{t("workbench.taskInbox")}</h2>
      <p className={styles.meta}>{t("workbench.selectionOnly")}</p>
      <AttentionQueue records={attention} onOpen={onSelect} />
      <AgentRunList
        records={runs}
        selectedRunId={selectedRunId}
        onOpen={onSelect}
      />
      {selectedRunId && (
        <Button onClick={() => onEnter(selectedRunId)}>
          {t("workbench.openSession")}
        </Button>
      )}
    </section>
  )
}
export type AgentWorkbenchProps = {
  session: SessionSnapshot
  layout: WorkbenchLayout
  panelState: PanelState
  onPanelStateChange: (state: PanelState) => void
  navigation: ReactNode
  activityBar?: ReactNode
  activeView?: "conversation" | "workspace"
  showViewSwitch?: boolean
  onActiveViewChange?: (view: "conversation" | "workspace") => void
  workspace: ReactNode
  inspector?: ReactNode
  bottom?: ReactNode
  header?: ReactNode
  headerActions?: ReactNode
  toolbar?: ReactNode
  composer: ReactNode
  conversation?: Omit<AgentConversationProps, "session" | "composer">
  onRename?: (title: string) => void
  className?: string
}
/** One Shell owns docking; wide review belongs to Main. Hidden panes retain their editors. */
export function AgentWorkbench({
  session,
  layout,
  panelState,
  onPanelStateChange,
  navigation,
  activityBar,
  activeView,
  showViewSwitch = true,
  onActiveViewChange,
  workspace,
  inspector,
  bottom,
  header,
  headerActions,
  toolbar,
  composer,
  conversation,
  onRename,
  className,
}: AgentWorkbenchProps) {
  const { t } = useI18n()
  const [pane, setPane] = useState<{
    layout: WorkbenchLayout
    view: "conversation" | "workspace"
  }>({ layout, view: "conversation" })
  const view =
    activeView ?? (pane.layout === layout ? pane.view : "conversation")
  const patch = (value: Partial<PanelState>) =>
    onPanelStateChange({ ...panelState, ...value })
  return (
    <WorkspaceShell
      className={cn(styles.shell, className)}
      title={
        header ?? (
          <SessionHeader
            session={session}
            onRename={onRename}
            actions={headerActions}
          />
        )
      }
      sidebar={navigation}
      activityBar={activityBar}
      sidebarCollapsed={panelState.sidebarCollapsed}
      onSidebarCollapsedChange={(sidebarCollapsed) =>
        patch({ sidebarCollapsed })
      }
      inspectorOpen={panelState.inspectorOpen && layout === "conversation"}
      onInspectorOpenChange={(inspectorOpen) => patch({ inspectorOpen })}
      inspectorWidth={panelState.inspectorWidth}
      onInspectorWidthChange={(inspectorWidth) => patch({ inspectorWidth })}
      inspectorTitle={t("workbench.context")}
      inspector={
        <>
          <Inspector
            object={{
              id: session.sessionId,
              title: session.title,
              kind: "Session",
              status: session.status,
              metadata: [
                { label: "Session", value: session.sessionId },
                { label: "Run", value: session.activeRunId },
                { label: t("workbench.revision"), value: session.revision },
              ],
            }}
          />
          {inspector}
        </>
      }
      bottomPanel={bottom}
      bottomPanelOpen={panelState.bottomOpen}
      onBottomPanelOpenChange={(bottomOpen) => patch({ bottomOpen })}
      bottomPanelHeight={panelState.bottomHeight}
      onBottomPanelHeightChange={(bottomHeight) => patch({ bottomHeight })}
      bottomPanelResizable
      toolbar={
        <>
          {toolbar}
          {bottom && (
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={panelState.bottomOpen}
              onClick={() => patch({ bottomOpen: !panelState.bottomOpen })}
            >
              {t("workbench.bottom")}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.body}>
        {showViewSwitch && <div className={cn(styles.toolbar, styles.viewSwitch)}>
          {(["conversation", "workspace"] as const).map((v) => (
            <Button
              key={v}
              size="sm"
              variant="ghost"
              aria-pressed={view === v}
              onClick={() => {
                setPane({ layout, view: v })
                onActiveViewChange?.(v)
              }}
            >
              {v === "conversation"
                ? t("workbench.conversation")
                : t("workbench.details")}
            </Button>
          ))}
        </div>}
        <div
          className={styles.panes}
          data-layout={layout}
          data-view={layout === "tasks" ? "workspace" : view}
        >
          <div className={styles.chat}>
            <AgentConversation
              session={session}
              {...conversation}
              composer={composer}
            />
          </div>
          <div className={styles.workspace}>{workspace}</div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
