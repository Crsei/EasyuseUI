# Work Items 通用组件与展示模式建设计划

日期：2026-10-08；更新：2026-10-09
状态：W0–W9 已实施。W6–W9 的日期契约、Timeline、Calendar、五布局组合与分发另有本轮浏览器、独立安装和采集证据，不复用 W0–W5 的旧验收结论。真实服务接入由消费方另行验收。见[实施记录](./work-items-implementation-log.md)。
配套：[Work Items 示例页面展示计划](./work-items-showcase-plan.md)。

## 1. 目标与现有基础

建设共享数据、共享属性、不同布局的 Work Items 组件体系。已交付的第一版提供 List、Board、Table；本次补齐 Timeline（排期甘特图）和 Calendar（截止日日历），形成五种布局。通用 GroupedList/Board、Timeline/Calendar 容器分别服务分组流程、区间排期和按日展示，不绑定工作项服务。

承接 [通用组件补齐计划](./common-components-completion-plan.md) 与 [实施记录](./common-components-completion-log.md)。当前源码已有 DataTable、Checkbox、Avatar、Tabs、Segmented、Select、Combobox、Menu、Popover、Sheet、Field、FilterToolbar、WorkspaceShell、ThemeBoundary；不将这些列为待重建组件。实施前复核实际 API、依赖与验证状态。

遵循 [设计规则](../Design-rules.md)、[组件契约](../Component-Specification.md)、[交互模式](../UI-PATTERNS.md)、[状态规范](../UI-STATES.md)、[国际化约定](../I18N.md)。本轮保留现有并行改动，不修改 Plane 项目。

## 2. Plane 参考与职责边界

参考根目录：`/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/plane`。已核对以下源码链路，浏览器视觉证据由配套页面计划单独采集：

- `apps/web/core/components/issues/issue-layouts/roots/project-layout-root.tsx`：布局切换、筛选与 peek overview。
- `.../list/block.tsx`：工作项行、编号、属性、选择、子项展开。
- `.../kanban/kanban-group.tsx → blocks-list.tsx → block.tsx`：列、卡片列表、单卡及拖放反馈。
- `.../properties/all-properties.tsx`：List/Board 共享属性。
- `.../filters/header/display-filters/`：显示属性、分组、子分组、排序、空组。

借鉴信息结构与交互目标，用 EasyuseUI 组件独立实现。公共组件不导入 Plane 的 MobX store、路由、鉴权、API 或页面数据。

组件负责受控展示、操作意图和可访问交互；调用方负责实体存储、查询、权限、工作流规则、排序权威、写入和持久化。纯本地示例适配器可以直接更新内存，但必须明确其演示性质。

### 2.1 时间线与日历源码补充核对

2026-10-09 核对本地 Plane `1fec307f91`，以下源码目录及日历 store 无未提交改动。路径均相对上述 Plane 根目录；结论来自源码，不代表已完成登录态浏览器视觉对照。

