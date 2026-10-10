# Agent Workspace 完整参考设计实施记录

日期：2026-10-10。来源：`agent-workspace-plan.md` 的 V2 中央聊天规则、V1 周边布局及 PG01–PG07 / MD01–MD17 / V01–V12。接续 `bb2c484`；Pi AW0–AW5 和人工介入 fixture 的既有证据分别保留。本轮完成 DL0、DL3、DL4 和 DL5 的 UI 范围；真实编码服务及 AW6–AW8 按补全计划另行实施。

## 实施前页面声明

| 页面 | 增量声明 |
| --- | --- |
| PG02-R `/examples/agent-workbench/regions/reference/` | 独立内存 fixture，用共享模块检查 MD01–MD17；默认模块 MD07、成功数据、交互可用。左侧模块目录，中间有界预览，上方数据/交互/主题/语言控制；390px 目录改下拉选择，预览保留内部滚动。状态变更保留输入与审阅实例；明确静态对象无 hover，selected/focus 按真实交互触发，loading/error 与 runtime 分轴。MD13/MD14 链接已实现的 PG02-I 验收页，复用其队列/审批组件。 |
| PG03/PG04/PG06 | 保留既有 URL 和共享会话。全局栏 48px 显示项目/fixture 环境；Session Header 64px 放在 Main。Chat 默认显示资源 Changes/Files/Plan，其他由更多菜单进入；窄屏资源使用 Shell Sheet。Review 将完整 Diff 放 Main，收起资源详情，Chat/Editor 初始 45/55，440/480px 最小宽度，不够时单面板切换。可键盘调整、复位、最大化和退出恢复；隐藏而非重挂 Composer/审阅实例。底栏默认收起、240px，200–400px，异常只加数量提示，关闭不更改来源运行状态。 |
| PG01/PG05/PG07 | 总览增加完整参考 fixture 入口。Pi 只回归公共模块及视觉边界，不引入本轮假文件/测试事实。产物/任务模板保持现有作用域和来源对象。 |

