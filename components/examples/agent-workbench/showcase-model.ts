import {
  parseWorkbenchQuery,
  type PanelState,
  type SessionSnapshot,
} from "@/lib/agent-workbench-model"
import { initialWorkbench, references } from "./fixtures"
import type { ExampleState } from "./reducer"

type Text = { "zh-CN": string; en: string }
const text = (zh: string, en: string): Text => ({ "zh-CN": zh, en })
export const regionDefinitions = [
  {
    id: "sidebar",
    title: text("项目与会话导航", "Projects and sessions"),
    components: ["session-navigator", "project-switcher", "session-row"],
    contract: text(
      "项目、会话和操作回执分别标识；归档不删除会话。",
      "Projects, sessions and receipts have separate identities; archiving does not delete a session.",
    ),
    acceptance: text(
      "切换项目、搜索、收藏、重命名、归档与恢复；业务修改等待确认。",
      "Switch projects, search, favorite, rename, archive and restore; mutations wait for confirmation.",
    ),
    cases: [
      "no-projects",
      "no-sessions",
      "long-title",
      "unread",
      "archived",
      "readonly",
    ],
  },
  {
    id: "context",
    title: text("上下文与来源", "Context and sources"),
    components: ["context-panel", "context-picker", "tree"],
    contract: text(
      "引用包含来源版本、包含状态和可用性；本地文件不等于引擎已读取。",
      "References carry source revisions, inclusion and availability; local files are not engine reads.",
    ),
    acceptance: text(
      "添加、去重、移除、定位与重试；未知用量不补零，超限阻止提交。",
      "Add, deduplicate, remove, locate and retry; unknown usage stays unknown and limits block submission.",
    ),
    cases: [
      "context-uploading",
      "context-failed",
      "context-stale",
      "context-denied",
      "context-unknown",
      "context-over-limit",
      "context-truncated",
      "context-duplicates",
    ],
  },
  {
    id: "conversation",
    title: text("对话与历史", "Conversation and history"),
    components: ["agent-conversation", "message-content", "tool-call"],
    contract: text(
      "消息、part 与游标稳定；历史分页、来源修订和阅读位置分别维护。",
      "Messages, parts and cursors stay stable; paging, revisions and reading position are separate.",
    ),
    acceptance: text(
      "复制、工具展开、补载历史、返回最新与引用定位；迟到事件不能覆盖当前内容。",
      "Copy, expand tools, load history, return to latest and locate references; late events cannot replace content.",
    ),
    cases: ["streaming", "cancelled", "late-event"],
  },
  {
    id: "composer",
    title: text("输入与提交", "Input and submission"),
    components: ["agent-composer", "composer-controls", "chat-message"],
    contract: text(
      "草稿按会话与版本隔离；send、queue、steer 和取消分别确认。",
      "Drafts are scoped by session and version; send, queue, steer and cancellation have separate receipts.",
    ),
    acceptance: text(
      "IME、附件与引用可操作；确认期间继续编辑，旧确认不清除新草稿。",
      "Use IME, attachments and references; continue editing while pending and retain newer drafts.",
    ),
    cases: ["submitting", "queue", "steer"],
  },
  {
    id: "header",
    title: text("任务标题与环境", "Task header and environment"),
    components: ["session-header", "runtime-status-badge"],
    contract: text(
      "环境与能力来自来源；切换面板、查看环境不执行任务或 checkout。",
      "Environment and capabilities come from the source; panel and environment inspection do not run tasks or checkout.",
    ),
    acceptance: text(
      "重命名等待回执；可查看环境、切面板和请求停止，未知结果先查询。",
      "Renaming waits for receipts; inspect environment, switch panels, request stop and reconcile unknown outcomes.",
    ),
    cases: ["no-environment", "readonly", "interrupt-pending"],
  },
  {
    id: "tools",
    title: text("工具、审批与问题", "Tools, approvals and questions"),
    components: ["tool-call", "approval-request-panel"],
    contract: text(
      "审批绑定具体工具与修订；问题草稿独立，输出先脱敏再展示。",
      "Approvals bind tool identities and revisions; question drafts are separate and output is redacted first.",
    ),
    acceptance: text(
      "批准、拒绝、回答和结果查询各自确认；过期审批不能再次提交。",
      "Approve, reject, answer and reconcile separately; expired approvals cannot be submitted.",
    ),
    cases: [
      "expired-approval",
      "approval-unknown",
      "tool-long",
      "tool-empty",
      "tool-failed",
    ],
  },
  {
    id: "files",
    title: text("文件、差异与反馈", "Files, diffs and feedback"),
    components: ["change-review-panel", "diff-viewer", "file-viewer"],
    contract: text(
      "反馈绑定 repository/base/head/revision/file/line；查看不是 Git 批准。",
      "Feedback binds repository/base/head/revision/file/line; inspection is not Git approval.",
    ),
    acceptance: text(
      "统一/并排、文件定位、评论编辑/移除与草稿反馈；版本变化后明确重新定位。",
      "Use unified/split views, locate files, edit/remove comments and prepare feedback; relocate after version changes.",
    ),
    cases: [
      "file-variants",
      "files-long",
      "binary",
      "version-changed",
      "no-changes",
      "conflict",
    ],
  },
  {
    id: "output",
    title: text("运行输出与预览", "Output and preview"),
    components: ["execution-output-panel", "preview-panel"],
    contract: text(
      "日志最多200行/32KiB；预览需要宿主明确允许，日志不是 PTY。",
      "Logs are bounded to 200 lines/32KiB; previews require host approval and logs are not a PTY.",
    ),
    acceptance: text(
      "过滤、复制、预览切换与重连；失败、截断和不可用均保持可见。",
      "Filter, copy, switch previews and reconnect; failures, truncation and unavailability remain visible.",
    ),
    cases: [
      "output-truncated",
      "output-empty",
      "test-failed",
      "preview-unavailable",
      "preview-report",
    ],
  },
  {
    id: "artifacts",
    title: text("计划、产物与审阅", "Plans, artifacts and review"),
    components: ["execution-trace-tree", "artifact-list"],
    contract: text(
      "运行完成、审阅与业务验收分别表达；产物保留来源会话和时间。",
      "Runtime completion, review and acceptance are distinct; artifacts retain source sessions and timestamps.",
    ),
    acceptance: text(
      "步骤定位工具，产物定位来源消息，审阅定位文件；下载只使用真实本地数据。",
      "Locate tools from steps, source messages from artifacts and files from review; downloads use available local data.",
    ),
    cases: [
      "unplanned",
      "plan-running",
      "unreviewed",
      "reviewed-unaccepted",
      "artifact-unavailable",
      "artifact-unsupported",
      "artifact-variants",
    ],
  },
  {
    id: "settings",
    title: text("收件箱与设置", "Inbox and settings"),
    components: ["task-inbox", "attention-queue", "agent-run-list"],
    contract: text(
      "选择只查看对象，进入会话与批准是不同动作；设置不伪装服务连接。",
      "Selection only inspects; entering a session and approving are separate actions; settings do not imply service connections.",
    ),
    acceptance: text(
      "筛选待批准/回答/失败/审阅；修改环境与偏好，清除偏好不清除草稿。",
      "Filter approvals/questions/failures/review; change environment and preferences without clearing drafts.",
    ),
    cases: ["no-attention", "invalid-config", "refresh-error"],
  },
] as const