| 来源路径 | 已核对行为 | EasyuseUI 采用范围 |
| --- | --- | --- |
| `apps/web/core/components/issues/issue-layouts/gantt/base-gantt-root.tsx` | 组合图表与工作项侧栏；非分组分页；分别控制平移、左右调整、选择和重排，手动排序才开放重排 | 通用时间线容器加 WorkItem 适配；日期编辑与行重排分别授权 |
| `apps/web/core/components/gantt-chart/root.tsx`、`chart/header.tsx`、`data/index.ts`、`chart/views/` | 周/月/季度刻度、今天定位、全屏、左右结构及时间网格 | 三档刻度、今天定位和工作区展开；不照搬 Plane 的固定像素宽度 |
| `apps/web/core/components/gantt-chart/blocks/block.tsx`、`helpers/blockResizables/use-gantt-resizable.ts` | 有一个端点即可显示，有两个端点才允许整条平移；左右手柄分别调整日期 | 显式表达缺失端点，不把单日期伪装为完整工期；提供键盘替代 |
| `apps/web/core/components/issues/issue-layouts/gantt/blocks.tsx` | 工作项条与侧栏编号/标题、预览、详情导航 | 复用 WorkItemIdentifier/Properties/Detail，条内内容保持紧凑 |
| `apps/web/core/components/issues/issue-layouts/calendar/base-calendar-root.tsx` | 按可见范围查询，以 `target_date` 分组，月/周采用不同分页大小，每日可继续加载 | Calendar 默认按 dueDate 定位；每日独立分页，不以当前加载数冒充总数 |
| `apps/web/core/components/issues/issue-layouts/calendar/calendar.tsx`、`header.tsx`、`dropdowns/options-dropdown.tsx` | 月/周、前后翻页、月份选择、今天、周末显隐；窄屏选日期后看当日条目 | 月/周与当日 Agenda；提供与桌面等价的日期修改入口 |
| `apps/web/core/components/issues/issue-layouts/calendar/day-tile.tsx`、`utils.ts` | 拖放只更新 `target_date`，目标截止日不能早于 start_date | Calendar 改截止日与 Timeline 整段平移采用不同命令 |
| `apps/web/core/components/issues/issue-layouts/calendar/issue-blocks.tsx`、`quick-add-issue-actions.tsx` | 日期格内新增预填截止日；按日加载更多；可给无截止日的已有项补日期 | 新建草稿和未排期项安排日期都必须显式触发 |
| `apps/web/core/store/issue/issue_calendar_view.store.ts` | 活跃月/周、周起始偏好和可见日期范围 | 日期视口受控，周首日、时区和本地化不混入业务日期值 |

Plane Gantt 根组件还传递 `enableDependency` 和 `updateBlockDates` 接口；本次不据此宣称已验证完整依赖调度。依赖连线、约束传播、自动排期和关键路径单列后续研究，不属于 W6–W9 的完成要求。Calendar 参考的是截止日聚合，并非按小时预约或多日事件日程表。

## 3. 组件清单与层次

| 编号 | 组件/模块 | 层级与职责 | 首版范围 |
| --- | --- | --- | --- |
| W01 | GroupHeader / GroupedList | blocks；分组标题、计数、折叠、操作、数据态 | 必须 |
| W02 | Board / BoardColumn / BoardItem | blocks；通用列、条目容器、滚动、落点及状态 | 必须；不依赖 WorkItem 模型 |
| W03 | AvatarGroup / PropertyOverflow | ui 或属性栏内部；负责人堆叠、+N及展开 | 按 W05 实际复用需求公开 |
| W04 | WorkItemIdentifier | 工作项编号与导航呈现 | 必须；href 由调用方提供 |
| W05 | WorkItemProperties | blocks；共享显示顺序、显隐、溢出和只读/编辑 | 必须 |
| W06 | WorkItemStatePicker / PriorityPicker / AssigneePicker / LabelPicker / DueDateField | blocks；基于现有 Select/Combobox/Popover/Input | 必须；状态单选、负责人/标签多选，日期先用原生字段 |
| W07 | WorkItemRow | blocks；列表行身份、主目标、属性与选择 | 必须 |
| W08 | WorkItemCard | blocks；编号、标题、属性、菜单及拖动状态 | 必须 |
| W09 | WorkItemList / WorkItemBoard / WorkItemTable | blocks；将同一数据与能力装配为三种视图 | 必须；Table 复用 DataTable |
| W10 | WorkItemsToolbar / WorkItemsDisplayOptions | blocks；搜索、布局、筛选、分组、排序、字段显隐 | 必须；复用 FilterToolbar/Segmented/Popover |
| W11 | WorkItemQuickCreate / WorkItemDetail | blocks；创建草稿、受控详情快照、字段编辑 | 必须；富文本/附件上传后续再扩展 |
| W12 | WorkItemsWorkspace | blocks；Shell、当前视图、详情的组合入口 | 必须；路由和数据服务仍归适配层 |
| W13 | Swimlane / 子项展开 / BatchActions | 分组扩展与业务操作模式 | 第二阶段；首版仅选择，不承诺批量写入 |
| W14 | Timeline / TimelineAxis / TimelineRow / TimelineBar | blocks；通用时间刻度、行与时间条，接收 IDs、日期和渲染插槽，不依赖 WorkItem | 已实施；周/月/季度、今天定位、边界裁切 |
| W15 | WorkItemTimeline | blocks；侧栏编号/属性、时间条、日期修改意图与详情 | 已实施；平移、两端调整、单端日期和未排期项 |
| W16 | Calendar / CalendarHeader / CalendarDay / CalendarAgenda | blocks；月/周日期格、当日条目、溢出与分日数据态；不作为 DatePicker | 已实施；周首日、周末显隐、今天、范围切换 |
| W17 | WorkItemCalendar / WorkItemCalendarEntry | blocks；截止日映射、条目属性、按日新增和改截止日 | 已实施；共享属性、详情、权限与分页 |
| W18 | WorkItemDateRangeField / ScheduleChangeIntent | blocks 日期字段组合与 lib 命令契约；复用 Field/Input/Popover | 已实施；开始/截止成对校验、改期表单和键盘替代 |
| W19 | UnscheduledWorkItems / ScheduleViewControls | blocks；未排期队列、时间范围与刻度控制，组合既有 Toolbar | 已实施；不复制工作项存储和筛选逻辑 |

