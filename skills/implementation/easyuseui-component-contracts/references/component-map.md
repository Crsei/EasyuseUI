# 组件、源码与分发入口

核对基线：2026-10-08。使用前在库源码或消费项目安装位置重新读导出与类型。下列路径相对EasyuseUI根目录，`registry`列表示条目名，不是npm包名。

## 原语

| 导出                | 源码                                     | registry             | 注意                                                                                                    |
| ------------------- | ---------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| Button              | `components/ui/button.tsx`               | button               | loading受控，图标需aria-label；图标tooltip随条目分发                                                    |
| Input               | `components/ui/input.tsx`                | input                | 原生input属性；label/校验说明由组合层负责                                                               |
| Textarea            | `components/ui/textarea.tsx`             | textarea             | 原生textarea属性/ref；value/defaultValue；Field负责说明与错误关联                                       |
| Label               | `components/ui/label.tsx`                | label                | 原生htmlFor/ref；不替代Field的完整字段关联                                                              |
| NativeSelect        | `components/ui/native-select.tsx`        | native-select        | 原生select/option/optgroup；保留multiple/size与系统移动端选择器                                         |
| Switch              | `components/ui/switch.tsx`               | switch               | Base UI checked/defaultChecked/onCheckedChange；name/form、disabled/readOnly；设置保存属于调用方        |
| RadioGroup / Item   | `components/ui/radio-group.tsx`          | radio-group          | 泛型value/defaultValue/onValueChange；原生表单与键盘；Segmented保留分段选择用途                         |
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

Card、通用Tooltip/Toast目前没有对应通用组件导出。Tabs、Popover、Select、Combobox、Menu、CommandPalette、Table和Sheet已有源码/Registry；Drawer的基础抽屉用途优先复用Sheet，额外滑动手势需另核对。部分其他功能仍内嵌或通过原生元素存在，不意味着可从`components/ui/`导入同名文件。先重查目标版本；仍缺失时按目标项目规范补齐，并实现相应键盘/焦点语义。

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

## shadcn 补齐 S2–S8（2026-10-09）

以下条目均有对应源码、Catalog、示例与 Registry；用法仍以实际导出为准。

