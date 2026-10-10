# Agent 编码工作台：侧边工具栏、设置对话框与文件预览增强计划

日期：2026-10-09。状态：E0–E5 已实现并通过本地fixture、静态与独立安装验收，见 [实施记录](./agent-coding-workbench-enhancement-log.md)；E6 为独立后续。计划调研基线：`6ed0cc5dc782a0d726c88e1e408e7f7a47ea1af7`。

目标：在现有 Agent 编码工作台上，把侧边入口、对话输入、设置、上下文、工具执行、命令输出、生成产物和文件预览组织成连续的工作流程。主要改造入口为 `/examples/agent-workbench/app/?template=coding&page=session`，并同步区域实验室；三种模板继续共用组件和状态。

本计划承接 [组件建设计划](./agent-workbench-components-plan.md) 与 [网页展示计划](./agent-workbench-showcase-plan.md)。前者 M0–M5、后者 S0–S6 的交付保留，下面只列新增或增强项。真实模型、文件系统、Git、PTY、浏览器及持久化沿用原计划 M6 的服务接入范围。

## 1. 当前示例与差距

### 1.1 核对范围

- 正式契约：[Design-rules](../Design-rules.md)、[Component-Specification](../Component-Specification.md)、[UI-PATTERNS](../UI-PATTERNS.md)、[UI-STATES](../UI-STATES.md)、[AGENT-WORKBENCH](../AGENT-WORKBENCH.md)。采用本库组件复用模式。
- 当前实现：[公共组合](../components/blocks/agent-workbench.tsx)、[纯模型](../lib/agent-workbench-model.ts)、[示例控制器](../components/examples/agent-workbench/workbench-demo.tsx)、[Provider](../components/examples/agent-workbench/provider.tsx)、[Reducer](../components/examples/agent-workbench/reducer.ts)。组件可用性同时核对 [Manifest](../lib/component-manifest.ts) 与 [Registry](../registry.json)。
- 示例层级：总览 `/examples/agent-workbench/`；区域 `/examples/agent-workbench/regions/`；布局 `/examples/agent-workbench/layouts/`；完整应用 `/examples/agent-workbench/app/`。2026-10-11 `/workspace/` 改为新版会话示例，通用 Shell 展示移至 `/workspace/shell/`；见[入口迁移记录](workspace-entry-migration-log.md)。
- 本轮通过现有 3010 开发服务查看编码会话、设置、审阅页面，视口 1440×900、会话窄屏 390×844；设置和审阅等待对应懒加载区域出现后复查。此项是现状观察，不是新交互验收或真实服务验证。

### 1.2 已有能力与本轮增量

| 模块 | 当前实现与证据 | 本轮需要补充 |
| --- | --- | --- |
| 工作台布局 | `AgentWorkbench` + `WorkspaceShell` 已有侧栏、Inspector、底栏、三种布局；[WorkbenchFrame](../components/examples/agent-workbench/workbench-frame.tsx) 保留进入过的编辑器 | 常驻活动栏；统一面板入口；缩小重复导航占用 |
| 项目与会话 | [navigation.tsx](../components/blocks/agent-workbench/navigation.tsx) 已有 ProjectSwitcher、SessionNavigator、SessionHeader，支持搜索、收藏、归档和受控回执 | 图标工具入口、项目/会话层级、紧凑行操作；保持现有动作语义 |
| 顶部入口 | 完整应用目前在顶部横排首页/新任务/会话/审阅/收件箱/项目/产物/设置；侧栏底部又有收件箱、设置、搜索 | 主导航归侧边；当前会话标题归 Header；工具面板切换归工作区，减少重复入口 |
| 输入与配置 | [composer.tsx](../components/blocks/agent-workbench/composer.tsx) 已有模型/权限/环境/send、queue、steer；设置与附件位于原生 details，选项使用 select | 常用选项常驻、复杂选项弹窗；上下文搜索、命令菜单、附件预览；保留 IME 和草稿版本 |
| 设置 | [SettingsView](../components/examples/agent-workbench/settings-view.tsx) 已有模型、环境、权限和本地偏好；环境详情使用 Sheet | 统一设置对话框、分组导航、搜索、作用域、保存/取消与错误；服务工具和规则配置能力按来源提供 |
| 上下文 | [context.tsx](../components/blocks/agent-workbench/context.tsx) 已有引用列表、包含开关、移除/重试/打开、可用性与用量 | 搜索分类选择器、输入上方引用条、来源小窗；模型预算细分需要来源快照，不能只把附件 token 相加称为全部上下文 |
| 对话与工具 | [conversation.tsx](../components/blocks/agent-workbench/conversation.tsx) 已有结构化 part、MessageContent、内联 ToolCall；审批区域复用现有公共组件 | 按轮次组织工具组、文件/命令/产物直达、明确待答问题、结果摘要；只呈现服务公开的阶段摘要 |
| 命令输出 | [panels.tsx](../components/blocks/agent-workbench/panels.tsx) 已有 ExecutionOutputPanel，支持脱敏、过滤、截断、连接状态和 terminal 插槽；示例底栏展示一份输出 | 命令列表、多命令身份、命令详情、退出码/耗时、跳转来源；真实 PTY 仍需适配器 |
| 文件与 Diff | [review.tsx](../components/blocks/agent-workbench/review.tsx) 已有 FileViewer、DiffViewer、ChangeReviewPanel；文件模型围绕 ChangedFile | 通用文件快照、可复用小窗、多文件标签、图片/Markdown/结构化数据预览；避免把普通文件强制建模为代码变更 |
| 生成产物 | ArtifactList、ReviewSummary 已有；[ArtifactsView](../components/examples/agent-workbench/artifacts-view.tsx) 目前按三个 Markdown 文件名选择 fixture 正文，其他类型显示不可预览 | 按来源与类型解析产物，版本/引用/预览/反馈共用文件打开协议；增加代码、图片、表格等样本 |
| 底层控件 | Dialog/Sheet/Popover、Select/Combobox、Field、Switch、Checkbox、Slider、Resizable 等已有源码和 Registry 条目 | 以组合和兼容扩展为主；新的文件小窗、活动栏、设置组合目前不是既有导出 |