公开组件放 `components/ui/` 或 `components/blocks/`，示例适配放 `components/examples/`，页面仅装配。建议模型文件用 `lib/work-items-model.ts`，分组辅助用 `lib/work-items-view.ts`，保持与组件文件 basename 不同。

## 4. 模型与受控接口

实际接口见 `lib/work-items-model.ts`、`lib/schedule-view-model.ts` 与 [WORK-ITEMS.md](../WORK-ITEMS.md)。W6 增加可选 startDate、日期视口、原子改期意图及兼容迁移；layout 支持 list/board/table/timeline/calendar。下表为接口概览。

| 模型 | 最小信息 | 责任 |
| --- | --- | --- |
| WorkItemRecord | id、projectId、identifier、title、stateId、priorityId、assigneeIds、labelIds、dueDate、可选 startDate、parentId、可选计数、revision | 调用方提供完整或明确标注部分的快照；兼容旧记录 |
| WorkflowStateDefinition | id、label、color、可选类别/图标 | 项目自定义工作流；不固定为五个状态 |
| WorkItemsViewState | layout、filters、groupBy、subGroupBy、sort、visibleProperties、showEmptyGroups；可选 timeline/calendar 视口 | 外部受控；不内置 URL/localStorage；各布局设置独立保留 |
| WorkItemsInteraction | selectedIds、activeItemId、collapsedGroupIds | 选择、详情和折叠独立于数据 |
| GroupSnapshot | key、label、itemIds、totalCount可空、loadedCount、hasMore、cursor、dataState、error | 调用方分页；未知总数不补0 |
| WorkItemCapabilities | canCreate、canEditField、canMove、可用操作及不可用原因 | UI 能力输入；不能替代服务端授权 |
| MutationState | operationId、itemId、pending/confirmed/rejected/unknown、error、版本关联 | 适配层保留，卸载不清除未知结果 |
| ScheduleViewport | anchorDate、rangeStart/rangeEnd、timeZone、weekStartsOn；Timeline scale=week/month/quarter；Calendar mode=month/week、showWeekends、selectedDate | 日期视口与当前工作项选择分离；范围边界统一为含首尾日期 |
| ScheduleChangeIntent | operationId、itemId、baseRevision、queryKey、kind、previousDates、nextDates | kind 区分 shift/resizeStart/resizeEnd/setDueDate/setRange/clearDates；每次确认发送一个完整意图 |
| DateBucketSnapshot / ScheduleRangeSnapshot | 日期/范围、queryKey、itemIds、loadedCount、totalCount可空、cursor、hasMore、dataState、error | 调用方分页和范围查询，日历按日恢复，时间线按行/范围恢复 |

