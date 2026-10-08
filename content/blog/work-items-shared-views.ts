import type { BlogPost } from "../../lib/blog-model"
export const workItemsSharedViews: BlogPost = {
  slug: "work-items-shared-views",
  title: {
    "zh-CN": "Work Items 的 List、Board 与 Table 如何共享组件",
    en: "How Work Items List, Board and Table share components",
  },
  summary: {
    "zh-CN":
      "用同一份受控快照组合列表、看板和表格；共享字段、选择与详情，并保留拒绝、未知结果和分页的真实边界。",
    en: "Compose List, Board and Table from one controlled snapshot, sharing properties, selection and details while preserving rejection, unknown outcomes and pagination boundaries.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["Work Items", "List", "Board", "Table"],
  optimizationIds: [
    "W0",
    "W1",
    "W2",
    "W3",
    "W4",
    "S0",
    "S1",
    "S2",
    "S3",
    "S4",
    "W5",
    "S5",
  ],
  relatedComponents: [
    "grouped-list",
    "work-items-board-base",
    "work-item-properties",
    "work-item-row",
    "work-item-card",
    "work-item-list",
    "work-item-board",
    "work-item-table",
    "work-items-toolbar",
    "work-item-detail",
    "work-items-workspace",
    "work-items-batch-actions",
    "work-items-saved-views",
  ],
  relatedPosts: ["common-components-from-crm"],
  baselineVersion:
    "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
  resultVersion: null,
  sourceSnapshotId:
    "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
  body: [
    {
      type: "heading",
      id: "shared-snapshot",
      text: {
        "zh-CN": "同一份数据，三种布局",
        en: "One snapshot, three layouts",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "入口 /workspace/work-items/ 提供 List、Board、Table。24 条确定性工作项、5 个可配置状态、4 个优先级和固定项目日期由示例适配器持有；公共组件只接收记录、分组、能力和操作回调。切换布局保留选择、当前对象和字段结果，不重建三份业务数据。",
        en: "The /workspace/work-items/ route offers List, Board and Table. A local adapter owns 24 deterministic work items, five configurable workflow states, four priorities and a fixed project date. Public components receive records, groups, capabilities and callbacks. Switching layouts preserves selection, the active object and field results without creating three business stores.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/list-1440-light-zh-CN.png",
        alt: {
          "zh-CN": "List：紧凑分组行与共享属性，浅色中文，24 项本地 fixture。",
          en: "List: compact grouped rows and shared properties, light Chinese, 24 local fixture items.",
        },
        caption: {
          "zh-CN": "List：紧凑分组行与共享属性，浅色中文，24 项本地 fixture。",
          en: "List: compact grouped rows and shared properties, light Chinese, 24 local fixture items.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "24 deterministic local work items",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/board-1440-dark-en.png",
        alt: {
          "zh-CN": "Board：同一份工作项的列与卡片，深色英文。",
          en: "Board: columns and cards from the same work items, dark English.",
        },
        caption: {
          "zh-CN": "Board：同一份工作项的列与卡片，深色英文。",
          en: "Board: columns and cards from the same work items, dark English.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "24 deterministic local work items",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/table-1024-light-zh-CN.png",
        alt: {
          "zh-CN": "Table：复用 DataTable，查看与勾选是独立目标。",
          en: "Table: reuses DataTable and separates activation from selection.",
        },
        caption: {
          "zh-CN": "Table：复用 DataTable，查看与勾选是独立目标。",
          en: "Table: reuses DataTable and separates activation from selection.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "24 deterministic local work items",
        viewport: {
          width: 1024,
          height: 768,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "shared-properties",
      text: {
        "zh-CN": "共享字段与详情",
        en: "Shared properties and details",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "WorkItemProperties 统一 Row/Card/Table/Detail 的字段：状态与优先级单选，负责人和标签多选，日期保留 YYYY-MM-DD 字符串。可编辑字段复用现有 Select/Combobox/Input；只读和溢出展示不猜测后台能力。字段保存失败保留草稿与关联错误，其他字段的成功回执不会清掉失败草稿。语言切换保留调用方文字和输入。",
        en: "WorkItemProperties unifies fields across Row, Card, Table and Detail: single state and priority, multiple assignees and labels, and YYYY-MM-DD dates. Editable fields reuse Select, Combobox and Input. Read-only and overflow presentations do not invent backend capabilities. A rejected field retains its draft and associated error even when another field saves. Locale changes preserve caller text and input.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/detail-1440-light-zh-CN.png",
        alt: {
          "zh-CN": "详情使用同一对象快照；宽屏 Inspector，窄屏抽屉。",
          en: "Details receive the same object snapshot, using an Inspector on wide screens and a drawer on narrow screens.",
        },
        caption: {
          "zh-CN": "详情使用同一对象快照；宽屏 Inspector，窄屏抽屉。",
          en: "Details receive the same object snapshot, using an Inspector on wide screens and a drawer on narrow screens.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "24 deterministic local work items",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "demo",
      componentSlug: "work-item-properties",
    },
    {
      type: "heading",
      id: "move-and-reconcile",
      text: {
        "zh-CN": "移动提交意图，未知结果先查询",
        en: "Moves request changes; unknown outcomes require reconciliation",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "通用 work-items-board-base 不依赖 WorkItem 模型，另有独立 Ideas 示例；按本轮文件边界与 Agent Board 独立，后续再统一。独立 Pointer Events 把手和“移动到/上移/下移”发出相同命令，附带 queryKey、来源/目标组、已加载邻居与可选 revision。适配层校验权限、版本和分页边界；自动排序时禁止列内自由重排。明确拒绝保留权威位置；unknown 锁定该项，关闭详情、切布局和切语言都不解锁，查询明确结果后才继续。",
        en: "The generic work-items-board-base has no WorkItem dependency and also demonstrates independent Ideas. A Pointer Events handle and Move to/Up/Down controls issue the same intent with queryKey, source and destination groups, loaded neighbors and an optional revision. The adapter validates permission, revision and pagination boundaries. Automatic sorting disables manual reordering. Rejections preserve authoritative placement. Unknown outcomes lock the item across panel, layout and locale changes until the receipt is reconciled.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/board-unknown-1440-light-zh-CN.png",
        alt: {
          "zh-CN":
            "移动结果未知：原列保留工作项并显示查询入口，未假装已经保存。",
          en: "Unknown move outcome: the original column retains the item and offers reconciliation without claiming a saved result.",
        },
        caption: {
          "zh-CN":
            "移动结果未知：原列保留工作项并显示查询入口，未假装已经保存。",
          en: "Unknown move outcome: the original column retains the item and offers reconciliation without claiming a saved result.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "local unknown move fixture",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "mobile-and-navigation",
      text: {
        "zh-CN": "窄屏、URL 与数据恢复",
        en: "Narrow screens, URLs and data recovery",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "URL 白名单保存布局、分组、排序、搜索、过滤、字段显隐及稳定 item ID；设置使用 replace，详情导航使用 push。只读、空数据、无匹配、部分加载、刷新失败、拒绝、unknown 和模拟 Agent 通过收起的场景面板切换。读取失败保留旧内容；选择、焦点、业务状态与运行态分别建模。",
        en: "An explicit URL whitelist stores layout, grouping, sorting, search, filters, visible fields and stable item IDs. Settings use replace; detail navigation uses push. A collapsed scenario panel provides read-only, empty, no-match, partial, refresh failure, rejection, unknown and simulated Agent fixtures. Failed reads preserve existing content. Selection, focus, business state and runtime state remain separate.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items/board-390-dark-en.png",
        alt: {
          "zh-CN":
            "390×844：紧凑导航、横向看板和触屏移动替代；截图为深色英文。",
          en: "390×844: compact navigation, horizontal board and touch movement alternative, shown in dark English.",
        },
        caption: {
          "zh-CN":
            "390×844：紧凑导航、横向看板和触屏移动替代；截图为深色英文。",
          en: "390×844: compact navigation, horizontal board and touch movement alternative, shown in dark English.",
        },
        sourceSnapshotId:
          "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
        capturedAt: "2026-10-08T11:24:23.196Z",
        fixture: "24 deterministic local work items",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "heading",
      id: "distribution",
      text: {
        "zh-CN": "按实际安装项分发",
        en: "Distribute actual installation units",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "11 个文档项对应 11 个 Registry 安装项（含共用底层），Row/Card 共享 work-item，三视图共享 work-items-views，辅助字段随 work-item-properties 分发。文档安装指令采用真实 registryId。WorkItemsWorkspace 的依赖闭包已在独立应用经 CLI 安装、类型检查、生产构建和浏览器操作验证，不引用文档站或 Plane 服务。接口和边界见 WORK-ITEMS.md 及 plans/work-items-implementation-log.md。",
        en: "Eleven documentation entries map to eleven Registry installation units, including shared foundations. Row/Card share work-item, the views share work-items-views, and field helpers ship with work-item-properties. Documentation commands use the actual registryId. The WorkItemsWorkspace dependency closure passed CLI installation, type checking, production build and browser actions in an independent app, without documentation-site or Plane-service imports. Contracts and limits are recorded in WORK-ITEMS.md and plans/work-items-implementation-log.md.",
      },
    },
    {
      type: "code",
      language: "bash",
      code: "pnpm dlx shadcn add https://YOUR-SITE/r/work-items-workspace.json\npnpm lint\npnpm typecheck\npnpm build\npnpm check:i18n\npnpm check:manifest\npnpm check:blog\npnpm test:install",
    },
    {
      type: "heading",
      id: "measurements",
      text: {
        "zh-CN": "真实挂载基线，不声称性能改善",
        en: "Actual mounted-item baseline without an improvement claim",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "50/200/1000 项各采样一次，实际挂载数量分别为 50/200/1000，完整指标在 measurements.json。耗时从 Playwright 操作到两个动画帧，包含自动化开销和 120ms 模拟写入延迟，主机同时存在其他会话。没有优化前数值或预设达标阈值，因此 before/target 为待测，文章标为 measuring。",
        en: "The 50/200/1000-item fixtures each have one observation and actually mount 50/200/1000 items. Full results are in measurements.json. Timings span a Playwright action to two animation frames, including automation overhead and 120ms simulated write latency on a shared host. No before value or acceptance threshold exists, so before/target remain unknown and the article is marked measuring.",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "domCount-50",
          label: {
            "zh-CN": "50 项：DOM 节点",
            en: "50 items: DOM nodes",
          },
          unit: "nodes",
          direction: "lower",
          before: null,
          after: 1749,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "renderMs-50",
          label: {
            "zh-CN": "50 项：加载场景",
            en: "50 items: Load fixture",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 215,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "groupMs-50",
          label: {
            "zh-CN": "50 项：重新分组",
            en: "50 items: Regroup",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 440,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "domCount-200",
          label: {
            "zh-CN": "200 项：DOM 节点",
            en: "200 items: DOM nodes",
          },
          unit: "nodes",
          direction: "lower",
          before: null,
          after: 6402,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "renderMs-200",
          label: {
            "zh-CN": "200 项：加载场景",
            en: "200 items: Load fixture",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 1031,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "groupMs-200",
          label: {
            "zh-CN": "200 项：重新分组",
            en: "200 items: Regroup",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 1792,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "domCount-1000",
          label: {
            "zh-CN": "1000 项：DOM 节点",
            en: "1000 items: DOM nodes",
          },
          unit: "nodes",
          direction: "lower",
          before: null,
          after: 31201,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "renderMs-1000",
          label: {
            "zh-CN": "1000 项：加载场景",
            en: "1000 items: Load fixture",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 6280,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
        {
          key: "groupMs-1000",
          label: {
            "zh-CN": "1000 项：重新分组",
            en: "1000 items: Regroup",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 20414,
          target: null,
          statistic: "single observation",
          sampleCount: 1,
          evidenceId: "work-items-measurements",
          beforeContext: null,
          afterContext:
            "2026-10-08 shared host, production snapshot, Playwright action + two frames",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "1000 项字段编辑约 13.2 秒，重新分组约 20.4 秒，当前没有窗口化，交互明显迟缓。这是首版的实测限制；消费方应通过权威分页控制已加载数量，该段保留 W0–W4 的历史基线；本次 W5/S5 的独立测量见下文。",
        en: "At 1000 items, field editing took about 13.2 seconds and regrouping about 20.4 seconds. The implementation has no virtualization and is visibly slow at this size. Consumers should bound loaded records through authoritative pagination; this paragraph preserves the historical W0–W4 baseline; the independent W5/S5 measurements appear below.",
      },
    },
    {
      type: "heading",
      id: "w5-enhancements",
      text: {
        "zh-CN": "W5 / S5：泳道、子项与受控增强",
        en: "W5 / S5: swimlanes, sub-items and controlled enhancements",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "看板按第二个单值属性分泳道，移动只作用当前泳道；跨泳道需要另行定义同时修改两个字段的命令。List 按 parentId 展开已加载子项，展开与勾选分开，折叠保留隐藏选择；缺少父项或筛选只命中子项时仍可阅读。Table/Board 保持平铺，切回列表恢复展开偏好。",
        en: "Board swimlanes use a second single-value property. Moves stay within the current lane; cross-lane changes need a separately defined command for both fields. List expands loaded sub-items by parentId, independently of selection. Collapsing preserves hidden selection; children remain readable without a loaded or matching parent. Table and Board remain flat, and List restores expansion preferences.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/swimlanes-1440-zh-CN.png",
        alt: {
          "zh-CN": "按优先级分泳道、按状态分列；仍使用公共看板。",
          en: "Priority swimlanes and state columns reuse the public Board.",
        },
        caption: {
          "zh-CN": "按优先级分泳道、按状态分列；仍使用公共看板。",
          en: "Priority swimlanes and state columns reuse the public Board.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/sub-items-1440-zh-CN.png",
        alt: {
          "zh-CN": "子项展开、层级勾选与部分加载，已有子项在失败时保留。",
          en: "Sub-item expansion, independent selection and partial loading retain existing children on failure.",
        },
        caption: {
          "zh-CN": "子项展开、层级勾选与部分加载，已有子项在失败时保留。",
          en: "Sub-item expansion, independent selection and partial loading retain existing children on failure.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/batch-preview-1440-zh-CN.png",
        alt: {
          "zh-CN": "批量确认前明确可写与跳过范围，包含隐藏选择。",
          en: "Batch confirmation identifies eligible and skipped entities, including hidden selections.",
        },
        caption: {
          "zh-CN": "批量确认前明确可写与跳过范围，包含隐藏选择。",
          en: "Batch confirmation identifies eligible and skipped entities, including hidden selections.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/batch-outcomes-1440-zh-CN.png",
        alt: {
          "zh-CN": "逐项成功、拒绝、结果未知及权限不足分开呈现。",
          en: "Confirmed, rejected, unknown and denied outcomes remain separate.",
        },
        caption: {
          "zh-CN": "逐项成功、拒绝、结果未知及权限不足分开呈现。",
          en: "Confirmed, rejected, unknown and denied outcomes remain separate.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/saved-views-1440-zh-CN.png",
        alt: {
          "zh-CN": "保存视图只保存配置；此示例仅页面内存，刷新清除。",
          en: "Saved views contain configuration only; this example uses page memory and resets on refresh.",
        },
        caption: {
          "zh-CN": "保存视图只保存配置；此示例仅页面内存，刷新清除。",
          en: "Saved views contain configuration only; this example uses page memory and resets on refresh.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/work-items-enhancements/swimlanes-390-dark-en.png",
        alt: {
          "zh-CN": "390px 触屏、深色英文泳道；横向滚动留在看板区域。",
          en: "390px touch, dark English swimlanes keep horizontal scrolling inside the Board.",
        },
        caption: {
          "zh-CN": "390px 触屏、深色英文泳道；横向滚动留在看板区域。",
          en: "390px touch, dark English swimlanes keep horizontal scrolling inside the Board.",
        },
        sourceSnapshotId:
          "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
        capturedAt: "2026-10-08T15:07:00.394Z",
        fixture: "deterministic local W5/S5 fixtures; no live services",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "WorkItemsBatchActions 仅开放状态/优先级。预览和确认都依据最新能力、每项基础版本及 pending/unknown 锁；逐项回执不保证原子事务。WorkItemsSavedViews 提供另存、应用、更新/重命名、删除和未知结果对账接口。公共组件不持久化数据；示例保存视图只在页面内存中存在。",
        en: "WorkItemsBatchActions supports state and priority. Preview and confirmation use current capabilities, per-item base revisions and pending/unknown locks; per-item receipts do not imply an atomic transaction. WorkItemsSavedViews provides save-as, apply, update/rename, delete and reconciliation interfaces. Public components do not persist data; demo saved views live only in page memory.",
      },
    },
    {
      type: "demo",
      componentSlug: "work-items-batch-actions",
    },
    {
      type: "demo",
      componentSlug: "work-items-saved-views",
    },
    {
      type: "heading",
      id: "w5-measurements",
      text: {
        "zh-CN": "完整 DOM 的重复测量",
        en: "Repeated measurements with the full DOM",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "分组/层级索引、查询缓存与共享属性缓存减少重复工作。List/Board 可选择延迟屏外布局与编辑器挂载，屏外仍保留可读字段、选择和导航；进入可见区或聚焦后挂载编辑器，并保持到条目卸载。实际 DOM、全文查找和键盘顺序仍保留；Table 保持原生布局，没有窗口化。50/200/1000 项各测三轮，交替开启/关闭屏外布局延迟；两组都使用本次优化后的同一份源码，不能将这个开关对照解释为 W4→W5 的整体性能改善。",
        en: "Grouping/hierarchy indexes, query caching and shared-property memoization reduce repeated work. List and Board optionally defer offscreen layout and field editors. Offscreen rows keep readable fields, selection and navigation; editors mount on reveal or focus and stay mounted until the item unmounts. Actual DOM, text search and keyboard order remain; Table keeps native layout. There is no virtualization. Each size has three observations per mode, alternating offscreen layout on/off. Both modes use the same optimized source, so the toggle comparison does not measure the overall W4-to-W5 improvement.",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "w5-selectMs-200",
          label: {
            "zh-CN": "200 项：选择",
            en: "200 items: Selection",
          },
          unit: "ms",
          direction: "lower",
          before: 174,
          after: 245,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
        {
          key: "w5-fieldUpdateMs-200",
          label: {
            "zh-CN": "200 项：字段更新",
            en: "200 items: Field update",
          },
          unit: "ms",
          direction: "lower",
          before: 450,
          after: 417,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
        {
          key: "w5-groupMs-200",
          label: {
            "zh-CN": "200 项：重新分组",
            en: "200 items: Regroup",
          },
          unit: "ms",
          direction: "lower",
          before: 2146,
          after: 965,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
        {
          key: "w5-selectMs-1000",
          label: {
            "zh-CN": "1000 项：选择",
            en: "1000 items: Selection",
          },
          unit: "ms",
          direction: "lower",
          before: 1214,
          after: 1037,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
        {
          key: "w5-fieldUpdateMs-1000",
          label: {
            "zh-CN": "1000 项：字段更新",
            en: "1000 items: Field update",
          },
          unit: "ms",
          direction: "lower",
          before: 2772,
          after: 2133,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
        {
          key: "w5-groupMs-1000",
          label: {
            "zh-CN": "1000 项：重新分组",
            en: "1000 items: Regroup",
          },
          unit: "ms",
          direction: "lower",
          before: 22191,
          after: 6095,
          target: null,
          statistic: "median of 3 observations per mode",
          sampleCount: 3,
          evidenceId: "work-items-enhancements-measurements",
          beforeContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
          afterContext:
            "Same optimized W5 source, production static preview, shared host, Playwright action + two frames, 120ms fixture receipts; before=off, after=on",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "开启屏外延迟并非每项操作都会变快：200 项选择由 174ms 增至 245ms，1000 项移动由约 3.8 秒增至 4.0 秒。1000 项重新分组虽由约 22.2 秒降至 6.1 秒，仍有明显延迟；此功能保持可选，消费方仍需结合权威分页控制加载量。",
        en: "Offscreen deferral does not improve every operation: selection at 200 items rose from 174ms to 245ms, and moving at 1000 items rose from about 3.8 to 4.0 seconds. Regrouping at 1000 items fell from about 22.2 to 6.1 seconds but remains slow. The feature stays optional, and consumers should still bound loaded records with authoritative pagination.",
      },
    },
  ],
  evidence: [
    {
      id: "work-items-source",
      type: "source",
      file: "/blog/work-items/source-snapshot.json",
      capturedAt: "2026-10-08T11:24:23.196Z",
      sourceSnapshotId:
        "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33112 node scripts/capture-work-items.mjs",
      environment:
        "Node 24.21.0 / Next 16.3.8 / Base UI 1.8.0 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "SHA-256 of explicitly listed core implementation, CSS, fixtures, adapter and test files, checked unchanged before/after capture; not a full Git tree hash.",
      sampleCount: 26,
      scope: {
        "zh-CN": "核心源码快照与 40 张截图清单。",
        en: "Core source snapshot and manifest of 40 screenshots.",
      },
    },
    {
      id: "work-items-screenshot",
      type: "screenshot",
      file: "/blog/work-items/list-1440-light-zh-CN.png",
      capturedAt: "2026-10-08T11:24:23.196Z",
      sourceSnapshotId:
        "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33112 node scripts/capture-work-items.mjs",
      environment:
        "Node 24.21.0 / Next 16.3.8 / Base UI 1.8.0 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Production static preview; 24 deterministic local fixture records. Matrix includes three layouts, three viewports, two themes and two locales.",
      sampleCount: 40,
      scope: {
        "zh-CN": "EasyuseUI 本地展示，不是 Plane 工作项登录态截图。",
        en: "Local EasyuseUI showcase, not authenticated Plane work-item screenshots.",
      },
    },
    {
      id: "work-items-tests",
      type: "test",
      file: "/blog/work-items/verification.json",
      capturedAt: "2026-10-08T11:24:23.196Z",
      sourceSnapshotId:
        "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
      command:
        "pnpm lint / typecheck / build; pnpm test:install; pnpm exec playwright test --config playwright.work-items.config.ts",
      environment:
        "Node 24.21.0 / Next 16.3.8 / Base UI 1.8.0 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Task-only isolated snapshot. Read the report for exact checks, source scope, regression baseline and independent consumer boundaries.",
      sampleCount: 13,
      scope: {
        "zh-CN": "本地 fixture 行为、现有组件回归与独立组合安装。",
        en: "Local fixture behavior, existing-component regression and independent combined installation.",
      },
    },
    {
      id: "work-items-measurements",
      type: "measurement",
      file: "/blog/work-items/measurements.json",
      capturedAt: "2026-10-08T11:24:23.196Z",
      sourceSnapshotId:
        "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33112 node scripts/capture-work-items.mjs",
      environment:
        "Node 24.21.0 / Next 16.3.8 / Base UI 1.8.0 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "One sample per fixture size; action-to-two-frames, including browser automation and 120ms simulated writes. DOM counts are actual rendered nodes.",
      sampleCount: 3,
      scope: {
        "zh-CN": "共享主机生产预览的单次基线；不是服务 SLA 或前后性能对比。",
        en: "Single shared-host production-preview baseline, not a service SLA or before/after comparison.",
      },
    },
    {
      id: "work-items-enhancements-source",
      type: "source",
      file: "/blog/work-items-enhancements/source-snapshot.json",
      capturedAt: "2026-10-08T15:07:00.394Z",
      sourceSnapshotId:
        "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33113 node scripts/measure-work-items-enhancements.mjs",
      environment:
        "Node / Next 16.3.8 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Explicit core-file hashes checked before and after capture; not a full Git tree hash.",
      sampleCount: 13,
      scope: {
        "zh-CN": "本地确定性 fixture；不代表真实服务、生产容量或人工读屏验收。",
        en: "Deterministic local fixtures, not live services, production capacity or manual screen-reader acceptance.",
      },
    },
    {
      id: "work-items-enhancements-measurements",
      type: "measurement",
      file: "/blog/work-items-enhancements/measurements.json",
      capturedAt: "2026-10-08T15:07:00.394Z",
      sourceSnapshotId:
        "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33113 node scripts/measure-work-items-enhancements.mjs",
      environment:
        "Node / Next 16.3.8 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Same-source offscreen-layout toggle; Playwright action to two frames, includes automation and 120ms fixture receipts; native full DOM, no virtualization; shared host, not a service benchmark or p95",
      sampleCount: 18,
      scope: {
        "zh-CN": "本地确定性 fixture；不代表真实服务、生产容量或人工读屏验收。",
        en: "Deterministic local fixtures, not live services, production capacity or manual screen-reader acceptance.",
      },
    },
    {
      id: "work-items-enhancements-screenshots",
      type: "screenshot",
      file: "/blog/work-items-enhancements/swimlanes-1440-zh-CN.png",
      capturedAt: "2026-10-08T15:07:00.394Z",
      sourceSnapshotId:
        "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
      command:
        "WORK_ITEMS_ORIGIN=http://127.0.0.1:33113 node scripts/measure-work-items-enhancements.mjs",
      environment:
        "Node / Next 16.3.8 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Local swimlane, hierarchy, batch and saved-view fixtures; six screenshots, including narrow dark English.",
      sampleCount: 6,
      scope: {
        "zh-CN": "本地确定性 fixture；不代表真实服务、生产容量或人工读屏验收。",
        en: "Deterministic local fixtures, not live services, production capacity or manual screen-reader acceptance.",
      },
    },
    {
      id: "work-items-enhancements-tests",
      type: "test",
      file: "/blog/work-items-enhancements/verification.json",
      capturedAt: "2026-10-08T15:24:19.446Z",
      sourceSnapshotId:
        "fbe79d80c5dc8a32b1e0625a49984f281d48cc9617c9f6021ac6b4f13df92e23",
      command:
        "WORK_ITEMS_TEST_PORT=33114 pnpm exec playwright test --config=playwright.work-items.config.ts; pnpm test:install",
      environment:
        "Node / Next 16.3.8 / Chrome / Linux GLIBC 2.28 / Webpack + WASM / shared host",
      method:
        "Production browser regression and installed consumer validation; scopes and commands are recorded in the JSON.",
      sampleCount: 244,
      scope: {
        "zh-CN": "本地确定性 fixture；不代表真实服务、生产容量或人工读屏验收。",
        en: "Deterministic local fixtures, not live services, production capacity or manual screen-reader acceptance.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "所有业务数据、写入、回执与 Agent 状态均为本地模拟；刷新重置 fixture，没有生产服务或持久化接入证据。",
      en: "All business data, writes, receipts and Agent states are local simulations. Refresh resets fixtures; there is no production-service or persistence evidence.",
    },
    {
      "zh-CN":
        "Plane 仅作为信息架构源码参考。公共入口可访问，但未取得登录态工作项截图，不给出逐像素对照或相似度结论。",
      en: "Plane is an information-architecture source reference only. Its public entry was reachable, but no authenticated work-item screenshots or pixel-similarity evidence were obtained.",
    },
    {
      "zh-CN":
        "W5/S5 已加入泳道、子项、批量状态/优先级修改、保存视图接口和布局优化。1000 项仍完整挂载；共享主机的三轮中位数不是 p95 或生产容量保证，保存视图仅页面内存。跨泳道命令、生产事务和持久化接入仍由消费方完成。",
      en: "W5/S5 adds swimlanes, sub-items, batch state/priority changes, saved-view interfaces and layout optimization. All 1000 items still mount. Three shared-host observations are not p95 or a production capacity guarantee. Saved views use page memory; cross-lane commands, production transactions and persistence remain consumer responsibilities.",
    },
  ],
}
