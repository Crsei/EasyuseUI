import {
  acknowledgeDraft,
  type DraftState,
  type SessionSnapshot,
} from "@/lib/agent-workbench-model"
import type { AttentionAction } from "@/lib/agent-board-model"
import type { DataState } from "@/lib/runtime-status"

/** Private, in-memory source fixture. No timers, transport, execution or storage. */
export type QueuedPrompt = {
  queuedPromptId: string
  revision: number
  draftVersion: number
  text: string
}
export type QueueEdit = {
  id: string
  baseRevision: number
  version: number
  text: string
}
export type QueueIntent =
  | { action: "submit"; draft: DraftState }
  | { action: "cancel"; id: string; baseRevision: number }
  | { action: "edit"; edit: QueueEdit }
  | {
      action: "move"
      id: string
      baseRevision: number
      direction: -1 | 1
      targetId: string
      targetRevision: number
    }
export type QueueOperation = {
  requestId: string
  intent: QueueIntent
  state: "pending" | "unknown" | "failed" | "confirmed"
  queried: boolean
  reason?: "stale" | "rejected"
}
export type ApprovalOperation = {
  requestId: string
  baseRevision: number
  action: "accept" | "reject"
  state: "pending" | "unknown" | "confirmed" | "rejected"
  queried: boolean
}
export type InterventionState = {
  draft: DraftState
  queue: QueuedPrompt[]
  edit?: QueueEdit
  queueOperation?: QueueOperation
  approvalOperation?: ApprovalOperation
  approvalRevision: number
  nextRequest: number
  dataState: DataState
  dispatched: { id: string; text: string; mode: "queue" | "steer" }[]
}
export const approvalId = "fixture-approval-1"
export const approvalMessageId = "fixture-approval-record"
export const sessionId = "fixture-intervention-session"
export const queueLocked = (state: InterventionState) =>
  state.queueOperation?.state === "pending" ||
  state.queueOperation?.state === "unknown"

export function initialIntervention(): InterventionState {
  return {
    draft: {
      draftId: "fixture-intervention-draft",
      version: 1,
      text: "",
      context: [],
      modelId: "fixture-model",
      permissionId: "fixture-ask",
      environmentId: "fixture-memory",
      mode: "queue",
    },
    queue: [
      {
        queuedPromptId: "fixture-q1",
        revision: 1,
        draftVersion: 1,
        text: "完成后检查类型 / Check types after this turn",
      },
      {
        queuedPromptId: "fixture-q2",
        revision: 1,
        draftVersion: 2,
        text: "总结本轮变更 / Summarize this turn",
      },
      {
        queuedPromptId: "fixture-q3",
        revision: 1,
        draftVersion: 3,
        text: "记录尚未验证的能力 / Record unverified capabilities",
      },
    ],
    approvalRevision: 1,
    nextRequest: 1,
    dataState: "success",
    dispatched: [],
  }
}
export function fixtureSession(state: InterventionState): SessionSnapshot {
  return {
    sessionId,
    projectId: "fixture-project",
    source: "Explicit local source fixture",
    agent: { id: "fixture-agent", name: "Fixture Agent" },
    title: "Intervention fixture",
    activeRunId: "fixture-run",
    revision: state.nextRequest,
    cursor: 0,
    status: "waiting",
    updatedAt: "2026-10-10T00:00:00Z",
    environment: {
      environmentId: "fixture-memory",
      name: "In-memory fixture",
      connection: "connected",
      capabilities: ["queue", "steer"],
    },
    capabilities: { send: false, queue: true, steer: true, interrupt: false },
    contextSources: [],
    messages: [],
    history: { hasMore: false },
    tools: [],
    attention: [],
    artifacts: [],
    changes: {
      repositoryId: "fixture",
      scope: "none",
      base: "none",
      head: "none",
      revision: "1",
      files: [],
    },
    plan: [],
    output: { text: "", source: "fixture", timestamp: "2026-10-10T00:00:00Z" },
    dataState: "success",
  }
}
export type InterventionEvent =
  | { type: "draft"; draft: DraftState }
  | { type: "edit-start"; id: string }
  | { type: "edit-text"; text: string }
  | { type: "edit-close" }
  | { type: "queue-request"; intent: QueueIntent }
  | {
      type: "queue-source"
      requestId: string
      outcome: "confirm" | "reject" | "lose"
    }
  | { type: "queue-query"; requestId: string }
  | { type: "take-first" }
  | { type: "data"; state: DataState }
  | {
      type: "approval-request"
      action: AttentionAction | "reconcile"
      baseRevision: number
    }
  | {
      type: "approval-source"
      requestId: string
      outcome: "confirm" | "reject" | "lose"
    }

