如果你要设计的是 **Dify / n8n / Langflow 这种节点式 Workflow Canvas 工作台**，我建议不要把它理解成“一个大画布 + 几张卡片”，而应该把它设计成一个完整的 **Visual Programming IDE**。

Dify 当前的 Workflow Studio 已经把 Canvas、节点配置、运行调试、变量检查、执行轨迹、协作评论等揉成了一套完整工作台；其源码里也能看到 React Flow、点阵背景、选择模式、缩放、协作光标、Comment、History 等能力。[GitHub](https://github.com/langgenius/dify/blob/main/web/app/components/workflow/index.tsx?utm_source=chatgpt.com)



我会按下面这套组件体系来设计。

## 1. 第一层：Canvas Shell

这不是画布本身，而是整个编辑器框架。

| 组件 | 作用 |
|---|---|
| `WorkflowHeader` | Workflow 名称、保存状态、版本 |
| `Breadcrumb` | Project / Workflow / Subflow |
| `PublishButton` | 发布 / 激活 |
| `RunButton` | Test Run / Run |
| `UndoRedo` | 撤销、重做 |
| `HistoryButton` | 版本历史 |
| `Collaborators` | 在线成员头像 |
| `AutosaveStatus` | Saving / Saved |
| `EnvironmentSwitcher` | Draft / Dev / Prod |
| `MoreMenu` | 导入、导出、复制、删除 |

尤其是：

```text
←  My Project / Customer Agent

                  Saved · 12:41

      Undo  Redo   Run   Share   Publish
```

顶部栏尽量轻。

不要像普通后台系统一样塞几十个按钮。

---

# 2. Canvas Viewport

这是真正的无限画布。

React Flow 自带的基础能力就包括 `MiniMap`、`Controls`、`Background` 和固定 `Panel`；同时还有 NodeToolbar、NodeResizer、Sub Flow 等模式，非常适合作为你实现 Canvas 的基础。[React Flow](https://reactflow.dev/learn/concepts/built-in-components?utm_source=chatgpt.com)

建议至少设计：

| Component | UI |
|---|---|
| `Canvas` | 无限空间 |
| `DotGrid` | 点阵背景 |
| `Viewport` | 当前视口 |
| `MiniMap` | 缩略地图 |
| `ZoomControls` | + / − |
| `ZoomIndicator` | `87%` |
| `FitView` | Fit workflow |
| `PanMode` | Hand |
| `SelectMode` | Pointer |
| `SelectionMarquee` | 框选 |
| `SnapGuide` | 对齐辅助线 |
| `CanvasContextMenu` | 右键菜单 |
| `QuickInsert` | 快速插入节点 |
| `SearchCanvas` | 搜索 Node |

推荐左下角：

```text
┌────┐
│ ↖  │ Fit
│ +  │
│ −  │
│87% │
└────┘
```

右下角：

```text
┌──────────────┐
│   Mini Map   │
└──────────────┘
```

n8n 和 Node-RED 都长期采用这类结构；Node-RED 甚至专门提供 Navigator 来显示整个 workspace。[Node-RED](https://nodered.org/docs/user-guide/editor/workspace/?utm_source=chatgpt.com)

---

# 3. Node：整个设计系统最重要的部分

这里最好不要一开始就做几十种完全不同的 Node。

先设计一个：

```text
<BaseNode />
```

再通过 Variant 派生。

例如：

```text
┌──────────────────────────┐
│ 🧠  LLM              ⋯   │
│──────────────────────────│
│ GPT-5.6                  │
│                          │
│ Prompt                   │
│ {{ user.query }}         │
│                          │
│ Input                 ●  │
└──────────────────────────┘
```

基础 Node 至少包含：

| 区域 | Component |
|---|---|
| Header | `NodeIcon` |
| | `NodeTitle` |
| | `NodeTypeBadge` |
| | `NodeMenu` |
| Body | `NodeSummary` |
| | `NodeInputPreview` |
| | `NodeOutputPreview` |
| Footer | `NodeStatus` |
| | `ExecutionTime` |
| | `TokenUsage` |
| Connection | `InputHandle` |
| | `OutputHandle` |

### Node 状态一定要完整设计

这是很多 Canvas UI 最容易漏掉的地方。

至少需要：

```text
Default

Hover

Selected

Running

Success

Warning

Error

Disabled

Read-only
```

例如：

```text
Selected
────────────
2px Accent Border
Soft Accent Shadow


Running
────────────
Animated border
● Running


Success
────────────
✓ 1.24s


Error
────────────
! Failed
```

不要用整个 Node 大面积染红或者染绿。

推荐：

**边框 + 小状态 badge + icon**

来表达状态。

Dify 的运行界面会直接在节点上表现执行成功，并配合右侧 Test Run 查看输入、输出、metadata 和执行时间。

---

# 4. Handle / Port

Port 是第二重要的组件。

很多 Workflow UI “看着不精致”，问题其实都出在 Handle 上。

建议设计：

```text
○ input

● output

◉ connected

◎ hover

⊕ add connection
```

并支持：

```text
string
number
boolean
object
array
message
tool
model
```

不同数据类型可以：

**颜色不同，但形状统一。**

不要做：

```text
string = 圆
number = 三角形
object = 正方形
```

会增加认知成本。

Langflow 就比较值得研究这一部分，因为其节点直接暴露不同类型的 input/output Handle；当前前端基于 `@xyflow/react`。[GitHub](https://github.com/langflow-ai/langflow/blob/main/.agents/skills/component-refactoring/SKILL.md?utm_source=chatgpt.com)

---

# 5. Edge / Connection

至少设计四种：

```text
Normal Edge

Selected Edge

Running Edge

Error Edge
```

以及：

```text
Conditional Edge
```

例如：

```text
       true
───────●────────>

       false
───────●────────>
```

还要设计：

```text
EdgeLabel

EdgeToolbar

DeleteEdge

InsertNodeOnEdge

ReconnectHandle
```

我非常建议加入：

```text
Node ──── ⊕ ──── Node
```

点击 `+`：

```text
Search nodes...

LLM
HTTP Request
Code
Condition
Agent
...
```

这比要求用户永远从左侧 Palette 拖 Node 好很多。

Node-RED 已经有类似的 Quick Add，并且能够直接把新节点插入已有 wire 中。[Node-RED](https://nodered.org/docs/user-guide/editor/workspace/nodes?utm_source=chatgpt.com)

---

# 6. Node Palette

左侧建议不要设计成传统 Toolbar。

而设计成：

```text
┌──────────────────────┐
│ Search nodes...      │
├──────────────────────┤
│ Recently used        │
│ 🧠 LLM               │
│ 🔧 Tool              │
│                      │
│ Input & Output       │
│ Logic                │
│ AI                   │
│ Data                 │
│ Tools                │
│ Integration          │
└──────────────────────┘
```

分类建议：

```text
Triggers

AI
  Agent
  LLM
  Prompt
  Memory

Data
  Variables
  Transform
  JSON
  Files

Knowledge
  Retrieval
  Vector Search

Logic
  If
  Switch
  Merge
  Loop
  Iteration

Actions
  HTTP
  Tool
  MCP
  Code

Human
  Approval
  Input

Output
```

Langflow 的左侧 Palette 很值得参考：Input & Output、Data Sources、Models & Agents、LLM Operations、Files、Processing、Flow Control、Utilities 分层非常清楚。

---

# 7. Node Inspector

这一部分我建议你重点参考 **Dify**。

点击：

```text
LLM Node
```

右侧出现：

```text
┌───────────────────────────┐
│ LLM                     × │
├───────────────────────────┤
│ Model                     │
│ GPT-5.6                ▾  │
│                           │
│ System Prompt             │
│ ┌───────────────────────┐ │
│ │ You are...            │ │
│ └───────────────────────┘ │
│                           │
│ Variables                 │
│ {{query}}                 │
│                           │
│ Temperature    0.7        │
│                           │
│ Output Schema             │
│ ...                       │
└───────────────────────────┘
```

不要把所有配置塞进 Node。

这是 Canvas UI 一个非常重要的设计原则：

> Canvas 展示结构，Inspector 展示细节。

Node 只应该回答：

```text
这是什么？

和谁连接？

现在什么状态？

核心配置是什么？
```

而不是：

```text
把 30 个参数全部显示出来。
```

---

# 8. Inspector 里的基础表单组件

如果准备长期做 Canvas，建议单独做一套：

```text
Canvas Form Kit
```

至少包含：

| Component | 用途 |
|---|---|
| `TextInput` | 普通参数 |
| `Textarea` | Prompt |
| `Select` | Model |
| `Combobox` | Resource |
| `Switch` | Enable |
| `Slider` | temperature |
| `NumberInput` | max tokens |
| `TagInput` | labels |
| `CodeEditor` | Python / JS |
| `JSONEditor` | JSON |
| `KeyValueEditor` | headers |
| `VariablePicker` | `{{variable}}` |
| `CredentialPicker` | Credentials |
| `ModelPicker` | Model |
| `ToolPicker` | Tool |
| `SchemaBuilder` | JSON Schema |
| `ConditionBuilder` | IF |
| `ExpressionEditor` | expression |

Flowise 的 AgentFlow 很值得参考这一块，它已经明确拆出了动态 input、JSON、code、variable selector、condition builder、message input、structured output schema builder 和 credential management。[GitHub](https://github.com/FlowiseAI/Flowise/blob/main/packages/agentflow/README.md?utm_source=chatgpt.com)

---

# 9. Variable Picker

AI Workflow 非常重要。

例如用户输入：

```text
/
```

或者：

```text
{
```

弹出：

```text
Variables

Start
 ├ user.query       string
 ├ user.files       file[]
 └ user.id          string

HTTP Request
 ├ body             object
 └ status           number

LLM
 └ text             string
```

然后：

```text
{{ Start.user.query }}
```

变量需要至少设计：

```text
VariableChip
VariableTree
VariableType
VariablePreview
VariableSearch
VariableInsertMenu
```

---

# 10. Control Flow Node

这个不能只做普通 Node。

至少需要专门设计：

```text
IF

Switch

Loop

Iteration

Parallel

Merge

Subflow
```

比如：

```text
         TRUE ────>
       /
IF ───
       \
         FALSE ───>
```

Iteration / Loop 建议做成 **Container Node**：

```text
╭─────────────────────────────────╮
│ LOOP items                      │
│                                 │
│   ┌───────┐       ┌───────┐     │
│   │ LLM   │ ───── │ Tool  │     │
│   └───────┘       └───────┘     │
│                                 │
╰─────────────────────────────────╯
```

而不是简单的一张卡。

---

# 11. Group / Frame

大 Workflow 很快就会变乱。

所以从第一版 Design System 就应该有：

```text
Group
Frame
Section
```

形式：

```text
╭────────────────────────────────╮
│ ① Retrieve customer context    │
│                                │
│ [Retrieval] → [Rerank] → [LLM] │
│                                │
╰────────────────────────────────╯
```

n8n 现在已经把 Canvas Group 做成正式功能，可以给一段流程命名、写描述、Collapse/Expand，而且把 group 保存进 workflow。[GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/build/understand-workflows/workflow-components/canvas-groups.md?utm_source=chatgpt.com)

这个非常值得你借鉴。

---

# 12. Subflow

它和 Group 不一样。

Group：

```text
视觉组织
```

Subflow：

```text
逻辑抽象
```

例如：

```text
┌──────────────────┐
│ Customer Support │
│ Subflow           │
└──────────────────┘
```

双击：

```text
Customer Support
─────────────────

Input → Classify → Retrieve → LLM → Output
```

Node-RED 对这套模式已经做得非常成熟：一组 nodes 可以被封装成 Subflow，再作为普通 Node 重复使用。[Node-RED](https://nodered.org/docs/user-guide/concepts?utm_source=chatgpt.com)

---

# 13. Annotation 系统

必须有：

```text
Sticky Note

Comment

Comment Thread

Frame Label

Annotation Arrow
```

区别：

```text
Sticky Note
= Workflow 文档

Comment
= 团队协作讨论
```

建议不要混在一起。

Dify 当前源码里已经存在 Canvas comment placement 和多人 cursor 的相关实现，所以如果你未来考虑协作型 Canvas，这部分最好一开始就留架构。[GitHub](https://github.com/langgenius/dify/blob/main/web/app/components/workflow/index.tsx?utm_source=chatgpt.com)

---

# 14. Execution UI

如果你的 Canvas 最终会运行 Agent，这一层甚至和 Node 本身一样重要。

顶部：

```text
▶ Run

Run from here

Run selected node

Run to here
```

执行时：

```text
Start
 ✓

LLM
 ● Running

Tool
 ○ Waiting

Output
 ○ Waiting
```

建议状态体系：

```text
Pending

Queued

Running

Success

Failed

Skipped

Cancelled

Waiting for user
```

---

# 15. Execution Inspector

右侧：

```text
Test Run

Input
Output
Details
Trace
```

Details：

```text
Status
SUCCESS

Duration
1.83 s

Tokens
1,842

Model
GPT-5.6

Started
14:21:53
```

Dify 现在就是把 Test Run 和节点执行信息放到画布旁边，而不是跳转到另一个页面。

我非常建议你采用这个模式。

---

# 16. Bottom Panel

如果你的产品更偏开发者，我建议再加入一个类似 IDE 的 Bottom Panel：

```text
┌──────────────────────────────────────────┐
│ Logs │ Variables │ Output │ Trace │ Errors│
├──────────────────────────────────────────┤
│ 12:31:21 LLM started                    │
│ 12:31:22 Tool search_google             │
│ 12:31:24 LLM completed                  │
└──────────────────────────────────────────┘
```

n8n 当前 Canvas Host 本身就把 `LogsPanel` 作为 Canvas Shell 的一个主要区域。[GitHub](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/app/components/WorkflowCanvasHostBody.vue?utm_source=chatgpt.com)

这个其实与你现在做 **Agent Runtime / Session / Activity** 的方向尤其契合。

---

# 17. Canvas 必须有的交互组件

如果把前面浓缩成真正的组件 Checklist，我建议第一版至少覆盖下面这些：

1. `Canvas / Background / MiniMap / ZoomControls / FitView`
2. `BaseNode / NodeHeader / NodeStatus / NodeToolbar`
3. `InputHandle / OutputHandle / Edge / EdgeLabel`
4. `NodePalette / QuickAdd / CanvasSearch`
5. `InspectorPanel / PropertyForm`
6. `VariablePicker / ModelPicker / ToolPicker / CredentialPicker`
7. `ConditionBuilder / SchemaBuilder / CodeEditor`
8. `Group / Frame / Subflow / StickyNote / Comment`
9. `RunToolbar / ExecutionState / TracePanel / LogsPanel`
10. `Selection / MultiSelect / ContextMenu / CommandPalette`
11. `UndoRedo / History / Autosave`
12. `ErrorPopover / ValidationBadge / EmptyState`
13. `CollaboratorCursor / CommentThread`
14. `KeyboardShortcutOverlay`
15. `Publish / Version / Environment`

如果这 15 组组件都设计完了，你实际上已经有一套比较完整的 **Workflow Canvas Design System**。

---

# 最值得参考的项目

我会把参考项目分成三个层级。

| 项目 | 最值得看什么 | 推荐度 |
|---|---|---:|
| **Dify** | AI Workflow UX、Node、Inspector、Variable、Run Debug | ★★★★★ |
| **n8n** | 大规模 Workflow、快速插入、Group、执行状态 | ★★★★★ |
| **Langflow** | Node Palette、typed port、AI components | ★★★★★ |
| **React Flow / XYFlow** | Canvas 底层交互、Node/Edge/Minimap | ★★★★★ |
| **Flowise** | AI Node 配置、动态表单、validation | ★★★★☆ |
| **Node-RED** | Visual Programming 经典交互、Subflow | ★★★★☆ |
| **ComfyUI** | 超大型 Node Graph、密集参数、Subgraph | ★★★★☆ |
| **Rete.js** | Visual Programming Framework 架构 | ★★★★☆ |

### Dify

我建议把它作为**产品 UX 第一参考对象**。

重点研究：

```text
Canvas
Node
Inspector
Variable selector
Test Run
Execution state
Workflow history
Comments
Collaboration
```

现在 Dify 自己将 Workflow 定义为 collaborative visual canvas，并支持模型、检索、工具、代码、branch、trigger、human review，以及节点或完整 Workflow 的测试。[Dify](https://www.dify.ai/workflows?utm_source=chatgpt.com)

[Dify GitHub](https://github.com/langgenius/dify?utm_source=chatgpt.com)

---

## n8n

如果 Dify 是：

> AI Workflow

那么 n8n 更适合研究：

> Workflow Editor 本身如何做到成熟。

特别看：

```text
Quick Add

Node search

Canvas navigation

Execution

Sticky notes

Groups

Large workflow readability
```

它最近的 Canvas Groups 尤其值得参考，因为它开始解决真实复杂 Workflow 的信息密度问题。[GitHub](https://github.com/n8n-io/n8n-docs/blob/main/docs/build/understand-workflows/workflow-components/canvas-groups.md?utm_source=chatgpt.com)

[n8n GitHub](https://github.com/n8n-io/n8n?utm_source=chatgpt.com)

---

# Langflow

如果你最关心：

```text
AI Node
Port
Input/output type
```

就重点看 Langflow。

其 `GenericNode`、Handle、node input/output field、status 等已经被拆成比较清晰的组件层。[GitHub](https://github.com/langflow-ai/langflow/blob/main/.agents/skills/component-refactoring/SKILL.md?utm_source=chatgpt.com)

[Langflow GitHub](https://github.com/langflow-ai/langflow?utm_source=chatgpt.com)

---

# React Flow / XYFlow

如果你自己实现前端，我大概率建议：

```text
React
+
@xyflow/react
```

而不是自己实现 pan / zoom / drag / edge / selection。

它已经提供：

```text
MiniMap
Controls
Background
Panel
NodeToolbar
NodeResizer
Sub Flow
Custom Node
Custom Edge
```

以及非常多可以直接参考的 node editor example。[React Flow](https://reactflow.dev/learn/concepts/built-in-components?utm_source=chatgpt.com)

[React Flow examples](https://reactflow.dev/examples?utm_source=chatgpt.com)

---

# Flowise

它适合参考：

```text
复杂 Node 配置
```

因为 AgentFlow 已经包含：

```text
13+ Node 类型
dynamic inputs
variable selector
JSON editor
code editor
condition builder
structured output
credential management
validation
```

并且 Canvas 本身也是 React Flow。[GitHub](https://github.com/FlowiseAI/Flowise/blob/main/packages/agentflow/README.md?utm_source=chatgpt.com)

[Flowise GitHub](https://github.com/FlowiseAI/Flowise?utm_source=chatgpt.com)

---

# Node-RED

很多东西看起来没有 Dify 新，但它是非常好的：

> Visual Programming Interaction Dictionary。

值得研究：

```text
Palette
Quick Add
Ports
Wires
Subflows
Tabs
Navigator
Node state
Documentation
Keyboard shortcuts
```

特别是 Quick Add、Subflow 和 Workspace navigation。[Node-RED](https://nodered.org/docs/user-guide/editor/workspace/?utm_source=chatgpt.com)

[Node-RED Workspace documentation](https://nodered.org/docs/user-guide/editor/workspace/?utm_source=chatgpt.com)

---

# ComfyUI

ComfyUI 不适合直接抄视觉风格。

但非常适合研究：

```text
200+ Node 的 Canvas 怎么管理
复杂节点
大量参数
Workflow template
Subgraph
高密度 Graph
```

它本质上就是非常成熟的 node graph 系统，现在也支持 reusable subgraphs、workflow templates 等。[GitHub](https://github.com/comfy-org/ComfyUI?utm_source=chatgpt.com)

[ComfyUI GitHub](https://github.com/comfy-org/ComfyUI?utm_source=chatgpt.com)

---

# Rete.js

如果你未来想做的不只是：

```text
Workflow Builder
```

而是：

```text
通用 Visual Programming / Agent Programming IDE
```

Rete.js 很值得研究。

它本身定位就是 TypeScript-first 的 node editor / visual programming framework，并考虑 dataflow 与 control flow。[GitHub](https://github.com/retejs?utm_source=chatgpt.com)

[Rete.js GitHub](https://github.com/retejs/rete?utm_source=chatgpt.com)

---

# 对你的项目，我会采用的组合

结合你现在做的 Agent Harness / Agent Runtime 工作台，我不会完全照搬 Dify。

我会做成：

```text
          Agent Canvas
────────────────────────────────────────

 Top Bar
 Project / Workflow       Run    Publish


 Node Palette            Canvas            Inspector
┌──────────┐    ┌────────────────────┐   ┌────────────┐
│ Agents   │    │                    │   │ Node       │
│ Models   │    │ Agent             │   │ Config     │
│ Tools    │    │   ↓                │   │            │
│ Runtime  │    │ Model → Tool       │   │ Model      │
│ Logic    │    │   ↓                │   │ Prompt     │
│ Input    │    │ Agent              │   │ Tools      │
└──────────┘    │                    │   └────────────┘
                └────────────────────┘


────────────────────────────────────────
 Logs │ Activity │ Variables │ Trace │ Context
────────────────────────────────────────
```

也就是融合：

**Dify**
→ AI Workflow UX

**n8n**
→ Workflow editing UX

**Langflow**
→ Port / AI Node

**React Flow**
→ Canvas engine

**VS Code**
→ Inspector / Bottom Panel / Command Palette

而针对你的 Agent Runtime，再增加：

```text
Agent Node
Model Node
Tool Node
Session Node
Subagent Node
Human Approval Node

以及

Runtime Status
Token Usage
Context Usage
Tool Calls
Artifacts
Terminal
Execution Trace
```

这会比“做一个类似 Dify 的 Canvas”更适合你的产品。

---

## 最后建议你把整个设计系统拆成 5 个 Figma Page

```text
01 Foundations
   Color
   Typography
   Shadow
   Radius
   Grid

02 Canvas Primitives
   Node
   Port
   Edge
   Group
   Note

03 Canvas Controls
   MiniMap
   Zoom
   Toolbar
   Context Menu

04 Workflow Components
   Node Palette
   Inspector
   Variable Picker
   Condition Builder

05 Runtime
   Running
   Success
   Error
   Trace
   Logs
   Token
```

这样你以后设计 **Agent Canvas、Idea Canvas、Session Graph、Workflow Builder**，可以共享同一套 Canvas Design System，而不是每个页面重新画一遍。

如果只选 **4 个项目深入拆 UI**，我建议顺序就是：

**Dify → n8n → Langflow → React Flow**。

这四个基本足以把你的第一版 Canvas UI 组件库定义完整。