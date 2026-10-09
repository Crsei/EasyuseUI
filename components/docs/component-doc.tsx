import Link from "next/link"
import { SiteText } from "@/components/site/site-i18n"
import { SiteLocalized } from "@/components/site/site-localized"
import {
  componentManifest,
  type ComponentManifestEntry,
} from "@/lib/component-manifest"
import docs from "@/lib/docs-index.json"
import fileIndex from "@/lib/docs-code-index.json"
import { exampleManifest } from "@/lib/example-manifest"
import { registryUrl } from "@/lib/site"
import { CodeBlock } from "./code-block"
import { ComponentPreview } from "./component-preview"
import { SourceBrowser, type SourceFile } from "./source-browser"
import { DocPage, type DocSection } from "./doc-page"
export function ComponentDoc({ entry }: { entry: ComponentManifestEntry }) {
  const files = (fileIndex as Record<string, SourceFile[]>)[entry.slug]
  const exampleFiles = files.filter((file) => file.kind === "example"),
    sourceFiles = files.filter((file) => file.kind !== "example")
  const position = docs.findIndex((item) => item.slug === entry.slug),
    previous = docs[position - 1],
    next = docs[position + 1]
  const examples = exampleManifest.filter((example) =>
    example.components.includes(entry.slug),
  )
  const related =
    entry.related
      ?.map((slug) => componentManifest.find((item) => item.slug === slug))
      .filter((item) => !!item) ??
    componentManifest
      .filter(
        (item) => item.docGroup === entry.docGroup && item.slug !== entry.slug,
      )
      .slice(0, 3)
  const sections: DocSection[] = [
    {
      id: "installation",
      title: <SiteText messageKey="site.installation" />,
      content: (
        <CodeBlock
          lang="bash"
          title="Terminal"
          code={`pnpm dlx shadcn@4.21.2 add ${registryUrl}/${entry.registryId}.json`}
        />
      ),
    },
    {
      id: "usage",
      title: <SiteText messageKey="site.usage" />,
      content: <CodeBlock code={entry.usage} />,
    },
    ...(entry.variants?.length
      ? [
          {
            id: "variants",
            title: <SiteText messageKey="site.redesign.variants" />,
            content: (
              <div className="space-y-6">
                {entry.variants.map((variant, index) => (
                  <div key={index}>
                    <h3 className="mb-3">
                      <SiteLocalized value={variant.title} />
                    </h3>
                    <CodeBlock code={variant.code} />
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    {
      id: "api",
      title: "API",
      content: (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="border-b bg-muted/30">
              <tr>
                {[
                  "site.property",
                  "site.redesign.apiType",
                  "site.redesign.apiDefault",
                  "site.description",
                ].map((key) => (
                  <th key={key} scope="col" className="p-3 font-medium">
                    <SiteText messageKey={key as "site.property"} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name} className="border-b last:border-0">
                  <th
                    scope="row"
                    className="p-3 align-top font-mono font-normal"
                  >
                    {prop.name}
                  </th>
                  <td className="p-3 align-top font-mono leading-6">
                    <Link
                      prefetch={false}
                      href="#source"
                      className="underline decoration-border underline-offset-4"
                    >
                      {prop.type}
                    </Link>
                  </td>
                  <td className="p-3 align-top font-mono">
                    {prop.default ?? "—"}
                  </td>
                  <td className="p-3 align-top leading-6 text-muted-foreground">
                    <SiteText text={prop.description} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "states",
      title: <SiteText messageKey="site.redesign.states" />,
      content: (
        <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
          {entry.notes.map((note) => (
            <li key={note}>
              <SiteText text={note} />
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "example",
      title: <SiteText messageKey="site.completeExample" />,
      content: (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            <SiteText messageKey="site.redesign.sourceContext" />
          </p>
          <SourceBrowser key={`${entry.slug}-example`} files={exampleFiles} />
        </>
      ),
    },
    {
      id: "source",
      title: <SiteText messageKey="site.redesign.source" />,
      content: (
        <SourceBrowser key={`${entry.slug}-source`} files={sourceFiles} />
      ),
    },
  ]
  return (
    <DocPage
      title={entry.name}
      description={<SiteText text={entry.description} />}
      group={
        <SiteText
          messageKey={
            `site.redesign.group.${entry.docGroup}` as "site.redesign.group.interaction"
          }
        />
      }
      sections={sections}
      preview={
        <ComponentPreview
          key={entry.slug}
          slug={entry.slug}
          name={entry.name}
          wide={entry.widePreview}
          files={exampleFiles}
        />
      }
      previous={
        previous
          ? { name: previous.name, href: previous.docPath }
          : {
              name: <SiteText messageKey="site.redesign.composeStep" />,
              href: "/docs/composing-workspaces/",
            }
      }
      next={next ? { name: next.name, href: next.docPath } : undefined}
      related={
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {related.map(
              (item) =>
                item && (
                  <Link
                    prefetch={false}
                    href={item.docPath}
                    key={item.slug}
                    className="inline-flex min-h-11 items-center rounded-lg border px-3 text-sm hover:bg-surface-hover"
                  >
                    {item.name}
                  </Link>
                ),
            )}
          </div>
          {examples.map((example) => (
            <div
              key={example.id}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              <Link
                prefetch={false}
                href={example.href}
                className="inline-flex min-h-11 items-center text-primary"
              >
                <SiteLocalized value={example.title} /> ↗
              </Link>
              <Link
                prefetch={false}
                href={`/blog/${example.article}/`}
                className="inline-flex min-h-11 items-center text-muted-foreground"
              >
                <SiteText messageKey="site.redesign.readArticle" />
              </Link>
            </div>
          ))}
        </div>
      }
    />
  )
}
