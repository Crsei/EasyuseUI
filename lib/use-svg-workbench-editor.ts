"use client"
import { useReducer, useState } from "react"
import {
  applySvgCommand,
  blankSvgDocument,
  serializeSvg,
  type SvgDocument,
  type EditCommand,
} from "./svg-workbench-model"
import { parseSvg } from "./svg-workbench-parse"
type History = {
  document: SvgDocument
  past: SvgDocument[]
  future: SvgDocument[]
}
type Action =
  { type: "command"; command: EditCommand } | { type: "undo" | "redo" }
function reduce(state: History, action: Action): History {
  if (action.type === "command") {
    const next = applySvgCommand(state.document, action.command)
    if (
      next === state.document ||
      parseSvg(serializeSvg(next)).diagnostics.length
    )
      return state
    return {
      document: next,
      past: [...state.past.slice(-49), state.document],
      future: [],
    }
  }
  const from = action.type === "undo" ? state.past : state.future
  const snapshot = from.at(-1)
  if (!snapshot) return state
  return {
    document: { ...snapshot, revision: state.document.revision + 1 },
    past:
      action.type === "undo"
        ? from.slice(0, -1)
        : [...state.past, state.document],
    future:
      action.type === "redo"
        ? from.slice(0, -1)
        : [...state.future, state.document],
  }
}
/** Optional local adapter. History is bounded; revisions remain monotonic. */
export function useSvgWorkbenchEditor(initialDocument?: SvgDocument) {
  const [history, dispatch] = useReducer(reduce, {
    document: initialDocument ?? blankSvgDocument(),
    past: [],
    future: [],
  })
  const [selectedIds, onSelectionChange] = useState<string[]>([])
  return {
    document: history.document,
    selectedIds,
    onSelectionChange,
    onCommand: (command: EditCommand) => dispatch({ type: "command", command }),
    onUndo: () => {
      dispatch({ type: "undo" })
      onSelectionChange([])
    },
    onRedo: () => {
      dispatch({ type: "redo" })
      onSelectionChange([])
    },
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