- 工作项业务状态与 `RuntimeStatus` 分开；关联 Agent 的执行状态仅为可选附加信息，复用 RuntimeStatusBadge 展示。
- `onPatchItem`、`onCreateItem`、`onMoveItem` 等回调表达意图；响应明确拒绝才回滚，结果未知显示待确认并调用查询能力，不能将任意 Promise resolve 当作业务完成。
- 所有派生视图引用同一 itemId；多值分组的显示实例使用 itemId + groupKey，勾选仍按实体 ID 去重。
- 默认接收调用方算好的组与排序。为本地示例提供可选纯函数辅助，远程分页场景不得根据当前一页重新计算全量分组总数。
- groupBy/过滤变化关联 queryKey 或 generation；丢弃迟到分页响应，保留重复 ID 去重和服务器顺序，不以数组下标当 ID。

### 4.1 日期模型与兼容迁移

- 扩展 `WorkItemField`、`WorkItemPatch`、属性显隐、详情和可选新建预填字段，使 startDate 与 dueDate 使用同一受控修改链。旧输入的 `startDate?: string | null` 在适配边界规范化为 null；旧视图缺少 timeline/calendar 配置时应用确定默认值，不改写已有 dueDate。
- 日期统一为经过合法性校验的 `YYYY-MM-DD` 日历日期，null 表示未设置；服务映射 Plane `start_date → startDate`、`target_date → dueDate`。不把日期字符串先转成 UTC 时间再按本地时间取日，不用24小时毫秒差代替日历天差。
- 区间包含首尾，startDate=dueDate 是合法一天任务。结束不得早于开始；非法历史数据保留可见并给出修正入口，不静默交换端点。今天/逾期按显式 timeZone 推导，示例时钟固定。
- Timeline 整段平移同时修改两端并保留日历天工期；左/右调整只改对应端点。Calendar 改期只改 dueDate，若早于 startDate 则阻止并解释，不能暗中移动开始日。单端日期只允许显式补全或改已有端点。
- 日期修改逐字段检查 `canEditField`，整段平移要求两端均可修改；新建另查 canCreate，行重排沿用既有排序能力。Timeline 纵向移动不改变业务状态或负责人。
- 调用方处理成对日期的一次业务提交与并发版本校验；不能在组件内拆成两个互相独立、可能部分成功的字段请求。超时/断连进入 unknown，保留旧快照及待确认日期，不再次写入直至对账；结果需作用于同一 itemId/operationId/revision。
- 远程 Timeline 查询包含与范围相交的任务，而非只查开始日位于范围内的任务；单端和未排期记录有明确附加查询策略。Calendar 按截止日查询可见整周范围，包括跨月补齐格；与未排期队列共享 itemId 去重。

## 5. 视觉与交互契约

### 5.1 Row 与 Card

- Row 建议紧凑最小40px，触摸/换行允许增长；编号和标题居左，属性靠右。低优先级属性不足宽度时收入溢出区，关键失败/等待信息不隐藏。
- Card 初始列宽320px、padding12px、内容间距8px、圆角8px、中性表面和细边框；标题默认最多两行，完整标题可通过焦点提示或详情阅读。
- Board 卡片代表独立可移动对象，可使用卡片结构；List 使用行和分隔，不嵌套装饰 Card。
- 主链接、Checkbox、属性编辑、更多操作及拖动把手是兄弟目标。现有 Item 的 leading 在主按钮内部，不能直接放 Checkbox；需要在正确层级组合或向后兼容扩展插槽。
- DataTable 的 primary cell 会包入激活按钮，Table 适配不能把可点击属性嵌在该 cell 内；主列只放标题/编号等非交互内容。
- 选择、焦点、查看中、拖动、写入等待、只读和字段错误分别呈现。普通导航链接支持新标签打开，peek 操作由调用方决定。

