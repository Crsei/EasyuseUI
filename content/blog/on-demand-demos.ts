import type { BlogPost } from "../../lib/blog-model"
export const onDemandDemos: BlogPost = {
  slug: "on-demand-demos",
  title: {
    "zh-CN": "组件目录如何按需加载 Demo",
    en: "Loading component demos on demand",
  },
  summary: {
    "zh-CN":
      "把组件元数据与交互示例分开，让目录、词典和文章在主动预览前保持轻量。",
    en: "Separate metadata from interactive examples so the catalog, dictionary and articles remain lightweight until a preview is requested.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "performance",
  tags: ["performance", "Demo", "Registry"],
  optimizationIds: ["OPT-01", "OPT-08", "OPT-11"],
  relatedComponents: ["button", "theme-boundary", "workspace-shell"],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion:
    "worktree:3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
  resultVersion: null,
  sourceSnapshotId:
    "b45e99b3af8ad597430c027ed19dcc8e792edfdf8dfaa8ab0de1e5c5be810de3",
  body: [
    {
      type: "heading",
      id: "problem",
      text: {
        "zh-CN": "问题与基线",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "目录原先静态导入并挂载所有 Demo。优化前的生产快照在组件目录中同时存在 9 个 Canvas 实例；词典与 Button 详情即使没有画布实例，也下载了间接依赖。下面的字节数包含导航预取，不能仅凭 DOM 中没有 Canvas 判断按需加载成功。",
      },
    },
    {
      type: "heading",
      id: "implementation",
      text: {
        "zh-CN": "拆分与兼容边界",
      },
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "纯 Manifest 保留 URL 和安装 ID；导航、目录索引和 Registry 依赖通过同一来源校验。全站只加载标题导航所需的少量字段。",
        },
        {
          "zh-CN":
            "显式 loader 将示例拆成动态模块；目录与词典在主动预览时加载，详情仅自动加载当前组件。一次只挂载一个预览，关闭后卸载；切换语言保留当前示例状态。",
        },
        {
          "zh-CN":
            "站点导航关闭自动预取，避免尚未访问的 Canvas 页面把引擎重新带入初始网络请求。浏览器测试同时检查响应内容中的引擎标记，并在主动打开 Canvas 后验证检测器确实能够识别引擎。",
        },
      ],
    },
    {
      type: "comparison",
      before: {
        src: "/blog/on-demand-demos/2026-10-08/before-components-light.png",
        alt: {
          "zh-CN": "优化前的组件目录：所有示例网格",
          en: "Component catalog before optimization, with all example grids",
        },
        caption: {
          "zh-CN": "优化前，目录同时挂载所有示例。",
        },
        sourceSnapshotId:
          "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
        capturedAt: "2026-10-08T07:05:53.360Z",
        fixture: "/components/",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/on-demand-demos/2026-10-08/after-components-light.png",
        alt: {
          "zh-CN": "优化后的组件目录：搜索、分类与主动预览",
          en: "Optimized component catalog with search, categories and explicit preview",
        },
        caption: {
          "zh-CN": "优化后，只显示元数据，交互示例由主动预览加载。",
        },
        sourceSnapshotId:
          "b45e99b3af8ad597430c027ed19dcc8e792edfdf8dfaa8ab0de1e5c5be810de3",
        capturedAt: "2026-10-08T07:35:24.509Z",
        fixture: "/components/",
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
      id: "results",
      text: {
        "zh-CN": "生产候选测量",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "initial-js-0",
          label: {
            "zh-CN": "/components/ 初始 JS（gzip 估算）",
            en: "/components/ initial JS (gzip estimate)",
          },
          unit: "B",
          direction: "lower",
          before: 459598,
          after: 343716,
          target: 380000,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after-network",
          beforeContext:
            "chrome138-linux-1440x1000-light-zh-CN-/components/-fresh-context-response-body-gzip-v1",
          afterContext:
            "chrome138-linux-1440x1000-light-zh-CN-/components/-fresh-context-response-body-gzip-v1",
        },
        {
          key: "initial-js-1",
          label: {
            "zh-CN": "/dictionary/ 初始 JS（gzip 估算）",
            en: "/dictionary/ initial JS (gzip estimate)",
          },
          unit: "B",
          direction: "lower",
          before: 508697,
          after: 360872,
          target: 400000,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after-network",
          beforeContext:
            "chrome138-linux-1440x1000-light-zh-CN-/dictionary/-fresh-context-response-body-gzip-v1",
          afterContext:
            "chrome138-linux-1440x1000-light-zh-CN-/dictionary/-fresh-context-response-body-gzip-v1",
        },
        {
          key: "initial-js-2",
          label: {
            "zh-CN": "/docs/button/ 初始 JS（gzip 估算）",
            en: "/docs/button/ initial JS (gzip estimate)",
          },
          unit: "B",
          direction: "lower",
          before: 508697,
          after: 326530,
          target: 360000,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after-network",
          beforeContext:
            "chrome138-linux-1440x1000-light-zh-CN-/docs/button/-fresh-context-response-body-gzip-v1",
          afterContext:
            "chrome138-linux-1440x1000-light-zh-CN-/docs/button/-fresh-context-response-body-gzip-v1",
        },
        {
          key: "canvas-instances",
          label: {
            "zh-CN": "目录默认 Canvas 实例",
            en: "Default Canvas instances in catalog",
          },
          unit: "instances",
          direction: "lower",
          before: 9,
          after: 0,
          target: 0,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after-network",
          beforeContext:
            "chrome138-linux-1440x1000-light-zh-CN-/components/-fresh-context-response-body-gzip-v1",
          afterContext:
            "chrome138-linux-1440x1000-light-zh-CN-/components/-fresh-context-response-body-gzip-v1",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "同一路由的三次 JS 字节样本一致。变化百分比只描述这些构建产物的 gzip 估算差异；候选版本同时加入 Blog 与基础组件，不能把差值解释成单个代码改动的独立贡献。交互耗时保留在原始报告，因共享主机负载不可控，不显示耗时改善百分比。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "另以真实点击页头主题按钮、确认页面进入深色并等待两次 rAF，记录首个共享控件可用时间。三个路由各三次新上下文的中位数分别为：目录 2307.7→1205.2ms、词典 1714.4→1129.6ms、Button 详情 1545.7→1047.6ms。报告保留 hydration 前失效点击及重试；这只是一个控件可用，不代表全页 TTI 或实际绘制完成。该次候选包含后续并行通用组件，源码快照与上方字节报告分别标识；共享负载下不计算耗时改善百分比。",
      },
    },
    {
      type: "heading",
      id: "current-demo",
      text: {
        "zh-CN": "打开当前实现",
      },
    },
    {
      type: "demo",
      componentSlug: "button",
    },
  ],
  evidence: [
    {
      id: "before-readiness",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/readiness-before.json",
      capturedAt: "2026-10-08T08:30:26.058Z",
      sourceSnapshotId:
        "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
      command:
        "node scripts/capture-readiness.mjs <built-before-snapshot> <report.json> before",
      environment:
        "Chrome for Testing 138.0.7204.92 / Node 24.21.0 / Linux / 1440×1000 / zh-CN / light / shared host",
      method:
        "Three fresh contexts per route. Navigation time origin to a real shared-header theme button changing the document to dark, then two rAF opportunities. Lost pre-hydration inputs and retries retained. One usable control, not full-page TTI or compositor paint; uncontrolled host load.",
      sampleCount: 9,
      scope: {
        "zh-CN":
          "目录、词典与 Button 详情各三次；测一个共享控件首次响应，未测整页 TTI。",
      },
    },
    {
      id: "after-readiness",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/readiness-after.json",
      capturedAt: "2026-10-08T08:30:19.552Z",
      sourceSnapshotId:
        "7cdc39bbb5bbbd492e7b00688488fb1f7867bf649cbb06cf856a5b31512fa9de",
      command:
        "node scripts/capture-readiness.mjs <built-after-snapshot> <report.json> after",
      environment:
        "Chrome for Testing 138.0.7204.92 / Node 24.21.0 / Linux / 1440×1000 / zh-CN / light / shared host",
      method:
        "Three fresh contexts per route. Navigation time origin to a real shared-header theme button changing the document to dark, then two rAF opportunities. Lost pre-hydration inputs and retries retained. One usable control, not full-page TTI or compositor paint; uncontrolled host load.",
      sampleCount: 9,
      scope: {
        "zh-CN":
          "目录、词典与 Button 详情各三次；包含后续并行通用组件的候选，范围不同于首轮网络报告。",
      },
    },
    {
      id: "m1-verification",
      type: "test",
      file: "/blog/on-demand-demos/2026-10-08/verification.json",
      capturedAt: "2026-10-08T07:58:42.653573+00:00",
      sourceSnapshotId:
        "fd8be976addecb9a1bfabbde99213129fb8b4a4e2fc9f6b8fbd01c8696a2fc6f",
      command:
        "pnpm exec playwright test tests/accessibility.spec.ts tests/loading-budget.spec.ts tests/blog.spec.ts --workers=1",
      environment:
        "Chrome for Testing 138.0.7204.92 / Linux / production export / shared host",
      method:
        "Independent suite results from named focused runs; canceled/retry import checked after correcting the test locator. No aggregate green claim for unrelated stream experiments.",
      sampleCount: 19,
      scope: {
        "zh-CN":
          "首屏网络、AA 自动扫描与 Blog 行为；只对本地静态站点的按需展示范围标记已验证。",
      },
    },
    {
      id: "before-network",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/before.json",
      capturedAt: "2026-10-08T07:05:53.360Z",
      sourceSnapshotId:
        "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
      command:
        "node scripts/capture-page-baseline.mjs <frozen-before-snapshot> public/blog/on-demand-demos/2026-10-08 before",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","arch":"x64","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh browser contexts per route; confirm hydration by switching zh-CN -> en -> zh-CN. Capture JS responses after network idle. gzip bytes are computed estimates, not measured transport compression. Timing includes browser automation and is an observation, not TTI or a CI budget.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "三个生产构建路由，各三次新上下文；含自动导航预取，保存每个 JS 响应、gzip 估算、挂载数量与语言切换可用性。",
      },
    },
    {
      id: "after-network",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/after.json",
      capturedAt: "2026-10-08T07:35:24.509Z",
      sourceSnapshotId:
        "b45e99b3af8ad597430c027ed19dcc8e792edfdf8dfaa8ab0de1e5c5be810de3",
      command:
        "node scripts/capture-page-baseline.mjs <frozen-after-snapshot> public/blog/on-demand-demos/2026-10-08 after",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","arch":"x64","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh browser contexts per route; confirm hydration by switching zh-CN -> en -> zh-CN. Capture JS responses after network idle. gzip bytes are computed estimates, not measured transport compression. Timing includes browser automation and is an observation, not TTI or a CI budget.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "三个生产构建路由，各三次新上下文；含自动导航预取，保存每个 JS 响应、gzip 估算、挂载数量与语言切换可用性。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "gzip 数据是对响应内容的压缩估算，不是静态预览服务器的实际压缩传输；没有测量 JS 解析 CPU 成本。",
    },
    {
      "zh-CN":
        "导航到语言切换回调的时间包含浏览器自动化，只用于确认可交互，不称为 TTI。",
    },
    {
      "zh-CN":
        "共享主机数据不用于承诺生产耗时或真实服务收益。网络与挂载验收独立于 Canvas 性能专项。",
    },
    {
      "zh-CN":
        "截图保存测量时的候选版本；“打开当前实现”可能随后续源码更新，不是历史组件运行快照。",
    },
  ],
}
