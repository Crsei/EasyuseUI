# shadcn 组件补齐实施记录

日期：2026-10-09。配套：[执行清单](./shadcn-component-completion-plan.md)。

## S0 清单冻结

- 已按参考源码去重记录 63 项：17 同名对应、4 相关实现、19 部分/内置能力、23 通用缺口；另列 DatePicker 组合。
- 已复核本库源码、Manifest、Registry、已安装 Base UI 1.8 与 Next.js 客户端边界指南。
- 开始时 main 基线 `804756e`，工作区有并行 CRM、站点、脚本改动，无暂存改动；执行中出现的首页规划也保留。
- 保留 3010 现有开发服务，工程构建与生产浏览器验证使用隔离副本。

## S1 基础表单

状态：实现、工程检查、浏览器验证与独立安装通过。五项已接入示例、双语文案、Manifest、Registry 和组件目录。

| 项目                                               | 实现                                                           | 验证与边界                                                             |
| -------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [Textarea](../components/ui/textarea.tsx)          | 原生多行输入、ref、受控/非受控、可调整高度、表单属性           | 错误保留草稿，语言切换保留同一 DOM，提交原始文本，禁用状态             |
| [Label](../components/ui/label.tsx)                | 原生 htmlFor/ref 标签                                          | 标签点击将焦点交给关联输入；完整错误关联继续使用 Field                 |
| [NativeSelect](../components/ui/native-select.tsx) | select/option/optgroup、multiple/size、原生表单与移动端选择器  | 双语显示标签与协议值分离、分组/禁用、多选提交、44px触摸目标            |
| [Switch](../components/ui/switch.tsx)              | Base UI 受控/非受控、name/form/value/uncheckedValue、只读/禁用 | Space、表单值、只读/禁用、焦点与选中、深色主题和减少动效、44px触摸目标 |
| [RadioGroup](../components/ui/radio-group.tsx)     | 泛型 Group/Item、受控/非受控、原生表单接口                     | 箭头键跳过禁用项、值与语言分离、表单提交、44px触摸目标；Segmented 保留 |

示例集中在 [form-primitives-demo.tsx](../components/examples/form-primitives-demo.tsx)，文档入口为 `/docs/textarea/`、`/docs/label/`、`/docs/native-select/`、`/docs/switch/`、`/docs/radio-group/`。公共源码没有内置站点文案；示例与 Catalog 增加34个双语站点资源键。词典已有 Textarea/RadioGroup/Switch 词条指向真实组件，Label/NativeSelect 由 Catalog 生成词条。

补充 [组件契约](../Component-Specification.md) 和 [技能组件映射](../skills/implementation/easyuseui-component-contracts/references/component-map.md)，修正旧映射把已存在的 Tabs、Select 等列为缺失的说明。

## 验证结果

交付候选由 `804756e` 加本次22个文件的任务增量组成，排除并行 CRM/站点改动。另一个含完整工作区的隔离副本也通过工程检查和独立安装。最终结果以交付候选的检查为准。

| 检查                  | 结果                                                                             | 证据                                                     |
| --------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `pnpm lint`           | 通过                                                                             | `delivery-lint.log`                                      |
| `pnpm typecheck`      | 通过                                                                             | `delivery-typecheck.log`                                 |
| `pnpm build`          | 通过，Webpack/WASM，142个静态页面                                                | `delivery-build.log`                                     |
| `pnpm check:i18n`     | 通过                                                                             | `delivery-i18n.log`                                      |
| `pnpm check:manifest` | 通过，104个目录条目、117个Registry条目                                           | `delivery-manifest.log`、构建输出                        |
| 指定范围 Playwright   | **75通过、0失败**                                                                | `delivery-browser.log`                                   |
| `pnpm test:install`   | CLI安装、依赖、消费者TypeScript/生产构建/浏览器交互通过                          | `install.log`，消费者 `/tmp/easyuse-ui-consumer-XY0jb5/` |
| 分发字节核对          | 五项与theme/utils在canonical/host/scoped下的21个Registry载荷与已安装快照完全一致 | 本轮逐字节对照                                           |

本机完整日志目录：`/tmp/easyuseui-shadcn-phase1-w7faknu9/`。构建使用本机 GLIBC 2.28 兼容的 WASM SWC；原生SWC兼容提示没有阻止构建。

最终浏览器命令：

```sh
pnpm exec playwright test tests/form-primitives.spec.ts tests/common-components.spec.ts tests/common-distribution.spec.ts tests/primitives.spec.ts tests/i18n.spec.ts tests/components.spec.ts tests/dictionary.spec.ts tests/theme-namespace.spec.ts
```

