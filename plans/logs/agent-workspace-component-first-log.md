# Agent Workspace 组件先行实施记录

日期：2026-10-11。计划：[CF0–CF4](../agent-workspace-component-first-plan.md)。状态：CF0–CF4 已实现并通过隔离工程、生产浏览器及独立安装验收。

## 范围与分工

按用户指定使用 `gpt-6-sol`、`xhigh`：只读审计/视觉复核、CodePreview 组件与 FileViewer 接入、统一元素画廊三个子任务。主代理负责项目定位、AGENTS/开发指南/计划、集成验收与限定提交。

项目新增定位为简单组件展示、复杂组件构建和项目组合验证。先组件与集中展示，再页面组装；展示效果、设计规范和技术说明分开。新开发画廊属于开发文档，不向 Pi 注入 fixture 或扩大工具权限。

## 元素与来源逐项映射

全部源自本仓库已有受控组件，基础交互复用已安装 Base UI/Lucide。本次未发现仓库根 LICENSE，不能由源码可见推定额外对外许可；第三方依赖按各包随附许可记录。下列展示复用同一个参考模块适配器，复杂状态继续在原实验室复核。

| ID | 实际组件入口 | 本轮技术与呈现 | 验收入口 |
| --- | --- | --- | --- |
| MD01 | `agent-workbench/navigation.tsx` ProjectSwitcher | Base UI 选择器、共享 token；项目/环境身份 | PG10 / 精细实验室 |
| MD02 | `agent-workbench/activity-navigation.tsx` ActivityNavigation | Lucide + Button/Menu；紧凑导航轨 | 同上 |
| MD03 | `agent-workbench/navigation.tsx` SessionNavigator | 既有受控 Tree/Item；选择与运行独立 | 同上 |
| MD04 | `agent-workbench/navigation.tsx` SessionHeader | RuntimeStatusBadge + 能力回调 | 同上 |
| MD05 | `agent-workbench/conversation.tsx` AgentConversation | React 受控消息、历史加载和阅读锚点 | 同上 |
| MD06 | 同上 / ChatMessage | 右对齐浅蓝用户消息、主题token | 同上 |
| MD07 | 同上 / AgentTurn | 公开阶段与开放正文，保持来源顺序 | 同上 |
| MD08 | 同上 / 计划片段 | 来源步骤和计数；未接 React Flow | 同上 |
| MD09 | 同上 / ToolCall | 紧凑 Read/Search + 可见异常 | 同上 |
| MD10 | 同上 / 文件修改片段 | 来源变更 + 宽 Diff 入口 | 同上 |
| MD11 | 同上 / Shell/Test 片段 | 有界输出、来源退出信息；未接 PTY | 同上 |
| MD12 | `agent-workbench/composer.tsx` AgentComposer | 既有输入组件、IME和版本草稿 | 同上 |
| MD13 | `agent-workspace/intervention-panels.tsx` InterventionQueuePreview | 本地明确回执；不推断队列服务 | 同上 |
| MD14 | 同上 + `approval-request-panel.tsx` | 审批卡片与关联提醒，来源确认 | 同上 |
| MD15 | `agent-workbench/deferred-panels.tsx` | Base UI Tabs + ContextPanel/Item | 同上 |
| MD16 | `agent-workbench/review.tsx` + `code-preview.tsx` | 宽Diff保留；新增 CodeMirror 语法/搜索/只读代码 | PG10 / 独立 CodePreview Demo / FileViewer |
| MD17 | `agent-workspace/runtime-panel.tsx` | 既有 Tabs/ExecutionSessionList；指标/PTY无来源时明确不可用 | PG10 / 精细实验室 |

目录路径以 `components/blocks/` 或 `components/examples/` 的实际导出为准；这张表记录适配关系，不声称所有模块均独立 Registry 项。公共 CodePreview 独立分发；画廊布局是开发组件。

## 新技术与依赖

CodeMirror 官方模块（MIT）：`@codemirror/state 6.7.6`、`view 6.43.14`、`language 6.13.1`、`lang-javascript 6.2.5`、`search 6.7.2`；语法标签 `@lezer/highlight 1.2.5`。均锁定直接版本。替换原因是纯 pre 缺少语法、搜索和长文本可视区域管理；本轮只读预览，不把编辑引擎加载等同于具备保存能力。

