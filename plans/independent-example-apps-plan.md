# 示例项目独立构建与主站组件展示迁移计划

日期：2026-10-11。状态：按用户优先级先实施 Agent Workspace；具体声明见 [Agent迁移声明](agent-workspace-independent-migration.md)，证据见 [实施记录](independent-example-apps-log.md)。其余应用、apps/docs目录迁移和EX0–EX7整体验收仍待后续；未切换Bun。

## 1. 目标、适用原则与完成定义

用户要求：所有完整示例项目独立开发、构建、测试和部署；主站项目页面只保留对应组件的真实展示、设计规范和独立应用入口。采用同仓库多应用结构，共享组件单一来源。独立应用按产品边界划分，不把每个演示路由、模板、压力场景都变成一个应用。

遵循 [AGENTS.md](../AGENTS.md)、[开发指南](../DEVELOPMENT-GUIDE.md)、[设计原则](../Design-rules.md)、[组件规格](../Component-Specification.md)、[UI 模式](../UI-PATTERNS.md)、[UI 状态](../UI-STATES.md)、[国际化](../I18N.md)及[组件契约技能](../skills/implementation/easyuseui-component-contracts/SKILL.md)。本轮以复用模式执行：先列元素与现有导出映射，补组件边界，再组装应用；主站画廊和独立应用消费同一套实际组件。

交付必须同时满足：

- 主站可独立构建，不编译、类型检查或预渲染完整示例应用源码；允许构建主站自己展示的公共组件及有限 fixture。
- 任一示例可单独构建，只处理自身和声明的共享依赖；其他示例私有源码的错误不能阻断它。共享组件错误仍会影响使用该组件的消费者，不能承诺完全故障隔离。
- 每个应用具有独立 package.json、路由、配置、类型检查范围、环境示例、测试、产物目录和部署说明。
- 主站每个项目展示页实际挂载适用组件及状态，关联组件文档、来源和验收；不能退化成名称清单、截图目录或单模块选择器。
- Registry 源码安装仍可在仓库外使用；workspace 内部包导入不能泄漏到安装产物。
- 已有 fixture 行为和已验证 Pi 会话/历史链路保持；迁移不扩展权限，不把历史验收直接视为新应用验收。

范围包括 app/examples 下完整项目，以及 app/workspace 下实际承担完整项目的入口。Scroll、StyleWorkbench、通用组件合同与布局实验属于组件展示，保留在主站。Bun 迁移是拆分后的独立工作包，本计划先沿用 Node 24 / pnpm 11.9 / Webpack，以便把结构变化与运行时变化分别验收。

## 2. 当前源码审计与具体耦合

当前根 package.json 同时拥有 Next、Registry、文档、Playwright 及 Pi Host 转发命令；pnpm-workspace.yaml 只登记 services/pi-host。next.config.ts 使用 output: export；app/examples 有 15 个 page.tsx，另有 workspace 和 benchmarks 路由。

| 来源                                                       | 已核对的现状                                                                  | 迁移必须处理                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| app/layout.tsx、components/site/site-frame.tsx             | 根布局注入站点双语、主题和外壳，SiteFrame 根据路径隐藏站点外壳                | 独立应用建立自己的 Provider/布局；删除主站对完整应用路径的特殊渲染分支                |
| app/examples/agent-workbench/layout.tsx                    | 所有后代含 Pi、元素画廊都挂 WorkbenchExampleProvider                          | 主站展示只保留局部 fixture；独立应用隔离 fixture 与 Pi Provider，不能继承演示执行状态 |
| components/examples/agent-workspace/reference-lab.tsx      | 画廊复用真实组件，但导入 agent-workbench fixture、导航、资源面板等            | 抽出公共展示组件和有限展示数据，切断主站画廊对完整应用的传递依赖                      |
| lib/component-manifest.ts、lib/catalog.ts、registry.json   | 文档记录公共源码和 components/examples 内的示例路径                           | 按所有者重映射；Catalog 保持 Manifest 重导出；不得让文档生成顺便编译完整应用          |
| lib/example-manifest.ts、scripts/build-docs.mjs            | 入口 href 被限制为站内路径；三种 Agent 模板分列在画廊，CRM/SVG 尚未列入该清单 | 增加独立应用元数据，站内 showcase 与外部 app 地址分字段；补齐七个应用，保留模板深链接 |
| scripts/build-registry.mjs                                 | 直接从根 components、lib、styles 读文件，并写 public/r                        | 明确仓库根、组件源码根和 docs 输出根；维护路径改写及 CSS/工具依赖闭包                 |
| tsconfig.json、eslint.config.*                             | 根 TS include 使用 `**/*.ts`、`**/*.tsx`，当前仅排除 Pi Host 等               | 改为包级范围；根检查改为显式聚合，不能让 docs 的类型检查扫入全部 examples             |
| scripts/check-install.mjs、scripts/check-theme-install.mjs | 默认根 public/r 与 pnpm 消费项目流程                                          | 解耦源码根/Registry 产物根/预览地址；保留 replace、host、scoped 安装验证              |
| playwright.config.ts、.github/workflows/quality.yml        | 当前单一预览入口和全站检查链                                                  | 分包配置、端口、产物和 CI job；共享改动触发消费者，应用私有改动只触发对应应用         |

