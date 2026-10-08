"use client"
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
          更新事件状态
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
          追加事件
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEvents((current) => [...current, current.at(-1)!])}
        >
          重复事件
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setFailed(!failed)}>
          切换刷新失败
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
            message: "刷新事件失败",
            reason: "本地演示连接不可用。",
          },
          updatedAt: "16:42:08",
        }}
      />
      <p className="mt-3 text-xs text-text-secondary">
        本地时间线 · 滚离底部后追加事件，查看新事件提示。
      </p>
    </div>
  )
}