const rows: [string, string, string][] = [
  ["default", "当前交互", "Current interaction"],
  ["loading", "首次加载", "Initial loading"],
  ["empty", "空数据", "Empty data"],
  ["partial", "部分数据", "Partial data"],
  ["error", "刷新失败，保留内容", "Refresh failure, retained content"],
  ["long", "长历史与差异", "Long history and diff"],
  ["unknown", "结果未知", "Unknown outcome"],
  ["disconnected", "连接断开", "Disconnected"],
  ["limited", "能力受限", "Limited capabilities"],
  ["no-projects", "尚无项目", "No projects"],
  ["no-sessions", "项目尚无会话", "No sessions in project"],
  ["long-title", "长标题与路径", "Long title and path"],
  ["unread", "未读与运行状态", "Unread and runtime states"],
  ["archived", "归档会话恢复", "Restore archived session"],
  ["readonly", "只读项目", "Read only project"],
  ["context-uploading", "附件上传中", "Uploading attachment"],
  ["context-failed", "附件上传失败", "Failed attachment"],
  ["context-stale", "来源版本失效", "Stale source revision"],
  ["context-denied", "来源无权限", "Source access denied"],
  ["context-unknown", "用量与可用性未知", "Unknown usage and availability"],
  ["context-over-limit", "上下文超限", "Context over limit"],
  ["context-truncated", "来源选区截断", "Truncated source selection"],
  ["context-duplicates", "重复引用去重", "Deduplicated references"],
  ["streaming", "消息生成中", "Streaming message"],
  ["cancelled", "已取消的部分消息", "Cancelled partial message"],
  ["late-event", "迟到与重复事件", "Late and duplicate event"],
  ["submitting", "提交等待确认", "Submission pending"],
  ["queue", "排队消息确认", "Queue acknowledgement"],
  ["steer", "途中引导确认", "Steer acknowledgement"],
  ["no-environment", "尚未选择环境", "No environment selected"],
  ["interrupt-pending", "取消请求未确认", "Cancellation pending"],
  ["expired-approval", "审批已过期", "Expired approval"],
  ["approval-unknown", "审批确认丢失", "Lost approval confirmation"],
  ["tool-long", "超长脱敏输出", "Long redacted output"],
  ["tool-empty", "工具暂无输出", "No tool output"],
  ["tool-failed", "工具失败退出", "Tool failure"],
  ["file-variants", "新增、删除、重命名", "Added, deleted and renamed files"],
  ["files-long", "长行与部分差异", "Long lines and partial diff"],
  ["binary", "二进制文件", "Binary file"],
  ["version-changed", "反馈版本已改变", "Feedback revision changed"],
  ["no-changes", "暂无变更", "No changes"],
  ["conflict", "来源报告冲突", "Source reported conflict"],
  ["output-truncated", "日志已截断", "Truncated log"],
  ["output-empty", "暂无命令输出", "No command output"],
  ["test-failed", "来源测试失败", "Source test failure"],
  ["preview-unavailable", "预览不可用", "Preview unavailable"],
  ["preview-report", "本地报告预览", "Local report preview"],
  ["unplanned", "尚无计划", "No plan"],
  ["plan-running", "计划正在执行", "Plan in progress"],
  ["unreviewed", "已产出，未审阅", "Produced, not reviewed"],
  ["reviewed-unaccepted", "已审阅，未验收", "Reviewed, not accepted"],
  ["no-attention", "暂无待办", "No attention items"],
  ["invalid-config", "无效配置", "Invalid configuration"],
  ["refresh-error", "设置读取失败", "Settings refresh failure"],
  ["artifact-unavailable", "产物暂不可用", "Artifact unavailable"],
  [
    "artifact-unsupported",
    "产物格式未提供预览",
    "Unsupported artifact preview",
  ],
  [
    "artifact-variants",
    "多个产物与可用性",
    "Multiple artifacts and availability",
  ],
]
export const showcaseScenarios = rows.map(([id, zh, en]) => ({
  id,
  label: text(zh, en),
}))
export const commonScenarios = rows.slice(0, 9).map(([id]) => id)
export function parseShowcaseQuery(
  params: URLSearchParams,
  sessions: readonly string[],
  projects: readonly string[],
) {
  const scenario = params.get("scenario") || "default"
  const normalized = new URLSearchParams(params)
  if (showcaseScenarios.some((s) => s.id === scenario))
    normalized.set(
      "scenario",
      commonScenarios.includes(scenario) ? scenario : "default",
    )
  const query = parseWorkbenchQuery(normalized, sessions)
  const project = params.get("project") || ""
  if (project && !projects.includes(project)) query.errors.push("project")
  return { ...query, scenario, project }
}
export function showcaseHref(
  level: "regions" | "layouts" | "app",
  values: Record<string, string | undefined>,
) {
  const params = new URLSearchParams()
  for (const key of [
    "region",
    "layout",
    "template",
    "page",
    "session",
    "panel",
    "scenario",
    "project",
  ])
    if (values[key]) params.set(key, values[key]!)
  return `/examples/agent-workbench/${level}/?${params}`
}

