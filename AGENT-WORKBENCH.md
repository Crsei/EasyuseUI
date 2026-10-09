# Agent 编码工作台

入口：[/examples/agent-workbench/](/examples/agent-workbench/)。区域实验室 → 三种布局 → 编码、产物审阅、多任务三种完整示例。

后续改造见 [编码工作台增强计划](plans/agent-coding-workbench-enhancement-plan.md)：侧边工具入口、设置对话框、上下文、命令输出与多类型文件小窗的组件清单和 E0–E6 验收安排；该计划尚待实施。

## 安装与分层

```sh
npx shadcn@latest add http://localhost:3010/r/agent-workbench.json
```

Host/scoped 主题安装沿用 [I18N.md](./I18N.md) 与 [主题合同](./THEMING.md)。单区域可安装 `session-navigator`、`agent-composer`、`context-panel`、`change-review-panel` 等条目；同组组件共享源码。公共组合入口为 `components/blocks/agent-workbench.tsx`，纯模型为 `lib/agent-workbench-model.ts`。公共源码不依赖 Next、站点资源、认证、网络或本地持久化。

```tsx
import { AgentWorkbench } from "@/components/blocks/agent-workbench"
// session、panelState 和所有区域回调由宿主提供完整受控快照。
// navigation、composer、workspace、inspector、bottom 是公共区域组件的组合。
```

WorkspaceShell 是唯一布局所有者。侧栏默认256/折叠48，Inspector320，允许280–360；底栏默认收起，展开240，允许200–400。Header48、Toolbar40。Inspector 的旧300px下限已与受控实现统一为280px，未改变既有运行布局行为。

对话优先使用受控 Inspector；审阅优先将宽 Files/Diff 放在 Main，元数据详情按需打开。主区容器不足920px时用键盘可达的对话/详情切换，不挤压两个文本区。切换布局通过 CSS 隐藏保留已挂载 Composer；窄屏导航和 Inspector 由 Shell 的焦点受约束浮层承载。底栏关闭仅改变可见性。

## 区域 API

| 组件 | 主要输入与回调 |
| --- | --- |
| ProjectSwitcher / SessionNavigator | projects、sessions、projectId、selectedId；onProjectChange/onSelect/onNew/onUpdate；可选receipts/onReconcile |
| SessionHeader | session/environment；onRename/onInterrupt；actions 插槽 |
| MessageContent / AgentConversation | content 或完整 session；onLoadHistory/onOpenReference；attention/composer 插槽、actionsRef |
| ComposerControls / AgentComposer | draft、models/permissions/environments、receipts；onChange/onSubmit/onInterrupt/onReconcile/onFiles |
| ContextPicker / ContextPanel | 来源引用；onPick/onInclude/onRemove/onRetry/onOpen；用量来源及估算标记 |
| WorkbenchPanelTabs | id/label/available/reason/badge/render 描述符；受控 value/onChange |
| FileViewer / DiffViewer / ChangeReviewPanel | 文件、base/head/revision；受控文件、评论、差异模式；onFeedback 仅整理草稿 |
| ExecutionOutputPanel / PreviewPanel | 来源日志、时间、连接/截断；可选 PTY 或预览宿主插槽 |
| TaskInbox | 来源 runs/attention；onSelect 查看与 onEnter 进入会话分开 |
| AgentWorkbench | session、layout、panelState；区域插槽与受控布局回调 |

工具和人工介入复用 ToolCall、ApprovalRequestPanel；产物、审阅和任务总览复用 ArtifactList、ReviewSummary、ExecutionTraceTree、AgentRunList、AttentionQueue。设置在示例层组合 Field/FormSection，不另建服务配置仓库。

## 模型与结果确认

Session、Run、Turn、Message、Part、Tool、Request 使用独立稳定 ID。`applySessionEvent` 只接受相同会话的连续来源游标；重复、旧对象和游标缺口不改变正文。调用方遇到缺口应按来源游标重新读取并顺序补齐，不以浏览器到达时间推断事件顺序。消息修订替换同 ID 的正文，消息 part 按来源序号排列并去重。

Draft 按 sessionId 隔离；新任务另有 draftId。操作回执与 runtime 状态分开：pending / confirmed / failed / unknown。`acknowledgeDraft` 仅在 confirmed 且版本等于提交版本时清理文本和引用。确认期间新增输入保留。unknown 禁止再次写入，先查询来源结果；查询也是调用方能力，不隐式重发原操作。

send 开始新轮，queue 等上一轮结束，steer 引导当前 run；interrupt 等来源确认才取消本轮。关闭页面/订阅/面板不等同停止模型或终止 PTY。模型、权限和环境选择作用于下次提交，最终能力与权限以服务返回为准。未提供能力的入口禁用并说明原因。

