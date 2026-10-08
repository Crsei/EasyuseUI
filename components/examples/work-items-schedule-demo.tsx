"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-provider"
import {
  scheduleDateError,
  type ScheduleDates,
} from "@/lib/schedule-date-utils"
import { useState } from "react"
import { Timeline, type TimelineRecord } from "@/components/blocks/timeline"
import { Calendar } from "@/components/blocks/calendar"
import { WorkItemTimeline } from "@/components/blocks/work-item-timeline"
import { WorkItemCalendar } from "@/components/blocks/work-item-calendar"
import { ScheduleViewControls } from "@/components/blocks/schedule-view-controls"
import { WorkItemDateRangeField } from "@/components/blocks/work-item-date-range-field"
import {
  UnscheduledWorkItems,
  type WorkItemScheduleViewProps,
} from "@/components/blocks/work-items-schedule"
import {
  normalizeTimeline,
  normalizeCalendar,
  timelineViewport,
  calendarViewport,
  workItemDates,
  type DateBucketSnapshot,
} from "@/lib/schedule-view-model"
import { scheduleDates } from "@/lib/schedule-date-utils"
import { defaultWorkItemsView } from "@/lib/work-items-model"
import { catalog, makeWorkItems, fixtureToday } from "./work-items/fixtures"
function GenericDateForm({
  initial,
  onSave,
}: {
  initial: ScheduleDates
  onSave: (dates: ScheduleDates) => void
}) {
  const { t } = useI18n(),
    [draft, setDraft] = useState(initial),
    [error, setError] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (scheduleDateError(draft)) {
          setError(true)
          return
        }
        onSave(draft)
      }}
    >
      <label>
        {t("schedule.start")}
        <Input
          autoFocus
          type="date"
          value={draft.startDate ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, startDate: e.target.value || null })
          }
        />
      </label>
      <label>
        {t("schedule.due")}
        <Input
          type="date"
          value={draft.dueDate ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, dueDate: e.target.value || null })
          }
        />
      </label>
      {error && <p role="alert">{t("schedule.invalidRange")}</p>}
      <Button type="submit">{t("schedule.save")}</Button>
    </form>
  )
}
export function TimelineDemo() {
  const [editing, setEditing] = useState<TimelineRecord | null>(null)
  const [settings, setSettings] = useState(normalizeTimeline()),
    [items, setItems] = useState<TimelineRecord[]>([
      {
        id: "release",
        label: "Release window",
        startDate: "2026-09-28",
        dueDate: "2026-10-15",
        canShift: true,
        canResizeStart: true,
        canResizeEnd: true,
      },
      {
        id: "review",
        label: "Review",
        startDate: null,
        dueDate: "2026-10-09",
        canResizeEnd: true,
      },
    ])
  return (
    <div>
      <ScheduleViewControls
        kind="timeline"
        value={settings}
        onChange={setSettings}
        today={fixtureToday}
      />
      <Timeline
        onEdit={setEditing}
        items={items}
        viewport={timelineViewport(settings)}
        scale={settings.scale}
        today={fixtureToday}
        queryKey={JSON.stringify(settings)}
        renderSidebar={(item) => <span>{item.label}</span>}
        onDateChange={(change) =>
          setItems((before) =>
            before.map((item) =>
              item.id === change.id ? { ...item, ...change.nextDates } : item,
            ),
          )
        }
      />
      {editing && (
        <GenericDateForm
          key={editing.id}
          initial={editing}
          onSave={(dates) => {
            setItems((before) =>
              before.map((item) =>
                item.id === editing.id ? { ...item, ...dates } : item,
              ),
            )
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
export function CalendarDemo() {
  const [settings, setSettings] = useState(normalizeCalendar()),
    [items, setItems] = useState([
      { id: "release", label: "Release checklist", date: "2026-10-09" },
    ]),
    range = calendarViewport(settings)
  const buckets: DateBucketSnapshot[] = scheduleDates(
    range.rangeStart,
    range.rangeEnd,
  ).map((date) => {
    const ids = items
      .filter((item) => item.date === date)
      .map((item) => item.id)
    return {
      date,
      queryKey: "notes",
      itemIds: ids,
      loadedCount: ids.length,
      totalCount: ids.length,
      dataState: ids.length ? "success" : "empty",
    }
  })
  return (
    <div>
      <ScheduleViewControls
        kind="calendar"
        value={settings}
        onChange={setSettings}
        today={fixtureToday}
      />
      <Calendar
        value={settings}
        onChange={setSettings}
        buckets={buckets}
        queryKey="notes"
        today={fixtureToday}
        getItem={(id) => items.find((item) => item.id === id)}
        renderEntry={(item, { agenda }) => (
          <button
            tabIndex={agenda ? 0 : -1}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "application/x-easyuseui-schedule",
                item.id,
              )
            }
          >
            {item.label}
          </button>
        )}
        onDropItem={(id, date) =>
          setItems((before) =>
            before.map((item) => (item.id === id ? { ...item, date } : item)),
          )
        }
      />
    </div>
  )
}
function WorkScheduleDemo({
  kind,
}: {
  kind: "timeline" | "calendar" | "field" | "queue"
}) {
  const [items, setItems] = useState(() =>
      makeWorkItems(8).map((item, index) =>
        index === 5
          ? { ...item, startDate: "2026-10-20", dueDate: "2026-10-10" }
          : item,
      ),
    ),
    [selected, setSelected] = useState<string[]>([]),
    [timeline, setTimeline] = useState(normalizeTimeline()),
    [calendar, setCalendar] = useState(normalizeCalendar())
  const range = calendarViewport(calendar)
  const props: WorkItemScheduleViewProps = {
    items,
    groups: [],
    queryKey: "local-schedule",
    interaction: {
      selectedIds: selected,
      activeItemId: null,
      collapsedGroupIds: [],
    },
    onSelectionChange: setSelected,
    getPresentation: (item) => ({
      catalog,
      visibleProperties: defaultWorkItemsView.visibleProperties,
      capabilities: {
        canCreate: false,
        canMove: () => false,
        canEditField: () => true,
      },
      onOpen: () => setSelected([item.id]),
    }),
    onScheduleChange: (intent) =>
      setItems((before) =>
        before.map((item) =>
          item.id === intent.itemId && item.revision === intent.baseRevision
            ? { ...item, ...intent.nextDates, revision: item.revision + 1 }
            : item,
        ),
      ),
    buckets: scheduleDates(range.rangeStart, range.rangeEnd).map((date) => {
      const ids = items
        .filter((item) => item.dueDate === date)
        .map((item) => item.id)
      return {
        date,
        queryKey: "local-schedule",
        itemIds: ids,
        loadedCount: ids.length,
        totalCount: ids.length,
        dataState: ids.length ? "success" : "empty",
      }
    }),
  }
  if (kind === "field")
    return (
      <WorkItemDateRangeField
        key={items[0].revision}
        item={items[0]}
        capabilities={props.getPresentation(items[0]).capabilities}
        queryKey={props.queryKey}
        onChange={props.onScheduleChange}
        proposedDates={workItemDates(items[0])}
      />
    )
  if (kind === "queue")
    return <UnscheduledWorkItems props={props} kind="calendar" />
  return (
    <div>
      {kind === "timeline" ? (
        <>
          <ScheduleViewControls
            kind="timeline"
            value={timeline}
            onChange={setTimeline}
            today={fixtureToday}
          />
          <WorkItemTimeline
            {...props}
            settings={timeline}
            today={fixtureToday}
          />
        </>
      ) : (
        <>
          <ScheduleViewControls
            kind="calendar"
            value={calendar}
            onChange={setCalendar}
            today={fixtureToday}
          />
          <WorkItemCalendar
            {...props}
            settings={calendar}
            onSettingsChange={setCalendar}
            today={fixtureToday}
          />
        </>
      )}
    </div>
  )
}
export const WorkItemTimelineDemo = () => <WorkScheduleDemo kind="timeline" />
export const WorkItemCalendarDemo = () => <WorkScheduleDemo kind="calendar" />
export const WorkItemDateRangeFieldDemo = () => (
  <WorkScheduleDemo kind="field" />
)
export const UnscheduledWorkItemsDemo = () => <WorkScheduleDemo kind="queue" />
export const ScheduleViewControlsDemo = () => (
  <WorkScheduleDemo kind="timeline" />
)
