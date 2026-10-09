"use client"
import { useState } from "react"
import { Heatmap } from "@/components/blocks/charts/heatmap"
import { ResourceAllocationView } from "@/components/blocks/analytics/resource-allocation-view"
import { AgentOperationsDashboard } from "@/components/blocks/analytics/agent-operations-dashboard"
import { WorkDependencyView } from "@/components/blocks/analytics/work-dependency-view"
import {
  BurndownChart,
  BurnupChart,
  VelocityChart,
  CumulativeFlowChart,
  CycleTimeChart,
  StateResidenceChart,
} from "@/components/blocks/charts/workflow-history-charts"
import { ForecastChart } from "@/components/blocks/charts/forecast-chart"
import { DashboardLayoutEditor } from "@/components/blocks/dashboard/dashboard-layout-editor"
import { AnalyticsBuilder } from "@/components/blocks/analytics/analytics-builder"
import {
  computeWorkload,
  type WorkloadCell,
} from "@/lib/analytics-resource-model"
import { DashboardEditSession } from "@/lib/dashboard-edit-session"
import { sampleThroughputForecast } from "@/lib/analytics-forecast-model"
import {
  analyticsBuilderKey,
  type AnalyticsBuilderDraft,
} from "@/lib/analytics-builder-model"
import type { AnalyticsResult } from "@/lib/analytics-model"
import { useI18n } from "@/lib/i18n-provider"
import {
  showcaseQuery,
  fixtureAggregate,
  builderAggregate,
  builderMetrics,
  throughput,
} from "./query-adapter"
import { parseShowcaseUrl } from "./url-state"
import * as f from "./fixtures/extended"
const state = parseShowcaseUrl(new URLSearchParams({ range: "90d" })),
  cells = computeWorkload(f.allocationsOf(f.items), f.capacities, "hours")
export function ResourceModelDemo() {
  const { t } = useI18n()
  return (
    <p>
      {t("analytics.allocationDefinition")} · {cells.length}
    </p>
  )
}
export function HeatmapDemo() {
  return <Heatmap cells={cells.slice(0, 8)} />
}
export function ResourceAllocationDemo() {
  const [selected, setSelected] = useState<WorkloadCell | null>(null)
  return (
    <ResourceAllocationView
      cells={cells.slice(0, 8)}
      selection={selected}
      onSelectionChange={setSelected}
    />
  )
}
export function AgentOperationsDemo() {
  return (
    <AgentOperationsDashboard
      intervals={f.intervals.slice(0, 3)}
      range={{ from: "2026-10-08T07:00:00Z", to: f.asOf }}
      runs={f.runs}
      observations={f.observations}
    />
  )
}
export function DependencyDemo() {
  return <WorkDependencyView dependencies={f.dependencies} />
}
const historyCharts = {
  burndown: BurndownChart,
  burnup: BurnupChart,
  velocity: VelocityChart,
  "cumulative-flow": CumulativeFlowChart,
  "cycle-time": CycleTimeChart,
  "state-residence": StateResidenceChart,
}
export function HistoryChartsDemo() {
  const [id, setId] = useState<keyof typeof historyCharts>("burndown")
  const Component = historyCharts[id]
  return (
    <>
      <select
        aria-label="Chart"
        value={id}
        onChange={(e) => setId(e.target.value as keyof typeof historyCharts)}
      >
        {Object.keys(historyCharts).map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>
      <Component
        query={showcaseQuery(state, id)}
        result={fixtureAggregate(showcaseQuery(state, id))}
        widgetId={id}
      />
    </>
  )
}
export function ForecastDemo() {
  const observed = throughput("alpha"),
    result = sampleThroughputForecast({
      method: {
        id: "empirical-bootstrap",
        version: 1,
        minSamples: 20,
        draws: 256,
        maxDays: 180,
        calibrationOrigins: 20,
        minCalibrationOrigins: 5,
        minP85Coverage: 0.5,
        staleAfterMs: 86400000,
        seed: 42,
      },
      throughput: observed.values,
      remaining: f.items
        .filter(
          (i) =>
            i.inScope &&
            i.category !== "completed" &&
            i.entityRef.projectId === "alpha",
        )
        .map((i) => i.entityRef),
      historicalMembers: observed.members,
      generatedAt: f.asOf,
      asOf: f.asOf,
      historicalWindow: observed.window,
      snapshotId: f.snapshotId,
      timeZone: "Asia/Shanghai",
      calendarVersion: "calendar-days-v1",
      scopeId: "alpha",
      scopeStable: observed.scopeStable,
      historyComplete: true,
    })
  return <ForecastChart result={result} />
}
export function LayoutEditorDemo() {
  const { t } = useI18n(),
    [session] = useState(
      () =>
        new DashboardEditSession(
          {
            schemaVersion: 1,
            id: "demo",
            revision: 0,
            templateId: "overview-copy",
            globalFilters: [],
            widgets: [],
          },
          {
            save: async (i) => ({
              operationId: i.operationId,
              outcome: "confirmed",
              definition: { ...i.definition, revision: i.baseRevision + 1 },
            }),
          },
          () => crypto.randomUUID(),
        ),
    )
  return (
    <DashboardLayoutEditor
      session={session}
      templates={[
        {
          id: "burndown",
          label: t("analytics.burndown"),
          create: (id) => ({
            id,
            templateId: "burndown",
            query: showcaseQuery(state, "burndown"),
            width: 6,
            height: 240,
          }),
        },
      ]}
      createWidgetId={() => crypto.randomUUID()}
      renderWidget={(w) => (
        <BurndownChart
          widgetId={w.id}
          query={w.query}
          result={fixtureAggregate(w.query)}
        />
      )}
    />
  )
}
export function BuilderDemo() {
  const q = {
    ...showcaseQuery(state, "count"),
    dimension: "assigneeIds",
    segment: "category",
  }
  const [draft, setDraft] = useState<AnalyticsBuilderDraft>({
      query: q,
      unit: "items",
      chart: "bar",
      stacked: true,
    }),
    [preview, setPreview] = useState<{
      configurationKey: string
      result: AnalyticsResult
    }>(),
    [applied, setApplied] = useState(false)
  return (
    <>
      <AnalyticsBuilder
        draft={draft}
        onDraftChange={setDraft}
        authority={q}
        metrics={builderMetrics}
        preview={preview}
        onPreview={(d) =>
          setPreview({
            configurationKey: analyticsBuilderKey(d),
            result: builderAggregate(d, f.items),
          })
        }
        onApply={() => setApplied(true)}
        onCancel={() => setPreview(undefined)}
      />
      {applied && <p>Applied · local fixture</p>}
    </>
  )
}
