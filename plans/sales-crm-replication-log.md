# Sales CRM Companies 实施与验收记录

日期：2026-10-08。目标：`/examples/sales-crm/`；仅本地fixture。原实施轮次按要求只实现与验证；2026-10-09 用户另行授权 Git 提交，复核记录见文末。

## R0：参考冻结

- 正式参考工程 `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/sales-crm` 保持只读。原有 `package.json` / `next.config.ts` 主机适配未改动。
- 冻结副本：`../.tmp/sales-crm-reference-6zrd49i8`，287文件，SHA256 `9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739`。源码hash清单：`public/blog/sales-crm/reference/source-snapshot.json`。
- 工作开始时EasyuseUI快照：`../.tmp/easyuse-crm-before-ay8o7pgo`，400文件，SHA256 `63daee31c7cd74a8ecf29a871ffcdbb793fd663315151c22dc353500fa166577`。随后已有前置工作被其他任务checkpoint为 `07fbbe0`；本轮不提交CRM实现。
- 先核对进程，3010为EasyuseUI既有开发实例，3200为Plane；没有复用或停止未知服务。冻结参考副本通过Webpack在33210启动，不在正式参考目录生成构建产物。
- 参考Chrome138.0.7204.92、DPR1、UTC、en-US、减少动态效果，截图12种状态：1440/1920默认、选择、负责人筛选、详情、资料、新增、通知、搜索、390默认、移动导航与筛选。路径、操作与尺寸见 `public/blog/sales-crm/reference/environment.json`。

## R1–R4：组合与行为

- 新路由只对 `/examples/sales-crm[/]` 启用站点全窗口，保留普通文档/Blog/Canvas路由行为。CRM导航提供返回文档和验证记录。
- 私有CSS Module + scoped ThemeBoundary；Portal沿用作用域，不改共享token或全局深色主题。桌面侧栏254px、可调200–400px；表头38px、行42px（参考网格额外计入边框，实测39px/43px）、桌面筛选30px、详情/新增560px。粗指针控件至少44px。
- 九个业务列 + 通用选择列；CommandPalette新增可选className/renderItem，保持结果激活与键盘所有权，CRM用其组合富结果；复用DataTable、Checkbox、Avatar、Tag、SegmentBar、Sparkline、DropdownMenu。公司名称、负责人和尾部动作是独立目标；勾选不打开详情。
- 单一派生结果服务排序、负责人/阶段/活动筛选、表格、计数、总额、平均概率和CSV。可见全选保留隐藏选择。CSV处理引号、逗号、换行、公式前缀；不导出Logo。
- 公司/负责人在同一个受控Sheet中按ID切换完整快照，避免多层抽屉冲突；关闭恢复可达焦点。资料可打开账户或按负责人过滤。趋势7/30/90天实际更换本地序列。
- 新增复用Dialog、Field、FormSection、Input、Select、Slider、ImageUpload；保留无效原始数字，校验名称/选择值/有限非负数/整数商机/0–100概率/真实日期/可读取图片。图片只在内存中；取消/失败保留草稿。同轮重复提交由ref锁定。创建被筛选隐藏时显示查看/清除操作。
- 通知已读操作与对象导航独立；失效关联明确提示，不打开替代对象。搜索在本示例范围注册Ctrl/Cmd+K，忽略文本输入/IME/Canvas；按公司、负责人、分类和阶段匹配，支持键盘与无结果。
- 移动导航使用左Sheet，FilterToolbar窄屏使用底部Sheet，表格保留原生横向滚动。五种数据态、刷新失败保留、创建/下载失败放在说明面板的折叠场景入口。移动排序也放入筛选Sheet。
- 中英站点资源位于 `lib/site-crm-messages.ts`，接入现有locale上下文并纳入i18n校验；用户数据、ID、金额及草稿不翻译。

## 明确差异与服务边界

| 项目 | 处理与理由 |
| --- | --- |
| 头像、Logo、图标、字体 | 参考未发现资产许可声明，不复制原始文件；姓名缩写、Lucide和宿主系统字体替代。来源见 `public/examples/sales-crm/README.md` |
| 次要文字/焦点 | 提高对比度，保留键盘焦点与查看行描边；不追求低对比参考像素一致 |
| 选择列 | 通用DataTable有独立原生选择列；合计10个表头，业务信息仍为九列 |
| 侧栏计数 | Companies显示真实本地18条，不沿用参考223+18；其余静态计数标记示例 |
| 导航与试用 | Deals/Forecast/Contacts/团队/报告/管道/邀请/计费等禁用并说明，不宣称页面或服务已实现 |
| 汇总 | 实际计算当前结果总额与平均概率；参考仅有占位标签 |
| 详情完成/时间范围 | 无编辑时显示完成，不假装保存；趋势切换真实示例序列，评分卡固定统计不伪装实时 |
| 多选 | 可见全选保留隐藏ID，明确优于参考清空所有选择的行为 |
| 新增和导出 | 本地创建与浏览器下载；业务数据/图片刷新重置，只有布局偏好保存。邮箱为example.invalid，不触发通信 |
| 菜单/通知/搜索 | 复用Select的键盘可选菜单，保留18名负责人；通知用独立已读动作和简化示例文案；搜索为960px宽结果组合，保留通用标题、帮助与关闭入口 |
| 移动目标与资料宽度 | 触摸行/控件扩大；资料统一560px级受控Sheet，参考480px。窄屏详情全宽且内部滚动 |