页面目标、所有权和恢复沿用[页面声明](agent-workspace-plan.md#页面级设计声明)；契约为 [Design-rules](../Design-rules.md)、[Component Specification](../Component-Specification.md)、[Patterns](../UI-PATTERNS.md)、[States](../UI-STATES.md)。本轮 UI 不建立文件/Git/PTY/多 Agent 服务。

## 实施前模块声明

| 模块 | 增量和受控边界 |
| --- | --- |
| MD01–MD04 | ProjectSwitcher / SessionNavigator / SessionHeader / WorkspaceShell；全局身份与当前会话分开；本例导航 56px，选中 R8/2px 指示条，双行 Session 保留 56px 公共尺寸，Header 64px；停止仍等来源回执。 |
| MD05–MD11 | AgentConversation / Conversation / ToolCall / Item；用户气泡浅蓝右侧、760px 内容列；公开阶段按来源顺序，Thinking 13px、正文14/1.6、阶段线1px/16px。计划紧凑摘要，Read/Search 只合并相邻成功记录；Edit 行由 ChangeSet/工具 ID 关联，Shell 展示来源退出码/耗时，不解析正文生成测试数量。失败/unknown 可见；所有输出有界脱敏。 |
| MD12–MD14 | AgentComposer / PG02-I 受控队列与审批；R16 外容器、内控件32px、最多300px且受视口限制；状态/面板/主题/语言切换保持草稿和实例；pending/unknown 阻止重复，fixture 来源按钮仅更新 fixture。 |
| MD15 | WorkbenchPanelTabs 的兼容 compact 选项；默认三标签 + Menu（原有全部标签模式保留），标签是同对象资源；Files/Changes 行打开同 ID/revision 的 Main 预览；Plan 定位同 tool ID，Context 移除只改引用。 |
| MD16 | AgentWorkbench 可选受控分屏比例/最大化；ResizableHandle 键盘、拖动、Home/End、复位；比例有界，最大化不卸载 Chat/Editor，退出恢复比例/反馈/阅读。ChangeReviewPanel/FileViewer/DiffViewer 仍只读。 |
| MD17 | Shell bottom + ExecutionSessionList，Output/Tests/Problems/Events/Logs/Metrics/Terminal 按来源提供；无结构化 Tests/Metrics/PTY 时明确能力缺失，不填假0/成功。命令、工具、文件和消息入口绑定同来源身份。 |

共享 CSS 使用语义 token，V04 气泡颜色局部映射双主题；V06 16px，V09 R10/R16，V10 240px，V11 12/13/14px。触摸44px、focus 与 selected 独立、减弱动效、zh-CN/en、长内容与五种数据态逐项验证。共同规则与 host pages 见[模块声明](agent-workspace-plan.md#模块级设计声明)。

## V01–V12 参数与实现映射

| 参数 | 实施落点与实际值 |
| --- | --- |
| V01/V02 | 示例 `referenceShell` 56px 导航轨、48px 全局栏；公共 `presentation=workspace` Main Header 基准64px，窄屏可增高。 |
| V03/V04 | 私有 `reference-tokens.module.css` 声明760px、72%、R16、浅色 `#edf4ff/#dbeafe`；暗色蓝与 surface/border 混合。ChatMessage 以可选 CSS 变量消费，旧值作兼容 fallback；Pi 共享本例主题映射。 |
| V05/V06 | Conversation 开放正文；source phases 只在切换时有1px线，16px间距，初始标签无线；每条消息上下16px形成32px轮次间距。 |
| V07/V08 | Session 双行56px、触摸44px；本例选中R8/2px条/加重标题；运行颜色仍由共享 RuntimeStatusBadge 的十态映射。 |
| V09/V11 | 私有工具R10，计划摘要R10，Composer R16/最大300px且受可用空间限制；输入设置收起，短视口聚焦保留输入及发送；公开进度13px、阶段12px、正文14px。 |
| V10 | 受控底栏240px、200–400px；折叠外壳保留展开操作，运行内容不挂载；旧偏好不自动展开。失败/unknown数量使用来源状态。 |
| V12 | 首选Changes，常用Changes/Files/Plan按声明顺序；更多选中项进入第三标签，其余在菜单。宽Diff在Main；缺失测试/指标/PTY保持能力提示。 |

## 基线和验证

实施前 1440×900 PG04 截图：`/tmp/agent-workspace-before-desktop.png`。已确认开放 Agent 正文及右侧用户气泡；缺少阶段、64px Main Header、常驻资源栏、宽区域控制和底栏。其余主题/尺寸/空/加载/失败基线在 `bb2c484` 的独立只读副本重建，保存于 `/tmp/agent-workspace-baseline-matrix/`，文件名标出提交和 V2；这批是同提交重建基线，并非修改前即时截图；共88张，覆盖PG01–PG07、1440/390px、浅/深主题及适用的空/加载/失败来源，均无页面横向溢出。实施后截图由浏览器测试保存，fixture 与 Pi 证据分别标明。

## 验收范围与证据边界

- DL0：实施前冻结声明与首张桌面截图，补齐同提交重建的88张基线；V01–V12逐项建立私有参数/公共兼容入口映射。
- DL3：PG02-R挂载MD01–MD17；成功、加载、空、部分、错误85次数据态切换，读取错误保留快照；交互目标真实hover/focus/disabled，导航选择不随焦点改变。MD13/MD14继续复用PG02-I的来源确认、审计和unknown锁定验证。
- DL4：PG03/PG04/PG06宽Main、键盘分屏比例、Home/End、复位、最大化/恢复及阅读/输入/未提交反馈保持；资源三Tab+更多、同文件/revision变更入口、来源命令/问题/工具联动，底栏默认关闭并提供异常数量。
- DL5：PG01–PG07的1440×900浅zh/深en、390×844浅en、390×500深zh、720×450/DPR2等效200%浅zh矩阵；触摸、减弱动效、长历史/长Diff、断线/迟到/unknown使用既有回归。真实手机键盘仍未做硬件验证；视口缩短与粗指针由浏览器模拟。
- 真实Pi：本轮是受控Host/浏览器回归及offline边界；既有真实Provider/历史/停止/重启证据仍在首轮记录。本轮fixture不会新增真实文件写入、Git、PTY、测试报告、指标、任务树持久化或多Agent能力；AW6–AW8保留独立服务清单。
- 共享工作区：候选从bb2c484与明确任务文件构建；独立Git索引排除原有AGENTS、SVG/icon计划、i18n四处空行和Work Items文档缓存。测试产物/依赖/令牌不入提交。Git作者/提交者为已验证的Crsei，交付分支main；实际提交与远端回执由Git记录及交付消息确认。

## 最终检查

| 检查 | 结果与日志 |
| --- | --- |
| lint / typecheck | 通过；`/tmp/agent-workspace-candidate-lint-final-3.log`、`/tmp/agent-workspace-candidate-typecheck-final-3.log`；最后测试选择器/Manifest排版修改再通过定向eslint。 |
| build / Manifest / Registry | Webpack/WASM构建通过，202组件/222条目；`/tmp/agent-workspace-candidate-build-final-3.log`；共享工作区Registry也已更新并通过Manifest核对。 |
| 独立安装 | `pnpm test:install`通过，`/tmp/agent-workspace-candidate-install-final.log`；新受控分屏/最大化和草稿/反馈保持在安装后的独立消费者实际验证。 |
| 工作台、介入与模型回归 | 193项通过（两worker全集中的既有工作台/介入/模型测试）。 |
| 新参考页和Pi回归 | 11项参考页+9项受控Pi Host测试，以`--workers=1`复跑全部20项通过；`/tmp/agent-workspace-candidate-browser-recheck.log`。合计213个不同测试均通过。 |
| 页面截图 | 独立候选的`test-results/agent-workspace-reference-*/PG*-V2-*.png`保存35张页面矩阵截图；已目视检查桌面浅/深、390×500深色和参考区域页面。 |

第一次完整回归保留于`/tmp/agent-workspace-candidate-browser.log`。最终全集曾有隐藏Logs/可见Output重复定位的测试选择器失败，以及固定3013端口Pi fixture并行启动冲突；修正可见目标后，以单worker完整复跑参考/Pi两文件。该轮全集日志`/tmp/agent-workspace-candidate-browser-final.log`和失败trace保留在`/tmp/agent-workspace-browser-before-selector-fix/`。隔离副本最初缺少服务依赖、i18n同步遗漏及WASM构建错误，分别在补齐依赖/消息和重建候选后解决。不会将这些初始失败写成首次全绿。

状态：本计划DL0–DL5的设计/UI范围完成；实服务边界如上。Git交付包含本记录及对应任务文件，排除并行修改；提交SHA以本文件的Git历史为准。
