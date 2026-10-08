# Agent 看板实施与验证记录

日期：2026-10-08。计划：[Agent 看板组件与示例展示计划](./agent-board-components-showcase-plan.md)。接口：[AGENT-BOARD.md](../AGENT-BOARD.md)。

## 实施范围

| 阶段 | 交付 | 状态 |
| --- | --- | --- |
| AG0 | 运行、关注请求、审阅、产物、执行步骤、关系和用量类型；分组、筛选、版本仲裁、来源去重 | 已实现 |
| AG1 | 共享属性、行、卡片、阶段摘要、完整受控 Inspector、基础产物与审阅 | 已实现 |
| AG2 | 只读 AgentRunBoard、List、Inbox、审批组合、共享工具栏、工作台与 URL 适配器 | 已实现 |
| AG3 | 可观测执行树、明确关系导航、包含关系与币种分开的用量统计、扩展产物状态 | 已实现 |
| AG4 | 组件目录、Registry、最小受控示例、独立安装、Blog、截图及证据 | 已完成 |

入口 `/workspace/agents/`，Blog `/blog/agent-board-showcase/`。16 个 Agent Catalog 安装项合并归属内部公开零件；AttentionItem 随 AttentionQueue，ReviewSummary 可单独安装。模型与纯函数独立分发。

W02 由并行 Work Items 实现补齐。本次 AgentRunBoard 直接使用 `item-board` 的 Board 与 `grouped-list` 基础，移除本轮先行的临时容器。交付快照纳入经过核对的必要容器、CSS、分组模型与文案，保证独立安装自包含；Work Items 页面及业务字段组件保持归属原任务。

## 已固定的行为

- runId 是展示身份；Agent、Session、任务和尝试分别建模，idle 与未知状态保留。
- 看板分列只读，不通过拖动写入运行状态。运行 completed、审阅、业务验收和 PR 状态独立。
- 同一运行可有多个关注请求；按 attentionId/revision 去重，关注项数与运行数分别展示。
- 权限来自请求能力；过期、只读、pending 和未知结果不开放写入。工具审批复用 ToolCall；结果未知先核对，关闭详情不清除。
- 示例适配器保留草稿和操作锁，以 generation、request revision 和 operationId 拒绝迟到回执。运行只接受更高 revision；事件按 eventId 去重。
- 数据区覆盖五态；刷新失败保留运行和产物，断连保留最后快照；筛选隐藏选中对象时继续展示详情并提示。
- URL 保存 view/run/q/agent/model/status/task/kind；非法视图回落，来源未知运行状态可作为有效筛选恢复，前进/后退保持对象。
- 桌面 Inspector、窄屏 Sheet；关闭恢复焦点；390/768/1440px、触摸、中英文和减少动画均有验证。
- 用量按来源 ID 去重，父级明确包含的子观测不重复汇总；包含关系未知单列，币种分开，缺失值不补零。所有统计限于当前筛选已加载观测。

## 验证边界与环境

使用只含本任务改动的独立交付快照，基础 HEAD 为 `07fbbe0`。Webpack + 安装版 Next 16.3.8，GLIBC 2.28 下使用 SWC WASM 回退。主工作区 3010 开发服务与已有预览服务保持运行；隔离浏览器预览使用 3027，截图使用 3028。

首次完整浏览器回归 46 项通过，覆盖 Agent 场景、Tree/ToolCall/Inspector、Activity/Conversation 历史阅读、Blog 与 Registry。截图复核后修正折叠导航与筛选字段标签，最终结果在证据文件中归档。

最后一轮遇到根分区 ENOSPC，迁移本任务隔离副本和已完成安装证据到数据盘；随后长临时路径下浏览器启动失败，改用短数据盘 TMPDIR 后重跑。失败记录保留为环境证据，未计为通过，不中断其他服务或修改系统限制。

组件交互、独立安装和真实服务分开记录。所有运行、审批、输出和用量均为确定性本地模拟；未验证真实 Agent 执行、权限服务、业务持久化、远程取消/暂停或业务验收。手动“推进示例事件”不是运行控制。

## 后续范围

P2 依赖图、历史趋势和虚拟列表不纳入首版。代码差异编辑器、文件系统浏览及远程浏览器控制未开放占位操作。真实服务接入由消费项目提供权威快照、授权、回执、版本仲裁及持久化后另行验收。

## 最终检查与证据

- `pnpm lint`、`pnpm typecheck`、`pnpm build`（Webpack）、`pnpm check:manifest`、`pnpm check:i18n` 与 Blog 资源检查通过。
- 相关浏览器回归 46 项通过；最终视觉修正后 `pnpm exec playwright test --config=playwright.agent-board.config.ts tests/agent-board.spec.ts` 20 项通过。两轮有重叠，不将总和当成独立案例数量。
- `pnpm test:install` 通过：全新消费项目独立安装、生产构建及 Agent 工作台浏览器操作（选择、Sheet、List、Insights、缺失用量）均通过，并保留已有 Common/Canvas 安装回归。
- `node scripts/capture-agent-board.mjs` 采集 12 张截图，人工复核 Board、390px Sheet 与深色英文，尺寸、主题、语言、场景及源码文件散列见 [截图清单](../public/blog/agent-board/captures.json)。
- [验证报告](../public/blog/agent-board/validation.json)，源码快照 `6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393`。Blog 展示全部实图并提供可下载证据。
- 没有优化前后的性能或效率测量；按现有 Blog 契约，文章保留 `measuring`，不编造 `verified` 所需的比较数值。这不影响 AG0–AG4 的组件、文档和本地交互/安装交付。

复跑时使用可用端口：配置默认 3027，截图默认 3028；保留现有服务。此主机短数据盘 `TMPDIR` 可避免根盘不足和 Chrome profile 路径过长。

最终复核修正了工具审批回执的展示：确认响应不会将 ToolCall 标为 completed；只有调用方 `tool.status` 可以更新执行状态。未知结果核对用例同时断言仍为 waiting、没有 completed。修正后 20 项 Agent 场景与独立安装均重新通过，截图绑定新快照。新增文章验收覆盖全部截图、下载链接、窄屏布局、中英文及跳转入口。

文章专属浏览器验收最终 1 项通过（12 张图片加载、来源快照关联、下载链接、1440/768/390px、中英文与工作台入口）。现有 Next/Image 在客户端将 src 规范为绝对地址，测试使用解析后的 URL 核对。共享工作区合并后 lint、typecheck、Registry 与 Blog 检查通过，3010 的 `/workspace/agents/` 返回 HTTP 200；其他服务未重启。
