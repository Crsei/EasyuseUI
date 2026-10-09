# Agent 编码工作台增强实施记录

日期：2026-10-09。状态：E0–E5 已实现并通过本地验收。实施基线：`0531cf20e1ba3d69c0b820984ec8aa2f16fdc32e`（增强计划已提交）；最终验证合入已提交的 Icon 基线 `7891d61612b7663d865b36d3c652bc1c5e8fe9d5`。本轮执行 [增强计划](./agent-coding-workbench-enhancement-plan.md) 的 E0–E5；E6 可选真实服务能力另行接入。本记录独立于已有组件、展示计划记录。

## 接口与职责

- `WorkspaceShell.activityBar` 是可选48px活动栏；未传时保留原导航行为。容器不足1024时辅助导航进入焦点受约束的Sheet，窄屏轨道提供会话/文件/任务和更多菜单；Inspector和主区依据实际容器宽度收敛。首次进入和保留挂载的 `WorkbenchFrame` 使用同一槽位。
- 页面/会话导航使用URL链接；同页活动区与文档选择是视图状态。设置使用Dialog；停止/批准/发送沿用独立请求回执。Mod+K仍搜索会话，新增命令菜单只跳转或打开表单，不直接执行命令。
- `ResourceSnapshot` 与 `ChangedFile` 分开。资源键包含project/session/resource/revision；可选range不改变文件身份。`openDocument`只替换临时标签，固定标签及旧修订保留；关闭标签不删除来源。`acceptResourceRead`拒绝错身份/错修订，刷新失败保留同对象正文，无权限不会保留旧正文。
- `WorkbenchFilePreview` / `WorkbenchResourceContent` / `WorkbenchDocumentTabs` 共用来源renderer。文本最多1000行/8192字符每行/256KiB；Markdown32KiB，JSON/CSV64KiB，CSV最多100个数据行/64列。图片只允许有界raster data或宿主明确允许的HTTP(S) origin；无嵌入凭据，不自动播放动图。HTML/SVG仅源码，不插入主文档、不执行脚本或外部资源。
- 复制显示片段与下载源字节分别标注。下载依赖宿主显式能力；fixture适配器返回真实Blob，文本导出与预览走同一脱敏边界。未知/无权限/无字节不提供可用下载。
- `ExecutionSessionList` 接收独立commandId/sessionId/runId/toolCallId、输出和连接/结果事实；未知退出码显示“—”，没有输出仍区分运行与结束。关闭面板不发送取消。工具、命令、文件、消息可以互相定位。
- 设置Dialog和`page=settings`共用 `SettingsForm`。设置草稿和已生效值分离；取消不提交；应用产生pending回执；failed/unknown保留两者，unknown阻止重复写入；确认绑定原会话和基础配置，检测并发选择，不清除较新的对话草稿。只接收模型/环境/权限三个字段。主题/语言是明确的即时本地偏好，不作为配置保存的服务写入。
- 工具连接/启用、执行策略、推理参数、上下文总预算/压缩、PDF/媒体、PTY、Git/PR、检查点和持久化没有来源能力，保持说明；UI配置选择不扩张服务权限。普通问题仍使用回答流程，审批仍沿用ApprovalRequestPanel。

## 阶段矩阵

| 阶段 | 实现 | 验证状态 |
| --- | --- | --- |
| E0 基线与接口 | 保留白名单URL、原Session/Draft/receipt、三个模板；统一Inspector契约残留文字为280–360，未修改尺寸token | 通过模型、URL、草稿及兼容回归 |
| E1 侧边入口 | 活动栏、导航收敛、文件树、辅助Sheet、顶部只保留示例返回/fixture/示例设置 | 通过宽窄容器、浏览器前进后退、停靠后返回草稿 |
| E2 设置与输入 | 设置Dialog/同源设置页、常驻模型权限环境与调度、引用条、搜索多选上下文、独立命令菜单 | 通过取消/应用/unknown核对、IME、双语、焦点及软键盘回归 |
| E3 文件与产物 | 文本/Markdown/raster/Diff小窗、临时/固定文档、类型与来源、上下文添加、真实字节下载、读取身份与修订 | 通过格式、安全、晚到读取、固定旧修订和下载字节验证 |
| E4 工具与运行 | 工具折叠组、命令身份/异常fixture、工具/输出/文件/消息联动、JSON/CSV、HTML/SVG源码降级 | 通过失败/空输出/断线/unknown和来源联动；可选非模态浮窗未启用 |
| E5 展示与分发 | 区域实验室、三模板、五个Catalog条目、Registry依赖与独立消费者、双语/主题/短视口/触摸 | 通过静态检查、浏览器回归和独立安装 |
| E6 可选深度能力 | 未接入；独立后续 | 无真实服务验收 |

