# 通用组件补齐计划

日期：2026-10-08  
状态：G0–G5 已实现并通过本地自动验证；C16采用原生滚动。既有Canvas冷启动预算尚未达标，人工读屏和真实业务服务接入不在本轮完成范围。  
配套：[Sales CRM Companies 复刻计划](./sales-crm-replication-plan.md)。

## 1. 目标与边界

以 Sales CRM Companies 页面验证通用组件的完整性，补齐表格、选择器、浮层、表单与小型可视化，使它们同时可用于 Agent、Session、工具和其他业务管理页面。

依照 [设计规则](../Design-rules.md)、[组件契约](../Component-Specification.md)、[模式](../UI-PATTERNS.md)、[状态](../UI-STATES.md) 和 [国际化约定](../I18N.md) 实施。承接 [优化计划](./optimization-and-blog-plan.md) 的基础组件任务，不重复建设已经落地的 Manifest、受控布局或主题边界。

通用组件不导入 Companies 类型、站点内容、Next 路由或 CRM store。数据请求、筛选规则、业务状态、CSV 导出和持久化属于调用方。复刻页面只组装组件和业务数据，不另写相同交互控件。

## 2. 当前基础与补齐范围

已核实当前工作区具有 Button、Input、Badge、Tag、Chip、Dialog、Item、DataRegion、Tree、Inspector、受控 WorkspaceShell、ThemeBoundary。它们的公开能力仍需在实施开始时复核，不能以正在修改的源码代替已通过验证的交付状态。

| 编号 | 待补能力 | 建议层级/路径 | 目标 |
| --- | --- | --- | --- |
| C01 | Checkbox | `components/ui/checkbox.tsx` | checked、unchecked、indeterminate、disabled |
| C02 | Table | `components/ui/table.tsx` | 原生表格结构、对齐、密度、滚动适配 |
| C03 | DataTable | `components/blocks/data-table.tsx` | 受控行选择、查看行、排序请求、汇总槽位和数据态 |
| C04 | Tabs | `components/ui/tabs.tsx` | 同对象面板切换，完整键盘模型 |
| C05 | Select | `components/ui/select.tsx` | 单选字段、占位、分组、禁用、表单关联 |
| C06 | DropdownMenu | `components/ui/dropdown-menu.tsx` | 动作与 radio/checkbox 菜单项 |
| C07 | Avatar | `components/ui/avatar.tsx` | 图片、缩写、失败回退与可访问名称 |
| C08 | Sheet | `components/ui/sheet.tsx` | 左/右/底部抽屉、焦点管理、固定首尾及正文滚动 |
| C09 | SegmentBar | `components/ui/segment-bar.tsx` | 只读区间量值、分段显示、数值说明 |
| C10 | Sparkline | `components/ui/sparkline.tsx` | 首版微型柱状趋势，缺失/空/等值数据处理 |
| C11 | Popover | `components/ui/popover.tsx` | 锚定补充内容、碰撞处理、焦点与关闭策略 |
| C12 | CommandPalette / Kbd | `components/blocks/command-palette.tsx`、`components/ui/kbd.tsx` | 搜索结果、命令分组、键盘选择、快捷键呈现 |
| C13 | Field / FormSection | `components/ui/field.tsx`、`components/blocks/form-section.tsx` | label、描述、错误、分组和表单关联 |
| C14 | Slider | `components/ui/slider.tsx` | 受控数值、步长、键盘、读屏和触摸 |
| C15 | ImageUpload | `components/blocks/image-upload.tsx` | 选择/拖放、预览、替换、移除、读取失败恢复 |
| C16 | ScrollArea | `components/ui/scroll-area.tsx` | 可选统一滚动条；不承担窗口化 |
| C17 | ResizableSidebar | 扩展 WorkspaceShell，必要时抽出 ResizeHandle | 左栏受控宽度与可配置边界，复用现有分隔条语义 |
| C18 | FilterToolbar | `components/blocks/filter-toolbar.tsx` | 组合筛选、排序、计数与移动端筛选容器 |
| C19 | MetricSummary / RatingDisplay | `components/blocks/metric-summary.tsx`、`components/ui/rating-display.tsx` | 指标名/值/单位、只读评分及文本替代 |

