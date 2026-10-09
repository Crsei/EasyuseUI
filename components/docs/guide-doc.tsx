import Link from "next/link"
import { SiteText } from "@/components/site/site-i18n"
import { SiteLocalized } from "@/components/site/site-localized"
import { docGuides, type DocGuide } from "@/lib/doc-guides"
import { registryUrl } from "@/lib/site"
import { CodeBlock } from "./code-block"
import { DocPage } from "./doc-page"
export function GuideDoc({ guide }: { guide: DocGuide }) {
  const position = docGuides.findIndex((item) => item.slug === guide.slug),
    previous = docGuides[position - 1],
    next = docGuides[position + 1]
  return (
    <DocPage
      metadata={{
        pathname: `/docs/${guide.slug}`,
        title: guide.title,
        description: guide.summary,
      }}
      title={<SiteLocalized value={guide.title} />}
      description={<SiteLocalized value={guide.summary} />}
      group={<SiteText messageKey="site.redesign.group.getting-started" />}
      sections={guide.sections.map((section) => ({
        id: section.id,
        title: <SiteLocalized value={section.title} />,
        content: (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              <SiteLocalized value={section.body} />
            </p>
            {section.code && (
              <CodeBlock
                lang={section.language ?? "tsx"}
                code={section.code.replaceAll("$REGISTRY_URL", registryUrl)}
              />
            )}
            <div className="mt-4 flex flex-wrap gap-4">
              {section.links?.map((link) => (
                <Link
                  prefetch={false}
                  href={link.href}
                  key={link.href}
                  className="inline-flex min-h-11 items-center text-sm text-primary"
                >
                  <SiteLocalized value={link.title} />
                </Link>
              ))}
            </div>
          </>
        ),
      }))}
      related={
        <div className="text-xs leading-7 text-muted-foreground">
          <p>
            <SiteText messageKey="site.redesign.guideSource" />
          </p>
          {guide.source.split(" / ").map((file) => (
            <a
              key={file}
              className="mr-4 inline-flex min-h-11 items-center underline"
              href={`https://github.com/Crsei/EasyuseUI/blob/main/${file}`}
            >
              {file}
            </a>
          ))}
        </div>
      }
      previous={
        previous
          ? {
              name: <SiteLocalized value={previous.title} />,
              href: `/docs/${previous.slug}/`,
            }
          : {
              name: <SiteText messageKey="site.introduction" />,
              href: "/docs/",
            }
      }
      next={
        next
          ? {
              name: <SiteLocalized value={next.title} />,
              href: `/docs/${next.slug}/`,
            }
          : { name: "Button", href: "/docs/button/" }
      }
    />
  )
}
