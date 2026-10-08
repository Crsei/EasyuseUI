# Canvas 工作台与接入接口

入口：[本地工作台](http://localhost:3010/workspace/canvas/)。当前覆盖 [计划](./plans/canvas-design-system-plan.md) 的 M0–M5 组件能力、M6 受控接口与本地验证；真实服务按用户选择稍后接入。验证结果、截图与限制记录在 [实施记录](./plans/canvas-implementation-log.md)。

## 可以做什么

- 从六类本地节点示例中搜索、分类、点击或拖放新增：Input、Agent、Model、Tool、Condition、Output。
- 平移/选择模式、框选、Shift 多选、节点列表搜索定位、缩放比例、Fit View、MiniMap。
- 移动、批量删除、复制/粘贴、连接、重连、断开、连线中插入节点；每次操作作为一个可撤销事务。
- 在 Inspector 中编辑名称、文本、选项、数字与 JSON。无效输入保留于对象草稿，只有「应用配置」才修改图文档。
- 从可达上游选择兼容输出，以 nodeId、portId、path、type 绑定变量；改名不改变引用，删除来源产生可定位诊断。
- Frame 视觉分组和流程便笺；删除分组保留成员，移动分组整体移动成员。
- 脱敏导出 JSON，校验后导入并替换草稿，撤销恢复替换前的图。

示例只编辑内存配置。模型和工具 ID 是调用方引用，没有运行、保存、发布或凭据服务。刷新/离开会丢失内存修改；有未导出修改时拦截刷新，示例页面同时提供站内离开提示。下载按钮只表示已发起浏览器下载，不表示服务端保存完成。

## 页面布局

四个画布工具页面使用全窗口布局和48px紧凑导航，工作区随窗口高度变化，不受文档站最大宽度、页脚或固定演示高度限制。场景选项默认收起；底部校验/运行/服务面板保留入口，点击标签展开，右侧按钮收起。展开后仍可在200–400px内调整高度，收起再打开保留调整值。

`CanvasWorkspace` 和 `CanvasProjectWorkspace` 的 `layout="fill"` 填满已有明确高度的父容器，底部默认收起；默认 `layout="preview"` 保持组件文档预览。消费方仍自行决定页面导航与容器高度，安装组件不带入本站布局。

## 安装与组合

```bash
pnpm dlx shadcn@latest add http://localhost:3010/r/canvas-workspace.json
```

Registry 自动带入 `@xyflow/react@12.12.0`、引擎 CSS、组件 CSS Modules、主题、模型、命令/校验工具及所需已有组件。`WorkflowCanvas` 自行导入引擎 CSS；消费方须允许全局 CSS 导入。独立项目的安装测试使用 Registry 快照，不依赖开发服务。

```tsx
"use client"
import { CanvasWorkspace } from "@/components/blocks/canvas-workspace"
import { useCanvasEditor } from "@/lib/use-canvas-editor"
import {
  createCanvasDocument,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"

const definitions: CanvasNodeDefinition[] = [
  {
    type: "input",
    label: "Input",
    category: "输入输出",
    defaults: { text: "" },
    ports: [{ id: "text", label: "文本", direction: "output", type: "string" }],
    fields: [
      { key: "text", label: "输入文本", kind: "textarea", required: true },
    ],
    summary: (node) => String(node.config.text ?? ""),
  },
]
const initial = createCanvasDocument()
export default function Editor() {
  const editor = useCanvasEditor(initial, definitions)
  return <CanvasWorkspace {...editor} definitions={definitions} />
}
```

只使用画布时安装 `workflow-canvas.json`，父容器必须明确高度，例如400px；未提供 `onCommand` 时自动只读，选择、缩放与定位仍可用。`CanvasNode`、`CanvasPort`、`CanvasEdge` 为引擎适配器，需在 React Flow 对应上下文中使用。Palette、Inspector、Picker、Frame、Note 均有独立 Registry 项和实际文档示例。

文档与选择均受控。`useCanvasEditor` 是可选内存适配器；业务状态库可以自行执行 `applyCanvasCommand`。运行快照不写入文档或历史；与当前 revision 不同的快照不会覆盖当前节点呈现。运行快照需包含 documentId；事件排序、审批和调试由后述运行适配层提供。

## 键盘和触屏

| 操作                      | 入口                                                      |
| ------------------------- | --------------------------------------------------------- |
| 新增                      | 「添加节点」或侧栏目录；触屏点击即可                      |
| 多选                      | Shift + 点击、选择模式框选、Ctrl/⌘ + A                    |
| 移动                      | 焦点节点方向键8px，Shift + 方向键32px；也可拖动           |
| 连接 / 重连 / 断开 / 插边 | 工具栏「连接端口」；选择边后打开 Inspector                |
| 复制 / 粘贴               | Ctrl/⌘ + C / V，或「画布操作」按钮                        |
| 删除                      | Delete / Backspace，或「画布操作」；输入字段与 IME 不触发 |
| 撤销 / 重做               | Ctrl/⌘ + Z / Shift + Z，或工具栏按钮                      |
| 查看对象                  | 节点列表定位，Tab/Enter 选择；窄屏通过 Inspector 抽屉     |
| 调整底部面板              | 分隔条拖动、上下方向键、Home200px / End400px              |

右键打开的操作对话框与工具栏按钮共用命令；Escape 关闭并恢复触发焦点。只读由 UI 与命令层共同限制，包括拖动、快捷键、配置、注释和导入；业务权限仍需调用方授权。复制可读取只读图，但粘贴属于写操作。

## 文档和校验边界

schemaVersion 为1；字段见 `lib/canvas-model.ts`。JSON 限制512KiB、500节点、1000边、各200个 Frame/Note、嵌套20层。拒绝重复ID、非法坐标、未知顶层字段、不安全对象键、不兼容版本、悬空节点/端口、不合法连接与变量引用。扩展配置放在 `config`，未知节点类型完整保留配置并提示缺少定义。

连接默认 output → input、类型明确匹配、遵循连接数量限制、拒绝重复、自环和回路。`applyCanvasCommand` 可接受显式 `policy` 扩展连接兼容策略；内置工作台采用默认策略。必填输入和未完成配置显示诊断，不阻止用户先构图。

复制生成新ID并重映射内部边/变量；包含未复制来源的外部变量时明确拒绝整次粘贴。删除节点连带删除边，不自动桥接；失效变量保留为错误，便于修复。带失效变量的草稿可导出备份，但再次导入前必须修复引用。

导出只选择图配置字段，再使用共享脱敏工具处理；不输出执行快照或运行产物。消费方应使用凭据引用ID，不应把明文凭据放入配置。导出后的凭据脱敏占位不能作为原凭据恢复。

加载、空、部分、错误、完整数据复用 DataRegion；已有内容的加载/刷新失败保留原图。warning 属于校验，readOnly 属于能力，selected/focus 属于交互，RuntimeStatusBadge 属于运行轴，四者不互相推断。

## 运行与调试

`CanvasRuntimeAdapter` 提供 `run/query`，可选 `stop/decide/reconcileStart`，通过 `scopes` 明确 all/node/from/to 能力。单节点或从此节点运行缺少上游输入时说明原因；调用方可向 `runtime.run(scope,nodeId,inputs)` 提供输入，不隐式复用其他运行输出。

```tsx
const runtime = useCanvasRuntime(editor.document, definitions, adapter)
<CanvasWorkspace {...editor} definitions={definitions} runtime={runtime} catalogs={catalogs} />
```

`CanvasRunSnapshot` 是完整权威快照，包含 documentId/documentRevision/runId/sequence、节点 attemptId、节点和连线状态、稳定事件 ID，以及可选输入/输出/Trace/变量/产物。`runtime.receive(snapshot)` 可接入调用方的订阅；未知 run 不自动成为当前 run。较旧 sequence、其他 run/文档/版本的事件不能覆盖当前快照；重复事件按来源 ID 去重并按来源 sequence 排列，最多保留500条。

图修改后保留旧版本执行详情并标记所属版本，当前图不叠加旧状态。停止请求必须等待来源确认 cancelled；回调接受不推断完成。写请求响应丢失会阻止重复写入；启动按 requestId 查询回执，后续按 runId 对账。相同 sequence 的重读不能冒充新的写确认。来源可在 requests[requestId] 提供 submitted/confirmed/rejected 回执；没有操作回执时，停止需等待权威终态，审批需等待同 attempt 的决定已体现。控制器应由消费方保留在面板之外；切换面板不会复位 unknown，整体卸载后的请求恢复仍由消费方负责。

`CanvasExecutionPanel`、`CanvasExecutionInspector` 和 `CanvasRunControls` 由同一 Registry 条目分发。底部 Activity/Logs 复用 ActivityTimeline 的64px跟随规则；Inspector 有 Input/Output/Details/Trace，审批复用 ToolCall。全部执行预览先脱敏，再限制200行/32KiB，复制也只复制脱敏预览；未提供数值显示“—”。不提供虚构完整下载。运行示例明确标记本地 fixture；查询只读取快照，独立演示时钟推进阶段，不执行真实模型或工具。

Session/Subagent/Human Approval 是调用方节点定义示例。`CanvasField.catalog` 支持 models/tools/credentials，`CanvasCatalogs` 仅含 id/name/available；不可用引用不能应用，不接收凭据明文。导出仍走共享脱敏，凭据引用可能成为脱敏占位，需消费方重新绑定。

## 逐节点播放与运行效果

主工作台点击“运行流程”后自动播放本地演示：节点执行 → 完成 → 连线传递 → 下一个节点执行。示例按运行范围进行稳定拓扑排序并串行呈现，分支不会解释条件或并发执行。来源快照分别提供节点与连线状态，公共组件不推断执行路径。

运行栏的“暂停演示 / 继续演示”冻结或恢复本地时钟和动画；运行 Badge 继续显示最后来源状态。“播放设置”提供暂停后的单步、0.5× / 1× / 2×和流光 / 粒子 / 关闭动画。默认流光、1×、每阶段1000ms；加载页面不自动启动。关闭动画只关闭视觉动效，演示仍会推进。播放速度也不改变真实服务的执行速度。

审批等待、读取失败和未知结果暂停推进，显式批准或安全查询确认后才恢复；停止先显示请求接受，再由 fixture 的独立确认阶段转为 cancelled，演示暂停期间也能确认。隐藏页面不积累补播任务，重新可见后等待完整间隔；修改文档版本停止旧演示时钟，旧快照仍留在调试区。公共组件与真实调用方的运行管理分离。

```tsx
<CanvasWorkspace
  {...editor}
  definitions={definitions}
  runtime={runtime}
  executionVisuals={{ edgeEffect: "particles", speed: 1, paused: false }}
  runtimeToolbar={callerPlaybackControls}
/>
```

`CanvasExecutionVisuals` 可用于 CanvasWorkspace、WorkflowCanvas 和 CanvasNode，字段均可省略：edgeEffect 默认 flow，speed 默认1，paused 默认false。通过 CanvasEdge 的 `data.executionVisuals` 可独立配置连线。CanvasWorkspace 自动根据断线、未知结果和非活动运行状态冻结动效；直接使用 WorkflowCanvas 时，由调用方传入暂停 / 新鲜度信息。没有当前版本快照时不显示执行效果。

连线只对自身明确的 running 状态增加SVG装饰路径，保留原有24px命中区域和选择边界；选中、键盘焦点与运行提示独立。系统 reduced-motion 隐藏流光和粒子并关闭节点脉冲，静态状态与操作仍可读。颜色、动画周期和图元宽度来自 styles/theme.css；播放不会修改图配置、选择、视口或 Undo 历史。框选以节点为目标，忽略引擎自动附带的关联边选中事件；连线仍可独立点击或键盘选择。

## 复杂图、子流程与配置

入口 `/workspace/canvas/project/`，安装 `canvas-project-workspace.json`。`CanvasProjectWorkspace` 接收受控 project/definitions/onChange/readOnly。`CanvasProject` 由 rootId 与多个独立 CanvasDocument 组成，最多20个流程、总计500节点、项目JSON512KiB。`parseCanvasProject` 校验每张图、边界、递归和作用域后整体替换。

输入边界映射 Flow Input 的 output，输出边界映射 Flow Output 的 input，映射方向/类型必须匹配。变量不能直接引用其他流程的节点；跨作用域数据通过调用节点端口交换。`subflow:<flowId>` 产生与边界对应的端口，递归引用被拒绝。进入/返回各子图保留选择、视口和独立本地历史；双击调用节点或使用“进入子流程”。项目导出包含全部子图与边界，普通文档 JSON 仅导出当前子图。

Loop/Iteration 是对子流程的受约束调用容器，不是允许图回路：Loop 要求单输入/单输出且类型相同，并配置1–1000次上限和终止表达式；Iteration 要求单输入/单输出，对外输入/输出均为 array，逐项独立作用域，结果按原输入索引归属，并发1–32。子流程结果属于调用节点，迭代尝试/结果归属需要执行器提供调用/索引/attempt 身份。本库校验、编辑与导航，不实现执行调度或解释表达式。

Switch 示例固定匹配/默认两个出口；Parallel 固定两支独立作用域；Merge 显式 a/b 输入和 all/first 策略，结果归合并节点。`all` 等待全部并按端口归属，`first` 保留完成分支来源。业务执行器必须兑现这些契约，不能把静态拓扑展示当执行证明。

Frame 折叠是临时视图状态，隐藏成员及关联边但保留文档端点；Inspector 显示关联边数，定位成员会展开。多选可左/顶对齐和水平分布，一次事务可撤销。拖动时距其他节点左/顶边8px内显示辅助线。目录保留最近5类节点，命令搜索支持 Ctrl/⌘+K、Tab/Enter/Escape。

`CanvasConfigEditor` 由 NodeInspector 的字段 kind 使用：condition 支持1–20条 AND/OR 规则及字符串/数字比较；schema 支持扁平 object properties/required；key-value 支持字符串键值表；expression/code/json 为受控文本草稿。超出简化 Schema 构建器的约束保留为 JSON，不静默丢字段。表达式和代码始终不执行。有效应用后清除已提交草稿，避免撤销后复活旧表单值。

大图先完成引擎尺寸测量，再仅渲染可见区域；完整文档和校验不裁剪。定位可恢复离屏节点，选择不重新构建所有节点内容。性能证据见实施记录，性能场景入口 `/workspace/canvas/stress/`。

## 保存、版本与发布接口

用户已选择先完成受控接口与本地验证，真实服务稍后接入。入口 `/workspace/canvas/services/` 明确展示本地故障 fixture；不模拟发布成功或虚构在线成员。

```tsx
// initialDocument / serverRevision 必须来自调用方确认过的同一服务快照。
const [session] = useState(() => createCanvasPersistence(initialDocument, serverRevision, storageAdapter))
const persistence = useCanvasPersistence(editor.document, session, true) // 可选600ms autosave
<CanvasWorkspace {...editor} definitions={definitions} persistence={persistence} services={servicePanelProps} />
```

storageAdapter 提供 save/querySave。保存携带 expectedServerRevision 与 requestId；只有 documentId/requestId/documentRevision 全部匹配且服务提供 serverRevision 的回执才确认已保存。保存期间的新编辑继续保留为 dirty；异常响应进入 unknown，不自动重试。明确拒绝后才允许重试；conflict 保留草稿，消费方比较/合并并取得权威基准后显式调用 resolveConflict。保留 session 身份，不要随每次编辑重新创建，从而绕过 unknown 或冲突保护。

`CanvasServicePanel` 接收完整 collaboration snapshot、版本列表、环境目录、权限和受控 operation。讨论与 StickyNote 分开；presence 使用来源 asOf/expiresAt，不持久化到图。版本恢复有明确确认对话框，并携带预期服务版本；不复用本地 UndoRedo。环境、分享、发布只在来源提供能力时显示；发布针对已保存 serverRevision，回执必须属于该文档/版本。未知操作通过 onQueryReceipt 查询，onUncertain 必须把 unknown 保留在调用方状态中，重挂载不能绕过对账。

所有服务仍由消费方实现鉴权、冲突协议、订阅、版本恢复、分享/发布和真实执行。这里的 fixture、编译、浏览器和安装验证只证明组件契约，不证明真实服务或用户业务验收。
