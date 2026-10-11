# Agent Workspace 独立应用迁移执行声明

日期：2026-10-11。状态：Agent 工作包实现与本轮门禁完成，其他应用及全计划性能矩阵待后续。范围由用户指定：优先迁移 Agent Workspace，不先执行 CRM 试点，不包含 Agent Board。依据 [独立应用计划](independent-example-apps-plan.md)、[原页面/模块合同 PG01–PG10、MD01–MD17、V01–V12](agent-workspace-plan.md)、[组件先行合同](agent-workspace-component-first-plan.md)、[Pi 合同](pi-agent-workspace-integration-plan.md)、[设计原则](../Design-rules.md)和[组件规格](../Component-Specification.md)。

## 页面声明

- AW-EX-P01：独立 origin 的 `/` 为三模板工作台，`/layouts/` 为布局回归，`/regions/` 为应用交互场景，`/pi/` 为真实服务客户端。沿用 PG03–PG08 的层级、尺寸、默认折叠和固定滚动区域；首页默认会话，模板/page/session/project/panel/layout/scenario 等公共查询参数继续受原解析器校验。fixture 与 Pi Provider 分开，跨页面不把 fixture 注入 Pi。原能力边界及 V2 聊天样式保持。主题和语言只更新 Provider，不重建编辑器；草稿、选择、阅读位置继续按原对象语义维护。不同 origin 的旧存储不自动迁移、不清除、不转发凭据或 pending。
- AW-EX-P02：主站 `/examples/agent-workbench/elements/` 为 canonical 画廊；旧总览/app/layouts/regions/pi/workspace 入口挂组件画廊及独立入口。reference/intervention 精细 fixture 留主站。画廊实际展示 MD01–MD17，保留状态/规范/技术视图、双主题双语、键盘和减少动效合同；默认展示全部模块，页面滚动、长内容区域内滚动。无 Pi 客户端、连接凭据和应用 Provider。

## 模块声明

- AW-EX-M01：独立入口模块宿主 AW-EX-P02，复用 Button/文档布局。公开 origin 仅接受 HTTP(S)、无凭据的显式配置；无配置显示“尚未配置示例地址”。旧入口的查询仅转发经 allowlist 验证的公共字段；不自动跳转、探测服务或转发 token/任意 URL。沿用紧凑控件/中性 token、独立链接与焦点语义。
- AW-EX-M02：MD01–MD17 的 docs fixture 归主站；应用 reducer/navigation/Pi 适配归独立应用。公共组件仍单一来源，RuntimePanel/延迟资源面板属于受控模块，来源数据和 callback 均由消费者提供。Workspace 内容首次实际显示时挂载，访问后保留实例，避免隐藏 Review/Artifacts 提前加载；宽度、布局与受控 activeView 决定可见性。执行、服务、保存、审批与 unknown 对账权威不变。展示导航为局部回调，不挂应用路由控制器。
- AW-EX-M03：主题/I18n 为独立应用 Provider；Next/React/TypeScript/Tailwind、Base UI/Lucide 和既有 CodeMirror 保持当前固定版本与加载边界。共享 UI 使用源码子路径，不设全组件 barrel；React 为 peer。Pi 协议由独立纯 TypeScript 包导出，Host 不依赖浏览器源码。未采用的 Query/Zod/PTY/Git 不增加。

## 结构与分发声明

Agent 应用自己的 package/config/TS/ESLint/Playwright/public/out/cache 与部署说明落在 `examples/agent-workspace`。主站仍位于仓库根（迁移其他应用和 apps/docs 留后续），包名声明为 docs。共享源码落在 packages/ui；旧公共路径通过单一源码兼容链接支持尚未迁移的站点、Registry 和其他项目，禁止复制维护两份源码。这是本阶段的路径兼容层，后续整站迁移清除。Registry 消费方仍使用原 components/lib/styles 路径，不泄漏 workspace 导入。机器账本记录源文件归属和迁移路径。

## 验收路径

单独构建/类型检查 docs、Agent、Host；检查 docs 编译图无 Agent 私有源码、应用无站点/其他应用私有引用；候选副本注入 Agent 私有错误证明 docs 隔离。浏览器分别覆盖主站17模块/旧入口参数、独立三模板/布局/草稿/资源、Pi HTTP/SSE 发送/刷新/取消/unknown。运行 Registry 安装和主题模式验证。真实 provider 单独记录，fixture 不代替它。执行证据见 [迁移记录](independent-example-apps-log.md)。
