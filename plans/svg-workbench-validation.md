# SVG Workbench 实施与验证记录

日期：2026-10-09。范围：W0–W4 的 V1；状态：实现与验证完成。W5 保持后续范围。

正式页面 `/workspace/svg/`，新增 SvgWorkbench/SvgCanvas/SvgIconLibrary/SvgProperties、严格 SAX 解析、受控文档/命令、可选内存历史适配器和独立 Worker。四个区域 Demo、Catalog、Registry 与 [指南](../SVG-WORKBENCH.md) 已接入。

## 基线与实现边界

最初隔离基线为 `7891d61`，未添加 SVG 改动的对照构建位于 `EasyuseUI-svg-baseline-20261009`。最终集成基线为 `1c8edcb`，验证位于 `EasyuseUI-svg-final-20261009`，包含已提交的 Agent Workbench 改动及本任务源码；重新执行构建、安装与完整回归。未重启共享 3010，也未在共享活动开发目录执行生产构建。隔离生产测试使用 3026，最终开发预览使用 3027。

固定 saxes 6.0.0、SVGO 4.0.0；可选 Node 工具 SVGR core/plugin-jsx 8.1.0。SVGO browser 懒加载到 Worker；SVGR Node/Babel 通过可选 CLI 验证，浏览器 V1 TSX 按校验 AST 生成。SSR 不访问 DOM/Worker；每次任务创建独立 Worker，取消/超时 terminate，迟到 revision 丢弃。

素材：Lucide 32、Tabler 8、独立 Phosphor Core 8、Simple Icons 4、Lobe 4、Iconify Lucide 4，共 60 个。生成器固定 Git blob 与完整来源/许可，31 个 Lucide 素材实际匹配当前安装的具名 React 节点；运行及独立安装不依赖 UI-package 的绝对路径。生成记录见 [素材清单](svg-workbench-assets.json)。

## 已通过的检查

- `pnpm lint`、`pnpm typecheck`、Webpack/WASM 的 `pnpm build`（含静态路由）通过。GLIBC 2.28 的原生 SWC 警告由 WASM fallback 处理。
- `pnpm check:i18n`、`pnpm check:manifest`、`pnpm check:docs` 通过：202 个组件、74 个文档代码片段；1557 条公共组件消息、124 条随 SVG 加载的消息、2225 条站点消息。站点与组件字典中 752 对完全一致的双语文案使用私有引用压缩，逐项校验恢复后全部键和值与正式资源一致。
- `pnpm svg:assets` 可重复生成；`pnpm test:svg:model` 通过。覆盖元素/属性白名单、XML/DOCTYPE/实体、外链及编码外链、data URL、重复/缺失/循环 ID、节点/文件/路径/点数容量、时间预算；命令、排序、组合、继承属性、锁定、事务、来源状态、全部 60 个素材复制/序列化/重解析，以及 TSX AST、SVGR/SVGO 实际执行。
- 生产 Playwright 三套测试共 **28 项通过**，无重试或跳过：SVG 工作台 12、原页面加载预算 7、语言/资源/懒加载回归 9。包括插入→改颜色/路径→撤销→导出→重导入；原库片段与修改后 TSX 区分；导入 ID 与新素材/绘制 ID 避免冲突；图层、键盘与一次拖动事务；取消、实际 5 秒超时、迟到结果；非法/过大输入保留；五种数据态及刷新失败保留素材；语言切换保留草稿；390×640 与 390×240 的关闭/导出/焦点；浅深色与 axe 检查。页面加载回归使用现有 Agent 链接导航及设置弹窗，继续验证草稿、编辑器实例、浏览器历史与失败重试。
- `pnpm test:install` 通过：真实 CLI 安装依赖与 Registry 源码、独立 TypeScript/生产构建及浏览器挂载；SVG/Worker TSX 导出、保存失败/取消保留文档、导出 TSX 独立编译、多实例 ID/use/渐变/无障碍标题引用不冲突。原消费组件验证也通过。

## 性能采样

本机 Chromium、1440×1000、无网络限速，同一上下文各 3 次。时间包含自动化操作和 UI 就绪等待；拖动记录包含 8 次 pointermove 与提交整段操作，不能解释为单帧耗时。开发首样本含编译，后续访问含缓存。这些是本地观测，不是稳定 CI p95 或大文档性能验收。

| 口径（ms） | 开发 Webpack | 最终生产静态构建 |
| --- | --- | --- |
| 页面至素材可用 | 17840 / 2466 / 2481 | 1654 / 1564 / 1534 |
| 搜索至目标可见 | 64 / 41 / 47 | 36 / 37 / 26 |
| 源码应用至图形提交 | 568 / 400 / 359 | 501 / 378 / 364 |
| 拖动至一次事务提交 | 395 / 363 / 362 | 285 / 231 / 223 |

1,999 个图形节点的最新本地 Node 解析样本为 34.4ms；该数字不代表浏览器或其他设备。

Button 文档页在 `7891d61` 未加本任务的对照为 359637 字节（gzip 估算）；本任务采用文案分片及共享双语对压缩后，同基线为 356111。最终 `1c8edcb` 集成构建为 **358078/360000**，既有预算不变。其他最终页面：components 367355/380000、dictionary 386758/400000、blog 353209/375000、on-demand-demos 357184/365000、首页 358074/380000、examples 344887/380000；均通过，未在这些页面首屏引入 Canvas 引擎。

## 原始证据位置

- 最终生产构建与静态检查日志：`/tmp/easyuseui-svg-integrated-build.log`；最终 lint：`/tmp/easyuseui-svg-delivery-lint.log`。
- 最终 28 项回归与资源/时间 JSON：`/tmp/easyuseui-svg-browser-delivery.log`、`/tmp/easyuseui-svg-delivery-report.json`。
- 最终开发时间 JSON：`/tmp/easyuseui-svg-delivery-dev-report.json`；开发采样日志：`/tmp/easyuseui-svg-delivery-dev-performance.log`；开发服务日志：`/tmp/easyuseui-svg-delivery-dev.log`。
- 浅深色生产截图：`/tmp/easyuseui-svg-evidence/svg-workbench-light.png` 与 `svg-workbench-dark.png`，已人工检查。
- 最终独立安装日志：`/tmp/easyuseui-svg-integrated-install.log`；消费项目：`../.tmp/easyuse-ui-consumer-XNHWbb`。

这些是本机证据和临时工件，不随 Git 发布。

## 证据边界

本任务交付本地单文档编辑及可分发组件。远端保存、上传、协作、图标 API、执行与业务验收由调用方提供；导出失败/取消只证明文档保留，不证明外部保存成功。精选子集不是全量素材库。跨父级图层移动暂不开放；复杂 SVG、钢笔/布尔运算、PNG/ICO、sprite 与批量输出保持独立后续范围。
