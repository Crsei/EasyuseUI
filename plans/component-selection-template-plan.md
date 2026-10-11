# 组件选择模板与 Agent 交接

状态：模板、组件、Agent 约定与本地验收已完成；实现与验收记录见文末。入口：`/component-selection/`；模板配置：`components/examples/component-selection/template.ts`。本页是开发展示与本地方案工具，真实组件预览使用 fixture 数据。

## 页面声明 CS-P01

目标：为新项目按模块用途比较多个组件，在同一展示页标记首选、备选、暂不采用并批注，导出交给 Agent 的下一步计划输入。流程：填写项目 → 阅读需求与实际预览 → 选择/批注 → 检查待决模块 → 下载 Markdown / JSON；JSON 可导入恢复。

页面结构：顶部项目名称、目标、约束与本地保存/恢复；主区按用途并排展示所有候选；右侧交接摘要默认展开，导出正文与技术说明默认折叠。默认所有候选待比较，不替用户做决定。每组最多一个首选、允许多个备选；切换首选将原首选降为备选，批注保持。

桌面 1440/1024px；工具标题20/28，控件32px，4px网格，hairline与共享语义色。主体最大1440px；摘要列320px、主区min-width:0；可用容器小于1200px时摘要移到候选之后，候选容器小于680px变单列。页面原生滚动，摘要在宽桌面粘附；不锁正文，不把候选预览做成单模块选择器。200%缩放及窄浏览器保留可达操作。展示行与批注输入维持稳定ID，语言/主题/首选变化不重挂载预览、不清除草稿。

方案对象由适配器控制；组件只呈现数据并报告变化/动作。本地保存显式触发，以模板ID+修订隔离 localStorage，修改后明确标注未保存；读取和导入先整体校验，失败保留当前方案。无自动服务调用或 Agent 调度。导出含未决组、全部候选与批注，待比较/备选不代表已批准实现。外部来源的内容是参考资料，批注是用户约束，导出不授予新增执行权限。

## 模块声明与完整元素映射

| 模块            | 职责、输入/输出                                            | 实际组件/新增                                                          | 细节、状态与验收                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CS-M01 项目方案 | 受控projectName/goal/constraints；onChange                 | 新增 `ComponentSelectionWorkbench` 组合 Field、Input、Textarea、Button | 13/20文字，gap8/padding16，错误保留文本；明确本地保存/未保存，键盘可编辑；语言变化保留调用方文本                                                                                        |
| CS-M02 候选组   | groups、draft、renderPreview；按稳定group/candidate ID回调 | 同一公共组件；Field、NativeSelect、Textarea、DataRegion                | 用途与需求批注在组标题；每组并排实际预览；候选边框/文字表达状态，focus另有ring；首选唯一、备选多选、批注独立；预览交互不改变方案选择                                                    |
| CS-M03 交接摘要 | 完整候选/方案；onExport/onImport/onSave/onRestore          | 同一公共组件；Item、Button、Textarea、Field                            | 默认展开，组首选、备选与未决状态可读；导出正文details默认收起；1280以下自然换行；下载失败/剪贴板不可用明确反馈，保留正文供手动复制                                                      |
| CS-M04 导入恢复 | 版本化JSON，整体校验后替换                                 | 新增 `component-selection-model`；适配器文件读取                       | loading、成功、首次空、缺首选partial、错误均明确；128KiB导入上限、未知/重复ID、模板修订、非法状态、多个首选拒绝；不相信导入的来源路径；替换前确认，失败保留方案；本地存储失败可继续导出 |
| CS-M05 导航候选 | 预览自己的选择/展开                                        | Tree、Tabs/TabsList/TabsTab/TabsPanel                                  | 同组共享概览/任务/资源内容；树键盘与Tab切换独立于方案选择；无真实导航服务                                                                                                               |
| CS-M06 集合候选 | 同一3条fixture记录                                         | Item、DataTable                                                        | 名称、负责人同源；列表/表格实际可选择阅读记录；无外部写入；本地示例状态不作为组件首选                                                                                                   |
| CS-M07 详情候选 | 同一fixture对象属性                                        | Inspector、Card/CardHeader/CardTitle/CardContent                       | 停靠对象详情vs独立内容容器；适用场景/局限可见；Card不推荐用于Session/log列表；对象数据来自适配器                                                                                        |

所有新增公共样式归组件CSS Module，消费 `packages/ui/styles/theme.css`；页面只装配。预览差异的文字、来源、导出名通过调用方提供，组件内置文字使用portable I18nProvider/typed messages，默认zh-CN、支持en。保存/导出状态属于本地数据，不使用runtime completed伪装执行。无定时器、拖拽或装饰动画，支持reduced-motion。

