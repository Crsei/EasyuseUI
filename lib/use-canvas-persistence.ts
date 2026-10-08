"use client"
import { useI18n } from "@/lib/i18n-provider"
import { useEffect, useSyncExternalStore } from "react"
import type { CanvasDocument } from "@/lib/canvas-model"
import type { CanvasPersistenceSession } from "@/lib/canvas-services"
/** Caller retains one CAS session per document, including unknown outcomes across remounts. */
export function useCanvasPersistence(
  document: CanvasDocument,
  session: CanvasPersistenceSession,
  autosave = false,
) {
  const { resolve } = useI18n()
  const state = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  )
  useEffect(() => session.setDocument(document), [session, document])
  useEffect(() => {
    if (!autosave || state.status !== "dirty") return
    const timer = setTimeout(() => void session.save(), 600)
    return () => clearTimeout(timer)
  }, [session, autosave, state])
  return {
    state: {
      ...state,
      message:
        state.message === undefined
          ? undefined
          : resolve(state.messageI18n, state.message),
    },
    save: session.save,
    query: session.query,
    resolveConflict: session.resolveConflict,
  }
}
export type CanvasPersistenceController = ReturnType<
  typeof useCanvasPersistence
>
