# 通用组件补齐实施记录

日期：2026-10-08。配套：[计划](common-components-completion-plan.md)、[CRM复刻边界](sales-crm-replication-plan.md)。

本轮只实现与验证，不提交或推送。通用组件不导入 CRM 类型、store、站点资源或 Next 路由；数据请求、筛选、排序、计数、上传及持久化由调用方负责。

## 实现范围

| 编号 | 能力 | 实现与边界 | 验证 |
| --- | --- | --- | --- |
| C01 | Checkbox | Base UI 三态、表单 name/form、32/44px命中 | 键盘、mixed、disabled、表格选择 |
| C02 | Table | 原生分段、caption、th scope、可聚焦滚动容器 | 原生语义、横向滚动、键盘滚动 |
| C03 | DataTable | 受控选择/查看/排序请求、五种数据态、固定表头、底部槽 | 隐藏ID保留、全选、排序、刷新失败、长内容 |
| C04 | Tabs | 复用现有 Base UI Tabs，补 disabled 示例 | 方向键、选中与焦点分离 |
| C05 | Select | 分组、禁用、占位、name、位置/碰撞约束；items提供显示标签 | Home/End、关闭回焦、嵌套与双语言 |
| C06 | DropdownMenu | 复用 Menu，补 checkbox/radio/separator | 项值更新、禁用、Escape回焦 |
| C07 | Avatar | 24/32/40px、缩写、图片失败回退 | 失败后缩写与可访问名称 |
| C08 | Sheet | 左/右/底部、size、受控open、固定首尾与滚动正文 | Select/Popover逐层关闭、草稿与焦点恢复 |
| C09 | SegmentBar | meter、未知、范围限制、1–50段 | 数值和未知语义，不冒充进度 |
| C10 | Sparkline | 最近120个柱状点、缺失/空/等值/零/负数、文本替代 | SVG名称、摘要与缺失柱处理 |
| C11 | Popover | 复用现有实现，增加定位参数和可用空间限制 | 嵌套关闭、主题继承 |
| C12 | CommandPalette / Kbd | 调用方结果、受控搜索、分组、键盘、默认无全局快捷键 | 禁用跳过、IME、scope、加载/错误恢复、查询保留 |
| C13 | Field / FormSection | label/id、描述/错误关联、render函数、fieldset/legend | 空值/非法数字保留草稿、错误关联 |
| C14 | Slider | value/defaultValue、连续change与commit、范围与步长 | Home/End、提交回调、触摸尺寸 |
| C15 | ImageUpload | 本地File、类型/大小/读取/解码、替换/移除、取消旧读取 | 失败保留旧图、迟到读取、重试与移除 |
| C16 | 原生滚动 | 不新增 ScrollArea；沿用 overflow:auto 与现有滚动条 | 表格、Sheet与命令结果的键盘/触摸入口 |
| C17 | WorkspaceShell侧栏 | 可选resize、受控宽度/边界，默认256/48不变 | 指针与键盘、边界、按实例持久化示例 |
| C18 | FilterToolbar | 筛选/排序/计数槽，窄屏Sheet；只挂载一组筛选控件 | 390px筛选、44px目标、状态不丢失 |
| C19 | MetricSummary / RatingDisplay | dl指标；1–10星、半星、未知、只读 | 九列非CRM fixture、文本替代 |

新增17个公开项和内部 `controllable-value` 工具；Tabs、Select、Popover、Menu、WorkspaceShell、ThemeBoundary复用现有基础。总计59个目录组件、72项Registry。每个新增公开项都有实际源码、示例、Manifest、按需loader、Registry及中英文资源。词典关联真实组件，不凭术语推断可安装项。

## 接口与使用入口

- 九列非CRM表格：`/docs/data-table/`；记录稳定ID，勾选、名称按钮、负责人链接和尾部动作分别操作。
- 输入：`/docs/field/`、`/docs/slider/`、`/docs/image-upload/`、`/docs/command-palette/`。
- 浮层：`/docs/sheet/`、`/docs/dropdown-menu/`、`/docs/select/`、`/docs/popover/`。
- 两个同时存在的主题/语言实例：`/benchmarks/common-components/`。
- 受控侧栏和实例持久化适配：`/workspace/layout/`。持久化只在 examples，组件不写全局变量或固定存储键。

## 验证范围与证据

当前验证副本：`../.tmp/easyuse-common-validation-7kcuhc_8`，独立预览端口33817。复用原3010服务，不修改其构建产物、不重启。并行工作区仍在变化，隔离副本冻结既有前置组件并合入本轮源码；以下结果不代表所有其他未提交优化都已验收。

