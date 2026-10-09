"use client"
import { useState } from "react"
import { useTheme } from "next-themes"
import {
  DashboardShell,
  DashboardHeader,
  DashboardFilterBar,
  DashboardWidget,
} from "@/components/blocks/dashboard/dashboard"
import {
  ProjectOverviewDashboard,
  type ProjectOverviewWidget,
} from "@/components/blocks/dashboard/project-overview-dashboard"
import { ChartDrilldownPanel } from "@/components/blocks/charts/chart-drilldown-panel"
import { WorkTraceabilityView } from "@/components/blocks/analytics/work-traceability-view"
import { WorkItemsViewAdapter } from "@/components/blocks/analytics/work-items-view-adapter"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n-provider"
import {
  computeWorkflowMetric,
  workflowRiskEvidence,
} from "@/lib/analytics-metrics"
import { analyticsCsv, matchesAnalyticsFilters } from "@/lib/analytics-query"
import type {
  DrilldownSelection,
  AnalyticsEntityRef,
} from "@/lib/analytics-model"
import { analyticsEntityKey } from "@/lib/analytics-model"
import type { ChartSelection } from "@/lib/chart-model"
import { defaultWorkItemsView } from "@/lib/work-items-model"
import {
  calendarViewport,
  normalizeCalendar,
  timelineViewport,
  normalizeTimeline,
  scheduleIntersects,
} from "@/lib/schedule-view-model"
import { scheduleDates } from "@/lib/schedule-date-utils"
import { groupWorkItems } from "@/lib/work-items-view"
import {
  asOf,
  currentItems,
  history,
  fixtureQuery,
  catalog,
  workRecords,
  relations,
  fixtureMemberMap,
} from "./fixtures"

