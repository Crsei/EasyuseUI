# Work Items

组件展示入口：`/examples/work-items/`，从 `/examples/` 进入。提供 List、Board、Table、Timeline、Calendar，以及可选泳道、子项、批量状态/优先级修改和保存视图接口。示例数据刷新后重置，所有写入与回执均为本地模拟。旧 `/workspace/work-items/` 入口保留参数跳转到示例页面。

## 分层与安装

- `grouped-items-model`：业务无关的 GroupSnapshot / BoardMove。
- `grouped-list`：GroupHeader、GroupBody、GroupedList；分组顺序、折叠、读取及加载更多受控。
- `work-items-board-base`：Board、BoardColumn、BoardItem；不导入工作项或 Agent 模型。本轮与 Agent Board 使用独立文件和安装目标，后续再统一。
- `work-items-model`：WorkItemRecord、目录、视图、交互、能力、MutationState、MoveIntent；附带可选本地纯函数。
- `work-item-properties`：共享字段与 State/Priority/Assignee/Label Picker、原生 DueDateField；AvatarGroup、PropertyOverflow 为该安装项内的辅助导出。
- `work-item`：WorkItemRow、WorkItemCard、WorkItemIdentifier、WorkItemMutationNotice。
- `work-items-views`：WorkItemList、WorkItemBoard、WorkItemTable；Table 复用 DataTable。
- `work-items-toolbar`：WorkItemsToolbar、WorkItemsDisplayOptions。
- `work-item-detail`：WorkItemDetail、WorkItemQuickCreate。
- `work-items-workspace`：组合入口；安装时递归带入以上依赖及 CSS/i18n。公共组件没有 Next、站点、网络和本地存储依赖。

Registry 示例（替换成部署站点）：

```bash
pnpm dlx shadcn add https://YOUR-SITE/r/work-items-workspace.json
```

所有公开安装项的真实源码、API和按需示例见组件目录。Row/Card 和三布局各有文档入口，同一安装项内的辅助导出不机械拆包。UI 词典由正式 Manifest 自动生成实现标记。

## 受控接入

```tsx
<WorkItemsWorkspace
  title="Work Items"
  sidebar={<Navigation />}
  catalog={catalog}
  items={loadedItems}
  groups={authoritativeGroups}
  queryKey={queryKey}
  view={view}
  onViewChange={setView}
  interaction={interaction}
  onSelectionChange={setSelection}
  activeItem={activeSnapshot}
  onCloseItem={closeDetail}
  getPresentation={(item) => ({
    catalog,
    visibleProperties: view.visibleProperties,
    capabilities,
    mutation: mutations[item.id],
    href: getItemUrl(item.id),
    onOpen: openDetail,
    onPatchItem: requestPatch,
    onReconcile: () => queryReceipt(item.id),
  })}
  canMove={canMove}
  onMove={requestMove}
/>
```

`items`、`groups`、`activeItem`、草稿、操作回执、权限和版本由消费方提供。属性 UI 可显示调用方的草稿覆盖值，但必须同时提供 pending / rejected / unknown；它们不代表已经保存。选中、焦点、详情、折叠与写入相互独立。

### 移动

Board 回调包含 itemId、sourceGroup、targetGroup、beforeId/afterId、queryKey，以及可选 baseRevision（由 getItemRevision 提供）。WorkItemBoard 自动提供记录 revision。适配层补充唯一 operationId 后，用 `validateMove` 或服务等价规则校验；服务负责最终权限、版本和全局排序。不要把当前页数组下标当服务端顺序。

单值状态/优先级分组可移动。自动排序允许跨组修改，禁止列内自由重排。部分分页只允许明确已加载邻居；向未知尾部追加必须显式提供 allowAppend 能力。多值负责人/标签分组不在首版移动范围。

指针拖动仅由独立把手启动，触摸把手使用 Pointer Events。键盘/触屏使用“移动到组、上移、下移”入口，走相同回调；Escape 取消。折叠、删除目标、queryKey变化和权限变化后重新校验，不能修改旧对象。拖动预览不写权威记录。

### 结果与分页

