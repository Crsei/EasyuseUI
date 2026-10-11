# Agent Workspace

独立的 Next 16.3.8 / React 19.3 / TypeScript / Tailwind 4 静态应用；Node 24、pnpm 11.9、Webpack。三种模板属于同一应用；fixture 与 Pi Provider 分离。复用 `@easyuse-ui/ui` 单一源码及 `@easyuse-ui/pi-protocol`，没有文档站或兄弟应用源码依赖。

从仓库根安装：`pnpm install --frozen-lockfile`。

```bash
pnpm --filter @easyuse-ui/example-agent-workspace dev       # 3020
pnpm --filter @easyuse-ui/example-agent-workspace lint
pnpm --filter @easyuse-ui/example-agent-workspace typecheck
pnpm --filter @easyuse-ui/example-agent-workspace build
pnpm --filter @easyuse-ui/example-agent-workspace preview   # 3021
pnpm --filter @easyuse-ui/example-agent-workspace test
pnpm pi:typecheck
pnpm pi:test
PI_REAL_PROVIDER=1 pnpm --filter @easyuse-ui/example-agent-workspace test:real
```

首页 `/` 默认编码会话；`/?template=artifacts&page=artifacts`、`/?template=console&page=inbox` 是其他模板。`/app/` 是应用内兼容别名；`/layouts/`、`/regions/` 是布局/交互 fixture；`/pi/` 为独立服务客户端。主站的17模块画廊和精细实验室保留在 `/examples/agent-workbench/elements/` 与 `/regions/reference/`，不继承应用状态。

页面/模块合同：[迁移声明](../../plans/agent-workspace-independent-migration.md)、[原 PG/MD/V 声明](../../plans/agent-workspace-plan.md)、[组件先行](../../plans/agent-workspace-component-first-plan.md)、[Pi 合同](../../plans/pi-agent-workspace-integration-plan.md)。验收记录：[独立迁移记录](../../plans/independent-example-apps-log.md)。fixture 不能证明真实 provider、服务或业务验收。

## 部署

构建只生成本包 `.next/` 和 `out/`，不需要主站或 Pi Host 在线。发布本包 `out/` 到支持目录 `index.html` 的静态服务器，保留 `_next/`、尾斜线和 `/pi/index.html` 等文件；直接访问/刷新 `/pi/`、`/layouts/` 应返回对应页面。本轮只支持 origin 根目录部署，未声明 basePath 子目录。

`NEXT_PUBLIC_DOCS_ORIGIN` 可选，在构建时配置无凭据 HTTP(S) origin；缺失时文档文字不提供虚假链接。主站构建时设置 `NEXT_PUBLIC_AGENT_WORKSPACE_ORIGIN`，否则显示地址未配置。地址配置只提供导航，不代表服务在线。

Pi Host 独立运行，配置中显式允许实际前端 origin（本地3020/3021示例已登记）。远程前端需配套可达的受控 Host/部署网络；浏览器默认 loopback endpoint 指向浏览器所在机器。凭据仅在 `/pi/` 输入，禁止发布到静态资源、NEXT_PUBLIC 变量或 URL。未支持 Git/PTY/编辑写入/多 Agent 的能力仍保持不可用。

跨 origin 的浏览器存储不会自动迁移。沿用旧 key 只在本 origin 内读取；不清除旧主站存储，不重放 pending，不转发凭据。应用私有资源清单：当前不需要额外 public 素材；字体为系统字体；代码/报告/图片均为原本显式内存 fixture，未复制主站 public 全量资源。来源、版本、许可证沿用原组件记录；共享源码包使用模块级导出和原延迟加载，不增加新渲染依赖。
