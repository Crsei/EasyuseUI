# Development Guide

项目交付范围为桌面 Web。设计与验收以桌面窗口、鼠标、键盘、缩放、双主题和双语为准；保留面板尺寸约束、焦点恢复与草稿保持。Agent Workspace 使用 1024px 最小桌面画布、竖向导航和停靠面板。

日期：2026-10-11。适用于 EasyuseUI 组件库、组合 examples 和 Agent Workspace 服务适配。本文记录开发方向与技术选择依据；各工作包以对应实施记录确认，不以指南发布代表能力交付。

## 1. 目标与合同

以可复用组件支持连续的项目工作流程：项目概览 → 工作项 → 关联会话 → 执行与人工介入 → 产物审阅 → 项目分析。公共组件保持受控，业务身份、权限、运行、存储和结果确认由调用方提供。

设计以 [Design Rules](./Design-rules.md)、[Component Specification](./Component-Specification.md)、[UI Patterns](./UI-PATTERNS.md)、[UI States](./UI-STATES.md) 和 [I18N](./I18N.md) 为准。本文不替代尺寸、状态或页面/模块声明。Agent Workspace 的工作包见[补全计划](./plans/agent-workspace-completion-plan.md)，具体布局见[设计计划](./plans/agent-workspace-plan.md)，Pi 协议与进程见[技术计划](./plans/pi-agent-workspace-integration-plan.md)。

当前完成基线：Pi AW0–AW5 / P0–P5、参考设计 DL0–DL5 的已记录 UI 范围。真实文件/Git/PTY/Checkpoint、多 Agent、项目长期存储和自动化仍按 S2–S4 / AW6–AW8 独立交付。已有 fixture 和真实 provider 证据分别保留。

### 项目重新定位：组件工作坊与项目组合验证

EasyuseUI 的主线为“简单组件展示 → 复杂组件构建 → 项目示例组合”。可以采用成熟开源项目与库作为基础，记录来源、版本、许可、适配边界；项目示例用于检验组件在真实信息结构中的效果和交互。Agent Runtime、业务存储与部署仍由宿主承担。

每次构建示例先列出完整元素清单，逐项关联实际组件和技术；缺失项先构建组件，再集中挂载到统一元素展示页。展示页必须能看到全部适用元素的真实效果，并可检查状态和组合关系；只有组件名称清单或一次仅显示一个模块不算完成。之后页面通过组件组装，不能直接手写页面 CSS/内联视觉样式绕过组件层。Tailwind、CSS Modules 和计算布局值应归属组件，共享值消费主题 token。

交付分为两份关联成果：

| 成果 | 内容与完成证据 |
| --- | --- |
| 页面展示效果 | 统一元素画廊、实际项目页面、状态变体、深浅主题/双语截图和交互路径 |
| 设计规范 | 页面与模块声明、尺寸/token、组件来源与 API、状态/权限/副作用边界、技术栈及验证结果 |

每个示例填写技术清单：技术/实际版本、负责模块、组件入口、来源/许可、已采用或计划、按需加载策略、为什么优于现状、验收证据。技术说明放开发展示页和文档；产品工作流只出现用户决策所需信息。现有示例逐项迁移，不因新规范发布而自动视为已符合。

Agent Workspace 首轮按[组件先行迁移计划](./plans/agent-workspace-component-first-plan.md)执行：MD01–MD17 统一展示，展示效果与设计规范分离，文件代码预览采用可复用编辑器引擎组件；后续表格、图表、关系图、拖拽和服务数据层按缺口引入。

后续应用边界按[示例项目独立构建计划](./plans/independent-example-apps-plan.md)推进：主站迁至 apps/docs，七个完整示例分别进入 examples 下的独立应用，共享源码归 packages/ui，Pi Host 保持独立。主站项目页面只保留对应组件展示、设计规范和应用入口；独立应用不得反向进入主站构建依赖。Agent Workspace 已先迁至 examples/agent-workspace，共享源码与协议包已落地；主站仍在根目录，其余应用尚未迁移。根命令服务 docs，Agent 使用过滤包命令；Bun 迁移另行验证。

## 2. 技术选择与引入条件

以下是 2026-10-11 对 package.json 和当前源码的核对；实施时复核安装版本、真实导出与 Registry 依赖闭包。

