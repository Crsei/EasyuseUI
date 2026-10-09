# 工作流分析组件

组件计划 C0–C7 与展示计划 S0–S6 已实现。入口 `/examples/workflow-analytics/` 提供十种分析场景；`/examples/workflow-analytics/baseline/` 保留首版手算示例。所有展示使用确定性内存 fixture，刷新重置；没有真实历史采集、服务查询、权限授予或业务写入。实施与验证见 [实施记录](plans/workflow-analytics-implementation-log.md)。

## 安装与分层

| 安装项 | 主要导出 | 依赖边界 |
| --- | --- | --- |
| analytics-model | AnalyticsEntityRef / AnalyticsQuery / AnalyticsResult / WorkflowEvent / HistoryCoverage；analyticsEntityKey / computeWorkflowMetric / replayWorkflowHistory | 纯模型与可选小数据计算；没有 React、网络或统计引擎 |
| chart-model | ChartKind / ChartSelection / chartData / chartDrilldown / formatChartValue | 纯图表适配；没有统计引擎 |
| chart-frame | ChartFrame / ChartHeader / ChartDataState / ChartLegend / ChartTooltip / ChartAxis | 复用 DataRegion 和主题；没有统计引擎 |
| statistical-chart | StatisticalChart / BarChart / LineChart / AreaChart / DonutChart / ScatterChart / ChartReference | Recharts 3.10.1、react-is 19.3.0；按需引入 |
| chart-data-table | ChartDataTable | 聚合点的完整数据表，复用 DataTable；独立于引擎 |
| chart-drilldown-panel | ChartDrilldownPanel | 来源明细、分页和受控 Sheet；独立于引擎 |
| workflow-metric | WorkflowMetric | MetricSummary、明确口径/比较基期/覆盖与下钻 |
| workflow-charts | StatusDistribution / CompletionTrend / WorkItemAging / BlockerDistribution | 固定业务模板 |
| risk-evidence-list | RiskEvidenceList | 规则、阈值、时间、来源和对象入口 |
| work-traceability-view | WorkTraceabilityView / analyticsRelationsFor | 有类型关系表，不推断转化率或依赖满足 |
| work-items-view-adapter | WorkItemsViewAdapter | 复用 WorkItemsWorkspace 的五布局与原有业务能力 |
| dashboard | DashboardShell / Header / FilterBar / Grid / Widget / WidgetActions / WidgetInspector | 固定响应网格与受控工具栏；不保存配置 |
| project-overview-dashboard | ProjectOverviewDashboard | 项目固定模板；每个图表独立读态 |

Registry 的嵌套文件使用明确 target；模型与组件采用不同 basename。所有安装项均有 Manifest、文档页和按需示例。可以从 `/r/<item>.json` 安装；消费项目有既有主题时选择 `/r/host/` 或 `/r/scoped/`，沿用本库 ThemeBoundary 规则。

```tsx
import { StatisticalChart } from "@/components/blocks/charts/statistical-chart"

<StatisticalChart
  widgetId="throughput"
  kind="line"
  xType="time"
  title="实际完成事件"
  description="同项同桶去重，跨桶可重复；不等于当前完成存量。"
  query={query}
  result={result}
  access={canRead ? "allowed" : "denied"}
  selection={selection}
  onSelectionChange={setSelection}
  onDrilldown={readSnapshotMembers}
/>
```

`query` 是纯描述，`result.queryKey` 必须匹配 `analyticsQueryKey(query)`。范围、来源、权限版本变化时，旧结果不渲染；调用方递增 generation，并通过 `acceptAnalyticsResponse` 丢弃迟到结果。不要把调用方可访问的旧数据放进新的查询结果。`access="denied"` 隐藏图、表、旧值、导出和明细；撤权时调用方还需移除对象详情和缓存。

## 指标与历史

