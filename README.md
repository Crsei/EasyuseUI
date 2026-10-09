# EasyuseUI

可组合、可修改的 React 组件库，配套中文文档、交互演示和 shadcn Registry。

目前提供 **Button、Input、Badge、Tag、Chip、Dialog、Item、RuntimeStatusBadge、DataRegion、Tree、SessionRow、AgentRow、ActivityTimeline、Inspector、ChatMessage / Conversation / ChatComposer、ToolCall、TaskPanel、ScrollPlayground、StyleWorkbench、WorkspaceShell**。所有示例中的保存、创建、任务控制和权限动作均为本地演示。

## 设计规范与初始化

先阅读 [Design Rules](./Design-rules.md) 和 [Component Specification](./Component-Specification.md)。后者规定基础与产品组件的尺寸、交互态、数据态、运行态、键盘模型、触摸命中、响应式与验收要求。[AGENTS.md](./AGENTS.md) 是项目 Agent 的实际指引文件。

| 查阅文档                                 | 回答的问题                   | 内容                                                                         |
| ---------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| [UI 视觉词典](./UI-VISUAL-DICTIONARY.md) | 这个东西叫什么？             | 中文外观反查、英文名/别名、胶囊语义、阴影与高度、九类视觉词汇、现有实现映射  |
| [UI 模式规范](./UI-PATTERNS.md)          | 什么时候用它，信息放哪里？   | 信息架构、组件选择、密度、工作台、交互恢复、文案、动效、可访问性和 Design QA |
| [UI 状态规范](./UI-STATES.md)            | 现在发生什么，下一步怎么办？ | 交互/数据/运行状态分轴，连接与过期、错误分类、消息态、审批、未知结果与对账   |
| [样式工作台指南](./STYLE-WORKBENCH.md)   | 修改参数后有什么差别？       | A/B 对比、24项参数范围、预设、基准、导出、独立安装与验证记录                 |
| [组件架构与交互研究手册](./docs/research/ui-architecture-interaction-handbook.md) | 如何借鉴参考库并改进工作区？ | 五条源码研究路线、版本与来源索引，以及 EasyuseUI 差距和验收建议              |

不知道名称时从视觉词典开始；设计页面时查模式规范；接入数据和真实运行能力时查状态规范。词典明确区分已有组件、内嵌模式和待实现条目；共享 token 和状态枚举仍以源码为准。

Agent 可按任务读取 [UI Skills 分类与入口](./skills/README.md)：视觉词典系、基本原则系（基础样式/模式/状态）、组件实现系和验收系共六个技能。每个技能明确区分复用 EasyuseUI 组件与不使用本库的独立实现要求；分类目录与完整技能包的使用方式见该入口。

站点与组件支持简体中文和英文，默认中文；顶部语言选择保留浏览器偏好和页面中的编辑状态，URL 保持不变。独立项目可安装 `i18n` Registry 项并使用 `I18nProvider`，接入与文案边界见 [国际化指南](./I18N.md) 和 `/docs/i18n/`。

打开 http://localhost:3010/dictionary/ 浏览可视化词典。支持九类分类、中文/英文/别名搜索和实现情况筛选；已实现词条复用 Catalog 的真实演示、代码和源码入口。基础样式展示主题颜色、字号、间距、圆角、边框和投影；内阴影、发光等标为视觉参考。Badge/Tag 是只读信息，Chip 提供受控选择、独立移除、禁用与 busy 状态。

打开 http://localhost:3010/style-workbench/ 使用样式工作台。A 从当前主题与样例探针读取基准，B 实时调整圆角、控件高度、间距、边框、内外阴影、颜色与透明度、背景模糊、字体等24个参数；两侧共享内容与交互状态，差异表显示改动及数值差。支持四种预设、将 B 固定为新基准、重置和复制局部 CSS / A/B 参数 JSON。未固定 A 时主题切换更新未修改参数；实验保留在当前页面，刷新后恢复默认。详细操作与参数范围见 [样式工作台指南](./STYLE-WORKBENCH.md)，组件文档在 `/docs/style-workbench/`。

打开 http://localhost:3010/workspace/ 查看按规范初始化的工作台。可切换五种数据状态与十种运行状态、选择对象、折叠侧栏、打开/关闭和调整 Inspector，以及在 Chat 添加本地消息。页面使用内存 fixture，不连接模型或 Agent 服务。