### 5.2 共享属性

- WorkItemProperties 接收 visibleProperties、layout、完整 record、选项目录、能力和字段回调，避免 Row/Card/Table 各自维护字段规则。
- 状态和优先级同时有文字与图标语义；负责人多选复用/补齐 Combobox 包装，而非仅凭底层 API 存在就声明交互已支持。
- 标签默认限量展示并给出 +N，展开可查看/编辑全部；只读和编辑入口分开。
- 日期遵循4.1的日历日期与时区契约。既有日期输入保持原生字段；新增 Calendar 是工作项布局，与弹出式日期选择器分开，不要求先建设复杂 DatePicker。
- 子项/附件/链接计数未知显示“—”，真实0按显示配置决定是否省略；不为没有回调的计数制造可点击外观。
- 字段保存失败保留草稿与错误，已确认的其他字段继续可读；切换对象按 ID 丢弃旧详情响应。

### 5.3 GroupedList 与 Board

- 每组支持加载/空/部分/失败/成功，加载更多失败仅影响该组；刷新失败保留旧条目。组头显示“已加载/总数”或明确加载数，不混为全量计数。
- 分组折叠不清选择；默认全选只针对已加载且可选择的可见条目，保留隐藏选择并提示数量。全查询选择需消费方单独提供能力。
- Board 提供横向滚动、组头、空列新增、折叠、加载更多和滚动边界；第一版采用单一明确纵向滚动模型，避免嵌套滚动陷阱。
- 分组定义及顺序受控；用户不能拖列就修改工作流定义。重排列为后续显式能力。
- 通用 Board 用 `getItemId`、groups、renderItem、canMove、onMove 等接口，不导入工作项状态或字段。
- 列表层级后续使用独立的展开/选择契约，不能直接把现有单选 Tree 变成多选树。

### 5.4 拖放、排序与写入

- 首版支持状态、优先级等单值分组跨组移动；负责人/标签多值分组先只读，不能自动推断添加、移除或替换集合。
- 手动排序时支持同组重排；按日期/优先级等自动排序时禁用自由位置排序，跨组修改后按现有规则重新排序。
- MoveIntent 包含 itemId、来源/目标组、目标前后邻居 ID、baseRevision、operationId；不用当前可见数组索引代表服务端全局顺序。
- 未加载边界或跨分页位置无法明确时，只允许可确定的邻居落点，或交给调用方明确的追加命令；禁止猜测未加载项排序。
- 指针落点、触屏操作与键盘“移动到组/上移/下移”调用同一权限与规则。Escape 取消，成功播报目标，失败保持焦点可定位。
- 拖动临时位置是展示态，不提前修改权威记录。明确拒绝恢复，超时/断线保留 unknown，先查询后重试；重挂载不得绕过锁定。
- 锁定只作用相关条目/操作，不能因一项失败冻结整个工作区。并发变化通过版本冲突处理，不以回滚覆盖新快照。

### 5.5 Timeline 时间线布局

