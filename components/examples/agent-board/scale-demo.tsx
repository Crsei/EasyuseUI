"use client"
import { useEffect, useMemo, useState } from "react"
import { AgentBoardWorkspace } from "@/components/blocks/agent-board-workspace"
import { defaultAgentBoardView } from "@/lib/agent-board-model"
import type { AgentBoardViewState } from "@/lib/agent-board-model"
import {
  parseAgentBoardQuery,
  serializeAgentBoardQuery,
} from "@/lib/agent-board-view"
import { useI18n } from "@/lib/i18n-provider"
import { Button } from "@/components/ui/button"
import { createLargeAgentBoardFixture } from "./p2-fixtures"
export function AgentScaleDemo() {
  const { locale, setLocale } = useI18n(),
    en = locale === "en"
  const records = useMemo(() => createLargeAgentBoardFixture(), [])
  const [view, setView] = useState<AgentBoardViewState>({
    ...defaultAgentBoardView,
    view: "list",
  })
  const [mode, setMode] = useState("virtual")
  const [selected, setSelected] = useState<string | null>(null)
  const run = records.find((record) => record.runId === selected)
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search)
      if (!params.has("view")) params.set("view", "list")
      const parsed = parseAgentBoardQuery(params)
      setView(parsed.viewState)
      setSelected(parsed.selectedRunId)
      setMode(params.get("mode") === "native" ? "native" : "virtual")
    }
    restore()
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])
  function navigate(
    next: AgentBoardViewState,
    id: string | null,
    nextMode = mode,
    replace = false,
  ) {
    setView(next)
    setSelected(id)
    setMode(nextMode)
    const params = new URLSearchParams(serializeAgentBoardQuery(next, id))
    params.set("mode", nextMode)
    window.history[replace ? "replaceState" : "pushState"](
      null,
      "",
      `?${params}`,
    )
  }
  return (
    <AgentBoardWorkspace
      fill
      records={records}
      attention={[]}
      viewState={view}
      onViewChange={(next) =>
        navigate(next, selected, mode, next.query !== view.query)
      }
      selectedRunId={selected}
      onOpen={(id) => navigate(view, id)}
      connection={{ state: "connected", updatedAt: "2026-10-08T08:00:00Z" }}
      totalCount={records.length}
      listVirtualization={{ enabled: mode === "virtual", height: 560 }}
      detail={
        run
          ? {
              run,
              attention: [],
              artifacts: [],
              steps: [],
              events: [],
              relationships: [],
            }
          : null
      }
      scopeLabel={
        en
          ? "Local large collection · 1000 loaded runs"
          : "本地大集合 · 1000 条已加载运行"
      }
      headerActions={
        <Button
          variant="ghost"
          aria-label="Language"
          onClick={() => setLocale(en ? "zh-CN" : "en")}
        >
          {en ? "中文" : "English"}
        </Button>
      }
      exampleControls={
        <details data-scale-controls>
          <summary>
            {en ? "Large collection example" : "大数据列表示例"}
          </summary>
          <p className="text-xs">
            {en
              ? "Same source rows, grouping and viewport. Compare mounted rows; no service or latency claims."
              : "相同来源行、分组和视口；比较已挂载行数量，不代表服务性能或延迟。"}
          </p>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(view, selected, mode === "native" ? "virtual" : "native")
            }
          >
            {en ? "Toggle list rendering" : "切换列表渲染"}: {mode}
          </Button>
          <a
            className="ml-3 text-sm text-primary underline"
            href="/workspace/agents/"
          >
            {en ? "Back to sample runs" : "返回运行样例"}
          </a>
        </details>
      }
    />
  )
}
