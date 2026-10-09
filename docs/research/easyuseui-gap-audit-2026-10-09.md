# EasyuseUI 组件能力与交互差距审查

日期：2026-10-09。配套 [研究手册](./ui-architecture-interaction-handbook.md) 与 [来源快照](./ui-reference-sources.json)。

当前优先级应放在现有能力的一致性和边界行为：文档可用性映射、Inspector 尺寸契约、短视口 Dialog、嵌套浮层与变体验收。通用工具栏属于后续增强；分隔布局和图表已有并行实现，应先收口其契约和验收，避免重复建设。

## 1 基线和证据范围

源码审查冻结于 **2026-10-09 08:40:36 Asia/Shanghai**，HEAD 为 `db8c9910f1d635936a4417d8c1b823eb0021e187`。当时有并行未提交改动；工作区快照包含 143 个 Registry 条目和 128 个 Manifest 文档条目，数量不是发布完成度。来源 JSON 保留选取文件的 SHA-256。

采用三种标记：**已确认**表示源码/文档可直接核实的事实；**待复现风险**表示组合或边界上的风险，尚不足以认定当前业务路径已经失败；**能力增强**表示满足新增需求的建议，不把有意保持简洁的 API 视为缺陷。浏览器实测单独列出，不把既有测试文件的存在写成本轮测试通过。

本轮交付研究文档，不修改组件行为、业务服务、依赖、主题或 Registry。并行代码后续变化可能关闭部分发现，实施前应按对象路径重新核对。

**08:51 补充核对：**并行工作已更新词典的上述基础组件标记，并新增 `Resizable`、轻量 `Chart` 和分析侧 `ChartFrame` 等源码；WorkspaceShell 侧栏已开始复用 ResizableHandle。它们尚不在本轮基线 HEAD 中，不能继续笼统列为“缺失”，也不由本轮代为认定验证通过。下文 G03/G07/G10 已相应调整；来源 JSON 另记补充文件摘要，不覆盖 08:40 基线。

## 2 已有能力与并行实现

| 领域                | 当前可核实能力                                                                                                                                                                                                               | 审查结论                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 基础与主题          | theme tokens、Button、Field、Select/Combobox、Tabs、Menu、ThemeBoundary                                                                                                                                                      | 已有，继续复用；不推荐换一套设计系统                                           |
| 数据状态            | DataRegion、十种 runtime、unknown 展示、脱敏                                                                                                                                                                                 | 已有；真实服务仍由调用方负责                                                   |
| 工作台              | WorkspaceShell、Inspector、sidebar/inspector/bottom resize、受控偏好接口                                                                                                                                                     | HEAD 已有；补充核对时工作区另有 Resizable/ResizableHandle                      |
| 会话与活动          | Conversation、ActivityTimeline、64px 跟随、revision、屏外延迟布局                                                                                                                                                            | 已有；不能误称成全量窗口化                                                     |
| Canvas              | 编辑、命令、配置、子流程、运行快照、服务面板、执行动效                                                                                                                                                                       | 已有；图编辑不等于真实执行器                                                   |
| Agent board         | Run 视图、依赖、用量历史、AgentRunVirtualList                                                                                                                                                                                | 已有；专用窗口化不能自动套到 Tree/Table                                        |
| 事项与时间          | Work Items 多视图、批量动作、Timeline、Calendar                                                                                                                                                                              | 已有；事项 Calendar 与日期选择原语职责不同                                     |
| 通用表格和搜索      | DataTable、FilterToolbar、CommandPalette、Sheet、ImageUpload                                                                                                                                                                 | 已有；ImageUpload 只产出本地 File                                              |
| 基础表单 S1         | Textarea、Label、NativeSelect、Switch、RadioGroup                                                                                                                                                                            | HEAD 已存在，不应继续列为缺失                                                  |
| S2/S3/S5 等并行补齐 | ButtonGroup、InputGroup、Toggle/ToggleGroup、InputOTP、Accordion、Collapsible、Tooltip、HoverCard、AlertDialog、ContextMenu、Separator、DateCalendar、DatePicker、Pagination、Breadcrumb、Menubar、NavigationMenu、Direction | 冻结工作区已有源码/Registry；本轮不代认发布与整体验收                          |
| 统计图表            | Sparkline、SegmentBar、MetricSummary、AgentUsageHistory                                                                                                                                                                      | HEAD 已有；补充核对时工作区另有 Chart 与 ChartFrame 等分析代码，需核实交付范围 |

