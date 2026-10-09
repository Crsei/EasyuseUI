# 2026-10-09 组件差距改进实施记录

对应 [原始审查 G01–G10](../docs/research/easyuseui-gap-audit-2026-10-09.md)。原审查的 08:40/08:51 快照与测量保留，不以实施结果覆盖历史证据。实施采用正式基线 `3b2dfead4a0073eb8e2c8c39ce9fc0c2a2b87ca9`，其中已包含完整工作流分析组件、场景与 S2–S9 基础组件补齐；Agent workbench、CRM 等并行未提交工作不纳入本次正式验证范围。

| ID | 已实现内容 | 验收入口 |
| --- | --- | --- |
| G01 | Dialog 视口高度上限、滚动正文、可选 Header/Body/Footer，CommandPalette 可收缩列表 | short viewport / coarse pointer 浏览器场景 |
| G02 | OverlayLayer 共享视觉深度；Dialog/Sheet/Popover/Menu/Select/Combobox/Tooltip/AlertDialog/Workspace 浮层复用 | 嵌套命中、主题、Escape、焦点返回 |
| G03 | README 指向 Manifest；词典同步检查；可用性映射生成；故意失配测试 | check:ui-contracts / ui-contract-model |
| G04 | Inspector 契约统一300–360，ARIA 与实际像素一致 | inspector dimensions 浏览器场景；保留既有受控布局测试 |
| G05 | Dialog/AlertDialog 使用 panel token，reduced-motion 关闭过渡；其他浮层静态策略写入契约 | panel token / rapid lifecycle 场景 |
| G06 | Base UI Toolbar 与 CommandToolbar；优先级溢出、异步防重复、焦点交接；Canvas 撤销/重做复用 | Toolbar / overflow 场景及既有 Canvas 回归 |
| G07 | 已有 Resizable 收口容器限制与 secondMin；Shell 三类分隔条统一 Handle | nested resize、取消、RTL、折叠恢复；独立安装 |
| G08 | 受控列配置及键盘入口、独立 cell 激活、完整查询身份、迟到丢弃、未知总数及刷新保留 | table 场景、query session 模型、独立安装 |
| G09 | Manifest 变体编译与场景索引，系统强制颜色焦点/选择/错误/标签、axe | ui-contract-evidence / forced-colors 场景 |
| G10 | 轻量 Chart 与正式分析侧分层；0与四类缺失原因分开、断线与可见表格 | chart 场景、既有 analytics 回归、独立安装 |

交互入口：[组件边界示例](../app/examples/component-contracts/page.tsx)，站点路径 `/examples/component-contracts/`。可移植 API 与策略见 [组件契约](../docs/component-contracts.md)。本地查询/调用计数不表示真实服务、执行、存储或业务验收。

## 验证

正式基线加本次改进在隔离副本中完成以下检查，构建与浏览器使用3011端口，活动3010服务未重启。未降低既有页面或性能预算。

| 验证 | 结果 |
| --- | --- |
| lint / typecheck / Webpack build | 通过；本机使用既定 WASM SWC 回退 |
| i18n / Manifest / blog / docs / UI contracts | 全部通过；175 个源码/示例/Registry 映射，73 段文档示例编译 |
| 全量非性能 Playwright | 492通过，0失败（4 workers） |
| Toolbar 故障场景重复验证 | 20/20通过；保持扩大容器后立即 Escape 的触发方式 |
| 性能相关套件 | 6通过（共享主机观测模式）；额外 CI 阈值探查有未达项，不能认定性能验收通过 |
| 原始 Dialog/CommandPalette 探查复跑 | 六个视口组合均在视口内，Escape 与焦点返回6/6；原始证据保留 |
| 独立消费项目安装、生产构建与浏览器 | 通过；Registry 按构建地址冻结，校验依赖只指向本次快照；含 typed payload |
| host / scoped 安装与主题隔离 | 通过；宿主像素不变，Portal/Canvas/图表私有颜色、焦点与语言通过 |
| 强制颜色与 axe | 关键组合通过；截图独立保存，自动检查0违反项 |

首次完整回归为491通过、1失败，发现 Toolbar 扩大容器后立即关闭菜单的焦点时序问题。改为关闭时同步测量容器后，20次重复与最终492项回归通过，保留首次失败记录。独立安装验证另修正了构建地址与测试进程配置不一致时依赖回到站点端口的问题；最终检查使用构建 Registry 的地址和冻结依赖，不依赖活动开发服务器。

额外在共享主机强制执行临时 CI 目标时，200节点冷启动和5000条消息追加未达标；425个源码文件逐一核对一致的正式基线也单独复测。原始门槛与失败记录保留，不能将观测模式通过写成独立 CI 性能验收通过；稳定 CI 校准仍待执行。

有界结果、源码摘要和性能测量见 [验证数据](../docs/research/evidence/gap-implementation-validation.json)，[修复后原始探查](../docs/research/evidence/dialog-viewport-after-gaps.json)，[强制颜色截图](../docs/research/evidence/component-contracts-forced-colors.png)。共享工作区的 Agent workbench、CRM 和其登记/翻译改动保留；它们不因本次隔离检查被认定完成或通过真实服务验收。

## 人工证据边界

人工读屏尚未执行：当前环境提供 headless Chromium 与 axe，没有人工读屏会话。变体代码编译、浏览器操作、axe 和截图分别记录，均不替代人工读屏。该持续验收项保留在索引中，不声称 G09 的人工验收已完成。
