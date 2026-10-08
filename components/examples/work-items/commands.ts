import { applyLocalMove } from "@/lib/work-items-view"
import type {
  MoveIntent,
  WorkItemPatch,
  WorkItemRecord,
  WorkItemsViewState,
} from "@/lib/work-items-model"
export type LocalOperation =
  | {
      kind: "reorder"
      itemId: string
      revision: number
      beforeId?: string
      afterId?: string
    }
  | { kind: "patch"; itemId: string; patch: WorkItemPatch; revision: number }
  | { kind: "move"; intent: MoveIntent; groupBy: WorkItemsViewState["groupBy"] }
export function applyOperation(
  items: readonly WorkItemRecord[],
  operation: LocalOperation,
) {
  if (operation.kind === "reorder") {
    const item = items.find((row) => row.id === operation.itemId)
    if (!item || item.revision !== operation.revision) return [...items]
    const next = items.filter((row) => row.id !== item.id),
      index = operation.beforeId
        ? next.findIndex((row) => row.id === operation.beforeId)
        : next.findIndex((row) => row.id === operation.afterId) + 1
    if (index < 0) return [...items]
    next.splice(index, 0, { ...item, revision: item.revision + 1 })
    return next
  }
  if (operation.kind === "move")
    return applyLocalMove(items, operation.intent, operation.groupBy)
  return items.map((item) =>
    item.id === operation.itemId && item.revision === operation.revision
      ? { ...item, ...operation.patch, revision: item.revision + 1 }
      : item,
  )
}
export const fixtureDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 120))
