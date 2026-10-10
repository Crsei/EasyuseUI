import type { GalleryModule, GalleryTechnology } from "@/components/docs/element-gallery"

type ModuleInfo = Pick<GalleryModule, "group" | "groupId" | "summary" | "source" | "states" | "contract" | "wide">

export function galleryModuleInfo(en: boolean): Record<string, ModuleInfo> {
  const group = (zh: string, english: string) => en ? english : zh
  const info = (
    categoryZh: string,
    categoryEn: string,
    summaryZh: string,
    summaryEn: string,
    source: string,
    contractZh: string,
    contractEn: string,
    statesZh: string,
    statesEn: string,
    wide = false,
  ): ModuleInfo => ({
    groupId: categoryEn.toLowerCase().replaceAll(" ", "-"),
    group: group(categoryZh, categoryEn),
    summary: group(summaryZh, summaryEn),
    source,
    contract: group(contractZh, contractEn),
    states: group(statesZh, statesEn),
    wide,
  })
  return {
    MD01: info("导航与身份", "Navigation and identity", "项目、环境与来源", "Project, environment and source", "ProjectSwitcher", "全局栏展示当前项目与环境；来源未知时明示，不推断工作树。", "The global bar identifies the current project and environment; unknown worktree source stays explicit.", "选择项目 / 来源未知", "Project selection / unknown source"),
    MD02: info("导航与身份", "Navigation and identity", "活动区与页面入口", "Area and page entry", "ActivityNavigation", "导航轨只控制区域和页面；未读数来自 fixture 快照。", "The rail controls area and page navigation; counts come from the fixture snapshot.", "当前区域 / 焦点", "Current area / focus"),
    MD03: info("导航与身份", "Navigation and identity", "项目内会话与当前项", "Project sessions and current item", "SessionNavigator, Tree/Item", "会话选择与焦点独立；新建入口只打开输入区，不创建真实会话。", "Session selection and focus are separate; New opens the composer without creating a real session.", "选中 / 运行 / 空列表", "Selected / runtime / empty list"),
    MD04: info("导航与身份", "Navigation and identity", "会话标题与能力", "Session heading and capabilities", "SessionHeader, RuntimeStatusBadge", "标题、来源和能力由会话快照提供；中断提交不代表已停止。", "Title, source and capabilities come from the session snapshot; an interrupt request does not prove a stop.", "运行 / 等待 / 未知", "Running / waiting / unknown"),
    MD05: info("对话与输入", "Conversation and input", "历史阅读与补载", "History reading and prepend", "AgentConversation, Conversation", "补载历史保留阅读锚点；仅接近底部时跟随新内容。", "Prepending history preserves the reading anchor; new content follows only near the bottom.", "历史可用 / 补载 / 阅读位置", "History available / prepend / reading position", true),
    MD06: info("对话与输入", "Conversation and input", "右对齐浅蓝用户消息", "Right-aligned light-blue user message", "AgentConversation, ChatMessage", "用户正文与来源状态分开；浅蓝仅表示说话者，不表示执行结果。", "User text and source state stay separate; light blue identifies the speaker, not an execution result.", "已提交 / 长文本", "Submitted / long text", true),
    MD07: info("对话与输入", "Conversation and input", "开放式 Agent 轮次", "Open Agent turn", "AgentConversation, ChatMessage", "Thinking/Action/Output 在真实阶段转换处用细分隔；只显示公开进度。", "Thin separators mark actual Thinking/Action/Output transitions; only public progress is shown.", "阶段 / 工具 / 输出", "Phase / tool / output", true),
    MD08: info("对话与输入", "Conversation and input", "来源计划步骤", "Source-provided plan steps", "AgentConversation", "计划摘要仅展示来源步骤，不臆造依赖关系或完成状态。", "Plan summary shows source steps without inventing dependencies or completion.", "步骤 / 运行态", "Steps / runtime", true),
    MD09: info("工具与资源", "Tools and resources", "紧凑 Read/Search 记录", "Compact Read/Search records", "ToolCall via AgentConversation", "普通读取默认低噪声；异常保持可见，可展开有界详情。", "Routine reads are quiet; exceptions remain visible with bounded expandable details.", "折叠 / 展开 / 异常", "Collapsed / expanded / exception", true),
    MD10: info("工具与资源", "Tools and resources", "文件修改记录", "File change record", "ToolCall via AgentConversation", "修改记录指向同一来源版本的文件/Diff；结果未知时不显示成功。", "Change records link to file and diff at the same source revision; unknown outcomes never look successful.", "变更 / 版本 / 未知", "Change / revision / unknown", true),
    MD11: info("工具与资源", "Tools and resources", "Shell 与测试结果", "Shell and test result", "ToolCall, ExecutionSessionList", "保留命令输出、退出结果与来源；无结构化测试报告时不伪造表格。", "Command output, exit result and source remain visible; absent structured test reports are not fabricated.", "输出 / 失败 / 未知", "Output / failure / unknown", true),
    MD12: info("对话与输入", "Conversation and input", "稳定草稿和能力入口", "Stable draft and capability controls", "AgentComposer", "草稿按会话和版本隔离；切视图与语言不清空输入；提交由调用方负责。", "Drafts are scoped by session and version; view and locale changes retain input; the caller owns submission.", "草稿 / 待定 / 禁用", "Draft / pending / disabled", true),
    MD13: info("运行与介入", "Runtime and intervention", "排队来源与回执", "Queue source and receipts", "InterventionQueuePreview", "队列展示来源状态及操作回执；请求提交与确认结果分开。", "Queue shows source state and operation receipts; submitted requests and confirmed results stay separate.", "成功 / 部分 / 错误", "Success / partial / error", true),
    MD14: info("运行与介入", "Runtime and intervention", "审批提醒与明细", "Approval attention and detail", "InterventionAttentionStrip, ApprovalRequestPanel", "提醒可定位审批明细；接受或拒绝需要来源确认，未知先对账。", "Attention navigates to approval detail; accept or reject needs source confirmation, and unknown results require reconciliation.", "待审批 / 待确认 / 未知", "Requested / pending / unknown", true),
    MD15: info("工具与资源", "Tools and resources", "文件、计划、上下文资源", "Files, plan and context resources", "DeferredWorkbenchPanels, ContextPanel", "标签控制当前资源视图；资源选择跳转到关联文件或运行记录。", "Tabs control the current resource view; resource selection opens the related file or runtime record.", "标签 / 选中 / 空源", "Tabs / selection / empty source", true),
    MD16: info("工具与资源", "Tools and resources", "宽 Diff 与只读代码预览", "Wide diff and read-only code preview", "ChangeReviewPanel, DiffViewer, CodePreview", "Diff 保留来源版本和评论草稿；代码预览只读，不提供虚假保存。", "Diff retains source revision and comment drafts; code preview is read-only and offers no fake save.", "文件选择 / 评审 / 只读", "File selection / review / read-only", true),
    MD17: info("运行与介入", "Runtime and intervention", "运行记录与不可用能力", "Runtime records and unavailable capabilities", "RuntimePanel, ExecutionSessionList", "命令输出可读；无指标或 PTY 服务时明确说明不可用。", "Command output stays readable; missing metrics and PTY service are stated plainly.", "输出 / 错误 / 来源未提供", "Output / problems / unavailable source", true),
  }
}

