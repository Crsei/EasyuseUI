# Work Items

入口：`/workspace/work-items/`。首版为 List、Board、Table，不提供泳道、子项树、批量写入、Calendar 或 Gantt。示例数据刷新后重置，所有写入与回执均为本地模拟。

## 分层与安装

- `grouped-items-model`：业务无关的 GroupSnapshot / BoardMove。
- `grouped-list`：GroupHeader、GroupBody、GroupedList；分组顺序、折叠、读取及加载更多受控。
- `work-items-board-base`：Board、BoardColumn、BoardItem；不导入工作项或 Agent 模型。本轮与 Agent Board 使用独立文件和安装目标，后续再统一。
- `work-items-model`：WorkItemRecord、目录、视图、交互、能力、MutationState、MoveIntent；附带可选本地纯函数。
- `work-item-properties`：共享字段与 State/Priority/Assignee/Label Picker、原生 DueDateField；AvatarGroup、PropertyOverflow 为该安装项内的辅助导出。
- `work-item`：WorkItemRow、WorkItemCard、WorkItemIdentifier、WorkItemMutationNotice。
- `work-items-views`：WorkItemList、WorkItemBoard、WorkItemTable；Table 复用 DataTable。
- `work-items-toolbar`：WorkItemsToolbar、WorkItemsDisplayOptions。
- `work-item-detail`：WorkItemDetail、WorkItemQuickCreate。
- `work-items-workspace`：组合入口；安装时递归带入以上依赖及 CSS/i18n。公共组件没有 Next、站点、网络和本地存储依赖。

Registry 示例（替换成部署站点）：

```bash
pnpm dlx shadcn add https://YOUR-SITE/r/work-items-workspace.json
```

所有公开安装项的真实源码、API和按需示例见组件目录。Row/Card 和三布局各有文档入口，同一安装项内的辅助导出不机械拆包。UI 词典由正式 Manifest 自动生成实现标记。

## 受控接入

```tsx
<WorkItemsWorkspace
  title="Work Items"
  sidebar={<Navigation />}
  catalog={catalog}
  items={loadedItems}
  groups={authoritativeGroups}
  queryKey={queryKey}
  view={view}
  onViewChange={setView}
  interaction={interaction}
  onSelectionChange={setSelection}
  activeItem={activeSnapshot}
  onCloseItem={closeDetail}
  getPresentation={(item) => ({
    catalog,
    visibleProperties: view.visibleProperties,
    capabilities,
    mutation: mutations[item.id],
    href: getItemUrl(item.id),
    onOpen: openDetail,
    onPatchItem: requestPatch,
    onReconcile: () => queryReceipt(item.id),
  })}
  canMove={canMove}
  onMove={requestMove}
/>
```

`items`、`groups`、`activeItem`、草稿、操作回执、权限和版本由消费方提供。属性 UI 可显示调用方的草稿覆盖值，但必须同时提供 pending / rejected / unknown；它们不代表已经保存。选中、焦点、详情、折叠与写入相互独立。

### 移动

Board 回调包含 itemId、sourceGroup、targetGroup、beforeId/afterId、queryKey，以及可选 baseRevision（由 getItemRevision 提供）。WorkItemBoard 自动提供记录 revision。适配层补充唯一 operationId 后，用 `validateMove` 或服务等价规则校验；服务负责最终权限、版本和全局排序。不要把当前页数组下标当服务端顺序。

单值状态/优先级分组可移动。自动排序允许跨组修改，禁止列内自由重排。部分分页只允许明确已加载邻居；向未知尾部追加必须显式提供 allowAppend 能力。多值负责人/标签分组不在首版移动范围。

指针拖动仅由独立把手启动，触摸把手使用 Pointer Events。键盘/触屏使用“移动到组、上移、下移”入口，走相同回调；Escape 取消。折叠、删除目标、queryKey变化和权限变化后重新校验，不能修改旧对象。拖动预览不写权威记录。

### 结果与分页

MutationState 的 pending/unknown 锁定对应条目。卸载视图不清回执，未知结果先查询，明确拒绝才允许安全重试。调用方不可把 Promise resolve 当作业务完成。QuickCreate 返回明确的 CreateResult；传入 unknown、onUnknown 与 onReconcile，使关闭浮层后仍由适配层保留锁。onUnknown 在结果未知或回调抛异常时通知适配层保留回执。回调不得吞掉未知结果。

GroupSnapshot 的 totalCount 为 null/undefined 时显示“已加载”，不补0。加载更多失败保留当前组内容。`mergeGroupPage` 仅合并相同组和 queryKey，按来源顺序去重；远程数据必须提供全量权威总数，不能调用本地 `groupWorkItems` 重新推算。

日期保持 YYYY-MM-DD 字符串。`today` 由消费方按项目时区给出；示例固定为 2026-10-08，不通过 UTC 转换。

`agentLabel` 可由调用方描述关联运行态；公共组件默认显示 Agent，站点 fixture 明确标为“模拟 Agent”。示例场景和模拟回执文案位于站点语言资源，不随组件语言包分发。

## 示例与证据

URL 仅保存支持的布局、分组、排序、搜索、过滤、字段显隐、空组和稳定 item ID。配置使用 replace，详情导航使用 push；静态导出在 Suspense 中解析。公共组件不读路由。

工作台默认收起场景说明。包含空数据、无匹配、加载、部分组、刷新失败、只读、明确拒绝、未知结果及模拟 Agent；压力数据为50/200/1000条。源码、fixture浏览器、安装和真实服务证据分开记录在 `plans/work-items-implementation-log.md`。本轮没有真实 Plane/生产服务接入证据。

1000项场景会实际挂载全部条目，当前没有窗口化；性能记录采用单次基线，包含自动化开销和120ms模拟回执延迟，不作为生产服务SLA。消费方可使用权威分页控制已加载数量。
