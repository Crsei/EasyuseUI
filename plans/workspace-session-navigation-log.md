# 会话侧栏与视图导航调整

日期：2026-10-11。依据：[Agent Workspace 计划 MD02/MD03/MD04](agent-workspace-plan.md)、[入口迁移](workspace-entry-migration-log.md)、[Design-rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)。用户要求将上下文、计划、对话统一放入左侧 Sessions，并取消顶部“最近 / 执行中 / 归档”文字筛选条。本次指令更新 PG04/PG08 的导航组织；参考实验与 Pi 服务页保持各自适配职责。

## 页面声明

- PG04 `/examples/agent-workbench/app/`、PG08 `/workspace/`：左侧 Sessions 持有项目、搜索、执行中/最近/归档分区及选中会话的视图入口。执行中和最近默认展开，归档默认收起；同一会话只属于一个分区。对话、上下文、计划与运行面板位于选中 Session 行下方。主区顶部保留当前会话 Header；上下文/计划在主区直接呈现对应受控模块，与对话及 Composer 共享会话；不叠加面板标签和会话导航工具条。右侧资源栏保留文件、变更和产物，移除上下文/计划及更多菜单中的重复入口。Diff 保留必要的审阅、分屏和最大化控制；返回对话同样使用左侧会话入口，不重复顶部视图切换。
- 保留 256px 侧栏、56px 导航轨、48px 全局栏、64px 会话 Header、760px 对话列与既有资源栏。移动端通过同一受约束 Sheet 展示完整侧栏；视图选择后返回主区。窄屏沿用单面板回退，隐藏的 Composer 保留 DOM 与草稿，返回对话后继续输入。面板、语言、主题与会话导航保留草稿/输入实例；URL 与浏览器历史维持现有身份语义。数据和运行来自既有内存 Provider，分区/选择不触发运行、批准或服务写入。

## 模块声明

- MD03-A：`SessionNavigator` 新增可选 sections 呈现与选中会话内容槽；默认筛选呈现保持兼容。执行中由 queued/starting/running/thinking/waiting 归类，归档优先，其他未归档会话在最近。分区使用弱标题、数量与展开箭头；搜索作用于所有分区；每组空态可识别。引用受控 SessionRow、DataRegion、Button；操作和未知回执保留原能力与恢复。
- MD03-B：分区会话采用单行 Compact SessionRow，左侧运行图标来自 RuntimeStatusBadge；文字名称保留在读屏内容、会话按钮的可访问名称和 hover title。只在这一可选模式隐藏可见状态文字，不改变默认 Badge/SessionRow 契约，不依靠颜色推断状态；未知状态仍明确有名称。
- 分区模式的会话操作收为行尾省略号，与行选择保持兄弟目标；展开后沿用收藏/归档/重命名及回执。不在每行重复“会话操作”文字；焦点与触摸目标保持可达。
- MD03-C：选中行下方竖向“对话 / 上下文 / 计划 / 运行面板”，16px 图标、13px 文字、32px 控件、4px 网格和语义 token；粗指针至少44px。选中视图、hover、focus 与运行状态独立；完整键盘与 zh-CN/en。点击只改变视图或底部面板开合，由例子适配层提供控制回调。
- MD04-A：PG04/PG08 移除重复主区会话视图工具条及其运行面板开关；AgentWorkbench 的默认开关保持兼容，允许调用方在侧栏提供同一受控开关。上下文/计划直接呈现受控模块并保留 Composer，不重复面板标签，也无需审阅分屏控件；真正 Diff 审阅保留分屏/最大化控件，并由侧栏返回对话。

- MD06-A：仅 PG04/PG08 的主区/资源栏面板导航排除上下文与计划；这两者由 MD03-C 选择并在主区呈现，资源栏保留最近选择的资源面板，初始为变更，返回对话时恢复；辅助视图沿用既有主区审阅布局与 Inspector 回退；主区已访问资源面板保持挂载并隐藏，保留编辑器、审阅草稿与阅读位置。默认共享面板、其他示例与 Pi 适配不变。资源栏主入口为变更/文件/产物，更多菜单仍保留已有资源和明确不可用能力。验证主区与资源栏均不再出现辅助视图标签或菜单入口。

## 执行与验收

- [x] 对照计划与实际源码，声明页面和模块增量。
- [x] 实现侧栏分区、图标状态与会话视图入口。
- [x] 实际桌面/移动端、键盘、主题语言、草稿、归档回执及 URL 历史验证。
- [x] lint、typecheck、Webpack build、浏览器与独立安装验证。
- [x] 审查交付范围，保留并行修改；Git 结果以交付消息为准。

浏览器路径：打开 workspace → 输入草稿 → 左侧上下文/计划/对话往返 → 运行面板开合 → 切换 Session → 返回原草稿；搜索跨分区、归档确认/恢复、390px Sheet 与图标读屏/触摸目标；回归默认公共组件与参考实验。UI/fixture 与真实 Pi/文件/Git/PTY 验证保持独立。

## 当前验收记录

- 在隔离候选工作树执行 `pnpm lint`、`pnpm typecheck`、`pnpm build`，全部通过；构建使用 Webpack 与本机 WASM SWC 回退。
- 最终生产浏览器回归 69/69：`workspace-entry`、`agent-workbench`、`agent-coding-workbench`、`agent-workspace-reference`、`workspace`。新增路径确认侧栏分区、读屏状态名、无重复上下文/计划标签或菜单入口、键盘/触摸导航、Sheet 关闭、输入与审阅编辑实例保留。既有产物来源定位改为验证实际来源消息与焦点，归档/未知回执继续验证来源确认。
- Pi 回归 9/9，使用 `--workers=1` 独立运行固定端口的受控 Host；验证默认公共模块兼容性，不调用真实 Provider。
- `pnpm test:install` 通过：独立 Registry 快照、安装、类型检查、生产构建与浏览器挂载；新增分区/内容槽/运行面板开关及中英文状态图标可访问名称通过验证。最后的局部改动仅涉及站点适配与回归测试，已验证的分发源码保持一致。
- 运行中的 3010 开发服务实际挂载检查通过，无页面异常；同步 Registry 缓存。最终布局沿用 neutral/token 与默认尺寸，不扩展真实服务能力。
- 隔离代码验证基线为 `0203d13`。并行提交 `353775b` 仅新增开发指南与 5 个文档的后续计划，已核对并保留；当前交付代码与候选一致。保留并行 AGENTS/i18n/SVG 计划及 Work Items 源码缓存修改；文档索引只暂存本次 7 个条目。

本地证据前缀：`../.tmp/session-navigation-`（位于仓库父目录）。最终日志为 `build-delivery.log`、`lint-delivery.log`、`typecheck-delivery.log`、`browser-delivery.log`、`pi-browser-delivery.log`；安装日志为 `install-accepted.log`。浏览器截图与 trace 在对应 `*-results` 目录。Git 提交与远端校验结果由交付消息报告。