## 检查与证据

使用隔离快照 `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/EasyuseUI-agent-coding-validation-20261009`，复用安装的依赖，避免共享3010产物被构建替换。已提交的Icon改动纳入最终基线；共享工作区尚未提交的SVG等并行改动不纳入本轮。共享Manifest/Registry/i18n/文档生成输出仅合并本任务差异。

| 检查 | 结果 |
| --- | --- |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 最终源码通过 |
| `EASYUSEUI_LOCAL_BUILD=1 NEXT_PUBLIC_SITE_URL=http://localhost:3010 pnpm build` | 最终源码通过；Webpack/WASM SWC静态导出 |
| 模型/旧工作台/布局/新增浏览器回归 | 212项组合回归中211通过，唯一失败为嵌套tabpanel的测试定位歧义；限定文档面板后最终重跑全部受影响套件132项通过，包含新增21项。剩余80项模型/布局/Workspace回归已在组合运行通过 |
| `pnpm check:i18n`、`pnpm check:manifest`、`pnpm check:docs`、`pnpm check:ui-contracts` | 通过；双语1557组件键/2211站点键/166 CRM键，198组件、216 Registry项目；309懒加载资源、74安装后snippet、198合同映射 |
| `pnpm test:install` | 通过；全新消费者安装Registry源码/CSS、类型检查、生产构建和浏览器验证；新增资源预览/真实下载/脱敏/固定标签/双语/unknown命令与既有工作台均覆盖 |
| 1000消息/1000文件行/连续输出测量 | 已记录下表；原生DOM、非虚拟列表 |

测量使用本地fixture：已有2条加1000条历史、1000行有界文件预览及500行连续输出来源。数值是本机单次浏览器样本，没有通过值阈值或真实服务容量验收。

| 指标 | 最终样本 |
| --- | --- |
| 首个可用输入框 | 页面performance时钟1773ms（含页面加载和测试等待） |
| 打开1000行文件至可见 | 771.9ms（含命令菜单选择和测试等待） |
| 程序滚动到顶部/底部并等待两帧 | 10次样本6.2–33.5ms；不是用户输入延迟或p95基准 |
| DOM / 消息 | 23185节点 / 1002条消息；未虚拟化 |
| JS已用堆 | 79001104字节，约75.3MiB；单次Chromium估计，不代表进程总内存 |
| renderer加载范围 | 现有FileViewer/MessageContent/DataTable/DiffViewer与有界原生图片；没有引入编辑器、PDF或媒体重依赖。资源示例由Catalog懒加载，预览renderer复用组件已随工作台加载 |

### 修复记录

- 首次直接共享树类型检查：共享`.next/dev/types`与`.next/types`产生路由类型冲突，且并行SVG资产尚未齐全；改用隔离快照。修复本任务Resource error缺少reason字段。
- 新增设置测试发现额外payload字段可能被spread覆盖对话草稿；Reducer现将配置白名单化，确认只更新三个配置字段。
- 首轮浏览器发现活动栏Button包装改变链接语义，已改为原生Link+既有tooltip；移动flex行可能把主区压为0宽，已改为纵向布局。
- 新增上下文测试最初误将Inspector继承来源计入草稿，已按Composer引用条限定断言。读写身份、错误结果和权限边界不降低断言。
- 关闭/停靠后迟到读取曾可能重新打开小窗；关闭、停靠、来源切换均使旧读取序号失效。固定文档从匹配来源的快照保留正文；不同revision的引用保留元数据降级。
- 软键盘使500px高视口中的Composer受到重复区域开关挤压；增强示例使用现有活动栏和工具栏入口，隐藏重复开关，并在聚焦输入框时响应窗口/visualViewport调整。
- 文件停靠后的浏览器返回曾保留旧pane选择；页面或布局URL导航清除旧局部选择，前进后退保持同一Composer实例和草稿。
- 独立消费者最初位于较深且嵌套的临时目录，pnpm父级工作区和Chrome本地socket受目录影响；改为仓库外短路径，恢复共享依赖后完成完整安装验证。未改package/lock或绕过安装检查。

最终截图及测量JSON位于隔离快照 `.delivery-final-results/`；浏览器记录为 `.delivery-final-browser.log`（132通过）及 `.validation-browser-delivery.log`（组合回归），静态输出在 `.validation-lint.log`、`.delivery-typecheck.log`、`.validation-build.log`。独立安装记录为 `.validation-install-delivery.log`，消费者位于 `/data2-HDD-SATA-20T/aw-tmp/easyuse-ui-consumer-eienGG`。这些本地证据及构建产物不提交。它们是fixture、静态与独立安装证据，不是服务执行、权限持久化或用户业务验收。
