"use client"
import { useState } from "react"
import {
  WorkItemsBatchActions,
  WorkItemsSavedViews,
} from "@/components/blocks/work-items-enhancements"
import {
  defaultWorkItemsView,
  type WorkItemsSavedView,
  type MutationState,
} from "@/lib/work-items-model"
import { catalog, makeWorkItems } from "./work-items/fixtures"
export function WorkItemsBatchActionsDemo() {
  const [items, setItems] = useState(() => makeWorkItems(3))
  const [mutations, setMutations] = useState<Record<string, MutationState>>({})
  return (
    <div>
      <p className="p-3 text-xs text-muted-foreground">
        Local fixture · no service writes
      </p>
      <WorkItemsBatchActions
        items={items}
        selectedIds={items.map((item) => item.id)}
        catalog={catalog}
        capabilities={{
          canCreate: false,
          canMove: () => false,
          canEditField: (item) => item.id !== "wi-003",
        }}
        mutations={mutations}
        onApply={(intent) => {
          const selected = new Set(intent.entries.map((entry) => entry.itemId))
          setItems((before) =>
            before.map((item) =>
              selected.has(item.id)
                ? { ...item, ...intent.patch, revision: item.revision + 1 }
                : item,
            ),
          )
          setMutations(
            Object.fromEntries(
              intent.entries.map((entry) => [
                entry.itemId,
                {
                  itemId: entry.itemId,
                  operationId: intent.operationId,
                  baseRevision: entry.baseRevision,
                  status: "confirmed",
                },
              ]),
            ),
          )
        }}
      />
    </div>
  )
}
export function WorkItemsSavedViewsDemo() {
  const [views, setViews] = useState<WorkItemsSavedView[]>([])
  const [view, setView] = useState(defaultWorkItemsView)
  return (
    <div className="p-3">
      <p className="text-xs text-muted-foreground">
        Local memory · resets on refresh
      </p>
      <WorkItemsSavedViews
        view={view}
        views={views}
        canSave
        canDelete
        onApply={(saved) => setView(saved.view)}
        onSave={async (intent) => {
          setViews((before) => [
            ...before,
            {
              id: crypto.randomUUID(),
              name: intent.name,
              view: intent.view,
              revision: 1,
            },
          ])
          return { status: "confirmed" }
        }}
        onDelete={async (saved) => {
          setViews((before) => before.filter((view) => view.id !== saved.id))
          return { status: "confirmed" }
        }}
        onUnknown={() => {}}
      />
    </div>
  )
}
