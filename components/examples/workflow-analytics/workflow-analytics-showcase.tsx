"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { LayoutDashboard, Network, ChartColumn, Bot, Users, TrendingUp, Workflow, ShieldAlert, LayoutGrid, SlidersHorizontal } from "lucide-react"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataTable } from "@/components/blocks/data-table"
import { Button } from "@/components/ui/button"
import { ButtonTooltip } from "@/components/ui/button-tooltip"
import { NativeSelect } from "@/components/ui/native-select"
import { DataRegion } from "@/components/ui/data-region"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet"
import {
  DashboardShell,
  DashboardHeader,
  DashboardGrid,
  DashboardWidget,
} from "@/components/blocks/dashboard/dashboard"
import { DashboardLayoutEditor } from "@/components/blocks/dashboard/dashboard-layout-editor"
import { WorkflowMetric } from "@/components/blocks/analytics/workflow-metric"
import {
  StatusDistribution,
  CompletionTrend,
  WorkItemAging,
  BlockerDistribution,
} from "@/components/blocks/analytics/workflow-charts"
import {
  BurndownChart,
  BurnupChart,
  VelocityChart,
  CumulativeFlowChart,
  CycleTimeChart,
  StateResidenceChart,
  AgentCostTrend,
  WorkloadChart,
} from "@/components/blocks/charts/workflow-history-charts"
import { ForecastChart } from "@/components/blocks/charts/forecast-chart"
import { ChartDataTable } from "@/components/blocks/charts/chart-data-table"
import { StatisticalChart } from "@/components/blocks/charts/statistical-chart"
import { ChartDrilldownPanel } from "@/components/blocks/charts/chart-drilldown-panel"
import { RiskEvidenceList } from "@/components/blocks/analytics/risk-evidence-list"
import {
  WorkTraceabilityView,
  analyticsRelationsFor,
} from "@/components/blocks/analytics/work-traceability-view"
import { ResourceAllocationView } from "@/components/blocks/analytics/resource-allocation-view"
import { AgentOperationsDashboard } from "@/components/blocks/analytics/agent-operations-dashboard"
import { WorkDependencyView } from "@/components/blocks/analytics/work-dependency-view"
import { AnalyticsBuilder } from "@/components/blocks/analytics/analytics-builder"
import { useI18n } from "@/lib/i18n-provider"
import type { MessageKey } from "@/lib/i18n-core"
import {
  analyticsEntityKey,
  type AnalyticsEntityRef,
  type AnalyticsQuery,
  type AnalyticsResult,
  type DrilldownSelection,
} from "@/lib/analytics-model"
import {
  analyticsQueryKey,
  analyticsCsv,
  matchesAnalyticsFilters,
} from "@/lib/analytics-query"
import { analyticsSvgExport } from "@/lib/analytics-image-export"
import { analyticsBucketId } from "@/lib/analytics-history"
import { computeWorkload } from "@/lib/analytics-resource-model"
import { computeUsageTrend } from "@/lib/analytics-usage-model"
import { sampleThroughputForecast } from "@/lib/analytics-forecast-model"
import { workflowRiskEvidence } from "@/lib/analytics-metrics"
import { DashboardEditSession } from "@/lib/dashboard-edit-session"
import {
  analyticsBuilderKey,
  type AnalyticsBuilderDraft,
} from "@/lib/analytics-builder-model"
import {
  parseShowcaseUrl,
  serializeShowcaseUrl,
  views,
  chartIds,
  type ShowcaseUrl,
} from "./url-state"
import {
  showcaseQuery,
  fixtureAggregate,
  fixtureSnapshotId,
  FixtureAnalyticsService,
  builderMetrics,
  builderAggregate,
  throughput,
  scenarios,
  type FixtureScenario,
} from "./query-adapter"
import { SnapshotWorkspace } from "./snapshot-workspace"
import * as fixture from "./fixtures/extended"
import styles from "./workflow-analytics-showcase.module.css"
const viewIcons = {
  overview: LayoutDashboard,
  traceability: Network,
  charts: ChartColumn,
  agents: Bot,
  resources: Users,
  delivery: TrendingUp,
  flow: Workflow,
  risk: ShieldAlert,
  custom: LayoutGrid,
  builder: SlidersHorizontal,
}
const chartComponents = {
  "status-distribution": StatusDistribution,
  "completion-trend": CompletionTrend,
  "work-item-aging": WorkItemAging,
  "blocker-distribution": BlockerDistribution,
  "state-residence": StateResidenceChart,
  burndown: BurndownChart,
  burnup: BurnupChart,
  velocity: VelocityChart,
  "cumulative-flow": CumulativeFlowChart,
  "cycle-time": CycleTimeChart,
}
function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type })),
    link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