- Timeline 表达任务排期，与已有 ActivityTimeline 的事件时间线不同。左侧固定编号/标题和可选属性，右侧时间轴与日期网格；两侧共用行高与垂直滚动，轴头吸顶，横向滚动仅发生在时间区域，窄屏可收窄侧栏。
- 首版包含周/月/季度三种刻度、今天标记与定位、前后范围导航、可选展开视图。切换刻度保留日期锚点和选中项，不把工作项拖动位移解释为刻度单位；写入始终按完整日历日吸附。
- 完整区间展示时间条，跨范围条在边缘裁切并标明延伸方向，完整日期可通过焦点提示或详情读取。单端只标示已知端点及“缺少开始/截止日期”，不生成假工期；完全无日期的行保留并提供安排日期入口。
- 拖动条身平移，左右手柄改变对应日期，拖动中显示预览日期和天数；松手才发意图，Escape 取消。鼠标、触屏和“修改排期”表单共享同一校验；季度刻度下也提供可精确指定日期的表单。
- 已实现行最小44px、时间条视觉高度24px；焦点和操作使用独立命中区，粗指针模式调整为至少44px且不重叠。只读时无拖动光标和手柄，状态用文字/图标与共享颜色表达。
- 手动排序才开放行重排，日期平移与行重排具有不同把手和命令；其他排序下日期更新后由调用方重新排序。第一版时间线采用平铺行，不将 Board 泳道/分组条件直接套入日期轴。
- 行分页、范围加载、无排期、过滤无匹配、部分记录缺失分别表达；读取失败保留轴和已加载条。切换日期范围、排序或筛选增加 generation，旧响应不得覆盖新视口。

### 5.6 Calendar 日历布局

- 首版为月/周布局，按 dueDate 将任务展示一次；有开始和截止的任务仍只在截止日出现。多日横条、小时网格、会议、重复规则和资源预约另立后续范围。
- Header 提供前后月/周、月份选择和今天；周首日受控，周末可显隐，今天、选中日和当前查看项各有独立视觉。跨月日期弱化但可访问，点击日期只选日期，不自动创建或修改任务。
- 日期格内为 WorkItemCalendarEntry，复用编号、标题、状态和属性，不直接塞入完整 Board 卡片。预留数量与新增入口；溢出显示可展开的“更多/加载更多”，区分已载入但折叠与远程尚未加载。
- 按日维护数据态、分页游标和计数；总数未知显示已加载数。隐藏周末后仍能通过“周末任务”入口/当日 Agenda 找到任务，未安排截止日的项进入明确的未排期队列；都不能被解释为任务不存在。
- “在此日新增”只预填草稿 dueDate，保存才创建；安排已有未排期项只改日期，不重复建任务。拖到其他日期与详情中的截止日修改共用命令，不平移 startDate，也不改变组内排序。
- 窄屏采用日期选择加当日 Agenda 的模式，沿用 Item/列表而非挤压七列完整卡片。触屏和键盘可用“更改截止日”完成与拖动等价的操作；无日期项也可直接安排或保持未排期。
- 日期网格采用可访问的焦点模型：方向键移日/周、Home/End移到周首/尾、PageUp/PageDown翻月、Enter选日；日期内条目通过明确入口进入，Escape返回日期。只有完整支持网格键盘行为后才使用 grid 角色，避免数百条目进入默认 Tab 顺序。

### 5.7 五布局协作

List/Board/Table/Timeline/Calendar 共用 records、筛选、selectedIds、activeItemId、详情和写入状态。日期改动在所有视图反映，切换布局不提交草稿、不重置未知结果。Timeline/Calendar 的锚点、刻度、选中日期和滚动位置各自保留；日期窗口外仍选中的工作项给予说明，不偷偷替换选中对象。

原有 groupBy/subGroupBy 在日期布局中保留配置但不生效，返回 List/Board时恢复。日期范围是视口条件，与业务筛选分开呈现；Calendar 月/周、Timeline 刻度不能冒充业务状态。Workspace 工具栏只开放已实现布局。

## 6. 实施阶段

