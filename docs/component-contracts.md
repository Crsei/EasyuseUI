# 组件边界与组合契约

交互示例位于 `/examples/component-contracts/`，使用本地 fixture，刷新后重置。它不连接业务查询、执行、授权或存储服务。

Dialog 默认高度不超过 `100dvh - 32px`。简单内容整体滚动；长表单使用 DialogHeader / DialogBody / DialogFooter，正文独立滚动，关闭按钮在正文外。极短视口时 Header 自身可滚动，标题与操作仍可触达。Base UI 继续负责模态焦点和 Escape。组件记录实际触发元素作为默认 finalFocus，避免多层模态的恢复回退抢走焦点；调用方显式 finalFocus 继续优先。嵌套 Portal 保留在所属模态 DOM 子树和继承主题内。

OverlayLayer 通过 React 层级（包含 Portal）递增视觉深度，共享 `--layer-overlay` 和 `--layer-overlay-step`。Backdrop 与对应 Popup 同层，DOM 顺序保证 Popup 在上。ThemeBoundary 保留自己的 token。调用方不要给 Portal 容器祖先添加独立 stacking context；手动覆盖 z-index 需要自行维持整组层级。Dialog/AlertDialog 使用 `--motion-panel`，Sheet 使用 drawer token；Popover/Menu/Select/Combobox/Tooltip 保持静态呈现。减少动态效果时关闭过渡，动效结束不代表业务完成。

Toolbar 使用 Base UI 单 Tab 入口与方向键模型，禁用命令跳过；ToolbarInput 保留原生光标键。CommandToolbar 根据容器宽度及优先级决定可见命令，原顺序不变，溢出进入更多菜单。菜单打开期间冻结分配，关闭后重新测量；被移入菜单的焦点落到更多入口。命令必须使用稳定唯一 ID，标签始终可访问；异步调用防重复，错误显示本地提示，业务结果由调用方解释。FilterToolbar 继续使用 group 语义。

Resizable / ResizableHandle 统一 WorkspaceShell 的侧栏、Inspector 和底部分隔条。Home/End 与方向键是拖拽替代；pointer cancel 停止手势并保留最后接受的尺寸。Resizable 的 secondMin 保证第二面板的最小空间；容器缩小时显示尺寸被限制，已请求的偏好尺寸保留，空间恢复后重新显示。无法同时满足两个最小值时先保护第二面板。Inspector 正式范围为 300–360px。组件不保存偏好；折叠状态和面板身份由调用方保留。

DataTable 的 columnConfig 控制顺序、显隐和像素宽度。未知列 ID 忽略，新列追加，hideable=false 列保留；宽度受 minWidth/maxWidth 限制。DataTableControls 提供键盘调整入口。可交互 cell 组合 onActivateRow 时使用 activationMode="separate"，把对象查看与 cell 操作放在兄弟目标中。

表格不拥有远程服务。可选 createDataTableQuerySession 用 scope/filter/sort/page/pageSize/cursor 组成完整查询身份，响应必须回显 queryKey；新请求丢弃旧响应，即使传输忽略 AbortSignal。同查询刷新失败保留已有行，切换查询不复用旧行。total 未提供时保持未知，hasNext 不等于全查询总数。Pagination 只请求页码，游标历史由调用方维护；排序、筛选或范围改变时调用方清空游标。选择保留屏外 ID，当前页全选仅作用于当前可选行。dispose 停止当前请求并清理订阅；权限变化必须由调用方清除敏感快照。

轻量 Chart（blocks/chart，Registry chart）最多绘制120点，无额外图表引擎，接收调用方已计算标签和值。真实0保持0；null 的 unknown/not-collected/permission/gap 各有文本，折线不跨缺口，表格始终可见。时间桶、时区、权限与完整性由调用方明确提供。分析侧 ChartFrame / StatisticalChart / WorkflowMetrics 保持既有查询、指标、历史覆盖、时区和权限契约，详见 WORKFLOW-ANALYTICS.md。

[可用性映射](component-availability.md) 以 Manifest/Registry 为来源；[验收索引](ui-contract-evidence.md) 区分变体编译、模型、浏览器、axe、截图和人工读屏。人工读屏尚未执行，不据 headless 检查认定通过。
