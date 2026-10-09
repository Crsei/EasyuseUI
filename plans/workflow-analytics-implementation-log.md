# 工作流分析实施记录

日期：2026-10-09。当前范围：组件 C0–C7、展示 S0–S6 已完成。下文先保留首版冻结证据，再记录完整实现；真实服务接入仍由消费项目另行验收。源码与调用方契约见 [WORKFLOW-ANALYTICS.md](../WORKFLOW-ANALYTICS.md)。本记录的通过只针对注明的证据层级。

| 范围 | 实现 | 验收证据 |
| --- | --- | --- |
| C0 | 来源/实体身份、版本指标、历史覆盖、修正/撤销重放、筛选交集、权限 queryKey/generation、下钻和 CSV | 13 个独立手算计算测试通过；当前栈生产构建和独立消费通过 |
| C1 | ChartFrame/Header/DataState/Legend/Tooltip/Axis/Reference、柱/线/面积/Donut/散点、完整数据表、分页下钻和 WorkflowMetric | 鼠标/键盘/触屏、缺失/零/部分态、数值轴、主题和独立安装通过 |
| C2 | 状态/实际完成/年龄/明确阻塞四模板、固定项目 Dashboard、五布局适配、有类型关系表和风险事实 | 同快照历史成员、分页、明确应用筛选、撤权/迟到结果、刷新失败保留旧值通过 |
| C7 首版 | 13 个 Registry/Manifest 安装项、按需文档示例、示例目录、截图、源码哈希、测量和博客 | 内容/文档门禁、23 项计算及浏览器检查、独立安装与 host/scoped 消费通过 |
| 真实服务 | 历史采集、查询/权限、存储、写入、配置持久化和业务验收 | 未接入；fixture 与独立安装不证明这些能力 |

## 入口与示例

统一入口 `/examples/workflow-analytics/` 为全窗口本地示例，包含项目/成员筛选、八种数据/权限场景、指标定义、CSV、来源分页、历史工作项五布局和明确关联。新版 `/examples/` 示例目录、首页场景和相关组件文档链接此入口。组件目录演示五种统计图形；散点明确标注示例数值坐标。

本轮实现概览及内嵌工作关联；展示计划中的其他 `?view=` 模式只是规划建议，未宣称实现独立 URL 模式。示例刷新重置，没有授予服务权限或执行业务写入。

## 计算与数据证据

`tests/workflow-analytics-model.spec.ts` 手算 fixture：有效工作项 7，backlog/active/completed=1/5/1；区间实际完成流量=3，10月4日为2，WA-3随后重开；阻塞项去重2，组数2+1可重叠；缺创建时间的年龄为 null。覆盖修正/撤销、重复与冲突事件、重开、scope移除、半开范围、跨时区/DST/周桶、无期初/历史缺口、权限generation、CSV公式与零分母，也验证 Run 不混入工作项统计。

纯函数测量为 500/5,000/50,000 事件、100/1,000/10,000 点，每档5次，保存原始样本与中位数；这不是图形绘制或服务容量承诺。Recharts 3.10.1 的 UMD参考体积为593,114 bytes，gzip155,441 bytes；不等于应用路由下载量。

报告：[measurements.json](../public/blog/workflow-analytics/measurements.json)。复合源码快照 `3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88` 保存实现/fixture/测试/依赖/主题的逐文件SHA256，以及六个本地参考库HEAD；交付快照逐文件核对一致。没有复制参考库源码。

## 验证结果

验证使用隔离的任务快照：以 `8912c55` 为基线，只叠加本次改动，保留并行首页/文档提交和工作区中其他未提交修改。3010开发服务保持运行；生产浏览器使用独立3014预览。

| 检查 | 结果 |
| --- | --- |
| pnpm lint / pnpm typecheck | 通过 |
| pnpm build | Webpack + WASM SWC 静态导出通过；隔离本地构建明确配置 SITE_URL 和 LOCAL_BUILD |
| check:i18n | 1207 portable +2054 site strings 通过 |
| check:manifest / check:blog | 117组件、130安装项；11已发布文章、1草稿通过 |
| 文档生成与代码示例 | 117组件、5指南、224按需源码资源；45个usage/variant/guide示例编译通过 |
| Playwright 专项 | 23通过：13计算+10浏览器；包含1440/1024/768/390、深色/英文/reduced-motion、触屏、示例目录与文档源码读取 |
| pnpm test:install | 独立生产消费通过；包含本次13安装项、柱/线/散点、同快照分页下钻及zh/en，原有消费回归通过 |
| pnpm test:install:themes | host/scoped两种独立消费通过；分类色/状态色实际解析到私有token，宿主样式/像素不变、Portal与焦点回归通过 |

