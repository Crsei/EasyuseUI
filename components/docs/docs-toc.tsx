"use client"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import styles from "./docs.module.css"
export type TocSection = { id: string; title: ReactNode }
export function DocsToc({
  sections,
  compact = false,
}: {
  sections: TocSection[]
  compact?: boolean
}) {
  const { t } = useSiteI18n(),
    [active, setActive] = useState(sections[0]?.id)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -60% 0px" },
    )
    for (const section of sections) {
      const node = document.getElementById(section.id)
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [sections])
  const links = (
    <nav aria-label={t("site.redesign.toc")} className={styles.toc}>
      {sections.map((section) => (
        <Link
          prefetch={false}
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "location" : undefined}
          onClick={() => setActive(section.id)}
        >
          {section.title}
        </Link>
      ))}
    </nav>
  )
  return compact ? (
    <details className={styles.tocMobile}>
      <summary>{t("site.redesign.toc")}</summary>
      {links}
    </details>
  ) : (
    <aside className={styles.tocDesktop}>
      <div className={styles.toc}>
        <p className="mb-3 font-medium text-foreground">
          {t("site.redesign.toc")}
        </p>
        {links}
      </div>
    </aside>
  )
}
