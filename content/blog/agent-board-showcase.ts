import type { BlogPost } from "../../lib/blog-model"
export const agentBoardShowcase: BlogPost = {
  slug: "agent-board-showcase",
  title: {
    "zh-CN": "Agent 运行看板：从状态到人工介入",
    en: "Agent runs: from runtime status to human attention",
  },
  summary: {
    "zh-CN":
      "Board、List、Inbox 和 Insights 共享受控快照，扩展只读依赖图、来源用量历史与大集合虚拟列表，并记录同源渲染测量。",
    en: "Controlled snapshots power Board, List, Inbox and Insights, extended with read-only dependencies, source usage history and virtual lists with comparable rendering measurements.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: true,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["Agent", "Board", "Inbox", "Inspector"],
  optimizationIds: [
    "AG0",
    "AG1",
    "AG2",
    "AG3",
    "AG4",
    "P2-D",
    "P2-H",
    "P2-V",
    "P2-M",
  ],
  relatedComponents: [
    "agent-board-workspace",
    "agent-run-board",
    "attention-queue",
    "agent-run-inspector",
    "agent-usage-summary",
    "tool-call",
    "agent-dependency-graph",
    "agent-usage-history",
    "agent-run-virtual-list",
  ],
  relatedPosts: [],
  baselineVersion: "d5cea15",
  resultVersion: null,
  sourceSnapshotId:
    "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
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
          "首版完成 AG0–AG4：相关回归 46 项通过，最终 Agent 场景 20 项及文章验收 1 项通过，12 张截图与原始源码快照保留。P2 在合并正式 Work Items 后完成构建、30 项 Agent/文章/扩展回归与独立 Registry 消费项目验证；补充下述 8 张实图和同源测量。verified 只覆盖本地组件、分发和记录的比较；真实服务与业务验收仍未验证。",
        en: "AG0–AG4 passed 46 related regression cases, then 20 final Agent cases and one article case. Twelve original captures retain their source snapshot. P2, integrated with the formal Work Items implementation, passed builds, 30 Agent/article/extension cases and independent Registry consumer checks, with eight additional captures and the comparable measurements below. Verified covers local components, distribution and the recorded comparison; real services and business acceptance remain unverified.",
      },
    },
    {
      type: "heading",
      id: "extensions",
      text: {
        "zh-CN": "依赖、来源历史与大集合",
        en: "Dependencies, source history and large collections",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "依赖边由调用方明确提供，运行完成不会自动满足依赖；缺失端点保留 ID，筛选范围外上下文可从列表访问。只读 Canvas 按需加载，失败可重读，既有运行数据保持可用。历史观测以来源时间区间和版本去重，按运行、指标及币种分开；缺失或不连续区间断开曲线，有效零值仍绘制。",
        en: "Callers supply explicit dependency edges; run completion never satisfies them. Missing endpoints retain their IDs and filtered context remains available in the list. The read-only Canvas loads on demand and can retry without losing run data. Historical source intervals are revision-deduplicated and separated by run, metric and currency. Missing or noncontiguous intervals break lines; valid zero values remain visible.",
      },
    },
    {
      type: "link",
      href: "/workspace/agents/scale/",
      text: {
        "zh-CN": "打开 1,000 条运行的列表对照示例",
        en: "Open the 1,000-run list comparison",
      },
    },
    {
      type: "image",
      image: {
        src: "/blog/agent-board/p2/dependencies-1440.png",
        alt: {
          "zh-CN": "只读依赖：来源关系与缺失端点",
          en: "Read-only dependencies and missing endpoints",
        },
        caption: {
          "zh-CN": "只读依赖：来源关系与缺失端点；确定性本地样例。",
          en: "Read-only dependencies and missing endpoints. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:47.147Z",
        fixture: "local-timestamped-dependencies-v1",
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
        src: "/blog/agent-board/p2/history-tokens-1440.png",
        alt: {
          "zh-CN": "来源历史：Tokens 缺失区间保留断点",
          en: "Source history: gaps remain in token intervals",
        },
        caption: {
          "zh-CN": "来源历史：Tokens 缺失区间保留断点；确定性本地样例。",
          en: "Source history: gaps remain in token intervals. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:49.152Z",
        fixture: "local-timestamped-dependencies-v1",
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
        src: "/blog/agent-board/p2/history-cost-1440.png",
        alt: {
          "zh-CN": "来源历史：USD 与 EUR 分开显示",
          en: "Source history: separate USD and EUR series",
        },
        caption: {
          "zh-CN": "来源历史：USD 与 EUR 分开显示；确定性本地样例。",
          en: "Source history: separate USD and EUR series. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:51.150Z",
        fixture: "local-timestamped-dependencies-v1",
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
        src: "/blog/agent-board/p2/virtual-1440.png",
        alt: {
          "zh-CN": "虚拟列表：同一组 1,000 条运行",
          en: "Virtual list: the same 1,000 runs",
        },
        caption: {
          "zh-CN": "虚拟列表：同一组 1,000 条运行；确定性本地样例。",
          en: "Virtual list: the same 1,000 runs. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:53.206Z",
        fixture: "local-1000-source-runs-v1",
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
        src: "/blog/agent-board/p2/native-1440.png",
        alt: {
          "zh-CN": "普通列表：相同来源、行组件和视口",
          en: "Native list: identical source, row component and viewport",
        },
        caption: {
          "zh-CN": "普通列表：相同来源、行组件和视口；确定性本地样例。",
          en: "Native list: identical source, row component and viewport. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:56.009Z",
        fixture: "local-1000-source-runs-v1",
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
        src: "/blog/agent-board/p2/dependencies-390.png",
        alt: {
          "zh-CN": "390px：只读依赖与可访问列表",
          en: "390px: read-only dependencies and accessible list",
        },
        caption: {
          "zh-CN": "390px：只读依赖与可访问列表；确定性本地样例。",
          en: "390px: read-only dependencies and accessible list. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:52:59.236Z",
        fixture: "local-timestamped-dependencies-v1",
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
        src: "/blog/agent-board/p2/virtual-390.png",
        alt: {
          "zh-CN": "390px：End 到末行，焦点可见",
          en: "390px: End reaches the last row with visible focus",
        },
        caption: {
          "zh-CN": "390px：End 到末行，焦点可见；确定性本地样例。",
          en: "390px: End reaches the last row with visible focus. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:53:01.154Z",
        fixture: "local-1000-source-runs-v1",
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
        src: "/blog/agent-board/p2/dark-history-en.png",
        alt: {
          "zh-CN": "深色英文：历史指标切换保持观测口径",
          en: "Dark English: history metrics preserve source scope",
        },
        caption: {
          "zh-CN": "深色英文：历史指标切换保持观测口径；确定性本地样例。",
          en: "Dark English: history metrics preserve source scope. Deterministic local fixture.",
        },
        sourceSnapshotId:
          "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
        capturedAt: "2026-10-08T11:53:03.327Z",
        fixture: "local-timestamped-dependencies-v1",
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
      id: "render-measurements",
      text: {
        "zh-CN": "同源渲染测量",
        en: "Comparable rendering measurements",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "对照在同一源码快照、同一 1,000 条来源运行、同一 AgentRunRow、分组、1440×1000 视口与 560px 列表高度下进行；中文文案、浅色、减少动画，每种模式 3 次独立浏览器上下文。挂载行数中位数为普通列表 1,000 行、虚拟列表 8 行；两者行高一致，打开首条详情都需一次点击。结果只衡量 DOM 挂载数量与这一条固定路径，未测量速度、内存、服务效率或用户任务完成率。",
        en: "The comparison uses one source snapshot, the same 1,000 source runs, AgentRunRow component and groups, a 1440×1000 viewport and a 560px list height, Chinese/light/reduced motion, with three fresh browser contexts per mode. Median mounted rows are 1,000 for native rendering and 8 for virtual rendering. Row height is identical and opening the first detail requires one click in both modes. This measures mounted DOM rows and one fixed path; latency, memory, service efficiency and user task completion were not measured.",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "mounted-run-rows",
          label: {
            "zh-CN": "挂载运行行数",
            en: "Mounted run rows",
          },
          unit: "rows",
          direction: "lower",
          before: 1000,
          after: 8,
          target: null,
          statistic: "median; native → virtual; same source/viewport",
          sampleCount: 3,
          evidenceId: "p2-measurements",
          beforeContext:
            "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b:1000-waiting-source-runs:1440x1000:list-viewport-560:zh-CN:light:reduced-motion",
          afterContext:
            "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b:1000-waiting-source-runs:1440x1000:list-viewport-560:zh-CN:light:reduced-motion",
        },
        {
          key: "first-detail-activations",
          label: {
            "zh-CN": "首条详情打开步骤",
            en: "First-detail activations",
          },
          unit: "clicks",
          direction: "lower",
          before: 1,
          after: 1,
          target: null,
          statistic: "median; fixed first-row path",
          sampleCount: 3,
          evidenceId: "p2-measurements",
          beforeContext:
            "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b:1000-waiting-source-runs:1440x1000:list-viewport-560:zh-CN:light:reduced-motion",
          afterContext:
            "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b:1000-waiting-source-runs:1440x1000:list-viewport-560:zh-CN:light:reduced-motion",
        },
      ],
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
    {
      id: "p2-captures",
      type: "screenshot",
      file: "/blog/agent-board/p2/captures.json",
      sourceSnapshotId:
        "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
      capturedAt: "2026-10-08T11:53:19.735Z",
      command: "node scripts/capture-agent-board-p2.mjs",
      environment:
        "Chrome via Playwright, static Next.js Webpack export, 1440x1000, zh-CN/light/reduced motion",
      method:
        "Eight captures; source closure hashes and PNG hashes; viewport/theme/locale/fixture recorded per image",
      sampleCount: 8,
      scope: {
        "zh-CN":
          "通过：依赖、两种历史指标、大集合普通/虚拟列表、390px 和深色英文实图。",
        en: "Passed: dependencies, two history metrics, native/virtual large lists, 390px and dark English captures.",
      },
    },
    {
      id: "p2-measurements",
      type: "measurement",
      file: "/blog/agent-board/p2/measurements.json",
      sourceSnapshotId:
        "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
      capturedAt: "2026-10-08T11:53:19.735Z",
      command: "node scripts/capture-agent-board-p2.mjs",
      environment:
        "Chrome via Playwright, static Next.js Webpack export, 1440x1000, zh-CN/light/reduced motion",
      method:
        "Three fresh contexts per rendering mode; same 1000 source rows, AgentRunRow, groups and 560px list viewport; median mounted rows and first-detail activations",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "通过：固定同源对照；仅 DOM 行数与首条详情路径。未测服务、延迟和内存。",
        en: "Passed: fixed comparable rendering modes, limited to DOM rows and the first-detail path. Services, latency and memory are unmeasured.",
      },
    },
    {
      id: "p2-validation",
      type: "test",
      file: "/blog/agent-board/p2/validation.json",
      sourceSnapshotId:
        "62370c54e61b86c2333e692b2039622094c44fb1b425939d827138107a2f404b",
      capturedAt: "2026-10-08T11:53:19.735Z",
      command:
        "pnpm lint; pnpm typecheck; pnpm build; pnpm check:i18n; pnpm test:install; pnpm exec playwright test --config playwright.agent-board.config.ts",
      environment:
        "Linux GLIBC 2.28, Next 16.3.8 Webpack/SWC WASM, Chrome/Playwright; isolated snapshot based on 24d1d7b",
      method:
        "Controlled fixture browser assertions, source/hash verification and fresh installed consumer production build/browser checks",
      sampleCount: 30,
      scope: {
        "zh-CN":
          "通过：本地 Agent 交互、P2 扩展、独立安装；真实服务与业务验收未验证。",
        en: "Passed: local Agent interaction, P2 extensions and independent installation. Real services and business acceptance are unverified.",
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
        "代码差异编辑、文件系统浏览及远程浏览器控制仍不在本次范围。依赖图只读；历史是已加载来源区间；虚拟列表不提供远程分页。",
      en: "Diff editing, file browsing and remote browser control remain outside this scope. Dependencies are read-only, history covers loaded source intervals, and virtualization does not provide remote pagination.",
    },
  ],
}
