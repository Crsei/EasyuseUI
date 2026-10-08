# 主题安装与迁移

原 `/r/<item>.json` 是 legacy 路径，保持根变量与原样式。新模式必须显式选择同一模式的组件与依赖，不能把三个模式的源码混装在同一个目录。

| 模式 | 安装路径 | 适用场景 |
| --- | --- | --- |
| legacy | `/r/button.json` | 原消费者；保持已有全局主题行为 |
| host | `/r/host/button.json` | 已有 shadcn 语义变量的产品；映射宿主颜色，不注入根默认值 |
| scoped | `/r/scoped/button.json` | 独立的局部 EasyuseUI 浅/深色主题 |

```sh
pnpm dlx shadcn@4.21.2 add http://localhost:3010/r/scoped/dialog.json
```

```tsx
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { I18nProvider } from "@/lib/i18n-provider"

<ThemeBoundary mode="scoped" theme="dark">
  <I18nProvider defaultLocale="en">{children}</I18nProvider>
</ThemeBoundary>
```

host 模式需要宿主提供 `--background`、`--foreground`、`--primary`、`--primary-foreground`、`--muted`、`--muted-foreground`、`--accent`、`--border`、`--ring` 和 `--destructive`。特定运行状态继续有文字与图标，不只依赖颜色。

私有 `--eu-*` 变量、Tailwind utility 名称与作用域样式由 `styles/theme.css` 生成，避免覆盖宿主的同名 utility、字体、reset 和容器。Dialog、Tooltip、Menu、Popover、Select、Combobox 与 WorkspaceShell 抽屉的 Portal 接收 ThemeBoundary 的容器。边界应位于页面的正常布局区域，避免在带 transform/overflow 裁剪的祖先内放置模态浮层。

`legacyAliases` 默认关闭；仅在既有站点渐进迁移时开启，它在边界内把旧变量映射到私有变量。当前文档站点的 ThemeBoundary 演示使用此桥接，因为 canonical 源码保持 legacy。新安装模式不需要它。

运行 `pnpm test:install` 验证原安装；`pnpm test:install:themes` 创建两个真实 shadcn CLI 消费项目，独立 typecheck/build 并验证宿主样式和截图、两个主题、Portal、Canvas、运行状态、locale provider 及六个基础交互组件。这些是本地消费 fixture，不代表公开域名或业务服务验收。
