# 组件、源码与分发入口

核对基线：2026-10-08。使用前在库源码或消费项目安装位置重新读导出与类型。下列路径相对EasyuseUI根目录，`registry`列表示条目名，不是npm包名。

## 原语

| 导出                | 源码                                     | registry             | 注意                                                                                                    |
| ------------------- | ---------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| Button              | `components/ui/button.tsx`               | button               | loading受控，图标需aria-label；图标tooltip随条目分发                                                    |
| Input               | `components/ui/input.tsx`                | input                | 原生input属性；label/校验说明由组合层负责                                                               |
| Badge               | `components/ui/badge.tsx`                | badge                | 只读；通用tone不替代runtime映射                                                                         |
| Tag                 | `components/ui/tag.tsx`                  | tag                  | 只读分类，依赖Badge                                                                                     |
| Chip                | `components/ui/chip.tsx`                 | chip                 | `selected/onSelectedChange/onRemove/disabled/busy`；两目标为兄弟                                        |
| Dialog及子组件      | `components/ui/dialog.tsx`               | dialog               | 读实际导出，不能套其他Dialog库的API                                                                     |
| Item                | `components/ui/item.tsx`                 | item                 | 主目标与trailing分离；组件受控选择                                                                      |
| RuntimeStatusBadge  | `components/ui/runtime-status-badge.tsx` | runtime-status-badge | `status: string`，显示未知值；字典在runtime-status条目                                                  |
| DataRegion          | `components/ui/data-region.tsx`          | data-region          | `hasContent`显式传；请求和缓存不在组件内                                                                |
| Tree / moveTreeNode | `components/ui/tree.tsx`                 | tree                 | `nodes/label/selectedId/onSelect/onActivate/expandedIds/onExpandedChange/onLoadChildren/onMove/canMove` |

`TreeMove`为`sourceId/targetId/position`，position是before/inside/after。`moveTreeNode`只变换内存树，不持久化；调用方验证权限并确认移动。不要假设默认多选。

## 产品模式与工作台

| 导出                                      | 源码                                      | registry          | 输入与责任                                                                            |
| ----------------------------------------- | ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| SessionRow                                | `components/blocks/session-row.tsx`       | session-row       | `session`含id/title/status/updatedAt；`action.onAction/busy/disabledReason`表示能力   |
| AgentRow                                  | `components/blocks/agent-row.tsx`         | agent-row         | `agent`含id/name/status，可选offline/updatedAt/aggregate；action结构同行              |
| ActivityTimeline                          | `components/blocks/activity-timeline.tsx` | activity-timeline | `events`、`selectedId/onSelect`、`data`；稳定ID去重与来源顺序                         |
| Inspector                                 | `components/blocks/inspector.tsx`         | inspector         | `object`完整快照或null；`state/error/onRetry/refreshing`；布局不是其责任              |
| ChatMessage / Conversation / ChatComposer | `components/blocks/chat-message.tsx`      | chat-message      | 三个导出共用条目；MessageState与RuntimeStatus分开                                     |
| ToolCall                                  | `components/blocks/tool-call.tsx`         | tool-call         | `call/data/permission`与操作回调；outcome、receipt、截断与脱敏                        |
| WorkspaceShell                            | `components/blocks/workspace-shell.tsx`   | workspace-shell   | `title/sidebar/children/toolbar/inspector/inspectorTitle/inspectorFooter/bottomPanel` |
| StyleWorkbench                            | `components/blocks/style-workbench.tsx`   | style-workbench   | 局部A/B实验；模型在`lib/style-workbench-model.ts`，不能同组件同名影响导入重写         |
| ScrollPlayground                          | `components/blocks/scroll-playground.tsx` | scroll-playground | 独立滚动预览，不作为工具列表默认风格                                                  |
| TaskPanel                                 | `components/blocks/task-panel.tsx`        | task-panel        | 本地任务展示，自己的TaskStatus不替代十种RuntimeStatus；执行由调用方管理               |

