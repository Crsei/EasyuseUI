import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPost, publishedPosts } from "@/lib/blog"
import { BlogArticle } from "@/components/site/blog/blog-article"
import { siteUrl } from "@/lib/site"
import { SitePageMetadata } from "@/components/site/site-page-metadata"
export const dynamicParams = false
export function generateStaticParams() {
  return publishedPosts.map(({ slug }) => ({ slug }))
}
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: post.title["zh-CN"],
    description: post.summary["zh-CN"],
    alternates: { canonical: `${siteUrl}/blog/${slug}/` },
    openGraph: {
      type: "article",
      title: post.title["zh-CN"],
      description: post.summary["zh-CN"],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: `${siteUrl}/blog/${slug}/`,
      images: [`${siteUrl}/blog/cover.png`],
    },
  }
}
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()
  return (
    <>
      <SitePageMetadata
        pathname={`/blog/${slug}`}
        title={post.title}
        description={post.summary}
      />
      <BlogArticle post={post} />
    </>
  )
}
