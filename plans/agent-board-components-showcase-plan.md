# Agent 看板组件与示例展示计划

日期：2026-10-08
状态：AG0–AG4 与 P2 展示扩展、可复现测量均已完成并归档；真实服务接入由消费项目提供；实施与证据见 [实施记录](./agent-board-implementation-log.md)。

建设以运行看板为入口的 Agent 工作台，让用户快速判断谁在执行什么、哪里需要介入、产生了哪些结果，以及结果是否经过审阅。先补齐可复用展示组件，再通过同一组示例数据展示 Board、List、Inbox 和 Insights。

承接 [通用组件补齐计划](./common-components-completion-plan.md)、[Work Items 组件计划](./work-items-components-plan.md)、[Work Items 示例页面计划](./work-items-showcase-plan.md) 与 [优化和 Blog 计划](./optimization-and-blog-plan.md)。Agent 看板与 Work Items、Sessions 保持独立入口，通过明确的对象引用相互导航。

## 1. 公开案例与展示元素

以下链接是本次检索的第一方资料。参考其信息结构与交互目标，用 EasyuseUI 自身组件实现；不照搬品牌视觉、后端模型或执行框架。

| 参考 | 可观察的展示元素 | 本项目的设计取舍 |
| --- | --- | --- |
| [Vibe Kanban 官网](https://www.vibekanban.com/) | 任务看板、Agent 会话、代码差异审阅、浏览器检查、子任务拆分 | 看板呈现执行概况，详情连接会话与产物；业务任务状态仍由任务系统提供 |
| [LangChain Agent Inbox](https://github.com/langchain-ai/agent-inbox) | 待处理请求、动作和参数、按配置开放 accept/edit/respond/ignore 等响应 | 增加关注队列与请求详情；每类操作由调用方能力决定，不能把所有 waiting 都当成审批 |
| [Langfuse Trace 最佳实践](https://langfuse.com/docs/observability/best-practices) | 执行树、输入输出、父子观测、模型及用量、Session 关联 | 详情中展示可观测执行步骤；运行与会话分层，用量统计移入 Insights |
| [Microsoft Research Magentic-UI](https://www.microsoft.com/en-us/research/blog/magentic-ui-an-experimental-human-centered-web-agent/) | 协作计划、执行进度、浏览器工作区、人工接管与动作审批 | 展示阶段计划、介入原因和明确操作入口；浏览器控制能力仅在真实适配器支持时开放 |

Vibe Kanban 官网在本次访问时已公告转向社区维护；这里只取设计参考，不把其运行环境设为项目依赖。Magentic-UI 采用上述研究文章中的交互模式，不据此承诺当前发行版能力。研究资料中的效果不作为 EasyuseUI 的验证结果。

## 2. 对象与状态边界

看板默认一个条目代表一次 `runId`，同时展示关联 Agent、Session 和任务。同一 Agent 的并行运行分别显示；重试使用新的运行 ID 并关联前一次尝试，不能覆盖旧记录。Agent 目录继续使用 AgentRow，不把 Agent 身份当作运行实例。

| 对象 | 展示内容 | 权威来源 |
| --- | --- | --- |
| Agent | 名称、图标、引擎/模型、在线信息、活动会话数 | 调用方 Agent 快照 |
| Session | 会话标题、上下文、关联运行和消息 | 调用方 Session 快照 |
| Run | 当前状态、阶段、时间、关联任务与尝试 | 调用方执行记录 |
| WorkItem | 任务标题、业务状态、负责人、验收状态 | 调用方任务记录 |
| Attention / Approval | 等待原因、请求内容、可用响应、期限 | 调用方请求记录与权限能力 |
| Artifact / Review | 文件、报告、截图、PR 链接、审阅和验收证据 | 调用方产物和审阅记录 |

关系必须来自明确 ID 或调用方确认，不按标题、目录、时间接近推断关联。不创建第二套调度、任务持久化或审批系统。

运行状态复用 [runtime-status.ts](../lib/runtime-status.ts) 的十种值。看板分列是派生展示，不增加公共运行枚举：

| 展示组 | 映射 | 展示约束 |
| --- | --- | --- |
| 排队 | queued | 保留排队时间；位置未知时不编造序号 |
| 执行中 | starting / running / thinking | 使用原始状态徽标；阶段来自调用方 |
| 等待与暂停 | waiting / paused | 展示等待输入、审批、依赖或暂停原因；原因未知则明确未知 |
| 已结束 | completed / failed / cancelled | 保留各自徽标与结果，不统一涂成成功 |
| 待命与其他 | idle / 未识别状态 | 通常 idle 只出现在 Agent 目录；若运行快照带入则保留，不丢弃异常数据 |

另外独立保留：数据态、连接态、审批态、业务验收态、PR 状态和操作结果 `unknown`。运行 completed 仅表示本轮执行完成，不等于任务验收、PR 创建或合并。未知写入结果始终有显著待确认提示，并进入关注队列。

运行看板默认只读分列，不开放拖动改变运行状态。任务拖动属于 Work Items 的业务操作；不能通过把卡片拖入“已结束”触发执行完成或批准请求。

## 3. 现有组件与待补齐组件

已核对源码中的 AgentRow、SessionRow、RuntimeStatusBadge、ToolCall、ActivityTimeline、Inspector、WorkspaceShell、Tree、DataRegion、DataTable、FilterToolbar、MetricSummary 和 Conversation。W02 的通用 Board 已在 `components/blocks/item-board.tsx` 正式导出；AgentRunBoard 复用该容器，独立安装已验证。

以下新增名称均为拟定契约，实施时先固定 API，再补齐文档、示例与 Registry。

| 编号 | 组件或组合 | 复用基础与职责 | 优先级 |
| --- | --- | --- | --- |
| A01 | AgentRunProperties | 共享身份、模型、时间、关联任务和状态信息；供 Row/Card 复用 | P0 |
| A02 | AgentRunRow / AgentRunCard | Row 使用 Item 模式；Card 表示独立运行，具有主入口与兄弟操作目标 | P0 |
| A03 | RunStageSummary | 阶段名称、可选步骤计数、耗时和等待原因；不提供虚构百分比 | P0 |
| A04 | AgentRunList / AgentRunBoard | 同一运行集合的两种布局；Board 依赖 W02，List 使用分组行 | P0 |
| A05 | AttentionQueue / AttentionItem | 审批、输入请求、失败、未知结果、断连关注项；按 attentionId 去重 | P0 |
| A06 | AgentRunInspector | 组合 Inspector、AgentRow、SessionRow、阶段摘要和详情分区 | P0 |
| A07 | ApprovalRequestPanel | 工具审批组合现有 ToolCall；仅补充请求标题、期限和权限提示 | P0 |
| A08 | ExecutionTraceTree | 基于 Tree 展示可观测父子步骤，选中后显示 ToolCall 或步骤摘要 | P1 |
| A09 | ArtifactList / ReviewSummary | 文件与外链条目、生成时间、来源运行、审阅和验收状态 | P0 基础；P1 扩展 |
| A10 | AgentUsageSummary | 组合 MetricSummary/DataTable；展示 Tokens、费用、耗时和统计覆盖范围 | P1 |
| A11 | AgentRelationshipList | 父运行、子 Agent 与交接关系；列表优先，无明确关系不连线 | P1 |
| A12 | AgentBoardToolbar / AgentBoardWorkspace | 组合筛选、视图切换、Shell、关注摘要、运行集合和详情 | P0 |

P0 的 A09 只包含类型、名称、来源、链接和审阅状态；代码差异编辑器、文件系统浏览、浏览器远程控制不纳入首版。非工具类审批先提供只读内容和能力受控响应；只有出现真实复用需求才提取通用审批基础组件，避免复制 ToolCall 的提交与未知结果处理。

P2 已补齐依赖图、历史趋势和大集合虚拟列表，交付与验收见第9节。依赖图复用只读 Canvas 展示，不引入工作流编辑、调度或 Canvas 专属运行模型。

## 4. 展示与交互契约

### 4.1 运行卡片和列表行

- 卡片从上到下：任务/运行标题 → Agent 与模型 → RuntimeStatusBadge、阶段和耗时 → 等待或错误摘要 → 产物/工具数量及更新时间。默认不把完整日志、费用图表或审批表单塞入卡片。
- 未关联任务显示运行标题；未知模型、数量、耗时使用“—”或具体缺失说明，不能补成0。无回调的计数只有文本，不伪装按钮。
- Board 建议列宽320px、卡片内边距12px、间距8px，延续 Work Items 容器；List 采用紧凑行和细分隔线。卡片用于运行对象，Agent 目录、事件与日志使用列表。
- 工具栏 Button/Input 默认32px，粗指针图标目标至少44px。标题20px，颜色和细边框取共享主题变量，状态同时有文字，不依赖颜色。
- 主入口、菜单和其他操作保持兄弟目标，不能嵌套按钮。选中、键盘焦点和查看中的状态分别可辨认；跳转会话/任务使用调用方提供的链接。

### 4.2 进度与实时更新

- 有完整阶段清单时显示“已完成 3/5 步”；无稳定分母时只显示阶段和活动指示，不做时间驱动的假进度。重新规划后标明计划版本变化。
- 耗时来自 startedAt/endedAt 或服务提供的持续时间，区分排队、运行和等待。前端计时仅为显示插值，终态以来源时间为准。
- 展示可观测事件、工具调用及调用方提供的阶段摘要，不生成或宣称展示模型内部思维过程。
- 新快照更新卡片，不重置筛选、详情或焦点。事件按 eventId 去重，使用调用方序列/版本拒绝陈旧更新；历史回填时间不能替代原始事件时间。
- 数据区覆盖 loading / empty / partial / error / success。刷新失败保留已有快照；断连展示最后更新时间，与运行失败区分。局部缺失不能变成全屏空白。

### 4.3 人工介入与详情

- 关注摘要显示请求数量及类型，同一运行可有多个不同请求；“关注项数”和“涉及运行数”明确区分。无可处理权限时仍可展示允许阅读的原因。
- 审批详情展示目标、脱敏参数、影响范围、请求版本和允许的动作。允许编辑、接受、回复或忽略由调用方决定；忽略不自动等于取消执行。
- 提交期间防止重复操作；明确拒绝后保留错误，结果未知后保留待确认并请求 reconcile。关闭面板不能抹去请求状态，也不能自动重试写入。
- Inspector 接收按 runId 定位的完整受控快照。切换运行后拒绝迟到响应；刷新同一运行还需比较 revision/request generation。对象被删除时显示可恢复状态。
- ActivityTimeline/Conversation 只在距底部64px内跟随新内容，其他情况下提示新增条目；长参数与输出有预览上限，渲染、复制、下载都先脱敏。
- 页面“暂停示例播放”与真实“暂停运行”明确区分；取消、重试、审批和接管只有传入相应能力时开放，不从展示状态推导权限。

### 4.4 产物与统计

- ArtifactList 显示产物类型、名称、来源运行、生成时间与可用入口。链接失效或产物被移除显示对应状态；不从一个文件链接推断交付已通过验收。
- ReviewSummary 分开呈现未审阅、待修改、已通过与未知；PR 创建、合并、关闭另行表达，业务验收由独立证据决定。
- Insights 展示统计时间范围、过滤口径、覆盖运行数、原始/估算标记。Tokens 与费用缺失不计为0，混合币种不直接相加。
- 用量记录按稳定来源 ID 去重；父运行包含子运行用量时不能重复累加。无法确认包含关系时分组展示并注明统计不完整。
- 趋势必须基于有时间戳的历史点；样例数据明确标识，不把随机曲线作为真实性能效果。

## 5. 示例页面与组件目录

建议入口为 `/workspace/agents/`，页面由 AgentBoardWorkspace 装配，保持工作区紧凑风格。示例场景控件默认折叠，集中放置“切换场景、推进事件、恢复初始数据”，不混入产品操作。

| 区域 | 内容与交互 | 展示目标 |
| --- | --- | --- |
| 顶部 | 页面标题、来源连接状态、简短关注计数 | 首屏快速定位运行和阻塞 |
| 工具栏 | Board/List/Inbox/Insights，搜索，Agent/模型/状态/任务筛选 | 多视图共享受控筛选；视图专属字段单独保存 |
| Board | 排队、执行中、等待与暂停、已结束、按需显示其他列 | 同时观察多个运行；点击打开详情 |
| List | 与 Board 相同运行集合，显示可比较的属性列 | 紧凑浏览和状态扫描 |
| Inbox | 按请求类型呈现关注项，显示涉及的运行与操作入口 | 定位需要人工处理的事项 |
| 右侧详情 | 概览、执行、产物；概览内含请求与审阅摘要 | 主视图保持上下文，详情承载复杂信息 |
| Insights | 用量、费用、耗时、状态分布、覆盖率说明 | 统计与日常运行操作分离 |

页面级适配器管理 URL 查询参数：view、run、q 及序列化筛选；公共组件不依赖 Next 路由或 localStorage。前进/后退恢复视图和选中对象，非法参数回落到默认值，过滤后选中项不可见时给予说明而不偷偷切换对象。

桌面采用主区加 Inspector；窄屏保留布局切换，Board 横向滚动限制在画布区域，详情使用现有 Sheet；390px下应可切换到 List 并完成同一操作。关闭详情归还焦点，Escape 与已有弹层行为一致。

组件目录为每个公开新增组件提供最小受控示例、组合示例、状态变体及 API 说明。新增组件在 `lib/component-manifest.ts` 登记，沿用项目生成的 Catalog/Registry 管线；不只添加页面内私有组件后宣称组件库已补齐。

## 6. 模型与文件落点

以下为计划中的文件，不代表现有导出：

| 落点 | 内容 |
| --- | --- |
| `lib/agent-board-model.ts` | AgentRunSnapshot、AttentionRecord、ArtifactRecord、ReviewSnapshot、UsageObservation、ViewState 与能力类型 |
| `lib/agent-board-view.ts` | 纯展示分组/筛选、统计覆盖和状态映射；远程分页时接受调用方汇总 |
| `components/blocks/agent-run-*.tsx` | 属性、行、卡片、集合及 Inspector |
| `components/blocks/attention-queue.tsx` 等 | 关注队列、审批组合、执行树、产物和统计组件 |
| `components/blocks/agent-board-workspace.tsx` | 工作台组合，不拥有服务、路由或持久化 |
| `components/examples/agent-board/` | fixtures、内存适配器、模拟事件、页面及组件示例 |
| `app/workspace/agents/page.tsx` | 页面入口；按已安装 Next 文档和现有静态导出约束实施 |
| `tests/agent-board.spec.ts` | 核心浏览器行为与状态恢复场景 |
| `content/blog/agent-board-showcase.ts` | 沿用现有 Blog 模型记录方案、截图及验证证据 |
| `plans/agent-board-implementation-log.md` | 实施状态、验证命令、结果、遗留问题及证据位置 |

AgentRunSnapshot 最少包含 runId、agentId、sessionId（可缺）、workItemRef（可缺）、attempt/parentRunId（可缺）、runtimeStatus、stage、时间、revision、来源和数据完整度。状态原因、连接快照、请求结果与业务审阅分字段建模，不堆入 status 字符串。

组件接收 records、viewState、selectedRunId、capabilities 及 onViewChange/onOpen/onAction 等受控接口。操作意图携带目标 ID 和版本；回执区分 confirmed/rejected/unknown。请求状态由适配器保留，真实授权、重试策略、查询、调度和持久化归调用方。Canvas 的运行快照通过适配层映射，公共 Agent 模型不绑定 Canvas 文档。

## 7. 阶段与依赖

| 阶段 | 工作与交付 | 前置依赖 | 完成标准 |
| --- | --- | --- | --- |
| AG0 契约 | 固定展示字段、对象关系、分列规则、场景数据与来源说明 | 本计划；复核当前导出 | 状态和身份不混淆；所有拟定 API 可追踪到职责 |
| AG1 基础展示 | A01–A03、A06、A09基础，独立组件示例 | AG0；现有 Item/Inspector | 行/卡片/详情共享快照；完整覆盖数据态和异常值 |
| AG2 看板首版 | A04、A05、A07、A12，Board/List/Inbox | AG1；Work Items W02 Board | 首屏、筛选、请求处理、详情和窄屏流程通过 |
| AG3 深入展示 | A08、A10、A11、A09扩展、Insights | AG2；明确关系和用量数据 | Trace 可追踪，用量无重复累加，产物审阅可区分 |
| AG4 文档与证据 | Manifest/Registry、安装验证、Blog 和实施记录 | 各组件阶段完成后持续补齐 | 文档、独立安装和浏览器证据与实现一致 |

W02 的正式通用 Board 已完成；AgentRunBoard 复用其安装项，不复制临时容器。P0 验收要求 AG0–AG2 及相应 AG4 证据；完整展示计划另需 AG3。P2 作为独立扩展交付，验收口径见第9节。

## 8. 示例场景与验收

| 场景 | 必须观察到的行为 |
| --- | --- |
| 多 Agent 并行运行 | 同一 Agent 多次运行不互相覆盖，切换布局保持相同数据和选中对象 |
| 十种状态与未知值 | 原始状态可读，idle 和未知值不被错误计入成功 |
| 运行完成但未验收 | 已结束列仍显示未审阅；PR 已创建、已合并与验收分别呈现 |
| 等待输入和等待审批 | Inbox 分类正确，只有允许的响应入口，无权限提供原因 |
| 审批成功、拒绝、过期、结果未知 | 防重复提交；迟到回执不作用于新请求；未知结果先核对 |
| 断连和刷新失败 | 保留已有运行与产物，显示最后更新时间，可重试读取 |
| 切换运行和乱序更新 | 旧请求不覆盖新详情；同一事件不重复追加 |
| 父子运行及用量缺失 | 明确关联可导航；包含性未知不汇总，缺失不是0 |
| 长标题、大输出和失效产物 | 列表不撑破布局，完整内容可访问，脱敏与预览边界生效 |
| 分页、过滤为空、部分失败 | 区分无数据和无匹配；显示 loadedCount/totalCount口径，不伪造总数 |
| 键盘、触屏、主题和语言 | Tab/Enter/Escape可操作，390/768/1440px可用，中英切换保留选择和草稿 |
| 减少动画与用户阅读历史 | 不依赖动画传达状态；翻阅旧记录时不抢滚动位置 |

实施验证使用项目现有 lint、typecheck、Webpack build；行为变更运行浏览器测试，新增可分发组件执行 test:install，并运行相应 Manifest、国际化和 Blog 检查。具体脚本以实施时 package.json 为准。启动/构建前检查服务和产物占用，保留共享工作树修改。

Blog 展示“参考元素 → 组件映射 → Board/List/Inbox/详情实图 → 状态恢复 → 验收证据”。截图记录主题、语言、尺寸、场景与源码快照；证据标明通过、部分完成或待验证。可量化比较关注项是否首屏可见、定位详情所需步骤、固定尺寸下可见条目数；数值在实际测量后填写，不预先承诺性能提升比例。

示例中的状态推进、审批和用量均为本地模拟数据。组件交互验证、独立安装验证与真实 Agent 服务接入分别记录；本计划不以示例页面通过替代真实执行、权限、持久化或业务验收。


## 9. 本轮继续：P2 与展示测量

用户要求继续完成剩余任务后，将原先单列的 P2 展示扩展落实为以下范围。真实执行、权限、传输与持久化仍由消费项目负责；不创建第二套 Agent 服务。

| 编号 | 交付 | 验收 |
| --- | --- | --- |
| P2-D | AgentDependencyGraph；明确来源依赖模型；按需加载的只读 Canvas 与可访问列表 | 版本仲裁、缺失/范围外端点、循环提示、运行完成不推断依赖满足、加载失败恢复 |
| P2-H | AgentUsageHistory；来源区间观测模型；Insights 组合 | 时间及区间可追踪，币种/运行分开，缺失/不连续区间留断点，真实0、语言切换与表格替代 |
| P2-V | AgentRunVirtualList；大集合工作台适配 | 可变行高、完整已加载口径、键盘焦点导航、Sheet恢复、筛选移除入口后的回退、移动端 |
| P2-M | 普通/虚拟模式同源测量、截图、Blog及独立安装 | 固定1,000条来源行与视口，记录挂载行数和固定详情流程；不推断未测的速度、内存或服务效果 |

实施记录和证据单独归档，保留首版截图/验证记录，不覆盖旧快照。新组件在 Catalog 与 Registry 登记，并为独立消费项目补充三个扩展的生产构建及浏览器验收。
