import type { DraftState, SessionSnapshot } from "@/lib/agent-workbench-model"
import type { parseShowcaseQuery } from "./showcase-model"

export type WorkbenchViewProps = {
  session: SessionSnapshot
  draft: DraftState
  setDraft: (draft: DraftState) => void
  query: ReturnType<typeof parseShowcaseQuery>
  navigate: (patch: Record<string, string>, replace?: boolean) => void
}