实现 EX0 时补机器可读逐文件清单：旧路径、目标所有者、新路径、运行/构建/类型/样式/资源引用、对应测试、迁移状态。所有未跟踪或并行改动先核对，不能直接整目录搬走。

## 3. 目标目录、包和依赖方向

```text
EasyuseUI/
├── apps/docs/                         # @easyuse-ui/docs：主站与组件展示
│   ├── app/                          # 文档、项目组件画廊、兼容入口
│   ├── components/                   # 站点外壳、docs 布局、展示适配器
│   ├── demos/                        # 组件/模块的有限 fixture
│   ├── lib/                          # 站点消息、Manifest、导航、搜索
│   ├── public/                       # 主站图片、源码预览、Registry 产物
│   └── tests/
├── examples/
│   ├── agent-workspace/              # @easyuse-ui/example-agent-workspace
│   ├── agent-board/                  # @easyuse-ui/example-agent-board
│   ├── work-items/                   # @easyuse-ui/example-work-items
│   ├── workflow-analytics/           # @easyuse-ui/example-workflow-analytics
│   ├── sales-crm/                    # @easyuse-ui/example-sales-crm
│   ├── canvas/                       # @easyuse-ui/example-canvas
│   └── svg-workbench/                # @easyuse-ui/example-svg-workbench
├── packages/
│   ├── ui/                          # @easyuse-ui/ui：可分发组件单一源码
│   │   ├── components/{ui,blocks}/
│   │   ├── lib/                     # 公共模型、hooks、便携双语
│   │   └── styles/theme.css         # 迁移后的唯一共享 token 来源
│   └── pi-protocol/                 # @easyuse-ui/pi-protocol：浏览器/Host 共享协议
├── services/pi-host/                # 原服务包，独立运行与持久化
├── scripts/                        # 分发、迁移、依赖边界与 CI 编排
├── plans/                          # 页面/模块契约与执行记录
└── pnpm-workspace.yaml              # apps/*、examples/*、packages/*、services/*
```

每个 `examples/<id>` 均有自己的 app、src、public、tests、package.json、tsconfig、next.config、Playwright 配置、.env.example、README 和部署说明。初轮保留 Next/React，复用当前页面行为，不在拆分中换框架。

允许方向：docs → ui；example → ui；Agent Workspace → pi-protocol；Pi Host → pi-protocol。Host 与前端通过 HTTP/SSE 交互。禁止 ui → docs/example/service、docs → example 应用源码、example A → example B 私有源码、Host → 浏览器组件。小规模 fixture 归消费者；跨应用复用的真实能力经审查后提为受控组件/公共模型，不设含全部示例的万能 shared 包。

ui 初轮采用源码子路径导出，不建立一个静态导出所有重型模块的入口；React/React DOM 以 peer 约束保持单实例。CodeMirror、React Flow、Recharts 等保持模块级加载，包管理依赖安装范围与浏览器下载范围分别记录。公共代码内部导入改为包内相对路径，不能把 @/ 解析到应用根。Registry 以同一源码生成消费方相对/alias 导入，保留 CSS、副作用和 use client 边界。

