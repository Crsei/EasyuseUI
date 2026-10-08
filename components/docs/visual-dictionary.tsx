"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Search } from "lucide-react"
import { catalog } from "@/lib/catalog"
import {
  availabilityLabels,
  dictionaryCategories,
  dictionaryEntries,
  matchesDictionaryEntry,
  type Availability,
  type DictionaryCategory,
} from "@/lib/visual-dictionary"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataRegion } from "@/components/ui/data-region"
import { CopyButton } from "@/components/docs/copy-button"
import { DictionaryPreview, FoundationPreview } from "./dictionary-preview"
import styles from "./dictionary.module.css"

export function VisualDictionary() {
  const { t, text } = useSiteI18n()

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<DictionaryCategory | "all">("all")
  const [availability, setAvailability] = useState<Availability | "all">("all")
  const [selection, setSelection] = useState("color")
  const detailTitle = useRef<HTMLHeadingElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const matching = dictionaryEntries.filter(
    (entry) =>
      (matchesDictionaryEntry(entry, query) ||
        text(entry.description)
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())) &&
      (availability === "all" || entry.availability === availability),
  )
  const filtered = matching.filter(
    (entry) => category === "all" || entry.category === category,
  )
  const selected =
    filtered.find(({ slug }) => slug === selection) ?? filtered[0]
  const component = catalog.find(({ slug }) => slug === selected?.componentSlug)
  const Demo = component?.Demo
  function reset() {
    setQuery("")
    setCategory("all")
    setAvailability("all")
    search.current?.focus()
  }
  function select(slug: string) {
    setSelection(slug)
    if (window.matchMedia("(max-width: 1279px)").matches)
      requestAnimationFrame(() => {
        detailTitle.current?.focus({ preventScroll: true })
        detailTitle.current?.scrollIntoView({ block: "start" })
      })
  }
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            <BookOpen size={14} aria-hidden="true" /> UI VOCABULARY
          </p>
          <h1>{t("site.visualDictionary")}</h1>
          <p>{t("site.startWithItsAppearanceFindItsNameAndPurpose")}</p>
        </div>
        <div className={styles.summary}>
          <Badge>
            {dictionaryEntries.length} {t("site.entries")}
          </Badge>
          <Badge>
            {catalog.length} {t("site.availableComponents")}
          </Badge>
          <Badge>{t("site.9Categories")}</Badge>
        </div>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <label htmlFor="dictionary-search" className="sr-only">
            {t("site.searchVisualDictionary")}
          </label>
          <Input
            ref={search}
            id="dictionary-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("site.tryPillShadowFloatingPanelChip")}
          />
        </div>
        <label className={styles.availability}>
          {t("site.availability")}
          <select
            aria-label={t("site.availability")}
            value={availability}
            onChange={(event) =>
              setAvailability(event.target.value as Availability | "all")
            }
          >
            <option value="all">{t("site.allAvailabilityStates")}</option>
            {Object.entries(availabilityLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {text(label)}
              </option>
            ))}
          </select>
        </label>
        {(query || category !== "all" || availability !== "all") && (
          <Button variant="ghost" size="sm" onClick={reset}>
            {t("site.clearFilters")}
          </Button>
        )}
      </div>
      <div className={styles.layout}>
        <nav
          className={styles.categories}
          aria-label={t("site.dictionaryCategories")}
        >
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            <span>{t("site.allEntries")}</span>
            <span>{matching.length}</span>
          </button>
          {dictionaryCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              <span>
                {text(item.name)}
                <small>{item.english}</small>
              </span>
              <span>
                {matching.filter((entry) => entry.category === item.id).length}
              </span>
            </button>
          ))}
        </nav>
        <section
          className={styles.collection}
          aria-label={t("site.dictionaryEntries")}
        >
          <div className={styles.collectionHeader}>
            <h2>
              {category === "all"
                ? t("site.allEntries")
                : text(
                    dictionaryCategories.find(({ id }) => id === category)
                      ?.name ?? "",
                  )}
            </h2>
            <p role="status" aria-live="polite">
              {filtered.length} {t("site.results")}
              {query && ` · “${query}”`}
            </p>
          </div>
          <DataRegion
            state={filtered.length ? "success" : "empty"}
            emptyTitle={t("site.noMatchingEntries")}
            emptyDescription={t(
              "site.tryAChineseAppearanceDescriptionEnglishNameOrClear",
            )}
            emptyAction={
              <Button variant="secondary" size="sm" onClick={reset}>
                {t("site.clearAllFilters")}
              </Button>
            }
          >
            <div className={styles.grid}>
              {filtered.map((entry) => (
                <button
                  type="button"
                  key={entry.slug}
                  className={styles.entry}
                  aria-label={t("site.viewValueValue", {
                    value0: entry.name,
                    value1: entry.chinese,
                  })}
                  aria-pressed={selected?.slug === entry.slug}
                  aria-controls="dictionary-detail"
                  onClick={() => select(entry.slug)}
                >
                  <DictionaryPreview entry={entry} mini />
                  <span className={styles.entryTitle}>{entry.name}</span>
                  <span className={styles.entryChinese}>{entry.chinese}</span>
                  <span
                    className={styles.entryStatus}
                    data-available={entry.availability === "available"}
                  >
                    {text(availabilityLabels[entry.availability])}
                  </span>
                </button>
              ))}
            </div>
          </DataRegion>
        </section>
        {selected && (
          <aside
            id="dictionary-detail"
            className={styles.detail}
            aria-label={t("site.entryDetails")}
          >
            <div className={styles.detailHeader}>
              <p>
                {
                  dictionaryCategories.find(
                    ({ id }) => id === selected.category,
                  )?.english
                }
              </p>
              <h2 ref={detailTitle} tabIndex={-1}>
                {selected.name}
              </h2>
              <div>
                <span>{selected.chinese}</span>
                <Badge
                  size="sm"
                  tone={
                    selected.availability === "available" ? "info" : "neutral"
                  }
                >
                  {text(availabilityLabels[selected.availability])}
                </Badge>
              </div>
            </div>
            <div key={selected.slug} className={styles.detailBody}>
              <p className={styles.description}>{text(selected.description)}</p>
              {selected.aliases?.length ? (
                <p className={styles.aliases}>
                  <span>{t("site.alsoCalled")}</span>
                  {selected.aliases.join(" · ")}
                </p>
              ) : null}
              <section
                aria-label={`${selected.name} ${Demo ? t("site.interactiveDemo") : t("site.appearancePreview")}`}
                className={styles.livePreview}
              >
                {Demo ? (
                  <div
                    className={
                      component?.widePreview ? styles.wideDemo : undefined
                    }
                  >
                    <Demo />
                  </div>
                ) : (
                  <FoundationPreview entry={selected} />
                )}
              </section>
              {!Demo && (
                <p className={styles.caption}>
                  {selected.availability === "planned"
                    ? t("site.appearancePreviewStandaloneComponentNotAvailable")
                    : selected.availability === "embedded"
                      ? t(
                          "site.appearancePreviewEmbeddedPatternIsNotAStandaloneComponent",
                        )
                      : selected.availability === "reference"
                        ? t(
                            "site.visualReferenceCheckSuitabilityForTheProductContext",
                          )
                        : t("site.foundationUseSharedThemeAndConventions")}
                </p>
              )}
              <dl className={styles.guidance}>
                <div>
                  <dt>{t("site.whenToUse")}</dt>
                  <dd>{text(selected.use)}</dd>
                </div>
                <div>
                  <dt>{t("site.whenToAvoid")}</dt>
                  <dd>{text(selected.avoid)}</dd>
                </div>
              </dl>
              {(selected.category === "foundations" ||
                selected.category === "shapes" ||
                selected.category === "effects") && (
                <Link className={styles.docsLink} href="/style-workbench">
                  {t("site.adjustParametersAndCompare")}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
              {selected.tokens && (
                <section className={styles.tokens}>
                  <h3>{t("site.themeTokens")}</h3>
                  {selected.tokens.map((token) => (
                    <code key={token}>--{token}</code>
                  ))}
                </section>
              )}
              {selected.code && (
                <section className={styles.code}>
                  <div>
                    <h3>
                      {selected.availability === "reference"
                        ? t("site.referenceCss")
                        : t("site.usage2")}
                    </h3>
                    <CopyButton value={selected.code} />
                  </div>
                  <pre>
                    <code>{selected.code}</code>
                  </pre>
                </section>
              )}
              {selected.source && (
                <p className={styles.source}>
                  {t("site.source3")}
                  <code>{selected.source}</code>
                </p>
              )}
              {(selected.componentSlug || selected.relatedSlug) && (
                <Link
                  className={styles.docsLink}
                  href={`/docs/${selected.componentSlug ?? selected.relatedSlug}`}
                >
                  {selected.componentSlug
                    ? t("site.openComponentDocumentationAndSource")
                    : t("site.viewRelatedComponent")}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          </aside>
        )}
      </div>
    </main>
  )
}