export function galleryTechnologies(en: boolean): GalleryTechnology[] {
  const row = (name: string, zhStatus: string, enStatus: string, zhPurpose: string, enPurpose: string) => ({
    name,
    status: en ? enStatus : zhStatus,
    purpose: en ? enPurpose : zhPurpose,
  })
  return [
    row("Next 16 / React 19 / TypeScript / Tailwind 4", "本页采用 · 已安装", "Used here · installed", "静态路由、受控组件、类型和组件自有样式。", "Static route, controlled components, types and component-owned styling."),
    row("Base UI 1.8 / shadcn / Lucide", "本页采用 · 已安装", "Used here · installed", "Tabs、Select、Button 等交互基础；图标沿用现有系统。", "Tabs, Select, Button and existing icon system."),
    row("CodeMirror 6", "本轮采用 · 动态加载", "Used in this pass · dynamically loaded", "MD16 只读代码预览；语法、行号、搜索和选择由编辑器引擎处理。", "MD16 read-only code preview; the editor engine handles syntax, line numbers, search and selection."),
    row("Recharts 3.10.1 / React Flow 12.12.0", "已安装 · Workspace 未采用", "Installed · not adopted in Workspace", "等待来源指标和关系数据；画廊不生成假数据。", "Awaiting source metrics and relationship data; the gallery does not synthesize data."),
    row("Zod / TanStack Query / TanStack Table / dnd kit / Zustand", "后续候选", "Planned candidates", "按协议验证、只读缓存、表格、移动与订阅的实际缺口择需采用。", "Adopt only for actual gaps in validation, read caching, tables, movement and subscriptions."),
    row("Faker / Monaco / xterm.js", "后续候选", "Planned candidates", "当前使用确定性 fixture；Monaco 不与本轮 CodeMirror 并装；PTY 按服务里程碑接入。", "Current fixtures are deterministic; Monaco is not installed alongside CodeMirror; PTY awaits service integration."),
    row("ESLint / Prettier / Playwright", "工程采用 · 已安装", "Tooling · installed", "代码规范和浏览器验收。", "Code quality and browser acceptance."),
  ]
}
