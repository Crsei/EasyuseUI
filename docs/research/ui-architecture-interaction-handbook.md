# UI 组件架构与复杂工作区研究手册

日期：2026-10-09。适用对象：EasyuseUI 的组件维护者、工作台开发者和消费项目接入者。

EasyuseUI 适合继续沿用 **Base UI 交互基础、共享主题、受控产品组件和源码 Registry** 的架构。参考库最有价值的内容是组件职责、状态管理、组合规则和验证方法。成熟工作区需要先保证焦点、草稿、对象身份和操作结果正确，再扩展视觉变体与动效。

本文从本机 `UI-package/README.md` 的五条研究路线出发，阅读了 19 个本地仓库的代表实现，并补充 WAI APG 和 Aceternity 官方入口。具体项目问题见 [EasyuseUI 差距审查](./easyuseui-gap-audit-2026-10-09.md)，来源提交、路径和文件摘要见 [来源快照](./ui-reference-sources.json)。本手册是研究建议；正式约束仍由 [设计规则](../../Design-rules.md)、[组件契约](../../Component-Specification.md)、[模式](../../UI-PATTERNS.md) 和 [状态](../../UI-STATES.md) 定义。

## 阅读路线

| 问题                           | 先看本文   | 主要参考                                |
| ------------------------------ | ---------- | --------------------------------------- |
| 如何新增一个可独立安装的组件   | 组件架构   | shadcn、Chakra、21st Registry           |
| 能点开，但键盘、嵌套浮层有问题 | 交互正确性 | Base UI、Radix、Headless UI、Ark        |
| 同类组件需要几种外观           | 设计变体   | HeroUI、Origin UI、HextaUI、daisyUI     |
| 哪里适合动、如何表达运行       | 动效表达   | Motion Primitives、Magic UI、React Bits |
| 工具越来越多、数据越来越密     | 复杂工作区 | Fluent UI、Carbon、Mantine、MUI、Tremor |

## 1 组件架构

### 1.1 五层职责与依赖方向

| 层         | EasyuseUI 的位置                            | 应负责                                   | 边界                                   |
| ---------- | ------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| 基础       | `styles/theme.css`、`lib/runtime-status.ts` | token、密度、状态词典                    | 不从页面复制颜色和状态映射             |
| 原语       | `components/ui/`                            | 键盘、焦点、表单、ARIA、视觉槽位         | 沿用已安装 Base UI 的公开接口          |
| 产品模式   | `components/blocks/`                        | Session、Agent、工具调用、事项、数据区域 | 接收权威数据与能力回调，不调用业务服务 |
| 工作区     | `WorkspaceShell`、`CanvasWorkspace` 等      | 导航、主区、详情、分隔条、响应式         | 不持有第二份业务对象或权限事实         |
| 页面与适配 | `components/examples/`、`app/`、消费项目    | URL、请求、持久化、演示数据              | fixture 明确标识；真实服务由接入方负责 |

shadcn 的 [Registry schema][shadcn-schema] 将文件、npm 依赖、Registry 依赖、CSS 与 token 分开声明；其 [Base Button][shadcn-button] 将行为原语与外观变体组合。EasyuseUI 已有同类结构，不需要为了研究再引入另一套按钮或主题系统。

Chakra 的 [slot recipe context][chakra-slots] 将变体参数、各槽位样式和普通属性分开处理。这适合借鉴到多部件组件：由根组件统一密度与布局选项，Header、Body、Footer 只消费对应槽位。不要让每个槽位自行定义互相矛盾的尺寸。

### 1.2 数据和行为的所有者

组件可直接管理展开、鼠标悬停等展示状态。业务选择、查询结果、日期、图文档、执行状态和写入确认需要明确所有者。受控属性使用一致的 `value / defaultValue / onChange` 配对，回调只描述用户意图。

例如取消 Run 的链路应是：用户点击 → 调用方提交取消请求 → UI 显示待确认 → 来源快照确认 `cancelled`。请求 Promise resolve 只能证明该回调结束。网络丢失时保留 run ID、receipt 和最后状态，先查询结果。该约束比一般按钮的“loading → success”反馈更严格，已有 [ToolCall](../../components/blocks/tool-call.tsx) 和 [Canvas runtime](../../lib/canvas-runtime.ts) 应继续作为产品基线。

