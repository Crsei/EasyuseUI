# Agent Workspace UI Design Rules

> Version 1.1 · 2026-10-08\
> 适用于 Agent Harness、Coding Agent Runtime、Session Management、Chat Workspace、AI Activity、Ideas、Automation 等产品页面。

实现契约见 [Component-Specification.md](./Component-Specification.md)，视觉词汇见 [UI-VISUAL-DICTIONARY.md](./UI-VISUAL-DICTIONARY.md)，模式与状态分别见 [UI-PATTERNS.md](./UI-PATTERNS.md) 和 [UI-STATES.md](./UI-STATES.md)。基础样式的参数实验见 [STYLE-WORKBENCH.md](./STYLE-WORKBENCH.md)。

---

## 1. 设计目标

本产品的 UI 应呈现：

- 高信息密度
- 低视觉噪声
- 明确的信息层级
- 稳定一致的交互逻辑
- 强工具属性
- 适合长时间使用
- 适合复杂 Agent 工作流
- 同时支持鼠标、键盘和触摸操作

整体视觉方向：

**Hexta UI / Linear 的克制感 + VS Code 的信息密度 + Agent 产品自己的状态语言。**

不追求大量装饰性视觉效果。

优先级：

**清晰 > 一致 > 高效 > 精致 > 装饰**

---

# 2. 核心设计原则

## 2.1 Hierarchy Before Decoration

先建立信息层级，再增加视觉装饰。

一个页面中必须能够明确区分：

1. 当前页面是什么
2. 当前正在操作什么
3. 什么内容最重要
4. 哪些属于辅助信息
5. 哪些是当前状态
6. 下一步可以执行什么操作

不得通过大量颜色、渐变或 Card 来制造层级。

优先使用：

- 字体大小
- 字重
- 间距
- 对齐
- 背景层级
- 分割线
- 最后才是颜色

---

## 2.2 Structure Over Cards

不要默认把所有内容放进 Card。

优先使用：

```text
Page
├─ Header
├─ Toolbar
├──────────── Divider
├─ Section
│  ├─ Item
│  ├─ Item
│  └─ Item
├──────────── Divider
└─ Section
```

而不是：

```text
Page
├─ Card
│  └─ Card
│     └─ Card
```

Card 只应该用于具有明确独立语义的内容，例如：

- Project Overview
- Metrics
- Agent Summary
- Important Notice
- Configuration Group
- Independent Preview

普通列表、日志、Session、Activity 不使用 Card 包裹。

---

# 3. Design System 分层

所有 UI 必须按照以下五层构建：

```text
Foundation
    ↓
Primitive Components
    ↓
Product Patterns
    ↓
Workspace Layout
    ↓
Page
```

## Foundation

负责：

- Color
- Typography
- Spacing
- Radius
- Border
- Shadow
- Motion
- Density

## Primitive Components

例如：

- Button
- Input
- Select
- Checkbox
- Badge
- Tooltip
- Tabs
- Dialog
- Item
- Card

## Product Patterns

例如：

- Session Row
- Agent Row
- Activity Item
- Run Status
- Tool Call
- Message
- Idea Node
- File Change
- Command Input

## Workspace Layout

例如：

- Sidebar
- Main Workspace
- Inspector
- Bottom Panel
- Toolbar

## Pages

例如：

- Chat
- Sessions
- Agents
- Ideas
- Activity
- Automations
- Projects
- Settings

新页面不得绕过上述系统重新创建独立视觉语言。

---

# 4. Spacing System

采用 **4px 基础网格**。

允许使用：

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

推荐：

| 场景         |    间距 |
| ------------ | ------: |
| Icon 与文字  |   6–8px |
| 同组控件     |     8px |
| Item 内部    |  8–12px |
| 小区域       |    12px |
| Section 内部 |    16px |
| Section 之间 |    24px |
| 页面主要区域 | 24–32px |
| 大型内容区   | 32–48px |

禁止无规则出现：

`7px / 13px / 19px / 27px`

除非存在明确的视觉修正理由。

---

# 5. Typography

UI 默认采用紧凑工具型排版。