/** Explicit local case preparation. Retains drafts, comments and all other sessions. */
export function prepareShowcaseScenario(
  state: ExampleState,
  id: string,
  scenario: string,
): ExampleState {
  if (
    commonScenarios.includes(scenario) ||
    state.scenarioBySession[id] === scenario
  )
    return state
  const current = state.sessions.find((s) => s.sessionId === id)
  if (!current) return state
  const base =
    initialWorkbench().sessions.find((s) => s.sessionId === id) ?? current
  const session: SessionSnapshot = {
    ...structuredClone(base),
    title: current.title,
    favorite: current.favorite,
    archived: current.archived,
  }
  let draft = {
    ...state.drafts[id],
    context: state.drafts[id].context.map((r) => ({ ...r })),
  }
  let receipts = state.receipts
  let comments = state.comments
  let panels = state.panels
  if (scenario === "long-title")
    session.title =
      "修复跨项目检索结果与大小写过滤行为 src/features/search/filters/normalize-and-match.ts — source revision a1"
  if (scenario === "unread") session.unread = true
  if (scenario === "archived") session.archived = true
  if (scenario.startsWith("context-")) {
    const availability = scenario.slice(8)
    const reference = {
      ...references[0],
      id: "showcase-reference",
      label: "src/features/search/filters/normalize-and-match.ts",
      source: "src/features/search/filters/normalize-and-match.ts",
      included: true,
      removable: true,
    }
    if (
      ["uploading", "failed", "stale", "denied", "unknown"].includes(
        availability,
      )
    )
      Object.assign(reference, {
        availability,
        reason: "Fixture source availability; explicit confirmation required",
      })
    if (scenario === "context-unknown") delete reference.usage
    if (scenario === "context-over-limit")
      reference.usage = {
        value: 1800,
        unit: "tokens",
        source: "fixture estimate",
        estimated: true,
      }
    if (scenario === "context-truncated")
      Object.assign(reference, {
        kind: "selection",
        range: { start: 10, end: 30 },
        reason: "Source selection truncated: only lines 10–30 are available",
        source: `${reference.source}:10-30 (truncated)`,
      })
    draft = { ...draft, version: draft.version + 1, context: [reference] }
    if (scenario === "context-duplicates")
      session.contextSources = [
        { ...reference, included: false, removable: false },
      ]
  }
  if (["streaming", "cancelled"].includes(scenario)) {
    session.status = scenario === "streaming" ? "running" : "cancelled"
    session.messages[1] = {
      ...session.messages[1],
      state: scenario === "streaming" ? "streaming" : "cancelled",
    }
  }
  if (scenario === "late-event") session.cursor = Math.max(current.cursor, 1)
  if (["queue", "steer"].includes(scenario))
    draft.mode = scenario as "queue" | "steer"
  if (scenario === "submitting" || scenario === "interrupt-pending") {
    const requestId = `showcase-${id}-${scenario}`
    receipts = [
      ...receipts.filter((r) => r.targetId !== id),
      {
        requestId,
        targetId: id,
        action: scenario === "submitting" ? "steer" : "interrupt",
        state: "pending",
        draftVersion: draft.version,
        submittedDraft: structuredClone(draft),
      },
    ]
  }
  if (scenario === "no-environment") {
    session.environment = {
      ...session.environment,
      environmentId: "",
      name: "",
      connection: "unknown",
      capabilities: [],
    }
    draft.environmentId = ""
  }
  if (["expired-approval", "approval-unknown"].includes(scenario)) {
    const report = initialWorkbench().sessions[1]
    session.attention = report.attention
      .filter((a) => a.kind === "approval")
      .map((a) => ({
        ...a,
        attentionId: `showcase-approval-${id}`,
        title: "Run focused tests",
        reason: "Source requests command approval",
        scope: "tests/filter.test.ts",
        target: session.tools[0].target ?? "tests/filter.test.ts",
        risk: "Local fixture command output; no real execution",
        runId: session.activeRunId,
        expired: scenario === "expired-approval",
        tool: { ...session.tools[0], status: "waiting" },
        ...(scenario === "approval-unknown"
          ? { operation: { state: "unknown" as const } }
          : {}),
      }))
    session.status = "waiting"
    session.tools = [{ ...session.tools[0], status: "waiting" }]
    if (scenario === "approval-unknown")
      receipts = [
        ...receipts,
        {
          requestId: `showcase-approval-${id}`,
          targetId: `showcase-approval-${id}`,
          action: "accept",
          state: "unknown",
        },
      ]
  }
  if (scenario.startsWith("tool-")) {
    session.attention = []
    session.tools = session.tools.map((tool) => ({
      ...tool,
      status: scenario === "tool-failed" ? "failed" : "completed",
      output:
        scenario === "tool-empty"
          ? ""
          : scenario === "tool-long"
            ? `token=secret-showcase-value\n${"source output\n".repeat(260)}`
            : "FAIL: source test exited 1",
      exitCode: scenario === "tool-failed" ? 1 : 0,
      outputTruncated: scenario === "tool-long",
    }))
  }
  if (
    ["files-long", "version-changed"].includes(scenario) &&
    !session.changes.files.length
  )
    session.changes.files = structuredClone(
      initialWorkbench().sessions[0].changes.files,
    )
  if (scenario === "files-long") {
    session.changes.partial = true
    session.changes.files[0].lines[0].text = "source line ".repeat(1000)
    session.changes.files[0].truncated = true
  }
  if (scenario === "binary")
    panels = { ...panels, selectedFileId: "file-binary" }
  if (scenario === "no-changes") session.changes.files = []
  if (scenario === "version-changed") {
    const file = session.changes.files[0],
      line = file.lines[0]
    comments = {
      ...comments,
      [id]: [
        {
          commentId: `showcase-comment-${id}`,
          repositoryId: session.changes.repositoryId,
          base: session.changes.base,
          head: session.changes.head,
          revision: session.changes.revision,
          fileId: file.fileId,
          lineId: line.id,
          oldLine: line.oldLine,
          newLine: line.newLine,
          text: "Please verify the source revision before applying this feedback.",
        },
      ],
    }
    session.changes = { ...session.changes, head: "b2", revision: "diff-2" }
  }
  if (scenario === "conflict") {
    session.changes.partial = true
    session.output.text =
      "Source reports merge conflict in src/filter.ts; resolve through the host adapter."
  }
  if (scenario === "output-truncated")
    session.output = {
      ...session.output,
      text: `token=secret-showcase-value\n${"fixture output line\n".repeat(260)}`,
      truncated: true,
    }
  if (scenario === "output-empty") session.output.text = ""
  if (scenario === "test-failed") {
    session.status = "failed"
    session.output.text = "FAIL: case sensitivity test\nexit code 1"
  }
  if (
    ["preview-report", "unreviewed", "reviewed-unaccepted"].includes(scenario)
  ) {
    session.artifacts = initialWorkbench().sessions[1].artifacts.map((a) => ({
      ...a,
      runId: session.activeRunId,
      review: {
        state: scenario === "reviewed-unaccepted" ? "approved" : "unreviewed",
        acceptance: "pending",
        evidence:
          "Local fixture artifact; review and business acceptance are separate",
      },
    }))
    session.messages = [
      ...session.messages,
      {
        messageId: `artifact-source-${id}`,
        turnId: `artifact-turn-${id}`,
        sequence: 20,
        revision: 1,
        role: "agent",
        state: "completed",
        parts: [
          {
            partId: `artifact-part-${id}`,
            sequence: 1,
            revision: 1,
            kind: "artifact",
            referenceId: session.artifacts[0].artifactId,
            label: "Open source report",
          },
        ],
      },
    ]
  }
  if (scenario.startsWith("artifact-")) {
    const available = {
      ...initialWorkbench().sessions[1].artifacts[0],
      runId: session.activeRunId,
    }
    const unsupported = {
      ...available,
      artifactId: `artifact-unsupported-${id}`,
      name: "source-export.bin",
      kind: "binary",
    }
    const unavailable = {
      ...available,
      artifactId: `artifact-unavailable-${id}`,
      availability: "unavailable" as const,
    }
    session.artifacts =
      scenario === "artifact-variants"
        ? [
            available,
            unsupported,
            { ...unavailable, name: "previous-report.md" },
          ]
        : [scenario === "artifact-unsupported" ? unsupported : unavailable]
  }
  if (scenario === "unplanned") session.plan = []
  if (scenario === "plan-running")
    session.plan = session.plan.map((p, i) => ({
      ...p,
      status: i === 1 ? "running" : p.status,
    }))
  if (scenario === "no-attention") session.attention = []
  if (scenario === "invalid-config") {
    draft.modelId = ""
    draft.environmentId = ""
  }
  if (scenario === "refresh-error") {
    session.dataState = "error"
    session.error =
      "Fixture settings refresh failed; last configuration retained"
  }
  return {
    ...state,
    sessions: state.sessions.map((s) => (s.sessionId === id ? session : s)),
    drafts: { ...state.drafts, [id]: draft },
    receipts,
    comments,
    panels,
    scenarioBySession: { ...state.scenarioBySession, [id]: scenario },
  }
}

