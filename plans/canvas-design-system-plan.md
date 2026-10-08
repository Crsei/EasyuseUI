# Canvas Design System 实施计划

日期：2026-10-08\
状态：M0–M5 组件能力已实现；M6 受控接口/本地验证已实现，真实服务接入按用户选择另行推进。最新验收证据见实施记录。\
依据：[canvas-craft.md](./reference/canvas-craft.md)、[设计规则](../Design-rules.md)、[组件契约](../Component-Specification.md)、[交互模式](../UI-PATTERNS.md)、[状态规范](../UI-STATES.md)。

## 1. 目标与交付边界

为 EasyuseUI 增加可通过 Registry 安装的 Canvas 组件体系，支撑 Agent Canvas、Workflow Builder、Idea Canvas 和 Session Graph。首先交付完整的本地编辑闭环，再补运行调试展示及复杂流程能力。

核心原则：画布展示结构，Inspector 展示配置，底部面板展示执行证据。节点、连线、表单和运行面板共享既有设计语言。

本计划按组件库范围制定：

- 组件库负责受控展示、编辑命令、图结构校验、交互与无障碍、可安装源码和示例。
- 消费方负责工作流业务语义、实际执行、网络传输、模型/工具目录、凭据、权限、审批、持久化和发布。
- 示例使用明确标记的内存 fixture；运行、保存和权限事实注明来源。通用组件接受真实适配器，但本地示例不冒充真实执行或云端保存。
- 多人协作、真实版本历史、环境切换和发布列入后续接入阶段。没有能力回调时隐藏入口或说明不可用原因。

## 2. 已核实的项目基础

| 领域          | 当前情况                                                              | 实施方式                                                        |
| ------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| 技术栈        | Next.js 16.3.8、React 19.3.0、TypeScript、Webpack                     | 保留工程结构；实施前阅读安装版本的 Next.js 对应指南             |
| Canvas 引擎   | 已锁定 `@xyflow/react@12.12.0`，已有编辑、运行、项目与服务组件        | 使用公开基础 API；持续执行独立安装与浏览器验证                  |
| 基础组件      | Button、Input、Dialog、Item、Badge、Tag、Chip、Tree、DataRegion       | 直接复用；不可把词典中的名称当成已有导出                        |
| 工作台        | WorkspaceShell 已有 sidebar、toolbar、inspector、bottomPanel 槽位     | 组合 CanvasWorkspace；必要扩展保持既有使用兼容                  |
| 详情面板      | Inspector 接收完整受控对象，支持 children                             | 复用布局和数据态；补通用空态文案接口，避免显示 Session 专用提示 |
| 运行展示      | RuntimeStatusBadge、ActivityTimeline、ToolCall、SessionRow、AgentRow  | 复用状态、日志与工具展示，不再造一套运行状态                    |
| 通用表单/菜单 | Select、Combobox、菜单、Tabs、Command Palette 等尚无通用实现          | 按当前里程碑的实际需求补齐，避免一次建设整套 Form Kit           |
| 分发          | registry.json、lib/catalog.ts、lib/visual-dictionary.ts、安装验证脚本 | 每个公开组件同步示例、目录、词典和 Registry 依赖                |

当前工作区存在大量未跟踪文件。实施时按路径修改并保留原有工作，不执行初始化、清理、批量暂存、提交或推送。

## 3. 参考内容的范围分配

原文提出的十五组能力全部保留在路线图中，但按依赖与验收成本分期。

