# SVG 工作台建设计划

日期：2026-10-09。状态：W0–W4 的 V1 已实现并通过验证；W5 保留后续。实施、限制、截图与性能证据见 [验证记录](./svg-workbench-validation.md)，使用说明见 [SVG-WORKBENCH.md](../SVG-WORKBENCH.md)。

本计划独立负责 SVG 素材浏览、绘制、源码编辑与导出。现有项目和 examples 的图标替换见 [图标复用计划](./icon-reuse-plan.md)，两者可独立实施，不要求先替换产品图标才能建设工作台。

参考源码已归档至 [UI-package](../../UI-package/README.md)，固定 commit、许可证路径和哈希见 [源码清单](../../UI-package/icon-sources-manifest.json)。实施遵循 [Design-rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)、[I18N](../I18N.md)，采用 EasyuseUI 组件复用模式。

## 1. 目标与边界

实现“选择库图标或新建 SVG → 编辑图形/属性/源码 → 预览 → 导出 SVG/React 与来源说明”的单文档闭环。工作台支持用户修改素材，但不会自动把修改写入现有产品组件、品牌资源或上游图标仓库。

UI-package 是研究与生成输入，不能成为运行时绝对路径依赖。运行资源只纳入已审查、固定版本的图标子集；归档上游源码不等于已安装或构建其全部组件。现有产品继续使用当前安装的 Lucide 版本，不随本工作台升级。

## 2. 必须从已归档仓库寻找素材与工具

以下路径均相对于相邻的 `UI-package/`；查找后把完整 commit、资源路径、许可证及修改状态记录进 `IconSource`，不只保存图标名称。

| 来源 | 已确认的入口/素材 | 工作台用途 |
| --- | --- | --- |
| Lucide | [`icons/check.svg`](../../UI-package/lucide/icons/check.svg)、[`icons/arrow-up-right.svg`](../../UI-package/lucide/icons/arrow-up-right.svg) | 默认素材库；名称/标签元数据与 SVG 配对，优先选当前产品风格 |
| Tabler | [`icons/outline/check.svg`](../../UI-package/tabler-icons/icons/outline/check.svg) | 明确选择来源后浏览，保留风格标识 |
| Phosphor Core / React | [`assets/regular/check.svg`](../../UI-package/phosphor-core/assets/regular/check.svg)、[`src/csr/Check.tsx`](../../UI-package/phosphor-react/src/csr/Check.tsx) | 原始图形与 React 用法参考；独立 Core 与 React 固定子模块版本不能混称同一版本 |
| Iconify / icon-sets | [`components/react/src/offline.ts`](../../UI-package/iconify/components/react/src/offline.ts)、[`json/lucide.json`](../../UI-package/iconify-icon-sets/json/lucide.json) | 本地跨库检索与离线呈现参考；每个集合分别识别许可证，保留来源命名空间 |
| Simple Icons | [`icons/github.svg`](../../UI-package/simple-icons/icons/github.svg)、[`icons/figma.svg`](../../UI-package/simple-icons/icons/figma.svg) | 专用品牌素材，展示来源及使用要求 |
| Lobe Icons | [`src/OpenAI/index.ts`](../../UI-package/lobe-icons/src/OpenAI/index.ts)、[`packages/static-svg/icons/claude-color.svg`](../../UI-package/lobe-icons/packages/static-svg/icons/claude-color.svg) | AI 提供商品牌素材；不赋予产品任何连接或执行能力 |
| SVGR | [`packages/core/src/index.ts`](../../UI-package/svgr/packages/core/src/index.ts) | SVG 转独立 React/TSX；执行环境在 W0 验证 |
| SVGO | [`lib/svgo.js`](../../UI-package/svgo/lib/svgo.js)、[`lib/svgo-node.js`](../../UI-package/svgo/lib/svgo-node.js) | 优化与 Node 适配边界参考；不是可视化绘图引擎或安全校验器 |

先在上述仓库按名称、别名、标签和图形语义检索，核对真实文件与许可证，再进入工作台索引。运行时不默认访问公网 Iconify API，不用 `import * as Icons` 将全库组件打包。代码包许可证不能替代集合或品牌资源本身的使用要求。

## 3. 工作台信息架构

拟定正式工具入口：`/workspace/svg/`。辅助使用说明与小预览放组件文档；正式工具页铺满窗口，不受营销页头/页脚挤压。

