"use client"
import { useState } from "react"
import { StatisticalChart } from "@/components/blocks/charts/statistical-chart"
import { ChartDataTable } from "@/components/blocks/charts/chart-data-table"
import { ChartDrilldownPanel } from "@/components/blocks/charts/chart-drilldown-panel"
import { WorkflowMetric } from "@/components/blocks/analytics/workflow-metric"
import { RiskEvidenceList } from "@/components/blocks/analytics/risk-evidence-list"
import { WorkTraceabilityView } from "@/components/blocks/analytics/work-traceability-view"
import { ProjectOverviewDashboard } from "@/components/blocks/dashboard/project-overview-dashboard"
import {
  computeWorkflowMetric,
  workflowRiskEvidence,
} from "@/lib/analytics-metrics"
import type { DrilldownSelection } from "@/lib/analytics-model"
import { useI18n } from "@/lib/i18n-provider"
import {
  asOf,
  currentItems,
  history,
  fixtureQuery,
  relations,
  fixtureMemberMap,
} from "./fixtures"
import { analyticsEntityKey } from "@/lib/analytics-model"
const input = {
  items: currentItems,
  snapshotId: "fixture-snapshot-9",
  asOf,
  computedAt: asOf,
  completeness: "complete" as const,
  history,
}
export function StatisticalChartDemo() {
  const { t } = useI18n()
  const query = fixtureQuery("status-distribution")
  const metric = computeWorkflowMetric(query, input)
  const result = {
    ...metric,
    series: metric.series.map((series) => ({
      ...series,
      points: series.points.map((point, index) => ({ ...point, x: index + 1 })),
    })),
  }
  return (
    <div className="grid min-w-0 gap-4">
      {(["bar", "line", "area", "donut", "scatter"] as const).map((kind) => (
        <StatisticalChart
          key={kind}
          widgetId={`demo-${kind}`}
          kind={kind}
          query={query}
          result={result}
          composition="exclusive"
          xType={kind === "scatter" ? "number" : "category"}
          xUnit={
            kind === "scatter" ? t("analytics.exampleCoordinate") : undefined
          }
          title={kind}
          description={t("analytics.local")}
        />
      ))}
    </div>
  )
}
export function ChartDataTableDemo() {
  const query = fixtureQuery("status-distribution")
  return <ChartDataTable result={computeWorkflowMetric(query, input)} />
}
export function ChartDrilldownDemo() {
  const { t } = useI18n()
  const query = fixtureQuery("status-distribution")
  const result = computeWorkflowMetric(query, input)
  const [selection, setSelection] = useState<DrilldownSelection | null>(null)
  return (
    <>
      <StatisticalChart
        widgetId="drilldown"
        kind="bar"
        query={query}
        result={result}
        title={t("analytics.status-distribution")}
        description={t("analytics.local")}
        onDrilldown={setSelection}
      />
      <ChartDrilldownPanel
        selection={selection}
        onClose={() => setSelection(null)}
        definition={t("analytics.statusDefinition")}
        response={
          selection
            ? {
                ...selection,
                records: (selection.entityRefs ?? []).map((ref) => ({
                  entityRef: ref,
                  title: fixtureMemberMap.get(analyticsEntityKey(ref))!.title,
                })),
              }
            : undefined
        }
      />
    </>
  )
}
export function WorkflowMetricDemo() {
  const { t } = useI18n()
  return (
    <WorkflowMetric
      id="scope"
      label={t("analytics.total")}
      value={7}
      definition={t("analytics.statusDefinition")}
      baseline={{ value: 0, label: "2026-09" }}
    />
  )
}
export function RiskEvidenceDemo() {
  return (
    <RiskEvidenceList
      evidence={workflowRiskEvidence(currentItems, asOf, "Asia/Shanghai")}
    />
  )
}
export function WorkTraceabilityDemo() {
  return <WorkTraceabilityView relations={relations} />
}
export function ProjectOverviewDemo() {
  return (
    <ProjectOverviewDashboard
      widgets={(
        [
          "status-distribution",
          "completion-trend",
          "work-item-aging",
          "blocker-distribution",
        ] as const
      ).map((id) => ({
        id,
        query: fixtureQuery(id),
        result: computeWorkflowMetric(fixtureQuery(id), input),
      }))}
      riskEvidence={workflowRiskEvidence(currentItems, asOf, "Asia/Shanghai")}
    />
  )
}
export function AnalyticsModelDemo() {
  const query = fixtureQuery("status-distribution")
  return (
    <pre className="overflow-auto text-xs">
      {JSON.stringify(computeWorkflowMetric(query, input), null, 2)}
    </pre>
  )
}