上下文有独立的 uploading/failed/stale/denied/unknown。本地 File 选择不代表上传或引擎读取；示例必须显式确认附件可用。移除只移除本次引用。用量未知显示未知；估算附来源。所有 included 引用就绪且未超出调用方 token 上限才能提交。

## 内容、审阅与输出

MessageContent 支持安全的段落、标题、inline code 与 fenced code 子集；HTML 作为文本，不执行 HTML、脚本或任意富编辑器插件。正文默认32KiB预览，允许宿主设置更低/最高256KiB；代码复制限于已显示内容。ChatMessage.renderContent 替换单份正文，原 content 保留为复制和可访问文本；旧字符串接口兼容。

Conversation 复用64px跟随边界与历史锚点。工作台使用可选 `layout="fill"`，在有明确高度的父容器内让历史独立滚动，Composer留在底部；旧调用默认content布局。输入设置与上下文默认折叠，展开内容限高滚动，不挤出草稿与发送操作。`deferOffscreen` 只是浏览器布局延迟，1000条记录仍在 DOM，不能称为虚拟列表。跨页定位先由宿主补载，再调用 actionsRef。

File/Diff 默认最多1000行、每行8192字符；来源截断与本地截断均提示。文件是只读快照，支持新增/删除/重命名/二进制。评论绑定 repository/base/head/revision/file/oldLine/newLine；版本变化后旧反馈禁止送出，需要显式重新定位。整理到草稿不执行 Git 批准、提交或 PR 操作。

ExecutionOutputPanel 脱敏后再筛选、展示和复制，最多200行/32KiB。日志不是 PTY。PreviewPanel 的 iframe 要求宿主显式 allowed，地址限 HTTP(S)、无嵌入凭据，使用空 sandbox 与 no-referrer；宿主也可直接提供 React 预览插槽。未提供 PTY、浏览器控制、编辑器、Git、PR 等适配器时显示具体不可用原因。

## 示例与路由

固定静态路由加白名单 query：region/layout/template/page/session/panel/scenario。非法标识提供恢复入口。URL 不存草稿、文件正文或凭据。共用的 WorkbenchExampleProvider 保留跨路由状态；前进/后退只恢复导航，不启动任务。刷新重置业务 fixture。

- R1–R10：侧栏、上下文、对话、输入、标题、工具审批、文件审阅、输出预览、计划产物、收件箱设置。
- L1–L3：对话优先、审阅优先、任务总览。
- T1：新任务 → 创建确认 → 工具批准 → 来源测试失败 → 补充反馈确认 → 来源完成 → Diff反馈。
- T2：资料引用 → 报告生成批准 → 来源报告产物 → 引用定位 → 反馈回到会话；不要求代码执行。
- T3：来源给出的并存任务 → 待批准/问题/失败筛选 → 选择查看 → 显式进入会话继续；不实现多 Agent 调度器。

重命名、收藏和归档也先生成pending回执，来源确认后更新对应会话；未知结果保留旧快照并禁止重复提交。

“示例设置”中的回执、故障、来源推进、重置仅影响本地数据。语言/外观是明确本地偏好；会话、附件、敏感输出不会写入 localStorage。切语言不重挂编辑器、不改用户文本、不调用服务。

## 验收边界

验收命令、视口、截图、测量与失败记录见 [实施记录](plans/agent-workbench-implementation-log.md)。区域/整页 fixture、独立消费者安装与真实服务分别记录。M6 真实模型、文件系统、Git、PTY、浏览器、鉴权和持久化仍需独立接入与来源回执验证。

## 网页展示与本地偏好

区域实验室采用桌面三栏与移动端选择器/Sheet。场景 ID、区域、布局、模板、页面、会话、项目和面板可进入导航 URL；输入正文、附件内容和凭据不进入 URL。可选窄容器仅改变同一预览的宽度。底部提供组件映射、数据合同和验收说明。

完整示例按项目范围创建任务、筛选状态和关注队列；选择任务仅查看，进入会话是显式动作。报告来源跳转使用消息 ID；计划步骤定位具体工具。产物可用性、审阅与业务验收分别显示，仅有真实本地正文的产物允许复制/下载。所有这些操作仍是本地 fixture。

示例适配器仅保存外观、语言和面板开关/尺寸；面板设置使用 `easyuseui-workbench-panels`。读取时白名单校验并限制尺寸，存储失败仍可继续操作。“清除本地偏好”保留未发送草稿；刷新重置业务数据。上下文重试有独立回执，来源替换后的旧确认不能覆盖新引用。

本轮 S0–S6 记录见 [展示实施记录](plans/agent-workbench-showcase-log.md)，文章与截图入口为 `/blog/agent-workbench-showcase/`。前一轮组件建设记录与截图保留原版本；真实服务按 M6 单独验收。
