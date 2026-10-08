# Component Specification

Version 1.4 · 2026-10-08 · EasyuseUI / Agent Workspace

本文件把 [Design-rules.md](./Design-rules.md) 的原则收敛为可实现、可验收的尺寸与状态契约。适用于 Button、Item、Tree、Activity、Session、Agent、Inspector、Chat Message、Tool Call、Badge / Tag / Chip，以及 StyleWorkbench、Canvas 工作台与图元。除显式注明外，所有数字均为 CSS px，尺寸包含边框，默认 `box-sizing: border-box`，密度为 Compact。

Design Rules 规定方向，本文规定组件契约，`styles/theme.css` 是运行时 token 的唯一来源。三者不一致时先修订契约及 token，再修改实现，不在页面内临时发明另一套尺寸。外部用户明确要求的例外应在实现中说明。本文规定目标行为；具体初始化范围和已实现清单见 README，文档中的状态不代表已连接真实 Agent 服务。

设计规则第34节提供 Activity 的字段提纲；本文的 Activity 尺寸、状态和交互细则为补充约定。

## 1. Foundation

### 1.1 尺寸、字体与层级

| 项目          | 固定契约                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| 间距          | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64；6 仅用于图标与文本光学校正        |
| 正文          | 14 / 20，400；长消息正文 14 / 24                                                 |
| 次级 UI       | 13 / 20，400；Button 标签 13 / 20，500                                           |
| 元数据 / 状态 | 12 / 16，400；数值采用 tabular-nums                                              |
| Section title | 16 / 24，500                                                                     |
| Page title    | 20 / 28，600；工具页最高 24 / 32                                                 |
| 等宽文字      | 12 / 20，系统等宽字体；日志、工具参数、ID 使用等宽字体                           |
| 字重          | 400 / 500 / 600；不增加额外字号或加粗层级                                        |
| 图标          | 默认 16；区块标题 18；空状态 20；Lucide，stroke-width 1.75                       |
| 圆角          | tiny 4；control 6；popover 8；panel 12；floating 16                              |
| 边框          | 1 solid `--border`；hover 使用 `--border-hover`；selected indicator 2            |
| 键盘焦点      | 2 solid `--ring`，offset 2；紧凑列表允许 inset 2，不能被父级裁切                 |
| 阴影          | 普通 Item / 列表 / 主体面板无阴影；只有浮层使用 `--shadow-floating`              |
| 触摸命中      | `pointer: coarse` 下交互控件、行、图标按钮最小命中区域 44 × 44；区域不能互相覆盖 |

字号写法为 `font-size / line-height`。单行行高不随标题长度增长；标题单行省略，完整值通过详情或可键盘访问的 tooltip 提供。说明与正文允许换行，不以固定高度截断业务信息。

### 1.2 颜色与 token

| 语义           | Light           | Dark                  | 用途                               |
| -------------- | --------------- | --------------------- | ---------------------------------- |
| background     | #FAFAFA         | #0A0A0A               | 工作台背景                         |
| surface        | #FFFFFF         | #0F0F10               | 主内容表面                         |
| surface-hover  | #F4F4F5         | #121213               | 真正交互对象的 hover               |
| surface-raised | #F0F0F2         | #151516               | Toolbar、分区、浮层底色            |
| border         | rgba(0,0,0,.10) | rgba(255,255,255,.08) | Hairline                           |
| border-hover   | rgba(0,0,0,.18) | rgba(255,255,255,.14) | 交互边界                           |
| foreground     | #18181B         | rgba(255,255,255,.92) | 标题与正文                         |
| text-secondary | #52525B         | rgba(255,255,255,.62) | 次级内容                           |
| text-muted     | #686872         | rgba(255,255,255,.48) | 时间、辅助值；不可用于唯一关键状态 |
| primary / ring | #4F46E5         | #A5B4FC               | 主操作、选中、焦点                 |
| info           | #1D4ED8         | #93C5FD               | 启动 / 执行 / 信息                 |
| success        | #15803D         | #86EFAC               | 完成                               |
| warning        | #92400E         | #FCD34D               | 等待 / 暂停                        |
| destructive    | #B91C1C         | #FCA5A5               | 失败 / 破坏性操作                  |
| agent          | #7E22CE         | #D8B4FE               | 思考、可选 AI 身份                 |

`--muted` 兼容 surface-raised；`--muted-foreground` 兼容 text-secondary。状态用 `--status-neutral / queued / info / thinking / waiting / success / error` 语义别名，禁止各组件自行映射颜色。选中底色 `--selection` 为 primary 的 8% 混合，pressed 使用 `--surface-pressed`，禁止用整行红色表达一次工具失败。

正文和标签需保持可读对比；状态必须同时提供文字或图标语义，不能只提供彩色圆点。禁用态与辅助装饰可以降低对比，但关键错误信息不可随整行一起降低透明度。

### 1.3 Motion 与密度

| 变化    |  时长 | 曲线与限制                               |
| ------- | ----: | ---------------------------------------- |
| Hover   | 150ms | ease-out，仅 background / border / color |
| Button  | 180ms | ease-out，不缩放、不弹跳                 |
| Popover | 200ms | ease-out                                 |
| Panel   | 220ms | ease-out                                 |
| Drawer  | 250ms | ease-out                                 |
| Layout  | 300ms | ease-out，拖拽调整尺寸时不加 transition  |

所有动画可中断。系统减少动态效果时关闭旋转、闪烁、平移和骨架扫光，保留静态状态说明。运行中展示当前阶段与 elapsed；只有实际可计算的进度才显示百分比。未知总量使用阶段文字，不伪造进度。

### 1.4 共享状态轴与优先级

组件状态分为三个独立轴，不能用同一个枚举把它们互相覆盖：

