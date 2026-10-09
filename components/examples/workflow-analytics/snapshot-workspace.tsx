"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WorkItemsViewAdapter } from "@/components/blocks/analytics/work-items-view-adapter"
import {
  defaultWorkItemsView,
  type WorkItemsViewState,
  type WorkItemRecord,
} from "@/lib/work-items-model"
import { groupWorkItems } from "@/lib/work-items-view"
import {
  calendarViewport,
  normalizeCalendar,
  timelineViewport,
  normalizeTimeline,
  scheduleIntersects,
} from "@/lib/schedule-view-model"
import { scheduleDates } from "@/lib/schedule-date-utils"
import type { DrilldownSelection } from "@/lib/analytics-model"
import { useI18n } from "@/lib/i18n-provider"
import { catalog } from "./fixtures/extended"
export function SnapshotWorkspace({
  selection,
  items,
  onBack,
  onDateChange,
  initialLayout = "list",
}: {
  selection: DrilldownSelection
  items: readonly WorkItemRecord[]
  onBack: () => void
  initialLayout?: "list" | "timeline"
  onDateChange?: (id: string, start: string | null, due: string | null) => void
}) {
  const { t, locale } = useI18n(),
    [view, setView] = useState<WorkItemsViewState>({
      ...defaultWorkItemsView,
      layout: initialLayout,
      timeline: {
        timeZone: "Asia/Shanghai",
        weekStartsOn: 1,
        anchorDate: "2026-10-09",
        scale: "week" as const,
      },
      calendar: {
        timeZone: "Asia/Shanghai",
        weekStartsOn: 1,
        anchorDate: "2026-10-09",
        mode: "month" as const,
        showWeekends: true,
        selectedDate: "2026-10-09",
      },
    }),
    [active, setActive] = useState<string | null>(null),
    [chosen, setChosen] = useState<readonly string[]>([]),
    [collapsed, setCollapsed] = useState<readonly string[]>([])
  const tr = timelineViewport(normalizeTimeline(view.timeline)),
    cr = calendarViewport(normalizeCalendar(view.calendar)),
    rangeIds = items.filter((i) => scheduleIntersects(i, tr)).map((i) => i.id),
    unscheduled = items.filter((i) => !i.dueDate).map((i) => i.id)
  return (
    <div className="h-dvh">
      <Button className="m-2" variant="secondary" onClick={onBack}>
        {locale === "en" ? "Back to analytics" : "返回分析"}
      </Button>
      <div style={{ height: "calc(100dvh - 52px)" }}>
        <WorkItemsViewAdapter
          selection={selection}
          snapshotId={selection.snapshotId}
          workspace={{
            items,
            groups: groupWorkItems(items, catalog, view, selection.queryKey),
            queryKey: selection.queryKey,
            catalog,
            view,
            onViewChange: setView,
            title: t("analytics.fullView"),
            sidebar: <p className="p-4 text-xs">{t("analytics.local")}</p>,
            interaction: {
              selectedIds: chosen,
              activeItemId: active,
              collapsedGroupIds: collapsed,
            },
            onSelectionChange: setChosen,
            onToggleGroup: (key) =>
              setCollapsed((old) =>
                old.includes(key)
                  ? old.filter((k) => k !== key)
                  : [...old, key],
              ),
            getPresentation: () => ({
              catalog,
              visibleProperties: view.visibleProperties,
              capabilities: {
                canCreate: false,
                canMove: () => false,
                canEditField: (_item, field) =>
                  !!onDateChange &&
                  (field === "startDate" || field === "dueDate"),
              },
              onOpen: (item) => setActive(item.id),
            }),
            onCloseItem: () => setActive(null),
            activeItem: items.find((i) => i.id === active),
            schedule: {
              today: "2026-10-09",
              onScheduleChange: onDateChange
                ? (intent) =>
                    onDateChange(
                      intent.itemId,
                      intent.nextDates.startDate,
                      intent.nextDates.dueDate,
                    )
                : undefined,
              buckets: scheduleDates(cr.rangeStart, cr.rangeEnd).map((date) => {
                const ids = items
                  .filter((i) => i.dueDate === date)
                  .map((i) => i.id)
                return {
                  date,
                  queryKey: selection.queryKey,
                  itemIds: ids,
                  loadedCount: ids.length,
                  totalCount: ids.length,
                  dataState: ids.length ? "success" : "empty",
                }
              }),
              range: {
                ...tr,
                queryKey: selection.queryKey,
                itemIds: rangeIds,
                loadedCount: rangeIds.length,
                totalCount: rangeIds.length,
                dataState: rangeIds.length ? "success" : "empty",
              },
              unscheduled: {
                queryKey: selection.queryKey,
                itemIds: unscheduled,
                loadedCount: unscheduled.length,
                totalCount: unscheduled.length,
                dataState: unscheduled.length ? "success" : "empty",
              },
            },
          }}
        />
      </div>
    </div>
  )
}
