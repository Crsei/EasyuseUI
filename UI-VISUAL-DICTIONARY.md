# UI 视觉词典 · UI Visual Dictionary

这份文档回答「这个东西叫什么、长什么样、在项目里对应什么」。适用于 EasyuseUI 和消费它的 Agent Workspace / Coding Runtime 产品。术语是沟通入口，具体使用决策见 [UI-PATTERNS.md](./UI-PATTERNS.md)，状态见 [UI-STATES.md](./UI-STATES.md)。

## 1. 使用方式与实现标记

先按外观找到候选词，再判断它是在展示信息、选择值、执行动作还是导航，最后找对应组件。不同 Design System 对 Badge、Tag、Chip 等名称的划分可能不同；下文是本项目采用的语义约定。

| 标记     | 含义                                                     |
| -------- | -------------------------------------------------------- |
| 已有     | 仓库已有可复用组件，名称以源码、Catalog 和 Registry 为准 |
| 内嵌     | 已在某个组件或工作台中使用，但没有同名独立组件/API       |
| 基础     | 由主题 token、CSS、HTML 语义提供，不一定需要 React 组件  |
| 待实现   | 用来识别和讨论设计；尚不能从 EasyuseUI 导入同名组件      |
| 视觉参考 | 可识别的视觉效果；产品使用前仍要满足设计规范             |

实现映射核对日期：2026-10-08。不能因为一个词出现在本词典里，就认为它已经被实现。项目提供 shadcn Registry 分发，不代表包含所有 shadcn 组件。

[Design-rules.md](./Design-rules.md) 定义原则，[Component-Specification.md](./Component-Specification.md) 定义尺寸和验收契约；本词典补充查找方式。共享值以 [styles/theme.css](./styles/theme.css) 为准，运行状态以 [lib/runtime-status.ts](./lib/runtime-status.ts) 为准，避免在文档里维护另一套常量。

## 2. 从「长什么样」反查

| 你的描述                     | 候选英文名                               | 下一步判断                                         |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------- |
| 两端圆圆的胶囊               | Pill、Badge、Tag、Chip、Pill Button      | Pill 只说形状；能否点击、删除或选择决定语义        |
| 几个胶囊连在一起切换         | Segmented Control、Pill Tabs             | 改一个值用前者，切换关联内容面板用后者             |
| 鼠标放上去出现一句话         | Tooltip                                  | 是短解释，还是包含链接/表单的操作面板？            |
| 点一下冒出一个小浮窗         | Popover、Dropdown Menu、Combobox         | 补充内容、执行动作、还是选择一个值？               |
| 从右边拉出来的面板           | Drawer、Sheet、Inspector                 | Drawer/Sheet 说呈现方式，Inspector 说对象详情职责  |
| 中间弹框，背景不能操作       | Modal Dialog                             | Dialog 是对话框，Modal 是阻断背景交互的模式        |
| 页面上方一条提醒             | Banner、Alert                            | 长期范围提示还是局部问题？                         |
| 角落里短暂出现的提示         | Toast / Snackbar                         | 是否需要持久保留？关键错误不能只放这里             |
| 一堆灰色占位块               | Skeleton                                 | 结构占位；扫过的亮带另叫 Shimmer                   |
| 一条线把内容分开             | Divider / Separator                      | 纯装饰线，还是辅助技术也应识别的分隔？             |
| 左侧有箭头的层级目录         | Tree / Tree View                         | 有父子层级才用 Tree；普通目录用列表导航            |
| 每行有时间、动作、状态       | Activity Feed、Timeline、Event Log       | 时间序列、活动摘要、还是完整原始记录？             |
| 一个面板像浮起来了           | Elevation、Floating Surface、Drop Shadow | 高度关系是 Elevation，阴影只是表达手段之一         |
| 边缘内凹、有压进去的感觉     | Inset / Inner Shadow                     | 说明凹入，还是误把可点击控件做成按下状态？         |
| 背景能透出来且模糊           | Backdrop Blur、Glassmorphism             | 背景模糊是技术，玻璃拟态是视觉风格                 |
| 页面分成列表、正文、右侧详情 | Master–Detail、Split View、Inspector     | 哪个区负责选择，哪个区负责内容，哪个区负责上下文？ |