### 1.3 分发也是组件 API 的一部分

新增组件需要同时考虑源码、类型、样式、内置文案、依赖、示例和安装路径。EasyuseUI 当前的元数据源是 [component-manifest.ts](../../lib/component-manifest.ts)，[catalog.ts](../../lib/catalog.ts) 只是兼容导出；[Registry 构建器](../../scripts/build-registry.mjs) 从共享主题生成分发 token。

[21st Registry 的依赖解析器][registry-deps] 读取 `components.json` 的别名和命名空间，递归处理组件依赖并记录文件归属；[发布配置][registry-config] 另外描述组件、演示、可见性等信息。可借鉴“来源与安装目标可追踪”的方法，但该仓库是 CLI，不能视作 21st.dev 全部组件的源码库。

推荐新增组件的完成顺序：

1. 固定职责、受控值、能力回调与失效场景。
2. 核对已安装原语 API，实现源码和 portable i18n。
3. 添加真实可操作示例，以及长内容、禁用、错误等情形。
4. 同步 Manifest、Registry 和需要的主题依赖。
5. 验证独立消费项目中的编译、样式、Portal、键盘操作和实际交互。

仅在文档站运行成功，不能证明源码离开本站后仍可用。本项目已有安装和主题模式检查，应扩展这些入口，而非另建平行安装器。

## 2 交互正确性

### 2.1 先确定语义再选择外观

| 用户意图               | 合适的语义              | 关键行为                                |
| ---------------------- | ----------------------- | --------------------------------------- |
| 执行一次动作           | Button、Menu            | 禁用、忙碌防重复，危险动作显式确认      |
| 前往另一 URL           | Link、Navigation        | 保留浏览器返回、新标签页与复制链接      |
| 修改一个值             | Select、Combobox、Radio | 标签与协议值分开；键盘和表单提交正确    |
| 切换同一对象的内容     | Tabs                    | 焦点与激活分开，面板关系完整            |
| 暂时补充信息           | Popover、Tooltip        | Tooltip 不承载必须交互的表单            |
| 阻断当前任务进行小操作 | Modal Dialog            | 焦点进入、循环、退出、恢复和背景约束    |
| 扫描数据               | 原生 Table              | caption、表头与排序说明；选择与激活独立 |
| 在单元格间编辑         | 交互 Grid               | 完整方向键、编辑模式和焦点管理          |

WAI 的 [Dialog 模式](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) 要求焦点进入模态区域，并在关闭后回到触发点或合理的后续位置。长内容可能需要先聚焦标题。给元素加上 `aria-modal` 并不能替代背景交互约束。

交互 Grid 需要管理内部焦点和方向键；一般数据展示应先使用原生 table。不能为了实现单个行按钮就把整个表改成 grid。参见 [WAI Grid 模式](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)。

### 2.2 四套原语中可借鉴的机制

| 来源                                                          | 实现观察                                                                     | EasyuseUI 的应用                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [Base UI DialogPopup][base-dialog]                            | FocusManager 接收初始/最终焦点、模态配置和挂载状态                           | 保留其焦点生命周期；样式封装不截断这些 props                        |
| [Radix Dialog][radix-dialog]、[DismissableLayer][radix-layer] | 焦点约束、外部点击、滚动锁、嵌套层分别协调；关闭不等于立即卸载               | 审查多层浮层和退出动画，不能只测一个 Dialog                         |
| [Headless UI Dialog][headless-dialog]                         | 顶层判断、外部点击、Escape、背景 inert、滚动锁和 FocusTrap 分责              | “关闭谁”和“焦点去哪里”需要一起验证                                  |
| [Ark Splitter][ark-splitter]、[Tree][ark-tree]                | React hook 将环境、方向、集合等参数交给 Zag machine，再通过 connect 输出接口 | 借鉴状态与视图分离；该克隆中的包装层不能证明 Zag 内部所有边界已审查 |

