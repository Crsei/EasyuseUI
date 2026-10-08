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

首版未包含 P2 依赖图、历史趋势和虚拟列表；本轮继续实现的范围见下文。代码差异编辑器、文件系统浏览及远程浏览器控制未开放占位操作。真实服务接入由消费项目提供权威快照、授权、回执、版本仲裁及持久化后另行验收。

## 最终检查与证据

- `pnpm lint`、`pnpm typecheck`、`pnpm build`（Webpack）、`pnpm check:manifest`、`pnpm check:i18n` 与 Blog 资源检查通过。
- 相关浏览器回归 46 项通过；最终视觉修正后 `pnpm exec playwright test --config=playwright.agent-board.config.ts tests/agent-board.spec.ts` 20 项通过。两轮有重叠，不将总和当成独立案例数量。
- `pnpm test:install` 通过：全新消费项目独立安装、生产构建及 Agent 工作台浏览器操作（选择、Sheet、List、Insights、缺失用量）均通过，并保留已有 Common/Canvas 安装回归。
- `node scripts/capture-agent-board.mjs` 采集 12 张截图，人工复核 Board、390px Sheet 与深色英文，尺寸、主题、语言、场景及源码文件散列见 [截图清单](../public/blog/agent-board/captures.json)。
- [验证报告](../public/blog/agent-board/validation.json)，源码快照 `6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393`。Blog 展示全部实图并提供可下载证据。
- 首版未提供优化前后的性能或效率测量；当时文章保留 `measuring`。P2 的同源 DOM 比较现已补齐，见下文。这不影响 AG0–AG4 的组件、文档和本地交互/安装交付。

复跑时使用可用端口：配置默认 3027，截图默认 3028；保留现有服务。此主机短数据盘 `TMPDIR` 可避免根盘不足和 Chrome profile 路径过长。

最终复核修正了工具审批回执的展示：确认响应不会将 ToolCall 标为 completed；只有调用方 `tool.status` 可以更新执行状态。未知结果核对用例同时断言仍为 waiting、没有 completed。修正后 20 项 Agent 场景与独立安装均重新通过，截图绑定新快照。新增文章验收覆盖全部截图、下载链接、窄屏布局、中英文及跳转入口。

文章专属浏览器验收最终 1 项通过（12 张图片加载、来源快照关联、下载链接、1440/768/390px、中英文与工作台入口）。现有 Next/Image 在客户端将 src 规范为绝对地址，测试使用解析后的 URL 核对。共享工作区合并后 lint、typecheck、Registry 与 Blog 检查通过，3010 的 `/workspace/agents/` 返回 HTTP 200；其他服务未重启。


## 继续实施：P2 展示与测量

以已推送的 `d5cea15` 为基础，在数据盘隔离快照实现，保留共享工作区内并行 CRM / Work Items 修改。复用原有 AgentRunRow、DataRegion、DataTable、Segmented 与 WorkflowCanvas；无新增 npm 依赖。

- P2-D：AgentDependencyGraph，只读 Canvas、来源依赖列表、revision仲裁、缺失/过滤外端点、循环或受影响链提示；运行状态不推导依赖满足。按需加载，失败可重读。
- P2-H：AgentUsageHistory，来源区间、runId、pointId/revision；分运行/币种，未知及不连续区间留断点，有效0保留，完整数值表可访问。
- P2-V：AgentRunVirtualList，实际行高和阅读锚点、完整已加载口径、仅窗口及焦点行挂载；大集合入口 `/workspace/agents/scale/`。筛选移除入口后，关闭详情回到有效主区。
- P2-M：已采集固定1,000条运行、相同视口和行组件的普通/虚拟渲染证据，分别记录 DOM 挂载数量与固定打开详情路径，不外推真实服务或未测性能。

首次扩展检查：lint、typecheck、Webpack build、Manifest、i18n通过；首轮28项 Agent/文章/扩展测试通过。补充依赖模块读取失败恢复、筛选移除入口恢复和固定对照视口后，进行最终回归和独立安装。


### P2 验收完成

在 `24d1d7b`（正式 Work Items 交付）之上合并 P2。共享 Catalog、Registry、双语资源、懒加载与全窗口路由保留 Work Items 的正式实现；CRM 未提交修改保持原任务归属。新增三个独立安装项，Agent Catalog 共19项；交付快照总计90个 Catalog组件、104个 Registry 项，无新增 npm 依赖。

- lint、typecheck、Webpack生产构建、Manifest/Registry、i18n 与 Blog 检查通过。
- 最终 Agent/扩展/原文章回归30项通过（20 + 9 + 1）。测试包括模块加载失败重读、循环/缺失依赖、历史断点/多币种/有效0、1,000行键盘导航、触屏与失去入口后的焦点恢复。
- `pnpm test:install` 通过：独立 CLI 安装、CSS/依赖解析、TypeScript、生产构建和浏览器验收；覆盖来源依赖、有效0历史、1,000虚拟行及既有 common/Canvas/Work Items 消费流程。
- [P2 实图与源码清单](../public/blog/agent-board/p2/captures.json)：8张新增截图；保留首版12张及其原始快照。
- [同源测量](../public/blog/agent-board/p2/measurements.json)：同一快照、1,000条来源行、AgentRunRow、分组、1440×1000视口、560px列表区、zh-CN/light/reduced motion；每模式3次独立上下文。DOM挂载行数中位数普通1,000、虚拟8，行高均120px；首条详情均一次点击。
- [P2 验证报告](../public/blog/agent-board/p2/validation.json)，源码快照 `62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b`。文章状态更新为 `verified`，限定于本地交互、分发与记录的同源比较。

测量不证明延迟、内存、服务性能、真实 Agent 执行、授权或业务验收。依赖图只有来源明确的只读关系；历史只有已加载来源区间；虚拟列表不实现远程分页。根3010服务未重启，共享构建产物未覆盖；正式构建和浏览器证据来自数据盘隔离快照。

最终归档后浏览器验收31项通过：20项原 Agent 场景、9项扩展、2项文章验收。新增文章用例核对8张图片、6次同源样本、行高一致、无提前挂载交互引擎及大集合入口。合并后主工作区 lint、typecheck、Registry、Blog、i18n 与现有3010浏览器冒烟均通过；依赖视图、大集合列表和文章无页面异常。
