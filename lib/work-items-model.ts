import type { RuntimeStatus } from "./runtime-status"

export type WorkItemProperty =
  "state" | "priority" | "assignees" | "labels" | "dueDate" | "counts"
export type WorkItemField =
  | "title"
  | "description"
  | "stateId"
  | "priorityId"
  | "assigneeIds"
  | "labelIds"
  | "dueDate"
export type WorkItemRecord = {
  id: string
  projectId: string
  identifier: string
  title: string
  description?: string
  stateId: string
  priorityId: string
  assigneeIds: readonly string[]
  labelIds: readonly string[]
  dueDate: string | null
  parentId?: string | null
  subItemCount?: number | null
  attachmentCount?: number | null
  linkCount?: number | null
  revision: number
  agentStatus?: RuntimeStatus
}
export type WorkItemOption = { id: string; label: string; color?: string }
export type WorkflowStateDefinition = WorkItemOption & { category?: string }
export type WorkItemCatalog = {
  states: readonly WorkflowStateDefinition[]
  priorities: readonly WorkItemOption[]
  assignees: readonly WorkItemOption[]
  labels: readonly WorkItemOption[]
}
export type WorkItemPatch = Partial<Pick<WorkItemRecord, WorkItemField>>
export type WorkItemsFilters = {
  state: string[]
  priority: string[]
  assignees: string[]
  labels: string[]
}
export type WorkItemsViewState = {
  layout: "list" | "board" | "table"
  query: string
  filters: WorkItemsFilters
  groupBy: "state" | "priority"
  sort: "manual" | "title" | "dueDate" | "priority"
  sortDirection: "asc" | "desc"
  visibleProperties: WorkItemProperty[]
  showEmptyGroups: boolean
}
export type WorkItemsInteraction = {
  selectedIds: readonly string[]
  activeItemId: string | null
  collapsedGroupIds: readonly string[]
}
export type { GroupSnapshot } from "./grouped-items-model"
export type WorkItemCapabilities = {
  canCreate: boolean
  canEditField: (item: WorkItemRecord, field: WorkItemField) => boolean
  canMove: (item: WorkItemRecord, targetGroup: string) => boolean
  reason?: string
}
export type MutationState = {
  operationId: string
  itemId: string
  baseRevision: number
  status: "pending" | "confirmed" | "rejected" | "unknown"
  error?: string
  fieldErrors?: Partial<Record<WorkItemField, string>>
}
export type MoveIntent = {
  operationId: string
  itemId: string
  sourceGroup: string
  targetGroup: string
  beforeId?: string
  afterId?: string
  baseRevision: number
  queryKey: string
  /** Explicit append is allowed only when the caller supplies this capability. */
  append?: boolean
}
export type WorkItemDraft = {
  title: string
  stateId: string
  priorityId: string
}
export type CreateResult = {
  status: "confirmed" | "rejected" | "unknown"
  error?: string
}
export const defaultWorkItemsView: WorkItemsViewState = {
  layout: "list",
  query: "",
  filters: { state: [], priority: [], assignees: [], labels: [] },
  groupBy: "state",
  sort: "manual",
  sortDirection: "asc",
  visibleProperties: ["state", "priority", "assignees", "labels", "dueDate"],
  showEmptyGroups: true,
}
export function isMutationLocked(mutation?: MutationState) {
  return mutation?.status === "pending" || mutation?.status === "unknown"
}
/** Calendar dates stay strings. The caller supplies today's date in its intended timezone. */
export function isOverdue(date: string | null, today?: string) {
  return !!date && !!today && /^\d{4}-\d{2}-\d{2}$/.test(date) && date < today
}
