"use client"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { WorkspaceShell } from "./workspace-shell"
import { WorkItemsToolbar } from "./work-items-toolbar"
import {
  WorkItemList,
  WorkItemBoard,
  WorkItemTable,
  type WorkItemsViewProps,
} from "./work-items-views"
import { WorkItemDetail } from "./work-item-detail"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type {
  WorkItemCatalog,
  WorkItemRecord,
  WorkItemsViewState,
} from "@/lib/work-items-model"
import type { BoardMove } from "@/lib/grouped-items-model"
import { useI18n } from "@/lib/i18n-provider"
import styles from "./work-items.module.css"
export type WorkItemsWorkspaceProps = WorkItemsViewProps & {
  catalog: WorkItemCatalog
  view: WorkItemsViewState
  onViewChange: (view: WorkItemsViewState) => void
  title: ReactNode
  sidebar: ReactNode
  headerAction?: ReactNode
  notes?: ReactNode
  queryKey: string
  activeItem?: WorkItemRecord | null
  onCloseItem: () => void
  data?: Omit<DataRegionProps, "children" | "hasContent">
  onMove?: (intent: BoardMove) => void
  canMove?: (item: WorkItemRecord, source: string, target: string) => boolean
  announcement?: string
}
export function WorkItemsWorkspace(props: WorkItemsWorkspaceProps) {
  const { t } = useI18n()
  const container = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) =>
      setNarrow(entry.contentRect.width < 1280),
    )
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  const scroll = useRef<HTMLDivElement>(null)
  const positions = useRef<Record<string, { top: number; left: number }>>({})
  const returnFocus = useRef<string | null>(null)
  const previousLayout = useRef(props.view.layout)
  useLayoutEffect(() => {
    if (props.interaction.activeItemId || !returnFocus.current) return
    const id = CSS.escape(returnFocus.current)
    const target =
      container.current?.querySelector<HTMLElement>(
        `[data-work-item="${id}"] a, [data-work-item="${id}"] button, [data-row-id="${id}"] a`,
      ) ??
      container.current?.querySelector<HTMLElement>(
        "[role=radio][data-checked]",
      )
    target?.focus()
    returnFocus.current = null
  })
  function closeItem() {
    returnFocus.current = props.interaction.activeItemId
    props.onCloseItem()
  }
  useLayoutEffect(() => {
    const position = positions.current[props.view.layout] ?? { top: 0, left: 0 }
    scroll.current?.scrollTo(position.left, position.top)
    if (previousLayout.current !== props.view.layout) {
      document
        .querySelector<HTMLElement>(`[role="radio"][data-checked]`)
        ?.focus()
      previousLayout.current = props.view.layout
    }
  }, [props.view.layout])
  function changeView(view: WorkItemsViewState) {
    if (scroll.current)
      positions.current[props.view.layout] = {
        top: scroll.current.scrollTop,
        left: scroll.current.scrollLeft,
      }
    props.onViewChange(view)
  }
  const visibleIds = new Set(
    props.view.layout === "table"
      ? props.items.map((item) => item.id)
      : props.groups
          .filter((g) => !props.interaction.collapsedGroupIds.includes(g.key))
          .flatMap((g) => g.itemIds),
  )
  const chosen = [...visibleIds].filter((id) =>
    props.interaction.selectedIds.includes(id),
  ).length
  const hidden = props.interaction.selectedIds.filter(
    (id) => !visibleIds.has(id),
  ).length
  const catalog = props.catalog
  const detail = props.activeItem ? (
    <WorkItemDetail
      {...props.getPresentation(props.activeItem)}
      item={props.activeItem}
    />
  ) : (
    <p className="p-4">{t("workItems.notFound")}</p>
  )
  return (
    <div ref={container} className={styles.workspace}>
      <WorkspaceShell
        className={styles.workspace}
        title={
          <div className={styles.head}>
            <h1>{props.title}</h1>
            {props.headerAction}
          </div>
        }
        sidebar={props.sidebar}
        defaultSidebarCollapsed={false}
        inspector={props.interaction.activeItemId ? detail : undefined}
        inspectorTitle={props.activeItem?.identifier ?? t("workItems.notFound")}
        inspectorOpen={!!props.interaction.activeItemId}
        onInspectorOpenChange={(open) => {
          if (!open) closeItem()
        }}
        inspectorOverlayOpen={narrow && !!props.interaction.activeItemId}
        onInspectorOverlayOpenChange={(open) => {
          if (!open) closeItem()
        }}
        toolbar={
          catalog && (
            <WorkItemsToolbar
              view={props.view}
              onViewChange={changeView}
              catalog={catalog}
            />
          )
        }
        bottomPanel={props.notes}
        defaultBottomPanelOpen={false}
      >
        <div className={styles.view}>
          <div className={styles.summary}>
            {props.onSelectionChange && (
              <Checkbox
                aria-label={t("workItems.selectVisible")}
                checked={visibleIds.size > 0 && chosen === visibleIds.size}
                indeterminate={chosen > 0 && chosen < visibleIds.size}
                disabled={!visibleIds.size}
                onCheckedChange={(checked) => {
                  const ids = new Set(props.interaction.selectedIds)
                  for (const id of visibleIds) {
                    if (checked) ids.add(id)
                    else ids.delete(id)
                  }
                  props.onSelectionChange?.([...ids])
                }}
              />
            )}
            <span>
              {t("workItems.selection", {
                selected: props.interaction.selectedIds.length,
                hidden,
              })}
            </span>
            {!!props.interaction.selectedIds.length && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => props.onSelectionChange?.([])}
              >
                {t("workItems.clearSelection")}
              </Button>
            )}
            <span role="status">{props.announcement}</span>
          </div>
          <div
            className={styles.scroll}
            ref={scroll}
            data-work-items-scroll={props.view.layout}
          >
            <DataRegion
              {...props.data}
              state={
                props.data?.state ?? (props.items.length ? "success" : "empty")
              }
              hasContent={props.items.length > 0}
              emptyTitle={props.data?.emptyTitle ?? t("workItems.noItems")}
              emptyDescription={
                props.data?.emptyDescription ?? t("workItems.noItemsHint")
              }
            >
              {props.view.layout === "list" ? (
                <WorkItemList {...props} />
              ) : props.view.layout === "board" ? (
                <WorkItemBoard
                  {...props}
                  manualOrder={props.view.sort === "manual"}
                />
              ) : (
                <WorkItemTable
                  {...props}
                  sort={
                    props.view.sort === "manual"
                      ? null
                      : {
                          columnId: props.view.sort,
                          direction: props.view.sortDirection,
                        }
                  }
                  onSortChange={(sort) =>
                    changeView({
                      ...props.view,
                      sort:
                        sort?.columnId === "title" ||
                        sort?.columnId === "dueDate" ||
                        sort?.columnId === "priority"
                          ? sort.columnId
                          : "manual",
                      sortDirection: sort?.direction ?? "asc",
                    })
                  }
                />
              )}
            </DataRegion>
          </div>
        </div>
      </WorkspaceShell>
    </div>
  )
}
