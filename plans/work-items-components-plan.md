# Work Items 通用组件与展示模式建设计划

日期：2026-10-08
状态：首版 W0–W4 已实施并完成本地行为与独立安装验收；W5 待实施。见[实施记录](./work-items-implementation-log.md)。
配套：[Work Items 示例页面展示计划](./work-items-showcase-plan.md)。

## 1. 目标与现有基础

建设共享数据、共享属性、不同布局的 Work Items 组件体系。第一版提供 List、Board、Table，既能表达项目任务，也能通过通用 GroupedList/Board 支撑 Ideas、审批队列等场景。

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

公开组件放 `components/ui/` 或 `components/blocks/`，示例适配放 `components/examples/`，页面仅装配。建议模型文件用 `lib/work-items-model.ts`，分组辅助用 `lib/work-items-view.ts`，保持与组件文件 basename 不同。

## 4. 模型与受控接口

以下名称为契约草案，在 W0 阶段结合实际组件类型固定，不作为已存在 API。

| 模型 | 最小信息 | 责任 |
| --- | --- | --- |
| WorkItemRecord | id、projectId、identifier、title、stateId、priorityId、assigneeIds、labelIds、dueDate、parentId、可选计数、revision | 调用方提供完整或明确标注部分的快照 |
| WorkflowStateDefinition | id、label、color、可选类别/图标 | 项目自定义工作流；不固定为五个状态 |
| WorkItemsViewState | layout、filters、groupBy、subGroupBy、sort、visibleProperties、showEmptyGroups | 外部受控；不内置 URL/localStorage |
| WorkItemsInteraction | selectedIds、activeItemId、collapsedGroupIds | 选择、详情和折叠独立于数据 |
| GroupSnapshot | key、label、itemIds、totalCount可空、loadedCount、hasMore、cursor、dataState、error | 调用方分页；未知总数不补0 |
| WorkItemCapabilities | canCreate、canEditField、canMove、可用操作及不可用原因 | UI 能力输入；不能替代服务端授权 |
| MutationState | operationId、itemId、pending/confirmed/rejected/unknown、error、版本关联 | 适配层保留，卸载不清除未知结果 |

- 工作项业务状态与 `RuntimeStatus` 分开；关联 Agent 的执行状态仅为可选附加信息，复用 RuntimeStatusBadge 展示。
- `onPatchItem`、`onCreateItem`、`onMoveItem` 等回调表达意图；响应明确拒绝才回滚，结果未知显示待确认并调用查询能力，不能将任意 Promise resolve 当作业务完成。
- 所有派生视图引用同一 itemId；多值分组的显示实例使用 itemId + groupKey，勾选仍按实体 ID 去重。
- 默认接收调用方算好的组与排序。为本地示例提供可选纯函数辅助，远程分页场景不得根据当前一页重新计算全量分组总数。
- groupBy/过滤变化关联 queryKey 或 generation；丢弃迟到分页响应，保留重复 ID 去重和服务器顺序，不以数组下标当 ID。

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
- 日期是日历日期字符串，明确时区和过期计算边界，不通过 UTC 转换导致日期偏移。第一版不以复杂 Calendar 为依赖。
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

## 6. 实施阶段

| 阶段 | 优先级/依赖 | 下一动作 | 验收出口 |
| --- | --- | --- | --- |
| W0 契约与技术验证 | P0，无 | 固定模型/API/分组语义；验证 Item/Combobox/DataTable组合；选择能覆盖触屏/键盘的拖动方案 | 无嵌套交互目标；确定命令、分页与未知结果边界；最小安装验证 |
| W1 属性与单条展示 | P0，W0 | W03–W08、基础详情；覆盖长标题、多标签、多负责人、只读和字段错误 | Row/Card共享字段行为、主题和语言；无虚构计数/状态 |
| W2 分组列表与Table | P0，W1 | GroupedList、WorkItemList/Table、Toolbar/DisplayOptions、QuickCreate | 分组/排序/属性切换一致；查看/多选分离；五态可恢复 |
| W3 Board编辑闭环 | P0，W1/W2 | 通用 Board、WorkItemBoard、列内排序/跨组移动、键盘替代 | 指针/键盘同语义；分页边界、权限、拒绝/unknown均覆盖 |
| W4 Workspace与分发 | P0，W2/W3 | WorkItemsWorkspace、完整示例、Manifest/Registry/安装回归 | 三布局共享快照与操作；独立安装可用；现有组件无回归 |
| W5 复杂场景增强 | P1，W4 | 泳道、子项、批量操作、保存视图接口、大数据优化 | 各增强独立验收，未交付不阻碍首版范围说明 |

首版完成定义为 W0–W4。W5 不提前显示可操作占位入口，不将后续能力计入首版验收。通用 Board 另以非 WorkItem 条目演示，证明无业务绑定。

## 7. 分发、测试与交付

- 每个公开组件具备示例、API、Manifest、Registry、词典实现标记与完整 CSS/lib/i18n 依赖；内部零件明确归属父项，不机械拆成数十个安装包。
- 使用当前 `lib/component-manifest.ts`、`components/docs/demo-loader.tsx` 和 Registry 工作流；文档目录不静态挂载所有重型视图。自动生成索引通过脚本更新。
- 测试覆盖空/部分分组、重复/迟到分页、隐藏选择、字段失败、自动排序、分页落点、跨组冲突、unknown对账和权限变化。
- 代表性组合覆盖深浅主题、中文/英文、1440/1024/390px、键盘/触摸、读屏名称、reduced-motion；Portal继承ThemeBoundary。
- 运行 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm check:i18n`、`pnpm check:manifest`、浏览器测试及 `pnpm test:install`，并实际操作独立消费项目的列表/看板。
- 记录50/200/1000项的分组、选择、字段更新与移动测量，先建立基线再决定窗口化。不得为了虚拟化破坏焦点、拖放、阅读顺序与可访问计数。
- 开始构建/服务前检查3010/3011进程归属，使用Webpack；必要时在携带完整改动的隔离副本验证，保留共享工作。

交付分别记录源码实现、浏览器行为、独立安装和真实服务接入。首版不提供真实服务证据；由消费项目在权限、回执和持久化接入后另行验收。