这些参考不是引入四套原语的建议。本项目已安装 `@base-ui/react` 1.8.0，应优先围绕这一套机制组合；跨库混用会增加 Portal、焦点、关闭顺序和样式状态适配成本。

### 2.3 把浮层当作完整生命周期

打开时先确定初始焦点；显示时确定 Portal 属于哪个 ThemeBoundary、谁是最上层、背景是否可交互；关闭时处理 Escape、外部点击、退出动画和焦点恢复；触发器已卸载时提供合理回退。

重要组合包括 Sheet 内 Select、Dialog 内 Popover、Inspector 内确认对话框、Tooltip 与 Escape 同时存在。视觉堆叠和行为堆叠需要一致：如果焦点在新对话框里，但旧 Sheet 挡住它，即使 ARIA 正确，用户仍无法操作。统一 z-index token 只能改善命名，还需要嵌套层策略和实际浏览器验证。

### 2.4 状态按轴组合

| 状态轴       | 示例                                    | 不应被什么覆盖                     |
| ------------ | --------------------------------------- | ---------------------------------- |
| 交互         | focused、selected、disabled、busy       | focus 不能被 selected 代替         |
| 数据         | loading、empty、partial、error、success | 详情读取失败不能把 Run 改成 failed |
| 执行         | 十种 runtime 与原始未知值               | 请求已接收不能改成 completed       |
| 连接与新鲜度 | disconnected、refreshing、updatedAt     | 断线不能清掉最后确认的内容         |
| 能力与审批   | 可读、可编辑、待批准                    | 展开详情不能自动批准               |
| 写入确认     | pending、confirmed、unknown、conflict   | 重挂载不能解除 unknown 写入锁      |

实现上继续复用 [DataRegion](../../components/ui/data-region.tsx)、[运行状态字典](../../lib/runtime-status.ts) 和现有模型。不要制造一个包含所有组合的巨大状态枚举。

## 3 设计变体

### 3.1 用正交维度表达差异

[HeroUI Button][hero-button] 将 React Aria 行为与 [样式变体][hero-styles] 分开，size、variant、icon-only、full-width 分别控制不同维度；[Chakra Button recipe][chakra-button] 同样把尺寸与外观分开。这种组织方式比不断增加 `compactPurpleRunningButton` 一类组合名称更容易维护。

EasyuseUI 应区分：层级（primary/secondary/ghost/destructive）、尺寸、内容槽位、交互状态、数据状态和 runtime。业务状态继续用 RuntimeStatusBadge 表达。变体不能改变动作含义、权限或调用方拥有的数据。

[Origin UI 简单输入][origin-input] 与 [密码输入示例][origin-password] 展示了同一原语的标签、附加动作和反馈组合。可借鉴组合方式，仍需逐项审查：后者在此快照中使用动态 input ID，却把按钮的 `aria-controls` 写为固定 `password`。示例数量多不意味着每个例子都能直接作为交互基线。

### 3.2 视觉借鉴必须经过本项目约束

[HextaUI Button][hexta-button] 包含按压缩放、纵向位移、多种反馈状态及按钮尺寸。EasyuseUI 的 Button 契约明确保持位置、不缩放，且要求粗指针命中面积有实际布局空间。因此可研究其状态内容切换方法，不能把整段类名直接作为本库默认。

[daisyUI 主题插件][daisy-theme] 将主题 token 放在作用域选择器下，适合研究多主题边界；[按钮 CSS][daisy-button] 展示语义类的集中组织。本项目已有 ThemeBoundary 和 Registry 的 host/scoped 模式，应沿用现有 token 来源，避免另外引入一套全局变量覆盖。

### 3.3 变体验收矩阵

不必穷举所有笛卡尔组合，但至少覆盖以下成对风险：

| 组合                        | 验收问题                         |
| --------------------------- | -------------------------------- |
| selected + focus            | 两者是否仍可独立识别             |
| busy + 原标签               | 是否防重复；宽度和名称是否稳定   |
| disabled + 错误说明         | 是否仍可理解不能操作的原因       |
| 暗色 + destructive          | 边界、文字和焦点是否可辨         |
| 中文长标签 + coarse pointer | 44px 目标是否真实存在且不重叠    |
| ThemeBoundary + Portal      | 浮层是否继承同一主题             |
| partial + unknown           | 缺失和未确认是否被误画成零或成功 |

