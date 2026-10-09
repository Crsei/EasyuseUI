"use client"
import { ChangeReviewPanel } from "@/components/blocks/agent-workbench/review"
import { useWorkbenchExample } from "./provider"
import type { WorkbenchViewProps } from "./view-props"

export function ReviewView({
  session,
  draft,
  setDraft,
  query,
  navigate,
  fileOnly = false,
  mode,
  onModeChange,
}: WorkbenchViewProps & {
  fileOnly?: boolean
  mode: "unified" | "split"
  onModeChange: (mode: "unified" | "split") => void
}) {
  const { state, dispatch } = useWorkbenchExample()

  return (
    <div className="contents" data-workbench-view="review">
      <ChangeReviewPanel
        scopeId={session.sessionId}
        changes={
          query.scenario === "empty"
            ? { ...session.changes, files: [] }
            : session.changes
        }
        selectedFileId={state.panels.selectedFileId}
        onSelectFile={(id) =>
          dispatch({
            type: "panels",
            panels: { ...state.panels, selectedFileId: id },
          })
        }
        comments={state.comments[session.sessionId] ?? []}
        onCommentsChange={(comments) =>
          dispatch({ type: "comments", id: session.sessionId, comments })
        }
        onFeedback={(text) => {
          setDraft({
            ...draft,
            text: draft.text ? `${draft.text}\n\n${text}` : text,
            version: draft.version + 1,
          })
          navigate({ page: "session", layout: "conversation" })
        }}
        mode={mode}
        onModeChange={onModeChange}
        fileOnly={fileOnly}
      />
    </div>
  )
}