## 3. Foundations · 基础词汇

| 名称 / 别名             | 中文与外观线索                       | 适用 / 避免                                          | 项目对应                                                     |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| Color / Semantic Color  | 颜色 / 语义颜色                      | 表达信息层级和状态；避免仅靠颜色传达结果             | 基础：`primary`、`info`、`warning`、`destructive`、`success` |
| Surface                 | 背景表面，页面、面板、浮层所处的底色 | 用中性表面分组；避免每层都使用高对比底色             | 基础：`background`、`surface`、`surface-raised`              |
| Typography / Type Scale | 字体与字号层级                       | 区分正文、标题、元信息；避免字段全部同等醒目         | 基础：正文14px、元信息12px、工具页标题20px且不超过24px       |
| Spacing / Grid          | 间距与网格                           | 以4px为间距网格；不要临时拼出每页不同的节奏          | 基础：4、8、12、16、24、32px等规范值                         |
| Radius / Corner Radius  | 圆角半径                             | 表达控件、面板、胶囊形状；避免把所有控件变胶囊       | 基础：`rounded-control`、`rounded-sm/md/lg/xl`               |
| Border / Hairline       | 边框 / 细分隔线                      | 工具列表优先1px分隔；避免嵌套多圈重边框              | 基础：`border-border`、`border-border-hover`                 |
| Shadow                  | 投影效果                             | 给浮层提供边界和悬浮线索；避免每一行都加投影         | 基础：`--shadow-floating`；详见第11节                        |
| Elevation               | 高度层级                             | 说明谁覆盖谁、谁需要优先关注；不能等同于一个阴影参数 | 基础：目前没有通用0–5级 Elevation API                        |
| Density / Compact       | 信息密度 / 紧凑模式                  | 面向工作台扫描效率；触摸目标仍需足够大               | 基础：控件32px，Item32/40/56px，粗指针图标目标至少44px       |
| Design Token            | 语义设计变量                         | 共享颜色、尺寸、圆角、动画；避免散落同义常量         | 基础：唯一主题源 `styles/theme.css`                          |

## 4. Shapes · 形状

| 名称 / 别名       | 中文与外观线索               | 适用 / 避免                                | 项目对应                                                  |
| ----------------- | ---------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Rectangle         | 直角矩形 `┌────┐`            | 布局区域、表格；形状本身不说明可交互性     | 基础：无圆角表面                                          |
| Rounded Rectangle | 圆角矩形 `╭────╮`            | 默认控件、面板；避免无依据增加圆角         | 基础：Button / Input 默认控件圆角6px                      |
| Pill / Capsule    | 胶囊 `(  Label  )`，两端半圆 | 紧凑标签、筛选外观；不要用形状代替组件名称 | 基础：Tailwind `rounded-full`；不是独立组件               |
| Circle            | 圆形 `○`                     | 状态点、头像、圆形按钮；必须另说明按钮语义 | 基础：等宽高配合 `rounded-full`                           |
| Squircle          | 方圆形，介于方形与圆形之间   | 品牌图标等视觉参考；不同于普通圆角矩形     | 视觉参考：没有 Squircle 组件，`rounded-xl` 不保证方圆曲线 |

### 胶囊的语义速查

```text
( Running )          Badge：读状态，不执行动作
( Backend )          Tag：读分类
( TypeScript × )     Removable Chip：移除一个值
( Active ✓ )         Filter Chip：切换筛选条件
( Start agent )      Pill Button：执行动作，采用胶囊外观
( Chat | Activity )  Pill Tabs：切换内容面板
```