依据：[Manifest](../../lib/component-manifest.ts)、[Registry](../../registry.json)、[组件补齐计划](../../plans/shadcn-component-completion-plan.md)、工作区分析计划 `plans/workflow-analytics-components-plan.md`（并行未提交）。词典或阶段日志可能落后于工作区，不能只从名称计数判断缺口。

## 3 优先级清单

P1 表示应优先收口的现有契约/可用性问题或高影响组合风险；P2 表示能力与质量体系增强。本轮未确认 P0 级的业务数据破坏或权限绕过。

| ID  | 优先级 | 状态                 | 问题与下一步                                                                  |
| --- | ------ | -------------------- | ----------------------------------------------------------------------------- |
| G01 | P1     | 浏览器确认短视口问题 | Dialog 缺少默认高度约束；CommandPalette 在 390×240 时关闭按钮大部分位于视口外 |
| G02 | P1     | 待复现风险           | 浮层硬编码层级分散；验证 Sheet 内 Dialog 与多层确认                           |
| G03 | P1     | 部分被并行修改修正   | 词典标记已更新；README 登记入口仍落后，元数据同步仍需收口                     |
| G04 | P1     | 已确认               | Inspector 最小宽度在同一契约中出现 280 与 300；统一约定                       |
| G05 | P2     | 已确认的统一性缺口   | 动效 token 已有，Dialog 仍硬编码 150ms；明确各浮层动效策略                    |
| G06 | P2     | 能力增强             | 缺通用命令 Toolbar 与优先级溢出；保留 FilterToolbar 的 group 语义             |
| G07 | P2     | 并行已有实现待收口   | Resizable 已新增；审查共享行为、剩余分隔条和安装回归                          |
| G08 | P2     | 能力增强             | DataTable 的列管理与远程分页组合尚需契约；保留当前受控语义                    |
| G09 | P2     | 能力增强             | 缺跨组件变体/状态验收索引及强制颜色覆盖证据                                   |
| G10 | P2     | 并行已有实现待收口   | Chart 与分析侧 ChartFrame 已出现；明确分层和验证范围                          |

### G01 Dialog 的短视口和长内容

**位置：**[dialog.tsx](../../components/ui/dialog.tsx) 的 DialogContent，约 20–46 行。默认 Popup 使用 fixed、50% 定位与居中 transform；有最大宽度，没有最大高度、正文滚动或固定首尾结构。[Sheet](../../components/ui/sheet.module.css) 已有可借鉴的 flex、min-height:0 与 overflow 布局。

**触发：**消费方放入较长表单/错误说明，或者用户在很短的视口中打开对话框。居中内容可能超出上下边界；背景又处于模态约束，不能依赖页面滚动找回操作。

**实测：**使用基线生产导出的原始 DialogDemo 和 CommandPaletteDemo，未注入 DOM 内容。390×844 时二者均在视口内；390×320 时 CommandPalette 高 335px，顶部 -7.5px；390×240 时顶部 -47.5px，关闭按钮顶部 -30.5px、高 44px，仅底部 13.5px 位于视口内。Popup 的 computed `max-height:none`、`overflow-y:visible`。普通 Dialog 在 240px 高度时只确认边框/内边距越界，按钮仍在视口内，不能把两者影响混写。六个场景 Escape 关闭与焦点恢复均成功。见 [原始测量](./evidence/dialog-viewport-probe.json) 和 [可复跑探查脚本](./evidence/dialog-viewport-probe.mjs)。

**下一步：**为默认 Dialog 定义可用视口高度与长内容策略，评估 Header/Body/Footer 槽位；不改变 Base UI 的焦点和关闭责任。先保留短视口实测记录，再确定修复范围。

