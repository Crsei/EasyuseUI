import { test, expect } from "@playwright/test"
import {
  computeWorkload,
  executionGeometry,
} from "../lib/analytics-resource-model"
import {
  computeHistoricalMetric,
  computeVelocity,
  nearestRank,
  analyticsBucketWindows,
} from "../lib/analytics-history-metrics"
import { sampleThroughputForecast } from "../lib/analytics-forecast-model"
import { dependencyCycles } from "../lib/analytics-dependency-model"
import {
  DashboardEditSession,
  migrateDashboardDefinition,
} from "../lib/dashboard-edit-session"
import {
  validateAnalyticsBuilder,
  analyticsBuilderKey,
} from "../lib/analytics-builder-model"
import { computeUsageTrend } from "../lib/analytics-usage-model"
import { analyticsQueryKey } from "../lib/analytics-query"
import type {
  AnalyticsQuery,
  WorkflowEvent,
  WorkItemAnalyticsSnapshot,
} from "../lib/analytics-model"
import type { AnalyticsHistory } from "../lib/analytics-history"
import {
  baseline,
  fixtureQuery,
  entity,
} from "../components/examples/workflow-analytics/fixtures"
import {
  builderMetrics,
  builderAggregate,
} from "../components/examples/workflow-analytics/query-adapter"
import {
  parseShowcaseUrl,
  serializeShowcaseUrl,
} from "../components/examples/workflow-analytics/url-state"
const q: AnalyticsQuery = {
  ...fixtureQuery("burndown"),
  range: { from: "2026-01-01T00:00:00Z", to: "2026-01-05T00:00:00Z" },
  timeZone: "UTC",
  dimension: "time",
}
const initial: WorkItemAnalyticsSnapshot[] = [0, 1, 2].map((i) => ({
  ...baseline[0],
  entityRef: entity(String(i)),
  title: String(i),
  createdAt: "2025-12-01T00:00:00Z",
  actualStartedAt: null,
  estimate: { amount: 2, unit: "hours" },
  inScope: i !== 1,
}))
const changes: WorkflowEvent[] = [
  {
    eventId: "start",
    entityRef: initial[0].entityRef,
    kind: "state",
    occurredAt: "2026-01-01T12:00:00Z",
    after: {
      category: "active",
      stateId: "active",
      actualStartedAt: "2026-01-01T12:00:00Z",
    },
  },
  {
    eventId: "done",
    entityRef: initial[0].entityRef,
    kind: "state",
    occurredAt: "2026-01-02T12:00:00Z",
    after: {
      category: "completed",
      stateId: "completed",
      completedAt: "2026-01-02T12:00:00Z",
    },
  },
  {
    eventId: "add",
    entityRef: initial[1].entityRef,
    kind: "scope",
    occurredAt: "2026-01-02T13:00:00Z",
    after: { inScope: true },
  },
  {
    eventId: "reopen",
    entityRef: initial[0].entityRef,
    kind: "state",
    occurredAt: "2026-01-03T00:00:00Z",
    after: {
      category: "active",
      stateId: "active",
      completedAt: null,
      actualStartedAt: "2026-01-03T00:00:00Z",
    },
  },
  {
    eventId: "estimate",
    entityRef: initial[0].entityRef,
    kind: "estimate",
    occurredAt: "2026-01-03T01:00:00Z",
    after: { estimate: { amount: 4, unit: "hours" } },
  },
  {
    eventId: "remove",
    entityRef: initial[2].entityRef,
    kind: "scope",
    occurredAt: "2026-01-03T02:00:00Z",
    after: { inScope: false },
  },
  {
    eventId: "done-again",
    entityRef: initial[0].entityRef,
    kind: "state",
    occurredAt: "2026-01-04T12:00:00Z",
    after: {
      category: "completed",
      stateId: "completed",
      completedAt: "2026-01-04T12:00:00Z",
    },
  },
].map((e, i) => ({
  ...e,
  recordedAt: e.occurredAt,
  sourceVersion: "test",
  sequence: i + 1,
})) as WorkflowEvent[]
const history: AnalyticsHistory = {
  baseline: initial,
  events: [...changes].reverse().concat(changes[0]),
  coverage: {
    from: q.range.from,
    to: q.range.to,
    baselineAsOf: q.range.from,
    baselineVersion: "v1",
    watermark: "7",
    complete: true,
    missingIntervals: [],
    supportedMetrics: ["burndown", "burnup", "cumulative-flow", "cycle-time"],
  },
}
const input = {
  history,
  snapshotId: "hand",
  asOf: q.range.to,
  computedAt: q.range.to,
  unit: "hours",
  calendar: {
    id: "c",
    version: "v1",
    timeZone: "UTC",
    workingBucketIds: ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"],
  },
}
test("hand-count burnup and ideal baseline preserve scope, estimate correction and reopening", () => {
  const r = computeHistoricalMetric({ ...q, measureId: "burnup" }, input)
  expect(r.series.map((s) => s.points.map((p) => p.value))).toEqual([
    [4, 6, 6, 6],
    [0, 2, 0, 4],
  ])
  const d = computeHistoricalMetric(q, input)
  expect(d.series.map((s) => s.points.map((p) => p.value))).toEqual([
    [4, 4, 6, 2],
    [3, 2, 1, 0],
  ])
})
test("CFD state layers sum to historical scope and retain removed members", () => {
  const r = computeHistoricalMetric(
    { ...q, measureId: "cumulative-flow" },
    input,
  )
  expect(r.series.map((s) => s.points.map((p) => p.value))).toEqual([
    [1, 2, 1, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ])
  expect(
    r.series[0].points[0].drilldown?.entityRefs?.map((r) => r.entityId),
  ).toEqual(["2"])
})
test("cycle time uses first actual start and includes the reopen gap", () => {
  const r = computeHistoricalMetric(
    { ...q, measureId: "cycle-time", timeField: "completedAt" },
    input,
  )
  expect(r.series[0].points.map((p) => p.value)).toEqual([3])
  expect(r.sampleCoverage).toEqual({ observed: 1, total: 1 })
  expect(nearestRank([1, 2, 3, 4, 10], 0.85)).toBe(10)
})
test("missing estimates remain null; incomplete history produces no fabricated series", () => {
  const r = computeHistoricalMetric(q, { ...input, unit: "points" })
  expect(r.series[0].points.every((p) => p.value === null)).toBe(true)
  expect(
    computeHistoricalMetric(q, {
      ...input,
      history: {
        ...history,
        coverage: { ...history.coverage, complete: false },
      },
    }).series,
  ).toEqual([])
})
test("local daily buckets cross DST with a 23-hour day", () => {
  const windows = analyticsBucketWindows({
    ...q,
    timeZone: "America/New_York",
    range: { from: "2026-03-07T05:00:00Z", to: "2026-03-10T04:00:00Z" },
  })
  expect(
    windows.map((w) => (Date.parse(w.to) - Date.parse(w.from)) / 3600000),
  ).toEqual([24, 23, 24])
})
const allocation = {
  id: "a",
  entityRef: entity("a"),
  title: "a",
  bucketId: "2026-10-09",
  resourceId: "lin",
  amount: 8,
  unit: "hours",
  share: 0.5,
  rule: "equal share",
}
test("resource shares avoid duplicate assignment; zero, missing capacity and missing estimates differ", () => {
  const capacity = {
    resourceId: "lin",
    bucketId: allocation.bucketId,
    available: 8,
    unit: "hours",
    calendarVersion: "v1",
  }
  expect(
    computeWorkload([allocation], [capacity], "hours")[0].utilization,
  ).toBe(0.5)
  expect(
    computeWorkload([allocation], [{ ...capacity, available: 0 }], "hours")[0]
      .state,
  ).toBe("unavailable")
  expect(computeWorkload([allocation], [], "hours")[0].utilization).toBeNull()
  expect(
    computeWorkload([{ ...allocation, amount: null }], [capacity], "hours")[0]
      .allocated,
  ).toBeNull()
  expect(() =>
    computeWorkload(
      [allocation, { ...allocation, id: "b", resourceId: "maya", share: 0.7 }],
      [],
      "hours",
    ),
  ).toThrow()
})
test("execution geometry preserves minute precision, ongoing and unavailable intervals", () => {
  const rows = [
    {
      id: "r",
      entityRef: entity("r", "run"),
      agentId: "a",
      label: "r",
      startedAt: "2026-01-01T00:15:00Z",
      endedAt: "2026-01-01T00:45:00Z",
      asOf: q.range.to,
      runtimeStatus: "completed",
      acceptance: "unknown" as const,
    },
  ]
  const r = executionGeometry(rows, {
    from: "2026-01-01T00:00:00Z",
    to: "2026-01-01T01:00:00Z",
  })[0]
  expect([r.left, r.width, r.durationMs]).toEqual([25, 50, 1800000])
})
const method = {
  id: "empirical-bootstrap" as const,
  version: 1 as const,
  minSamples: 5,
  draws: 100,
  maxDays: 30,
  calibrationOrigins: 10,
  minCalibrationOrigins: 3,
  minP85Coverage: 0.5,
  staleAfterMs: 86400000,
  seed: 12,
}
const forecastInput = {
  method,
  throughput: Array(30).fill(1),
  remaining: [entity("a"), entity("b"), entity("c")],
  historicalMembers: [entity("d")],
  generatedAt: "2026-03-07T12:00:00Z",
  asOf: "2026-03-07T12:00:00Z",
  historicalWindow: q.range,
  snapshotId: "s",
  timeZone: "America/New_York",
  calendarVersion: "days-v1",
  scopeId: "alpha",
  scopeStable: true,
  historyComplete: true,
}
test("seeded forecast calibrates delivery days and reports date-only local calendar quantiles", () => {
  const r = sampleThroughputForecast(forecastInput)
  expect(r.status).toBe("available")
  expect(r.quantiles.map((q) => [q.days, q.date])).toEqual([
    [3, "2026-03-10"],
    [3, "2026-03-10"],
    [3, "2026-03-10"],
  ])
  expect(r.calibration).toMatchObject({ origins: 10, p85Coverage: 1 })
  expect(sampleThroughputForecast(forecastInput)).toEqual(r)
})
test("forecast gates incomplete history, insufficient outcomes, staleness and censored simulations", () => {
  expect(
    sampleThroughputForecast({ ...forecastInput, historyComplete: false })
      .status,
  ).toBe("insufficient")
  expect(
    sampleThroughputForecast({
      ...forecastInput,
      throughput: [1, 1, 1, 1, 1, 1],
    }).status,
  ).toBe("uncalibrated")
  expect(
    sampleThroughputForecast({ ...forecastInput, asOf: "2026-03-10T12:00:00Z" })
      .status,
  ).toBe("stale")
  expect(
    sampleThroughputForecast({
      ...forecastInput,
      method: { ...method, maxDays: 1 },
    }).quantiles.every((q) => q.days === null),
  ).toBe(true)
})
test("dependency cycle detection excludes downstream non-cycle nodes", () => {
  const edge = (id: string, a: string, b: string) => ({
    id,
    from: entity(a),
    to: entity(b),
    state: "unknown" as const,
    evidence: "explicit",
  })
  expect(
    dependencyCycles([
      edge("ab", "a", "b"),
      edge("ba", "b", "a"),
      edge("bc", "b", "c"),
    ])[0],
  ).toHaveLength(2)
})
const definition = {
  schemaVersion: 1 as const,
  id: "d",
  revision: 1,
  templateId: "overview",
  globalFilters: [],
  widgets: [
    {
      id: "a",
      templateId: "burndown",
      query: q,
      width: 6 as const,
      height: 240 as const,
    },
  ],
}
test("unknown save retains operation across subscriptions and blocks edit/reset/replay until reconcile", async () => {
  let writes = 0
  const session = new DashboardEditSession(
    definition,
    {
      save: async (i) => {
        writes++
        return { operationId: i.operationId, outcome: "unknown" }
      },
      reconcile: async (i) => ({
        operationId: i.operationId,
        outcome: "confirmed",
        definition: { ...i.definition, revision: 2 },
      }),
    },
    () => "operation-1",
  )
  session.edit({ kind: "resize", id: "a", width: 12, height: 320 })
  await session.save()
  expect(session.getSnapshot().pending?.operationId).toBe("operation-1")
  expect(session.edit({ kind: "remove", id: "a" })).toBe(false)
  expect(session.reset()).toBe(false)
  await session.save()
  expect(writes).toBe(1)
  const unsubscribe = session.subscribe(() => {})
  unsubscribe()
  expect(session.getSnapshot().status).toBe("unknown")
  await session.reconcile()
  expect(session.getSnapshot()).toMatchObject({
    status: "confirmed",
    dirty: false,
    pending: null,
  })
  expect(session.getSnapshot().base.widgets[0].width).toBe(12)
})
test("rejected saves retain draft and schema migration strips nested secrets and caches", async () => {
  const s = new DashboardEditSession(
    definition,
    {
      save: async (i) => ({ operationId: i.operationId, outcome: "rejected" }),
    },
    () => "reject",
  )
  s.edit({ kind: "remove", id: "a" })
  await s.save()
  expect(s.getSnapshot()).toMatchObject({ status: "rejected", dirty: true })
  const migrated = migrateDashboardDefinition({
    ...definition,
    schemaVersion: 0,
    password: "bad",
    widgets: [
      {
        ...definition.widgets[0],
        cache: ["bad"],
        query: { ...q, credential: "bad" },
      },
    ],
  })
  expect(JSON.stringify(migrated)).not.toContain("bad")
  expect(() =>
    migrateDashboardDefinition({ ...definition, widgets: null }),
  ).toThrow()
})
test("builder rejects currency counts, ambiguous donut and authority changes; segmented counts dedupe", () => {
  const draft = {
    query: {
      ...fixtureQuery("count"),
      dimension: "assigneeIds",
      segment: "category",
    },
    unit: "items",
    chart: "bar" as const,
    stacked: true,
  }
  expect(
    validateAnalyticsBuilder(draft, builderMetrics, draft.query),
  ).toBeNull()
  expect(
    validateAnalyticsBuilder(
      { ...draft, unit: "USD" },
      builderMetrics,
      draft.query,
    ),
  ).toBe("analytics.builderCombination")
  expect(
    validateAnalyticsBuilder(
      { ...draft, chart: "donut" },
      builderMetrics,
      draft.query,
    ),
  ).toBe("analytics.builderComposition")
  expect(
    validateAnalyticsBuilder(
      { ...draft, query: { ...draft.query, source: "other" } },
      builderMetrics,
      draft.query,
    ),
  ).toBe("analytics.builderScope")
  const r = builderAggregate(draft, [
    { ...baseline[0], assigneeIds: ["maya", "lin"] },
  ])
  expect(r.total).toBe(1)
  expect(r.series[0].points[0]).toMatchObject({ bucketId: "lin", value: 1 })
  expect(analyticsBuilderKey(draft)).not.toBe(
    analyticsBuilderKey({ ...draft, stacked: false }),
  )
})
test("usage inclusive descendants, unknown observations and currencies never double count", () => {
  const runs = ["parent", "child", "unknown", "eur"].map((runId) => ({
    runId,
    title: runId,
    agentId: "a",
    agentName: "a",
    runtimeStatus: "completed",
    updatedAt: q.range.to,
    revision: 1,
    source: "fixture",
    completeness: "complete" as const,
  }))
  const observations = [
    {
      observationId: "p",
      runId: "parent",
      timestamp: q.range.from,
      cost: 2,
      currency: "USD",
      inclusion: "inclusive" as const,
      includesRunIds: ["child"],
    },
    {
      observationId: "c",
      runId: "child",
      timestamp: q.range.from,
      cost: 1,
      currency: "USD",
      inclusion: "exclusive" as const,
    },
    {
      observationId: "u",
      runId: "unknown",
      timestamp: q.range.from,
      cost: 100,
      currency: "USD",
      inclusion: "unknown" as const,
    },
    {
      observationId: "e",
      runId: "eur",
      timestamp: q.range.from,
      cost: 3,
      currency: "EUR",
      inclusion: "exclusive" as const,
    },
  ]
  const input = {
    runs,
    observations,
    snapshotId: "usage",
    asOf: q.range.to,
    metric: "cost" as const,
    currency: "USD",
  }
  expect(computeUsageTrend(q, input).series[0].points[0].value).toBe(2)
  expect(
    computeUsageTrend(q, { ...input, currency: "EUR" }).series[0].points[0]
      .value,
  ).toBe(3)
})
test("URL adapter restores meaning and rejects unknown modes or oversized identities", () => {
  const url = parseShowcaseUrl(
    new URLSearchParams(
      "view=flow&project=beta&range=90d&tz=UTC&series=active&widget=cumulative-flow&bucketId=2026-10-01",
    ),
  )
  expect(
    parseShowcaseUrl(new URLSearchParams(serializeShowcaseUrl(url))),
  ).toEqual(url)
  expect(
    parseShowcaseUrl(new URLSearchParams("view=unsupported&secret=x")),
  ).toMatchObject({ view: "overview", notice: true })
  expect(analyticsQueryKey(q)).toContain("permissionVersion")
})

test("velocity excludes pre-existing completion and ideal baseline starts from remaining commitment", () => {
  const mini = {
    ...history,
    baseline: initial.map((i, n) =>
      n === 0
        ? {
            ...i,
            category: "completed" as const,
            stateId: "completed",
            completedAt: "2025-12-29T00:00:00Z",
          }
        : n === 1
          ? { ...i, inScope: true }
          : { ...i, inScope: false },
    ),
    events: [
      {
        ...changes[1],
        entityRef: initial[1].entityRef,
        occurredAt: "2026-01-03T00:00:00Z",
        after: {
          category: "completed" as const,
          stateId: "completed",
          completedAt: "2026-01-03T00:00:00Z",
        },
      },
    ],
    coverage: {
      ...history.coverage,
      supportedMetrics: [...history.coverage.supportedMetrics, "velocity"],
    },
  }
  const r = computeVelocity(
    { ...q, measureId: "velocity" },
    { ...input, unit: "items" },
    [{ id: "closed", ...q.range, closed: true, history: mini }],
  )
  expect(r.series.map((s) => s.points.map((p) => p.value))).toEqual([
    [1],
    [1],
    [0],
  ])
  expect(
    computeHistoricalMetric(q, {
      ...input,
      history: mini,
    }).series[1].points.map((p) => p.value),
  ).toEqual([1.5, 1, 0.5, 0])
})
