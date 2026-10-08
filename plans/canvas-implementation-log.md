# Canvas 实施记录

日期：2026-10-08。对应 [实施计划](./canvas-design-system-plan.md)，使用和安装见 [CANVAS.md](../CANVAS.md)。

## 当前交付

M0–M5 的组件能力已实现，M6 的受控接口与本地故障验证已实现。用户明确选择“先完成受控接口和本地验证，真实服务稍后接入”；真实模型、工具、存储、协作、审批和发布服务的端到端验收仍单列为后续工作。

入口：

- `/workspace/canvas/`：本地编辑、运行调试、审批、未知结果及断线 fixture。
- `/workspace/canvas/project/`：三层嵌套流程、变量边界、循环/迭代、分支及高级配置。
- `/workspace/canvas/services/`：保存回执、冲突、版本、讨论、权限及发布未知结果 fixture。
- `/workspace/canvas/stress/`：初始200节点/298边压力图。

3010 复用既有开发服务，没有在本轮重启。当前全站34个 Catalog 条目、46个 Registry 项、49个静态页面。M4–M6 的验证结果列于下表；全窗口布局调整的最新结果见文末。这些结果只证明组件和接口，不证明真实服务已经接入。

## 实现与边界

### 既有编辑能力

- 锁定 `@xyflow/react@12.12.0`，使用公开基础 API，自行实现节点/端口/连线，保留默认 attribution；安装包 MIT LICENSE 已核实。
- `CanvasDocument` schemaVersion=1，文档和选择受控。引擎测量、拖动投影、折叠和焦点属于视图状态，不写入执行事实。
- 新增、移动、多选、删除、复制粘贴、连接/重连/断开/插边、分组、便笺和替换统一走原子命令；100步本地历史，失败保留原图，拖动结束提交一次。
- 校验连接方向/类型/数量、重复边、自环、回路、文档大小/版本/ID/引用。未知类型保留配置和已有边端点。
- Inspector 独立对象草稿、结构化上游变量与失效诊断；有效应用清除已提交草稿，撤销后不会恢复旧表单值。
- 导入先校验再整体替换；导出选择配置字段后脱敏，不包含运行输出。项目标题、边界标签与子图配置也经过脱敏。
- DataRegion 五态、只读多入口防护、键盘连接替代、触摸新增、双主题和减少动态效果；底部面板200–400px可用指针/键盘调整，窄屏使用 Inspector 抽屉。

### M4 · 运行与调试

- `CanvasRuntimeAdapter` 与可选 `useCanvasRuntime` 控制器支持 all/node/from/to 能力、Run、Query、Stop、显式审批及启动回执对账。
- 完整快照按 documentId/revision/runId/sequence 归属，拒绝旧运行、旧版本和乱序覆盖；事件按稳定ID去重，最多保留500条。编辑后保留旧版本详情，当前图不叠加旧执行状态。
- 停止、批准和拒绝均等待来源确认；相同 sequence 或回调接受不作为新的写确认。unknown 阻止重复写，查询失败保留最后确认数据。
- `CanvasExecutionPanel`、`CanvasExecutionInspector`、`CanvasRunControls` 提供 Activity/Logs/Variables/Errors 和 Input/Output/Details/Trace；复用 ActivityTimeline、RuntimeStatusBadge 与 ToolCall。
- 输出先脱敏，再限制200行/32KiB；复制同样只复制脱敏预览。缺失的 Token、模型、耗时、上下文及产物显示“—”。
- Session、Subagent、Human Approval 为节点定义示例。模型/工具/凭据目录仅接受受控 id/name/available，不接收凭据明文。
- 正常、失败、等待审批、响应丢失、停止待确认、断线、重读失败及旧运行注入均有明确本地 fixture，不执行真实模型或工具。

### M5 · 复杂流程与高级配置