| 导出                                                                                                                                             | 源码                                  | Registry        | 固定边界                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | --------------- | --------------------------------------------------------------------------- |
| ButtonGroup                                                                                                                                      | `components/ui/button-group.tsx`      | button-group    | 只组合兄弟操作目标，不引入选中状态。                                        |
| InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea                                                                                 | `components/ui/input-group.tsx`       | input-group     | 标签由原生输入负责；附加操作保持独立。                                      |
| Toggle                                                                                                                                           | `components/ui/toggle.tsx`            | toggle          | 按下与焦点独立；值由调用方持有。                                            |
| ToggleGroup, ToggleGroupItem                                                                                                                     | `components/ui/toggle-group.tsx`      | toggle-group    | 值始终为数组；方向键移动焦点。                                              |
| InputOTP                                                                                                                                         | `components/ui/input-otp.tsx`         | input-otp       | 保留原生粘贴、选择、删除、自动填充及表单行为；验证由调用方负责。            |
| Separator                                                                                                                                        | `components/ui/separator.tsx`         | separator       | 装饰性分隔默认不进入无障碍树。                                              |
| Collapsible, CollapsibleTrigger, CollapsibleContent                                                                                              | `components/ui/collapsible.tsx`       | collapsible     | 展开与业务选择分开；触发器保持键盘与焦点关联。                              |
| Accordion, AccordionItem, AccordionTrigger, AccordionContent                                                                                     | `components/ui/accordion.tsx`         | accordion       | 每个标题有独立触发器；禁用项不展开。                                        |
| Tooltip, TooltipProvider, TooltipTrigger, TooltipContent                                                                                         | `components/ui/tooltip.tsx`           | tooltip         | 提示不承担关键操作；浮层进入当前主题边界。                                  |
| AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel                                 | `components/ui/alert-dialog.tsx`      | alert-dialog    | 确认按钮由调用方提供；请求返回不代表操作完成。                              |
| HoverCard, HoverCardTrigger, HoverCardContent                                                                                                    | `components/ui/hover-card.tsx`        | hover-card      | 重要内容需通过链接或可见按钮到达；预览不是唯一入口。                        |
| ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem                                                                             | `components/ui/context-menu.tsx`      | context-menu    | 提供可见菜单替代以支持触摸；动作仅由回调触发。                              |
| Skeleton                                                                                                                                         | `components/ui/skeleton.tsx`          | skeleton        | 加载语义由外层区域负责；减少动效下无闪烁。                                  |
| Spinner                                                                                                                                          | `components/ui/spinner.tsx`           | spinner         | 减少动效时停止旋转，保持状态文字。                                          |
| Empty                                                                                                                                            | `components/ui/empty.tsx`             | empty           | 操作由调用方提供；不把错误展示为空数据。                                    |
| Alert, AlertTitle, AlertDescription                                                                                                              | `components/ui/alert.tsx`             | alert           | 即时错误用 alert，常规通知用 status；不改变运行状态。                       |
| Progress, Meter                                                                                                                                  | `components/ui/progress.tsx`          | progress        | 未知进度不提供伪造百分比；测量值使用 Meter。                                |
| ToastProvider, Toaster, useToastManager, createToastManager                                                                                      | `components/ui/toast.tsx`             | toast           | 通知仅表达调用方已知事实，不根据请求返回推断业务完成。                      |
| ToastProvider, Toaster, useToastManager                                                                                                          | `components/ui/sonner.tsx`            | sonner          | 使用同一 Provider 与 Toaster；不承诺 Sonner 包的 API 兼容。                 |
| DateCalendar                                                                                                                                     | `components/ui/date-calendar.tsx`     | date-calendar   | 使用 YYYY-MM-DD 与 UTC 日历运算；禁用日期不可选择，范围内禁用日会阻止完成。 |
| DatePicker                                                                                                                                       | `components/ui/date-picker.tsx`       | date-picker     | 单日或完整范围选择后关闭并恢复焦点；日期值不因语言或时区变化。              |
| Pagination                                                                                                                                       | `components/ui/pagination.tsx`        | pagination      | 只请求页码变化；未知总数依赖 hasNext，不推断最后一页。                      |
| Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator                                                  | `components/ui/breadcrumb.tsx`        | breadcrumb      | 导航使用链接；当前页面使用 aria-current。                                   |
| Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem                                                                                | `components/ui/menubar.tsx`           | menubar         | 键盘跨菜单导航由 Base UI 管理；禁用动作不执行。                             |
| NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuViewport | `components/ui/navigation-menu.tsx`   | navigation-menu | 保留链接和键盘语义；主题浮层通过 Viewport 分发。                            |
| DirectionProvider                                                                                                                                | `components/ui/direction.tsx`         | direction       | 方向边界不翻译调用方内容，值与服务请求保持不变。                            |
| Attachment                                                                                                                                       | `components/ui/attachment.tsx`        | attachment      | 不读取或上传文件；未知结果和忙碌状态阻止再次写入。                          |
| Marker, MarkerIcon, MarkerContent                                                                                                                | `components/ui/marker.tsx`            | marker          | 只读标记无交互悬停；调用方内容保持原样。                                    |
| Questionnaire                                                                                                                                    | `components/blocks/questionnaire.tsx` | questionnaire   | 答案受控；支持跳过、回退和错误保留；提交结果由调用方确认。                  |
| Bubble, BubbleContent, BubbleAttribution                                                                                                         | `components/ui/bubble.tsx`            | bubble          | 用于独立引用示例，不改变 ChatMessage 的同轴对话布局。                       |
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter                                                                            | `components/ui/card.tsx`              | card            | 普通会话、日志和列表继续使用 Item、list 或 table。                          |
| AspectRatio                                                                                                                                      | `components/ui/aspect-ratio.tsx`      | aspect-ratio    | 比例必须为有限正数；无效输入回退 16:9。                                     |
| Carousel                                                                                                                                         | `components/ui/carousel.tsx`          | carousel        | 不自动播放；隐藏页保留草稿并离开 Tab 顺序；方向随 RTL 调整。                |
| Chart                                                                                                                                            | `components/blocks/chart.tsx`         | chart           | 最多展示最近120项；空、缺失、负值和零值分开，未增加图表依赖。               |
| Form, FormField                                                                                                                                  | `components/ui/form.tsx`              | form            | 调用方拥有验证、提交、错误和持久化；不要求特定表单库。                      |
| Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter, SidebarLink                                                               | `components/blocks/sidebar.tsx`       | sidebar         | 默认宽256、折叠48；标签和当前链接保留；不持久化偏好。                       |
| Resizable, ResizableHandle                                                                                                                       | `components/ui/resizable.tsx`         | resizable       | 支持指针、键盘、RTL、边界和取消；像素值由调用方持有。                       |
| ScrollArea                                                                                                                                       | `components/ui/scroll-area.tsx`       | scroll-area     | 无需模拟滚动条；保留键盘、选择、查找与 ref。                                |
| Command                                                                                                                                          | `components/blocks/command.tsx`       | command         | 结果、过滤和激活由调用方提供；不默认监听全局快捷键。                        |
| Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerHeader, DrawerBody, DrawerFooter, DrawerClose                                           | `components/ui/drawer.tsx`            | drawer          | 仅底部显式手柄支持滑动；正文原生滚动，焦点恢复沿用 Sheet。                  |

Conversation 的 `actionsRef.scrollToMessage(id, { focus })` 只定位已加载记录，不请求历史，不选中或执行消息；找不到返回 false。`jumpToLatest` 恢复尾部跟随。WorkspaceShell 的侧栏调整复用 ResizableHandle，原受控布局接口继续适用。
