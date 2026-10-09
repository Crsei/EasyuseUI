import {
  analyticsEntityKey,
  type AnalyticsEntityRef,
  type WorkItemAnalyticsSnapshot,
  type WorkflowEvent,
  type AnalyticsRelation,
} from "@/lib/analytics-model"
import {
  replayWorkflowHistory,
  type AnalyticsHistory,
} from "@/lib/analytics-history"
import type {
  ResourceAllocation,
  ResourceCapacity,
  ExecutionInterval,
} from "@/lib/analytics-resource-model"
import type {
  AgentRunSnapshot,
  UsageObservation,
} from "@/lib/agent-board-model"
import type { WorkItemCatalog, WorkItemRecord } from "@/lib/work-items-model"
import type { WorkDependency } from "@/lib/analytics-dependency-model"
export const asOf = "2026-10-09T00:00:00Z",
  start = "2026-07-11T00:00:00Z",
  snapshotId = "workflow-fixture-90d-v2"
export const day = (n: number) =>
  new Date(Date.parse(start) + n * 86400000).toISOString()
export const ref = (
  id: string,
  projectId = "alpha",
  kind: AnalyticsEntityRef["kind"] = "workItem",
): AnalyticsEntityRef => ({
  sourceId: "fixture",
  projectId,
  kind,
  entityId: id,
})
const members = ["lin", "maya", "noah", "aria"]
export const baseline: WorkItemAnalyticsSnapshot[] = Array.from(
  { length: 120 },
  (_, i) => ({
    entityRef: ref(`WF-${i + 1}`, i < 60 ? "alpha" : "beta"),
    title: `${i < 60 ? "Alpha" : "Beta"} · Workflow ${i + 1}`,
    category: "backlog",
    stateId: "backlog",
    createdAt: i === 119 ? null : day(-10 - (i % 20)),
    actualStartedAt: null,
    completedAt: null,
    lastStateEnteredAt: day(-10 - (i % 20)),
    plannedStartDate: i % 9 === 0 ? null : "2026-10-05",
    plannedDueDate:
      i % 11 === 0 ? null : `2026-10-${String(6 + (i % 7)).padStart(2, "0")}`,
    estimate: i % 17 === 0 ? null : { amount: 2 + (i % 7), unit: "hours" },
    assigneeIds:
      i % 10 === 0 ? [members[i % 4], members[(i + 1) % 4]] : [members[i % 4]],
    blockers:
      i % 13 === 0
        ? [{ id: "approval", label: "Approval", since: day(80) }]
        : [],
    inScope: i % 23 !== 0,
    revision: 1,
  }),
)
const events: WorkflowEvent[] = []
let seq = 0
function add(
  i: number,
  n: number,
  kind: WorkflowEvent["kind"],
  after: WorkflowEvent["after"],
) {
  events.push({
    eventId: `event-${++seq}`,
    entityRef: baseline[i].entityRef,
    sequence: seq,
    occurredAt: day(n),
    recordedAt: day(n),
    sourceVersion: "fixture-v2",
    kind,
    after: { ...after, revision: seq + 1 },
  })
}
for (let i = 0; i < 120; i++) {
  const n = (2 + (i % 60) * 1.1) | 0
  if (i % 23 === 0) add(i, 20, "scope", { inScope: true })
  add(i, n, "state", {
    category: "active",
    stateId: "active",
    actualStartedAt: day(n),
    lastStateEnteredAt: day(n),
  })
  if (i % 3 !== 0) {
    add(i, n + 8, "state", {
      category: "completed",
      stateId: "completed",
      completedAt: day(n + 8),
      lastStateEnteredAt: day(n + 8),
    })
  }
  if (i % 31 === 0) add(i, 82, "scope", { inScope: false })
}
add(1, 16, "state", {
  category: "active",
  stateId: "active",
  completedAt: null,
  actualStartedAt: day(16),
  lastStateEnteredAt: day(16),
})
add(1, 25, "state", {
  category: "completed",
  stateId: "completed",
  completedAt: day(25),
  lastStateEnteredAt: day(25),
})
add(3, 40, "estimate", { estimate: { amount: 12, unit: "hours" } })
export const history: AnalyticsHistory = {
  baseline,
  events: [...events].reverse().concat(events[0]),
  coverage: {
    from: start,
    to: asOf,
    baselineAsOf: start,
    baselineVersion: "baseline-v2",
    watermark: String(seq),
    missingIntervals: [],
    complete: true,
    supportedMetrics: [
      "completion-trend",
      "burndown",
      "burnup",
      "velocity",
      "cumulative-flow",
      "cycle-time",
    ],
  },
}
export const items = replayWorkflowHistory(history, asOf).items
export const itemMap = new Map(
  items.map((i) => [analyticsEntityKey(i.entityRef), i]),
)
export const catalog: WorkItemCatalog = {
  states: [
    { id: "backlog", label: "Backlog" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ],
  priorities: [{ id: "normal", label: "Normal" }],
  assignees: members.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
  })),
  labels: [],
}
export function recordsOf(
  values: readonly WorkItemAnalyticsSnapshot[],
): WorkItemRecord[] {
  return values.map((i) => ({
    id: i.entityRef.entityId,
    projectId: i.entityRef.projectId,
    identifier: i.entityRef.entityId,
    title: i.title,
    stateId: i.stateId,
    priorityId: "normal",
    assigneeIds: i.assigneeIds,
    labelIds: [],
    startDate: i.plannedStartDate,
    dueDate: i.plannedDueDate ?? null,
    revision: i.revision,
  }))
}
export const capacities: ResourceCapacity[] = members.flatMap((resourceId, r) =>
  Array.from({ length: 7 }, (_, i) => ({
    resourceId,
    bucketId: `2026-10-${String(i + 5).padStart(2, "0")}`,
    available: i === 5 ? 0 : r === 3 && i === 2 ? null : 8,
    unit: "hours",
    calendarVersion: "weekday-calendar-v1",
  })),
)
export function allocationsOf(
  values: readonly WorkItemAnalyticsSnapshot[],
): ResourceAllocation[] {
  return values
    .filter(
      (i) => i.inScope && i.category !== "completed" && i.plannedStartDate,
    )
    .flatMap((i) =>
      i.assigneeIds.map((resourceId) => ({
        id: `${i.entityRef.entityId}-${resourceId}`,
        entityRef: i.entityRef,
        title: i.title,
        bucketId: i.plannedStartDate!,
        resourceId,
        amount: i.estimate?.amount ?? null,
        unit: "hours",
        share: 1 / i.assigneeIds.length,
        rule: "equal share across explicit assignees; one planned date",
      })),
    )
}
export const runs: AgentRunSnapshot[] = Array.from({ length: 9 }, (_, i) => ({
  runId: `RUN-${i + 1}`,
  title: `Execution ${i + 1}`,
  agentId: `agent-${(i % 3) + 1}`,
  agentName: `Agent ${(i % 3) + 1}`,
  model: i % 2 ? "model-b" : "model-a",
  runtimeStatus: i === 8 ? "waiting" : i === 7 ? "failed" : "completed",
  startedAt: `2026-10-08T${String(8 + i).padStart(2, "0")}:00:00Z`,
  endedAt:
    i < 8 ? `2026-10-08T${String(8 + i).padStart(2, "0")}:30:00Z` : undefined,
  updatedAt: asOf,
  revision: 1,
  source: "fixture",
  completeness: "complete",
  review: {
    state: i % 2 ? "unreviewed" : "approved",
    acceptance: i === 8 ? "pending" : i % 2 ? "unknown" : "accepted",
    evidence: i % 2 ? undefined : "ARTIFACT-1",
  },
  workItemRef: { id: `WF-${i + 1}`, title: `Alpha · Workflow ${i + 1}` },
}))
export const observations: UsageObservation[] = runs
  .map<UsageObservation>((r, i) => ({
    observationId: `obs-${i}`,
    runId: r.runId,
    timestamp: r.startedAt!,
    tokens: i === 8 ? undefined : 1000 + i * 100,
    cost: i === 8 ? undefined : 0.02 + i * 0.01,
    currency: i % 2 ? "EUR" : "USD",
    durationMs: i === 8 ? undefined : 1800000,
    estimated: i === 6,
    inclusion: i === 7 ? "unknown" : i === 0 ? "inclusive" : "exclusive",
    includesRunIds: i === 0 ? ["RUN-2"] : undefined,
  }))
  .concat([
    {
      observationId: "obs-0",
      runId: "RUN-1",
      timestamp: runs[0].startedAt!,
      tokens: 1000,
      cost: 0.02,
      currency: "USD",
      durationMs: 1800000,
      estimated: false,
      inclusion: "inclusive",
      includesRunIds: ["RUN-2"],
    },
  ])
