import { test, expect } from "@playwright/test"
import {
  initialIntervention,
  interventionReducer as reduce,
  queueLocked,
  type InterventionState,
  type QueueIntent,
} from "../components/examples/agent-workspace/intervention-model"

function request(state: InterventionState, intent: QueueIntent) {
  return reduce(state, { type: "queue-request", intent })
}
function confirm(state: InterventionState) {
  return reduce(state, {
    type: "queue-source",
    requestId: state.queueOperation!.requestId,
    outcome: "confirm",
  })
}

test("queue acceptance clears only the submitted draft version", () => {
  let state = initialIntervention()
  state = { ...state, draft: { ...state.draft, text: "first" } }
  state = request(state, { action: "submit", draft: state.draft })
  expect(state.queue).toHaveLength(3)
  state = reduce(state, {
    type: "draft",
    draft: { ...state.draft, version: 2, text: "newer draft" },
  })
  state = confirm(state)
  expect(state.draft.text).toBe("newer draft")
  expect(state.queue.at(-1)?.text).toBe("first")
  const after = confirm(state)
  expect(after).toBe(state)
  state = request(state, { action: "submit", draft: state.draft })
  state = confirm(state)
  expect(state.draft.text).toBe("")
  expect(state.queue.at(-1)?.draftVersion).toBe(2)
})

test("unknown blocks further writes; query itself neither confirms nor replays", () => {
  let state = initialIntervention()
  state = request(state, {
    action: "cancel",
    id: "fixture-q1",
    baseRevision: 1,
  })
  const id = state.queueOperation!.requestId
  state = reduce(state, {
    type: "queue-source",
    requestId: id,
    outcome: "lose",
  })
  expect(queueLocked(state)).toBe(true)
  expect(
    request(state, { action: "cancel", id: "fixture-q2", baseRevision: 1 }),
  ).toBe(state)
  expect(confirm(state)).toBe(state)
  expect(reduce(state, { type: "queue-query", requestId: "old-id" })).toBe(
    state,
  )
  state = reduce(state, { type: "queue-query", requestId: id })
  expect(state.queue).toHaveLength(3)
  expect(state.queueOperation?.state).toBe("unknown")
  state = confirm(state)
  expect(state.queue.map((q) => q.queuedPromptId)).toEqual([
    "fixture-q2",
    "fixture-q3",
  ])
})

test("cancel racing with source take does not cancel the next item", () => {
  let state = request(initialIntervention(), {
    action: "cancel",
    id: "fixture-q1",
    baseRevision: 1,
  })
  state = reduce(state, { type: "take-first" })
  state = confirm(state)
  expect(state.queueOperation).toMatchObject({
    state: "failed",
    reason: "stale",
  })
  expect(state.queue.map((q) => q.queuedPromptId)).toEqual([
    "fixture-q2",
    "fixture-q3",
  ])
  expect(state.dispatched).toHaveLength(1)
})

test("reorder validates the adjacent target as well as the source revision", () => {
  const intent: QueueIntent = {
    action: "move",
    id: "fixture-q2",
    baseRevision: 1,
    direction: -1,
    targetId: "fixture-q1",
    targetRevision: 1,
  }
  let state = request(initialIntervention(), intent)
  state = reduce(state, { type: "take-first" })
  state = confirm(state)
  expect(state.queueOperation).toMatchObject({
    state: "failed",
    reason: "stale",
  })
  expect(state.queue[0].queuedPromptId).toBe("fixture-q2")
  state = confirm(request(initialIntervention(), intent))
  expect(
    state.queue.slice(0, 2).map((q) => [q.queuedPromptId, q.revision]),
  ).toEqual([
    ["fixture-q2", 2],
    ["fixture-q1", 2],
  ])
})

test("edit receipts retain newer editor drafts and protect taken records", () => {
  let state = reduce(initialIntervention(), {
    type: "edit-start",
    id: "fixture-q1",
  })
  state = reduce(state, { type: "edit-text", text: "submitted edit" })
  state = request(state, { action: "edit", edit: state.edit! })
  state = reduce(state, { type: "edit-text", text: "new editor version" })
  state = confirm(state)
  expect(state.queue[0]).toMatchObject({ text: "submitted edit", revision: 2 })
  expect(state.edit?.text).toBe("new editor version")
  expect(state.edit?.baseRevision).toBe(1)
  expect(request(state, { action: "edit", edit: state.edit! })).toBe(state)
  state = reduce(state, { type: "edit-start", id: "fixture-q2" })
  state = request(state, { action: "edit", edit: state.edit! })
  state = reduce(reduce(state, { type: "take-first" }), { type: "take-first" })
  state = confirm(state)
  expect(state.queueOperation?.reason).toBe("stale")
  expect(state.edit?.id).toBe("fixture-q2")
})

test("Steer confirmation does not add a queue item or imply execution", () => {
  let state = initialIntervention()
  state = {
    ...state,
    draft: { ...state.draft, mode: "steer", text: "Please reconsider" },
  }
  state = confirm(request(state, { action: "submit", draft: state.draft }))
  expect(state.queue).toHaveLength(3)
  expect(state.dispatched).toMatchObject([
    { text: "Please reconsider", mode: "steer" },
  ])
  expect(state.draft.text).toBe("")
})

test("approval pending and unknown remain independent of queue operations", () => {
  let state = reduce(initialIntervention(), {
    type: "approval-request",
    action: "accept",
    baseRevision: 1,
  })
  const id = state.approvalOperation!.requestId
  expect(
    reduce(state, {
      type: "approval-request",
      action: "reject",
      baseRevision: 1,
    }),
  ).toBe(state)
  state = reduce(state, {
    type: "approval-source",
    requestId: id,
    outcome: "lose",
  })
  expect(
    reduce(state, {
      type: "approval-source",
      requestId: id,
      outcome: "confirm",
    }),
  ).toBe(state)
  state = request(state, {
    action: "cancel",
    id: "fixture-q2",
    baseRevision: 1,
  })
  expect(state.queueOperation?.state).toBe("pending")
  state = reduce(state, {
    type: "approval-request",
    action: "reconcile",
    baseRevision: 1,
  })
  expect(state.approvalOperation?.state).toBe("unknown")
  state = reduce(state, {
    type: "approval-source",
    requestId: id,
    outcome: "confirm",
  })
  expect(state.approvalOperation?.state).toBe("confirmed")
  expect(state.queueOperation?.state).toBe("pending")
  expect(state.approvalRevision).toBe(2)
})

test("stale request ids, denied requests and incomplete data never write", () => {
  let state = initialIntervention()
  for (const dataState of ["loading", "empty", "partial", "error"] as const) {
    const before = reduce(state, { type: "data", state: dataState })
    expect(
      request(before, { action: "cancel", id: "fixture-q1", baseRevision: 1 }),
    ).toBe(before)
    expect(before.queue).toEqual(state.queue)
  }
  state = request(state, {
    action: "cancel",
    id: "fixture-q1",
    baseRevision: 1,
  })
  expect(
    reduce(state, {
      type: "queue-source",
      requestId: "old-request",
      outcome: "confirm",
    }),
  ).toBe(state)
  state = reduce(state, {
    type: "queue-source",
    requestId: state.queueOperation!.requestId,
    outcome: "reject",
  })
  expect(state.queue).toHaveLength(3)
  expect(state.queueOperation?.state).toBe("failed")
  expect(queueLocked(state)).toBe(false)
})
