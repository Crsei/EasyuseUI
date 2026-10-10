# Workspace 新示例入口迁移

日期：2026-10-11。来源：[Agent Workspace 设计计划](agent-workspace-plan.md)、[设计实施记录](agent-workspace-design-completion-log.md)、[Design-rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)。用户要求将 `/workspace/` 改为新版示例；本记录更新此前该地址承担通用 Shell 示例的选择。

## 页面声明

| 页面                                  | 声明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PG08 `/workspace/`                    | 直接挂载 PG04 的 `WorkbenchDemo` 与 `WorkbenchExampleProvider`，默认 coding/session/首个 fixture 会话。用户可读对话、输入、切会话、检查工具和宽 Diff；URL 显式 page/session/layout/scenario 优先于入口默认值。48px 全局栏、56px 导航轨、256px 侧栏、64px 会话标题、760px 聊天列；资源按既有偏好展开，底栏初始收起。使用 `SiteFrame` 全窗口分支，不叠加站点页头页脚；聊天、资源、底栏分别滚动。390px 沿用共享 Sheet/菜单，短视口保留输入与发送。会话切换保留各会话草稿，面板/主题/语言切换保留编辑器实例和阅读位置；刷新仅恢复 URL 选择与面板偏好，业务 fixture 重置。数据、运行、权限与回执由现有内存 Provider 提供；此入口不连接 Pi 或增加真实服务能力。影响 MD01–MD12、MD15–MD17。 |
| PG09 `/workspace/shell/`              | 保留原 `WorkspaceShellDemo` 的通用 Shell/Inspector/数据与运行状态实验，页名为 Workspace Shell；继续使用站点阅读布局，保留 Agent Board 与 SVG 工作台链接。原有组件行为测试迁移到此地址。数据与动作仍为明确本地 fixture，刷新重置；沿用原尺寸、响应式、键盘、主题和语言行为。                                                                                                                                                                                                                                                                                                                                                                                                          |
| PG04 `/examples/agent-workbench/app/` | 保留原默认 home 与显式查询行为；普通工作区导航留在当前入口，链接复制/新标签页使用同一入口的明确查询。PG01 总览、Pi、Agent Board、Canvas、SVG 和 Work Items 路由继续可达。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## 模块声明

- MD01–MD12、MD15–MD17 在 PG08 复用 PG04 同一实现和参数，不建立独立视觉变体。Compact、4px 网格、共享语义 token、hairline、右侧浅蓝用户消息、开放 Agent 正文、公开阶段分隔、只读工具摘要、稳定 Composer 和底栏规则保持既有声明；触摸44px、键盘、reduced-motion、zh-CN/en 和长内容沿用公共模块。
- ENTRY01：`WorkbenchDemo` 的入口默认 page 为可选示例适配参数；只有 URL 缺少 page 时使用默认值。工作区导航和错误恢复使用当前路由，显式非法参数继续呈现错误；恢复返回当前入口默认会话。该模块只负责视图，不发送服务请求，也不将 unknown 变成功。
- ENTRY02：`SiteFrame` 仅将 `/workspace` 与 `/workspace/` 加入全窗口分支；PG09 和其他阅读路由沿用原站点布局。该模块不保存业务、焦点或草稿；这些由既有工作台控制器负责。
- SHELL01：PG09 的 `WorkspaceShellDemo`、SessionRow、AgentRow、Inspector、Conversation/ChatComposer/ToolCall 和数据态控件保持原输入、事件与本地恢复行为，页面标题与 metadata 说明其组件示例职责。
- ENTRY03：WorkspaceShell Catalog 的基础页说明同步到 `/workspace/shell/`，保持站点 zh-CN/en 资源、紧凑字典和生成索引一致。该说明只指向组件示例，不改变可分发组件的 API、依赖或 CSS。

## 浏览器验收路径

1. 直接打开 `/workspace/`，验证会话、工具、输入、资源栏、初始收起底栏与全窗口高度；没有旧 Shell 的数据状态控件。
2. 输入草稿 → 键盘进入 Changes/Review → 返回会话，保留草稿与输入实例；查询和可复制链接保留 `/workspace/`，刷新恢复显式页面/会话。
3. 打开非法 page → 恢复入口，返回 `/workspace/` 的默认会话；原 `/examples/agent-workbench/app/` 仍默认 home。
4. 390px、浅/深、zh-CN/en、粗指针与 reduced-motion，验证无横向溢出、输入可用及语言/面板切换的草稿保持。
5. `/workspace/shell/` 的既有选择、Inspector、五态、触摸、IME、主题/语言测试；回归共享工作台与站点框架。

## 执行清单

- [x] 页面与模块声明、原始参考选择和服务边界。
- [x] 新入口、旧 Shell 迁移和文档路径更新。
- [x] lint / typecheck / Webpack build。
- [x] 隔离生产浏览器验证与当前开发服务 smoke。
- [x] 审查任务文件与 Git 交付范围；提交、推送与远端 SHA 以 Git 记录及交付消息为准。

本次未改变 Registry 依赖、便携组件或共享 CSS；独立安装检查不适用。真实 Pi / provider / Git / PTY /多 Agent 验证不属于本次入口迁移。

## 验证范围与原有问题

旧编码工作台测试的 Composer 顶部入口与 Main 命令面板断言早于完整参考设计；本次将其同步为当前导航轨搜索、上下文引用、底部命令输出和主区文件标签。仍验证来源身份、脱敏、未知结果、连接中断、键盘/触摸与草稿实例。

站点源码晚响应测试补充首次读取的 loading 断言，确保组件初始化且请求已开始后再切换文件；继续验证晚响应丢弃与复制失败，不改变源码浏览器实现。

验证使用从 `c8e9e7f` 建立的隔离候选，只复制本次任务文件；共享 `3010` 开发服务仅作 smoke，正式浏览器验证使用独立的 `3011` 生产预览。最终 lint、typecheck、Webpack build 与 `check:manifest` 通过；生产页面的 WorkspaceShell 路径说明已实际验证 zh-CN/en。构建使用该主机的 WASM SWC fallback。

生产浏览器累计通过 105 个不同用例：共享编码工作台、区域及参考设计的 56 项在广泛回归中通过；最终构建重跑入口、旧 Shell、站点及相关语言/触摸路径的 49 项全部通过。此前广泛回归的源码晚响应时序失败经上述等待修正，在最终轮通过。开发服务 smoke 的 2 项也通过，并检查了实际桌面与移动端页面；`/workspace/`、`/workspace/shell/` 和 Pi 入口在当前开发服务均返回 HTTP 200。

原始证据位于工作区上级 `.tmp/`：`workspace-entry-lint-final.log`、`workspace-entry-typecheck-final.log`、`workspace-entry-build-final.log`、`workspace-entry-production-accepted.log`、`workspace-entry-final-browser.log`、`workspace-entry-smoke-final.log`、`workspace-entry-i18n-baseline.log`；截图及失败追踪保留在对应 results 目录。

附加全站 `pnpm check:i18n` 在隔离候选与未修改 HEAD `c8e9e7f` 均因既有 Catalog 文案缺少译文而失败，首个错误为“打开明确关联同一 ChangeSet revision 的文件；回调不执行写入。”。该原有问题单列，不作为本次入口迁移引入的失败，也不声称全站国际化验收完成；本次变更的 Shell 路径保持两种语言和生成字典一致。

共享工作区中原有 AGENTS、组件语言资源、Work Items 文档缓存和 SVG 并行计划保留，不纳入本次 Git 交付。
