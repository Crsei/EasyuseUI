# Sales CRM Companies 页面复刻计划

日期：2026-10-08  
状态：待实施；当前依据源码拆解，尚无浏览器像素对比结果。  
前置：[通用组件补齐计划](./common-components-completion-plan.md)。

## 1. 目标、落点与范围

在 EasyuseUI 内建设可独立访问的 `/examples/sales-crm/`，复刻参考项目 Companies 页面的信息架构、暗色外观和实际交互，用于验证新增通用组件。原项目 `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/sales-crm` 作为只读参考，不改造其工程或业务代码。

复刻范围：左侧导航、顶部标题和标签、筛选工具栏、九列表格、底部汇总区、公司详情、个人资料、新增公司、通知、命令搜索以及移动端布局。全部数据是明确标记的本地 fixture；不承诺真实 CRM API、账户体系、协作或远程保存。

采用“通用组件复用 + CRM 适配层 + 局部主题”。保持 EasyuseUI 默认契约；参考页确有的尺寸/样式差异作为此示例的局部例外登记，不推广为工作台默认值。

## 2. 参考源码与真实性边界

参考路径以下均相对 sales-crm 根目录：

| 来源 | 核实内容 | 复刻处理 |
| --- | --- | --- |
| `app/page.tsx`、`components/companies/companies.tsx` | Sidebar + Companies；详情、资料、新增和搜索由组合模块装配 | 保持相同信息结构，使用 EasyuseUI 组件重组 |
| `header/header.tsx`、`stores/companies-store.ts` | 顶部 Deals/Forecast 只改变 activeTab，未切换业务内容 | Companies 为已实现视图；其余保留位置并明确未实现，不把状态切换算业务完成 |
| `_common/sidebar/sidebar-content.tsx` | 多分组导航及试用区；部分导航与计数为静态演示 | 保留展示层次，未接入入口禁用并说明；固定计数标为示例数据 |
| `table/table-columns.ts`、`company-row.tsx` | 九列、多选、公司详情、负责人资料、胜率和趋势 | 复用 DataTable，主目标与次操作分开 |
| `toolbar/toolbar.tsx` | 负责人/阶段/活动时间筛选、排序和当前结果 CSV 导出 | 复现筛选/排序与导出范围，不静默改为仅导出选中行 |
| `detail/company-detail.tsx` | 560px 右抽屉；Save Update 仅关闭；时间范围未驱动图表数据 | 不显示虚假保存成功；无编辑时改“完成”；时间筛选配明确本地序列或禁用并说明 |
| `table/table-footer.tsx` | 行数真实计算，其余计算项为标签占位 | 保留布局；本地 pipeline 总额和平均胜率可以计算，作为明确增强记录；Add Calculation 暂不可用 |
| `new-company/new-company-dialog.tsx` | 本地添加公司、Logo 预览、选择器、数字/日期、Slider | 完成本地创建闭环与校验，说明刷新重置 |
| `header/notifications/`、`command-menu/`、`profile/` | 通知已读状态、搜索打开对象、个人信息与筛选联动 | 复现本地行为，不接外部通讯 |

Deals Board、Forecast、Contacts、邀请成员、计费等没有实际页面/服务证据的能力不扩大实现。Calendar、Kanban、视频/Rive/Lottie 也不纳入 Companies 复刻依赖。

## 3. 页面结构与组件映射

```text
SalesCrmDemo（数据与本地交互）
└─ ThemeBoundary（CRM 局部暗色主题）
   └─ WorkspaceShell（full-window，可调宽 Sidebar）
      ├─ Sidebar：Logo / NavGroup / NavItem / Count / TrialFooter
      ├─ Header：Companies / Active / Search / Notifications / Profile
      ├─ View tabs：Companies / Deals / Forecast
      ├─ FilterToolbar：Sort / Owner / Stage / Last activity / Export / New
      └─ DataTable + SummaryFooter
      浮层：CompanyDetailSheet / ProfileSheet / NewCompanyDialog
            NotificationPopover / CommandPalette / MobileFilterSheet
```

