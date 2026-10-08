# EasyuseUI UI Skills

面向构建紧凑 Agent Workspace / Coding Runtime UI 的技能集。按问题选读，不要求每次加载全部技能。技能提供执行方法，项目原始设计文档仍是本仓库的正式契约。

## 分类与入口

| 系列                            | 技能                                                                                     | 何时使用                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 视觉词典系 `visual-dictionary/` | [easyuseui-visual-vocabulary](./visual-dictionary/easyuseui-visual-vocabulary/SKILL.md)  | 从外观、中文描述或截图识别术语，区分形状、语义、效果和实现情况 |
| 基本原则系 `ui-principles/`     | [easyuseui-foundations](./ui-principles/easyuseui-foundations/SKILL.md)                  | 确定密度、字体、间距、颜色、圆角、边框、动效与 token           |
| 基本原则系 `ui-principles/`     | [easyuseui-patterns](./ui-principles/easyuseui-patterns/SKILL.md)                        | 选择列表/树/表格、主从布局、Inspector、对话与工具记录等模式    |
| 基本原则系 `ui-principles/`     | [easyuseui-states](./ui-principles/easyuseui-states/SKILL.md)                            | 定义交互、数据、运行、消息、连接、审批及未知结果的恢复路径     |
| 组件实现系 `implementation/`    | [easyuseui-component-contracts](./implementation/easyuseui-component-contracts/SKILL.md) | 复用/扩展现有组件，或在其他技术栈实现具有同等语义的组件        |
| 验收系 `validation/`            | [easyuseui-ui-review](./validation/easyuseui-ui-review/SKILL.md)                         | 检查设计契约、键盘触摸、数据恢复、权限与执行结果的证据         |

```text
skills/
├── visual-dictionary/
│   └── easyuseui-visual-vocabulary/
├── ui-principles/
│   ├── easyuseui-foundations/
│   ├── easyuseui-patterns/
│   └── easyuseui-states/
├── implementation/
│   └── easyuseui-component-contracts/
└── validation/
    └── easyuseui-ui-review/
```

每个叶子目录都是一个技能包，包含 `SKILL.md`、`agents/openai.yaml`，需要细节时另带包内 `references/`。分类目录用于整理，不是技能包。

## 两种使用模式

| 约束             | 使用 EasyuseUI 组件（复用模式）                         | 不使用 EasyuseUI 组件（独立实现模式）                                    |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| 适用范围         | 本仓库 UI；已通过 Registry/源码安装组件的消费项目       | 只借鉴本项目的设计原则，在目标项目已有组件或原生技术上实现               |
| 组件选择         | 核对真实导出、类型、Catalog 和 Registry，优先复用       | 使用目标项目已有组件；缺少能力时再实现，不要求安装本库                   |
| 视觉约定         | 本库正式契约和共享 token；明确例外需说明                | 采用紧凑工作台原则；数值是可迁移基线，服从用户明确要求和目标项目正式规范 |
| token 与状态来源 | 本库主题和运行状态字典；消费项目按实际安装路径引用      | 在目标项目集中定义/映射；不依赖 EasyuseUI 路径、别名或枚举名称           |
| 行为与责任       | 调用方负责请求、权限、执行、持久化和结果确认            | 同样明确权威来源与副作用边界，框架与 API 自定                            |
| 工程命令         | 本库依照 `AGENTS.md`；消费项目依照自己的工具链          | 使用目标项目的检查命令，不照搬本机端口、Webpack 或 pnpm                  |
| 分发要求         | 改本库可分发组件时维护示例、Catalog、Registry及安装验证 | 维护目标项目自己的示例/文档/交付要求，无本库 Registry 义务               |

本仓库产品代码默认复用模式。外部项目没有导入/安装本库、且用户未要求采用本库时，默认独立实现模式。已有其他正式设计系统时，说明采用哪些原则与具体例外，不自动替换其主题或组件。混合页面按区域说明模式，不把独立控件冒称为本库导出。

## 使用方式

仓库内可直接要求 Agent 读取对应文件，例如：

```text
读取 skills/visual-dictionary/easyuseui-visual-vocabulary/SKILL.md，
识别“可以删除的胶囊”，核对本项目可用组件，先给出语义与组件映射。
```

```text
读取 skills/ui-principles/easyuseui-patterns/SKILL.md 和
skills/ui-principles/easyuseui-states/SKILL.md，
按独立实现模式设计 Session 工作台，使用目标项目现有组件，不安装 EasyuseUI。
```

仓库中的分类目录本身不保证被任何 Agent 自动发现；本项目通过 `AGENTS.md` 引导选读。需要在其他环境安装时，将所需**完整叶子目录**放到该环境支持的技能位置，包含包内引用与元数据；本次只创建项目内文件。安装后可使用 `$easyuseui-states` 等技能名，是否自动加载由宿主决定。

各技能包含独立实现所需的核心规则，包内链接不依赖其他技能。复用模式还需读取目标版本的组件源码/类型及正式契约；本目录中的映射是核对入口，不能代替当前 API。复制技能包不等于复制组件源码或安装依赖。

## 正式来源与维护

| 来源                                                        | 职责                                 |
| ----------------------------------------------------------- | ------------------------------------ |
| [Design-rules.md](../Design-rules.md)                       | 原则与五层构建顺序                   |
| [Component-Specification.md](../Component-Specification.md) | 具体尺寸、语义、状态、交互与验收契约 |
| [UI-VISUAL-DICTIONARY.md](../UI-VISUAL-DICTIONARY.md)       | 术语与实现标记                       |
| [UI-PATTERNS.md](../UI-PATTERNS.md)                         | 信息架构与模式选择                   |
| [UI-STATES.md](../UI-STATES.md)                             | 状态分轴、恢复与执行结果确认         |
| [STYLE-WORKBENCH.md](../STYLE-WORKBENCH.md)                 | 局部样式实验与 A/B 比较              |

`styles/theme.css` 是共享 token 来源，`lib/runtime-status.ts` 是本库运行状态字典。修改来源契约时，更新相关技能的决策规则与包内参考；实现映射需重新核对源码、`lib/catalog.ts` 和 `registry.json`。不要把实验参数、文档预览风格或本地 fixture 结果提升为产品默认和真实服务证据。
