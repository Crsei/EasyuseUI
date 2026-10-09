import {
  acknowledgeDraft,
  activeReceipt,
  draftCanSubmit,
  applySessionEvent,
  type WorkbenchState,
  type DraftState,
  type ReviewComment,
  type SessionSnapshot,
  type WorkbenchMessage,
} from "@/lib/agent-workbench-model"
import type { AttentionAction } from "@/lib/agent-board-model"
import { initialWorkbench, makeDraft } from "./fixtures"
export type ExampleState = WorkbenchState & {
  metadataRequests: Record<
    string,
    {
      id: string
      patch: Partial<Pick<SessionSnapshot, "title" | "favorite" | "archived">>
    }
  >
  comments: Record<string, ReviewComment[]>
  sequence: number
  phases: Record<string, number>
  queued: Record<string, WorkbenchMessage[]>
  selectedRunId?: string
  templates: Record<string, string>
  creationTemplates: Record<string, string>
}
export function initialExample(): ExampleState {
  return {
    ...initialWorkbench(),
    comments: {},
    sequence: 1,
    phases: {},
    queued: {},
    templates: { "session-report": "artifacts" },
    creationTemplates: {},
    metadataRequests: {},
  }
}
export type ExampleAction =
  | {
      type: "metadata"
      id: string
      patch: Partial<Pick<SessionSnapshot, "title" | "favorite" | "archived">>
    }
  | { type: "draft"; id: string; draft: DraftState }
  | { type: "panels"; panels: WorkbenchState["panels"] }
  | {
      type: "session"
      id: string
      patch: Partial<
        Pick<
          SessionSnapshot,
          | "title"
          | "favorite"
          | "archived"
          | "dataState"
          | "error"
          | "environment"
          | "capabilities"
        >
      >
    }
  | {
      type: "begin"
      id: string
      action: DraftState["mode"] | "interrupt" | AttentionAction | "create"
      attentionId?: string
      response?: string
      template?: string
    }
  | {
      type: "settle"
      requestId: string
      state: "confirmed" | "failed" | "unknown"
    }
  | { type: "scenario"; id: string; scenario: string }
  | { type: "advance"; id: string }
  | { type: "history"; id: string }
  | { type: "long"; id: string }
  | { type: "comments"; id: string; comments: ReviewComment[] }
  | { type: "revision"; id: string }
  | { type: "event"; id: string; cursor: number; message: WorkbenchMessage }
  | { type: "reset" }
