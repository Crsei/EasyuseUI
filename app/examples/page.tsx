import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { ExampleGallery } from "@/components/site/example-gallery"
import { SiteText } from "@/components/site/site-i18n"
import styles from "@/components/site/site.module.css"
export const metadata = {
  title: "组件示例",
  description: "通过 Agent、Work Items 与 Canvas 的本地交互示例探索组件组合。",
  alternates: { canonical: "/examples/" },
}
export default function ExamplesPage() {
  return (
    <main id="main-content" className={styles.container + " py-12 sm:py-16"}>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <SiteText messageKey="site.examples.title" />
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        <SiteText messageKey="site.redesign.exampleGalleryIntro" />
      </p>
      <ExampleGallery />
      <Link
        href="/examples/component-contracts/"
        prefetch={false}
        className="mt-8 flex min-h-11 items-center gap-1 text-sm text-primary"
      >
        <SiteText messageKey="site.gap.contracts" />
        <ArrowUpRight aria-hidden="true" size={16} className="shrink-0" />
      </Link>
      <Link
        href="/components/"
        prefetch={false}
        className="mt-8 inline-flex min-h-11 items-center gap-1 text-sm text-primary"
      >
        <SiteText messageKey="site.redesign.browseAll" />
        <ArrowUpRight aria-hidden="true" size={16} className="shrink-0" />
      </Link>
    </main>
  )
}