```text
┌──────────────┬────────────────────────────────┬──────────────────┐
│ 图标库/图层   │ 工具栏：选择 · 图形 · 撤销/重做 │ 属性 Inspector   │
│ 搜索、来源    ├────────────────────────────────┤ 尺寸 / 位置      │
│ 风格、许可证  │                                │ 填充 / 描边      │
│              │   SVG画布：缩放、网格、选中框    │ 旋转 / 圆角      │
│ 图标结果列表  │   浅色/深色/透明背景预览         │ 图标来源 / 版本  │
│ 或图层树      │                                │                  │
├──────────────┴────────────────────────────────┴──────────────────┤
│ 可收起：SVG源码 / 校验诊断 / 导出代码                              │
└──────────────────────────────────────────────────────────────────┘
```

复用 WorkspaceShell、Tree、Item、DataRegion、Tabs、Field/FormSection、Input、Select、Slider、Button、Sheet/Dialog与现有代码显示能力。SVG编辑画布新增专用组件；WorkflowCanvas的数据语义是工作流图，不将其改作矢量绘图引擎。

桌面侧栏256、属性栏默认320，底部默认收起、展开240；遵循现有尺寸合同。窄屏采用“素材/画布/源码/属性”切换与Sheet，不强行维持三栏。图标搜索结果使用有界分页/窗口化，选中与键盘焦点区分。

## 4. V1能力及后续范围

| 功能 | V1范围 | 后续范围 |
| --- | --- | --- |
| 图标浏览 | 来源/名称/分类/风格检索，预览、来源与许可证；选择后作为副本插入 | 相似度搜索、自动风格匹配 |
| 新建/导入 | 空白文档、粘贴SVG、选择本地SVG；宽高/viewBox | PDF、AI、EPS导入 |
| 基本绘制 | rect、circle、ellipse、line、polyline、polygon、path源码编辑；选择/移动/缩放/旋转 | 钢笔锚点/贝塞尔手柄、布尔运算、自由手绘 |
| 图层 | 单选、多选、排序、隐藏、锁定、删除、分组/解组与键盘替代操作 | 大型设计文档、协同编辑 |
| 属性 | 坐标、尺寸、fill/stroke、线宽、透明度、圆角、变换 | 丰富滤镜、复杂排版、字体轮廓转换 |
| 源码 | 可编辑SVG、语法/支持范围诊断、显式应用、无效草稿保留 | 复杂编辑器插件与扩展语言 |
| 预览 | 平移/缩放、适应画布、网格/透明棋盘、主题背景、多尺寸图标预览 | 动画时间轴、交互脚本 |
| 导出 | 清理后的SVG、独立React TSX、库图标原样使用时的import片段、来源清单 | PNG/ICO多尺寸、SVG sprite、批量资源流水线 |
| 优化 | 显式触发、前后大小/预览对照、可撤销应用 | 自动批处理策略 |

V1不承诺完整Figma/Inkscape能力。path允许通过源码和属性修改，但自由钢笔编辑属于后续。导入含未知元素/复杂filter/外链字体的文件时说明不可视化编辑的内容，不能悄悄丢弃后声称无损往返。

## 5. 编辑模型与源码同步

建议模型位于 `lib/svg-workbench-model.ts`，组件入口为 `components/blocks/svg-workbench.tsx`；名称区分以适配Registry改写。

- `SvgDocument`：schemaVersion、documentId、revision、viewBox、画布尺寸、有稳定ID的节点树及资源定义。
- `SvgNode`：支持类型、几何/绘制属性、transform、层级、锁定/可见状态与来源引用。
- `IconSource`：collection、iconName、style、repository、commit、assetPath、licenseRef、是否已修改。
- `EditorState`：选择、工具、缩放/平移、当前面板；不混入可导出SVG内容。
- `SourceDraft`：原始文本、baseRevision、解析诊断、待应用状态；与已提交的文档分离。
- `EditCommand`：add/update/remove/reorder/group/transform，支持撤销/重做和事务边界。

图形编辑以受控文档为唯一来源；输入中的源码草稿不是第二个自动覆盖图形的存储。源码应用时解析、校验并提交新revision；无效输入保留最后有效预览并提示“预览仍是上次有效版本”。源码baseRevision过期时提供比较/重新加载，禁止静默覆盖另一侧修改。

拖动中的预览可临时更新，pointerup只形成一个撤销事务，Escape取消；键盘移动也进入命令系统。改变SVG文本只在应用后重建选择映射，不在每个字符输入时重挂编辑器。

可选内存hook供本地示例使用；文件保存、持久化、上传和服务调用由适配层负责。V1默认本地处理，刷新前未导出内容明确提示；不要默认将所有导入资源存入localStorage。

## 6. 导入、预览与导出合同

SVG源码是用户数据，不是应用脚本。实现解析后的支持元素/属性白名单，禁止script、事件属性、foreignObject及外部资源引用；限制XML实体/DOCTYPE、data URL和外链行为。文档内`defs`/`use`/渐变等引用必须受控解析，并处理ID冲突。

