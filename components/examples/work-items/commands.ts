import { applyLocalMove } from "@/lib/work-items-view"
import type {
  MoveIntent,
  WorkItemPatch,
  WorkItemRecord,
  WorkItemsViewState,
} from "@/lib/work-items-model"
export type LocalOperation =
  | { kind: "patch"; itemId: string; patch: WorkItemPatch; revision: number }
  | { kind: "move"; intent: MoveIntent; groupBy: WorkItemsViewState["groupBy"] }
export function applyOperation(
  items: readonly WorkItemRecord[],
  operation: LocalOperation,
) {
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
