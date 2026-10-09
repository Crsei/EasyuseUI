# 项目与示例图标复用计划

日期：2026-10-09。状态：已实施 I1–I3；验证与交付结果见 [实施记录](./icon-reuse-log.md)。I4 保留为按真实身份触发的条件项。

本计划负责现有界面中的通用图标复用；SVG 素材编辑工具见独立的 [SVG 工作台计划](./svg-workbench-plan.md)。二者不互为实施前置条件。遵循 [Design-rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)、[I18N](../I18N.md)；本仓库采用组件复用模式。

## 1. 目标与执行原则

将适合复用的字符图标、内联通用图形替换成已验证的 React 组件，例如 `<ArrowUpRight />`、`<Check />`、`<X />`。保留按钮、链接、表单、文案、协议值、权限和受控数据合同，只替换图形呈现。

- 先在刚归档的 [UI-package](../../UI-package/README.md) 仓库中寻找对应图标，核对真实文件、语义、许可证，再核对项目安装包是否导出该组件。不得仅凭名称猜测或默认重画 SVG。
- 产品通用图标优先沿用已安装的 `lucide-react`；归档版本不是项目依赖版本，不自动升级或引入第二套通用风格。
- 无对应图标时记录搜索结果和缺口，优先保留原实现或文本回退。自有品牌与数据图形单独设计，不强制转换成通用库图标。
- 少量界面图标显式具名导入；不建立全库 `import * as Icons` 字典。UI-package 绝对路径不进入产品运行或公共组件分发。

## 2. 来源与查找顺序

固定 commit、Git tree、源码/许可证哈希见 [归档清单](../../UI-package/icon-sources-manifest.json)。以下路径均相对于相邻的 `UI-package/`。

| 顺序 / 类别 | 仓库与实际入口 | 使用规则 |
| --- | --- | --- |
| 1 通用操作 | `lucide/icons/*.svg` 与同名 `.json` | 优先搜索名称、标签和 aliases；选定后验证当前 `lucide-react` 的导出 |
| 2 风格参考 | `tabler-icons/icons/outline/*.svg`、`phosphor-core/assets/regular/*.svg`、`phosphor-react/src/csr/*.tsx` | Lucide 缺项或确需其他风格才评估；不得无意混用轮廓风格和线宽 |
| 3 跨库补充检索 | `iconify-icon-sets/json/lucide.json`、`tabler.json`、`ph.json`、`simple-icons.json`；`iconify/components/react/src/offline.ts` | 保留 collection 命名空间及每集合 `info.license`，不以 Iconify 代码 MIT 覆盖素材许可证，不默认接公网 API |
| 品牌：外部软件 | `simple-icons/icons/github.svg`、`figma.svg`、`react.svg` | 仅对应真实品牌身份；CC0 归档说明不能替代商标使用核对 |
| 品牌：AI 提供商 | `lobe-icons/src/{OpenAI,Claude,DeepSeek,Gemini}/index.ts`、`packages/static-svg/icons/` | 品牌与稳定 provider ID 对应；无真实身份时保留文字/通用图形，不暗示已接入服务 |
| 自有标识 | EasyuseUI 自有 `app/icon.svg` 与页头标识 | 不从外部库寻找替代品牌 |

SVGR、SVGO 已归档，但它们是转换/优化工具，不是图标库。本轮通用 React 图标替换无需安装它们。许可证原文保留；Lucide 的 ISC / Feather 衍生 MIT、各 MIT 项目、Simple Icons CC0、Iconify 每集合许可证分别记录。

每个最终选型记录：`usageId / consumerPath / semantic / package / exportName / installedVersion / sourceRepo / sourceCommit / assetPath / licenseRef / modified / fallback`。本轮 11 处用法已登记在 [选型清单](./icon-reuse-sources.json)，包含归档与安装包资源、许可证哈希。归档源码与安装包分别记录，不能宣称生产使用的图形就是归档 HEAD；如需这种保证，必须核对安装版本对应的发布源码。

## 3. examples 展示中的直接替换清单

核查范围包含 `app/examples/`、`components/examples/`、`components/site/example-gallery.tsx` 及示例调用的基础组件。下表 E01–E04 已实施。行号保留原计划快照定位提示，当前以组件名/文案键核对。

