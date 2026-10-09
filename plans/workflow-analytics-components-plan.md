# 工作流视图 分析图表与 Dashboard 组件建设计划

日期：2026-10-09
状态：C0–C7 已实现并完成组件、计算、浏览器及独立安装验收；真实服务接入不在本计划实施范围。验收与边界见 [实施记录](./workflow-analytics-implementation-log.md)。
配套：[工作流分析与 Dashboard 示例展示计划](./workflow-analytics-showcase-plan.md)。

围绕工作状态、进度、流程效率、资源分配和风险，建立三个职责独立、共享数据与交互契约的设计系统域：工作流视图负责查看和操作对象，统计图表负责分析，Dashboard负责组织决策信息。每个可交互统计结果都应能解释其口径，并定位对应工作项或来源记录。

实施顺序为：固定且有用的分析模板 → 可配置 Dashboard → 通用分析构建器。保留 [Work Items 计划](./work-items-components-plan.md)、[Agent 看板计划](./agent-board-components-showcase-plan.md) 与 [首页文档改版计划](./homepage-and-docs-redesign-plan.md) 的独立范围，不重新建设已经存在的视图或服务。

## 1. 现状与建设边界

| 范围 | 当前已存在的源码能力 | 本次需要补齐 |
| --- | --- | --- |
| 工作视图 | WorkItemList/Board/Table、Timeline/WorkItemTimeline、Calendar/WorkItemCalendar；work-items-model 已支持五布局与开始/截止日期 | 分析结果到五布局的受控导航、任务关系视图、资源与运行区间的适配 |
| 层级与依赖 | Work Items 子项展示，Tree、ExecutionTraceTree、AgentDependencyGraph、WorkflowCanvas | 明确区分任务层级、业务阻塞、执行父子关系及Idea关联，提供有类型的关系查询 |
| 指标与小图 | MetricSummary、Sparkline、SegmentBar；AgentUsageSummary与AgentUsageHistory | 通用图表基础、指标定义、交互下钻、完整图表数据表与导出 |
| 执行分析 | AgentRunSnapshot、UsageObservation、AgentUsageHistoryPoint；已有币种分组、包含关系与历史缺失点处理 | 共享筛选和Dashboard适配；保留现有去重与未知口径 |
| 工作项数据 | WorkItemRecord有当前业务状态、负责人、计划日期、revision；并无完整状态事件、scope历史、容量日历 | 新增独立分析输入契约，接收调用方历史与聚合快照；不能把计划日期当实际开始/完成时间 |
| 站点与分发 | Manifest、Registry、DemoLoader、DataRegion、DataTable、Inspector/Sheet、FilterToolbar、Blog | 图表与Dashboard独立安装项、按需示例及效果证据 |

以上表格保留规划时的源码基线，不重新宣称历史验收结果。规划时 package.json 未声明统计图表引擎；首版已固定 Recharts 3.10.1 与 react-is 19.3.0，并完成独立安装验证。Timeline、Calendar 和 Agent SVG历史图保持原职责。

公共组件只接收受控快照、查询描述和操作回调。调用方负责采集与存储历史、权限、查询执行、聚合权威、配置持久化和真实写入。本地示例可以重放确定性事件，但不得成为第二套生产任务/执行数据库。

## 2. 本地参考包与技术选择

参考根目录：`/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/UI-package`。下列版本来自本地package.json/HEAD，是本次源码快照，不代表线上最新发行版或已在本项目验证兼容。