## 字号

```text
12px    Metadata / Status / Caption
13px    Secondary UI text
14px    Default UI text
16px    Section title
20px    Page title
24px    Major title
28–32px Marketing / Empty state headline
```

工具型页面原则上不使用超过 24px 的标题。

## 字重

推荐：

```text
400 Regular
500 Medium
600 Semibold
```

避免大面积使用 Bold。

### 原则

页面层级尽量通过：

**size + spacing**

而不是：

**大量 bold**

建立。

---

# 6. Radius

圆角必须统一。

推荐：

```text
4px    Tiny controls
6px    Button / Input
8px    Dropdown / Popover
12px   Card / Panel
16px   Large floating surface
```

禁止页面中随机出现大量不同圆角。

嵌套元素原则：

**内部圆角 < 外部圆角**

例如：

```text
Card            12px
Inner Control    8px
Button           6px
```

---

# 7. Border

Border 是主要层级工具之一。

推荐：

```text
1px solid var(--border)
```

Dark Mode：

```text
border:
rgba(255,255,255,0.08)

border-hover:
rgba(255,255,255,0.14)
```

避免：

- 粗边框
- 高对比白色边框
- 所有区域都有边框

优先使用 Hairline Border。

---

# 8. Shadow

工具型产品尽量减少 Shadow。

Shadow 主要用于：

- Dialog
- Dropdown
- Popover
- Command Palette
- Floating Panel

页面主体区域不依赖 Shadow 建立层级。

优先顺序：

```text
Spacing
↓
Background
↓
Border
↓
Shadow
```

---

# 9. Color System

90% 的界面使用 Neutral Color。

Dark Mode 示例：

```text
background       #0A0A0A

surface          #0F0F10
surface-hover    #121213
surface-raised   #151516

border           rgba(255,255,255,.08)
border-hover     rgba(255,255,255,.14)

text-primary     rgba(255,255,255,.92)
text-secondary   rgba(255,255,255,.62)
text-muted       rgba(255,255,255,.40)
```

品牌色只用于：

- Primary Action
- Active State
- Selected State
- Focus State

状态颜色：

```text
Blue      Information
Green     Success
Amber     Warning
Red       Error / Destructive
Purple    Optional Agent / AI identity
```

颜色必须表达语义，而不是装饰。

---

# 10. Agent 状态颜色

Agent Runtime 必须建立统一状态语言。

推荐：

```text
Idle        Neutral
Queued      Muted
Starting    Blue
Running     Blue
Thinking    Purple
Waiting     Amber
Paused      Amber
Completed   Green
Failed      Red
Cancelled   Neutral
```

同一个状态必须在：

- Badge
- Activity
- Session
- Agent
- Automation
- Inspector
- Toast

中使用相同视觉语言。

---

# 11. Layout

桌面产品默认采用 Workspace Shell。

```text
┌──────────────────────────────────────────────────────┐
│ Global / Project Header                              │
├─────────────┬────────────────────────┬───────────────┤
│             │                        │               │
│ Sidebar     │ Main Workspace         │ Inspector     │
│             │                        │               │
│ Navigation  │ Primary Task           │ Context       │
│             │                        │ Details       │
│             │                        │ Actions       │
│             │                        │               │
├─────────────┴────────────────────────┴───────────────┤
│ Optional Bottom Panel                               │
└──────────────────────────────────────────────────────┘
```

推荐尺寸：

```text
Sidebar
256px

Collapsed Sidebar
48px

Inspector
300–360px

Main
1fr

Bottom Panel
200–400px
```

---

# 12. Workspace 三栏原则

## 左侧 Sidebar

回答：

> 我要去哪里？

包含：

- Overview
- Projects
- Sessions
- Agents
- Ideas
- Activity
- Automations
- Settings

不展示大量当前对象详情。

---

## 中间 Main Workspace

回答：

> 我现在正在做什么？

例如：

Chat 页面：

- Conversation
- Composer
- Workspace

Session 页面：

- Session Tree
- Timeline

Activity 页面：

- Runtime Events

Ideas 页面：

- Idea Graph