const preferenceKey = "easyuseui-workbench-panels"
export function readPanelPreferences(): Partial<PanelState> | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(preferenceKey) || "null")
    if (!value || typeof value !== "object") return
    const result: Partial<PanelState> = {}
    for (const key of [
      "sidebarCollapsed",
      "inspectorOpen",
      "bottomOpen",
    ] as const)
      if (typeof value[key] === "boolean") result[key] = value[key]
    for (const [key, min, max] of [
      ["inspectorWidth", 280, 360],
      ["bottomHeight", 200, 400],
      ["reviewSplit", 0.2, 0.8],
    ] as const)
      if (Number.isFinite(value[key]))
        result[key] = Math.min(max, Math.max(min, value[key]))
    return result
  } catch {
    return
  }
}
export function savePanelPreferences(panels: PanelState) {
  try {
    localStorage.setItem(
      preferenceKey,
      JSON.stringify({
        sidebarCollapsed: panels.sidebarCollapsed,
        inspectorOpen: panels.inspectorOpen,
        bottomOpen: panels.bottomOpen,
        inspectorWidth: panels.inspectorWidth,
        bottomHeight: panels.bottomHeight,
        reviewSplit: panels.reviewSplit,
      }),
    )
  } catch {}
}
export function removePanelPreferences() {
  try {
    localStorage.removeItem(preferenceKey)
  } catch {}
}
