"use client"

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
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<DictionaryCategory | "all">("all")
  const [availability, setAvailability] = useState<Availability | "all">("all")
  const [selection, setSelection] = useState("color")
  const detailTitle = useRef<HTMLHeadingElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const matching = dictionaryEntries.filter(
    (entry) =>
      matchesDictionaryEntry(entry, query) &&
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
          <h1>视觉词典</h1>
          <p>从长什么样开始，找到名字和用法。</p>
        </div>
        <div className={styles.summary}>
          <Badge>{dictionaryEntries.length} 个词条</Badge>
          <Badge>{catalog.length} 个已有组件</Badge>
          <Badge>9 个分类</Badge>
        </div>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <label htmlFor="dictionary-search" className="sr-only">
            搜索视觉词典
          </label>
          <Input
            ref={search}
            id="dictionary-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="试试：胶囊、阴影、小浮窗、Chip…"
          />
        </div>
        <label className={styles.availability}>
          实现情况
          <select
            aria-label="实现情况"
            value={availability}
            onChange={(event) =>
              setAvailability(event.target.value as Availability | "all")
            }
          >
            <option value="all">全部实现情况</option>
            {Object.entries(availabilityLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {(query || category !== "all" || availability !== "all") && (
          <Button variant="ghost" size="sm" onClick={reset}>
            清除筛选
          </Button>
        )}
      </div>
      <div className={styles.layout}>
        <nav className={styles.categories} aria-label="词典分类">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            <span>全部词条</span>
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
                {item.name}
                <small>{item.english}</small>
              </span>
              <span>
                {matching.filter((entry) => entry.category === item.id).length}
              </span>
            </button>
          ))}
        </nav>
        <section className={styles.collection} aria-label="词条列表">
          <div className={styles.collectionHeader}>
            <h2>
              {category === "all"
                ? "全部词条"
                : dictionaryCategories.find(({ id }) => id === category)?.name}
            </h2>
            <p role="status" aria-live="polite">
              {filtered.length} 个结果{query && ` · “${query}”`}
            </p>
          </div>
          <DataRegion
            state={filtered.length ? "success" : "empty"}
            emptyTitle="没有匹配的词条"
            emptyDescription="试试中文外观描述、英文名，或清除分类和实现情况筛选。"
            emptyAction={
              <Button variant="secondary" size="sm" onClick={reset}>
                清除全部筛选
              </Button>
            }
          >
            <div className={styles.grid}>
              {filtered.map((entry) => (
                <button
                  type="button"
                  key={entry.slug}
                  className={styles.entry}
                  aria-label={`查看 ${entry.name} · ${entry.chinese}`}
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
                    {availabilityLabels[entry.availability]}
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
            aria-label="词条详情"
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
                  {availabilityLabels[selected.availability]}
                </Badge>
              </div>
            </div>
            <div key={selected.slug} className={styles.detailBody}>
              <p className={styles.description}>{selected.description}</p>
              {selected.aliases?.length ? (
                <p className={styles.aliases}>
                  <span>也叫</span>
                  {selected.aliases.join(" · ")}
                </p>
              ) : null}
              <section
                aria-label={`${selected.name} ${Demo ? "交互演示" : "外观示意"}`}
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
                    ? "外观示意 · 尚未提供独立组件"
                    : selected.availability === "embedded"
                      ? "外观示意 · 已有模式不等于同名独立组件"
                      : selected.availability === "reference"
                        ? "视觉参考 · 使用前需符合产品场景"
                        : "基础样式 · 使用共享主题与规范"}
                </p>
              )}
              <dl className={styles.guidance}>
                <div>
                  <dt>什么时候用</dt>
                  <dd>{selected.use}</dd>
                </div>
                <div>
                  <dt>什么时候避免</dt>
                  <dd>{selected.avoid}</dd>
                </div>
              </dl>
              {(selected.category === "foundations" ||
                selected.category === "shapes" ||
                selected.category === "effects") && (
                <Link className={styles.docsLink} href="/style-workbench">
                  调整参数并对比
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
              {selected.tokens && (
                <section className={styles.tokens}>
                  <h3>主题 token</h3>
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
                        ? "参考 CSS"
                        : "用法"}
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
                  源码 <code>{selected.source}</code>
                </p>
              )}
              {(selected.componentSlug || selected.relatedSlug) && (
                <Link
                  className={styles.docsLink}
                  href={`/docs/${selected.componentSlug ?? selected.relatedSlug}`}
                >
                  {selected.componentSlug
                    ? "打开组件文档与源码"
                    : "查看相关组件"}
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
