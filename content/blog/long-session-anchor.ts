import type { BlogPost } from "../../lib/blog-model"
export const longSessionAnchor: BlogPost = {
  slug: "long-session-anchor",
  title: {
    "zh-CN": "长会话如何保留阅读位置",
    en: "Keeping the reading position in long streams",
  },
  summary: {
    "zh-CN": "Set 去重、显式修订与稳定 ID 锚点，保留全文和按需屏外布局。",
    en: "Keeping the reading position in long streams",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "performance",
  tags: ["performance", "OPT-03"],
  optimizationIds: ["OPT-03"],
  relatedComponents: ["chat-message", "activity-timeline"],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion:
    "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
  resultVersion:
    "worktree:39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  sourceSnapshotId:
    "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  body: [
    {
      type: "heading",
      id: "contract",
      text: {
        "zh-CN": "更新与兼容",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "去重保留 ID 首次出现的位置和最新 payload。调用方可提供 revision，须覆盖追加、历史修订、删除、重排和状态变化；省略时保留兼容检测。未变化的行复用渲染结果。64px 跟随、未读提醒和补历史锚点继续有效；同一帧多个提交不会漏计未读。",
      },
    },
    {
      type: "heading",
      id: "measurements",
      text: {
        "zh-CN": "完整 DOM 候选与目标",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "conversation",
          label: {
            "zh-CN": "Conversation 5000 条完整 DOM 追加 p95",
          },
          unit: "ms",
          direction: "lower",
          before: 1219,
          after: 285.3999996185303,
          target: 100,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-full-dom",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity",
          label: {
            "zh-CN": "Activity 5000 条完整 DOM 追加 p95",
          },
          unit: "ms",
          direction: "lower",
          before: 434.8999996185303,
          after: 156.89999961853027,
          target: 100,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-full-dom",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "前后各测 1000/5000/10000 条记录，3 轮各 30 次追加、历史修订和补历史。完整 DOM 候选仍超过 100ms 暂定目标，因此保留该候选报告，并提供默认关闭的 deferOffscreen，使用 content-visibility 延迟屏外布局。共享负载不受控，表格不计算性能百分比。",
      },
    },
    {
      type: "heading",
      id: "reading",
      text: {
        "zh-CN": "阅读体验",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "全部文本仍在 DOM。浏览器程序化查找用于验证文本可检索；阅读位置单独通过揭示匹配项后补历史验证，不将 window.find 的选区行为当作浏览器原生查找界面已验收。选中文本时暂停自动跟随；稳定 ID 锚点跟随动态高度恢复。",
      },
    },
    {
      type: "demo",
      componentSlug: "chat-message",
    },
    {
      type: "heading",
      id: "deferred-results",
      text: {
        "zh-CN": "可选屏外布局实测",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "conversation-append",
          label: {
            "zh-CN": "conversation 5000 条 append p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 150.60000038146973,
          target: 100,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "conversation-update",
          label: {
            "zh-CN": "conversation 5000 条 update p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 33.69999885559082,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "conversation-prepend",
          label: {
            "zh-CN": "conversation 5000 条 prepend p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 90.79999923706055,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity-append",
          label: {
            "zh-CN": "activity 5000 条 append p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 114,
          target: 100,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity-update",
          label: {
            "zh-CN": "activity 5000 条 update p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 33.69999885559082,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity-prepend",
          label: {
            "zh-CN": "activity 5000 条 prepend p95",
          },
          unit: "ms",
          direction: "lower",
          before: null,
          after: 81.10000038146973,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "streams-deferred",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "最终 5000 条候选采用显式 revision 和 deferOffscreen，每种组件 3 轮各 30 次操作。Conversation/Activity 追加 p95 分别约 151/114ms，仍超过暂定 100ms。该报告的长内容定位未稳定可见，相关样本不能视为展开验收，另用键盘建立阅读位置后重新测量。原报告保留，未覆盖失败或未达标项。",
      },
    },
    {
      type: "heading",
      id: "expanded-scenarios",
      text: {
        "zh-CN": "长内容与同帧突发提交",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "重新采集使用真实键盘 Home 建立阅读位置，再修改 2000 行正文、展开 Activity 详情并揭示开头。1000/5000/10000 条、每个组件各 3 轮的 18 个样本均记录为已展开且可见；随后单独测量同一帧的 30 次提交。此项测试的起点、阅读位置和工作量不同于正常追加，不合并计算百分比，也不把 30 次突发总耗时当作单次追加耗时。",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "conversation-longContentMs",
          label: {
            "zh-CN": "conversation 5000 条 2000 行长内容揭示",
          },
          unit: "ms",
          direction: "lower",
          before: 2074.7999992370605,
          after: 149.19999885559082,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "expanded-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "conversation-burst30CommitsMs",
          label: {
            "zh-CN": "conversation 5000 条 30 次同帧提交总耗时",
          },
          unit: "ms",
          direction: "lower",
          before: 24566.10000038147,
          after: 603.7999992370605,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "expanded-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity-longContentMs",
          label: {
            "zh-CN": "activity 5000 条 2000 行长内容揭示",
          },
          unit: "ms",
          direction: "lower",
          before: 730.6000003814697,
          after: 169.5,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "expanded-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "activity-burst30CommitsMs",
          label: {
            "zh-CN": "activity 5000 条 30 次同帧提交总耗时",
          },
          unit: "ms",
          direction: "lower",
          before: 7125.199998855591,
          after: 1533.7000007629395,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "expanded-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
      ],
    },
  ],
  evidence: [
    {
      id: "streams-before",
      type: "measurement",
      file: "/blog/long-session-anchor/2026-10-08/streams-before.json",
      capturedAt: "2026-10-08T07:43:52.392Z",
      sourceSnapshotId:
        "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
      command:
        "node scripts/capture-stream-baseline.mjs <before> <report> before",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages per count/component, 30 samples each append/history update/prepend. Start before flushSync; end after two rAF opportunities (commit plus frame opportunities, not proof of compositor paint). Stable record identity. Before uses compatibility detection, after explicit revision. Heap is a Chromium observation without forced GC; no memory delta claim.",
      sampleCount: 3,
      scope: {
        "zh-CN": "兼容检测路径，完整 DOM，6 组容量/组件，3 轮各 90 次更新。",
      },
    },
    {
      id: "streams-full-dom",
      type: "measurement",
      file: "/blog/long-session-anchor/2026-10-08/streams-after-full-dom.json",
      capturedAt: "2026-10-08T07:33:46.455Z",
      sourceSnapshotId:
        "82cb4a77af3e8cc4ece4c5624cb177c6c4e3d4243408a79c7178b15d1a7942fc",
      command:
        "node scripts/capture-stream-baseline.mjs <candidate> <report> after",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages per count/component, 30 samples each append/history update/prepend. Start before flushSync; end after two rAF opportunities (commit plus frame opportunities, not proof of compositor paint). Stable record identity. Before uses compatibility detection, after explicit revision. Heap is a Chromium observation without forced GC; no memory delta claim.",
      sampleCount: 3,
      scope: {
        "zh-CN": "显式 revision 与行复用的完整 DOM 候选；尚未启用屏外布局。",
      },
    },
    {
      id: "streams-deferred",
      type: "measurement",
      file: "/blog/long-session-anchor/2026-10-08/streams-after-deferred.json",
      capturedAt: "2026-10-08T08:04:36.910Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "See scripts/capture-stream-baseline.mjs; built isolated snapshot",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages/count/component, 30 samples each append/history update/prepend unless scenarios-only; start before flushSync and end after two rAF opportunities. Long content is revealed and Activity details expanded; 30 same-frame append commits are separately measured. Full DOM before; explicit revision and optional CSS deferral after. Heap without forced GC; not proof of compositor paint, real-time transport or stable CI.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "5000 条、每种组件 3 轮各 90 次操作；长内容可见性为 false，单列重测。",
      },
    },
    {
      id: "reading-regression",
      type: "test",
      file: "/blog/canvas-indexes/2026-10-08/verification.json",
      capturedAt: "2026-10-08T08:08:08.392Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "pnpm exec playwright test --grep-invert @performance --workers=2",
      environment:
        '{"browser":"138.0.7204.92","viewport":{"width":1440,"height":1000},"node":"v24.21.0","sharedHost":true}',
      method: "See raw report for exact checks and boundaries",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "全文存在、可检索、锚点保持和同帧未读计数；人工查找 UI 未验收。",
      },
    },
    {
      id: "expanded-after",
      type: "measurement",
      file: "/blog/long-session-anchor/2026-10-08/streams-scenarios-after.json",
      capturedAt: "2026-10-08T08:08:49.477Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "STREAM_SCENARIOS_ONLY=1 node scripts/capture-stream-baseline.mjs <built-after> <report> after",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages/count/component, 30 samples each append/history update/prepend unless scenarios-only; start before flushSync and end after two rAF opportunities. Keyboard Home establishes a reading position before long content is revealed in two passes and Activity details expanded; 30 same-frame append commits are separately measured. Full DOM before; explicit revision and optional CSS deferral after. Heap without forced GC; not proof of compositor paint, real-time transport or stable CI.",
      sampleCount: 18,
      scope: {
        "zh-CN":
          "1000/5000/10000 条 × 两组件 × 三轮；每轮展开 2000 行长内容及30次同帧提交，全部展开且可见。",
      },
    },
    {
      id: "expanded-before",
      type: "measurement",
      file: "/blog/long-session-anchor/2026-10-08/streams-scenarios-before.json",
      capturedAt: "2026-10-08T08:14:13.213Z",
      sourceSnapshotId:
        "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
      command:
        "STREAM_SCENARIOS_ONLY=1 node scripts/capture-stream-baseline.mjs <built-before> <report> before",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages/count/component, 30 samples each append/history update/prepend unless scenarios-only; start before flushSync and end after two rAF opportunities. Keyboard Home establishes a reading position before long content is revealed in two passes and Activity details expanded; 30 same-frame append commits are separately measured. Full DOM before; explicit revision and optional CSS deferral after. Heap without forced GC; not proof of compositor paint, real-time transport or stable CI.",
      sampleCount: 18,
      scope: {
        "zh-CN":
          "优化前1000/5000/10000 条 × 两组件 × 三轮；18轮长内容均展开且可见，30次突发提交单独记录。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN": "100ms 是稳定 CI 的暂定门禁，共享主机报告不能替代 CI 校准。",
    },
    {
      "zh-CN": "deferOffscreen 默认关闭；不支持 CSS 的浏览器使用完整布局。",
    },
    {
      "zh-CN":
        "原生浏览器查找界面和实际辅助技术仍需人工验收；自动测试证明全文存在、可检索和阅读锚点。",
    },
  ],
}
