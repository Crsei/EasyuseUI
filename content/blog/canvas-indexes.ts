import type { BlogPost } from "../../lib/blog-model"
export const canvasIndexes: BlogPost = {
  slug: "canvas-indexes",
  title: {
    "zh-CN": "Canvas 从重复扫描改为索引查询",
    en: "Replacing repeated Canvas scans with indexes",
  },
  summary: {
    "zh-CN": "一次扫描建立索引，独立更新选择集合；区分纯构图收益与浏览器容量。",
    en: "Replacing repeated Canvas scans with indexes",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "canvas",
  tags: ["canvas", "OPT-02", "OPT-05", "OPT-11"],
  optimizationIds: ["OPT-02", "OPT-05", "OPT-11"],
  relatedComponents: ["workflow-canvas", "canvas-workspace"],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion:
    "fd8be976addecb9a1bfabbde99213129fb8b4a4e2fc9f6b8fbd01c8696a2fc6f",
  resultVersion:
    "worktree:39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  sourceSnapshotId:
    "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
  body: [
    {
      type: "heading",
      id: "problem",
      text: {
        "zh-CN": "热点与边界",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "原实现为每个节点扫描定义、问题和全部边，再为每条边扫描节点。新实现按实际输入建立 node/frame/definition/issues/edges/fallback ports 索引，复杂度为 O(N+E+I+D)。选择集合单独失效；运行展示复用未变化的 payload。未知节点与同端口去重保持原行为。",
      },
    },
    {
      type: "heading",
      id: "projection",
      text: {
        "zh-CN": "纯构图实验",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "下表只测等价投影函数：同一 Node 进程交替运行优化前后的 find/filter/flatMap/some 和索引版本。每组预热 5 次，3 轮各 30 样本。它不包含 React、DOM、引擎初始化或业务服务，不代表用户交互快了相同比例。",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "construction-200",
          label: {
            "zh-CN": "200 节点纯投影构建 p95",
          },
          unit: "ms",
          direction: "lower",
          before: 5.173306000000025,
          after: 0.5035340000000019,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "pure-construction",
          beforeContext:
            "node24-linux-equivalent-projection-200-alternating-3x30-v1",
          afterContext:
            "node24-linux-equivalent-projection-200-alternating-3x30-v1",
        },
        {
          key: "construction-500",
          label: {
            "zh-CN": "500 节点纯投影构建 p95",
          },
          unit: "ms",
          direction: "lower",
          before: 35.381766999999854,
          after: 1.297853000000032,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "pure-construction",
          beforeContext:
            "node24-linux-equivalent-projection-500-alternating-3x30-v1",
          afterContext:
            "node24-linux-equivalent-projection-500-alternating-3x30-v1",
        },
        {
          key: "construction-1000",
          label: {
            "zh-CN": "1000 节点纯投影构建 p95",
          },
          unit: "ms",
          direction: "lower",
          before: 117.46553099999983,
          after: 1.4080680000006396,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "pure-construction",
          beforeContext:
            "node24-linux-equivalent-projection-1000-alternating-3x30-v1",
          afterContext:
            "node24-linux-equivalent-projection-1000-alternating-3x30-v1",
        },
      ],
    },
    {
      type: "heading",
      id: "browser",
      text: {
        "zh-CN": "浏览器容量与整理",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "固定 50/200/500/1000 节点，使用链路加前向分支拓扑，边数为 1.5N−2；独立记录冷启动、Inspector、真实拖动、长任务与堆观察。1000 节点超出原有 500 节点/1000 连线命令限制，能够显示与选择不代表允许提交。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "更多工具提供当前作用域 DAG 布局。先预览，可应用或取消；只提交坐标并一次撤销。保留实际尺寸、调用方固定节点和分组边界；循环、子流程和容量不足会说明原因。异步结果绑定源对象，过期结果不写入。布局不承诺连线无交叉。",
      },
    },
    {
      type: "demo",
      componentSlug: "workflow-canvas",
    },
    {
      type: "heading",
      id: "browser-results",
      text: {
        "zh-CN": "浏览器实测与未达标项",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "浏览器报告的优化后冷启动和 Inspector 延迟没有整体改善。共享主机负载无法严格对照，因此不计算性能百分比；200 节点冷启动超过 2 秒，Inspector p95 也略超 100ms，仍待稳定环境分析。纯投影函数的收益不能抵消这项未达标结果。",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "cold-50",
          label: {
            "zh-CN": "50 节点冷启动可操作中位数",
          },
          unit: "ms",
          direction: "lower",
          before: 1725.2000007629395,
          after: 2036,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "inspector-50",
          label: {
            "zh-CN": "50 节点 Inspector p95",
          },
          unit: "ms",
          direction: "lower",
          before: 83.29999923706055,
          after: 83.39999961853027,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "cold-200",
          label: {
            "zh-CN": "200 节点冷启动可操作中位数",
          },
          unit: "ms",
          direction: "lower",
          before: 2213.7000007629395,
          after: 2482.8999996185303,
          target: 2000,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "inspector-200",
          label: {
            "zh-CN": "200 节点 Inspector p95",
          },
          unit: "ms",
          direction: "lower",
          before: 99.79999923706055,
          after: 100.0999984741211,
          target: 100,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "cold-500",
          label: {
            "zh-CN": "500 节点冷启动可操作中位数",
          },
          unit: "ms",
          direction: "lower",
          before: 4358.89999961853,
          after: 5054.400001525879,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "inspector-500",
          label: {
            "zh-CN": "500 节点 Inspector p95",
          },
          unit: "ms",
          direction: "lower",
          before: 133.39999961853027,
          after: 150,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "cold-1000",
          label: {
            "zh-CN": "1000 节点冷启动可操作中位数",
          },
          unit: "ms",
          direction: "lower",
          before: 19806.89999961853,
          after: 23418.69999885559,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
        {
          key: "inspector-1000",
          label: {
            "zh-CN": "1000 节点 Inspector p95",
          },
          unit: "ms",
          direction: "lower",
          before: 233.19999885559082,
          after: 251,
          target: null,
          statistic: "p95",
          sampleCount: 90,
          evidenceId: "canvas-after",
          beforeContext: "shared-host-before-load-uncontrolled",
          afterContext: "shared-host-after-load-uncontrolled",
        },
      ],
    },
    {
      type: "comparison",
      before: {
        src: "/blog/canvas-indexes/2026-10-08/before-200.png",
        alt: {
          "zh-CN": "优化前 200 节点 Canvas 与 Inspector",
          en: "Canvas and Inspector before optimization, 200 nodes",
        },
        caption: {
          "zh-CN": "优化前：相同拓扑和容量。",
        },
        sourceSnapshotId:
          "fd8be976addecb9a1bfabbde99213129fb8b4a4e2fc9f6b8fbd01c8696a2fc6f",
        capturedAt: "2026-10-08T07:49:11.375Z",
        fixture: "/benchmarks/canvas/200/",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/canvas-indexes/2026-10-08/after-200.png",
        alt: {
          "zh-CN": "优化后 200 节点 Canvas、更多工具菜单和底部面板",
          en: "Canvas after optimization, 200 nodes",
        },
        caption: {
          "zh-CN": "优化后：截图只证明呈现，耗时见原始报告。",
        },
        sourceSnapshotId:
          "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
        capturedAt: "2026-10-08T08:02:18.750Z",
        fixture: "/benchmarks/canvas/200/",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "50 节点、73 条边的自动 UI 整理任务经过取消、预览、应用、撤销和恢复，共 8 个点击步骤、1525ms。耗时包含自动化开销，不是人工可用性基准。长链 DAG 可能横向很宽，需要平移或定位；不承诺连线无交叉。",
      },
    },
  ],
  evidence: [
    {
      id: "pure-construction",
      type: "measurement",
      file: "/blog/canvas-indexes/2026-10-08/construction.json",
      capturedAt: "2026-10-08T07:51:13.859Z",
      sourceSnapshotId:
        "295506455d267f0665d48a0c491de565a2825c546d39eea83f810152036846ab",
      command:
        "node scripts/capture-canvas-construction.mjs <frozen-before-workflow> <report>",
      environment:
        '{"node":"v24.21.0","os":"Linux","release":"5.4.0-150-generic","arch":"x64","sharedHost":true}',
      method:
        "Pure equivalent projections, 5 warmups, 3 alternating rounds, 30 builds/round. N nodes, 1.5N-2 forward edges, N issues, 10 definitions; no React, DOM or browser. No inference about end-user interaction latency.",
      sampleCount: 3,
      scope: {
        "zh-CN": "等价纯投影构建，N 个问题、10 个定义；不包含浏览器。",
      },
    },
    {
      id: "canvas-before",
      type: "measurement",
      file: "/blog/canvas-indexes/2026-10-08/before.json",
      capturedAt: "2026-10-08T07:49:11.375Z",
      sourceSnapshotId:
        "fd8be976addecb9a1bfabbde99213129fb8b4a4e2fc9f6b8fbd01c8696a2fc6f",
      command:
        "node scripts/capture-canvas-baseline.mjs <built-snapshot> <report.json> before",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages per size; cold navigation through engine measurements and first usable Inspector; 30 selection-to-Inspector samples ending after two rAF opportunities; 60 actual pointer moves plus committed screen position and revision change. rAF gaps and Long Tasks are observations, not compositor proof. Heap without forced GC. Each round is saved before the next starts.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "优化前：4 种容量，每种 3 轮、每轮 30 次选择；1000 节点仅显示容量。",
      },
    },
    {
      id: "canvas-after",
      type: "measurement",
      file: "/blog/canvas-indexes/2026-10-08/after.json",
      capturedAt: "2026-10-08T08:02:18.750Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "node scripts/capture-canvas-baseline.mjs <built-snapshot> <report.json> after",
      environment:
        '{"browser":"138.0.7204.92","os":"Linux","release":"5.4.0-150-generic","node":"v24.21.0","viewport":{"width":1440,"height":1000},"theme":"light","locale":"zh-CN","sharedHost":true}',
      method:
        "3 fresh pages per size; cold navigation through engine measurements and first usable Inspector; 30 selection-to-Inspector samples ending after two rAF opportunities; 60 actual pointer moves plus committed screen position and revision change. rAF gaps and Long Tasks are observations, not compositor proof. Heap without forced GC. Each round is saved before the next starts.",
      sampleCount: 3,
      scope: {
        "zh-CN": "优化后 4 种容量，3 轮各 30 次选择，真实拖动和既有容量限制。",
      },
    },
    {
      id: "layout-task",
      type: "test",
      file: "/blog/canvas-indexes/2026-10-08/layout-task.json",
      capturedAt: "2026-10-08T08:08:08.392Z",
      sourceSnapshotId:
        "39eeb555e317a868a6e452852f413d5e7441f11b290088cea24bd01314b0996d",
      command:
        "pnpm exec playwright test --grep-invert @performance --workers=2",
      environment:
        '{"browser":"138.0.7204.92","viewport":{"width":1440,"height":1000},"node":"v24.21.0","sharedHost":true}',
      method:
        "Automated local UI task from first menu click through cancel, preview, apply, undo and redo; includes automation overhead, not a human usability benchmark",
      sampleCount: 3,
      scope: {
        "zh-CN": "50 节点/73 连线，配置与连接语义保持，应用一次撤销并恢复。",
      },
    },
    {
      id: "regression",
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
        "zh-CN": "144 项隔离本地行为回归通过；边界见报告。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "浏览器前后数据来自共享主机，负载不受控，不能作为稳定 CI 性能承诺。",
    },
    {
      "zh-CN": "1000 节点提交被既有校验拒绝；没有放宽导入、写入或权限边界。",
    },
    {
      "zh-CN":
        "公开 Demo 始终指向当前实现；历史报告按源码和 fixture 哈希追溯。",
    },
  ],
}
