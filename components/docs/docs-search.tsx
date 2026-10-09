"use client"
import { useEffect, useMemo, useState, type RefObject } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CommandPalette } from "@/components/blocks/command-palette"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useSiteI18n } from "@/components/site/site-i18n"
import type { SiteLocalizedText } from "@/lib/example-manifest"
type SearchEntry = {
  id: string
  kind: "components" | "guides" | "examples" | "articles"
  title: SiteLocalizedText
  summary: SiteLocalizedText
  href: string
  keywords: string
}
export function DocsSearch({
  open,
  onOpenChange,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  finalFocus: RefObject<HTMLButtonElement | null>
}) {
  const { t, locale } = useSiteI18n(),
    router = useRouter()
  const [query, setQuery] = useState(""),
    [index, setIndex] = useState<SearchEntry[] | null>(null),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!open || index || error) return
    const controller = new AbortController()
    fetch("/docs-search.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("index")
        const data = await response.json()
        if (
          data.schemaVersion !== 1 ||
          !Array.isArray(data.items) ||
          data.items.some(
            (item: SearchEntry) =>
              !item.href?.startsWith("/") || item.href.startsWith("//"),
          )
        )
          throw new Error("index")
        if (!controller.signal.aborted) setIndex(data.items)
      })
      .catch((reason) => {
        if (!controller.signal.aborted && reason.name !== "AbortError")
          setError(true)
      })
    return () => controller.abort()
  }, [open, index, attempt, error])
  const groups = useMemo(() => {
    const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return (["components", "guides", "examples", "articles"] as const).map(
      (kind) => ({
        id: kind,
        label: t(
          `site.redesign.search${kind[0].toUpperCase() + kind.slice(1)}` as "site.redesign.searchComponents",
        ),
        items: (index ?? [])
          .filter(
            (item) =>
              item.kind === kind &&
              tokens.every((token) =>
                `${item.title["zh-CN"]} ${item.title.en} ${item.summary["zh-CN"]} ${item.summary.en} ${item.keywords}`
                  .toLocaleLowerCase()
                  .includes(token),
              ),
          )
          .sort(
            (a, b) =>
              Number(
                b.title[locale].toLocaleLowerCase() ===
                  query.toLocaleLowerCase(),
              ) -
                Number(
                  a.title[locale].toLocaleLowerCase() ===
                    query.toLocaleLowerCase(),
                ) ||
              Number(a.href.includes("#")) - Number(b.href.includes("#")),
          )
          .slice(0, 8)
          .map((item) => ({
            id: item.kind + ":" + item.id,
            label: item.title[locale],
            description: item.summary[locale],
          })),
      }),
    )
  }, [index, query, locale, t])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={finalFocus}
        className="p-0 [&_section]:rounded-none [&_section]:border-0"
      >
        <DialogTitle className="sr-only">
          {t("site.redesign.search")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("site.redesign.searchHint")}
        </DialogDescription>
        <CommandPalette
          presentation="inline"
          title={t("site.redesign.search")}
          description={t("site.redesign.searchHint")}
          query={query}
          onQueryChange={setQuery}
          groups={groups}
          loading={!index && !error}
          error={error ? t("site.redesign.searchError") : undefined}
          emptyMessage={t("site.redesign.searchEmpty")}
          onSelect={(item) => {
            const entry = index?.find(
              (entry) => entry.kind + ":" + entry.id === item.id,
            )
            if (entry) {
              onOpenChange(false)
              router.push(entry.href)
            }
          }}
        />
        {error && (
          <div className="flex flex-wrap items-center gap-4 px-4 pb-3">
            <Button
              onClick={() => {
                setError(false)
                setAttempt((value) => value + 1)
              }}
            >
              {t("site.retry")}
            </Button>
            <Link
              prefetch={false}
              href="/components/"
              onClick={() => onOpenChange(false)}
              className="inline-flex min-h-11 items-center text-sm text-primary"
            >
              {t("site.redesign.browseAll")}
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