| 轴          | 值                                                                                                | 规则                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Interaction | default / hover / pressed / focused / selected / disabled / loading / error                       | focused 与 selected 可同时存在；loading 表示操作忙碌；error 是与控件关联的错误                                         |
| Data        | loading / empty / partial / error / success                                                       | loading=首次无数据；partial=已有可用内容但仍缺字段/分页/来源；success=当前请求的数据已完整就绪，不等于 Agent completed |
| Runtime     | idle / queued / starting / running / thinking / waiting / paused / completed / failed / cancelled | 使用下一节的统一字典，独立于请求是否成功和当前选中对象                                                                 |

Interaction 优先级：disabled 阻止操作；loading 阻止相同操作再次提交；error 保留可见文字与边界；selected 持续存在；pressed / hover 仅在可交互且可用时叠加；focused 始终有自己的 ring。普通 Button 没有选中语义时 selected=N/A；静态 Item 的 hover / pressed / selected=N/A；可拖拽 Tree 没有移动权限时 dragging=N/A。N/A 必须来自语义或权限，不是漏实现。

数据已经存在时刷新不得清空内容或替换为整屏 Skeleton。保留旧内容并显示「更新中」；刷新失败标为旧数据、保留最后更新时间与重试操作。无权限和业务上的空数据分开表达。

| Runtime   | 中文   | Token           | 视觉 / 操作契约                                                |
| --------- | ------ | --------------- | -------------------------------------------------------------- |
| idle      | 待命   | status-neutral  | 静态轮廓图标；可用操作由权限与回调决定                         |
| queued    | 排队中 | status-queued   | 队列图标；有真实队列位置才显示位置                             |
| starting  | 启动中 | status-info     | 阶段文字 + elapsed；不等同 running                             |
| running   | 执行中 | status-info     | 当前阶段 + elapsed；有实际 progress 才显示进度                 |
| thinking  | 思考中 | status-thinking | AI 图标与文字；不伪造思维链内容                                |
| waiting   | 等待中 | status-waiting  | 显示原因，例如等待输入 / 权限 / 工具；仅在有回调时给出对应操作 |
| paused    | 已暂停 | status-waiting  | 显示暂停原因；有 resume 回调才出现继续                         |
| completed | 已完成 | status-success  | Check 图标；只有 runtime 完成事件才能进入此状态                |
| failed    | 失败   | status-error    | 错误说明 + 详情；允许且可安全重试时展示重试                    |
| cancelled | 已取消 | status-neutral  | 停止图标；保留已有输出、耗时与取消原因                         |

UI 不用定时器把真实 running 改成 completed。取消请求发出后，在原 runtime 状态旁显示「正在取消」，收到确认才标 cancelled。未知状态保留原值并显示「未知状态」，禁止落成绿色或 idle。不得静默重试有外部副作用的 Tool Call。

### 1.5 通用数据、错误与可访问性

| 数据态  | 布局与交互                                                                             |
| ------- | -------------------------------------------------------------------------------------- |
| loading | 使用最终结构同尺寸的 3 行 Skeleton；容器 aria-busy=true；不可伪造行可点击              |
| empty   | 20 图标、14/20 标题、13/20 解释、1 个明确下一步；区域 padding 24；最小高度 160         |
| partial | 保留内容；缺失标「—」并解释来源；分页有「加载更多」或真实游标进度，不宣称已全部加载    |
| error   | 首次失败显示区域错误；已有内容时内联错误条，保留内容；错误条 min-height 40，padding 12 |
| success | 完整内容；仅必要的保存反馈使用 role=status，不额外给整个列表加成功色                   |

错误类别必须区分 validation / request / runtime / agent / permission / network。每条错误提供「发生了什么、已知原因或未知原因、可执行动作」，不展示未脱敏凭据。aria-describedby 关联说明；字段校验用 aria-invalid；需要立即注意的错误使用 role=alert，常规阶段变化使用 polite status。

列表用 list / listitem 或 table 语义；只有实现完整树键盘模型后才能使用 tree / treeitem；展开按钮 aria-expanded + aria-controls；选择用 aria-selected（仅适用角色）或切换按钮 aria-pressed。禁止在一个 button 内嵌另一个按钮；行主操作和尾部操作必须是相邻独立目标。

## 2. Button

### 2.1 尺寸与层级

| Size    | 高度 | 最小宽度 | 水平 padding | 字体       | 图标 / gap |
| ------- | ---: | -------: | -----------: | ---------- | ---------- |
| sm      |   28 |       56 |            8 | 12/16，500 | 16 / 8     |
| default |   32 |       64 |           12 | 13/20，500 | 16 / 8     |
| lg      |   36 |       72 |           16 | 14/20，500 | 16 / 8     |
| icon-sm |   28 |       28 |            0 | 无可见文字 | 16         |
| icon    |   32 |       32 |            0 | 无可见文字 | 16         |
| icon-lg |   36 |       36 |            0 | 无可见文字 | 18         |

所有 Button radius=6，边框=1；`pointer: coarse` 的实际高度及 icon 宽度最小 44，文本按钮最小宽度仍至少 64。组件布局必须为触摸命中面积留出真实空间，不通过负 margin 或重叠伪元素扩展。

层级仅 Primary / Secondary / Ghost / Destructive；Icon 是尺寸和内容模式，继承上述层级。API 允许旧 `default → primary`、`outline → secondary` 兼容别名。每个操作区域最多 1 个 Primary；更多操作进入菜单。

### 2.2 状态

