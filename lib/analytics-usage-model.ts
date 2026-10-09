import type { AgentRunSnapshot, UsageObservation } from "./agent-board-model"
import { summarizeUsage } from "./agent-board-view"
import { analyticsBucketId } from "./analytics-history"
import { analyticsQueryKey } from "./analytics-query"
import type { AnalyticsQuery, AnalyticsResult } from "./analytics-model"
export function computeUsageTrend(
  query: AnalyticsQuery,
  input: {
    observations: readonly UsageObservation[]
    runs: readonly AgentRunSnapshot[]
    metric: "tokens" | "cost" | "durationMs"
    currency?: string
    snapshotId: string
    asOf: string
  },
): AnalyticsResult {
  const seen = new Map<string, UsageObservation>()
  for (const o of input.observations) {
    const old = seen.get(o.observationId)
    if (old && JSON.stringify(old) !== JSON.stringify(o))
      throw new Error("Conflicting usage observation")
    seen.set(o.observationId, o)
  }
  const authorized = new Set(input.runs.map((r) => r.runId)),
    included = new Set<string>()
  for (const o of seen.values())
    if (authorized.has(o.runId) && o.inclusion === "inclusive")
      for (const id of o.includesRunIds ?? []) included.add(id)
  const valid = [...seen.values()].filter(
    (o) =>
      authorized.has(o.runId) &&
      o.inclusion !== "unknown" &&
      !included.has(o.runId) &&
      Date.parse(o.timestamp) >= Date.parse(query.range.from) &&
      Date.parse(o.timestamp) < Date.parse(query.range.to),
  )
  const groups = new Map<string, UsageObservation[]>()
  for (const o of valid) {
    const value = o[input.metric]
    if (value !== undefined && (!Number.isFinite(value) || value < 0))
      throw new Error("Invalid nonnegative usage")
    if (
      input.metric === "cost" &&
      (!input.currency || o.currency !== input.currency)
    )
      continue
    const id = analyticsBucketId(o.timestamp, query.bucket, query.timeZone)
    groups.set(id, [...(groups.get(id) ?? []), o])
  }
  const excluded = [...seen.values()].filter(
    (o) =>
      authorized.has(o.runId) &&
      (o.inclusion === "unknown" || included.has(o.runId)),
  ).length
  const points = [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucketId, observations]) => {
      const summary = summarizeUsage(observations, input.runs),
        values = observations.map((o) => o[input.metric]),
        value = values.some((v) => v === undefined)
          ? null
          : input.metric === "tokens"
            ? summary.tokens
            : input.metric === "durationMs"
              ? summary.durationMs
              : (summary.currencies.get(input.currency!) ?? null)
      const runIds = [...new Set(observations.map((o) => o.runId))]
      return {
        bucketId,
        label: bucketId,
        value: value ?? null,
        estimated: observations.some((o) => o.estimated),
        drilldown: {
          queryKey: analyticsQueryKey(query),
          snapshotId: input.snapshotId,
          seriesId: input.metric,
          bucketId,
          targetKind: "run" as const,
          predicate: [],
          entityRefs: runIds.map((id) => ({
            sourceId: query.source,
            projectId: query.scope.projectIds[0],
            kind: "run" as const,
            entityId: id,
          })),
          totalCount: runIds.length,
          membership: "snapshot" as const,
        },
      }
    })
  return {
    queryKey: analyticsQueryKey(query),
    snapshotId: input.snapshotId,
    asOf: input.asOf,
    computedAt: input.asOf,
    unit:
      input.metric === "cost" ? (input.currency ?? "unknown") : input.metric,
    coverage: null,
    total: null,
    series: [{ id: input.metric, label: input.metric, color: "3", points }],
    limitations: excluded ? ["analytics.usageExcluded"] : [],
    completeness:
      excluded || points.some((p) => p.value === null) ? "partial" : "complete",
  }
}
