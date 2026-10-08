"use client"
import { useState } from "react"
import { GroupedList } from "@/components/blocks/grouped-list"
import { Board } from "@/components/blocks/work-items-board-base"
import { WorkItemRow, WorkItemCard } from "@/components/blocks/work-item"
import { WorkItemProperties } from "@/components/blocks/work-item-properties"
import {
  WorkItemList,
  WorkItemBoard,
  WorkItemTable,
} from "@/components/blocks/work-items-views"
import { WorkItemsToolbar } from "@/components/blocks/work-items-toolbar"
import {
  WorkItemDetail,
  WorkItemQuickCreate,
} from "@/components/blocks/work-item-detail"
import { WorkItemsWorkspace } from "@/components/blocks/work-items-workspace"
import {
  defaultWorkItemsView,
  type WorkItemsViewState,
  type WorkItemRecord,
} from "@/lib/work-items-model"
import { applyLocalMove, groupWorkItems } from "@/lib/work-items-view"
import { catalog, makeWorkItems } from "./work-items/fixtures"

function useExample() {
  const [items, setItems] = useState(() => makeWorkItems(8))
  const [view, setView] = useState<WorkItemsViewState>(defaultWorkItemsView)
  const [selected, setSelected] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const capabilities = {
    canCreate: true,
    canMove: () => true,
    canEditField: () => true,
  }
  const present = (item: WorkItemRecord) => ({
    catalog,
    visibleProperties: view.visibleProperties,
    capabilities,
    onPatchItem: (row: WorkItemRecord, patch: Partial<WorkItemRecord>) =>
      setItems((before) =>
        before.map((r) =>
          r.id === row.id ? { ...r, ...patch, revision: r.revision + 1 } : r,
        ),
      ),
    onOpen: () => setActive(item.id),
  })
  const groups = groupWorkItems(items, catalog, view, "docs")
  return {
    items,
    groups,
    view,
    onViewChange: setView,
    catalog,
    interaction: {
      selectedIds: selected,
      activeItemId: active,
      collapsedGroupIds: collapsed,
    },
    onSelectionChange: setSelected,
    onToggleGroup: (key: string) =>
      setCollapsed((before) =>
        before.includes(key)
          ? before.filter((id) => id !== key)
          : [...before, key],
      ),
    getPresentation: present,
    onCloseItem: () => setActive(null),
    activeItem: items.find((i) => i.id === active),
    queryKey: "docs",
    canMove: () => true,
    onMove: (intent: Parameters<typeof applyLocalMove>[1]) =>
      setItems((before) => applyLocalMove(before, intent, view.groupBy)),
  }
}
export function WorkItemRowDemo() {
  const p = useExample()
  return <WorkItemRow item={p.items[0]} {...p.getPresentation(p.items[0])} />
}
export function WorkItemCardDemo() {
  const p = useExample()
  return (
    <div className="w-80 rounded-lg border">
      <WorkItemCard item={p.items[7]} {...p.getPresentation(p.items[7])} />
    </div>
  )
}
export function WorkItemPropertiesDemo() {
  const p = useExample()
  return (
    <WorkItemProperties
      item={p.items[7]}
      {...p.getPresentation(p.items[7])}
      layout="detail"
    />
  )
}
export function WorkItemListDemo() {
  const p = useExample()
  return <WorkItemList {...p} />
}
export function WorkItemBoardDemo() {
  const p = useExample()
  return (
    <div className="max-h-[560px] overflow-auto">
      <WorkItemBoard
        {...p}
        onMove={(intent) =>
          p.onMove({ ...intent, operationId: "docs", baseRevision: 1 })
        }
      />
    </div>
  )
}
export function WorkItemTableDemo() {
  const p = useExample()
  return <WorkItemTable {...p} />
}
export function WorkItemsToolbarDemo() {
  const p = useExample()
  return <WorkItemsToolbar {...p} />
}
export function WorkItemDetailDemo() {
  const p = useExample()
  return (
    <div className="max-w-sm">
      <WorkItemDetail item={p.items[0]} {...p.getPresentation(p.items[0])} />
      <WorkItemQuickCreate
        catalog={catalog}
        preset={{ title: "", stateId: "todo", priorityId: "p2" }}
        onCreate={async () => ({
          status: "rejected",
          error: "Local example: draft retained",
        })}
        onCancel={() => {}}
        onUnknown={() => {}}
      />
    </div>
  )
}
export function WorkItemsWorkspaceDemo() {
  const p = useExample()
  return (
    <div className="h-[640px]">
      <WorkItemsWorkspace
        {...p}
        title="Work Items"
        sidebar={<p className="p-4">Local example</p>}
        onMove={(intent) =>
          p.onMove({ ...intent, operationId: "docs", baseRevision: 1 })
        }
      />
    </div>
  )
}
export function GroupedListDemo() {
  const ideas = [
    { id: "one", title: "Explain uncertain outcomes" },
    { id: "two", title: "Review a design" },
  ]
  return (
    <GroupedList
      groups={[
        {
          key: "ideas",
          label: "Ideas",
          itemIds: ideas.map((i) => i.id),
          loadedCount: 2,
          totalCount: null,
          dataState: "success",
          queryKey: "ideas",
        },
      ]}
      items={ideas}
      getItemId={(i) => i.id}
      renderItem={(idea) => (
        <p className="border-b p-3 text-sm">{idea.title}</p>
      )}
    />
  )
}
export function ItemBoardDemo() {
  const [ideas, setIdeas] = useState([
    { id: "one", title: "Explore a new idea", group: "inbox" },
    { id: "two", title: "Review a proposal", group: "review" },
  ])
  const groups = ["inbox", "review"].map((key) => ({
    key,
    label: key,
    itemIds: ideas.filter((i) => i.group === key).map((i) => i.id),
    loadedCount: ideas.filter((i) => i.group === key).length,
    dataState: "success" as const,
    queryKey: "ideas",
  }))
  return (
    <div className="max-h-[480px] overflow-auto">
      <Board
        groups={groups}
        items={ideas}
        getItemId={(i) => i.id}
        getItemLabel={(i) => i.title}
        renderItem={(i) => <p className="p-3 text-sm">{i.title}</p>}
        queryKey="ideas"
        canMove={() => true}
        onMove={(intent) =>
          setIdeas((before) =>
            before.map((i) =>
              i.id === intent.itemId ? { ...i, group: intent.targetGroup } : i,
            ),
          )
        }
      />
    </div>
  )
}
