export type SiteLocalizedText = { "zh-CN": string; en: string }
export type SiteExample = {
  id: string
  title: SiteLocalizedText
  description: SiteLocalizedText
  href: string
  thumbnail: {
    light: string
    dark: string
    mobileLight: string
    mobileDark: string
  }
  components: string[]
  article: string
  validation: "fixture-verified"
}
const images = (id: string) => ({
  light: `/site/scenes/${id}-desktop-light.jpg`,
  dark: `/site/scenes/${id}-desktop-dark.jpg`,
  mobileLight: `/site/scenes/${id}-mobile-light.jpg`,
  mobileDark: `/site/scenes/${id}-mobile-dark.jpg`,
})
export const exampleManifest: SiteExample[] = [
  {
    id: "agent-coding-workbench",
    title: { "zh-CN": "Agent 编码工作台", en: "Agent coding workbench" },
    description: {
      "zh-CN": "项目会话、上下文、工具批准与版本绑定的代码审阅，共享一份受控快照。",
      en: "Projects, sessions, context, tool approval and version-bound code review share a controlled snapshot.",
    },
    href: "/examples/agent-workbench/app/?template=coding&page=home",
    thumbnail: images("agent-coding-workbench"),
    components: ["session-navigator", "agent-conversation", "agent-composer", "context-panel", "change-review-panel"],
    article: "agent-workbench-showcase",
    validation: "fixture-verified",
  },
  {
    id: "agent-artifacts-workbench",
    title: { "zh-CN": "Agent 产物审阅", en: "Agent artifact review" },
    description: {
      "zh-CN": "资料引用、报告预览和反馈草稿，形成不依赖代码执行的本地交互闭环。",
      en: "Source references, report previews and feedback drafts form a local interaction flow without code execution.",
    },
    href: "/examples/agent-workbench/app/?template=artifacts&page=artifacts&session=session-report",
    thumbnail: images("agent-artifacts-workbench"),
    components: ["context-panel", "message-content", "artifact-list", "preview-panel", "agent-composer"],
    article: "agent-workbench-showcase",
    validation: "fixture-verified",
  },
  {
    id: "agent-console-workbench",
    title: { "zh-CN": "多任务 Agent 控制台", en: "Agent task console" },
    description: {
      "zh-CN": "筛选待批准、待回答和失败任务，先查看详情，再显式进入对应会话。",
      en: "Filter approvals, questions and failed tasks, inspect details, then explicitly enter a session.",
    },
    href: "/examples/agent-workbench/app/?template=console&page=inbox&session=session-report",
    thumbnail: images("agent-console-workbench"),
    components: ["task-inbox", "attention-queue", "agent-run-list", "execution-trace-tree", "agent-workbench"],
    article: "agent-workbench-showcase",
    validation: "fixture-verified",
  },

  {
    id: "workflow-analytics",
    title: { "zh-CN": "工作流分析", en: "Workflow analytics" },
    description: {
      "zh-CN": "项目、执行、资源、交付与风险分析，附布局编辑和分析构建器。",
      en: "Project, execution, resource, delivery and risk analysis with layout editing and an analytics builder.",
    },
    href: "/examples/workflow-analytics/",
    thumbnail: {
      light: "/site/scenes/workflow-analytics-desktop-light.png",
      dark: "/site/scenes/workflow-analytics-desktop-dark.png",
      mobileLight: "/site/scenes/workflow-analytics-mobile-light.png",
      mobileDark: "/site/scenes/workflow-analytics-mobile-dark.png",
    },
    components: [
      "statistical-chart",
      "chart-drilldown-panel",
      "project-overview-dashboard",
      "resource-allocation-view",
      "agent-operations-dashboard",
      "analytics-builder",
    ],
    article: "workflow-analytics-full",
    validation: "fixture-verified",
  },
  {
    id: "agent",
    title: { "zh-CN": "Agent 工作台", en: "Agent workspace" },
    description: {
      "zh-CN": "运行状态、人工介入与来源用量，在同一个受控快照中清晰呈现。",
      en: "Runtime status, human attention and source usage, in one controlled snapshot.",
    },
    href: "/workspace/agents/",
    thumbnail: images("agent"),
    components: [
      "agent-row",
      "runtime-status-badge",
      "tool-call",
      "workspace-shell",
    ],
    article: "agent-board-showcase",
    validation: "fixture-verified",
  },
  {
    id: "work-items",
    title: { "zh-CN": "Work Items", en: "Work Items" },
    description: {
      "zh-CN": "列表、看板、表格、时间线与日历，共享字段、选择和日期。",
      en: "List, Board, Table, Timeline and Calendar share fields, selection and dates.",
    },
    href: "/examples/work-items/",
    thumbnail: images("work-items"),
    components: [
      "work-items-workspace",
      "work-item-list",
      "work-item-board",
      "work-item-timeline",
      "work-item-calendar",
    ],
    article: "work-items-shared-views",
    validation: "fixture-verified",
  },
  {
    id: "canvas",
    title: { "zh-CN": "流程画布", en: "Workflow canvas" },
    description: {
      "zh-CN": "组合节点、配置字段并检查流程，执行与存储交给调用方服务。",
      en: "Compose nodes, configure fields and validate flows. Caller services own execution and storage.",
    },
    href: "/workspace/canvas/",
    thumbnail: images("canvas"),
    components: [
      "workflow-canvas",
      "canvas-workspace",
      "node-palette",
      "node-inspector",
    ],
    article: "canvas-indexes",
    validation: "fixture-verified",
  },
]