| 编号 / 优先级 | 页面与具体位置 | 当前内容 → 拟采用图标 | 已归档的对应文件 | 必须保留的行为 |
| --- | --- | --- | --- | --- |
| E01 / P0 | `/examples/`，[ExamplesPage](../app/examples/page.tsx)，`site.gap.contracts` 链接，当前约第 20 行 | `↗` → Lucide `<ArrowUpRight />` | [lucide/icons/arrow-up-right.svg](../../UI-package/lucide/icons/arrow-up-right.svg) | `/examples/component-contracts/`、`prefetch={false}`、文字和至少 44px 高的链接目标 |
| E02 / P0 | `/examples/`，同文件 `site.redesign.browseAll` 链接，当前约第 26 行 | `↗` → `<ArrowUpRight />` | [同一 Lucide 资源](../../UI-package/lucide/icons/arrow-up-right.svg) | `/components/`、原文字与焦点样式，不改为新窗口打开 |
| E03 / P0 | 示例画廊，[ExampleGallery](../components/site/example-gallery.tsx)，`site.redesign.readArticle` 链接，当前约第 46 行 | 每个示例卡片的 `↗` → `<ArrowUpRight />` | [同一 Lucide 资源](../../UI-package/lucide/icons/arrow-up-right.svg) | `/blog/${example.article}/`、本地示例声明、来源标题、prefetch 行为；修改共享渲染处一次覆盖所有卡片 |
| E04 / P0 | `/examples/sales-crm/`，[SalesCrmToolbar](../components/examples/sales-crm/toolbar.tsx)，`crm.resetFilters` 按钮，当前约第 101 行 | `×` → Lucide `<X />` | [lucide/icons/x.svg](../../UI-package/lucide/icons/x.svg) | 原显示条件、ghost/icon Button、翻译 label 与重置 `{ owner: "all", stage: "any", activity: 90 }` 的回调；不改排序或扩大重置范围 |

E01–E03 采用 ArrowUpRight 是保留现有图形意图的最小改动；这些链接仍是站内导航，不增加 `target="_blank"` 或“外部链接”辅助文案。如另行统一站内导航视觉，可整体评审 `<ArrowRight />`，已找到 [lucide/icons/arrow-right.svg](../../UI-package/lucide/icons/arrow-right.svg)，不在本轮偷偷改语义。

E03 当前由 [exampleManifest](../lib/example-manifest.ts) 驱动，覆盖 Agent 编码、Agent 产物审阅、多任务 Agent 控制台、工作流分析、Agent 工作台、Work Items、流程画布；不要为每个示例复制链接实现。CRM 有独立入口，不假设它存在于这份画廊清单。

E04 首选 X 以贴近现有设计；如果后续决定强调“清空筛选”，候选是 `<FunnelX />`，来源 [lucide/icons/funnel-x.svg](../../UI-package/lucide/icons/funnel-x.svg)。归档的 [funnel-x.json](../../UI-package/lucide/icons/funnel-x.json) 把 `filter-x` 标为 deprecated alias，因此不能编造 `lucide/icons/filter-x.svg` 路径，也不优先添加旧的 `<FilterX />` 名称。

图标应 `aria-hidden="true"`，由原链接文字或按钮 label 提供可访问名称；链接图标以现有排版测量为准，初始建议 16px、4px 间距、不挤压文字。CRM 保留其私有主题与既有复刻尺寸，不借图标替换调整全局密度。

## 4. 示例可见、应从基础组件替换的清单

这些图标由公共组件绘制，示例只负责调用；应在组件本体替换一次，再验证示例，避免 demo 自己补画同一套图形。

| 编号 / 优先级 | 验证用示例 | 实际修改所有者与拟替换 | 归档来源与验收 |
| --- | --- | --- | --- |
| C01 / P0 | [SelectDemo](../components/examples/select-demo.tsx)；CRM 的 [CrmSelect](../components/examples/sales-crm/controls.tsx) | [SelectItem](../components/ui/select.tsx) 的选中内联勾 → `<Check />` | [check.svg](../../UI-package/lucide/icons/check.svg)；保持 value/label 映射、键盘选择与选中项，不动 CRM 的 `items={options}` |
| C02 / P0 | [ComboboxDemo](../components/examples/combobox-demo.tsx) | [ComboboxItem](../components/ui/combobox.tsx) 的勾 → `<Check />` | [check.svg](../../UI-package/lucide/icons/check.svg)；保持过滤、空态、高亮、选中与键盘行为 |
| C03 / P0 | [DialogDemo](../components/examples/dialog-demo.tsx) | [DialogContent](../components/ui/dialog.tsx) 关闭按钮的内联 X → `<X />` | [x.svg](../../UI-package/lucide/icons/x.svg)；保留 label、Escape、焦点恢复、Portal 与触摸目标 |
| C04 / P0 | [ChipDemo](../components/examples/chip-demo.tsx) | [Chip](../components/ui/chip.tsx) 选中勾/移除 X → `<Check />` / `<X />` | 上述两个资源；保留 12px 图形槽、独立的选择/移除目标与 disabled 行为 |
| C05 / P1，已评审实施 | [ButtonDemo](../components/examples/button-demo.tsx) 的保存 loading | [Button](../components/ui/button.tsx) 圆环/单弧 → `<LoaderCircle />` | [loader-circle.svg](../../UI-package/lucide/icons/loader-circle.svg)；明确接受淡底环/短弧改为开口圆弧，非原图形等价替换 |
| C06 / P1，已同步实施 | [feedback-demo.tsx 的 SpinnerDemo](../components/examples/feedback-demo.tsx) | [Spinner](../components/ui/spinner.tsx) 的圆环/单弧 → 同一 `<LoaderCircle />` 图元 | 同上；保持 status、文案、reduced-motion；Button 与 Spinner 分别依赖 Lucide，没有互相依赖 |