75项包括8项新增表单交互、22项独立分发闭包和45项既有组件/国际化/词典/主题回归。独立消费项目新增 [安装适配器](../scripts/form-primitives-consumer.mjs)，验证多选表单值、Textarea ref、只读/禁用开关、单选键盘及语言切换草稿保留；没有引入站点或Next路由依赖。

首次浏览器轮次有一项测试错误地要求减少动效时duration严格为0；项目全局规则会将duration设为0.01ms。已改为验证实际 `transition-property: none`，最终提交候选75项全部通过。另一次参数误触发的全量运行已中止，保存在 `browser-unfiltered-interrupted.log`，不计入最终通过数量。

## 交付与后续

提交范围限定本轮22个文件及共享文件内的任务增量，保留已有CRM、站点、首页规划和暂存工作。使用已核实的仓库所有者 `Crsei <256245632+Crsei@users.noreply.github.com>`；提交及远端SHA以本阶段交付回复和本文件Git历史为准。

S1 交付时，下一阶段为 S2：ButtonGroup、InputGroup、Toggle、ToggleGroup、InputOTP；当时其余缺口尚未实施。后续完成情况见下方 S2–S9 记录。

本阶段证据覆盖本地组件、自动化可访问性、生产静态页面和独立安装；人工读屏、真实设置保存和业务服务验收由后续接入方另行完成。

## S2–S9 剩余阶段

状态：S2–S9 全部完成。40个新增入口、63项职责覆盖、工程检查、完整浏览器回归与独立安装验证通过。

| 阶段 | 本次交付                                                                             | 实现与边界                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S2   | ButtonGroup、InputGroup、Toggle、ToggleGroup、InputOTP                               | 复用原生输入和 Base UI；OTP 使用一个原生文本框保留粘贴、删除、自动填充与表单语义；多选值保持数组。                                                                             |
| S3   | Separator、Collapsible、Accordion、Tooltip、AlertDialog、HoverCard、ContextMenu      | 主题浮层复用 ThemeBoundary Portal；危险确认保留显式调用与待确认结果；ContextMenu 有可见菜单替代。                                                                              |
| S4   | Skeleton、Spinner、Empty、Alert、Progress、Toast、Sonner                             | DataRegion 提取并复用反馈原语；Meter 与 Progress 分开；Sonner 入口使用同一 Toast Provider，不承诺第三方 Sonner API 兼容。                                                      |
| S5   | DateCalendar、DatePicker、Pagination、Breadcrumb、Menubar、NavigationMenu、Direction | ISO 日期键使用 UTC 日历运算；单选/范围、禁用日期、月导航、键盘与时区一致；未知总数只依赖 hasNext；既有事项 Calendar 保留。                                                     |
| S6   | Attachment、Marker、Questionnaire、Bubble                                            | 附件只呈现调用方状态；unknown 禁止移除；问卷答案受控、支持多种题型和回退/跳过；Bubble 用于独立引用，ChatMessage 同轴布局保持。                                                 |
| S7   | Card、AspectRatio、Carousel、Chart                                                   | Card 用于独立内容；手动轮播支持键盘/触摸，隐藏项保留草稿；SVG 柱图/折线图有文本表，处理负值、缺失、极值与最多120项，无新增图表依赖。                                           |
| S8   | Form、Sidebar、Resizable、ScrollArea、Command、Drawer；Conversation 定位接口         | Form 复用 Field；Sidebar 保留当前链接及标签；WorkspaceShell 复用 ResizableHandle；原生滚动；Command 支持内嵌；Drawer 可由显式手柄滑动关闭；Conversation 只定位已经加载的消息。 |
| S9   | 63项最终对照、词典、技能映射、安装说明、工程与分发回归                               | [逐项对照](./shadcn-component-coverage.md)记录实际源码、导出、Registry 与语义边界；不存在以词汇表代替真实导出的 available 声明。                                               |

七个示例文件覆盖40个新增文档入口；公共组件内置文字新增36个 typed 双语消息键。分发清单、lazy loader 与生成目录同步更新。组件契约与安装说明说明了命名、依赖和调用方责任。

### 验证方式与修复记录

- 交付快照从 `db8c991` 构建，纳入后续 `1853b42` 文档提交及 `8912c55` 首页与文档重构、`3d83edc` 分析组件；任务增量单独审查，共享工作区中 CRM、站点、首页及 analytics 并行改动保留。
- 生产回归依次使用隔离端口3013/3014/3015，避免占用其他会话的3011；现有3010开发进程保持运行。
- 修复 DateCalendar 模型与 UI 文件同名导致 CLI import 重写错误：模型命名为 `date-calendar-model.ts`。
- 修复公元1年首月网格偏移，保留9999年末月边界；范围检查没有隐含百年限制，禁用日期仍逐日检查。
- 明确 Tooltip 的 tooltip 角色；通知关闭按钮提供可访问入口；指针调整尺寸和抽屉手柄只接受当前手势。
- 组件和示例验证是本地 UI、无障碍自动检查及独立消费者证据；服务执行、文件上传、持久化、人工读屏和业务验收仍由调用方负责。


