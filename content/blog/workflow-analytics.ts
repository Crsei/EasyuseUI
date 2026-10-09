import type { BlogPost } from "../../lib/blog-model"
export const workflowAnalytics: BlogPost = {
  slug: "workflow-analytics",
  title: {
    "zh-CN": "从状态分布到同快照工作项下钻",
    en: "From status distribution to work-item drilldown at the same snapshot",
  },
  summary: {
    "zh-CN":
      "工作流分析首版：固定项目 Dashboard、可解释指标、历史成员与独立统计图表分发。",
    en: "A fixed project dashboard, defined metrics, historical membership and portable charts.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  category: "design",
  tags: ["analytics", "dashboard", "workflow"],
  optimizationIds: ["OPT-07", "OPT-09"],
  relatedComponents: [
    "statistical-chart",
    "chart-frame",
    "chart-data-table",
    "chart-drilldown-panel",
    "workflow-charts",
    "project-overview-dashboard",
    "work-traceability-view",
  ],
  relatedPosts: [],
  baselineVersion: null,
  resultVersion:
    "worktree:3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
  sourceSnapshotId:
    "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
  body: [
    {
      type: "heading",
      id: "definitions",
      text: { "zh-CN": "先明确口径，再画图" },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "首版覆盖计划 C0–C2：状态、实际完成事件、未完成项年龄、明确阻塞，以及固定项目 Dashboard。完成存量与完成流量分开；没有期初和完整历史时不补造趋势。风险只呈现规则事实，不生成混合健康分。",
      },
    },
    {
      type: "link",
      href: "/examples/workflow-analytics/",
      text: {
        "zh-CN": "打开工作流分析本地示例",
        en: "Open the local workflow analytics example",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "图形、聚合表和键盘都产生同一快照的下钻描述。历史完成集合保留当时成员，即使该项后来重开。图例只改可见性，明确应用点选后才请求筛选其他部件。权限撤回和查询切换不展示旧范围。",
      },
    },
    { type: "demo", componentSlug: "chart-drilldown-panel" },
    {
      type: "image",
      image: {
        src: "/blog/workflow-analytics/project-light-1440.png",
        alt: {
          "zh-CN": "桌面浅色项目概览与实际完成趋势",
        },
        caption: {
          "zh-CN": "本地确定性 fixture；不代表真实服务或业务验收。",
        },
        sourceSnapshotId:
          "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
        capturedAt: "2026-10-09T01:41:09.349Z",
        fixture: "fixture-snapshot-9; success; alpha; all members",
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
        src: "/blog/workflow-analytics/project-dark-390.png",
        alt: {
          "zh-CN": "窄屏深色英文项目概览",
        },
        caption: {
          "zh-CN": "本地确定性 fixture；不代表真实服务或业务验收。",
        },
        sourceSnapshotId:
          "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
        capturedAt: "2026-10-09T01:41:12.789Z",
        fixture: "fixture-snapshot-9; success; alpha; all members",
        viewport: {
          width: 390,
          height: 1000,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "heading",
      id: "distribution",
      text: { "zh-CN": "轻量摘要与统计引擎分开安装" },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "13 个公共安装项分开模型、图表框架、统计渲染、来源面板、业务模板和 Dashboard。MetricSummary、Sparkline 和现有轻量 Chart 不因新图表加载 Recharts。统计引擎固定 Recharts 3.10.1，服务协议只暴露稳定实体和系列身份。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "纯函数测量保留 500/5000/50000 事件与 100/1000/10000 点的五次原始样本。UMD依赖包体积只是包参考值，路由下载量另测；这些数字不代表生产服务容量。浏览器、安装与真实服务接入分别验收。",
      },
    },
  ],
  evidence: [
    {
      id: "analytics-validation",
      type: "test",
      file: "/blog/workflow-analytics/validation.json",
      capturedAt: "2026-10-09T01:42:00.210Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command:
        "pnpm exec playwright test --config=playwright.workflow-analytics.config.ts",
      environment: "Node 24 / Debian GLIBC 2.28 / Webpack / Chrome",
      method:
        "13 calculation tests, 10 browser tests, checks and independent installations; log digests retained",
      sampleCount: 23,
      scope: {
        "zh-CN": "隔离任务快照与独立消费；没有真实服务验收",
      },
    },
    {
      id: "analytics-bundle",
      type: "measurement",
      file: "/blog/workflow-analytics/bundle-isolation.json",
      capturedAt: "2026-10-09T01:41:17.741Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command:
        "pnpm exec playwright test --config=playwright.workflow-analytics.config.ts",
      environment: "Node 24 / Debian GLIBC 2.28 / Webpack / Chrome",
      method:
        "Fresh production contexts; decoded downloaded JS; ordinary routes exclude Recharts",
      sampleCount: 3,
      scope: {
        "zh-CN": "三个路由的加载边界；不是gzip体积或优化前对照",
      },
    },
    {
      id: "analytics-theme",
      type: "test",
      file: "/blog/workflow-analytics/theme-validation.json",
      capturedAt: "2026-10-09T01:42:00.210Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command: "pnpm test:install:themes",
      environment: "Node 24 / Debian GLIBC 2.28 / Webpack / Chrome",
      method:
        "Host/scoped installed category and semantic colors; host style and pixel invariance",
      sampleCount: 2,
      scope: {
        "zh-CN": "独立主题消费；与最终分发源码及依赖核对一致",
      },
    },
    {
      id: "analytics-image-0",
      type: "screenshot",
      file: "/blog/workflow-analytics/project-light-1440.png",
      capturedAt: "2026-10-09T01:41:09.349Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command:
        "pnpm exec playwright test --config=playwright.workflow-analytics.config.ts",
      environment: "Production static export / Chrome",
      method: "1440x1000; light; zh-CN; fixture-snapshot-9",
      sampleCount: 1,
      scope: {
        "zh-CN": "本地fixture截图；无优化前截图或真实服务证据",
      },
    },
    {
      id: "analytics-image-1",
      type: "screenshot",
      file: "/blog/workflow-analytics/project-dark-390.png",
      capturedAt: "2026-10-09T01:41:12.789Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command:
        "pnpm exec playwright test --config=playwright.workflow-analytics.config.ts",
      environment: "Production static export / Chrome",
      method: "390x1000; dark; en; fixture-snapshot-9",
      sampleCount: 1,
      scope: {
        "zh-CN": "本地fixture截图；无优化前截图或真实服务证据",
      },
    },

    {
      id: "analytics-measurement",
      type: "measurement",
      file: "/blog/workflow-analytics/measurements.json",
      capturedAt: "2026-10-09T01:38:56.625Z",
      sourceSnapshotId:
        "3e2b461c82531a3de81e086e61ff7730b25e6d77050b65d7007eded3431c1c88",
      command: "node scripts/measure-workflow-analytics.mjs",
      environment: "Node 24 / Debian GLIBC 2.28 / Webpack",
      method:
        "Five pure-function samples per event/point size; medians and source hashes",
      sampleCount: 5,
      scope: { "zh-CN": "本机纯计算；不包含真实服务或浏览器绘制容量" },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "示例为内存 fixture，刷新重置；历史采集、查询执行、权限权威、业务写入和持久化由调用方负责。",
    },
    {
      "zh-CN":
        "C3–C6资源/执行、迭代进度、配置保存、流程/预测和通用构建器尚未实施。",
    },
  ],
}
