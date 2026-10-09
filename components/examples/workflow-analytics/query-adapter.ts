import { parseShowcaseUrl } from "./url-state"
import type {
  AnalyticsQuery,
  AnalyticsResult,
  AnalyticsSeries,
  WorkItemAnalyticsSnapshot,
} from "@/lib/analytics-model"
import { analyticsEntityKey } from "@/lib/analytics-model"
import {
  analyticsQueryKey,
  matchesAnalyticsFilters,
} from "@/lib/analytics-query"
import { computeWorkflowMetric } from "@/lib/analytics-metrics"
import {
  analyticsBucketWindows,
  computeHistoricalMetric,
  computeStateResidence,
  computeVelocity,
} from "@/lib/analytics-history-metrics"
import type {
  AnalyticsBuilderDraft,
  AnalyticsBuilderMetric,
} from "@/lib/analytics-builder-model"
import {
  replayWorkflowHistory,
  analyticsBucketId,
} from "@/lib/analytics-history"
import * as fixture from "./fixtures/extended"
import type { ShowcaseUrl } from "./url-state"
export function fixtureSnapshotId(
  values: readonly WorkItemAnalyticsSnapshot[],
) {
  if (values === fixture.items) return fixture.snapshotId
  let hash = 2166136261
  for (const c of JSON.stringify(
    values.map((i) => [
      i.entityRef.entityId,
      i.revision,
      i.plannedStartDate,
      i.plannedDueDate,
    ]),
  ))
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619)
  return `${fixture.snapshotId}-plan-${(hash >>> 0).toString(16)}`
}
export type FixtureScenario =
  | "success"
  | "zero"
  | "no-history"
  | "partial"
  | "error"
  | "denied"
  | "detail-denied"
  | "late-response"
  | "forecast-insufficient"
  | "forecast-stale"
  | "scope-change"