| 状态     | 视觉与行为                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| default  | Primary=primary 实底；Secondary=surface + border；Ghost=透明；Destructive=destructive 实底                                    |
| hover    | 仅可用按钮变化底色/边界；Ghost 使用 surface-hover；不改变尺寸                                                                 |
| pressed  | surface-pressed 或实底混合 12% 黑；保持位置、不 scale；按键松开恢复                                                           |
| focused  | focus-visible 2 ring + offset 2；与 selected 独立                                                                             |
| selected | 仅 toggle 按钮；aria-pressed=true、selection 底色与 primary 边界；普通提交按钮 N/A                                            |
| disabled | disabled=true、opacity=.45，不接收点击、无 hover；禁用原因由附近可访问文字解释                                                |
| loading  | disabled + aria-busy=true；保留可访问标签及文字，16 指示图标；禁止重复提交；调用方保持标签或指定 min-width 以避免动态文案跳宽 |
| error    | 使用 aria-invalid=true 与 destructive 边界；旁边关联错误说明；不自动把按钮改成 Destructive 业务层级                           |

Icon Button 必须有 accessible label、tooltip、focus、disabled；tooltip 同时可通过 hover 和 focus 触发，移动端操作名能从可访问标签或菜单文字获知。Enter / Space 触发；render 成链接时遵守链接语义，不以 disabled 属性假装禁用导航。

## 3. Item

### 3.1 几何与槽位

| 项目            |     Compact 单行 | Default 单行 |                       双行 |
| --------------- | ---------------: | -----------: | -------------------------: |
| min-height      |               32 |           40 |                         56 |
| padding x / y   |            8 / 4 |       12 / 8 |                     12 / 8 |
| leading slot    |               16 |           20 |                         24 |
| icon            |               16 |           16 |                         16 |
| 内容 gap        |                8 |            8 |                          8 |
| title           |            13/20 |        14/20 |                      14/20 |
| metadata        | 不在同列挤第二行 |   同行 12/16 | 第二行 12/16，title 间距 4 |
| trailing action |               28 |           32 |                         32 |

Item 是平铺结构；无阴影，默认无外包 Card；radius=4，仅分组边界使用 divider。title 区域 `min-width:0; flex:1`，metadata 与操作不得挤出容器。状态最多 2 个 Badge，最多 1 个可见尾部主操作，其余进入更多菜单。选中指示线绝对定位在左侧，占 2 宽，不挤动内容。

### 3.2 状态

default 无底色；交互 hover=surface-hover；pressed=surface-pressed；selected=selection + 2 accent；focused=inset ring 2；disabled 禁止选择/点击但保留原运行状态；loading 保留槽位 Skeleton；error 使用尾部错误状态 + 可展开说明。静态 Item 不增加 hover、cursor:pointer 或 tabIndex。

可点击行用真实 button / link 作为主操作，有尾部按钮时用外层容器加相邻按钮。键盘焦点不能依赖鼠标 hover 才出现尾部操作。危险操作始终在有标签的菜单或确认流程中。

## 4. Tree

### 4.1 几何与结构

| 项目         | 契约                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| Node height  | 32；触摸最小 44；有第二行元数据的业务节点使用 Item 双行 56，不挤入普通树行    |
| 左右 padding | 8                                                                             |
| 每级 indent  | 16；root=0；行内容起点为 8 + depth×16                                         |
| Chevron slot | 16，leaf 保留占位；chevron 图标 12、实际点击目标 28；触摸扩至 44 并调整行布局 |
| Entity icon  | 16；chevron 与 icon 间距 4；icon 与 title 间距 8                              |
| 字体         | title 13/20；metadata / status 12/16                                          |
| 尾部         | status max-width 88；action 28；标签与状态之间最小 gap 8                      |
| 连接线       | 可选 1 border，不能与 selected indicator 混淆                                 |
| 默认关系     | Idea → Session → Run；未归类 Session 在 Inbox，不隐藏父子关系                 |

### 4.2 状态与键盘

expanded=chevron 向下、aria-expanded=true；collapsed=向右且卸载/隐藏后代；leaf 不设置 aria-expanded。hover / pressed / focused / selected / disabled 遵循 Item；loading children 使用同级 3 行 skeleton 并保持父节点展开；empty children 显示「暂无子项」；partial children 在末尾放同级加载更多；error children 保留父节点及重试入口。

dragging：来源 opacity=.45；合法 inside 目标=selection + inset border；before / after 目标=2 info 插入线；非法目标不高亮且可解释原因；Esc 取消，松手后由业务确认结果。没有移动能力时不渲染拖拽手柄。拖拽必须有键盘可访问的「移动到」替代操作。

tree 只保留一个 roving tab stop。↑↓ 到相邻可见节点；→ 展开或进入首子节点；← 折叠或到父节点；Home / End 到首末可见节点；Enter 激活主操作；Space 在支持选择时切换；输入文字进行前缀定位。多选仅在显式启用时支持 Shift 范围、Ctrl/⌘ 增减；默认单选。折叠包含焦点的分支后，焦点回父节点。

## 5. Activity

### 5.1 几何与内容

Activity 是 Runtime Timeline，使用平铺 Item / table，不使用 Card Grid。default row min-height=56，compact=40；padding x=12 / y=8；event icon=16；timeline line=1，圆点=6（仅装饰并有文字状态）；expanded body padding=12，详情 max-height=320、内部滚动、radius=6。

宽容器（≥800）列宽：Time 64 / Agent 96 / Action minmax(160,1fr) / Status 88 / Duration 64 / Tokens 64 / Action 32，列 gap=8。小于 800 时 Agent、target、duration、tokens 下移到第二行；小于 480 时显示 Time + Action + Status，完整字段在展开详情，禁止制造页面横向滚动。

时间用 12/16 等宽；主动作 14/20；target / metadata 12/16。时间必须能查看完整日期与时区；duration、tokens 未收到时为「—」，0 只代表实际的零。不可只显示一条「Agent 有新消息」替代事件结构。

### 5.2 状态