| 阶段 | 优先级/依赖 | 下一动作 | 验收出口 |
| --- | --- | --- | --- |
| W0 契约与技术验证 | P0，无 | 固定模型/API/分组语义；验证 Item/Combobox/DataTable组合；选择能覆盖触屏/键盘的拖动方案 | 无嵌套交互目标；确定命令、分页与未知结果边界；最小安装验证 |
| W1 属性与单条展示 | P0，W0 | W03–W08、基础详情；覆盖长标题、多标签、多负责人、只读和字段错误 | Row/Card共享字段行为、主题和语言；无虚构计数/状态 |
| W2 分组列表与Table | P0，W1 | GroupedList、WorkItemList/Table、Toolbar/DisplayOptions、QuickCreate | 分组/排序/属性切换一致；查看/多选分离；五态可恢复 |
| W3 Board编辑闭环 | P0，W1/W2 | 通用 Board、WorkItemBoard、列内排序/跨组移动、键盘替代 | 指针/键盘同语义；分页边界、权限、拒绝/unknown均覆盖 |
| W4 Workspace与分发 | P0，W2/W3 | WorkItemsWorkspace、完整示例、Manifest/Registry/安装回归 | 三布局共享快照与操作；独立安装可用；现有组件无回归 |
| W5 复杂场景增强 | P1，W4；已完成 | 泳道、子项、批量操作、保存视图接口、可选屏外延迟与索引缓存 | 五项独立验收通过；18 次性能观察保留改善与退化，服务及大数据限制见实施记录 |
| W6 日期与视口契约 | P0，W4/W5；已完成 | W18、日历日期工具、startDate兼容、ScheduleChangeIntent、范围查询与视图序列化 | 旧数据/保存视图继续工作；成对改期、缺失日期、DST与unknown契约固定 |
| W7 Timeline 组件 | P0，W6；已完成 | W14/W15，侧栏与时间轴、三档刻度、平移/两端调整、未排期入口 | 跨月/跨年裁切正确；拖动和表单同语义；只读、分页、并发与键盘恢复通过 |
| W8 Calendar 组件 | P0，W6；已完成 | W16/W17/W19，月/周、当日Agenda、按日分页、周末与未排期队列 | 按截止日归组；修改只影响截止日；逐日数据态、窄屏和键盘通过 |
| W9 五布局展示与分发 | P0，W7/W8；已完成 | Workspace/URL/保存视图兼容，补充页面计划、组件示例、Blog、Manifest/Registry与安装验收 | 五布局共享选择与写入；时间布局独立安装及展示证据齐全；旧三布局回归通过 |

首版完成定义为 W0–W4。W5 不提前显示可操作占位入口，不将后续能力计入首版验收。通用 Board 另以非 WorkItem 条目演示，证明无业务绑定。

上述首版定义保留原交付范围。五布局补齐完成定义为 W6–W9 全部通过，不能用 W0–W5 的旧结果代替。W7/W8 共享 W6 的日期模型，可分别实现和验收；公开布局切换入口与各自可用实现同时交付。

### 6.1 新增文件与展示落点

| 落点 | 计划改动 |
| --- | --- |
| `lib/work-items-model.ts`、`lib/work-items-view.ts` | 扩展日期字段、布局联合类型、权限/排序、过滤和旧保存视图规范化；沿用既有写入状态 |
| `lib/schedule-date-utils.ts`、`lib/schedule-view-model.ts` | 新增无路由依赖的日期运算、视口/区间/按日快照类型；模型文件名与组件不同 |
| `components/blocks/timeline.tsx`、`calendar.tsx` 及 CSS Modules | 新增通用排期与日历容器；不依赖 WorkItem、MobX或Plane服务 |
| `components/blocks/work-item-timeline.tsx`、`work-item-calendar.tsx`、`work-item-date-range-field.tsx` | 新增业务适配、日期编辑与统一操作意图；共用现有属性/详情 |
| `components/blocks/work-items-toolbar.tsx`、`work-items-workspace.tsx` | 五布局组合和布局特有控制；保留原布局配置与选择 |
| `components/examples/` 内现有 Work Items 示例适配器 | 固定日期、跨范围和异常fixtures、统一内存回执、查询参数与旧保存视图升级 |
| `plans/work-items-showcase-plan.md`、现有 Work Items Blog 与实施记录 | W9补充 Timeline/Calendar 场景、截图、日期与交互证据；保留 S0–S5 的已完成范围 |