| 层级             | 已实现内容                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation       | 中性深浅主题、统一颜色/密度/控件尺寸和 motion tokens，集中在 `styles/theme.css`                                                                     |
| Primitive        | Button / Input / Badge / Tag / Chip、Item 加载与错误、RuntimeStatusBadge、DataRegion 五种数据态；完整单选 ARIA Tree、懒加载状态、受控拖拽与键盘移动 |
| Product Patterns | SessionRow、AgentRow、ActivityTimeline、Inspector、ChatMessage / Conversation / ChatComposer、ToolCall                                              |
| Workspace        | WorkspaceShell：导航256/48、Inspector320（300–360）、窄屏抽屉、焦点恢复、键盘/指针 resize；Session 列表/层级切换、Chat 对话/工作区分栏              |
| Visual tools     | 视觉词典 `/dictionary/`、样式工作台 `/style-workbench/`、滚动实验室 `/scroll/`；样式工作台和滚动演示可独立安装                                      |
| Service boundary | 组件接收数据和能力回调；真实 Agent/Session 控制、流式网络传输、工具执行、权限审批权威和持久化由消费项目接入                                         |

Tree 支持方向键、Home/End、Enter/Space、前缀定位、before/inside/after 拖拽和键盘移动替代操作；阻止自身、后代及禁用目标。移动后由调用方确认结果，库内的 `moveTreeNode` 只修改内存树。

ActivityTimeline 按 eventId 去重并保留来源顺序。Conversation 保留早期历史的滚动锚点；两者只有距底部不超过64px时跟随新内容，否则提供返回最新入口。ChatComposer 支持 IME、异步防重复提交，失败保留受控草稿；工具调用使用独立结构。

ToolCall 展示作用范围和风险，并且只通过明确批准/拒绝回调操作。参数、输出、错误和复制/导出内容按敏感键与常见凭据格式脱敏，业务特殊凭据仍需调用方预处理。预览最多200行/32KiB，输出内部滚动。取消要等来源确认，响应丢失时只允许查询/对账，不自动重复写操作。示例通过按钮追加本地片段，不模拟后台模型执行。

每个新组件都有 `/docs/<slug>/` 交互文档与独立 Registry 条目。

打开 http://localhost:3010/scroll/ 体验六种滚动交互：Scroll-triggered（卡片淡入）、Scroll-linked（阅读进度）、Parallax（背景视差）、Sticky（通讯录分组吸顶）、Scroll Snap（整屏吸附）、Horizontal Scroll（纵向滚动驱动横向卡片）。每个演示可独立滚动、重置，支持键盘、触屏、深浅主题和减少动态效果设置。组件文档在 `/docs/scroll-playground/`。

## 本地开发

需要 Node.js 22.18+ 和 pnpm 11。推荐使用 Node.js 24。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 http://localhost:3010 。开发命令会先生成 Registry，再启动文档站。此机器使用 GLIBC 2.28，因此开发和生产构建均显式使用 Webpack，允许 Next.js 回退到 WASM SWC。首次回退可能需要下载 WASM 包。

## 组件组合示例

从 `/examples/` 浏览完整组件组合，Work Items 五布局展示位于 `/examples/work-items/`。示例复用可分发组件并使用本地 fixture；字段、选择、日期与恢复交互用于展示组件能力，真实服务由消费方接入。

## 常用命令

```bash
pnpm check:i18n     # 双语资源、文档覆盖与 Registry 依赖
pnpm lint           # ESLint
pnpm typecheck      # 路由类型生成和 TypeScript 检查
pnpm registry:build # 生成 public/r/*.json
pnpm build          # Registry + 静态网站，输出 out/
pnpm preview        # 预览 out/，默认 http://127.0.0.1:3011
pnpm test           # 测试已构建产物，自动启动预览服务
pnpm test:install   # 开发服务运行时，在临时独立项目中验证 CLI 安装和类型
pnpm format         # 格式化源码
```

浏览器测试使用本机 Google Chrome（如果存在），否则使用 Playwright Chromium。其他环境可先运行 `pnpm exec playwright install chromium`，或通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器。

## 目录

```text
app/                  Next.js 首页、组件目录和文档路由
components/ui/        可分发的基础组件
components/blocks/    可分发的组合模块
components/examples/  文档中的真实交互示例
components/docs/      文档站自身的展示组件
components/site/      导航与主题切换
styles/theme.css      唯一的主题变量来源
lib/catalog.ts        组件文档元数据与示例入口
lib/style-workbench-model.ts  样式参数、预设、主题基准读取和导出
lib/utils.ts          可分发的样式合并工具
registry.json         源码、npm 依赖与内部组件依赖清单
scripts/              Registry 构建和静态预览
tests/                浏览器行为测试
skills/               分类 UI 技能、双模式原则与包内参考
```

