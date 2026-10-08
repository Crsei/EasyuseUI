"use client"
import { useState } from "react"
import { GroupedList } from "@/components/blocks/grouped-list"
import { Board } from "@/components/blocks/item-board"
import { AgentRunProperties } from "@/components/blocks/agent-run-properties"
import { RunStageSummary } from "@/components/blocks/run-stage-summary"
import { AgentRunRow } from "@/components/blocks/agent-run-row"
import { AgentRunCard } from "@/components/blocks/agent-run-card"
import { AgentRunList } from "@/components/blocks/agent-run-list"
import { AgentRunBoard } from "@/components/blocks/agent-run-board"
import { AgentRunInspector } from "@/components/blocks/agent-run-inspector"
import { AttentionQueue } from "@/components/blocks/attention-queue"
import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"
import { ArtifactList, ReviewSummary } from "@/components/blocks/artifact-list"
import { ExecutionTraceTree } from "@/components/blocks/execution-trace-tree"
import { AgentRelationshipList } from "@/components/blocks/agent-relationship-list"
import { AgentUsageSummary } from "@/components/blocks/agent-usage-summary"
import { AgentBoardToolbar } from "@/components/blocks/agent-board-toolbar"
import { DataRegion } from "@/components/ui/data-region"
import { useI18n } from "@/lib/i18n-provider"
import { defaultAgentBoardView } from "@/lib/agent-board-model"
import { runtimeStatuses, type DataState } from "@/lib/runtime-status"
import { useAgentBoardExample } from "./use-agent-board-example"
function Example({ part }: { part: string }) {
  const { locale } = useI18n()
  const en = locale === "en"
  const adapter = useAgentBoardExample()
  const [id, setId] = useState("run-5")
  const [status, setStatus] = useState("waiting")
  const [data, setData] = useState<DataState>("success")
  const [view, setView] = useState(defaultAgentBoardView)
  const [step, setStep] = useState<string>()
  const [expanded, setExpanded] = useState<string[]>(["plan"])
  const fixture = adapter.fixture
  const run = {
    ...(fixture.runs.find((item) => item.runId === id) ?? fixture.runs[4]),
    runtimeStatus: status,
  }
  const detail = {
    run,
    attention: fixture.attention,
    artifacts: fixture.artifacts,
    relationships: fixture.relationships,
    steps: fixture.steps["run-5"] ?? [],
    events: fixture.events["run-5"] ?? [],
  }
  const request = fixture.attention[0]
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <label>
          {en ? "Data state" : "数据态"}
          <select
            aria-label={en ? "Data state" : "数据态"}
            value={data}
            onChange={(e) => setData(e.target.value as DataState)}
          >
            {["success", "loading", "empty", "partial", "error"].map(
              (state) => (
                <option key={state}>{state}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Runtime
          <select
            aria-label="Runtime"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {[...runtimeStatuses, "provider-future"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <DataRegion
        state={data}
        hasContent={data !== "loading"}
        onRetry={() => setData("success")}
      >
        {part === "agent-run-properties" && <AgentRunProperties run={run} />}
        {part === "run-stage-summary" && (
          <RunStageSummary stage={run.stage} status={run.runtimeStatus} />
        )}
        {part === "agent-run-row" && (
          <AgentRunRow run={run} selected={id === run.runId} onOpen={setId} />
        )}
        {part === "agent-run-card" && (
          <div style={{ maxWidth: 320 }}>
            <AgentRunCard
              run={run}
              selected={id === run.runId}
              onOpen={setId}
            />
          </div>
        )}
        {part === "agent-run-list" && (
          <AgentRunList
            records={fixture.runs}
            selectedRunId={id}
            onOpen={setId}
          />
        )}
        {part === "agent-run-board" && (
          <AgentRunBoard
            records={fixture.runs}
            selectedRunId={id}
            onOpen={setId}
          />
        )}
        {part === "agent-run-inspector" && (
          <AgentRunInspector
            snapshot={detail}
            drafts={adapter.drafts}
            onDraftChange={adapter.setDraft}
            onAction={adapter.action}
            canReconcile
            onOpen={setId}
          />
        )}
        {part === "attention-queue" && (
          <AttentionQueue records={fixture.attention} onOpen={setId} />
        )}
        {part === "approval-request-panel" && (
          <ApprovalRequestPanel
            request={request}
            onAction={(action) => adapter.action(request, action)}
            canReconcile
          />
        )}
        {part === "artifact-list" && (
          <ArtifactList records={fixture.artifacts} />
        )}
        {part === "review-summary" && (
          <ReviewSummary review={fixture.artifacts[0].review} />
        )}
        {part === "execution-trace-tree" && (
          <ExecutionTraceTree
            steps={detail.steps}
            selectedStepId={step}
            onSelect={setStep}
            expandedIds={expanded}
            onExpandedChange={setExpanded}
          />
        )}
        {part === "agent-relationship-list" && (
          <AgentRelationshipList
            records={fixture.relationships}
            runId={id}
            onOpen={setId}
          />
        )}
        {part === "agent-usage-summary" && (
          <AgentUsageSummary
            runs={fixture.runs}
            observations={fixture.usage}
            scopeLabel={en ? "Local sample" : "本地样例"}
          />
        )}
        {part === "agent-board-toolbar" && (
          <AgentBoardToolbar
            records={fixture.runs}
            viewState={view}
            onViewChange={setView}
          />
        )}
      </DataRegion>
      <p className="mt-3 text-xs text-muted-foreground">
        {en
          ? "Controlled local example; no real service writes."
          : "受控本地示例；不执行真实服务写入。"}
      </p>
    </div>
  )
}
export function BoardDemo() {
  const { locale } = useI18n()
  const [group, setGroup] = useState("one")
  const items = [{ id: "note", revision: 1, title: "Independent note" }]
  return (
    <div>
      <p>
        {locale === "en"
          ? "Business independent controlled Board"
          : "不依赖任务模型的受控 Board"}
      </p>
      <Board
        items={items}
        groups={[
          {
            key: "one",
            label: "Group A",
            itemIds: group === "one" ? ["note"] : [],
            loadedCount: group === "one" ? 1 : 0,
            dataState: group === "one" ? "success" : "empty",
            queryKey: "notes",
          },
          {
            key: "two",
            label: "Group B",
            itemIds: group === "two" ? ["note"] : [],
            loadedCount: group === "two" ? 1 : 0,
            dataState: group === "two" ? "success" : "empty",
            queryKey: "notes",
          },
        ]}
        getItemId={(item) => item.id}
        getItemLabel={(item) => item.title}
        queryKey="notes"
        canMove={(_, source, target) => source !== target}
        onMove={(move) => setGroup(move.targetGroup)}
        renderItem={(item) => (
          <p className="rounded-lg border p-3">{item.title}</p>
        )}
      />
    </div>
  )
}
export function GroupedListDemo() {
  return (
    <GroupedList
      items={[{ id: "note", title: "Independent note" }]}
      groups={[
        {
          key: "notes",
          label: "Notes",
          itemIds: ["note"],
          loadedCount: 1,
          dataState: "success",
          queryKey: "notes",
        },
      ]}
      getItemId={(item) => item.id}
      renderItem={(item) => <p>{item.title}</p>}
    />
  )
}
export function AgentRunPropertiesDemo() {
  return <Example part="agent-run-properties" />
}
export function RunStageSummaryDemo() {
  return <Example part="run-stage-summary" />
}
export function AgentRunRowDemo() {
  return <Example part="agent-run-row" />
}
export function AgentRunCardDemo() {
  return <Example part="agent-run-card" />
}
export function AgentRunListDemo() {
  return <Example part="agent-run-list" />
}
export function AgentRunBoardDemo() {
  return <Example part="agent-run-board" />
}
export function AgentRunInspectorDemo() {
  return <Example part="agent-run-inspector" />
}
export function AttentionQueueDemo() {
  return <Example part="attention-queue" />
}
export function ApprovalRequestPanelDemo() {
  return <Example part="approval-request-panel" />
}
export function ArtifactListDemo() {
  return <Example part="artifact-list" />
}
export function ReviewSummaryDemo() {
  return <Example part="review-summary" />
}
export function ExecutionTraceTreeDemo() {
  return <Example part="execution-trace-tree" />
}
export function AgentRelationshipListDemo() {
  return <Example part="agent-relationship-list" />
}
export function AgentUsageSummaryDemo() {
  return <Example part="agent-usage-summary" />
}
export function AgentBoardToolbarDemo() {
  return <Example part="agent-board-toolbar" />
}
