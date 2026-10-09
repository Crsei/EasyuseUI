# Agent Workspace 首轮实施记录

2026-10-10，首轮 Pi 实现完成。冻结起点 `3f8de319db3eebb71ad3819ee02d304bf87c4313`。

范围为 AW0–AW5 / Pi P0–P5；AW6–AW8、DL3–DL4、编辑器/Git/PTY/Checkpoint 与多 Agent 不在首轮交付中。

## AW0 页面和模块实施声明

执行来源：[设计计划](agent-workspace-plan.md) PG01/PG05、MD01/03–07/09/12，V01–V11；[公共设计原则](../Design-rules.md)、[组件合同](../Component-Specification.md)、[状态](../UI-STATES.md)、[工作台合同](../AGENT-WORKBENCH.md)。

PG05：本地单用户真实服务页 `/examples/agent-workbench/pi/`。主要流程为连接 → 项目 → 会话 → 历史/复制继续 → 发送/停止 → 刷新恢复。Host 持有会话、执行、认证、能力和回执，网页仅保存视图及逐会话草稿；外部历史只读。全局栏48px，导航轨56px，会话Header64px，侧栏256px；主区独立滚动，内容列760px，Composer固定底部。Inspector/底栏首轮收起，不展示虚构资源；390px用Shell导航Sheet。选中会话不停止后台任务；对象切换丢弃迟到请求，保留每会话草稿。切语言/主题不触发写入。浏览器验证入口、恢复、IME、历史锚点、窄屏、双语/双主题。

MD01/02/03/04：复用 WorkspaceShell、ProjectSwitcher、SessionNavigator、SessionHeader 和 RuntimeStatusBadge。会话选中底色/2px指示与运行状态独立，单行40px/双行56px/触摸44px；真实环境显示来源路径，缺失branch为未知。新会话与复制有持久化回执；视图切换确认前禁止发到旧会话，旧草稿保留，停止仍按真实运行能力。

MD05–07/09：复用 AgentConversation、Conversation、ChatMessage、MessageContent 与 ToolCall；开放Agent正文，用户右对齐浅蓝气泡/R16/12×16/最大72%。阶段横线1px/上下16px，仅真实Action/Output转换；隐藏思考不透传。相邻只读工具可折叠，错误/unknown常驻可见，保留文本/工具源顺序。页面历史沿原始父链，不受模型压缩删除；50条分页且绑定revision/branch。补载保持锚点，64px跟随阈值。

MD12：复用 AgentComposer/ChatComposer。输入版本与会话身份绑定，确认只清提交版本，失败/unknown保留草稿且unknown先查询。支持发送、停止，关闭queue/steer/附件/审批。模型只用Host给出的可用列表，权限仅只读；切模型不清输入。键盘、IME、触摸、reduced-motion沿公共组件。

协议采用SDK `@earendil-works/pi-coding-agent@1.1.0`（Node v24.21.0 / GLIBC2.28导入已验证）；单Host写锁，默认单运行；无跨进程exactly-once承诺。崩溃留下的pending/旧running变unknown并锁写，手动对账读取来源证据；不自动补发。

## 验证记录

起始并行修改为 AGENTS.md、i18n-messages 的四处空行、docs-code 产物及 SVG 计划。保留这些工作；提交中的 i18n 只包含本轮六个阶段文案，docs-code 只更新本轮相关来源，不吸收原有 Work Items 产物差异。

| 阶段 | 本轮结果 | 证据 |
| --- | --- | --- |
| AW0 / P0 | 完成锁定 SDK、协议、身份、能力和 PG05/MD 声明 | 项目依赖 1.1.0；Node 24.21.0；独立协议和无扩展只读 Driver |
| AW1 / P1 | 项目/会话、只读默认分支、压缩记录、复制继续和有界分页 | Host 原生 JSONL 服务测试；原文件字节及 mtime 不变；两个项目隔离 |
| AW2 / P2 | 真实 prompt/subscribe/abort、来源接受回执、单写者和 SSE | Host 8 项测试；真实 provider 浏览器调用；请求 ID 同键去重、runId 停止、epoch 重连 |
| AW3 / P3 | PG05 与 PG01 入口、核心受控模块和参考 V2 外观 | 生产挂载页面；用户蓝色气泡、开放 Agent 正文、阶段线和固定输入；390/768/1024/1440px |
| AW4 / P4 | 草稿/刷新/迟到响应/重启/并发与 unknown 锁 | 9 项受控浏览器场景；双标签并发、丢回执查询、迟到复制、历史锚点和新建等待保护 |
| AW5 / P5 | 首轮工程与真实模型验收，公共组件独立分发 | 最终候选 lint/typecheck/build、Host 类型/服务检查、Pi 10 项端到端、旧工作台回归及独立安装；Git SHA 以承载本记录的提交及最终远端核验为准 |

U01–U06 交付 Pi 必需的项目/环境、导航、会话、Header、对话和 Composer；U10 交付历史恢复/复制继续的子范围。U03 的完整任务树/归类、U07–U09 的完整宽编辑区/PTY、U10 的文件检查点、U11–U13 的调度/项目长期工作/观测仍属后续。S1 真实对话闭环已验证；S2–S4 未交付。

### 最终候选与工程验证

