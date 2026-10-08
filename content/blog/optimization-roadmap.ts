import type { BlogPost } from "../../lib/blog-model"
export const optimizationRoadmap: BlogPost = {
  slug: "optimization-roadmap",
  title: {
    "zh-CN": "EasyuseUI 优化路线与验收方法",
    en: "The EasyuseUI optimization roadmap and evidence contract",
  },
  summary: {
    "zh-CN": "从轻量目录到组件分发，逐项记录实施状态、兼容影响与可复核证据。",
    en: "Track implementation status, compatibility and reproducible evidence from a lightweight catalog to portable components.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "implementing",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "reuse",
  tags: ["roadmap", "验收", "architecture"],
  optimizationIds: [
    "OPT-01",
    "OPT-03",
    "OPT-04",
    "OPT-05",
    "OPT-08",
    "BLOG-01",
  ],
  relatedComponents: ["workspace-shell", "chat-message", "i18n"],
  relatedPosts: ["on-demand-demos"],
  baselineVersion: null,
  resultVersion: null,
  sourceSnapshotId: null,
  body: [
    { type: "heading", id: "problem", text: { "zh-CN": "问题与范围" } },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "组件库需要同时支持逐步接入与复杂工作区。目录不应为了介绍组件而启动全部交互实例；布局、主题与运行服务也需要清晰的责任边界。",
      },
    },
    { type: "heading", id: "approach", text: { "zh-CN": "实施顺序" } },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "先保存当前源码快照、生产网络记录与截图，再拆分元数据和 Demo。",
        },
        {
          "zh-CN":
            "交付搜索目录和优化日志，随后优化长会话更新、受控布局和低侵入主题。",
        },
        {
          "zh-CN":
            "Canvas 相关优化最后实施，保留并行 agent 的图元、执行与样式修改。",
        },
        { "zh-CN": "公开域名、许可证和不可变版本的发布验证单独收敛。" },
      ],
    },
    { type: "heading", id: "verification", text: { "zh-CN": "什么算完成" } },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "实现、兼容说明、自动检查及同口径前后证据共同构成一次优化交付。截图只证明外观，fixture 只证明本地交互；真实执行与存储仍由调用方服务和回执证明。",
      },
    },
    { type: "heading", id: "status", text: { "zh-CN": "持续更新" } },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "文章是否公开与工程实施状态独立。planned 可以公开方案，measuring 表示证据正在采集，verified 只覆盖文章明确列出的版本与场景。缺少的数值保持待测，不填零或推测收益。",
      },
    },
  ],
  evidence: [],
  limitations: [
    { "zh-CN": "本计划不代表真实模型、工具、存储、协作或发布服务已验收。" },
    { "zh-CN": "共享主机的耗时用于观察，不直接作为稳定 CI 的性能承诺。" },
  ],
}