| 技术 | 当前情况 | 开发策略 |
| --- | --- | --- |
| Next.js / React / TypeScript / Tailwind | 已采用；Next 静态导出 | 沿用框架和现有 token；公共组件不依赖 Next 路由或站点服务 |
| Base UI / shadcn | 交互基础为 Base UI；shadcn CLI 用于源码分发/安装 | 复用已有组件；不为匹配模板清单而增加 Radix 或第二套焦点/浮层体系 |
| Recharts / React Flow / Lucide | 已用于分析图表、画布和图标 | 完善组合、来源关联和按需加载；不另造重复渲染层 |
| Zod | 未直接引入 | 优先评估协议、HTTP/SSE、配置与持久化输入的运行时验证；不让基础 UI 必须依赖业务 schema |
| TanStack Query | 未直接引入；Pi 私有 Provider 管理请求/缓存 | 先试点只读项目/会话列表与历史分页，验证收益后扩展 |
| Zustand | 未直接引入；已有 Context/Reducer/局部状态 | 在跨区域状态组织或细粒度订阅有明确需求时评估；不把换库当作性能结论 |
| TanStack Table | 已有受控 DataTable | 多列排序、列固定、分组或复杂服务端分页需要时评估可选适配；不改变既有受控语义 |
| dnd kit | 已有 Tree、看板的移动接口与交互 | 跨容器、自动滚动和复杂碰撞需求出现时评估；保留键盘替代及调用方确认 |
| Faker | 已有确定性 fixture | 可用于开发期规模数据；固定版本、seed、时间和稳定 ID，故障轨迹显式构造 |
| CodeMirror / Monaco / xterm.js | CF 本轮引入 CodeMirror 6 只读 CodePreview；Monaco/xterm.js 仍是候选 | 代码阅读与搜索先按组件交付；可编辑文档、保存与真实 PTY 继续按 CW/S2/S3 验证，版本和分发证据见 CF 实施记录 |
| ESLint / Prettier / Playwright | 已采用，另有 Registry 独立安装检查 | 保留工程、浏览器、分发与性能的分层证据 |
| Vercel / 自行托管 | 部署选择 | 按静态站点和独立服务分别设计，不作为组件运行依赖 |

每次引入依赖先记录：需求缺口、现有实现、可选方案、影响页面、加载成本、公共 API 兼容与验收方法。技术选型表不构成一次性安装全部包的任务。

## 3. 连续项目流程与对象关联

组合示例复用 WorkItemsWorkspace、Agent 工作台模块、分析 Dashboard 与 Canvas，先用同一份确定性项目数据验证跨区域导航，再对接实际服务。

| 对象 | 身份与关联要求 |
| --- | --- |
| Project / WorkItem | projectId 与 workItemId 明确作用域；任务所属项目由来源提供 |
| Session / Run | sessionId 与 runId 分开；会话可关联多个任务，任务可关联多个会话，使用显式关系记录 |
| Artifact / Change | artifactId 及来源 runId/sessionId；文件、Diff 和反馈绑定版本或 revision |
| Relation | 保留关系 ID、关系类型、来源与必要版本；跨项目关联按来源权限处理 |

不得根据标题、目录、相近时间猜测关联，也不把所有实体压成一种通用状态。Agent 执行完成、产物已审阅、任务已验收分别呈现；业务完成不能从 runtime completed 自动推导。

最小用户路径：

1. 从任务进入明确关联的 Session，再返回原筛选、选择与阅读位置。
2. 从失败统计下钻到具体 Run，再定位来源工具错误；历史统计使用当时成员与口径。
3. 从变更或产物回到来源会话、运行和任务；缺少关联时明确显示不可定位。
4. 在列表、看板、时间线、日历间保持同一工作项身份、日期和未提交草稿。

新路由与页面 ID 在实际实施前固定，并补页面声明及受影响模块声明。保留既有 /workspace/、examples 与 Pi 入口，不因增加流程示例迁移它们。此处只规定流程和数据方向，不宣称新组合页面已经存在。

## 4. 组件、适配器与状态职责

| 层级 | 负责 | 约束 |
| --- | --- | --- |
| components/ui、components/blocks | 展示快照、受控交互、能力回调 | 不直接持有服务认证、调度或业务持久化 |
| examples 私有适配器 | 来源映射、读取、事件归并、命令与回执映射 | 通过显式能力描述驱动同一组组件 |
| 查询缓存层 | 项目/会话列表、历史页、服务快照、刷新和失效 | 按服务、授权作用域、项目、对象、查询条件隔离；退出连接时清理旧作用域 |
| 界面状态层 | 草稿、选择、面板、展开项、阅读锚点 | 草稿按对象与版本隔离，URL 表达适合分享的导航条件 |
| 命令与对账层 | requestId、操作目标、pending/confirmed/failed/unknown | 不把缓存更新当执行回执；结果未知先查询，不能自动补发写入 |
| Host / 消费方服务 | 权限、执行、存储、版本冲突、调度、权威回执 | UI 或本地 store 不扩大服务能力 |

Fixture adapter 与 Service adapter 共享适用的展示合同，能力分别声明。Fixture 显式标识、可重置；Service 只暴露真实支持的操作。切换来源必须隔离缓存、草稿与 pending 操作，不把演示操作自动重放到服务。