首版不增加复杂 DataGrid、列拖拽、单元格编辑、Calendar、分页、通用图表平台或动画播放器。Combobox 可作为 Select 后续增强；固定选项不以新增可搜索组件为前置条件。通用 Toast、Alert、Breadcrumb 继续归优化计划按实际场景推进。

## 3. 共同实现契约

- Foundation → Primitive → Pattern → Workspace → Page；默认 Compact、4px 网格、32px 输入/按钮、粗指针命中至少44px。
- 优先检查已安装 Base UI 的类型与示例，复用对应无障碍行为；不照搬参考项目的 Radix API，不为相同能力并列引入两套交互基础库。实施新增框架代码前阅读安装版本 Next.js 指南。
- 可编辑值使用 value/defaultValue/onChange 或明确对应接口；列表数据、行选择、业务写入结果由调用方控制。只在 uncontrolled 模式维护内部值。
- 所有 Portal 接入 ThemeBoundary；局部颜色、密度、语言不会丢失到 body。两个主题实例同时存在必须可用。
- 内置文字进入组件 i18n，示例说明归站点资源；切换语言保留值、焦点、选中行和草稿，调用方数据不擅自翻译。
- loading/empty/partial/error/success 由 DataRegion 及业务适配表达；刷新失败保留数据。交互、业务状态与 runtime 不合并。
- 每个组件提供无障碍名称、键盘/触摸入口、减少动态效果；不可交互的评分或指标不增加假 hover。

## 4. 关键行为决策

### 4.1 Table 与 DataTable

`Table` 提供 table/thead/tbody/tr/th/td/caption 等语义结构；`DataTable<T>` 接收 rows、columns、getRowId、selectedIds、onSelectionChange、activeRowId、onActivateRow、sort/onSortChange 以及数据状态/底部槽位，名称在 G0 固定。

- columns 使用稳定 ID、header/cell 渲染与对齐定义；行 ID 不采用数组下标。
- DataTable 不内置 CRM 筛选或默认远程请求；接收调用方已排序/筛选的数据，表头动作只提出排序变更。
- 勾选、多选、当前查看对象、键盘焦点分别建模；Checkbox、负责人链接和尾部动作不会顺带激活整行。
- 默认普通 table 键盘行为，主要名称提供可聚焦按钮/链接；不加 role=grid 却遗漏单元格导航。
- 全选仅作用当前传入的可选择行；全选/取消只增删这些 ID，保留过滤后不可见的选择。header mixed 状态按可见可选行计算。跨页全量选择不在首版范围。
- 原型保留横向滚动，表头/底部的滚动和固定行为须实际验证；不因 CSS grid/subgrid 破坏辅助技术读取。
- 长内容、空字段、无结果、删除当前查看行、刷新旧数据、禁用行均有独立示例；计数和汇总由调用方计算。

### 4.2 选择、菜单与浮层

- Tabs 用于内容切换，Select 用于选值，Menu 用于动作或明确的菜单选项；Popover 是容器，不自动变成 Menu。
- Select/Menu 支持方向键、Home/End、文本定位、Escape、当前项、disabled；关闭恢复合理焦点。
- Sheet 的 side、open、宽度/高度参数受控可配；固定 header/footer，内容独立滚动；嵌套 Select/Popover 的 Escape 只关闭最上层。
- Dialog/Sheet/Popover 之间跳转时焦点直接进入目标，避免回焦到即将关闭的触发器。
- CommandPalette 搜索与结果由调用方提供，提供本地过滤示例；键盘快捷键注册范围可配置，尊重 IME、文本编辑和事件已被处理的情况。
- 全站命令搜索与 Canvas 快捷键不得互相抢占；结果选择后按回调打开目标，再处理焦点恢复。

### 4.3 数值、趋势与表单

