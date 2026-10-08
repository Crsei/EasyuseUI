"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { WorkspaceShell } from "@/components/blocks/workspace-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSiteI18n } from "@/components/site/site-i18n"

type Layout = {
  sidebarWidth: number
  sidebarCollapsed: boolean
  inspectorOpen: boolean
  inspectorWidth: number
  bottomPanelOpen: boolean
  bottomPanelHeight: number
}
const defaults: Layout = {
  sidebarWidth: 256,
  sidebarCollapsed: false,
  inspectorOpen: true,
  inspectorWidth: 320,
  bottomPanelOpen: true,
  bottomPanelHeight: 240,
}
const memory = new Map<string, string>()
const eventName = "easyuseui:layout-demo"
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener)
  window.addEventListener(eventName, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(eventName, listener)
  }
}
function parseLayout(source: string): Layout {
  try {
    const value = JSON.parse(source)
    if (!value || typeof value !== "object") return defaults
    const bounded = (
      key: string,
      min: number,
      max: number,
      fallback: number,
    ) =>
      typeof value[key] === "number" && Number.isFinite(value[key])
        ? Math.min(max, Math.max(min, value[key]))
        : fallback
    return {
      sidebarWidth: bounded("sidebarWidth", 200, 400, 256),
      sidebarCollapsed:
        typeof value.sidebarCollapsed === "boolean"
          ? value.sidebarCollapsed
          : false,
      inspectorOpen:
        typeof value.inspectorOpen === "boolean" ? value.inspectorOpen : true,
      inspectorWidth: bounded("inspectorWidth", 300, 360, 320),
      bottomPanelOpen:
        typeof value.bottomPanelOpen === "boolean"
          ? value.bottomPanelOpen
          : true,
      bottomPanelHeight: bounded("bottomPanelHeight", 200, 400, 240),
    }
  } catch {
    return defaults
  }
}
export function ControlledWorkspaceDemo() {
  const { t } = useSiteI18n()
  const [workspace, setWorkspace] = useState("alpha")
  const storageKey = `easyuseui-layout-demo:${workspace}`
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) ?? memory.get(storageKey) ?? ""
      } catch {
        return memory.get(storageKey) ?? ""
      }
    },
    () => "",
  )
  const layout = useMemo(() => parseLayout(raw), [raw])
  const [draft, setDraft] = useState("")
  function change(patch: Partial<Layout>) {
    const next = JSON.stringify({ ...layout, ...patch })
    memory.set(storageKey, next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      /* The example remains usable without storage. */
    }
    window.dispatchEvent(new Event(eventName))
  }
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm">
          {t("site.optimization.workspaceExample")}{" "}
          <select
            aria-label={t("site.optimization.workspaceExample")}
            value={workspace}
            onChange={(event) => setWorkspace(event.target.value)}
            className="h-8 rounded-md border bg-background px-2"
          >
            <option value="alpha">Alpha</option>
            <option value="beta">Beta</option>
          </select>
        </label>
        <Button variant="outline" onClick={() => change(defaults)}>
          {t("site.optimization.resetLayout")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("site.optimization.layoutAdapterNote")}
        </span>
      </div>
      <WorkspaceShell
        title={workspace}
        sidebar={<p>{t("site.optimization.navigationExample")}</p>}
        inspector={<p>{t("site.optimization.inspectorExample")}</p>}
        bottomPanel={<p>{t("site.optimization.bottomExample")}</p>}
        bottomPanelResizable
        sidebarResizable
        sidebarMinWidth={200}
        sidebarMaxWidth={400}
        onSidebarWidthChange={(sidebarWidth) => change({ sidebarWidth })}
        {...layout}
        onSidebarCollapsedChange={(sidebarCollapsed) =>
          change({ sidebarCollapsed })
        }
        onInspectorOpenChange={(inspectorOpen) => change({ inspectorOpen })}
        onInspectorWidthChange={(inspectorWidth) => change({ inspectorWidth })}
        onBottomPanelOpenChange={(bottomPanelOpen) =>
          change({ bottomPanelOpen })
        }
        onBottomPanelHeightChange={(bottomPanelHeight) =>
          change({ bottomPanelHeight })
        }
      >
        <div className="p-5">
          <Input
            aria-label={t("site.optimization.layoutDraft")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
      </WorkspaceShell>
    </div>
  )
}
