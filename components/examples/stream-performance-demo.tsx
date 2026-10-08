"use client"
import { useState } from "react"
import { flushSync } from "react-dom"
import {
  Conversation,
  type ChatMessageProps,
} from "@/components/blocks/chat-message"
import {
  ActivityTimeline,
  type ActivityEvent,
} from "@/components/blocks/activity-timeline"
type RecordItem = { id: string; content: string; details?: string }
export function StreamPerformanceDemo() {
  const [items, setItems] = useState<RecordItem[]>([])
  const [kind, setKind] = useState("conversation")
  const [revision, setRevision] = useState(0)
  const [explicit, setExplicit] = useState(false)
  function configure(count: number, component: string, fast: boolean) {
    flushSync(() => {
      setKind(component)
      setExplicit(fast)
      setItems(
        Array.from({ length: count }, (_, index) => ({
          id: `item-${index}`,
          content: `Record ${index} fixed content`,
        })),
      )
      setRevision(0)
    })
  }
  // Deliberately retain record references; only the affected row receives a new payload.
  const [cache] = useState(
    () => new WeakMap<RecordItem, ChatMessageProps & ActivityEvent>(),
  )
  const records = items.map((item) => {
    let value = cache.get(item)
    if (!value) {
      value = {
        id: item.id,
        content: item.content,
        details: item.details,
        role: "user",
        time: "12:00",
        type: "fixture",
        action: item.content,
        status: "completed",
      }
      cache.set(item, value)
    }
    return value
  })
  function update(operation: string, index: number) {
    flushSync(() => {
      setItems((current) =>
        operation === "append"
          ? [...current, { id: `new-${index}`, content: `Appended ${index}` }]
          : operation === "prepend"
            ? [
                { id: `old-${index}`, content: `Historical ${index}` },
                ...current,
              ]
            : current.map((item, i) =>
                i === Math.min(2, current.length - 1)
                  ? {
                      ...item,
                      content:
                        operation === "long"
                          ? "Long content line\n".repeat(2000)
                          : `Historical revision ${index}`,
                      details:
                        operation === "long"
                          ? "Expanded detail\n".repeat(2000)
                          : item.details,
                    }
                  : item,
              ),
      )
      setRevision((value) => value + 1)
    })
  }
  if (typeof window !== "undefined")
    Object.assign(window, {
      streamFixture: { configure, update, count: items.length, kind },
    })
  return (
    <main>
      <h1>Stream benchmark fixture</h1>
      <p>Deterministic local records, no service integration.</p>
      <div style={{ height: 600 }}>
        {kind === "conversation" ? (
          <Conversation
            {...{
              messages: records,
              revision: explicit ? revision : undefined,
              deferOffscreen: explicit,
            }}
          />
        ) : (
          <ActivityTimeline
            {...{
              events: records,
              revision: explicit ? revision : undefined,
              deferOffscreen: explicit,
            }}
          />
        )}
      </div>
    </main>
  )
}