- Frame 折叠保留实际拓扑；定位成员自动展开。多选左/顶对齐、水平分布作为单次事务；拖动提供8px邻近辅助线；最近5类节点和命令搜索支持快捷键。
- `CanvasProjectWorkspace` 受控组合多个独立图，提供进入子流程、返回路径、每图选择/视口/历史恢复、项目导入导出。
- 显式 Flow Input/Output 边界、跨作用域引用限制和递归拒绝；最多20个流程、总计500节点、项目JSON512KiB。
- Loop/Iteration 有单输入输出约束、次数/并发限制、作用域和结果归属；Switch/Parallel/Merge 示例明确端口和合并策略。真实执行器负责兑现这些语义，本库不实现循环或并行调度。
- `CanvasConfigEditor` 提供 KeyValue、Condition、Schema 构建器和 JSON/Expression/Code 文本编辑。复杂 Schema 回退到完整 JSON，避免丢失约束；代码和表达式不执行。
- 节点内容 memo 化、稳定图投影及测量完成后的可见区域渲染降低大图选择成本；完整文档和校验没有裁剪。

### M6 · 受控服务接口与本地验证

- `createCanvasPersistence` 和 `useCanvasPersistence` 提供保存/查询、可选600ms autosave、expectedServerRevision CAS 和匹配回执确认。保存期间继续编辑保留 dirty；unknown/conflict 阻止重复写或静默覆盖。
- 消费方保留同一个 persistence session；冲突经消费方比较/合并并取得权威基准后显式解决，不自动重试。
- `CanvasServicePanel` 接收完整版本、讨论、presence、权限、环境与操作快照。版本恢复有确认对话框，服务历史与本地 Undo 分开；讨论与 StickyNote 分开。
- presence 依据来源 asOf/expiresAt，仅展示来源成员及坐标元数据；未交付独立的多人光标叠加组件，也未连接协作传输。
- 分享/发布按来源能力显示，发布针对已保存版本。未知操作由调用方保留并查询回执，示例不模拟发布成功或虚构在线成员。
- 执行控制器、保存 session 和未知服务操作应由消费方保留在面板之外；整体卸载后的恢复、鉴权、冲突协议、实际执行、订阅和发布仍属于服务责任。

## 验证结果

命令使用 `pnpm_config_verify_deps_before_run=false`，避免当前 pnpm 快照在非交互验证中提示重新安装依赖。

| 检查                | 结果                                                                                                     | 证据                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `pnpm lint`         | 通过，无错误/警告                                                                                        | `test-results/canvas-validation/lint.log`                    |
| `pnpm typecheck`    | 通过                                                                                                     | `test-results/canvas-validation/typecheck.log`               |
| `pnpm build`        | 通过，46项Registry、49个静态页面                                                                         | `test-results/canvas-validation/build.log`                   |
| `pnpm test`         | 83项完整回归通过，包含既有 Shell/Tree/Inspector/聊天/工具/样式页                                         | `test-results/canvas-validation/browser.log`                 |
| 最后定向复验        | 运行、项目/服务、性能共14项通过；覆盖最后的结构化字段 ARIA 与项目标签脱敏修改                            | `test-results/canvas-validation/targeted.log`                |
| `pnpm test:install` | 通过；独立消费项目 TypeScript/生产构建及浏览器操作全部通过                                               | `test-results/canvas-validation/install.log`                 |
| 实际3010页面        | 1440/1024/390px项目/服务页、运行失败/拒绝审批、双主题、减少动态效果、粗指针≥44px，无水平溢出或 pageerror | `test-results/canvas-validation/dev-server.log` 与 `visual/` |

生产构建使用 Next.js16.3.8 / React19.3.0 / TypeScript6 / Webpack。GLIBC2.28 主机输出预期的原生 SWC 不兼容提示，WASM SWC 回退后构建成功。生产浏览器测试使用3011，由 Playwright 启动并在结束后退出。

