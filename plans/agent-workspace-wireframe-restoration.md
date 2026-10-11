# Agent Workspace 主界面线框图还原

2026-10-11。依据 [主计划](agent-workspace-plan.md) V1 桌面分区、V2 A2-01 至 A2-10，以及 V01–V12、PG04/PG05/PG10、MD04–MD16。此记录纠正当前主界面与参考图的组合偏差，不以历史完成勾选代替本轮视觉验收。

## 页面声明

PG04 独立应用 `/`、`/app/`：会话 Header → 独立滚动的 760px 对话列 → 同轴 Composer；左栏保留已明确调整的会话内导航，右栏保留变更/文件/产物。右栏默认展示变更数量、文件状态、增删与首个可预览文本 Diff；点击仍打开同源宽审阅区。运行面板默认收起。PG05 `/pi/` 复用相同 Header/Composer/Conversation，不增加 Provider 能力。PG10 `/elements/` 与 `/regions/reference/` 挂载同一组组件用于独立比较。

工作台采用当前桌面画布约束；验证 1440×900、2048×946、1024px、短窗口与缩放。主区自适应，内容最大760；窄主区选择器横向滚动，短窗口输入区保留内部滚动，不能遮住输入/主动作。保留实例、草稿、阅读锚点、选中对象和 URL。回执、能力和运行状态沿用调用方来源。

## 模块声明与组件映射

- MD04 SessionHeader：两列布局，左侧标题16/600与12px元信息（状态、Agent、分支、环境），右侧能力动作；64px基准，长标题截断并保留完整title。
- MD05–11 AgentConversation / ToolCall：正文与阶段线保留；Read/Search成功默认单行无卡片边框，异常不折叠隐藏。Edit使用同源文件摘要和增删数；Shell/Test展示脱敏且有界输出、真实退出码与时长；操作收进同一工具容器底部。Plan为浅灰阶段摘要。完整参数通过原ToolCall展开，不重复维护正文来源。
- MD12 AgentComposer / ChatComposer：运行状态与停止位于容器上方；textarea、引用/快捷操作、模型/权限/环境/输入模式与主动作构成单一R16容器。常用选择器32px紧凑无描边，主动作按send/queue/steer标注；设置只承载额外引用。自动增高，最大300px且受视口限制。快捷键提示位于容器下方。pending与unknown分别说明，草稿保留，unknown仍先查询。
- MD15–16 ChangeReviewPanel 的 summary 变体 / DiffViewer：文件数、状态与有界增删数；首个文本文件只读预览，partial/binary/缺失保持明确。行选择只打开现有审阅，不发起写入。
- MD03 搜索保留可访问名称并补可见placeholder；会话下方四个导航使用32px默认Button。

技术沿用 React/TypeScript、CSS Modules、共享语义token、Base UI、Lucide；无新增依赖。组件先实现再由适配器组合。所有内置文案使用typed i18n，切语言不清草稿；键盘/IME/焦点和减少动效沿用组件合同。公开工具数据仍在渲染/复制前脱敏。

## 验收记录

- [x] 共享组件 → PG10统一展示 → PG04/PG05实际页面组合，未新增页面私有视觉替身或依赖。
- [x] 1440×900、2048×946、1024px及1024×450短窗口；主题/语言、运行/完成/unknown、IME、草稿与跨区跳转。
- [x] 主站与独立应用 lint、typecheck、生产 build，组件独立安装与边界检查通过。
- [x] 精确审查任务增量；保留并行组件/鉴权页面工作。提交与远端SHA在最终交付消息记录。

### 本轮证据（2026-10-11）

本轮在隔离候选中验证；候选纳入已提交的桌面画布和计划日志迁移，未纳入其他会话尚未提交的组件。源码通过共享组件实现，无框架/运行时迁移。

| 验证 | 结果 |
| --- | --- |
| 主站 `pnpm lint` / `pnpm typecheck` / `pnpm build` | 通过；Webpack与WASM SWC |
| Agent Workspace `lint` / `typecheck` / `build` | 通过 |
| 独立应用浏览器 | 219项不同测试通过，1项真实Provider测试未启用；先209项通过，修正测试端口与并发同步后Pi10项加线框3项全部通过，重复3项不计入总数 |
| 主站参考/元素/干预回归 | 21项通过 |
| `pnpm test:install` | 独立安装、消费者生产构建、浏览器交互通过，包含共享Chat/Tool/Agent工作台 |
| `pnpm check:boundaries` | docsPrivateAgentFiles=0，agentDocsFiles=0 |
| 当前工作区3020页面 | 实际挂载可用，浏览器pageerror=0，右侧变更摘要挂载 |

原始失败保留：隔离3031不在Pi Host来源白名单，且3013被并行测试占用；复测使用允许的3021页面来源与独立3313 Host。并发测试改为两个独立存储客户端同步提交，验证Host拒绝重复执行；同一浏览器的共享pending回执会主动禁用第二次发送，不能把该正确行为当成Host并发失败。历史重载等待来源消息ID恢复，未改生产回执/权限逻辑。

视觉实测：1440px下对话与Composer均x=336、宽760；2048px下均x=640、宽760。1024×450下输入框完整可见，提交按钮底部419.5px；无页面横向溢出。截图展示实际组件，未用图像替代页面。

- [当前工作区主界面](../../.tmp/agent-wireframe-20261011/delivered-local.png)
- [生产页面1440px](../../.tmp/agent-wireframe-20261011/final-desktop.png)、[2048px](../../.tmp/agent-wireframe-20261011/final-wide.png)、[短窗口](../../.tmp/agent-wireframe-20261011/final-short.png)
- [尺寸记录](../../.tmp/agent-wireframe-20261011/final-geometry.json)
- 本地日志目录：`../../.tmp/agent-wireframe-20261011/`；`accepted-*`为最终构建/安装记录，`accepted-pi-browser-final.log`为Pi最终复测，`final-docs-browser.log`为主站回归。截图与日志不进入分发载荷。

本轮完成主界面V2呈现与相关共享模块修正；保留历史Pi会话循环。219项浏览器证据包含受控Host，不等同本轮重新验收真实Provider；Editor/Git/PTY/Checkpoint及多Agent服务里程碑仍按主计划分别验收。
