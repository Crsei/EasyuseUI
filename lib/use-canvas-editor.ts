"use client"

import { useState } from "react"
import {
  emptyCanvasSelection,
  type CanvasCommand,
  type CanvasConnectionPolicy,
  type CanvasDocument,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"
import {
  applyCanvasCommand,
  commitCanvasHistory,
  createCanvasHistory,
  stepCanvasHistory,
} from "@/lib/canvas-commands"

/** Optional local adapter. Persistence, service reconciliation and execution stay with the caller. */
export function useCanvasEditor(
  initial: CanvasDocument,
  definitions: CanvasNodeDefinition[],
  options?: { readOnly?: boolean; policy?: CanvasConnectionPolicy },
) {
  const [state, setState] = useState(() => ({
    history: createCanvasHistory(initial),
    selection: emptyCanvasSelection,
    feedback: "",
  }))
  function onCommand(command: CanvasCommand) {
    setState((current) => {
      const result = applyCanvasCommand(
        current.history.document,
        command,
        definitions,
        options,
      )
      const preserveSelection = [
        "move",
        "move-frame",
        "move-note",
        "update-note",
      ].includes(command.type)
      return {
        history: result.ok
          ? commitCanvasHistory(current.history, result.document)
          : current.history,
        selection:
          result.ok && !preserveSelection
            ? result.selection
            : current.selection,
        feedback: result.message,
      }
    })
  }
  function step(direction: "undo" | "redo") {
    if (options?.readOnly) return
    setState((current) => ({
      history: stepCanvasHistory(current.history, direction),
      selection: emptyCanvasSelection,
      feedback: direction === "undo" ? "已撤销本地编辑。" : "已重做本地编辑。",
    }))
  }
  return {
    document: state.history.document,
    selection: state.selection,
    onSelectionChange: (selection: typeof state.selection) =>
      setState((current) => ({ ...current, selection })),
    onCommand,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    onUndo: () => step("undo"),
    onRedo: () => step("redo"),
    feedback: state.feedback,
  }
}
