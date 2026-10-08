"use client"
import { useEffect, useState } from "react"
import { Bot, LayoutGrid } from "lucide-react"
import styles from "@/components/blocks/agent-board.module.css"
import { useTheme } from "next-themes"
import { AgentBoardWorkspace } from "@/components/blocks/agent-board-workspace"
import { Button } from "@/components/ui/button"
import {
  defaultAgentBoardView,
  type AgentBoardViewState,
} from "@/lib/agent-board-model"
import {
  parseAgentBoardQuery,
  serializeAgentBoardQuery,
} from "@/lib/agent-board-view"
import { useI18n } from "@/lib/i18n-provider"
import {
  useAgentBoardExample,
  type ExampleScenario,
} from "./use-agent-board-example"
import { createAgentBoardFixtures, fixtureTime } from "./fixtures"
export function AgentBoardDemo({ page = false }: { page?: boolean }) {
  const { locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const en = locale === "en"
  const adapter = useAgentBoardExample()
  const [viewState, setView] = useState<AgentBoardViewState>(
    defaultAgentBoardView,
  )
  const [selectedRunId, setRun] = useState<string | null>(null)
  useEffect(() => {
    if (!page) return
    function restore() {
      const parsed = parseAgentBoardQuery(
        new URLSearchParams(window.location.search),
        createAgentBoardFixtures().runs.map((run) => run.runtimeStatus),
      )
      setView(parsed.viewState)
      setRun(parsed.selectedRunId)
    }
    restore()
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [page])
  function navigate(
    view: AgentBoardViewState,
    run: string | null,
    replace = false,
  ) {
    setView(view)
    setRun(run)
    if (page)
      window.history[replace ? "replaceState" : "pushState"](
        null,
        "",
        `${window.location.pathname}?${serializeAgentBoardQuery(view, run)}`,
      )
  }
  const { fixture, scenario } = adapter
  const selected = fixture.runs.find((run) => run.runId === selectedRunId)
  const controls = (
    <details className="my-3 border-b pb-3" data-example-controls>
      <summary className="cursor-pointer text-xs [@media(pointer:coarse)]:min-h-11">
        {en ? "Local example scenarios" : "本地示例场景"}
      </summary>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label>
          {en ? "Scenario" : "切换场景"}
          <select
            className="ml-2 min-h-8 rounded-md border bg-surface px-2 [@media(pointer:coarse)]:min-h-11"
            aria-label={en ? "Scenario" : "切换场景"}
            value={scenario}
            onChange={(event) =>
              adapter.reset(event.target.value as ExampleScenario)
            }
          >
            {(
              [
                ["normal", "正常"],
                ["unknown", "结果未知"],
                ["rejected", "明确拒绝"],
                ["expired", "请求过期"],
                ["readonly", "无处理权限"],
                ["disconnected", "断连"],
                ["error", "刷新失败"],
                ["partial", "部分数据"],
                ["loading", "首次加载"],
                ["empty", "无运行"],
                ["long", "长标题"],
              ] as const
            ).map(([id, name]) => (
              <option key={id} value={id}>
                {en ? id : name}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" onClick={adapter.advance}>
          {en ? "Advance event" : "推进示例事件"}
        </Button>
        <Button variant="secondary" onClick={() => adapter.reset()}>
          {en ? "Reset example" : "恢复初始数据"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {en
            ? "Local deterministic fixtures; responses and usage are simulated. Events advance only on click."
            : "确定性本地数据；审批和用量均为模拟，事件只在点击后推进。"}
        </p>
      </div>
    </details>
  )
  return (
    <AgentBoardWorkspace
      fill={page}
      sidebar={
        <nav
          className={styles.navigation}
          aria-label={en ? "Workspace navigation" : "工作区导航"}
        >
          <a
            className={styles.navigationLink}
            href="/workspace/"
            aria-label="EasyuseUI Workspace"
          >
            <LayoutGrid size={16} aria-hidden="true" />
            <span className={styles.navLabel}>EasyuseUI Workspace</span>
          </a>
          <a
            className={styles.navigationLink}
            href="/workspace/agents/"
            aria-current="page"
            aria-label={en ? "Agent runs" : "Agent 运行看板"}
          >
            <Bot size={16} aria-hidden="true" />
            <span className={styles.navLabel}>
              {en ? "Agent runs" : "Agent 运行看板"}
            </span>
          </a>
        </nav>
      }
      records={scenario === "loading" ? [] : fixture.runs}
      attention={fixture.attention}
      usage={fixture.usage}
      viewState={viewState}
      selectedRunId={selectedRunId}
      onViewChange={(next) =>
        navigate(next, selectedRunId, next.query !== viewState.query)
      }
      onOpen={(id) => navigate(viewState, id)}
      connection={{
        state: scenario === "disconnected" ? "disconnected" : "connected",
        updatedAt: fixtureTime,
      }}
      totalCount={scenario === "partial" ? 20 : fixture.runs.length}
      data={{
        state:
          scenario === "loading"
            ? "loading"
            : scenario === "error"
              ? "error"
              : scenario === "partial"
                ? "partial"
                : "success",
        error:
          scenario === "error"
            ? {
                category: "network",
                message: en ? "Snapshot refresh failed" : "快照刷新失败",
                reason: en ? "Existing data preserved" : "已有运行与产物保留",
              }
            : undefined,
        onRetry: scenario === "error" ? () => adapter.reset() : undefined,
      }}
      detail={
        selected
          ? {
              run: selected,
              attention: fixture.attention,
              artifacts: fixture.artifacts,
              steps: fixture.steps[selected.runId] ?? [],
              relationships: fixture.relationships,
              events: fixture.events[selected.runId] ?? [],
            }
          : null
      }
      inspector={{
        drafts: adapter.drafts,
        onDraftChange: adapter.setDraft,
        onAction: scenario === "readonly" ? undefined : adapter.action,
        canReconcile: true,
      }}
      exampleControls={controls}
      scopeLabel={
        en
          ? "Local sample · current filters · loaded observations only"
          : "本地样例 · 当前筛选 · 仅已加载观测"
      }
      headerActions={
        <>
          <Button
            variant="ghost"
            aria-label="Language"
            onClick={() => setLocale(en ? "zh-CN" : "en")}
          >
            {en ? "中文" : "English"}
          </Button>
          <Button
            variant="ghost"
            aria-label={en ? "Theme" : "主题"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {en ? "Theme" : "主题"}
          </Button>
        </>
      }
    />
  )
}