export const scenarios: readonly FixtureScenario[] = [
  "success",
  "zero",
  "no-history",
  "partial",
  "error",
  "denied",
  "detail-denied",
  "late-response",
  "forecast-insufficient",
  "forecast-stale",
  "scope-change",
]
export function showcaseQuery(
  state: ShowcaseUrl,
  id: string,
  values: readonly WorkItemAnalyticsSnapshot[] = fixture.items,
): AnalyticsQuery {
  const range = {
    from: new Date(
      Date.parse(fixture.asOf) - Number(state.range.slice(0, -1)) * 86400000,
    ).toISOString(),
    to: fixture.asOf,
  }
  const cohort =
    state.timeField === "asOf"
      ? undefined
      : values
          .filter((i) => {
            const v = i[state.timeField as "createdAt" | "completedAt"]
            return (
              v &&
              Date.parse(v) >= Date.parse(range.from) &&
              Date.parse(v) < Date.parse(range.to)
            )
          })
          .map((i) => i.entityRef.entityId)
  return {
    source: "fixture",
    scope: {
      id: state.project,
      permissionVersion: "read-fixture-v2",
      projectIds: [state.project],
    },
    measureId: id,
    measureVersion: 1,
    dimension:
      id === "status-distribution"
        ? "category"
        : id === "blocker-distribution"
          ? "blockerId"
          : id === "work-item-aging" ||
              id === "state-residence" ||
              id === "cycle-time"
            ? "entityId"
            : "time",
    timeField:
      id === "completion-trend" || id === "cycle-time" ? "completedAt" : "asOf",
    range,
    bucket: state.bucket,
    timeZone: state.tz,
    filters: [
      ...(state.member
        ? [{ field: "assigneeIds" as const, values: [state.member] }]
        : []),
      ...(state.status
        ? [{ field: "category" as const, values: [state.status] }]
        : []),
      ...(cohort ? [{ field: "entityId" as const, values: cohort }] : []),
      ...(state.filter
        ? [{ field: "entityId" as const, values: state.filter.split(",") }]
        : []),
    ],
  }
}
export function fixtureAggregate(
  query: AnalyticsQuery,
  scenario: FixtureScenario = "success",
  values: readonly WorkItemAnalyticsSnapshot[] = fixture.items,
): AnalyticsResult {
  const input = {
    items: scenario === "zero" ? [] : values,
    snapshotId: fixtureSnapshotId(values),
    asOf: fixture.asOf,
    computedAt: fixture.asOf,
    completeness:
      scenario === "partial" ? ("partial" as const) : ("complete" as const),
    history:
      scenario === "zero"
        ? { ...fixture.history, baseline: [], events: [] }
        : fixture.history,
  }
  if (query.measureId === "state-residence")
    return computeStateResidence(
      query,
      input.items,
      input.snapshotId,
      input.asOf,
    )
  if (query.measureId === "velocity")
    return computeVelocity(
      query,
      { ...input, unit: "items" },
      [0, 30, 60].map((n) => ({
        id: `iteration-${n / 30 + 1}`,
        from: fixture.day(n),
        to: fixture.day(n + 30),
        closed: true,
        history:
          scenario === "zero"
            ? { ...fixture.history, baseline: [], events: [] }
            : fixture.history,
      })),
    )
  if (
    ["burndown", "burnup", "cumulative-flow", "cycle-time"].includes(
      query.measureId,
    )
  ) {
    const h =
      scenario === "no-history" || scenario === "partial"
        ? {
            ...fixture.history,
            coverage: { ...fixture.history.coverage, complete: false },
          }
        : input.history
    return computeHistoricalMetric(query, {
      ...input,
      history: h,
      unit: "items",
      calendar: fixture.calendar,
    })
  }
  return computeWorkflowMetric(query, {
    ...input,
    history:
      scenario === "no-history"
        ? undefined
        : scenario === "partial"
          ? {
              ...fixture.history,
              coverage: { ...fixture.history.coverage, complete: false },
            }
          : fixture.history,
  })
}
/** Controlled asynchronous adapter; scenario delays exercise real response races. */
export class FixtureAnalyticsService {
  async read(
    query: AnalyticsQuery,
    scenario: FixtureScenario,
    values: readonly WorkItemAnalyticsSnapshot[],
  ) {
    await new Promise((r) =>
      setTimeout(r, scenario === "late-response" ? 900 : 45),
    )
    if (scenario === "error") throw new Error("fixture read failed")
    if (scenario === "denied") throw new Error("fixture permission revoked")
    return fixtureAggregate(query, scenario, values)
  }
}
export const builderMetrics: readonly AnalyticsBuilderMetric[] = [
  {
    id: "count",
    version: 1,
    entityKind: "workItem",
    unit: "items",
    aggregation: "distinct",
    cohort: "in-scope, first sorted assignee attribution",
    timeField: "asOf",
    history: "none",
    denominator: "distinct items",
    reopenRule: "current state",
    dimensions: ["assigneeIds", "category"],
    segments: ["category"],
    units: ["items"],
    charts: ["bar", "line", "area", "donut"],
    exclusiveDimensions: ["category", "assigneeIds"],
  },
]
export function builderAggregate(
  draft: AnalyticsBuilderDraft,
  values: readonly WorkItemAnalyticsSnapshot[],
): AnalyticsResult {
  const q = draft.query,
    selected = values.filter(
      (i) =>
        i.inScope &&
        i.category !== "cancelled" &&
        q.scope.projectIds.includes(i.entityRef.projectId) &&
        matchesAnalyticsFilters(i, q.filters),
    ),
    seriesMap = new Map<string, Map<string, WorkItemAnalyticsSnapshot[]>>()
  for (const i of selected) {
    const bucket =
        q.dimension === "assigneeIds"
          ? ([...i.assigneeIds].sort()[0] ?? "unassigned")
          : i.category,
      s = q.segment === "category" ? i.category : "count",
      buckets =
        seriesMap.get(s) ?? new Map<string, WorkItemAnalyticsSnapshot[]>()
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), i])
    seriesMap.set(s, buckets)
  }
  const series: AnalyticsSeries[] = [...seriesMap]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, buckets]) => ({
      id,
      label: id,
      color:
        id === "active" || id === "completed" || id === "backlog" ? id : "1",
      points: [...buckets]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([bucketId, members]) => ({
          bucketId,
          label: bucketId,
          value: members.length,
          drilldown: {
            queryKey: analyticsQueryKey(q),
            snapshotId: fixtureSnapshotId(values),
            seriesId: id,
            bucketId,
            targetKind: "workItem",
            predicate: [],
            entityRefs: members.map((i) => i.entityRef),
            totalCount: members.length,
            membership: "snapshot",
          },
        })),
    }))
  return {
    queryKey: analyticsQueryKey(q),
    snapshotId: fixtureSnapshotId(values),
    asOf: fixture.asOf,
    computedAt: fixture.asOf,
    unit: "items",
    series,
    coverage: null,
    total: new Set(selected.map((i) => analyticsEntityKey(i.entityRef))).size,
    limitations: [],
    completeness: "complete",
  }
}
export function throughput(
  project: string,
  values: readonly WorkItemAnalyticsSnapshot[] = fixture.items,
  timeZone = "Asia/Shanghai",
  to = fixture.asOf,
) {
  const from = fixture.day(21),
    ids = new Set(
      values
        .filter((i) => i.entityRef.projectId === project && i.inScope)
        .map((i) => analyticsEntityKey(i.entityRef)),
    ),
    counts = new Map<string, Set<string>>()
  const completions = replayWorkflowHistory(
    fixture.history,
    to,
  ).completions.filter(
    (c) =>
      ids.has(analyticsEntityKey(c.item.entityRef)) &&
      Date.parse(c.occurredAt) >= Date.parse(from) &&
      Date.parse(c.occurredAt) < Date.parse(to),
  )
  for (const c of completions) {
    const id = analyticsBucketId(c.occurredAt, "day", timeZone)
    const bucket = counts.get(id) ?? new Set<string>()
    bucket.add(analyticsEntityKey(c.item.entityRef))
    counts.set(id, bucket)
  }
  const windows = analyticsBucketWindows({
    ...showcaseQuery(
      parseShowcaseUrl(new URLSearchParams({ range: "90d", tz: timeZone })),
      "completion-trend",
    ),
    range: { from, to },
    bucket: "day",
  }).filter((w) => Date.parse(w.to) - Date.parse(w.from) >= 23 * 3600000)
  const scopeStable = !fixture.history.events.some(
    (e) =>
      ids.has(analyticsEntityKey(e.entityRef)) &&
      e.kind === "scope" &&
      Date.parse(e.occurredAt) >= Date.parse(from) &&
      Date.parse(e.occurredAt) < Date.parse(to),
  )
  return {
    values: windows.map((w) => counts.get(w.id)?.size ?? 0),
    members: [
      ...new Map(
        completions
          .filter(
            (c) =>
              Date.parse(c.occurredAt) >=
                Date.parse(windows[0]?.from ?? from) &&
              Date.parse(c.occurredAt) < Date.parse(windows.at(-1)?.to ?? to),
          )
          .map((c) => [analyticsEntityKey(c.item.entityRef), c.item.entityRef]),
      ).values(),
    ],
    window: { from: windows[0]?.from ?? from, to: windows.at(-1)?.to ?? to },
    scopeStable,
  }
}