**验收：**390px 宽、短视口、长描述、长表单和错误追加后，标题/关闭/提交均能触达；Tab、Shift+Tab、Escape 和焦点恢复正确；正文滚动不拖动背景。普通内容不必强制固定高度。

### G02 嵌套浮层的视觉与行为顺序

**位置：**[Dialog](../../components/ui/dialog.tsx) 为 z-50；[Sheet CSS](../../components/ui/sheet.module.css) 与 [WorkspaceShell CSS](../../components/blocks/workspace-shell.module.css) 为 60；[Popover](../../components/ui/popover.tsx)、[Select](../../components/ui/select.tsx) 为 70。工作区新增 AlertDialog 为 70、Tooltip 为 80。多个值散落在组件中。

**风险：**在 Sheet 里打开普通 Dialog 时，后打开的 Dialog 可能在视觉上落到 60 层之后，而焦点已进入它。Portal 容器与祖先 stacking context 会影响结果，因此这里是明确的复现目标，尚不宣称所有嵌套场景必然失败。

**下一步：**先创建实际组合样例，记录元素命中、遮挡、焦点和 Escape 消费者，再确定共享层级 token 与嵌套层策略。不要仅把所有 z-index 改成更大的数字。

**验收：**Sheet→Dialog、Dialog→Popover、Inspector→AlertDialog、两层 ThemeBoundary 均只关闭最上层；后打开的可交互层可见可点，背景不可误操作；焦点按原路返回。现有 Sheet 内 Select/Popover 的测试需要保留。

### G03 可用性文档与源码事实漂移

**位置：**08:40 的 [UI-VISUAL-DICTIONARY.md](../../UI-VISUAL-DICTIONARY.md) 第 95–98、116 行将 Textarea、Checkbox、RadioGroup、Switch、CommandPalette 写成内嵌或待实现，08:51 补充核对时这些条目已由并行工作更新。上述组件在 HEAD 已有对应源码和 Registry。[README](../../README.md) 的“添加组件”仍要求直接在 `lib/catalog.ts` 登记，而该文件现在只重新导出 `componentManifest`。

**影响：**开发者可能重复实现、写入错误文件，或以旧表估算组件缺口。运行时 [visual-dictionary.ts](../../lib/visual-dictionary.ts) 已会根据 Catalog 合并可用性；问题是 Markdown 与代码元数据仍有多份维护。

**下一步：**以 Manifest/Registry 生成或检查 Markdown 中的“已有/内嵌/待实现”映射，并更新 README 的登记入口。阶段计划保留历史基线，同时明确当前阶段，不覆盖历史证据。

**验收：**任一标为可用的组件都能定位源码、示例、Registry；已存在的正式组件不会在维护中的词典里被标缺失；检查能识别一条故意失配的条目。并行未交付组件单独标识。

### G04 Inspector 宽度契约冲突

**位置：**[Component-Specification.md](../../Component-Specification.md) 第 8 节规定 300–360px，后面的“受控布局、流式修订与基础交互”增量写成 280–360px；[styles/theme.css](../../styles/theme.css) 的 `--workspace-inspector-min` 为 300；[workspace-shell.tsx](../../components/blocks/workspace-shell.tsx) 初值、fallback 和计算约束也是 300。

**影响：**按后文传入 280 的消费方会得到 300；文档、默认 token 和实现不能同时成立。该发现不要求擅自选择新的产品尺寸。

**下一步：**按当前正式基础值优先收口为 300–360；如果确需 280，先记录明确例外或新契约，再同步 token、示例、技能映射与验收。

**验收：**受控/非受控、Home/End、拖拽边界与 `aria-valuemin/max/now` 一致；主题边界中实际 computed width 与约定一致。

### G05 动效规则尚未完全落实为共享实现

**位置：**[styles/theme.css](../../styles/theme.css) 已有 hover/button/popover/panel/drawer/layout 六个时长；[Dialog](../../components/ui/dialog.tsx) 两处 `duration-150` 未消费这些变量；[Popover](../../components/ui/popover.tsx) 目前没有进出过渡。Sheet 和 Canvas 则有 token 与 reduced-motion 支持。