| 区域 | 复用或新增通用能力 | CRM 适配职责 |
| --- | --- | --- |
| 页面骨架 | WorkspaceShell、ResizableSidebar、Sheet | 导航结构、页标题、业务视图 |
| 主表格 | Table/DataTable、Checkbox、Avatar、Tag、Button | columns、公司数据、排序筛选、查看对象 |
| 行内统计 | SegmentBar、Sparkline | 胜率、趋势序列、数值格式 |
| 工具栏 | FilterToolbar、Select、DropdownMenu、Chip | 负责人/阶段/时间范围选项和过滤算法 |
| 详情与资料 | Sheet、Item、MetricSummary、RatingDisplay | 公司/负责人完整快照、账户统计和跳转 |
| 新增表单 | Dialog、Field、FormSection、Input、Select、Slider、ImageUpload | 草稿、验证、提交、ID生成及错误恢复 |
| 通知与搜索 | Popover、Tabs、CommandPalette、Kbd、Avatar | 通知/已读 ID、过滤、命令与对象导航 |
| 数据态 | DataRegion | 区分无公司、筛选无匹配、加载/刷新失败 |

公司阶段使用普通 Badge/Tag，Active 表示页面业务状态，不映射 Agent RuntimeStatus。ScoreCard 属于局部业务内容组合，不为每种 CRM 卡片创建公共组件。

## 4. 视觉复刻契约

### 4.1 基线采集

R0 对原项目与 EasyuseUI 同时记录源码快照、浏览器版本、字体、缩放、DPR、语言、时区、视口和 fixture。先检查参考服务进程/端口；可复用时直接采集，需要启动时按所属项目的 Webpack 配置启动受控实例，不停止未知服务。

必须采集：默认列表、选中与查看行、筛选展开、详情、个人资料、新增表单、通知、命令搜索、移动导航与移动筛选。基线保存原图及简短操作步骤，不能只比较首页。

### 4.2 已有源码尺寸线索

| 项目 | 参考值 | 处理 |
| --- | --- | --- |
| 侧栏 | 默认254px，范围200–400px | 通过通用 Shell 的实例参数覆盖，记录指针/键盘和持久化行为 |
| 表头/表行 | 38px / 42px | 作为此页面的 DataTable 局部密度；触摸确保独立目标命中 |
| 筛选按钮 | 30px | 桌面可作为局部视觉例外，通用默认仍32px，粗指针目标≥44px |
| 公司详情/新增弹窗 | 约560px | Sheet/Dialog 实例尺寸；不改默认 Inspector 的300–360px约束 |
| 表格 | 九列，max-content / 横向滚动 | 保持可读与语义，不把列压缩到不可读 |
| 颜色 | 主背景#161616、侧栏#171717、细线#232323等 | 从原主题核对后映射到局部 CSS 变量，Portal 同一作用域 |

以上是源码线索，最终以同环境渲染核对。圆角、内描边、局部阴影、图标和字体是视觉验收项；有理由的无障碍修正与参考差异单独记录。

- 共享 token 仍由 theme.css 管理；`sales-crm-theme.module.css` 只表达参考示例的私有覆盖，不写全局 :root 或 html.dark。
- 使用 ThemeBoundary 确保抽屉、菜单、Dialog 继承局部主题；宿主 docs、Canvas 与 Blog 外观不能被影响。
- 优先使用库的 Lucide 图标；若轮廓差异明显，可将参考 SVG 作为局部资产，在确认来源/许可后使用，不把 @svgr 导入约定复制进组件库。
- 参考头像/Logo/字体需记录来源与许可；不可用时明确替代，不用替代资产宣称像素级一致。Logo 上传预览不依赖动画/媒体资产框架。
- 中文为项目默认，英文用于和参考英文基线的对比；日期、货币、输入和数据 ID 分开本地化。减少动态效果不改变布局结果。

## 5. 数据与交互契约