预览展示验证后的文档，或使用不允许脚本/导航的隔离预览；禁止将未经处理的原始SVG直接插入页面DOM。被排除内容显示诊断，保留原始草稿供修正。不能以“SVGO优化成功”替代导入校验。

建议初始容量为单文件1MiB、2,000节点，路径字符串和点数另设上限；在W0用真实资产校准。解析/优化任务可取消，超时保留当前文档，过期任务结果按revision丢弃。

导出区分：

1. **未修改的库图标**：可给出已验证版本对应的具名import和组件标签。
2. **修改后的图标/自绘SVG**：导出实际几何的SVG或独立TSX，不再冒称原库组件能重现修改效果。
3. **来源说明**：附repository、commit、图标名、许可证路径和修改状态；多图标组合保留全部来源。

SVGO提供优化前后预览和大小，默认保留viewBox及有用的可访问性信息；用户确认后应用为可撤销事务。SVGR的运行位置在W0验证：适合浏览器的部分懒加载/Worker运行；依赖Node的链路采用构建期工具或另行可选适配器，不在当前静态导出站伪造服务端API。禁止通过字符串替换假装完成通用SVG→TSX转换。

## 7. 图标资产索引与性能

- 从固定来源生成目录，包含名称/标签/样式/来源/许可证/资源位置；生成脚本验证缺失来源、重复ID和路径异常。
- `UI-package`的全部源码仅用于研究/生成；工作台运行资产应为审查后的版本化子集。全量集合采取按库、分页或首字母分片，按需取图形。
- 默认先展示Lucide精选结果；其他库显式选择后加载对应索引，预览进入视口或被选中后加载资产。
- 解析、优化与大量检索避免逐次阻塞主线程；采用短防抖、Worker或分片，带取消和revision校验。
- 编辑源码不触发整个素材网格重渲染；pointermove避免整棵文档React树每帧重建。
- 本地与生产构建分别测首开、搜索、拖动和源码应用。不得因引入全图标库而逆转 [页面加载优化计划](./temporary-page-loading-execution-plan.md)。

## 8. 实施阶段

| 阶段 | 优先级 | 交付 | 验收门槛 |
| --- | --- | --- | --- |
| W0 能力与依赖验证 | P0 | SVG支持子集、解析器、SVGO/SVGR执行环境、图标数据生成实验 | 静态导出、SSR/Worker、容量、许可证、取消/错误合同明确；固定生产基线 |
| W1 素材检索网页 | P0 | 图标目录、筛选、详情、插入副本和来源展示 | 先支持Lucide，再依次接Tabler/Phosphor/品牌库；离线可用，首屏无全库下载 |
| W2 基础编辑工作台 | P0 | 图形画布、图层树、属性区、命令/撤销、源码应用 | 可从空白绘制并编辑图标；无效源码/过期应用不损坏文档；键盘可替代拖动 |
| W3 优化与导出 | P0 | SVG、TSX、原库使用片段、来源清单、优化对照 | 导出重导入视觉一致；TSX在独立消费项目编译渲染；确认优化可撤销 |
| W4 页面与分发 | P0 | `/workspace/svg/`、区域Demo、Catalog/Registry、使用说明与截图 | 五态、浅/深色、zh-CN/en、窄屏、性能、安装与行为测试通过 |
| W5 高阶编辑 | 后续 | 钢笔/布尔运算、PNG/ICO、sprite与批量输出 | 独立需求与容量评估后实施，不影响V1完成判定 |

新增公共组件才进入 `components/ui/` / `components/blocks/`，示例适配放 `components/examples/svg-workbench/`，页面只装配。共享主题继续由 `styles/theme.css` 管理；图形数据不得通过CSS影响工作台外部样式。

## 9. 验证与交付

W0–W4 已交付 `/workspace/svg/`、四个可分发组件、60 个固定来源素材及模型/Worker/导出工具。`pnpm lint`、`pnpm typecheck`、`pnpm build`、28 项生产浏览器回归、开发性能采样、模型安全测试及 `pnpm test:install` 均已通过；Catalog、Registry、文档与中英文资源检查通过。在隔离快照构建，保留共享服务和并行改动；详细边界和原始证据见验证记录。

必须覆盖：选择库图标→插入→改颜色/路径→撤销→导出→重导入；原库import与修改后TSX区分；图层重排、键盘移动、拖动取消；非法SVG、外链、过大文件、重复ID、解析超时；保存失败/取消保留文档；中英文切换保留草稿；移动端与短视口关闭/导出控件可达。

先交付可直接检查的单图标编辑闭环，再扩大资产和高级绘图。源码归档、工作台实现、独立安装与性能验收分别记录完成状态。产品图标替换由独立的图标复用计划验收，不作为本工作台启动或完成的前置条件。
