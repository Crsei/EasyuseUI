import type { BlogPost } from "../../lib/blog-model"
export const themeIsolationDraft: BlogPost = {
  slug: "theme-isolation-draft",
  title: { "zh-CN": "主题隔离工作稿" },
  summary: { "zh-CN": "宿主兼容与独立作用域主题的验收草稿。" },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "draft",
  status: "planned",
  author: "EasyuseUI",
  publishedAt: "2026-10-08",
  updatedAt: "2026-10-08",
  category: "distribution",
  tags: ["theme"],
  optimizationIds: ["OPT-04"],
  relatedComponents: ["button", "dialog"],
  relatedPosts: ["optimization-roadmap"],
  baselineVersion: null,
  resultVersion: null,
  sourceSnapshotId: null,
  body: [
    {
      type: "paragraph",
      text: {
        "zh-CN": "待完成独立安装、同页两个主题实例与 Portal 验证后补齐。",
      },
    },
  ],
  evidence: [],
  limitations: [{ "zh-CN": "该草稿不进入公开页面、索引或 sitemap。" }],
}
