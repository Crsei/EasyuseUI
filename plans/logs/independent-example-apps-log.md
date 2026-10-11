# 独立示例应用实施记录

## 2026-10-11：Agent Workspace 优先迁移

用户指定本轮先迁移 Agent Workspace，覆盖计划中所需的共享包、Agent 应用边界、主站组件展示、Pi 协议/服务回归和 CI/部署入口。其余六个应用、主站整体移动到 apps/docs、全七应用 EX0–EX7 与 A09 冷热性能比较仍待后续；不能由本轮结果推定全部计划完成。

设计依据：[迁移声明](../agent-workspace-independent-migration.md)、[逐文件/路由/17模块账本](../agent-workspace-migration-files.json)、[原页面与模块合同](../agent-workspace-plan.md)、[独立应用 README](../../examples/agent-workspace/README.md)。本轮延续原 Pi 会话、历史、request ID、unknown 对账与权限合同，没有加入 Git/PTY/编辑写入或多 Agent 服务。

### 交付结构

| 消费者 | 源码与入口 | 运行/输出边界 |
| --- | --- | --- |
| docs | 根目录 @easyuse-ui/docs；canonical /examples/agent-workbench/elements/；旧总览、app、layouts、regions、pi、workspace 挂17模块画廊及独立入口 | dev 3010 / preview 3011；自己的 .next/out；不挂应用 Provider 或 Pi 客户端 |
| Agent Workspace | examples/agent-workspace；/、/app/、/layouts/、/regions/、/pi/ | dev 3020 / preview 3021；独立 package、TS、Next、ESLint、Playwright、Provider、.next/out/test-results |
| UI 源码 | packages/ui；模块级 exports，没有全组件根 barrel；React 为 peer | 公共 components/lib/styles 单一源码；旧公共文件路径暂以源码链接支持尚未迁移的消费者 |
| Pi 协议与 Host | packages/pi-protocol；services/pi-host 从协议包导入 | 纯 TypeScript 协议，无浏览器/站点反向依赖；Host 保持独立，未重启已有未知归属服务 |

保留主站有限的 reference/intervention/资源展示 fixture 与实际 MD01–MD17；应用适配器、URL 控制器和 Pi Provider 归应用。复制到消费者的有限 fixture 数据由各消费者控制，不创建共享应用控制器。RuntimePanel、样式和双语字典归公共受控模块，并纳入已有 AgentWorkbench Registry 分发闭包。

独立应用不复制整个 public 目录，当前无额外私有图片/字体素材。Tailwind 由 scripts/check-ui-sources.mjs 根据实际解析到的公共模块生成 source 列表。Workspace 未显示的内容首次显示时挂载，访问后保留实例；没有改变受控选择或服务权威。

主站公开应用地址由 NEXT_PUBLIC_AGENT_WORKSPACE_ORIGIN 在构建时显式提供，缺失时显示“尚未配置示例地址”。HTTP(S) origin 拒绝凭据、路径、查询与 fragment。旧地址只转发经校验的公共 template/page/session/project/panel/layout/region/scenario 字段；不会跨 origin 转发 token、任意目标、草稿或 pending。应用可选 NEXT_PUBLIC_DOCS_ORIGIN 也没有生产 localhost fallback。

### 验证记录

