# 常用视觉词汇与语义边界

这是按选型问题组织的参考。EasyuseUI 实现入口核对基线为 2026-10-08，使用前重新核对目标版本；独立实现模式只使用术语与行为列。

## 形状、标签与控件

| 外观/描述          | 术语与行为                          | EasyuseUI 入口或限制                                       |
| ------------------ | ----------------------------------- | ---------------------------------------------------------- |
| 两端半圆           | Pill / Capsule：只描述形状          | CSS `rounded-full`，无 Pill 组件                           |
| 紧凑的运行状态     | Runtime Status Badge：只读运行事实  | `RuntimeStatusBadge`；不以通用 Badge 自建状态映射          |
| 只读计数或标识     | Badge                               | `Badge` 支持小圆角/胶囊                                    |
| 分类、来源标签     | Tag / Label                         | `Tag`，只读中性分类                                        |
| 可以选择或移除的值 | Chip / Filter Chip / Removable Chip | `Chip`；选择和移除为兄弟目标，受控更新                     |
| 执行动作的胶囊     | Pill Button                         | `Button` 无专用 pill variant；形状变化需满足契约或明确例外 |
| 连在一起的互斥选项 | Segmented Control：一个设置值       | 无通用组件                                                 |
| 连在一起切换内容   | Pill Tabs：关联面板切换             | 无通用 Tabs；一排按钮不自动具有 Tabs 键盘模型              |
| 短文本框           | Input / Text Field                  | `Input`                                                    |
| 多行草稿           | Textarea                            | `ChatComposer` 内嵌，非独立 Textarea API                   |
| 搜索选值           | Combobox / Autocomplete             | 无通用组件                                                 |
| 带标题的独立摘要   | Card / Tile                         | 无通用 Card；文档卡片不定义运行列表样式                    |

## 浮层与反馈

| 描述                   | 术语与行为                           | EasyuseUI 入口或限制                          |
| ---------------------- | ------------------------------------ | --------------------------------------------- |
| hover/focus 时一句解释 | Tooltip，不承载必要操作              | Button 内嵌图标提示，无通用 Tooltip API       |
| 点击后锚定的小面板     | Popover，局部内容或短表单            | 无通用组件                                    |
| 一组对象动作           | Dropdown Menu / Context Menu         | 无通用组件；不能只提供右键入口                |
| 从有限选项选字段值     | Select                               | 示例有原生 select，无通用组件                 |
| 中央有标题的对话框     | Dialog；Modal 另外规定背景阻断与焦点 | `Dialog` 及其实际导出子组件                   |
| 侧边/底部滑出的面板    | Drawer / Sheet / Bottom Sheet        | WorkspaceShell 内嵌，无通用 Drawer/Sheet      |
| 背景遮罩               | Backdrop / Scrim                     | Dialog、WorkspaceShell 内嵌；还需阻止背景交互 |
| 持续的范围提示         | Banner                               | 局部提示内嵌，无通用组件                      |
| 局部错误               | Alert / Inline Error                 | `DataRegion` 内嵌错误区                       |
| 短暂回执               | Toast / Snackbar                     | 无通用组件；关键错误与待批准必须持续可见      |
| 灰色结构占位           | Skeleton                             | DataRegion、Item 内嵌，无通用独立导出         |
| 占位上的扫光           | Shimmer                              | 视觉效果；减少动态效果时可去除                |
| 有可靠总量的进度       | Progress Bar                         | 无通用组件；未知总量使用阶段文字              |

## 信息结构与产品模式

| 任务/外观                | 术语与职责                       | EasyuseUI 入口或限制                           |
| ------------------------ | -------------------------------- | ---------------------------------------------- |
| 一行名称、元数据、状态   | Item / List Row                  | `Item`；业务对象用 `SessionRow` / `AgentRow`   |
| 按固定字段对比记录       | Table                            | 无通用组件；Activity 列对齐不等于 Table API    |
| 类电子表格编辑与选区     | Data Grid                        | 无通用组件；只读表格无需额外网格键盘模型       |
| 有父子关系、展开箭头     | Tree / Tree View                 | `Tree`，默认单选，受控移动与键盘替代           |
| 谁在何时做了什么         | Activity Feed / Timeline         | `ActivityTimeline`；稳定 ID 去重，保留来源顺序 |
| 原始事件和调用链         | Event Log / Trace                | 无独立日志查看器；摘要与诊断分层               |
| 名称—值属性              | Description List / Metadata      | Inspector 内嵌                                 |
| 当前对象详情             | Inspector / Context Panel        | `Inspector` 接收完整受控快照                   |
| 列表选对象，详情跟随     | Master–Detail                    | 行组件 + Inspector；选择不执行运行操作         |
| 导航、主内容、上下文分栏 | Workspace / Split Pane           | `WorkspaceShell`；内嵌停靠、窄屏浮层和 resize  |
| 连续工作流消息           | Conversation / Chat Thread       | `ChatMessage`、`Conversation`、`ChatComposer`  |
| 可展开的工具记录         | Tool Call / Disclosure           | `ToolCall`，独立审批、脱敏及未知结果对账       |
| 相同内容比较样式参数     | Style Workbench / A/B Playground | `StyleWorkbench`，局部预览，不能自动改共享主题 |

## 材质、阴影与层级

| 词汇                               | 说明与边界                                       |
| ---------------------------------- | ------------------------------------------------ |
| Surface / Raised Surface           | 表面底色及相对层级；不意味着必须有阴影           |
| Drop Shadow / Box Shadow           | 外投影；临时浮层可用，普通列表无需逐行添加       |
| Soft / Hard Shadow                 | 阴影边缘软硬，不是两种组件                       |
| Layered / Ambient / Contact Shadow | 多层、环境、接触阴影等画法；共享参数需有明确用途 |
| Inset / Inner Shadow               | 内阴影；不能让默认态误读为 pressed/disabled      |
| Elevation                          | 谁覆盖谁的层级关系；EasyuseUI 无通用 0–5 级 API  |
| Outer / Inner / Colored Glow       | 发光效果；不能替代焦点或状态文字                 |
| Blur / Backdrop Blur               | 自身模糊 / 背景模糊，作用对象不同                |
| Glassmorphism / Neumorphism        | 玻璃拟态 / 新拟态风格；检查边界与文字可读性      |
| Gradient / Noise / Grain           | 渐变 / 噪点 / 颗粒；按明确的品牌/预览任务使用    |

复用模式的浮层阴影使用 `--shadow-floating`；当前没有 `shadow-floating` 或 `elevation-2` Tailwind utility，可按现有代码使用 `shadow-[var(--shadow-floating)]`。独立实现模式在目标 token 系统中定义等价用途，不要求同名。
