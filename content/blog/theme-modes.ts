import type { BlogPost } from "../../lib/blog-model"
export const themeModes: BlogPost = {
  slug: "theme-modes",
  title: {
    "zh-CN": "主题如何渐进接入已有产品",
    en: "Adopting themes gradually in existing products",
  },
  summary: {
    "zh-CN": "宿主语义映射与局部私有主题，浮层跟随各自作用域。",
    en: "Adopting themes gradually in existing products",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "measuring",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "distribution",
  tags: ["distribution", "OPT-04", "OPT-06"],
  optimizationIds: ["OPT-04", "OPT-06"],
  relatedComponents: [
    "theme-boundary",
    "button",
    "dialog",
    "runtime-status-badge",
    "workflow-canvas",
  ],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion: null,
  resultVersion:
    "worktree:640703766c2a2affbd96cf1bac86f761bc1a06e7e414b0d6ec6c42a1aa983836",
  sourceSnapshotId:
    "640703766c2a2affbd96cf1bac86f761bc1a06e7e414b0d6ec6c42a1aa983836",
  body: [
    {
      type: "heading",
      id: "modes",
      text: {
        "zh-CN": "两种接入模式",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "host 模式从宿主语义变量映射到 --eu-*，scoped 模式使用局部 EasyuseUI 私有主题。两者不注入全局 root 默认值、字体或 reset；原有 /r/<item>.json 继续兼容。每个作用域提供 Portal 容器，Dialog、Tooltip、Menu、Popover、Select、Combobox 和窄屏 Workspace 浮层都继承自己的边界。",
      },
    },
    {
      type: "code",
      language: "tsx",
      code: '<ThemeBoundary mode="scoped" theme="dark">\n  <InstalledComponents />\n</ThemeBoundary>',
    },
    {
      type: "heading",
      id: "proof",
      text: {
        "zh-CN": "独立消费项目",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "安装测试创建两个全新消费项目，使用真实 shadcn CLI 安装递归依赖，TypeScript 检查和 Webpack 静态构建。比较宿主哨兵的计算样式和截图字节，测试同页两个作用域、浮层颜色/焦点、状态颜色、Canvas 尺寸与多语言 provider。失败原始记录保留，最终报告单独发布。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "小字号辅助文字已在 background/surface/raised 上测量透明度合成后的对比度。修订后深浅主题六个组合均达到 4.5；这只是被测 token 组合，不宣称所有产品颜色和禁用状态均完成 AA 验收。",
      },
    },
    {
      type: "demo",
      componentSlug: "theme-boundary",
    },
    {
      type: "heading",
      id: "contrast",
      text: {
        "zh-CN": "12px 辅助文字对比度",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "light-background",
          label: {
            "zh-CN": "light / background",
          },
          unit: "ratio",
          direction: "higher",
          before: 4.630251574816984,
          after: 5.278319837808999,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
        {
          key: "light-surface",
          label: {
            "zh-CN": "light / surface",
          },
          unit: "ratio",
          direction: "higher",
          before: 4.832895561154151,
          after: 5.5093266753021535,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
        {
          key: "light-surface-raised",
          label: {
            "zh-CN": "light / surface-raised",
          },
          unit: "ratio",
          direction: "higher",
          before: 4.246331456147716,
          after: 4.840664745906984,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
        {
          key: "dark-background",
          label: {
            "zh-CN": "dark / background",
          },
          unit: "ratio",
          direction: "higher",
          before: 3.770317195158422,
          after: 4.985442606359074,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
        {
          key: "dark-surface",
          label: {
            "zh-CN": "dark / surface",
          },
          unit: "ratio",
          direction: "higher",
          before: 3.8151451671681684,
          after: 5.001498221376961,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
        {
          key: "dark-surface-raised",
          label: {
            "zh-CN": "dark / surface-raised",
          },
          unit: "ratio",
          direction: "higher",
          before: 3.8289577877364156,
          after: 4.969372803856675,
          target: 4.5,
          statistic: "computed ratio",
          sampleCount: 1,
          evidenceId: "contrast",
          beforeContext: "chrome138-12px-muted-token-over-surface-v1",
          afterContext: "chrome138-12px-muted-token-over-surface-v1",
        },
      ],
    },
    {
      type: "image",
      image: {
        src: "/blog/theme-modes/2026-10-08/scoped-theme.png",
        alt: {
          "zh-CN": "宿主哨兵与同页浅色和深色主题作用域",
          en: "Host sentinel with separate light and dark theme scopes",
        },
        caption: {
          "zh-CN": "独立 scoped 消费项目；宿主哨兵安装前后样式与像素一致。",
        },
        sourceSnapshotId:
          "640703766c2a2affbd96cf1bac86f761bc1a06e7e414b0d6ec6c42a1aa983836",
        capturedAt: "2026-10-08T08:05:05.827Z",
        fixture: "independent scoped consumer",
        viewport: {
          width: 1440,
          height: 1000,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
  ],
  evidence: [
    {
      id: "install",
      type: "test",
      file: "/blog/theme-modes/2026-10-08/installation.json",
      capturedAt: "2026-10-08T08:05:05.827Z",
      sourceSnapshotId:
        "640703766c2a2affbd96cf1bac86f761bc1a06e7e414b0d6ec6c42a1aa983836",
      command: "pnpm test:install:themes",
      environment:
        '{"browser":"138.0.7204.92","node":"v24.21.0","modes":["host","scoped"],"webpack":true}',
      method:
        "Frozen Registry bytes with hashes; real CLI installs; TypeScript and production builds; computed-style and byte-identical sentinel screenshots, Portal/focus/locale/private runtime color/Canvas plus six primitives.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "host/scoped 两个全新消费项目，实际 CLI 安装、类型、构建和浏览器操作。",
      },
    },
    {
      id: "contrast-before",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/contrast-before.json",
      capturedAt: "2026-10-08T07:08:02.218Z",
      sourceSnapshotId:
        "3edbae23f5256c15d7dd27a81be3c105be87b423559e83c4ca8f4bb1e11a8013",
      command: "node scripts/capture-contrast.mjs <before-source-dir> <output>",
      environment:
        '{"browser":"138.0.7204.92","node":"v24.21.0","sharedHost":true}',
      method:
        "Computed colors in Chromium from actual theme.css; alpha-composite text over each token surface, then WCAG relative luminance. AA normal text >=4.5:1. This token fixture does not replace page-level audits.",
      sampleCount: 3,
      scope: {
        "zh-CN": "优化前实际 theme.css，六个 token 组合。",
      },
    },
    {
      id: "contrast",
      type: "measurement",
      file: "/blog/on-demand-demos/2026-10-08/contrast-after.json",
      capturedAt: "2026-10-08T07:08:14.770Z",
      sourceSnapshotId:
        "b45e99b3af8ad597430c027ed19dcc8e792edfdf8dfaa8ab0de1e5c5be810de3",
      command: "node scripts/capture-contrast.mjs <after-source-dir> <output>",
      environment:
        '{"browser":"138.0.7204.92","node":"v24.21.0","sharedHost":true}',
      method:
        "Computed colors in Chromium from actual theme.css; alpha-composite text over each token surface, then WCAG relative luminance. AA normal text >=4.5:1. This token fixture does not replace page-level audits.",
      sampleCount: 3,
      scope: {
        "zh-CN": "优化后实际 theme.css，六个 token 组合均达到 4.5。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "独立宿主样例不能代表任意已有产品的 CSS、Portal 容器和层叠上下文。",
    },
    {
      "zh-CN":
        "LICENSE、公开域名、Git tag 和公开 URL 安装仍是发布前提；当前只交付本地工具和证据。",
    },
  ],
}