const ids = [
  "status-distribution",
  "completion-trend",
  "work-item-aging",
  "blocker-distribution",
] as const
export function WorkflowAnalyticsDemo() {
  const { t, locale, setLocale } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const [member, setMember] = useState("")
  const [project, setProject] = useState("alpha")
  const [scenario, setScenario] = useState("success")
  const [selection, setSelection] = useState<ChartSelection>(null)
  const [drilldown, setDrilldown] = useState<DrilldownSelection | null>(null)
  const [pageSize, setPageSize] = useState(2)
  const [pointIds, setPointIds] = useState<string[] | undefined>()
  const [viewSelection, setViewSelection] = useState<DrilldownSelection | null>(
    null,
  )
  const [view, setView] = useState(defaultWorkItemsView)
  const [activeEntity, setActiveEntity] = useState<AnalyticsEntityRef | null>(
    null,
  )
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [chosen, setChosen] = useState<string[]>([])
  const access = scenario === "denied" ? "denied" : "allowed"
  const input = {
    items: scenario === "empty" ? [] : currentItems,
    snapshotId: "fixture-snapshot-9",
    asOf,
    computedAt: asOf,
    completeness:
      scenario === "partial" ? ("partial" as const) : ("complete" as const),
    history:
      scenario === "no-history" || scenario === "empty" ? undefined : history,
  }
  const widgets: ProjectOverviewWidget[] = ids.map((id) => ({
    id,
    query: fixtureQuery(id, member, pointIds, project),
    result:
      scenario === "loading"
        ? null
        : {
            ...computeWorkflowMetric(
              fixtureQuery(id, member, pointIds, project),
              input,
            ),
            ...(scenario === "late-response"
              ? { queryKey: "previous-scope" }
              : {}),
          },
    data:
      scenario === "error"
        ? {
            state: "error",
            error: {
              category: "network",
              message: t("analytics.readError"),
              reason: t("analytics.readReason"),
            },
            onRetry: () => setScenario("success"),
          }
        : undefined,
  }))
  function resetScope() {
    setDrilldown(null)
    setViewSelection(null)
    setActiveEntity(null)
    setPointIds(undefined)
    setSelection(null)
  }
  function openDrilldown(next: DrilldownSelection) {
    setDrilldown(next)
    setPageSize(2)
  }
  const authorizedItems = input.items.filter(
    (item) =>
      item.entityRef.projectId === project &&
      matchesAnalyticsFilters(
        item,
        fixtureQuery("status-distribution", member, pointIds, project).filters,
      ),
  )
  const members =
    access === "allowed"
      ? (drilldown?.entityRefs ?? []).flatMap((ref) => {
          const item = fixtureMemberMap.get(analyticsEntityKey(ref))
          return item && ref.projectId === project
            ? [
                {
                  entityRef: ref,
                  title: item.title,
                  currentState: item.stateId,
                },
              ]
            : []
        })
      : []
  const viewIds = new Set(
    viewSelection?.entityRefs?.map((ref) => analyticsEntityKey(ref)) ?? [],
  )
  const viewItems = workRecords.filter((item) =>
    viewIds.has(
      analyticsEntityKey({
        sourceId: "fixture",
        projectId: item.projectId,
        kind: "workItem",
        entityId: item.id,
      }),
    ),
  )
  const timelineRange = timelineViewport(normalizeTimeline(view.timeline))
  const calendarRange = calendarViewport(normalizeCalendar(view.calendar))
  const rangeIds = viewItems
    .filter((item) => scheduleIntersects(item, timelineRange))
    .map((item) => item.id)
  const buckets = scheduleDates(
    calendarRange.rangeStart,
    calendarRange.rangeEnd,
  ).map((date) => {
    const itemIds = viewItems
      .filter((item) => item.dueDate === date)
      .map((item) => item.id)
    return {
      date,
      queryKey: viewSelection?.queryKey ?? "",
      itemIds,
      loadedCount: itemIds.length,
      totalCount: itemIds.length,
      dataState: itemIds.length ? ("success" as const) : ("empty" as const),
    }
  })
  const unscheduledIds = viewItems
    .filter((item) => !item.dueDate)
    .map((item) => item.id)
  const present = () => ({
    catalog,
    visibleProperties: view.visibleProperties,
    capabilities: {
      canCreate: false,
      canMove: () => false,
      canEditField: () => false,
    },
    onOpen: (item: { id: string }) => setActiveItem(item.id),
  })
  if (viewSelection && access === "allowed")
    return (
      <div className="h-dvh">
        <Button
          className="m-2"
          variant="secondary"
          onClick={() => setViewSelection(null)}
        >
          {locale === "en" ? "Back to analytics" : "返回分析"}
        </Button>
        <div style={{ height: "calc(100dvh - 52px)" }}>
          <WorkItemsViewAdapter
            selection={viewSelection}
            snapshotId={input.snapshotId}
            workspace={{
              items: viewItems,
              groups: groupWorkItems(
                viewItems,
                catalog,
                view,
                viewSelection.queryKey,
              ),
              queryKey: viewSelection.queryKey,
              catalog,
              view,
              onViewChange: setView,
              title: t("analytics.fullView"),
              sidebar: <p className="p-4 text-xs">{t("analytics.local")}</p>,
              interaction: {
                selectedIds: chosen,
                activeItemId: activeItem,
                collapsedGroupIds: collapsed,
              },
              onSelectionChange: setChosen,
              onToggleGroup: (key) =>
                setCollapsed((old) =>
                  old.includes(key)
                    ? old.filter((id) => id !== key)
                    : [...old, key],
                ),
              getPresentation: present,
              onCloseItem: () => setActiveItem(null),
              activeItem: viewItems.find((item) => item.id === activeItem),
              schedule: {
                today: "2026-10-09",
                buckets,
                range: {
                  ...timelineRange,
                  queryKey: viewSelection.queryKey,
                  itemIds: rangeIds,
                  loadedCount: rangeIds.length,
                  totalCount: rangeIds.length,
                  dataState: rangeIds.length ? "success" : "empty",
                },
                unscheduled: {
                  queryKey: viewSelection.queryKey,
                  itemIds: unscheduledIds,
                  loadedCount: unscheduledIds.length,
                  totalCount: unscheduledIds.length,
                  dataState: unscheduledIds.length ? "success" : "empty",
                },
              },
            }}
          />
        </div>
      </div>
    )
  return (
    <div id="main-content" className="h-dvh" data-workflow-analytics>
      <DashboardShell
        header={
          <DashboardHeader
            title={t("analytics.projectOverview")}
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
                <a href="/examples/" className="px-2 text-xs">
                  {locale === "en" ? "Examples" : "示例目录"}
                </a>
              </>
            }
          />
        }
        toolbar={
          <DashboardFilterBar
            label={t("analytics.projectOverview")}
            filters={
              <>
                <label className="flex items-center gap-2 whitespace-nowrap text-xs">
                  Project
                  <NativeSelect
                    aria-label="Project"
                    value={project}
                    onChange={(event) => {
                      resetScope()
                      setProject(event.target.value)
                    }}
                  >
                    <option value="alpha">Alpha</option>
                    <option value="beta">Beta (empty scope)</option>
                  </NativeSelect>
                </label>
                <label className="flex items-center gap-2 whitespace-nowrap text-xs">
                  {t("analytics.member")}
                  <NativeSelect
                    aria-label={t("analytics.member")}
                    value={member}
                    onChange={(event) => {
                      resetScope()
                      setMember(event.target.value)
                    }}
                  >
                    <option value="">{t("analytics.all")}</option>
                    <option value="lin">Lin Chen</option>
                    <option value="maya">Maya Patel</option>
                  </NativeSelect>
                </label>
                <label className="flex items-center gap-2 whitespace-nowrap text-xs">
                  Fixture
                  <NativeSelect
                    aria-label="Fixture"
                    value={scenario}
                    onChange={(event) => {
                      resetScope()
                      setScenario(event.target.value)
                    }}
                  >
                    {[
                      "success",
                      "loading",
                      "empty",
                      "partial",
                      "error",
                      "no-history",
                      "late-response",
                      "denied",
                    ].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
              </>
            }
            actions={
              <>
                {pointIds && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPointIds(undefined)
                      setSelection(null)
                    }}
                  >
                    {t("analytics.clearFilter")}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setScenario("success")}
                >
                  {t("analytics.refresh")}
                </Button>
              </>
            }
          />
        }
      >
        <ProjectOverviewDashboard
          widgets={widgets}
          riskEvidence={workflowRiskEvidence(
            authorizedItems,
            asOf,
            "Asia/Shanghai",
          )}
          access={access}
          selection={selection}
          onSelectionChange={setSelection}
          onDrilldown={openDrilldown}
          onOpenEntity={setActiveEntity}
          onExport={(widget) => {
            if (!widget.result) return
            const blob = new Blob([analyticsCsv(widget.query, widget.result)], {
              type: "text/csv;charset=utf-8",
            })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = `${widget.id}.csv`
            anchor.click()
            URL.revokeObjectURL(url)
          }}
        >
          {access === "allowed" && project === "alpha" && (
            <DashboardWidget id="trace" title={t("analytics.trace")} width={12}>
              <WorkTraceabilityView
                relations={relations}
                onSelectEntity={setActiveEntity}
              />
            </DashboardWidget>
          )}
        </ProjectOverviewDashboard>
      </DashboardShell>
      <ChartDrilldownPanel
        selection={drilldown}
        onClose={() => setDrilldown(null)}
        access={access}
        definition={`${drilldown?.widgetId ?? ""} · ${drilldown?.snapshotId ?? ""}`}
        response={
          drilldown
            ? {
                ...drilldown,
                records: members.slice(0, pageSize),
                totalCount: members.length,
              }
            : undefined
        }
        onLoadMore={() => setPageSize((size) => size + 2)}
        onOpenEntity={setActiveEntity}
        onApplyFilter={(next) => {
          setPointIds(next.entityRefs?.map((ref) => ref.entityId))
          setDrilldown(null)
        }}
        onOpenView={(next) => {
          setViewSelection(next)
          setDrilldown(null)
        }}
      />
      <Sheet
        open={!!activeEntity}
        onOpenChange={(open) => {
          if (!open) setActiveEntity(null)
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {activeEntity?.kind}: {activeEntity?.entityId}
            </SheetTitle>
            <SheetDescription>{t("analytics.local")}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p>
              {activeEntity &&
                fixtureMemberMap.get(analyticsEntityKey(activeEntity))?.title}
            </p>
            <pre className="whitespace-pre-wrap break-all text-xs">
              {JSON.stringify(activeEntity, null, 2)}
            </pre>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  )
}