独立安装从生成的 Registry 快照读取，不复用本站组件源码或开发服务。验证消费方依赖重写、完整源码和主题、TypeScript、生产构建，以及实际浏览器新增/连接/撤销、执行结果脱敏、未知保存/发布对账、子流程导航和结构化配置。最终消费项目：`../.tmp/easyuse-ui-consumer-jif9vP`；安装截图已复制至 `test-results/canvas-validation/consumer-installed.png`，原始截图仍保留于消费项目的 `canvas-installed.png`。

安装验证首次在面板展开后直接点击已离开可视画布区域的节点超时；改用公开的节点查找/定位入口后重跑。未使用 force click 绕过遮挡。项目导出补齐标题/边界标签脱敏后已重新构建并通过定向回归。

自动检查覆盖键盘、ARIA名称与错误关联、焦点恢复、粗指针和减少动态效果；没有执行真实屏幕阅读器人工验收，也不声称完成整体 WCAG 审计。

## M4–M6 性能实测（全窗口布局调整前）

基线环境：Intel Xeon Gold5218 @2.30GHz，64逻辑CPU，Linux5.4.0-150，Node24.21.0，Google Chrome138.0.7204.92，由 Playwright 启动。测量使用生产构建，最终定向复验单 worker；测量时没有并行运行消费项目构建。

| 场景            | 暖切换至图挂载 | 选择至 Inspector 更新 p95 |
| --------------- | -------------- | ------------------------- |
| 50节点 / 73边   | 626ms          | 62.1ms                    |
| 200节点 / 298边 | 672ms          | 41.7ms                    |

每组10次选择，p95按排序取上整排名。全新浏览器上下文直接访问200节点压力页，从导航开始至尺寸测量完成、首次选中对象可见为 **1783ms**；连续60次鼠标移动期间记录151个 rAF，3300ms，平均 **45.5fps**。首次可操作≤2s、Inspector p95≤100ms、持续拖动≥30fps 的原预算保持不变，本次测量达到三项目标。

原始样本见 `test-results/canvas-validation/performance.json`、`cold-drag.json`。此前双 worker 完整83项回归中的同类测量为1819ms、40.2ms、44.5fps，归档为 `performance-full-suite.json`、`cold-drag-full-suite.json`。另一次共享负载测量冷启动2129ms超出2s；单次通过不构成所有负载、机器或真实服务下的性能保证。V1 的200节点 Inspector p95129.8ms已被本轮渲染优化改善，保留原预算而非放宽标准。

## 后续真实接入

当前授权范围的组件、受控接口和本地验证完成后，真实接入另行推进。届时消费方需提供实际存储 CAS/回执、执行/审批、模型/工具/凭据目录、权限、协作冲突协议、版本恢复及发布/分享查询接口，并以关联ID和来源回执验证。

本地 fixture 的运行状态、保存示例、文件下载或静态图校验均不替代真实业务完成回执。M6 的真实服务验收项继续保持未勾选。

## 全窗口画布布局调整

根据用户反馈“当前页面展示的区域太小了”，四个画布工具页统一改为铺满窗口的布局：48px导航、无文档站最大宽度和页脚、场景选项默认收起。CanvasWorkspace/CanvasProjectWorkspace 增加 layout=fill，沿父容器分配剩余高度，默认 preview 继续用于文档示例。

底部校验/运行/服务标签始终可访问，内容默认收起；点击标签展开，右侧按钮收起。展开后支持200–400px调整，再打开保留高度，折叠不清空草稿、选中对象、服务或运行控制器。收起时保留校验数量和操作反馈。宽屏仍可收起侧栏和 Inspector。

1440×900开发窗口实测：画布绘图区由360px高增至约653px（约增加81%），工作台从页面y=261上移至y=89；1920×1080时工作台使用全部1920px宽度。1440/1920/1024/390px生产浏览器验证没有整页横向或纵向溢出；主画布默认占窗口高度一半以上，嵌套/服务/压力图均可见且在窗口内。