Pi 目前的真实能力以 Host 为准。fixture 中的 Git、批准、队列或 Checkpoint 不会自动出现在真实能力表中。新建适配合同应逐模块试点，避免为了统一名称重写已验证的 Pi 首轮。

## 5. 协议验证与服务查询试点

当前 PiClient 的 HTTP 响应使用类型断言，SSE 在 JSON 解析后检查协议版本、sessionId 和 sequence；后续可补完整负载验证。候选 Zod schema 放在独立协议/适配模块，保持公共 UI 和 Node SDK 的依赖边界。

验证覆盖命令输入、快照、事件、回执、能力和本地配置。错误区分格式非法、版本不兼容和未知可扩展类型；约定向前兼容策略，不静默丢弃关键完成/权限事件。校验失败保留已确认快照，呈现错误或 partial，并按协议重新同步。日志错误信息不输出凭据和原始敏感载荷。

Schema 只证明结构及声明的字段约束；对象权限、revision、新旧事件顺序、幂等和结果对账仍由服务与适配逻辑验证。流式输入继续保留大小限制和有界预览。

TanStack Query 试点先覆盖只读列表与历史页，验证 query key 隔离、取消、迟到响应、分页去重及刷新失败保留。SSE 保留 hostEpoch/sequence 和快照重同步；旧 HTTP 响应不能覆盖新事件。查询与事件只写一套受控快照，不额外维护相互竞争的事实副本。发送、停止、批准、保存和恢复不继承读取请求的重试策略。

## 6. 可选功能模块与示例验收

| 示例方向 | 增量目标 | 必需验收 |
| --- | --- | --- |
| 高级表格 | 多列排序、列固定、分组、服务端分页 | 选择与激活分开；查询变化、未知总数、权限和跨页批量范围明确 |
| 复杂拖拽 | 跨泳道/容器、自动滚动、层级目标 | 指针与键盘等价，取消/拒绝/unknown 保留原始确认事实，无越权移动 |
| 编码服务 | 编辑器、版本化保存、Git、命令与 PTY | 外部修改冲突、保存回执、明确 Git 范围；PTY 输入/resize/退出与断线独立验证 |
| 规模与故障 | 大列表、长历史、混合工具、断线/乱序 | 固定数据/时钟；重复、缺口、丢回执与权限撤销可复现 |

重型表格引擎、图表、画布、编辑器与终端按页面/面板加载，并验证未使用页面不下载相关资源。Faker 数据不能代替明确故障轨迹；全量 DOM、content-visibility 与虚拟化分别命名和测量。

## 7. 执行顺序与完成等级

### Agent 编码工作台的具体补充