| 名称                 | 本项目约定                                | 当前支持                                                              |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| Badge / Status Badge | 只读状态、计数或标识，通常不进入 Tab 顺序 | 已有通用 `Badge`（小圆角/胶囊）；运行态仍由 `RuntimeStatusBadge` 负责 |
| Tag / Label          | 分类、来源、属性等标签                    | 已有只读 `Tag`；可选择或删除的分类值使用 `Chip`                       |
| Chip                 | 紧凑的可操作值，支持选择或移除            | 已有受控 `Chip`，选择与移除为独立兄弟目标，支持 disabled / busy       |
| Avatar Chip          | 头像 + 名称的紧凑值                       | 待实现；不等于 AgentRow                                               |
| Filter Chip          | 一个可开启/关闭的筛选条件                 | 已有 `Chip` 提供受控选择，使用 aria-pressed 表达选中                  |
| Pill Button          | Button 的胶囊外观，不是新的行为类型       | 没有专用 variant；默认 Button 仍遵循6px圆角                           |
| Pill Tabs            | Tabs 的胶囊外观                           | 已有 Tabs；可按业务外观调整，保持键盘模型              |
| Segmented Control    | 一组互斥选项，对应一个设置值或模式        | 已有 Segmented；使用 radio 语义，与 Tabs 区分                                    |

## 5. Components · 基础组件

| 名称 / 别名             | 中文与外观线索               | 适用 / 避免                                             | 项目对应                                               |
| ----------------------- | ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Button / Icon Button    | 文字按钮 / 仅图标按钮        | 执行动作；跳转目的地优先链接；图标按钮必须有可访问名称  | 已有 `Button`，内置图标按钮 hover/focus 提示           |
| Input / Text Field      | 单行输入框                   | 输入短文本；长内容用 Textarea，固定选项用选择控件       | 已有 `Input`                                           |
| Textarea                | 多行输入框                   | 草稿、描述；避免用单行 Input 承载长对话                 | 内嵌：`ChatComposer`；暂无独立 Textarea                |
| Checkbox                | 复选框 `☑`                   | 多选，或独立布尔选择；避免表达立即执行的命令            | 内嵌：StyleWorkbench 使用原生 checkbox；独立组件待实现 |
| Radio Group             | 单选组 `◉ ○ ○`               | 可见的互斥值；避免用它切换页面导航                      | 待实现                                                 |
| Switch / Toggle Switch  | 开关 `●──`                   | 一个有明确开/关含义的设置；说明何时生效                 | 待实现                                                 |
| Toggle Button           | 可按下/选中的按钮            | 持续的开关状态；用 `aria-pressed` 区分状态              | 基础：现有 Button 可传 `aria-pressed`，无独立 Toggle   |
| Select                  | 选择器，展示当前值和展开箭头 | 从固定选项选值；不要放成一串动作菜单                    | 已有 Select；简单表单仍可使用原生 select                |
| Combobox / Autocomplete | 可输入或搜索的选择框         | 选项多、可搜索；避免自创不完整的键盘和读屏行为          | 已有组件、示例与独立安装路径                                                 |
| Card / Tile             | 卡片 / 磁贴，独立内容单元    | 独立摘要或目录预览；Session、Agent、日志不要逐层套 Card | 待实现通用 Card；文档预览中的卡片不等于产品列表规范    |
| Panel / Section         | 面板 / 分区                  | 持续工作区域，用标题、分隔线组织；不必全部有阴影        | 内嵌：WorkspaceShell、Inspector                        |
| Accordion / Disclosure  | 可展开标题与内容 `▸ Details` | 渐进披露次要详情；不要把必须处理的问题默认藏起来        | 内嵌：ToolCall 的展开详情；暂无通用 Accordion          |
| Divider / Separator     | 细分隔线                     | 区分邻接内容；装饰线与有语义的 separator 分开           | 基础：主题边框；暂无独立 Separator                     |

## 6. Navigation · 导航