搜索宽结果由通用CommandPalette的可选展示接口组合，不增加第二套键盘/焦点逻辑。默认调用继续使用原有结果展示。另修正了当前共享AgentUsageSummary缺少DataTable必填caption的编译问题，仅补充既有汇总标题。

截图不能证明真实CRM API、认证、协作或云端保存。独立安装证明可分发组件的依赖闭包，不证明业务服务。没有实测性能收益，不填写性能提升。

## R5：验证与证据

- 完整源码隔离副本通过 `pnpm lint`、`pnpm typecheck`、`pnpm build`（Webpack/WASM SWC）、`pnpm check:i18n`、`pnpm check:manifest`。
- 全量Playwright：215项通过，0失败；包括18项CRM和同时冻结的Work Items回归。新CRM文章在证据写入后单独验证，不混入本次数量。
- `pnpm test:install` 重新执行通过；独立消费者 `../.tmp/easyuse-ui-consumer-Xd3rFP` 完成CLI安装、类型检查、Webpack生产构建和浏览器操作。验证通用组件和依赖闭包，不代表安装CRM业务应用或接入服务。
- 参考12张、复刻13张、差异图12组，另有差异图总览。1440×1000、1920×1080、390×844及1024px已覆盖；粗指针390/768/1024另由行为测试证明。
- 最终UI源码范围hash：`981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628`。这是实际服务副本的UI域hash，不是完整Git树；文章/报告/图片排除以避免自引用。
- 逐图核对记录：`public/blog/sales-crm/visual-review.json`；检查汇总和原始日志：`public/blog/sales-crm/verification.json`、`public/blog/sales-crm/verification/`。参考开发工具指示器与复刻生产模式的差异没有遮盖或抹除。
- 修正了命令搜索到新增的焦点交接、非安全HTTP下的本地ID、同轮重复提交、移动排序可达性、搜索标签遮挡；测试等待浮层动画稳定，失效状态不伪装成功。
- Blog沿用现有schema/比较模块；增加受限示例链接与复用类文章的“配对截图+同源测试”验证出口，不为满足性能文章规则捏造指标。
- 最后CRM/Blog专项：29项通过（18项CRM、11项Blog），最终工程检查再次通过。3010在线文章HTTP200，标题/示例链接确认；正式行为验收基于隔离生产构建。
- R0–R5在本地fixture范围完成；本轮没有发起commit/push，未读取GitHub token。交付时并行Agent Board任务另有提交d5cea15；不将其视为CRM提交。其他并行改动保留。
## 2026-10-09：Git 交付复核

- 用户另行要求按项目计划提交现有更新；本节补充原实施轮次，原始截图、verification.json 和日志保留历史事实。R0–R5 仍只表示本地 fixture 验收，不表示真实 CRM 服务或公开部署。
- 冻结任务开始时的源码后，在隔离候选中集成并行提交 `fcc51fb`（文档自动展示预览）。验证目录为 `../.tmp/easyuseui-commit-5e66w_m9`；没有重启共享 3010 开发服务。后续仍在进行的工作台拆分、站点元数据拆分和导航预取改动保留在工作区，不计入本次已验证交付。
- 原始全量回归 693 项中 689 通过、4 失败：Button 文档初始 JS 超预算，以及 hydration 前语言选择被覆盖。修复语言控件首次可用时机，并将 Blog 元数据限制为文章页按需加载，CRM 描述使用站点元数据键；没有提高原有加载预算。相关 87 项复测通过。
- 合入自动预览后 283 项中 281 通过、2 失败，暴露纯文本侧栏键盘可达性、Canvas 端口 ARIA 命名和署名链接对比度问题。侧栏加入焦点入口，端口名称移至语义 group，署名链接继承主题颜色。失败 trace 保存在 `browser-integrated-artifacts/`。
- 最终候选通过 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm check:i18n`、`pnpm check:manifest`、`pnpm check:blog`、`pnpm check:docs`、`pnpm check:ui-contracts`；原始输出见 `engineering-a11y.json` 和对应 `*-a11y.log`。
- 最终浏览器回归 **320 项通过、0 失败**，覆盖自动预览、文档 AA、语言首次选择、加载预算、CRM/Blog、Canvas、Work Items 与通用组件。见 `browser-a11y.log`。这是最终集成候选的相关回归，不把此前 689 项通过数当作最终源码的全量结果。
- 便携源码/CSS 修改后重新执行 `pnpm test:install` 通过；独立消费者 `/tmp/easyuse-ui-consumer-EXFQ28` 完成 Registry 安装、类型检查、生产构建与浏览器验证，见 `test-install-a11y.log`。分发证明与真实服务验收保持分开。
- 同批加载计划和采集工具按准备工作单独提交：临时计划的 T0–T5 尚未在此任务中验收；采集工具仅完成 9 次首开、4 次导航、2 次重复访问的冒烟检查，没有性能改善结论。快照脚本验证显式排除凭据/产物、记录已删除文件，并保留完整 diff。
- 提交范围包含 CRM 实现、双语文章与配对证据、CommandPalette 展示接口、清单/Registry/翻译整理、生成索引和上述复核修复；仓库默认暂存区中的并行工作保持原状。