页面沿用 `/examples/work-items/`，新增 `layout=timeline&scale=month&date=2026-10-09` 和 `layout=calendar&mode=month&date=2026-10-09`。参数由页面适配器白名单解析，非法日期回退到明确基准；保存视图需兼容旧三布局，尚未支持的协议值不得导致空白页。组件目录分别提供通用非工作项示例和 WorkItem 组合示例。

## 7. 分发、测试与交付

- 每个公开组件具备示例、API、Manifest、Registry、词典实现标记与完整 CSS/lib/i18n 依赖；内部零件明确归属父项，不机械拆成数十个安装包。
- 使用当前 `lib/component-manifest.ts`、`components/docs/demo-loader.tsx` 和 Registry 工作流；文档目录不静态挂载所有重型视图。自动生成索引通过脚本更新。
- 测试覆盖空/部分分组、重复/迟到分页、隐藏选择、字段失败、自动排序、分页落点、跨组冲突、unknown对账和权限变化。
- 代表性组合覆盖深浅主题、中文/英文、1440/1024/390px、键盘/触摸、读屏名称、reduced-motion；Portal继承ThemeBoundary。
- 运行 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm check:i18n`、`pnpm check:manifest`、浏览器测试及 `pnpm test:install`，并实际操作独立消费项目的列表/看板。
- 记录50/200/1000项的分组、选择、字段更新与移动测量，先建立基线再决定窗口化。不得为了虚拟化破坏焦点、拖放、阅读顺序与可访问计数。
- 开始构建/服务前检查3010/3011进程归属，使用Webpack；必要时在携带完整改动的隔离副本验证，保留共享工作。

交付分别记录源码实现、浏览器行为、独立安装和真实服务接入。首版不提供真实服务证据；由消费项目在权限、回执和持久化接入后另行验收。

### 7.1 时间布局新增验收矩阵

| 场景 | 必须验证的结果 |
| --- | --- |
| 日期合法性 | 闰年2月、跨月/跨年、DST、UTC正负偏移、非法日期；显示和写入无偏移，同日工期为一天 |
| 日期缺失与历史异常 | 两端空、仅开始、仅截止、结束早于开始均可定位；不伪造工期，修改前校验 |
| Timeline 几何 | 三档刻度、今天定位、长区间裁切、横纵滚动同步；缩放保留锚点，左右手柄不误作整条平移 |
| Calendar 边界 | 月/周、周首日切换、跨月补齐格、周末隐藏后任务仍可达；无截止日不会静默消失 |
| 日期写入语义 | 平移保持工期、resize只改一端、日历只改截止；跨布局立即反映同一确认快照 |
| 权限与无变化 | 只允许改一端时禁止平移；只读、拖回原日、Escape取消不发修改请求 |
| 冲突与未知结果 | 拒绝保留草稿/恢复预览，unknown跨布局保留锁定；先对账，不拆两端请求造成半成功 |
| 范围查询与分页 | 包含横跨整个视口的任务；按日加载失败局部重试；迟到/重复响应不污染新范围，无虚构总数 |
| 可访问与窄屏 | 纯键盘完成选日、查看、改期和关闭；390px Agenda/改期表单可用，焦点归还，中英/深浅主题一致 |
| 兼容与规模 | 旧记录/旧URL/旧保存视图继续工作；50/200/1000项测量日期运算、视口切换与布局成本，不直接套用W5指标 |

新增纯日期/命令测试、Timeline/Calendar浏览器场景及独立安装操作；验证日期变更在五布局和详情一致。组件展示的截图分别覆盖月/周日历、三档时间线、未排期、只读和保存异常。参考源码事实、EasyuseUI实现证据与真实服务验收分开记录。

本轮 W6–W9 的实际验证、18 次测量和截图来源见[实施记录](./work-items-implementation-log.md#w6w9-日期与五布局补齐)。W0–W5 的历史结果和原始来源 ID 保留。
