"use client"
import { useSyncExternalStore } from "react"
const event = "easyuseui:site-query"
const subscribe = (listener: () => void) => {
  window.addEventListener("popstate", listener)
  window.addEventListener(event, listener)
  return () => {
    window.removeEventListener("popstate", listener)
    window.removeEventListener(event, listener)
  }
}
const snapshot = () => window.location.search
export function useSiteQuery() {
  const search = useSyncExternalStore(subscribe, snapshot, () => "")
  return {
    params: new URLSearchParams(search),
    update(values: Record<string, string | undefined>) {
      const next = new URLSearchParams(window.location.search)
      for (const [key, value] of Object.entries(values)) {
        if (!value || value === "all") next.delete(key)
        else next.set(key, value)
      }
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${next.size ? `?${next}` : ""}${window.location.hash}`,
      )
      window.dispatchEvent(new Event(event))
    },
  }
}
