# SVG 工作台 / SVG Workbench

正式入口：[SVG 工作台](/workspace/svg/)。浏览已审查的素材，插入副本、绘制图形、编辑属性或源码，再导出实际 SVG、独立 React TSX 和来源清单。所有处理默认在本地；刷新前请导出。组件不读取 localStorage，不上传文档，也不修改产品图标。

## 使用

- 素材面板按名称、标签、分类、样式和许可证检索，每页最多 12 个结果。先选择素材查看来源，再明确插入。默认只加载 Lucide 子集；选择其他来源后才加载它的分片。精选素材不是全库索引。
- 矩形、圆形、椭圆和直线通过拖动绘制。折线、多边形逐点点击，Enter 完成，Escape 取消。path 通过源码和属性中的 `d` 编辑。
- 选择工具支持 Shift 点击增减选择。图层树的 Space/点击单选，Enter 增减选择；有界的上移/下移及 Tree「移动到」表单提供键盘排序。跨父级移动暂不开放，避免变换坐标被误改。组合只接受同父级的多个节点；带透明度的组不解组，以保持合成效果。
- 方向键移动，Shift 加速。拖动预览不提交文档；pointerup 提交一次事务，Escape/pointercancel 取消。属性 Enter 或失焦提交，非法属性保留输入。
- 源码先成为草稿，点击「校验并应用源码」才替换图形。无效输入保留最后有效预览；图形版本改变后，过期草稿须比较并重新载入。语言切换保留文档、选择和草稿。
- 优化显式触发，查看前后字节数和预览后确认应用，可以撤销。当前采用保守 SVGO 配置，保留 viewBox、title、desc、ID、几何与来源，结果不保证一定变小。

## 支持与校验

支持 `g/rect/circle/ellipse/line/polyline/polygon/path/defs/linearGradient/radialGradient/stop/use/title/desc`。根节点必须是 SVG；宽高为正的无单位数值，viewBox 为四个有限数值。嵌套资源以局部 ID 引用，检测缺失/重复 ID、循环和扩展容量。插入副本会重命名 ID 和引用；各预览和导出的 TSX 使用独立 ID 作用域。

支持几何、填充/描边、线宽/端点/连接、透明度、基础变换和有限可访问性属性。ID 用于内部节点，根 SVG 的 id 暂不支持。不支持 CSS/style、script、foreignObject、图片、动画、filter、文字排版、外链、data URL、DOCTYPE、实体声明或处理指令。未知元素/属性拒绝整个应用并显示诊断，保留原始草稿；这不是复杂 SVG 的无损往返编辑器。

上限：文件 1 MiB、元素总数 2,000（含根 SVG）、嵌套深度 32、单属性/路径 64 KiB、points 最多 10,000 对。解析和优化在独立 Worker 中运行，默认 5 秒超时，可以终止；迟到结果按文档 revision 丢弃。命令适配器也验证结果，避免属性编辑绕过导入边界。历史最多保留 50 次提交，撤销/重做 revision 始终递增。

## 来源与导出

60 个固定素材来自 Lucide 32、Tabler 8、独立 Phosphor Core 8、Simple Icons 4、Lobe 4、Iconify Lucide 集合 4。完整 commit、资源路径、原始图形 SHA-256、许可证正文和适配说明随素材保存，生成证据见 [素材清单](plans/svg-workbench-assets.json)。Phosphor 使用独立 Core 固定版本，不声称匹配 React 仓库内的另一个 Core 子模块。

生成器读取相邻 UI-package 的固定 Git blob，核对 HEAD 和清单，拒绝路径异常、重复 ID、缺失资源或不合支持范围的图形。运行及独立安装只使用仓库内的生成文件，完全不依赖 UI-package 的绝对路径。Lobe 素材明确移除了页面布局用 style，并将 1em 尺寸改为 24；图形与颜色保留。品牌素材的商标和使用指引仍属于品牌所有者。

原库片段只对已核对安装版本真实节点、且未改动的单个 Lucide 图标提供。当前核对 `lucide-react@0.577.0`，31 个匹配；不匹配的素材仍可编辑并导出实际 SVG/TSX。修改颜色、路径、尺寸、变换或组合后，原库片段失效；撤销恢复未修改文档时可恢复片段。多素材组合保留全部来源。

SVG 包含来源与许可注释，TSX 包含来源与许可注释并生成 `useId` 作用域。来源清单可单独导出；V1 不从任意导入文件中的注释自动认证来源。重新导入 SVG 验证实际图形，不证明原库身份。TSX 是针对已校验 V1 节点树的结构化代码生成，保留实际几何、属性及文本；没有通用字符串替换转换器。

[SVGO 浏览器包](https://svgo.dev/docs/usage/browser/)懒加载在 Worker 内运行。归档 SVGR 的 config/plugin 链路使用 Node/Babel，未塞入浏览器或伪造静态站 API。[SVGR Node API](https://react-svgr.com/docs/node-api/)作为可选命令行适配：

```sh
pnpm svg:assets
pnpm test:svg:model
pnpm svg:tsx input.svg output.tsx
```

`svg:tsx` 先校验 SVG 再用固定 SVGR 8.1.0 转换，不覆盖已有输出文件。它不保留浏览器编辑器的来源认证；需要来源说明时一起交付工作台导出的清单。

## 组件与适配层

可安装入口：`svg-workbench`、`svg-canvas`、`svg-icon-library`、`svg-properties`，以及内部 `svg-workbench-model/svg-workbench-styles`。模型文件名与组件不同，Worker、解析器、素材分片和 CSS 均随 Registry 安装。

```tsx
"use client"
import { SvgWorkbench } from "@/components/blocks/svg-workbench"
import { useSvgWorkbenchEditor } from "@/lib/use-svg-workbench-editor"
import type { SvgIconLibraryProps } from "@/components/blocks/svg-icon-library"

export function ArtworkEditor({ library }: {
  library: Omit<SvgIconLibraryProps, "onInsert">
}) {
  const editor = useSvgWorkbenchEditor()
  return <div style={{ height: "100dvh" }}>
    <SvgWorkbench {...editor} library={library} layout="fill" />
  </div>
}
```

受控 `document/selectedIds/onCommand/onSelectionChange` 是唯一图形来源。`onUndo/onRedo/canUndo/canRedo` 由调用方提供；可选 hook 仅供内存使用。素材请求、数据五态和刷新失败保留旧素材由 library 适配层负责。`onExport(file, signal)` 可接自定义保存能力；错误或取消不会清空文档，适配器须响应 AbortSignal。默认使用本地下载。

内置文案通过 `lib/i18n-svg.ts` 共用可移植 I18nProvider 的 locale 和类型化翻译合同；`lib/i18n-svg-messages.ts` 仅随 SVG 组件加载，避免给其他工具页增加全部 SVG 文案。中英文切换不重挂编辑器，不改写调用方文本或用户草稿。

桌面复用 WorkspaceShell 的 256px 侧栏、320px Inspector 和默认收起的 240px 底部面板；正式页面铺满窗口。窄屏使用素材/源码/属性 Sheet。组件文档有独立区域 Demo，素材 Demo 可检查五种数据态。工程、浏览器、独立安装和性能记录见 [实施验证记录](plans/svg-workbench-validation.md)。W5 的钢笔、布尔运算、PNG/ICO、sprite 和批量导出未纳入 V1。