Next/React/TypeScript/Tailwind、Base UI/shadcn 分发、Lucide、ESLint/Prettier/Playwright 沿用。Recharts/React Flow 已在库中采用，但本轮 Workspace 没有虚构指标或依赖图；Zod/Query/Table/Zustand/dnd kit/Faker/xterm 等按计划保留候选。新依赖、许可、加载与分发证据在最终检查补录。

## 检查与截图

基线截图在现有 3010 开发服务取得，确认参考页一次仅显示一个模块；未重启服务。独立浏览器检查首版 PG10 在 1440/1024 下均为 17/17 实际可见、页面无水平溢出、无重复 DOM ID。最终生产产物验收另行登记。

审查中发现并修正：语言标签被用作 React 分组 key 会重挂组件，改为稳定 groupId；同一目标重复导航不应因 selected 未变而失效，增加独立导航请求；CodeMirror 长内容要保留实际滚动容器，搜索高亮与只读搜索栏使用同一引擎查询。首轮隔离 lint 检出画廊 effect 同步设置视图，不将这次失败算作通过，修复后复测。

生产浏览器回归：`pnpm exec playwright test tests/agent-workspace-elements.spec.ts tests/agent-workspace-reference.spec.ts tests/agent-coding-workbench.spec.ts tests/agent-workbench.spec.ts tests/workspace-entry.spec.ts`，64/64 通过（隔离产物，3011）。覆盖三模板、原参考状态、画廊、入口、草稿/IME/失回执、搜索只读、1000行虚拟化、移动/触摸与减弱动效。新增画廊3项亦在3010单独通过，前者为正式产物证据。

独立安装首轮在 lazy preview 尚未挂载时执行旧脱敏断言而失败；修正等待顺序并保留断言，复测结果在最终工程表记录。双语检查同时发现已有8条 Catalog 描述缺译，与新组件描述/props一起补齐；`check:i18n` 已通过。

截图目录：`../.tmp/easyuseui-component-first-z2s7gcqe/screenshots/`（相对仓库根）。`before-reference-1440x1000.png` 为原实验室；`final-elements-desktop.png` 和 `final-code-preview.png` 为修正网格对齐后的展示。独立复核另有英文深色/中文浅色桌面截图 `after-elements-*-top.png`。完整长图的吸顶头位置是截图行为，检查效果优先使用首屏与模块图。

正式环境：Node 24.21.0、GLIBC 2.28、Webpack/WASM SWC、系统 Chrome；组件状态和浏览器测试均为明确 fixture，不调用真实 Pi/provider。

## 服务与交付边界

本轮证明公共只读代码组件、开发画廊和既有 fixture 组合。CW 编辑/保存/Git/命令/PTY、DG2 服务协议以及 AW6–AW8 业务结果继续独立实施；无新增真实 provider 流量。共享工作树中已有的 SVG 计划、格式空行及其他生成内容按来源隔离。

## 最终工程结果

| 检查 | 结果 / 证据 |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` / `pnpm build` | 最终源码全部通过，`lint-range.log`、`typecheck-range.log`、`build-range.log` |
| `pnpm check:i18n` / `pnpm check:manifest` / `pnpm check:docs` | 通过；203组件、223 Registry 条目与文档源码一致 |
| 生产浏览器回归 | 64/64 通过，`browser.log`；行范围修正后重点5/5再通过，`browser-final.log` |
| `pnpm test:install` | 最终源码独立安装、类型/生产构建、浏览器挂载全部通过，`install-range.log` |
| CodePreview 范围检查 | 不存在/非法行范围无高亮、不滚动；部分交集只标真实来源行。使用实际内部范围函数及 CodeMirror StateField 检查，未为测试扩产品API |
| 源码/文档审查 | Markdown链接有效，原设计reference副本未改，`git diff --check`通过；页面仅组装组件 |

日志均位于仓库旁 `../.tmp/easyuseui-component-first-z2s7gcqe/`。测试与截图不进入分发源码；它们记录本机明确范围的证据。包版本和 MIT 来源已从安装包 package.json 核实。普通 FileViewer 通过 React.lazy 按需加载 CodePreview；独立Demo/元素页因明确展示该组件而加载，未宣称进行全站包体基准。

交付包含针对已提交源码重新生成的 Catalog/文档索引和源码快照；原工作区中对应旧索引的生成差异由一致性重建消化，不引入其他未完成业务源码。保留额外 i18n 格式空行和未纳入的 SVG 计划。提交与远程 SHA 在交付消息确认。