| 原文能力组                                  | 首次交付                         | 后续增强                             |
| ------------------------------------------- | -------------------------------- | ------------------------------------ |
| Canvas / Background / MiniMap / Zoom / Fit  | M1                               | M5 大图优化、对齐辅助线              |
| BaseNode / Header / Status / Toolbar        | M1                               | M4 执行元信息，M5 容器节点           |
| Handle / Edge / Label                       | M1–M2                            | M4 运行路径、M5 复杂分支             |
| Palette / Quick Add / Search                | M2                               | M5 最近使用和更细分类                |
| Inspector / PropertyForm                    | M3                               | M5 动态复杂表单                      |
| Variable / Model / Tool / Credential Picker | M3 变量；M4 目录选择接口         | M6 真实目录与凭据服务接入            |
| Condition / Schema / Code Editor            | M3 简单条件与 JSON 文本校验      | M5 SchemaBuilder、表达式与代码编辑器 |
| Group / Frame / Subflow / Note / Comment    | M3 基础 Frame、StickyNote        | M5 折叠和 Subflow；M6 Comment Thread |
| Run / Execution / Trace / Logs              | M4                               | M6 真实执行适配                      |
| Selection / MultiSelect / Context / Command | M2 选择、菜单与等价按钮          | M5 通用 Command Palette              |
| UndoRedo / History / Autosave               | M2 本地撤销重做；M3 文件导入导出 | M6 持久化、版本历史、自动保存        |
| Error / Validation / Empty                  | M1 起贯穿各阶段                  | 随新能力补完整状态矩阵               |
| CollaboratorCursor / CommentThread          | M6                               | 由协作服务确认成员、事件与权限       |
| KeyboardShortcutOverlay                     | M2                               | 随新增命令更新                       |
| Publish / Version / Environment             | M6                               | 发布回执、冲突和权限联动             |

交付序列：**V1 = M0–M3；增量 = M4、M5、M6接口，各阶段通过M7。当前组件与接口已覆盖上述阶段，真实服务接入单列。**

## 4. 组件层次与文件落点

以下新增路径为建议名称，实施时先核对是否已有同类实现。

| 层次             | 文件/组件                                                                                                | 职责                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Foundation       | `styles/theme.css`                                                                                       | Canvas 表面、网格、节点、端口、连线、选中与焦点 token     |
| 数据模型         | `lib/canvas-model.ts`                                                                                    | 图文档、节点定义、端口、连线、选择与能力类型              |
| 编辑逻辑         | `lib/canvas-commands.ts`、`lib/canvas-validation.ts`                                                     | 原子编辑、撤销重做、结构/连接校验                         |
| Primitive        | `components/ui/canvas-node.tsx`、`canvas-port.tsx`、`canvas-edge.tsx`                                    | 引擎适配及统一节点/端口/连线呈现                          |
| Product Patterns | `components/blocks/workflow-canvas.tsx`、`node-palette.tsx`、`node-inspector.tsx`、`variable-picker.tsx` | 画布编辑、插入、配置、变量选择                            |
| 组织模式         | `components/blocks/canvas-frame.tsx`、`canvas-note.tsx`                                                  | 视觉分组及流程说明，不携带执行语义                        |
| Runtime          | `components/blocks/canvas-execution-panel.tsx`                                                           | 输入/输出/详情/Trace，组合 ActivityTimeline 与 ToolCall   |
| Workspace        | `components/blocks/canvas-workspace.tsx`                                                                 | 组合 WorkspaceShell、画布、Inspector 和底部面板           |
| 本地适配         | `components/examples/canvas-workspace-demo.tsx` 及 fixtures                                              | 内存文档、示例节点、故障场景、模拟运行                    |
| Page             | `app/workspace/canvas/page.tsx`                                                                          | 建议入口 `/workspace/canvas/`，只装配示例，不承载组件实现 |
| 分发与验证       | `registry.json`、`lib/catalog.ts`、`lib/visual-dictionary.ts`、`tests/canvas*.spec.ts`                   | 可发现、可安装及行为验收                                  |

模型文件与组件文件使用不同 basename，避免 Registry import rewriting 冲突。公开组件随源码分发 CSS Modules、模型及工具函数；共享 token 仍仅从 theme.css 提取。