MutationState 的 pending/unknown 锁定对应条目。卸载视图不清回执，未知结果先查询，明确拒绝才允许安全重试。调用方不可把 Promise resolve 当作业务完成。QuickCreate 返回明确的 CreateResult；传入 unknown、onUnknown 与 onReconcile，使关闭浮层后仍由适配层保留锁。onUnknown 在结果未知或回调抛异常时通知适配层保留回执。回调不得吞掉未知结果。

GroupSnapshot 的 totalCount 为 null/undefined 时显示“已加载”，不补0。加载更多失败保留当前组内容。`mergeGroupPage` 仅合并相同组和 queryKey，按来源顺序去重；远程数据必须提供全量权威总数，不能调用本地 `groupWorkItems` 重新推算。

日期保持 YYYY-MM-DD 字符串。`today` 由消费方按项目时区给出；示例固定为 2026-10-08，不通过 UTC 转换。

`agentLabel` 可由调用方描述关联运行态；公共组件默认显示 Agent，站点 fixture 明确标为“模拟 Agent”。示例场景和模拟回执文案位于站点语言资源，不随组件语言包分发。

## 示例与证据

URL 仅保存支持的布局、分组、排序、搜索、过滤、字段显隐、空组和稳定 item ID。配置使用 replace，详情导航使用 push；静态导出在 Suspense 中解析。公共组件不读路由。

工作台默认收起场景说明。包含空数据、无匹配、加载、部分组、刷新失败、只读、明确拒绝、未知结果及模拟 Agent；压力数据为50/200/1000条。源码、fixture浏览器、安装和真实服务证据分开记录在 `plans/work-items-implementation-log.md`。本轮没有真实 Plane/生产服务接入证据。

1000项场景会实际挂载全部条目，当前没有窗口化。W0–W4 的单次基线与 W5/S5 的重复测量分别保留，均包含自动化开销和120ms模拟回执延迟，不作为生产服务SLA。消费方可使用权威分页控制已加载数量。

## 泳道

`WorkItemBoard` / `WorkItemsWorkspace.lanes` 接收 `WorkItemsLaneSnapshot[]`，每个泳道有独立的 `groups`、组数据态、计数、分页和折叠。`view.subGroupBy` 可为 `none/state/priority`，必须不同于 `groupBy`。`groupWorkItemLanes` 仅适用于已掌握全部数据的本地适配器；远程数据应直接提供权威泳道和分组，不能用一页数据推断总数。

`onMove` 收到原有移动意图以及 `laneKey`；指针、触屏菜单和键盘均只能在当前泳道内操作。调用方验证所属泳道、查询代次、基础版本、权限及目标邻居。跨泳道会同时影响第二个字段，本版不定义这种写命令，也不会自动修改两个属性。`onCreateInLane(laneKey, groupKey)` 显式提供两个预设；加载更多/重试使用 `onLoadMoreInLane` / `onRetryInLane`。

List/Table 保留泳道偏好但仍是原有布局。没有当前查询的泳道快照时明确提示并展示原始分组，不补虚构总数。示例的部分加载场景只提供一级分组的权威快照。

## 子项

`WorkItemList.hierarchy` 接收 `expandedIds/onExpandedChange` 与可选的 `children` 快照、`onLoadMore/onRetry`。Workspace 通过 `view.showSubItems` 控制 List 展开模式。关系来自实体 `parentId`，与分组、选择和业务状态独立；展开父项不会选择它或其子项。只对已加载、处于当前查询的实体建索引；父项不在查询中时，匹配子项作为根显示。

子项按当前查询/排序保留顺序。折叠保留选择并计入隐藏数量；全选只影响当前已展开且可见的实体。Table/Board 平铺实体，切回 List 恢复展开状态。子项快照明确提供总数/未知总数、部分加载、失败与重试；已有子项在读取失败时保留。循环、自引用、孤儿和跨项目父引用不会导致递归失控或丢弃实体；组件不负责修复服务端关系。嵌套通过普通列表和独立 disclosure 实现，不冒充多选 Tree。

## 批量修改

```tsx
<WorkItemsBatchActions
  items={selectedSnapshots} selectedIds={selectedIds}
  catalog={catalog} capabilities={capabilities} mutations={mutations}
  onApply={submitBatch} onReconcile={queryUnknownItems}
/>
```