原生 select/details 本身不是缺陷。改造的理由是提高常用动作可发现性、减少导航占用并连接不同区域。已有草稿保留、来源回执、审批、审阅版本校验应作为回归基线。

## 2. 官方产品调研与采用范围

访问日期同本计划。仅引用官方公开文档，未登录这些产品做逐页体验；不据此推断其内部组件、布局引擎或存储实现。右栏是 EasyuseUI 的设计决定。

| 来源 | 文档确认的模式 | 本项目采用方式 |
| --- | --- | --- |
| [Claude Code / VS Code](https://code.claude.com/docs/en/vs-code) | 活动栏会话入口、文件和行范围引用、模型选择、命令菜单、计划审阅 | 常驻侧边工具入口；输入配置可快速打开；文件/选区引用能回看来源。具体模式与参数取决于宿主能力 |
| [VS Code / Context](https://code.visualstudio.com/docs/chat/copilot-chat-context) | 文件、目录、符号、图像、终端输出等可以显式加入上下文；支持选择器与拖放 | 先交付现有六种引用类型的选择和预览；目录、符号、命令输出作为版本化扩展。不要把不同产品的 `@`/`#` 语义直接混用 |
| [VS Code / Tools](https://code.visualstudio.com/docs/agents/run/tools) | 工具详情可折叠，工具可分组选择；命令记录可以打开对应终端；工具启用与执行批准分开 | 工具组、工具设置、命令列表与底栏联动；启用开关不等于审批；日志与交互终端分开 |
| [VS Code / Approvals](https://code.visualstudio.com/docs/agents/run/approvals) | 会话权限、工具批准、终端批准与沙箱限制是不同控制 | 设置对话框显示有效权限及来源；单次审批包含目标/参数/范围；不在 UI 中自行扩大服务权限 |
| [VS Code / Sessions](https://code.visualstudio.com/docs/agents/run/sessions/manage-sessions) | 会话管理与上下文用量入口；部分界面支持同一会话的多聊天视图 | 会话导航和用量入口优先；当前模型仍按已有 sessionId 隔离，多聊天/分叉后置，不凭新增标签构造新执行对象 |
| [VS Code / Artifacts](https://code.visualstudio.com/docs/agents/run/artifacts) | 截图、计划和文档按来源展示，产物与参考资料有区别；移除引用记录不删除实际文件 | 消息、上下文、文件树、产物列表共用预览入口；资源来源、生成状态、审阅状态分别表达 |
| [Cursor / Agent](https://cursor.com/docs/agent/overview) | 排队消息与立即引导分别处理；检查点恢复文件，不删除对话 | 保留现有 send/queue/steer；检查点只作为后续有能力的操作，不给本地示例加假“恢复成功” |

## 3. 目标布局与侧边按钮清单

### 3.1 布局

```text
WorkspaceShell（唯一布局所有者）
├─ ActivityBar：会话 / 文件 / 搜索 / 变更 / 产物 / 任务；底部设置 / 帮助
├─ Sidebar：当前活动的项目会话列表、文件树或搜索结果
├─ Header：任务标题、项目/分支/环境、运行状态、停止请求、布局入口
├─ Main
│  ├─ Conversation：消息 → 工具组 → 阶段/结果 → 引用
│  ├─ Composer：引用条 → 草稿 → 模式/模型/权限/附件/发送
│  └─ Workspace：文件标签 / Diff / 产物 / 计划（按需展开）
├─ Inspector：当前对象元数据 / 上下文来源（按需展开）
├─ BottomPanel：命令列表 + 输出 / 测试结果 / 预览（默认收起）
└─ Overlay：设置 Dialog、引用选择器、文件 Quick Look、确认与快捷键
```

- 保持 Compact、4px 网格、32px 默认控件、48px Header、40px Toolbar、800px 对话最大正文宽。普通会话、工具和日志用行与分隔线；优先复用 `styles/theme.css`。
- 活动栏提案宽48px，是新增可选 Shell 区域；现有 Sidebar 仍默认256px，Inspector默认320/范围280–360，底栏默认240/范围200–400。活动栏与 Sidebar 同时展开时总占宽304px，属于本工作台的组合增量，不改其他页面默认值。需要新增 Shell 槽位与兼容验收，不能在页面再套第二个 Shell。
- 宽度不足先收 Inspector、再收辅助侧栏；计算 Main 剩余宽度，不按整页宽度假设能放下两栏。对话和宽文件区共存仍以当前约920px容器阈值为基线；不足则单面板切换。审阅时宽 Diff 进入 Main。
- 窄屏活动入口收敛为菜单/Sheet；常用对话、文件、任务仍可直接到达。关闭侧栏后草稿、选中文件、输出游标保留。所有48px轨道内的触摸按钮实际命中至少44×44。
- 完整应用只保留简洁返回示例入口与 fixture 标记；场景切换、来源推进、重置放“示例设置”。区域实验室继续保留教学控制。

### 3.2 按钮与动作语义

| ID | 入口 / 位置 | 打开或执行什么 | 控件、状态与限制 | 优先级 |
| --- | --- | --- | --- | --- |
| N01 | 新任务 / 侧栏顶部 | 打开现有新任务页或新任务 Dialog | Button；选择项目/环境，创建确认后才出现会话；无效配置保留输入 | P0 |
| N02 | 会话 / 活动栏 | 项目切换 + 会话列表 | 导航链接或受控面板按钮；选中、未读、运行数分开 | P0 |
| N03 | 文件 / 活动栏 | 当前项目文件树 | Tree + Input + Breadcrumb；选中只预览，双击/显式“固定”才固定标签 | P0 |
| N04 | 搜索 / 活动栏 | 文件/会话/命令搜索 | CommandPalette 或搜索面板；明确范围、无结果、异步旧查询丢弃 | P1 |
| N05 | 变更 / 活动栏 | 审阅主区 | Diff 文件数量由 ChangeSet 提供；Git写操作仅在有能力时展示 | P0 |
| N06 | 产物 / 活动栏 | 当前会话或项目产物 | ArtifactList；作用域可见；选择后打开对应文件小窗或固定预览 | P0 |
| N07 | 任务 / 活动栏 | 收件箱、待审批、待答问题 | TaskInbox/AttentionQueue；徽标只统计来源记录，打开不等于批准 | P1 |
| N08 | 上下文 / Composer旁或右侧工具栏 | 引用条详情、来源列表与预算 | ContextPanel + Popover/Sheet；打开与“加入本轮”是独立动作 | P0 |
| N09 | 运行输出 / 底栏入口 | 当前命令输出或命令列表 | Button + Tabs；显示最近失败/未确认标记；关闭不终止进程 | P0 |
| N10 | 计划 / 会话工具栏 | 当前计划、步骤与工具关系 | Item/ExecutionTraceTree；展示来源状态，不自行推进步骤 | P1 |
| N11 | 设置 / 活动栏底部 | 统一设置 Dialog | 当前会话选择保留；旧 `page=settings` 保留同一表单的独立页 | P0 |
| N12 | 快捷键/更多 / 底部 | 快捷键 Dialog、命令菜单 | Kbd + CommandPalette；初期 Mod+K沿用会话查找，避免直接改掉旧快捷键含义 | P1 |

会话/页面导航使用 URL；同页区域选择使用受控状态；打开设置使用 Dialog；执行请求使用明确动作按钮。这四类入口分别提供 `aria-current`、`aria-pressed`/Tabs、`aria-expanded` 或 busy 状态，不能统一处理成一组互斥 Tabs。图标附中文名称与 tooltip，选中和键盘焦点分别可见。

## 4. 按模块拆解的组件清单

标记：**复用**＝当前导出已有；**扩展**＝保持现有 API 的兼容增强；**新增组合**＝提案，尚未实现或导出。P0 是首轮可操作闭环，P1 是体验完善，P2 是可选深度能力。

| ID | 模块 / 必需子组件 | 现有组件及复用方式 | 增量与交互验收 | 优先级 |
| --- | --- | --- | --- | --- |
| W01 | 活动栏、侧栏、项目会话组、底部操作 | 复用 WorkspaceShell、ProjectSwitcher、SessionNavigator、SessionRow、Button、Tooltip、DropdownMenu | 新增活动栏组合；侧栏内容按活动切换；菜单动作与行选择互为兄弟目标；折叠后仍能进入文件与设置 | P0 |
| W02 | 会话 Header、环境详情、状态和停止 | 复用 SessionHeader、RuntimeStatusBadge、Sheet、Breadcrumb | 添加环境摘要与实际能力入口；长路径省略可查看完整值；停止请求待来源确认，断线不伪装失败 | P0 |
| W03 | 对话记录、代码块、引用、工具组、结果摘要 | 复用 AgentConversation、MessageContent、ToolCall、Conversation | 轮次级折叠与工具摘要组合；消息引用定位文件/工具/产物；代码复制范围可见；旧消息阅读保持滚动锚点 | P0 |
| W04 | Composer、附件条、模式/模型、权限、发送/停止 | 复用 AgentComposer、ChatComposer、ComposerControls、Popover、Select/Combobox、Button、Chip | 常驻简洁配置行；附件预览/移除；搜索式上下文；`@`引用、`/`命令分别由可访问选择器处理；键盘关闭后恢复输入选区 | P0/P1 |
| W05 | 上下文来源、引用选择器、预算明细 | 复用 ContextPicker/ContextPanel、Field、Checkbox、Combobox、DataRegion、Meter | 先增强 Picker 而非再造引用仓库；包含/排除、失效重读、引用小窗；仅在有已知分母时展示百分比，用量明细按来源标注 | P0 |
| W06 | 工具组、参数/结果、审批、提问 | 复用 ToolCall、ApprovalRequestPanel、AttentionQueue；需要回答表单时再按问题 schema 组合 Field | 参数/结果分区，定位对应命令/文件；approved、running、outcome独立；业务问题回答不复用权限批准按钮 | P0 |
| W07 | 命令列表、命令详情、输出、测试结果 | 复用 ExecutionOutputPanel、Item、Tabs、RuntimeStatusBadge；真实终端沿用 terminal 插槽 | 新增命令记录组合：commandId/runId/toolCallId、cwd、命令、开始/结束、exitCode、截断/连接；空输出也能区分运行与结束 | P0/P1 |
| W08 | 文件树、标签、只读代码/文本、定位行 | 复用 Tree、FileViewer、Tabs、Breadcrumb、ContextMenu、Resizable | 新增通用文件快照与标签组合；预览标签可替换、固定标签保持；来源修订变更提示；关闭标签不删除文件 | P0 |
| W09 | 文件 Quick Look、小窗工具栏、多类型 renderer | 复用 Dialog/Sheet、MessageContent、FileViewer、DiffViewer、DataTable、PreviewPanel | 新增统一文件预览组合；打开/固定/放大/复制/下载/加入上下文；文件类型与降级见第6节 | P0/P1 |
| W10 | 变更清单、Diff、行反馈、审阅摘要 | 复用 ChangeReviewPanel、DiffViewer、ReviewSummary、AlertDialog | 保留 base/head/revision 与过期反馈保护；文件小窗可转完整审阅；提交/回滚等仅为服务能力 | P0 |
| W11 | 计划、生成产物、版本、来源与引用 | 复用 ExecutionTraceTree、ArtifactList、ReviewSummary、MessageContent | 产物按类型和来源打开；可生成、可读取、已审阅、已验收分开；引用回到消息和工具；文件名不再决定 renderer | P0/P1 |
| W12 | 设置对话框、分类导航、字段、保存栏 | 复用 Dialog、Tabs、Field、FormSection、Select/Combobox、Switch、Checkbox、RadioGroup、Input | 新增设置组合；同一表单也用于设置页；草稿/有效设置分离；能力相关字段与错误明确，详见第5节 | P0 |
| W13 | 搜索、命令菜单、快捷键说明 | 复用 CommandPalette、Input、Kbd、Empty、DataRegion | 文件/会话/动作分组；动作先带回精确上下文，危险写入不因搜索命中立即触发；未提供搜索服务显示能力说明 | P1 |
| W14 | 窗口布局、连接恢复、反馈与可访问性 | 复用 WorkspaceShell、ResizableHandle、DataRegion、Alert、现有 OverlayLayer/ThemeBoundary | 同一资源跨Dialog/停靠保持身份；嵌套浮层逐层关闭；短视口主操作可达；不同状态不由颜色独自表达 | P0贯穿 |

表中的 `/` 菜单第一版可使用独立按钮与弹层，随后再增强光标处建议。不得把任意 `/文本` 当作可执行命令，也不得为了高亮引入一个会重挂载草稿的全新编辑器。

## 5. 对话框与设置内部控件

### 5.1 对话框清单

| ID | 对话框 / 触发入口 | 内部组件清单 | 应用、关闭与恢复 |
| --- | --- | --- | --- |
| D01 | 新任务 / N01 | Dialog、Field、Combobox项目、Select环境/模型、Textarea任务、上下文引用条 | 复用新任务 draftId；pending防重复，confirmed才切新会话；关闭不创建任务 |
| D02 | 工作台设置 / N11 | DialogHeader、DialogBody、DialogFooter、分类导航、搜索Input、FormSection、字段控件 | 与设置页共用表单；设置变更保留局部草稿；应用范围可见；未保存关闭按类型保留或确认丢弃 |
| D03 | 模型与生成选项 / Composer模型入口 | Popover或Dialog、模型Combobox、能力说明、支持时的推理强度RadioGroup/Select | 只显示来源支持的参数；切模型后不支持的参数明确提示并校验，不静默传给引擎 |
| D04 | 上下文选择 / N08、附件按钮 | Dialog/Sheet、Tabs类型、Combobox搜索、Checkbox多选、Item、来源摘要与预览 | 选择集合确认后加入草稿；按稳定来源ID/version/range去重，现有引用id由适配器映射；取消不改变引用，失败保留选择 |
| D05 | 工具与服务设置 / 设置分类 | 搜索Input、Accordion来源组、Checkbox工具、Switch启用、连接Badge、详情Sheet | 展示继承/锁定/不支持；工具启用、连接、单次批准分别表达；设置保存可能unknown |
| D06 | 工具批准 / 待审批记录 | 复用ApprovalRequestPanel；需要详细信息时Dialog、参数/目标/范围摘要 | 不再造第二套审批状态；requestId绑定服务对象；过期、重复、未知结果均可恢复；展开不批准 |
| D07 | 文件 Quick Look / 文件、引用、产物 | Dialog/Sheet、标题路径/版本、类型renderer、复制/下载/固定/放大/加入上下文 | 只读优先；关闭恢复来源触发器，来源已移除时落到同区域稳定控件；细节见第6节 |
| D08 | 执行环境详情 / Header | Sheet、只读Field、连接状态、项目/目录/分支/worktree、能力列表 | 区分当前run与下轮选择；连接/重连仅调用已提供能力；打开详情不切换环境 |
| D09 | 快捷键与命令 / N12 | Dialog、Input、Kbd、分组Item/CommandPalette | 尊重输入、IME、浮层作用域；关闭恢复触发位置；平台按键名称正确 |
| D10 | 有副作用的确认 / 回滚、恢复等 | AlertDialog、目标与影响范围、变更预览、确认/取消 | P2；由宿主能力提供，保留回执；不是每次关闭普通预览都弹确认 |

### 5.2 设置分类与字段清单

| 分类 | 字段与控件 | 生效范围 / 来源 | 首轮边界 |
| --- | --- | --- | --- |
| 模型 | 模型 Combobox；能力标签；支持时的推理强度 Select/RadioGroup；可选输出上限 Input | 下次请求；模型能力描述与用户选择由宿主传入 | P0模型；P1能力参数。Temperature/Top-p/seed不作为所有模型的必填项；确有范围时才用Slider+数值输入 |
| 工作方式 | Ask/Plan/Code 等能力选项 RadioGroup；选项说明 | 宿主提供的执行策略 | P1。与现有 send/queue/steer 调度方式独立；不重用 DraftState.mode 表示两种概念 |
| 权限 | 权限模式 Select；文件/网络/终端有效范围只读列表；继承与锁定说明 | 会话/项目/组织策略来源 | P0展示与选择；保存不表示取得服务授权，单次批准仍走审批记录 |
| 项目与环境 | 项目 Combobox；环境 Select；目录/分支/worktree只读；切换范围说明 | 当前项目和下次任务；活动run使用已确认环境 | P0。更换项目须明确新任务/导航，不能把当前会话改归另一个项目 |
| 工具与 MCP | 来源Accordion；工具Checkbox；可用性/连接/授权状态；重读Button | 宿主能力与服务配置 | P1展示与配置请求；不在组件内安装插件、启动MCP或保存密钥 |
| 上下文 | 自动附加偏好Switch；默认包含Checkbox；来源范围；用量/压缩说明 | 分开显示草稿引用、项目规则、模型用量 | P0来源和包含；P1偏好；压缩需服务回执，不能靠删历史消息假装完成 |
| 规则与 Skills | Item列表、Checkbox、只读文件预览、来源/作用域/优先级/锁定状态 | 宿主提供有效规则集合 | P1。项目指令与用户引用分开；浏览规则文件不等于已应用；执行Skill另走明确调用 |
| 外观与布局 | 主题/语言Select；布局RadioGroup；自动跟随偏好Switch；重置布局Button | 示例本地偏好，现有storage适配器 | P0。主题通过既有Provider；不得把B实验主题写进共享token；语言切换保留草稿 |
| 输入与快捷键 | Enter行为RadioGroup；命令列表+Kbd；可选按键录入Input与冲突信息 | 示例偏好或宿主设置 | P1。系统/浏览器快捷键冲突明确；已有Mod+K保持可迁移 |
| 连接与诊断 | 只读来源、连接、最后更新；重读Button；脱敏诊断摘要 | 宿主状态快照 | P1。可复制摘要不含密钥、私有环境变量或未脱敏日志 |

设置作用域必须在字段附近可见。纯本地外观可以即时预览；服务配置使用“草稿→校验→应用请求→确认快照”，取消不发请求。窗口中同时存在两类设置时分成有标题的区域与各自动作，避免一个“保存”暗含多个不同权限的写入。

设置 Dialog 桌面建议宽 `min(960px, viewport−32px)`、高不超过 `viewport−32px`；左分类约184px，正文滚动，标题与主要操作可达。窄屏改全高受限Sheet/单列分类选择；使用现有Dialog/Sheet组合验证，避免只放大原max-width而遗失焦点、滚动和ThemeBoundary。

## 6. 文件小窗、生成内容与预览类型

### 6.1 类型清单

| 类型 | 首选显示与操作 | 复用 / 新增范围 | 阶段 |
| --- | --- | --- | --- |
| 代码、纯文本、日志 | 行号、路径/修订、复制已显示内容、定位行、可选换行 | 扩展FileViewer适配普通快照；语法高亮独立懒加载，不能依赖站点专用模块 | E3 |
| Markdown、计划、报告 | 阅读/源码切换、标题、代码块、引用来源、复制/下载 | MessageContent作为安全子集；表格/列表等未覆盖语法需明确补齐或显示源码，不宣称完整Markdown | E3 |
| 图片 PNG/JPEG/WebP/GIF | 图片、尺寸/体积、适应窗口/原始比例、缩放、替代文字 | 新增图片renderer；大图/解码失败有降级；动图尊重减少动态效果 | E3 |
| JSON | 格式化文本、展开/折叠或源码、解析错误位置 | 初版有界文本，结构树后置；不执行表达式 | E4 |
| CSV/表格 | 列头、只读行、截断范围、下载原始内容 | DataTable展示受控结果；解析与行数限制单独处理，不能把未加载行算作0 | E4 |
| 文件差异 | unified/split、增删、重命名、行反馈、版本 | 复用DiffViewer/ChangeReviewPanel；宽审阅切Main；普通Quick Look不执行Git接受/回退 | E3 |
| HTML/SVG | 默认源码；受约束预览；需要交互时说明宿主能力 | 复用PreviewPanel的允许地址/沙箱边界；不直接将任意HTML/SVG插入主文档；SVG图像模式需验证资源策略 | E4 |
| PDF | 元数据、页数若已知、宿主提供的页预览/下载 | P2可选renderer适配；当前无专用PDF组件，不为展示清单预先引入重依赖 | E6可选 |
| 音频/视频 | 元数据、手动播放、进度与原生控件 | P2可选；默认不自动播放，来源地址和权限由宿主提供 | E6可选 |
| 目录、二进制、未知类型 | 元数据、目录树或不可预览原因、允许时下载 | Tree/DataRegion；没有正文、无权限与格式不支持分别表示 | E3 |

### 6.2 小窗行为

1. 文件树、消息引用、工具输出文件和产物列表统一调用 `openResource` 适配入口，带上 projectId/sessionId/resourceId/revision、可选行范围与来源对象。此名称是拟议的适配协议，不是当前导出。
2. E3先交付居中Quick Look与窄屏Sheet；提供关闭、放大到主区、固定标签、加入上下文、复制和可用的下载。单击预览不改变当前会话，不自动添加上下文，不执行文件。
3. 预览与固定标签区分：临时预览标签可被下一次打开替换；固定标签不被替换。同一revision资源重复打开聚焦已有视图；不同revision明确标识，不能用旧版本内容覆盖新标题。
4. 无边界多浮窗后置。E4可增加单个非模态浮窗：仍可操作Composer，支持停靠/放大/关闭，提供键盘移动/调整或位置菜单，窗口不能完全拖出可见区。嵌套下拉关闭先消费Escape；浮窗关闭再恢复触发焦点。
5. 当前DialogContent包含遮罩，不能仅设置Root `modal=false` 就声称支持可交互浮窗。先评估公共无模态内容变体或专用容器，复用OverlayLayer、ThemeBoundary与焦点管理，并单独验证。
6. 快照读取按资源身份取消/丢弃旧响应；同一对象刷新失败保留旧正文与过期提示。loading、empty、partial、error、success之外叠加denied/unsupported原因，不以空白代替失败。
7. 延续正文/日志/文件有界预览：文件默认1000行、每行8192字符；输出200行/32KiB；正文默认32KiB。额外renderer定义大小、行数和解码上限。复制显示片段与下载完整文件用不同标签；下载只有真实来源数据可用时启用。
8. renderer、图片读取和可选object URL随资源切换正确清理；懒加载与失败重试复用现有示例模块边界。不把全部预览器、PDF、完整IDE编辑器和PTY库放进初始包。

## 7. 状态、组件边界与修改位置

### 7.1 共享事实与责任

| 对象 | 当前基础 | 拟补字段/协议与所有者 |
| --- | --- | --- |
| 导航与布局 | PanelState、路由白名单、WorkspaceShell受控参数 | 增加活动区/打开文档/预览模式的视图状态；若扩展URL需同步parse/测试。尺寸、开关可由现有偏好适配器保存，文件正文和草稿不进入URL |
| 文件资源 | ChangedFile、ArtifactRecord、ContextReference | 增加独立ResourceSnapshot与renderer描述；资源身份、revision、mediaType、availability、bounded内容/下载能力由宿主给出。复用引用关系，不复制一套文件库 |
| 命令记录 | WorkbenchTool、session.output | 拟增CommandRecord集合，关联toolCallId/runId；每条独立输出与连接状态，未知exitCode显示“—”；输出订阅与PTY生命周期归宿主 |
| 设置 | DraftState的modelId/permissionId/environmentId | 增加能力schema、设置作用域、effective值、局部draft、保存receipt；不把服务设置塞进本地偏好storage |
| 消息与操作 | Session/Run/Turn/Message/Part ID与OperationReceipt | 继续按来源游标合并；窗口切换不重复订阅/重新执行；unknown先查询，不能靠关弹窗清锁 |
| 上下文预算 | 引用usage及contextLimit | 若需分类图，宿主提供模型/历史/工具/引用的用量快照、单位、时间和估算标志。未知不画0%或“足够”，移除引用只影响下一次草稿 |

模式分离：`send/queue/steer`是提交调度；Ask/Plan/Code是执行策略；权限是服务授权；模型参数是能力配置。四者使用独立字段，不能扩充一个mode字符串来兼任全部含义。

### 7.2 文件与组件落位

| 修改位置 | 计划职责 |
| --- | --- |
| `components/blocks/workspace-shell.tsx` | 可选活动栏槽与布局/响应式；默认不传时保持所有既有页面行为 |
| `components/blocks/agent-workbench.tsx`、`agent-workbench/navigation.tsx` | 活动入口组合及受控联动；WorkbenchFrame的首次进入/保留挂载两条路径保持一致 |
| `agent-workbench/composer.tsx`、`context.tsx` | 兼容增强快捷配置、引用条和选择器；保留简单使用方式 |
| `agent-workbench/conversation.tsx`、`panels.tsx`、`review.tsx` | 工具组、命令身份、文件/产物引用跳转；公共渲染器与宿主插槽 |
| 拟新增 `components/blocks/workbench-file-preview.tsx`、`lib/workbench-resource-model.ts` | 文件小窗和可移植资源模型；组件/模型不同名以支持Registry改写 |
| 拟新增 `components/examples/agent-workbench/settings-dialog.tsx`、`activity-navigation.tsx` | 设置表单和导航先在示例层验证；只有输入/回调契约稳定后再提取公共组合 |
| `components/examples/agent-workbench/` 下 provider/reducer/fixtures/showcase-model/messages | 示例适配、资源fixture、场景与双语文案；不在page中维护第二份Session |
| `lib/component-manifest.ts`、`registry.json`、相关示例与 `lib/i18n-*` | 新公共组件的导出/依赖/安装与文案；仅示例私有组合不虚增Registry条目 |

候选名称如WorkbenchActivityBar、WorkbenchSettingsDialog、WorkbenchFilePreview、WorkbenchDocumentTabs、ExecutionSessionList是本计划提案。实施前以最终props决定提取范围；不因清单有一个名词就新增一个公共包。既有Resizable、Dialog、Combobox等继续复用，不引入平行基础组件体系。

## 8. 交互与视觉表达

- 首屏优先显示当前任务、运行事实、消息、草稿与下一个可用动作。文件、设置和日志按需打开；避免把全部13个工具面板同时铺成一排Tab。
- 图标使用项目现有lucide与语义命名；不以彩色徽标替代标题。工具组可显示“读取3个文件”之类由记录计算的摘要，但展开后能定位每个真实call。
- 运行反馈用现有runtime状态、持续时间与来源阶段；流式光标和折叠动画只服务阅读。没有已知总量时不显示虚构百分比，不生成未提供的推理正文。
- 面板、弹窗与折叠使用已有motion token；减少动态效果时取消位移/缩放及装饰性循环。新消息跟随仍是距底部64px规则；当前阅读位置不被产物出现或工具折叠抢走。
- 消息、代码、终端输出和文件正文可选中；可交互区域才有hover。仅当前可见区域进入焦点顺序，隐藏Composer保留挂载但不能残留Tab stop。

## 9. 分阶段实施与完成门槛

各阶段先做区域示例，再接入完整编码模板；不要同时重构三个模板。进入实施后新增独立 `plans/agent-coding-workbench-enhancement-log.md` 记录实际提交、截图、命令和失败，不改写前两轮完成记录。

| 阶段 | 工作包 | 产出与完成门槛 | 依赖 |
| --- | --- | --- | --- |
| E0 基线与接口 | 冻结当前路由/props/草稿行为，确认活动栏布局与资源身份，补齐fixture清单 | 路由及组件映射、状态转移和验收脚本清单；核对Inspector契约残留文字：Component-Specification追加段仍写300–360，而主表/实现为280–360；只统一文字不暗改尺寸 | 起点 |
| E1 侧边入口 | W01/W02，N01–N03/N05/N06/N11 | 活动栏、辅助侧栏、导航收敛；设置入口可先打开既有设置页；宽窄屏可完成切会话/看文件/回草稿；URL前进后退正确 | E0 |
| E2 设置与输入 | W04/W05/W12，D01–D05/D08 | 设置Dialog及同源设置页、快捷模型/权限、上下文选择与引用条；取消/应用、能力缺失、IME、跨会话草稿和焦点恢复通过 | E1 |
| E3 文件与产物闭环 | W08–W11，D07 | 文本/Markdown/图片/Diff Quick Look、固定标签、定位来源、加入上下文、真实fixture字节下载；来源版本切换与过期响应通过 | E0/E2 |
| E4 工具与运行体验 | W03/W06/W07/W13，D06/D09，结构化预览与可选单浮窗 | 工具→命令→输出→文件→消息闭环；多命令fixture、失败/无输出/断线/unknown；JSON/CSV与受约束HTML/SVG降级；单浮窗只有完成可访问性验证才启用 | E3 |
| E5 展示与分发 | W14，区域与全部模板回归 | 桌面/移动、双语、短视口与主题、长内容、基础检查、修改公共源码时的独立安装；生成实施记录和完成矩阵 | E1–E4 |
| E6 可选深度能力 | PDF/媒体、完整编辑器、真实PTY、Git/PR/检查点、持久化 | 每项单独定义宿主API、权限、来源回执和服务验收；与原组件计划M6衔接；未接入项保持明确不可用 | 独立后续 |

建议第一交付切片为 **E1 → E2 → E3**：侧边按钮可进入对应区域，在设置弹窗调整下一轮参数，从对话/上下文/产物打开真实fixture文件小窗，再回到原草稿继续。这一切片最直接覆盖本次需求。

## 10. 场景与验收清单

### 10.1 必备演示数据

| 场景 | 必须可观察的行为 |
| --- | --- |
| 编码正常流程 | 新任务配置 → 文本/选区上下文 → 对话工具记录 → 命令结果 → Diff → 生成报告 → 文件小窗 → 反馈回草稿 |
| 等待人工 | 工具待批准与问题待回答分开；切文件或设置后仍定位同一request；拒绝与批准都等待来源确认 |
| 命令异常 | 运行中无输出、非零退出、部分输出、连接丢失、unknown；日志展示和取消/重连操作分别控制 |
| 多类型文件 | `.ts`、`.md`、`.json`、`.csv`、图片、HTML/SVG、二进制和不可读文件；PDF/媒体在未接renderer时有明确说明 |
| 上下文恢复 | 附件上传未完成、失败、版本失效、无权限、用量未知/估算/超限；移除不删除源文件 |
| 设置恢复 | 无支持模型、参数不兼容、策略锁定、校验失败、保存unknown、切项目与回退；旧有效设置和新草稿不混同 |
| 窗口联动 | 消息打开文件 → 固定 → 对应Diff → 命令来源 → 返回消息；资源修订变更、切会话与旧读取迟到 |

### 10.2 实施验收

- [x] 桌面1440×900、1280×800，窄容器1024×768、768×1024、390×844；200%缩放，粗指针与reduced-motion。对话框额外测390×240短视口，关闭/主要操作可达，窗口内滚动。
- [x] 键盘能操作活动栏、树、标签、选择器、设置和小窗；Dialog内Select/Combobox打开时Escape只关最上层；再关闭Dialog才恢复触发器。触发器因导航消失时有稳定备用目标。
- [x] 草稿包含中文IME、长文本、选区和未完成提交；切窗口、主题、语言、面板不重挂载；失败或unknown保留草稿；confirmed只清提交的版本。
- [x] 读取A后切B，A迟到不能覆盖B；同一文件revision切换、产物更新和日志订阅分别验证；关闭窗口不终止服务或重复执行。
- [x] 审批、参数/日志脱敏、复制/下载、输出截断、代码/HTML安全显示、受限来源均有行为证据；未知exitCode不显示0。
- [x] 1000条消息、1000行文件、多命令连续输出做测量；记录首个可用动作、滚动响应、DOM数量、内存与renderer加载范围。`deferOffscreen`仍不是虚拟列表，未通过长数据测量不能宣称大规模容量。
- [x] 复用现有工作台模型/浏览器套件，针对新增联动补回归；`pnpm lint`、`pnpm typecheck`、`pnpm build`通过；公共源码/CSS/依赖变化时运行`pnpm test:install`，Manifest/Registry/双语/文档检查覆盖所改范围。
- [x] 保留原overview/regions/layouts/app路由、三模板、既有安装方式与独立消费者；能力缺失时给出原因。测试记录区分静态、fixture、独立安装和真实服务。

### 10.3 计划文档交付记录（实施前）

本轮交付为增强计划及文档入口。已核对上述源码、组件导出与Registry、现有完成记录，并查看现有页面；新组件、E0–E6实现与真实服务验收尚未执行。

验证使用上述HEAD加本轮文档的隔离快照，依赖复用现有安装；共享3010开发服务未重启，三个并行icon/SVG计划未纳入本轮提交。

| 检查 | 本轮结果 |
| --- | --- |
| 本地Markdown相对链接、N/W/D/E编号完整性、`git diff --check` | 通过；12类入口、14个模块、10类对话框、7个阶段 |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |
| `EASYUSEUI_LOCAL_BUILD=1 NEXT_PUBLIC_SITE_URL=http://localhost:3010 pnpm build` | 通过；Webpack/WASM SWC完成静态导出，构建内Manifest/Registry、Blog、Docs检查通过 |
| 当前示例浏览器观察 | 查看桌面会话/设置/审阅与窄屏会话；设置/审阅复查未收集到pageerror；不作为新增功能测试 |

第一次裸`pnpm build`因隔离快照未设置`NEXT_PUBLIC_SITE_URL`被配置检查拒绝；按`.env.example`显式提供本地验证环境后通过，未修改配置校验逻辑。此为文档交付，未改变公共源码/CSS/依赖，未重复安装测试或声称E0–E6交互已经通过。

### 10.4 E0–E5 实施交付

E0–E5完成矩阵、接口边界、验收命令、浏览器回归、独立安装与长内容测量见 [实施记录](./agent-coding-workbench-enhancement-log.md)。以上勾选对应本地fixture和公共组件契约；真实日志订阅、服务执行、权限持久化及业务验收仍由E6宿主适配器提供。E4可选非模态浮窗保持后置，当前使用可访问Dialog和主区停靠。