export function interventionReducer(
  state: InterventionState,
  event: InterventionEvent,
): InterventionState {
  switch (event.type) {
    case "draft":
      return { ...state, draft: event.draft }
    case "edit-start": {
      if (queueLocked(state)) return state
      const item = state.queue.find((q) => q.queuedPromptId === event.id)
      return item
        ? {
            ...state,
            edit: {
              id: event.id,
              text: item.text,
              baseRevision: item.revision,
              version: 1,
            },
          }
        : state
    }
    case "edit-text":
      return state.edit
        ? {
            ...state,
            edit: {
              ...state.edit,
              text: event.text,
              version: state.edit.version + 1,
            },
          }
        : state
    case "edit-close":
      return { ...state, edit: undefined }
    case "queue-request": {
      if (queueLocked(state) || state.dataState !== "success") return state
      const intent = event.intent
      if (intent.action === "submit") {
        if (
          !intent.draft.text.trim() ||
          !["queue", "steer"].includes(intent.draft.mode)
        )
          return state
      } else {
        const id = intent.action === "edit" ? intent.edit.id : intent.id
        const revision =
          intent.action === "edit"
            ? intent.edit.baseRevision
            : intent.baseRevision
        const item = state.queue.find((q) => q.queuedPromptId === id)
        if (
          !item ||
          item.revision !== revision ||
          (intent.action === "edit" && !intent.edit.text.trim())
        )
          return state
      }
      return {
        ...state,
        nextRequest: state.nextRequest + 1,
        queueOperation: {
          requestId: `fixture-queue-request-${state.nextRequest}`,
          intent,
          state: "pending",
          queried: false,
        },
      }
    }
    case "queue-query": {
      const op = state.queueOperation
      return op?.requestId === event.requestId && op.state === "unknown"
        ? { ...state, queueOperation: { ...op, queried: true } }
        : state
    }
    case "queue-source": {
      const op = state.queueOperation
      if (
        !op ||
        op.requestId !== event.requestId ||
        !["pending", "unknown"].includes(op.state)
      )
        return state
      if (op.state === "unknown" && !op.queried) return state
      if (event.outcome === "lose")
        return {
          ...state,
          queueOperation: { ...op, state: "unknown", queried: false },
        }
      if (event.outcome === "reject")
        return {
          ...state,
          queueOperation: { ...op, state: "failed", reason: "rejected" },
        }
      const intent = op.intent
      if (intent.action === "submit") {
        const draft = intent.draft
        const id = `${op.requestId}-prompt`
        return {
          ...state,
          queueOperation: { ...op, state: "confirmed" },
          draft: acknowledgeDraft(state.draft, {
            requestId: op.requestId,
            targetId: sessionId,
            action: draft.mode,
            state: "confirmed",
            draftId: draft.draftId,
            draftVersion: draft.version,
          }),
          queue:
            draft.mode === "queue"
              ? [
                  ...state.queue,
                  {
                    queuedPromptId: id,
                    text: draft.text,
                    revision: 1,
                    draftVersion: draft.version,
                  },
                ]
              : state.queue,
          dispatched:
            draft.mode === "steer"
              ? [...state.dispatched, { id, text: draft.text, mode: "steer" }]
              : state.dispatched,
        }
      }
      const id = intent.action === "edit" ? intent.edit.id : intent.id
      const revision =
        intent.action === "edit"
          ? intent.edit.baseRevision
          : intent.baseRevision
      const index = state.queue.findIndex((q) => q.queuedPromptId === id)
      if (index < 0 || state.queue[index].revision !== revision) {
        return {
          ...state,
          queueOperation: { ...op, state: "failed", reason: "stale" },
        }
      }
      const queue = [...state.queue]
      let edit = state.edit
      if (intent.action === "cancel") queue.splice(index, 1)
      if (intent.action === "edit") {
        queue[index] = {
          ...queue[index],
          text: intent.edit.text,
          revision: revision + 1,
        }
        if (edit?.id === id && edit.version === intent.edit.version)
          edit = undefined
      }
      if (intent.action === "move") {
        const target = index + intent.direction
        if (
          target < 0 ||
          target >= queue.length ||
          queue[target].queuedPromptId !== intent.targetId ||
          queue[target].revision !== intent.targetRevision
        ) {
          return {
            ...state,
            queueOperation: { ...op, state: "failed", reason: "stale" },
          }
        }
        // Both affected ordering revisions change; old concurrent intents cannot be applied.
        const a = { ...queue[index], revision: queue[index].revision + 1 }
        const b = { ...queue[target], revision: queue[target].revision + 1 }
        queue[index] = b
        queue[target] = a
      }
      return {
        ...state,
        queue,
        edit,
        queueOperation: { ...op, state: "confirmed" },
      }
    }
    case "take-first": {
      const first = state.queue[0]
      if (!first) return state
      return {
        ...state,
        queue: state.queue.slice(1),
        dispatched: [
          ...state.dispatched,
          {
            id: `${first.queuedPromptId}-taken`,
            text: first.text,
            mode: "queue",
          },
        ],
      }
    }
    case "data":
      return { ...state, dataState: event.state }
    case "approval-request": {
      const op = state.approvalOperation
      if (event.action === "reconcile") {
        return op?.state === "unknown"
          ? { ...state, approvalOperation: { ...op, queried: true } }
          : state
      }
      if (
        !["accept", "reject"].includes(event.action) ||
        event.baseRevision !== state.approvalRevision ||
        (op && op.state !== "rejected")
      )
        return state
      return {
        ...state,
        nextRequest: state.nextRequest + 1,
        approvalOperation: {
          requestId: `fixture-approval-request-${state.nextRequest}`,
          baseRevision: event.baseRevision,
          action: event.action as "accept" | "reject",
          state: "pending",
          queried: false,
        },
      }
    }
    case "approval-source": {
      const op = state.approvalOperation
      if (
        !op ||
        op.requestId !== event.requestId ||
        op.baseRevision !== state.approvalRevision ||
        !["pending", "unknown"].includes(op.state)
      )
        return state
      if (op.state === "unknown" && !op.queried) return state
      if (event.outcome === "lose")
        return {
          ...state,
          approvalOperation: { ...op, state: "unknown", queried: false },
        }
      if (event.outcome === "reject")
        return { ...state, approvalOperation: { ...op, state: "rejected" } }
      return {
        ...state,
        approvalRevision: state.approvalRevision + 1,
        approvalOperation: { ...op, state: "confirmed" },
      }
    }
  }
}
