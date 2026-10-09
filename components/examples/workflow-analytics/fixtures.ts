import {
  analyticsEntityKey,
  type AnalyticsEntityRef,
  type AnalyticsQuery,
  type WorkItemAnalyticsSnapshot,
  type WorkflowEvent,
  type AnalyticsRelation,
} from "@/lib/analytics-model"
import {
  replayWorkflowHistory,
  type AnalyticsHistory,
} from "@/lib/analytics-history"
import type { WorkItemCatalog, WorkItemRecord } from "@/lib/work-items-model"
export const asOf = "2026-10-09T00:00:00Z"
export const entity = (
  id: string,
  kind: AnalyticsEntityRef["kind"] = "workItem",
): AnalyticsEntityRef => ({
  sourceId: "fixture",
  projectId: "alpha",
  kind,
  entityId: id,
})
const titles = [
  "Ship portable charts",
  "Review unknown writes",
  "Preserve historical membership",
  "Keyboard drilldown",
  "Document query scope",
  "Reconcile late responses",
  "Scope removed item",
  "Unobserved creation time",
]
export const baseline: WorkItemAnalyticsSnapshot[] = titles.map((title, i) => ({
  entityRef: entity(`WA-${i + 1}`),
  title,
  stateId: i % 2 ? "active" : "backlog",
  category: i % 2 ? "active" : "backlog",
  createdAt:
    i === 7 ? null : `2026-09-${String(10 + i).padStart(2, "0")}T00:00:00Z`,
  actualStartedAt: i % 2 ? "2026-09-25T00:00:00Z" : null,
  completedAt: null,
  plannedStartDate: "2026-10-01",
  plannedDueDate: i === 4 ? null : `2026-10-${String(5 + i).padStart(2, "0")}`,
  estimate: null,
  assigneeIds: [i % 2 ? "maya" : "lin"],
  blockers:
    i === 1 || i === 3
      ? [{ id: "approval", label: "Approval", since: "2026-10-01T00:00:00Z" }]
      : [],
  inScope: true,
  revision: 1,
}))
const event = (
  id: string,
  item: number,
  date: string,
  kind: WorkflowEvent["kind"],
  after: WorkflowEvent["after"],
  sequence: number,
): WorkflowEvent => ({
  eventId: id,
  entityRef: baseline[item].entityRef,
  occurredAt: `2026-10-${date}T12:00:00Z`,
  recordedAt: `2026-10-${date}T12:05:00Z`,
  sourceVersion: "fixture-v1",
  kind,
  after,
  sequence,
})
const events: WorkflowEvent[] = [
  event(
    "done-1",
    0,
    "02",
    "state",
    {
      stateId: "completed",
      category: "completed",
      completedAt: "2026-10-02T12:00:00Z",
      revision: 2,
    },
    1,
  ),
  event(
    "reopen-1",
    0,
    "03",
    "state",
    { stateId: "active", category: "active", completedAt: null, revision: 3 },
    2,
  ),
  event(
    "done-1-again",
    0,
    "04",
    "state",
    {
      stateId: "completed",
      category: "completed",
      completedAt: "2026-10-04T12:00:00Z",
      revision: 4,
    },
    3,
  ),
  event(
    "done-3",
    2,
    "04",
    "state",
    {
      stateId: "completed",
      category: "completed",
      completedAt: "2026-10-04T12:00:00Z",
      revision: 2,
    },
    4,
  ),
  event(
    "reopen-3",
    2,
    "05",
    "state",
    { stateId: "active", category: "active", completedAt: null, revision: 3 },
    5,
  ),
  event("remove-7", 6, "06", "scope", { inScope: false, revision: 2 }, 6),
  event(
    "block-4",
    3,
    "07",
    "blocker",
    {
      blockers: [
        ...baseline[3].blockers,
        {
          id: "upstream",
          label: "Upstream dependency",
          since: "2026-10-07T12:00:00Z",
        },
      ],
      revision: 2,
    },
    7,
  ),
]
export const history: AnalyticsHistory = {
  baseline,
  events: [...events, events[0]],
  coverage: {
    from: "2026-10-01T00:00:00Z",
    to: asOf,
    baselineAsOf: "2026-10-01T00:00:00Z",
    baselineVersion: "fixture-baseline-v1",
    watermark: "7",
    missingIntervals: [],
    supportedMetrics: ["completion-trend"],
    complete: true,
  },
}
export const currentItems = replayWorkflowHistory(history, asOf).items
export const catalog: WorkItemCatalog = {
  states: [
    { id: "backlog", label: "Backlog" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ],
  priorities: [{ id: "p1", label: "High" }],
  assignees: [
    { id: "lin", label: "Lin Chen" },
    { id: "maya", label: "Maya Patel" },
  ],
  labels: [],
}
export const workRecords: WorkItemRecord[] = currentItems.map((item) => ({
  id: item.entityRef.entityId,
  projectId: item.entityRef.projectId,
  identifier: item.entityRef.entityId,
  title: item.title,
  stateId: item.stateId,
  priorityId: "p1",
  assigneeIds: item.assigneeIds,
  labelIds: [],
  startDate: item.plannedStartDate,
  dueDate: item.plannedDueDate ?? null,
  revision: item.revision,
}))
export function fixtureQuery(
  id: string,
  member = "",
  pointIds?: readonly string[],
  project = "alpha",
): AnalyticsQuery {
  return {
    source: "fixture",
    scope: { id: project, permissionVersion: "read-v1", projectIds: [project] },
    measureId: id,
    measureVersion: 1,
    dimension:
      id === "status-distribution"
        ? "category"
        : id === "completion-trend"
          ? "time"
          : id === "work-item-aging"
            ? "entityId"
            : "blockerId",
    timeField: id === "completion-trend" ? "completedAt" : "asOf",
    range: { from: "2026-10-01T00:00:00Z", to: asOf },
    bucket: "day",
    timeZone: "Asia/Shanghai",
    filters: [
      ...(member ? [{ field: "assigneeIds" as const, values: [member] }] : []),
      ...(pointIds ? [{ field: "entityId" as const, values: pointIds }] : []),
    ],
  }
}
export const relations: AnalyticsRelation[] = [
  {
    id: "idea-work",
    from: entity("IDEA-1", "idea"),
    to: entity("WA-1"),
    kind: "idea-link",
    label: "informs",
  },
  {
    id: "work-session",
    from: entity("WA-1"),
    to: entity("SESSION-1", "session"),
    kind: "trace",
    label: "executed in",
  },
  {
    id: "session-run",
    from: entity("SESSION-1", "session"),
    to: entity("RUN-1", "run"),
    kind: "execution-parent",
    label: "contains run",
  },
  {
    id: "run-artifact",
    from: entity("RUN-1", "run"),
    to: entity("ARTIFACT-1", "artifact"),
    kind: "trace",
    label: "produced",
  },
]
export const fixtureMemberMap = new Map(
  currentItems.map((item) => [analyticsEntityKey(item.entityRef), item]),
)
