import type {
  WorkbenchState,
  SessionSnapshot,
  DraftState,
  ContextReference,
  ChangeSet,
} from "@/lib/agent-workbench-model"
export const reportBody =
  "# 过滤逻辑分析报告\n\n来源快照：src/filter.ts @a1。建议统一大小写后再比较。\n\n本地生成示例；审阅与交付验收仍待确认。"
export const models = [
  { id: "fixture-model", label: "Local demonstration model" },
  {
    id: "provider",
    label: "Provider adapter",
    disabledReason: "Not connected",
  },
]
export const permissions = [
  { id: "ask", label: "Ask before writes" },
  { id: "read", label: "Read only" },
]
export const environments = [{ id: "local-demo", label: "Local fixture" }]
export const references: ContextReference[] = [
  {
    id: "ref-filter",
    kind: "file",
    label: "src/filter.ts",
    source: "src/filter.ts",
    version: "a1",
    availability: "available",
    included: true,
    removable: true,
    usage: {
      value: 240,
      unit: "tokens",
      source: "fixture estimate",
      estimated: true,
    },
  },
  {
    id: "ref-rules",
    kind: "rule",
    label: "Project conventions",
    source: "AGENTS.md",
    version: "a1",
    availability: "available",
    included: true,
    removable: true,
  },
  {
    id: "ref-report",
    kind: "link",
    label: "Research notes",
    source: "fixture://report",
    availability: "available",
    included: true,
    removable: true,
  },
  {
    id: "ref-stale",
    kind: "selection",
    label: "Outdated selection",
    source: "src/legacy.ts:10-20",
    version: "old",
    availability: "stale",
    included: true,
    removable: true,
    reason: "Source changed",
  },
  {
    id: "ref-denied",
    kind: "file",
    label: "Private source",
    source: "private/config",
    availability: "denied",
    included: false,
    removable: false,
    reason: "Caller does not grant read access",
  },
]
references.push(
  {
    id: "ref-skill",
    kind: "skill",
    label: "Review guidance",
    source: "skills/review/SKILL.md",
    version: "fixture-1",
    availability: "available",
    included: true,
    removable: true,
  },
  {
    id: "ref-image",
    kind: "image",
    label: "pixel.png",
    source: "fixtures/pixel.png",
    version: "fixture-1",
    availability: "available",
    included: true,
    removable: true,
  },
)
export const changes: ChangeSet = {
  repositoryId: "repo-demo",
  scope: "Local fixture changes",
  base: "a1",
  head: "b1",
  revision: "diff-1",
  files: [
    {
      fileId: "file-filter",
      path: "src/filter.ts",
      kind: "modified",
      content:
        "export function filter(items: string[], query: string) {\n  return items.filter(item => item.toLowerCase().includes(query.toLowerCase()))\n}",
      lines: [
        {
          id: "line-1",
          kind: "context",
          text: "export function filter(items: string[], query: string) {",
          oldLine: 1,
          newLine: 1,
        },
        {
          id: "line-2",
          kind: "remove",
          text: "  return items.filter(item => item.includes(query))",
          oldLine: 2,
        },
        {
          id: "line-3",
          kind: "add",
          text: "  return items.filter(item => item.toLowerCase().includes(query.toLowerCase()))",
          newLine: 2,
        },
        { id: "line-4", kind: "context", text: "}", oldLine: 3, newLine: 3 },
      ],
    },
    {
      fileId: "file-test",
      path: "tests/filter.test.ts",
      kind: "added",
      lines: [
        {
          id: "test-1",
          kind: "add",
          text: "expect(filter(['Alpha'], 'alpha')).toEqual(['Alpha'])",
          newLine: 1,
        },
      ],
    },
    {
      fileId: "file-rename",
      path: "docs/filter-guide.md",
      previousPath: "docs/filter.md",
      kind: "renamed",
      lines: [
        {
          id: "guide-1",
          kind: "context",
          text: "# Filtering guide",
          oldLine: 1,
          newLine: 1,
        },
      ],
    },
    {
      fileId: "file-delete",
      path: "src/old-filter.ts",
      kind: "deleted",
      lines: [
        {
          id: "delete-1",
          kind: "remove",
          text: "export const oldFilter = true",
          oldLine: 1,
        },
      ],
    },
    {
      fileId: "file-binary",
      path: "assets/example.png",
      kind: "binary",
      lines: [],
    },
  ],
}
export function makeDraft(id: string): DraftState {
  return {
    draftId: `draft-${id}`,
    version: 0,
    text: "",
    context: [],
    modelId: "fixture-model",
    permissionId: "ask",
    environmentId: "local-demo",
    mode: "send",
  }
}
function session(id: string, title: string, status: string): SessionSnapshot {
  return {
    sessionId: id,
    source: "local fixture",
    agent: { id: "fixture-agent", name: "Fixture Agent" },
    projectId: "project-demo",
    threadId: `thread-${id}`,
    title,
    activeRunId: `run-${id}`,
    revision: 1,
    cursor: 1,
    status,
    updatedAt: "2026-10-09T09:00:00+08:00",
    environment: {
      environmentId: "local-demo",
      name: "Local fixture",
      branch: "feature/filter",
      connection: "connected",
      capabilities: ["read", "approval", "review"],
    },
    capabilities: { send: true, queue: true, steer: true, interrupt: true },
    contextSources: references.slice(0, 2).map((reference) => ({
      ...reference,
      included: false,
      removable: false,
    })),
    messages: [
      {
        messageId: `message-${id}-1`,
        turnId: `turn-${id}-1`,
        role: "user",
        sequence: 1,
        revision: 1,
        state: "completed",
        parts: [
          {
            partId: `part-${id}-1`,
            sequence: 1,
            revision: 1,
            kind: "text",
            text: title,
          },
        ],
      },
      {
        messageId: `message-${id}-2`,
        turnId: `turn-${id}-1`,
        role: "agent",
        sequence: 2,
        revision: 1,
        state: "completed",
        parts: [
          {
            partId: `part-${id}-2`,
            sequence: 1,
            revision: 1,
            kind: "text",
            text: "## Plan\n\nInspect filtering, add a focused test, then review the change.\n\n```ts\nfilter(['Alpha'], 'alpha')\n```",
          },
          {
            partId: `part-${id}-plan`,
            sequence: 2,
            revision: 1,
            kind: "plan",
            referenceId: "plan-1",
            label: "Review the plan",
          },
          {
            partId: `tool-part-${id}`,
            sequence: 3,
            revision: 1,
            kind: "tool",
            referenceId: `tool-${id}`,
            label: "run_tests",
          },
          {
            partId: `file-part-${id}`,
            sequence: 4,
            revision: 1,
            kind: "citation",
            referenceId: "file-filter",
            label: "src/filter.ts",
          },
        ],
      },
    ],
    history: { hasMore: true, cursor: "page-1" },
    tools: [
      {
        id: `tool-${id}`,
        name: "run_tests",
        status:
          status === "waiting"
            ? "waiting"
            : status === "failed"
              ? "failed"
              : "running",
        target: "tests/filter.test.ts",
        arguments: { command: "test filter", token: "secret-demo-value" },
        output:
          status === "failed"
            ? "FAIL: expected Alpha, got []"
            : "Source has not reported a result",
        exitCode: status === "failed" ? 1 : undefined,
      },
    ],
    attention: [],
    artifacts: [],
    changes: structuredClone(changes),
    plan: [
      { id: "plan-1", title: "Inspect existing filter", status: "completed" },
      {
        id: "plan-2",
        title: "Run focused tests",
        status,
        toolId: `tool-${id}`,
      },
      { id: "plan-3", title: "Review files and report", status: "idle" },
    ],
    output: {
      text:
        status === "failed"
          ? "FAIL filter is case sensitive\nExpected ['Alpha']\nReceived []\nexit code 1"
          : "Awaiting source test result",
      source: "Local fixture test output",
      timestamp: "2026-10-09T09:00:00+08:00",
    },
    dataState: "success",
  }
}
export function initialWorkbench(): WorkbenchState {
  const sessions = [
    session("session-filter", "修复大小写过滤逻辑", "running"),
    session("session-report", "分析资料并整理报告", "waiting"),
    session(
      "session-failure",
      "检查失败测试与长路径 src/features/search/filters",
      "failed",
    ),
  ]
  sessions[1].tools = [
    {
      ...sessions[1].tools[0],
      name: "write_report",
      target: "reports/summary.md",
      arguments: { path: "reports/summary.md" },
      output: "Source has not confirmed report generation",
    },
  ]
  sessions[1].plan = [
    {
      id: "plan-analysis",
      title: "Analyze source references",
      status: "completed",
    },
    {
      id: "plan-report",
      title: "Generate report artifact",
      status: "waiting",
      toolId: sessions[1].tools[0].id,
    },
    {
      id: "plan-report-review",
      title: "Review source citations",
      status: "idle",
    },
  ]
  sessions[1].messages[1].parts = [
    {
      partId: "part-session-report-2",
      sequence: 1,
      revision: 1,
      kind: "text",
      text: "Analyze supplied sources, draft a report, then review citations. No code execution is requested.",
    },
    {
      partId: "part-session-report-plan",
      sequence: 2,
      revision: 1,
      kind: "plan",
      referenceId: "plan-analysis",
      label: "Review report plan",
    },
  ]
  sessions[1].output = {
    ...sessions[1].output,
    text: "Awaiting report source confirmation",
    source: "Local fixture report output",
  }
  sessions[1].attention = [
    {
      attentionId: "approval-report",
      runId: sessions[1].activeRunId,
      revision: 1,
      kind: "approval",
      title: "Write report artifact",
      reason: "The task requests a local report",
      scope: "reports/summary.md only",
      risk: "Creates one local fixture artifact",
      target: "reports/summary.md",
      allowedActions: ["accept", "reject"],
      tool: {
        id: sessions[1].tools[0].id,
        name: "write_report",
        status: "waiting",
        arguments: { path: "reports/summary.md" },
      },
    },
    {
      attentionId: "question-report",
      runId: sessions[1].activeRunId,
      revision: 1,
      kind: "input",
      title: "Choose report audience",
      reason: "Who should read the report?",
      allowedActions: ["respond"],
    },
  ]
  sessions[2].attention = [
    {
      attentionId: "failure-test",
      runId: sessions[2].activeRunId,
      revision: 1,
      kind: "failure",
      title: "Case sensitivity test failed",
      reason: "Exit code 1; inspect source output before continuing",
      allowedActions: ["ignore"],
    },
  ]
  sessions[1].artifacts = [
    {
      artifactId: "artifact-report",
      runId: sessions[1].activeRunId,
      name: "summary.md",
      kind: "report",
      createdAt: sessions[1].updatedAt,
      availability: "available",
      review: {
        state: "unreviewed",
        acceptance: "pending",
        evidence: "Local fixture; business acceptance has not occurred",
      },
    },
  ]
  sessions[1].artifacts.push(
    ...[
      {
        artifactId: "artifact-code",
        resourceId: "file-filter",
        name: "filter.ts",
        kind: "code",
      },
      {
        artifactId: "artifact-table",
        resourceId: "resource-csv",
        name: "results.csv",
        kind: "table",
      },
      {
        artifactId: "artifact-image",
        resourceId: "resource-image",
        name: "pixel.png",
        kind: "image",
      },
    ].map((artifact) => ({
      ...artifact,
      runId: sessions[1].activeRunId,
      availability: "available" as const,
      review: { state: "unreviewed" as const, acceptance: "pending" as const },
    })),
  )
  sessions[1].messages.push({
    messageId: "artifact-source-session-report",
    turnId: "turn-session-report-1",
    sequence: 3,
    revision: 1,
    role: "agent",
    state: "completed",
    parts: [
      {
        partId: "artifact-source-part",
        sequence: 1,
        revision: 1,
        kind: "artifact",
        referenceId: "artifact-report",
        label: "summary.md",
      },
    ],
  })
  const drafts = Object.fromEntries(
    sessions.map((s) => [s.sessionId, makeDraft(s.sessionId)]),
  )
  drafts["session-filter"].mode = "steer"
  drafts["session-report"].mode = "queue"
  drafts.new = makeDraft("new")
  return {
    projects: [
      {
        projectId: "project-demo",
        name: "EasyuseUI / Agent workspace",
        repositoryId: "repo-demo",
        directory: "fixture/project",
      },
      {
        projectId: "project-empty",
        name: "Empty project",
        repositoryId: "repo-empty",
        readOnly: true,
      },
      {
        projectId: "project-new",
        name: "New research project",
        repositoryId: "repo-new",
        directory: "fixture/research",
      },
    ],
    sessions,
    drafts,
    receipts: [],
    panels: {
      activePanel: "context",
      selectedFileId: "file-filter",
      sidebarCollapsed: false,
      inspectorOpen: true,
      bottomOpen: false,
      inspectorWidth: 320,
      bottomHeight: 240,
    },
  }
}