| 包及快照 | 核对路径 | 借鉴内容与适配边界 |
| --- | --- | --- |
| Mantine `f7ab1ef`，charts 9.7.1 | `mantine/packages/@mantine/charts/src/index.ts`、`BarChart/BarChart.tsx`、`Heatmap/Heatmap.tsx` | 图表家族、series、轴/Tooltip/Legend/Brush、stacked/percent、默认accessibilityLayer；绑定Mantine provider，不整体引入。其Heatmap是日历型热图，成员×日期工作量矩阵另行设计 |
| Tremor `ca4d588` | `tremor/src/components/BarChart/BarChart.tsx` | Dashboard密度、数值格式化、可滚动图例、category/bar点击事件与选择高亮；本地依赖Recharts 2.x，不能直接混入3.x封装 |
| Fluent UI `8abb0781`，react-charting 5.25.12 | `fluent-ui/packages/charts/react-charting/package.json`、`src/index.ts`、`src/types/IDataPoint.ts`、`src/components/HeatMapChart/HeatMapChart.types.ts` | 图表类型、每点事件、可访问性数据与排序契约；D3及Fluent依赖较深，参考语义，不带入完整Fluent主题 |
| Chakra UI `f799e4d`，charts 3.37.0 | `chakra-ui/packages/charts/README.md`、`src/use-chart.ts`、`src/chart/chart.tsx` | typed series、formatter、图例高亮与Chart上下文；README仅简述包，行为判断来自源码；依赖Chakra/Recharts，不照搬provider |
| shadcn/ui `6ea0900`，应用依赖Recharts 3.8.0 | `shadcn-ui/apps/v4/registry/new-york-v4/ui/chart.tsx` | ChartContainer/Config、局部CSS变量、Tooltip/Legend、响应尺寸；最适合借鉴源码分发组织，但仍需适配本项目ThemeBoundary与状态规范 |
| HextaUI `daaba0c`，应用依赖Recharts ^3.10.1 | `hextaui/components/ui/chart.tsx` | 图表ID/CSS值处理、Intl数值格式、焦点样式和Tooltip定位；结合本项目键盘/触摸规范验证，不将样式封装等同完整无障碍 |

**首选验证路线：Recharts作为常规统计渲染底座，EasyuseUI拥有语义模型、主题和交互接口。** C0用当前React/TypeScript/Next静态导出验证并固定准确版本；不从不同参考包拼接不同主版本API。基线验证柱状、时间折线、散点与独立安装，记录依赖体积后再决定采用。

- 不同时安装六套UI包；参考方法后独立实现。直接复用代码时先核对对应许可并保留声明，不将package.json缺少license字段当作允许复制。
- 现有Sparkline/SegmentBar和简洁数据摘要继续轻量运行，不能因使用MetricSummary就加载统计引擎。AgentUsageHistory先加适配，若以后统一渲染再单独回归其历史空缺/币种规则。
- Heatmap采用可访问的矩阵容器与纯日期/数值映射，可选SVG；成员×日期矩阵不依赖Recharts必须支持。大规模性能不足时，凭测量再评估ECharts按需适配，不预设双引擎。
- WorkflowCanvas/已有React Flow负责图关系展示；Timeline/Calendar负责排期。visx、Frappe Gantt不是本次前置依赖。
- 图表渲染层的公共输入不暴露Recharts事件payload作为业务协议；通过适配转换为稳定seriesId/bucketId/entityRef。不要先建设一个兼容所有图表库的插件框架。

## 3. 产品参考与采用原则