function editSession(
  state: ExampleState,
  id: string,
  edit: (s: SessionSnapshot) => SessionSnapshot,
) {
  return {
    ...state,
    sessions: state.sessions.map((s) => (s.sessionId === id ? edit(s) : s)),
  }
}
export function exampleReducer(
  state: ExampleState,
  action: ExampleAction,
): ExampleState {
  if (action.type === "reset") return initialExample()
  if (action.type === "draft")
    return { ...state, drafts: { ...state.drafts, [action.id]: action.draft } }
  if (action.type === "panels") return { ...state, panels: action.panels }
  if (action.type === "metadata") {
    if (
      !state.sessions.some((session) => session.sessionId === action.id) ||
      activeReceipt(state.receipts, action.id)
    )
      return state
    const requestId = `request-${state.sequence}`
    return {
      ...state,
      sequence: state.sequence + 1,
      metadataRequests: {
        ...state.metadataRequests,
        [requestId]: { id: action.id, patch: { ...action.patch } },
      },
      receipts: [
        ...state.receipts,
        {
          requestId,
          targetId: action.id,
          action: "update-session",
          state: "pending",
        },
      ],
    }
  }
  if (action.type === "session")
    return editSession(state, action.id, (s) => ({
      ...s,
      ...action.patch,
      revision: s.revision + 1,
    }))
  if (action.type === "scenario") {
    if (action.scenario === "long")
      return exampleReducer(state, { type: "long", id: action.id })
    if (
      action.scenario === "unknown" &&
      !activeReceipt(state.receipts, action.id)
    ) {
      return {
        ...state,
        sequence: state.sequence + 1,
        receipts: [
          ...state.receipts,
          {
            requestId: `request-${state.sequence}`,
            targetId: action.id,
            action: "interrupt",
            state: "unknown",
          },
        ],
      }
    }
    return state
  }
  if (action.type === "comments")
    return {
      ...state,
      comments: { ...state.comments, [action.id]: action.comments },
    }
  if (action.type === "event")
    return editSession(state, action.id, (s) =>
      applySessionEvent(s, {
        sessionId: action.id,
        cursor: action.cursor,
        message: action.message,
      }),
    )
  if (action.type === "revision")
    return editSession(state, action.id, (s) => ({
      ...s,
      revision: s.revision + 1,
      changes: {
        ...s.changes,
        revision: `diff-${s.revision + 1}`,
        head: `b${s.revision + 1}`,
      },
    }))
  if (action.type === "history" || action.type === "long")
    return editSession(state, action.id, (s) => {
      if (action.type === "history" && !s.history.hasMore) return s
      const count = action.type === "long" ? 1000 : 30
      const messages: WorkbenchMessage[] = Array.from(
        { length: count },
        (_, i) => ({
          messageId: `history-${s.sessionId}-${i}`,
          turnId: `history-turn-${s.sessionId}`,
          role: i % 2 ? "agent" : "user",
          sequence: i - count,
          revision: 1,
          state: "completed",
          parts: [
            {
              partId: `history-part-${s.sessionId}-${i}`,
              sequence: 1,
              revision: 1,
              kind: "text",
              text: `Earlier message ${i + 1}: stable source record with preserved reading position.`,
            },
          ],
        }),
      )
      return {
        ...s,
        messages: [
          ...messages,
          ...s.messages.filter((m) => !m.messageId.startsWith("history-")),
        ],
        history: { hasMore: false },
        changes:
          action.type === "long"
            ? {
                ...s.changes,
                files: s.changes.files.map((f, i) =>
                  i
                    ? f
                    : {
                        ...f,
                        lines: Array.from({ length: 1200 }, (_, n) => ({
                          id: `long-line-${n}`,
                          kind:
                            n % 3 === 0
                              ? ("add" as const)
                              : ("context" as const),
                          text: `// Source diff line ${n + 1}: ${"long code content ".repeat(4)}`,
                          newLine: n + 1,
                          oldLine: n % 3 === 0 ? undefined : n + 1,
                        })),
                      },
                ),
              }
            : s.changes,
        revision: s.revision + 1,
      }
    })
  if (action.type === "begin") {
    const target = action.attentionId ?? action.id
    const s = state.sessions.find((s) => s.sessionId === action.id)
    const attention = s?.attention.find(
      (a) => a.attentionId === action.attentionId,
    )
    if (
      activeReceipt(state.receipts, target) ||
      (action.attentionId &&
        (!attention ||
          attention.expired ||
          !attention.allowedActions.includes(action.action as AttentionAction)))
    )
      return state
    const draft = state.drafts[action.id]
    if (
      ["send", "queue", "steer", "create"].includes(action.action) &&
      !draft?.text.trim()
    )
      return state
    if (
      s &&
      ["send", "queue", "steer"].includes(action.action) &&
      draft &&
      !draftCanSubmit(
        s,
        { ...draft, mode: action.action as DraftState["mode"] },
        state.receipts,
      )
    )
      return state
    if (
      action.action === "interrupt" &&
      (!s?.capabilities.interrupt || s.environment.connection !== "connected")
    )
      return state
    const requestId = `request-${state.sequence}`
    const receipt = {
      requestId,
      targetId: target,
      action: action.action,
      state: "pending" as const,
      draftVersion: draft?.version,
      submittedDraft: draft ? structuredClone(draft) : undefined,
      reason: action.response,
    }
    const next = {
      ...state,
      sequence: state.sequence + 1,
      receipts: [...state.receipts, receipt],
      creationTemplates:
        action.action === "create"
          ? {
              ...state.creationTemplates,
              [requestId]: action.template ?? "coding",
            }
          : state.creationTemplates,
    }
    return action.attentionId
      ? editSession(next, action.id, (s) => ({
          ...s,
          attention: s.attention.map((a) =>
            a.attentionId === action.attentionId
              ? { ...a, operation: { state: "pending" } }
              : a,
          ),
        }))
      : next
  }
  if (action.type === "settle") {
    const previous = state.receipts.find(
      (r) => r.requestId === action.requestId,
    )
    if (!previous || !["pending", "unknown"].includes(previous.state))
      return state
    const receipt = {
      ...previous,
      state: action.state,
      receipt:
        action.state === "confirmed"
          ? `fixture-receipt-${previous.requestId}`
          : undefined,
    }
    let next = {
      ...state,
      receipts: state.receipts.map((r) =>
        r.requestId === receipt.requestId ? receipt : r,
      ),
    }
    const s = state.sessions.find(
      (s) =>
        s.sessionId === receipt.targetId ||
        s.attention.some((a) => a.attentionId === receipt.targetId),
    )
    if (action.state !== "confirmed")
      return s
        ? editSession(next, s.sessionId, (s) => ({
            ...s,
            attention: s.attention.map((a) =>
              a.attentionId === receipt.targetId
                ? {
                    ...a,
                    operation: {
                      state: action.state === "failed" ? "rejected" : "unknown",
                    },
                  }
                : a,
            ),
          }))
        : next
    if (receipt.action === "update-session") {
      const request = next.metadataRequests[receipt.requestId]
      return request
        ? editSession(next, request.id, (session) => ({
            ...session,
            ...request.patch,
            revision: session.revision + 1,
          }))
        : next
    }
    if (receipt.action === "create" && receipt.submittedDraft) {
      const template = state.creationTemplates[receipt.requestId] ?? "coding"
      const id = `session-created-${receipt.requestId}`
      const base = initialWorkbench().sessions[0]
      const draft = receipt.submittedDraft
      const created: SessionSnapshot = {
        ...base,
        sessionId: id,
        threadId: `thread-${id}`,
        title: draft.text.slice(0, 70),
        activeRunId: `run-${id}`,
        status: "waiting",
        messages: [
          {
            messageId: `message-${id}-1`,
            turnId: `turn-${id}-1`,
            sequence: 1,
            revision: 1,
            role: "user",
            state: "completed",
            parts: [
              {
                partId: `part-${id}-1`,
                sequence: 1,
                revision: 1,
                kind: "text",
                text: draft.text,
              },
            ],
          },
          {
            messageId: `message-${id}-2`,
            turnId: `turn-${id}-1`,
            sequence: 2,
            revision: 1,
            role: "agent",
            state: "completed",
            parts: [
              {
                partId: `part-${id}-2`,
                sequence: 1,
                revision: 1,
                kind: "text",
                text: "Plan: inspect filter, run tests, review changes. Test execution requires approval.",
              },
            ],
          },
        ],
        history: { hasMore: false },
        tools: [
          {
            id: `tool-${id}`,
            name: "run_tests",
            status: "waiting",
            arguments: { command: "test filter" },
          },
        ],
        attention: [
          {
            attentionId: `approval-${id}`,
            runId: `run-${id}`,
            revision: 1,
            kind: "approval",
            title: "Run focused tests",
            reason: "Source requests command approval",
            scope: "tests/filter.test.ts",
            risk: "Local fixture command output only",
            allowedActions: ["accept", "reject"],
            tool: { id: `tool-${id}`, name: "run_tests", status: "waiting" },
          },
        ],
        artifacts: [],
      }
      if (template === "artifacts") {
        created.tools = [
          {
            id: `tool-${id}`,
            name: "write_report",
            status: "waiting",
            arguments: { references: draft.context.map((r) => r.id) },
          },
        ]
        created.attention = [
          {
            attentionId: `approval-${id}`,
            runId: created.activeRunId,
            revision: 1,
            kind: "approval",
            title: "Generate report from source references",
            reason: "Source requests permission to create a report artifact",
            scope: "reports/summary.md only",
            risk: "Local report fixture; no code execution",
            allowedActions: ["accept", "reject"],
            tool: { id: `tool-${id}`, name: "write_report", status: "waiting" },
          },
        ]
        created.plan = [
          {
            id: "plan-analysis",
            title: "Analyze source references",
            status: "completed",
          },
          {
            id: "plan-report",
            title: "Generate report artifact",
            status: "waiting",
            toolId: `tool-${id}`,
          },
        ]
        created.messages[1].parts = [
          {
            partId: `part-${id}-2`,
            sequence: 1,
            revision: 1,
            kind: "text",
            text: "Analysis plan: read supplied references, draft a report, then review citations. No code execution is requested.",
          },
        ]
      }
      return {
        ...next,
        templates: { ...next.templates, [id]: template },
        sessions: [created, ...state.sessions],
        drafts: {
          ...state.drafts,
          new: acknowledgeDraft(state.drafts.new, receipt),
          [id]: { ...makeDraft(id), context: draft.context, mode: "queue" },
        },
      }
    }
    if (!s) return next
    if (
      ["send", "queue", "steer"].includes(receipt.action) &&
      receipt.submittedDraft
    ) {
      const draft = receipt.submittedDraft
      const m: WorkbenchMessage = {
        messageId: `message-${receipt.requestId}`,
        turnId: `turn-${receipt.requestId}`,
        role: "user",
        sequence: s.cursor + 10,
        revision: 1,
        state: "completed",
        parts: [
          {
            partId: `part-${receipt.requestId}`,
            kind: "text",
            text: draft.text,
            sequence: 1,
            revision: 1,
          },
        ],
      }
      next = {
        ...next,
        drafts: {
          ...next.drafts,
          [s.sessionId]: acknowledgeDraft(next.drafts[s.sessionId], receipt),
        },
      }
      if (receipt.action === "queue")
        return {
          ...next,
          queued: {
            ...next.queued,
            [s.sessionId]: [...(next.queued[s.sessionId] ?? []), m],
          },
        }
      return editSession(next, s.sessionId, (s) => ({
        ...s,
        messages: [...s.messages, m],
        status: "running",
        activeRunId:
          receipt.action === "send"
            ? `run-${receipt.requestId}`
            : s.activeRunId,
        revision: s.revision + 1,
        cursor: s.cursor + 1,
      }))
    }
    if (receipt.action === "interrupt")
      return editSession(next, s.sessionId, (s) => ({
        ...s,
        status: "cancelled",
        tools: s.tools.map((t) =>
          ["running", "waiting"].includes(t.status)
            ? { ...t, status: "cancelled" }
            : t,
        ),
        revision: s.revision + 1,
      }))
    const attention = s.attention.find(
      (a) => a.attentionId === receipt.targetId,
    )
    return editSession(next, s.sessionId, (s) => ({
      ...s,
      status:
        receipt.action === "accept"
          ? "running"
          : receipt.action === "reject"
            ? "cancelled"
            : s.status,
      attention: s.attention.map((a) =>
        a.attentionId === receipt.targetId
          ? { ...a, operation: { state: "confirmed" }, allowedActions: [] }
          : a,
      ),
      tools: s.tools.map((t) =>
        t.id === attention?.tool?.id
          ? {
              ...t,
              status:
                receipt.action === "accept"
                  ? "running"
                  : receipt.action === "reject"
                    ? "cancelled"
                    : t.status,
            }
          : t,
      ),
      messages:
        receipt.action === "respond"
          ? [
              ...s.messages,
              {
                messageId: `answer-${receipt.requestId}`,
                turnId: `turn-${receipt.requestId}`,
                sequence: s.cursor + 10,
                revision: 1,
                state: "completed",
                role: "user",
                parts: [
                  {
                    partId: `answer-part-${receipt.requestId}`,
                    kind: "text",
                    text: receipt.reason ?? "",
                    sequence: 1,
                    revision: 1,
                  },
                ],
              },
            ]
          : s.messages,
      revision: s.revision + 1,
    }))
  }
  if (action.type === "advance") {
    const s = state.sessions.find((s) => s.sessionId === action.id)
    if (
      !s ||
      activeReceipt(state.receipts, s.sessionId) ||
      s.attention.some(
        (a) =>
          !a.operation || ["pending", "unknown"].includes(a.operation.state),
      )
    )
      return state
    if (state.templates[action.id] === "artifacts")
      return editSession(state, action.id, (s) => ({
        ...s,
        status: "completed",
        revision: s.revision + 1,
        tools: s.tools.map((t) => ({
          ...t,
          status: "completed",
          output: "Report artifact generated from supplied fixture references",
        })),
        plan: s.plan.map((p) => ({ ...p, status: "completed" })),
        output: {
          ...s.output,
          text: "Report generated; source references retained; review and acceptance pending",
        },
        artifacts: [
          {
            artifactId: `artifact-${s.sessionId}`,
            runId: s.activeRunId,
            name: "analysis-report.md",
            kind: "report",
            createdAt: s.updatedAt,
            availability: "available",
            review: { state: "unreviewed", acceptance: "pending" },
          },
        ],
        messages: [
          ...s.messages,
          {
            messageId: `report-${s.sessionId}-${s.revision}`,
            turnId: `report-turn-${s.sessionId}`,
            sequence: s.cursor + 30,
            revision: 1,
            role: "agent",
            state: "completed",
            parts: [
              {
                partId: `report-part-${s.sessionId}`,
                sequence: 1,
                revision: 1,
                kind: "text",
                text: "Report generated from source references. Review the artifact and send feedback to revise it.",
              },
              {
                partId: `report-ref-${s.sessionId}`,
                sequence: 2,
                revision: 1,
                kind: "artifact",
                referenceId: `artifact-${s.sessionId}`,
                label: "Open analysis report",
              },
            ],
          },
        ],
      }))
    const phase = state.phases[action.id] ?? 0
    if (phase > 0 && s.status === "failed") return state
    const next = {
      ...state,
      phases: { ...state.phases, [action.id]: phase + 1 },
    }
    if (phase === 0)
      return editSession(next, action.id, (s) => ({
        ...s,
        status: "failed",
        tools: s.tools.map((t) => ({
          ...t,
          status: "failed",
          exitCode: 1,
          output: "FAIL: case sensitivity regression",
        })),
        output: {
          ...s.output,
          text: "FAIL filter: expected ['Alpha'], received []\nexit code 1",
        },
        messages: [
          ...s.messages,
          {
            messageId: `result-${s.sessionId}-failed`,
            turnId: `turn-result-${s.sessionId}`,
            sequence: s.cursor + 20,
            revision: 1,
            state: "failed",
            role: "agent",
            parts: [
              {
                partId: `result-part-${s.sessionId}-failed`,
                sequence: 1,
                revision: 1,
                kind: "text",
                text: "The source reports a failed test. Inspect the output and send a correction before continuing.",
              },
            ],
          },
        ],
        revision: s.revision + 1,
      }))
    const queued = state.queued[s.sessionId] ?? []
    return {
      ...editSession(next, action.id, (s) => ({
        ...s,
        status: queued.length ? "running" : "completed",
        activeRunId: queued.length
          ? `run-queued-${state.sequence}`
          : s.activeRunId,
        messages: [
          ...s.messages,
          ...queued,
          {
            messageId: `result-${s.sessionId}-${phase}`,
            turnId: `turn-result-${s.sessionId}-${phase}`,
            sequence: s.cursor + 30 + phase,
            revision: 1,
            state: "completed",
            role: "agent",
            parts: [
              {
                partId: `result-part-${s.sessionId}-${phase}`,
                sequence: 1,
                revision: 1,
                kind: "text",
                text: "Fixture source reports focused tests passed. Review the Diff and the report; acceptance remains pending.",
              },
              {
                partId: `artifact-part-${s.sessionId}-${phase}`,
                sequence: 2,
                revision: 1,
                kind: "artifact",
                referenceId: `artifact-${s.sessionId}`,
                label: "Open report artifact",
              },
            ],
          },
        ],
        tools: s.tools.map((t) => ({
          ...t,
          status: "completed",
          exitCode: 0,
          output: "PASS: filter case sensitivity",
        })),
        output: {
          ...s.output,
          text: "PASS filter case sensitivity\n1 fixture test passed\nexit code 0",
        },
        artifacts: [
          {
            artifactId: `artifact-${s.sessionId}`,
            runId: s.activeRunId,
            name: "filter-report.md",
            kind: "report",
            createdAt: s.updatedAt,
            availability: "available",
            review: { state: "unreviewed", acceptance: "pending" },
          },
        ],
        revision: s.revision + 1,
      })),
      queued: { ...state.queued, [s.sessionId]: [] },
    }
  }
  return state
}