- `status-distribution@1`：有效范围内去重工作项，排除 cancelled；各分类来自快照。分母为零时完成率不适用。任务完成与 Run completed、业务验收没有互相推导。
- `completion-trend@1`：状态转入 completed 的实际历史事件，同实体同桶去重、跨桶允许重复。移出范围、归档、删除和重开不是完成；图中成员保留历史归属。
- `work-item-aging@1`：未完成工作项的 `asOf-createdAt`，单位 days；缺失创建时间显示缺失、标记部分数据，不借用计划日期。
- `blocker-distribution@1`：未完成项的明确 blocker 关系，组间可重叠；只用柱图，不假称互斥组成。

`computeWorkflowMetric` 的输入必须显式声明 complete 或 partial；它不能判断一个已加载分页是否代表整个项目。服务端聚合可直接提供 AnalyticsResult，无需使用本地计算器。系列值必须是有限数值或 null；null 与真实 0 分开，连续图默认不跨缺口连线。柱图零基线；Donut 要显式 `composition="exclusive"`，只允许单系列、互斥分组和非负值。

历史需要期初完整快照、baselineAsOf/version、水位、覆盖区间、缺失区间与指标支持声明。事件身份为 sourceId+eventId；冲突重复报错，完全相同的重复去重。correction/retraction 必须引用同源同实体已知事件；修正替换原发生时刻的 payload，撤销移除原事件。只重放期初之后、asOf 之前或当时的事件。occurredAt 用于业务时间，recordedAt 用于采集审计，不能互换。迟到事件由调用方重新计算、推进 snapshotId/水位。

时间范围为 `[from,to)`；日、周、月按 query.timeZone 分桶，周从周一开始。当前未闭合桶带 unfinished。纯 helper 有 10,000 桶边界，超出需调用方聚合；不是生产数据库或事件调度器。首版趋势要求覆盖整个查询范围；无期初或有缺口时显示历史不足，不补造曲线。

## 选择、下钻与恢复

所有鼠标、触屏、数据表与键盘入口都生成稳定 seriesId/bucketId 的 DrilldownSelection。图例只改变系列可见性；分母和其他 Widget 保持不变。点选默认打开来源；只有“应用为筛选”回调才请求改变全局查询。

`ChartDrilldownPanel.response` 必须带 queryKey、snapshotId、seriesId、bucketId、records、totalCount。不匹配时不展示旧记录；2/5 的分页显示为已加载 2/5。小集合可提供 entityRefs，大集合使用受控 predicate/token 并由调用方分页。历史聚合不能用今天的状态重新构造；缺少可重建成员描述时不提供 drilldown，组件展示不可下钻原因。

`WorkItemsViewAdapter` 要求选中集合与工作区 queryKey/snapshotId 一致；调用方按历史成员加载 WorkItemRecord，并保留原始 canEdit/canMove/审批/持久化能力。适配器不从统计点生成写入。关联表区分 trace、contains、blocks、execution-parent 和 idea-link；多对多 Idea 关联数不是转化率。

同权限同查询刷新失败通过 DataRegion 保留旧图与数据时间；单个 Widget 失败不替换其他图。表格是完整替代路径；图内键盘游标用方向键、Home/End、Enter，不给每个散点增加 Tab。图形动画关闭，支持 reduced-motion。局部图表样式使用共享 chart tokens，Tooltip 不脱离主题边界。

CSV 导出是显式回调。`analyticsCsv` 核对 queryKey，并包含快照、指标版本、单位、范围、时区、完整性、覆盖和限制；单元格对公式前缀转义。权限和敏感字段仍由调用方控制。首版没有图像复制、任意图型替换或不可保存的布局编辑按钮。

## 当前边界

C3 资源/执行、C4 迭代进度/布局保存、C5 CFD/周期/预测/任务依赖、C6 通用构建器保留后续范围。DashboardDefinition 仅定义配置类型；尚未提供布局保存或后台查询服务。计算、fixture、截图、安装和真实服务证据分别记录在 [实施记录](plans/workflow-analytics-implementation-log.md)。