default / hover / pressed / focused / selected / disabled 使用 Item 契约；只有可展开、可选中或可跳转的事件才 hover。expanded 显示参数、结果摘要或相关文件；collapsed 保留 action / target / status / time。running / thinking / waiting 等使用统一 Runtime 字典；failed 只标当前事件错误，不把所有 Timeline 变红。

loading=3 行最终布局骨架；empty 解释当前筛选范围没有事件并可清除筛选；partial 标记已加载范围与加载更多；error 保留已有事件与重试；success 正常时间线。只有用户距底部 ≤64 时跟随新事件；否则显示「N 条新事件」，点击后跳到底部，禁止抢走用户正在阅读的位置。事件按稳定 eventId 去重，排序使用来源顺序/时间，不按渲染时间重排。

## 6. Session

### 6.1 几何与信息

默认采用 Item 双行 56，compact 单行 40；padding 12×8；session icon=16、leading slot=24；title 14/20、500；第二行 12/16，gap=4。左侧 selected indicator=2；status slot=88；elapsed=64；trailing action=32；区块之间 gap=8。长标题单行省略，ID / model / agent 放元数据或 Inspector，不做独立 Badge 堆叠。

必要字段：稳定 sessionId、title、runtime status、updatedAt；可选 agent / model / project / latest run / duration / token usage。缺失字段显示「—」；未命名使用「未命名 Session」，不能以空字符串或假 ID 替代。

### 6.2 状态与操作

可选择 Session 支持 default / hover / pressed / focused / selected / disabled；selected 与运行状态同时存在。loading / empty / partial / error / success 遵循共享数据态。空列表说明尚未创建 Session，提供创建操作（有能力时）；筛选后为空提供清除筛选，不误导为尚未创建。

十种 Runtime 状态全部支持。starting / running / thinking 展示阶段和 elapsed；waiting 展示原因与输入/授权入口；paused 展示继续（有能力时）；failed 展示详情与受控重试；completed / cancelled 保留历史信息。用户点击 Session 仅选择或导航，不隐式启动、恢复或取消任务。菜单中的重命名 / 归档 / 删除与 runtime 操作分开；所有真实写入由调用方管理。

## 7. Agent

### 7.1 几何与信息

默认平铺双行 min-height=56，compact=40；padding 12×8；identity slot=24×24、radius=6、内图标16；title 14/20、500；type / model / capability 12/16，gap=4；runtime slot=88；load / active sessions slot=64；action=32；各区 gap=8。普通 Agent 列表无 Card；独立 Agent Summary 才允许 panel radius=12。

必要字段：稳定 agentId、displayName、runtime status；可选 provider / model / currentStage / elapsed / activeSessionCount。AI 紫色身份图标不能覆盖 Running 蓝色、Waiting 琥珀或 Failed 红色状态。未连接模型时明确显示「未配置模型」，不伪装为健康运行。

### 7.2 状态与操作

交互与数据态同 Item / Session。十种 Runtime 状态全部支持；idle 不等于 offline；网络离线是连接层错误，保留最后已知 runtime 并显示更新时间。多个 session 的汇总状态必须标「汇总」，不能伪装成具体一次 Run。

start / pause / resume / cancel / configure / inspect 的显示以显式能力与回调为准，禁用操作附理由。Running 的主操作只能是当前可执行的一个动作，不能同时放多个 Primary。删除配置不等于取消已运行任务；UI 需明确说明实际业务操作。

## 8. Inspector

### 8.1 几何与响应式

| 项目           | 契约                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| Desktop dock   | 容器 ≥1280；默认宽 320，min 300，max 360；右侧 border-left=1；不设阴影          |
| Tablet overlay | 768–1279；宽 320，最大可用宽减 32；位于右侧，带 backdrop 与 floating shadow     |
| Mobile drawer  | <768；宽 min(360, viewport−32)，右侧滑入；header、action 命中最小 44            |
| Collapsed      | 面板从布局移除；Toolbar 保留一个「打开 Inspector」按钮；不能留下空白 320 列     |
| Resize handle  | 可见线 1；命中宽 8；触摸时 16；不得覆盖相邻内容控件                             |
| Header         | min-height 48；padding x=16 / y=8；title 14/20、500；close action=32            |
| Sections       | padding=16；section gap=24；section title 13/20、500；内容 gap=12               |
| Metadata row   | min-height 32；label col=96；value minmax(0,1fr)，12/16；长 ID 可复制并换行     |
| Footer         | min-height 56；padding=12；1 Primary + 最多 1 Secondary；触摸允许高度随控件增长 |
| Scroll         | header / footer 固定；body 独立 overflow-y:auto；正文不得滑入操作区下面         |

桌面 Shell：global header=48，sidebar=256 / collapsed=48，main min-width=0，bottom panel default=240 / min=200 / max=400；Main 自适应。Page Header min-height=56，Toolbar=40。容器缩小时先收起 Inspector，再折叠 Sidebar，不能用整页缩放维持三栏。

### 8.2 状态与行为

open / collapsed / resizing / overlay / drawer；对象状态为 no-selection / loading / partial / ready / error。no-selection 解释「选择对象以查看详情」；loading 保留标题位置与字段 Skeleton；partial 保留可用 metadata；error 区分权限、网络、对象不存在；切换对象后丢弃旧请求的迟到响应，不展示 A 的标题配 B 的字段。

Resize 使用 pointer capture，尺寸 clamp 在 300–360；键盘可聚焦 separator，aria-orientation=vertical、aria-valuemin/max/now；←→ 每次 8，Home=300、End=360。拖动中不加动画。关闭后焦点回打开它的按钮；overlay / drawer 必须焦点约束、Escape 关闭、backdrop 点击关闭，close action 始终可达。选中对象和数据由调用方控制，面板不能成为第二套 Session 存储。

## 9. Chat Message

### 9.1 几何与角色