2026-10-11，当前重点补充编码模板 `/examples/agent-workbench/app/?template=coding&page=session` 及共享入口 `/workspace/`；真实能力由 `/examples/agent-workbench/pi/` 的 Host 适配承接。具体实施包见[编码工作台 CW0–CW6](./plans/agent-coding-workbench-enhancement-plan.md#11-agent-编码工作台技术补充与服务实施计划)。该 CW 段最初为文档规划；后续 CF 迁移引入 CodeMirror 只读预览，不等同于完成 CW 的编辑、保存或服务能力。

| 能力 | 当前实现 | 补充方向与技术选择 |
| --- | --- | --- |
| 文件与代码 | FileViewer 接入 CF 的有界只读 CodePreview，DiffViewer 展示调用方提供的差异；Shiki 用于文档高亮 | CodeMirror 先支持阅读/搜索；编辑、选区/撤销与保存合同仍须 CW0/CW1 验证。Monaco 仅在明确 IDE 需求时重新评估，不同时引入 |
| 保存与 Git | 资源已有身份/revision，尚无真实保存/Git 服务 | Host 提供完整可编辑快照、版本条件保存、操作回执和明确路径范围的 Git；编辑草稿与确认版本分开 |
| 命令与终端 | ExecutionOutputPanel 提供有界日志与 terminal 插槽，尚无真实 PTY | xterm.js 前端 + 可选 Host PTY 适配；node-pty 是候选，先验证 Node 24 / GLIBC 2.28 的加载和编译；消息 SSE 保留，PTY 双向通道单独设计 |
| 服务协议 | PiClient 手写 fetch/SSE 与信封检查，Context/Hook 管理读取/草稿/回执 | 复用 DG2 的 Zod 边界验证和 TanStack Query 只读试点；保存、Git、命令与终端生命周期仍由命令/对账层负责 |
| 状态与规模 | 已有 reducer、面板偏好和有界预览 | 保留现有实现；按测量决定细粒度 store 或虚拟化，不把 Zustand/dnd kit/TanStack Table 作为编码切片前置 |

最小可交付链路为“从会话打开文件 → 编辑 → 显式保存并确认版本 → 查看实际 Diff → 执行一次命令 → 查看来源退出结果 → 回到原会话草稿”。编辑/命令能力由独立宿主配置显式开启，不因加载新 UI 自动给 Pi Agent 启用写文件或 Bash。交互 PTY、Git 写操作和 Checkpoint 分别验收；首个切片不依赖多 Agent 或完整 IDE。

特别约束：被截断或脱敏的预览不可作为可保存文件正文；确认保存只确认提交的草稿版本，较新输入继续保留。终端关闭面板不结束进程，断线不重放输入或自动重建 shell；输出流控与重连缺口有明确可见状态。具体容量、布局、权限、冲突及测试矩阵以 CW 计划为准。

### 总体工作包映射

| 工作包 | 下一步 | 对应计划 | 当前状态 |
| --- | --- | --- | --- |
| DG1 流程与关联 | 固定对象关系、页面/模块声明，制作项目流程 fixture | AW7 的前置示例；复用 PG/MD | 待实施 |
| DG2 边界与适配 | 协议 schema、fixture/service 合同、只读查询试点 | Pi 后续加固；保持 AW0–AW5 基线 | 待实施 |
| DG3 真实编码 | 文件/Git → 命令/PTY → 按需检查点与协作 | S2 → S3 → 实际启用的 S4 | 待实施 |
| DG4 长期产品能力 | 多 Agent、项目持久化与跨会话、观测/自动化 | AW6–AW8 | 待实施 |

DG1 可先验证流程，DG2 的独立协议工作可在不依赖新页面时推进；DG3 按服务能力逐项交付，DG4 的真实项目/调度结果另行验收。DG 编号是对现有工作包的映射，不另造一份重复完成统计，也不改变 Pi 首轮已完成结论。

每项记录：设计声明、UI/fixture、真实本地服务、真实 provider、业务验收、公共分发与性能。页面完成、来源结构合法、HTTP 成功、模型回复与用户任务验收不可互相替代。

## 8. 开发与部署检查

修改前检查共享工作树和服务端口，保留并行工作。按 AGENTS.md 运行 lint、typecheck、Webpack build；行为变更做挂载浏览器验证，公共源码/CSS/Registry 变化做独立安装。服务协议变化增加对应 Host 类型与服务测试；保持旧 Pi 恢复、草稿、历史锚点和 unknown 回归。

性能记录固定源码、依赖、数据、采样方法与运行环境，分别测首个可用输入、加载字节、DOM、内存和关键操作。共享主机观察不能替代稳定 CI 门槛。

当前 Next output=export，Pi Host 独立运行。静态托管与 Agent 服务分别配置；现有 PiClient 限本机 HTTP 地址。远程部署需另行设计访问端点、HTTPS、认证、Origin、长连接和恢复策略，不能仅发布静态页面就宣称远程 Agent 可用。公开发布遵循 [RELEASE.md](./RELEASE.md)。

## 9. 参考与使用边界

2026-10-11 核对：

- [Shadcnblocks Admin Dashboard](https://www.shadcnblocks.com/admin-dashboard)：共享业务模型、多视图、类型化 mock 和应用组织参考。
- [Shadcn Admin Kit v2.4.0](https://www.shadcnblocks.com/changelog/shadcn-admin-kit-v2-4-0)：AI Chat、Agent Builder、Workflow/Subagent Canvas 的界面范围参考。
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)：服务状态读取、缓存和同步的候选实现。
- [Zod](https://zod.dev/basics)：运行时 schema 和验证错误处理的候选实现。

上述外部资料作为结构与技术参考；本项目可用能力仍以当前源码、正式合同、挂载行为和服务证据为准。本指南最初以文档增量落地；后续 CF 组件迁移的依赖与实际交付见对应实施记录，不能据此勾选 DG1–DG4 服务工作。


## Agent Workspace 独立应用（2026-10-11）

完整工作台/Pi 客户端迁至 [examples/agent-workspace](examples/agent-workspace/README.md)，主站旧入口保留 [17模块组件展示](/examples/agent-workbench/elements/)。独立命令、3020/3021端口、Origin、存储/部署边界与原合同映射见应用 README；[迁移声明](plans/agent-workspace-independent-migration.md)和[实施记录](plans/independent-example-apps-log.md)区分 fixture、真实 provider、分发与后续项目。历史主站 Pi/工作台命令为旧路径记录，新调用使用 `pnpm --filter @easyuse-ui/example-agent-workspace`。共享 canonical 源码位于 packages/ui，旧公共文件路径暂以源码兼容链接保留。
