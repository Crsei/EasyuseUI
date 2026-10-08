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
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["Work Items", "List", "Board", "Table"],
  optimizationIds: ["W0", "W1", "W2", "W3", "W4", "S0", "S1", "S2", "S3", "S4"],
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
  ],
  relatedPosts: ["common-components-from-crm"],
  baselineVersion: null,
  resultVersion: null,
  sourceSnapshotId:
    "449f494cdf3ca5834ef01c5b5ef9d446523d7c5e53f1abddf0e4da52886c74d7",
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
          "1000 项字段编辑约 13.2 秒，重新分组约 20.4 秒，当前没有窗口化，交互明显迟缓。这是首版的实测限制；消费方应通过权威分页控制已加载数量，大数据优化属于 W5/S5。",
        en: "At 1000 items, field editing took about 13.2 seconds and regrouping about 20.4 seconds. The implementation has no virtualization and is visibly slow at this size. Consumers should bound loaded records through authoritative pagination; large-data optimization remains W5/S5.",
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
        "1000 项全部挂载且明显迟缓；单次共享主机测量不能代表 p95、优化改善或生产容量。泳道、子项、批量写入、保存视图和大数据优化仍属于后续阶段。",
      en: "All 1000 items mount and are visibly slow. One shared-host observation does not establish p95, improvement or production capacity. Swimlanes, subitems, batch writes, saved views and large-data optimization remain future work.",
    },
  ],
}