[StyleWorkbench](../../components/blocks/style-workbench.tsx) 已支持局部 A/B 参数比较，可作为比较入口。新增变体应使用同一内容、状态和数据源；实验值只在预览作用域内生效。

## 4 动效表达

### 4.1 动效必须对应可解释的事实

| 目的             | 合适的表现                   | 实现建议                               |
| ---------------- | ---------------------------- | -------------------------------------- |
| 控件反馈         | 颜色、边界变化               | CSS transition，沿用 motion token      |
| 面板展开和退出   | 小幅位移、透明度、空间变化   | 原语负责挂载与焦点；表现层负责过渡     |
| 关联流程正在执行 | 指定连线的流动、活动节点强调 | 只读取来源报告的状态，不从相邻节点推断 |
| 数值变更         | 有界的数字过渡               | 精确值始终可读、可复制；不逐帧播报     |
| 首次加载         | 对应最终结构的 Skeleton      | 有旧数据时保留旧数据，避免整屏重闪     |
| 营销和独立预览   | Spotlight、Beam、Particles   | 懒加载、可暂停，按需限制作用域         |

[Motion Primitives TransitionPanel][motion-panel] 用 key 与 AnimatePresence 协调进出；[AnimatedNumber][motion-number] 用 spring 与 transform 更新显示。可借鉴过渡的分层组织，但有草稿的编辑器不能因为动画 key 改变而丢失局部状态。

它的 [Dialog][motion-dialog] 在这个快照中还使用原生 `dialog.showModal()`、cancel 事件和滚动控制。因此“动效组件”也可能自带整套交互。移植时只保留需要的表现机制，不能在 Base UI 外再套一套模态焦点所有权。

### 4.2 装饰效果的成本与适用范围

[Magic UI BorderBeam][magic-beam] 用 motion 的 offset path 做无限循环；[NumberTicker][magic-number] 使用进入视口检测与弹簧数值。[React Bits Magnet][bits-magnet] 监听鼠标移动并更新偏移；[Particles][bits-particles] 使用 OGL 和 requestAnimationFrame，并清理监听器及帧请求。它们分别适合研究路径动画、数值插值、指针响应和 GPU 效果，成本和无障碍要求不同。

对紧凑工作台，连续的磁吸位移会干扰命中位置，背景粒子会增加长时间运行成本。需要这些效果时，应放在独立预览或营销区域，并补上 reduced-motion、粗指针、屏外暂停和卸载清理。不能因为某个示例没有写该策略，就推断其依赖库一定已代为处理。

