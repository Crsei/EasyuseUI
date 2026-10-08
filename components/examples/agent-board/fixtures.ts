import { runtimeStatuses } from "@/lib/runtime-status"
import type {
  AgentRunSnapshot,
  AttentionRecord,
  ArtifactRecord,
  UsageObservation,
  TraceStep,
  RunRelationship,
} from "@/lib/agent-board-model"
import type { ActivityEvent } from "@/components/blocks/activity-timeline"
export const fixtureTime = "2026-10-08T08:00:00Z"
export function createAgentBoardFixtures() {
  const runs: AgentRunSnapshot[] = [...runtimeStatuses, "provider-future"].map(
    (status, index) => ({
      runId: `run-${index + 1}`,
      title:
        [
          "等待资源分配",
          "启动文档索引",
          "实现组件契约",
          "整理审阅证据",
          "等待发布审批",
          "核对接口输入",
          "因依赖暂停",
          "生成组件报告；运行完成但尚未验收",
          "安装依赖失败",
          "用户取消本次尝试",
          "来源报告未知状态",
        ][index] ?? "Agent 待命快照",
      agentId: index % 2 ? "agent-review" : "agent-builder",
      agentName: index % 2 ? "Review Agent" : "Builder Agent",
      agentStatus: index % 2 ? "idle" : "running",
      model: index === 10 ? undefined : index % 2 ? "Model B" : "Model A",
      sessionId: `session-${(index % 3) + 1}`,
      sessionTitle: `本地示例会话 ${(index % 3) + 1}`,
      sessionHref: "/docs/session-row/",
      workItemRef:
        index % 3
          ? {
              id: `work-${index % 3}`,
              title: `UI-${index + 1} · ${status} 组件交付`,
              href: "/docs/item/",
              state: "In review",
            }
          : undefined,
      runtimeStatus: status,
      revision: 1,
      source: "local-fixture",
      completeness: index === 10 ? "partial" : "complete",
      updatedAt: fixtureTime,
      queuedAt: fixtureTime,
      startedAt: index > 1 ? "2026-10-08T07:55:00Z" : undefined,
      endedAt: index > 6 && index < 10 ? fixtureTime : undefined,
      stage: {
        name:
          status === "running"
            ? "编译与检查"
            : status === "thinking"
              ? "来源报告的规划阶段"
              : undefined,
        completedSteps: status === "running" ? 3 : undefined,
        totalSteps: status === "running" ? 5 : undefined,
        planVersion: status === "running" ? "v1" : undefined,
        durationMs: index > 1 ? 300000 : undefined,
        waitingReason:
          status === "waiting"
            ? "需要输入确认 API 范围"
            : status === "paused"
              ? "依赖构建尚未完成"
              : undefined,
      },
      attempt: 1,
      artifactCount: index === 7 ? 2 : undefined,
      toolCount: index === 2 ? 3 : undefined,
      error: status === "failed" ? "构建退出码 1；保留已生成报告。" : undefined,
      review:
        status === "completed"
          ? {
              state: "unreviewed",
              acceptance: "pending",
              pr: {
                state: "created",
                href: "https://github.com/Crsei/EasyuseUI",
              },
            }
          : undefined,
    }),
  )
  // Same agent, separate run identity; retry and parent references are explicit.
  runs[3].parentRunId = "run-3"
  runs[8].previousRunId = "run-8"
  runs[8].attempt = 2
  const attention: AttentionRecord[] = [
    {
      attentionId: "attention-approval",
      runId: "run-5",
      revision: 1,
      kind: "approval",
      title: "批准写入示例报告",
      reason: "调用方要求人工审批",
      target: "reports/agent-board.md",
      scope: "覆盖单个本地示例文件",
      risk: "覆盖已有内容",
      deadline: "2026-10-08T10:00:00Z",
      allowedActions: ["accept", "reject"],
      tool: {
        id: "tool-write",
        name: "write_report",
        arguments: {
          path: "reports/agent-board.md",
          token: "demo-private-token",
        },
      },
    },
    {
      attentionId: "attention-input",
      runId: "run-6",
      revision: 1,
      kind: "input",
      title: "确认目标 API 范围",
      reason: "等待调用方补充输入",
      allowedActions: ["respond", "ignore"],
      parameters: {
        question: "Which API?",
        authorization: "Bearer demo-secret",
      },
    },
    {
      attentionId: "attention-second",
      runId: "run-6",
      revision: 1,
      kind: "approval",
      title: "审阅测试输出",
      reason: "同一运行的第二个独立请求",
      allowedActions: [],
      disabledReason: "当前适配器只开放阅读",
    },
    {
      attentionId: "attention-failure",
      runId: "run-9",
      revision: 1,
      kind: "failure",
      title: "构建失败需要检查",
      reason: "请查看来源错误；不自动重试执行",
      allowedActions: [],
    },
    {
      attentionId: "attention-unknown",
      runId: "run-10",
      revision: 1,
      kind: "unknown",
      title: "取消回执未确认",
      reason: "来源尚未确认取消结果",
      allowedActions: [],
      operation: { state: "unknown" },
    },
  ]
  const artifacts: ArtifactRecord[] = [
    {
      artifactId: "artifact-report",
      runId: "run-8",
      name: "组件实现报告.md",
      kind: "report",
      href: "/docs/agent-board-workspace/",
      createdAt: fixtureTime,
      availability: "available",
      review: { state: "unreviewed", acceptance: "pending" },
    },
    {
      artifactId: "artifact-removed",
      runId: "run-8",
      name: "旧版截图.png",
      kind: "image",
      createdAt: fixtureTime,
      availability: "removed",
      review: { state: "changes-requested", acceptance: "rejected" },
    },
  ]
  const usage: UsageObservation[] = [
    {
      observationId: "usage-parent",
      runId: "run-3",
      timestamp: fixtureTime,
      tokens: 12000,
      cost: 0.12,
      currency: "USD",
      durationMs: 300000,
      inclusion: "inclusive",
      includesRunIds: ["run-4"],
    },
    {
      observationId: "usage-child",
      runId: "run-4",
      timestamp: fixtureTime,
      tokens: 2000,
      cost: 0.02,
      currency: "USD",
      inclusion: "exclusive",
    },
    {
      observationId: "usage-eur",
      runId: "run-8",
      timestamp: fixtureTime,
      cost: 0.08,
      currency: "EUR",
      inclusion: "exclusive",
      estimated: true,
    },
    {
      observationId: "usage-unknown",
      runId: "run-9",
      timestamp: fixtureTime,
      tokens: 500,
      inclusion: "unknown",
    },
  ]
  const steps: Record<string, TraceStep[]> = {
    "run-5": [
      {
        stepId: "plan",
        name: "计划",
        status: "completed",
        summary: "来源提供的阶段摘要，不是模型内部思维。",
      },
      {
        stepId: "write",
        parentStepId: "plan",
        name: "写入报告",
        status: "waiting",
        tool: {
          id: "trace-write",
          name: "write_report",
          arguments: {
            token: "private-trace-secret",
            path: "reports/agent-board.md",
          },
          output: "demo line\n".repeat(250),
        },
      },
    ],
  }
  const relationships: RunRelationship[] = [
    {
      id: "relationship-child",
      sourceRunId: "run-3",
      targetRunId: "run-4",
      kind: "child",
      label: "构建运行 → 审阅子运行",
    },
    {
      id: "relationship-retry",
      sourceRunId: "run-8",
      targetRunId: "run-9",
      kind: "handoff",
      label: "报告运行 → 安装检查尝试",
    },
  ]
  const events: Record<string, ActivityEvent[]> = {
    "run-5": [
      {
        id: "event-initial",
        time: fixtureTime,
        agent: "Builder Agent",
        type: "tool",
        action: "请求写入审批",
        status: "waiting",
      },
    ],
  }
  return { runs, attention, artifacts, usage, steps, relationships, events }
}
