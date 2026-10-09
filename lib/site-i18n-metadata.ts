export const pageDescriptionKeys = {
  "/blog": "site.optimization.blogIntro",
  "/examples/workflow-analytics": "site.examples.workflowAnalyticsDescription",
  "/examples": "site.examples.description",
  "/examples/work-items": "site.examples.workItemsDescription",
  "/workspace/work-items": "site.examples.moved",
  "/": "site.metadata_Description",
  "/style-workbench": "site.metadata_style_workbenchDescription",
  "/dictionary": "site.metadata_dictionaryDescription",
  "/scroll": "site.metadata_scrollDescription",
  "/workspace": "site.metadata_workspaceDescription",
  "/workspace/canvas": "site.metadata_workspace_canvasDescription",
} as const

// Site-owned static routes only. Object pages provide their own current metadata.
export const pageTitles = {
  "/examples": "组件示例",
  "/examples/work-items": "Work Items 组件示例",
  "/workspace/work-items": "Work Items 组件示例",
  "/components": "组件目录",
  "/blog": "优化日志",
  "/dictionary": "视觉词典",
  "/docs": "介绍",
  "/docs/installation": "安装与主题",
  "/scroll": "滚动实验室",
  "/style-workbench": "样式工作台",
  "/workspace": "工作台",
  "/workspace/canvas": "流程画布",
  "/workspace/canvas/project": "嵌套流程",
  "/workspace/canvas/services": "服务接口",
  "/workspace/canvas/stress": "压力图",
} as const
