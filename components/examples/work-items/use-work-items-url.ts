"use client"
import { useSearchParams } from "next/navigation"
import {
  defaultWorkItemsView,
  type WorkItemProperty,
  type WorkItemsViewState,
} from "@/lib/work-items-model"
import { catalog } from "./fixtures"
const supportedProperties: WorkItemProperty[] = [
  "state",
  "priority",
  "assignees",
  "labels",
  "dueDate",
  "counts",
]
export function decodeWorkItemsUrl(params: URLSearchParams): {
  view: WorkItemsViewState
  item: string | null
} {
  const layout = params.get("layout")
  const group = params.get("group")
  const sort = params.get("sort")
  const filterOptions = {
    state: catalog.states,
    priority: catalog.priorities,
    assignees: catalog.assignees,
    labels: catalog.labels,
  }
  return {
    view: {
      ...defaultWorkItemsView,
      layout: layout === "board" || layout === "table" ? layout : "list",
      groupBy: group === "priority" ? "priority" : "state",
      query: params.get("q") ?? "",
      sort:
        sort === "title" || sort === "dueDate" || sort === "priority"
          ? sort
          : "manual",
      sortDirection: params.get("dir") === "desc" ? "desc" : "asc",
      filters: Object.fromEntries(
        Object.entries(filterOptions).map(([key, options]) => [
          key,
          [...new Set(params.getAll(key))].filter((id) =>
            options.some((option) => option.id === id),
          ),
        ]),
      ) as WorkItemsViewState["filters"],
      visibleProperties: params.has("fields")
        ? [...new Set((params.get("fields") ?? "").split(","))].filter(
            (key): key is WorkItemProperty =>
              supportedProperties.includes(key as WorkItemProperty),
          )
        : [...defaultWorkItemsView.visibleProperties],
      showEmptyGroups: params.get("empty") !== "0",
    },
    item: params.get("item")?.toLocaleLowerCase() ?? null,
  }
}
export function encodeWorkItemsUrl(
  view: WorkItemsViewState,
  item: string | null,
) {
  const params = new URLSearchParams({
    layout: view.layout,
    group: view.groupBy,
    sort: view.sort,
  })
  if (view.sortDirection === "desc") params.set("dir", "desc")
  if (view.query) params.set("q", view.query)
  for (const [key, ids] of Object.entries(view.filters))
    for (const id of ids) params.append(key, id)
  params.set("fields", view.visibleProperties.join(","))
  if (!view.showEmptyGroups) params.set("empty", "0")
  if (item) params.set("item", item.toUpperCase())
  return `/workspace/work-items/?${params}`
}
export function useWorkItemsUrl() {
  const params = useSearchParams()
  const { view, item } = decodeWorkItemsUrl(
    new URLSearchParams(params.toString()),
  )
  function navigate(
    next: WorkItemsViewState,
    active: string | null,
    push = false,
  ) {
    window.history[push ? "pushState" : "replaceState"](
      null,
      "",
      encodeWorkItemsUrl(next, active),
    )
  }
  return {
    view,
    activeItemId: item,
    setView: (next: WorkItemsViewState) => navigate(next, item),
    openItem: (id: string) => navigate(view, id, true),
    closeItem: () => navigate(view, null, true),
    href: (id: string) => encodeWorkItemsUrl(view, id),
  }
}