| 名称 / 别名                    | 中文与外观线索                   | 适用 / 避免                                 | 项目对应                                     |
| ------------------------------ | -------------------------------- | ------------------------------------------- | -------------------------------------------- |
| Sidebar / Side Navigation      | 左侧纵向导航                     | 稳定的产品入口；对象元信息放 Inspector      | 内嵌：`WorkspaceShell`，展开256px / 收起48px |
| Navbar / Navigation Bar        | 顶部或边缘导航条                 | 产品级入口；避免和当前页面工具栏混为一层    | 内嵌：文档站导航；不是可分发通用 Navbar      |
| Breadcrumb                     | 面包屑 `Project / Session / Run` | 层级位置与返回上级；不要代替对象状态        | 待实现                                       |
| Tabs / Tab Panel               | 标签页及其关联内容面板           | 同一上下文内切换内容；跨页面导航用链接      | 已有 Tabs；工作台窄屏切换仍保持原兼容接口      |
| Tree / Tree View               | 层级树 `▸ Project`               | 父子关系、展开/折叠；无层级列表不要强行树化 | 已有 `Tree`，单选、键盘导航、受控移动        |
| Command Palette / Command Menu | 可搜索的命令面板                 | 快速执行或跳转；重要操作仍应有可发现入口    | 待实现                                       |
| Toolbar / Command Bar          | 当前内容附近的一排动作           | 当前页面/对象的操作；少用同权重主按钮       | 内嵌：工作台与组件动作区；暂无通用 Toolbar   |

## 7. Data Display · 数据展示

| 名称 / 别名                 | 中文与外观线索                     | 适用 / 避免                                          | 项目对应                                            |
| --------------------------- | ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| Item / List Row             | 一行标题、元信息和操作             | 高频扫描、选择对象；主目标与尾部动作必须是兄弟目标   | 已有 `Item`、`SessionRow`、`AgentRow`               |
| Table                       | 表头 + 对齐的行列                  | 比较固定字段；避免每一格都变嵌套 Card                | 待实现通用 Table；Activity 有列对齐布局             |
| Data Grid                   | 支持选区、编辑等复杂操作的数据网格 | 类电子表格工作；普通只读表不要引入网格键盘模型       | 待实现                                              |
| Timeline                    | 时间线，通常沿时间轴排列           | 先后与过程；必须保留来源次序，不凭 UI 猜顺序         | 已有 `ActivityTimeline`                             |
| Activity Feed               | 活动流，谁在何时做了什么           | 人可读活动摘要；原始完整诊断记录另看日志             | 已有 `ActivityTimeline`，按 eventId 去重            |
| Event Log / Trace           | 事件日志 / 调用追踪                | 诊断细节、关联ID、原始证据；不要让原始 JSON 取代摘要 | ToolCall / Inspector 可承载详情；暂无独立日志查看器 |
| Description List / Metadata | 名称—值列表                        | 当前对象属性；未知值用「—」，不要补零                | 内嵌：`Inspector` 使用描述列表                      |
| Avatar / Entity Icon        | 头像 / 对象图标                    | 识别身份和类型；紫色 AI 身份不表示成功/失败          | 内嵌：AgentRow、ChatMessage；暂无独立 Avatar        |

## 8. Overlays · 浮层

| 名称 / 别名                   | 中文与外观线索                    | 适用 / 避免                                            | 项目对应                                                         |
| ----------------------------- | --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| Tooltip                       | 短解释，无需进入其中操作          | 图标含义、补充解释；不承载表单、批准或唯一错误信息     | 内嵌：Button 图标提示；非通用 Tooltip API                        |
| Popover                       | 锚定触发器的小面板                | 短表单或局部补充内容；避免承载长工作流                 | 已有组件、示例与独立安装路径                                                           |
| Dropdown Menu / Menu          | 按触发器展开的动作菜单            | 当前对象命令；选择一个字段值用 Select/Combobox         | 已有组件、示例与独立安装路径                                                           |
| Context Menu                  | 右键/上下文动作菜单               | 当前对象快捷动作；必须另有键盘、触摸可达入口           | 待实现                                                           |
| Dialog                        | 对话框，独立标题、内容、动作      | 专注任务、确认；普通元信息无需每次弹框                 | 已有 `Dialog`                                                    |
| Modal / Modal Dialog          | 模态 / 模态对话框，背景暂不可操作 | 必须处理的聚焦流程；不是独立形状或所有 Dialog 的同义词 | 已有 Dialog 及 WorkspaceShell 移动浮层采用模态交互               |
| Drawer / Sheet / Bottom Sheet | 侧边/底部滑出的面板               | 窄屏导航、上下文详情；名称边界随设计系统而异           | 内嵌：WorkspaceShell 窄屏侧栏与 Inspector；暂无通用 Drawer/Sheet |
| Backdrop / Scrim              | 浮层后的遮罩                      | 表达模态范围、隔开背景；不能只变暗而仍让焦点跑到背景   | 内嵌：Dialog、WorkspaceShell                                     |