底层尺寸和事件 API 按 [Recharts 官方文档](https://recharts.github.io/en-US/api/BarChart/) 与安装版本类型核对，组件业务事件不暴露底层库 payload。参考包只借鉴语义和组织，没有复制其源码；依赖采用 Recharts MIT 许可。


## 完整组件与场景（C3–C6 / S2–S5）

`/examples/workflow-analytics/` 提供 overview、traceability、charts、agents、resources、delivery、flow、risk、custom、builder 十个可分享的 URL 场景。`/examples/workflow-analytics/baseline/` 保留首版手算演示，不覆盖首版证据。

- `analytics-resource-model`：显式资源日期份额与工作单位；未知估算不为零；容量零、缺容量、无分配分离。Heatmap 提供单游标键盘导航和完整数据表，ResourceAllocationView 将单元关联到分配与既有五布局工作视图。
- `AgentExecutionTimeline` 用实际时间戳，复用 TimelineRow；不会把运行区间转换成计划日期。AgentOperationsDashboard 复用 AgentUsageSummary。inclusive 父观测排除显式子运行；未知包含关系隔离；货币不换汇，时长相加不代表墙钟。
- `analytics-history-metrics` 与 `workflow-history-charts` 提供 Burndown、Burnup、Velocity、CFD、CycleTime、StateResidence、Workload、AgentCost 模板。燃尽理想线保持期初承诺并要求匹配工作日历；Velocity 只比较在范围内关闭的迭代。CFD 使用互斥状态占用，历史下钻保留当时集合。Cycle Time 取首次实际开始到最后有效完成，包含等待与重开间隔；P50/P85/P95 为最近秩，缺开始时间报告覆盖而不补零。
- `ForecastChart` 展示带版本、固定种子、样本窗口、日历与范围的经验 bootstrap 示例。按相同待完成数量进行滚动原点交付天数回测，只使用每个原点之前的训练样本；未观察到完整结果的原点排除并报告方法。模型配置指定最少样本、最少回测原点、P85 覆盖下限和过期时间；范围不稳定、历史不完整、过期或未达回测要求时不输出预测日期。失败模拟保留在分位分母中，超出上限显示不可计算。此例使用日历日和日期字符串，不声称工作日预测或业务承诺。
- `WorkDependencyView` 复用只读 WorkflowCanvas 和可访问关系表；业务 blocked/satisfied/unknown 与 RuntimeStatus 分开。Tarjan 强连通分量只标记真正环路，超过 200 对象使用表格。
- `DashboardEditSession` 必须由调用方保留，组件卸载不能丢失未知操作。保存意图包含 baseRevision/operationId；拒绝保留草稿，unknown 锁定编辑、取消和再次提交；显式核对后才解锁。`DashboardLayoutEditor` / `WidgetPicker` 提供添加、移除、键盘重排、有限尺寸。配置迁移去除额外数据与凭据字段，不保存查询结果或对象集合。
- `AnalyticsBuilder` 只接受注册指标、维度、分段、单位与图型，固定来源与权限范围，无 SQL/脚本执行。预览包含查询和展示配置身份；配置改变后必须重新预览才能应用。取消保留已应用配置。示例 count 对多负责人采用首个排序 ID 归属，并在界面说明，避免堆叠重复。

公共组件不读取 Next 路由、网络或凭据。示例 URL 仅包含公开 fixture ID，真实消费者应使用受控查询 token。筛选默认不随点选改变；明确“应用为筛选”才改变其他模块。未知 URL 参数有说明；当前范围变更丢弃迟到返回；撤权清除受限展示。CSV 包含快照、范围、单位与覆盖，并转义公式前缀；SVG 图像包含同一聚合快照及模拟标记，不声称导出分页原始记录。

完整证据位于 `public/blog/workflow-analytics/full/`：截图矩阵、分离的纯事件聚合和浏览器绘制/筛选/下钻测量、源码摘要及独立安装记录。性能数据为本机基线观测，不代表真实服务容量或优化前后收益。`scripts/capture-workflow-analytics.mjs` 采集矩阵与 4/8/12 模块 × 100/1000/10000 总点数（分摊至模块）的浏览器时间。业务写入、权限权威、存储、协作、预测生产可信度仍由消费方服务验收。
