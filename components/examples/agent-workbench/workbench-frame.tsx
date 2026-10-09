"use client"

import { useState } from "react"
import {
  AgentWorkbench,
  type AgentWorkbenchProps,
} from "@/components/blocks/agent-workbench"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { Inspector } from "@/components/blocks/inspector"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-provider"
import styles from "@/components/blocks/agent-workbench/workbench.module.css"

/** Once entered, retain the session shell/editors through subsequent page changes. */
export function WorkbenchFrame({
  sessionActive,
  ...props
}: AgentWorkbenchProps & { sessionActive: boolean }) {
  const { t } = useI18n()
  const [entered, setEntered] = useState(sessionActive)
  const [view, setView] = useState<"conversation" | "workspace">("conversation")
  if (sessionActive && !entered) setEntered(true)
  // This small core shell stays eager: deferring it regressed the first entry.
  // Its editors still mount only on entry and then retain their instances.
  if (sessionActive || entered)
    return (
      <div className="contents" data-workbench-module="session">
        <AgentWorkbench {...props} />
      </div>
    )
  const panels = props.panelState
  const patch = (value: Partial<typeof panels>) =>
    props.onPanelStateChange({ ...panels, ...value })
  return (
    <WorkspaceShell
      className={styles.shell}
      title={props.header}
      sidebar={props.navigation}
      sidebarCollapsed={panels.sidebarCollapsed}
      onSidebarCollapsedChange={(sidebarCollapsed) =>
        patch({ sidebarCollapsed })
      }
      inspectorOpen={false}
      onInspectorOpenChange={(inspectorOpen) => patch({ inspectorOpen })}
      inspectorWidth={panels.inspectorWidth}
      onInspectorWidthChange={(inspectorWidth) => patch({ inspectorWidth })}
      inspectorTitle={t("workbench.context")}
      inspector={
        <>
          <Inspector
            object={{
              id: props.session.sessionId,
              title: props.session.title,
              kind: "Session",
              status: props.session.status,
              metadata: [
                { label: "Session", value: props.session.sessionId },
                { label: "Run", value: props.session.activeRunId },
                {
                  label: t("workbench.revision"),
                  value: props.session.revision,
                },
              ],
            }}
          />
          {props.inspector}
        </>
      }
      bottomPanel={props.bottom}
      bottomPanelOpen={panels.bottomOpen}
      onBottomPanelOpenChange={(bottomOpen) => patch({ bottomOpen })}
      bottomPanelHeight={panels.bottomHeight}
      onBottomPanelHeightChange={(bottomHeight) => patch({ bottomHeight })}
      bottomPanelResizable
      toolbar={
        <>
          {props.toolbar}
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={panels.bottomOpen}
            onClick={() => patch({ bottomOpen: !panels.bottomOpen })}
          >
            {t("workbench.bottom")}
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <div className={`${styles.toolbar} ${styles.viewSwitch}`}>
          {(["conversation", "workspace"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant="ghost"
              aria-pressed={view === value}
              onClick={() => setView(value)}
            >
              {t(
                value === "conversation"
                  ? "workbench.conversation"
                  : "workbench.details",
              )}
            </Button>
          ))}
        </div>
        <div className={styles.panes} data-layout="tasks" data-view="workspace">
          <div className={styles.workspace}>{props.workspace}</div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