[Aceternity 官方组件目录](https://ui.aceternity.com/components) 可作为视觉发现入口；本轮没有本地完整源码，也没有对单个付费或在线组件完成源码审查，不给它们附加“已验证可移植”的结论。

### 4.3 EasyuseUI 的落地基线

已有 [CanvasEdge](../../components/ui/canvas-edge.tsx) 和 [CSS 动效](../../components/ui/canvas-edge.module.css) 使用来源状态、CSS 动画、视觉暂停与 reduced-motion，符合当前方向。真实运行暂停与视觉暂停必须继续分开。图版本变化、断线、unknown 和审批等待时，应停止可能误导用户的推进。

新增动效前固定触发事实、终止条件、中断行为、降级方式和性能预算。优先使用 CSS 的 opacity/transform；不要为纯装饰逐帧更新 React 状态。面板高度确需参与布局时测量真实内容，并验证快速反复开关、异步内容变长及 focus 返回。采用第三方动画依赖前检查客户端增量和独立安装，不以“增加动效”为理由默认扩大公共依赖。

## 5 复杂工作区

### 5.1 布局与状态所有权

[Mantine AppShell][mantine-shell] 通过 navbar、aside、header、footer 与响应式配置拆分布局责任。EasyuseUI 已有 WorkspaceShell，适合继续把侧栏偏好、Inspector 展示、底部高度和窄屏浮层状态分开，而不是替换整个外壳。

组件负责受控布局；适配层按 workspace ID 保存偏好；调用方按 object ID 管理草稿和读取。跨断点变化不应回写桌面偏好；编辑区域如果要卸载，必须先将需要保留的草稿移到稳定所有者。

### 5.2 工具栏与命令溢出

[Fluent Toolbar][fluent-toolbar] 把基础状态、可选中的值和方向键导航分层；[Overflow][fluent-overflow] 用容器观测与可见项快照处理空间不足。对命令密集的编辑器，可以保持高频动作可见，把次要命令移入更多菜单，并在宽度变化后保留当前焦点与动作身份。

WAI 的 [Toolbar 模式](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) 建议一个 Tab 入口和方向键导航，并提醒避免与工具栏导航共用方向键的输入控件发生冲突。本项目的 FilterToolbar 是包含搜索、筛选等内容的 `role=group`，这一选择合理；若新增命令 Toolbar，应独立实现其键盘模型，不能仅替换 role。

[Base UI Toolbar][base-toolbar] 在本地参考与已安装 1.8.0 中均有入口，可以优先评估其 CompositeRoot。无需为单一工具栏引入 Fluent 的整套运行依赖。

### 5.3 数据表格与批量操作

[Carbon DataTable][carbon-table] 在选择逻辑中处理禁用项与筛选范围，[TableBatchActions][carbon-batch] 独立表达已选数量与取消批量模式。[Fluent DataGrid][fluent-grid] 组合排序、选择、列尺寸与不同 focus mode。这些机制适合研究高密度数据界面，但交互 Grid 的维护成本明显高于普通 table。

EasyuseUI 的 [DataTable](../../components/blocks/data-table.tsx) 已有受控选择、隐藏选择保留、排序请求和单独激活入口。优先补有实际需求的列宽、显隐与顺序状态；跨页全选必须区分“这些 ID”与“整个查询结果”，不能从当前页数量推导总范围。批量写入继续沿用 Work Items 的逐项版本与回执模型。

[MUI TablePagination][mui-pagination] 明确处理未知总数 `count=-1`，并分开页码、每页数量、文案和回调。可借鉴“未知总数不是零”的建模。游标接口不应伪装成可任意跳页；排序或筛选改变时由调用方定义查询身份与游标失效策略。本地 `mui` 是 Material UI 仓库，这次没有检查 MUI X Data Grid 的源码与分发范围。

### 5.4 搜索、列表与性能

[Mantine Spotlight][mantine-spotlight] 将 actions、filter、limit 和 store 分离。EasyuseUI 已有 CommandPalette：查询、结果、loading/error 和激活由调用方控制，不应重复新建“搜索弹窗”。远程查询仍需绑定 query key，丢弃过期结果；快捷键只在明确启用的范围生效。

长列表应按需要选择完整 DOM、content-visibility 或窗口化。已有 [AgentRunVirtualList](../../components/blocks/agent-run-virtual-list.tsx) 用测量高度、可见窗口、焦点行保留和锚点补偿；Conversation 和 Activity 的屏外延迟布局仍保留 DOM。两种方式不能混称为虚拟列表。浏览器全文查找、复制、焦点和读屏需求应先于性能方案决定。

### 5.5 指标与图表

[Tremor LineChart][tremor-line] 将图例、tooltip、series、数值格式化和空数据文案组织在图表组件中，`connectNulls` 默认 false。可以研究这些可复用部分。业务指标仍需定义单位、时区、覆盖区间、分母、汇总口径与缺失值；不要把漂亮的折线当作指标已正确实现。

本项目已有 Sparkline、SegmentBar、AgentUsageHistory 等表达，也已有 工作区中的 `plans/workflow-analytics-components-plan.md` 分析组件计划（本轮不包含该并行文档的提交）。08:51 补充核对已出现并行的 Chart 与分析侧 ChartFrame 源码；下一步先核实其数据契约、分层、文本/表格替代与安装证据，再决定是否需要其他图表引擎。Canvas 是流程编辑器，WorkItemCalendar 是事项日期布局，它们不等于通用统计图表或日期选择器。

## 6 实施与验收方法

每项改进都记录：触发场景、当前数据所有者、选择的原语、状态轴、失败恢复、验证方式，以及是否涉及分发。审查现有组件时先查真实源码与 Manifest/Registry，再参考词典；有计划不等于已实现，工作区有文件也不等于已交付。

| 阶段       | 输出                                | 通过条件                                  |
| ---------- | ----------------------------------- | ----------------------------------------- |
| 语义与契约 | 属性、事件、状态、权限和数据所有者  | 不混淆选择、执行、请求完成和业务完成      |
| 最小组合   | 使用现有原语的可运行组件            | 键盘与指针都能完成同一任务                |
| 变体与恢复 | 长内容、错误、未知、主题与触摸样例  | 草稿/旧数据保留；状态信息无误导           |
| 分发       | 示例、Manifest、Registry、文案、CSS | 独立消费项目真实安装和操作通过            |
| 性能与证据 | 初次加载、暖切换、长列表/大图实测   | 说明样本与环境；不把 fixture 认作真实服务 |

推荐的最小场景集合是：Tab/Shift+Tab、Enter/Space、Escape、嵌套浮层、关闭后触发器消失、中文 IME、44px 触摸目标、窄/短视口、同对象刷新失败、切对象迟到响应、写入 unknown、reduced-motion 和主题 Portal。重要场景用实际 DOM 尺寸与原生输入操作检验。自动化 axe 扫描补充人工键盘与读屏检查，不能代替它们。

## 7 来源范围与采用决策

以下观察对应本地冻结提交，版本不等于上游未来版本。源码路径和完整 SHA 可在 [JSON 索引](./ui-reference-sources.json) 查到；“许可证观察”只记录本地文件，不扩大到网站内容、付费组件、其他仓库或所有依赖。

| 参考库            | 本轮代表实现                            | 采用方向                            | 许可证观察                                               |
| ----------------- | --------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| shadcn/ui         | Registry schema、Base Button            | 延续源码分发和变体分层              | 根 LICENSE.md 为 MIT                                     |
| Base UI           | DialogPopup、ToolbarRoot                | 继续作为交互基础                    | 根 LICENSE 为 MIT                                        |
| Radix             | Dialog、DismissableLayer                | 嵌套层与焦点审查方法                | 根 LICENSE 为 MIT                                        |
| Headless UI       | Dialog                                  | 背景约束与关闭顺序                  | 根 LICENSE 为 MIT                                        |
| Ark UI            | Splitter、Tree React hooks              | 状态与视图解耦                      | 根 LICENSE 为 MIT；底层 Zag 未展开审查                   |
| Chakra UI         | button recipe、slot context             | 变体参数与槽位职责                  | 根 LICENSE 为 MIT                                        |
| daisyUI           | button.css、themePlugin                 | 语义类与主题作用域                  | 根 LICENSE 为 MIT                                        |
| HeroUI            | React Aria Button、styles               | 多维变体与行为分离                  | 根 LICENSE 为 Apache-2.0，package 字段标 MIT；存在不一致 |
| HextaUI           | Button                                  | 反馈槽位；按本库规范重新设计        | 根 LICENSE 为 MIT                                        |
| Origin UI         | 两种 Input 组合                         | 同一语义的不同组合                  | 根 LICENSE.md 为 MIT                                     |
| Motion Primitives | TransitionPanel、AnimatedNumber、Dialog | 研究表现与生命周期                  | README 链接 MIT LICENSE.md，但快照未找到该文件           |
| Magic UI          | BorderBeam、NumberTicker                | 独立预览的按需效果                  | 根 LICENSE.md 为 MIT                                     |
| React Bits        | Magnet、Particles                       | 研究效果机制，不直接复制入 Registry | LICENSE.md 标 MIT + Commons Clause，并限制组件再分发     |
| Fluent UI         | Toolbar、Overflow、DataGrid             | 命令组织、列能力和焦点模型          | 根 LICENSE 为 MIT                                        |
| Carbon            | DataTable、TableBatchActions            | 数据与批量操作的职责分离            | 根 LICENSE 为 Apache-2.0                                 |
| Mantine           | AppShell、Spotlight                     | 布局槽位、命令搜索组合              | 根 LICENSE 为 MIT                                        |
| MUI               | TablePagination                         | 未知总数和受控分页                  | 根 LICENSE 为 MIT；未审查 MUI X                          |
| Tremor            | LineChart                               | 图例、tooltip、缺失点表达           | 根 LICENSE 为 Apache-2.0                                 |
| 21st Registry     | 配置与依赖解析                          | 分发来源与安装目标跟踪              | 根 LICENSE 为 MIT；不代表线上各作者组件                  |
| Aceternity        | 官方在线目录                            | 视觉发现入口                        | 未完成单组件授权和源码核对                               |

对 HeroUI 的声明不一致、Motion Primitives 的缺失许可证文件及 React Bits 的再分发限制，当前采用结论均为研究机制、保留来源，不复制代码进入 EasyuseUI 分发。需要实际摘取时，核对具体文件、版本、授权文本与依赖，并保留所需声明。本轮没有新增这些运行时依赖或复制其组件代码。

<!-- Frozen upstream source references are maintained alongside ui-reference-sources.json. -->

[shadcn-schema]: https://github.com/shadcn-ui/ui/blob/6ea090075cd537d3b792c6c1a625e2448b6ede26/packages/registry/src/registry/schema.ts#L100
[shadcn-button]: https://github.com/shadcn-ui/ui/blob/6ea090075cd537d3b792c6c1a625e2448b6ede26/apps/v4/registry/bases/base/ui/button.tsx#L1
[base-dialog]: https://github.com/mui/base-ui/blob/7e4b2f921cf0cafd62ea294675f1d670d1292dec/packages/react/src/dialog/popup/DialogPopup.tsx#L97
[base-toolbar]: https://github.com/mui/base-ui/blob/7e4b2f921cf0cafd62ea294675f1d670d1292dec/packages/react/src/toolbar/root/ToolbarRoot.tsx#L18
[radix-dialog]: https://github.com/radix-ui/primitives/blob/c432731c48097140bcca66947b0bdbcd9741e942/packages/react/dialog/src/dialog.tsx#L296
[radix-layer]: https://github.com/radix-ui/primitives/blob/c432731c48097140bcca66947b0bdbcd9741e942/packages/react/dismissable-layer/src/dismissable-layer.tsx#L90
[headless-dialog]: https://github.com/tailwindlabs/headlessui/blob/eea57cf46fd6767ed1059012f7073b88eb159fba/packages/@headlessui-react/src/components/dialog/dialog.tsx#L206
[ark-splitter]: https://github.com/chakra-ui/ark/blob/687b9dcba7c56f98da4db7bb8fac7d764ecd3f65/packages/react/src/components/splitter/use-splitter.ts#L12
[ark-tree]: https://github.com/chakra-ui/ark/blob/687b9dcba7c56f98da4db7bb8fac7d764ecd3f65/packages/react/src/components/tree-view/use-tree-view.ts#L22
[chakra-slots]: https://github.com/chakra-ui/chakra-ui/blob/f799e4d478d31fdae1311fad6c6de7cca47b9d3e/packages/react/src/styled-system/create-slot-recipe-context.tsx#L70
[chakra-button]: https://github.com/chakra-ui/chakra-ui/blob/f799e4d478d31fdae1311fad6c6de7cca47b9d3e/packages/react/src/theme/recipes/button.ts#L1
[hero-button]: https://github.com/heroui-inc/heroui/blob/83b92dfccf847856d277504fed64d954c2dd9066/packages/react/src/components/button/button.tsx#L20
[hero-styles]: https://github.com/heroui-inc/heroui/blob/83b92dfccf847856d277504fed64d954c2dd9066/packages/styles/src/components/button/button.styles.ts#L5
[daisy-theme]: https://github.com/saadeghi/daisyui/blob/8c24218588f34a678f48df435950790b57ef2bf7/packages/daisyui/functions/themePlugin.js#L10
[daisy-button]: https://github.com/saadeghi/daisyui/blob/8c24218588f34a678f48df435950790b57ef2bf7/packages/daisyui/src/components/button.css#L1
[origin-input]: https://github.com/shadcn/originui/blob/f4f366ae39759248d46b1252c52fbdc0bc01c285/registry/default/components/comp-01.tsx#L1
[origin-password]: https://github.com/shadcn/originui/blob/f4f366ae39759248d46b1252c52fbdc0bc01c285/registry/default/components/comp-51.tsx#L55
[hexta-button]: https://github.com/preetsuthar17/hextaui/blob/daaba0c3dc3f63931540b24b651929d3d1d2c4ea/components/ui/button.tsx#L17
[motion-panel]: https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/transition-panel.tsx#L1
[motion-number]: https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-number.tsx#L1
[motion-dialog]: https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/dialog.tsx#L65
[magic-beam]: https://github.com/magicuidesign/magicui/blob/cdb348cb4c72a9b54b554d8617801e479fbc8714/apps/www/registry/magicui/border-beam.tsx#L58
[magic-number]: https://github.com/magicuidesign/magicui/blob/cdb348cb4c72a9b54b554d8617801e479fbc8714/apps/www/registry/magicui/number-ticker.tsx#L17
[bits-magnet]: https://github.com/DavidHDev/react-bits/blob/b2098591ad5b3489eff65ca9e5b9f9bdf2de29c3/src/ts-default/Animations/Magnet/Magnet.tsx#L31
[bits-particles]: https://github.com/DavidHDev/react-bits/blob/b2098591ad5b3489eff65ca9e5b9f9bdf2de29c3/src/ts-default/Backgrounds/Particles/Particles.tsx#L127
[fluent-toolbar]: https://github.com/microsoft/fluentui/blob/8abb0781d7d8bdb5e7bccaad16a6e4ba7efaf1aa/packages/react-components/react-toolbar/library/src/components/Toolbar/useToolbar.ts#L25
[fluent-overflow]: https://github.com/microsoft/fluentui/blob/8abb0781d7d8bdb5e7bccaad16a6e4ba7efaf1aa/packages/react-components/react-overflow/library/src/components/Overflow/useOverflow.ts#L16
[fluent-grid]: https://github.com/microsoft/fluentui/blob/8abb0781d7d8bdb5e7bccaad16a6e4ba7efaf1aa/packages/react-components/react-table/library/src/components/DataGrid/useDataGrid.ts#L31
[carbon-table]: https://github.com/carbon-design-system/carbon/blob/1f808a5777e29329b814a51e6eee15c44ceac1c7/packages/react/src/components/DataTable/DataTable.tsx#L656
[carbon-batch]: https://github.com/carbon-design-system/carbon/blob/1f808a5777e29329b814a51e6eee15c44ceac1c7/packages/react/src/components/DataTable/TableBatchActions.tsx#L99
[mantine-shell]: https://github.com/mantinedev/mantine/blob/f7ab1ef52579366e2310fc12b1a12e88a821053a/packages/@mantine/core/src/components/AppShell/AppShell.tsx#L56
[mantine-spotlight]: https://github.com/mantinedev/mantine/blob/f7ab1ef52579366e2310fc12b1a12e88a821053a/packages/@mantine/spotlight/src/Spotlight.tsx#L69
[mui-pagination]: https://github.com/mui/material-ui/blob/edb9f2df1694fae5f04d027c785f0c4d10e492b5/packages/mui-material/src/TablePagination/TablePagination.js#L200
[tremor-line]: https://github.com/tremorlabs/tremor/blob/ca4d588f47820ff3d514d37fa4ee08a4222dec11/src/components/LineChart/LineChart.tsx#L495
[registry-deps]: https://github.com/21st-dev/registry/blob/93d686812df081cca6532f07bcb145ad22cc5d72/src/registry-dependencies.ts#L43
[registry-config]: https://github.com/21st-dev/registry/blob/93d686812df081cca6532f07bcb145ad22cc5d72/src/config-loader.ts#L17