`ChatComposer`受控输入为`value/onChange/onSend`，可配`pending/streaming/disabled/onStop/attachments`。`Conversation.messages`使用实际`ChatMessageProps`及可选after槽，不假设支持任意聊天库的消息schema。

## 共享来源与接入

- `styles/theme.css`：共享token，registry构建从此提取主题。
- `lib/runtime-status.ts`：RuntimeStatus、DataState、ErrorCategory与统一映射。
- `lib/use-follow-tail.ts`：对话/活动滚动跟随与历史锚点辅助。
- `lib/redact.ts`：脱敏与有界预览；特殊业务凭据仍需适配层处理。
- `components/examples/`：可运行本地适配示例，不能当真实服务来源。
- `lib/catalog.ts`与`registry.json`：文档/演示与分发文件/依赖清单。

CSS Module、内部lib与主题通过Registry依赖一并分发。若复制源码或修改文件名，核对同目录CSS、import重写、别名和依赖闭包；不要只复制tsx。安装主题前检查消费项目CSS，不能把接入组件视为整站换肤授权。

## 已知没有通用导出的模式

Tabs、Popover、Select、Combobox、Menu、CommandPalette、Card、Table、Drawer/Sheet、通用Tooltip/Toast目前没有对应通用组件导出。部分功能内嵌或通过原生元素存在，不意味着可从`components/ui/`导入同名文件。先重查目标版本；仍缺失时按目标项目规范补齐，并实现相应键盘/焦点语义。

## Canvas

| 组件 / 工具                          | 文件                                                     | Registry                                | 关键契约                                                                                                            |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| WorkflowCanvas                       | `components/blocks/workflow-canvas.tsx`                  | workflow-canvas                         | `document/definitions/selection/onSelectionChange/onCommand/readOnly/issues/execution/focusRequest`；父容器明确高度 |
| CanvasNode / CanvasPort / CanvasEdge | `components/ui/canvas-*.tsx`                             | canvas-node / canvas-port / canvas-edge | 引擎适配器；通过 WorkflowCanvas 装配；不能独立渲染 Handle                                                           |
| NodePalette                          | `components/blocks/node-palette.tsx`                     | node-palette                            | `definitions/onAdd/readOnly`；点击和拖放共用定义                                                                    |
| NodeInspector                        | `components/blocks/node-inspector.tsx`                   | node-inspector                          | `document/definitions/nodeId/onCommand/readOnly/issues`；无效草稿不写图                                             |
| VariablePicker                       | `components/blocks/variable-picker.tsx`                  | variable-picker                         | `document/definitions/targetId/expectedType/onInsert/readOnly`；稳定引用与上游可达性                                |
| CanvasFrame / CanvasNote             | `components/blocks/canvas-frame.tsx` / `canvas-note.tsx` | canvas-frame / canvas-note              | `frame/selected` 或 `note/selected`；不带执行语义                                                                   |
| CanvasWorkspace                      | `components/blocks/canvas-workspace.tsx`                 | canvas-workspace                        | 完整受控工作台；复用 Shell/Inspector/Tree/DataRegion                                                                |
| useCanvasEditor / applyCanvasCommand | `lib/use-canvas-editor.ts` / `canvas-commands.ts`        | canvas-editor                           | 可选本地历史；所有写命令统一只读防护                                                                                |

内部零件 CanvasConnectionForm 归 CanvasWorkspace；canvas-controls 和 annotations CSS 为共享分发样式。模型、校验和组件文件 basename 保持不同。已补CanvasExecutionPanel/CanvasExecutionInspector/CanvasRunControls（同条目）、CanvasProjectWorkspace、CanvasConfigEditor、CanvasServicePanel；对应runtime/project/services模型与控制器有Registry闭包。保存Session由调用方持有，unknown不随面板卸载复位。真实服务不属于组件fixture证明。使用与安装见项目 CANVAS.md，验证见 tests/canvas*.spec.ts 和 scripts/check-install.mjs。
