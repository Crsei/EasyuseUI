"use client"

import { useReducer, useRef } from "react"
import Link from "next/link"
import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"
import { AgentComposer } from "@/components/blocks/agent-workbench/composer"
import {
  Conversation,
  type ConversationActions,
  type ChatMessageProps,
} from "@/components/blocks/chat-message"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { useI18n } from "@/lib/i18n-provider"
import type { AttentionRecord } from "@/lib/agent-board-model"
import type { DataState } from "@/lib/runtime-status"
import type { OperationReceipt } from "@/lib/agent-workbench-model"
import {
  approvalId,
  approvalMessageId,
  sessionId,
  fixtureSession,
  initialIntervention,
  interventionReducer,
} from "./intervention-model"
import { interventionMessages } from "./intervention-messages"
import {
  InterventionAttentionStrip,
  InterventionQueuePreview,
} from "./intervention-panels"
import styles from "./intervention.module.css"

export function InterventionLab() {
  const { locale, setLocale } = useI18n()
  const x = interventionMessages[locale]
  const [state, dispatch] = useReducer(
    interventionReducer,
    undefined,
    initialIntervention,
  )
  const actions = useRef<ConversationActions>(null)
  const approvalRecord = useRef<HTMLDivElement>(null)
  const approval = state.approvalOperation
  const queueOp = state.queueOperation
  const approvalText =
    approval?.state === "confirmed"
      ? approval.action === "accept"
        ? x.approved
        : x.denied
      : approval?.state === "pending"
        ? x.approvalPending
        : approval?.state === "unknown"
          ? x.approvalUnknown
          : approval?.state === "rejected"
            ? x.approvalRejected
            : undefined
  const request: AttentionRecord = {
    attentionId: approvalId,
    runId: "fixture-run",
    revision: state.approvalRevision,
    kind: "approval",
    title: x.approvalTitle,
    reason: x.approvalReason,
    target: "pnpm test:unit (fixture only)",
    scope: x.approvalScope,
    risk: x.approvalRisk,
    allowedActions: approval?.state === "confirmed" ? [] : ["accept", "reject"],
    operation: approval
      ? { state: approval.state, message: approvalText }
      : undefined,
    tool: {
      id: "fixture-command-call",
      name: "Shell (fixture)",
      status:
        approval?.state === "confirmed"
          ? approval.action === "accept"
            ? "idle"
            : "cancelled"
          : "waiting",
      arguments: {
        command: "pnpm test:unit",
        authorization: "fixture-secret-do-not-display",
      },
    },
  }
  const messages: ChatMessageProps[] = [
    { id: "fixture-user", role: "user", content: x.user, time: "10:42" },
    { id: "fixture-public-progress", role: "agent", content: x.intro },
    {
      id: approvalMessageId,
      role: "system",
      content: `${x.approvalTitle}\n${x.approvalScope}\n${x.approvalRisk}\n${approvalText ?? x.attentionReady}`,
      renderContent: () => (
        <div
          ref={approvalRecord}
          tabIndex={-1}
          className={styles.approvalRecord}
          data-approval-record
        >
          {approval?.state === "confirmed" && (
            <p className={styles.audit}>
              {x.audit} · {approval.requestId}
            </p>
          )}
          {approval && approval.state !== "rejected" && (
            <p className={styles.meta}>
              {x.approvalScope}
              <br />
              {x.approvalRisk}
            </p>
          )}
          <ApprovalRequestPanel
            request={request}
            canReconcile={!approval?.queried}
            onAction={async (action) => {
              dispatch({
                type: "approval-request",
                action,
                baseRevision: request.revision,
              })
              // The action may disappear while pending. Retain keyboard context
              // in the stable audit record without moving the reading position.
              approvalRecord.current?.focus({ preventScroll: true })
            }}
          />
          {approval?.queried && approval.state === "unknown" && (
            <p role="status">{x.queried}</p>
          )}
        </div>
      ),
    },
    ...Array.from({ length: 8 }, (_, i): ChatMessageProps => ({
      id: `fixture-reading-${i}`,
      role: "agent",
      content: `${i + 1}. ${x.reading}`,
    })),
    ...state.dispatched.map((message): ChatMessageProps => ({
      id: message.id,
      role: "user",
      content: message.text,
      author: `${x.dispatch} · ${message.mode}`,
    })),
  ]
  const session = fixtureSession(state)
  const receipts: OperationReceipt[] =
    queueOp && (queueOp.state === "pending" || queueOp.state === "unknown")
      ? [
          {
            requestId: queueOp.requestId,
            targetId: sessionId,
            action: queueOp.intent.action,
            state: queueOp.state,
          },
        ]
      : []
  // Incomplete data prevents writes, not further draft editing.
  if (state.dataState !== "success")
    session.capabilities = {
      ...session.capabilities,
      queue: false,
      steer: false,
    }
  return (
    <main className={styles.root} data-intervention-lab>
      <header className={styles.pageHeader}>
        <div>
          <Link prefetch={false} href="/examples/agent-workbench/regions/">
            ← {x.back}
          </Link>
          <h1>{x.title}</h1>
          <p>{x.fixture}</p>
        </div>
        <label className={styles.locale}>
          {x.language}
          <select
            value={locale}
            onChange={(event) =>
              setLocale(event.target.value === "en" ? "en" : "zh-CN")
            }
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
        </label>
      </header>
      <p className={styles.meta}>{x.explanation}</p>
      <details className={styles.sourceControls} open>
        <summary>{x.controls}</summary>
        <div className={styles.sources}>
          <fieldset data-approval-source>
            <legend>{x.approvalSource}</legend>
            <div className={styles.toolbar}>
              {(["confirm", "reject", "lose"] as const).map((outcome) => (
                <Button
                  key={outcome}
                  variant="secondary"
                  size="sm"
                  disabled={
                    !approval ||
                    !["pending", "unknown"].includes(approval.state) ||
                    (approval.state === "unknown" && !approval.queried)
                  }
                  onClick={() =>
                    approval &&
                    dispatch({
                      type: "approval-source",
                      requestId: approval.requestId,
                      outcome,
                    })
                  }
                >
                  {outcome === "confirm"
                    ? x.confirm
                    : outcome === "reject"
                      ? x.rejectSource
                      : x.lose}
                </Button>
              ))}
            </div>
            {approval && (
              <code>
                {approval.requestId} · {approval.action}
              </code>
            )}
          </fieldset>
          <fieldset data-queue-source>
            <legend>{x.queueSource}</legend>
            <div className={styles.toolbar}>
              {(["confirm", "reject", "lose"] as const).map((outcome) => (
                <Button
                  key={outcome}
                  variant="secondary"
                  size="sm"
                  disabled={
                    !queueOp ||
                    !["pending", "unknown"].includes(queueOp.state) ||
                    (queueOp.state === "unknown" && !queueOp.queried)
                  }
                  onClick={() =>
                    queueOp &&
                    dispatch({
                      type: "queue-source",
                      requestId: queueOp.requestId,
                      outcome,
                    })
                  }
                >
                  {outcome === "confirm"
                    ? x.confirm
                    : outcome === "reject"
                      ? x.rejectSource
                      : x.lose}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={!state.queue.length}
                onClick={() => dispatch({ type: "take-first" })}
              >
                {x.take}
              </Button>
            </div>
            <label className={styles.dataChoice}>
              {x.data}
              <select
                value={state.dataState}
                onChange={(event) =>
                  dispatch({
                    type: "data",
                    state: event.target.value as DataState,
                  })
                }
              >
                {(
                  ["loading", "empty", "partial", "error", "success"] as const
                ).map((status) => (
                  <option key={status} value={status}>
                    {x[status]}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        </div>
      </details>
      <section className={styles.preview} aria-label={x.previewTitle}>
        <header className={styles.sessionHeader}>
          <h2>{x.header}</h2>
          <div>
            <RuntimeStatusBadge status="waiting" />
            <span>{x.stage}</span>
          </div>
        </header>
        <Conversation
          layout="fill"
          presentation="workspace"
          className={styles.conversation}
          actionsRef={actions}
          messages={messages}
          revision={`${state.nextRequest}:${state.approvalRevision}:${approval?.state}:${state.dispatched.length}`}
          composer={
            <div className={styles.bottomDock} data-intervention-bottom-dock>
              <InterventionAttentionStrip
                operation={approval}
                onReview={() =>
                  actions.current?.scrollToMessage(approvalMessageId, {
                    focus: true,
                  })
                }
              />
              <InterventionQueuePreview state={state} dispatch={dispatch} />
              <div data-intervention-composer>
                <AgentComposer
                  draft={state.draft}
                  onChange={(draft) => dispatch({ type: "draft", draft })}
                  session={session}
                  receipts={receipts}
                  quickControls
                  modes={["queue", "steer"]}
                  models={[
                    {
                      id: "fixture-model",
                      label: "Fixture model (no provider)",
                    },
                  ]}
                  permissions={[
                    { id: "fixture-ask", label: "Fixture approval" },
                  ]}
                  environments={[
                    { id: "fixture-memory", label: "In-memory fixture" },
                  ]}
                  onSubmit={(draft) =>
                    dispatch({
                      type: "queue-request",
                      intent: { action: "submit", draft },
                    })
                  }
                  onReconcile={
                    queueOp?.queried
                      ? undefined
                      : (receipt) =>
                          dispatch({
                            type: "queue-query",
                            requestId: receipt.requestId,
                          })
                  }
                />
              </div>
            </div>
          }
        />
      </section>
    </main>
  )
}