### S2–S9 最终验证

| 检查 | 结果 | 本机证据 |
| --- | --- | --- |
| `pnpm lint` | 通过 | `checks/latest-lint-r2.log` |
| `pnpm typecheck` | 通过 | `checks/latest-typecheck-r2.log` |
| `pnpm build` | 通过，Webpack/WASM，202个静态页面 | `checks/latest-build.log` |
| `pnpm check:i18n` | 通过，1243 portable + 2168 site messages | `checks/latest-i18n.log` |
| `pnpm check:manifest` | 通过，157个目录条目；170个Registry条目 | `checks/latest-manifest.log`、`checks/latest-build.log` |
| 文档构建与用例 | 通过，157组件、5份指南、271个延迟源码资源、1133个搜索条目；45个文档片段编译通过 | `checks/latest-docs.log` |
| 完整 Playwright | **453通过、0失败** | `checks/browser-latest-r2.log` |
| 加载预算、旧聊天与标题补充回归 | **12通过、0失败**；包含最新站点增加的首页与介绍页预算，原预算阈值保持 | `checks/budget-latest.log` |
| `pnpm test:install` | 40个新增条目CLI安装、消费者TypeScript/生产构建/浏览器交互通过；分析图表、既有组件、Agent、Work Items与Canvas消费回归通过 | `checks/install-latest-r2.log` |
| 分发字节核对 | 511个canonical/host/scoped载荷与最终独立安装快照完全一致 | `checks/registry-payloads-latest-install.json`、`checks/payload-compare-latest.json` |

本轮完整日志目录：`/data2-HDD-SATA-20T/Digital_avatar/haoweiyao/.tmp/easyuseui-shadcn-rest-jciktbee/`。最终消费者路径由 `checks/install-latest-r2.log` 首行记录。GLIBC 2.28 使用 Webpack 与 WASM SWC 兼容路径，原生SWC提示没有阻止构建。

完整浏览器命令在交付隔离目录执行；临时配置只将生产预览端口改为3015、产物输出移至日志目录：

```sh
pnpm exec playwright test --config playwright.shadcn-latest.config.ts
```

覆盖新40个文档入口的自动无障碍扫描，以及OTP原生粘贴、浮层焦点/主题、通知、日历边界和跨时区日期、问卷、缺失/负值图表、手势/RTL/键盘布局、消息定位和既有模式回归。自动检查不等同人工读屏或真实服务验收。

首轮完整回归有4项加载预算和2项旧聊天计数失败（`checks/browser.log`）：文档页按用途生成轻量索引、共享懒加载工厂，组件标题由路由metadata持有；消息定位示例改为显式展开后再加载。修复后原预算及全部385项通过；格式整理后的最终源码另补跑独立安装与10项补充回归。第二轮有1项手势测试在Sheet入场动画结束前取坐标（`checks/browser-r5.log`），已改用Playwright等待手柄稳定后再进行原生鼠标拖动；最终全量再跑385项通过。初次安装的模型重写问题和失败轮次均保留，不计入通过证据。

最终3d83edc快照首轮452通过、1项导航断言失败：测试仍硬编码三个示例，而分析组件任务新增第四个入口。将断言改为逐项核对 `exampleManifest` 的数量和链接；同一导航用例连续三次通过后，再完整重跑453项（`checks/gallery-latest-r2.log`、`checks/browser-latest-r2.log`）。

最终整合期间，上游新增 `8912c55` 首页和组件文档重构：保留新的文档分组、源码浏览、搜索与标题归属，重新生成40个新增入口的相关资源；在该提交之上重新执行工程检查与430项完整浏览器回归，全部通过；随后保留 `3d83edc` 分析组件提交并重新合并消息、目录和Registry，最终453项全量回归与包含新旧组件的独立安装全部通过。整合首轮427通过、3项首屏预算超限（`checks/browser-integrated.log`）。将站点消息键和值分别生成紧凑列，再同步恢复原有字典，压缩重复的协议键；保留全部双语文字与类型、同步语言切换、编辑器和页面状态。修复后仍使用原预算阈值，最终430项全部通过。早期472个载荷与当时安装快照一致；纳入分析组件后重新进行独立安装，最终511个载荷单独记录并核对。

交付按审查后的任务路径提交，并删除7个过期的内容寻址文档资源；共享文件只提交本任务增量。保留并行CRM、站点、首页、analytics工作与3010服务。按当前授权使用仓库所有者身份提交及普通推送；提交和远端SHA以交付回复与本文件Git历史为准。S0–S9 无剩余实施项；真实执行、上传和持久化仍是消费方服务责任。
