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

下一阶段为 S2：ButtonGroup、InputGroup、Toggle、ToggleGroup、InputOTP。S2–S9 尚未实施，原对照清单的其他缺口未计为完成。

本阶段证据覆盖本地组件、自动化可访问性、生产静态页面和独立安装；人工读屏、真实设置保存和业务服务验收由后续接入方另行完成。