- 最终工程检查、完整回归与独立安装结果见下表。
- 定向交互测试曾发现长名称按钮仍使用固定高度，遮挡相邻行；已改为局部CSS的内容自适应高度，并登记CSS分发依赖。
- Select显示文字与协议值不同时使用items映射；不改变提交值。菜单radio默认保留菜单打开，测试按实际API验证。
- 逐组件安装闭包测试检查每个新增项的源码、CSS及npm依赖，正确处理包名中的版本号；CLI安装后另做真实浏览器组合操作。
- 既有测试的固定3011地址改为配置中的baseURL，避免隔离测试误连另一个项目预览服务。

## 限制

本轮不是CRM页面复刻或真实业务服务接入；不执行远程上传、查询、保存、命令或CSV导出。DataTable没有虚拟化、分页、列拖拽、单元格编辑或DataGrid单元格导航。Sparkline不是图表平台，评分只读，ImageUpload只交付本地File。

自动axe、DOM语义、真实浏览器键盘和触摸检查不替代人工屏幕阅读器或完整WCAG审计；本轮未执行人工屏幕阅读器验收。原有Canvas性能预算不放宽，共享主机的测量及不达标样本如实保留。


## 最终自动验证

| 检查 | 结果 | 证据/范围 |
| --- | --- | --- |
| `pnpm lint` | 通过 | 隔离副本，最终组件/测试源码 |
| `pnpm typecheck` | 通过 | Next类型生成及tsc；宿主使用SWC WASM回退 |
| `pnpm build` | 通过 | Webpack生产导出；新增组件详情与双实例预览 |
| `pnpm check:manifest` | 通过 | 59组件、72 Registry项，loader及CSS依赖 |
| `pnpm check:i18n` | 通过 | 861 portable；冻结站点1808条，实时工作区1808条 |
| `pnpm test` | 183通过、0失败 | 完整冻结回归，包含15项新增交互及17项逐组件静态闭包 |
| 移动抽屉焦点定向复验 | 3次通过 | Base UI焦点边界用poll等待真实回收；逐次Tab仍必须留在对话框 |
| `pnpm test:install` | 通过 | 独立CLI安装、tsc、生产构建、Canvas旧能力及通用组件浏览器操作 |

安装消费项目：`../.tmp/easyuse-ui-consumer-r4WCzH`。检查隐藏行选择、查看行、原生键盘滚动/固定表头、Slider commit、命令搜索、Sheet内嵌Select、菜单radio、图片预览和侧栏宽度。17项闭包分别静态检查，CLI消费项目为一次组合安装；不声称分别构建了17个消费应用。

安装检查通过等待原生End滚动抵达固定表头的位置，避免浏览器尚在滚动时误报。移动焦点检查同样等待组件完成真实焦点回收，不主动把焦点塞回弹层。两者均保留最终行为断言。

已将46个本轮组件/示例文件与实时工作区做格式归一化比较，内容一致。验证报告列出73个实现、主题、示例、元数据及测试文件的SHA256；该范围哈希不是完整Git树哈希，不包含文章自身以避免递归。

可下载证据：`public/blog/common-components-from-crm/2026-10-08/verification.json`、同目录`full-browser.log`和`independent-install.log`。原始本地工程日志保留在`/tmp/easyuse-common-*-final.log`。

完整回归中的既有Canvas测量：200节点冷启动2815ms（预算2000ms，超出）、Inspector更新p95为72.3ms（预算100ms）、拖拽49fps（最低30fps）；50/200节点温切换分别446/806ms。此轮未启用CI性能断言，功能测试绿色不等于所有性能预算达标。共享负载下的样本不提供本轮通用组件的性能归因或生产承诺。

文章已接入Blog列表、静态路由、站点地图及中英文正文；相关API和本地运行示例均可访问。文章采用measuring状态并链接功能证据，未伪造性能改善指标。文档发布后的定向回归结果继续记录在下方。


最终发布版本完整回归：**183通过、0失败**，包含新增文章的站点地图、证据下载、按需示例、语言切换保留行选择及三种屏宽检查。Sheet正文使用真实PageDown滚动，并验证首尾位置保持不变。

文档回归曾因隔离副本仍持有旧Blog图片组件而失败；已同步实时工作区已有的错误恢复组件及中英文imageUnavailable资源，保持该前置实现不变后重新生产构建。临时的延迟故障注入测试已撤回，原有图片请求失败/重试断言保留，并在最终完整回归中通过。

此前179项完整通过的日志保存在full-browser-before-publication.log；两轮Canvas样本均保留在verification.json。最终工程检查与文章检查通过，本轮没有提交或推送。