- [Linear Insights](https://linear.app/docs/insights)：Measure/Slice/Segment、图表与表格联动、点选Issue；本项目采用“配置口径 → 图表 → 原始记录”路径。[Linear Dashboards](https://linear.app/docs/dashboards)提供全局与单图筛选，本项目将其交集合并规则显式化。
- [Jira Control Chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/)展示状态耗时、平均、滚动平均和标准差。借鉴解释入口，不将波动带、样本分位数和未来交付概率混为同一种统计量。
- [ClickUp Dashboards](https://clickup.com/features/dashboards)组合图表、表格、工作负载与时间数据，支持排列和尺寸调整；本项目先固定模板，再开放布局编辑。
- 用户提供的 [Asana Chart Styles](https://help.asana.com/s/article/chart-styles?language=en_US)用于图型配置、尺寸和导出方向参考；本次帮助页正文未成功读取，不将具体产品行为作为已验证依据或实现承诺。

## 4. 三个设计系统域与组件清单

“独立”指职责、数据接口与安装依赖独立，不是维护三套颜色、筛选器和实体存储。共享主题、格式化、过滤表达式、选择/下钻契约和DataRegion。

### 4.1 Views 工作流视图

| 编号 | 组件/适配 | 范围与优先级 |
| --- | --- | --- |
| V01 | WorkItemsViewAdapter | 复用五布局/子项/详情，接受分析筛选与选中项，保留原业务操作权限；P0 |
| V02 | WorkTraceabilityView | Idea → WorkItem → Session → Run → Artifact的明确关联列表与选中详情；P0；首版无需图引擎 |
| V03 | AgentExecutionTimeline | 将实际执行区间按Agent/Session排列；复用Timeline容器或抽取共用几何，但时间戳精度与日期型排期模型分开；P1 |
| V04 | ResourceAllocationView | 成员×日期/周的计划负载、容量和待安排任务，图格可下钻；P1；改排期走既有命令 |
| V05 | WorkDependencyView | 复用只读Canvas图元并提供关系表替代；任务阻塞/满足/未知与执行父子关系分开，成环显式报告；P2 |

不重新定义WorkItemRow/Card/Timeline/Calendar。树表示包含关系，依赖图表示先决条件，Sankey表示守恒流量，三者不能因外观相近互换。Idea关联默认是关系视图，不能将多对多链接数量当转化率。

### 4.2 Charts 统计分析图表

| 编号 | 组件 | 责任与优先级 |
| --- | --- | --- |
| C01 | ChartFrame / ChartHeader / ChartDataState | 图表标题、口径、单位、范围、更新时间和DataRegion；权限/覆盖率另轴表达；P0 |
| C02 | ChartLegend / ChartTooltip / ChartAxis / ChartReference | 稳定series身份、格式化、可访问图例、参考线/区间；避免页面重复封装；P0 |
| C03 | BarChart / LineChart / AreaChart / DonutChart / ScatterChart | 常规图形及堆叠变体，接收标准系列与选择事件；P0 |
| C04 | Heatmap / HeatmapLegend | 成员×时间或状态×时间矩阵、未知/零/超载颜色语义；P1 |
| C05 | ChartDataTable / ChartDrilldownPanel | 聚合点表与来源记录表分开；复用DataTable/Inspector/Sheet；P0 |
| C06 | WorkflowMetric | 组合MetricSummary，增加口径、比较基期、数据质量和明确的下钻按钮；P0 |
| C07 | StatusDistribution / CompletionTrend / WorkItemAging / BlockerDistribution | 固定业务图表模板，引用指标定义；P0 |
| C08 | BurndownChart / BurnupChart / VelocityChart | 有迭代/范围/估算历史时开放的可选进度包；P1；不强加Story Points |
| C09 | CumulativeFlowChart / CycleTimeChart | 历史占用分布、流程耗时/分位数、样本与异常点；P2 |
| C10 | WorkloadChart / AgentCostTrend | 资源分配与Agent用量趋势；成本/时长沿用既有语义，分别度量；P1 |
| C11 | RiskEvidenceList / ForecastChart | P0规则事实列表；P2条件化预测区间和依据；不混成健康总分 |

Radar/Pie/Sankey等属于可扩展图形字典，不为了覆盖参考包所有图型进入首批安装项。Donut/堆叠柱只适用于互斥组成；多负责人/标签分布默认用柱图并说明可重复归属。

### 4.3 Dashboards 决策组合

| 编号 | 组件 | 责任与优先级 |
| --- | --- | --- |
| D01 | DashboardShell / DashboardHeader / DashboardFilterBar | 复用WorkspaceShell/FilterToolbar；项目范围、时间、成员、刷新与数据时间；P0 |
| D02 | DashboardGrid / DashboardWidget | 有限尺寸网格、标题/内容/底部信息、独立加载与错误；P0先固定布局 |
| D03 | WidgetActions / WidgetInspector | 查看口径、表格、展开、允许的复制/导出；P0基础，图型替换/配置为P1 |
| D04 | ProjectOverviewDashboard / AgentOperationsDashboard | 固定模板组合指标、趋势、分布和关注任务列表；P0项目，P1执行 |
| D05 | DashboardLayoutEditor / WidgetPicker | 新增/移除、尺寸、顺序、保存/取消/重置，键盘重排；P1，在固定模板完成后交付 |
| D06 | AnalyticsBuilder | Measure/Dimension/Segment/时间粒度/图型兼容配置，预览有效查询；P2最后交付，不实现任意SQL或公式语言 |

## 5. 统一数据 查询与下钻契约

### 5.1 输入模型

以下为拟定类型，C0固定；当前不存在通用分析服务。

| 模型 | 必要信息 | 责任 |
| --- | --- | --- |
| AnalyticsEntityRef | kind、sourceId、projectId、entityId、可选href；kind=idea/workItem/session/run/artifact | 跨源与不同对象同ID不能碰撞；href由调用方提供 |
| WorkItemAnalyticsSnapshot | entityRef、业务stateId/category、createdAt、actualStartedAt/completedAt可空、计划日期、estimate/unit可空、explicit blockers、revision | 为现有WorkItemRecord提供分析侧附加字段，不将字段缺失默认为0或计划日期 |
| WorkflowEvent | eventId、entityRef、sequence/revision、occurredAt、recordedAt、kind、before/after、sourceVersion、修正/撤销引用 | 来源事件由调用方提供；状态/估算/归属/范围/阻塞变化均可重放 |
| HistoryCoverage | from/to、baselineAsOf、baselineVersion、事件水位、缺失区间、可支持指标、是否完整 | 只有事件没有期初状态也无法重建早期分布；覆盖不足必须说明 |
| MetricDefinition | id、version、entityKind、unit、aggregation、eligible cohort、时间字段、需要的历史、分母/重开规则、允许维度 | 指标的正式口径；API与图例引用ID，不用显示文案作为协议 |
| AnalyticsQuery | source、scope、measureId/version、dimension、segment、timeField、range、bucket、timeZone、filters | 纯序列化描述；执行归调用方，公共组件不带鉴权和网络 |
| AnalyticsResult | queryKey、snapshotId/asOf、series/buckets、unit、coverage、totals、computedAt、limitations、drilldownRef | 全量聚合或明确部分；当前页统计不得冒充全项目统计 |
| CapacitySnapshot | resourceRef、bucket、availableAmount/unit、allocatedAmount、allocationRule、calendarVersion | 容量与任务数不是同一单位；来源不全时不能判定过载 |
| DashboardDefinition | schemaVersion、id/revision、templateId、widgets、布局、globalFilters | 保存视图配置，不复制工作项；存储和并发保存归调用方 |
| DrilldownSelection | queryKey、snapshotId、widgetId、seriesId/bucketId、predicate/受控查询token、targetKind、totalCount可空 | 精确重建点中集合；小集合可附IDs，不能必须携带全部ID |

事件按来源ID去重并处理修正，事件发生时间与采集时间分开；延迟事件可导致重新计算并更新数据水位。删除、归档、重开、移出范围不能被当作完成。状态改名以稳定stateId及历史映射呈现。记录可观察事件，不生成推测的状态历史。

### 5.2 筛选和快照

- 有效查询为权限范围 ∩ Dashboard全局筛选 ∩ 单图筛选 ∩ 明确应用的点选条件。单图筛选不得悄悄覆盖项目/权限范围；例外对比范围要单独标记。
- 时间范围必须绑定时间字段：createdAt筛创建队列，completedAt筛完成队列，asOf筛某时刻状态。默认近30天不能同时模糊表示这三种口径；每张图Header显示实际含义。
- 分析时间戳范围采用 `[from, to)`，按指定时区分桶；日期型排期仍沿用原含首尾日契约，通过适配转换，不把两个边界规则混用。周期闭合前的当前桶标为未结束。
- 同一Dashboard尽量使用一致snapshotId/asOf；来源不同无法一致时显示各自新鲜度，不将不同时间的指标合成严格等式。切项目/筛选用queryKey/generation丢弃迟到响应。
- 同权限同查询刷新失败可保留旧值并标过期；权限撤回或范围切换必须隔离/移除旧缓存，不能继续展示原先有权读取的敏感明细。
- 同一数据集排序/格式化不修改调用方数组。有限数值、缺失、真实0、未采集、无权限分别处理，默认不跨缺失点连线。

### 5.3 下钻闭环

点击柱段/扇区/点或KPI按钮 → 产生DrilldownSelection → 调用方按同一快照与谓词查询 → ChartDrilldownPanel显示数量、口径、过滤Chip与分页工作项 → 打开详情或完整工作视图。

- 图例默认只改变系列可见性，不改变指标分母和其他图；图表点选默认只开下钻。只有用户选择“应用为筛选”才影响同页其他部件，提供清除入口，避免隐式交叉过滤循环。
- 历史点下钻展示“当时属于此集合”的成员，可附当前状态；不能把“今天处于阻塞”当作“上周处于阻塞”的明细。无法提供历史成员时允许展示聚合，但禁用伪下钻并解释原因。
- 统计12项，明细只加载5项应标5/12；权限或快照变化造成数量差异则显式说明并可刷新，不强行补齐或泄露受限对象名称。
- 图表原始数据表提供键盘等价下钻；Tooltip不是唯一信息入口。打开/关闭详情保留图表选择、过滤和滚动，不触发任务写入。
- URL由示例/消费方适配器编码，不将敏感记录全集塞入查询串；分享链接不授予权限。返回历史结果先恢复查询与快照标记，再决定是否刷新。

## 6. 指标口径与专业图表

| 问题/图表 | 默认口径和输入 | 下钻目标与限制 |
| --- | --- | --- |
| KPI / 状态Donut | asOf时刻授权范围内distinct workItem；完成率=满足指定完成状态的项/有效范围项，分母0显示不适用 | 对应实体集合；运行completed、任务完成、验收通过三个指标独立 |
| 工作量柱/堆叠柱 | 按负责人/优先级分类，按业务状态分段；任务数、工时或点数单独选择 | 负责人×状态集合；多负责人可重复归属或按显式份额分摊，Header说明，不能宣称分组和一定等于总量 |
| 完成趋势/Throughput | 按完成时间桶统计指定队列的distinct完成项；同项同桶重开再完成默认去重，跨桶可再计，展示该规则 | 桶内完成项；这是流量，不等于当前完成存量，累计净完成需另定义 |
| 工作项年龄/状态停留 | 未完成项 age=asOf-createdAt；状态停留=asOf-lastStateEnteredAt，二者不互相替代 | 单点直达工作项；缺createdAt或状态事件分别缺失，不能用dueDate替代 |
| 阻塞分布/风险列表 | 明确blocker事件/关系、逾期计划日期、未处理请求、超龄阈值的事实 | 阻塞工作项/请求及来源；类别可以重叠，不画互斥占比Donut |
| Burndown | 指定迭代的剩余工作量，单位固定；期初基线、每日完成与增减scope/estimate形成实际线，理想线基于期初量及明确工作日历 | 当日剩余/变更来源；不能把变更后的范围重绘成始终不变的初始承诺 |
| Burnup | 同一单位显示时点已完成范围内工作量与时点总scope，明确重开/移出造成下降的净量口径 | 完成与scope变更项；若改用累计完成事件量，必须换名称和定义 |
| Velocity | 每个已结束迭代的期初承诺量与结束交付量，追加范围另示；任务数/点数不混合 | 迭代内交付与未交付项；不能用于跨团队或跨估算体系排名 |
| CFD | 期初状态+状态/范围事件重建每日各阶段占用量，再按固定阶段顺序堆叠；不是累加状态变更次数 | 某时点某阶段成员；重开/移除可使色带收缩，保留真实变化 |
| Cycle Time散点 | 默认completedAt落在范围的已完成项；actual first start→最后一次有效完成的历时，重开时包含间隔；等待包含；按选定状态驻留总时长是另一个指标 | 单项与样本队列；未完成项属于年龄图，不能混入已完成周期均值 |
| 工作负载Heatmap | 同单位已分配量/可用容量，按资源与时间桶；无容量只显示分配量，零容量单独标记不可用 | 资源×日期工作项及容量依据；未知估算不当0，日均分摊仅在标注规则下允许 |
| Agent用量趋势 | 区间观测按稳定ID去重，tokens/currency/duration分别统计；父子inclusive按现有规则处理 | Run/Session来源；sum(duration)是运行时长合计，不等于并行运行墙钟时间 |
| Gantt / Dependency | 使用计划日期与权威依赖关系，不从统计点反推调度指令 | 对应工作项；属于Views而非通用统计渲染器 |

周/月桶和比较基期使用相同规则；基期0时不显示无穷百分比，显示新增或不可比较。估算值带estimated标记，未估算比例单独展示。工作流业务状态色映射按stateId/category；不能借用Agent runtime枚举解释任务状态。

CycleTime首版显示中位数及明确算法的P85/P95、样本数与覆盖率；滚动窗口按样本数或时间需声明。标准差带不是统计过程控制界限，更不是交付置信区间；未经定义不命名为Control Chart。跨项目比较必须共享定义版本、单位和业务日历。

### 6.1 风险事实与预测分开

P0提供RiskEvidenceList：已逾期、阻塞超过阈值、未安排截止日、等待审批等可解释事实。每条显示触发规则、阈值、asOf、来源和对象入口；不会自动给项目评一个混合健康分，也不把任务多/成本高等同效率低。

P2 ForecastChart接收调用方ForecastResult：method/version、历史窗口、样本量、scope、粒度、日历、模型假设、预测分位数/概率区间、生成时间和校准结果。示例可用固定种子的历史吞吐抽样，但必须标明方法和假设，不把图形外推当科学结论。

样本不足、scope剧烈变化、历史缺失或模型未校准时显示“暂不能可靠预测”；门槛由方法定义和验证确定，不能随意固定一个通用任务数阈值。P50/P85日期是条件化预测分位，不是保证完成日。下钻进入历史样本和当前待完成项，未来概率区域不能伪造对应未来工作项。预测不自动改排期/分配资源。

## 7. 图表视觉 交互与可访问性

- Dashboard采用12列桌面、6列中屏、单列窄屏；Widget间距16px/窄屏12px，内边距16px，圆角12px细边框，普通图表无强阴影。标题14–16px，坐标/元数据12px；工具栏遵守32px及触摸44px规则。
- 图表基础高度建议240/320/400px三个档位，Header、图例、轴与Plot分别预留空间；ResizeObserver响应容器，不依赖window宽度猜测。宽预览不令页面横溢，390px可切数据表或展开详情。
- `styles/theme.css`集中维护chart分类色/网格/参考线/选中token；状态色、类别色、容量顺序色与风险阈值色区分。同一seriesId跨图保持颜色，不随排序重新分配。用标签、线型、图案补充颜色。
- 柱状默认零基线，折线非零轴须明确范围；不同单位分图，双轴仅显式配置并标单位。Donut分母/未知占比可读；连续时间保持真实间隔，不为了平滑插值掩盖缺口。
- Hover只高亮和提示；点击、触屏点选、键盘Enter产生相同稳定选择。Tooltip展示完整值、单位、时间范围、覆盖/估算标记，不承载唯一可用的导航或错误信息。
- Legend支持键盘开关与状态播报；缩放/框选/Brush有范围表单与重置入口。缩放不改变统计口径，重采样只改变绘制密度；抽样图说明代表性并保留精确查询能力。
- 提供图表标题、简短结论、结构化数据表和键盘等价操作；避免给每个一万散点都加Tab停靠。可以采用图内游标/受控焦点模型和外部表格，不能仅依赖底层库accessibilityLayer宣称无障碍通过。
- 数据轴覆盖loading/empty/partial/error/success；空原因区分无匹配、真实零、尚未采集、历史不足。权限/过期/断连单独表达；无权限区域不显示旧数据。一个Widget失败不替换整个Dashboard。
- 导出CSV默认对应当前筛选与快照，包含单位/时区/口径版本和覆盖信息；CSV单元格需防公式执行，敏感字段遵守调用方权限。图像导出和复制作为P1能力，无法提供时不显示空按钮。任何导出不默默扩大到全量未授权记录。

## 8. Dashboard配置与受控保存

P0固定模板中的Widget只提供有限显示选项，不出现无法保存的自由编辑器。P1开放显式编辑模式：Widget选择/移除、有限宽高、位置重排；拖动与键盘“前移/后移/调整尺寸”同语义，DOM阅读顺序跟随布局顺序。

DashboardDefinition与AnalyticsQuery分开。保存包含baseRevision和operationId，成功由调用方确认，失败保留草稿，未知结果先核对；刷新/退出不能假称已保存。配置迁移按schemaVersion执行，不持久化源数据或访问凭据。首版不新增分享权限系统、多用户协作锁或后台调度器。

通用构建器最后交付：按MetricDefinition限制维度、segment、单位和图型；未支持组合给出原因而非空白图。自由编辑配置不能提升查询权限，不能使图形任意执行SQL/JS。先预览再应用，取消保留原配置。

## 9. 文件与分发落点

| 落点 | 计划内容 |
| --- | --- |
| `lib/analytics-model.ts`、`analytics-query.ts`、`analytics-metrics.ts` | 受控模型、过滤/下钻规范化、指标定义与版本；与UI渲染解耦 |
| `lib/analytics-history.ts` | 可选纯函数校验、期初+事件重放、分桶与覆盖判断；供fixture/小数据使用，不成为生产事件存储 |
| `lib/chart-model.ts`、`chart-format.ts` | 纯系列、选择模型、Intl格式化和单位；不把Recharts类型扩散至服务模型 |
| `components/ui/chart.tsx` 与 CSS | 基础容器、Tooltip/Legend/样式；具体统计渲染按需加载，不经全站barrel强制引入 |
| `components/blocks/charts/` | 通用图形、数据表/下钻与固定专业图表；文档与安装按真实公共边界组织 |
| `components/blocks/analytics/` | 项目/执行/资源/风险模板，关系与视图适配；复用现有工作项组件 |
| `lib/dashboard-model.ts`、`components/blocks/dashboard/` | Widget定义、固定网格、配置/编辑和保存意图 |
| `components/examples/workflow-analytics/` | 明确模拟的历史、容量、权限、查询和回执适配器；参考配套展示计划 |
| Manifest、Registry、i18n、词典、文档与Blog | 每个公开安装项有API、示例、CSS与lib完整依赖；纯站点图表样例不加入便携包 |

模型basename与组件不同以兼容Registry重写。基础图表独立安装不引入Dashboard、工作项、React Flow或站点provider；项目Dashboard根据所用Widget声明依赖。新引擎进入Registry npm依赖并执行独立安装验证，不能只在本仓库能运行。

## 10. 分阶段任务与验收出口

| 阶段 | 优先级与依赖 | 交付 | 验收出口 |
| --- | --- | --- | --- |
| C0 契约与底座验证 | P0，无 | 指标/历史/权限/下钻模型、来源哈希；Recharts当前栈小样与依赖测量 | 口径可解释，按ID下钻，静态导出/主题/键盘/独立安装最小验证通过 |
| C1 基础图表 | P0，C0 | C01–C03、C05/C06、series主题、数据表、原始事件到DrilldownSelection适配 | 常规图形+未知/零/部分态；鼠标键盘触屏都能定位同一集合 |
| C2 固定项目模板 | P0，C1 | C07、V01/V02、D01–D04项目模板、RiskEvidenceList | 状态→趋势→阻塞/年龄→任务详情完整闭环；无历史时不伪造趋势 |
| C3 执行与资源模板 | P1，C2 | C04/C10、V03/V04、AgentOperationsDashboard及导出 | 币种/父子用量不重复，容量不足可解释，实际执行与计划区间分开 |
| C4 可选进度包与Dashboard配置 | P1，C2/C3 | C08、D05；固定模板基础上选择/重排/保存Widget | scope变化/重开/估算有依据；保存拒绝/unknown可恢复，键盘重排可用 |
| C5 流程与风险分析 | P2，C0历史覆盖+C3/C4 | C09/C11预测、V05、解释与样本下钻 | CFD/周期口径正确；预测假设/样本/校准可查，数据不足明确降级 |
| C6 通用分析构建器 | P2，C4/C5 | D06、允许的measure/dimension/segment/chart组合、配置迁移 | 先有用例再开放配置；非法组合、权限和分母语义受约束 |
| C7 分发与展示证据 | 贯穿C1–C6 | 文档、Registry、示例、截图、计算/浏览器/安装测试及Blog | 每阶段单独记录完成/部分/待验证；不把模拟数据当真实服务验收 |

首版完成=C0–C2及对应C7；资源与执行增强=C3–C4及C7；完整规划另含C5–C6。所有阶段都以真实需要的组件为界，禁止为了凑图表数量一次性添加全部图型。

## 11. 核心验证

- 指标正确性：独立手算fixture与期初/事件重放对照；撤销/重开、scope增减、跨时区桶、缺失、重复事件、负数/NaN、分母0、多负责人分摊、币种隔离和父子包含关系。
- 下钻一致性：图表、聚合表和明细在同快照/权限下对应；historical membership不被current status替换；大集合分页、权限撤回、查询切换迟到响应都有明确行为。
- 专业图表：CFD每日阶段和等于有效范围量；Burnup两条线口径一致；Burndown scope变化可追溯；Cycle Time排除无起点样本并显示覆盖率；容量未知不标过载，预测不足不补曲线。
- 图形/交互：深浅主题、中英、1440/1024/768/390px，零/单点/长标签/高基数、键盘/触屏、reduced-motion、主题隔离及Portal；数据表具有完整替代路径。
- 性能：固定500/5000/50000条事件、100/1000/10000可绘制点、4/8/12 Widget分别测量；这些是测试档位，不是支持容量承诺。大数据优先消费端聚合与分页，再决定抽样/Worker/窗口化。
- 门禁：lint、typecheck、Webpack build、check:i18n、check:manifest、check:blog、相关浏览器测试及test:install；首页/普通文档不得因图表上线自动下载统计引擎。构建前检查服务占用，共享工作树按路径保留并行修改。

产出 `plans/workflow-analytics-implementation-log.md` 记录组件、指标、示例、安装和真实服务五类证据。计算单测、fixture行为、视觉截图、安装测试、真实服务数据是不同验收层次；只在对应层次有证据时标记通过。
