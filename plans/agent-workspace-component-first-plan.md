# Agent Workspace：组件先行、元素展示与技术栈迁移

日期：2026-10-11。执行主体：主代理维护规范和集成；用户指定的 `gpt-6-sol` / `xhigh` 子代理审计、实现并检查效果。状态：CF0–CF4 已完成本轮组件/fixture/分发验收；真实服务范围保持独立。该计划是[现有 Workspace 计划](agent-workspace-plan.md)的增量，不替代参考原文、CW 服务计划和 Pi 已有证据。

## 1. 定位、来源与范围

项目定位为简单组件展示、复杂组件构建和项目组合验证。先把所有适用元素以实际组件集中展示，核对视觉与状态，然后在页面复用；页面展示效果与设计规范分别维护。遵循 [AGENTS](../AGENTS.md)、[设计原则](../Design-rules.md)、[组件合同](../Component-Specification.md)、[开发指南](../DEVELOPMENT-GUIDE.md)。可采用其他项目和成熟库作为基础，先核对源码/API/版本/许可并记录改动，不直接复制未授权商业模板。

本轮实际实施：新增统一元素展示入口，MD01–MD17 同页可浏览；展示效果、设计规范、技术说明分开；复用原参考实验室的受控模块，保留其精细状态检查；构建 CodeMirror 6 只读 CodePreview 组件、独立示例与分发，再替换 FileViewer 的纯文本呈现。真实保存、Git、PTY、模型写权限不在本轮视觉改造中。

## 2. 元素审计与替换决策

| 元素 | 当前真实实现 | 改善方向 / 技术 | 本轮与后续 |
| --- | --- | --- | --- |
| MD01 全局栏 / MD02 导航轨 | ProjectSwitcher、ActivityNavigation、Button | 复用同组件展示身份/图标/当前态，不重新画 header | 本轮集中展示 |
| MD03 会话导航 | SessionNavigator、Tree/Item | 保留选中、运行图标与会话内视图；复杂跨树移动才评估 dnd kit | 本轮集中展示，移动引擎后续 |
| MD04 会话标题 | SessionHeader | 紧凑标题/元信息/能力动作复用 | 本轮集中展示 |
| MD05–07 历史/用户消息/Agent轮次 | AgentConversation、Conversation、ChatMessage | 保留浅蓝用户气泡、开放正文、真实阶段分隔和阅读锚点 | 本轮集中展示，不重写消息结构 |
| MD08 计划摘要 | AgentConversation 的计划片段 | 复用步骤来源；关系画布可由已有 React Flow 组件补充，不能推断依赖关系 | 本轮集中展示，关系图后续 |
| MD09 Read/Search | ToolCall 紧凑组 | 默认低噪声、异常常显、可展开 | 本轮集中展示 |
| MD10 文件修改 / MD16 文件与Diff | ChangeReviewPanel、FileViewer、DiffViewer | 文件纯 pre → CodePreview：代码语法、行号、搜索、选择；Diff 保留来源版本与反馈 | 本轮组件化替换文件预览；编辑/保存按 CW |
| MD11 Shell/Test | ToolCall、ExecutionSessionList | 日志/退出结果复用；结构化测试先有来源再增加 DataTable | 本轮集中展示，表格后续 |
| MD12 Composer | AgentComposer | 保持草稿、IME、焦点和能力入口；不在页面重造 textarea | 本轮集中展示 |
| MD13 队列 / MD14 审批 | InterventionQueuePreview、ApprovalRequestPanel、AttentionStrip | 共享来源回执的摘要与明细，不从点击推断执行成功 | 本轮集中展示 |
| MD15 资源标签 | DeferredWorkbenchPanels、ContextPanel | 复用受控 Tabs；Files/Plan/Context 各自有来源 | 本轮集中展示 |
| MD17 运行面板 | RuntimePanel + Tabs + ExecutionSessionList；Metrics/PTY 未接入 | 指标有数据时复用 Recharts 图表组件；交互终端走 xterm.js + Host PTY | 本轮集中展示真实不可用态，图表/PTY后续 |
| 实验室控制与目录 | 原生 select、逐模块检查 | 使用已有 Field/Select/Tabs/Button 等，建立统一展示布局组件，避免页面局部手搓样式 | 本轮 |

统一展示不代表各模块变成一张庞大业务 Dashboard。普通工作台依旧按任务展开；开发画廊用于比较全部元素。已有 `/regions/reference/` 是精细状态实验室，17 个节点挂载但默认仅一个可见，不能替代本轮元素画廊。

## 3. 技术栈声明

| 技术 / 基线 | 来源与职责 | 本轮采用状态与加载 |
| --- | --- | --- |
| Next 16.3.8 / React 19.3 / TypeScript / Tailwind 4 | 现有框架、类型、组件内样式与静态路由 | 沿用；页面只组装，不另造视觉 CSS |
| Base UI 1.8 / shadcn CLI / Lucide | 现有交互基础、源码分发、图标 | 沿用；不是改用 Radix |
| CodeMirror 6 | 官方 MIT 编辑器模块，候选最小 state/view/language/search 与语言支持 | 本轮新增直接依赖；固定安装版本，组件动态加载，先只读；版本与加载证据在实施记录登记 |
| Recharts 3.10.1 | 已安装，已有 Chart/StatisticalChart 等 | Workspace 指标尚未采用；来源数据明确后接入，不生成假指标 |
| React Flow 12.12.0 | 已安装，已有 Canvas/关系组件 | Workspace 关系图尚未采用；显式关系来源后再组合 |
| Zod / TanStack Query | 未直接采用的协议/只读缓存候选 | DG2 后续，不能以 schema 替代权限或回执 |
| TanStack Table / dnd kit / Zustand | 复杂表格、移动、订阅需求候选 | 先验证既有 DataTable/Tree/reducer 缺口再引入 |
| Faker / Monaco / xterm.js | 规模 fixture、IDE 备选、交互终端候选 | 确定性现有 fixture；Monaco 本轮不与 CodeMirror 并装；PTY 按 CW5 |
| ESLint / Prettier / Playwright | 现有工程与浏览器验收 | 沿用，并验证 Registry 独立安装 |