中间区域必须始终是当前任务的主要操作面板。

---

## 右侧 Inspector

回答：

> 当前选中的对象是什么？

展示：

- Metadata
- Status
- Related Files
- Token Usage
- Model
- Agent
- Timeline
- Tags
- Actions

Inspector 应该可以：

- Collapse
- Resize
- Context-sensitive

避免把 Inspector 内容永久塞进 Main Workspace。

---

# 13. Page Header

页面 Header 推荐结构：

```text
Title
Description / Breadcrumb

                        Primary Action
                        Secondary Action
```

页面级操作最多：

- 1 个 Primary
- 1–2 个 Secondary

更多操作进入：

```text
•••
```

避免顶部出现 5–10 个 Button。

---

# 14. Toolbar

Toolbar 用于：

- Search
- Filter
- Sort
- View Switcher
- Scope
- Bulk Action

Toolbar 不负责：

- 页面导航
- 长文本说明
- 大型 Primary CTA

---

# 15. Item 是最重要的基础组件之一

Session、Activity、Agent、File、Idea 都应该尽量使用统一 Item Pattern。

基本结构：

```text
┌──────────────────────────────────────────────────────┐
│ Icon  Title                             Status       │
│       Secondary metadata                Action       │
└──────────────────────────────────────────────────────┘
```

支持：

```text
default
hover
selected
focused
disabled
```

只有真正可以点击的 Item 才允许 hover。

静态内容不应该假装可交互。

---

# 16. 列表优先于 Card Grid

对于：

- Sessions
- Agents
- Activity
- Tools
- Runs
- Files
- Automations

默认优先：

```text
List / Table
```

而不是：

```text
Card Grid
```

只有对象本身需要强视觉识别时才使用 Card Grid。

例如：

Project 可以使用 Card。

Activity 不应该使用 Card。

---

# 17. Density

产品默认使用 Compact Density。

推荐：

```text
List Row
32–40px

Button
32–36px

Input
32–36px

Toolbar
40–44px

Tabs
32–36px
```

避免传统 SaaS 页面：

```text
Button 48px
Input 52px
Card padding 32px
```

Agent 工具需要更高信息密度。

---

# 18. Component States

任何交互组件至少必须设计：

```text
Default
Hover
Pressed
Focus
Selected
Disabled
Loading
Error
```

任何数据组件至少必须设计：

```text
Loading
Empty
Partial
Error
Success
```

禁止只实现“正常情况下”的 UI。

---

# 19. Loading

Loading 优先使用 Skeleton。

适用于：

- Session List
- Activity List
- Agent Overview
- Project Page

避免所有页面统一显示：

```text
Loading...
```

对于 Agent 执行过程，使用：

```text
Progress
+
Current Stage
+
Elapsed Time
```

而不是无限 Spinner。

---

# 20. Empty State

Empty State 必须回答两个问题：

1. 为什么这里是空的？
2. 用户下一步可以做什么？

结构：

```text
Icon

Title

Short explanation

Primary Action
Optional Secondary Action
```

例如：

```text
No sessions yet

Start an agent task or import an existing session.

[New session]
```

避免只显示：

```text
No data
```

---

# 21. Error State

Error 必须区分：

```text
Validation Error
Request Error
Runtime Error
Agent Error
Permission Error
Network Error
```

错误信息应包含：

```text
发生了什么
为什么可能发生
可以执行什么操作
```

必要时显示：

```text
Retry
Open Logs
View Details
```

---

# 22. Motion

动效必须表达：

- 状态变化
- 空间变化
- 层级变化
- 因果关系

推荐：

```text
150ms   Hover
180ms   Button
200ms   Popover
220ms   Panel
250ms   Drawer
300ms   Major Layout
```

默认使用：

```text
ease-out
```

禁止：

- 持续漂浮
- 过度弹跳
- 页面元素无理由进入动画
- 大量 Framer Motion 装饰动画

Motion 必须可以中断。

---

# 23. Hover

Hover 只用于：

- 可点击对象
- 可选择对象
- 可拖拽对象

Hover 不等于改变整个组件颜色。

优先：

