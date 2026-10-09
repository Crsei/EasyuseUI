import { test, expect } from "@playwright/test"
import {
  applySessionEvent,
  acknowledgeDraft,
  draftCanSubmit,
  parseWorkbenchQuery,
  reviewCommentIsCurrent,
  type OperationReceipt,
  type WorkbenchMessage,
} from "@/lib/agent-workbench-model"
import {
  initialExample,
  exampleReducer,
  type ExampleState,
} from "@/components/examples/agent-workbench/reducer"
import { references } from "@/components/examples/agent-workbench/fixtures"
const confirmed = (state: ExampleState) =>
  exampleReducer(state, {
    type: "settle",
    requestId: state.receipts.at(-1)!.requestId,
    state: "confirmed",
  })
test("review feedback binds repository, base, head, revision, file and line separately", () => {
  const changes = initialExample().sessions[0].changes
  const file = changes.files[0],
    line = file.lines[0]
  const comment = {
    commentId: "scope-bound",
    repositoryId: changes.repositoryId,
    base: changes.base,
    head: changes.head,
    revision: changes.revision,
    fileId: file.fileId,
    lineId: line.id,
    text: "Bound feedback",
  }
  expect(reviewCommentIsCurrent(changes, comment)).toBe(true)
  for (const patch of [
    { repositoryId: "other" },
    { base: "other" },
    { head: "other" },
    { revision: "other" },
    { fileId: "other" },
    { lineId: "other" },
  ])
    expect(reviewCommentIsCurrent(changes, { ...comment, ...patch })).toBe(
      false,
    )
  expect(
    reviewCommentIsCurrent(
      { ...changes, head: "new-head-with-same-revision" },
      comment,
    ),
  ).toBe(false)
})
test("session metadata waits for a receipt and stays bound to its original object", () => {
  let state = initialExample()
  state = exampleReducer(state, {
    type: "metadata",
    id: "session-filter",
    patch: { title: "Source-confirmed title", archived: true },
  })
  const request = state.receipts.at(-1)!
  expect(state.sessions[0].title).toBe("修复大小写过滤逻辑")
  const duplicate = exampleReducer(state, {
    type: "metadata",
    id: "session-filter",
    patch: { title: "Duplicate" },
  })
  expect(duplicate).toBe(state)
  state = exampleReducer(state, {
    type: "settle",
    requestId: request.requestId,
    state: "unknown",
  })
  expect(state.sessions[0].archived).toBeFalsy()
  state = confirmed(state)
  expect(state.sessions[0].title).toBe("Source-confirmed title")
  expect(state.sessions[0].archived).toBe(true)
  expect(state.sessions[1].title).toBe("分析资料并整理报告")
  expect(state.drafts["session-filter"].draftId).toBe("draft-session-filter")
})
test("draft acknowledgement requires the original draft ID, version and confirmed receipt", () => {
  const state = initialExample(),
    draft = { ...state.drafts["session-filter"], text: "Original", version: 8 }
  const receipt: OperationReceipt = {
    requestId: "r",
    targetId: "session-filter",
    action: "steer",
    state: "confirmed",
    draftId: draft.draftId,
    draftVersion: 8,
  }
  expect(acknowledgeDraft(draft, receipt).text).toBe("")
  for (const patch of [
    { state: "unknown" as const },
    { state: "failed" as const },
    { draftId: "another-draft" },
    { draftVersion: 7 },
  ])
    expect(acknowledgeDraft(draft, { ...receipt, ...patch })).toBe(draft)
  expect(
    acknowledgeDraft({ ...draft, version: 9, text: "New input" }, receipt).text,
  ).toBe("New input")
})
test("source gaps, stale objects, duplicate cursors and old part revisions do not corrupt a stream", () => {
  const s = initialExample().sessions[0]
  const m: WorkbenchMessage = {
    ...s.messages[1],
    revision: 2,
    parts: [
      { partId: "stable", kind: "text", text: "new", sequence: 2, revision: 2 },
      {
        partId: "first",
        kind: "text",
        text: "first",
        sequence: 1,
        revision: 1,
      },
      { partId: "stable", kind: "text", text: "old", sequence: 2, revision: 1 },
    ],
  }
  expect(
    applySessionEvent(s, { sessionId: "other", cursor: 2, message: m }),
  ).toBe(s)
  expect(
    applySessionEvent(s, { sessionId: s.sessionId, cursor: 3, message: m }),
  ).toBe(s)
  const next = applySessionEvent(s, {
    sessionId: s.sessionId,
    cursor: 2,
    message: m,
  })
  expect(
    next.messages[1].parts.map((p) => ("text" in p ? p.text : "")),
  ).toEqual(["first", "new"])
  expect(
    applySessionEvent(next, { sessionId: s.sessionId, cursor: 2, message: m }),
  ).toBe(next)
  expect(
    applySessionEvent(next, {
      sessionId: s.sessionId,
      cursor: 3,
      message: { ...m, revision: 1 },
    }).messages[1],
  ).toBe(next.messages[1])
})
test("capabilities, connection, unresolved receipts and included context gate submissions independently", () => {
  const state = initialExample(),
    s = state.sessions[0],
    draft = { ...state.drafts[s.sessionId], text: "Task" }
  expect(draftCanSubmit(s, draft, [])).toBe(true)
  expect(draftCanSubmit(s, { ...draft, mode: "send" }, [])).toBe(false)
  expect(
    draftCanSubmit(
      { ...s, environment: { ...s.environment, connection: "disconnected" } },
      draft,
      [],
    ),
  ).toBe(false)
  expect(draftCanSubmit(s, { ...draft, context: [references[3]] }, [])).toBe(
    false,
  )
  expect(
    draftCanSubmit(
      s,
      { ...draft, context: [{ ...references[3], included: false }] },
      [],
    ),
  ).toBe(true)
  expect(
    draftCanSubmit(
      { ...s, capabilities: { ...s.capabilities, contextLimit: 10 } },
      { ...draft, context: [references[0]] },
      [],
    ),
  ).toBe(false)
  expect(
    draftCanSubmit(s, draft, [
      {
        requestId: "unknown",
        targetId: s.sessionId,
        action: "steer",
        state: "unknown",
      },
    ]),
  ).toBe(false)
})
test("send loss and failure retain drafts; duplicates remain locked until source reconciliation", () => {
  let state = initialExample()
  const id = "session-filter"
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: { ...state.drafts[id], text: "First", version: 1 },
  })
  state = exampleReducer(state, { type: "begin", id, action: "steer" })
  const request = state.receipts[0].requestId
  expect(exampleReducer(state, { type: "begin", id, action: "steer" })).toBe(
    state,
  )
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: { ...state.drafts[id], text: "Next input", version: 2 },
  })
  state = exampleReducer(state, {
    type: "settle",
    requestId: request,
    state: "unknown",
  })
  expect(state.drafts[id].text).toBe("Next input")
  expect(exampleReducer(state, { type: "begin", id, action: "steer" })).toBe(
    state,
  )
  state = exampleReducer(state, {
    type: "settle",
    requestId: request,
    state: "confirmed",
  })
  expect(state.drafts[id].text).toBe("Next input")
  expect(
    state.sessions[0].messages.filter(
      (m) => m.messageId === `message-${request}`,
    ),
  ).toHaveLength(1)
  expect(
    exampleReducer(state, {
      type: "settle",
      requestId: request,
      state: "confirmed",
    }),
  ).toBe(state)
  state = exampleReducer(state, { type: "begin", id, action: "steer" })
  state = exampleReducer(state, {
    type: "settle",
    requestId: state.receipts.at(-1)!.requestId,
    state: "failed",
  })
  expect(state.drafts[id].text).toBe("Next input")
})
test("approval changes only its corresponding tool after acknowledgement; interrupt stays pending", () => {
  let state = initialExample()
  const id = "session-report",
    other = state.sessions[0].tools[0]
  state = exampleReducer(state, {
    type: "begin",
    id,
    attentionId: "approval-report",
    action: "accept",
  })
  expect(state.sessions[1].tools[0].status).toBe("waiting")
  expect(state.sessions[1].status).toBe("waiting")
  expect(
    exampleReducer(state, {
      type: "begin",
      id,
      attentionId: "approval-report",
      action: "accept",
    }),
  ).toBe(state)
  state = confirmed(state)
  expect(state.sessions[1].tools[0].status).toBe("running")
  expect(state.sessions[0].tools[0]).toEqual(other)
  state = exampleReducer(state, {
    type: "begin",
    id: "session-filter",
    action: "interrupt",
  })
  expect(state.sessions[0].status).toBe("running")
  state = exampleReducer(state, {
    type: "settle",
    requestId: state.receipts.at(-1)!.requestId,
    state: "unknown",
  })
  expect(state.sessions[0].status).toBe("running")
  state = confirmed(state)
  expect(state.sessions[0].status).toBe("cancelled")
})
test("queue acknowledgement waits for the current run to finish while steer retains the run identity", () => {
  let state = initialExample()
  const id = "session-filter"
  const run = state.sessions[0].activeRunId
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: {
      ...state.drafts[id],
      text: "Queued task",
      mode: "queue",
      version: 1,
    },
  })
  state = confirmed(
    exampleReducer(state, { type: "begin", id, action: "queue" }),
  )
  expect(state.queued[id]).toHaveLength(1)
  expect(state.sessions[0].messages).toHaveLength(2)
  expect(state.sessions[0].activeRunId).toBe(run)
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: {
      ...state.drafts[id],
      text: "Correct filter",
      mode: "steer",
      version: 3,
    },
  })
  state = confirmed(
    exampleReducer(state, { type: "begin", id, action: "steer" }),
  )
  expect(state.sessions[0].activeRunId).toBe(run)
  state = exampleReducer(state, { type: "advance", id })
  expect(state.sessions[0].status).toBe("failed")
  expect(exampleReducer(state, { type: "advance", id })).toBe(state)
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: {
      ...state.drafts[id],
      text: "Correction",
      mode: "send",
      version: 5,
    },
  })
  state = confirmed(
    exampleReducer(state, { type: "begin", id, action: "send" }),
  )
  state = exampleReducer(state, { type: "advance", id })
  expect(state.queued[id]).toEqual([])
  expect(state.sessions[0].status).toBe("running")
  expect(
    state.sessions[0].messages.some((m) =>
      m.parts.some((p) => "text" in p && p.text === "Queued task"),
    ),
  ).toBe(true)
})
test("artifact template creation and source completion do not invent code execution", () => {
  let state = initialExample()
  state = exampleReducer(state, {
    type: "draft",
    id: "new",
    draft: {
      ...state.drafts.new,
      text: "Analyze supplied research",
      version: 1,
    },
  })
  state = confirmed(
    exampleReducer(state, {
      type: "begin",
      id: "new",
      action: "create",
      template: "artifacts",
    }),
  )
  const s = state.sessions[0]
  expect(s.tools[0].name).toBe("write_report")
  expect(s.activeRunId).not.toBe(s.sessionId)
  state = confirmed(
    exampleReducer(state, {
      type: "begin",
      id: s.sessionId,
      attentionId: s.attention[0].attentionId,
      action: "accept",
    }),
  )
  state = exampleReducer(state, { type: "advance", id: s.sessionId })
  expect(state.sessions[0].status).toBe("completed")
  expect(state.sessions[0].artifacts[0].review.acceptance).toBe("pending")
  expect(state.sessions[0].output.text).not.toContain("test")
})
test("all URL object axes are whitelisted and drafts are kept out of the navigation contract", () => {
  for (const [key, value] of Object.entries({
    region: "bad",
    layout: "bad",
    template: "bad",
    page: "bad",
    session: "missing",
    panel: "bad",
    scenario: "bad",
  }))
    expect(
      parseWorkbenchQuery(new URLSearchParams({ [key]: value }), [
        "session-filter",
      ]).errors,
    ).toContain(key)
  const query = parseWorkbenchQuery(
    new URLSearchParams({
      session: "session-filter",
      page: "review",
      draft: "private text",
    }),
    ["session-filter"],
  )
  expect(query.errors).toEqual([])
  expect(query).not.toHaveProperty("draft")
})