主题唯一源迁至 packages/ui/styles/theme.css，迁移当次同步 AGENTS、组件规格、技能与 Registry 提取器；不留两个可独立修改的 token 文件。各应用 Tailwind 扫描只涵盖自身与实际公共源码，测试公共 class、CSS Module、浮层和主题边界。各应用的 @/ 仅指向自身；根 TS 配置只共享 compilerOptions，不共享全仓 include。

## 4. 全量路由与项目归属

下表是目标映射，独立应用路径相对于它自己的 origin。主站地址默认保留为组件展示/明确兼容导航，不继续挂载完整应用。

| 当前路由                                                      | 独立应用目标                                       | 主站最终处理                                                          |
| ------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| /examples/agent-workbench/                                    | Agent Workspace /，三模板属于同一应用              | Agent 组件总展示，主 canonical 为 /examples/agent-workbench/elements/ |
| /examples/agent-workbench/elements/                           | 无需迁走完整画廊                                   | 保留 MD01–MD17 全量组件画廊，解除应用 Provider/fixture 依赖           |
| /examples/agent-workbench/app/、/workspace/                   | Agent Workspace /，保留 template/page/session 语义 | 原地址改为 Agent 组件展示兼容入口，提供打开独立应用动作               |
| /examples/agent-workbench/layouts/                            | Agent Workspace /layouts/                          | 保留布局组件演示，删除完整应用路由控制器                              |
| /examples/agent-workbench/regions/                            | Agent Workspace 中相应场景入口                     | 主站保留模块展示，和 elements 共用展示数据与组件                      |
| /examples/agent-workbench/regions/reference/                  | 需要的应用行为进入应用回归                         | 主站保留组件精细状态实验室；不继承完整应用状态                        |
| /examples/agent-workbench/regions/intervention/               | 应用保留介入交互场景                               | 主站保留受控审批/队列组件 fixture，不挂服务                           |
| /examples/agent-workbench/pi/                                 | Agent Workspace /pi/                               | 组件展示加服务入口说明；不加载 PiClient/连接配置/凭据                 |
| /examples/sales-crm/                                          | Sales CRM /                                        | CRM 组件画廊，复用表格、筛选、对象 Sheet 和私有主题预览               |
| /examples/work-items/、/workspace/work-items/                 | Work Items /                                       | 前者为五视图组件画廊；后者兼容到该画廊                                |
| /examples/workflow-analytics/                                 | Workflow Analytics /                               | 图表、指标、下钻、Dashboard 等公共模块画廊                            |
| /examples/workflow-analytics/baseline/                        | Workflow Analytics /baseline/                      | 展示入口/历史说明，完整项目基线不在主站构建                           |
| /examples/workflow-analytics/benchmark/                       | Workflow Analytics /benchmark/，仅测试构建启用     | 主站保留验证说明，不生成规模 fixture 页面                             |
| /workspace/agents/、/workspace/agents/scale/                  | Agent Board /、/scale/                             | 前者为运行看板组件画廊；后者兼容到画廊验证说明                        |
| /workspace/canvas/、/project/、/services/、/stress/（同前缀） | Canvas /、/project/、/services/、/stress/          | Canvas、Project、ServicePanel 组件预览；stress 仅验证说明             |
| /workspace/svg/                                               | SVG Workbench /                                    | SVG 浏览/编辑/预览/导出组件的有限素材展示                             |
| /benchmarks/canvas/[size]/                                    | Canvas 测试入口 /benchmark/[size]/                 | 不再由主站生成；保留文档链接和原 URL 的说明入口                       |
| /benchmarks/streams/                                          | 独立组件性能测试夹具，归 ui 的测试任务             | 主站正式构建移除规模夹具，相关组件仍在文档正常展示                    |
| /benchmarks/common-components/                                | 无独立产品                                         | 保留普通组件展示，性能执行归测试任务                                  |
| /workspace/layout/、/workspace/shell/                         | 无独立产品                                         | 保留 ControlledWorkspace / WorkspaceShell 展示                        |
| /examples/component-contracts/                                | 无独立产品                                         | 保留组件合同与可访问性展示                                            |
| /examples/、/components/、/docs/**、/dictionary/、/blog/**    | 无独立产品                                         | 主站保留，更新来源路径和导航                                          |
| /scroll/、/style-workbench/                                   | 无独立产品                                         | 保留文档/独立组件预览，不复制完整项目外壳                             |

Agent 的 coding/artifacts/console 是同一应用的模板，不能拆成三份状态管理。主站不存在但已有计划的 Work Items 六个 showcase 路由，在实施对应工作包时按“组件状态展示留 docs，项目业务流程入独立应用”归属，不在本计划提前声明已存在。

## 5. 应用源码与主站元素映射

实施前把下表展开到每一个可见元素、导出、资源和回调；完整元素账本为 EX0 产物，不能仅用这张模块索引作为最终验收。

| 项目/原实现                                                                         | 独立应用拥有                                                                           | 主站保留/抽取的组件展示                                                                                                                                   | 契约依据                                                                                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Agent Workspace：components/examples/agent-workbench、pi-workspace、agent-workspace | WorkbenchDemo 组合、导航、reducer/provider、资源/业务 fixture、PiClient 适配和服务状态 | SessionNavigator、SessionHeader、AgentConversation、AgentComposer、ToolCall、ContextPanel、ChangeReviewPanel、CodePreview、执行与介入模块；MD01–MD17 全量 | [PG/MD/V/DL](agent-workspace-plan.md)、[CF](agent-workspace-component-first-plan.md)、[Pi](pi-agent-workspace-integration-plan.md) |
| Agent Board：components/examples/agent-board                                        | AgentBoardDemo 完整页面、规模数据、业务筛选和导航                                      | AgentRow、RuntimeStatusBadge、AttentionQueue、执行树、产物及看板受控模块                                                                                  | [看板计划](agent-board-components-showcase-plan.md)                                                                                |
| Work Items：components/examples/work-items                                          | 完整五视图组合、URL 状态、commands、业务 fixture                                       | WorkItemsWorkspace、List/Board/Table/Timeline/Calendar、字段/关系/调度等已存在导出                                                                        | [组件计划](work-items-components-plan.md)、[展示计划](work-items-showcase-plan.md)                                                 |
| Analytics：components/examples/workflow-analytics                                   | 完整 Dashboard、查询适配、snapshot、URL 状态、规模夹具                                 | StatisticalChart、下钻、指标、资源/运行/项目分析、Builder 等现有公共组件                                                                                  | [组件计划](workflow-analytics-components-plan.md)、[展示计划](workflow-analytics-showcase-plan.md)                                 |
| CRM：components/examples/sales-crm                                                  | Companies 业务数据、完整页、对象流转和私有主题                                         | DataTable、FilterToolbar、Sheet、Field 等；缺少可复用视觉块先提组件再做展示                                                                               | [复制计划](sales-crm-replication-plan.md)与已声明尺寸例外                                                                          |
| Canvas：components/examples/canvas-*、workflow-canvas-demo                          | 全屏组合、项目切换、播放控制、service fixture、压力数据                                | CanvasWorkspace/WorkflowCanvas/Palette/Inspector/VariablePicker/Config/Execution/Service 组件，layout=preview                                             | [CANVAS](../CANVAS.md)、[设计计划](canvas-design-system-plan.md)                                                                   |
| SVG：components/examples/svg-workbench                                              | 完整工具、素材库接入、业务草稿与导出流                                                 | SvgWorkbench 及其实际导出模块，有限本地素材和显式导出操作                                                                                                 | [SVG 计划](svg-workbench-plan.md)及[验证记录](svg-workbench-validation.md)                                                         |

public 下 CRM 资源、SVG 素材、工作台 fixture 按所有者移动；主站仅保留组件展示必需素材、文档图片和获准使用的来源材料。不能把整个 public 复制进七个应用；共享资源列清单并经构建显式拷贝。图片、字体、代码示例、样式和第三方来源/许可一并核对。

## 6. 页面级设计声明

### EX-P01 主站 /examples/ 项目组件目录

- 目标：选择项目 → 浏览对应全部组件 → 查看规格/API → 按需打开独立应用。信息所有者是 docs Manifest；应用状态仅来自配置与验收记录，构建时不访问运行中的应用。
- 保留现有文档外壳与响应式目录组件；组件组默认展开，技术/来源细节默认收起。主区自然滚动；深浅主题与 zh-CN/en 跟随站点。
- 项目链接、组件链接、外部应用入口是独立目标；只有有效配置才显示可打开的入口，未部署显示“尚未配置示例地址”。不自动探测、不自动跳转、不嵌入全页 iframe。
- 验收：七个应用均可找到对应展示；三种 Agent 模板保留深链接；断开所有应用和 Pi Host 后，目录与组件展示仍可用。

### EX-P02 各项目组件画廊

- 宿主页为第 4 节保留的项目展示路由，统一消费 ElementGallery/现有文档布局组件。适用元素全量按分组实际挂载；昂贵内容可视区加载，但滚动必须可达，无“名称已登记即完成”的验收。
- 默认“展示效果”，另提供“设计规范/技术与来源”开发视图；这是文档页面，可以展示实现信息。组件预览使用正式尺寸/token；工具式展示标题 20px、控件 32px、4px 间距网格。
- fixture 按实例作用域隔离，重置由显式操作触发；语言/主题变化不重置草稿、选择、展开项与阅读锚点。展示副作用仅本地内存及明确的复制/下载，无服务连接或自动执行。
- 继承项目既有 PG/MD 合同和已记录尺寸例外，新增展示模块用 EX-M 标识；主站与应用的行为差异必须写入变体说明。
- 验收：1440/1024 宽度、窄容器、双主题/双语、键盘、触摸、减少动效、长文本、全部适用状态和失败恢复；Agent 画廊继续验证 MD01–MD17。

### EX-P03 七个独立应用及服务页

- 路由映射见第 4 节；用户目标、区域层级、默认折叠、固定/滚动区域沿用各现有计划，迁移只改变宿主和入口。每个应用在 README 链接本计划及自己的原页面/模块声明。
- 初次迁移保持既有信息密度、尺寸、响应式回退、focus/selection/draft/阅读位置语义。应用局部保存按应用、对象、版本隔离；跨 origin 不承诺自动保留 localStorage/sessionStorage。
- fixture 应用明确标记可重置数据；Agent /pi/ 由独立 Provider 和 Host 权威快照驱动，连接、权限、runtime、data 分开；未具备的保存/Git/PTY 等能力继续不可用。
- 验收：从主站画廊打开应用 → 完成原业务 fixture 路径 → 回到组件说明；直接深链接、刷新、后退、错误恢复和应用独立部署均通过。

## 7. 模块级设计与数据合同

| 模块                  | 宿主与职责                      | 组件/样式与交互要求                                                                                    | 输入、权限和验收                                                                                                   |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| EX-M01 应用入口目录   | EX-P01/P02，关联展示与独立部署  | 扩展 ExampleGallery，沿用文档 token；链接/说明分开，键盘焦点可见                           | id、showcaseHref、可选 appOrigin、模板路径、fixture/service 分类和验证状态；不能把地址配置当在线证明               |
| EX-M02 元素展示       | EX-P02，集中挂载全部适用模块    | 复用 ElementGallery、Tabs、Field、DataRegion；实例 ID 隔离，长内容组件内滚动；状态有文本；全部元素可达 | preview children、组件 slug、声明 ID、局部 fixture 回调；不依赖完整应用 Provider                                   |
| EX-M03 展示规格与来源 | EX-P02，组件映射/技术/尺寸/证据 | 复用文档排版、表格和 CodePreview；公开代码先脱敏、有界；默认折叠详情                                   | 来源/版本/许可、已采用/计划状态、运行/安装依赖；同一 Manifest 派生展示，避免多份能力表                             |
| EX-M04 应用布局与导航 | EX-P03，原页面组合及应用内路径  | 沿用 WorkspaceShell 与实际业务模块；国际化使用便携 Provider；应用品牌/路由文字归应用                   | 受控项目/对象 ID、能力与导航回调；URL 使用显式映射，跨应用不能猜测实体关系                                         |
| EX-M05 Pi 连接适配    | Agent /pi/，保留已有服务闭环    | 沿用现有连接、消息与错误组件，保留草稿/历史锚点；unknown 非成功                                        | Host origin allowlist 更新到实际前端 origin，凭据不放 URL、不跨应用转发；requestId/回执持久化、取消和重新同步保持  |
| EX-M06 旧入口兼容     | 主站旧完整应用路由              | 可访问的组件展示入口和“打开独立应用”动作，不装载旧完整应用                                             | 深链接参数经 allowlist 映射 template/page/session 等公开定位字段；不携带 token/任意 target URL；未知参数不推测恢复 |

跨 origin 的未提交草稿只允许明确设计的用户导出/导入流程，或保留原应用部署 origin；禁止自动搬运凭据或重放 pending 操作。主站旧页面改为展示后，原草稿保留原存储直到另行确定迁移方式，不能清空来获得通过。

## 8. 构建、依赖和部署合同

pnpm workspace 负责包关系和选择性执行，暂不引入 Turborepo/Nx。每个包显式声明依赖，禁止依靠根 hoist 偶然可用。根保留一个 pnpm-lock.yaml；“独立构建”不等同“锁文件与安装完全独立”，锁文件/共享配置变更触发更广验证。选包命令采用已核对的 [pnpm filtering](https://pnpm.io/filtering) 和 [workspace](https://pnpm.io/workspaces) 机制，落地时以锁定的 pnpm 11.9.0 实测为准，不直接照搬最新版新增特性。

目标命令（EX1 实现后才可用）：

```bash
pnpm --filter @easyuse-ui/docs build
pnpm --filter @easyuse-ui/example-agent-workspace build
pnpm --filter @easyuse-ui/example-sales-crm build
pnpm --filter @easyuse-ui/example-agent-workspace typecheck
pnpm --filter @easyuse-ui/example-agent-workspace test
pnpm --filter @easyuse-ui/pi-host test
```

- 根 dev/build/preview 默认转发 docs；新增 build:examples、build:all、check:all 显式聚合，避免默认命令偷偷递归构建全部应用。共享包若有生成步骤，选包构建按其依赖拓扑先执行，不能依赖先 build:all。
- 每个应用 Next build 自行完成类型/编译/预渲染；根 lint/typecheck 为显式全仓检查，单应用命令不调用它们。docs 的 Registry/文档生成允许读取公共源码和展示元数据，但不扫描/导入 example 私有实现。
- 每个应用独立 .next/out/test-results，tsbuildinfo、Playwright report、缓存 key 包含应用及配置。禁止相互覆盖；开发与生产浏览器验证使用不同目录/进程。
- docs 保留本地 dev 3010 / preview 3011。候选端口按应用登记不同对：Agent 3020/3021、Board 3030/3031、Work Items 3040/3041、Analytics 3050/3051、CRM 3060/3061、Canvas 3070/3071、SVG 3080/3081；实施前检查占用，允许覆盖并同步链接。Pi Host 保持当前配置，不重启未知归属服务。
- 初轮应用继续静态导出，Host 单独运行。按应用配置公开 origin、静态资源路径、canonical、basePath（若采用子路径）与直接刷新；构建不依赖任何其他应用或 Host 在线。
- docs 的应用地址通过类型化配置构建为公开链接，缺失时展示不可用状态；不能为了生成目录在构建期 fetch 所有应用。静态主站旧路径采用展示/导航页或部署侧重定向，不依赖静态导出不支持的运行时 redirects。
- 发布每个应用自己的产物与资源清单；主站仅发布展示和 Registry。部署 root、预览环境、缓存/产物名和环境变量按包隔离。
- Registry 的 item 名称、消费方安装路径和主题模式兼容；路径更新只改变仓库内部所有权。docs demos 代码示例需独立消费方可用，禁止把 workspace:* 或私有应用 import 写入 Registry。

框架依据：[Next 静态导出](https://nextjs.org/docs/app/guides/static-exports)、[懒加载](https://nextjs.org/docs/app/guides/lazy-loading)及当前 node_modules/next/dist/docs。动态导入可以优化页面加载，不能作为独立构建的证据。

## 9. 实施阶段与文件清单

| 阶段                         | 工作与主要文件                                                                                                                                                                                     | 退出条件                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| EX0 冻结清单与基线           | 生成逐文件/路由/元素/依赖账本；核对所有 app、components/examples、lib、public、tests；补七个页面声明与共享模块变体；记录现有构建耗时/内存/产物和浏览器基线                                         | 每个当前入口、展示、资源、测试有所有者；区分并行未提交内容与已交付代码                            |
| EX1 workspace 与共享源码     | 根 package/workspace/lock、packages/ui、packages/pi-protocol；迁移公共 components/lib/styles；明确 exports/peer/TS/CSS；改造 Registry、Manifest、安装脚本和源码预览路径                            | 公共包无站点/应用反向依赖；最小独立消费者、源码安装和三主题模式通过；不依赖应用构建               |
| EX2 主站与 CRM 试点          | app、components/site/docs、站点 lib/messages/demos/public → apps/docs；CRM 组合 → examples/sales-crm；主站 CRM 变为组件画廊；拆 package/TS/ESLint/Next/Playwright                                  | docs 与 CRM 分别构建和预览；CRM 故障不影响 docs；CRM 旧视觉例外及对象交互保持                     |
| EX3 Agent Workspace 与 Board | agent-workbench/pi-workspace 应用适配、agent-board 组合和规模场景 → 对应 examples；reference/intervention 保留有限展示；Host 改引用协议包；更新 Origin/链接和持久化隔离                            | Agent、Board、docs 三者独立；MD01–17 主站展示完整；Pi Host 测试与真实 provider/浏览器链路重新验证 |
| EX4 Work Items 与 Analytics  | 移动各自组合、commands/query/url/snapshot/fixture/benchmark；保留 component-demos/advanced-demos 的组件展示部分                                                                                    | 五视图身份/日期/草稿保留；分析下钻/历史口径保持；双方不互导私有代码；独立构建                     |
| EX5 Canvas 与 SVG            | 分离 fill 应用与 preview 演示、service/playback/stress；资产构建按使用清单拆分；保留公共模型/验证/编辑组件                                                                                         | 七应用全部独立；Canvas 本地暂停不冒充服务暂停；SVG 校验/导出和来源许可保持；无全库资产重复复制    |
| EX6 CI、旧入口与部署         | 拆 .github/workflows/quality.yml job 和分包 Playwright；更新 example/component Manifest、demo loaders、sitemap、搜索、博客链接、preview/capture/measure 脚本、README/开发指南/AGENTS/专项指南/技能 | 按变更集合选择消费者；七应用部署配置完整；旧链接有明确去向；主站不再含完整应用入口实现            |
| EX7 隔离验证与收尾           | 执行第 10 节矩阵，记录到新的 independent-example-apps-log.md；比较固定环境性能；移除临时跨目录桥接和冗余源码                                                                                       | 独立构建与主站展示验收均通过；提交逐阶段证据，未完成的服务/性能项目单列                           |

原阶段顺序 EX0 → EX1 → EX2 → EX3 → EX4 → EX5 → EX6 → EX7；2026-10-11用户明确改为Agent Workspace优先，本轮执行所需共享包、Agent拆分和主站去耦，CRM/Board留后续。本轮先用 Agent 范围证明拆分方法有效再扩展，其余阶段继续按各自未完成范围执行；不要一次性移动所有目录再修全部引用。每个应用通过独立构建与行为验收后才替换主站旧完整应用入口，过渡期状态必须显式记录。

## 10. 验收矩阵与可复现证据

| 编号           | 必须执行                                                                                               | 通过条件                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| A01 单独构建   | 从冻结源码/锁文件分别构建 docs 和七应用，服务均关闭                                                    | 各自生成可预览产物；任务日志不启动/构建其他应用                                                 |
| A02 故障隔离   | 在临时候选副本中向 CRM 私有页面加入编译错误，构建 docs 和 Agent；再向 Agent 私有页面注入错误并构建 CRM | 目标消费者通过，故障应用自身失败；注入仅发生在临时副本，不能污染共享工作树                      |
| A03 依赖闭包   | 分析 TS include、ESLint 范围、模块图/trace、CSS source、文档生成和资源拷贝                             | docs 无 examples/* 私有源码；应用无兄弟应用私有引用；不是仅靠目录改名                           |
| A04 产物隔离   | 检查 docs 与应用产物的路由、源码映射、资源清单；同时启动两应用                                         | 主站无完整项目路由实现/业务 fixture/Pi 适配；公共组件可合法共享；产物、端口、缓存无覆盖         |
| A05 页面与模块 | 七应用原业务路径、主站所有元素，1440/1024、主题/语言、键盘操作、减少动效、刷新和恢复               | 截图及交互证据分别存档；原焦点/选择/草稿/锚点合同保持                                           |
| A06 Pi 服务    | Host 类型/测试、真实 provider、HTTP/SSE、历史恢复、取消、断线/乱序/丢回执、Origin/auth 和 unknown      | 既有能力不丢失，pending 不重放，无扩大权限；fixture 测试不替代真实调用                          |
| A07 分发       | Registry 构建与 schema、Manifest/i18n/docs/UI 契约检查，独立 CLI 安装及 replace/host/scoped 三模式     | 安装后无仓库路径或 workspace 私有包依赖；CSS/模型/hooks/字典闭包完整                            |
| A08 CI 选择    | 应用私有改动、ui/协议改动、站点元数据改动、lockfile/配置改动四组输入                                   | 只选应用改动的对应 job；公共改动选所有声明消费者；公共锁/配置采取保守完整门禁，不遗漏受影响应用 |
| A09 性能       | 固定 Node/pnpm、依赖、源码、机器、数据与采样，分别冷/热测完整站点基线、docs、各应用 build              | 记录实际时间/内存/产物，不预设加速百分比；独立构建保证范围，不能保证全部应用总耗时更短          |
| A10 导航部署   | 主站→组件→独立应用、深链接刷新、旧地址、地址缺失、子路径资源、离线应用                                 | 缺失部署不阻断 docs 构建；无错误 localhost 公开链接、无跨 origin 凭据/草稿自动转发              |

任一阶段保留 pnpm lint、pnpm typecheck、pnpm build 的对应包/依赖范围检查；最终执行全仓聚合检查。行为变化运行浏览器测试，公共源码/CSS/Registry 变化运行独立安装。docs 仍需完整构建它自己展示的组件，这部分成本不会因独立应用拆分消失。

## 11. 回退、交付边界与后续 Bun

- 每阶段先验证候选产物，再切主站入口和部署配置；失败时保持已知可用部署，修正候选代码后重试。需要撤回已合入变更时使用经审查的普通修复/revert 提交，不 reset/clean/stash/force push。
- 共享工作树只暂存本任务已审查文件；服务启动前核对 PID/cwd/活动会话，不能为迁移重启其他任务的服务。按当前 AGENTS 的身份和授权规则提交推送并核对远端 SHA。
- 本计划优先于历史文档“主站挂载完整示例”的位置约定；历史视觉、组件、Pi 和服务验收继续作为回归基线，不能改写为此次迁移已完成。EX6 同步所有现行路径说明，历史记录标注新旧入口映射。
- Bun 留到独立应用成立后单独评估：可以只验证 Agent Workspace 的构建运行时或 Pi Host；先保持共享锁文件和现有基线，不在 pnpm workspace 中随意引入竞争锁文件。本计划不把 Bun、编辑/Git/PTY、多 Agent 或新的业务服务列为完成条件。

## 12. 执行清单

- [x] 计划文档与主文档入口完成；核对当前路由、主要耦合和目标分包。
- [ ] EX0 逐文件/元素账本与基线。
- [ ] EX1 workspace、共享 UI/协议、Registry 单一来源。
- [ ] EX2 docs 与 CRM 试点独立构建。
- [ ] EX3 Agent Workspace、Agent Board 和 Pi 回归。
- [ ] EX4 Work Items、Workflow Analytics。
- [ ] EX5 Canvas、SVG Workbench。
- [ ] EX6 CI、兼容导航、部署、开发文档与技能同步。
- [ ] EX7 A01–A10 全部完成并记录证据。

上述未勾选的全计划阶段仍待实施；下方 Agent 工作包单独记录组件展示、独立构建、fixture、真实服务、provider、分发与性能结论。

### Agent优先工作包

- [x] 用户指定优先级、页面/模块声明、Agent路由/元素/文件账本。
- [x] 独立Agent package/config/provider/routes与共享UI/协议单一源码。
- [x] 主站Agent完整入口改为17模块展示；Pi客户端和应用Provider归独立应用。
- [x] Agent范围独立构建、故障隔离、浏览器、Pi真实provider和Registry安装验收记录。

全计划EX0–EX7仍按七应用完成定义分别核对，不能由本工作包完成推定。
