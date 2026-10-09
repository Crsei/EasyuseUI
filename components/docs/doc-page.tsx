import Link from "next/link"
import type { ReactNode } from "react"
import { SiteText, SiteElement } from "@/components/site/site-i18n"
import { DocsToc } from "./docs-toc"
import styles from "./docs.module.css"
export type DocSection = { id: string; title: ReactNode; content: ReactNode }
export function DocPage({
  title,
  description,
  group,
  sections,
  preview,
  related,
  previous,
  next,
}: {
  title: ReactNode
  description: ReactNode
  group?: ReactNode
  sections: DocSection[]
  preview?: ReactNode
  related?: ReactNode
  previous?: { name: ReactNode; href: string }
  next?: { name: ReactNode; href: string }
}) {
  const toc = sections.map(({ id, title }) => ({ id, title }))
  return (
    <div className={styles.page}>
      <article className={styles.content}>
        <SiteElement
          as="nav"
          textProps={{ "aria-label": { key: "site.redesign.breadcrumb" } }}
          className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link prefetch={false} href="/docs/">
            <SiteText messageKey="site.documentation" />
          </Link>
          <span aria-hidden="true">/</span>
          {group ?? title}
        </SiteElement>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
        <DocsToc sections={toc} compact />
        {preview}
        {sections.map((section) => (
          <section className={styles.section} id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.content}
          </section>
        ))}
        {related && (
          <section className={styles.section} id="related">
            <h2>
              <SiteText messageKey="site.redesign.related" />
            </h2>
            {related}
          </section>
        )}
        {(previous || next) && (
          <SiteElement
            as="nav"
            textProps={{ "aria-label": { key: "site.redesign.pagination" } }}
            className={styles.pagination}
          >
            {previous ? (
              <Link prefetch={false} href={previous.href}>
                <span className="text-xs text-muted-foreground">
                  <SiteText messageKey="site.redesign.previous" />
                </span>
                <span className="text-sm">{previous.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link prefetch={false} href={next.href} className="text-right">
                <span className="text-xs text-muted-foreground">
                  <SiteText messageKey="site.redesign.next" />
                </span>
                <span className="text-sm">{next.name}</span>
              </Link>
            ) : (
              <span />
            )}
          </SiteElement>
        )}
      </article>
      <DocsToc sections={toc} />
    </div>
  )
}