冻结源树为从 `3f8de319` 导出后叠加明确任务文件的独立目录；未吸收共享工作树的 AGENTS、空行和 SVG 计划。候选使用当前锁定的依赖目录，独立 `.next/out`；公共分发另在全新 consumer 中重新安装、编译和浏览器挂载。正式浏览器预览由本轮进程独占 3011，受控 Host 3013、真实 Host 3014，临时项目和会话自行清理。共享 3010 的观测单独算 smoke。

- `pnpm lint`、`pnpm typecheck`、`pnpm pi:typecheck`、`pnpm pi:test`、Webpack `pnpm build`：通过。Host 最终 8/8，含关闭等待初始化/落盘、原生恢复、去重、只读源/分支/压缩、1000 条分页、超大工具载荷、崩溃 unknown 及 HTTP/SSE。
- `PI_REAL_PROVIDER=1 ... playwright.pi.config.ts`：最终 10/10，9 项受控浏览器场景和 1 项真实 provider 场景；真实模型场景 25.9 秒，整组约 1.5 分钟。两类证据分别登记，受控模型不算真实模型证明。
- 旧工作台主回归 183/183 通过，编码工作台浏览器 15/15 复测通过，共覆盖198个不同用例（不是一次完整198全绿运行）。回归包括 `agent-workbench`、showcase、model、`agent-coding-workbench` 及其 model。公开工具分组的例外改为常驻可见，同时保留命令导航回调，原断言随正式展示合同更新；首次合并运行196/198，两个编码场景因常驻工具的同名按钮与修正后的“展开侧栏”名称失败，按具体区域和实际打开语义修订后15/15通过。
- `pnpm test:install`：全新 consumer 的 Registry 安装、TypeScript、Webpack 生产构建和实际挂载；公共模块不依赖 Pi、Next 站点认证或服务目录。
- 静态构建使用 `EASYUSEUI_LOCAL_BUILD=1 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3011`；这是本地验收源，不是公开部署地址。GLIBC 2.28 使用 Next WASM SWC 回退完成构建。

截图与基线在未提交的 `.local/pi-delivery-evidence/`：`real-provider-desktop.png`、`real-provider-stop.png`、`pi-mobile-en.png`、`pi-short-dark.png`。实际检查了页面布局和消息/工具模块；移动采用触摸/reduced-motion 浏览器上下文，短视口和 200% 等效 CSS 布局是自动化模拟，不是手机硬件或人工辅助技术验收。

### 真实 provider 和恢复

实际使用用户现有 Pi 默认 `openai-codex/gpt-6.1-sol`，没有更换 provider。合成旧历史含 `ORCHID-7249`，临时 `proof.txt` 含 teal。网页复制继续 → 真实流式和 Read → 刷新保留消息身份 → 重启 Host → 不重读文件仍能回答旧标记和颜色 → 显式停止并等来源 cancelled，完整通过。外部合成历史的内容和修改时间保持不变；没有拿用户真实聊天做测试。

新建/复制回执未完成视图切换时，暂停旧视图发送并保留旧草稿；切到别的项目仍可工作，迟到响应只更新正确缓存，不抢回导航。已确认发送仅清原草稿版本，刷新和语言/主题变更不触发服务写入。崩溃 unknown 不自动解锁或补发；需核对原生记录和账本，第一版没有人工确认后的 UI 解锁流程。

### 长历史可复现基线

最终生产候选的受控 Host：源 1000 条，首屏 50 条；首个历史快照 18,876 字节；从打开入口到首屏 50 条挂载 2,378ms；补到 100 条后全页 2,570 DOM 元素、100 消息，Chromium `usedJSHeapSize` 31,996,548 字节。分页锚点偏移小于 3px，向上阅读时新增流式内容不强制到底部。原始 JSON 基线随浏览器输出保存。

这是单次本机生产运行值，含连接/选择时间，并有同时运行的安装和回归负载；不是跨设备性能 SLA，也不是仅消息列表内存。DOM 随主动分页增长，没有声称虚拟列表。单页预算包含正文和关联工具；单条超大预览标记 partial，截断指示常驻。缓存的 32MiB 原始字节预算不等于 JS 堆内存上限。

### 失败与复测

1. 裸 Node 请求真实 provider 首次出现 `fetch failed`；本机已有网络代理未被 fetch 使用。增加 Node 官方 `--use-env-proxy`，保持同一模型，随后 SDK 和真实网页验证通过。
2. 候选 pnpm 的依赖自动验证尝试重建链接目录并在无 TTY 下退出；没有清理共享依赖。显式关闭 run 前依赖校验后使用锁定依赖验证；生产构建需显式本地 URL，设置后通过。
3. 同时启动两个 3011 预览器导致 `EADDRINUSE`，其中一个结束后另一个失去服务。失败运行不计正式证据；改为单一明确归属的预览服务，输出目录分离后完成复测。
4. 受控测试曾因外部副本同名、未等待新建回执、groupTools 的新异常展示和回执自动查询竞争而失败。收紧来源 ID/可见状态断言，并修复新建期间发送及迟到导航；最终受控和真实整组通过。
5. 最后补查修复单条多工具消息的总传输预算和关闭落盘竞态；对应服务测试通过。临时类型与 lint 失败在最终候选已解决，不以中间结果宣布完成。

### 后续边界

AW6–AW8、DL3–DL4 及 DL5 的完整参考页面验收保留未完成；首轮只完成 Pi 适用项。编辑/写文件、Git、PTY、Checkpoint、Queue/Steer、审批、附件和多 Agent 没有真实服务能力。实际业务项目验收、真实手机软键盘、人工屏幕阅读器及性能 SLA 仍需要独立证据。
