# Work Items 实施与验收记录

日期：2026-10-08。原首版范围为 W0–W4 / S0–S4；下文先保留首版证据，再追加本次 W5 / S5 的独立验收。

## 实现与责任

| 阶段 | 结果 | 源码与验收出口 |
| --- | --- | --- |
| W0 契约 | 完成 | `grouped-items-model.ts` 定义业务无关分组和移动；`work-items-model.ts` 固定实体、能力、视图与写入状态；`work-items-view.ts` 提供可选本地查询和命令校验。 |
| W1 属性与单条 | 完成 | Row/Card 共用 WorkItemProperties；状态/优先级单选，负责人/标签多选，日期为 YYYY-MM-DD；失败字段保留草稿及关联错误，其他字段成功不清除它。 |
| W2 List/Table | 完成 | GroupedList、WorkItemList、DataTable 适配、Toolbar/DisplayOptions、QuickCreate；选择与详情独立，隐藏选择保留，数据五态可恢复。 |
| W3 Board | 完成 | 独立 Pointer Events 把手与“移动到/上移/下移”；queryKey/revision/权限和分页邻居校验；拒绝保留权威位置，unknown 跨布局锁定，先查询后解除。 |
| W4 Workspace/分发 | 完成 | Shell/详情抽屉、受控快照；11 个文档项、11 个 Registry 项及按需示例。独立消费应用经 CLI 安装、类型检查、生产构建与操作验证。 |
| S0 基线 | 范围已记录 | 冻结 24 项、5 状态、4 优先级、日期 2026-10-08 与 URL 白名单。Plane 源码链已核对；仅公共入口可访问，未取得登录后的工作项视觉基线。 |
| S1 List/详情 | 完成 | 创建→筛选→查看→编辑；只读/空数据/无匹配/加载/刷新失败/字段拒绝；失败不丢旧数据和草稿。 |
| S2 Board闭环 | 完成 | 跨状态/优先级、列内排序、空目标组；指针与触屏替代；拒绝和 unknown 对账，三视图读取同一份记录。 |
| S3 Table/跨视图 | 完成 | URL 显式编解码，设置 replace、详情 push；直接打开/刷新/后退；共享选择、详情与权限，每布局保存滚动位置。 |
| S4 展示/证据 | 完成 | 双主题、zh-CN/en、1440×1000 / 1024×768 / 390×844 截图；Blog、行为回归、安装与 50/200/1000 项实际挂载基线。 |

按用户确认，本轮通用 Board 的路径/安装 ID 为 `work-items-board-base`，公开导出仍是 Board/BoardColumn/BoardItem，以独立 Ideas 示例展示业务无关性。Agent Board 保留已提交的 `item-board`；两轮先使用独立源码、CSS、安装目标，后续再统一。AvatarGroup/PropertyOverflow 与字段选择器随 `work-item-properties` 安装，Row/Card 随 `work-item` 安装，三个视图随 `work-items-views` 安装。文档安装指令使用实际 registryId。

公共组件不导入 Next、Plane、站点鉴权、网络服务或持久化适配器。调用方持有实体、权威组顺序/计数、权限、操作 ID、版本、草稿与回执。模拟 Agent 只增加明确标记的 RuntimeStatus，不替代工作项业务状态。`onUnknown` 将 QuickCreate 的异常/未知结果交还适配层，关闭弹窗不会解锁另一笔写入。

## 验证方法与结果

共享工作树内另有 CRM 和 Agent Board 改动。最初从 `07fbbe0eb2cb0c30cfcddf083c546883968614f0` 建立任务专用快照，完成 96 项组件、Workspace/Canvas、语言、文档及 Blog 回归。Agent Board 提交 `d5cea15b421a6302750896a4a07b0dd47610e925` 后，将本轮文件及共享条目叠加到该最新基线，再验证共用组件及组合安装。未将并行尚未提交的 CRM 改动混入本轮提交。生产预览使用 33111/33112；保留 3010 开发服务、3011 及其他会话进程。构建使用 Webpack/WASM，未重启共享服务。

