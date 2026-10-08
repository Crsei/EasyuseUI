import type { Metadata } from "next"
import { SiteText } from "@/components/site/site-i18n"
import { BlogList } from "@/components/site/blog/blog-list"
import { blogSummaries } from "@/lib/blog"
import { siteUrl } from "@/lib/site"
export const metadata: Metadata = {
  title: "优化日志",
  description: "EasyuseUI 优化方案、实施状态与可复核证据。",
  alternates: { canonical: `${siteUrl}/blog/` },
  openGraph: {
    title: "EasyuseUI 优化日志",
    description: "优化方案、前后效果与验证范围",
    url: `${siteUrl}/blog/`,
    images: [`${siteUrl}/blog/cover.png`],
  },
}
export default function BlogPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <p className="mb-4 font-mono text-xs tracking-widest text-primary">
        ENGINEERING
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">
        <SiteText messageKey="site.optimization.blog" />
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.optimization.blogIntro" />
      </p>
      <BlogList posts={blogSummaries} />
    </main>
  )
}
