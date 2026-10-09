import type { BlogPost } from "../../lib/blog-model"
export const agentWorkbenchPost: BlogPost = {
  slug: "agent-workbench",
  title: {
    "zh-CN": "Agent 工作台：从独立区域到三种完整网页",
    en: "Agent workbench: from individual regions to three complete pages",
  },
  summary: {
    "zh-CN":
      "复用会话、工具和运行区域，组合编码、产物审阅与多任务模板；按草稿版本、来源游标和独立回执连接交互。",
    en: "Reuse conversation, tool and runtime regions across coding, artifact review and task templates, with draft versions, source cursors and separate operation receipts.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  category: "reuse",
  tags: ["Agent", "Conversation", "Composer", "Diff", "Context"],
  optimizationIds: ["AW-M0", "AW-M1", "AW-M2", "AW-M3", "AW-M4", "AW-M5"],
  relatedComponents: [
    "agent-workbench",
    "session-navigator",
    "project-switcher",
    "session-header",
    "agent-conversation",
    "message-content",
    "agent-composer",
    "composer-controls",
    "context-panel",
    "context-picker",
    "file-viewer",
    "diff-viewer",
    "change-review-panel",
    "execution-output-panel",
    "preview-panel",
    "task-inbox",
  ],
  relatedPosts: [
    "agent-board-showcase",
    "long-session-anchor",
    "controlled-layout",
  ],
  baselineVersion: "8a095c21cd9370c7c6fbaefa02b35d54979837b1",
  resultVersion: null,
  sourceSnapshotId:
    "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
  body: [
    {
      type: "link",
      href: "/examples/agent-workbench/",
      text: {
        "zh-CN": "打开区域实验室、布局与完整模板",
        en: "Open the region lab, layouts and complete templates",
      },
    },
    {
      type: "heading",
      id: "composition",
      text: {
        "zh-CN": "区域组件怎样组成工作台",
        en: "How regions compose the workbench",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "WorkspaceShell 是唯一布局所有者。SessionNavigator 组织项目与会话；AgentConversation 复用 Conversation、ChatMessage 和 ToolCall；AgentComposer 复用 ChatComposer。上下文、文件与 Diff 通过受控插槽进入同一个 AgentWorkbench，运行列表和人工介入继续复用 Agent Board 区域。",
        en: "WorkspaceShell owns layout. SessionNavigator organizes projects and sessions; AgentConversation reuses Conversation, ChatMessage and ToolCall, while AgentComposer reuses ChatComposer. Controlled slots place context, files and Diff in one AgentWorkbench; runtime lists and human attention reuse Agent Board regions.",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/agent-workbench/baseline-board.jpg",
        alt: {
          "zh-CN": "基础 Agent Board：来源运行、人工介入和选中对象详情。",
          en: "Foundation Agent Board: source runs, human attention and selected object details.",
        },
        caption: {
          "zh-CN": "基础 Agent Board：来源运行、人工介入和选中对象详情。",
          en: "Foundation Agent Board: source runs, human attention and selected object details.",
        },
        sourceSnapshotId: "8a095c21cd9370c7c6fbaefa02b35d54979837b1",
        capturedAt: "2026-10-09T03:44:43.999Z",
        fixture:
          "Existing Agent Board fixture; unchanged baseline region sources",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/agent-workbench/desktop-light.jpg",
        alt: {
          "zh-CN":
            "编码工作台：沿用基础区域，加入受控会话、输入、上下文和审阅。",
          en: "Coding workbench: reused foundation regions with controlled conversations, input, context and review.",
        },
        caption: {
          "zh-CN":
            "编码工作台：沿用基础区域，加入受控会话、输入、上下文和审阅。",
          en: "Coding workbench: reused foundation regions with controlled conversations, input, context and review.",
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
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "上图展示运行看板与连续对话工作台的职责，下文记录组件复用、交互和分发证据。10 个区域网页、3 种布局和 3 个完整模板共用 fixture/reducer；公共源码只接收快照、能力和回调。",
        en: "The images show the responsibilities of the runtime board and the conversation workbench. The following evidence covers reuse, interaction and distribution. Ten region pages, three layouts and three templates share a fixture/reducer; portable sources receive snapshots, capabilities and callbacks.",
      },
    },
    {
      type: "demo",
      componentSlug: "agent-composer",
    },
    {
      type: "heading",
      id: "confirmations",
      text: {
        "zh-CN": "草稿与回执分开",
        en: "Drafts and receipts are separate",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "每个会话有独立草稿 ID 和版本。发送后继续输入会产生新版本，旧提交的确认不会清掉新内容。pending/confirmed/failed/unknown 是操作回执，running/waiting/completed 等是来源运行状态。unknown 先查询结果，禁止重复写入；关闭面板不停止任务。",
        en: "Each session has a draft ID and version. Typing after submission creates a new version, so an older acknowledgement cannot clear new input. Operation receipts use pending/confirmed/failed/unknown, separately from source runtime states. Unknown outcomes require reconciliation before another write; closing a panel does not stop a task.",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "来源事件必须属于当前会话，并按连续游标应用。旧游标、重复或缺口不覆盖正文；消息和 part 使用稳定 ID 与来源修订。上下文上传、失败、失效、拒绝和未知单独表达，本地 File 不代表引擎已读取。",
        en: "Events must belong to the session and use a continuous source cursor. Old, duplicate or missing cursors do not overwrite content; messages and parts use stable IDs and source revisions. Context upload, failure, staleness, denial and unknown availability remain explicit. Selecting a local File does not prove the engine has read it.",
      },
    },
    {
      type: "heading",
      id: "templates",
      text: {
        "zh-CN": "三个完整模板",
        en: "Three complete templates",
      },
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "编码：创建确认 → 批准工具 → 来源测试失败 → 补充反馈 → 来源完成 → 版本绑定的行反馈。",
          en: "Coding: confirm creation, approve a tool, inspect source test failure, send corrective feedback, receive completion, and prepare revision-bound line feedback.",
        },
        {
          "zh-CN":
            "产物：分析资料 → 报告生成批准 → 来源产物 → 引用定位 → 意见回到会话；不要求代码执行。",
          en: "Artifacts: analyze sources, approve report generation, inspect the artifact, locate references, and return feedback to the conversation without code execution.",
        },
        {
          "zh-CN":
            "多任务：筛选待批准、待回答与失败 → 选择查看 → 显式进入会话；不建设多 Agent 调度器。",
          en: "Tasks: filter approvals, questions and failures, select for inspection, then explicitly enter a session; no multi-agent scheduler is implemented.",
        },
      ],
    },
    {
      type: "heading",
      id: "responsive",
      text: {
        "zh-CN": "宽 Diff 与移动端",
        en: "Wide Diff and mobile layouts",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "审阅优先将 Diff 放在 Main，Inspector 保持对象属性。容器不足时切换对话/工作区域；布局切换保留编辑器挂载和草稿。Diff 评论绑定 base/head/revision/file/line，版本改变后需重新定位。日志脱敏后有界展示，预览只使用明确允许的 sandbox 或宿主插槽。",
        en: "Review layout places Diff in Main and keeps Inspector for object properties. Narrow containers switch conversation and workspace panels while keeping the editor mounted. Diff feedback binds base/head/revision/file/line and requires relocation after revisions change. Logs are redacted and bounded; previews use explicitly allowed sandboxes or caller slots.",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench/desktop-dark.jpg",
        alt: {
          "zh-CN": "实际路由截图：桌面，深色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: desktop, dark; local fixture after fonts loaded.",
        },
        caption: {
          "zh-CN": "实际路由截图：桌面，深色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: desktop, dark; local fixture after fonts loaded.",
        },
        sourceSnapshotId:
          "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
        capturedAt: "2026-10-09T03:44:48.586Z",
        fixture: "initial fixture; session-filter; session",
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
        src: "/blog/agent-workbench/mobile-light.jpg",
        alt: {
          "zh-CN": "实际路由截图：移动端，浅色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: mobile, light; local fixture after fonts loaded.",
        },
        caption: {
          "zh-CN": "实际路由截图：移动端，浅色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: mobile, light; local fixture after fonts loaded.",
        },
        sourceSnapshotId:
          "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
        capturedAt: "2026-10-09T03:44:50.805Z",
        fixture: "initial fixture; session-filter; session",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-workbench/mobile-dark.jpg",
        alt: {
          "zh-CN": "实际路由截图：移动端，深色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: mobile, dark; local fixture after fonts loaded.",
        },
        caption: {
          "zh-CN": "实际路由截图：移动端，深色；字体加载完成后的本地 fixture。",
          en: "Actual route capture: mobile, dark; local fixture after fonts loaded.",
        },
        sourceSnapshotId:
          "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
        capturedAt: "2026-10-09T03:44:53.101Z",
        fixture: "initial fixture; session-filter; session",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "distribution",
      text: {
        "zh-CN": "分发与证据边界",
        en: "Distribution and evidence",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "18 个公共 Registry 入口按六组共享实现和 CSS；模型独立于组件文件名。安装示例验证独立项目内的草稿、结果对账、语言/布局保留和 Diff 反馈。完整检查、场景、视口和已知限制记录在实施日志，截图源指纹记录在 captures.json。",
        en: "Eighteen public Registry entries share implementation and CSS across six groups; the model filename is distinct from components. The independent consumer validates drafts, reconciliation, locale/layout retention and Diff feedback. The implementation log records checks, scenarios, viewports and limitations; captures.json records screenshot source fingerprints.",
      },
    },
    {
      type: "heading",
      id: "loading",
      text: {
        "zh-CN": "示例扩展后的加载检查",
        en: "Loading checks after extending the examples",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "新增示例使首页预览数据随共享chunk进入目录与词典页，首轮超过原脚本预算。将首页预览拆成独立站点模块后，两页恢复预算内，7个页面预算均复测通过。下面是同一Chrome与生产导出条件下各一次的响应体gzip估算，不能解读为传输流量或延迟。",
        en: "New examples caused homepage preview data to enter catalog and dictionary shared chunks, exceeding the original script budgets. Separating the homepage preview into a site module restored both pages below budget; all seven page budgets passed again. These are single response-body gzip estimates under the same Chrome and production export conditions, not transport or latency measurements.",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "initial-js-components",
          label: {
            "zh-CN": "目录页首屏JavaScript估算gzip",
            en: "Catalog initial JavaScript estimated gzip",
          },
          unit: "bytes",
          direction: "lower",
          before: 382861,
          after: 371919,
          target: 380000,
          statistic: "single-response-body-gzip-estimate",
          sampleCount: 1,
          evidenceId: "workbench-loading-budgets",
          beforeContext:
            "Chrome 138, production static export, first navigation + locale=en, /components/",
          afterContext:
            "Chrome 138, production static export, first navigation + locale=en, /components/",
        },
        {
          key: "initial-js-dictionary",
          label: {
            "zh-CN": "词典页首屏JavaScript估算gzip",
            en: "Dictionary initial JavaScript estimated gzip",
          },
          unit: "bytes",
          direction: "lower",
          before: 402072,
          after: 391130,
          target: 400000,
          statistic: "single-response-body-gzip-estimate",
          sampleCount: 1,
          evidenceId: "workbench-loading-budgets",
          beforeContext:
            "Chrome 138, production static export, first navigation + locale=en, /dictionary/",
          afterContext:
            "Chrome 138, production static export, first navigation + locale=en, /dictionary/",
        },
      ],
    },
  ],
  evidence: [
    {
      id: "workbench-captures",
      type: "screenshot",
      file: "/blog/agent-workbench/captures.json",
      capturedAt: "2026-10-09T03:44:46.351Z",
      sourceSnapshotId:
        "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
      command:
        "TMPDIR=/tmp EASYUSEUI_BASELINE_VERSION=<verified foundation SHA> node scripts/capture-agent-workbench.mjs <isolated-build> <evidence>",
      environment: "Debian GLIBC 2.28; Chrome 138; static Webpack export",
      method:
        "Actual routes, fixed fixture, document.fonts.ready, desktop/mobile and light/dark captures",
      sampleCount: 12,
      scope: {
        "zh-CN": "三种模板的12张实际页面截图；不证明真实服务。",
        en: "Twelve actual page screenshots across three templates; no real-service proof.",
      },
    },
    {
      id: "workbench-loading-budgets",
      type: "measurement",
      file: "/blog/agent-workbench/loading-budgets.json",
      capturedAt: "2026-10-09T04:02:57.277Z",
      sourceSnapshotId:
        "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
      command:
        'TMPDIR=/tmp pnpm exec playwright test --config playwright.workbench-rerun.config.ts tests/loading-budget.spec.ts tests/ui-gap-audit.spec.ts --grep "initial loading budget|coarse pointer dialogs"',
      environment:
        "Debian GLIBC 2.28, static Webpack export, Chrome 138, preview port 3017",
      method:
        "Production response JavaScript bodies, including automatic prefetch, estimated with node:zlib gzipSync after first navigation and locale=en; original budgets retained.",
      sampleCount: 2,
      scope: {
        "zh-CN":
          "目录与词典页各一次的前后估算；全部7个预算复测记录见JSON。工作台指纹与站点模块摘要分别记录。",
        en: "One before/after observation per catalog/dictionary page; JSON retains all seven budget checks. Workbench fingerprint and site module hashes are recorded separately.",
      },
    },
    {
      id: "workbench-checks",
      type: "test",
      file: "/blog/agent-workbench/verification.json",
      capturedAt: "2026-10-09T04:05:39.059487+00:00",
      sourceSnapshotId:
        "d2fff2d077b7352ceb0a26608aa71fc9d35970f3c7207e0d1073f08d28891943",
      command:
        "Isolated candidate: pnpm lint; pnpm typecheck; pnpm build; pnpm check:i18n; pnpm registry:build; pnpm blog:build; pnpm docs:build; pnpm check:docs; TMPDIR=/tmp pnpm exec playwright test (full config, preview port 3017), then repeat all seven loading budgets and the configured-origin touch case; TMPDIR=/tmp pnpm test:install",
      environment:
        "Isolated checkout, GLIBC 2.28, Webpack/WASM SWC and Chrome 138",
      method:
        "Scoped model/browser behavior, engineering checks and independent consumer installation",
      sampleCount: 30,
      scope: {
        "zh-CN":
          "独立快照中的工程、行为、安装检查；fixture执行与真实服务分开。",
        en: "Engineering, behavior and install checks in an isolated snapshot; fixture execution is separate from real services.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN": "模型、文件系统、Git、PTY、浏览器控制、鉴权和持久化尚未接入。",
      en: "Model, filesystem, Git, PTY, browser control, authentication and persistence are not connected.",
    },
    {
      "zh-CN":
        "1000条消息仍挂载在DOM；布局延迟不是虚拟列表。Diff最多1000行，日志最多200行/32KiB。",
      en: "All 1,000 messages remain mounted; deferred layout is not virtualization. Diff is bounded to 1,000 lines and logs to 200 lines/32KiB.",
    },
    {
      "zh-CN": "刷新重置业务fixture，来源推进与确认是显式本地动作。",
      en: "Refreshing resets business fixtures; source advancement and confirmation are explicit local actions.",
    },
  ],
}
