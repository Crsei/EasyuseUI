import type { WorkItemCatalog, WorkItemRecord } from "@/lib/work-items-model"
export const catalog: WorkItemCatalog = {
  states: [
    { id: "backlog", label: "Backlog", color: "#737373" },
    { id: "todo", label: "Todo", color: "#737373" },
    { id: "active", label: "In progress", color: "#5283d6" },
    { id: "review", label: "In review", color: "#b28d40" },
    { id: "done", label: "Done", color: "#479c79" },
  ],
  priorities: [
    { id: "p0", label: "Urgent" },
    { id: "p1", label: "High" },
    { id: "p2", label: "Medium" },
    { id: "p3", label: "Low" },
  ],
  assignees: [
    { id: "lin", label: "Lin Chen" },
    { id: "maya", label: "Maya Patel" },
    { id: "alex", label: "Alex Kim" },
    { id: "sam", label: "Sam Wu" },
  ],
  labels: [
    { id: "design", label: "Design" },
    { id: "frontend", label: "Frontend" },
    { id: "runtime", label: "Runtime" },
    { id: "a11y", label: "Accessibility" },
  ],
}
const titles = [
  "Unify work item properties across views",
  "Preserve selection when filters change",
  "Review command approval boundaries",
  "Handle a disconnected execution provider",
  "Document the portable installation flow",
  "Make the navigation usable by keyboard",
  "Keep calendar dates in the project timezone",
  "Reconcile unknown writes before retrying",
  "Support long titles, multiple assignees and labels without hiding important errors or changing the authoritative state",
  "Restore scroll position for each layout",
  "Add empty-group creation",
  "Measure the 1000-item fixture",
]
export const fixtureToday = "2026-10-08"
export function makeWorkItems(count = 24): WorkItemRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `wi-${String(i + 1).padStart(3, "0")}`,
    projectId: "easyuse",
    identifier: `WI-${String(i + 1).padStart(3, "0")}`,
    title: titles[i % titles.length] + (i >= 24 ? ` · ${i + 1}` : ""),
    description: "Deterministic local example. Changes reset on refresh.",
    stateId: catalog.states[i % 5].id,
    priorityId: catalog.priorities[i % 4].id,
    assigneeIds:
      i % 4 === 0
        ? []
        : i % 7 === 0
          ? ["lin", "maya", "alex", "sam"]
          : [catalog.assignees[i % 4].id],
    labelIds:
      i % 3 === 0 ? ["design", "frontend", "a11y"] : [catalog.labels[i % 4].id],
    dueDate:
      i % 4 === 0 ? null : `2026-10-${String(5 + (i % 20)).padStart(2, "0")}`,
    parentId: null,
    subItemCount: i % 3 === 0 ? null : i % 3,
    attachmentCount: i % 2,
    linkCount: null,
    revision: 1,
  }))
}

/** Explicit relationships, independent of workflow grouping. Counts refer to direct children. */
export function makeHierarchyWorkItems() {
  const rows = makeWorkItems()
  rows[1].parentId = rows[0].id
  rows[2].parentId = rows[0].id
  rows[3].parentId = rows[1].id
  rows[4].parentId = "not-loaded-parent"
  return rows.map((item) => ({
    ...item,
    subItemCount: rows.filter((child) => child.parentId === item.id).length,
  }))
}
