export type BlogLocale = "zh-CN" | "en"
export type BlogText = { "zh-CN": string; en?: string }
export type ImplementationStatus =
  "planned" | "implementing" | "measuring" | "verified"
export type BlogCategory =
  "performance" | "design" | "reuse" | "distribution" | "canvas"
export type Evidence = {
  id: string
  type: "measurement" | "screenshot" | "test" | "source"
  file: string
  capturedAt: string
  sourceSnapshotId: string
  command: string
  environment: string
  method: string
  sampleCount: number
  scope: BlogText
}
export type Metric = {
  key: string
  label: BlogText
  unit: string
  direction: "lower" | "higher"
  before: number | null
  after: number | null
  target: number | null
  statistic: string
  sampleCount: number
  evidenceId: string | null
  beforeContext: string | null
  afterContext: string | null
}
export type BlogImage = {
  src: string
  alt: BlogText
  caption: BlogText
  sourceSnapshotId: string
  capturedAt: string
  fixture: string
  viewport: { width: number; height: number }
  theme: "light" | "dark"
  locale: BlogLocale
}
export type BlogBlock =
  | { type: "paragraph"; text: BlogText }
  | { type: "link"; href: string; text: BlogText }
  | { type: "heading"; id: string; text: BlogText }
  | { type: "list"; items: BlogText[] }
  | { type: "code"; code: string; language: "tsx" | "bash" | "json" | "css" }
  | { type: "image"; image: BlogImage }
  | { type: "comparison"; before: BlogImage | null; after: BlogImage | null }
  | { type: "metrics"; metrics: Metric[] }
  | { type: "demo"; componentSlug: string }
export type BlogPost = {
  slug: string
  title: BlogText
  summary: BlogText
  originalLocale: BlogLocale
  hasEnglishBody: boolean
  visibility: "draft" | "published"
  status: ImplementationStatus
  author: string
  publishedAt: string
  updatedAt: string
  category: BlogCategory
  tags: string[]
  optimizationIds: string[]
  relatedComponents: string[]
  relatedPosts: string[]
  baselineVersion: string | null
  resultVersion: string | null
  sourceSnapshotId: string | null
  body: BlogBlock[]
  evidence: Evidence[]
  limitations: BlogText[]
}
export type BlogSummary = Omit<BlogPost, "body" | "evidence" | "limitations">
export function metricChange(metric: Metric): number | null {
  if (
    metric.before === null ||
    metric.after === null ||
    metric.before === 0 ||
    !metric.evidenceId ||
    !metric.beforeContext ||
    metric.beforeContext !== metric.afterContext
  )
    return null
  return (
    ((metric.direction === "lower"
      ? metric.before - metric.after
      : metric.after - metric.before) /
      Math.abs(metric.before)) *
    100
  )
}