本轮检查：lint、typecheck、build、**85项完整浏览器回归**、**独立安装及浏览器操作**全部通过。新增测试验证全窗口尺寸、修改与选择保留、底部高度恢复；既有只读、触摸、审批、导出和离开提示回归通过。另在实际3010服务验证从画布返回首页恢复站点导航/页脚，再进入画布恢复工具布局。

独立消费项目：`../.tmp/easyuse-ui-consumer-7kaK0m`，使用有明确100dvh高度的父容器和已安装的 layout=fill，验证填满、面板收起、运行/服务与嵌套流程。

扩大绘图区后，完整回归与消费项目构建并行时测得200节点冷启动2086ms，超过2s；随后消费项目构建结束，单worker性能复验2项通过：冷启动1778ms、Inspector p9550.3ms、连续拖动51.3fps，达到原预算。共享主机负载限制仍适用，未放宽预算。

最新日志、原始性能样本和截图统一保存于 `test-results/canvas-layout-validation/`；四尺寸生产截图位于其中的 `regression/canvas-full-window-*.png`，独立安装截图为 `consumer-installed.png`。此前M4–M6证据继续保留于 `test-results/canvas-validation/`。复用现有3010开发服务，没有重启或停止其他服务。


## 逐节点播放、执行动画与国际化交付（2026-10-08）

运行示例现在按稳定拓扑顺序自动播放节点和连线阶段，提供暂停、单步、0.5/1/2倍速，以及流光/粒子/关闭三种动画。公共组件通过可选 `CanvasExecutionVisuals` 和 `runtimeToolbar` 接收展示配置，演示计时器留在 examples；查询为纯读取。审批、未知结果、断线、页面隐藏和版本变化按来源契约暂停或清理任务。减少动态效果时保留静态运行状态，关闭动画不改变运行结果。

修复框选节点时 React Flow 自动选择关联边导致节点选择被清空的问题；保持直接选择连线、Shift 多选、全选、键盘和触摸操作。文档、Catalog、Registry、AGENTS 与中英文资源一并更新。

按用户授权，交付包含原有国际化改动和本次播放功能。为避开共享工作区内并行进行的优化、Blog 和新增基础组件工作，使用独立源码候选与独立 Git index 验证和提交；这些其他工作保留在原工作区。以下结果针对本次提交候选，不代表其他未提交改动的验收。

| 检查 | 结果 |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` | 通过 |
| `pnpm check:i18n` | 通过：828条可分发消息、1665条站点消息及 Registry 闭包 |
| `pnpm build` | Webpack 生产构建通过：47项 Registry、50个页面 |
| 播放与运行定向测试 | 17项通过 |
| `pnpm test` | 110项完整回归通过，包含真实计时自动播放、粒子移动、暂停/单步/倍速、审批/失败/断线、框选、多选、触摸及切换语言保留编辑器状态 |
| `pnpm test:install` | 独立安装72个文件；消费项目 TypeScript、生产构建、浏览器操作通过，验证粒子2倍速与暂停及配套 CSS |

完整回归日志：`/tmp/easyuse-canvas-full-tests.log`；独立安装日志：`/tmp/easyuse-canvas-install.log`；消费项目：`../.tmp/easyuse-ui-consumer-eL4kHD`。消费项目内 `canvas-installed.png` 为安装截图，不作为运行中动画截图。原开发服务继续复用，未重启。

性能预算仍为首次可操作≤2s、Inspector p95≤100ms、持续拖动≥30fps。共享主机完整回归（2 workers）中，200节点冷启动为2130ms，略超2s预算，Inspector p95为53.3ms、拖动49.9fps。随后独立单 worker 性能复测2项通过：200节点冷启动1931ms、Inspector p95为53.2ms、拖动47.7fps；50/200节点暖切换为495/854ms。两次结果均保留；单次达标不代表所有共享负载均满足预算。复测日志：`/tmp/easyuse-canvas-performance.log`。

本轮完成受控接口与本地演示验证；真实模型/工具执行、运行暂停协议、存储和发布服务仍待接入，不以本地阶段播放替代业务回执。
