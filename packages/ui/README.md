# @easyuse-ui/ui

共享组件单一源码包。按 `@easyuse-ui/ui/components/ui/button`、`@easyuse-ui/ui/components/blocks/agent-workbench/conversation`、`@easyuse-ui/ui/lib/runtime-status` 等子路径导入，不提供一次性加载全部重型组件的根入口。React/React DOM 为 peer；业务服务、持久化、审批和回执由消费方负责。内部导入使用包内相对路径，不消费应用的 `@/`。

唯一 token 来源：`styles/theme.css`（仓库位置 `packages/ui/styles/theme.css`）。CSS Modules 与 theme CSS 是 side effects，消费方 Tailwind 明确扫描本包组件源码。Next/React/Tailwind 等版本沿用仓库 lockfile；CodeMirror、React Flow、Recharts、SVG 引擎为对应模块依赖，安装范围与页面下载范围不同。

Registry 仍以原 components/lib/styles 消费路径分发；脚本从本包读取 canonical 源码，安装产物无 workspace 包引用。根旧路径是未迁移主站/其他应用的兼容链接，不是第二份源码；apps/docs 全量迁移后清除，见独立应用计划。原来源、许可和适配保留在组件文档/技术记录中。