- `pnpm lint`、`pnpm typecheck`、`pnpm build`：通过。
- `pnpm check:i18n`、`pnpm check:manifest`、`pnpm check:blog`：通过。
- 最终生产版本 `work-items.spec.ts` + `work-items-docs.spec.ts` 定向复验：19/19 通过（37.3s）；其中工作项行为 13/13，文档与文章 6/6，含真实鼠标拖动、触屏菜单、44px 把手、axe、字段失败草稿、unknown 跨布局/语言、分页失败重试及视口高度。
- 现有 common-components / workspace / canvas-workspace / i18n 回归：47/47 通过；这是已提交基线的组件回归，不是并行未交付 CRM/Agent Board 页面验收。
- 首次集成回归 119 项中 118 项通过，1 项因通用 Board 文档示例被替换而失败；恢复 Agent Board 的 Note 示例并分离本轮 Ideas 示例后，最终完整浏览器回归 **224/224 通过**，涵盖 Agent Board、Work Items、文档/Blog、common、Workspace、Canvas、语言和无障碍。
- `pnpm test:install`：通过。组合消费应用 `easyuse-ui-consumer-DUsQyi` 实际安装 WorkItemsWorkspace 与业务无关 Board 的依赖闭包；验证 List→Board unknown→Table 对账→List 详情编辑，并执行已提交 Agent Board 及原有 common/Canvas 安装操作。不是每个安装项分别建一个应用，也不是生产服务证明。

截图与性能脚本为 `scripts/capture-work-items.mjs`。36 张布局/尺寸/主题/语言矩阵图加详情、部分加载、只读、unknown 共 40 张；图像和 JSON 在 `public/blog/work-items/`。`source-snapshot.json` 列出核心实现、CSS、示例与测试的 SHA-256，脚本在采集前后检查这些源文件没有变化；此 ID 不是整个 Git 树哈希。测试汇总单独保留在 `verification.json`。

## 性能基线与限制

`measurements.json` 对 50/200/1000 项各测一次：真实挂载条目数、DOM 数、渲染、选择、字段编辑、切换 Board、移动、分组。耗时为 Playwright 操作到两个动画帧，包含自动化开销与 120ms 模拟写回执，主机同时存在其他会话；不是服务基准、p95 或改善前后对比。首版 Blog 的 before/target 设为 null，当时文章状态为 measuring；本次追加同源码开关对照，保留该历史基线。

首版当时没有窗口化，1000 项场景明显迟缓。该结果属于如实记录的首版基线，不能称为当时已完成大数据优化；消费方应以权威分页限制同时挂载的条目。具体数字以与截图同批次的 JSON 为准，后续性能门槛需在固定环境重复采样后制定。

Plane 参考提交为 `1fec307f91003df96351557af32ce87891a3678a`。`reference.json` 保存读取路径/哈希与范围：参考信息架构及共享属性，不逐像素复制、不复制 store/API、不修改 Plane。未取得登录态 List/Board/Table 截图，因此没有视觉相似度结论，也未把公共入口截图充当工作项页面证据。

首版只证明源码实现、本地确定性 fixture 浏览器行为与独立安装。首版记录时 W5/S5 尚未实施，其追加结果见下节。真实 Plane 接入、生产权限/写入/持久化和人工读屏验收仍需消费方单独验收。刷新会重置业务 fixture；语言和主题偏好属于站点设置，不保存工作项或用户草稿。

## W5 / S5 增强实施与独立验收

本次在 `24ebab1a64ad3215b5d69ed5b439e1ec78c94c16` 基线上实施；保留共享工作树内的 CRM 改动，工程检查和生产浏览器使用任务专用副本。未重启 3010 开发服务。新增两项按需文档入口及 `work-items-enhancements` Registry 安装包；WorkItemsWorkspace 的依赖闭包带入增强组件。接口详见 [WORK-ITEMS.md](../WORK-ITEMS.md)。

| 增强 | 源码/接口 | 独立验收与边界 |
| --- | --- | --- |
| 泳道 | `WorkItemsLaneSnapshot`、WorkItemBoard/Workspace.lanes、laneKey 移动/创建/分页/重试 | 按状态/优先级双轴分组；指针不能跨泳道，菜单与键盘同规则；unknown 在原泳道对账，Table 核对共享字段。跨泳道双字段写命令由消费方另行定义。 |
| 子项 | WorkItemList.hierarchy、parentId 索引、受控 expandedIds 与子项数据快照 | 嵌套展开、部分读取失败保留已有子项、重试、折叠保留隐藏选择、过滤只命中子项仍可读；切换平铺布局后恢复展开。重复/循环/孤儿/跨项目关系不会无限递归；不冒充多选 Tree。 |
| 批量修改 | WorkItemsBatchActions、逐项 baseRevision、唯一 operationId、onApply/onReconcile | 预览含隐藏选择，跳过缺失/拒绝能力/锁定项；状态与优先级可写；混合成功/拒绝/unknown 按项展示，切布局不解锁 unknown。组件不建立原子事务或全查询选择。 |
| 保存视图 | WorkItemsSavedViews、受控视图列表/版本/能力/数据态与回执 | 另存、应用、更新/重命名、确认删除；拒绝保留名称，unknown 在浮层重挂载/语言切换后仍锁定并可查询。只保存配置，示例仅页面内存；持久化和账户范围由消费方提供。 |
| 大数据 | 查询/分组/层级索引缓存、共享属性 memo、可选 deferOffscreen | 屏外保留可读字段、选择与导航，编辑器在可见或聚焦时挂载，之后保留至条目卸载；200 项浏览器验证屏外可读、聚焦后编辑及焦点稳定。全部条目仍在 DOM，没有窗口化；Table 保持原生表格。 |