图形坐标与视觉评审必须核对 `viewBox`、linecap/linejoin、尺寸、颜色继承、对齐与实际笔画宽度。原部分图形使用 16 坐标系，Lucide 常用 24 坐标系，照搬同一 `strokeWidth` 不保证屏幕线宽一致。覆盖浅/深色与 12/16/20px，loading 同时检查动画与禁用状态。

本轮 C01–C04 已在公共组件本体替换。Select/Combobox 保持 14px 槽，strokeWidth 从 16 坐标系的 1.8 换算为 24 坐标系的 2.7；Chip 保持 12px 槽，1.75 换算为 2.625，并覆盖移除 Button 的默认 16px 图标规则；Dialog 保持 16px / 1.8。Lucide 使用圆端点、圆连接。C05–C06 完成浅/深色与 12/16/20px 比较后采用开口圆弧，实际默认尺寸均为 16px；Button 保持 1.75、Spinner 保持 2 的坐标笔画宽度。

## 5. 已核验的备选映射与安装包边界

本次实际读取归档文件并检查当前安装包 `lucide-react@0.577.0`；`ArrowUpRight`、`ArrowRight`、`Check`、`X`、`LoaderCircle`、`FunnelX`、`Bot`、`Cpu` 已确认可导出。后续实施仍需复核当时版本；“源码文件存在”与“安装包导出存在”是两项独立证据。

| 语义 | Lucide 首选 | Tabler 参考文件 | Phosphor 参考文件 |
| --- | --- | --- | --- |
| 斜向进入 | `icons/arrow-up-right.svg` → `ArrowUpRight` | [outline/arrow-up-right.svg](../../UI-package/tabler-icons/icons/outline/arrow-up-right.svg) | [React ArrowUpRight.tsx](../../UI-package/phosphor-react/src/csr/ArrowUpRight.tsx) |
| 向右进入 | `icons/arrow-right.svg` → `ArrowRight` | [outline/arrow-right.svg](../../UI-package/tabler-icons/icons/outline/arrow-right.svg) | [React ArrowRight.tsx](../../UI-package/phosphor-react/src/csr/ArrowRight.tsx) |
| 勾选 | `icons/check.svg` → `Check` | [outline/check.svg](../../UI-package/tabler-icons/icons/outline/check.svg) | [React Check.tsx](../../UI-package/phosphor-react/src/csr/Check.tsx) |
| 关闭/移除 | `icons/x.svg` → `X` | [outline/x.svg](../../UI-package/tabler-icons/icons/outline/x.svg) | [React X.tsx](../../UI-package/phosphor-react/src/csr/X.tsx) |
| 清空筛选，备选 | `icons/funnel-x.svg` → `FunnelX` | [outline/filter-x.svg](../../UI-package/tabler-icons/icons/outline/filter-x.svg) | [Core regular/funnel-x.svg](../../UI-package/phosphor-core/assets/regular/funnel-x.svg)、[React FunnelX.tsx](../../UI-package/phosphor-react/src/csr/FunnelX.tsx) |
| 加载，需评审 | `icons/loader-circle.svg` → `LoaderCircle` | [outline/loader-2.svg](../../UI-package/tabler-icons/icons/outline/loader-2.svg) | [React SpinnerGap.tsx](../../UI-package/phosphor-react/src/csr/SpinnerGap.tsx) |

Tabler/Phosphor 映射仅证明已找到参考源码，不表示本项目已安装或应引入这些包。不同库的图形不是无差别替换。

## 6. 保留项与条件项