Dialog 描述内容容器，Modal 描述交互模式，Drawer/Sheet 描述空间呈现方式，Inspector 描述内容职责。同一个 Inspector 可以在桌面停靠，在窄屏以模态侧面板打开。

## 9. Feedback · 反馈

| 名称 / 别名                 | 中文与外观线索           | 适用 / 避免                                          | 项目对应                                                |
| --------------------------- | ------------------------ | ---------------------------------------------------- | ------------------------------------------------------- |
| Alert / Inline Error        | 局部提示或错误区         | 需要用户理解/处理的问题；必须说明下一步              | 内嵌：`DataRegion` 错误区                               |
| Banner                      | 页面/范围级提示横条      | 离线、过期、权限等持续影响；不要所有普通状态都占横条 | 内嵌：部分数据和刷新提示；暂无通用 Banner               |
| Toast / Snackbar            | 短暂浮现的反馈条         | 非关键操作回执；关键失败、批准请求需持续可见         | 待实现                                                  |
| Progress / Progress Bar     | 进度条                   | 有可靠总量才显示百分比；未知总量说明阶段             | 待实现通用 Progress                                     |
| Spinner / Loading Indicator | 旋转或静态加载图标       | 表达短等待；长等待补阶段、耗时与可用动作             | 内嵌：Button `loading`；不要用 Spinner 代表所有 runtime |
| Skeleton                    | 与最终布局相似的灰块占位 | 首次无内容加载；刷新不要抹掉已有内容                 | 内嵌：DataRegion 三行占位、Item 加载态                  |
| Shimmer                     | 占位块上扫过的亮带       | 可选加载动效；减少动态效果时移除                     | 视觉参考：不是单独数据状态，无通用 Shimmer              |
| Empty State                 | 无内容时的解释与操作     | 区分未创建、无筛选结果、无选择；不能把加载失败写成空 | 已有 `DataRegion` 的 empty 展示                         |

## 10. Effects · 视觉效果

| 名称 / 别名                            | 中文与外观线索                    | 适用 / 避免                                    | 项目对应                               |
| -------------------------------------- | --------------------------------- | ---------------------------------------------- | -------------------------------------- |
| Drop Shadow / Box Shadow               | 外部投影，边缘往外扩              | 提示浮层覆盖关系；不作为列表行常态装饰         | 基础：CSS `box-shadow`，共享浮层 token |
| Soft Shadow / Hard Shadow              | 柔和阴影 / 硬阴影，模糊边缘不同   | 柔和用于轻浮层；硬阴影属于风格选择             | 视觉参考：不是两种组件                 |
| Layered Shadow                         | 多层投影叠加                      | 分别表达贴近与扩散阴影；参数应沉淀进 token     | 视觉参考：当前无专用分层 token         |
| Ambient Shadow / Contact Shadow        | 大范围环境阴影 / 贴近边缘接触阴影 | 描述不同阴影层的作用；不要求每个面板都组合     | 视觉参考                               |
| Inset / Inner Shadow                   | 内阴影，阴影向内部扩散            | 表达凹入；不能混淆默认、按下、禁用态           | 视觉参考：CSS `box-shadow: inset …`    |
| Outer Glow / Inner Glow / Colored Glow | 外发光 / 内发光 / 彩色光晕        | 特定品牌或独立预览；避免让工作台处处发光       | 视觉参考：不能替代焦点指示器或状态文字 |
| Blur                                   | 元素自身模糊                      | 特殊视觉处理；不要模糊必须阅读的信息           | 视觉参考：CSS `filter: blur(…)`        |
| Backdrop Blur                          | 背后内容模糊                      | 浮层或遮罩效果；需要不依赖模糊的清晰边界与文字 | 内嵌：Dialog 遮罩；不是 Blur 的同义词  |
| Gradient                               | 渐变                              | 文档、品牌展示可用；工具表面保持中性           | 视觉参考：不新增渐变运行态             |
| Glassmorphism                          | 玻璃拟态：半透明 + 背景模糊等     | 独立视觉预览；不作为紧凑工作台默认材质         | 视觉参考                               |
| Neumorphism                            | 新拟态：同色表面、内外阴影塑形    | 风格探索；需特别检查边界、对比度、按下态       | 视觉参考                               |
| Noise / Grain                          | 噪点 / 颗粒纹理                   | 独立品牌或预览视觉；避免覆盖高密度内容         | 视觉参考                               |

