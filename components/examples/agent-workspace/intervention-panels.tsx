"use client"

import { useId, useState } from "react"
import { ArrowUp, ArrowDown, Pencil, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n-provider"
import { interventionMessages } from "./intervention-messages"
import {
  approvalId,
  queueLocked,
  type InterventionState,
  type InterventionEvent,
} from "./intervention-model"
import styles from "./intervention.module.css"

/** Same attentionId as the historical approval. Locating never approves. */
export function InterventionAttentionStrip({
  operation,
  onReview,
}: {
  operation: InterventionState["approvalOperation"]
  onReview: () => void
}) {
  const { locale } = useI18n()
  const x = interventionMessages[locale]
  if (operation?.state === "confirmed") return null
  const text =
    operation?.state === "pending"
      ? x.attentionPending
      : operation?.state === "unknown"
        ? x.attentionUnknown
        : operation?.state === "rejected"
          ? x.attentionRejected
          : x.attentionReady
  return (
    <div className={styles.attention} data-attention-strip={approvalId}>
      <AlertTriangle size={16} aria-hidden="true" />
      <span role="status">{text}</span>
      <Button variant="secondary" onClick={onReview}>
        {x.review}
      </Button>
    </div>
  )
}

/** Controlled queue requests; the caller retains drafts, receipts and version locks. */
export function InterventionQueuePreview({
  state,
  dispatch,
}: {
  state: InterventionState
  dispatch: (event: InterventionEvent) => void
}) {
  const { locale } = useI18n()
  const x = interventionMessages[locale]
  const listId = useId()
  const [expanded, setExpanded] = useState(false)
  const op = state.queueOperation
  const locked = queueLocked(state) || state.dataState !== "success"
  const visible = expanded ? state.queue : state.queue.slice(0, 2)
  const editingItem = state.queue.find(
    (q) => q.queuedPromptId === state.edit?.id,
  )
  const conflict = Boolean(
    state.edit &&
    (!editingItem || editingItem.revision !== state.edit.baseRevision),
  )
  const operationText =
    op?.state === "failed"
      ? op.reason === "stale"
        ? x.stale
        : x.failed
      : op
        ? x[op.state]
        : ""
  return (
    <section
      className={styles.queue}
      aria-label={x.queueTitle}
      data-queue-preview
    >
      <header className={styles.queueHeader}>
        <h3>
          {x.queueTitle} ·{" "}
          {state.dataState === "success" ? state.queue.length : "—"}
        </h3>
        {state.queue.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? x.less : x.more}
          </Button>
        )}
      </header>
      <DataRegion
        state={
          state.dataState === "success" && state.queue.length === 0
            ? "empty"
            : state.dataState
        }
        hasContent={state.queue.length > 0 && state.dataState !== "empty"}
        loadingLabel={x.queueRefreshing}
        rowHeight={40}
        emptyTitle={x.queueEmpty}
        emptyDescription={
          state.dataState === "empty" ? x.queueHidden : x.queueNext
        }
        partialDescription={x.queuePartial}
        updatedAt="2026-10-10T00:00:00Z (fixture)"
        error={{
          category: "request",
          message: x.queueError,
          reason: x.noWrite,
        }}
        onRetry={() => dispatch({ type: "data", state: "success" })}
      >
        <ol id={listId} className={styles.queueList}>
          {visible.map((item, index) => (
            <li
              key={item.queuedPromptId}
              data-queued-prompt-id={item.queuedPromptId}
            >
              <div className={styles.queueText}>
                <p title={item.text}>{item.text}</p>
                <span className={styles.meta}>
                  {item.queuedPromptId} · r{item.revision} · {x.draftVersion}{" "}
                  {item.draftVersion}
                </span>
              </div>
              <div className={styles.itemActions}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${x.edit} ${item.queuedPromptId}`}
                  disabled={locked}
                  onClick={() =>
                    dispatch({ type: "edit-start", id: item.queuedPromptId })
                  }
                >
                  <Pencil size={16} />
                </Button>
                {([-1, 1] as const).map((direction) => {
                  const target = state.queue[index + direction]
                  return (
                    <Button
                      key={direction}
                      variant="ghost"
                      size="icon"
                      aria-label={`${direction === -1 ? x.up : x.down} ${item.queuedPromptId}`}
                      disabled={locked || !target}
                      onClick={() =>
                        dispatch({
                          type: "queue-request",
                          intent: {
                            action: "move",
                            id: item.queuedPromptId,
                            baseRevision: item.revision,
                            direction,
                            targetId: target.queuedPromptId,
                            targetRevision: target.revision,
                          },
                        })
                      }
                    >
                      {direction === -1 ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )}
                    </Button>
                  )
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${x.cancel} ${item.queuedPromptId}`}
                  disabled={locked}
                  onClick={() =>
                    dispatch({
                      type: "queue-request",
                      intent: {
                        action: "cancel",
                        id: item.queuedPromptId,
                        baseRevision: item.revision,
                      },
                    })
                  }
                >
                  <X size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </DataRegion>
      {state.edit && (
        <form
          className={styles.edit}
          onSubmit={(event) => {
            event.preventDefault()
            if (!locked && !conflict && state.edit)
              dispatch({
                type: "queue-request",
                intent: { action: "edit", edit: state.edit },
              })
          }}
        >
          <Field
            label={x.editLabel}
            description={x.editorPending}
            error={conflict ? x.conflict : undefined}
          >
            {(props) => (
              <Textarea
                {...props}
                value={state.edit!.text}
                onChange={(event) =>
                  dispatch({ type: "edit-text", text: event.target.value })
                }
              />
            )}
          </Field>
          <div className={styles.toolbar}>
            <Button
              type="submit"
              variant="secondary"
              disabled={locked || conflict || !state.edit.text.trim()}
            >
              {x.save}
            </Button>
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "edit-close" })}
            >
              {x.closeEdit}
            </Button>
          </div>
        </form>
      )}
      {op && (
        <div
          className={styles.queueReceipt}
          data-queue-operation={op.state}
          data-request-id={op.requestId}
        >
          <p
            role={
              op.state === "unknown" || op.state === "failed"
                ? "alert"
                : "status"
            }
          >
            {operationText}
          </p>
          <code>
            {op.requestId} · {op.intent.action}
          </code>
          {op.state === "unknown" && (
            <Button
              variant="secondary"
              disabled={op.queried}
              onClick={() =>
                dispatch({ type: "queue-query", requestId: op.requestId })
              }
            >
              {x.query}
            </Button>
          )}
          {op.queried && op.state === "unknown" && (
            <p role="status">{x.queried}</p>
          )}
        </div>
      )}
    </section>
  )
}
