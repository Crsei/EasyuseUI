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
