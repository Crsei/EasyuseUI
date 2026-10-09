# 图标复用实施记录

日期：2026-10-09。对应 [计划](./icon-reuse-plan.md)。使用 EasyuseUI 复用模式；范围为 E01–E04 与 C01–C06，I4 继续按真实品牌身份触发。

## 实现与来源

- ExamplesPage 的两个入口、ExampleGallery 的共享文章链接采用 ArrowUpRight；href、prefetch=false、文字和站内导航语义保持。
- CRM 清除筛选采用 X；显示条件及 `{ owner: "all", stage: "any", activity: 90 }` 回调保持，排序仍独立。
- SelectItem、ComboboxItem、DialogContent、Chip 在组件本体复用 Check/X；选值、过滤、关闭、选择/移除和 disabled/busy 合同保持。
- Button 与 Spinner 统一使用 LoaderCircle 图元，各自管理原有 busy/status、文案、动画和 reduced-motion。经浅/深色、12/16/20px [视觉比较](./evidence/icon-reuse/loading-comparison.png)，接受由淡底环/短弧改为开口圆弧；这是视觉调整，不宣称原图形等价。两组件没有互相依赖。
- Registry 六项均声明 `lucide-react@^0.577.0`，Manifest 的说明同步中英文站点资源及 compact 产物。未新增公共 API、图标库或本轮 npm 依赖升级；没有 UI-package 运行时路径、全库字典或在线取图。

已实际读取归档 SVG、Lucide 原始许可证及安装包模块，重新验证四个具名导出。11 处选型的归档 commit、资源/许可证哈希与安装包版本分别记录在 [icon-reuse-sources.json](./icon-reuse-sources.json)。生产渲染使用 `lucide-react@0.577.0`；归档 HEAD 不作为该安装版本的发布源码证明。原始上游几何未修改，消费方调整尺寸、笔画和动画。

保留倍率单位、信息层级箭头、业务文本、快捷键、公司头像、fixture-model/Provider adapter、自有标识以及数据/连线图形。没有添加提供商品牌或真实服务能力。

## 视觉与交互证据

| 所有者 | 实测图形槽 | 坐标笔画 | 核查与对照 |
| --- | --- | --- | --- |
| ExamplesPage / ExampleGallery | 16×16px | 2 / 24 | 4px 间距、不可收缩、装饰性 aria-hidden；链接名称来自原文字，前两入口至少高 44px |
| CRM reset | 16×16px | 1.75 / 24 | [替换前](./evidence/icon-reuse/before-crm.png) / [替换后](./evidence/icon-reuse/after-crm.png)；键盘重置、默认隐藏、筛选与排序回归 |
| SelectItem | 14×14px | 2.7 / 24 | [前](./evidence/icon-reuse/before-select.png) / [后](./evidence/icon-reuse/after-select.png)；屏幕笔画约 1.575px，保持原 1.8×14/16 的厚度 |
| ComboboxItem | 14×14px | 2.7 / 24 | [前](./evidence/icon-reuse/before-combobox.png) / [后](./evidence/icon-reuse/after-combobox.png)；过滤、空态、键盘高亮与选择 |
| Dialog close | 16×16px | 1.8 / 24 | [前](./evidence/icon-reuse/before-dialog.png) / [后](./evidence/icon-reuse/after-dialog.png)；Escape/关闭与焦点恢复，粗指针 44×44px |
| Chip Check / X | 12×12px | 2.625 / 24 | [前](./evidence/icon-reuse/before-chip.png) / [后](./evidence/icon-reuse/after-chip.png)；屏幕笔画约 1.3125px，选择与移除仍是兄弟目标 |
| Button loading | 16×16px | 1.75 / 24 | [前](./evidence/icon-reuse/before-button.png) / [后](./evidence/icon-reuse/after-button.png)；loading 禁用、aria-busy、原文字、减少动效 |
| Spinner | 16×16px | 2 / 24 | [前](./evidence/icon-reuse/before-spinner.png) / [后](./evidence/icon-reuse/after-spinner.png)；单一 status、原文案、减少动效 |

Chip 原移除 SVG 虽写 width=12，但受 Button 的默认 SVG CSS 影响实际为 16px。本次显式覆盖尺寸与坐标笔画，落实原计划的 12px 图形槽；主/移除触摸目标仍至少 44×44px。Lucide Check/X 的圆端点、圆连接属于已评审的视觉变化。

Examples 的 light/zh-CN/1440、dark/en/1440、light/en/390、dark/zh-CN/390 前后截图、9 个链接的测量、Enter 导航，以及两主题下 Chip/Dialog 粗指针目标和 Spinner reduced-motion 记录，保存在本地 `../.tmp/icon-reuse-20261009/{before,after}/`。窄屏无整页横向溢出；目标图标均 aria-hidden，由原文字或 label 提供名称。截图只证明外观，交互由独立浏览器断言与回归用例证明。

最终文档构建后补验：Button/Chip/Spinner 的英文说明显示正确；320px Examples 无整页横向溢出；组件目录与示例文章链接均可 Enter 导航；Spinner 正常模式旋转、reduced-motion 下停止。13 个源码/分发文件逐字节匹配测试快照，哈希存于本地 `../.tmp/icon-reuse-20261009/final-source-hashes.json`。

## 工程与分发验证

原 3010 开发服务页面请求超时，保留其进程。构建、生产浏览器及安装验证在 `../.tmp/icon-reuse-20261009/implementation/` 进行：固定 `0531cf20e1ba3d69c0b820984ec8aa2f16fdc32e` 的源码，再仅叠加本轮改动，排除共享工作区正在进行的工作台和 SVG 实施。构建使用 Webpack / WASM SWC，`EASYUSEUI_LOCAL_BUILD=1`、`NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3011`；本地 origin 仅用于验证，不作为部署。

| 检查 | 结果 / 证据 |
| --- | --- |
| `pnpm lint` | 通过；`../.tmp/icon-reuse-20261009/lint.log` |
| `pnpm typecheck` | 通过；`typecheck.log` |
| `pnpm build` | 通过；`implementation-build.log` |
| `pnpm check:manifest` / `pnpm check:i18n` | 通过；新增组件说明具备中英文资源，Manifest/Registry 一致 |
| 相关 Playwright 回归 | 112 项通过；`browser.log`，7 个现有测试文件见下方命令 |
| `pnpm test:install` | 通过；`install.log`，独立 CLI 安装、依赖闭包、TypeScript、生产构建和浏览器挂载 |
| 图标专项浏览器测量 | 前后截图、链接/CRM reset、尺寸、主题、触摸、reduced-motion 通过；`before/measurements.json`、`after/measurements.json`、`after/touch-motion.json` |

```sh
pnpm test tests/components.spec.ts tests/primitives.spec.ts \
  tests/disclosure-feedback.spec.ts tests/sales-crm.spec.ts \
  tests/common-distribution.spec.ts tests/theme-namespace.spec.ts \
  tests/patterns.spec.ts
```

独立安装的 Registry snapshot 来源于隔离构建，未依赖原开发服务；消费项目证据为本地 `../.tmp/easyuse-ui-consumer-SzmPrJ/`。这里确认可分发源码与包依赖、所测本地交互；不新增或证明真实 CRM、模型提供商、执行、持久化与业务验收。

交付仅包含图标相关源码、Manifest/Registry、站点翻译/产物、计划、选型清单和证据；共享工作台、SVG 工具、package/lockfile 与其余计划文档保持各自归属。
