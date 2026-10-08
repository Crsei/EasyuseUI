import type { BlogPost } from "../../lib/blog-model"
export const agentBoardShowcase: BlogPost = {
  slug: "agent-board-showcase",
  title: {
    "zh-CN": "Agent 运行看板：从状态到人工介入",
    en: "Agent runs: from runtime status to human attention",
  },
  summary: {
    "zh-CN":
      "同一组受控运行快照组成 Board、List、Inbox 和 Insights，保留请求核对、审阅与统计边界。",
    en: "Shared controlled run snapshots power Board, List, Inbox and Insights with explicit reconciliation, review and usage boundaries.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["Agent", "Board", "Inbox", "Inspector"],
  optimizationIds: ["AG0", "AG1", "AG2", "AG3", "AG4"],
  relatedComponents: [
    "agent-board-workspace",
    "agent-run-board",
    "attention-queue",
    "agent-run-inspector",
    "agent-usage-summary",
    "tool-call",
  ],
  relatedPosts: [],
  baselineVersion: "07fbbe0",
  resultVersion: null,
  sourceSnapshotId:
    "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
  body: [
    {
      type: "link",
      href: "/workspace/agents/",
      text: {
        "zh-CN": "打开 Agent 运行看板示例",
        en: "Open the Agent board example",
      },
    },
    {
      type: "heading",
      id: "mapping",
      text: {
        "zh-CN": "参考元素与组件映射",
        en: "Reference elements and components",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "计划参考 Vibe Kanban 的运行概况、Agent Inbox 的人工请求、Langfuse 的执行树和 Magentic-UI 的人工介入模式。实现沿用 EasyuseUI：Item 组成行，通用 Board 组成只读运行分列，ToolCall 展示工具审批和脱敏输出，Tree 展示来源父子步骤，WorkspaceShell 与 Sheet 承载详情。",
        en: "The plan references run overview, human requests, execution trees and human intervention patterns. EasyuseUI composes Item rows, generic Board columns, ToolCall approval and redacted output, Tree steps, WorkspaceShell and Sheet detail.",
      },
    },
    {
      type: "heading",
      id: "screens",
      text: {
        "zh-CN": "Board、List、Inbox 与详情实图",
        en: "Board, List, Inbox and detail captures",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-board/board-1440.png",
        alt: {
          "zh-CN": "Board：原始运行状态与五组只读分列",
          en: "Board: original runtime statuses in five read-only groups",
        },
        caption: {
          "zh-CN": "Board：原始运行状态与五组只读分列；本地确定性样例。",
          en: "Board: original runtime statuses in five read-only groups. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:52:53.766Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/list-1440.png",
        alt: {
          "zh-CN": "List：同一数据集合的紧凑行",
          en: "List: compact rows for the same run collection",
        },
        caption: {
          "zh-CN": "List：同一数据集合的紧凑行；本地确定性样例。",
          en: "List: compact rows for the same run collection. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:52:56.050Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/inbox-1440.png",
        alt: {
          "zh-CN": "Inbox：5 个请求涉及 4 次运行",
          en: "Inbox: five requests across four runs",
        },
        caption: {
          "zh-CN": "Inbox：5 个请求涉及 4 次运行；本地确定性样例。",
          en: "Inbox: five requests across four runs. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:52:58.010Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/overview-1440.png",
        alt: {
          "zh-CN": "概览：能力受控请求与阶段摘要",
          en: "Overview: capability-controlled requests and stage summary",
        },
        caption: {
          "zh-CN": "概览：能力受控请求与阶段摘要；本地确定性样例。",
          en: "Overview: capability-controlled requests and stage summary. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:00.053Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/trace-1440.png",
        alt: {
          "zh-CN": "执行：来源父子步骤与脱敏工具预览",
          en: "Trace: source-linked steps and redacted tool preview",
        },
        caption: {
          "zh-CN": "执行：来源父子步骤与脱敏工具预览；本地确定性样例。",
          en: "Trace: source-linked steps and redacted tool preview. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:02.280Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/artifacts-1440.png",
        alt: {
          "zh-CN": "产物：审阅、PR 与业务验收独立",
          en: "Artifacts: review, PR and acceptance remain independent",
        },
        caption: {
          "zh-CN": "产物：审阅、PR 与业务验收独立；本地确定性样例。",
          en: "Artifacts: review, PR and acceptance remain independent. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:04.311Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/insights-1440.png",
        alt: {
          "zh-CN": "Insights：覆盖范围、包含关系与独立币种",
          en: "Insights: coverage, inclusion and separate currencies",
        },
        caption: {
          "zh-CN": "Insights：覆盖范围、包含关系与独立币种；本地确定性样例。",
          en: "Insights: coverage, inclusion and separate currencies. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:06.258Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/unknown-1440.png",
        alt: {
          "zh-CN": "未知回执：锁定写入，先核对再操作",
          en: "Unknown receipt: writes locked until reconciliation",
        },
        caption: {
          "zh-CN": "未知回执：锁定写入，先核对再操作；本地确定性样例。",
          en: "Unknown receipt: writes locked until reconciliation. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:08.653Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/refresh-error-1440.png",
        alt: {
          "zh-CN": "刷新失败：保留已有运行快照",
          en: "Refresh failure: existing snapshots retained",
        },
        caption: {
          "zh-CN": "刷新失败：保留已有运行快照；本地确定性样例。",
          en: "Refresh failure: existing snapshots retained. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:10.636Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/list-390.png",
        alt: {
          "zh-CN": "390px：紧凑列表与可访问筛选",
          en: "390px: compact list and accessible filters",
        },
        caption: {
          "zh-CN": "390px：紧凑列表与可访问筛选；本地确定性样例。",
          en: "390px: compact list and accessible filters. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:12.396Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/detail-390.png",
        alt: {
          "zh-CN": "390px：Sheet 详情及焦点恢复",
          en: "390px: Sheet detail and focus restoration",
        },
        caption: {
          "zh-CN": "390px：Sheet 详情及焦点恢复；本地确定性样例。",
          en: "390px: Sheet detail and focus restoration. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:14.286Z",
        fixture: "local-deterministic-v1",
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
        src: "/blog/agent-board/dark-en-1440.png",
        alt: {
          "zh-CN": "深色英文：界面文案切换，调用方标题保持原文",
          en: "Dark English: translated interface with caller text preserved",
        },
        caption: {
          "zh-CN":
            "深色英文：界面文案切换，调用方标题保持原文；本地确定性样例。",
          en: "Dark English: translated interface with caller text preserved. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
        capturedAt: "2026-10-08T10:53:16.529Z",
        fixture: "local-deterministic-v1",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "heading",
      id: "recovery",
      text: {
        "zh-CN": "状态与恢复",
        en: "States and recovery",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "运行完成不表示业务验收通过。关注项按请求 ID 去重，同一运行可有多个请求。未知写入结果锁定后续写入，关闭再打开仍保留，必须先核对。刷新失败保留已有快照；页面前进后退恢复视图与选中对象。",
        en: "Runtime completion does not imply business acceptance. Attention is deduplicated by request ID. Unknown writes remain locked across detail changes until reconciliation. Failed refreshes preserve snapshots; history restores view and selection.",
      },
    },
    {
      type: "heading",
      id: "evidence",
      text: {
        "zh-CN": "验收证据",
        en: "Validation evidence",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "静态 lint、typecheck、Webpack build、Manifest 与国际化检查通过；相关浏览器回归 46 项通过，最终界面修正后 Agent 场景重跑 20 项通过。独立消费项目完成 Registry 安装、生产构建及浏览器操作。12 张截图绑定同一源码快照。未采集优化前后对比，文章保留 measuring 状态；本地交互验证已完成，真实服务接入未验证。",
        en: "Lint, typecheck, Webpack build, Manifest and i18n checks passed. Related browser regression passed 46 tests; all 20 Agent cases passed again after final interface polish. A fresh consumer passed Registry installation, production build and browser checks. Twelve captures share a source snapshot. No before/after comparison was measured, so the article remains measuring. Local interaction validation is complete; real service integration is unverified.",
      },
    },
  ],
  evidence: [
    {
      id: "validation",
      type: "test",
      file: "/blog/agent-board/validation.json",
      capturedAt: "2026-10-08T10:55:14.443Z",
      sourceSnapshotId:
        "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
      command:
        "pnpm lint; pnpm typecheck; pnpm build; pnpm test:install; pnpm exec playwright test --config=playwright.agent-board.config.ts tests/agent-board.spec.ts",
      environment:
        "Linux GLIBC 2.28, Next.js 16.3.8 Webpack/SWC WASM, Chrome/Playwright; isolated task snapshot",
      method:
        "Static checks, fixture browser assertions and fresh Registry consumer production build/browser verification",
      sampleCount: 20,
      scope: {
        "zh-CN":
          "通过：本地组件交互与独立安装。待验证：真实 Agent 服务和业务验收；无优化对比数值。",
        en: "Passed: local component interaction and independent installation. Unverified: real Agent services and business acceptance; no comparative improvement metrics.",
      },
    },
    {
      id: "captures",
      type: "screenshot",
      file: "/blog/agent-board/captures.json",
      capturedAt: "2026-10-08T10:53:16.529Z",
      sourceSnapshotId:
        "6d9ceae38768996679248d8f082bf76ddc671a0ec1760171b45b57d9a74a3393",
      command: "node scripts/capture-agent-board.mjs",
      environment:
        "Chrome/Playwright; 1440×1000 and 390×844; zh-CN/en, light/dark, reduced motion",
      method:
        "Static export screenshots with source file hashes and per-image viewport/theme/locale/fixture metadata",
      sampleCount: 12,
      scope: {
        "zh-CN":
          "通过：四种视图、详情、未知回执、刷新失败、移动端和深色英文截图。",
        en: "Passed: four views, detail, unknown receipt, refresh failure, phone and dark English captures.",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "全部运行、审批和用量均为本地确定性样例；真实执行、授权、持久化与业务验收待消费项目接入。",
      en: "All runs, approval and usage are deterministic local samples. Real execution, authorization, persistence and acceptance require caller integration.",
    },
    {
      "zh-CN":
        "不提供代码差异编辑、远程浏览器控制、依赖图、历史趋势与虚拟列表。",
      en: "Diff editing, remote browser control, dependency graphs, historical trends and virtualization are outside scope.",
    },
  ],
}
