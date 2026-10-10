# 2026-10-12 Agent Workspace 技术与展示、Work Items 场景页计划

规划日期：2026-10-11。执行日期：2026-10-12（Asia/Shanghai）。状态：规划完成，以下代码、依赖与新增页面均待实施。本次保存实施计划，不启动模型请求、不安装新依赖。

明天的目标：让已有 Pi 对话入口更可靠、工作台更易读，并在 Work Items 上新增六个有不同任务流程的可交互展示页。每项以实际挂载、操作结果和恢复路径验收。

## 1. 来源、现状和范围

采用 EasyuseUI 复用模式。正式来源：[Design Rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)、[UI Patterns](../UI-PATTERNS.md)、[UI States](../UI-STATES.md)、[I18N](../I18N.md)。信息架构与验收方法采用 [patterns 技能](../skills/ui-principles/easyuseui-patterns/SKILL.md) 和 [UI review 技能](../skills/validation/easyuseui-ui-review/SKILL.md)。

Agent 的具体依据为[设计计划 PG/MD/V/DL](agent-workspace-plan.md)、[首轮补全计划](agent-workspace-completion-plan.md)、[Pi 技术计划](pi-agent-workspace-integration-plan.md)、[开发指南 DG2/DG3](../DEVELOPMENT-GUIDE.md)及[编码服务 CW0–CW6](agent-coding-workbench-enhancement-plan.md#11-agent-编码工作台技术补充与服务实施计划)。Work Items 依据为[组件合同](../WORK-ITEMS.md)、[组件计划](work-items-components-plan.md)和[五布局展示计划](work-items-showcase-plan.md)。

### 当前核对结果

规划时 HEAD 为 `957dc07810065da3cca74bf5b25088ee5a561cd2`。下表区分当前源码和历史验收，本次没有重新运行浏览器或真实 Provider。

规划过程中发现并行工作正在补充组件先行规范、统一元素画廊及 CodeMirror 依赖。其代码/分发结果尚未在本轮验证，明天 D0 须核对实际交付：复用已经验收的展示容器和 CodePreview，页面只组合组件；缺失能力先在组件层实现并展示。展示效果、设计规范和技术清单分别记录，不在页面直接堆叠 CSS 绕过组件层。本计划不提交该并行工作，也不将依赖清单变化当作编辑器可用的证据。

| 项目                | 当前事实                                                                                                                                  | 明天增量                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Workspace 入口      | `/workspace/` 复用编码工作台 fixture；原 Shell 在 `/workspace/shell/`                                                                     | 保留入口，改善展示和跨区域返回                               |
| 最新导航修订        | [会话导航记录](workspace-session-navigation-log.md)将对话/上下文/计划/运行入口放到选中会话下；该变体目前用于 PG04/PG08                    | 以此修订为准，Pi 只接入实际支持的导航，不重新添加重复工具条  |
| Pi 真实页           | `/examples/agent-workbench/pi/`；独立 Host + HTTP/fetch SSE + SDK                                                                         | 补完整负载校验，复验发送、历史与恢复                         |
| 已有证据            | [Pi 首轮记录](agent-workspace-completion-log.md)记载 AW0–AW5；[设计记录](agent-workspace-design-completion-log.md)记载 DL0–DL5 的 UI 范围 | 既有通过不等于明天改动已验收；按变更重跑适用项               |
| Pi 校验缺口         | `client.ts` 的 HTTP 成功响应使用 `as T`；SSE 检查部分信封字段，未完整验证 payload                                                         | 新增协议边界运行时验证，保留序号、身份和回执规则             |
| Work Items          | 五布局、泳道、子项、批量动作、保存视图已有组件与 fixture                                                                                  | 用业务场景组合这些能力，不再增加同布局的空壳副本             |
| Work Items 路由缺口 | `use-work-items-url.ts` 导入固定 catalog，编码始终返回 `/examples/work-items/`；`WorkItemsDemo` 无场景配置输入                            | 提取场景配置、catalog 和 basePath，保留原页及旧 URL 兼容     |
| 新路径全窗口        | `SiteFrame` 当前只匹配 Work Items 根路径                                                                                                  | 精确覆盖新增展示路径，Hub 保留文档页布局                     |
| 规模边界            | 已有屏外延迟布局，不是虚拟化；本次未重测大数据性能                                                                                        | 展示页默认小数据集；50/200 项作回归采样，1000 项独立压力观察 |

### 交付等级

- **P0 必做：** 协议校验、现有 Pi 闭环回归、Agent 展示打磨、一个展示索引和六个 Work Items 场景页、文档与行为验证。
- **P1 有余量再做：** TanStack Query 只读项目/会话列表试点与性能深入优化；未通过门槛时保留现有 Provider，记录结论。
- **后续服务范围：** CW1–CW6 的编辑器保存、真实文件/Git/命令/PTY，以及 AW6–AW8 的 Checkpoint、审批、队列与多 Agent；本日展示增量不声明这些服务已交付。

## 2. 技术栈更新决策

基线来自当前 `package.json`、`services/pi-host/package.json` 和源码，不声称这些是最新版本。明天引入新包前核对发布版、许可和兼容性，并精确锁定实际选用版本及 lockfile。

| 层              | 当前基线                                                              | 本日决定和出口                                                                                   |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 环境            | 当前 Node 24.21.0、pnpm 11.9.0；根包 Node >=22.18.0、Host >=24.5.0    | 联合运行文档统一说明 Node >=24.5.0；本机仍用24.21.0；区分仅组件消费和完整 Host 要求              |
| 页面            | Next 16.3.8 / React 19.3.0 / TypeScript 声明 ^6.0.2 / Tailwind ^4.3.0 | 沿用静态导出与 Webpack；新增静态路由和必要客户端 Suspense，不整体升级框架                        |
| 交互与主题      | Base UI 1.8.0、Lucide、CSS Modules、共享 theme tokens                 | 复用 Button、Field、Sheet、Menu、Resizable 和已有组合；局部展示变量留在 example 范围             |
| Pi 执行         | `@earendil-works/pi-coding-agent@1.1.0`，独立 Node Host               | 保留 SDK 与只读工具范围；浏览器仍不导入 SDK/Node/认证文件                                        |
| 协议验证 P0     | 浏览器安全 TS 协议，部分运行时检查                                    | 优先小范围引入 Zod 校验 HTTP/SSE/回执；不以类型断言替代验证，不为 UI 原语增加 schema 依赖        |
| 服务查询 P1     | Pi 私有 Provider 自行管理请求、事件和缓存                             | TanStack Query 仅试点只读项目/会话列表；历史分页、SSE 和命令保留已有权威流程，试点达标后另批扩展 |
| 界面状态        | Context/reducer/局部状态、逐会话版本草稿                              | 保留；本日不把切换 Zustand 当性能改进依据                                                        |
| Work Items 展示 | `WorkItemsWorkspace` + 受控视图/移动/日期合同                         | 新增 example 私有场景配置与共享 Provider；不引入另一套 Table/DnD 引擎                            |
| 重型能力        | 图表、画布和只读代码预览已有；可保存编辑器/PTY待实施                  | 场景页不预载无关图表/画布；CodeMirror/xterm 继续由 CW0 兼容验证决定                              |

Zod 的结构验证与 `safeParse` 用法参照[官方基础文档](https://zod.dev/basics)。查询缓存的键与自动刷新/重试策略参照 [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) 和 [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)。这些资料支持 API 选择；本项目兼容性须由安装与测试证明。

### T1 协议校验的具体实现与验收

1. 在独立适配/schema 模块验证 projects、sessions、history、snapshot、event、receipt；对照 `lib/pi-workspace-protocol.ts`，兼容现有协议 v1，不顺带改服务语义。
2. 校验有限数值、消息 part 判别、数组与字符串边界、capabilities 和事件 payload；现有运行时状态字符串按兼容策略保留，无法识别时显示明确未知，不能升级成成功。
3. 非法 JSON、缺少关键字段、错误版本、错会话及损坏快照不得覆盖已确认内容；呈现连接/数据错误或 partial，按原协议重同步，日志不包含原始敏感载荷。
4. 结构验证不替代 `hostEpoch/sequence/revision/sessionId/runId/requestId` 检查；保留已有去重、单写锁和 unknown 对账。迟到 HTTP 不能覆盖较新事件。
5. 如扩展 Host 输入/配置校验，共用浏览器安全 schema 或明确的 Host schema，不把站点别名带入 Node 服务；导入、类型和打包均须验证。
6. 新增有意义的非法负载、旧事件、刷新失败保留快照测试；现有正常闭环须回归通过。校验开销记录在50条首屏/补历史场景，不凭换库声称性能变快。

### T2 查询试点的启用门槛

缓存键包含服务端点、非敏感授权作用域ID/连接代次、项目和查询条件；不得把 Bearer/token 放入 key。断开或换身份取消并清理旧作用域。只读取列表使用查询缓存；组件仍从同一权威状态读取，不产生第二份竞争快照。设置明确的 staleTime、retry 和窗口焦点刷新策略；发送/停止不继承读取重试。

只有在取消、迟到响应、身份隔离、刷新失败保留内容、SSE更新后列表一致性和现有 Pi 回归均通过时交付试点。时间不足或出现双份事实时保留原实现，记录P1未完成，不影响P0交付。

## 3. Agent Workspace 页面和模块声明增量

### 页面声明 AW-D1

Host pages：PG04 `/examples/agent-workbench/app/`、PG08 `/workspace/`、PG05 `/examples/agent-workbench/pi/`，以及PG02参考实验页。目标流程为选择会话 → 阅读历史 → 输入/发送 → 查看公开工具和结果 → 恢复或继续；fixture 与真实页分别标明来源。

布局沿用最新导航声明：48px全局栏、56px导航轨、256px侧栏、64px会话Header、760px对话内容列；右侧资源与240px底栏按能力且默认收起。PG04/PG08在选中会话下保留对话/上下文/计划/运行入口。PG05以同样紧凑语言提供已有能力；没有真实上下文/计划/运行服务时不放可点击空面板。390px导航用Sheet，短视口优先保证输入和发送可见；容器不足时先收辅助区，再转单面板。

Header/Composer固定，消息独立滚动。切会话、资源页、主题与语言保留会话草稿版本、已访问面板、阅读位置和焦点；模态关闭恢复触发点。Host拥有执行、权限、回执和持久化；fixture Adapter拥有本地演示快照。受影响模块为MD03–MD07/MD09/MD12/MD15–MD17，动作、数据、连接、运行与结果确认分轴。

### 模块声明增量

| 模块                   | 展示与受控合同                                                                                                                 | 状态和验收                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| MD03 会话导航          | 复用SessionNavigator/SessionRow/Tree；当前选中加深底色、2px条和标题字重；运行图标独立，动作在行尾兄弟目标；最新分区/子入口保留 | 搜索、分区展开与选中互不替代；键盘焦点单独显示；来源归档/unknown按原回执；返回同草稿和选中项                |
| MD04/05 Header与阅读   | 复用SessionHeader/Conversation；标题20px以内、状态清楚，独立滚动和稳定Header；不重复面板切换工具条                             | 数据五态、同对象失败保留历史；64px跟随，向上阅读不抢滚动；补历史锚点偏移沿现有测试门槛                      |
| MD06 用户消息          | 复用ChatMessage，右对齐浅蓝语义映射、R16、12×16、桌面最大72%；时间上方、动作下方靠右                                           | 长中文/英文/代码换行不撑出页面；触摸动作可发现；复制仅当前脱敏显示内容；i18n不改调用方正文                  |
| MD07/09 Agent与工具    | 开放正文14px/24px，元信息12px；真实Action/Output转换用1px线与16px间隔；相邻Read/Search紧凑摘要                                 | 保持原始内容顺序，只呈现公开阶段；失败/unknown常驻；展开与复制有界；无来源数值显示“—”                       |
| MD12 Composer          | 复用AgentComposer/ChatComposer，R16外框、32px控件，最大300px并受视口限制；运行中保持外形                                       | IME不误发；提交只清确认的draftVersion；拒绝/unknown保留输入；无能力不显示Queue/Steer/审批；主题语言不重挂载 |
| MD15–17 资源/宽区/底栏 | 复用WorkbenchPanelTabs/FileViewer/DiffViewer/ExecutionSessionList；资源负责定位，宽Diff在Main；面板按需挂载并保留访问状态      | 分屏/最大化退出恢复反馈和阅读；按ID/revision定位；缺少PTY/测试/指标显示能力提示；关闭面板不停止服务         |

模块共同使用共享语义token、4px网格、hairline边框；只有交互目标有hover，focus/selected/disabled/busy明确区分；粗指针目标至少44px，支持zh-CN/en和reduced-motion。上述例子局部尺寸沿V01–V12，公共默认值不变。

浏览器路径：PG08输入草稿 → 上下文/计划/对话往返 → 打开运行区 → 切会话再返回；PG05连接 → 新建/打开历史 → 发送/流式 → 刷新 → 再读历史。断线、迟到、停止和unknown沿受控Host测试验证；真实Provider另记证据。

## 4. Work Items 六个新增展示页

新增索引 `/examples/work-items/showcase/`，六页采用显式静态路由，便于 `output: export`。保留 `/examples/work-items/` 的原组件示例及 `/workspace/work-items/` 的兼容入口。

### 页面声明 WI-PG00–WI-PG06

| 页面ID / 路由后缀（位于 `/examples/work-items/showcase/`） | 用户目标 / 默认布局与状态                                              | 页面特有流程 / 受影响模块                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| WI-PG00 根索引                                             | 文档展示索引；六个场景入口、预览与来源说明                             | 每项说明能做什么和本地数据边界，导航到可用页；WI-M01                     |
| WI-PG01 `product-backlog/` 产品待办                        | 梳理需求；List按状态分组，显示标题/优先级/负责人；基础组展开，子项收起 | 新建需求→筛选→展开明确父子关系→字段编辑→详情；WI-M02–M05                 |
| WI-PG02 `sprint-board/` 迭代看板                           | 查看本次迭代；Board按状态分列、优先级泳道，详情关闭                    | 列内排序/跨列移动→来源本地回执→List复核同记录；WI-M02–M05                |
| WI-PG03 `bug-triage/` 缺陷分诊                             | 比较和处理缺陷；Table展示编号/标题/优先级/状态/负责人，优先级排序      | 多选→批量状态/优先级预览→混合回执→unknown查询；WI-M02–M05                |
| WI-PG04 `release-plan/` 发布排期                           | 调整发布任务日期；Timeline默认月，固定锚点2026-10-12，未排期入口可达   | 日期拖动或表单→版本确认→Calendar复核；不是依赖调度/Gantt服务；WI-M02–M05 |
| WI-PG05 `team-calendar/` 团队日历                          | 查截止日期与每日任务；Calendar默认月、选中2026-10-12，Agenda可见       | 切周/月→选择日期→打开任务→改dueDate；390px日期选择+Agenda；WI-M02–M05    |
| WI-PG06 `my-work/` 我的任务                                | 聚焦fixture身份Lin的任务；List默认负责人筛选、保留清除入口，详情关闭   | 筛选→打开详情→本地编辑→另存/应用视图；示例身份不冒充登录账户；WI-M02–M05 |

WI-PG01–06共用以下页面合同：上方项目/场景标题与一处“新建”主动作、40px基准Toolbar、主区唯一五布局工作区、按需Inspector/Sheet、底部折叠说明。页面标题20px、控件32px，List/Table行高沿当前合同，Board初始列宽320px；Timeline行至少44px、时间条24px。Header/Toolbar固定，主区自持滚动；水平滚动只存在表格/看板/时间轴内部，页面不得横向溢出。

桌面Inspector沿WorkspaceShell默认320px/280–360px；中宽覆盖、390px用Sheet。查询/布局/activeItem进入URL，视图设置replace、详情push；返回恢复原筛选、选择、字段草稿和该布局阅读位置。主题/语言不重挂载输入。loading/empty/partial/error/success及拒绝/unknown由共享fixture Adapter显式提供；源数据和统计取自该项目快照。每页是本地fixture，刷新重置；跨场景共享只限定一次应用访问周期，不声明跨刷新持久化。

### 数据与场景隔离

- 固定项目 `showcase-project`、36条任务、日期/时区/稳定ID与排序；采用真实业务语义文案，包含长中文/英文标题、多标签、无负责人、单端日期和未排期任务。
- 六页是同一项目的不同查询预设。迭代/缺陷/发布归属放在example私有metadata，以稳定workItemId关联；当前WorkItemRecord没有这些业务字段，不直接扩张公共合同。
- 负责人、状态、优先级和标签继续用WorkItemCatalog ID；本地预设只决定视图，实例持有统一实体、selection、drafts、receipts、savedViews，跨页变化读取同一份快照。
- 共享Provider放在新增场景目录的layout中，保留一次客户端导航周期状态；直接打开和刷新使用确定性默认。目录间或原组件示例间的数据作用域分开，不能串入原fixture或Pi缓存。
- 场景配置显式传入basePath、catalog、默认view、数据子集和标题；URL编解码默认行为保持旧页兼容。无效值按当前场景catalog校验，首次hydration不得覆写有效深链接。
- 切页/重置有generation隔离，pending/unknown保留原对象和操作键；不会把旧页迟到响应应用到新对象，换布局不解锁未知写入。

### 模块声明 WI-M01–WI-M05

| 模块ID / host pages        | 责任、输入与复用                                                                                                                    | 展示、状态与验收                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| WI-M01 / PG00及PG01–06入口 | 索引和场景导航；静态配置id/title/summary/href，复用站点ExampleGallery模式与Button/链接                                              | 索引可用独立预览块；工具页使用紧凑导航；当前页aria-current，键盘可达；双语站点文案与调用方任务正文分开；跳转不执行任务                        |
| WI-M02 / PG01–06           | 场景Header/Toolbar与URL；复用WorkItemsWorkspace/WorkItemsToolbar；受控view/onViewChange/basePath/catalog                            | 20px标题、4/8px间距、中性表面/1px边；筛选Chip可移除；触摸44px；未知路由/无效查询可恢复；进入/刷新/后退不跳回原组件示例                        |
| WI-M03 / PG01–06           | 主数据区域与五布局；items/groups/lanes/hierarchy/selection/mutations及移动/日期回调；复用WorkItemList/Board/Table/Timeline/Calendar | List为紧凑行，Board用已有工作项卡而不套外层Card；保留五态/旧数据/长内容；移动键盘替代、日期表单、取消/拒绝位置恢复；统计不从部分页猜总数      |
| WI-M04 / PG01–06           | 对象详情/QuickCreate/字段草稿；复用WorkItemDetail、WorkItemQuickCreate、Field、Inspector/Sheet                                      | 身份/业务状态/模拟Agent runtime分开；新建与详情固定头尾、正文滚动；失败保留草稿，unknown先查询；动作与行主目标是兄弟；Escape和焦点恢复        |
| WI-M05 / PG01–06           | 批量、保存视图及来源说明；复用WorkItemsBatchActions/WorkItemsSavedViews/WorkItemMutationNotice                                      | 选择后才出现批量区；完整展示隐藏选择/无权限/锁定项和逐项回执；操作条紧凑，说明默认收起但来源标识可见；保存视图只存配置，unknown由Provider持有 |

共同合同：默认zh-CN并支持en，保留任务正文/协议值/草稿；选中、hover与焦点分开，禁用有原因；reduced-motion无必要位移动画；本地120ms等演示回执由适配器提供，公共组件没有计时器、网络或存储副作用。

## 5. 执行顺序与时间预算

以下是一个约9小时的实施预算，含午间间隔；是排期目标，不是通过承诺。按依赖顺序推进。16:45检查风险，P0超时先移出P1，仍未完成的P0如实记为未完成，不以路由存在代替交付。

| 时间（10月12日） | 工作包           | 具体出口                                                                             |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------ |
| 09:00–09:45      | D0 基线/合同     | Git/端口/安装版本/能力核对；桌面及窄屏修改前截图；确认模块、数据和验收路径           |
| 09:45–11:45      | D1 技术更新      | schema锁定与HTTP/SSE接入、非法负载/旧事件验证；Pi受控回归；联用环境说明              |
| 11:45–12:30      | D2 Agent展示     | 优先解决实际挂载发现的密度、用户气泡、工具摘要、导航和输入区问题                     |
| 13:30–14:30      | D3 场景基础      | 配置/catalog/basePath解耦、统一项目Provider、私有metadata、静态layout与URL兼容       |
| 14:30–16:45      | D4 六页与索引    | 六种预设、业务fixture、入口/说明、日期锚点；逐页至少走通一条主路径                   |
| 16:45–17:15      | D5 视觉复核/余量 | 双主题/语言与短视口；P0已稳定才开展T2查询小试点，否则修复P0                          |
| 17:15–19:00      | D6 验证与交付    | 工程、服务、浏览器、分发适用检查；截图/失败复测/剩余项登记；范围审查、提交与普通push |

D1依赖D0；D3依赖声明，D4依赖D3；D6使用最终同一候选源树。不给D2/D4塞进完整编辑器或真实编码服务。需要引入多个包/改公共API时，先做兼容试片并重新记录预算，不挤占验收后宣布完成。

## 6. 预期文件范围

| 范围      | 拟改动                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| 技术      | `package.json`/`pnpm-lock.yaml`（实际引入时）；独立Pi schema、`client.ts`及Provider必要接缝；Host仅在输入schema接入时修改 |
| Agent展示 | 已有Agent/Pi example组件与私有CSS；共享blocks只做必要兼容扩展，同步模块声明                                               |
| 场景基础  | `components/examples/work-items/`的配置/Provider/fixtures/URL适配与页面组合；保留原默认行为                               |
| 路由      | `app/examples/work-items/showcase/`的静态索引、共享layout和六个显式子page                                                 |
| 站点入口  | `components/site/site-frame.tsx`精确全窗口匹配，ExampleGallery/站点i18n/metadata与文档入口                                |
| 验证      | 新场景浏览器用例、Pi负载/恢复用例、按需截图脚本；实施记录及启动/恢复说明                                                  |
| 分发      | 只有公共组件/portable CSS/依赖闭包变更时更新Manifest、Registry、Catalog与独立安装证据                                     |

规划时已有AGENTS、i18n空行、docs-code缓存及SVG计划并行修改。开始实施/提交前重新核对，不吸收无关改动；生成产物按来源条目审查，凭据/本地配置/依赖/构建/测试证据留在忽略目录。

## 7. “能够使用”和“效果不错”的验收

### 可用性

- Pi：可按[启动说明](../PI-WORKSPACE.md)连接、选项目/历史、新建、发送、查看流式、刷新后读取已确认记录。坏负载和刷新失败不清历史；迟到结果不换对象；unknown先查询而不补发。
- 新页：索引六个入口均可直接打开、刷新与后退；每页有场景特有数据和可执行主流程；五布局共享身份/选择/已确认字段，各布局保留阅读位置。
- 至少覆盖新建失败保留草稿、刷新失败保留旧数据、字段/移动拒绝、批量混合回执、日期冲突和unknown跨布局锁定。场景开关收进说明区，不成为页面主工具栏。
- fixture跨场景导航保留本轮内存状态，刷新重置有清楚说明；Pi真实记录与fixture分开。新页链接不暗示已登录、真实Plane或业务持久化。

### 展示与体验

六页及受影响Agent入口都验1440×900、1024×768、390×844；Agent再验390×500短视口。每页覆盖浅色zh-CN/深色en，选代表页补反向主题语言，模块覆盖长内容、keyboard/touch/reduced-motion。

验收实际computed size、局部滚动、输入/发送可见、Sheet焦点、选中样式、工具异常可发现与跨区域返回。截图需要目视审查，不单以生成成功为通过。输出修改前后相同数据/主题/视口对比，标题/状态/主动作可扫读，主区没有页面横向溢出，资源打开与恢复草稿可复现。

不设未经测量的“更快”结论：保留首屏、DOM、50/200条操作基线与同环境比较；1000条压力记录问题而不阻塞小数据展示。新依赖和可选重型面板记录加载成本，Work Items页不因未使用功能下载整套画布/编辑器。

### 验证命令与证据

在隔离候选中执行，保留3010共享开发服务；生产预览3011与Host端口先检查归属。工作项配置默认独立33111，Pi配置单worker，避免固定Host端口冲突。

```sh
pnpm lint
pnpm typecheck
pnpm pi:typecheck
pnpm pi:test
EASYUSEUI_LOCAL_BUILD=1 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3011 pnpm build
pnpm exec playwright test --config=playwright.pi.config.ts tests/pi-workspace.spec.ts
pnpm exec playwright test tests/workspace-entry.spec.ts tests/agent-workspace-reference.spec.ts --workers=1
pnpm exec playwright test --config=playwright.work-items.config.ts tests/work-items.spec.ts tests/work-items-route.spec.ts tests/work-items-enhancements.spec.ts tests/work-items-schedule.spec.ts tests/work-items-showcase.spec.ts
```

`tests/work-items-showcase.spec.ts`为本日拟新增文件，不是当前已存在测试。按最终改动加跑i18n/Manifest/docs相关检查；公共可分发源码/CSS或Registry依赖变更时执行 `pnpm test:install`。本次仅规划的文档交付只检查格式、链接、范围与Git差异，不把上述待执行命令写成通过。

真实Provider复验单独记录：沿用既有Pi配置，在临时托管会话进行一次基础对话，确认真实流式与刷新读回；不自动改模型/凭据或增加工具请求。停止/重启/只读工具等按受控Host回归与已有真实证据区分，未做新的真实场景就写未复验。若需要新的完整Provider场景，另列明确流量与环境范围，不直接套用扩展真实测试。

实施记录至少保存：候选SHA/源文件版本、依赖版本、命令和最终结果、页面/模块路径、浏览器矩阵、截图索引、性能采样条件、失败与复测、真实服务与fixture边界、剩余任务。证据可放`.local/`；不把本机截图路径存在当作分发或公开部署完成。

## 8. 明日执行清单

- [ ] D0 冻结当前基线、依赖、端口、声明与修改前页面证据。
- [ ] D1 完成Pi完整负载校验及恢复回归；记录锁定依赖与联合环境要求。
- [ ] D2 完成Agent实际展示缺口，保留最新导航、草稿与阅读体验。
- [ ] D3 完成Work Items场景配置/URL解耦与共享项目Provider。
- [ ] D4 交付索引及六个不同流程的可操作场景页。
- [ ] D5 完成双主题/双语/窄屏/短视口；P1查询试点另记通过或未实施。
- [ ] D6 工程/服务/浏览器/分发适用项通过，补齐实施记录与可用入口。
- [ ] 审查明确任务文件，保留并行工作；按仓库身份和授权提交、普通push并核对远端SHA。

完成口径：规划完成、UI/fixture完成、真实Pi复验、公共分发、业务验收分别记录。六个路由存在、截图好看或历史测试通过，都不能单独替代本日可用性验收。