function sessions() {
  return new Map(
    ["alpha", "beta", "empty"].map((project) => {
      let outcome: "confirmed" | "rejected" | "unknown" = "confirmed",
        counter = 0
      const state = parseShowcaseUrl(new URLSearchParams({ project }))
      const definition = {
        schemaVersion: 1 as const,
        id: `dashboard-${project}`,
        revision: 0,
        templateId: "overview-copy",
        globalFilters: [],
        widgets: ["completion-trend", "status-distribution"].map((id, i) => ({
          id: `custom-${i}`,
          templateId: id,
          query: showcaseQuery(state, id),
          width: 6 as const,
          height: 240 as const,
        })),
      }
      const session = new DashboardEditSession(
        definition,
        {
          save: async (intent) => ({
            operationId: intent.operationId,
            outcome,
            definition:
              outcome === "confirmed"
                ? { ...intent.definition, revision: intent.baseRevision + 1 }
                : undefined,
          }),
          reconcile: async (intent) => ({
            operationId: intent.operationId,
            outcome: "confirmed",
            definition: {
              ...intent.definition,
              revision: intent.baseRevision + 1,
            },
          }),
        },
        () => `fixture-save-${project}-${++counter}`,
      )
      return [
        project,
        {
          session,
          setOutcome: (v: typeof outcome) => {
            outcome = v
          },
        },
      ]
    }),
  )
}
export function WorkflowAnalyticsShowcase() {
  const params = useSearchParams(),
    url = parseShowcaseUrl(new URLSearchParams(params.toString())),
    { t, locale, setLocale } = useI18n(),
    { resolvedTheme, setTheme } = useTheme()
  const [scenario, setScenario] = useState<FixtureScenario>("success"),
    [revision, setRevision] = useState(0),
    [values, setValues] = useState(fixture.items),
    [service] = useState(() => new FixtureAnalyticsService()),
    [layoutSessions] = useState(sessions),
    [saveMode, setSaveMode] = useState("confirmed"),
    [tab, setTab] = useState("preview"),
    [showPreview, setShowPreview] = useState(false),
    [viewSelection, setViewSelection] = useState<DrilldownSelection | null>(
      null,
    ),
    [temporary, setTemporary] = useState<DrilldownSelection | null>(null),
    [pageSize, setPageSize] = useState(20)
  const [response, setResponse] = useState<{
      key: string
      result: AnalyticsResult
      revision: number
    } | null>(null),
    [failure, setFailure] = useState<{ key: string; revision: number } | null>(
      null,
    )
  const key = analyticsQueryKey(
      showcaseQuery(url, "status-distribution", values),
    ),
    primary = JSON.parse(key) as AnalyticsQuery,
    activeResponse =
      response?.key === key && response.result.snapshotId === fixtureSnapshotId(values)
        ? response
        : null,
    denied = scenario === "denied",
    detailDenied = denied || scenario === "detail-denied"
  useEffect(() => {
    let cancelled = false
    service
      .read(JSON.parse(key) as AnalyticsQuery, scenario, values)
      .then((result) => {
        if (!cancelled) {
          setResponse({ key, result, revision })
          setFailure(null)
        }
      })
      .catch(() => {
        if (!cancelled) setFailure({ key, revision })
      })
    return () => {
      cancelled = true
    }
  }, [key, scenario, revision, values, service]) // query identity includes all range/scope/filter inputs
  function navigate(patch: Partial<ShowcaseUrl>, clear = false) {
    const next = {
      ...url,
      ...(clear
        ? { widget: "", series: "", bucketId: "", entity: "", filter: "" }
        : {}),
      ...patch,
    }
    window.history.pushState(null, "", `?${serializeShowcaseUrl(next)}`)
    setTemporary(null)
    setViewSelection(null)
    setPageSize(20)
  }
  function openEntity(ref: AnalyticsEntityRef) {
    if (detailDenied) return
    navigate({ entity: `${ref.kind}:${ref.entityId}` })
  }
  function openSelection(s: DrilldownSelection) {
    if (detailDenied) return
    setTemporary(s)
    window.history.pushState(
      null,
      "",
      `?${serializeShowcaseUrl({ ...url, widget: s.widgetId, series: s.seriesId, bucketId: s.bucketId, entity: "" })}`,
    )
    setPageSize(20)
  }
  const snapshotId = fixtureSnapshotId(values)
  const authorized = values.filter(
    (i) =>
      i.inScope &&
      i.category !== "cancelled" &&
      i.entityRef.projectId === url.project &&
      matchesAnalyticsFilters(i, primary.filters),
  )
  const visible = scenario === "zero" ? [] : authorized
  const aggregate = (id: string) =>
    fixtureAggregate(showcaseQuery(url, id, values), scenario, values)
  const visibleIds = new Set(visible.map((i) => i.entityRef.entityId)),
    scopedRuns = fixture.runs.filter(
      (r) =>
        url.project === "alpha" &&
        r.workItemRef &&
        visibleIds.has(r.workItemRef.id),
    ),
    scopedRunIds = new Set(scopedRuns.map((r) => r.runId))
  const cells = computeWorkload(
    fixture.allocationsOf(visible),
    fixture.capacities,
    "hours",
  )
  const forecastGeneratedAt =
    scenario === "forecast-stale" ? fixture.day(87) : fixture.asOf
  const historical = throughput(
      url.project,
      visible,
      url.tz,
      forecastGeneratedAt,
    ),
    forecast = sampleThroughputForecast({
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
      throughput:
        scenario === "forecast-insufficient"
          ? historical.values.slice(-5)
          : historical.values,
      remaining: visible
        .filter((i) => i.category !== "completed")
        .map((i) => i.entityRef),
      historicalMembers: historical.members,
      generatedAt: forecastGeneratedAt,
      asOf: fixture.asOf,
      historicalWindow: historical.window,
      snapshotId: snapshotId,
      timeZone: url.tz,
      calendarVersion: "calendar-days-v1",
      scopeId: primary.scope.id,
      scopeStable:
        historical.scopeStable &&
        scenario !== "partial" &&
        scenario !== "scope-change",
      historyComplete: scenario !== "no-history",
    })
  const initialDraft = (): AnalyticsBuilderDraft => ({
    query: {
      ...primary,
      measureId: "count",
      dimension: "assigneeIds",
      segment: "category",
      timeField: "asOf",
    },
    chart: "bar",
    unit: "items",
    stacked: true,
  })
  const [draft, setDraft] = useState<AnalyticsBuilderDraft>(initialDraft),
    [preview, setPreview] = useState<{
      configurationKey: string
      result: AnalyticsResult
    }>(),
    [applied, setApplied] = useState<{
      draft: AnalyticsBuilderDraft
      result: AnalyticsResult
    }>()
  const builderDraft = {
    ...draft,
    query: {
      ...draft.query,
      source: primary.source,
      scope: primary.scope,
      range: primary.range,
      bucket: primary.bucket,
      timeZone: primary.timeZone,
      filters: primary.filters,
    },
  }
  const currentPreview =
    preview?.result.queryKey === analyticsQueryKey(builderDraft.query)
      ? preview
      : undefined
  const localSession = layoutSessions.get(url.project)!
  function arbitrarySelection(
    widgetId: string,
    refs: readonly AnalyticsEntityRef[],
    membership: "snapshot" | "historical" = "snapshot",
  ): DrilldownSelection {
    return {
      queryKey: key,
      snapshotId: snapshotId,
      widgetId,
      seriesId: widgetId,
      bucketId: widgetId,
      targetKind: refs[0]?.kind ?? "workItem",
      predicate: [],
      entityRefs: refs,
      totalCount: refs.length,
      membership,
    }
  }
  const reconstructed = (() => {
    if (!url.widget || !url.bucketId) return null
    if (url.widget.startsWith("kpi-")) {
      const mode = url.widget.slice(4),
        members = visible.filter((i) =>
          mode === "all" || mode === "blocked"
            ? mode === "all" ||
              (i.blockers.length > 0 && i.category !== "completed")
            : i.category === mode,
        )
      return arbitrarySelection(
        url.widget,
        members.map((i) => i.entityRef),
      )
    }
    if (
      url.widget === "forecast-history" ||
      url.widget === "forecast-remaining"
    )
      return arbitrarySelection(
        url.widget,
        url.widget === "forecast-history"
          ? forecast.historicalMembers
          : forecast.remaining,
        url.widget === "forecast-history" ? "historical" : "snapshot",
      )
    if (url.widget === "workload") {
      const c = cells.find((c) => c.id === url.bucketId)
      return c
        ? {
            ...arbitrarySelection(
              "workload",
              c.allocations.map((a) => a.entityRef),
            ),
            seriesId: "allocated",
            bucketId: c.id,
          }
        : null
    }
    if (url.widget.startsWith("cost-")) {
      const q = {
        ...primary,
        measureId: "agent-cost",
        dimension: "time",
        range: { from: "2026-10-08T00:00:00Z", to: fixture.asOf },
      }
      const result = computeUsageTrend(q, {
        observations: fixture.observations,
        runs: scopedRuns,
        metric: "cost",
        currency: url.widget.slice(5),
        snapshotId,
        asOf: fixture.asOf,
      })
      const p = result.series
        .find((s) => s.id === url.series)
        ?.points.find((p) => p.bucketId === url.bucketId)
      return p?.drilldown ? { ...p.drilldown, widgetId: url.widget } : null
    }
    if (url.widget.startsWith("builder-")) {
      const r =
        url.widget === "builder-preview"
          ? currentPreview?.result
          : applied?.result
      const p = r?.series
        .find((s) => s.id === url.series)
        ?.points.find((p) => p.bucketId === url.bucketId)
      return p?.drilldown ? { ...p.drilldown, widgetId: url.widget } : null
    }
    const id = chartIds.includes(url.widget as (typeof chartIds)[number])
        ? url.widget
        : layoutSessions
            .get(url.project)
            ?.session.getSnapshot()
            .draft.widgets.find((w) => w.id === url.widget)?.templateId,
      r = id ? aggregate(id) : null,
      point = r?.series
        .find((s) => s.id === url.series)
        ?.points.find((p) => p.bucketId === url.bucketId)
    return point?.drilldown
      ? { ...point.drilldown, widgetId: url.widget }
      : null
  })()
  const selection = detailDenied
    ? null
    : temporary?.widgetId === url.widget && temporary.bucketId === url.bucketId
      ? temporary
      : reconstructed
  const scopeChanges =
    selection?.widgetId === "burnup" && selection.seriesId === "scope"
      ? fixture.history.events.filter(
          (event) =>
            ["scope", "estimate"].includes(event.kind) &&
            event.entityRef.projectId === url.project &&
            analyticsBucketId(event.occurredAt, url.bucket, url.tz) === selection.bucketId &&
            Date.parse(event.occurredAt) >= Date.parse(primary.range.from) &&
            Date.parse(event.occurredAt) < Date.parse(primary.range.to) &&
            values.some((item) =>
              analyticsEntityKey(item.entityRef) === analyticsEntityKey(event.entityRef) &&
              matchesAnalyticsFilters(item, primary.filters),
            ),
        )
      : []
  const members = (selection?.entityRefs ?? [])
    .filter((r) => r.projectId === url.project)
    .map((r) => {
      const item = values.find(
          (i) => analyticsEntityKey(i.entityRef) === analyticsEntityKey(r),
        ),
        run = fixture.runs.find((i) => i.runId === r.entityId)
      return {
        entityRef: r,
        title: item?.title ?? run?.title ?? r.entityId,
        currentState: item?.stateId ?? run?.runtimeStatus,
      }
    })
  const entity = url.entity
      ? fixture.ref(
          url.entity.slice(url.entity.indexOf(":") + 1),
          url.project,
          url.entity.split(":")[0] as AnalyticsEntityRef["kind"],
        )
      : null,
    detail = entity
      ? values.find(
          (i) => analyticsEntityKey(i.entityRef) === analyticsEntityKey(entity),
        )
      : null
  const runDetail =
    entity?.kind === "run" && url.project === "alpha"
      ? fixture.runs.find((r) => r.runId === entity.entityId)
      : null
  const chart = (id: string, widgetId = id, height: 240 | 320 | 400 = 240) => {
    const Component = chartComponents[id as keyof typeof chartComponents],
      q = showcaseQuery(url, id, values),
      result =
        id === "status-distribution"
          ? (activeResponse?.result ?? null)
          : activeResponse
            ? aggregate(id)
            : null
    return Component ? (
      <Component
        widgetId={widgetId}
        query={q}
        result={result}
        height={height}
        access={denied ? "denied" : "allowed"}
        onDrilldown={openSelection}
        onExportImage={
          result && !denied
            ? (svg) =>
                download(
                  analyticsSvgExport(svg, {
                    query: q,
                    result,
                    title: t(`analytics.${id}` as MessageKey),
                    fixtureLabel: t("analytics.local"),
                  }),
                  `${id}.svg`,
                  "image/svg+xml",
                )
            : undefined
        }
        selection={
          url.widget === widgetId
            ? { seriesId: url.series, bucketId: url.bucketId }
            : null
        }
        actions={
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={!result || denied}
              onClick={() =>
                result &&
                download(analyticsCsv(q, result), `${id}.csv`, "text/csv")
              }
            >
              {t("analytics.export")}
            </Button>
          </>
        }
      />
    ) : null
  }
  const kpi = (id: string, label: string, items: typeof visible) => (
    <WorkflowMetric
      key={id}
      id={id}
      label={label}
      value={activeResponse ? items.length : null}
      partial={scenario === "partial"}
      definition={t("analytics.statusDefinition")}
      onDrilldown={() =>
        openSelection(
          arbitrarySelection(
            `kpi-${id}`,
            items.map((i) => i.entityRef),
          ),
        )
      }
    />
  )
  const picker = (
    label: string,
    value: string,
    options: readonly string[],
    change: (value: string) => void,
    emptyLabel = t("agentBoard.all"),
  ) => (
    <label className={styles.filter}>
      {label}
      <NativeSelect
        aria-label={label}
        value={value}
        onChange={(e) => change(e.target.value)}
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {v || emptyLabel}
          </option>
        ))}
      </NativeSelect>
    </label>
  )
  if (viewSelection && !detailDenied) {
    const ids = new Set(viewSelection.entityRefs?.map(analyticsEntityKey))
    return (
      <SnapshotWorkspace
        selection={viewSelection}
        initialLayout={
          viewSelection.widgetId === "resource" ? "timeline" : "list"
        }
        items={fixture.recordsOf(
          values.filter((i) => ids.has(analyticsEntityKey(i.entityRef))),
        )}
        onBack={() => setViewSelection(null)}
        onDateChange={(id, start, due) => {
          setValues((old) =>
            old.map((i) =>
              i.entityRef.entityId === id
                ? {
                    ...i,
                    plannedStartDate: start,
                    plannedDueDate: due,
                    revision: i.revision + 1,
                  }
                : i,
            ),
          )
          setRevision((v) => v + 1)
        }}
      />
    )
  }
  return (
    <div
      id="main-content"
      className={styles.page}
      data-workflow-analytics
      data-showcase-view={url.view}
    >
      <DashboardShell
        header={
          <DashboardHeader
            title={t("analytics.showcase")}
            description={t("analytics.local")}
            actions={
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}
                >
                  {locale === "en" ? "中文" : "English"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {locale === "en" ? "Theme" : "主题"}
                </Button>
              </>
            }
          />
        }
        sidebar={
          <nav className={styles.nav} aria-label={t("analytics.showcase")}>
            {views.map((view) => {
              const Icon = viewIcons[view]
              return (
                <ButtonTooltip key={view} label={t(`analytics.view.${view}`)}>
              <Button
                variant="ghost"
                aria-label={t(`analytics.view.${view}`)}
                aria-current={view === url.view ? "page" : undefined}
                onClick={() =>
                  navigate({
                    view,
                    widget: "",
                    series: "",
                    bucketId: "",
                    entity: "",
                  })
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span className={styles.navLabel}>{t(`analytics.view.${view}`)}</span>
              </Button>
                </ButtonTooltip>
              )
            })}
          </nav>
        }
        toolbar={
          <div className={styles.filters}>
            {picker(
              t("analytics.project"),
              url.project,
              ["alpha", "beta", "empty"],
              (project) => navigate({ project }, true),
            )}
            {picker(
              t("analytics.cohortTime"),
              url.timeField,
              ["asOf", "createdAt", "completedAt"],
              (timeField) =>
                navigate(
                  { timeField: timeField as ShowcaseUrl["timeField"] },
                  true,
                ),
            )}
            {picker(
              t("analytics.range"),
              url.range,
              ["8d", "30d", "90d"],
              (range) =>
                navigate({ range: range as ShowcaseUrl["range"] }, true),
            )}
            {picker(
              t("analytics.bucket"),
              url.bucket,
              ["day", "week", "month"],
              (bucket) =>
                navigate({ bucket: bucket as ShowcaseUrl["bucket"] }, true),
            )}
            {picker(
              t("analytics.timeZone"),
              url.tz,
              ["Asia/Shanghai", "UTC", "America/New_York"],
              (tz) => navigate({ tz }, true),
            )}
            {picker(
              t("analytics.member"),
              url.member,
              ["", "lin", "maya", "noah", "aria", "unmatched"],
              (member) => navigate({ member }, true),
              t("analytics.all"),
            )}
            {picker(
              t("analytics.currentState"),
              url.status,
              ["", "backlog", "active", "completed"],
              (status) => navigate({ status }, true),
            )}
            <Button
              variant="secondary"
              onClick={() => setRevision((v) => v + 1)}
            >
              {t("analytics.refresh")}
            </Button>
            {url.filter && (
              <Button
                variant="ghost"
                onClick={() =>
                  navigate({ filter: "", widget: "", series: "", bucketId: "" })
                }
              >
                {t("analytics.clearFilter")}
              </Button>
            )}
          </div>
        }
      >
        {url.notice && <p role="status">{t("analytics.urlFallback")}</p>}
        <p className={styles.meta}>
          {t("analytics.cohortDefinition")} · {t("analytics.updated")}:{" "}
          {fixture.asOf} · {snapshotId}
        </p>
        <details className={styles.scenarios}>
          <summary>{t("analytics.scenarios")}</summary>
          <p>{t("analytics.fixtureDefinition")}</p>
          {picker(t("analytics.scenarios"), scenario, scenarios, (s) => {
            setScenario(s as FixtureScenario)
            setTemporary(null)
          })}
          <Button
            variant="ghost"
            onClick={() => {
              setValues(fixture.items)
              setScenario("success")
              navigate(
                {
                  view: "overview",
                  project: "alpha",
                  range: "30d",
                  timeField: "asOf",
                  bucket: "day",
                  tz: "Asia/Shanghai",
                  member: "",
                  status: "",
                },
                true,
              )
            }}
          >
            {t("analytics.reset")}
          </Button>
          <Link href="/docs/analytics-model/">
            {t("analytics.componentDocs")}
          </Link>
        </details>
        <DataRegion
          state={
            denied
              ? "error"
              : failure?.key === key && failure.revision === revision
                ? "error"
                : !activeResponse
                  ? "loading"
                  : scenario === "partial"
                    ? "partial"
                    : visible.length
                      ? "success"
                      : "empty"
          }
          hasContent={!denied && !!activeResponse}
          refreshing={!denied && activeResponse?.revision !== revision}
          updatedAt={activeResponse?.result.asOf}
          emptyTitle={
            url.project === "empty"
              ? t("analytics.emptyProject")
              : t("analytics.emptyFilter")
          }
          emptyDescription={t("analytics.filterRecovery")}
          error={{
            category: denied ? "permission" : "network",
            message: denied
              ? t("analytics.noAccess")
              : t("analytics.readError"),
            reason: t("analytics.readReason"),
          }}
          onRetry={() => {
            setScenario("success")
            setRevision((v) => v + 1)
          }}
        >
          {!denied && activeResponse && (
            <>
              {url.view === "overview" && (
                <>
                  <div className={styles.metrics}>
                    {kpi("all", t("analytics.total"), visible)}
                    {kpi(
                      "completed",
                      t("analytics.completed"),
                      visible.filter((i) => i.category === "completed"),
                    )}
                    {kpi(
                      "active",
                      t("analytics.active"),
                      visible.filter((i) => i.category === "active"),
                    )}
                    {kpi(
                      "blocked",
                      t("analytics.blocked"),
                      visible.filter(
                        (i) =>
                          i.blockers.length > 0 && i.category !== "completed",
                      ),
                    )}
                  </div>
                  <DashboardGrid>
                    <DashboardWidget
                      id="overview-trend"
                      title={t("analytics.completion-trend")}
                      width={8}
                    >
                      {chart("completion-trend")}
                    </DashboardWidget>
                    <DashboardWidget
                      id="overview-status"
                      title={t("analytics.status-distribution")}
                      width={4}
                    >
                      {chart("status-distribution")}
                    </DashboardWidget>
                  </DashboardGrid>
                  <RiskEvidenceList
                    evidence={workflowRiskEvidence(
                      visible,
                      fixture.asOf,
                      url.tz,
                    ).slice(0, 12)}
                    onOpenEntity={openEntity}
                  />
                </>
              )}
              {url.view === "traceability" && (
                <>
                  <p>{t("analytics.orphanDefinition")}</p>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      openEntity(fixture.ref("IDEA-1", url.project, "idea"))
                    }
                  >
                    IDEA-1
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      openEntity(
                        fixture.ref("IDEA-ORPHAN", url.project, "idea"),
                      )
                    }
                  >
                    IDEA-ORPHAN
                  </Button>
                  <WorkTraceabilityView
                    relations={analyticsRelationsFor(
                      fixture.relations,
                      entity ?? fixture.ref("IDEA-1", url.project, "idea"),
                    )}
                    onSelectEntity={openEntity}
                  />
                </>
              )}
              {url.view === "charts" && (
                <>
                  <h2>{t("analytics.chartDirectory")}</h2>
                  <div className={styles.directory}>
                    {chartIds.map((id) => (
                      <Button
                        key={id}
                        variant={url.chart === id ? "secondary" : "ghost"}
                        onClick={() => {
                          navigate({
                            chart: id,
                            widget: "",
                            series: "",
                            bucketId: "",
                          })
                          setShowPreview(false)
                        }}
                      >
                        {t(`analytics.${id}` as MessageKey)}
                      </Button>
                    ))}
                  </div>
                  <div className={styles.tabs}>
                    {[
                      "preview",
                      "table",
                      "definition",
                      "usage",
                      "scenarios",
                    ].map((mode) => (
                      <Button
                        key={mode}
                        variant="ghost"
                        aria-pressed={tab === mode}
                        onClick={() => setTab(mode)}
                      >
                        {t(`analytics.tab.${mode}` as MessageKey)}
                      </Button>
                    ))}
                  </div>
                  {tab === "preview" &&
                    (showPreview ? (
                      chart(url.chart)
                    ) : (
                      <Button onClick={() => setShowPreview(true)}>
                        {t("analytics.loadPreview")}
                      </Button>
                    ))}
                  {tab === "table" && (
                    <ChartDataTable
                      result={aggregate(url.chart)}
                      onSelect={(d) =>
                        d.point.drilldown &&
                        openSelection({
                          ...d.point.drilldown,
                          widgetId: url.chart,
                        })
                      }
                    />
                  )}
                  {tab === "definition" && (
                    <>
                      <p>
                        {t(
                          `analytics.${url.chart === "status-distribution" ? "status" : url.chart === "completion-trend" ? "trend" : url.chart === "work-item-aging" ? "age" : url.chart === "blocker-distribution" ? "blocker" : url.chart}Definition` as MessageKey,
                        )}
                      </p>
                      <pre className={styles.code}>
                        {JSON.stringify(
                          showcaseQuery(url, url.chart, values),
                          null,
                          2,
                        )}
                      </pre>
                    </>
                  )}
                  {tab === "usage" && (
                    <pre
                      className={styles.code}
                    >{`<Chart query={query} result={result}\n  onDrilldown={onDrilldown} />\n// ${t("analytics.callerAuthority")}`}</pre>
                  )}
                  {tab === "scenarios" && (
                    <p>{t("analytics.scenarioInstructions")}</p>
                  )}
                </>
              )}
              {url.view === "agents" && (
                <AgentOperationsDashboard
                  intervals={fixture.intervals.filter((r) =>
                    scopedRunIds.has(r.id),
                  )}
                  runs={scopedRuns}
                  observations={fixture.observations.filter((o) =>
                    scopedRunIds.has(o.runId),
                  )}
                  range={{ from: "2026-10-08T07:00:00Z", to: fixture.asOf }}
                  onOpenRun={(run) => openEntity(run.entityRef)}
                >
                  {["USD", "EUR"].map((currency) => {
                    const q = {
                      ...primary,
                      measureId: "agent-cost",
                      dimension: "time",
                      range: { from: "2026-10-08T00:00:00Z", to: fixture.asOf },
                    }
                    return (
                      <AgentCostTrend
                        key={currency}
                        widgetId={`cost-${currency}`}
                        query={q}
                        result={computeUsageTrend(q, {
                          observations: fixture.observations,
                          runs: scopedRuns,
                          metric: "cost",
                          currency,
                          snapshotId: snapshotId,
                          asOf: fixture.asOf,
                        })}
                        onDrilldown={openSelection}
                      />
                    )
                  })}
                </AgentOperationsDashboard>
              )}
              {url.view === "resources" && (
                <>
                  <ResourceAllocationView
                    cells={cells}
                    selection={
                      cells.find(
                        (c) =>
                          c.resourceId === url.series &&
                          c.bucketId === url.bucketId,
                      ) ?? null
                    }
                    onSelectionChange={(cell) =>
                      navigate({
                        widget: "resource",
                        series: cell.resourceId,
                        bucketId: cell.bucketId,
                      })
                    }
                    onOpenEntity={(a) => openEntity(a.entityRef)}
                    onOpenTimeline={(cell) => {
                      const s = arbitrarySelection(
                        "resource",
                        cell.allocations.map((a) => a.entityRef),
                      )
                      setViewSelection(s)
                    }}
                  />
                  <WorkloadChart
                    widgetId="workload"
                    query={{
                      ...primary,
                      measureId: "workload",
                      dimension: "resource-date",
                    }}
                    result={{
                      queryKey: analyticsQueryKey({
                        ...primary,
                        measureId: "workload",
                        dimension: "resource-date",
                      }),
                      snapshotId: snapshotId,
                      asOf: fixture.asOf,
                      computedAt: fixture.asOf,
                      unit: "hours",
                      coverage: null,
                      total: null,
                      limitations: cells.some((c) => c.allocated === null)
                        ? ["analytics.missingEstimate"]
                        : [],
                      completeness: cells.some((c) => c.allocated === null)
                        ? "partial"
                        : "complete",
                      series: [
                        {
                          id: "allocated",
                          label: t("analytics.allocations"),
                          color: "1",
                          points: cells.map((c) => ({
                            bucketId: c.id,
                            label: `${c.resourceId} · ${c.bucketId}`,
                            value: c.allocated,
                            drilldown: {
                              ...arbitrarySelection(
                                "workload",
                                c.allocations.map((a) => a.entityRef),
                              ),
                              seriesId: "allocated",
                              bucketId: c.id,
                            },
                          })),
                        },
                      ],
                    }}
                    onDrilldown={openSelection}
                  />
                  <p>
                    {t("analytics.unplanned")}:{" "}
                    {visible.filter((i) => !i.plannedStartDate).length}
                  </p>
                </>
              )}
              {url.view === "delivery" && (
                <DashboardGrid>
                  {["burndown", "burnup", "velocity"].map((id) => (
                    <DashboardWidget
                      key={id}
                      id={`delivery-${id}`}
                      title={t(`analytics.${id}` as MessageKey)}
                    >
                      {chart(id)}
                    </DashboardWidget>
                  ))}
                </DashboardGrid>
              )}
              {url.view === "flow" && (
                <DashboardGrid>
                  {["cumulative-flow", "cycle-time", "state-residence"].map(
                    (id) => (
                      <DashboardWidget
                        key={id}
                        id={`flow-${id}`}
                        title={t(`analytics.${id}` as MessageKey)}
                      >
                        {chart(id)}
                      </DashboardWidget>
                    ),
                  )}
                </DashboardGrid>
              )}
              {url.view === "risk" && (
                <>
                  <RiskEvidenceList
                    evidence={workflowRiskEvidence(
                      visible,
                      fixture.asOf,
                      url.tz,
                    )}
                    onOpenEntity={openEntity}
                  />
                  <ForecastChart
                    result={forecast}
                    onOpenHistorical={(refs) =>
                      openSelection(
                        arbitrarySelection(
                          "forecast-history",
                          refs,
                          "historical",
                        ),
                      )
                    }
                    onOpenRemaining={(refs) =>
                      openSelection(
                        arbitrarySelection("forecast-remaining", refs),
                      )
                    }
                  />
                  <WorkDependencyView
                    dependencies={fixture.dependencies.filter(
                      (d) => d.from.projectId === url.project,
                    )}
                    onOpenEntity={openEntity}
                  />
                </>
              )}
              {url.view === "custom" && (
                <>
                  {picker(
                    t("analytics.saveScenario"),
                    saveMode,
                    ["confirmed", "rejected", "unknown"],
                    (mode) => {
                      setSaveMode(mode)
                      localSession.setOutcome(
                        mode as "confirmed" | "rejected" | "unknown",
                      )
                    },
                  )}
                  <DashboardLayoutEditor
                    session={localSession.session}
                    createWidgetId={() => `widget-${crypto.randomUUID()}`}
                    templates={chartIds.map((id) => ({
                      id,
                      label: t(`analytics.${id}` as MessageKey),
                      create: (widgetId) => ({
                        id: widgetId,
                        templateId: id,
                        query: showcaseQuery(url, id, values),
                        width: 6,
                        height: 240,
                      }),
                    }))}
                    renderWidget={(widget) =>
                      chart(widget.templateId, widget.id, widget.height)
                    }
                  />
                </>
              )}
              {url.view === "builder" && (
                <>
                  <AnalyticsBuilder
                    draft={builderDraft}
                    metrics={builderMetrics}
                    authority={primary}
                    onDraftChange={setDraft}
                    preview={currentPreview}
                    onPreview={(d) =>
                      setPreview({
                        configurationKey: analyticsBuilderKey(d),
                        result: builderAggregate(d, values),
                      })
                    }
                    onApply={(d, r) => setApplied({ draft: d, result: r })}
                    onCancel={() => {
                      setDraft(applied?.draft ?? initialDraft())
                      setPreview(undefined)
                    }}
                    onDrilldown={openSelection}
                  />
                  {applied &&
                    applied.result.queryKey ===
                      analyticsQueryKey({
                        ...applied.draft.query,
                        scope: primary.scope,
                        range: primary.range,
                        filters: primary.filters,
                      }) && (
                      <StatisticalChart
                        widgetId="builder-applied"
                        title={t("analytics.applied")}
                        description={t("analytics.builderAttribution")}
                        query={applied.draft.query}
                        result={applied.result}
                        kind={applied.draft.chart}
                        stacked={applied.draft.stacked}
                        onDrilldown={openSelection}
                      />
                    )}
                </>
              )}
            </>
          )}
        </DataRegion>
        <ChartDrilldownPanel
          selection={selection}
          onClose={() => navigate({ widget: "", series: "", bucketId: "" })}
          access={detailDenied ? "denied" : "allowed"}
          definition={
            <>
              {t("analytics.drilldownDefinition")}
              {scopeChanges.length > 0 && (
                <span data-scope-changes>
                  <br />
                  {t("analytics.source")} · {t("analytics.series.scope")} · {selection?.bucketId}: {" "}
                  {scopeChanges.map((event) => (
                    <span key={event.eventId}>
                      <Button size="sm" variant="ghost" onClick={() => openEntity(event.entityRef)}>
                        {event.entityRef.entityId} · {event.kind}
                      </Button>
                      <code>{JSON.stringify(event.after)}</code>{" "}
                    </span>
                  ))}
                </span>
              )}
            </>
          }
          response={
            selection
              ? {
                  ...selection,
                  records: members.slice(0, pageSize),
                  totalCount: members.length,
                }
              : undefined
          }
          onLoadMore={() => setPageSize((n) => n + 20)}
          onOpenEntity={openEntity}
          onOpenView={
            selection?.targetKind === "workItem"
              ? (s) => setViewSelection(s)
              : undefined
          }
          onApplyFilter={
            selection?.targetKind === "workItem"
              ? (s) =>
                  navigate({
                    filter:
                      (s.entityRefs ?? [])
                        .filter((r) => r.kind === "workItem")
                        .map((r) => r.entityId)
                        .join(",") || "__none__",
                    widget: "",
                    series: "",
                    bucketId: "",
                  })
              : undefined
          }
        />
        <Sheet
          open={!!entity && !detailDenied}
          onOpenChange={(open) => {
            if (!open) navigate({ entity: "" })
          }}
        >
          <SheetContent size={560}>
            <SheetHeader>
              <SheetTitle>{detail?.title ?? entity?.entityId}</SheetTitle>
              <SheetDescription>
                {entity?.kind} · {entity?.sourceId} · {entity?.projectId}
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              {detail ? (
                <>
                  <p>
                    {t("analytics.currentState")}: {detail.stateId}
                  </p>
                  <p>
                    {t("analytics.actualStart")}:{" "}
                    {detail.actualStartedAt ?? t("analytics.missing")}
                  </p>
                  <p>
                    {t("analytics.stateEntry")}:{" "}
                    {detail.lastStateEnteredAt ?? t("analytics.missing")}
                  </p>
                  <pre className={styles.code}>
                    {JSON.stringify(
                      fixture.history.events.filter(
                        (e) =>
                          e.entityRef.entityId === detail.entityRef.entityId,
                      ),
                      null,
                      2,
                    )}
                  </pre>
                </>
              ) : runDetail ? (
                <>
                  <RuntimeStatusBadge status={runDetail.runtimeStatus} />
                  <p>
                    {t("analytics.acceptance")}:{" "}
                    {t(`analytics.acceptance.${runDetail.review!.acceptance}`)}
                  </p>
                  <p>{runDetail.review?.evidence ?? t("analytics.missing")}</p>
                  <DataTable
                    rows={fixture.observations.filter(
                      (o) => o.runId === runDetail.runId,
                    )}
                    caption={t("analytics.source")}
                    getRowId={(o) => o.observationId}
                    getRowLabel={(o) => o.observationId}
                    columns={[
                      {
                        id: "id",
                        header: t("analytics.source"),
                        cell: (o) => o.observationId,
                      },
                      {
                        id: "tokens",
                        header: "Tokens",
                        cell: (o) => o.tokens ?? t("analytics.missing"),
                      },
                      {
                        id: "cost",
                        header: t("agentBoard.cost"),
                        cell: (o) => `${o.currency ?? "—"} ${o.cost ?? "—"}`,
                      },
                      {
                        id: "inclusion",
                        header: t("analytics.definition"),
                        cell: (o) => o.inclusion,
                      },
                    ]}
                  />
                </>
              ) : (
                <p>
                  {entity?.entityId === "ARTIFACT-REMOVED"
                    ? t("analytics.removedEntity")
                    : t("analytics.externalEntity")}
                </p>
              )}
              {entity && (
                <WorkTraceabilityView
                  relations={analyticsRelationsFor(fixture.relations, entity)}
                  onSelectEntity={openEntity}
                />
              )}
            </SheetBody>
          </SheetContent>
        </Sheet>
      </DashboardShell>
    </div>
  )
}
