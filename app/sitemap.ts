import type { MetadataRoute } from "next"
import { publishedPosts } from "@/lib/blog"
import { componentManifest } from "@/lib/component-manifest"
import { docGuides } from "@/lib/doc-guides"
import { exampleManifest } from "@/lib/example-manifest"
import { siteUrl } from "@/lib/site"
export const dynamic = "force-static"
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...new Set([
      "/",
      "/components/",
      "/dictionary/",
      "/style-workbench/",
      "/scroll/",
      "/docs/",
      "/examples/",
      "/blog/",
      ...componentManifest.map((entry) => entry.docPath),
      ...docGuides.map((guide) => `/docs/${guide.slug}/`),
      ...exampleManifest.map((example) => example.href),
    ]),
  ]
    .map((route) => ({ url: siteUrl + route }))
    .concat(
      publishedPosts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}/`,
        lastModified: post.updatedAt,
      })),
    )
}