对话是工作流记录，所有角色沿同一内容轴左对齐，不用左右聊天气泡。conversation 最大内容宽=800；消息间距=24；消息 padding y=16 / x=0；avatar=24、icon=16、radius=6；avatar 与正文 gap=12；metadata min-height=20；正文顶部 gap=8。

| 元素                       | 契约                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------- |
| User / Agent / System 标签 | 12/16，500；时间 12/16 等宽、次级色                                                |
| 正文                       | 14/24，400；段落间隔 12；列表缩进 20；长 URL 和连续字符可换行                      |
| 标题                       | 消息内 h3 16/24、500；不超过页面层级                                               |
| 代码                       | 12/20 等宽，padding=12、radius=6、border=1；max-height=320，独立横纵滚动           |
| 附件                       | min-height 32 的 Item；icon=16；gap=8                                              |
| Actions                    | Button icon-sm 28；gap=4；hover 或 focus-within 显示，触摸常显；复制反馈不移动正文 |
| Streaming indicator        | 可选静态 2×16 caret；独立状态文字；不能用永久 Spinner 代替内容                     |

Composer：border-top=1、padding=12；textarea min-height=80 / max-height=200、正文14/24、radius=6；附件行32；发送/停止按钮32（触摸44）；左右控件 gap=8。Conversation 与 Files / Diff / Terminal / Preview 工作区分栏时，分隔线1、各自 min-width=0，窄屏改成切换视图，不挤掉 Composer。

### 9.2 状态与行为

| 状态        | 契约                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| draft       | 在 Composer 中；与已发送消息分开                                        |
| pending     | 保留用户输入，说明正在提交；禁止重复提交同一请求                        |
| streaming   | 部分正文持续可读；阶段状态与 elapsed 可见；有 stop 回调才出现停止       |
| completed   | 完整消息；允许复制、查看关联文件；完成由真实事件确认                    |
| interrupted | 保留部分内容与断开原因，提供重连/继续（有能力时）；不自动宣称 completed |
| failed      | 保留用户输入和已收到的内容，关联错误与安全重试；不只显示空白红框        |
| cancelled   | 保留已有正文，显示已停止；重试不覆盖旧消息历史                          |

Message hover 仅用于真实操作区；正文不作为整块可点击对象。可选择引用时增加 focused / selected，但不默认为每条消息增加 tab stop。Tool Call 必须用下一节独立结构；消息内容不能伪造可点击授权按钮。

Conversation 数据态 loading / empty / partial / error / success 与共享契约一致；加载旧历史时保持当前位置的锚点。只有距底部 ≤64 时跟随 streaming，否则显示「返回最新」。屏幕阅读器播报阶段边界而非每个 token；完整正文可导航读取。Enter 发送、Shift+Enter 换行；IME composing 期间 Enter 不发送；只可发送时按钮才启用。

## 10. Tool Call

### 10.1 几何与内容

Tool Call 是独立的执行记录，允许在消息流内使用一条有边界的 disclosure，不使用聊天气泡或通知卡片。border=1、radius=6、无阴影；collapsed header min-height=40、padding x=12 / y=8；tool icon=16；title 13/20、500；gap=8；status 12/16；duration slot=64；chevron=16、命中28（触摸44）。

expanded body padding=12、border-top=1；分区 gap=16；标签12/16、参数/输出12/20等宽；输入与输出分别 max-height=320、内部滚动。最大预览=200行或32KiB，超出显示真实截断说明与「展开完整输出/下载」入口；未提供完整数据时不能声称按钮能还原内容。

必要字段：稳定 callId、toolName、runtime status；可选 target、arguments、output、startedAt、duration、exitCode、error。collapsed 至多展示 tool name + target + status + duration，参数细节进入展开内容。secret、token、Authorization、Cookie 等在展示与复制前脱敏。

### 10.2 状态与操作

| 状态              | 视觉与操作                                                                      |
| ----------------- | ------------------------------------------------------------------------------- |
| queued / starting | 对应统一状态；参数已知即可展开；不显示假结果                                    |
| running           | 阶段 + elapsed；支持增量输出；不伪造进度；可取消才显示取消                      |
| waiting           | 明确等待原因；若需权限，独立显示作用范围和风险摘要以及批准/拒绝回调，不自动批准 |
| completed         | 真实结果摘要；exitCode=0 只有来源明确提供时才显示；可复制脱敏输出               |
| failed            | error + 真实 exitCode（如有）；保留参数与部分输出；重试能力由调用方给出         |
| cancelled         | 保留输出和取消说明；不能将未知取消结果标成已取消                                |
| unknown outcome   | 显示「结果未确认」，保留已有状态/receipt；先查询/对账，不自动重试写操作         |

idle / thinking / paused 仅在真实工具协议存在此状态时使用统一字典，不因 Agent thinking 将所有 Tool Call 也改为 thinking。collapsed / expanded 与 runtime 完全独立；hover / pressed / focus 仅在 disclosure 控件上；selected 仅在用户选择关联对象时启用；disabled 只限制操作，不掩盖已有输出或错误。

首次加载参数/结果用 Skeleton；空 output 显示「工具未返回文本输出」，不当成失败；partial output 标记仍在接收或已截断；request error 保留 runtime 状态并允许重新读取；success 表示详情读取成功，不能替代执行 completed。长工具输出不得撑高整个页面或造成主页面横向滚动。

## 11. Badge / Tag / Chip

Badge 和 Tag 是只读标签，不进入 Tab 顺序，不提供点击或 hover 行为。字体12/16，默认 min-height=24，sm=20；padding x=8，sm=4；1px 语义边框。Badge 默认圆角6，可显式选择 pill；Tag 固定中性分类语义和 pill 外观。形状使用 `--pill-radius`，高度使用 `--label-height` / `--label-height-sm`，不得另造主题常量。通用 Badge 的 tone 不代替 RuntimeStatusBadge 的运行态映射。