引擎首选 `@xyflow/react`。官方文档列出 Background、MiniMap、Controls 和 Panel 等基础组件，可作为画布底层；本项目仍需自行补齐业务命令、连接规则和产品交互。[React Flow 内置组件](https://reactflow.dev/learn/concepts/built-in-components)

## 5. 必须先确定的契约

### 5.1 图文档与状态所有权

- `CanvasDocument`：schemaVersion、id、revision、nodes、edges、frames、notes；viewport 作为可选布局数据保存。
- `NodeDefinition`：type、名称、分类、图标、端口 schema、默认配置、配置渲染与校验能力。内置示例与业务节点注册分开。
- 节点记录：稳定 id、type、position、config、可选 parentId；连线使用稳定 nodeId/portId，不依赖显示名称。
- 文档和选中对象受控；引擎临时拖动、弹窗、焦点属于本地 UI 状态。执行事件不写入图文档，不进入撤销历史。
- 编辑通过命令事务提交；拖动结束产生一次历史记录，删除节点及关联连线、插边、批量移动均可整体撤销。
- 运行快照携带 runId、documentRevision、nodeId、attemptId 或等价关联键。旧运行事件不得覆盖新运行；旧版本结果显示所属版本。
- 保存、运行、停止、审批和发布回调只表示请求能力；Promise resolve 不自动表示业务完成。

### 5.2 连接与变量规则

- Port 明确方向、类型、必填性和连接数量；第一版提供 string、number、boolean、object、array、message、tool、model 等类型元数据。
- 类型颜色仅作辅助，保留名称、方向及可读的错误原因。统一端口形状，不凭颜色判断可连接性。
- 默认只允许 output → input；拒绝悬空引用、重复边、不兼容类型、超过连接上限、自环及默认 DAG 中的回路。
- 类型兼容默认明确匹配；复合类型、强制转换和业务规则由显式策略提供，不静默转换。
- 变量以 nodeId、portId、path、类型关联，展示名变化不破坏引用。选择范围由上游可达性与当前作用域确定；删除来源或改类型后产生可定位的校验问题。
- 插入连线中的节点前校验两侧端口；成功时一次替换为两条边，失败保留原图。删除中间节点默认不自动桥接。
- Group/Frame 仅组织视觉；Subflow 有显式输入输出；Loop/Iteration 在 M5 单独定义循环语义，不能靠允许任意回路替代。

### 5.3 状态与视觉

- 复用十种 RuntimeStatus。原文 Success 映射 completed、Error 映射 failed、Waiting for user 映射 waiting + 原因；pending/skipped 保留为调度事实或阶段，不直接加入公共枚举。
- warning 是校验问题；disabled/read-only 是可操作性；selected/focus 是交互态；加载/空/部分/失败/成功是数据态，彼此可同时存在。
- 结果未知使用独立 outcome 标记，保留最后确认状态与回执；先查询对账，再允许后续写操作。连线不从动画或两端成功推断实际执行。
- 默认节点宽建议 240px、标题区高 40px、内容间距 8/12px；最终尺寸在 M0 写入组件契约。紧凑控件高 32px、粗指针目标至少 44px。
- 中性节点表面、细边框；选中与焦点分别显示。运行态用小图标和 RuntimeStatusBadge，不使用整块红绿填充或持续发光。
- 点阵、类型色、边、状态和焦点统一深浅主题；减少动态效果时停止流动连线及持续动画。

### 5.4 键盘、触摸与响应式

- 提供新增、选中、移动、删除、连接、断开、缩放、定位与撤销的键盘路径；连接操作有“选择来源端口 → 选择目标端口”的表单替代，不要求拖线。
- 快捷键仅在对应编辑上下文生效，输入框、代码编辑器及 IME 组合输入优先处理文本；Escape 按浮层层级关闭并恢复焦点。
- 提供节点列表作为图的可读导航入口。操作后播报结果和错误，不逐帧播报坐标。
- 复用 Shell 的 Inspector 桌面停靠、窄屏抽屉和焦点约束；底部默认 240px，调整范围 200–400px，补齐指针与键盘 resize。
- 触摸使用明确平移/选择模式；Palette 支持点击添加，Edge 操作不依赖 hover。缩小视口时收起面板，保持画布可操作。
- 基础键盘能力参考引擎官方无障碍文档，但新增端口、工具栏和表单仍须单独验收。[React Flow 无障碍指南](https://reactflow.dev/learn/advanced-use/accessibility)

## 6. 执行里程碑

### M0 · 契约与技术验证（P0）

依赖：无。

- [x] 对照参考文档完成 CanvasNode、Port、Edge、Frame、Palette、Inspector、ExecutionPanel 契约，补入 Component-Specification.md。
- [x] 用最小客户端样例验证 React/Next/Webpack 与拟选引擎版本兼容、容器尺寸、SSR/hydration、主题及 CSS 加载。
- [x] 提前在独立消费项目验证引擎样式导入、Registry 依赖与构建，检查许可证和所需示例的使用条件。
- [x] 确定文档 schema、编辑命令、节点注册及连接策略；记录性能基线环境。

验收：最小两节点一连线样例可运行并可安装，无 hydration 错误；契约和依赖选择有记录。失败则先解决兼容/分发问题，再进入 M1。

### M1 · Canvas Foundation 与图元（P0）

依赖：M0。

- [x] 增加主题 token、Canvas 容器、网格、MiniMap、缩放百分比、Fit View、平移/选择模式。
- [x] 实现统一 BaseNode、Header、Summary、Status、Port、Edge、EdgeLabel 以及交互/数据/运行状态组合。
- [x] 接入受控 nodes/edges、对象选择、只读模式和 DataRegion 五态；只读允许浏览但阻止所有文档修改入口。
- [x] 为公开图元增加可运行示例、Catalog 和 Registry 项。

验收：双主题下节点、端口、连线可读；选择与焦点独立；空画布能引导新增；加载失败不伪装为空图；已有图刷新失败仍保留。

### M2 · 编辑命令闭环（P0）

依赖：M1。

- [x] NodePalette：分类、搜索、无匹配状态；支持点击和拖放新增，Quick Add 共用同一节点目录。
- [x] 完成移动、多选、批量删除、复制粘贴、连接/重连/断开、边中插入及节点搜索定位。
- [x] 加入原子撤销/重做；复制分配新 ID 并重映射内部边，外部引用按规则保留或显式报错。
- [x] 完成菜单、可发现的等价按钮、快捷键帮助和键盘连接替代；不在输入时误删节点。
- [x] 校验失败指向具体节点/端口，取消操作不改变图。

验收：用户可从空图构建 Input → Agent → Tool → Output，完成连线和插边，再撤销/重做恢复准确图结构；无悬空边、重复 ID 或只读绕过。

### M3 · 配置、变量、组织与 V1 页面（P0）

依赖：M2。

- [x] NodeInspector 复用 Inspector；提供 Input、Agent、Model、Tool、Condition、Output 六类示例配置，Node 仅显示摘要。
- [x] 按需补文本、多行文本、选项、数字和 JSON 配置；保留无效输入草稿，明确应用/放弃与错误定位。
- [x] VariablePicker 复用 Tree 的单选键盘模型，支持搜索、类型及来源预览，插入结构化引用；不修改现有 Tree 为多选树。
- [x] 提供基础 Frame 分组与 StickyNote；移动分组保持成员相对位置，删除分组默认解组保留成员。
- [x] 加入版本化 JSON 导入导出：校验大小/节点数限制、版本、ID、端口和引用；不兼容文件先报错，原文档保留；替换操作可整体撤销。
- [x] 导出只包含配置与必要引用，不包含凭据明文或运行输出。未知节点保留原始数据并显示不可编辑占位，不静默丢弃。
- [x] 组合 `/workspace/canvas/`；提供基础 Agent 流程和条件分支样例，以及可重复的状态/故障 fixture。
- [x] 明确内存草稿离开/刷新即丢失；有未导出修改时提供可用的离开提示，导出失败保留草稿。

验收：编辑配置影响节点摘要和校验；切换对象不串数据；变量失效可定位；导出后重导入保持图结构与配置；错误文件不覆盖草稿。通过 M7 对应项后交付 V1。

### M4 · 运行调试与 Agent 扩展（P1）

依赖：V1。

- [x] 定义运行适配接口与 fixture：Run、Stop、查询结果、单节点/从此处/到此处运行按能力显示；缺少上游输入时解释不可运行原因。
- [x] 增加 Session、Subagent、Human Approval 示例节点；Model/Tool/Credential 选择器接收消费方提供的受控目录，凭据只展示 ID/名称及可用性。
- [x] Node/Edge 接收权威执行快照；按 runId、版本和事件 ID 处理重复、乱序、断线与迟到事件。
- [x] Execution Inspector 展示 Input、Output、Details、Trace；底部面板提供 Logs、Activity、Variables、Errors，复用现有组件。
- [x] Token、耗时、模型、上下文用量和产物仅显示来源字段；缺失值显示“—”。输出先脱敏再渲染/复制/导出，预览有大小上限。
- [x] 显式批准/拒绝；提交中防重复；未知写结果先对账；取消待确认不立即显示 cancelled。

验收：通过正常、失败、等待审批、未知结果、断线、刷新失败和旧事件场景；日志只在距底部 64px 内跟随。fixture 通过仅记为 UI/适配契约证据，真实服务验收单列。

### M5 · 复杂图与高级配置（P2）

依赖：V1；执行相关能力另依赖 M4。

- [x] Frame 折叠/展开、批量组织、对齐辅助线、节点最近使用、Command Palette。
- [x] Subflow 导航、输入输出边界、返回路径、递归引用校验；折叠后保留真实边端点，不通过删除边隐藏内容。
- [x] Loop/Iteration 容器、Switch、Parallel、Merge；逐项定义作用域、可连接规则和结果归属。
- [x] ConditionBuilder、SchemaBuilder、KeyValueEditor、ExpressionEditor、代码/JSON 编辑器按真实场景逐项增加；代码编辑不默认包含代码执行。
- [x] 完成 200+ 节点场景的导航、搜索、选择和面板更新优化，评估渲染订阅和大输出预览成本。

验收：至少一个包含分组、嵌套子流程与变量边界的综合样例；进出子图保持选择/视口；每种新能力都有独立契约与安装测试，不仅增加静态外观。

### M6 · 持久化、协作与发布接入（P2，按消费项目推进）

本轮用户选择“先完成受控接口和本地验证，真实服务稍后接入”。以下前四项勾选仅表示接口、组件和故障 fixture 已交付；真实服务端到端验收保持未完成。消费方提供存储、执行与权限接口，协作需要明确冲突协议。

- [x] Autosave 由 revision/服务端回执确认 Saved；失败保留草稿；冲突不得静默覆盖。
- [x] 区分本地 UndoRedo 与服务端版本历史；版本恢复是有权限、有确认结果的操作。
- [x] Comment/Thread 与 StickyNote 分开；协作 cursor/presence 是临时状态，成员和权限由服务确认。
- [x] Environment、Share、Publish 通过受控能力接入；未知发布结果先查询回执。
- [ ] 真实模型、工具、审批与执行链按消费方测试环境逐一验收。

验收：接入方提供真实端到端证据；组件示例中不存在模拟“发布成功”或虚构在线成员的正式能力承诺。

### M7 · 分发、回归与交付关卡（P0，贯穿每个版本）

以下勾选记录当前组件与接口的交付关卡；每个后续接入版本必须重新验收。性能实测与来源边界见实施记录。

- [x] 每个公开组件具备源码、CSS、示例、Catalog、Registry 项与词典实现标记；内部零件明确归属父组件。
- [x] 更新 README、UI-PATTERNS、UI-STATES 及组件契约；安装说明覆盖引擎 CSS 和容器高度。
- [x] `pnpm lint`、`pnpm typecheck`、`pnpm build`；Registry 构建包含在 build 中。
- [x] 浏览器测试覆盖新增行为和 WorkspaceShell、Inspector 等受影响的既有路径。
- [x] 修改可分发源码/CSS/依赖后运行 `pnpm test:install`，并为安装后的 Canvas 增加浏览器挂载验证，确认样式、端口、连线和操作实际可用。
- [x] 开始测试/构建前检查 3010/3011 的进程归属；3010 复用现有开发服务；3011 按 Playwright 配置启动测试服务，冲突时先解决归属问题。
- [x] 若共享构建输出会影响现有服务，使用包含本次改动的隔离副本验证；不通过停止未知服务获取端口。

## 7. 验收矩阵与证据要求

| 场景       | 必须证明                                                              | 证据                               |
| ---------- | --------------------------------------------------------------------- | ---------------------------------- |
| 图编辑     | 添加、连接、插边、复制、删除、撤销后文档一致                          | 命令/校验测试 + 浏览器操作         |
| 无效连接   | 类型、方向、数量、回路错误被拒绝，原图不变                            | 定向边界测试                       |
| 配置与变量 | 无效草稿保留，改名引用稳定，删除来源产生诊断                          | 浏览器流程 + 文档断言              |
| 对象切换   | A 的迟到响应不污染 B；新 run 不被旧 run 覆盖                          | 可控异步 fixture                   |
| 状态       | 五种数据态、十种运行态、未知字符串与 unknown outcome 不混淆           | 状态矩阵截图/断言                  |
| 只读       | 鼠标、键盘、菜单、拖放及导入等写入口均受约束                          | 浏览器负向测试                     |
| 无障碍     | 键盘构图、焦点恢复、读屏名称、触摸替代、减少动态效果                  | 自动检查 + 人工键盘/读屏记录       |
| 响应式     | 桌面三栏、窄屏抽屉、面板不遮挡关键动作                                | 1440/1024/390px 与粗指针测试       |
| 输出与审批 | 渲染/复制/导出脱敏，显式授权，未知结果禁止重复写                      | 故障 fixture 与回调断言            |
| 分发       | 独立项目安装、构建和浏览器操作成功                                    | 安装日志 + 消费项目浏览器证据      |
| 性能       | 50 节点基线、200 节点/约300边压力图；操作期间不反复重置视口或阻断输入 | 指定机器/浏览器的录制与测量        |
| 真实接入   | 服务确认保存、运行、取消、审批或发布结果                              | 接入方回执/关联 ID，独立于 UI 测试 |

性能暂定预算：在 M0 记录的基线环境，200 节点样例首次可操作不超过 2s，选中到 Inspector 更新 p95 不超过 100ms，连续拖动目标达到 30fps。M0 实测后固定适用环境与可实现预算；不将上述目标描述为已通过结果。

每次交付记录：完成范围、未完成项、测试命令与结果、截图/trace 路径、安装证据、服务接入情况。所有未执行、失败或受环境影响的检查明确标记，不用本地模拟结果替代真实业务验收。

## 8. 当前阶段与后续接入

2026-10-08：已完成本地编辑闭环、运行调试与故障适配、嵌套流程/边界/高级配置，以及保存、版本、讨论、环境和发布的受控接口。入口包括 `/workspace/canvas/`、`/workspace/canvas/project/`、`/workspace/canvas/services/`、`/workspace/canvas/stress/`。

用户已明确将真实服务接入留待后续；继续消费项目集成时，需提供存储 CAS/回执、执行/审批、权限/协作冲突协议和发布查询接口。当前浏览器与安装验证不代表这些服务已经连接。

按最新反馈，四个画布工具页已使用全窗口布局；场景选项与底部内容可收起，文档预览保持独立尺寸。1440×900窗口绘图区高度由360px增至约653px。

性能预算保持2s/100ms/30fps，实测结果和共享主机负载限制见实施记录；不以调整预算掩盖未达项。每个后续接入版本重新执行 M7。

实施证据见 [canvas-implementation-log.md](./canvas-implementation-log.md)，接口与使用说明见 [CANVAS.md](../CANVAS.md)。


## 9. 逐节点演示与执行动画增量

自动播放为本地适配层能力：稳定拓扑顺序、节点/连线独立阶段、完整递增快照、查询纯读取。运行栏提供暂停演示与设置菜单，设置包含暂停后的单步、0.5/1/2倍速及流光/粒子/关闭动画。初始不运行，运行后默认1倍速，每阶段1000ms。审批、断线、unknown、版本变更和卸载按既有权威来源契约处理；停止的提交与确认分开。

可分发组件增加可选 CanvasExecutionVisuals 和 runtimeToolbar 插槽。CSS/SVG 动画仅用于活动图元，公共组件没有演示计时器；图编辑、多选框选、视口、撤销、主题、键盘/触摸和 reduced-motion 保持现有契约。真实服务、分支表达式求值和实际并发执行继续由消费方负责。

验证覆盖阶段顺序、只读查询、暂停/单步/速度、视觉变化、审批/失败/unknown/断线/取消、文档身份、隐藏页面、国际化、触摸、多选框选、性能及独立安装。实际结果在实施记录中补充。