## 安装到另一个项目

先让本站运行在 3010 端口。在另一个支持 React、TypeScript、Tailwind CSS 4 并已初始化 shadcn 的项目中执行：

```bash
pnpm dlx shadcn@latest add http://localhost:3010/r/task-panel.json
pnpm dlx shadcn@latest add http://localhost:3010/r/input.json
pnpm dlx shadcn@latest add http://localhost:3010/r/badge.json
pnpm dlx shadcn@latest add http://localhost:3010/r/tag.json
pnpm dlx shadcn@latest add http://localhost:3010/r/chip.json
pnpm dlx shadcn@latest add http://localhost:3010/r/dialog.json
pnpm dlx shadcn@latest add http://localhost:3010/r/scroll-playground.json
pnpm dlx shadcn@latest add http://localhost:3010/r/style-workbench.json
pnpm dlx shadcn@latest add http://localhost:3010/r/canvas-workspace.json
pnpm dlx shadcn@latest add http://localhost:3010/r/workspace-shell.json
pnpm dlx shadcn@latest add http://localhost:3010/r/item.json
pnpm dlx shadcn@latest add http://localhost:3010/r/runtime-status-badge.json
pnpm dlx shadcn@latest add http://localhost:3010/r/tree.json
pnpm dlx shadcn@latest add http://localhost:3010/r/session-row.json
pnpm dlx shadcn@latest add http://localhost:3010/r/agent-row.json
pnpm dlx shadcn@latest add http://localhost:3010/r/activity-timeline.json
pnpm dlx shadcn@latest add http://localhost:3010/r/inspector.json
pnpm dlx shadcn@latest add http://localhost:3010/r/chat-message.json
pnpm dlx shadcn@latest add http://localhost:3010/r/tool-call.json
```

TaskPanel 会一起安装 Button、工具函数和主题。安装主题会更新接收项目的 CSS 变量，已有项目请检查主题改动。

ScrollPlayground 会一起安装主题、lucide-react 和同目录的 CSS Module，不需要动画库。

StyleWorkbench 会一起安装参数模型、同目录的 CSS Module、所需基础组件、lucide-react 和主题。它提供局部预览与复制，参数只保留在当前页面；完整用法见 [样式工作台指南](./STYLE-WORKBENCH.md)。

WorkspaceShell 和 Item 会一起复制同目录的 CSS Module；RuntimeStatusBadge 会安装统一状态字典。Registry 从 `styles/theme.css` 提取全部 Foundation tokens 与 Tailwind theme 映射，不维护第二份常量。

组件代码使用 React 属性和业务回调，不依赖文档站、账号或网络服务。Button 的异步状态由 `loading` 控制，TaskPanel 的任务执行由调用方管理。

## 添加组件

1. 在 `components/ui/` 或 `components/blocks/` 写组件。
2. 在 `components/examples/` 添加可运行示例。
3. 在 `lib/catalog.ts` 登记文档信息、属性和源码路径；文档页会自动生成。
4. 在 `registry.json` 登记源码及依赖。内部依赖使用本清单中的条目名称，构建器会替换为站点的绝对 URL。
5. 运行 lint、typecheck、build，并在独立项目验证安装。

## 部署

设置真实域名，然后构建：

```bash
NEXT_PUBLIC_SITE_URL=https://ui.example.com pnpm build
```

将 `out/` 托管到支持静态文件和目录索引的服务器，例如 Cloudflare Pages。无需 Node.js 后端。也可以在 `.env.local` 设置 `NEXT_PUBLIC_SITE_URL`，参考 `.env.example`。

Registry 构建器使用 shadcn 的官方 Schema 验证输出，并从 `styles/theme.css` 提取深浅主题，避免重复维护颜色。

账号、支付、付费授权和 MCP 服务留待后续阶段扩展。

## 流程画布

入口 `/workspace/canvas/`。支持构图、配置、结构化上游变量、分组/便笺、原子撤销重做、只读与脱敏 JSON 导入导出。复用现有 WorkspaceShell / Inspector / Tree / DataRegion。已加入受控运行调试、显式审批、嵌套子流程、Loop/Iteration 约束、高级配置和服务接口。当前示例为本地 fixture，真实运行、保存、协作和发布由消费方提供。用法与安装见 [CANVAS.md](./CANVAS.md)，阶段与证据见 [实施记录](./plans/canvas-implementation-log.md)。