| 位置 | 本计划的结论 |
| --- | --- |
| CRM 的 Download/Plus、CrmSelect 的 ChevronDown、侧栏导航等现有 Lucide 图标 | 已经复用图标库，保留；不为“统一”改回自绘或另一图标库 |
| [Canvas playback](../components/examples/canvas-playback.tsx) 的 `0.5× / 1× / 2×` | 倍率单位，保留为文字，不替换成 X |
| [WorkspaceShellDemo](../components/examples/workspace-shell-demo.tsx) 的 `Foundation → Primitive → Pattern → Workspace` | 信息层级文案，保留 |
| [Agent board fixtures](../components/examples/agent-board/fixtures.ts) 的运行关系 `→` | 来源业务文本，保留，不处理为界面操作图标 |
| [CRM 示例](../components/examples/sales-crm/sales-crm-demo.tsx) 的 `Ctrl / ⌘ K` | 快捷键文字，保留 Kbd 与平台提示 |
| [CRM CompanyDetail](../components/examples/sales-crm/company-detail.tsx) 的 `company.logo` / Avatar | 调用方公司数据与头像回退，不能拿 Simple Icons 随意替换 |
| [Agent workbench fixtures](../components/examples/agent-workbench/fixtures.ts) 的 `fixture-model` / `Provider adapter` | 当前是本地模型与未连接适配器，保留文字，不换成 OpenAI/Claude Logo；将来真实 provider ID 明确后才查 Lobe 对应目录。通用辅助图形可评审 [Bot](../../UI-package/lucide/icons/bot.svg) / [Cpu](../../UI-package/lucide/icons/cpu.svg)，不作为本轮必做项 |
| [app/icon.svg](../app/icon.svg) 与页头 `e.` | 自有品牌，独立设计管理 |
| [ComponentThumbnail](../components/site/home/component-thumbnail.tsx)、图表、Sparkline、AgentUsageHistory、Canvas 连线 | 示意/数据/连接图形，保留数据驱动实现；不属于通用操作图标 |

后续新增模型/服务标识时，在 Lobe 的 `src/<Provider>/index.ts`、静态 SVG 与 Simple Icons 中寻找对应资源；记录正式导出 API 和许可证，找不到则文字回退。标识不能改变协议值、可用状态或本地示例声明。

## 7. 实施步骤与交付批次

| 阶段 | 内容 | 完成门槛 |
| --- | --- | --- |
| I0，已完成静态核查 | 归档来源、E01–E04、C01–C06 与保留项；确认资源与关键导出 | 本文清单、源码清单与路径可检查；状态明确为未实施 |
| I1 / P0，已实施 | E01–E04：examples 入口、画廊、CRM 字符图标替换 | 显式 Lucide 导入；原文字/链接/重置状态与键盘行为保持；前后截图对照 |
| I2 / P0，已实施 | C01–C04：基础 Check/X 复用 | 尺寸/线宽/焦点/键盘验证；示例无需再实现图形；Manifest/Registry 和安装闭包一致 |
| I3 / P1，已评审实施 | C05–C06：统一 LoaderCircle 图元 | 浅/深色、12/16/20px 比较；接受新图形，分别保持动画/状态语义 |
| I4 / 条件实施 | 真实品牌映射与未来新增图标 | 真实身份、产品需要、来源/版本/许可证及可用导出齐全；不因归档了品牌库就强行补 Logo |

每批先复核工作区和目标文件，保留并行修改，按具体文件/差异实施；不将图标替换与页面重构、路由改写、数据行为调整混在一起。公共组件依赖变更同步 Manifest、Registry 和独立安装闭包，示例/站点专用映射不进入公共组件依赖。

## 8. 验证与验收

I0 原计划只做静态核查；本轮 I1–I3 的工程、浏览器与独立安装证据分别记录在 [实施记录](./icon-reuse-log.md)，不将本地交互验证标记为真实服务集成。

实施运行 `pnpm lint`、`pnpm typecheck`、`pnpm build`，并进行相应浏览器检查；公共源码/CSS/Registry 依赖变化运行 `pnpm test:install`。构建与生产验证隔离共享开发服务及并行工作。

- E01–E03：浅/深色、中英文、窄屏，文字不挤压；Tab 可达、Enter 导航、URL/prefetch 不变，无新增外链语义或重复可访问名称。
- E04：改变任一筛选后显示按钮；点击/键盘激活恢复三项默认值；默认状态仍隐藏；翻译 label、tooltip、触摸目标保持。
- C01–C04：选中/disabled、过滤/空态、键盘高亮、Escape/焦点恢复、Chip 选择/移除分别验证。
- C05–C06：loading 阻止重复提交，status/文案不重复，reduced-motion 与布局宽度不退化。
- 分发与性能：无全图标库导入、无 UI-package 运行时依赖、无无关依赖升级；记录选用图标的来源与版本。原始归档、实际替换、浏览器验证与独立安装分开记录完成状态。
