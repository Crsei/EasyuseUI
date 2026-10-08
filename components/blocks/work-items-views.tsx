"use client"
import { GroupedList, type GroupedListProps } from "./grouped-list"
import { Board } from "./work-items-board-base"
import {
  WorkItemRow,
  WorkItemCard,
  WorkItemMutationNotice,
  type WorkItemPresentationProps,
} from "./work-item"
import { WorkItemProperties } from "./work-item-properties"
import { DataTable, type DataTableSort } from "./data-table"
import { Button } from "@/components/ui/button"
import type { BoardMove } from "@/lib/grouped-items-model"
import type {
  WorkItemRecord,
  WorkItemsInteraction,
} from "@/lib/work-items-model"
import { useI18n } from "@/lib/i18n-provider"
export type WorkItemsViewProps = Omit<
  GroupedListProps<WorkItemRecord>,
  "getItemId" | "renderItem"
> & {
  interaction: WorkItemsInteraction
  onSelectionChange?: (ids: string[]) => void
  getPresentation: (
    item: WorkItemRecord,
  ) => Omit<
    WorkItemPresentationProps,
    "item" | "selected" | "active" | "onSelect"
  >
}
function presentation(
  props: WorkItemsViewProps,
  item: WorkItemRecord,
): WorkItemPresentationProps {
  return {
    ...props.getPresentation(item),
    item,
    selected: props.interaction.selectedIds.includes(item.id),
    active: props.interaction.activeItemId === item.id,
    onSelect: props.onSelectionChange
      ? (selected) => {
          const ids = new Set(props.interaction.selectedIds)
          if (selected) ids.add(item.id)
          else ids.delete(item.id)
          props.onSelectionChange?.([...ids])
        }
      : undefined,
  }
}
export function WorkItemList(props: WorkItemsViewProps) {
  return (
    <GroupedList
      {...props}
      getItemId={(item) => item.id}
      collapsedGroupIds={props.interaction.collapsedGroupIds}
      renderItem={(item) => <WorkItemRow {...presentation(props, item)} />}
    />
  )
}
export function WorkItemBoard(
  props: WorkItemsViewProps & {
    queryKey: string
    manualOrder?: boolean
    allowAppend?: boolean
    canMove?: (item: WorkItemRecord, source: string, target: string) => boolean
    onMove?: (intent: BoardMove) => void
    announcement?: string
  },
) {
  return (
    <Board
      {...props}
      getItemId={(item) => item.id}
      getItemLabel={(item) => item.identifier}
      getItemRevision={(item) => item.revision}
      collapsedGroupIds={props.interaction.collapsedGroupIds}
      renderItem={(item) => <WorkItemCard {...presentation(props, item)} />}
    />
  )
}
export function WorkItemTable(
  props: WorkItemsViewProps & {
    sort?: DataTableSort
    onSortChange?: (sort: DataTableSort) => void
  },
) {
  const { t } = useI18n()
  const properties = props.items[0]
    ? props.getPresentation(props.items[0]).visibleProperties
    : []
  const labels = {
    state: t("workItems.state"),
    priority: t("workItems.priority"),
    assignees: t("workItems.assignees"),
    labels: t("workItems.labels"),
    dueDate: t("workItems.dueDate"),
    counts: t("workItems.counts"),
  }
  return (
    <DataTable
      rows={props.items}
      caption={t("workItems.items")}
      getRowId={(item) => item.id}
      getRowLabel={(item) => item.identifier}
      selectedIds={props.interaction.selectedIds}
      onSelectionChange={props.onSelectionChange}
      activeRowId={props.interaction.activeItemId}
      sort={props.sort}
      onSortChange={props.onSortChange}
      columns={[
        {
          id: "title",
          header: t("workItems.title"),
          sortable: true,
          primary: false,
          cell: (item) => {
            const p = props.getPresentation(item)
            return (
              <>
                {p.href ? (
                  <a
                    href={p.href}
                    onClick={(event) => {
                      if (
                        p.onOpen &&
                        event.button === 0 &&
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.shiftKey &&
                        !event.altKey
                      ) {
                        event.preventDefault()
                        p.onOpen(item)
                      }
                    }}
                  >
                    {item.identifier} · {item.title}
                  </a>
                ) : p.onOpen ? (
                  <Button variant="ghost" onClick={() => p.onOpen?.(item)}>
                    {item.identifier} · {item.title}
                  </Button>
                ) : (
                  <span>
                    {item.identifier} · {item.title}
                  </span>
                )}
                <WorkItemMutationNotice
                  mutation={p.mutation}
                  onReconcile={p.onReconcile}
                />
              </>
            )
          },
        },
        ...properties.map((property) => ({
          id: property,
          header: labels[property],
          primary: false,
          sortable: property === "priority" || property === "dueDate",
          cell: (item: WorkItemRecord) => (
            <WorkItemProperties
              {...props.getPresentation(item)}
              item={item}
              visibleProperties={[property]}
              layout="table"
            />
          ),
        })),
      ]}
    />
  )
}
