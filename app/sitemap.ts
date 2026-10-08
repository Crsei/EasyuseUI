import type { MetadataRoute } from "next"
import { publishedPosts } from "@/lib/blog"
import { componentManifest } from "@/lib/component-manifest"
import { siteUrl } from "@/lib/site"
export const dynamic = "force-static"
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/components/", "/dictionary/", "/docs/", "/blog/"]
    .map((route) => ({ url: `${siteUrl}${route}` }))
    .concat(
      componentManifest.map((entry) => ({ url: `${siteUrl}${entry.docPath}` })),
      publishedPosts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}/`,
        lastModified: post.updatedAt,
      })),
    )
}
