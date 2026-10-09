# shadcn 组件对照与补齐执行清单

日期：2026-10-09。状态：S0、S1 已完成；下一阶段 S2，S2–S9 待执行。

配套记录：[实施记录](./shadcn-component-completion-log.md)。遵循 [设计规则](../Design-rules.md)、[组件契约](../Component-Specification.md)、[国际化](../I18N.md) 和 [既有通用组件计划](./common-components-completion-plan.md)。

## 目标与基线

参考本机 `/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/UI-package/shadcn-ui`，Git `6ea0900`。参考范围为 `apps/v4/registry/new-york-v4/ui` 与 `apps/v4/registry/bases/{base,radix,aria}/ui`，按组件名去重，共 63 项。EasyuseUI 起始提交为 `804756e`，实际核对含当前工作区已有实现。

17 项已有同名且职责对应实现：Avatar、Badge、Button、Checkbox、Combobox、Dialog、DropdownMenu、Field、Input、Item、Kbd、Popover、Select、Sheet、Slider、Table、Tabs。保留并复用。

4 项已有相关实现：Command → CommandPalette；Drawer → Sheet；Message → ChatMessage；MessageScroller → Conversation/useFollowTail。相关能力不等于 shadcn API 兼容；额外接口在 S8 复核。

19 项部分或内置能力：Alert、Attachment、Calendar、Chart、Collapsible、Empty、Form、Label、NativeSelect、Progress、RadioGroup、Resizable、ScrollArea、Separator、Sidebar、Skeleton、Spinner、Textarea、Tooltip。

23 项缺少对应通用组件：Accordion、AlertDialog、AspectRatio、Breadcrumb、Bubble、ButtonGroup、Card、Carousel、ContextMenu、Direction、HoverCard、InputGroup、InputOTP、Marker、Menubar、NavigationMenu、Pagination、Questionnaire、Sonner、Switch、Toast、Toggle、ToggleGroup。

DatePicker 是参考文档中的组合示例，单独纳入 S5；DataTable 已有。97 个 registry:block 页面/图表模板不作为 97 项基础组件缺口。

## 顺序与阶段出口

按 S0 → S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 推进。每阶段完成代码、示例、分发和对应验证后再标记完成；记录中分别列明实现、验证、限制和后续工作。

| 阶段            | 优先级 | 状态   | 工作 / 下一动作                                                                      | 验收条件与证据                                                                                                                         |
| --------------- | ------ | ------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| S0              | P0     | 已完成 | 冻结上述 63 项、分层责任与执行顺序，保存共享工作区基线                               | 本清单与配套记录存在；保留并行 CRM/站点改动                                                                                            |
| S1 基础表单     | P0     | 已完成 | 依次补 Textarea、Label、NativeSelect、Switch、RadioGroup                             | 每项独立示例、Manifest、Registry；受控/非受控、表单值、禁用、标签/错误、键盘、触摸与切语言保留草稿；独立安装验证                       |
| S2 控件组合     | P1     | 待执行 | ButtonGroup、InputGroup、Toggle、ToggleGroup、InputOTP                               | 单选/多选语义明确；组合目标无嵌套按钮；OTP 粘贴、删除、焦点及表单提交；业务值由调用方持有                                              |
| S3 折叠与浮层   | P0     | 待执行 | Separator、Collapsible、Accordion、通用 Tooltip、AlertDialog、HoverCard、ContextMenu | 展开与选择分轴；键盘、焦点恢复、触摸替代、ThemeBoundary Portal；确认只调用显式能力，不以 resolve 推断业务完成                          |
| S4 数据反馈     | P0     | 待执行 | Skeleton、Spinner、Empty、Alert、Progress；Toast/Sonner 统一通知体系                 | 优先提取 DataRegion/TaskPanel 现有能力；meter 与 progress 分开；减少动效、未知进度；通知不充当操作权威；决定统一导出及 Sonner 适配范围 |
| S5 日期与导航   | P0     | 待执行 | DateCalendar、DatePicker、Pagination、Breadcrumb、Menubar、NavigationMenu、Direction | 日期单选/范围、禁用日期、月导航与时区边界；保留既有事项 Calendar；分页请求受控，不虚构总数；RTL/键盘导航                               |
| S6 对话扩展     | P1     | 待执行 | Attachment、Marker、Questionnaire；评估 Bubble 的独立示例场景                        | 附件状态与上传能力分责；问卷单选/多选/文本/跳过/回退/提交；聊天消息沿现有同轴契约；不执行上传或外部服务                                |
| S7 内容与图表   | P2     | 待执行 | Card、AspectRatio、Carousel、Chart                                                   | Card 只用于独立内容；轮播键盘/触摸/减少动效；图表文本替代、空/缺失/负值；评估依赖及安装体积                                            |
| S8 现有模式整合 | P1     | 待执行 | Form、Sidebar、Resizable、ScrollArea；复核 Command/Drawer/Message/MessageScroller    | Form 以 Field 为基础，业务验证/提交由调用方负责；抽取可复用布局能力；保留原生滚动决策；滑动抽屉、内嵌命令、任意消息定位按实际缺口扩展  |
| S9 收口         | P1     | 待执行 | 刷新对照表、词典、技能映射与安装说明，完成整体回归                                   | 63 项逐项有实现或明确复用/不新增依据；不存在虚假 available；工程、浏览器与独立安装证据可追溯                                           |