Chip 展示一个受控值，字体13/20、默认高32、胶囊圆角。`onSelectedChange` 存在才渲染主选择按钮，以 `aria-pressed` 表达选择；`onRemove` 存在才渲染独立移除按钮。两个目标必须是兄弟，不能嵌套；没有选择能力时文字为静态内容。移除按钮必须有可访问名称和 hover/focus 提示。粗指针下每个交互目标至少44×44，目标区域不重叠。

Chip 支持 default / hover / pressed / focused / selected / disabled / busy；focused 与 selected 独立。disabled / busy 同时阻止选择和移除；busy 保留值并提供 `aria-busy` 和处理中说明。错误由调用方保留值并关联错误区，不推断成功、不自行删除、不发网络请求。移除后的焦点恢复、真实异步状态与数据更新由调用方负责；本地示例移除后将焦点移到重置入口。

新增这三类组件必须提供演示、Catalog、Registry、键盘/触摸浏览器证据和独立安装验证。只读标签不强制扩大成44px，交互 Chip 仍需满足触摸契约。

## 12. StyleWorkbench 样式工作台

使用步骤、24项参数范围、预设与导出说明见 [STYLE-WORKBENCH.md](./STYLE-WORKBENCH.md)。本节规定行为契约，具体值与实现以源码为准。

基础样式工作台用于解释参数变化，不改变产品列表或共享主题。以同一份内容、输入值和选择态渲染 A / B，避免把内容差异误认为样式差异。A 从未修改的主题探针读取实际计算值；B 在 A 上叠加局部修改。所有实验变量只作用于预览容器，禁止写入 `styles/theme.css` 或根元素。`initialSection` 只控制初始参数分类，不绑定站点主题组件或路由。

支持尺寸与间距、阴影、颜色与材质、字体四组参数：圆角、控件高度、内边距、间距、边框宽度；阴影开关、内阴影、水平/垂直偏移、模糊、扩散、颜色和透明度；表面/正文/强调/边框颜色及适用透明度、背景模糊；字号、行高和字重。滑块支持键盘，数值输入提交时按步长和范围收敛，空值或无效值恢复上次有效值；间距与高度遵循4px步长。粗指针下真实交互目标至少44px，即使实验控件高度低于44。

差异表只列已改变参数，数值展示带单位的正负差，颜色和开关显示「已更改」。预设替换当前 B 的局部修改；「B 设为基准 A」固定完整参数快照；「重置 B」回到当前 A；「恢复项目默认」解除固定并读取当前主题。主题变化更新未固定的 A 和未修改的 B 参数，保留用户明确修改值。固定基准后切换主题不改变其参数快照。

读取主题时显示 loading；读取失败明确报错并支持重试，有旧数据时保留。复制失败提供手动复制提示。CSS 导出为局部容器变量和对应规则，JSON 导出版本及完整 A/B 参数；无后台写入、自动持久化或真实运行状态。窄容器将并排预览改为上下比较，不造成整页横向溢出。需验证计算样式变化、A 与共享 token 不被修改、预设/固定/恢复、主题切换、键盘与触屏、复制和独立安装。

## 13. Canvas Foundation 与编辑契约

Canvas 使用受控 `CanvasDocument`（schemaVersion=1、id、revision、nodes、edges、frames、notes、可选 viewport）。节点注册表由调用方提供，图结构与执行快照分开。编辑命令为原子事务，拖动结束产生一次历史；运行事件不进入撤销历史。默认有向无环，output→input 且类型明确匹配，拒绝缺失端点、重复边、自环、回路与连接超限；业务转换通过显式策略提供。

| 对象               | 几何与职责                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CanvasNode         | 宽240、radius8、border1；Header min40、padding8×12；正文12/20、padding12；端口行32（粗指针44）。选中边界与键盘焦点分别显示，中性表面；运行态复用 RuntimeStatusBadge，校验 warning 与 unknown outcome 独立 |
| CanvasPort         | 统一圆形，视觉直径12；名称、方向与 string/number/boolean/object/array/message/tool/model 类型文字可读。支持鼠标连线及键盘连接表单，触屏有替代操作                                                         |
| CanvasEdge         | 贝塞尔路径，默认线宽1.5、选中2、交互路径24；条件文字独立显示。连接与插边先校验，失败保留原图；删除节点不自动桥接                                                                                          |
| CanvasFrame / Note | Frame 只组织视觉，移动成员保持相对位置、删除默认解组；Note 是流程说明，不冒充协作评论或执行节点                                                                                                           |
| NodePalette        | 分类、搜索、无匹配与清除；点击与拖放共用新增命令，Quick Add 同一注册表。只读不允许新增                                                                                                                    |
| NodeInspector      | 复用 Inspector，完整受控对象；表单草稿与提交配置分开，错误保留草稿并定位。未知节点保留原数据、显示不可编辑占位                                                                                            |
| ExecutionPanel     | 独立 runId、documentRevision、attemptId 关联，复用 ActivityTimeline/ToolCall。缺失元信息显示「—」，未知结果先对账；真实能力由消费方提供                                                                   |

所有颜色、网格、端口、边与选中值集中在 `styles/theme.css`。图数据区覆盖五态；刷新失败保留已有图；只读允许导航、选择与缩放，但所有写入口均受约束。键盘提供节点列表、连接表单、移动/删除/撤销与定位；快捷键不抢占输入、IME 或浮层。布局复用 WorkspaceShell，Inspector 沿用停靠/抽屉与焦点恢复；底部面板展开时默认240、范围200–400，提供键盘与指针调整；允许收起为标签栏，展开恢复调整后的高度。CanvasWorkspace/CanvasProjectWorkspace 的 layout=fill 填满有明确高度的父容器，底部默认收起；preview 保持文档演示布局。正式画布页铺满窗口，使用紧凑导航，不被站点页脚和固定预览高度挤占。