- `SalesCrmDemo` 持有 companies、filter/sort、selectedIds、activeCompanyId、profileId、overlay、notifications 和表单草稿；组件只通过 props/callback 使用它们。无需为示例增加全局 Zustand 依赖。
- 默认内存 fixture，可重置；仅侧栏宽度等布局偏好由示例适配器持久化，使用实例专属 key 并处理坏值/存储不可用。用户输入和上传文件不擅自持久化。
- 筛选/排序共用唯一派生结果，表格、结果计数、汇总与导出采用相同范围。测试固定 TODAY/时区，避免日期变化使截图和过滤漂移。
- 多选与查看详情独立。可见行全选保留不可见选择，和通用 DataTable 契约一致；这是相对参考 toggleAll 清空全部 ID 的明确改进。
- 输入/菜单/行内按钮不冒泡为整行激活。详情和个人资料互相跳转时管理焦点，按对象 ID 读取完整快照，不拼接不同对象数据。
- 时间范围如启用，必须切换对应 fixture 序列，且显示“示例统计”；不能只改按钮文字。没有可比序列时保留入口但说明不可用。
- 新增公司验证名称、有限非负金额/数量、胜率范围、日期与Logo；失败保留草稿，防重复提交。创建成功只表示添加到本地示例，不显示云端保存。
- 新公司在当前筛选下不可见时，明确提示并提供“查看新公司/清除筛选”，不静默篡改筛选条件；导出使用当前实际可见结果。
- CSV 对逗号、引号、换行及公式前缀安全处理；Logo 数据不加入导出，下载失败保留数据并反馈。
- 通知标记已读与打开公司分别处理；关联公司不存在时说明原因，不自动打开其他对象。无未读时显示明确空态。
- Cmd/Ctrl+K 打开搜索；支持公司/负责人/分类/阶段关键词、方向键、Enter、Escape、无结果和新增动作。与文本编辑快捷键及 Canvas 命令范围隔离。
- 数据区具备五态示例与刷新保留行为。状态场景入口放演示说明/折叠面板，不占据 CRM 主操作区。

## 6. 目录与工程落点

| 路径 | 职责 |
| --- | --- |
| `app/examples/sales-crm/page.tsx` | 静态路由装配，页面 metadata |
| `components/examples/sales-crm/sales-crm-demo.tsx` | 业务状态与整体组合 |
| `components/examples/sales-crm/{sidebar,header,toolbar,table}.tsx` | 业务列、导航和动作配置 |
| `components/examples/sales-crm/{company-detail,profile,new-company,notifications,search}.tsx` | 浮层内容与业务适配 |
| `components/examples/sales-crm/{model,fixtures,selectors,export}.ts` | 类型、确定性演示数据、筛选统计与导出 |
| `components/examples/sales-crm/sales-crm-theme.module.css` | CRM 私有外观及密度覆盖 |
| `public/examples/sales-crm/` | 经确认的必要静态资产与说明 |
| `tests/sales-crm.spec.ts`、相关视觉基线 | 业务闭环、响应式、主题隔离和视觉回归 |

以上为拟新增路径，实施前复核重名。通用组件实现始终归配套 G 计划，CRM 目录不能出现第二套 Checkbox/Select/Sheet/DataTable。

扩展 SiteFrame 的全窗口路由判断，只覆盖 `/examples/sales-crm/`；普通站点保留 Header/Footer。示例提供可达的返回文档入口，放在适当说明/导航区域，不覆盖原主要操作。保留静态导出，不增加后端请求期路由。

## 7. 里程碑与依赖映射