export const intervals: ExecutionInterval[] = runs.map((r) => ({
  id: r.runId,
  entityRef: ref(r.runId, "alpha", "run"),
  agentId: r.agentId,
  label: r.title,
  startedAt: r.startedAt ?? null,
  endedAt: r.endedAt ?? null,
  asOf,
  runtimeStatus: r.runtimeStatus,
  acceptance: r.review!.acceptance,
  waitingReason:
    r.runtimeStatus === "waiting" ? "Explicit approval pending" : undefined,
}))
export const relations: AnalyticsRelation[] = [
  {
    id: "idea",
    from: ref("IDEA-1", "alpha", "idea"),
    to: ref("WF-1"),
    kind: "idea-link",
    label: "informs",
  },
  {
    id: "idea-many",
    from: ref("IDEA-1", "alpha", "idea"),
    to: ref("WF-2"),
    kind: "idea-link",
    label: "informs",
  },
  {
    id: "session",
    from: ref("WF-1"),
    to: ref("SESSION-1", "alpha", "session"),
    kind: "trace",
    label: "executed in",
  },
  {
    id: "run",
    from: ref("SESSION-1", "alpha", "session"),
    to: ref("RUN-1", "alpha", "run"),
    kind: "trace",
    label: "run",
  },
  {
    id: "artifact",
    from: ref("RUN-1", "alpha", "run"),
    to: ref("ARTIFACT-1", "alpha", "artifact"),
    kind: "trace",
    label: "produced",
  },
  {
    id: "removed",
    from: ref("WF-2"),
    to: ref("ARTIFACT-REMOVED", "alpha", "artifact"),
    kind: "trace",
    label: "removed",
  },
]
export const dependencies: WorkDependency[] = [
  {
    id: "dep-1",
    from: ref("WF-1"),
    to: ref("WF-4"),
    state: "blocked",
    evidence: "Explicit upstream review pending",
  },
  {
    id: "dep-2",
    from: ref("WF-4"),
    to: ref("WF-1"),
    state: "unknown",
    evidence: "No business acceptance receipt",
  },
  {
    id: "dep-3",
    from: ref("WF-4"),
    to: ref("WF-7"),
    state: "satisfied",
    evidence: "Accepted artifact snapshot",
  },
]
export const calendar = {
  id: "weekdays",
  version: "weekday-calendar-v1",
  timeZone: "Asia/Shanghai",
  workingBucketIds: Array.from({ length: 90 }, (_, i) =>
    day(i).slice(0, 10),
  ).filter((d) => ![0, 6].includes(new Date(d + "T12:00:00Z").getUTCDay())),
}