- SegmentBar 的百分比表示胜率/健康度等量值，使用 meter 语义和标签；不误称正在运行的进度。未知值显示未知，不补0；有限数值按声明范围限制，segment 数有界。
- Sparkline 首版覆盖参考中的微型柱状图，提供名称/摘要或文本数据替代；阈值和颜色由调用方提供，不导入 CRM 的 TREND_PATTERN。
- RatingDisplay 首版只读，max/value、未知及半星策略固定；用“一共5星，当前4星”等文本说明，不伪装为可修改评分。
- Slider 区分连续 onChange 和操作完成回调；键盘步长、Home/End、边界、禁用和无效数值处理明确。
- Field 统一 label/id、必填、描述与错误 ID；数字/日期先组合现有 Input，校验失败保留原始草稿，不自动把不合法金额改成0。
- ImageUpload 仅负责本地文件选择与预览，通过回调交给调用方上传。类型/大小可配，替换失败保留旧值，处理读取失败、迟到读取及卸载资源释放；不把 Data URL 预览标成远程上传完成。

### 4.4 工作台扩展

- 复用 WorkspaceShell 已有受控/非受控状态；新增 sidebarWidth/defaultSidebarWidth/onSidebarWidthChange、边界与可选 resize 能力，不重建第二套 Shell。
- 默认仍保持现有256/48侧栏和 Inspector 尺寸；参考页254、200–400的侧栏尺寸通过明确局部参数传入。
- 持久化示例由适配层按实例键保存；不能在组件内部固定写全站 CSS 变量或相同 localStorage key。
- 若参考页面需要不同 header/sidebar 排列，优先以向后兼容槽位扩展 Shell；不让页面复制浮层、焦点与 resize 实现。

## 5. 里程碑、下一动作与阶段出口

| 阶段 | 依赖 | 工作与下一动作 | 验收出口 |
| --- | --- | --- | --- |
| G0 契约冻结 | 无 | 复核实现/Manifest；写入新增 API、状态、尺寸、主题及选择语义 | 每项能力有责任、示例场景、依赖、验收条件；不需要等待 CRM 后端 |
| G1 表格基础 | G0 | C01/02/03/07/09/10，补齐行选择、头像及量值/趋势 | 通用 fixture 可显示九列；勾选/查看分离，mixed 正确，空态/刷新失败可用 |
| G2 选值与浮层 | G0 | C04/05/06/08/11，完成键盘和 ThemeBoundary 接入 | Tabs、菜单、Select、Sheet、Popover 的嵌套焦点/关闭/主题/触摸通过 |
| G3 完整输入 | G1/G2 的相关能力 | C12/13/14/15，复用 Dialog 建命令搜索和表单 | 键盘搜索、表单校验、Slider 和文件失败恢复完整；输入不丢失 |
| G4 组合与布局 | G1–G3 | C17/18/19；C16 根据原生滚动与视觉差距决定 | 可拖动侧栏、响应式筛选、指标/评分可用；另一种非 CRM 示例证明可复用 |
| G5 分发与回归 | 各阶段持续执行 | Manifest/loader/Registry/词典/示例/i18n/独立消费验证 | 每个公开组件能单独安装和交互，无站点依赖；现有工作台无回归 |

G1 与 G2 可按组件依赖交错实施，不要求用多 Agent。CRM 主表格可在 G1/G2 出口后开始集成，完整演示交付需 G3/G4/G5 对应项通过。

## 6. 分发与证据

- 公共源码/CSS/工具放 `components/ui/`、`components/blocks/`、`lib/`；模型与同名组件避免 basename 冲突，业务数据只在 examples。
- 更新当前 `lib/component-manifest.ts`、`components/docs/demo-loader.tsx`、`registry.json`、`lib/visual-dictionary.ts` 与相关 i18n；保留 `lib/catalog.ts` 的兼容导出方式。自动生成索引使用现有脚本，不手改生成物。
- 每个公开项提供可运行例子、实际 props、安装依赖与状态说明；重型 DataTable/Command 示例按需加载。
- 通用组件测试使用非 CRM fixture，覆盖受控/非受控、主题、键盘、触摸、错误、语言切换；有实际边界价值才补纯逻辑测试。
- 必须执行 lint、typecheck、build、check:i18n、check:manifest 及相应浏览器测试；源码/CSS/依赖分发变更执行 test:install，并浏览器检查安装后的代表性组合。
- 双主题/双语言、1440/1024/390px、粗指针、reduced-motion 覆盖代表性组合；截图与 axe 仅是证据的一部分，保留人工键盘/读屏记录。
- 开始构建/服务前检查3010/3011进程归属；使用 Webpack，保留共享工作，必要时携带完整改动在隔离副本验证。

