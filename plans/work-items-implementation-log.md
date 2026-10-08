# Work Items 实施与验收记录

日期：2026-10-08。范围：组件计划 W0–W4、展示计划 S0–S4。W5/S5 的泳道、子项、批量写入、保存视图及大数据优化不计入本轮交付。

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

`measurements.json` 对 50/200/1000 项各测一次：真实挂载条目数、DOM 数、渲染、选择、字段编辑、切换 Board、移动、分组。耗时为 Playwright 操作到两个动画帧，包含自动化开销与 120ms 模拟写回执，主机同时存在其他会话；不是服务基准、p95 或改善前后对比。Blog 的 before/target 设为 null，文章状态为 measuring。

当前没有窗口化，1000 项场景明显迟缓。该结果属于如实记录的首版基线，不能称为大数据优化完成；消费方应以权威分页限制同时挂载的条目。具体数字以与截图同批次的 JSON 为准，后续性能门槛需在固定环境重复采样后制定。

Plane 参考提交为 `1fec307f91003df96351557af32ce87891a3678a`。`reference.json` 保存读取路径/哈希与范围：参考信息架构及共享属性，不逐像素复制、不复制 store/API、不修改 Plane。未取得登录态 List/Board/Table 截图，因此没有视觉相似度结论，也未把公共入口截图充当工作项页面证据。

本轮只证明源码实现、本地确定性 fixture 浏览器行为与独立安装。真实 Plane 接入、生产权限/写入/持久化、人工读屏验收、W5/S5 增强仍待后续接入和单独验收。刷新会重置业务 fixture；语言和主题偏好属于站点设置，不保存工作项或用户草稿。
