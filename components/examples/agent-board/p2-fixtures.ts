import type {
  AgentRunDependency,
  AgentUsageHistoryPoint,
} from "@/lib/agent-board-model"
import { createAgentBoardFixtures } from "./fixtures"
export const agentDependencies: AgentRunDependency[] = [
  {
    dependencyId: "dependency-plan-build",
    revision: 2,
    prerequisiteRunId: "run-1",
    dependentRunId: "run-5",
    label: "批准实施方案",
    state: "blocked",
  },
  {
    dependencyId: "dependency-build-review",
    revision: 1,
    prerequisiteRunId: "run-5",
    dependentRunId: "run-8",
    label: "报告审阅",
    state: "unknown",
  },
  {
    dependencyId: "dependency-review-release",
    revision: 1,
    prerequisiteRunId: "run-8",
    dependentRunId: "run-11",
    label: "发布验收",
    state: "blocked",
  },
  {
    dependencyId: "dependency-external",
    revision: 1,
    prerequisiteRunId: "external-run-not-loaded",
    dependentRunId: "run-5",
    label: "外部来源未加载",
    state: "unknown",
  },
]
export const agentHistory: AgentUsageHistoryPoint[] = Array.from(
  { length: 6 },
  (_, i) => [
    {
      pointId: `history-tokens-${i}`,
      revision: 1,
      runId: "run-5",
      intervalStart: `2026-10-08T08:${String(i * 5).padStart(2, "0")}:00Z`,
      timestamp: `2026-10-08T08:${String((i + 1) * 5).padStart(2, "0")}:00Z`,
      metric: "tokens" as const,
      value: i === 2 ? undefined : 1200 + i * 100,
      estimated: i === 4,
    },
    {
      pointId: `history-usd-${i}`,
      revision: 1,
      runId: "run-5",
      intervalStart: `2026-10-08T08:${String(i * 5).padStart(2, "0")}:00Z`,
      timestamp: `2026-10-08T08:${String((i + 1) * 5).padStart(2, "0")}:00Z`,
      metric: "cost" as const,
      value: 0.01 + i * 0.002,
      currency: "USD",
    },
    {
      pointId: `history-eur-${i}`,
      revision: 1,
      runId: "run-8",
      intervalStart: `2026-10-08T08:${String(i * 5).padStart(2, "0")}:00Z`,
      timestamp: `2026-10-08T08:${String((i + 1) * 5).padStart(2, "0")}:00Z`,
      metric: "cost" as const,
      value: 0.02 + i * 0.001,
      currency: "EUR",
    },
    {
      pointId: `history-duration-${i}`,
      revision: 1,
      runId: "run-5",
      intervalStart: `2026-10-08T08:${String(i * 5).padStart(2, "0")}:00Z`,
      timestamp: `2026-10-08T08:${String((i + 1) * 5).padStart(2, "0")}:00Z`,
      metric: "durationMs" as const,
      value: i === 3 ? 0 : 45000 + i * 1000,
    },
  ],
).flat()
export function createLargeAgentBoardFixture(count = 1000) {
  const source = createAgentBoardFixtures().runs[4]
  return Array.from({ length: count }, (_, i) => ({
    ...source,
    runId: `bulk-${String(i + 1).padStart(4, "0")}`,
    title:
      i === 501 ? "很长的运行标题 ".repeat(30) : `Large source run ${i + 1}`,
    runtimeStatus: "waiting",
    revision: 1,
    stage: {
      ...source.stage,
      waitingReason:
        i === 501 ? "来源给出的详细等待原因 ".repeat(20) : "等待来源确认",
    },
  }))
}
