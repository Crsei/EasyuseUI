"use client"
import { useMemo, useState } from "react"
import { AgentDependencyGraph } from "@/components/blocks/agent-dependency-graph"
import { AgentUsageHistory } from "@/components/blocks/agent-usage-history"
import { AgentRunVirtualList } from "@/components/blocks/agent-run-virtual-list"
import { DataRegion } from "@/components/ui/data-region"
import type { DataState } from "@/lib/runtime-status"
import { useI18n } from "@/lib/i18n-provider"
import { createAgentBoardFixtures } from "./fixtures"
import {
  agentDependencies,
  agentHistory,
  createLargeAgentBoardFixture,
} from "./p2-fixtures"
function P2Demo({ part }: { part: "dependencies" | "history" | "virtual" }) {
  const { locale } = useI18n(),
    en = locale === "en"
  const [data, setData] = useState<DataState>("success")
  const [selected, setSelected] = useState<string | null>(null)
  const records = useMemo(
    () =>
      part === "virtual"
        ? createLargeAgentBoardFixture()
        : createAgentBoardFixtures().runs,
    [part],
  )
  return (
    <div>
      <label>
        {en ? "Data state" : "数据态"}{" "}
        <select
          aria-label={en ? "Data state" : "数据态"}
          value={data}
          onChange={(e) => setData(e.target.value as DataState)}
        >
          {["success", "loading", "empty", "partial", "error"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <DataRegion
        state={data}
        hasContent={data !== "loading" && data !== "empty"}
        onRetry={() => setData("success")}
      >
        {part === "dependencies" && (
          <AgentDependencyGraph
            records={records}
            dependencies={agentDependencies}
            selectedRunId={selected}
            onOpen={setSelected}
          />
        )}
        {part === "history" && (
          <AgentUsageHistory
            points={agentHistory}
            scopeLabel={
              en
                ? "Local timestamped interval fixtures"
                : "本地带时间戳的区间观测"
            }
          />
        )}
        {part === "virtual" && (
          <AgentRunVirtualList
            records={records}
            selectedRunId={selected}
            onOpen={setSelected}
          />
        )}
        {selected && (
          <p role="status">
            {en ? "Selected source run" : "已选来源运行"}: {selected}
          </p>
        )}
      </DataRegion>
    </div>
  )
}
export function AgentDependencyGraphDemo() {
  return <P2Demo part="dependencies" />
}
export function AgentUsageHistoryDemo() {
  return <P2Demo part="history" />
}
export function AgentRunVirtualListDemo() {
  return <P2Demo part="virtual" />
}
