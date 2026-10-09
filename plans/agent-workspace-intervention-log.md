# Agent Workspace · DL3 人工介入模块实施记录

## 范围与并行边界

2026-10-10，本轮 fixture 与验证完成。来源：[完整设计计划](agent-workspace-plan.md) PG02、MD12–MD14、A2-07/A2-08、V03–V06/V09/V11；[设计原则](../Design-rules.md)、[组件契约](../Component-Specification.md)、[状态契约](../UI-STATES.md)、[工作台契约](../AGENT-WORKBENCH.md)。

起始主目录已有另一进程负责 AW0–AW5 / Pi 接入、公共对话展示和真实 provider 回归；期间已交付 `7004e4d`。本轮以该提交的公共 API 为基线，保留全部并行工作，不接管 Pi 服务/Provider、共享消息资源、Registry 或首轮记录。只交付 DL3 中 MD13/MD14 的独立 fixture 及 MD12 稳定输入回归；不将完整 DL3 标记完成，不复写 Pi 验收结论。

## 页面声明 PG02-I

- 入口：`/examples/agent-workbench/regions/intervention/`；从 PG02 区域实验室提供普通链接，返回原实验室。
- 用户目标：阅读旧消息时发现审批 → 定位同一记录 → 显式提交 → 区分 pending/unknown/confirmed；运行中输入 → Queue/Steer 切换 → 管理队列 → 显式来源确认。
- 信息归属：上方页面说明和本地来源控制，中间有界 Conversation；底部 AttentionStrip、QueuePreview、AgentComposer。不展示真实项目/连接健康或执行服务；模型选择明确标为 `Fixture model (no provider)`，不冒充可用 provider。
- 本页是 **明确标注的内存 fixture**，不是 Pi、工具执行、调度或持久化接入。刷新重置；不读取用户聊天，不发网络写请求。
- 默认：来源控制展开；审批记录保留在历史中，提醒条常驻 BottomDock；队列默认仅两条，第三条按需展开；Composer 配置折叠。所有确认由独立来源控制显式推进，无计时器。
- 尺寸：文档容器最大1040px（含16px横向padding），预览高860px；640px以下高1040px，属于独立文档fixture的有界预览，不修改全窗工具页默认。聊天内容760px，Header基准64px，历史独立滚动，底部输入不随历史滑走。队列最大240px、独立滚动；按钮32px，粗指针44px；390px单列。短视口允许文档外层滚动，输入和动作可达，无页面横向溢出。
- 保留：模式、语言、主题和队列展开不重挂输入、不清草稿；补充草稿版本不会被旧确认清除；Review只滚动/聚焦，不审批；unknown跨模块显隐保持锁。
- 状态来源：本地 reducer提供受控快照、稳定ID/revision/requestId；审批与队列请求分轴；来源取出与取消竞争通过revision拒绝过期写入。
- 验收：审批在视口外时提醒可见，Review定位原ID；pending不消提醒，unknown先查询；来源确认后审计仍可读。Queue/Steer保持输入DOM/文本；默认两条、展开第三；编辑/取消/排序等待确认，迟到确认和取出竞争不误改；IME/窄屏/双语/双主题/reduced-motion。

## 模块声明

### MD13-I QueuePreview（PG02-I；复用 MD13 的 fixture 变体）

- 责任：展示受控 `queuedPromptId/revision/draftVersion/text` 与操作回执，发出添加/编辑/取消/上下移动请求；不会自行调度消息。
- 复用：Button、Textarea、Field；Composer复用AgentComposer。私有组合留在 `components/examples/agent-workspace/`，未注册为公共导出。
- 视觉：平铺有序列表，无嵌套Card；13/20正文、12/16元数据，8px行间距/12px容器padding，1px主题分隔；主内容与编辑/取消/排序为兄弟目标。默认最多两行，长正文两行有界摘要，编辑器显示完整草稿。
- 状态：队列数据loading/empty/partial/error/success用DataRegion；pending和unknown禁写且保留内容，failed可重新提出已确认未执行的请求。编辑草稿绑定基础revision，取出/更新后保留草稿并说明冲突；来源回执不能覆盖新版草稿。
- 交互：展开按钮有aria-expanded/controls；图标按钮有名称及tooltip；键盘排序替代拖拽；触摸44px，reduced-motion不位移；切语言仅翻译内置文案，用户正文/协议ID保持原文。
- 权威：fixture reducer；source按钮显式确认/拒绝/丢回执/取出，unknown查询只读且不会重新提交。无真实调度证据。

