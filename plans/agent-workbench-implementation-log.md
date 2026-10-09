# Agent 工作台实施记录

日期：2026-10-09。状态：M0–M5 实现与验收完成；M6 为后续真实服务集成。

## M0 基线与范围

起始基础提交为 `a6b67c78545bfb65a843c0cc0aba23d09566a192`。实施期间正式分支前进到 `8a095c21cd9370c7c6fbaefa02b35d54979837b1`，该基线包含本轮期间合入的workflow analytics、组件边界、浮层、toolbar/table改进；工作台重新建立隔离候选，并再次执行完整构建、行为、截图和独立安装检查。旧任务的453项回归不作为工作台验收数量。

并行 CRM 路由、文章、私有 Provider/消息及生成目录保留。本轮只提交已审阅任务路径。开发服务3010保持运行；Webpack构建及浏览器使用隔离快照与3017/3018临时预览，不重启现有服务。

契约处置：沿用 WorkspaceShell 的 Inspector280–360，并同步 Design-rules、Component-Specification、UI-PATTERNS 与 patterns 技能的旧300px下限。Header48、Toolbar40、侧栏256/48、底栏200–400。宽Diff归Main。

复用 Conversation、ChatComposer、SessionRow、Tree、Item、WorkspaceShell、Inspector、DataRegion、ToolCall、ApprovalRequestPanel、ArtifactList、ExecutionTraceTree、AgentRunList、AttentionQueue。Questionnaire不替代权限批准；未引入富编辑器、PTY、网络SDK或调度器。

## M1–M4 实现与交互

| 范围 | 交付与证据 |
| --- | --- |
| M1 / R1–R4 | 导航、上下文、对话和输入公共组件；区域网页与独立消费者可操作 |
| M2 / R5–R10 | 标题、审批、文件/Diff、计划/产物、日志/预览、收件箱和设置；缺少的宿主能力有具体说明 |
| M3 / L1–L3 | 对话、审阅、任务总览；共用快照，CSS切换保留Composer挂载、草稿与选区 |
| M4 / T1 | 创建确认→工具审批→来源失败证据→反馈确认→来源完成→行反馈闭环 |
| M4 / T2 | 报告生成批准→来源产物→引用定位→审阅反馈回到会话；不要求代码执行 |
| M4 / T3 | 待批准/问题/失败筛选→选择查看→显式进入会话；选择不启动任务 |

纯模型包含独立对象ID、连续来源游标、稳定part修订、草稿ID/版本、上下文可用性、版本绑定的Diff评论与独立操作回执。业务动作先pending，再由显式来源动作confirmed/failed/unknown；unknown保留旧快照并禁止重复提交。

ChatMessage增加单份正文renderContent，Conversation增加可选fill布局，ChatComposer增加独立sendDisabled；原接口默认行为兼容。公共17个React组件与纯模型提供18个Registry入口，以六组共享实现/CSS；Catalog记录真实props与类型。公共文字采用typed zh-CN/en，站点/示例资源独立；切语言保留调用方正文、草稿与编辑器。

重命名/收藏/归档等待回执且绑定原会话。send/queue/steer/cancel按能力和独立回执处理。行反馈同时校验repository/base/head/revision/file/line；head变化而revision未变也会阻止旧反馈，需显式重新定位。

## M5 检查结果

