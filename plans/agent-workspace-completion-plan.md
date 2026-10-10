# Agent Workspace 首轮 Pi 接入补全执行计划

日期：2026-10-10。状态：首轮 Pi AW0–AW5 已实现；实际工程与服务验收见[首轮实施记录](agent-workspace-completion-log.md)。AW6–AW8 与完整参考设计保持后续范围。

**第一个补全执行计划先用于接入 Pi。** 首轮目标是在现有 Agent Workspace 中完成“连接本地 Pi 服务 → 选择项目/会话 → 展示历史 → 发送消息与流式回复 → 展示真实工具 → 停止 → 刷新/断线恢复 → 带旧上下文继续聊天”。完整代码编辑器、Git、PTY、Checkpoint 和多 Agent 界面不作为 Pi 接入的前置条件。

整体仍以 Chat 为主要交互入口、Session 为持续工作单位、代码与运行结果为产物；后续再补齐“审阅代码和结果 → 恢复或归档”及多 Agent、项目任务和执行审计。本文件保留后续功能清单，但首轮完成与完整工作台完成分别验收。

采用用户提出的 **Chat-first Workspace + Contextual Side Panel + On-demand Editor**。首屏保留当前工作和下一步动作；复杂资源按需打开。常用功能从当前工作台可在一至两次操作内进入，长列表中的具体对象通过搜索或筛选定位。

## 1. 与已有建设及 Pi 接入的关系

- [工作台组件计划](./agent-workbench-components-plan.md) 已有 M0–M5 记录；[编码工作台增强计划](./agent-coding-workbench-enhancement-plan.md) 已有 E0–E5 记录。本计划保留已实现的公共组件、预览、设置、工具组和示例，不重复实施其完整清单。
- 本计划负责**先接入 Pi 的执行顺序、必需 UI 补齐及验收**；[Pi 接入技术计划](./pi-agent-workspace-integration-plan.md) 负责进程、历史、事件、回执和模型执行。两者使用同一套 Session/Run/Message/ToolCall 身份与能力映射。
- [具体设计与布局计划](./agent-workspace-plan.md) 是 [reference 原文](./reference/agent-workspace-plan.md) 的完整内容副本，仅整理展示并增加执行声明/清单。它负责“每个页面怎样布局、每个模块怎样显示”，本计划负责“何时实现、依赖什么、怎样证明接入完成”。设计计划中的 PG/MD/V/DL 编号是本计划 UI 工作的明确依据。
- 主改造入口是 `/examples/agent-workbench/app/`，同步 `/regions/`、`/layouts/` 与总览。`/examples/agent-workbench/pi/` 用同一组公共区域组件承接真实数据；2026-10-11 按用户要求将 `/workspace/` 改为新版会话示例入口，通用 Shell 示例移至 `/workspace/shell/`，见[入口迁移记录](workspace-entry-migration-log.md)。
- Pi 第一版仍遵守已定范围：本地单用户、历史恢复、真实对话和只读工具。完整写文件、Git、PTY、检查点和多 Agent 调度作为独立服务工作包，不因本计划画出对应控件而自动变为可用。

### 1.1 reference 带来的补充要求