## S1 固定接口与检查项

- [x] Textarea：原生 textarea props/ref、value/defaultValue、name/form、disabled/readOnly/required、aria-invalid；32px 基线以上的多行高度、用户可调整尺寸、错误保留草稿。
- [x] Label：原生 label props/ref，htmlFor 关联，不替代 Field 对说明和错误的关联。
- [x] NativeSelect：原生 select、option、optgroup，支持 name/form/required/disabled/value/defaultValue；标签与协议值分离，保留原生键盘与移动端选择器。
- [x] Switch：沿用已安装 Base UI 1.8 Root API，checked/defaultChecked/onCheckedChange、name/form/value/uncheckedValue、disabled/readOnly/required；32px/44px 操作目标，状态与焦点独立。
- [x] RadioGroup/RadioGroupItem：沿用 Base UI Group/Radio，泛型 value/defaultValue/onValueChange、name/form、disabled/readOnly/required；组/项标签、箭头键和 roving focus；不修改现有 Segmented。
- [x] 每项提供正常、禁用和受控状态示例；组合验证错误关联、表单提交、双语言草稿不丢失。
- [x] 更新 Manifest、lazy loader、Registry、生成索引、站点双语、词典已有词条与组件契约增量。
- [x] lint、typecheck、Webpack build、check:i18n、check:manifest、相关 Playwright 与 test:install 通过，记录证据与限制。

## 实施和交付规则

1. 参考组件语义，沿用本库 React/Base UI、共享主题、Compact 密度与 4px 网格。无需同时引入 Radix/Aria/CMDK 等多套基础依赖。
2. 原语放 `components/ui/`，组合放 `components/blocks/`，演示状态放 `components/examples/`；可分发源码不依赖站点、Next 路由、账号或网络。
3. 公共源码出现内置文案时使用 portable I18nProvider 与 typed messages；示例与 Catalog 文案使用站点资源。用户草稿和协议值不翻译。
4. 不根据组件名机械复制。ScrollArea 可沿用原生滚动；Sonner 与 Toast 先统一责任；Bubble 不改变正式 ChatMessage 同轴布局；事项 Calendar 与日期选择器分别命名。
5. 共享脏工作区先保存基线，只编辑和提交任务增量；构建/生产浏览器验证在隔离快照中进行，保留 3010 的现有进程。
6. 按当前 AGENTS.md，在阶段实现和所需检查通过后使用仓库所有者身份提交任务文件并普通推送；不包含并行改动，不 force，不重写历史。历史计划中其他轮次的 no-commit 记录仅描述其原始交付。
7. 本清单不把 fixture、自动化无障碍检查或本地安装当作人工读屏、真实后端、上传、审批权威与业务验收证据。
