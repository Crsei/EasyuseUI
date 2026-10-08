"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import {
  ActivityTimeline,
  type ActivityEvent,
} from "@/components/blocks/activity-timeline"
import { Button } from "@/components/ui/button"
function event(index: number): ActivityEvent {
  return {
    id: `event-${index}`,
    time: `16:42:${String(Math.abs(index) % 60).padStart(2, "0")}`,
    agent: "Builder",
    type: "tool",
    action: `读取文件 ${index}`,
    target: `components/file-${index}.tsx`,
    status: "completed",
    duration: "24ms",
    tokens: index % 2 ? undefined : 128,
    details: <p>本地事件参数与输出摘要；缺失用量不按 0 处理。</p>,
  }
}
export function ActivityTimelineDemo() {
  const { t } = useSiteI18n()

  const [events, setEvents] = useState(() =>
    Array.from({ length: 12 }, (_, index) => event(index)),
  )
  const [selected, setSelected] = useState<string>()
  const [failed, setFailed] = useState(false)
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            setEvents((current) =>
              current.map((entry, index) =>
                index === current.length - 1
                  ? { ...entry, status: "running" }
                  : entry,
              ),
            )
          }
        >
          {t("site.updateEventStatus")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setEvents((current) => [
              ...current,
              event(Number(current.at(-1)!.id.replace("event-", "")) + 1),
            ])
          }
        >
          {t("site.appendEvent")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEvents((current) => [...current, current.at(-1)!])}
        >
          {t("site.duplicateEvent")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setFailed(!failed)}>
          {t("site.toggleRefreshFailure")}
        </Button>
      </div>
      <ActivityTimeline
        events={events}
        selectedId={selected}
        onSelect={(entry) => setSelected(entry.id)}
        data={{
          state: failed ? "error" : "success",
          onRetry: () => setFailed(false),
          error: {
            category: "network",
            message: t("site.eventRefreshFailed"),
            reason: t("site.localDemoConnectionUnavailable"),
          },
          updatedAt: "16:42:08",
        }}
      />
      <p className="mt-3 text-xs text-text-secondary">
        {t("site.localTimelineScrollAwayFromTheBottomThenAppend")}
      </p>
    </div>
  )
}