支持状态、优先级两个单值字段。预览逐项显示可修改、未加载、权限不足或 pending/unknown，并明确包含隐藏选择。确认意图包含唯一 `operationId`、每项 `itemId/baseRevision` 和字段 patch。调用方再次验证权限、版本及并发锁；服务端授权始终是权威。

组件不建立事务、不推断全查询选择、不把 Promise resolve 当作全部成功。`mutations` 展示每个已选实体的最新回执；部分成功、拒绝、提交中与 unknown 分开统计。unknown 条目不能再次写入，先通过 `onReconcile` 查询；切布局或重挂载不能清除调用方持有的锁。示例 `batch-mixed` 固定 WI-001 成功、WI-002 拒绝、WI-003 unknown、WI-004 无权限，其他条目仍可独立操作。

## 保存视图

`WorkItemsSavedViews` 接收 `views/view/activeId`、独立 `mutation`、保存/删除能力及 `onApply/onSave/onDelete/onUnknown/onReconcile`。保存意图只包含名称、视图配置、可选对象 ID 与 `baseRevision`；不含实体、选中项、当前详情、编辑草稿或写入结果。`onSave/onDelete` 返回明确 confirmed/rejected/unknown，异常按 unknown 交还调用方。更新与删除需由服务校验版本；拒绝保留输入，unknown 先对账，允许查看和应用已有视图。

示例可另存、更新/重命名、应用和确认删除视图，但只存在页面内存。刷新清除保存视图及业务 fixture；URL 保留布局、分组、泳道、子项、屏外布局偏好、筛选及字段。公共组件没有 localStorage、URL 或网络副作用，持久化和账户作用域由消费方提供。

## 大数据与证据

分组与层级使用索引，适配器缓存查询/分组和未变化的实体，共享属性避免无关选择触发所有编辑器重渲染。`view.deferOffscreen` / `WorkItemsViewProps.deferOffscreen` 可选启用 List/Board 的浏览器 `content-visibility`，保留真实 DOM、浏览器查找、复制与键盘顺序；屏外属性先显示完整只读值，进入可见区或聚焦时挂载字段编辑器。已挂载的编辑器保留至条目卸载，滚动不会关闭浮层或丢草稿；聚焦行立即参与布局，不支持此 CSS 时退回完整布局。Table 保持原生表格渲染。本版没有窗口化或服务分页替代品。

50/200/1000 项的同环境开关对照由 `scripts/measure-work-items-enhancements.mjs` 记录已加载/已挂载数量、DOM、选择/字段更新/切布局/移动/分组耗时。结果包含浏览器自动化和本地 120ms 回执开销，不能解释为生产服务延迟或 p95。旧版单次基线仍单独保留，不与新运行的硬件噪声混成改善保证。

每项增强的源码、浏览器和独立安装结果见 [实施记录](plans/work-items-implementation-log.md)。本地示例与分发验证均不证明真实 Plane、生产权限、批量事务或持久化服务接入。

## Timeline / Calendar（W6–W9）

`WorkItemsViewState.layout` 现支持 `list | board | table | timeline | calendar`。旧记录无需 `startDate`，通过 `workItemDates()` 规范为 null；旧保存视图用 `normalizeWorkItemsView()` 补齐时间配置。缺省锚点固定为 `2026-10-09`，消费方应传入自己的初始锚点。协议日期是严格有效的 `YYYY-MM-DD`，采用包含两端的日历日期运算；`todayInTimeZone(timeZone, now)` 明确时区与时钟。历史非法日期保持可见并提示修正。

```tsx
<WorkItemsWorkspace
  {...controlledWorkspaceProps}
  view={view}
  onViewChange={setView}
  schedule={{
    today: projectToday,
    range: authoritativeTimelineRange,
    buckets: authoritativeCalendarDays,
    onScheduleChange: submitAtomicScheduleIntent,
    onLoadRange, onRetryRange, onLoadDate, onRetryDate,
    onCreateOnDate: date => openCreateDraft({ dueDate: date }),
    proposedDates: retainedDateDrafts,
    onDateDraftChange: retainDateDraft,
  }}
/>
```