## 7. 完成标准

G1–G4 的必要公开能力与 G5 验证完成后，才将“组件补齐”标为完成。C16 若以原生滚动满足需求，记录“不新增组件”的依据；延后的 Combobox 等不计入本轮完成承诺。

交付记录逐项注明：已实现、已验证、独立安装通过、限制和待处理项。向现有 Blog 补一篇“从 CRM 页面提炼通用组件”，关联真实 API、安装结果与 [复刻计划](./sales-crm-replication-plan.md)；未实现阶段不展示为 available 或 verified。


## 8. 本轮接口冻结与滚动决策

- DataTable：`rows/columns/getRowId/getRowLabel`，`selectedIds/onSelectionChange`、`activeRowId/onActivateRow`、`sort/onSortChange` 各自受控；columns 的 primary cell 只能提供非交互内容，负责人链接和尾部动作放独立列。默认不创建 role=grid。
- Checkbox 沿用 Base UI checked/defaultChecked/onCheckedChange 与 indeterminate；Table 暴露原生分段组件。Tabs/Select/Popover 复用现有实现；DropdownMenu 复用 Menu，补充 checkbox/radio 项。
- Sheet 沿用 Dialog open/defaultOpen/onOpenChange；Content 接收 side/size/initialFocus/finalFocus。Field 用 children(controlProps) 把标签、描述、错误和必填关联交给现有输入；FormSection 只创建 fieldset。
- CommandPalette 接收调用方 groups/query/onQueryChange/onSelect，默认不注册快捷键，支持可选 scope；ImageUpload value 为 File|null，回调只交付本地文件，不执行上传。
- Slider 使用 value/defaultValue/onChange/onCommit，数值范围有界；SegmentBar 使用 meter，未知值不补0；Sparkline 最多显示最近120点，缺失值不画柱，负值相对零线绘制；RatingDisplay 只读，max 为1–10并四舍五入到半星。
- WorkspaceShell 新增侧栏宽度与边界、resize可选接口，默认尺寸及原有 Inspector/底部行为保留；不增加组件内持久化。
- C16 决定使用原生 overflow:auto、overscroll-contain 和已有全站滚动条。表格容器、Sheet正文、命令结果均保持原生滚动、键盘与触摸；没有需要新建 ScrollArea 的视觉差距，不另导出同义封装。

按用户本轮指示：只完成实现和验证，暂不提交或推送。


## 9. 本轮交付结果

- C01–C19均有实现或明确复用决策：新增17个公开组件，扩展既有Select、Popover及WorkspaceShell；C16不新增ScrollArea。
- 完整冻结回归183项通过，新增组件交互15项及逐项静态安装闭包17项包含在内；独立CLI消费项目的类型检查、生产构建和浏览器组合操作通过。
- lint、typecheck、Webpack build、check:i18n、check:manifest通过；当前目录59个组件、Registry72项。具体检查范围与限制见[实施记录](common-components-completion-log.md)。
- 已增加文章 `/blog/common-components-from-crm/`、源码范围哈希及可下载验证报告。文章保留measuring状态：功能验证通过不等于性能前后对比。
- 原有Canvas 200节点冷启动样本2815ms超过2000ms预算，未放宽阈值；Inspector p95为72.3ms、拖拽49fps。该样本不用于推断本轮组件的因果影响。
- 本轮无Git提交或推送；CRM页面集成、真实服务及人工读屏验收继续作为独立后续工作。