**下一步：**先决定哪些浮层需要何种过渡、Dialog 对应哪个 token。静态呈现可以保留为明确策略；不应为了凑动效覆盖率给所有组件加动画。共享控制参数与局部展示代码分开。

**验收：**修改相应 token 能影响目标组件；快速反复打开/关闭不遗留遮罩；退出期间焦点和交互正确；reduced-motion 不依赖位移、旋转或闪烁传递状态；运行状态不因动画结束自动完成。

### G06 通用命令工具栏与空间不足

**依据：**[FilterToolbar](../../components/blocks/filter-toolbar.tsx) 是 `role=group`，将搜索/筛选/排序/摘要组合并在窄屏打开 Sheet；工作区 `components/ui/button-group.tsx` 是布局组。本轮冻结的 Registry 没有 `toolbar` 项，未发现可复用的方向键命令 Toolbar 或优先级 overflow 模型。

**下一步：**对于 Canvas 等命令密集场景，评估已安装的 `@base-ui/react/toolbar`，借鉴 Fluent 的优先级可见项模型。普通筛选组继续保留自己的语义；已有 Menu 和 Button 应复用。

**验收：**Toolbar 一个 Tab 入口、左右键导航、禁用项策略明确；操作进入“更多”后仍可发现；容器缩窄不丢焦点；输入框光标与方向键不冲突；同一操作不会因同时存在于主栏和溢出菜单而重复提交。

### G07 通用分隔布局提取

**依据：**08:40 的 [WorkspaceShell](../../components/blocks/workspace-shell.tsx) 为侧栏、Inspector 和底部面板分别实现 pointer capture、clamp、取消、separator ARIA 与键盘调整。当时没有独立 `resizable` Registry 项；08:51 工作区已新增 `components/ui/resizable.tsx`，提供横纵分栏和 ResizableHandle，侧栏已开始复用。当前问题变为统一与回归，不能再记成“缺少 Resizable”。

**下一步：**接续 [组件补齐计划 S8](../../plans/shadcn-component-completion-plan.md)，先核实并行实现的最终范围，再考虑 Inspector/底部的共享行为、横纵方向、受控尺寸、折叠、最小主区域与面板身份；借鉴 Ark 的行为与呈现分离，避免另写一个 Splitter 或扩大为 docking/window manager。

**验收：**嵌套分栏、容器缩小、pointer cancel、Home/End、触摸和折叠恢复；拖动过程不做布局动画；持久化仍由适配器负责。

### G08 数据表格的列与查询能力

**依据：**[DataTableProps](../../components/blocks/data-table.tsx) 已有 rows、columns、selection、activation、sort、footer、stickyHeader 和 maxHeight；未提供列宽/顺序/显隐的专用受控状态，也不拥有远程分页。冻结工作区已有 Pagination，不能再列为完全缺失。

**下一步：**按真实表格需求先做列配置与 Pagination 组合；明确查询 key、未知总数、游标与当前页。若需要单元格编辑，再单独评估 Grid 的完整键盘责任。

**验收：**隐藏选择保留，当前页全选不擅自选整个查询；未知总数保持未知；排序只发请求；迟到响应不覆盖新查询；列调整具有键盘替代；刷新错误保留行。消费方的交互 cell 必须避免被主激活 Button 再包一层。

### G09 变体、状态和可访问性证据索引

**依据：**现有 tests 包含 axe、键盘、触摸、主题、嵌套浮层、IME、性能等测试，不能称作“没有测试”。但 [visual.spec.ts](../../tests/visual.spec.ts) 的截图基线只有 Menu 深浅两种；本轮检索 tests 未发现 `forcedColors`/`forced-colors` 场景。未建立覆盖每个正式变体与重要状态组合的单一验收索引。

**下一步：**建立轻量的“组件→变体→场景→测试”索引。先覆盖 Button/Input、Dialog/Sheet、Tree/DataTable、WorkspaceShell 等关键组合；补系统强制颜色、短视口、长标签与人工读屏记录。优先扩展现有测试和 StyleWorkbench，不默认安装新展示框架。

