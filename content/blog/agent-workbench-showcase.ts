import type { BlogPost } from "../../lib/blog-model"
export const agentWorkbenchShowcasePost: BlogPost = {
  slug: "agent-workbench-showcase",
  title: {
    "zh-CN": "Agent 网页展示：区域实验室与连续工作流",
    en: "Agent showcase: region laboratory and continuous workflows",
  },
  summary: {
    "zh-CN":
      "十个区域的可分享场景、三种共享状态的布局，以及项目、审阅、产物与收件箱的连续操作。",
    en: "Shareable scenarios in ten regions, three layouts with shared state, and continuous project, review, artifact and inbox interactions.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  category: "reuse",
  tags: ["Agent", "Showcase", "Context", "Review"],
  optimizationIds: [
    "AW-S0",
    "AW-S1",
    "AW-S2",
    "AW-S3",
    "AW-S4",
    "AW-S5",
    "AW-S6",
  ],
  relatedComponents: [
    "agent-workbench",
    "session-navigator",
    "project-switcher",
    "context-panel",
    "agent-conversation",
    "agent-composer",
    "session-header",
    "change-review-panel",
    "execution-output-panel",
    "preview-panel",
    "task-inbox",
    "artifact-list",
    "agent-run-inspector",
  ],
  relatedPosts: ["agent-workbench", "agent-board-showcase"],
  baselineVersion: "4daa7879f0f5c5fa7406581fb7aafac7e9e1d7a2",
  resultVersion: null,
  sourceSnapshotId:
    "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
  body: [
    {
      type: "link",
      href: "/examples/agent-workbench/",
      text: {
        "zh-CN": "打开区域、布局与完整模板",
        en: "Open regions, layouts and complete templates",
      },
    },
    {
      type: "heading",
      id: "levels",
      text: {
        "zh-CN": "从独立区域进入连续任务",
        en: "From individual regions to continuous tasks",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "本轮在既有公共组件上完成 S0–S6 展示层：10 个区域实验室、3 种组合布局、3 个完整模板，共用一套本地 fixture 与 reducer。运行状态、连接、操作回执、审阅与业务验收分别表达。",
        en: "This delivery implements showcase stages S0–S6 on the existing public components: ten region labs, three composed layouts and three complete templates share one local fixture and reducer. Runtime, connection, operation receipts, review and business acceptance are represented separately.",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/agent-workbench/desktop-light.jpg",
        alt: {
          "zh-CN": "基线完整编码工作台；原组件交付的真实路由截图。",
          en: "Baseline complete coding workbench from the original component delivery.",
        },
        caption: {
          "zh-CN": "4daa7879 基线：完整编码模板，1440×900，浅色。",
          en: "4daa7879 baseline: complete coding template, 1440×900, light.",
        },
        sourceSnapshotId:
          "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
        capturedAt: "2026-10-09T03:44:46.351Z",
        fixture: "initial fixture; session-filter; session",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/agent-workbench-showcase/region-context-desktop-light.jpg",
        alt: {
          "zh-CN": "本轮上下文区域实验室：目录、真实预览与可折叠场景控制。",
          en: "Current context laboratory: directory, live preview and collapsible scenario controls.",
        },
        caption: {
          "zh-CN": "本轮上下文区域实验室：目录、真实预览与可折叠场景控制。",
          en: "Current context laboratory: directory, live preview and collapsible scenario controls.",
        },
        sourceSnapshotId:
          "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
        capturedAt: "2026-10-09T05:37:27.464Z",
        fixture: "initial stable fixture; default source case",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "两张图展示不同页面职责：基线为完整编码模板，本轮为独立区域实验室。它们不是同一页面的性能前后测量。移动端目录改成选择器，场景控制进入 Sheet；底部收纳组件映射、数据合同与验收说明。",
        en: "These images show different page responsibilities: the baseline is a complete coding template and the current image is an individual region lab. They are not a performance comparison of the same page. Mobile uses a region selector and Sheet controls, with component mappings, data contracts and acceptance details below.",
      },
    },
    {
      type: "heading",
      id: "cases",
      text: {
        "zh-CN": "57 个可分享场景与明确回执",
        en: "57 shareable cases with explicit receipts",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "9 个通用数据/连接场景，加上 48 个区域场景，通过 URL 白名单恢复。导航可携带项目、会话和场景；草稿、引用正文和凭据不进入 URL。切换布局、宽度或语言保留编辑器实例与未发送正文。",
        en: "Nine common data/connection cases and 48 region cases restore through a URL whitelist. Navigation carries project, session and scenario; drafts, reference bodies and credentials stay out of the URL. Layout, width and locale changes retain the editor instance and unsent text.",
      },
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "Sidebar / Context：搜索、归档与只读投影；失败引用重试进入 pending，确认绑定原引用版本，移除后迟到确认不能重新插入。查看来源只展示实际元数据。",
          en: "Sidebar / Context: search, archive and read-only projections. Retrying a failed reference enters pending and binds confirmation to its original version; a late acknowledgement cannot reinsert a removed reference. Source inspection displays actual metadata.",
        },
        {
          "zh-CN":
            "Conversation / Composer：IME、长历史、部分生成与迟到事件；发送、队列、steer 各有回执，unknown 必须先对账。",
          en: "Conversation / Composer: IME, long history, partial generation and late events. Send, queue and steer have separate receipts; unknown results require reconciliation.",
        },
        {
          "zh-CN":
            "Tools / Review：审批过期或结果未知时锁定重复操作；输出先脱敏再展示。行反馈绑定文件、行与版本，版本改变后需重新定位。",
          en: "Tools / Review: expired approvals and unknown outcomes lock duplicate operations; output is redacted before display. Line feedback binds file, line and revision and requires relocation after version changes.",
        },
        {
          "zh-CN":
            "Output / Artifacts：日志有界展示，重连只恢复本地读状态；产物按实际可用性和格式决定预览、复制与下载，未提供 PTY 或浏览器宿主时显示原因。",
          en: "Output / Artifacts: logs are bounded and reconnect restores local read state. Actual availability and format determine artifact preview, copy and download; missing PTY or browser hosts have explicit reasons.",
        },
      ],
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench-showcase/region-composer-mobile-light.jpg",
        alt: {
          "zh-CN": "移动端输入区域：主预览与 Sheet 场景设置。",
          en: "Mobile composer region: main preview and Sheet scenario controls.",
        },
        caption: {
          "zh-CN": "移动端输入区域：主预览与 Sheet 场景设置。",
          en: "Mobile composer region: main preview and Sheet scenario controls.",
        },
        sourceSnapshotId:
          "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
        capturedAt: "2026-10-09T05:37:55.400Z",
        fixture: "initial stable fixture; default source case",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "workflows",
      text: {
        "zh-CN": "项目、审阅、产物与收件箱",
        en: "Projects, review, artifacts and inbox",
      },
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "新任务选择项目与环境/模型/权限，确认创建后才进入所属会话。空项目可创建；只读、缺少环境和无效配置分别阻止写入。浏览器历史恢复选择。",
          en: "New tasks choose a project and environment/model/permissions and enter their session only after creation confirmation. Empty writable projects allow creation; read-only projects, missing environments and invalid settings block writes. Browser history restores selection.",
        },
        {
          "zh-CN":
            "编码模板从批准工具、来源测试失败到补充反馈与版本审阅；产物模板生成报告并返回来源消息；任务模板筛选关注项、查看详情，再显式进入会话。",
          en: "The coding template progresses through tool approval, source test failure, corrective feedback and revision review. The artifact template generates a report and returns to its source message. The task template filters attention, inspects details and explicitly enters a session.",
        },
        {
          "zh-CN":
            "收件箱同时按项目约束运行与关注项，支持待审阅筛选和标题/更新时间排序。选择只查看来源详情，不批准工具；排序保留所选对象 ID。",
          en: "Inbox scopes runs and attention to the project, with review filters and title/update sorting. Selection only inspects source details; it does not approve tools. Sorting retains the selected object ID.",
        },
        {
          "zh-CN":
            "计划步骤定位特定工具，产物定位实际来源消息。已完成、已审阅和已验收保持独立，下载真实本地报告字节。",
          en: "Plan steps locate a specific tool and artifacts locate their actual source messages. Completion, review and acceptance remain independent; download produces actual local report bytes.",
        },
      ],
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench-showcase/agent-coding-workbench-desktop-light.jpg",
        alt: {
          "zh-CN": "完整编码模板：项目与会话导航、对话和审阅面板。",
          en: "Complete coding template: project/session navigation, conversation and review panels.",
        },
        caption: {
          "zh-CN": "完整编码模板：项目与会话导航、对话和审阅面板。",
          en: "Complete coding template: project/session navigation, conversation and review panels.",
        },
        sourceSnapshotId:
          "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
        capturedAt: "2026-10-09T05:36:38.953Z",
        fixture: "initial stable fixture; default source case",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench-showcase/agent-artifacts-workbench-desktop-dark.jpg",
        alt: {
          "zh-CN": "完整产物模板：来源报告与独立审阅/验收状态。",
          en: "Complete artifact template: source report with separate review and acceptance states.",
        },
        caption: {
          "zh-CN": "完整产物模板：来源报告与独立审阅/验收状态。",
          en: "Complete artifact template: source report with separate review and acceptance states.",
        },
        sourceSnapshotId:
          "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
        capturedAt: "2026-10-09T05:36:53.331Z",
        fixture: "initial stable fixture; default source case",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "dark",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench-showcase/agent-console-workbench-desktop-light.jpg",
        alt: {
          "zh-CN": "完整任务模板：关注队列、运行列表和只读任务详情。",
          en: "Complete task template: attention queue, run list and read-only task details.",
        },
        caption: {
          "zh-CN": "完整任务模板：关注队列、运行列表和只读任务详情。",
          en: "Complete task template: attention queue, run list and read-only task details.",
        },
        sourceSnapshotId:
          "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
        capturedAt: "2026-10-09T05:37:02.523Z",
        fixture: "initial stable fixture; default source case",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "preferences",
      text: {
        "zh-CN": "偏好与业务数据的保存范围",
        en: "What preferences retain",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "语言、主题和有界面板尺寸/开关可保存；面板存储失败时降级到内存。清除偏好保留草稿。刷新重置业务 fixture，不承诺恢复执行、附件或完整会话。设置读取失败保留当前配置并提供恢复入口。",
        en: "Locale, theme and bounded panel sizes/toggles can persist; panel storage failures fall back to memory. Clearing preferences retains drafts. Refresh resets business fixtures and does not promise restored execution, attachments or full sessions. Failed settings reads retain current configuration and provide recovery.",
      },
    },
    {
      type: "heading",
      id: "distribution",
      text: {
        "zh-CN": "公共源码与分发证据",
        en: "Public source and distribution evidence",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "本轮修改位于 examples 与站点适配层，复用既有公共组件。将正式基线与候选版本以同一 localhost:3010 origin 生成 Registry，再比较所有 file.content 的 SHA-256 与 UTF-8 字节。包括普通、宿主与 scoped 变体，共 843 份内容，0 份变化；下面的字节和包含变体的重复源码，不是网络传输或性能指标。",
        en: "This delivery changes examples and site adapters while reusing existing public components. Baseline and candidate Registry builds use the same localhost:3010 origin; every file.content is compared by SHA-256 and UTF-8 bytes. Normal, host and scoped variants total 843 payloads with zero changes. The byte sum includes repeated variant sources and is not network traffic or a performance metric.",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "registry-file-content-bytes",
          label: {
            "zh-CN": "Registry 文件内容 UTF-8 字节和",
            en: "Registry file-content UTF-8 byte sum",
          },
          unit: "bytes",
          direction: "lower",
          before: 4578792,
          after: 4578792,
          target: 4578792,
          statistic: "sum-utf8-file-content-bytes",
          sampleCount: 843,
          evidenceId: "showcase-portable-payloads",
          beforeContext:
            "All public/r Registry file.content payloads including host/scoped variants; localhost:3010 origin; excludes examples and site",
          afterContext:
            "All public/r Registry file.content payloads including host/scoped variants; localhost:3010 origin; excludes examples and site",
        },
      ],
    },
    {
      type: "heading",
      id: "verification",
      text: {
        "zh-CN": "真实路由截图与验证记录",
        en: "Actual-route captures and verification",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "64 张截图覆盖 10 区域、3 布局、3 模板的桌面/移动 × 浅色/深色。捕获前等待字体加载，记录视口、主题、语言、路由和 23 个运行源码文件的指纹，检查页面异常与横向溢出。专项 174 项验证通过；完整命令结果与后续回归数保存在 verification.json 和展示实施记录。",
        en: "64 captures cover ten regions, three layouts and three templates on desktop/mobile in light/dark themes. Capture waits for loaded fonts, records viewport, theme, locale, route and fingerprints of 23 runtime source files, and checks page errors and horizontal overflow. All 174 workbench checks pass; command results and full regression counts are recorded in verification.json and the showcase implementation log.",
      },
    },
  ],
  evidence: [
    {
      id: "showcase-portable-payloads",
      type: "measurement",
      file: "/blog/agent-workbench-showcase/portable-payloads.json",
      capturedAt: "2026-10-09T05:39:48.945930+00:00",
      sourceSnapshotId:
        "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
      command:
        "pnpm registry:build (formal baseline and isolated candidate); python3 compare-payload.py",
      environment:
        "Node 24.21.0; same localhost:3010 origin; baseline 4daa7879 and isolated candidate",
      method:
        "Build the formal baseline and isolated candidate Registry with the same localhost:3010 origin; compare every file content by SHA-256 and UTF-8 bytes, including host/scoped variants. Excludes documentation site and examples.",
      sampleCount: 843,
      scope: {
        "zh-CN":
          "公共 Registry 中每份 file.content 的哈希与字节；不包含站点与示例。",
        en: "Hashes and bytes of every public Registry file.content payload; excludes site and examples.",
      },
    },
    {
      id: "showcase-captures",
      type: "screenshot",
      file: "/blog/agent-workbench-showcase/captures.json",
      capturedAt: "2026-10-09T05:39:45.129Z",
      sourceSnapshotId:
        "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
      command:
        "PORT=3018 node scripts/capture-agent-workbench-showcase.mjs <isolated-build> <evidence-dir>",
      environment:
        "Chrome 138; production Webpack static export; 1440×900 and 390×844; zh-CN; light/dark; reduced motion",
      method:
        "Actual routes, stable initial fixtures, fonts loaded, no pageerror or horizontal overflow; runtime source SHA-256 fingerprint.",
      sampleCount: 64,
      scope: {
        "zh-CN": "区域、布局与完整模板的真实路由截图；不证明真实运行服务。",
        en: "Actual-route captures of regions, layouts and templates; not evidence of real runtime services.",
      },
    },
    {
      id: "showcase-checks",
      type: "test",
      file: "/blog/agent-workbench-showcase/verification.json",
      capturedAt: "2026-10-09T05:39:45.129Z",
      sourceSnapshotId:
        "476017e821453b9e770a5e0109f19cf1b487e9f8eb37ab66dcf2e5c0251e766c",
      command:
        "pnpm lint; pnpm typecheck; pnpm build; pnpm test:install; pnpm test --config=playwright.showcase.config.ts",
      environment:
        "Isolated formal source candidate; Webpack/WASM SWC; production static preview 3019; shared dev 3010 untouched",
      method:
        "Assertions on visible user actions, source receipts, object/version guards, keyboard/focus, drafts, responsive layouts, distribution and source artifacts. See the recorded commands and results.",
      sampleCount: 174,
      scope: {
        "zh-CN":
          "工作台与站点检查，fixture 交互证据；不等同模型、Git、PTY或业务验收。",
        en: "Workbench and site checks with fixture interaction evidence; not model, Git, PTY or business acceptance evidence.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "模型、文件写入、Git、PTY、浏览器控制、鉴权与业务持久化未接入，属于 M6 独立服务验收。刷新重置 fixture。",
      en: "Models, file writes, Git, PTY, browser control, authorization and business persistence are not connected; M6 requires separate service acceptance. Refresh resets fixtures.",
    },
    {
      "zh-CN":
        "来源日志与报告正文为本地 fixture；来源“测试通过/失败”不代表本项目检查结果。64 张截图记录初始场景，其余场景由动作与模型测试覆盖。",
      en: "Source logs and reports are local fixtures; source test pass/failure does not represent project check results. The 64 images record initial cases; action and model checks cover other cases.",
    },
    {
      "zh-CN":
        "本轮证据在隔离正式候选中产生；共享工作区中并行的 CRM 等修改未混入候选提交。",
      en: "Evidence comes from an isolated formal candidate; parallel CRM and other shared-workspace changes are excluded from this delivery.",
    },
  ],
}