## 11. 阴影与高度怎么表达

Shadow 是「如何画阴影」，Elevation 是「元素在层级中如何相互覆盖」。高度还可以由边框、表面颜色、遮罩和位置表达；z-index 负责叠放顺序，不会自动产生合理的视觉高度。不同设计系统的高度级别不可直接互换。

本项目的常驻列表和分栏优先使用中性表面与细分隔线；需要浮起的局部面板使用共享 `--shadow-floating`。当前并没有 `elevation-2` 或 `shadow-floating` Tailwind utility，也没有完整的0–5级阴影体系。

```css
/* 消费共享主题，不在组件里复制浅色/深色阴影数值。 */
.floating-surface {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  box-shadow: var(--shadow-floating);
}
```

对应 Tailwind 写法为 `bg-surface border border-border rounded-control shadow-[var(--shadow-floating)]`。现有个别文档预览样式不代表新的产品默认规范。

讨论阴影时说明：对象、使用场景、边缘软硬、扩散范围、方向、是否分层。例如「右侧临时浮层使用柔和投影，常驻 Inspector 使用分隔线」。要新增共享阴影等级，先明确层级用途，再同时更新主题与组件契约，不能先在页面上散落参数。

## 12. Patterns · 组合模式

| 名称                               | 中文与外观线索                       | 项目对应与约束                                                                         |
| ---------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Master–Detail                      | 主列表选择对象，详情随选择变化       | SessionRow / AgentRow + Inspector；选择与执行动作分开                                  |
| Split View / Split Pane            | 并列工作区或可调整分栏               | 已有 WorkspaceShell；分隔条支持键盘调整                                                |
| Inspector / Context Panel          | 当前对象的上下文详情                 | 已有 Inspector；接收完整受控快照                                                       |
| Progressive Disclosure             | 先摘要，按需展开细节                 | ToolCall 展开、Inspector 元信息；关键错误不得隐藏                                      |
| Conversation / Chat Thread         | 连续消息流                           | 已有 Conversation / ChatMessage / ChatComposer；工具执行独立 ToolCall                  |
| Activity Feed                      | 活动摘要流                           | 已有 ActivityTimeline；不与原始 Trace 混为一谈                                         |
| Workspace / Workbench              | 导航、主内容、上下文详情构成的工作台 | 已有 WorkspaceShell，入口 `/workspace/`；示例是本地 fixture                            |
| Style Workbench / Style Playground | 保持内容相同的 A/B 样式对比工具      | 已有 StyleWorkbench，入口 `/style-workbench/`；操作见 [使用指南](./STYLE-WORKBENCH.md) |
| Command Bar                        | 当前工作上下文的动作集合             | 内嵌动作区；通用可搜索命令系统待实现                                                   |

## 13. 给 Agent 描述 UI 的模板

```text
对象与目的：Session 列表中的运行状态，只读。
术语与形状：Status Badge；复用 RuntimeStatusBadge，保持项目默认外观。
信息层级：标题在前，状态紧随其后，模型/耗时为次级信息。
状态：数据刷新失败保留旧行；未知 runtime 明确显示原始值。
交互：整行负责选择，尾部更多操作是独立兄弟目标。
约束：紧凑密度、主题 token、键盘可达、触摸目标至少44px。
验收：深浅主题可读；选择与焦点可区分；没有嵌套按钮。
```