JSON 导入限制512KiB、500节点、1000连线、各类注释200项，校验版本、ID、端口和引用后整体替换，失败保留原图。导出仅图配置/引用与布局，先脱敏，不包含运行输出和凭据明文。示例标记本地草稿，刷新丢失；无实际执行/发布能力不提供假成功。实施阶段及证据记录见 [Canvas 计划](./plans/canvas-design-system-plan.md)。

Canvas 执行动效：当前版本的来源节点状态与连线状态分别驱动显示；仅 running 连线显示流光或粒子，节点 starting/running/thinking 显示轻量活动强调，选中与焦点保持独立。CanvasExecutionVisuals 提供 flow/particles/none、0.5/1/2视觉速度与 paused；默认flow、1、false。CanvasWorkspace 在断线、未知结果和非活动运行状态冻结动画，直接使用底层组件时由调用方提供新鲜度。reduced-motion关闭位移和脉冲，保留文字/图标。SVG装饰不参与命中或无障碍树，动画不使用逐帧React状态更新。

本地逐节点演示由 examples 适配层提供时钟和完整来源快照；查询只读取，暂停/单步不伪造真实运行暂停，审批与结果确认沿用既有契约。公共组件不自动执行服务或解释分支条件；修改图版本后停止旧演示推进。

## 14. 实现边界与验收

分层目录：`styles/` Foundation；`components/ui/` Primitive；`components/blocks/` Product Patterns / Workspace Layout；`components/examples/` 演示适配与本地状态；`app/` 页面。可分发组件仅接收数据、事件和能力回调，不导入站点配置、Next.js 路由、账号、认证或网络客户端。演示必须标明本地数据。

| 验收项         | 必须验证的证据                                                                               |
| -------------- | -------------------------------------------------------------------------------------------- |
| 几何           | default / compact、长标题、320 / 390 / 768 / 1440 宽度；实际 computed size，不只看 class 名  |
| 交互           | hover 与 selected 分离、鼠标 pressed、键盘 focus / activation、disabled / loading 防重复操作 |
| 数据           | loading / empty / partial / error / success；刷新失败不清空已有内容                          |
| Runtime        | 十种状态的文案和 token 一致；未知状态不冒充成功；动作按能力开放                              |
| Tree           | 完整键盘、展开后焦点、折叠后焦点、拖拽替代操作（仅实现拖拽能力时）                           |
| Inspector      | open/close、焦点恢复、resize 边界和键盘、窄屏 drawer、对象切换不混数据                       |
| Chat / Tool    | streaming 保留正文、IME、滚动锚点、局部溢出、脱敏、权限明确批准                              |
| StyleWorkbench | 计算样式、A/B 同内容、局部作用域、主题与固定快照、数值边界、导出、窄容器与触屏               |
| 主题 / 动效    | Light / Dark、系统 reduced-motion、触摸最小44命中；颜色不作为唯一状态                        |
| 安装           | 新组件必须有 example、catalog、registry；消费项目可独立安装和 typecheck                      |
| 工程检查       | `pnpm lint`、`pnpm typecheck`、`pnpm build`；行为变更运行 Playwright                         |

当前已实现 Foundation、状态字典、工作台骨架、Badge / Tag / Chip，以及 Tree、SessionRow、AgentRow、ActivityTimeline、Inspector、ChatMessage / Conversation / ChatComposer、ToolCall 和 StyleWorkbench 的可分发 UI。Tree 单选键盘与受控拖拽、工具授权 UI、局部输出与未知结果对账入口均可在本地示例操作；真实 Session/Agent 控制、权限审批权威、工具执行、流式网络连接与数据持久化仍由消费项目提供，不能以示例行为冒充真实服务能力。样式工作台提供本地参数实验，不自动修改产品主题或保存实验结果。

## 15. Canvas 运行、项目与服务契约

运行状态只接受完整权威快照，按 documentId/runId/documentRevision/sequence/attemptId 归属；拒绝旧运行和旧序号覆盖，旧文档版本仅在调试区域标记显示。节点与连线各有来源状态，不互相推断。运行/停止/审批能力显式提供；未知写结果先查询，重复请求被约束。Activity/Logs 复用64px跟随，执行内容先脱敏并限200行/32KiB，复制与预览同边界。

CanvasProjectWorkspace 对每张子图保持独立选择/视口/历史；显式输入输出边界隔离变量作用域，禁止递归。Loop 与 Iteration 的单输入输出、状态类型、次数/并发上限，以及 Switch/Parallel/Merge 的端口和结果归属见 CANVAS.md。这里规定编辑和接入协议，不附带调度执行器。

CanvasConfigEditor 默认32px字段，字段组gap8/padding8/border1，使用既有 theme。condition/schema/key-value 结构化值需校验，超出简化构建器的内容保留原JSON；expression/code 不执行。Frame折叠不改变图，定位成员会展开，批量对齐作为一次命令。

服务保存按CAS和匹配回执确认；unknown和conflict保留草稿并阻止重复写。600ms autosave只提交dirty，不对失败或unknown循环重试。版本恢复明确确认，受控权限、讨论、临时presence、环境和发布由CanvasServicePanel展示。onUncertain必须在调用方保留未知状态。当前真实服务接入经用户选择留待后续，不能将本地fixture标为已集成。

## 追加契约：受控布局、流式修订与基础交互

Canvas 性能与整理补充：索引按实际 nodes/frames/edges/definitions/issues 输入失效，不仅依赖 revision；选择集合独立，不重建端口。节点运行展示复用未变化的 payload；图文档、执行版本与撤销历史继续分离。编辑快捷键仅作用于 `[data-canvas-editor-context]`，普通文本选择、输入、Inspector、日志和浮层保留原快捷键。

