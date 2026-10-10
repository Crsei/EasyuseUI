# Agent Workspace 具体设计与布局执行计划

日期：2026-10-10。状态：首轮 Pi DL1–DL2 已实现；DL0 基线、DL3 完整参考 fixture、DL4 代码工作区 UI 和 DL5 验收已完成，见[完整设计实施记录](agent-workspace-design-completion-log.md)。审批/Queue/Steer 证据保留在[人工介入记录](agent-workspace-intervention-log.md)；真实 Pi 证据见[首轮记录](agent-workspace-completion-log.md)，AW6–AW8 仍为独立服务范围。

本文件是 [reference 原文](./reference/agent-workspace-plan.md) 的完整内容副本，负责具体视觉、页面布局、模块展示和交互细节。原文全部保留，仅增加标题层级、线框图代码围栏和本文件的执行声明/清单；原文中的对话、示例产品名、后续建议均作为设计来源保留，不表示已实现功能或新的执行指令。

**执行顺序：先按 [补全执行计划](./agent-workspace-completion-plan.md) 完成 Pi 接入及其必要页面，再逐项执行本文件的完整设计清单。** [Pi 服务技术计划](./pi-agent-workspace-integration-plan.md) 负责后端、历史、事件和回执；本文件负责它们怎样呈现在工作台。不要等完整编辑器、多 Agent、PTY 和 Git 功能全部完成才连接 Pi。