如果只想改变形状，可以说「为筛选值设计可选择 Chip，采用胶囊外观」，而不只说「加一个胶囊」。如果想讨论视觉效果，可以说「临时浮层使用共享浮层阴影」，不必凭空指定尚未定义的高度编号。

## 14. 外部查阅入口

这些资源用于补充词汇和案例，不覆盖项目契约；不在这里记录会变化的收录数量、价格或可访问范围。

| 入口                                                | 用途                           | 使用方式                                               |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------------------ |
| [The Component Gallery](https://component.gallery/) | 按组件名称查不同设计系统的实现 | 找到英文候选词，再比较各系统语义                       |
| [Refero](https://refero.design/)                    | 产品界面参考入口               | 对照真实业务的信息层级与流程；具体访问能力以网站为准   |
| [Mobbin](https://mobbin.com/)                       | 已上线产品的界面与流程参考     | 看完整上下文，避免只复制截图的装饰                     |
| [Smooth Shadows](https://shadows.brumm.af/)         | 阴影调参参考入口               | 本次未能验证站点可访问性；最终参数仍需收敛到项目 token |

在线查阅入口为 `/dictionary/`，支持九类浏览、中文/英文/别名搜索、实现情况筛选和选中词条详情。已有组件提供实际演示、用法与文档入口；其他词条提供外观示意并保留实现标记。组件完整文档仍在 `/components/` 与 `/docs/<slug>/`。页面词条元数据在 `lib/visual-dictionary.ts`，已实现组件的代码、源码路径和演示从 Catalog 复用。

需要理解修改参数后的差距时，打开 `/style-workbench/`。基础、形状和效果词条详情也提供「调整参数并对比」入口。工作台把相同内容放在 A/B 两个区域：A 是当前主题与样例探针基准，B 是局部实验；尺寸与间距、阴影、颜色与材质、字体四组共24项参数，数值支持滑块和数值输入，颜色和开关使用对应控件。差异表列出 A、B 和差值。柔和浮层、内凹表面、胶囊控件、紧凑平面可作为实验起点。B 可固定为新的 A，或重置到当前基准；参数与局部 CSS 可以复制。实验值不自动成为项目 token，刷新页面后恢复项目默认。参数范围与操作说明见 [STYLE-WORKBENCH.md](./STYLE-WORKBENCH.md)，组件用法、实现与安装入口在 `/docs/style-workbench/`。

## 15. Canvas 词汇与实现

| 名称                                      | 中文                         | 当前实现                                                                                                              |
| ----------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Canvas / Workflow Canvas                  | 流程画布                     | WorkflowCanvas；完整编辑入口 CanvasWorkspace                                                                          |
| Node / Port / Edge                        | 节点 / 端口 / 连线           | CanvasNode / CanvasPort / CanvasEdge，引擎适配器                                                                      |
| Node Palette / Quick Add                  | 节点目录 / 快速新增          | NodePalette；侧栏和新增对话框共享目录                                                                                 |
| Node Inspector                            | 节点配置面板                 | NodeInspector，复用 Inspector                                                                                         |
| Variable Picker                           | 变量选择器                   | VariablePicker，复用单选 Tree                                                                                         |
| Frame / Group                             | 视觉分组                     | CanvasFrame；命令整体移动、删除时解组                                                                                 |
| Sticky Note                               | 流程便笺                     | CanvasNote；不等于 Comment Thread                                                                                     |
| Execution Panel / Subflow / Service Panel | 执行调试 / 子流程 / 服务面板 | CanvasExecutionPanel / CanvasProjectWorkspace / CanvasServicePanel 已分发；Presence为受控临时数据，不导出独立光标图元 |

入口 `/workspace/canvas/`，配置与边界见 [Canvas 指南](./CANVAS.md)。在线词典根据 Catalog 标记上述组件为已有；词汇可见不代表存在执行服务。

CanvasConfigEditor 已分发，内部包含 ConditionBuilder、扁平对象 SchemaBuilder、KeyValueEditor 和表达式/代码/JSON文本编辑路径；这些内部名称不代表额外独立导出。真实模型、凭据、保存、协作和发布服务均由消费方提供，本地故障样例不证明业务接入。