### MD14-I AttentionStrip + ApprovalRecord（PG02-I；复用 MD14 的 fixture 变体）

- 责任：同一个attentionId在历史ApprovalRequestPanel与Composer上方提醒条联动；Review通过ConversationActions定位消息并聚焦。
- 复用：ApprovalRequestPanel、ToolCall、Conversation、RuntimeStatusBadge、Button。不复制授权工具markup。
- 视觉：提醒条浅警示语义底/1px边/R6/8×12px padding，13px摘要；历史审批容器保持既有合同；Agent正文开放排版，用户消息采用workspace展示的浅蓝右气泡。动作不遮盖正文。
- 状态：ready/pending/unknown保留提醒；confirmed才消失，原记录保留动作/范围/风险/回执审计。unknown禁止接受/拒绝，只能查询；查询本身不消锁。授权确认不等于工具已经执行或运行已完成。
- 交互：Review只定位，不执行/批准；批准/查询动作消失时焦点留在稳定审批记录，不抢阅读位置；键盘focus与选择独立。触摸44px、减弱动效无强制平滑滚动；双语变化不改动作、ID或草稿。
- 权威：调用方持有revision与operationId；本例显式fixture来源更新，公共组件回调resolve不代表审批完成。

## 执行清单

- [x] 页面与模块声明、并行边界固定。
- [x] 实现受控人工介入预览及区域入口。
- [x] 验证队列版本保护、审批unknown锁与定位。
- [x] 已挂载浏览器：桌面/390px/短视口/双语双主题/IME/键盘/触摸。
- [x] lint、typecheck、Webpack build；本轮私有示例不修改公共分发闭包。
- Git交付：仅纳入本轮页面、私有模块、区域入口、两份计划记录和两份测试；作者/提交者已核对为 `Crsei <256245632+Crsei@users.noreply.github.com>`。普通推送与远端SHA以最终交付回报为准，失败时不宣称交付完成。

## 实际验证

- 受控模型8/8：草稿版本、重复/旧requestId、unknown先查询、编辑新版本保留、取消与取出竞争、排序同时校验相邻目标、Steer与队列分离、审批/队列锁独立。
- 生产浏览器9/9，与模型共17/17（19秒）：区域入口、Review定位不审批、键盘审批后的焦点、pending/unknown/审计、Queue/Steer与语言切换不重挂输入、IME、队列编辑/排序/取消、数据五态与旧内容、390×560触摸/English/dark/reduced-motion、720×450的200%等效CSS布局和4000字符长队列、桌面几何及Axe WCAG2A/AA。
- 旧区域实验室回归8/8：1440/1280/1024/768/390五个宽度、引用定位、计划/产物链接，以及English/dark/zoom/coarse场景。未宣称本轮重跑全部工作台或Pi provider测试。
- `pnpm lint`、`pnpm typecheck`、Webpack `pnpm build`：通过。构建从`7004e4d`导出到独立目录，再叠加明确任务文件，使用锁定依赖；独立`.next/out`未覆盖3010开发实例。GLIBC2.28按现有Next WASM SWC回退构建，无框架配置变更。
- 正式浏览器使用候选静态导出及独占3011预览；测试进程结束释放预览。不启动Pi、不读用户会话或凭据、不发POST写请求。截图与日志在未提交的`.local/intervention-evidence/`，截图已人工检查实际挂载模块。
- 首次16项运行12通过、4失败：测试误用“对话历史”名称，及包裹原生select的label全文与精确getByLabel不一致。按实际可访问名称改用combobox角色定位，不削弱产品断言；16项复测通过，再增加审批键盘焦点和长文本/200%用例，最终17项全绿。
- 本轮只增加私有示例/适配模型/CSS，未修改可分发源码或Registry依赖，`pnpm test:install`不适用。复用的公共对话与输入扩展由Pi首轮独立分发验证，本轮不冒领该证据。

完整DL3/DL4、Pi审批/Queue/Steer、真实执行/持久化仍未交付；真实手机软键盘和人工屏幕阅读器未验证。本轮UI证据不得提升为真实服务验证。
