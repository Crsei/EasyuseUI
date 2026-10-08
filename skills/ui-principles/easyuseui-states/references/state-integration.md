# EasyuseUI 状态接入要点

本参考仅用于复用模式；独立实现用目标项目 API 表达同样语义。以下以 2026-10-08 源码为核对基线，不替代目标版本类型。

## DataRegion

`components/ui/data-region.tsx` 导出 `DataRegion`、`DataRegionProps`、`RegionError`。`hasContent` 由调用方明确传入，组件不从 children推断。请求、缓存、更新时间由调用方管理。

| 场景           | 属性组合                                                               |
| -------------- | ---------------------------------------------------------------------- |
| 首次加载       | `state="loading"`、`hasContent={false}`                                |
| 同对象刷新     | `state="success"`、`hasContent`、`refreshing`                          |
| 同对象刷新失败 | `state="error"`、`hasContent`、`error`、`updatedAt`、按能力`onRetry`   |
| 初次读取失败   | `state="error"`、`hasContent={false}`、`error`                         |
| 部分数据       | `state="partial"`、`partialDescription`、按能力`onLoadMore`            |
| 成功但为空     | `state="empty"`、`emptyTitle`、`emptyDescription`、按原因`emptyAction` |

`RegionError` 包含 `category`、`message`、`reason`。状态和错误类型源在 `lib/runtime-status.ts`。安全读取重试与外部写入重试分开。

## Runtime 与消息

`RuntimeStatusBadge` 接受字符串`status`，支持明确展示未知值；不要在适配层先把未知值强制转成idle。统一中文与tone映射在`runtimeStatusMeta`，页面不自建副本。

`MessageState` 是`chat-message.tsx`的独立类型，不是`RuntimeStatus`。`ChatComposer`接收`value/onChange/onSend`，`onSend`可返回Promise；提交失败由调用方继续保留受控value，成功清空也由调用方决定。

## Inspector

`Inspector`接收`object: InspectorObject | null`、`state/error/onRetry/refreshing`。对象包含`id/title/kind/status?/metadata`。停靠、调整宽度、浮层焦点由`WorkspaceShell`负责。

适配层先确认响应object ID等于当前选择，再一次性更新快照。组件内部key会重置复制反馈，不能代替业务层拦截迟到网络响应。当前Inspector没有直接的`updatedAt`属性；需要新鲜度提示时按现有组合能力呈现，不编造prop。

## ToolCall

| 输入                                       | 语义                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `call.id/name/status`                      | 调用身份、工具名、最后确认runtime                                      |
| `call.outcome`                             | `known`或`unknown`；未提供时现有API按known处理，适配层必须显式标不确定 |
| `call.receipt`                             | 关联回执；与ID一起用于查询                                             |
| `data.state/error/onRetry`                 | 详情读取态与重读，不能当重新执行                                       |
| `permission.scope/risk/onApprove/onReject` | 批准范围、风险与真实能力                                               |
| `onCancel/onRetry`                         | 提交取消/重新执行请求，等待来源确认                                    |
| `onReconcile`                              | 查询/对账；调用方用来源结果更新call                                    |
| `onDownload`                               | 接收组件脱敏后的字符串，不应改回下载原始敏感输出                       |
| `call.outputTruncated`                     | 来源仅提供片段，不能声称组件可恢复完整数据                             |

回调失败后组件会标记结果不确定并暂停写动作。调用方在明确结论前保持`outcome="unknown"`；重新挂载不是对账。详情重读成功不能自动触发工具重新执行。

`lib/redact.ts`提供脱敏与有界预览，最大200行/32KiB；业务特殊凭据仍由调用方预处理。缺失exitCode不补0，空output不推断结果。审批仅在现有组件允许的状态及明确能力下提供，不能通过修改文案伪造权限。
