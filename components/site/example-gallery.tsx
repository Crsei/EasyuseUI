import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { exampleManifest } from "@/lib/example-manifest"
import { componentManifest } from "@/lib/component-manifest"
import { SiteLocalized } from "./site-localized"
import { SiteText } from "./site-i18n"
import { SceneImage } from "./home/scene-image"
import styles from "./site.module.css"
export function ExampleGallery() {
  return (
    <div className={styles.gallery}>
      {exampleManifest.map((example) => (
        <article
          key={example.id}
          className={styles.galleryCard}
          data-example={example.id}
        >
          <Link
            href={example.href}
            prefetch={false}
            className={styles.galleryImage}
          >
            <SceneImage example={example} />
          </Link>
          <div className={styles.galleryInfo}>
            <h2>
              <SiteLocalized value={example.title} />
            </h2>
            <p>
              <SiteLocalized value={example.description} />
            </p>
            <span className="mt-3 block text-xs text-muted-foreground">
              <SiteText messageKey="site.redesign.localDemo" />
            </span>
            <div className={styles.galleryLinks}>
              {example.components.map((slug) => {
                const entry = componentManifest.find(
                  (item) => item.slug === slug,
                )!
                return (
                  <Link prefetch={false} href={entry.docPath} key={slug}>
                    {entry.name}
                  </Link>
                )
              })}
              <Link
                prefetch={false}
                href={`/blog/${example.article}/`}
                className="gap-1"
              >
                <SiteText messageKey="site.redesign.readArticle" />
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="shrink-0"
                />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