| 检查 | 结果 |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` | 通过 |
| `pnpm build` | Webpack静态导出通过；GLIBC2.28使用WASM SWC回退 |
| `pnpm registry:build` / `pnpm check:i18n` / `pnpm check:ui-contracts` | 通过；Catalog/Registry闭包及双语资源一致 |
| `pnpm blog:build` / `pnpm docs:build` / `pnpm check:docs` | 通过；文章、资产、Props与74个文档代码例子检查 |
| 本轮模型 | 10项通过：身份/版本、游标、草稿、能力、回执、审批、队列/steer、产物模板与URL白名单 |
| 本轮浏览器 | 30项通过：10区域、3模板闭环、跨会话/布局/语言、IME、键盘、触摸、reduced-motion及恢复 |
| 全量回归与配置复测 | 536项完成验证：首轮533通过、3失败；修正后8项复测通过，覆盖原3项失败及其余5个脚本预算场景；0未解决失败、0跳过。包含本轮模型/行为，数量不与上两行相加 |
| 最终发布与兼容性复检 | 183项通过、0失败、0跳过；含新文章/证据、工作台、首页/文档、加载预算、触摸与Analytics回归 |
| `TMPDIR=/tmp pnpm test:install` | CLI、依赖闭包、主题/CSS、消费者TypeScript/生产构建与真实浏览器交互通过 |
| 独立安装载荷 | 643个JSON载荷已固定摘要；最终全部生成字节与独立安装摘要一致，0变化 |
| 实际页面截图 | 3模板×桌面/移动×浅色/深色，共12张；另有1张基础Agent Board对照 |

浏览器覆盖390/768/1024/1280/1440px、有效200%布局、移动390×844与软键盘缩短至390×500。全页与区域WCAG自动扫描通过；此证据不等同完整人工无障碍认证。

长历史单次观测：初始1002条消息（1000历史+2基础），追加来源后1003条；阅读历史时保持锚点。长Diff实际挂载1000行并提示截断。导航与首次渲染观测为3718ms；仅为当前固定fixture/机器的一次观测，不作为p95或服务SLA。所有消息仍在DOM，浏览器布局延迟不称为虚拟列表。

最后处理的失败：Chrome在非/tmp的临时目录启动SIGTRAP，浏览器与安装统一使用TMPDIR=/tmp；移动软键盘导致焦点输入框裁切，输入区在焦点/尺寸变化时局部滚动恢复；长历史导航检查等待已选布局生效再断言可见Diff。新增示例使图集中的分析示例移到折叠线下，其缩略图按原生lazy加载；图集验收先滚到目标再检查图片加载，不把未进入视口的图片视为加载失败。新合入的触摸测试使用硬编码3011，而隔离预览使用3017；改为继承baseURL并复测。目录与词典页初始JavaScript估算gzip分别超出原预算2861/2072字节；追踪静态HTML脚本后确认首页场景预览被Webpack合入共享页面chunk。将首页预览拆成独立站点模块后复测全部7个预算，预算值保持不变。两轮之间可分发工作台运行时源码未变化，站点预览模块及触摸测试配置有上述修正；原始失败与复测记录均保留。

截图在实际路由、固定fixture、字体加载完成后捕获，无页面水平溢出。来源指纹：`d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943`。公开证据：[captures.json](../public/blog/agent-workbench/captures.json)、[verification.json](../public/blog/agent-workbench/verification.json)。博客引用同一指纹的图片与检查记录。

## 入口

- `/examples/agent-workbench/`：总览。
- `/examples/agent-workbench/regions/`：R1–R10区域。
- `/examples/agent-workbench/layouts/`：L1–L3布局。
- `/examples/agent-workbench/app/`：T1–T3完整模板。
- `/blog/agent-workbench/`、`/docs/agent-workbench/`：组合说明、安装与API。

## M6 后续服务与已知边界

未连接真实模型、文件系统、Git、PTY、浏览器控制、鉴权和业务持久化。fixture中的报告、测试结论与运行完成不作为真实执行证据。刷新重置fixture业务数据；URL只恢复白名单导航选择。

MessageContent为安全Markdown子集；正文、文件/Diff与日志均有界。日志先脱敏再渲染/复制；iframe必须由宿主明确允许并使用空sandbox。工具执行、上传、审批权威、持久化与未知结果查询始终由调用方服务负责。

最终构建后的7个页面预算均通过；响应体gzip估算/上限（字节）：`/components/` 371919/380000、`/dictionary/` 391130/400000、`/docs/button/` 359503/360000、`/blog/` 358902/375000、`/blog/on-demand-demos/` 358465/365000、`/` 360119/380000、`/examples/` 346814/380000。最终复检包含首页预览键盘/语言/触摸与实际文章图片和证据引用。
