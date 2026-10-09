# 工作流分析首版实施记录

日期：2026-10-09。范围：C0–C2 与对应 C7 已完成；C3–C6 待实施。源码与调用方契约见 [WORKFLOW-ANALYTICS.md](../WORKFLOW-ANALYTICS.md)。本记录的通过只针对注明的证据层级。

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

## 后续范围

C3资源与执行模板、C4迭代进度和布局保存、C5 CFD/周期/预测/任务依赖、C6通用构建器尚未实施。容量分摊、多币种/父子inclusive用量、Forecast校准与unknown保存不在首版验收内；不从现有Agent样例或fixture推定通过。