| 阶段 | 前置 | 下一动作/交付 | 验收出口 |
| --- | --- | --- | --- |
| R0 参考冻结 | 无，可与G0同时进行 | 采集源码与浏览器基线，列出原生功能/占位/允许差异，确认资产 | 各主要状态有基线、操作步骤和来源；未采集状态明确标记 |
| R1 页面骨架 | G0；Shell/ThemeBoundary已有能力，侧栏调宽依赖G4 | 建路由、局部主题、Sidebar/Header、全窗口布局 | 主要空间结构、背景、文字、分隔接近参考；站点其他页面不受影响 |
| R2 主列表闭环 | G1/G2；FilterToolbar依赖G4 | 九列表格、排序筛选、全选/查看、统计与CSV | 各列和行内操作可用；结果/汇总/导出一致；只通过本地数据验收 |
| R3 详情与创建 | G2/G3/G4相关项、R2 | 公司详情/个人资料/通知/搜索/新增表单 | 键盘完成“搜索→详情→负责人→筛选→新增→查看/导出” |
| R4 移动与恢复 | R1–R3、G4 | 390/768/1024布局、移动导航/筛选、错误、语言与焦点 | 操作可达、表格横滚、无弹层冲突；失败保留输入，触摸和reduced-motion可用 |
| R5 对比与交付 | R0–R4、G5对应安装验证 | 视觉差异收敛、全回归、组件复用核对、Blog效果记录 | 视觉、行为、安装证据分别通过；未完成/有意差异有清单 |

R1/R2 可以使用已通过的组件逐段集成，但不能用静态占位页面宣布整页完成。R5 完成才是本轮完整复刻交付。

## 8. 验收场景

| 场景 | 必须证明 |
| --- | --- |
| 默认列表 | 九列、头像、标签溢出数量、金额/日期、胜率与微型趋势正确 |
| 选择/查看 | 单选框、多选、可见全选、mixed、当前查看行和键盘焦点互不混淆 |
| 筛选/排序 | 各条件及组合生效、重置/零结果可恢复、排序稳定、统计/导出范围一致 |
| 详情/资料 | 正确对象、560px级桌面抽屉、窄屏适配、内部滚动、关联跳转与焦点恢复 |
| 新增 | 必填/数字/日期/文件错误、草稿保留、成功加入本地列表、重复提交被阻止 |
| 通知/搜索 | 全部/未读、标记已读、目标不存在、键盘搜索和结果激活、无结果 |
| 移动 | 左导航/底部筛选/右详情可关闭，无背景误操作；双向滚动与44px触摸目标 |
| 主题/国际化 | 局部暗色不污染宿主，Portal一致；中文/英文切换不丢草稿、选择或详情 |
| 数据与能力 | loading/empty/partial/error/success、刷新保留、占位明确；无虚假服务成功 |

视觉对比在1440×1000、1920×1080、390×844采集代表性状态，另做1024px布局检查。R0 固定截图环境和允许差异；同时提供原图/复刻图/差异图、尺寸记录与人工核对。不以单一像素通过率宣称功能一致；字体抗锯齿、可访问性修正和替代资产分别解释。

执行 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm check:i18n`、`pnpm check:manifest`、相关 Playwright 测试；通用组件变更需要 `pnpm test:install`。Blog 内容变更另执行 `pnpm check:blog`。无障碍自动检查加人工键盘与触摸验证。

构建/浏览器测试前检查开发3010、测试3011及参考服务的进程归属，使用 Webpack；共享构建可能影响运行服务时采用完整源码隔离副本。不通过重启无关服务获取端口。

## 9. 展示与完成标准

在已有 Blog 中增加“使用 EasyuseUI 复刻 Sales CRM Companies”文章，记录：参考来源、组件映射、九列表格与主要浮层对比、键盘/触摸演示、原项目占位边界及明确增强项。复用现有内容 schema 和比较模块，不重建 Blog。

文章链接当前复刻页和相关组件文档；截图带 fixture、视口、语言、主题和源码快照。没有实测性能数据不填写收益，图片证据不代表后端接入。视觉/交互仍有缺口时保持 implementing/measuring，验证范围明确后才标 verified。

完成意味着：通用组件来自 G 计划、主流程和移动流程可操作、参考对比有证据、保留/修正差异已说明、独立安装及既有页面回归通过。真实 CRM 服务、未实现导航页和公开部署属于后续范围。
