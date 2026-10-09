"use client"
import { useState, useReducer, type ReactNode } from "react"
import { initialExample, exampleReducer } from "./reducer"
import { Button } from "@/components/ui/button"
import { exampleMessages } from "./messages"
import {
  AgentWorkbench,
  SessionNavigator,
  ProjectSwitcher,
  SessionHeader,
  AgentConversation,
  AgentComposer,
  ComposerControls,
  ContextPanel,
  ContextPicker,
  MessageContent,
  ChangeReviewPanel,
  FileViewer,
  DiffViewer,
  ExecutionOutputPanel,
  PreviewPanel,
  WorkbenchPanelTabs,
  TaskInbox,
} from "@/components/blocks/agent-workbench"
import { models, permissions, environments, references } from "./fixtures"
import {
  workbenchPanels,
  sessionRun,
  type ReviewComment,
} from "@/lib/agent-workbench-model"
import { useI18n } from "@/lib/i18n-provider"
export function WorkbenchComponentDemo({ region }: { region: string }) {
  const [state, dispatch] = useReducer(
    exampleReducer,
    undefined,
    initialExample,
  )
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [selected, setSelected] = useState(state.sessions[0].sessionId)
  const s =
    state.sessions.find((s) => s.sessionId === selected) ?? state.sessions[0]
  const draft = state.drafts[s.sessionId]
  const { t, locale } = useI18n()
  const x = exampleMessages[locale]
  const [project, setProject] = useState(s.projectId)
  const [line, setLine] = useState("")
  const setDraft = (draft: (typeof state.drafts)[string]) =>
    dispatch({ type: "draft", id: s.sessionId, draft })
  const nav = (
    <SessionNavigator
      projects={state.projects}
      sessions={state.sessions}
      projectId={project}
      selectedId={selected}
      onProjectChange={setProject}
      onSelect={setSelected}
      onNew={() =>
        setDraft({
          ...draft,
          text: "New local draft",
          version: draft.version + 1,
        })
      }
    />
  )
  const context = (
    <ContextPanel
      references={draft.context}
      onRemove={(id) =>
        setDraft({
          ...draft,
          context: draft.context.filter((r) => r.id !== id),
          version: draft.version + 1,
        })
      }
    />
  )
  const composer = (
    <AgentComposer
      session={s}
      draft={draft}
      onChange={setDraft}
      models={models}
      permissions={permissions}
      environments={environments}
      receipts={state.receipts}
      onSubmit={(d) =>
        dispatch({ type: "begin", id: s.sessionId, action: d.mode })
      }
    />
  )
  const views: Record<string, ReactNode> = {
    "session-navigator": nav,
    "project-switcher": (
      <ProjectSwitcher
        projects={state.projects}
        value={project}
        onChange={setProject}
      />
    ),
    "session-header": <SessionHeader session={s} />,
    "context-panel": (
      <>
        <ContextPicker
          references={references}
          onPick={(r) => {
            if (!draft.context.some((c) => c.id === r.id))
              setDraft({
                ...draft,
                context: [...draft.context, r],
                version: draft.version + 1,
              })
          }}
        />
        {context}
      </>
    ),
    "context-picker": (
      <ContextPicker
        references={references}
        onPick={(r) =>
          setDraft({ ...draft, context: [r], version: draft.version + 1 })
        }
      />
    ),
    "message-content": (
      <MessageContent content="## Source snapshot\n\nHTML is displayed as text: <script>alert('text')</script>\n\n```ts\nconst answer = 42\n```" />
    ),
    "agent-conversation": (
      <div style={{ height: 480 }}>
        <AgentConversation session={s} composer={composer} />
      </div>
    ),
    "agent-composer": composer,
    "composer-controls": (
      <ComposerControls
        session={s}
        draft={draft}
        onChange={setDraft}
        models={models}
        permissions={permissions}
        environments={environments}
      />
    ),
    "file-viewer": (
      <FileViewer file={s.changes.files[0]} revision={s.changes.revision} />
    ),
    "diff-viewer": <DiffViewer file={s.changes.files[0]} onComment={setLine} />,
    "change-review-panel": (
      <ChangeReviewPanel
        changes={s.changes}
        selectedFileId={state.panels.selectedFileId}
        onSelectFile={(selectedFileId) =>
          dispatch({
            type: "panels",
            panels: { ...state.panels, selectedFileId },
          })
        }
        comments={comments}
        onCommentsChange={setComments}
        onFeedback={(text) =>
          setDraft({ ...draft, text, version: draft.version + 1 })
        }
      />
    ),
    "execution-output-panel": <ExecutionOutputPanel {...s.output} />,
    "preview-panel": (
      <PreviewPanel>
        <MessageContent content="# Caller provided preview\n\nA local report." />
      </PreviewPanel>
    ),
    "workbench-panel-tabs": (
      <WorkbenchPanelTabs
        value={state.panels.activePanel}
        onChange={(activePanel) =>
          dispatch({ type: "panels", panels: { ...state.panels, activePanel } })
        }
        panels={workbenchPanels.map((id) => ({
          id,
          label: t(`workbench.${id}`),
          available: [
            "context",
            "files",
            "changes",
            "artifacts",
            "plan",
            "activity",
          ].includes(id),
          reason: t("workbench.noCapability"),
          render: () =>
            id === "context" ? context : <p>{t(`workbench.${id}`)}</p>,
        }))}
      />
    ),
    "task-inbox": (
      <TaskInbox
        runs={state.sessions.map(sessionRun)}
        attention={state.sessions.flatMap((s) => s.attention)}
        selectedRunId={s.activeRunId}
        onSelect={(runId) =>
          setSelected(
            state.sessions.find((s) => s.activeRunId === runId)?.sessionId ??
              selected,
          )
        }
        onEnter={(runId) =>
          setSelected(
            state.sessions.find((s) => s.activeRunId === runId)?.sessionId ??
              selected,
          )
        }
      />
    ),
    "agent-workbench-model": (
      <pre>
        {JSON.stringify(
          {
            sessionId: s.sessionId,
            runId: s.activeRunId,
            revision: s.revision,
            cursor: s.cursor,
            capabilities: s.capabilities,
          },
          null,
          2,
        )}
      </pre>
    ),
  }
  const controls = (
    <div>
      {line && <p role="status">{line}</p>}
      {state.receipts
        .filter((r) => ["pending", "unknown"].includes(r.state))
        .map((r) => (
          <div key={r.requestId}>
            <p role="status">{t(`workbench.${r.state}`)}</p>
            <Button
              size="sm"
              onClick={() =>
                dispatch({
                  type: "settle",
                  requestId: r.requestId,
                  state: "confirmed",
                })
              }
            >
              {x.confirm}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                dispatch({
                  type: "settle",
                  requestId: r.requestId,
                  state: "unknown",
                })
              }
            >
              {x.lose}
            </Button>
          </div>
        ))}
      <a href="/examples/agent-workbench/">{x.app}</a>
    </div>
  )
  if (region !== "agent-workbench")
    return (
      <div style={{ minWidth: 0 }}>
        {views[region]}
        {controls}
      </div>
    )
  return (
    <div style={{ height: 640 }}>
      <AgentWorkbench
        session={s}
        layout="conversation"
        navigation={nav}
        composer={composer}
        workspace={context}
        inspector={context}
        panelState={state.panels}
        onPanelStateChange={(panels) => dispatch({ type: "panels", panels })}
      />
    </div>
  )
}
