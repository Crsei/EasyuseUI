import type { BlogPost } from "../../lib/blog-model"
export const salesCrmReplication: BlogPost = {
  slug: "sales-crm-replication",
  title: {
    "zh-CN": "使用 EasyuseUI 复刻 Sales CRM Companies",
    en: "Rebuilding Sales CRM Companies with EasyuseUI",
  },
  summary: {
    "zh-CN":
      "通用表格、筛选、抽屉与表单组成一个可操作的本地 CRM；分别记录参考对比、交互验证与服务边界。",
    en: "Reusable tables, filters, sheets and forms make an operable local CRM. Reference comparisons, interaction checks and service boundaries are recorded separately.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["CRM", "DataTable", "Sheet", "ThemeBoundary"],
  optimizationIds: ["CRM-R0", "CRM-R5"],
  relatedComponents: [
    "data-table",
    "checkbox",
    "avatar",
    "tag",
    "segment-bar",
    "sparkline",
    "dropdown-menu",
    "sheet",
    "dialog",
    "select",
    "field",
    "form-section",
    "slider",
    "image-upload",
    "filter-toolbar",
    "command-palette",
    "metric-summary",
    "workspace-shell",
    "theme-boundary",
  ],
  relatedPosts: ["common-components-from-crm"],
  baselineVersion:
    "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
  resultVersion:
    "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
  sourceSnapshotId:
    "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
  body: [
    {
      type: "link",
      href: "/examples/sales-crm/",
      text: {
        "zh-CN": "打开当前 CRM 示例",
        en: "Open the current CRM example",
      },
    },
    {
      type: "heading",
      id: "reuse",
      text: {
        "zh-CN": "组合现有组件",
        en: "Compose existing components",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "WorkspaceShell负责全窗口布局与侧栏调宽；DataTable负责九个业务列和独立选择列；Avatar、Tag、SegmentBar、Sparkline表达账户信息。FilterToolbar、Select、Sheet、Dialog、CommandPalette、Field、ImageUpload等来自现有组件，不在CRM目录复制基础实现。私有ThemeBoundary主题覆盖只作用于该实例及其Portal。",
        en: "WorkspaceShell owns the full-window layout and sidebar resizing. DataTable presents nine business columns and a separate selection column. Avatar, Tag, SegmentBar and Sparkline display account information. Existing FilterToolbar, Select, Sheet, Dialog, CommandPalette, Field and ImageUpload components are reused. A private ThemeBoundary theme scopes the instance and its portals.",
      },
    },
    {
      type: "heading",
      id: "reference",
      text: {
        "zh-CN": "参考与允许差异",
        en: "Reference and intentional differences",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "参考为kargulstudio/sales-crm的Companies页面。原项目保持只读，在完整冻结副本中用Webpack运行并采集12种状态。保留18条确定性fixture、254px侧栏、38px表头、42px桌面行、560px详情/新增浮层。没有资产许可证据的头像、Logo和字体不复制；沿用系统字体、Lucide图标和姓名缩写。提高次要文字对比度，触摸目标至少44px。",
        en: "The reference is the Companies page in kargulstudio/sales-crm. The formal project stays read-only; a frozen copy runs with Webpack and supplies 12 captured states. The replica retains 18 deterministic records, a 254px sidebar, 38px headers, 42px desktop rows and 560px detail/creation overlays. Unlicensed assets are replaced by system fonts, Lucide icons and initials. Secondary text contrast is increased and touch targets are at least 44px.",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/default-1440.png",
        alt: {
          "zh-CN": "参考：Companies默认九列",
          en: "Reference: Default Companies list",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/default-1440.png",
        alt: {
          "zh-CN": "复刻：Companies默认九列",
          en: "Replica: Default Companies list",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/detail.png",
        alt: {
          "zh-CN": "参考：公司详情",
          en: "Reference: Company detail",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/detail.png",
        alt: {
          "zh-CN": "复刻：公司详情",
          en: "Replica: Company detail",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/profile.png",
        alt: {
          "zh-CN": "参考：个人资料",
          en: "Reference: Profile",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/profile.png",
        alt: {
          "zh-CN": "复刻：个人资料",
          en: "Replica: Profile",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/new-company.png",
        alt: {
          "zh-CN": "参考：新增公司",
          en: "Reference: New company",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/new-company.png",
        alt: {
          "zh-CN": "复刻：新增公司",
          en: "Replica: New company",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/notifications.png",
        alt: {
          "zh-CN": "参考：通知",
          en: "Reference: Notifications",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/notifications.png",
        alt: {
          "zh-CN": "复刻：通知",
          en: "Replica: Notifications",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/search.png",
        alt: {
          "zh-CN": "参考：命令搜索",
          en: "Reference: Command search",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/search.png",
        alt: {
          "zh-CN": "复刻：命令搜索",
          en: "Replica: Command search",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 1440,
          height: 1000,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/sales-crm/reference/default-390.png",
        alt: {
          "zh-CN": "参考：390px移动列表",
          en: "Reference: 390px mobile list",
        },
        caption: {
          "zh-CN": "冻结参考；替代资产与允许差异见清单",
          en: "Frozen reference; substitutions and differences are listed",
        },
        sourceSnapshotId:
          "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
        capturedAt: "2026-10-08T10:22:43.059Z",
        fixture: "18 source records; Microsoft selected; TODAY 2026-09-14",
        viewport: {
          width: 390,
          height: 844,
        },
        locale: "en",
        theme: "dark",
      },
      after: {
        src: "/blog/sales-crm/replica/default-390.png",
        alt: {
          "zh-CN": "复刻：390px移动列表",
          en: "Replica: 390px mobile list",
        },
        caption: {
          "zh-CN": "当前生产复刻；仅本地fixture",
          en: "Current production replica; local fixtures only",
        },
        sourceSnapshotId:
          "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
        capturedAt: "2026-10-08T10:44:59.147Z",
        fixture:
          "same 18 numeric source records; Microsoft selected; TODAY 2026-09-14; initials replace assets",
        viewport: {
          width: 390,
          height: 844,
        },
        locale: "en",
        theme: "dark",
      },
    },
    {
      type: "heading",
      id: "behavior",
      text: {
        "zh-CN": "让结果保持同一范围",
        en: "Keep results in the same scope",
      },
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "表格、汇总与CSV使用同一筛选排序结果。可见全选保留隐藏选择；选中行、查看对象和焦点独立。CSV处理分隔符、换行、引号与公式前缀。",
          en: "Table rows, summaries and CSV share one filtered, sorted result. Select-all preserves hidden IDs. Selection, active objects and focus are separate. CSV handles delimiters, newlines, quotes and formula prefixes.",
        },
        {
          "zh-CN":
            "无编辑的详情操作改为完成，避免虚假保存。趋势时间范围切换实际本地序列；汇总计算总额和平均概率，这是相对参考占位标签的增强。",
          en: "Read-only details end with Done, avoiding a false save claim. Activity windows change actual local series. Summaries calculate totals and average probability, enhancing the reference placeholder labels.",
        },
        {
          "zh-CN":
            "新增校验名称、数字、日期和图片；失败保留草稿并防重复。新公司被筛选隐藏时给出查看/清除筛选。通知标记已读与打开对象独立，失效关联有提示。",
          en: "Creation validates names, numbers, dates and images, preserves failed drafts and prevents duplicate submissions. Hidden new companies offer View/Clear filters. Reading notifications and opening objects are separate; missing links are explained.",
        },
        {
          "zh-CN":
            "Ctrl/Cmd+K在本示例范围内搜索，文本编辑和IME不抢键。移动端提供导航Sheet、底部筛选和横向表格。折叠场景面板覆盖五种数据态及刷新保留。",
          en: "Ctrl/Cmd+K searches within this example without intercepting text editing or IME. Mobile layouts provide navigation sheets, bottom filters and horizontal tables. A collapsed scenario panel covers five data states and preserved content on refresh failure.",
        },
      ],
    },
    {
      type: "heading",
      id: "verification",
      text: {
        "zh-CN": "验证范围与视觉差异",
        en: "Validation scope and visual differences",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "完整源码隔离副本通过lint、类型检查和Webpack生产构建。215项全量浏览器回归通过，其中18项CRM检查覆盖筛选导出范围、浮层交接、原始输入/图片失败恢复、数据态、存储拒绝、局域网创建、主题隔离以及390/768/1024px触摸布局。通用CommandPalette增加可选className/renderItem，默认行为不变；独立CLI消费者重新安装、类型检查、生产构建和浏览器操作通过。这些结果证明本地示例与可分发组件，不证明真实CRM服务。",
        en: "The complete isolated source passes lint, typecheck and a Webpack production build. 215 browser regression tests pass, including 18 CRM checks for filter/export scope, overlay handoffs, raw input and image recovery, data states, denied storage, insecure-origin creation, scoped themes and 390/768/1024px touch layouts. CommandPalette adds optional className/renderItem while preserving default behavior. A fresh CLI consumer passes installation, typecheck, production build and browser flows. This proves local behavior and portable components, not CRM services.",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "12组原图/复刻图/差异图已逐图核对，另采集1024px。参考网格表头/行包含边框后实测39/43px，复刻采用计划中的38/42px。资料统一560px而参考480px；通知使用420px面板、独立已读操作和简化示例文案，未复制时间戳/引用评论；搜索保留通用标题与帮助。字体、头像、对比度、评分示例及移动目标带来可见差异，不宣称像素一致。",
        en: "Twelve reference/replica/heatmap sets were visually inspected, plus a 1024px capture. Source grid borders make headers/rows 39/43px; the replica uses the planned 38/42px. Profile sheets are 560px versus 480px. Notifications use a 420px panel, separate read actions and simplified fixture messages without source timestamps/quoted comments. Search retains shared title/help. Fonts, avatars, contrast, sample ratings and touch targets visibly differ; pixel identity is not claimed.",
      },
    },
  ],
  evidence: [
    {
      id: "reference-baseline",
      type: "screenshot",
      file: "/blog/sales-crm/reference/environment.json",
      capturedAt: "2026-10-08T10:22:43.059Z",
      sourceSnapshotId:
        "9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739",
      command: "node scripts/capture-sales-crm-reference.mjs",
      environment:
        "Chrome 138; DPR1; UTC; en-US; reduced motion; frozen reference Webpack server",
      method: "12 named states with operation steps and viewport geometry",
      sampleCount: 12,
      scope: {
        "zh-CN": "仅参考页面的视觉基线，不能证明复刻交互或服务能力。",
        en: "Reference visual baseline only; not evidence of replica interactions or service integration.",
      },
    },
    {
      id: "replica-captures",
      type: "screenshot",
      file: "/blog/sales-crm/replica/environment.json",
      capturedAt: "2026-10-08T10:51:31.966Z",
      sourceSnapshotId:
        "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
      command:
        "CRM_SOURCE_ROOT=<complete validation snapshot> node scripts/capture-sales-crm.mjs",
      environment:
        "GLIBC 2.28; Node 24; Next 16.3.8 Webpack + WASM SWC; Chrome 138.0.7204.92",
      method: "Bounded source and browser evidence",
      sampleCount: 13,
      scope: {
        "zh-CN": "固定英文、UTC、DPR1和视口，生产导出截图，无浏览器异常。",
        en: "Fixed English, UTC, DPR1 and viewports; production export captures without browser errors.",
      },
    },
    {
      id: "paired-visual-review",
      type: "screenshot",
      file: "/blog/sales-crm/visual-review.json",
      capturedAt: "2026-10-08T10:51:31.966Z",
      sourceSnapshotId:
        "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
      command: "python3 scripts/compare-sales-crm.py; paired image inspection",
      environment:
        "GLIBC 2.28; Node 24; Next 16.3.8 Webpack + WASM SWC; Chrome 138.0.7204.92",
      method: "Bounded source and browser evidence",
      sampleCount: 12,
      scope: {
        "zh-CN":
          "原图、复刻图、差异图和DOM尺寸逐项核对，保留差异；不使用像素通过率。",
        en: "Paired originals, replicas, heatmaps and DOM geometry; differences retained, no pixel pass rate.",
      },
    },
    {
      id: "local-verification",
      type: "test",
      file: "/blog/sales-crm/verification.json",
      capturedAt: "2026-10-08T10:51:31.966Z",
      sourceSnapshotId:
        "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
      command:
        "pnpm lint; pnpm typecheck; pnpm build; pnpm check:i18n; pnpm check:manifest; Playwright",
      environment:
        "GLIBC 2.28; Node 24; Next 16.3.8 Webpack + WASM SWC; Chrome 138.0.7204.92",
      method: "Bounded source and browser evidence",
      sampleCount: 215,
      scope: {
        "zh-CN":
          "完整快照与本地业务/交互检查；文章证据更新后另测链接、图片与语言。",
        en: "Whole-snapshot and local behavior checks; article links, images and locale are checked separately after evidence updates.",
      },
    },
    {
      id: "portable-installation",
      type: "test",
      file: "/blog/sales-crm/verification/installation.log",
      capturedAt: "2026-10-08T10:51:31.966Z",
      sourceSnapshotId:
        "981f6768a2505df6a7ee6fb14b3d1728a3bf9c1e790ced0ad479b2b472595628",
      command: "pnpm test:install",
      environment:
        "GLIBC 2.28; Node 24; Next 16.3.8 Webpack + WASM SWC; Chrome 138.0.7204.92",
      method: "One independent installed consumer",
      sampleCount: 1,
      scope: {
        "zh-CN":
          "新建独立消费者安装组件、类型检查、构建并操作；不等同于安装CRM业务应用或接入API。",
        en: "Fresh consumer installation, typecheck, build and interactions; not installation of the CRM business app or API integration.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "只含本地fixture，不连接CRM API、账户、远程保存或协作；刷新重置业务数据。",
      en: "Local fixtures only: no CRM API, authentication, remote saving or collaboration. Refresh resets business data.",
    },
    {
      "zh-CN":
        "Deals、Forecast、Contacts、邀请和计费未实现；入口禁用并说明。头像、图标、字体、无障碍修正及实际汇总是有意差异，不宣称像素一致。",
      en: "Deals, Forecast, Contacts, invitations and billing are unavailable and explained. Asset substitutions, accessibility fixes and actual summaries are intentional differences; pixel identity is not claimed.",
    },
    {
      "zh-CN":
        "通用组件独立安装和本地交互已验证；通知文案、评分卡等为示例适配。没有实测性能收益，不填写性能提升。",
      en: "Independent component installation and local interactions are verified. Notification copy and scorecards remain sample adaptations. No measured performance gain is claimed.",
    },
  ],
}
