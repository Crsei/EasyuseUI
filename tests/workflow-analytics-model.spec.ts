import { test, expect } from "@playwright/test"
import {
  analyticsEntityKey,
  type AnalyticsQuery,
  type WorkflowEvent,
} from "../lib/analytics-model"
import {
  analyticsQueryKey,
  intersectAnalyticsFilters,
  matchesAnalyticsFilters,
  acceptAnalyticsResponse,
  analyticsCsv,
  csvCell,
} from "../lib/analytics-query"
import {
  analyticsBucketId,
  effectiveWorkflowEvents,
  replayWorkflowHistory,
  hasHistoryCoverage,
} from "../lib/analytics-history"
import {
  computeWorkflowMetric,
  workflowRiskEvidence,
} from "../lib/analytics-metrics"
import { chartData } from "../lib/chart-model"
import { formatMetricComparison } from "../lib/chart-format"
import {
  asOf,
  currentItems,
  history,
  fixtureQuery,
  baseline,
} from "../components/examples/workflow-analytics/fixtures"
const input = {
  items: currentItems,
  snapshotId: "test-snapshot",
  asOf,
  computedAt: asOf,
  completeness: "complete" as const,
  history,
}
test("source, project and kind prevent entity collisions", () => {
  const ref = baseline[0].entityRef
  expect(
    new Set(
      [
        ref,
        { ...ref, kind: "run" as const },
        { ...ref, sourceId: "other" },
        { ...ref, projectId: "other" },
      ].map(analyticsEntityKey),
    ).size,
  ).toBe(4)
})
test("permission, global and widget filters always intersect; empty allowed set denies", () => {
  const filters = intersectAnalyticsFilters(
    [{ field: "projectId", values: ["alpha"] }],
    [{ field: "projectId", values: ["beta"] }],
  )
  expect(
    currentItems.filter((item) => matchesAnalyticsFilters(item, filters)),
  ).toEqual([])
  expect(
    matchesAnalyticsFilters(currentItems[0], [
      { field: "entityId", values: [] },
    ]),
  ).toBe(false)
  const query = fixtureQuery("status-distribution")
  expect(
    analyticsQueryKey({
      ...query,
      scope: { ...query.scope, projectIds: ["alpha", "beta"] },
      filters: [{ field: "stateId", values: ["b", "a"] }],
    }),
  ).toBe(
    analyticsQueryKey({
      ...query,
      scope: { ...query.scope, projectIds: ["beta", "alpha"] },
      filters: [{ field: "stateId", values: ["a", "b", "a"] }],
    }),
  )
})
test("late responses and permission generations cannot replace active results", () => {
  const result = computeWorkflowMetric(
    fixtureQuery("status-distribution"),
    input,
  )
  expect(
    acceptAnalyticsResponse(
      { queryKey: result.queryKey, generation: 2 },
      { result, generation: 1 },
    ),
  ).toBe(false)
  expect(
    acceptAnalyticsResponse(
      { queryKey: "new-permission", generation: 2 },
      { result, generation: 2 },
    ),
  ).toBe(false)
  expect(
    acceptAnalyticsResponse(
      { queryKey: result.queryKey, generation: 2 },
      { result, generation: 2 },
    ),
  ).toBe(true)
})
test("status stock, completion flow, age and overlapping blockers have independent hand-counted totals", () => {
  const status = computeWorkflowMetric(
    fixtureQuery("status-distribution"),
    input,
  )
  expect(status.total).toBe(7)
  expect(status.series[0].points.map((p) => p.value)).toEqual([1, 5, 1])
  const trend = computeWorkflowMetric(fixtureQuery("completion-trend"), input)
  expect(trend.total).toBe(3)
  expect(
    trend.series[0].points.find((p) => p.bucketId === "2026-10-04")?.value,
  ).toBe(2)
  const blockers = computeWorkflowMetric(
    fixtureQuery("blocker-distribution"),
    input,
  )
  expect(blockers.total).toBe(2)
  expect(blockers.series[0].points.map((p) => p.value)).toEqual([2, 1])
  const ages = computeWorkflowMetric(fixtureQuery("work-item-aging"), input)
  expect(ages.completeness).toBe("partial")
  expect(
    ages.series[0].points.find((p) => p.label === baseline[7].title)?.value,
  ).toBeNull()
  expect(
    ages.series[0].points.find((p) => p.label === baseline[1].title)?.value,
  ).toBe(28)
})
test("historical completion drilldown retains the now-reopened member", () => {
  const trend = computeWorkflowMetric(fixtureQuery("completion-trend"), input)
  const point = trend.series[0].points.find((p) => p.bucketId === "2026-10-04")!
  expect(point.drilldown?.entityRefs?.map((ref) => ref.entityId)).toEqual([
    "WA-1",
    "WA-3",
  ])
  expect(
    currentItems.find((item) => item.entityRef.entityId === "WA-3")?.category,
  ).toBe("active")
  expect(point.drilldown?.snapshotId).toBe(input.snapshotId)
  expect(point.drilldown?.membership).toBe("historical")
})
test("duplicate completion events, reopen within a bucket and half-open bounds", () => {
  const target = history.events[0]
  const reopen: WorkflowEvent = {
    ...target,
    eventId: "same-bucket-reopen",
    sequence: 20,
    occurredAt: "2026-10-02T13:00:00Z",
    after: { category: "active", stateId: "active", completedAt: null },
  }
  const done: WorkflowEvent = {
    ...target,
    eventId: "same-bucket-done",
    sequence: 21,
    occurredAt: "2026-10-02T14:00:00Z",
  }
  const end: WorkflowEvent = {
    ...target,
    eventId: "at-upper-bound",
    sequence: 22,
    entityRef: baseline[1].entityRef,
    occurredAt: asOf,
  }
  const result = computeWorkflowMetric(fixtureQuery("completion-trend"), {
    ...input,
    history: { ...history, events: [...history.events, reopen, done, end] },
  })
  expect(result.total).toBe(3)
  expect(
    result.series[0].points.find((p) => p.bucketId === "2026-10-02")?.value,
  ).toBe(1)
})
test("correction, retraction and conflicts are resolved by source event identity", () => {
  const target = history.events[0]
  const correction: WorkflowEvent = {
    ...target,
    eventId: "correct",
    sequence: 50,
    occurredAt: "2026-10-08T12:00:00Z",
    kind: "correction",
    targetEventId: target.eventId,
    after: { stateId: "active", category: "active" },
  }
  expect(
    effectiveWorkflowEvents([...history.events, correction], asOf).find(
      (e) => e.eventId === target.eventId,
    )?.after.category,
  ).toBe("active")
  expect(
    effectiveWorkflowEvents(
      [...history.events, { ...correction, kind: "retraction" }],
      asOf,
    ).some((e) => e.eventId === target.eventId),
  ).toBe(false)
  expect(() =>
    effectiveWorkflowEvents(
      [target, { ...target, sourceVersion: "conflict" }],
      asOf,
    ),
  ).toThrow(/Conflicting/)
  expect(() =>
    effectiveWorkflowEvents(
      [{ ...correction, targetEventId: "missing" }],
      asOf,
    ),
  ).toThrow(/Unresolved/)
  expect(() =>
    replayWorkflowHistory(
      {
        ...history,
        events: [
          { ...target, after: { estimate: { amount: NaN, unit: "hours" } } },
        ],
      },
      asOf,
    ),
  ).toThrow(/estimate/)
})
test("history without a baseline, with a gap or unsupported metric never produces a trend", () => {
  const query = fixtureQuery("completion-trend")
  for (const coverage of [
    { ...history.coverage, complete: false },
    { ...history.coverage, baselineAsOf: "2026-10-03T00:00:00Z" },
    { ...history.coverage, supportedMetrics: [] },
    {
      ...history.coverage,
      missingIntervals: [
        { from: "2026-10-02T00:00:00Z", to: "2026-10-03T00:00:00Z" },
      ],
    },
  ]) {
    expect(
      hasHistoryCoverage(
        coverage,
        query.range.from,
        query.range.to,
        query.measureId,
      ),
    ).toBe(false)
    expect(
      computeWorkflowMetric(query, {
        ...input,
        history: { ...history, coverage },
      }).completeness,
    ).toBe("unavailable")
  }
  expect(
    computeWorkflowMetric(query, { ...input, history: undefined }).series,
  ).toEqual([])
})
test("time buckets use declared zone, Monday weeks and DST local dates", () => {
  expect(
    analyticsBucketId("2026-10-01T23:00:00Z", "day", "Asia/Shanghai"),
  ).toBe("2026-10-02")
  expect(analyticsBucketId("2026-10-04T12:00:00Z", "week", "UTC")).toBe(
    "2026-09-28",
  )
  expect(
    analyticsBucketId("2026-11-01T05:30:00Z", "day", "America/New_York"),
  ).toBe("2026-11-01")
  expect(
    analyticsBucketId("2026-11-01T06:30:00Z", "day", "America/New_York"),
  ).toBe("2026-11-01")
})
test("CSV includes snapshot and definitions, rejects mismatch, and escapes formulas", () => {
  expect(csvCell('  =HYPERLINK("x")')).toBe('"\'  =HYPERLINK(""x"")"')
  const query = fixtureQuery("status-distribution")
  const result = computeWorkflowMetric(query, input)
  expect(analyticsCsv(query, result)).toContain("test-snapshot")
  expect(analyticsCsv(query, result)).toContain("status-distribution@1")
  expect(() => analyticsCsv({ ...query, timeZone: "UTC" }, result)).toThrow(
    /mismatch/,
  )
})
test("zero denominators, nonfinite values and source arrays remain honest", () => {
  expect(formatMetricComparison(3, 0)).toEqual({ kind: "new", value: null })
  expect(formatMetricComparison(0, 0).kind).toBe("unavailable")
  const query = fixtureQuery("status-distribution")
  const result = computeWorkflowMetric(query, { ...input, items: [] })
  expect(result.total).toBe(0)
  const original = JSON.stringify(input)
  computeWorkflowMetric(query, input)
  expect(JSON.stringify(input)).toBe(original)
  expect(
    chartData({
      ...result,
      series: [
        {
          id: "x",
          label: "x",
          color: "1",
          points: [{ bucketId: "a", label: "a", value: Infinity }],
        },
      ],
    })[0].point.value,
  ).toBeNull()
  expect(() =>
    computeWorkflowMetric(
      { ...query, timeField: "createdAt" } as AnalyticsQuery,
      input,
    ),
  ).toThrow(/Unsupported/)
})
test("risk evidence has rule, threshold, source and timestamp and excludes removed items", () => {
  const risks = workflowRiskEvidence(currentItems, asOf, "Asia/Shanghai", 14)
  expect(
    risks.some(
      (r) => r.rule === "missing-due-date" && r.entityRef.entityId === "WA-5",
    ),
  ).toBe(true)
  expect(risks.some((r) => r.entityRef.entityId === "WA-7")).toBe(false)
  expect(
    risks.every((r) => r.asOf === asOf && !!r.threshold && !!r.source),
  ).toBe(true)
})

test("work-item metrics exclude other entity kinds even when identifiers overlap", () => {
  const run = {
    ...currentItems[0],
    entityRef: { ...currentItems[0].entityRef, kind: "run" as const },
  }
  expect(
    computeWorkflowMetric(fixtureQuery("status-distribution"), {
      ...input,
      items: [...currentItems, run],
    }).total,
  ).toBe(7)
})
