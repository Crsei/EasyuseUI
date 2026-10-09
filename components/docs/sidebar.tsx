"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSiteI18n } from "@/components/site/site-i18n"
import { resourceNavigation } from "@/lib/site-navigation"
import styles from "./docs.module.css"
const groups = [
  "interaction",
  "data",
  "agent",
  "canvas",
  "workspace",
  "other",
] as const
export type DocsNavigation = {
  components: {
    name: string
    docPath: string
    docGroup: string
    aliases: string[]
  }[]
  guides: { slug: string; title: { "zh-CN": string; en: string } }[]
}
export function Sidebar({
  components: componentIndex,
  guides,
  onNavigate,
}: DocsNavigation & { onNavigate?: () => void }) {
  const { t, locale } = useSiteI18n(),
    pathname = usePathname().replace(/\/$/, "") || "/docs",
    ref = useRef<HTMLElement>(null),
    [query, setQuery] = useState(""),
    [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const q = query.trim().toLocaleLowerCase()
  const sections = [
    {
      id: "getting-started",
      links: [
        { href: "/docs/", name: t("site.introduction") },
        ...guides.map((guide) => ({
          href: `/docs/${guide.slug}/`,
          name: guide.title[locale],
        })),
      ],
    },
    ...groups.map((group) => ({
      id: group,
      links: componentIndex
        .filter((entry) => entry.docGroup === group)
        .map((entry) => ({
          href: entry.docPath,
          name: entry.name,
          keywords: entry.aliases.join(" "),
        })),
    })),
    {
      id: "resources",
      links: resourceNavigation.map((item) => ({
        href: item.href,
        name: t(item.key),
      })),
    },
  ]
  const activeSection = sections.find((section) =>
    section.links.some((item) => item.href.replace(/\/$/, "") === pathname),
  )?.id
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    if (activeSection)
      setExpanded((previous) => ({ ...previous, [activeSection]: true }))
  }
  useEffect(() => {
    const current = ref.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    )
    if (!current) return
    const rect = current.getBoundingClientRect(),
      scrollArea = ref.current?.closest<HTMLElement>(
        "aside,[data-docs-scroll]",
      ),
      container = scrollArea?.getBoundingClientRect()
    if (
      container &&
      (rect.top < container.top || rect.bottom > container.bottom)
    )
      scrollArea?.scrollBy({
        top:
          rect.top < container.top
            ? rect.top - container.top
            : rect.bottom - container.bottom,
      })
  }, [pathname])
  return (
    <nav
      ref={ref}
      aria-label={t("site.documentationNavigation")}
      className={styles.navigation}
    >
      <Input
        className="sticky top-0 z-10 shrink-0 bg-background"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t("site.redesign.filterDocs")}
        placeholder={t("site.redesign.filterDocs")}
      />
      {sections.map((section) => {
        const links = section.links.filter((item) =>
            `${item.name} ${item.href} ${"keywords" in item ? item.keywords : ""}`
              .toLocaleLowerCase()
              .includes(q),
          ),
          active = section.links.some(
            (item) => item.href.replace(/\/$/, "") === pathname,
          )
        return links.length ? (
          <details
            key={section.id}
            open={Boolean(q) || (expanded[section.id] ?? active)}
            onToggle={(event) => {
              if (q) return
              const open = event.currentTarget.open
              setExpanded((previous) =>
                previous[section.id] === open
                  ? previous
                  : { ...previous, [section.id]: open },
              )
            }}
          >
            <summary>
              {t(
                `site.redesign.group.${section.id}` as "site.redesign.group.interaction",
              )}
              <ChevronDown size={14} />
            </summary>
            <ul>
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={
                      item.href.replace(/\/$/, "") === pathname
                        ? "page"
                        : undefined
                    }
                    onClick={onNavigate}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null
      })}
      {!sections.some((section) =>
        section.links.some((item) =>
          `${item.name} ${item.href} ${"keywords" in item ? item.keywords : ""}`
            .toLocaleLowerCase()
            .includes(q),
        ),
      ) && (
        <p role="status" className="text-sm">
          {t("site.noMatchingEntries")}
        </p>
      )}
    </nav>
  )
}
