"use client"

import { useSiteQuery } from "@/components/site/use-site-query"
import Link from "next/link"
import {
  ArrowUpRight,
  Blocks,
  Layers3,
  Workflow,
  PanelLeft,
} from "lucide-react"
import componentIndex from "@/lib/component-directory.json"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataRegion } from "@/components/ui/data-region"
import { ComponentThumbnail } from "@/components/site/home/component-thumbnail"
import { DemoLoader } from "./demo-loader"

const categories = [
  "all",
  "primitives",
  "patterns",
  "canvas",
  "workspace",
] as const
const icons = {
  primitives: Blocks,
  patterns: Layers3,
  canvas: Workflow,
  workspace: PanelLeft,
}
export function ComponentBrowser() {
  const { t, text } = useSiteI18n()
  const { params, update } = useSiteQuery()
  const query = params.get("q") ?? ""
  const category = params.get("category") ?? "all"
  const display = params.get("display") === "list" ? "list" : "grid"
  const group = params.get("group") ?? "all"
  const preview = params.get("preview") ?? undefined
  const filtered = componentIndex.filter(
    (entry) =>
      (category === "all" || entry.displayCategory === category) &&
      (group === "all" || entry.docGroup === group) &&
      `${entry.name} ${entry.slug} ${entry.description} ${text(entry.description)}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  )
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        <Input
          aria-label={t("site.optimization.searchComponents")}
          placeholder={t("site.optimization.searchComponents")}
          value={query}
          onChange={(event) => update({ q: event.target.value })}
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          {t("site.optimization.category")}
          <select
            aria-label={t("site.optimization.category")}
            value={category}
            onChange={(event) => update({ category: event.target.value })}
            className="h-8 rounded-md border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          >
            {categories.map((key) => (
              <option key={key} value={key}>
                {t(`site.optimization.category.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("site.redesign.purpose")}
          <select
            aria-label={t("site.redesign.purpose")}
            value={group}
            onChange={(event) =>
              update({
                group:
                  event.target.value === "all" ? undefined : event.target.value,
              })
            }
            className="h-8 max-w-full rounded-md border bg-background px-2 [@media(pointer:coarse)]:min-h-11"
          >
            <option value="all">{t("site.optimization.category.all")}</option>
            {[
              "interaction",
              "data",
              "agent",
              "canvas",
              "workspace",
              "other",
            ].map((group) => (
              <option key={group} value={group}>
                {t(
                  `site.redesign.group.${group}` as "site.redesign.group.interaction",
                )}
              </option>
            ))}
          </select>
        </label>
        <div
          role="group"
          aria-label={t("site.redesign.display")}
          className="flex gap-1"
        >
          {["grid", "list"].map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              aria-pressed={display === value}
              onClick={() =>
                update({ display: value === "grid" ? undefined : value })
              }
            >
              {t(
                value === "grid" ? "site.redesign.grid" : "site.redesign.list",
              )}
            </Button>
          ))}
        </div>
        <span
          role="status"
          className="self-center text-xs text-muted-foreground"
        >
          {t("site.optimization.resultCount", { count: filtered.length })}
        </span>
      </div>
      <DataRegion
        state={filtered.length ? "success" : "empty"}
        emptyTitle={t("site.noMatchingEntries")}
        emptyAction={
          <Button
            variant="outline"
            onClick={() => {
              update({ q: undefined, category: undefined, group: undefined })
            }}
          >
            {t("site.clearFilters")}
          </Button>
        }
      >
        <div
          className={
            display === "grid"
              ? "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "mt-8 divide-y border-y"
          }
        >
          {filtered.map((entry) => {
            const Icon = icons[entry.displayCategory as keyof typeof icons]
            return (
              <article
                key={entry.slug}
                data-component-entry={entry.slug}
                className={
                  display === "grid"
                    ? `min-w-0 overflow-hidden rounded-xl border ${preview === entry.slug ? "md:col-span-2 xl:col-span-3" : ""}`
                    : "py-5"
                }
              >
                {display === "grid" && (
                  <div>
                    <span className="sr-only">
                      {t("site.redesign.thumbnail")}
                    </span>
                    <ComponentThumbnail slug={entry.slug} />
                  </div>
                )}
                <div
                  className={
                    display === "grid"
                      ? "flex flex-wrap items-start gap-3 border-t p-4"
                      : "flex items-start gap-4"
                  }
                >
                  <div
                    className={
                      display === "grid"
                        ? "hidden"
                        : "flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground"
                    }
                    aria-hidden="true"
                  >
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={entry.docPath}
                      prefetch={false}
                      className="group inline-flex items-center gap-2"
                    >
                      <h2 className="text-base font-semibold group-hover:text-primary">
                        {entry.name}
                      </h2>
                      <ArrowUpRight size={15} />
                    </Link>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {text(entry.description)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge>
                        {t(
                          `site.optimization.category.${entry.displayCategory}` as "site.optimization.category.primitives",
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        registry:{entry.installType} · {entry.registryId}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-expanded={preview === entry.slug}
                    onClick={() =>
                      update({
                        preview:
                          preview === entry.slug ? undefined : entry.slug,
                      })
                    }
                  >
                    {t(
                      preview === entry.slug
                        ? "site.optimization.closePreview"
                        : "site.optimization.preview",
                    )}
                  </Button>
                </div>
                {preview === entry.slug && (
                  <div className="m-4 overflow-hidden rounded-lg border p-4">
                    <DemoLoader slug={entry.slug} autoLoad />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </DataRegion>
    </>
  )
}