```text
background +2~4%
border slightly stronger
```

而不是强烈高亮。

---

# 24. Selection

Selected 与 Hover 必须明显不同。

推荐：

Hover：

```text
subtle background
```

Selected：

```text
stronger background
+
optional accent indicator
```

例如：

```text
│ Selected Session
```

可以使用左侧 2px Accent Indicator。

---

# 25. Focus

所有键盘交互组件必须拥有 Focus State。

Focus Ring：

```text
1–2px
```

视觉上明显，但不要使用强烈荧光效果。

Focus 与 Selection 不得混为一谈。

---

# 26. Icon

建议整个系统只使用一个 Icon Library。

推荐：

- Tabler Icons
- Lucide

默认：

```text
16px
18px
20px
```

避免同一界面混用：

- Emoji
- Filled icon
- Outline icon
- 多套 icon library

Icon 必须保持相同 Stroke Weight。

---

# 27. Icon Button

单独 Icon Button 必须具备：

- Tooltip
- Accessible Label
- Hover
- Focus
- Disabled

视觉尺寸可以为：

```text
28–32px
```

但移动端实际可触摸区域应该接近：

```text
44px
```

---

# 28. Button Hierarchy

只允许以下 Button 层级：

```text
Primary
Secondary
Ghost
Destructive
Icon
```

单个区域中最多一个 Primary。

禁止多个相同视觉权重的 CTA 同时出现。

---

# 29. Badge

Badge 只用于：

- Status
- Category
- Small metadata

不用于：

- 普通文本
- 所有字段
- 长内容

一个 Item 内一般不超过 2–3 个 Badge。

---

# 30. Tabs

Tabs 用于同一个对象的不同视图。

例如：

```text
Agent

Overview
Activity
Tools
Files
Usage
```

Tabs 不应该代替全局导航。

---

# 31. Tree

Tree 用于：

- Session hierarchy
- Idea hierarchy
- Task hierarchy
- File hierarchy

Tree Node：

```text
Chevron
Icon
Title
Metadata
Status
Actions
```

必须支持：

```text
Expanded
Collapsed
Selected
Hover
Dragging
```

树结构不要同时使用大量 Card。

---

# 32. Agent Session Tree

Session 默认按照：

```text
Idea
└─ Session
   ├─ Run
   └─ Run
```

表达关系。

未分类 Session 可以放入：

```text
Unorganized
```

或：

```text
Inbox
```

AI 自动整理应作为操作，而不是默认隐藏关系。

---

# 33. Chat UI

Chat 页面不应设计成传统聊天软件。

它本质上是：

**Conversation + Agent Runtime Workspace**

推荐：

```text
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│ Conversation         │ Workspace                │
│                      │                          │
│ User                 │ Files                    │
│ Agent                │ Diff                     │
│ Tool                 │ Terminal                 │
│ Result               │ Preview                  │
│                      │                          │
├──────────────────────┴──────────────────────────┤
│ Composer                                        │
└─────────────────────────────────────────────────┘
```

Tool Call 不要伪装成普通聊天消息。

应该拥有独立视觉 Pattern。

---

# 34. AI Activity

AI Activity 是 Runtime Timeline，而不是普通通知中心。

推荐信息结构：

```text
Time

Agent

Event Type

Action

Target

Status

Duration

Tokens

Expandable
```

---

# 35. 基础样式实验与落地

使用 `/style-workbench/` 比较圆角、间距、边框、阴影、颜色和字体参数。A/B 使用相同内容和交互状态，优先每次修改一个参数，再用差异表确认改动。

样式工作台的实验值仅作用于预览容器。预设、固定基准和导出用于比较与记录，不自动改变产品默认。产品页面继续遵循本文件的紧凑密度、中性表面、细分隔线和语义状态规则。

将实验结果作为共享设计规则前，在真实组件与长内容、深浅主题、键盘、触屏场景中检查可读性与操作效率。确认后同步修订组件契约与 `styles/theme.css`，复用现有组件，并完成工程与行为验收。参数范围与操作步骤见 [样式工作台指南](./STYLE-WORKBENCH.md)。