`tests/work-items-enhancements.spec.ts` 覆盖上述边界，并验证 390px 深色英文触屏、44px 目标、reduced-motion、axe 及没有嵌套交互元素。原 Work Items / 文档测试继续覆盖三视图、指针移动、分页、拒绝草稿与 unknown 恢复。独立消费应用通过 CLI 安装后实际操作层级展开、批量修改、泳道移动、保存及应用视图。

### 本次工程与分发验证

- `pnpm lint`、`pnpm typecheck`、`pnpm build`：通过；构建使用 Webpack 与 WASM fallback。
- `pnpm check:i18n`、`pnpm check:manifest`、`pnpm check:blog`：通过。
- 最终生产输出完整浏览器回归 **244/244 通过（6.1m）**，含本次增强和文章证据断言、既有 Agent/Work Items/common/Workspace/Canvas/语言/Blog 等基线。前序同一运行时源码的 Work Items 定向检查为 29/29。
- `pnpm test:install`：通过。独立消费应用 `easyuse-ui-consumer-cj1xSf` 经 CLI 安装、类型检查与生产构建，浏览器验证子项、批量优先级实际修改并进入 High 泳道、泳道内移动、保存及应用视图，以及既有 Work Items/common/Agent/Canvas 安装操作。
- 浏览器使用独立生产预览 33114；性能采集使用 33113。源码哈希与最终隔离副本匹配。完整回归不代表并行未提交 CRM 页面验收，也不代表真实服务接入。3010 开发入口另经只读浏览器复核：HTTP 200、4 条泳道/24 项、保存视图浮层可操作，页面与资源请求无错误；未重启服务。

### 重复性能测量

`measurements.json` 在同一份 W5 源码、Webpack 生产静态预览下，对 50/200/1000 项分别做三轮，轮换 `deferOffscreen` 关闭/开启顺序，共 18 次观察。实际已加载、fixture 总数、DOM 挂载实体数始终一致。下表为三次中位数，单位 ms，每格为“关闭 / 开启”；完整渲染耗时与 DOM 数见 [测量 JSON](../public/blog/work-items-enhancements/measurements.json)。

| 已加载 / 总数 / 挂载 | 选择 | 字段更新 | 切 Board | 移动 | 重新分组 |
| --- | --- | --- | --- | --- | --- |
| 50 / 50 / 50 | 101 / 117 | 333 / 400 | 467 / 320 | 350 / 377 | 550 / 437 |
| 200 / 200 / 200 | 174 / 245 | 450 / 417 | 1500 / 801 | 727 / 631 | 2146 / 965 |
| 1000 / 1000 / 1000 | 1214 / 1037 | 2772 / 2133 | 9710 / 3674 | 3800 / 3975 | 22191 / 6095 |

两组都包含本次索引/缓存优化，开关对照不能解释为 W4→W5 的整版改善。并非每项操作都更快：200 项选择从 174ms 增至 245ms，1000 项移动从约 3.8 秒增至 4.0 秒，完整结果均保留。延迟编辑器挂载前的同环境中间结果另存于 `layout-only-measurements.json` / `layout-only-source-snapshot.json`，只保留排查过程，不作为当前版本的验收结果；W0–W4 的历史单次基线也保留在原目录。

测量包含 Playwright 操作、两个动画帧、120ms fixture 回执与共享主机噪声，三轮中位数不是 p95、服务延迟或生产容量保证。1000 项仍保留完整 DOM，开启优化后仍有明显耗时；需要消费方结合权威分页限制同时加载的条目，不宣称达到交互 SLA。

证据在 `public/blog/work-items-enhancements/`：18 次测量、6 张截图、截图索引、核心源码 SHA-256 和验证记录。采集脚本检查 13 个明确列出的文件在采集前后未变；这不是整个 Git 树哈希。图片包括泳道、子项、批量预览/混合回执、保存视图及 390px 深色英文。Blog 追加相同证据、开关对照与服务限制，保留旧版图片及基线的原始来源 ID。

本次交付证明公开源码、确定性本地行为及独立安装。没有新增真实 Plane 登录态视觉对照、生产权限/批量事务/持久化服务或人工读屏验收证据。页面内存 fixture 和保存视图刷新清除；语言切换不改协议值、不触发服务写入。
