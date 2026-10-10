# Agent 工作台：组件评估与建设计划

日期：2026-10-09。状态：M0–M5 已完成，M6 为后续服务集成；见 [实施记录](./agent-workbench-implementation-log.md)。

目标：用 EasyuseUI 构建 Codex 类型的 Agent 工作台。先按区域设计、实现并提供独立网页展示，再组合布局，最后形成可以连续操作的完整网页示例。展示顺序、路由和场景见 [网页展示计划](./agent-workbench-showcase-plan.md)。

## 1. 结论与范围

现有组件足以作为工作台 UI 的基础。WorkspaceShell、SessionRow、Conversation、ChatComposer、ToolCall、Inspector 以及 Agent Board 系列已经覆盖主要布局和记录展示，但尚不能直接组成具有完整行为的编码 Agent 产品。

缺口集中在项目/会话导航组合、上下文引用管理、结构化消息正文、完整输入控制、文件差异与审阅、终端/预览适配，以及把这些区域连接起来的会话状态契约。真实模型调用、文件系统、Git、PTY、浏览器控制、鉴权和持久化继续由调用方服务提供。

本轮计划的交付终点是：可分发区域组件 + 区域展示网页 + 三种完整工作台示例 + 可复现的本地交互与恢复验收。真实后端接入作为独立后续里程碑，不作为本地展示已经具备的能力。

本项目采用组件复用模式；借鉴其他产品的信息架构与行为，不复制其品牌，不假定已获得其应用前端源码。

## 2. 产品调研与设计依据

以下为本次打开的官方资料，访问日期同上。产品功能可能继续变化；实施时重新核对所接引擎版本。OpenAI 原 Codex app 文档部分已跳转至 ChatGPT Learn，下面使用实际正文地址。调研依据是官方文档和公开架构说明，未完成这些产品的登录态逐页体验或像素测量。

