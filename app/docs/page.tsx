import Link from "next/link"
import { SiteText } from "@/components/site/site-i18n"
import { SiteLocalized } from "@/components/site/site-localized"
import { docGuides } from "@/lib/doc-guides"
import docs from "@/lib/docs-index.json"
import { DocPage } from "@/components/docs/doc-page"
export const metadata = {
  title: "介绍",
  description:
    "从第一个组件到完整工作台，了解安装、受控模式、国际化与源码接入。",
  alternates: { canonical: "/docs/" },
}
export default function DocsPage() {
  return (
    <DocPage
      title={<SiteText messageKey="site.introduction" />}
      description={<SiteText messageKey="site.redesign.guideIntro" />}
      sections={[
        {
          id: "learning-paths",
          title: <SiteText messageKey="site.redesign.guidePaths" />,
          content: (
            <div className="grid gap-4">
              {[
                "installation",
                "controlled-components",
                "composing-workspaces",
              ].map((slug, index) => {
                const guide = docGuides.find((guide) => guide.slug === slug)!
                return (
                  <Link
                    key={slug}
                    href={`/docs/${slug}/`}
                    prefetch={false}
                    className="flex gap-4 rounded-xl border p-5 hover:bg-surface-hover"
                  >
                    <span className="font-mono text-sm text-primary">
                      0{index + 1}
                    </span>
                    <div>
                      <h3>
                        <SiteLocalized value={guide.title} />
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <SiteLocalized value={guide.summary} />
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ),
        },
        {
          id: "component-groups",
          title: <SiteText messageKey="site.componentCatalog" />,
          content: (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "interaction",
                "data",
                "agent",
                "canvas",
                "workspace",
                "other",
              ].map((group) => (
                <Link
                  href={`/components/?group=${group}`}
                  prefetch={false}
                  key={group}
                  className="rounded-lg border p-4 hover:bg-surface-hover"
                >
                  <h3>
                    <SiteText
                      messageKey={
                        `site.redesign.group.${group}` as "site.redesign.group.interaction"
                      }
                    />
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {docs
                      .filter((entry) => entry.docGroup === group)
                      .slice(0, 3)
                      .map((entry) => entry.name)
                      .join(" · ")}
                  </p>
                </Link>
              ))}
            </div>
          ),
        },
        {
          id: "guides",
          title: <SiteText messageKey="site.redesign.searchGuides" />,
          content: (
            <ul className="divide-y border-y">
              {docGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    prefetch={false}
                    href={`/docs/${guide.slug}/`}
                    className="flex min-h-11 items-center py-3 text-sm text-primary"
                  >
                    <SiteLocalized value={guide.title} />
                  </Link>
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  )
}
