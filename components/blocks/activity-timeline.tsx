"use client"

import { useId, useState, type ReactNode } from "react"
import { Activity, ChevronRight } from "lucide-react"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { Button } from "@/components/ui/button"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { useFollowTail } from "@/lib/use-follow-tail"
import { cn } from "@/lib/utils"
import styles from "./activity-timeline.module.css"

export type ActivityEvent = {
  id: string
  time: string
  agent?: string
  type: string
  action: string
  target?: string
  status: string
  duration?: string
  tokens?: number
  details?: ReactNode
}
export type ActivityTimelineProps = {
  events: ActivityEvent[]
  selectedId?: string
  onSelect?: (event: ActivityEvent) => void
  compact?: boolean
  data?: Omit<DataRegionProps, "children" | "hasContent">
  className?: string
}
export function ActivityTimeline({
  events,
  selectedId,
  onSelect,
  compact,
  data,
  className,
}: ActivityTimelineProps) {
  const id = useId()
  const [expanded, setExpanded] = useState<string[]>([])
  // Map keeps the first source position and the latest payload for each ID.
  const unique = [...new Map(events.map((event) => [event.id, event])).values()]
  const {
    ref: scrollRef,
    unread,
    onScroll,
    jumpToLatest,
  } = useFollowTail(
    unique.map((event) => event.id),
    JSON.stringify(
      unique.map((event) => [event.id, event.status, event.duration]),
    ),
    false,
  )
  return (
    <div
      className={cn(styles.timeline, className)}
      data-compact={Boolean(compact)}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={styles.scroll}
        aria-label="Activity 时间线"
        tabIndex={0}
      >
        <DataRegion
          state={unique.length ? "success" : "empty"}
          emptyTitle="当前范围没有事件"
          emptyDescription="调整时间或筛选范围后查看运行事件。"
          rowHeight={compact ? 40 : 56}
          {...data}
          hasContent={unique.length > 0}
        >
          <ol className={styles.list}>
            {unique.map((event) => {
              const open = expanded.includes(event.id)
              const toggle = () =>
                setExpanded((current) =>
                  open
                    ? current.filter((value) => value !== event.id)
                    : [...current, event.id],
                )
              const content = (
                <>
                  <time className={styles.time}>{event.time}</time>
                  <span className={styles.agent}>{event.agent ?? "—"}</span>
                  <span className={styles.action}>
                    <Activity size={16} aria-hidden="true" />
                    <span>
                      <span>{event.action}</span>
                      <small>
                        {event.type}
                        {event.target && ` · ${event.target}`}
                      </small>
                    </span>
                  </span>
                  <span className={styles.status}>
                    <RuntimeStatusBadge status={event.status} />
                  </span>
                  <span className={styles.duration}>
                    {event.duration ?? "—"}
                  </span>
                  <span className={styles.tokens}>{event.tokens ?? "—"}</span>
                </>
              )
              return (
                <li
                  key={event.id}
                  data-event-id={event.id}
                  data-selected={selectedId === event.id}
                >
                  <div className={styles.row}>
                    {onSelect ? (
                      <button
                        type="button"
                        className={styles.main}
                        aria-label={`${event.action} ${event.id}`}
                        aria-pressed={selectedId === event.id}
                        onClick={() => onSelect(event)}
                      >
                        {content}
                      </button>
                    ) : (
                      <div className={styles.main}>{content}</div>
                    )}
                    {event.details !== undefined && (
                      <Button
                        className={styles.expand}
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${open ? "收起" : "展开"}事件 ${event.action}`}
                        aria-expanded={open}
                        aria-controls={`${id}-${event.id}`}
                        onClick={toggle}
                      >
                        <ChevronRight size={16} data-open={open} />
                      </Button>
                    )}
                  </div>
                  {open && (
                    <div id={`${id}-${event.id}`} className={styles.details}>
                      <dl>
                        <div>
                          <dt>Agent</dt>
                          <dd>{event.agent ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Target</dt>
                          <dd>{event.target ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Duration</dt>
                          <dd>{event.duration ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Tokens</dt>
                          <dd>{event.tokens ?? "—"}</dd>
                        </div>
                      </dl>
                      {event.details}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </DataRegion>
      </div>
      {unread > 0 && (
        <Button size="sm" variant="secondary" onClick={jumpToLatest}>
          {unread} 条新事件 · 返回最新
        </Button>
      )}
    </div>
  )
}