| 范围 | 命令/证据 | 结果 |
| --- | --- | --- |
| docs 源码门禁 | pnpm lint、pnpm typecheck、pnpm build（Webpack/WASM SWC；显式本地 SITE_URL） | 通过，267 个静态生成项；根命令未构建 Agent 应用 |
| Agent 源码门禁 | pnpm --filter @easyuse-ui/example-agent-workspace lint/typecheck/build | 通过，7 个静态生成项（含内部输出）；没有主站构建步骤 |
| 依赖闭包 | pnpm check:boundaries；TypeScript realpath 模块图与公共源码扫描 | docs 2042、Agent 1223 个解析文件；docs 的 examples 私有源码引用 0，Agent 主站/兄弟应用引用 0 |
| Agent 浏览器 | 默认生产 Playwright 全集及修正后的两项失败用例重跑 | 223 项常规用例通过；真实 provider 用例在常规集合显式跳过并单独执行 |
| docs 浏览器 | pnpm exec playwright test --grep-invert @performance + 指定复验 | 771 项通过：全集768，原预算两项复验通过，排除并行编辑的候选源码严格匹配一项通过；完整原始失败日志保留 |
| Pi Host | pnpm pi:typecheck、pnpm pi:test | 通过，8 项服务测试；Origin/auth、HTTP/SSE、source ordering、持久化、unknown 与幂等受控回归 |
| 真实 provider | PI_REAL_PROVIDER=1 pnpm --filter @easyuse-ui/example-agent-workspace exec playwright test tests/pi-workspace-real.spec.ts --config playwright.pi.config.ts | 1 项通过（25.7s）；真实流式回复、只读工具、原生上下文继续、刷新、Host 重启、来源确认停止 |
| 分发 | pnpm test:install、pnpm test:install:themes | 独立 CLI 源码安装、生产构建与浏览器验证通过；replace/host/scoped 模式、portal、Canvas、locale 与私有主题 token 通过 |
| 目录与规范 | check:i18n、check:manifest、check:blog、check:docs、check:ui-contracts | 1573 portable +124 SVG +2246 site +166 CRM 消息；203 组件/223 Registry；15 已发布博客/1 草稿；316 源码资源、74 文档片段与203契约映射通过 |
| CI 选择 | node scripts/select-quality-jobs.mjs --self-test | 应用私有、公共包、站点元数据、锁文件四组输入通过；实际远程 CI 未在本地冒充完成 |
| 导航与视觉 | 主站旧 workspace → 显式独立应用链接 → 3021；深链接刷新、草稿；截图见下方 | 通过，不转发测试 token；主站17模块、桌面应用分别实挂审阅 |

回归中修正了迟到的会话列表读取覆盖新建/显式选择的竞态：按视图版本与正在创建的请求决定是否恢复旧选择。新增受控延迟读取用例，确认新建选择保持。测试定位限定可见审批对象；Pi 文件的 fixture Host 使用串行文件内调度，避免同一端口被并行 beforeAll 争用。

### 故障隔离与可重复步骤

在临时 .local/agent-migration/fault-candidate 副本的 Agent app/(fixture)/page.tsx 加入 `const intentionalIsolationFault: number = "Agent-private page fault"`。Agent Webpack 完成后类型检查以 TS2322 失败；同一候选的主站完整 validate-site-url → Registry → blog → docs → Next Webpack 构建 exit 0。主站未配置 Agent origin 的预览仍有17模块，显示地址未配置，没有 Pi 请求。故障只存在临时副本，工作树和交付源码无该注入。

复现时使用独立候选目录、安装/解析冻结依赖后注入上述一行，分别从 Agent 与 docs 包目录运行构建。此主机临时副本复用安装依赖时使用 Node 调用各构建步骤；不在链接的 node_modules 上触发 pnpm 的重建/清空提示。原有3010开发进程保持不动。

故障主站构建的观测为6:06.82、最大 RSS 6095536KB；该过程与其他检查并行，不是隔离性能样本。当前产物 docs 130735129 bytes、Agent 2415860 bytes，仅说明构建/资产范围，不能据此宣布加载或构建加速。完整固定环境冷/热基线与七应用 A09 比较保留后续。

交付候选从经审查的 Git 暂存区导出，公共包解析指向候选源码；并行字典空行编辑及两个原有未跟踪计划文件未加入提交。生成源码预览按候选字典生成，避免将并行编辑的 hash 带入交付产物。候选完整主站构建 exit 0，源码预览的文件/hash 严格匹配用例通过；工作树保留的并行空行与交付字典不一致，不能用它覆盖候选生成物。主站两项在并行构建期间超时的浏览器用例，在构建结束后按原30秒预算重跑通过（9.7s），未改预算。

### 留存证据

[主站画廊](../evidence/agent-workspace-migration/gallery-light-zh.png)、[桌面应用](../evidence/agent-workspace-migration/application-light-zh.png)、[真实 provider](../evidence/agent-workspace-migration/pi-real-provider.png)、[地址未配置](../evidence/agent-workspace-migration/docs-unconfigured.png)。机器结果与版本/产物/分发 snapshot 见 [validation.json](../evidence/agent-workspace-migration/validation.json)。本机完整原始日志留在 .local/agent-migration；生产浏览器矩阵截图与 traces 按 docs/Agent 各自输出目录隔离。

### 后续边界

本轮完成 Agent 工作包，不扩展 Pi 能力，也不改写历史 AW0–AW5/CW 完成状态。根 docs 位置与公共路径兼容链接属于过渡状态；未被公共组件使用的 Registry 辅助模型/hooks 和其他示例仍需后续核对迁移。其余六应用、apps/docs 移动、全仓最终聚合、全部兼容入口部署与隔离性能矩阵不标记为完成。静态部署说明可复现，本轮未发布公网部署。