| 产品/来源 | 已确认的设计或实现 | 对 EasyuseUI 的启发 |
| --- | --- | --- |
| [Codex 代码审阅](https://learn.chatgpt.com/docs/code-review?surface=app) | 独立审阅面板，按变更范围查看文件，支持行级反馈；本地变更审阅与 PR 审阅有不同流程 | Diff 使用主工作区，明确 base/head/revision；查看、反馈、Git 写入分开 |
| [Codex App Server](https://learn.chatgpt.com/docs/app-server) | thread、turn、item 生命周期；初始化握手、继续会话和事件通知 | UI 使用稳定标识和受控快照；引擎协议在适配器映射，不直接散落在组件里 |
| [Cursor Agent](https://cursor.com/docs/agent/overview) | Agent 使用工具、模型和指令；区分排队消息与途中引导；检查点只回退文件，不删除对话 | Composer 区分 send/queue/steer；“恢复文件”与“恢复对话”必须有不同语义 |
| [Cursor 2.0 界面发布说明](https://cursor.com/changelog/2-0) | Agent/计划侧栏、多文件审阅、内嵌浏览器；并行任务使用 worktree 或远程环境隔离 | 左栏组织任务，主区承载工作产物；环境隔离属于服务能力。此来源只证明该版本设计，不作为当前全部功能清单 |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | 会话侧栏；输入前选择环境、项目、模型和权限；chat/diff/browser/terminal/file 等面板可组合；Diff 支持逐行反馈 | 新会话页明确执行范围；会话中的工具区保留当前任务关系；窄屏切换面板 |
| [OpenHands 公开架构](https://github.com/OpenHands/OpenHands/blob/main/docs/architecture.md) | React/TypeScript 前端分离 API、组件、hooks、stores 与 mocks；conversation/files/browser/terminal 等区域可打包，执行依赖 Agent Server | 区域组件、示例控制器和服务适配器分层；演示数据与真实执行使用不同证据 |

上述事实不足以证明 Codex、Cursor、Claude Desktop 的内部 React 组件、存储或布局引擎实现。本计划的组件名、路由、布局和状态接口是 EasyuseUI 的设计提案。

采用的共同结构：项目与会话导航 → 当前任务对话 → 上下文/文件/审阅工作区 → 按需打开的运行详情。V1 采用固定布局预设和受控面板，不先建设任意拖放停靠系统。

## 3. 当前源码能力核对

这是工作区源码快照评估，不是发布版本认证；初始评估时存在并行未提交工作。实施已固定正式依赖基线并重新验证，见实施记录；下表保留建设前的能力核对。

| 区域 | 已核对的实际组件/来源 | 当前能力与缺口 | 决策 |
| --- | --- | --- | --- |
| 工作台框架 | [WorkspaceShell](../components/blocks/workspace-shell.tsx) | 侧栏、主区、Inspector、底部面板及受控布局；不管理会话或服务 | 直接复用，外加工作台组合 |
| 项目/会话侧栏 | [SessionRow](../components/blocks/session-row.tsx)、[Tree](../components/ui/tree.tsx)、Item、CommandPalette | 行、树、选择和动作基础存在；缺项目分组、收藏、未读、归档和查找整合 | 新增 SessionNavigator，复用行与树 |
| 对话区 | [ChatMessage / Conversation](../components/blocks/chat-message.tsx) | 消息状态、工具插槽、跟随底部；content 当前为字符串段落，未提供完整 Markdown/引用/代码正文；历史获取归调用方 | 扩展正文槽位/渲染器，新增会话组合 |
| 输入区 | 同文件 ChatComposer | 受控草稿、IME、send/stop、附件槽；streaming 时禁止发送，缺模型/权限/上下文选择与 queue/steer | 兼容扩展能力接口，新增 Composer 组合，保留原简洁接口 |
| 工具记录 | [ToolCall](../components/blocks/tool-call.tsx) | 状态、参数/输出、审批回调、脱敏、有界预览和未知结果对账 | 直接复用，不另造工具卡 |
| 上下文与详情 | [Inspector](../components/blocks/inspector.tsx)、Tree、Chip、Sheet、Tabs | 受控对象详情存在；缺文件/选区/规则/链接/图片引用集合和来源可用性 | 新增 ContextPanel / ContextPicker |
| 人工介入 | [ApprovalRequestPanel](../components/blocks/approval-request-panel.tsx)、[AttentionQueue](../components/blocks/attention-queue.tsx) | 运行审批和关注队列已有；具体会话/工具映射仍需适配 | 复用并接入共享会话快照 |
| 运行/产物 | [AgentBoardWorkspace](../components/blocks/agent-board-workspace.tsx)、[ExecutionTraceTree](../components/blocks/execution-trace-tree.tsx)、[ArtifactList / ReviewSummary](../components/blocks/artifact-list.tsx) | 列表、Trace、产物和审阅摘要存在；ReviewSummary 不是代码 Diff 编辑器 | 直接复用；补独立代码审阅区域 |
| 文件与 Diff | Tree、DataRegion、Tabs 等基础控件 | 未发现可直接使用的完整 FileViewer / DiffViewer / 行评论工作区 | 新增只读文件、Diff 与反馈组件 |
| 终端/预览 | ToolCall 输出、WorkspaceShell 底栏 | 输出文本不是 PTY；截图或 iframe 不是远程浏览器控制 | 新增日志/预览容器与宿主插槽；真实适配后置 |
| 设置与选择器 | Field、FormSection、Select、CommandPalette、Sheet | 通用字段与选择可用；模型列表、权限策略和环境连接需外部数据 | 组合，不在组件里硬编码提供商 |

并行新增的 Sidebar、Attachment、Questionnaire、Resizable，以及 Conversation.actionsRef 等增强可以作为候选依赖。它们当前有未提交实现或修改；M0 核对合并与验证状态后再采用。使用 WorkspaceShell 时不能再套一层独立 Sidebar 布局所有者；Questionnaire 仅用于补充问题，不能替代权限审批。

2026-10-11 `/workspace/` 按用户要求复用新版编码对话工作台并默认进入会话；WorkspaceShell 展示移至 `/workspace/shell/`，`/workspace/agents/` 继续承担运行看板。见[入口迁移记录](workspace-entry-migration-log.md)。`lib/example-manifest.ts` 中的“Agent 编码工作台”仍链接分层示例总览。

## 4. 区域划分与组件建设

以下名称均为拟新增，实施前按真实 API 和重复能力再收敛。区域组件首先可独立渲染，再由同一个组合组件装配。

| 区域 | 拟建组件/组合 | 核心内容 | 优先级 |
| --- | --- | --- | --- |
| A 导航 | SessionNavigator、ProjectSwitcher | 新会话、项目分组、运行中/最近/归档、搜索、收藏、未读和会话动作 | P0 |
| B 顶部任务栏 | SessionHeader | 名称、项目/分支/环境、运行状态、主要动作和面板开关 | P0 |
| C 对话 | AgentConversation、MessageContent | 文本/代码/引用、工具调用、计划进展、阶段与结果摘要、历史和新消息提示 | P0 |
| D 输入 | AgentComposer、ComposerControls | 草稿、附件/@引用、模型、权限、send/stop；按能力开启 queue/steer | P0 |
| E 上下文 | ContextPanel、ContextPicker | 本轮引用、会话来源、规则/技能、文件选区、可用性、上下文用量 | P0 |
| F 工具工作区 | WorkbenchPanelTabs | 上下文、文件、变更、产物、计划、活动等区域切换及宿主扩展槽 | P0 |
| G 文件/审阅 | FileViewer、ChangeReviewPanel、DiffViewer | 文件导航、行号、变更范围、统一/并排差异、反馈草稿和定位 | P0 |
| H 底部运行 | ExecutionOutputPanel、PreviewPanel | 命令输出、测试摘要、来源时间、预览、断开状态；真实终端挂载槽 | P1 |
| I 人工介入 | 现有审批组件 + 会话适配 | 范围与风险、问题回答、批准/拒绝回执、等待与未知结果 | P0 |
| J 辅助页面 | WorkbenchSettings、TaskInbox（优先例子组合） | 环境/模型/权限配置展示、待处理/失败/待审阅任务 | P1 |

ContextPanel 表示上下文内容；WorkbenchPanelTabs 表示区域导航；Inspector 表示当前选中对象属性。三者不合并成一个既导航又存储又发请求的大组件。

F 区域通过描述符接入面板：id、label、可用性、未读/待处理提示、render。V1 实现 context/files/changes/artifacts/plan/activity；terminal/preview 在 P1 实现；git/pr/notes/browser/editor 作为扩展槽，未接入显示具体原因。不能用三个静态 Tab 宣称完成全部工具区域。

## 5. 布局与视觉契约

沿用 [Design-rules](../Design-rules.md) 和 [Component Specification](../Component-Specification.md)：Compact、4px 网格、中性背景、1px 分隔线、默认32px控件、粗指针44px命中区域。数据列表采用 Item/List/Table；不把每条消息、工具、会话都包装成 Card。

```text
┌──────────┬────────────────────────────────────────────────────┐
│ 项目/会话 │ SessionHeader：任务 · 环境 · 状态 · 面板开关       │
│ 导航      ├─────────────────────────────┬──────────────────────┤
│           │ Conversation                │ Context / Files /    │
│ 搜索      │ 消息、工具、计划、审批       │ Changes / Artifacts  │
│ 最近      │                             │                      │
│ 运行中    ├─────────────────────────────┤ 选中对象详情按需打开 │
│ 归档      │ Composer + 上下文 + 控制    │                      │
│           ├─────────────────────────────┴──────────────────────┤
│ 设置      │ 可收起：运行输出 / 测试 / 预览                     │
└──────────┴────────────────────────────────────────────────────┘
```

图中右侧宽工作区属于 Main 的分栏；元数据 Inspector 仍使用 Shell 的详情能力。主区分栏与 Inspector 不默认同时展开，避免出现四个狭窄列。

- 侧栏256，折叠48。Inspector默认320，范围280–360；M0已将旧文档300px下限与既有受控实现统一，处置见实施记录。
- 对话文字最大宽800；Composer固定在对话区底部，正文独立滚动。Header48、Toolbar40，遵守现有主区尺寸。
- 对话优先布局使用标准 Inspector；审阅优先布局在 Main 展示宽 Diff，窄 Inspector 仅呈现属性。宽工作区建议最小480，对话建议最小440，为本场景局部约束。
- 先收起 Inspector，再折叠侧栏；主区空间不足时切换 Conversation/Workspace 单面板。以容器剩余宽度判断，不仅判断浏览器宽度。
- 底部默认收起，展开默认240、范围200–400。关闭只改变可见性，不停止任务或进程。
- 小屏把导航和详情放入 Sheet；输入区避开软键盘；面板切换保留草稿、选区和滚动位置。

## 6. 数据模型与动作边界

模型已实现于 `lib/agent-workbench-model.ts`，与组件文件名区分，避免 Registry 改写冲突。以下描述模型职责，实际导出类型与API见源码和 AGENT-WORKBENCH.md。

| 模型 | 必须表达的事实 |
| --- | --- |
| ProjectRef / EnvironmentRef | projectId、仓库/目录标识、environmentId、分支/worktree、连接状态与可用能力 |
| SessionSnapshot | sessionId、projectId、activeRunId、revision、历史分页信息、能力快照；引擎 threadId 单独映射 |
| Turn / MessagePart | turnId、messageId、稳定 partId、文本/代码/工具/产物/计划引用；来源顺序与修订 |
| DraftState | 按 sessionId 隔离的文本、上下文、附件、模型与输入模式；新会话单独 draftId |
| ContextReference | id、kind、来源路径/URL/选区、版本、可用性、包含状态、可移除性；字数/token 的来源与估算标记 |
| ChangeSet / ReviewComment | repositoryId、scope、base/head、revision、fileId、old/new line、反馈草稿；二进制/重命名/截断 |
| OperationReceipt | requestId、目标对象、动作、pending/confirmed/failed/unknown、回执引用；不复用 runtime 状态轴 |
| PanelState | activePanel、选中文件/工具、宽度、折叠、阅读位置；UI 偏好不替代服务状态 |

关键规则：

1. Session、Run、Turn、Message、ToolCall 使用独立 ID；用户切换会话不会取消上一任务。丢弃旧对象迟到响应，事件按来源游标/序号去重，不能根据浏览器到达时间猜完成顺序。
2. 历史补载保留阅读锚点；streaming修订仍更新同一消息；距底部≤64px才跟随。`actionsRef` 若采用，仅定位已加载消息，跨页定位由适配器先加载。
3. send 在来源确认后清理对应草稿版本；确认到达前用户继续输入的新内容不应被清空。失败保留草稿；unknown先对账，再决定能否重试，防止重复执行。
4. queue 等待上一轮结束，steer 影响当前任务，interrupt 请求终止本轮；关闭订阅、停止模型任务、终止PTY分别定义。缺少能力就明确不可用。
5. UI 选择的权限模式只是请求；最终允许范围由服务返回。审批点击后等待来源确认，不能立即把工具标为成功。
6. 模型/环境切换说明作用于下次发送还是当前会话；不通过切换控件自动重建会话。能力列表由调用方传入，不硬编码模型产品名和价格。
7. 附件上传与上下文注入分别确认；File 对象只在本地不等于引擎已读到。移除引用不删除源文件。超限、失效、权限拒绝、上传失败各有恢复入口。
8. Markdown 禁止默认执行HTML；代码与引用可复制且有界。保留现有消息 content 和可访问文本，不为流式消息重复渲染两份正文。只展示来源可见的阶段、计划与摘要。
9. Diff操作绑定具体版本。版本变更使旧行反馈进入待重新定位状态。审阅结论、测试结果、运行完成、交付验收和PR状态分别展示。
10. 内置文字使用 typed i18n，默认zh-CN、支持en；切语言不重挂编辑器、不改变用户文本、不触发服务写入。

## 7. 实现分层与目录提案

```text
lib/agent-workbench-model.ts                 # 可移植类型、纯校验与能力模型
components/blocks/agent-workbench/           # 导航/上下文/输入/会话/审阅组合
components/blocks/agent-workbench.tsx        # 公共组合入口，文件名与模型区分
components/examples/agent-workbench/        # fixtures、reducer、场景、浏览器适配
app/examples/agent-workbench/               # 展示路由，薄装配
tests/agent-workbench-*.spec.ts              # 模型、区域与完整行为
AGENT-WORKBENCH.md                           # 组件合同与集成说明
plans/agent-workbench-implementation-log.md  # 逐阶段验收记录
```

- 可分发组件只收props/快照/回调，不依赖Next路由、站点资源、认证、网络服务和本机路径。
- 示例控制器统一生成会话、工具、审批、产物和Diff状态；区域Demo与整页共用同一套组件，不维护两份交互实现。
- 新公共组件同步 `lib/component-manifest.ts`、明确的demo-loader导入、Registry、便携i18n与主题依赖。生成文件由项目脚本维护，不手写第二份索引。
- FileViewer / DiffViewer先完成可访问只读文本和反馈；富编辑器与PTY按独立适配器懒加载。依赖选型必须检查许可证、体积、SSR、worker、CSS与独立安装；不在计划阶段指定未经验证的编辑器依赖。
- 静态导出沿用当前 `next.config.ts`；fixture路由通过静态路径和客户端query选择对象，真实后端不塞进静态站Route Handler。实施前读已安装Next版本的相关指南。

## 8. 里程碑与完成门槛

顺序为 M0 → M1 → M2 → M3 → M4 → M5；每个阶段产物可独立审阅。M6是真实集成后续阶段。

| 阶段 | 优先级 | 下一步/产出 | 验收条件与证据 |
| --- | --- | --- | --- |
| M0 基线核对 | P0 | 固定相关源码版本；核对并行组件；解决尺寸合同差异；定模型、路由和能力矩阵 | 复用/扩展/新增清单准确，未验证候选依赖标记明确，状态转换及fixture设计评审通过 |
| M1 四个核心区域 | P0 | Sidebar、Context、Conversation、Composer依次实现并放入独立区域网页 | 每区有默认/极端内容/五态/键盘/移动展示；草稿、引用、发送失败和历史阅读可操作 |
| M2 工作区域 | P0/P1 | Header、工具/审批、文件/Diff、计划/产物；然后日志与预览 | 逐区展示；审批无假确认；Diff有版本；日志与PTY能力界限清楚 |
| M3 布局组合 | P0 | 对话优先、审阅优先、任务总览三种预设 | 同一会话在布局切换后草稿、引用、运行和选区一致；桌面到移动无主操作丢失 |
| M4 完整网页 | P0 | 首页、新会话、会话、审阅、任务收件箱、项目、设置；三种完整模板 | 从新任务到审批/失败恢复/审阅产物闭环可连续操作，深链与返回可恢复正确对象 |
| M5 分发与展示验收 | P0 | Catalog/Registry/示例目录、使用说明、截图与实施记录 | lint/typecheck/build、行为浏览器测试、test:install通过；仅准确标注本地fixture验收 |
| M6 真实服务适配 | 后续 | 选择一个引擎验证事件/鉴权/存储/文件/Git/PTY能力 | 另行记录真实发送、审批、断线恢复、读取/写入与回执；UI测试不能代替此项 |

## 9. 验证范围与交付记录

M0–M5 已完成；隔离验证与逐项结果见 [实施记录](./agent-workbench-implementation-log.md)。必须运行 `pnpm lint`、`pnpm typecheck`、`pnpm build`，涉及便携源码/CSS/Registry运行 `pnpm test:install`；行为变更运行浏览器测试。

必须覆盖：跨会话草稿隔离、乱序/重复事件、旧请求迟到、历史锚点、发送确认丢失、审批确认丢失、取消未确认、上下文失效、Diff版本变化、输出截断、刷新保留已有内容、无能力操作、IME、键盘焦点、触摸、减弱动效与切语言保留编辑状态。

用1,000条历史消息、多段工具输出和长Diff测量渲染/滚动；按浏览器结果决定分页、窗口化或布局延迟策略，不预先承诺性能数值。`content-visibility`不能称为虚拟列表。

实施记录分别列明“区域UI通过”“整页fixture闭环通过”“独立安装通过”“真实服务未接入/已验证”。检查通过后按仓库规则只提交本任务路径，保留并行工作；实际实现阶段再完成授权的提交与推送。
