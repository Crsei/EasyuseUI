import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SiteText } from "@/components/site/site-i18n"
import { SiteLocalized } from "@/components/site/site-localized"
import { ScenePreview } from "@/components/site/home/scene-preview"
import { ComponentThumbnail } from "@/components/site/home/component-thumbnail"
import { CodeBlock } from "@/components/docs/code-block"
import { componentManifest } from "@/lib/component-manifest"
import { exampleManifest } from "@/lib/example-manifest"
import { blogSummaries } from "@/lib/blog"
import { registryUrl } from "@/lib/site"
import styles from "@/components/site/site.module.css"
export const metadata = { alternates: { canonical: "/" } }
export default function Home() {
  const featured = [
    "button",
    "data-table",
    "tool-call",
    "work-items-workspace",
    "workflow-canvas",
    "runtime-status-badge",
    "tree",
    "inspector",
  ].map((slug) => componentManifest.find((entry) => entry.slug === slug)!)
  const posts = [...blogSummaries]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3),
    composition = exampleManifest.find(
      (example) => example.id === "work-items",
    )!
  return (
    <main id="main-content" className={styles.container}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>EASYUSEUI / REACT SOURCE</span>
        <h1>
          <SiteText messageKey="site.redesign.homeTitle" />
        </h1>
        <p>
          <SiteText messageKey="site.redesign.homeIntro" />
        </p>
        <div className={styles.actions}>
          <Link
            prefetch={false}
            href="/docs/installation/"
            className={styles.action + " " + styles.primary}
          >
            <SiteText messageKey="site.redesign.build" />
            <ArrowUpRight size={16} />
          </Link>
          <Link prefetch={false} href="/examples/" className={styles.action}>
            <SiteText messageKey="site.redesign.viewExamples" />
          </Link>
        </div>
      </section>
      <ScenePreview />
      <section className={styles.section}>
        <h2>
          <SiteText messageKey="site.redesign.featured" />
        </h2>
        <p className={styles.sectionIntro}>
          <SiteText messageKey="site.redesign.featuredIntro" />
        </p>
        <div className={styles.featured}>
          {featured.map((entry) => (
            <Link
              prefetch={false}
              key={entry.slug}
              href={entry.docPath}
              className={styles.featureLink}
            >
              <ComponentThumbnail slug={entry.slug} />
              <div className={styles.featureInfo}>
                <h3>{entry.name}</h3>
                <p>
                  <SiteText text={entry.description} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h2>
          <SiteText messageKey="site.redesign.composition" />
        </h2>
        <p className={styles.sectionIntro}>
          <SiteText messageKey="site.redesign.sourceOwnership" />
        </p>
        <div className={styles.steps}>
          <ol>
            {["chooseStep", "installStep", "composeStep"].map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <Link
                  prefetch={false}
                  className="inline-flex min-h-11 items-center"
                  href={
                    index === 0
                      ? "/components/"
                      : index === 1
                        ? "/docs/installation/"
                        : "/docs/composing-workspaces/"
                  }
                >
                  <SiteText
                    messageKey={
                      `site.redesign.${step}` as "site.redesign.chooseStep"
                    }
                  />
                </Link>
              </li>
            ))}
          </ol>
          <CodeBlock
            lang="bash"
            title="Terminal"
            code={`pnpm dlx shadcn@4.21.2 add ${registryUrl}/work-items-workspace.json`}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {composition.components.map((slug) => {
            const entry = componentManifest.find(
              (entry) => entry.slug === slug,
            )!
            return (
              <Link
                key={slug}
                prefetch={false}
                href={entry.docPath}
                className="inline-flex min-h-11 items-center rounded-md border px-3 text-xs"
              >
                {entry.name}
              </Link>
            )
          })}
        </div>
      </section>
      <section className={styles.section}>
        <h2>
          <SiteText messageKey="site.redesign.recent" />
        </h2>
        <div className={styles.articles}>
          {posts.map((post) => (
            <article key={post.slug} className={styles.article}>
              <span className="text-xs text-muted-foreground">
                <SiteText
                  messageKey={`site.optimization.status.${post.status}`}
                />
              </span>
              <h3 className="mt-3">
                <SiteLocalized
                  value={{
                    "zh-CN": post.title["zh-CN"],
                    en: post.title.en ?? post.title["zh-CN"],
                  }}
                />
              </h3>
              <p>
                <SiteLocalized
                  value={{
                    "zh-CN": post.summary["zh-CN"],
                    en: post.summary.en ?? post.summary["zh-CN"],
                  }}
                />
              </p>
              <Link prefetch={false} href={`/blog/${post.slug}/`}>
                <SiteText messageKey="site.redesign.readArticle" /> ↗
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.closing}>
        <p className="text-base font-medium">
          <SiteText messageKey="site.redesign.composition" />
        </p>
        <Link
          prefetch={false}
          href="/docs/installation/"
          className={styles.action + " " + styles.primary}
        >
          <SiteText messageKey="site.redesign.build" />
          <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  )
}