**验收：**新增变体有明确测试或不适用理由；selected/focus、error/disabled、busy/label 等组合可见；无颜色时状态仍可理解。静态截图、自动 axe、浏览器操作和人工读屏分别记录证据。

### G10 图表与指标契约

**依据：**08:40 Registry 无通用 Chart；08:51 补充核对发现 `components/blocks/chart.tsx` 的轻量 Chart（最多120点、缺失值断线、可见数据表），以及 `components/ui/chart.tsx` 的分析侧 ChartFrame/Legend/Tooltip 等新代码。工作区中的 `plans/workflow-analytics-components-plan.md`（并行未提交）已规划指标定义、历史覆盖、图表、仪表板与证据。两类 API 职责不同，不能仅按“Chart”名称判断重复，也不能再称完全缺失。

**下一步：**核实轻量图表与分析图表的正式分层、命名、Registry 依赖和数据契约。沿原计划完成历史覆盖、图例、tooltip、缺失点、数值格式化与回归；按实际性能和安装体积决定是否需要额外引擎。

**验收：**0、未知、未采集、无权限、缺失区间彼此区分；时间桶与时区明确；图表有文本/表格替代；partial/error 保留可用数据；演示指标不冒充真实运行数据。

## 4 建议执行顺序

| 阶段         | 范围                                   | 完成条件                                     |
| ------------ | -------------------------------------- | -------------------------------------------- |
| A 当前一致性 | G03、G04；核实并行 S2/S3/S5 的交付情况 | 文档与真实 API 一致，不重复新增已有组件      |
| B 边界交互   | G01、G02，结合 G05                     | 短视口与嵌套浮层实际可用，动效不破坏生命周期 |
| C 工作区复用 | G06、G07、G08                          | 在至少一个真实消费场景中复用，独立安装通过   |
| D 质量与分析 | G09 持续推进，G10 按既有阶段执行       | 变体证据可追溯；指标语义与数据覆盖可验证     |

本表是研究建议，不替代既有实施计划。本轮没有把浮层替换、通用 Toolbar 或图表引擎实现纳入修改范围。

## 5 本轮验证记录

结果摘要见 [验证数据](./evidence/validation-summary.json)。

| 验证范围                                                | 结果                        | 解释                                                                                     |
| ------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| 08:40 工作区快照 lint / typecheck                       | 通过                        | 包含当时并行源码；不代表并行任务完成                                                     |
| 08:40 工作区快照 build                                  | 未通过                      | Manifest/Registry 的 `alert`、`empty`、`skeleton` 依赖不一致，发生在进行中的组件补齐快照 |
| 基线 HEAD 加本轮文档与探查脚本 lint / typecheck / build | 全部通过                    | Webpack/WASM；未修改活动 3010 服务                                                       |
| 原始 Dialog/CommandPalette 探查                         | 6 个场景                    | 确认 G01 的几何问题；六次 Escape 关闭与焦点恢复成功                                      |
| 文档与来源检查                                          | 交付时校验路径、引用和 JSON | 固定 19 个上游提交、36 个源码入口；本地证据包含冻结摘要                                  |

工作区快照构建失败不能据此认定已发布版本失败；本轮没有替并行任务修改这些文件。只运行了针对研究发现的浏览器探查，没有宣称全量 Playwright、独立安装、人工读屏或真实服务验证通过。

文档交付另外使用已提交 HEAD 的隔离副本验证，避免并行构建改写 3010 的服务产物。源码审查、工程检查和浏览器探查的结果分别记录；不新增真实服务或业务验收声明。

## 6 后续实施（保留上述历史基线）

2026-10-09 已启动 G01–G10 的组件改进，详见 [实施与验证记录](../../plans/ui-gap-audit-implementation-log.md)。当前源码可用性由 [生成映射](../component-availability.md) 与 Manifest/Registry 检查，组件交互示例位于 `/examples/component-contracts/`；后续结果不改变本报告原始测量和证据范围。