独立安装与 host/scoped 检查使用最终 Registry 快照，包含共享依赖、完整语言资源与 CSS。生产构建、类型、文档和23项专项检查另行通过。当前3010共享开发工作区也通过目录/源码读取与历史下钻到五布局的2项浏览器冒烟检查；仍不代表真实服务验收。

生产浏览器以新context分别检查 `/`、`/docs/button/`、分析示例：前两者不下载Recharts，分析示例加载统计引擎。报告记录解码JS字节，不能与gzip或UMD参考体积直接比较。见 [bundle-isolation.json](../public/blog/workflow-analytics/bundle-isolation.json)、[validation.json](../public/blog/workflow-analytics/validation.json) 和 [theme-validation.json](../public/blog/workflow-analytics/theme-validation.json)。截图覆盖桌面/窄屏、浅/深色；博客保留测量中状态，没有虚构优化前对照。

排查中遇到根盘临时空间不足及Chrome临时路径过长，验证转入数据盘并使用短TMPDIR别名后通过；未中断用户服务。主题检查发现动态token拼接无法被命名空间转换，已改用静态token映射并以实际图形颜色验收。

## 首版结束时待办（本轮已完成）

首版结束时 C3资源与执行模板、C4迭代进度和布局保存、C5 CFD/周期/预测/任务依赖、C6通用构建器尚未实施。容量分摊、多币种/父子inclusive用量、Forecast校准与unknown保存不在首版验收内；不从现有Agent样例或fixture推定通过。


## 完整实施 C3–C7 与 S0–S6

本轮以首版提交 `3d83edc` 开始，合入并行基础组件提交 `a6b67c7` 后，在隔离快照完成最终验证。共享 3010 服务保持运行；生产测试使用独立 3016。CRM 与 Agent 工作台等未提交修改保留在共享工作区。

| 阶段 | 已实现内容 | 证据与范围 |
| --- | --- | --- |
| C3 / S2 | Heatmap/Legend、资源分配、实际执行 Timeline、AgentOperationsDashboard、Workload/AgentCost | 显式分摊、未知估算/容量、零容量、父子包含去重、多币种、实际时间戳与独立业务验收；独立手算与安装浏览器通过 |
| C4 / S3 | 燃尽/燃起/速度、DashboardLayoutEditor/WidgetPicker、SVG 图像导出 | 历史范围/估算、期初剩余承诺、闭合迭代；拒绝保留草稿、unknown 跨页面锁定及核对；键盘重排和受控尺寸 |
| C5 / S4 | CFD、CycleTime、状态停留、条件化 Forecast、只读任务依赖 | 历史成员、DST 桶边界、缺失样本覆盖、最终有效完成；经验抽样、滚动起点回测、无穷/截断样本保留、降级门槛；强连通分量定位实际成环 |
| C6 / S5 | AnalyticsBuilder 与配置迁移 | 指标版本/维度/分段/单位/图型兼容；当前配置预览后应用，取消保留原分析；迁移不保留实体缓存和未知嵌套字段 |
| C7 / S6 | 新增 14 安装项，连同首版共 27 项；按需组件文档、十种场景、Blog、截图与测量报告 | 正式快照、独立消费和本地 fixture 分开记录；首版截图与测量文件保留 |

### 统一展示与操作

`/examples/workflow-analytics/` 的 overview、traceability、charts、agents、resources、delivery、flow、risk、custom、builder 均为可用模式。示例使用 120 个工作项、两个项目、四名成员、三名 Agent、多个模型、两种币种与 90 天历史。原手算 fixture 和首版页面位于 `/examples/workflow-analytics/baseline/`；`/examples/workflow-analytics/benchmark/` 单独测量合成点数。

概览为四 KPI、两图与关注项；统计点、分页聚合表、来源列表、详情与五布局保持查询和快照身份。全局时间选择成员队列，每张图显示自身指标时间。项目、范围、时区、粒度、图表与选中对象经白名单 URL 恢复，返回/刷新不串用对象。授权改期走既有 Work Items 表单回调，更新本地来源版本后重新聚合；旧快照先退出展示。燃起范围线下钻同时展示该桶实际 scope/estimate 事件及来源工作项。

