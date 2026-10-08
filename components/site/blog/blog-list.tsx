"use client"
import { useSiteQuery } from "@/components/site/use-site-query"
import Link from "next/link"
import { useSiteI18n } from "@/components/site/site-i18n"
import type { BlogSummary } from "@/lib/blog-model"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataRegion } from "@/components/ui/data-region"
import { BlogText } from "./blog-text"
export function BlogList({ posts }: { posts: BlogSummary[] }) {
  const { t } = useSiteI18n()
  const { params, update: updateQuery } = useSiteQuery()
  const query = params.get("q") ?? "",
    category = params.get("category") ?? "all",
    status = params.get("status") ?? "all"
  const update = (key: string, value: string) => updateQuery({ [key]: value })
  const filtered = posts.filter(
    (post) =>
      (category === "all" || post.category === category) &&
      (status === "all" || post.status === status) &&
      `${Object.values(post.title).join(" ")} ${Object.values(post.summary).join(" ")} ${post.tags.join(" ")} ${post.optimizationIds.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  return (
    <>
      <div className="my-8 flex flex-wrap gap-3">
        <Input
          type="search"
          aria-label={t("site.optimization.searchPosts")}
          placeholder={t("site.optimization.searchPosts")}
          className="max-w-sm"
          value={query}
          onChange={(event) => update("q", event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          {t("site.optimization.category")}
          <select
            aria-label={t("site.optimization.category")}
            className="min-h-8 rounded-md border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
            value={category}
            onChange={(event) => update("category", event.target.value)}
          >
            {[
              "all",
              "performance",
              "design",
              "reuse",
              "distribution",
              "canvas",
            ].map((key) => (
              <option key={key} value={key}>
                {t(
                  `site.optimization.blogCategory.${key}` as "site.optimization.blogCategory.all",
                )}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("site.optimization.status")}
          <select
            aria-label={t("site.optimization.status")}
            className="min-h-8 rounded-md border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
            value={status}
            onChange={(event) => update("status", event.target.value)}
          >
            {["all", "planned", "implementing", "measuring", "verified"].map(
              (key) => (
                <option key={key} value={key}>
                  {t(
                    `site.optimization.status.${key}` as "site.optimization.status.all",
                  )}
                </option>
              ),
            )}
          </select>
        </label>
        {(query || category !== "all" || status !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              updateQuery({
                q: undefined,
                category: undefined,
                status: undefined,
              })
            }}
          >
            {t("site.clearFilters")}
          </Button>
        )}
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {t("site.optimization.resultCount", { count: filtered.length })}
      </p>
      <DataRegion
        state={filtered.length ? "success" : "empty"}
        emptyTitle={t("site.optimization.noPosts")}
      >
        <ol className="mt-4 divide-y border-y">
          {filtered.map((post) => (
            <li key={post.slug} className="py-6">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/blog/${post.slug}/`}
                  prefetch={false}
                  className="text-lg font-semibold hover:text-primary"
                >
                  <BlogText value={post.title} />
                </Link>
                <Badge>{t(`site.optimization.status.${post.status}`)}</Badge>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                <BlogText value={post.summary} />
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{post.optimizationIds.join(" · ")}</span>
                <span>
                  {t(`site.optimization.blogCategory.${post.category}`)}
                </span>
                <time dateTime={post.updatedAt}>
                  {t("site.optimization.updated")} {post.updatedAt}
                </time>
              </p>
            </li>
          ))}
        </ol>
      </DataRegion>
    </>
  )
}