`WorkflowCanvas.onMeasurementsChange` 输出临时引擎尺寸，不能写入图文档或撤销历史。`CanvasWorkspace.fixedNodeIds` 是调用方的自动布局约束，不增加业务权限或节点锁定字段。“更多工具”提供当前作用域 DAG 整理、JSON 和帮助；整理使用实际尺寸，缺失尺寸按端口数量估算，保留固定节点和分组边界。计算可取消，结果绑定完整源对象、定义与固定节点输入；旧结果不应用。预览不提交，应用只发出一次 `move` 坐标命令；循环、子流程、无效图和分组空间不足保留原图并说明原因。布局不承诺连线无交叉。既有 500 节点/1000 连线导入与命令限制继续有效；1000 节点压力样例仅探测显示容量。

WorkspaceShell 同时支持 `value/defaultValue/onChange` 配对（具体属性为 `sidebarCollapsed/defaultSidebarCollapsed/onSidebarCollapsedChange`、`inspectorOpen`、`inspectorWidth`、`bottomPanelOpen`、`bottomPanelHeight` 及各自 default/onChange）。受控模式由调用方回传；Inspector 宽度限定 280–360px，底部高度 200–400px。`inspectorOverlayOpen` 是独立的窄屏浮层状态；响应式测量不回写桌面偏好。原 `bottomPanelCollapsed` 接口继续兼容。组件不读取 localStorage；`/workspace/layout/` 展示按 workspace ID 保存、校验和重置偏好的适配器。

Conversation 与 ActivityTimeline 可选 `revision: string | number`。调用方须在追加、历史修订、删除、重排和状态变化时推进；省略时继续检测完整相关字段。输入使用不可变记录；去重保留首次位置和最后 payload。未变化的消息/事件行跳过重复渲染，64px 跟随阈值与补历史锚点继续生效。未默认启用窗口化，浏览器全文查找和复制仍覆盖全部记录。`deferOffscreen` 默认 false，开启后使用浏览器 content-visibility 延迟屏外布局，记录仍保留在 DOM；不支持该 CSS 的浏览器回退完整布局。

Menu 表达动作，Select/Combobox 表达选值，Tabs 表达关联内容面板，Segmented 使用单选 radio 语义。Popover 是补充信息层。基础组件沿用 Base UI 1.8 的受控/非受控接口和焦点行为；正常目标高 32px，粗指针至少 44px；焦点环与选中样式独立，浮层使用 `--shadow-floating`。Tabs 默认方向键只移动焦点，Enter/Space 激活；Select/Combobox 提供键盘选择和 Escape；Menu 禁用动作不可执行。业务结果仅由真实回调提供。

ThemeBoundary 新安装使用 `/r/host/` 或 `/r/scoped/` 的命名空间源码；不要把 canonical legacy 组件与私有变量模式混用。`legacyAliases` 仅用于渐进迁移，并只在 boundary 内声明别名。Portal 必须进入对应 boundary；原 `/r/<item>.json` 保持原行为。主题核心仍由 `styles/theme.css` 生成，不能另维护色表。


## 通用表格、浮层与表单契约增量

通用组件补齐遵循 [计划及固定接口](plans/common-components-completion-plan.md)。Checkbox 可视图标16、实际目标32/粗指针44；Table 默认行40，保留 caption、th scope 和横向滚动。选择、当前查看与焦点独立，全选仅改变当前可选行，隐藏选择保留。排序只请求变更，数据和汇总由调用方提供。

Sheet 左/右/底部可配，首尾固定、正文滚动，复用 Dialog 焦点/关闭及 ThemeBoundary；嵌套浮层只由最上层消费 Escape。Field 关联 label/id、description/error IDs，失败保留草稿。CommandPalette 使用 combobox/listbox、方向键与 Home/End/Enter、IME防误选，默认无全局键盘监听。ImageUpload 验证类型/大小、读取与解码后交付本地 File，替换失败保留旧值，卸载或新请求取消旧读取。

只读图元不增加交互hover。SegmentBar有限值限制在范围，未知显示未知；Sparkline最近120点且提供文本替代；RatingDisplay限制1–10星、半星四舍五入。Slider区分连续变化与提交。WorkspaceShell 侧栏默认256、折叠48，局部宽度与边界受控可配，resize默认关闭；按实例持久化属于适配层。


## Work Items W5 增强契约

详见 [WORK-ITEMS.md](./WORK-ITEMS.md)。WorkItemBoard 接收调用方权威泳道/分组；泳道内移动附带 laneKey，跨泳道写入不自动推断。WorkItemList 的 hierarchy 受控展开与子项快照独立于勾选；折叠保留隐藏选择，父项不在查询时子项可独立阅读。Table/Board 保持平铺。

WorkItemsBatchActions 只提交状态/优先级 patch 与每项基础版本，确认前展示含隐藏选择的完整范围、未加载/无权限/锁定项。回执逐项显示；拒绝保留原记录和批量目标值，unknown先查询，不建立跨项原子事务。WorkItemsSavedViews 受控保存配置与基础版本，另存/更新/删除均需明确回执；删除有确认，读取失败保留旧视图。名称输入保留失败草稿，unknown由调用方跨重挂载持有。示例保存仅页面内存，刷新清除，真实持久化由消费方实现。

大数据辅助使用分组/层级索引与不可变记录缓存；List/Board 可选 content-visibility 延迟屏外布局与字段编辑器挂载：屏外保留完整只读值，进入可见区或聚焦时启用编辑器，已挂载编辑器保持到条目卸载；焦点行保持可用，实体仍在DOM；Table保留原生渲染。不得把此能力称为窗口化或服务分页。50/200/1000项测量记录实际加载/挂载数量和采样条件。