图表目录使用显式按需预览，并有概览、聚合表、交互、代码和边界五个标签。大数据表每页 50 聚合点；图形、表格和来源下钻分开。CSV 导出当前授权完整聚合；SVG 带图名、单位、范围、时区、快照和本地模拟标记，表格模式不可误导出旧图。Agent 来源保留原始用量观测、包含关系、币种和验收证据。

异步 fixture 提供延迟、刷新失败、权限撤回、部分覆盖、无历史、无匹配、预测不足/过期和 scope 变化等场景。同查询刷新失败保留已有数据；范围变化隔离旧响应，撤权清除详情。布局保存为调用方保留的 session，对 unknown 不重放、不重置或假装成功；本地核对回调不等于真实持久化。

### 最终验证与证据

组件构建、文档与浏览器验证基于合并后的隔离快照；共享未提交变更未混入正式交付。Webpack 使用本机 WASM SWC 回退。独立安装使用固定 Registry，host/scoped 两种主题消费者检查实际图形颜色、宿主像素、Portal 和语言资源。

| 检查 | 结果 |
| --- | --- |
| lint / typecheck / Webpack build | 通过 |
| i18n | 1399 portable + 2184 site 消息通过 |
| Manifest / Registry | 全库 171 组件、184 安装项；本域 27 项通过 |
| 文档与代码片段 | 171 组件、5 指南、291 按需源码资源；73 个片段编译通过 |
| 计算与浏览器专项 | 51 通过：13 首版计算 + 16 扩展计算 + 10 首版浏览器 + 12 完整展示浏览器 |
| 独立安装 | 完整分析 helper、热图、历史图、unknown 保存/核对和既有 Canvas/Agent/Work Items 等消费回归通过 |
| host/scoped 安装 | 两种独立消费者通过；Registry 哈希与实际图形颜色、宿主样式/像素、Portal 核对 |
| 截图 | 1440/1024/768/390 × 深浅主题 × 中英文，共 16 张概览，加 9 张场景图 |
| 浏览器基线 | 4/8/12 Widget × 100/1000/10000 总点数，共 9 档；点数向上均分时实际点数另列；每档一次自动化交互样本 |
| 纯函数基线 | 500/5000/50000 事件与 100/1000/10000 点，每档五次，保留样本和中位数 |

完整证据位于 [full/validation.json](../public/blog/workflow-analytics/full/validation.json)、[full/capture.json](../public/blog/workflow-analytics/full/capture.json)、[full/aggregation.json](../public/blog/workflow-analytics/full/aggregation.json) 与 [full/theme-validation.json](../public/blog/workflow-analytics/full/theme-validation.json)。源码逐文件哈希绑定到完整快照，Registry 安装另保留分发哈希。首页和普通 Button 文档仍不下载统计引擎；首版分析路由的解码 JS 字节另见 [bundle-isolation.json](../public/blog/workflow-analytics/full/bundle-isolation.json)。

浏览器图表耗时是准备 Widget 布局后的点数更新，包含 Playwright 交互与两帧等待；筛选为本地切换，来源下钻只打开一条合成记录。纯函数聚合、图形交互、截图和安装不是同一种性能或业务证据。Blog 保留 measuring 状态，没有前后优化对照或真实服务容量承诺。

真实历史采集、生产查询与权限、业务写入、持久化、发布和团队预测可信度均未接入，仍需消费项目独立验收。内存 fixture 刷新重置，本计划完成不代表这些真实服务能力已经交付。

完整源码快照：`2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f`，含 75 个实现、示例、测试、Registry、主题与依赖文件的 SHA256。窄屏及桌面收起侧栏使用带完整名称提示的图标，选中背景与键盘焦点分别呈现；新增浏览器回归验证。

当前共享 3010 开发工作区另通过概览双图、构建器预览、窄屏图标导航及 `/r/analytics-builder.json` 服务冒烟检查。见 [live-smoke.json](../public/blog/workflow-analytics/full/live-smoke.json)。当前工作区含并行未提交组件，Registry 共 208 项；此数与正式隔离快照的 184 项分别记录，不作为正式提交新增范围。
