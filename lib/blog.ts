import { workItemsSharedViews } from "../content/blog/work-items-shared-views"
import { agentBoardShowcase } from "../content/blog/agent-board-showcase"
import { commonComponentsFromCrm } from "../content/blog/common-components-from-crm"
import { canvasIndexes } from "../content/blog/canvas-indexes"
import { longSessionAnchor } from "../content/blog/long-session-anchor"
import { controlledLayout } from "../content/blog/controlled-layout"
import { themeModes } from "../content/blog/theme-modes"
import { optimizationRoadmap } from "../content/blog/optimization-roadmap"
import { themeIsolationDraft } from "../content/blog/theme-isolation-draft"
import { onDemandDemos } from "../content/blog/on-demand-demos"
import type { BlogPost, BlogSummary } from "./blog-model"

const posts: BlogPost[] = [
  workItemsSharedViews,
  agentBoardShowcase,
  commonComponentsFromCrm,
  canvasIndexes,
  longSessionAnchor,
  controlledLayout,
  themeModes,

  optimizationRoadmap,
  onDemandDemos,
  themeIsolationDraft,
]
export const publishedPosts = posts
  .filter((post) => post.visibility === "published")
  .sort(
    (a, b) =>
      b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug),
  )
export const blogSummaries: BlogSummary[] = publishedPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  summary: post.summary,
  originalLocale: post.originalLocale,
  hasEnglishBody: post.hasEnglishBody,
  visibility: post.visibility,
  status: post.status,
  author: post.author,
  publishedAt: post.publishedAt,
  updatedAt: post.updatedAt,
  category: post.category,
  tags: post.tags,
  optimizationIds: post.optimizationIds,
  relatedComponents: post.relatedComponents,
  relatedPosts: post.relatedPosts,
  baselineVersion: post.baselineVersion,
  resultVersion: post.resultVersion,
  sourceSnapshotId: post.sourceSnapshotId,
}))

export const getBlogPost = (slug: string) =>
  publishedPosts.find((post) => post.slug === slug)
export { posts as allBlogPosts }