技术说明位于开发画廊和计划，普通会话不显示依赖版本或实现提示。参考：[CodeMirror](https://github.com/codemirror/dev)、[Recharts](https://recharts.github.io/en-US/guide/getting-started/)、[React Flow](https://reactflow.dev/learn)。具体适用 API 以安装版本为准。

## 4. 页面展示效果声明

**PG10 `/examples/agent-workbench/elements/`**：开发文档/fixture 页面。目标为“一页浏览全部元素 → 查看设计规范和实际技术 → 到原实验室检查复杂状态 → 打开组合工作台”。数据来自现有显式 fixture，操作只改内存，不执行服务。

上方是标题、fixture 说明、工作台/精细实验室入口和主题/语言控制；主体有“展示效果 / 设计规范 / 技术栈”三个开发视图。展示默认按全局导航、对话、工具与资源、运行与人工介入分组，全部 MD01–MD17 的实际组件可通过页面滚动访问；不能只显示静态卡片名称。元素区有标题、模块 ID、适用状态及实际预览。设计视图按同一 ID 描述合同和来源，技术视图明确已安装/本页使用/后续。

默认全部预览展开；页面整体滚动，长对话、Diff 和运行输出在有界组件视口内滚动。桌面可以多列，MD05/07/12/16 等内容组件跨宽列；1024px 收敛，390px 单列，页面不水平溢出。开发预览外框是画廊容器，不把普通会话/日志改成嵌套 Card。切开发视图/主题/语言保持草稿与组件身份；模块导航滚动并聚焦标题，不能误触运行。

PG02 原实验室和 PG04/PG08 工作台增加可发现的开发入口时，保持产品内容和导航语义；从元素进入实际工作台使用原路由，不能声称持有同一服务数据。现有 PG05 Pi 不加载新的 fixture，不改变权限。

## 5. 模块设计规范

| ID / 宿主 | 责任、API 与组件 | 视觉与状态合同 | 验收 |
| --- | --- | --- | --- |
| CF-M1 元素展示容器 / PG10 | 先建立可复用展示布局组件，接收标题、分类、模块 ID、预览、规范与技术信息；适配器只提供数据/React children。复用 Tabs/Button/Field/Select/DataRegion | 共享 token，中性背景、1px边、4px网格、32px控制；标题20px、模块14px；focus与selected分离；移动端44px命中；不以颜色独立传状态 | 所有17模块实际可见；键盘切视图、窄屏无溢出、组件状态保留 |
| CF-M2 参考模块目录 / PG02/PG10 | 从原 ReferenceLab 提取/复用受控模块，单模块检查与全量展示共享实现；以实例作用域隔离 DOM ID/回调/选区 | 沿用 MD01–17 和 V01–12；不复制另一套气泡/工具/底栏样式；数据/交互/runtime来源独立；未知不显示成功 | 不出现重复 ID；队列/审批定位仍正确；主题/语言及跨模块导航回归 |
| CF-M3 CodePreview / PG10、FileViewer宿主页、独立Demo | 受控只读文本、语言、可访问名称；先脱敏/截断后传引擎；复用 DataRegion/组件token；搜索和行号由 CodeMirror 提供 | 等宽12/20、选择清楚、中性主题；无保存操作，不能把截断文本作为完整可写文件；外部内容改变按版本更新，语言/主题更新不清选择/搜索 | 高亮实际渲染、键盘搜索、只读、大文本上限、深浅主题/双语、卸载清理、动态加载和独立安装 |

组件内允许必要 CSS/Tailwind/编辑器主题适配；`app/**/page.tsx` 只挂载组合组件。独立公共组件补 Manifest、Registry、Demo、便携样式与翻译；仅用于开发画廊的布局放开发组件层，不误列为已分发业务组件。

## 6. 实施与验收清单

- [x] CF0 更新项目定位、开发流程、页面/模块声明、技术与元素审计。
- [x] CF1 组件先行：统一展示布局、参考模块复用、CodePreview 组件和独立示例。
- [x] CF2 页面组合：PG10 所有元素实际预览；设计规范/技术视图；FileViewer 使用已构建 CodePreview。
- [x] CF3 实际检查：1440/1024/390、双主题/双语、键盘、搜索、只读、草稿/阅读保留、状态恢复、原实验室/工作台回归。
- [x] CF4 工程与分发：lint、typecheck、Webpack build、浏览器验收、独立安装、文档/Registry一致性，记录截图与实际加载。

实施记录使用 `plans/agent-workspace-component-first-log.md`，分别记录本轮完成与 CW/DG/服务剩余，不勾选未实现技术。生成文件与共享工作树中的并行修改单独核对，提交仅包含本任务增量。