- 先读文末 [执行原则与差异声明](#执行原则与差异声明)，明确 V2 与 V1 的采用关系。
- 按 [页面级设计声明](#页面级设计声明) 确定当前页面的目标、布局、默认状态和验收路径。
- 按 [模块级设计声明](#模块级设计声明) 确定各元素的展示、状态、交互和复用边界。
- 按 [设计与布局执行清单](#设计与布局执行清单) 逐项实施；完成声明不等于完成实现或真实服务验收。

原文完整性基线：`SHA-256 e7a71741e4f10f33580c634a5ab19aafd3cfe8d3446947ae7a438d81e7005a7f`。保留全部正文、表格、线框图、V1/V2 决策与末尾待定项；完整性检查忽略本次增加的 Markdown 标题前缀、空行和代码围栏，逐行比较其余内容。

## 设计原文完整副本

<!-- reference-content:start -->
觉得在做高保真一点的桌面版主界面线框图的时候，需要在里面说明每个元素是怎么展示的，比如用户对话的内容像chatgpt这种蓝色圆角边框，然后每次思考行动输出中间以横线隔开，sessions选中时加深颜色这种agent一下想不到的设计细节，你可以在画图的时候提及或者在下方标注，可以切换到工作模式完成这个任务
好，这次我切到更偏 “工作模式 / 设计说明模式” 来做。
我不只画区域，还会把你刚才说的那类 展示细节、状态变化、边框、分隔方式、选中态、消息样式 一起写进去。

下面我先给你一版：

高保真一点的桌面版主界面线框图（带展示说明）
我会分成 4 部分：

主界面线框图
图中编号对应的展示规则
关键组件的状态设计
我对这版的设计意图说明

### 1）主界面高保真线框图（Desktop Main Workspace）

这是一张“日常主工作台”版本
默认场景：用户打开一个 coding agent session，正在与 agent 协作改代码


```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [01] LOGO  AllTheCodes        Project: allthecodes-web    Branch: main    Env: SSH/Linux    Runtime ● Healthy    [Search]  │
│                                                                                                                [Bell] [Me] │
├──────┬───────────────────────────────────────┬──────────────────────────────────────────────────────┬────────────────────────┤
│      │                                       │                                                      │                        │
│ [02] │ [03] 左侧资源栏                        │ [04] 中央主工作区                                     │ [05] 右侧工作栏         │
│ 导航 │                                       │                                                      │                        │
│ 轨   │  ┌─────────────────────────────────┐  │  ┌────────────────────────────────────────────────┐  │  ┌──────────────────┐  │
│      │  │ + New Session   + New Task      │  │  │ Session: Refactor Auth Flow                    │  │  │ Tabs             │  │
│ [C]  │  ├─────────────────────────────────┤  │  │ Task: Auth Module / Session #12                │  │  │ [Changes]*       │  │
│ [P]  │  │ Search Sessions...              │  │  │ Agent: Codex   Mode: Agent   Status: Running ● │  │  │ [Files]          │  │
│ [S]  │  ├─────────────────────────────────┤  │  │ [Stop] [Pause] [Fork] [Checkpoint] [···]       │  │  │ [Plan]           │  │
│ [A]  │  │ Projects                        │  │  └────────────────────────────────────────────────┘  │  │ [Context]        │  │
│ [O]  │  │                                 │  │                                                      │  │ [Agents]         │  │
│ [⚙] │  │  allthecodes-web                 │  │  ┌────────────────────────────────────────────────┐  │  ├──────────────────┤  │
│      │  │  ├─ Auth Module                 │  │  │ [06] Chat Timeline                              │  │  │ Changes Summary  │  │
│      │  │  │  ├─ █ Refactor Auth Flow     │  │  │                                                │  │  │                  │  │
│      │  │  │  ├─ ░ Fix Middleware Tests   │  │  │  You                                            │  │  │ 3 files changed  │  │
│      │  │  │  └─ ✓ Cookie Cleanup         │  │  │  ╭──────────────────────────────────────────╮   │  │  │ + auth.ts        │  │
│      │  │  ├─ API Layer                   │  │  │  │ 重构 auth 模块，并补充测试。              │   │  │  │ + middleware.ts  │  │
│      │  │  └─ Unassigned Sessions         │  │  │  ╰──────────────────────────────────────────╯   │  │  │ + auth.test.ts   │  │
│      │  │                                 │  │  │                                                │  │  ├──────────────────┤  │
│      │  │ Recent Sessions                 │  │  │  Agent                                          │  │  │ Quick Preview    │  │
│      │  │                                 │  │  │  ┌──────────────────────────────────────────┐   │  │  │                  │  │
│      │  │  ● Refactor Auth Flow           │  │  │  │ 我先分析认证流程，再修改中间件与测试。    │   │  │  │ auth.ts          │  │
│      │  │  ○ API Contract Cleanup         │  │  │  └──────────────────────────────────────────┘   │  │  │ ---------------- │  │
│      │  │  ✓ Review Session Tree          │  │  │                                                │  │  │ - old code       │  │
│      │  │                                 │  │  │  ────────────────────────────────────────────  │  │  │ + new code       │  │
│      │  │ Attention                       │  │  │  [Thinking]                                     │  │  ├──────────────────┤  │
│      │  │  ! 2 Sessions Need Approval     │  │  │  Analyzing middleware dependencies...          │  │  │ Plan             │  │
│      │  │  ! 1 Failed Test Run            │  │  │  (浅色背景 + 小号字 + 可折叠)                   │  │  │ 1. Analyze   ✓   │  │
│      │  └─────────────────────────────────┘  │  │                                                │  │  │ 2. Refactor  ●   │  │
│      │                                       │  │  ────────────────────────────────────────────  │  │  │ 3. Test      ○   │  │
│      │                                       │  │  [Action] Shell                                 │  │  ├──────────────────┤  │
│      │                                       │  │  ┌──────────────────────────────────────────┐   │  │  │ Context          │  │
│      │                                       │  │  │ $ npm run test:unit                       │   │  │  │ @auth.ts         │  │
│      │                                       │  │  │ ✓ 42 passed   ✕ 2 failed                  │   │  │  │ @middleware.ts   │  │
│      │                                       │  │  └──────────────────────────────────────────┘   │  │  │ AGENTS.md        │  │
│      │                                       │  │                                                │  │  │ session memory   │  │
│      │                                       │  │  ────────────────────────────────────────────  │  │  └──────────────────┘  │
│      │                                       │  │  [Output] Summary                              │  │                        │
│      │                                       │  │  ┌──────────────────────────────────────────┐   │  │                        │
│      │                                       │  │  │ 已完成中间件重构；当前剩余 2 个测试失败。 │   │  │                        │
│      │                                       │  │  │ 建议下一步：修复 token mock 与 cookie case│   │  │                        │
│      │                                       │  │  └──────────────────────────────────────────┘   │  │                        │
│      │                                       │  │                                                │  │                        │
│      │                                       │  │  [Approval Card]                               │  │                        │
│      │                                       │  │  ┌──────────────────────────────────────────┐   │  │                        │
│      │                                       │  │  │ Run command requiring permission:         │   │  │                        │
│      │                                       │  │  │ npm run test:integration                  │   │  │                        │
│      │                                       │  │  │ [Allow once] [Allow this session] [Deny]  │   │  │                        │
│      │                                       │  │  └──────────────────────────────────────────┘   │  │                        │
│      │                                       │  ├────────────────────────────────────────────────┤  │                        │
│      │                                       │  │ [07] Composer                                 │  │                        │
│      │                                       │  │ [ +Context ] [ @Files ] [ /Commands ]        │  │                        │
│      │                                       │  │ ╭──────────────────────────────────────────╮   │  │                        │
│      │                                       │  │ │ Ask agent to continue or review changes...│   │  │                        │
│      │                                       │  │ ╰──────────────────────────────────────────╯   │  │                        │
│      │                                       │  │ [Agent: Codex ▼] [Mode: Agent ▼] [GPT-6 ▼] │  │                        │
│      │                                       │  │ [Manual Approval ▼]                [Send]    │  │                        │
│      │                                       │  └────────────────────────────────────────────────┘  │                        │
├──────┴───────────────────────────────────────┴──────────────────────────────────────────────────────┴────────────────────────┤
│ [08] Bottom Panel:  [Terminal]*   [Tests]   [Problems]   [Events]   [Logs]   [Metrics]                                    │
│      > npm run test:unit                                                                                                     │
│      PASS auth/login.test.ts                                                                                                 │
│      FAIL auth/cookie.test.ts                                                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


### 2）图中编号对应的展示规则

下面这部分是最关键的。
不是只告诉你“这里放什么”，而是告诉你 “它看起来应该怎样”。


#### [01] 顶部全局栏（Global Header）

展示形式
高度建议：48–56px
背景：纯色浅底（比如很浅的灰）
下边加 1px 分割线
内容横向排列，左右两侧对齐
具体细节
Project / Branch / Env / Runtime 建议用 小胶囊标签
例如：
main：灰色胶囊
SSH/Linux：蓝灰胶囊
Runtime Healthy：绿色状态点 + 文字
Search 做成 窄长搜索框
Bell / Me 放右上角，不抢视觉重心
视觉原则
顶栏不是重点，不要太花
重点是让用户一眼知道：
现在在哪个项目
现在在哪个分支
现在连的是本地还是远程
runtime 是否健康

#### [02] 左侧导航轨（Activity Rail）

展示形式
宽度建议：56px
每个图标上下排列
图标按钮为 圆角方块 或 轻圆按钮
当前选中项：
背景色加深
左侧或内侧有一条 高亮竖条
图标颜色更实
交互状态
默认：浅灰图标
Hover：背景浅灰
Active：
背景变深 1 级
图标主色高亮
可加左侧 3px 高亮条
设计建议
不要做得像纯 IDE 那样太冷，也不要太像网站侧栏。
应该更像 “桌面应用的功能导航轨”。


#### [03] 左侧资源栏（Sessions / Projects Sidebar）

这是你 app 非常关键的部分。


##### 3.1 顶部按钮区

+ New Session
+ New Task
展示建议
两个按钮都用 中等圆角按钮
New Session 用主按钮样式
New Task 用次按钮样式
放在卡片式区域里，下面再接搜索框

##### 3.2 搜索框

高度：32–36px
浅灰底
左侧有搜索图标
圆角：8–10px
输入内容为空时显示 placeholder：Search Sessions...

##### 3.3 项目树 / 会话树展示规则

层级展示
Project

```text
 └─ Task Group
    └─ Session
```

建议样式
Project：字重稍高，颜色更深
Task Group：普通文本 + 可展开箭头
Session：列表项，支持 hover / selected / running / done 状态

##### 3.4 Session 列表项的状态设计（你刚才特别提到这个）

默认态
高度：32–40px
圆角：8px
左侧状态图标或状态点
文字一行，溢出省略
背景透明
Hover 态
背景：浅灰或浅主色底
鼠标移上去能明显感到可点
Selected 态
你说的“sessions 选中时加深颜色”，我建议这样做：

整个项背景加深（但不要过深）
左侧加一条 2–3px 主色竖条
标题字重提高
状态点更亮
可以加微弱内阴影或描边，突出“当前工作对象”
Running 态
左侧是 ● 实心状态点
颜色偏绿色或蓝绿色
如果要更生动，可有轻微呼吸感（后续再做动画）
Waiting / Idle 态
空心圆 ○
中灰色
Done 态
✓
淡绿色或灰绿色
整体透明度略低
Need Attention 态
!
橙色/红色提示
整行可出现轻微浅红底

#### [04] 中央主工作区（Chat Workspace）

这里是整个产品视觉与交互的核心。

我建议把它分成三段：

Session Header
Chat Timeline
Composer

#### [04-A] Session Header

展示形式
作为中央区域顶部的独立卡片/条形区
底部加 1px 分隔线
左边放标题和元信息
右边放控制按钮
元信息展示
Session Title：较大字号，字重 600
第二行：
Task: xxx
Agent: Codex
Mode: Agent
Status: Running
这些都适合做成 轻标签 + 文本 混排
操作按钮
Stop / Pause / Fork / Checkpoint / More
都建议做成 小型圆角按钮
Stop 可偏警示色
其他为浅灰描边按钮

#### [06] Chat Timeline：消息与过程展示规则

这部分我要拆开讲，因为这是你最在意的。


##### 6.1 用户消息（User Message）

你举的例子是：
像 ChatGPT 这种蓝色圆角边框

我建议这样设计：

样式
右对齐或居中偏右
蓝色浅底 / 品牌主色浅底
圆角明显：14–18px
内边距较大：12–16px
最大宽度：60%–72%
文字为深色，确保阅读性
效果
You

```text
╭──────────────────────────────────────────╮
│ 重构 auth 模块，并补充测试。              │
╰──────────────────────────────────────────╯
```

为什么这样做
用户说的话要一眼与 Agent 分开
蓝色浅底能自然形成“发出指令”的感受
但不要过于鲜艳，否则会压过 agent 输出

##### 6.2 Agent 普通回复（Agent Response）

样式
左对齐
不要用和用户一样的气泡
更适合做成 纯白/浅灰底的内容卡片
圆角比用户气泡略小或相同
标题上方显示 Agent 或 Codex
结构
Agent

```text
┌──────────────────────────────────────────┐
│ 我先分析认证流程，再修改中间件与测试。    │
└──────────────────────────────────────────┘
```

理由
Agent 输出通常更长、更结构化，
所以用“卡片”比“聊天气泡”更适合承载计划、日志、总结。


##### 6.3 Thinking / Action / Output 的分段方式

你刚才明确提到：

每次思考行动输出中间以横线隔开

我非常赞同。
这会大幅提升可读性。

推荐结构
每一轮 Agent 工作，以一个“Turn”呈现：

Thinking
Action
Output
中间全部用 横向分割线 隔开：


```text
────────────────────────────────────────────
```

[Thinking]
Analyzing middleware dependencies...


```text
────────────────────────────────────────────
```

[Action] Shell
$ npm run test:unit
✓ 42 passed   ✕ 2 failed


```text
────────────────────────────────────────────
```

[Output]
已完成中间件重构；当前剩余 2 个测试失败。
每部分怎么展示？
Thinking
背景：非常浅的灰蓝色 / 灰色
字号：比正文略小
可以默认展开，也可以支持折叠
顶部有小标签：Thinking
Action
使用“工具卡片”样式
顶部写：
[Action] Shell
[Action] Edit File
[Action] Read File
内部内容用等宽字体或结构化摘要
有时只展示摘要，点开再看详情
Output
最终输出建议单独放一个清晰的总结卡片
比 Thinking 更强调
可以包含：
做了什么
结果如何
下一步建议

##### 6.4 Tool Card（行动卡片）设计

当 Agent 实际执行动作时，不要把它当普通文字展示。
要做成 “卡片化的动作记录”。

例如 Shell Card
[Action] Shell

```text
┌──────────────────────────────────────────┐
│ $ npm run test:unit                      │
│ ✓ 42 passed   ✕ 2 failed                 │
└──────────────────────────────────────────┘
```

例如 File Edit Card
[Action] Edit File

```text
┌──────────────────────────────────────────┐
│ middleware.ts                            │
│ +32 lines   -8 lines                     │
│ View Diff                                │
└──────────────────────────────────────────┘
```

状态色
成功：绿色细点缀
失败：红色/橙色边框点缀
进行中：蓝色或品牌色点缀

##### 6.5 Approval Card（权限请求卡片）

这是 coding agent app 很重要的组件。

展示建议
使用浅黄底 / 警示色边框
按钮清晰、不要挤
一眼能看出“现在要你决策”
Run command requiring permission:
npm run test:integration

[Allow once] [Allow this session] [Deny]
规则
必须强视觉突出
不能被折叠到用户看不到
这类卡片出现时，整个 session 条目也可同步出现 Attention 标记

#### [07] Composer（输入区）

这部分不要只做输入框，要做成“控制台式输入组件”。


##### 7.1 上方快捷操作行

+Context
@Files
/Commands
样式
小胶囊按钮
Hover 时变浅色背景
点击后弹出选择器

##### 7.2 主输入框

展示形式
比普通聊天框更大一点
多行输入
圆角大概：12–14px
浅描边
聚焦时主色描边更明显
占位提示
比如：

Ask agent to continue or review changes...

##### 7.3 底部控制行

Agent: Codex
Mode: Agent
Model: GPT-6
Manual Approval
Send
样式
前四个用下拉胶囊
Send 用主按钮
如果在运行中，可把 Send 换成 Queue 或 Steer

#### [05] 右侧工作栏（Changes / Files / Plan / Context）

这块应该像“工作抽屉”，不是第二聊天栏。

顶部 Tabs
样式
一行 tab
当前 tab 有：
深色文字
下划线或胶囊高亮
建议默认固定：
Changes
Files
Plan
其他放后面或折叠在更多菜单中
Changes 面板
最适合默认打开。

列表项
文件名
修改行数
状态图标
点击可打开 diff 预览
快速预览
下方显示一小段 diff
等宽字体
+ - 行分色显示
Plan 面板
适合用 Checklist 卡片
已完成：✓
进行中：●
未开始：○
当前项可以稍微加深背景
Context 面板
显示附加上下文
例如：
auth.ts
middleware.ts
AGENTS.md
Session memory
展示建议
每个 context 项用小标签条目
有删除按钮 ×
可以显示 token 占用的简要数字（后期）

#### [08] Bottom Panel（Terminal / Tests / Logs）

展示形式
独立底部面板
顶部是 tab 切换
默认高度：180–240px
可折叠、可拖拽高度
tabs 建议
Terminal
Tests
Problems
Events
Logs
Metrics
展示细节
用等宽字体
深浅对比明显
保持“开发工具”质感
但不要太像原始命令行黑框，最好是稍柔和的终端面板风格

### 3）关键组件状态设计（建议你后面直接沉淀成设计规范）

下面这些状态非常值得你做成统一规则。


##### A. Session Item 状态规范

状态	展示
默认	透明底，普通字重
Hover	浅灰底
Selected	加深背景 + 左侧主色竖条 + 字重提高
Running	左侧实心状态点 ●
Done	✓ + 降低视觉权重
Attention	! + 浅警示底色

##### B. Message 规范

类型	样式
User Message	蓝色浅底圆角气泡
Agent Intro / Reply	白底或浅灰卡片
Thinking	浅色弱化区块，可折叠
Action	工具卡片，边框更明确
Output	总结卡片，视觉权重高
Approval	浅黄/警示色卡片

##### C. Divider 规范

你刚才说的横线隔开，我建议统一成：

每个 major section 之间：1px 分割线 + 上下 12–16px 留白
不同 thinking / action / output 间：
用细横线
横线左上有 section label
效果类似：


```text
────────────────────────────────────
```

[Thinking]
...


```text
────────────────────────────────────
```

[Action]
...


```text
────────────────────────────────────
```

[Output]
...
这样会比只靠背景色更清楚。


##### D. Button 规范

类型	用途	样式
Primary	Send / New Session	主色填充
Secondary	New Task / Open Diff	轻描边
Quiet	Fork / Checkpoint	透明底 hover 高亮
Danger	Stop / Delete	警示色

### 4）这版设计的意图

这张高保真一点的线框图，本质上强调 4 个目标：

目标 1：让“对话”仍然是核心
所以：

中间最大
用户消息和 agent 输出有清楚区分
thinking/action/output 明确分层
目标 2：让“coding 工作结果”随手可见
所以：

右侧默认就是 Changes
不需要跳出去才能知道 agent 改了什么
目标 3：让“会话管理”变成可持续工作方式
所以：

左侧不是简单历史列表
而是 project / task / session 三层结构
同时支持 recent 和 attention
目标 4：让“Agent 的过程”可追踪、可审查、可决策
所以：

tool card 要卡片化
approval 要突出
bottom panel 保留底层真实输出
session item 可以反映 attention 状态
最后：如果你愿意，我下一步可以继续直接画这 3 张更细的图
我建议下一轮直接做下面三张，因为会非常有用：


##### A. 「中央聊天工作区」超详细图

只画 chat timeline + composer，细到：

用户气泡
agent 卡片
tool card
approval card
queue / steer / stop 状态

##### B. 「左侧 Session / Task 树」超详细图

只画左边，细到：

project 展开态
session 选中态
hover 态
running / done / blocked
attention inbox

##### C. 「右侧 Changes / Files / Plan」超详细图

只画右边，细到：

tab 样式
diff 预览
checklist 样式
context 标签样式
如果你想，我下一条就直接继续给你画这三张。
我也可以进一步做成这种格式：

图
下方标注
设计理由
适合前端实现的组件拆分
如果你愿意，我建议下一步我先画 A：中央聊天工作区超详细图。

画 A：中央聊天工作区超详细图。


思考了 2m 48s
继续迭代 Coding Agent 中央聊天工作区设计。以下是我选择保留的设计规则：用户消息采用浅蓝色右对齐气泡；Thinking / Action / Output 使用细横线分段；Plan 在聊天内显示摘要，详细计划由侧栏承载；Composer 固定底部，运行时切换到 Queue / Steer；Read / Search 默认折叠，Edit / Test 优先展示。以下规则希望重新设计：无。请基于这些决策给出第二版更精细的文本线框图。

### Coding Agent Chat Workspace — 高精度文本线框图 V2

这版沿用你已经确定的五项设计规则，并进一步明确元素的像素位置、视觉样式、排列间距、组件状态、交互反馈和滚动行为。目标是让前端 Agent 能够直接依据这些描述实现界面，而不需要自行猜测细节。

本轮以 1440 × 900 的桌面窗口为基准，中央聊天区预计占用 760–850px 宽度。

#### 一、完整中央聊天区

图 A2-01 · 默认完成态。`①` 至 `⑧` 对应下方的设计规范。外层框线代表区域边界，实际 UI 不必全部绘制边框。

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ① SESSION HEADER                                      Height: 64px · Sticky      │
│                                                                                  │
│   Refactor Authentication Flow                           [⌕] [Fork] [···]       │
│   ✓ Completed  ·  Codex  ·  feature/auth  ·  SSH                    [History]       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ② CHAT SCROLL VIEW                                  Scroll: vertical · flex: 1    │
│                                                                                  │
│                  ────────────  Today, October 9  ────────────                    │
│                                                                                  │
│                                                           10:42                  │
│                          ╭────────────────────────────────────────────────╮      │
│                          │ 请重构认证模块，并修复测试。                 │      │
│                          │ 保持已有 API 接口不变。                     │      │
│                          ╰────────────────────────────────────────────────╯      │
│                                                                                  │
│                          ↑ ③ USER BUBBLE                                        │
│                            浅蓝填充 · R16 · 右对齐                               │
│                                                                                  │
│   ◉ Codex                                              Run completed · 10:46     │
│                                                                                  │
│   我会先检查现有实现，然后尽可能小范围地调整认证逻辑。                         │
│                                                                                  │
│   ┌─ ④ PLAN SUMMARY ─────────────────────────────────────────────────────┐       │
│   │  ✓ Analyze    ✓ Refactor    ✓ Verify                3/3  [Plan ↗]    │       │
│   └───────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│   ── ⑤ THINKING  ·  Progress summary  ──────────────────────────────────         │
│                                                                                  │
│   ▾  已完成分析 · 4.2s                                                           │
│      发现 token 校验逻辑重复，主要涉及 3 个文件。                                │
│      [Details ⌄]                                                                │
│                                                                                  │
│   ── ⑥ ACTION  ·  Tool activity  ────────────────────────────────────────         │
│                                                                                  │
│   ▸  Read 3 files · Search 4 matches                     ✓ 1.8s                  │
│                                                                                  │
│   ╭─ </> Edited files ─────────────────────────────────────────────────╮         │
│   │                                                                    │         │
│   │  auth.ts                  +32  -12                                 │         │
│   │  middleware.ts            +18   -6                                 │         │
│   │  auth.test.ts             +24   -0                                 │         │
│   │                                                                    │         │
│   │  ✓ Applied · 3 files                             [View diff ↗]    │         │
│   ╰────────────────────────────────────────────────────────────────────╯         │
│                                                                                  │
│   ╭─ >_ npm run test:unit ─────────────────────────────── ✓ Exit 0 ────╮         │
│   │                                                                    │         │
│   │  ✓ 44 passed    0 failed                             8.4s        │         │
│   │                                                                    │         │
│   │  [View output ⌄]                       [Open in Terminal ↗]        │         │
│   ╰────────────────────────────────────────────────────────────────────╯         │
│                                                                                  │
│   ── ⑦ OUTPUT  ·  Final response  ──────────────────────────────────────         │
│                                                                                  │
│   已完成认证模块重构，并保留原有 API 行为。                                     │
│                                                                                  │
│   **Changes**                                                                    │
│   • 提取公共 token 校验逻辑                                                     │
│   • 简化 middleware 中的重复判断                                                │
│   • 补充相关单元测试                                                            │
│                                                                                  │
│   **Verification**                                                               │
│   ✓ 44 tests passed                                                             │
│                                                                                  │
│   [Copy] [View Changes ↗] [Fork from here]                                      │
│                                                                                  │
│                             End of conversation                                 │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ⑧ COMPOSER                                            Sticky · Bottom            │
│                                                                                  │
│   ╭──────────────────────────────────────────────────────────────────────╮       │
│   │                                                                      │       │
│   │  Ask a follow-up question...                                         │       │
│   │                                                                      │       │
│   │  [+] [@ Files] [/ Commands]                                         │       │
│   │                                                                      │       │
│   │  [Codex ▾] [Model ▾] [Agent ▾] [Permission ▾]          [↑ Send]      │       │
│   ╰──────────────────────────────────────────────────────────────────────╯       │
│                                                                                  │
│              Enter to send · Shift+Enter for new line                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

##### A2-01 对应的布局规范

| 编号 | 元素               | 具体设计                              |
| -- | ---------------- | --------------------------------- |
| ①  | Session Header   | 高 64px，底部 1px 分割线，不随消息滚动          |
| ②  | Chat Scroll View | 独立滚动，内容列最大宽 760px，水平居中            |
| ③  | User Bubble      | 靠右，浅蓝背景，16px 圆角，最多占内容宽的 72%       |
| ④  | Plan Summary     | 浅灰背景、10px 圆角，只显示阶段与完成数量           |
| ⑤  | Thinking         | 无外层卡片，12–13px 弱化文字，可折叠的公开进度摘要     |
| ⑥  | Action           | Read/Search 默认单行，Edit/Test 采用显式卡片 |
| ⑦  | Output           | 普通 Markdown 排版，不加大面积灰底            |
| ⑧  | Composer         | 固定底部，主输入容器 16px 圆角，内容增长时自动增高      |

一处重要设计决策： Agent 的所有内容都左对齐，但 Agent 正文不使用和用户一样的聊天气泡。用户指令和 Agent 工作过程因此具有明显的视觉差异。

#### 二、Thinking / Action / Output 的细节排版

图 A2-02 · Agent Turn。只画一次完整执行，突出横线、文字层级及工具卡片。

```
  ◉  Codex                                   ● Running · 28s
  │
  │  我先分析 auth 模块的依赖关系。
  │
  │  ─── Thinking ────────────────────────────────────
  │
  │  ▾ Analysis summary                     4.2s
  │
  │    发现 2 处重复验证逻辑。
  │    需要修改 auth.ts 和 middleware.ts。
  │
  │    [Show more]
  │
  │  ─── Action ──────────────────────────────────────
  │
  │  ▸ Read / Search       7 calls        ✓ 2.1s
  │
  │  ┌────────────────────────────────────────────┐
  │  │ </> Edit Files                   ✓ 3.2s    │
  │  │                                            │
  │  │ auth.ts                  +32 -12           │
  │  │ middleware.ts            +18  -6           │
  │  │                                            │
  │  │                            [View Changes]  │
  │  └────────────────────────────────────────────┘
  │
  │  ┌────────────────────────────────────────────┐
  │  │ >_ npm run test:unit          ✕ Exit 1     │
  │  │                                            │
  │  │ ✓ 42 passed        ✕ 2 failed             │
  │  │                                            │
  │  │ [View failed tests]     [Full Output ⌄]   │
  │  └────────────────────────────────────────────┘
  │
  │  ─── Thinking ────────────────────────────────────
  │
  │  ▾ Fix strategy
  │    两个失败均涉及旧的测试 Mock。
  │
  │  ─── Action ──────────────────────────────────────
  │
  │  ┌────────────────────────────────────────────┐
  │  │ </> Edit auth.test.ts           ✓ 1.3s    │
  │  │ >_ npm run test:unit            ✓ 7.8s    │
  │  │                                            │
  │  │ ✓ 44 passed        0 failed                │
  │  └────────────────────────────────────────────┘
  │
  │  ─── Output ──────────────────────────────────────
  │
  │  **Completed**
  │
  │  已修复认证模块及相关测试。
  │
  │  ✓ 3 files updated
  │  ✓ 44 tests passed
  │
  └── [Copy] [View Diff] [Run Details]
```

##### 对分割线的进一步建议

这里与 V1 有一个小改进：横线只标记阶段转换，而不是每一次工具调用都画一条。

一次执行可以经历：

`Thinking → Action → Thinking → Action → Output`

并不要求整个 Run 只能有一次 Thinking、一次 Action。这样能够保留执行过程的时间顺序，也不会产生大量不必要的横线。

横线建议使用 1px `#E5E7EB`，标签采用 11–12px、600 字重、弱化颜色。分割线上下分别留出 14–18px；不建议同时用彩色背景强调阶段标题。

此外，Thinking 区域只能展示 Agent 实际提供的公开分析摘要和进度，不能把推测的内部思维链当作真实记录。

#### 三、不同工具卡片的精细设计

##### A2-03：Read / Search 默认折叠

```
  ▸  Read / Search · 7 operations                ✓ 2.1s
```

展开后：

```
  ▾  Read / Search · 7 operations                ✓ 2.1s
     │
     ├─ ✓ Read      src/auth/middleware.ts
     ├─ ✓ Read      src/auth/token.ts
     ├─ ✓ Search    "verifyToken" · 4 matches
     ├─ ✓ Read      src/auth/utils.ts
     └─ 3 more operations...          [Show all]
```

默认只占一行，没有完整卡片边框。点击后使用轻灰背景包裹展开内容。文件路径使用等宽字体，长路径从中间省略，悬停显示完整路径。

##### A2-04：Edit Files

```
╭──────────────────────────────────────────────────────────────╮
│  </>  Edited Files                              ✓ Applied    │
│──────────────────────────────────────────────────────────────│
│                                                              │
│  [TS]  middleware.ts                        +18  -6          │
│        src/auth/middleware.ts                                │
│                                                              │
│  [TS]  auth.ts                              +32  -12          │
│        src/auth/auth.ts                                      │
│                                                              │
│──────────────────────────────────────────────────────────────│
│  2 files changed                           [Review Diff ↗]   │
╰──────────────────────────────────────────────────────────────╯
```

文件图标与扩展名关联；新增行数字使用绿色，删除行数字使用红色，但文件名保持普通文字色。卡片右上显示真实执行状态，不用大面积绿色背景表示成功。

点击文件行时，在右侧 Editor Surface 打开对应 Diff，而不是强行把完整 Diff 展开到聊天时间线。

##### A2-05：Shell / Test

```
╭──────────────────────────────────────────────────────────────╮
│  >_  npm run test:unit                         ✕ Exit 1     │
│  ~/projects/allthecodes-web                       8.4s     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✓ 42 passed     ✕ 2 failed                                 │
│                                                              │
│  FAIL  auth/cookie.test.ts                                   │
│        Expected: 401 · Received: 403                        │
│                                                              │
│  FAIL  auth/token.test.ts                                    │
│        Invalid token mock                                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [Copy] [Retry]             [Open Tests ↗] [Full Output ⌄]  │
╰──────────────────────────────────────────────────────────────╯
```

命令标题是 13px 等宽字体；工作目录是 11–12px 的辅助文字；退出码采用状态标识。失败测试应当可点击并跳转到对应文件或测试报告。

`Retry` 只在能够安全、明确地重放该操作时提供。否则使用 `Ask Agent to Retry`，避免用户误以为可以无条件重放原始命令。

### 四、Composer 应该怎样精确排列？

#### A2-06：Idle 状态

```
           Composer · width = chat column width
╭────────────────────────────────────────────────────────────────╮
│                                                                │
│  Ask Agent to implement, explain or review...                  │
│                                                                │
│                                                                │
│  [+] [@ Context] [/ Commands] [Attach]                         │
│                                                                │
│  [Codex ▾] [GPT-6 ▾] [Agent ▾] [Permissions ▾]    [ ↑ Send ]    │
╰────────────────────────────────────────────────────────────────╯

         Enter to send · Shift+Enter new line
```

Composer 内部使用一个完整容器，不要让模型选择、权限选择各自变成厚重的大按钮。底部的下拉选择器建议使用无描边的紧凑胶囊，Hover 时才显示淡灰背景。

##### A2-07：Running 状态

```
  ● Codex is working  ·  Editing middleware.ts       [■ Stop]

╭────────────────────────────────────────────────────────────────╮
│  修改完成后运行完整单元测试。                                │
│                                                                │
│  [@auth.test.ts ×]                                            │
│                                                                │
│  [+] [@] [/]                                                  │
│                                                                │
│  [Codex ▾] [Agent ▾] [Queue ▾]              [↑ Add to Queue]  │
╰────────────────────────────────────────────────────────────────╯

  Queued messages (2)                                    [⌄]
  ①  完成后执行 typecheck                         [✎] [×]
  ②  总结改动及测试结果                           [✎] [×]
```

Queue 列表应当在 Composer 之外，以窄条目展开，最多默认显示两条，避免输入区域高度不断膨胀。

当 Agent Adapter 支持实时干预时，可以切换模式：

运行中输入模式切换

QueueSteer Now

排队发送

当前消息将在本轮执行结束后发送，适合补充下一步任务。

&#x20;复制模式说明

重要： 运行中切换 Queue 或 Steer 不应该改变输入框的形状，也不应该清除用户已经输入的文字。支持能力应根据实际 Agent Adapter 动态判断。

### 五、Approval 请求应该如何出现？

图 A2-08 · 权限请求是时间线中的独立事件，同时在 Composer 上方显示一个简短提醒。

```
           CHAT TIMELINE

  ─── Action ──────────────────────────────────────────────

  ╭─ ! Permission Required ─────────────────────────────╮
  │                                                      │
  │  Codex requests permission to run a command.        │
  │                                                      │
  │  Command                                             │
  │  ┌────────────────────────────────────────────────┐  │
  │  │ npm run test:integration                       │  │
  │  └────────────────────────────────────────────────┘  │
  │                                                      │
  │  Working directory: ~/projects/allthecodes-web      │
  │                                                      │
  │  [Deny]                 [Allow Once] [More Options ▾] │
  ╰──────────────────────────────────────────────────────╯

                  ... conversation scroll ...


           ABOVE COMPOSER · ATTENTION STRIP

  ┌──────────────────────────────────────────────────────┐
  │ ! 1 permission request waiting         [Review ↑]   │
  └──────────────────────────────────────────────────────┘

  ╭──────────────────────────────────────────────────────╮
  │  Composer remains available...                       │
  ╰──────────────────────────────────────────────────────╯
```

这个双层设计可以解决一个问题：如果用户正在向上翻看聊天历史，权限卡片可能不在视口内。Composer 上方的提醒条应该保留可发现性，点击后滚动定位到对应的权限请求。

授权完成后，提醒条消失，时间线中的权限卡片保留为只读审计记录。

### 六、滚动区域与悬浮操作

#### A2-09：用户阅读历史时有新内容到达

```
┌─────────────────────────────────────────────────────────┐
│ Session Header                             [···]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Earlier messages...                                   │
│                                                         │
│   Tool output...                                        │
│                                                         │
│   User is reading here                                 │
│                                                         │
│                                                         │
│                          ┌───────────────────────────┐  │
│                          │ ↓ 5 new activities        │  │
│                          └───────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ Composer                                                │
└─────────────────────────────────────────────────────────┘
```

行为必须明确：用户位于底部附近时自动跟随新内容；一旦用户主动向上滚动，停止自动跟随，并显示悬浮的 `New Activities` 按钮。

按钮放在 Composer 上方、聊天内容列右下角，不遮挡输入框。点击后滚动至最新消息，而不是跳转到另一个页面。

#### A2-10：用户消息 Hover

```
                                        10:42
                    ╭────────────────────────────────────╮
                    │ 修复 token 校验的相关测试。       │
                    ╰────────────────────────────────────╯
                            [↩ Quote] [✎ Edit] [Copy]
```

操作栏应当出现在消息下方，向右对齐，而不是盖在气泡内容上。Edit 的行为应清晰定义：编辑原消息后是重新生成分支，还是发送一条新指令，不要默认静默修改已经执行的历史。

### 七、第二版 Design Tokens

下面是建议固定下来的第一批基础变量。

| Token                     | 数值        | 用途          |
| ------------------------- | --------- | ----------- |
| `chat.content.maxWidth`   | 760px     | 对话主内容列      |
| `chat.header.height`      | 64px      | 固定 Header   |
| `chat.message.maxWidth`   | 72%       | 用户气泡最大宽     |
| `chat.message.radius`     | 16px      | 用户气泡圆角      |
| `chat.message.padding`    | 12px 16px | 气泡内边距       |
| `chat.turn.gap`           | 32px      | 相邻对话 Turn   |
| `chat.phase.gap`          | 18px      | 阶段分割上下间距    |
| `chat.divider.color`      | `#E5E7EB` | 细横线         |
| `chat.user.background`    | `#EDF4FF` | 用户气泡浅蓝底     |
| `chat.user.border`        | `#DBEAFE` | 用户气泡描边      |
| `chat.tool.background`    | `#F8FAFC` | 工具卡片背景      |
| `chat.tool.radius`        | 10px      | 工具卡片圆角      |
| `chat.composer.radius`    | 16px      | Composer 外框 |
| `chat.composer.maxHeight` | 300px     | 输入框最大高度     |
| `chat.body.fontSize`      | 14px      | 正文字号        |
| `chat.body.lineHeight`    | 1.6       | 正文行距        |
| `chat.meta.fontSize`      | 12px      | 状态、时间等元数据   |

### 八、最终实现时的区域层级

```
ChatWorkspace
│
├── SessionHeader  [Sticky Top]
│
├── ChatViewport   [Scroll Container]
│   │
│   ├── ConversationContent  [Max Width 760px]
│   │   ├── DateSeparator
│   │   │
│   │   ├── UserMessage
│   │   │   ├── Bubble
│   │   │   ├── Attachments
│   │   │   └── HoverActions
│   │   │
│   │   ├── AgentTurn
│   │   │   ├── AgentIdentity
│   │   │   ├── IntroText
│   │   │   ├── PlanSummary
│   │   │   ├── ThinkingSection
│   │   │   ├── ActionSection
│   │   │   │   ├── CollapsedToolGroup
│   │   │   │   ├── EditCard
│   │   │   │   ├── ShellCard
│   │   │   │   └── TestCard
│   │   │   ├── OutputSection
│   │   │   ├── ApprovalCard (optional)
│   │   │   └── TurnActions
│   │   │
│   │   └── RunCompletion
│   │
│   └── FloatingScrollControls
│       ├── JumpToLatest
│       └── NewActivityIndicator
│
└── BottomDock  [Sticky Bottom]
    ├── AttentionStrip (conditional)
    ├── QueuePreview   (conditional)
    ├── Composer
    │   ├── ContextChips
    │   ├── MultilineEditor
    │   ├── ToolShortcuts
    │   ├── AgentModelControls
    │   ├── PermissionControl
    │   └── SendQueueSteerControls
    └── KeyboardHints
```

#### 九、我建议这版保留的几个关键取舍

这次相比第一版，我尤其建议固定以下设计方向：Agent 正文不再套统一大卡片、Thinking 只展示公开进度、工具调用按价值分层、权限请求在滚动和输入时仍然可以被发现、Composer 始终保持稳定。

其中最影响视觉质量的是 不要过度卡片化。如果用户消息、Agent 正文、Thinking、Action、Output 全部都有自己的圆角大框，界面会变成一串相互竞争的矩形区域。将圆角卡片主要留给可操作的工具、计划摘要与授权，让其余内容用排版和横线组织，会更精致，也更利于长期阅读。

下一轮最值得进一步确认的是两个问题：Chat 的 Agent 内容是否还要保留左侧贯穿执行过程的竖向时间线，以及 工具调用是否需要分成紧凑模式和详细模式。这两项会直接决定最终界面更接近 ChatGPT 的干净阅读体验，还是更接近专业 Coding Agent Runtime 的执行控制台。
<!-- reference-content:end -->

## 执行原则与差异声明

以下是依据原文形成的实施声明和执行清单，原文仍在上方完整保留。后续 Agent 先确定本节的适用范围，再实现页面与模块，不能自行混合互相冲突的版本。

### 版本和能力采用规则

1. **中央聊天区采用 V2。** V1 提供完整桌面分区；V2 对聊天细节的修订优先：Agent 正文和 Output 使用开放排版，Thinking 使用公开进度摘要，横线仅标记阶段转换。V1 中“所有 Agent 回复/总结套卡片”的描述保留为原文，不作为当前实施要求。
2. **首个可执行 Agent 为 Pi。** 原图的 Codex、GPT-6、AllTheCodes、示例命令和通过数量是视觉内容样本；真实页面使用 Pi 服务给出的身份、模型、项目、结果和能力。组件演示可以保留明确标记的 fixture。
3. **先完成真实对话与历史。** Pi 首轮只读工具、无 queue/steer/审批/PTY 等能力时，展示支持的动作及必要的不可用说明；不模拟成功、不自动补造 Thinking、计划、测试或修改结果。相关设计在区域 fixture 中单独验证。
4. **同源状态。** 页面的会话、资源、底栏、提醒条共享 sessionId/runId/turnId/toolCallId 等身份。布局切换不重建执行实例，点击“查看”不启动/批准/重试工具。
5. **规范分工。** 原文确定视觉方向和具体布局；仓库设计契约负责基础组件、状态、可访问性和分发。局部例外按下表执行，只作用于 Agent Workspace 示例，不暗改通用组件默认值。
6. **末尾待定项的首版处理。** 不默认绘制贯穿整轮的竖向时间线，保留 V2 的阶段横线；工具采用紧凑摘要与按需展开详情，同一事实源不维护两套正文。后续改变这两项时更新对应模块声明和截图验收。

### 数值与视觉差异登记

| ID | reference 要求 | 本例采用方式与作用域 | 验证要求 |
| --- | --- | --- | --- |
| V01 | 全局栏 48–56px，导航轨 56px | 全局栏 48px；Agent Workspace 示例导航轨 56px 作为局部布局参数，公共 Shell 默认 48px 不变 | 首屏和窄屏无重复空白轨，触摸命中不少于 44px |
| V02 | V2 Session Header 64px | 当前会话双行 Header 基准 64px；窄屏内容必要时增高；不修改全局栏或公共组件的默认 48px | Header 不随消息滚走，不截断状态或控制按钮 |
| V03 | 内容列 760px；用户气泡 72%、R16、12px 16px | 宽屏最大内容宽 760px，气泡靠右、最大 72%、圆角 16px；小屏允许放宽至可用宽度，保留外侧间距 | 长文本、代码、附件可读；无页面横向溢出 |
| V04 | 用户浅蓝 `#EDF4FF` / 描边 `#DBEAFE` | 作为浅色示例参考值；语义化为本例 scoped token，暗色使用对应可读配色；不将固定浅色扩散到所有 ChatMessage | 双主题对比度、选中文字与焦点清楚 |
| V05 | Agent 回复和 Output 的卡片描述与 V2 开放正文有差异 | 按 V2：正文、Thinking、Output 无统一外包大卡片；工具、计划摘要、批准区才有有意义的边界 | 内容层级依赖排版/分隔，长对话不变成嵌套卡片列表 |
| V06 | Divider `#E5E7EB`；阶段间距 14–18px / token 18px | 分隔线映射主题 `--border`，1px；选 16px 上下间距以符合 4px 网格；Turn 间距 32px | 只在实际阶段切换时出现，重复 Thinking/Action 保留顺序 |
| V07 | Session 32–40px、R8、加深选中底色及 2–3px 指示条 | 单行 40px、粗指针至少 44px、双行按公共 56px；本例 R8，左指示条 2px、选中标题加重；不采用可选内阴影 | selected、hover、focus、runtime 可叠加而不混淆，选中不挤动内容 |
| V08 | V1 running 偏绿、waiting/idle 合并灰态 | 保留原文供追溯；实施遵循 `runtime-status.ts`：running 蓝、waiting 琥珀、idle 中性、completed 绿 | 不能从选中或连接颜色推导运行成功；未知状态保留原值 |
| V09 | Plan/Tool R10，Composer R16、最大 300px | 本例计划/工具摘要容器 R10、Composer 外容器 R16 为局部例外；内层 Button/Input 继续遵循公共尺寸；输入最大高度 300px 并受当前视口限制 | 短视口保留输入和主操作，选择器不变成厚重大按钮 |
| V10 | 底栏 180–240px，拖拽与折叠 | 初始 240px，范围沿用 Shell 200–400px；默认收起；与消息滚动独立 | 面板打开/关闭不取消命令，键盘可调整高度 |
| V11 | 元信息 11–12px、Thinking 12–13px | 元信息采用 12px，Thinking 13px，正文 14px / 1.6；阶段标签 12px/600 | 缩放、双语和暗色主题下仍清楚 |
| V12 | 右侧默认 Changes，图中同时展示多个区域 | 有变更时以 Changes 为首选；无变更显示真实空态；默认 Tabs 为 Changes/Files/Plan，其余更多菜单 | 图示不等于强制同时展开所有区域；宽 Diff 放 Main，不挤进窄栏 |

局部 token 在示例私有样式/ThemeBoundary 中声明，值引用共享主题语义。公共组件需要复用这些选项时通过兼容 variant/props 表达，并同步文档和安装验证；不更改其他示例的外观。V01–V12 是本次用户指定参考下的预先声明，无需为这些已明确的例行取舍另起审批流程。

## 页面级设计声明

页面声明先确定“用户在这里完成什么”和区域归属，模块声明再固定区域内部的展示。以下为 Agent Workspace 的首份页面声明；以后修改某页时更新该行及关联模块，不让 Agent 从截图自行猜测。

| 页面 ID 与入口 | 用户目标与设计来源 | 布局、默认展开与尺寸 | 数据和状态责任 | 首轮 Pi 范围与验收 |
| --- | --- | --- | --- | --- |
| PG01 总览 `/examples/agent-workbench/` | 进入示例/真实 Pi；对应原文整体布局与设计意图 | 保留文档总览职责，展示入口与能力范围，不渲染假实时运行；预览复用 PG04 区域 | 站点资源与示例索引；服务连接状态不从截图推断 | 必须提供明确 Pi 入口；键盘可达，并标明 fixture/真实服务 |
| PG02 区域实验室 `/examples/agent-workbench/regions/` | 单独检查每个模块的视觉与异常态；对应 [01]–[08] 和 A2-01–A2-10 | 一个可操作目标区域加必要场景控制；沿用模块本身样式，不另造实验室版本 | 受控 fixture 和状态开关；不能用定时器假装真实服务确认 | 首轮覆盖 User/Turn/工具/Composer/历史状态；审批、Edit/Test 等在独立 fixture 标记来源 |
| PG03 布局预览 `/examples/agent-workbench/layouts/` | 验证 Chat/Review/任务总览布局；对应桌面总图、A2-01 与 Editor 跳转说明 | Chat 优先；Review 宽 Diff；窄容器先收详情/侧栏，再单面板；尺寸采用 V01–V12 | 共用会话与草稿，布局是视图状态 | 首轮回归 Pi 使用的布局；高级布局不阻塞发送/历史闭环 |
| PG04 编码会话 `/examples/agent-workbench/app/?template=coding&page=session` | 从用户指令到工具和结果；采用 V2 中央区及 V1 周边分区 | Header 64px、内容列 760px、浅蓝右气泡、阶段横线、固定 BottomDock；右侧按需、底栏默认收起 | 原 fixture Provider 继续明确展示本地演示；组件不拥有服务请求 | 作为设计基准页，逐模块展示 reference 细节；编辑器不因面板/语言切换重挂 |
| PG05 真实 Pi `/examples/agent-workbench/pi/` | 打开历史、恢复上下文、运行 Pi；设计同 PG04 | 复用 PG04 的页面组合和模块外观；顶部真实项目/环境，会话列表与真实输入常驻 | Pi Provider/Host 持有权威会话、事件、历史和回执；浏览器保存视图和草稿 | 首轮主交付页：发送→流式→工具→停止→刷新→历史继续；不具备的高级服务不填 fixture |
| PG06 审阅 `app/?template=coding&page=review` 及 Files/Changes 面板 | 从原文 Edit Card/Changes 进入宽 Diff，追溯修改 | 资源栏负责选文件，正文在 Main；Chat+Editor 或最大化；退出恢复原布局 | 来源资源键/revision 与反馈草稿分开，旧读取按对象丢弃 | 第一轮复用只读能力；真实 Git/文件写入另行验收，不阻塞 Pi 接入 |
| PG07 产物和任务 `app/?template=artifacts`、`app/?template=console` | 检查产物、关注事项、运行和子会话；承接右侧 Plan/Context/Agents 与 Attention | 共用 Shell/原模板，默认只展开任务所需区域；不把所有资源堆进聊天 | 使用同源实体和回执；运行/审阅/业务验收分开 | 保留回归；新增高级编排与长期任务功能进入后续设计清单 |

所有页面共同遵循：Compact、4px 网格、语义 token、zh-CN/en、五种数据态、同对象刷新保留旧数据、键盘/触摸/reduced-motion；设计图中的示例路径和模型文字不成为运行配置。页面级验收必须检查实际挂载和区域布局，不能只检查路由和 Registry 存在。

PG02 的人工介入增量页为 `/examples/agent-workbench/regions/intervention/`。其 PG02-I 页面声明与 MD13-I/MD14-I 模块变体、尺寸、状态和验收路径见[人工介入实施记录](agent-workspace-intervention-log.md)。它是独立内存 fixture，不启用 PG05 的 Queue/Steer 或审批能力。

PG02 的完整参考状态增量页为 `/examples/agent-workbench/regions/reference/`。其 PG02-R 页面声明、MD01–MD17 增量、V01–V12 参数映射，以及 PG03/PG04/PG06 的宽工作区和底栏规则见[完整设计实施记录](agent-workspace-design-completion-log.md)。页面使用明确的内存 fixture；真实编码服务、任务树持久化及 AW6–AW8 保持补全计划的独立服务范围。

## 模块级设计声明

| 模块 ID / reference | 职责与复用入口 | 明确的展示与布局规则 | 状态、交互和服务边界 | 适用页面 |
| --- | --- | --- | --- | --- |
| MD01 / [01] 全局栏 | 项目/环境/工作树身份，复用项目选择器和 Badge | 48px、中性底、底部 1px 分隔；项目与环境横排，搜索/通知/设置靠右；不重复 Session 标题 | 显示实际环境/连接；未知不显示 Healthy；切项目不自动终止旧任务 | PG04–PG07 |
| MD02 / [02] 导航轨 | 全局页面入口，复用 Shell activityBar、Button/Menu | 本例 56px；默认弱图标，hover 浅底，当前入口更深底/主色标记；icon label+tooltip | 选择与 focus 区分；Files/Terminal 属于当前工作区工具；小屏收敛到可达菜单 | PG03–PG07 |
| MD03 / [03] 会话侧栏 | Project/Task/Session 及 recent/attention，复用 SessionNavigator/Tree/Item | New Session 主按钮、New Task 次按钮；搜索与树平铺；选中加深背景、2px 条、加重标题；按 V07 控制行高 | selected 与 running/attention 独立；时间/树共享数据，归类不执行任务；Pi 首轮先实现必要项目/会话列表 | PG03–PG07 |
| MD04 / [04-A], A2-01① Header | 当前 Session 标题和运行控制，复用 SessionHeader | 64px 基准，标题/元信息两行，底分隔；运行阶段可读，动作紧凑 | Stop/Fork/History/Checkpoint 按能力；提交停止先 pending，不能点击即 cancelled | PG04–PG06 |
| MD05 / A2-01②, A2-09 ChatViewport | 历史阅读，复用 Conversation | 独立纵向滚动，居中最大 760px；日期/元信息弱化；BottomDock 固定且不遮正文 | ≤64px 跟随；向上阅读保持锚点，显示 New Activities；补历史不跳动/重复 | PG02–PG06 |
| MD06 / 6.1, A2-01③, A2-10 用户消息 | 用户指令和附件，复用 ChatMessage 的展示扩展 | 右对齐、浅蓝底/细边、R16、12×16px、桌面最大72%；时间在上，操作在下靠右，不盖文字 | Quote/Edit/Copy 支持 focus 与触摸；Edit 明示新指令或分支；不静默修改已执行历史 | PG02–PG06 |
| MD07 / 6.2–6.3, A2-02 AgentTurn | Agent 身份、正文、阶段与最终输出 | 左对齐，正文/Output 开放 Markdown；Thinking/Action/Output 转换用 1px 横线和弱标签，16px 上下间距 | 可以多轮交替 Thinking/Action；仅展示公开阶段，缺失就不填造；来源顺序不可因分组改变 | PG02–PG06 |
| MD08 / A2-01④ 计划摘要 | 聊天中的阶段与完成计数，复用步骤/Item | 浅中性紧凑容器、R10，仅显示简短阶段和数量，Plan 入口指向详细面板 | 无来源总量不画虚假完成比例；详细计划与摘要共享 step ID | PG02–PG06 |
| MD09 / A2-03 Read/Search | 低噪声工具摘要，复用 ToolCall/折叠组 | 默认单行“类型/次数/来源耗时”，展开轻底；路径等宽、中间省略、完整值可访问 | 只合并相邻低风险记录；失败/unknown/待批准仍可见；计数取自 call ID | PG02–PG06 |
| MD10 / A2-04 Edit Files | 文件修改结果和审阅入口 | R10 紧凑工具容器；文件名中性色，增绿删红，真实状态在右；点击行打开宽 Diff | `Applied` 必须有确认；没有实际变更不填 +/− 行数；首轮 Pi 只读时不伪造 Edit 卡 | PG02/PG04/PG06；PG05 按能力 |
| MD11 / A2-05 Shell/Test | 命令/测试结果摘要，复用 ExecutionSessionList/ToolCall | 命令13px等宽，目录12px，退出码/耗时独立；失败列表可定位；输出按需 | 未知退出码显示“—”；测试数字来自结构化结果；Retry 有能力才可用；Terminal 链接不指向假 PTY | PG02/PG04/PG06；PG05 按能力 |
| MD12 / [07], A2-06/A2-07 Composer | 输入、上下文和控制，复用 AgentComposer/ContextPicker | 外容器R16、内部紧凑胶囊、主Send；内容增高至最多300px且受视口限制；Running 不改变输入框形态 | IME不误发；按Adapter提供模式/模型/Queue/Steer；切模式不清草稿；失败保留内容、确认只清提交版本 | PG02–PG06 |
| MD13 / A2-07 QueuePreview | 排队项的可见摘要 | Composer 外的紧凑条目，默认最多两条，更多折叠 | 取消/编辑/重排均需宿主能力和回执；Pi 首轮未支持则隐藏，不用本地数组假装排队 | PG02/PG04；PG05 后续 |
| MD14 / 6.5, A2-08 Approval/Attention | 用户决策，复用 ApprovalRequestPanel/AttentionQueue | 时间线中浅警示底卡片 + Composer上方精简提醒条；Review定位原记录；请求不因滚动而不可发现 | 两处绑定同一 attentionId；只有来源确认才消提醒，卡片保留审计；Allow session 不扩大未授予的权限 | PG02/PG04；PG05 按能力 |
| MD15 / [05] 右侧资源 | Changes/Files/Plan/Context/Agents | 默认三个Tab+更多；选中标签文字更实/下划线；Plan当前步骤加深，Context引用可移除；无第二聊天窗口 | 移除引用不删文件；新事件提示不抢焦点；无服务显示真实空/不可用 | PG03–PG07 |
| MD16 / A2-04 与右侧预览 Editor Surface | 文件、Diff和产物宽预览，复用文档标签/renderer | Main 中分屏、最大化/全屏；快速预览有界，完整Diff不直接塞聊天；回程保留原比例/选区 | 资源读取按ID/revision隔离；保存/恢复/Commit 属于独立服务能力 | PG03/PG04/PG06/PG07；PG05 按能力 |
| MD17 / [08] 底部运行 | Terminal/Tests/Problems/Events/Logs/Metrics | 初始收起、展开240px、Tabs和独立滚动；等宽输出；重要异常用徽标提示 | Log/Tool output 与 PTY 明确区分；关闭不取消任务；数据有界脱敏、结果未知不补成功 | PG03–PG07 |

模块复用规则：相同模块在区域、整页、Pi 页面用同一公共实现与受控快照；如果只改一个模块，应保留其页面声明并更新本行、影响页面和对应验收。可分发源码不引入 Next 路由、Pi SDK、服务认证或私有数据目录。

## 设计与布局执行清单

首轮 Pi 和完整参考 UI 均按各自源码、挂载与验证勾选。本轮 DL0/DL3–DL5 的完整基线和参考参数有独立证据，不由 Pi 首轮通过自动推定；AW6–AW8 仍按补全计划另行实施。PG/MD/V 编号用于执行追踪，不能把引用编号当作完成证明。

### DL0 实施前声明和基线

- [x] 阅读补全执行计划、Pi 技术计划、本文件原文与 PG/MD/V 声明，固定本轮首要目标为 Pi 接入。
- [x] 核对实际 exports、Manifest/Registry、Provider 和并行修改；记录将修改的页面、模块及复用/新增范围。
- [x] 按当前页面记录桌面/移动、浅深主题、空/加载/失败基线；明确哪些由 fixture 验证、哪些需要 Pi。
- [x] 为 V01–V12 建立示例局部参数映射；更新发生变化的设计声明后再改 UI，不要求额外用户确认例行实现。

### DL1 首轮 Pi 页面布局

- [x] PG05 复用 Shell、导航、Header、Conversation、Composer；PG01 提供清楚的真实 Pi 入口。
- [x] 实现 MD01–MD06/MD12 的首轮必要展示：真实环境/会话、加深选中态、右对齐浅蓝气泡、760px内容列、稳定Header/BottomDock。
- [x] 首屏能选会话、读历史、输入发送和停止；无服务/无模型/无权限均有明确恢复路径。
- [x] 小屏和软键盘下保留主操作；切语言/面板保持输入实例、草稿和阅读位置。

### DL2 首轮 Pi 对话展示

- [x] MD07 按公开事件呈现阶段横线，保留 Thinking/Action 的交替顺序；没有公开摘要不生成填充文本。
- [x] MD09 对实际只读工具使用紧凑/展开两层，异常持续可见；MD05 补历史/流式/新活动定位正确。
- [x] MD08/MD10/MD11/MD13/MD14 仅按真实能力出现；没有计划/变更/测试/队列/批准事实不生成样板成功结果。
- [x] 与补全计划 AW1–AW5 联合验证真实发送、工具、停止、刷新、断线、重启和旧上下文继续。

首轮勾选范围只覆盖 PG05 和受影响公共模块；真实手机软键盘、完整参考页面、全部 V01–V12 参数验收仍单列后续，见首轮记录。

### DL3 参考完整状态与区域演示

MD13/MD14 的独立人工介入 fixture 与 MD12 输入稳定性按[人工介入记录](agent-workspace-intervention-log.md)单独实施；本阶段的全模块/全页面覆盖仍分别验收。

- [x] 在 PG02 明确 fixture 的情况下覆盖 MD01–MD17 的默认/hover/focus/selected/disabled/loading/error 及适用数据五态。
- [x] 展示 User、开放 Agent 正文、Thinking、Plan、Read/Search、Edit、Shell/Test、Output 的差异，不统一套大 Card。
- [x] 对照 A2-08 验证审批双层呈现：历史阅读时提醒可发现、Review定位、确认后留审计；unknown保持锁。（PG02-I 独立 fixture）
- [x] 对照 A2-07 验证 Queue/Steer 外观稳定与队列最多两条；这些fixture不计作Pi服务能力。（PG02-I 独立 fixture）

### DL4 完整桌面与代码工作区

- [x] 补齐 PG03/PG04/PG06 的 Chat/Review 布局和 MD15–MD17 联动，选择Changes/文件/测试可到同一来源对象。
- [x] 宽 Editor/Diff 支持可调分屏、最大化、退出恢复；右侧资源导航不占用完整代码阅读空间。
- [x] 右侧只保留常用三个Tab，其余更多菜单/固定；底栏默认收起，出现异常先提示而不抢焦点。
- [x] 完整时间/任务树、归类、生命周期和高级服务的清单归属已确认：遵循 AW6–AW8 后续范围；本项为范围登记，不代表这些服务已实现。

### DL5 视觉和行为验收

- [x] 在 1440×900 桌面、390px移动、短视口、200%布局、双主题/双语下逐项检查 PG/MD/V，截图标明来源版本。
- [x] 检查1px阶段线、16px间距、选中与焦点区别、消息操作不遮正文、代码/路径可选中、粗指针命中区。
- [x] 用长历史、混合工具/正文、失败/unknown、来源缺失、迟到数据验证顺序、阅读锚点和恢复。
- [x] 运行改动所需 lint/typecheck/build/浏览器回归；公共源码/CSS/Registry 变更执行独立安装验证。
- [x] 在实施记录中分别登记设计一致性、fixture、真实 Pi、其它服务和 Git 交付；不得用完成设计清单替代真实执行验收。

### 变更记录要求

后续修改 reference 或实施取舍时，保持原文来源可追溯，更新完整性基线及对应 PG/MD/V/DL 条目。新增页面必须先补页面声明，新增模块必须先补模块声明；只改一个模块时按影响范围更新，不要求重写整份设计文件。