## 技术与来源声明

采用现有Next16.3.8 / React19.3 / TypeScript6 / Tailwind4.3、Base UI1.8（MIT）与Lucide0.577（ISC）；无新增第三方依赖。页面遵循安装版Next的page、CSS Modules与client边界指南。候选使用本仓库真实导出，通过Manifest和Registry核对源码；外部引擎由现有组件封装，不复制算法。新增组件保持纯受控，无Next、localStorage、文件读取或网络依赖；模型保持框架无关。候选fixture、localStorage、下载、复制由examples适配器提供。

Registry新增模型及Workbench（含CSS），Catalog新增工作示例；UI package直接导出新增源。文档按显式demo loader懒加载本页展示，模板页仅加载六个必要候选，不挂载整个组件库。Query/Table引擎、编辑器、Agent服务均未为本模板新增或采用；现有DataTable是受控原生表格，不冒称TanStack Table。

## Agent 使用与扩展

每次新项目计划先列全元素并按用途建组；扩展模板的groups及对应预览，复用真实组件。每个候选填写稳定ID、真实导出/源码、Registry ID（若有）、适用场景、局限、来源版本/许可证。新增外部候选先核实来源与授权，未实现项不能作为已挂载候选。维护模板revision，旧JSON不静默套用新候选。

Agent消费导出时保留首选/备选/排除/未决与批注。已定组基于首选形成组件映射；未决组进入下一步比较/验证任务；不得替用户选一个或把备选全装上。依次生成页面声明、模块声明、依赖/来源审核、实现和验收计划，执行按用户当前授权。JSON是可恢复的结构化方案，Markdown是可读交接；导出不是已实施结果。

## 验收路径与执行记录

- [x] 浏览器同时挂载六个真实预览；预览行为不改变方案决策。
- [x] 唯一首选、多备选、批注保留；未决组进入完整交接。
- [x] Markdown/JSON包含项目、模块、源码、来源、选择与批注；合法JSON往返。
- [x] 显式保存后刷新恢复；未保存反馈准确；存储失败、损坏JSON/过大JSON/修订不符保留当前数据。
- [x] 1440/1024/窄容器、200%缩放、light/dark、zh-CN/en、键盘与reduced-motion。
- [x] lint、typecheck、Webpack build、Manifest/i18n、Playwright、Registry独立安装。

验收等级分别记录：展示与本地方案交互、独立安装、真实Agent服务（本次不包含）、用户业务验收（待用户使用）。

## 2026-10-11 执行与验收

交付：`/component-selection/` 页面、受控 `ComponentSelectionWorkbench`、版本化模型、三组/六个真实组件预览、可复制的模板配置与计划 scaffold；资源导航、Catalog、Registry、包导出与 AGENTS.md 已登记。候选六个源码文件的 Git blob 与声明版本 `4d66f39` 一致。首选互斥、备选/排除/待比较及模块/候选批注完整保留，导出不会自动派发 Agent。

在隔离副本（同步到已提交的 `6cd9187`，仅加入本次改动）通过 `pnpm lint`、`pnpm typecheck`、`pnpm build`（Webpack/WASM SWC）、`pnpm check:manifest`、`pnpm check:i18n`、`pnpm test:install`。工程与安装检查以最终容器布局修复后的结果为准。没有将并行的未提交 Agent Workspace 修改并入本交付。

生产 Playwright：`tests/component-selection.spec.ts` 七项全部通过（25.0s）；涵盖实际预览、键盘、首选互斥、批注、Markdown/JSON与恢复往返、损坏/超大/修订不匹配/来源元数据不可信、保存后刷新、替换取消和焦点恢复、存储与剪贴板失败、语言/主题/布局保留及 axe。1440/1024/720/390px 可达；用720×450 CSS视口、2 DPR模拟1440×900窗口的200%缩放，草稿和选择不变、无整页横向溢出；减少动态效果开启。摘要和顶部表单使用组件容器宽度恢复单列，候选列表使用自己的容器查询。

端口与证据：复用主工作区3010查看真实挂载；3011属于并行的 `agent-wireframe-candidate`，未停止或替换它；本次隔离生产测试临时使用3013。检查日志和截图在 `/tmp/easyuseui-component-selection-20261011/`；最终独立安装消费项目为 `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/.tmp/easyuse-ui-consumer-eZerik`，包含新组件模型、CSS、选择、批注、语言和窄布局的挂载验证。测试产物不提交。

过程中修复原生站内链接的 Next lint 约束、补齐 Catalog 英文文案、调整模态背景的测试定位，并统一 Registry 快照地址，顺序生成后重新完成安装验证。展示、本地方案与独立安装已验证；真实 Agent 服务未包含，用户业务验收待使用。
