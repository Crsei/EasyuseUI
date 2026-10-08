# Agent 运行组件

入口：`/workspace/agents/`。组件默认中文，使用可移植 I18nProvider 支持英文；调用方标题、草稿、错误与协议值保持原文。示例明确为本地模拟，不提供 Agent 服务、调度、权限、存储或业务验收证据。

## 受控 API

| 安装项 / 导出                                                                | 输入与回调                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent-board-model`                                                          | AgentRunSnapshot、AttentionRecord、ArtifactRecord、ReviewSnapshot、TraceStep、UsageObservation、AgentBoardViewState、AttentionIntent、ActionReceipt；纯展示 filterAgentRuns / runGroup / summarizeUsage / mergeRunSnapshots                                                            |
| `item-board`：Board / BoardColumn / BoardItem（W02） | 复用 Work Items 通用容器；groups 使用 key/itemIds/loadedCount/queryKey，items 与 renderItem 受控。Agent 组合不传 onMove/canMove，运行状态不可拖动改变。底层容器的移动与分页能力由调用方负责。 |
| `agent-run-properties`：AgentRunProperties                                   | `run`；共享身份、模型、来源状态、attempt 与耗时；缺失为 —。                                                                                                                                                                                                                            |
| `run-stage-summary`：RunStageSummary                                         | `stage`、`status`；仅在步骤数及分母有效时显示完成计数，未知等待原因明确提示。                                                                                                                                                                                                          |
| `agent-run-row` / `agent-run-card`                                           | `run`、`selected`、`onOpen(runId)`、`actions`；主入口与操作插槽为兄弟目标，调用方不能在主内容内嵌入交互控件。                                                                                                                                                                          |
| `agent-run-list` / `agent-run-board`                                         | `records`、`selectedRunId`、`onOpen`；运行分列只读；idle/未知值保留在 other 组。                                                                                                                                                                                                       |
| `attention-queue`：AttentionQueue / AttentionItem                            | `records`、`kind`、`onOpen`；按 attentionId + revision 保留最新快照，请求数与运行数分别计数。                                                                                                                                                                                          |
| `approval-request-panel`：ApprovalRequestPanel                               | `request`、`draft`、`onDraftChange`、`onAction`、`canReconcile`；权限取 allowedActions，过期/禁用/pending/confirmed/unknown 不开放写入。工具请求组合 ToolCall；非工具请求有界脱敏预览。                                                                                                |
| `artifact-list`：ArtifactList / ReviewSummary（亦可单独安装 review-summary） | `records` / `review`；业务验收与运行状态、PR 状态分开；链接只允许站内路径和 HTTP(S)，移除/不可用不生成入口。                                                                                                                                                                           |
| `execution-trace-tree`：ExecutionTraceTree                                   | `steps`、`selectedStepId`、`onSelect`、`expandedIds`、`onExpandedChange`；父子 ID 真实关联，错误或循环关系作为根保留，工具预览复用 ToolCall。                                                                                                                                          |
| `agent-relationship-list`：AgentRelationshipList                             | `records`、`runId`、`onOpen`；只根据明确来源 ID 导航。                                                                                                                                                                                                                                 |
| `agent-usage-summary`：AgentUsageSummary                                     | `runs`、`observations`、`scopeLabel`；稳定来源 ID 去重，已明确包含的子用量不重复计入；包含关系未知单列，费用按币种，缺失不补零。                                                                                                                                                       |
| `agent-board-toolbar`：AgentBoardToolbar                                     | `records`、`viewState`、`onViewChange`；共享搜索/Agent/模型/状态/任务筛选，Inbox 类别独立保留。                                                                                                                                                                                        |
| `agent-run-inspector`：AgentRunInspector                                     | `snapshot` 完整对象、`drafts`、`onDraftChange`、`onAction`、`canReconcile`、`onOpen`；概览/执行/产物，不发起数据请求。                                                                                                                                                                 |
| `agent-board-workspace`：AgentBoardWorkspace                                 | `records`、`attention`、`usage`、`viewState`、`selectedRunId`、`detail`、`connection`、`onViewChange`、`onOpen`、`data`、`totalCount`、`loadedCount`、`inspector`、`scopeLabel`；可选 sidebar / exampleControls / headerActions / fill。桌面 Inspector，窄屏 Sheet，关闭恢复入口焦点。 |

每个安装项的独立示例在 `/docs/<安装项>/`，数据态控件提供 loading/empty/partial/error/success，运行控件提供十种状态和未知值；工作台示例提供完整组合。

## 请求与来源责任

调用方保存请求操作状态，意图至少携带 attentionId、runId、baseRevision 与 operationId；回执显式区分 confirmed / rejected / unknown。onAction Promise 完成不等于运行完成。关闭详情或切换布局不能重置未知结果；先 reconcile，再由来源更新请求快照。真实服务必须在服务端验证权限、期限和版本。

示例适配器在提交前加请求锁，以 generation、request revision 和 operationId 丢弃迟到回执。重置示例增加 generation；切换运行不改变请求状态或草稿。运行快照只接收更高 revision，事件按 eventId 去重。公共组件由调用方提供已仲裁的完整快照。

公共组件不依赖 Next 路由、localStorage 或网络。页面适配器负责 view/run/q/agent/model/status/task/kind 查询参数；非法视图/类别回落，浏览器前进后退恢复视图与选择。当前过滤隐藏选中运行时保留详情并提示。页面仅手动推进确定性事件，不包含自动播放、真实暂停、取消或重试能力。

用量统计覆盖当前筛选中已加载的观测，远程全量统计由调用方预汇总提供。父子包含关系无法确定时不能假定互斥；不生成随机趋势。P2 扩展见下文；真实数据仍由调用方提供。

## P2 展示扩展

| 安装项 / 导出 | 输入与行为 |
| --- | --- |
| `agent-dependency-graph`：AgentDependencyGraph | `records`、来源明确的 `dependencies`、可选 `scopeRunIds`、`selectedRunId/onOpen`、`maxNodes/data`。依赖包含稳定 ID、revision、prerequisiteRunId、dependentRunId 和独立 blocked/satisfied/unknown。最高 revision 仲裁，不从运行 completed 推断 satisfied。 |
| `agent-usage-history`：AgentUsageHistory | `points`、`scopeLabel`、可选 `scopeRunIds`、受控 `metric/onMetricChange`、`data`。无受控 metric 时仅在组件内保存展示指标。来源 pointId/revision、runId、intervalStart/timestamp、metric/value/currency/estimated；每点是区间观测，不是累计计数。 |
| `agent-run-virtual-list`：AgentRunVirtualList | `records`、`selectedRunId/onOpen`、`height`（240–900，默认560）、`overscan`（1–30，默认3）、`data`。复用 AgentRunRow，按实际行高定位；仅挂载可见范围和焦点行。 |

AgentBoardWorkspace 可选接收 `dependencies`、`history` 和 `listVirtualization`。提供 dependencies 才显示第五个“依赖关系”视图；无该能力的消费项目仍为四视图。历史观测放在 Insights，用当前筛选的 runId 限定范围。List 默认达到200条已加载运行时启用虚拟列表，可用 `enabled:false` 选择完整 DOM；`threshold/height` 由调用方设置。完整 DOM 和虚拟列表继续使用相同行、分组和查看回调。

依赖图只复用 WorkflowCanvas 的只读渲染、平移缩放和选择。它不接收或创建 CanvasExecutionSnapshot，不开放 CanvasCommand、编辑、调度或持久化。默认最多绘制200个来源节点（最多500），范围外和缺失端点保留在可访问来源列表；循环及受其影响的链只给出提示，不编造执行顺序。运行状态与依赖满足状态保持独立。画布按需加载；加载失败保留工作台和筛选，可安全重读。

历史图按运行和币种分开，不相加不同币种，也不对过滤范围外的运行分摊合计。缺失、负值、非法时间及无币种费用不绘制为有效观测；真实0保留。未知、重叠或不连续区间打断折线，不补采样或用前端时钟制造趋势。图表提供同源明细表，时间按 UTC 标注。调用方负责观测口径、完整度、版本和读取错误。

虚拟列表说明已加载数量，ARIA位置使用完整已加载集合；不宣称服务已分页或全部加载。方向键、Page Up/Down、Home/End只移动焦点，Enter才查看。焦点行在离屏时保持挂载；详情关闭返回原入口，入口已被筛选移除时返回仍连接的工作台主区。长内容、容器宽度及语言变化通过 ResizeObserver重新测量，保留阅读锚点。

大集合入口：`/workspace/agents/scale/`，含1,000条确定性来源运行。折叠的示例控件切换普通/虚拟渲染，URL保存 mode、view、run及筛选，浏览器历史可恢复。测量脚本 `node scripts/capture-agent-board-p2.mjs` 比较同一数据、分组、行组件和固定视口下的挂载行数及固定打开详情流程，不表示真实服务、延迟或业务验收。

历史时间必须含显式时区（Z 或 ±HH:MM）；无时区/无效时间作为未知观测呈现，不按浏览器本地时区补值。依赖图中无连线的已加载运行采用紧凑辅助排列；连线仅来自调用方依赖记录。