`ScheduleChangeIntent` 包含 operationId、itemId、baseRevision、queryKey、kind、previousDates、nextDates。`validateScheduleChange` 校验版本、查询代次、每个变更字段的权限、pending/unknown 锁及日期合法性。Timeline 的 shift 同时移动两端并保持日历天数，resizeStart/resizeEnd 仅改一端；单端记录不虚构工期。Calendar 的 setDueDate 只改截止日，拒绝早于开始日的落点。无变化、Escape 取消和只读不会提交。拖动每次释放最多发一条意图，键盘/触摸通过同一个日期表单提交精确日期。

消费方必须把成对日期写入提交为原子服务命令，并在服务端检查基础版本；两个独立 PATCH 不满足契约。组件不请求服务、不确认成功，也不自动解锁。保留已确认快照、拟提交日期和回执，unknown 先按对象/操作/版本对账；布局切换和 locale 不构成对账。示例使用页面内存中的一次 CAS，刷新清除，不是真实服务证明。

`Timeline` / `TimelineAxis` / `TimelineRow` / `TimelineBar` 与 `Calendar` / `CalendarHeader` / `CalendarDay` / `CalendarAgenda` 是通用容器，业务无关的发布窗口和便笺示例位于对应文档。业务适配使用 `WorkItemTimeline`、`WorkItemCalendar` / `WorkItemCalendarEntry`、`UnscheduledWorkItems`、`WorkItemDateRangeField`、`ScheduleViewControls`，不会建立第二份工作项存储。

Timeline 采用共享垂直滚动、固定侧栏和吸附表头，右侧支持水平滚动、week/month/quarter、今天定位和展开。范围外条两端裁切并保留完整日期名称。日期拖动与可选手动行排序是独立入口；`schedule.onReorder` 仅在手动排序时可用，其服务顺序与权限由调用方定义。布局切换保留时间线滚动位置，刻度改变按日历位置换算。

远程 Timeline 查询必须使用区间相交，包含起点在窗口之前但仍跨入窗口的任务。缺失日期策略由调用方明确；`scheduleIntersects()` 只用于完整本地来源。`ScheduleRangeSnapshot` 和 `DateBucketSnapshot` 携带 queryKey、IDs、loadedCount、可空 totalCount、游标、hasMore、五数据态与错误。组件丢弃不匹配查询/范围的快照；调用方也须丢弃迟到响应，合并分页使用 `mergeSchedulePage()` 去重且检查代次和范围。unknown total 不补零，刷新失败保留同范围已加载数据。

Calendar 按截止日单次归组，显示整周（含相邻月份）、可控周首日、周末显隐、月/周切换与当日 Agenda。周末隐藏后任务仍可从周末 Agenda 进入；无截止日任务在去重的未排期队列中。已加载条目的折叠与远程分页分别有入口。按日期新建只预填草稿，保存才创建；排期已有任务修改原对象。390px 隐藏格内条目，日期选择后进入 Agenda。日期采用 roving tabindex：方向键、Home/End、PageUp/Down；Enter 进入 Agenda，Escape 返回日期；不添加不完整的 ARIA grid。

URL 白名单支持 `layout=timeline&scale=month&date=2026-10-09` 与 `layout=calendar&mode=month&date=2026-10-09`，另存 timelineDate/calendarDate/selectedDate 等独立偏好。切时间布局不应用 groupBy/subGroupBy，返回原布局时恢复。服务查询、真实权限、持久化、依赖调度/关键路径、会议/重复事件均不由这些组件实现。

草稿不等于命令：日期表单通过 `onDateDraftChange(item, dates)`（字段组件为 `onDraftChange`）通知调用方保留输入，通过 `onScheduleChange(intent)` 才提交写入。Inspector 的 presentation 对应 `onScheduleDraftChange`。调用方在 locale、布局、浮层关闭/重开和失败后重新传入 `proposedDates`，确认后按字段清除。可选 `unscheduled` 快照与加载/重试回调提供未排期队列的五态与未知总量；不匹配queryKey的范围/队列不会混入新视口。