中央聊天区采用 reference 的 V2 修订，完整页面分区保留 V1；具体像素、状态与局部例外由设计计划的 [差异声明](./agent-workspace-plan.md#执行原则与差异声明)、[页面声明](./agent-workspace-plan.md#页面级设计声明) 和 [模块声明](./agent-workspace-plan.md#模块级设计声明) 固定。不能只实现区域框架而遗漏以下展示要求。

| reference 细节 | 首轮 Pi 接入中的落实 | 对应设计条目 |
| --- | --- | --- |
| Session 选中加深底色、指示条与加重标题 | 当前会话切换与运行态分开，历史身份稳定 | MD03、V07/V08 |
| 浅蓝右对齐用户气泡 | 实际用户消息使用独立展示，操作栏不遮正文；失败保留草稿 | MD06、V03/V04 |
| Agent 正文与 Output 开放排版 | 不统一套卡片；仅工具、计划、审批使用有意义的边界 | MD07、V05 |
| Thinking/Action/Output 横线分段 | 映射 Pi 公开事件，阶段可交替；不推测隐藏推理或补造阶段 | MD07、V06 |
| Read/Search 紧凑，Edit/Test 优先呈现 | 先渲染真实只读调用；后续有能力才显示 Edit/Test，异常不折叠隐藏 | MD09–MD11 |
| 固定 Header、独立滚动、稳定 Composer | 历史锚点、New Activities、IME、跨会话草稿与软键盘适配 | MD04/MD05/MD12 |
| Plan 摘要与右侧详情分工 | 只有实际计划来源时显示摘要；完整计划不重复塞入每条消息 | MD08/MD15 |
| 审批卡片与 Composer 提醒条 | 按真实 capability 决定是否启用；fixture 独立验收，不假装 Pi 已有审批系统 | MD14 |
| Queue/Steer 与高级工作区 | 能力驱动且草稿稳定；首轮未支持时关闭，完整布局后续按 DL3–DL4 实施 | MD13/MD16/MD17 |

### 1.2 首轮执行清单

- [ ] 先核对设计计划 PG05 及适用 MD/V 声明，再固定 Pi SDK、协议、会话身份和能力。
- [ ] 完成服务连接、项目/历史会话读取、持久化新会话和旧上下文恢复。
- [ ] 完成真实发送、流式、工具记录、停止、操作回执和 unknown 对账。
- [ ] 按 DL1–DL2 把这些真实能力接到现有工作台；入口与核心视觉同步补齐，不等待完整 UI 重构。
- [ ] 通过刷新、断线、重启、多标签重复请求、历史分页、草稿与阅读锚点验证。
- [ ] 记录真实 provider 和网页端到端证据后交付 Pi 首轮；其余设计功能维持未完成状态。

### 完成等级

| 等级 | 可以声明的结果 | 必须提供的证据 |
| --- | --- | --- |
| UI 完成 | 功能契约和示例交互可用 | 可控数据下的区域/整页浏览器验证、状态恢复、分发检查 |
| Pi 对话可用 | 真正运行 Pi 并恢复历史上下文 | 真实 provider 的发送、流式、工具、停止、刷新与重启恢复 |
| 编码闭环可用 | 能编辑、执行、审阅和处理代码结果 | 真实文件/Git/执行服务及操作回执；版本冲突、拒绝和未知结果验证 |
| 多 Agent 可用 | 可以监控并管理真实并发与委派 | 调度、依赖、工作树隔离和子会话事实；看板展示不能代替此项 |

## 2. 核对基线与真实差距

首次规划核对时 HEAD 为 `d3d13dc`，当时工作台公共入口、示例和测试有并行未提交修改；这是历史观察基线，实施 AW0 重新冻结待交付版本。曾通过现有 3010 服务查看 `app/?template=coding&page=session` 的桌面挂载结果：活动栏包含会话、文件、搜索、变更、产物、任务、设置；页面明确标为本地交互示例。此观察不代表所有模式或服务已验收。

| 区域 | 已有基础 | 本次增量 |
| --- | --- | --- |
| Shell | `WorkspaceShell` 的活动栏、侧栏、Inspector、底栏；`AgentWorkbench` 的 conversation/review/tasks 布局 | 明确全局导航与会话工具归属；主区可调分屏和编辑器最大化；去掉重复入口 |
| 导航 | `ActivityNavigation` 当前混放会话与 Files/Changes/Artifacts；`SessionNavigator` 有项目选择、搜索、收藏、归档、运行筛选 | 全局功能轨；时间/任务树双视图；独立的新建会话/任务；等待关注筛选与排序 |
| 环境与会话标题 | `SessionHeader` 展示标题、状态、环境/分支，已有重命名及操作插槽 | 项目/环境常驻摘要、明确工作树身份；会话历史、生命周期动作和来源阶段 |
| 对话 | 结构化 MessagePart、工具引用、审批插槽、历史补载；`groupTools` 按单条消息聚合工具 | Turn 分组、相邻工具摘要、异常常驻、结果证据与代码产物关联 |
| Composer | 模型/权限/环境、send/queue/steer、上下文选择、附件入口、命令菜单 | Agent 能力驱动的模式与参数；通用/原生命令区分；可管理队列；输入中引用补全 |
| 资源与审阅 | `WorkbenchFilePreview`、文档标签、多类型只读预览、`FileViewer`、`DiffViewer`、行反馈 | 独立宽 Editor Surface、可调比例、只读与编辑明确区分；有版本保护的保存/审阅/恢复 |
| 右侧资源 | 已有多个受控面板，完整应用按选中项渲染；计划多为步骤列表 | Changes/Files/Plan + 更多、固定标签；Context/Agents/Insights 按需进入 |
| 底部运行 | `ExecutionSessionList`、`ExecutionOutputPanel` 已有命令身份、输出和 terminal 插槽 | Terminal/Problems/Tests/Output/Events 的独立契约及联动；PTY 仍需 Host |
| 多 Agent | Registry 已有 AgentRunList/Board/Inspector、AttentionQueue、AgentRelationshipList、AgentDependencyGraph | 接入同一工作台状态；父子会话/依赖定位、真实能力回调和隔离信息 |
| 项目与观测 | 已有 Work Items、AgentUsageSummary、AgentUsageHistory 等组件 | 任务与 Session 关联、使用量与 Trace 聚合、通知收件箱、自动化配置契约 |
| 服务 | 示例 reducer 与 fixture；Pi 已有独立待实施计划 | 统一 Adapter 能力接口，逐项接入真实服务，保留测试替身 |

当前 `FileViewer`/`DiffViewer` 是只读查看与反馈组件，不是可保存的代码编辑器；`terminal` 插槽不表示已有 PTY。现有工具聚合将工具单独集中渲染，本轮必须验证并修正混合文本/工具内容的原始顺序，不能因折叠改变事实顺序。

## 3. 布局与导航决策

```text
┌───────────────────────────────────────────────────────────────────────┐
│ 全局栏：项目 · 环境 · 工作树                  搜索 / 关注 / 布局 / 设置 │
├──────┬──────────────┬───────────────────────────────┬──────────────────┤
│ 功能 │ 项目与会话   │ Session Header                │ Changes Files    │
│ 导航 │ 搜索 / 过滤  ├───────────────────────────────┤ Plan ···         │
│ 轨   │ 时间 / 任务树│ Conversation                  │                  │
│      │              │     ⇄ 按需打开宽 Editor/Diff  │ 资源导航或详情   │
│      │              ├───────────────────────────────┤                  │
│      │              │ Context chips + Composer      │                  │
│      ├──────────────┴───────────────────────────────┴──────────────────┤
│      │ 可折叠：Terminal / Problems / Tests / Output / Events / ···     │
└──────┴────────────────────────────────────────────────────────────────┘
```

图表达信息归属，不要求所有分栏同时出现。宽编辑器属于 Main；右侧资源栏复用 Shell 的停靠/浮层能力，不再永久叠加第二个元数据 Inspector。打开宽 Diff 时优先收起右侧详情，避免形成四个狭窄内容列。

### 3.1 尺寸和响应式

具体展示按新建 [设计计划的 V01–V12](./agent-workspace-plan.md#数值与视觉差异登记) 执行：全局栏 48px，本例导航轨 56px，当前会话 Header 基准 64px，聊天内容最大宽 760px，浅蓝右侧用户气泡 R16；阶段横线 1px、上下间距16px。56px导航轨、64px会话Header和消息/工具容器外观均是已声明的 Agent Workspace 示例局部规则，不改公共默认值。

资源侧栏默认256px，Inspector默认320px、范围280–360px，底栏默认240px、范围200–400px；Button/Input默认32px，粗指针图标命中至少44px。颜色走语义token/双主题映射；选中更深底色与运行状态分开，运行色仍来自 `runtime-status.ts`。

主区 Chat/Editor 使用受控分隔条和容器宽度判断：初始建议 Chat 45% / Editor 55%，Chat 最小 440px、Editor 最小 480px；达不到两侧最小宽度时切为单面板或浮层，不制造页面横向滚动。这是审阅模式局部约束，不把 540px 聊天宽度作为移动端硬下限。

收敛顺序：收起右侧详情 → 收起资源侧栏 → Chat/Editor 单面板切换。手机使用 Sheet，输入区适配软键盘。分隔条支持键盘、复位和有界持久化；关闭面板不取消运行、不卸载正在编辑的文档。

### 3.2 功能导航轨

全局入口按能力提供：Workspace、Projects/Tasks、Sessions、Agents/Skills、Automations、Activity；Settings 位于底部。Workspace 聚焦当前会话，Sessions 才是跨项目会话目录。两者共享实体，不生成两套会话库。

Files、Changes、Plan、Context、Terminal 是当前会话工具，移动到资源栏标签、运行面板或命令菜单。Artifacts 进入工作产物入口；全局 Activity 展示跨会话关注事项与事件。未实现的全局页面不放可点击空壳，可在演示场景说明能力待接入。

旧 `page=review`、`page=artifacts`、`panel=terminal` 等链接保留解析，通过视图映射打开同一新区域。旧参数白名单、返回/前进、跨模板链接都进入回归；不在改布局时顺带废弃旧 URL。

## 4. 按区域拆分的补全工作包

本节保留完整工作台的功能积压清单，具体设计以独立设计计划为准。P0–P4 表示长期产品优先级，不等于首轮 Pi 的实施阶段。**首轮只实施 U01/U03/U04/U05/U06/U10 中支持项目、会话、历史、输入、运行和恢复所必需的部分；其余依赖真实能力且按后续设计清单执行。** 时间/任务树完整组织、编辑器写入、检查点、多 Agent、PTY、Git 和高级观测均不阻塞首次接入。

| 编号 | 区域与优先级 | 常驻核心 | 按需或高级 | 验收重点 |
| --- | --- | --- | --- | --- |
| U01 | 全局栏 P0/P1 | 项目、环境、分支/工作树、布局开关 | 搜索、命令面板、运行/关注数量、账户和设置 | 当前操作目标明确；数据缺失显示未知，不显示虚假 branch；无账户服务不展示假登录 |
| U02 | 导航轨 P0 | Workspace、项目/任务、会话；其他入口按能力 | Agent 配置、自动化、观测 | Files/Changes/Terminal 不充当全局页面；键盘/触摸可达 |
| U03 | 资源侧栏 P0/P3 | 新会话、搜索、状态过滤、最近活动排序、时间/任务树切换 | 新任务、导入、归类、收藏/归档、创建时间/优先级排序 | 无任务也可新建会话；两视图共用身份与选中项，切换不丢草稿 |
| U04 | Session Header P0/P1 | 标题、Agent、运行态、来源阶段、环境、可用的停止/继续 | Fork、历史、Checkpoint、导出/分享/归档/删除 | Stop/Resume/Restart 区分语义；按能力出现且等待回执 |
| U05 | Conversation P0/P1 | 用户输入、Agent 回复、Turn、工具摘要、待决策内容 | 计划详情、文件变更、结果、引用、消息编辑/分叉 | 审批/失败/unknown 不藏进折叠组；工具结果与自然语言结论可区分 |
| U06 | Composer P0/P1 | 多行输入、上下文条、Agent/模型、发送/停止 | @ 补全、命令、模式、推理档位、权限、队列/steer、使用量 | 能力动态变化、IME、版本草稿、防重复；权限选择不是授权事实 |
| U07 | 右侧资源 P0/P1 | 默认 Changes / Files / Plan + 更多 | Context / Agents / Insights / Artifacts，可固定 | 最多三个默认标签；新事件只提示，不在输入或审阅时抢面板 |
| U08 | Editor Surface P0/P1 | Chat + 文档分屏、宽 Diff、文件标签、最大化 | 编辑/保存、行反馈、审阅、Accept/Revert/Commit、其他产物预览 | 资源身份和版本绑定；最大化退出回原布局/选区；写操作由真实 Host 执行 |
| U09 | 底部运行 P0/P1 | 收起入口、Output、来源命令摘要 | Terminal、Problems、Tests、Events、Debug | 原始输出与结构化结果区分；无 PTY 时明确为命令输出 |
| U10 | 生命周期 P1/P2 | 历史恢复、归档状态、操作反馈 | Fork、Checkpoint/Restore、导入/导出、删除/分享 | 聊天分支、文件快照、环境快照分离；恢复范围可审阅 |
| U11 | 多 Agent P2 | 父子关系、任务/状态、关注项、会话跳转 | 显式依赖、运行控制、Worktree/冲突、委派入口 | 无权威边不推断依赖；任务列表不冒充调度器 |
| U12 | 项目整合 P3 | Project → Task/Idea → Session、未归类会话 | 手动/AI 整理、任务看板、跨会话知识引用 | AI 先形成可审阅归类建议；移动改变关联，不复制会话或自动执行任务 |
| U13 | 观测与通知 P1/P4 | 待关注收件箱、失败和批准通知 | Token/Cost/Trace、审计、自动化、评测报告 | 用量缺失不当作零；事件来源/范围可追溯；完成不等于验收 |

### 4.1 会话组织与生命周期

- 列表行只保留标题、Agent 身份、状态、最近活动、可选任务归属和关注提示；路径、模型细项和用量进入详情。
- 时间视图按最近活动聚合，可切全部项目/当前项目；树视图按 Project → Task/Idea → Session，包含“未归类”。二者共享筛选、选择、操作回执及规范化数据。
- 筛选明确区分 All、Running、Needs Attention、Completed；Completed 只表示来源运行终态，不暗示测试或用户审阅通过。
- 重命名/归档/删除、任务归类和导入均由宿主动作确认；拖拽归类提供键盘替代。排序按来源时间与稳定 ID，不使用浏览器接收时间替代。
- Resume 恢复会话上下文；Restart 是新一次运行；Fork 创建可追溯的新分支/会话；打开历史不自动执行。导入其它 CLI 首先是读取历史，只有相应 Adapter 支持且验证后才能恢复原生上下文。

### 4.2 对话与执行证据

- 为 User、Assistant、Plan、Tool、File Change、Approval、Result 建立一致展示语义；沿用 Item、列表和折叠结构，不将每个片段包装为装饰性 Card。
- 按 runId/turnId 呈现来源顺序；只合并同一轮内相邻、无需用户处理的工具记录。折叠摘要必须由真实记录计算，展开后可定位 callId。
- 审批、待答问题、失败、未知结果和需要决策的操作，在折叠态也有明确摘要和入口。关键记录不因组内有多条普通 Read 操作而被隐藏。
- “Agent 说测试通过”显示为正文；结构化测试结果必须关联 testRunId、来源命令/工具、版本及时间。无解析器时展示原始输出，不能根据字符串或单一 exitCode 生成全部测试用例通过的结论。
- 流式更新保留 messageId/partId；历史补载保留锚点，距底部不超过 64px 才自动跟随。正文复制与可访问内容只维护一份。
- 编辑已发送消息意味着新的修改/分支请求，不能直接覆写已执行历史；修改输入草稿与重发旧消息分开。

### 4.3 Composer 能力矩阵

将以下四个维度分开：提交调度 `send/queue/steer`、执行策略 Ask/Plan/Agent/Review、权限政策、模型参数。禁止复用一个 mode 字段承载四种含义。

通用命令包含搜索、打开文件、切布局等本地动作；原生命令带 Adapter 命名空间、描述、参数和执行能力。不硬编码所有引擎都支持 `/goal`、`/compact`，不从显示名称猜协议值。命令菜单选中“发送类”动作仍走显式提交及回执。

上下文补全按支持能力提供 file/folder/session/diff；已有六种引用类型兼容迁移，新增类型同步模型和安装验证。附件经历选择、上传、可引用三个阶段，本地 File 不等于引擎已读取。

队列项有稳定 queuedPromptId、draftVersion、状态和宿主回执；取消、编辑、重排只在真实提供能力时启用，保留与执行取出之间的竞争处理。Pi 第一版未支持时隐藏这些入口，不复用 fixture 的成功状态。

### 4.4 资源栏和宽编辑器

- Changes 列表和 Files 树负责定位资源，代码正文在宽 Editor Surface 打开。Plan 展示目标、步骤、阻塞和完成标准；Context 展示规则/引用/压缩来源；Agents 展示关系；Insights 展示运行事实。
- 默认 Chat 模式不强制展开所有资源；代码变更可以增加 Changes 徽标，审批可以增加关注提示。用户主动选择后打开对应面板，自动提示不抢焦点。
- 文档状态按 repositoryId/resourceId/revision 隔离，记录临时/固定标签、阅读位置、选区、未保存草稿。对象切换后丢弃迟到读取，同对象刷新失败保留旧内容。
- Editor Surface 先复用已有只读 renderer 与 Diff，再接可编辑 renderer。编辑器依赖在 AW0/AW3 做独立安装、懒加载、worker、CSS、无障碍和包体试验后选定；不把完整编辑器加入所有文档首屏。
- 保存携带 baseRevision 并由文件服务确认；源文件被 Agent 或外部用户改动时保留双方内容并提示冲突。Dirty 文档关闭、切环境和来源删除都有明确处理，不能悄悄丢弃本地编辑。
- Mark reviewed 是审阅状态；Accept/Revert 是明确范围的文件变更；Commit 是 Git 操作。三者不同，必须展示具体文件/hunk、版本、目标工作树及回执，禁止以“已审阅”模拟写入成功。
- Chat + Editor 分屏、Editor 最大化、Diff 全屏共用同一文档和会话状态；退出返回原焦点和布局。图片/Markdown/测试报告使用同一资源打开协议。

### 4.5 底部运行与恢复

- Output 是有界、脱敏、可定位的命令输出；Terminal 是 Host 提供的交互 PTY，需独立 terminalId、输入/resize/连接/退出与回放契约。只把文本放进黑底框不能称为 Terminal。
- Problems 来自诊断快照并绑定文件版本/行列；Tests 来自测试运行与用例结果；Events 来自有序执行事件。Debug 放更多菜单，并保留敏感字段处理。
- 面板默认收起，错误以徽标/关注项提示。用户打开后定位对应 commandId/testRunId/事件；关闭面板不会停止命令或释放运行实例。
- Checkpoint 区分 conversation、files、environment 等作用域。Restore 前读取具体差异、基线和冲突，提交后等待权威确认；文件回滚不自动删聊天记录，聊天 Fork 不自动回滚文件。
- 未确认的停止、审批、保存、Revert、Commit、Restore 都保持 unknown 锁和查询入口；网络恢复只触发安全读取，不自动重放这些写操作。

## 5. 三种工作模式

| 模式 | 默认重心 | 布局行为 | 验收路径 |
| --- | --- | --- | --- |
| Chat | 对话、输入和当前阶段 | 资源按需，底栏收起；有关注项时提示 | 新会话 → 上下文 → 发送 → 工具/批准 → 结果 |
| Review | Changes 和宽 Diff/Editor | 收窄或折叠会话列表，保留可返回的 Chat；Tests/Problems 按需 | 从文件变更打开 Diff → 行反馈/审阅 → 查看测试 → 回到同一会话 |
| Multi-Agent | 多个运行及待关注事项 | Agent 列表/关系与选中运行详情；进入子会话不丢父会话位置 | 关注项 → 运行 → 来源工具/子会话 → 返回父任务 |

沿用并兼容现有 `conversation/review/tasks` 布局值。Tasks 当前只表达任务总览；只有数据和能力满足时才显示 Multi-Agent 语义，不能仅改标签就声称支持多 Agent。模式切换是视图操作，不重新创建 Session、启动任务或清除草稿。

## 6. 模型、Adapter 与状态所有权

保持 `Project → Task/Idea（可选）→ Session → Run → Turn → Message/Part` 的层级；ToolCall 是关联到运行和轮次的独立执行事实，Artifact、ChangeSet、TestRun 通过来源 ID 引用。子 Agent 的关系使用独立关联数据，不把所有子运行压成一条聊天文本。

| 契约 | 在现有模型上的增量 | 权威所有者 |
| --- | --- | --- |
| AgentAdapterDescriptor | Agent 身份、版本、模型/命令/模式/工具能力、不可用原因；能力可随连接变化 | Host/Adapter |
| SessionSummary / association | 任务归属、导入来源、parentSessionId/fork 来源、历史可恢复性 | 会话与任务服务 |
| Run/Turn 与证据引用 | 独立生命周期、阶段、关联工具/文件/测试、终态原因 | 执行服务 |
| WorkspaceViewState | 全局区域、时间/树、固定标签、主区比例、文档选中、布局 | UI 控制器；可选偏好存储 |
| DocumentState | 资源键、基线版本、读取态、编辑草稿、保存回执、选区 | 文件来源 + 调用方编辑状态 |
| QueuedPrompt / Checkpoint | 队列版本与调度事实；检查点范围、来源版本、恢复能力 | 执行/快照服务 |
| Diagnostics / TestRun / Terminal | 有来源的诊断、测试结果、PTY 身份和连接事实 | 专门服务适配器 |
| Attention / Usage / Audit | 已有关注/使用量模型扩展来源范围；审计记录独立保存 | Host/观测服务 |

本表类型名中的新增项均为提案，AW0 固定最终 API；不得按名称直接假定已有导出。尽量以兼容的可选字段/插槽扩展，必要的破坏性变化要有迁移说明及旧消费者验证。

数据五态、runtime、消息、连接新鲜度、权限与操作回执继续分轴。`lib/runtime-status.ts` 保留十种状态，未知值明确展示；不新增“offline runtime”混淆连接与执行。requestId/revision/cursor 规则与 Pi 计划一致。

业务动作由公共组件发出受控请求，调用方负责认证、执行、持久化和对账。示例 fixture Adapter 与 Pi Adapter 共用类型，但隔离各自数据与回执。切换 Agent 不自动迁移现有 Session 的执行引擎；不可兼容的切换引导新建或显式导入。

## 7. 组件复用与文件安排

| 位置 | 实施安排 |
| --- | --- |
| `components/blocks/workspace-shell.tsx` | 保持 Shell 唯一布局所有者；按需兼容扩展布局控制和受控 resize |
| `components/blocks/agent-workbench.tsx` 与 `workbench.module.css` | 分屏、宽工作区、三种模式和主区/Inspector 的互斥策略 |
| `components/blocks/agent-workbench/navigation.tsx` | Session 双视图、筛选/排序、环境/生命周期动作插槽 |
| `components/blocks/agent-workbench/conversation.tsx`、`composer.tsx` | Turn 与有序工具摘要、证据引用、能力驱动输入、队列入口 |
| `components/blocks/agent-workbench/review.tsx`、`panels.tsx` | 文档/Diff 联动、结构化运行标签；保留只读基础接口 |
| `components/blocks/workbench-file-preview.tsx`、`lib/workbench-resource-model.ts` | 复用 renderer、文档标签与资源键；增加编辑/冲突适配契约 |
| 拟新增 `lib/agent-workspace-adapter-model.ts` | Adapter 能力、命令、领域快照接口；不含网络或 SDK |
| 拟新增 `components/blocks/workbench-editor-surface.tsx` | 按需宽编辑工作区与受控 renderer 插槽；是否独立导出由 AW3 验证决定 |
| `components/examples/agent-workbench/` | 重组活动栏/页面控制器，fixture Adapter、区域演示和恢复场景；避免继续向单一巨型 workbench-demo 文件堆所有领域逻辑 |
| `components/examples/pi-workspace/`、`services/pi-host/` | 按 Pi 计划接入真实会话；新增文件/Git/PTY能力单独记录，不混入 UI library |
| `lib/component-manifest.ts`、`registry.json`、`lib/i18n-*` | 仅为新增公共导出或依赖变更更新，保留并行条目和可移植性 |
| 拟新增 `tests/agent-workspace-completion*.spec.ts` 与实施记录 | 新行为、迁移/能力/恢复回归与证据；不重复制作仅镜像实现的测试 |

基础层复用 Tree、Item、Tabs、Menu、Sheet、Dialog、CommandPalette、Resizable/ResizableHandle；多 Agent/观测复用已导出的 Run、Relationship、Dependency、Usage 和 Attention 组件。候选 Checkpoint/Queue/Tests 组合先做受控契约，验证跨示例复用价值后再注册公共组件。组件与模型保持不同文件名，满足 Registry 改写要求。

## 8. 分阶段执行

AW0–AW5 现明确为首轮 Pi 接入执行顺序，与 Pi 技术计划 P0–P5 对应。原先将完整布局、宽编辑器和生命周期全部做完后才接入 Pi 的顺序由本节替代；详细设计按 DL 清单逐项推进，不成为 Pi 不需要的前置阻塞。

| 阶段 | 优先级与工作包 | 产出和退出门槛 | 前置 |
| --- | --- | --- | --- |
| AW0 Pi 基线与设计声明 | Pi P0 + DL0：版本/SDK、协议、身份、能力、PG05及所需MD/V | 冻结候选版本；只读历史/继续语义和真实能力明确；页面及模块声明齐备 | 起点 |
| AW1 Pi 历史服务 | Pi P1：项目、会话列表、只读历史、分页、复制继续 | 原始会话不因浏览被改写；托管历史重启可读；分支/压缩和项目隔离正确 | AW0 |
| AW2 Pi 真实执行 | Pi P2：发送、流式、工具、停止、持久化回执、SSE | 命令不重复执行；来源确认和最终完成分离；服务测试及可用模型最小调用通过 | AW1 |
| AW3 Pi 页面与必要展示 | Pi P3 + DL1–DL2：PG05、核心MD与局部视觉 | 真实页面可选项目/会话、读历史、发送/停止；选中态、气泡、阶段线、Composer符合声明 | AW1–AW2 |
| AW4 Pi 恢复与交互 | Pi P4：刷新/重连/重启、迟到事件、多标签、分页、草稿 | 不重复发送、不串历史；unknown先对账；阅读锚点和来源顺序正确 | AW3 |
| AW5 Pi 首轮交付 | Pi P5 + DL5中首轮适用项 | 真实provider+浏览器端到端通过，文档/工程检查及受影响公共组件分发验证；完整设计后续项单列 | AW0–AW4 |
| AW6 多 Agent 与隔离 | P2：U11 | 同一工作台中的运行关系、子会话、依赖、隔离/冲突和能力控制；真实调度另有证据 | AW5 |
| AW7 项目与长期工作 | P3：U03/U12 | 任务关联、时间/树持续一致、可审阅归类、看板与跨会话引用；存储结果可恢复 | AW5；可不等待 AW6 |
| AW8 观测与自动化 | P4：U13 及全局配置入口 | 用量/Trace/审计、自动化和评测对象的 UI 及服务契约；定时执行必须有真实调度证据 | AW5，涉及多 Agent 聚合时依赖 AW6 |

首轮实施范围为以上 **Pi 专用 AW0–AW5**。接着按具体设计计划 DL3–DL5 补齐完整示例、宽工作区和各模块状态，再按产品需要进入 AW6–AW8。单个模块有独立实施条件时可提前完成，但不能改变先交付 Pi 的目标。AW6–AW8、完整编辑器/PTY/Git/Checkpoint 和全部设计清单都不随首轮一起标记完成。

### 8.1 真实编码服务工作包

| 包 | 必需能力 | 与首个 Pi 版本的关系 |
| --- | --- | --- |
| S1 会话执行 | 列表、历史、上下文恢复、发送、事件、停止、回执 | 由既有 Pi 计划交付，是 AW5 必需项 |
| S2 文件与 Git | 有界文件读取、版本化保存、Diff、明确范围的 Accept/Revert/Commit、工作树身份/冲突 | 单独接入；只读 Pi 验收不等于 S2 通过 |
| S3 运行环境 | 命令执行、输出、PTY 输入/resize/退出、诊断与测试解析 | 单独接入；命令工具结果与交互 PTY 分开验收 |
| S4 检查点与协作 | 有范围的快照恢复、Fork/队列、委派/调度、隔离与审计 | 按真实能力渐进接入；不从 UI 状态推导已有引擎支持 |

设计计划 DL3/DL4 可通过 fixture 验证高级组件协议，但 Pi AW3/AW4 必须接入真实 Host 并验证实际数据恢复。要宣称“完整编码闭环可用”，S2/S3 与实际启用的 S4 操作必须补齐真实证据。公共库仍不承载这些服务的运行权威。

## 9. 验收与证据

### 9.1 必须走通的用户路径

首轮以第1/4条中Pi支持的能力为必需，按真实模型与Host验收；第2/3/5/6条的完整编辑/批准/多Agent/项目归类属于后续设计与服务验收。首轮不因为这些能力暂缺而造假，也不等待它们全部实现。

1. **开始工作：** 选项目/环境 → 新建未归类会话 → 添加文件上下文 → 选择支持的模型/模式 → 发送 → 流式/工具 → 查看结果。来源未确认前不清除新版本草稿。
2. **审阅结果：** 从 Turn 的变更入口 → Changes → 宽 Diff → 行反馈/标记审阅 → Tests/Problems → 返回原会话与输入位置。运行完成和审阅通过分别展示。
3. **需要干预：** 工具组折叠时仍能看到审批/失败/unknown → 打开具体对象 → 提交动作 → pending → 来源确认或对账；关闭详情不能清除锁。
4. **恢复工作：** 正在运行时刷新/断线 → 重新连接并对齐历史 → 切到另一会话 → 返回 → 不重复发送、不串数据。文件 Restore 与聊天 Fork 分别验证。
5. **多 Agent：** 待关注项 → 子运行 → 来源工具和文件 → 父会话；选择只查看，停止/委派需要明确动作和能力。
6. **项目积累：** 未归类会话 → 关联 Task → 时间/树切换 → 刷新恢复 → 引用旧会话；归类不启动 Agent，不复制聊天历史。

### 9.2 状态与交互矩阵

| 范围 | 必测案例 |
| --- | --- |
| 导航/布局 | 旧深链、浏览器前进后退、同一对象跨模式、容器宽度收敛、分隔条键盘操作、退出最大化恢复焦点 |
| 关键事实 | 文本/工具交错顺序、工具失败未被隐藏、Agent 自述与测试证据区分、来源阶段缺失和未知 runtime |
| 数据恢复 | loading/empty/partial/error/success；刷新失败保留旧数据；A 迟到时已选 B；旧 revision 不覆盖新版本 |
| 写入/能力 | 发送/停止/审批/保存/恢复回执丢失；能力撤销；跨 Adapter 不支持参数；两标签页重复命令；unknown 先对账 |
| 编辑/审阅 | dirty 文档关闭、外部文件修改、rename/delete、二进制/截断、行反馈旧版本、工作树冲突、恢复范围变化 |
| 队列/生命周期 | 队列取出与取消并发、Fork 与 Resume 区分、恢复文件不删聊天、导入仅可读、子会话返回位置 |
| 可访问性 | 键盘/IME、图标名称和 tooltip、隐藏面板无多余 Tab stop、触摸目标、减弱动效、对话增量不过量播报 |
| 适配 | 390/768/1024/1440px、软键盘短视口、200% 布局、浅深主题、zh-CN/en；切语言不触发服务写入 |
| 性能 | 至少 1,000 条历史、长 Diff、多工具输出、多会话；记录首个可用输入、DOM/内存/滚动及加载字节，设置可复现基线后再定预算 |

全量 DOM 和 `content-visibility` 不称为虚拟列表。若引入虚拟化，另外验证历史定位、键盘焦点、阅读锚点及工具展开高度变化。编辑器/PTY/重 renderer 懒加载，失败可重试，不能拖慢未使用这些能力的页面。

### 9.3 工程交付

- 按仓库运行 `pnpm lint`、`pnpm typecheck`、`pnpm build`，使用 Webpack；行为变更执行对应 Playwright 与旧工作台回归。
- 改公共源码/CSS/Registry 依赖时执行 `pnpm test:install`，同步示例、Manifest/Registry、双语资源与文档。服务包单独执行类型/集成检查。
- 验证必须实际打开已挂载页面，不能仅以 Registry/Manifest 条目齐全作为 UI 完成证据。测试替身、本地服务、真实 provider、独立安装和用户业务验收分别记录。
- 共享 3010 只用于现状观察/必要 smoke；正式验证采用冻结候选与明确端口的隔离构建，先核对进程归属。
- 实施时新建 `plans/agent-workspace-completion-log.md`，逐项填写 U/AW/S 范围、版本、检查、失败与复测、未完成项。此计划阶段不写“已通过”的未来结果。
- 原规划阶段更新本计划、新增reference完整设计副本与执行声明，并在AGENTS.md固定按页面/模块声明规则；规划本身不代表Pi或UI已实现。2026-10-10 的授权实现与实际验收另见首轮实施记录。实现达到对应阶段交付门槛后按AGENTS.md授权提交和普通推送：只纳入审阅过的任务路径，保留并行改动，验证远端SHA，不用大范围staging或强制覆盖取得干净状态。

## 10. 设计来源与适用边界

本项目以 [Design-rules](../Design-rules.md)、[Component-Specification](../Component-Specification.md)、[UI-PATTERNS](../UI-PATTERNS.md)、[UI-STATES](../UI-STATES.md) 和 [AGENT-WORKBENCH](../AGENT-WORKBENCH.md) 为公共实现契约；[reference原文](./reference/agent-workspace-plan.md)及其[完整设计执行副本](./agent-workspace-plan.md)明确本例具体展示、页面/模块声明和局部例外。产品功能清单与Pi能力范围分开执行。

2026-10-10 核对的官方资料：

- [VS Code Agents Window](https://code.visualstudio.com/docs/agents/run/agents-window)：会话、聊天、Changes、Files 分区，文件/Diff 在聊天旁编辑区或模态视图打开。本计划采用区域职责和按需宽编辑器，不承诺复制其全部服务能力。
- [Cursor Agent](https://cursor.com/docs/agent/overview)：工具、检查点、排队与 steer 的工作方式。其文档区分文件恢复与聊天记录；本计划据此明确不同恢复作用域，并由各 Adapter 分别声明支持情况。

上述参考用于交互设计，不将任何产品的具体命令、检查点、权限模式或多 Agent 能力视为 Pi 或 EasyuseUI 已具备的功能。最终验收依据本项目真实导出、挂载行为和服务证据。
