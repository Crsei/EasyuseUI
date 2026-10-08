import Link from "next/link"
import { SiteElement, SiteText } from "@/components/site/site-i18n"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/docs/code-block"
import { DemoLoader } from "@/components/docs/demo-loader"
import type { BlogPost, BlogImage } from "@/lib/blog-model"
import { BlogPicture, BlogText, OriginalLanguageNotice } from "./blog-text"
import { MetricTable } from "./metric-table"
function Figure({ image }: { image: BlogImage | null }) {
  return image ? (
    <figure>
      <BlogPicture image={image} />
      <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">
        <BlogText value={image.caption} /> · {image.capturedAt} · {image.theme}{" "}
        · {image.locale} · {image.viewport.width}×{image.viewport.height}
        <span className="mt-1 block break-all font-mono">
          {image.sourceSnapshotId.slice(0, 16)}
        </span>
      </figcaption>
    </figure>
  ) : (
    <p className="flex min-h-32 items-center justify-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <SiteText messageKey="site.optimization.pendingEvidence" />
    </p>
  )
}
export function BlogArticle({ post }: { post: BlogPost }) {
  const headings = post.body.filter((block) => block.type === "heading")
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8"
    >
      <Link prefetch={false} href="/blog/" className="text-sm text-primary">
        <SiteText messageKey="site.optimization.backToBlog" />
      </Link>
      <header className="mt-6 max-w-3xl">
        <Badge>
          <SiteText messageKey={`site.optimization.status.${post.status}`} />
        </Badge>
        <h1 className="mt-4 text-3xl leading-tight font-semibold">
          <BlogText value={post.title} />
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          <BlogText value={post.summary} />
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
          <div>
            <dt>
              <SiteText messageKey="site.optimization.author" />
            </dt>
            <dd>{post.author}</dd>
          </div>
          <div>
            <dt>
              <SiteText messageKey="site.optimization.published" />
            </dt>
            <dd>
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </dd>
          </div>
          <div>
            <dt>
              <SiteText messageKey="site.optimization.updated" />
            </dt>
            <dd>
              <time dateTime={post.updatedAt}>{post.updatedAt}</time>
            </dd>
          </div>
          <div>
            <dt>OPT</dt>
            <dd>{post.optimizationIds.join(" · ")}</dd>
          </div>
        </dl>
        <p className="mt-4 break-all text-xs text-muted-foreground">
          <SiteText messageKey="site.optimization.scope" />:{" "}
          {post.resultVersion ?? post.sourceSnapshotId?.slice(0, 16) ?? "—"}
        </p>
        <OriginalLanguageNotice hasEnglishBody={post.hasEnglishBody} />
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,72ch)_220px]">
        <article className="min-w-0 text-sm leading-7">
          <div lang={post.hasEnglishBody ? undefined : post.originalLocale}>
            {post.body.map((block, index) =>
              block.type === "heading" ? (
                <h2
                  key={block.id}
                  id={block.id}
                  className="mt-10 mb-4 scroll-mt-28 text-xl font-semibold first:mt-0"
                >
                  <BlogText value={block.text} />
                </h2>
              ) : block.type === "paragraph" ? (
                <p key={index} className="my-4">
                  <BlogText value={block.text} />
                </p>
              ) : block.type === "link" ? (
                <p key={index} className="my-4">
                  <Link
                    prefetch={false}
                    href={block.href}
                    className="text-primary underline"
                  >
                    <BlogText value={block.text} />
                  </Link>
                </p>
              ) : block.type === "list" ? (
                <ul key={index} className="my-4 list-disc space-y-2 pl-5">
                  {block.items.map((item, i) => (
                    <li key={i}>
                      <BlogText value={item} />
                    </li>
                  ))}
                </ul>
              ) : block.type === "code" ? (
                <CodeBlock
                  key={index}
                  code={block.code}
                  lang={block.language}
                />
              ) : block.type === "image" ? (
                <Figure key={index} image={block.image} />
              ) : block.type === "comparison" ? (
                <div key={index} className="my-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-medium">
                      <SiteText messageKey="site.optimization.before" />
                    </h3>
                    <Figure image={block.before} />
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium">
                      <SiteText messageKey="site.optimization.after" />
                    </h3>
                    <Figure image={block.after} />
                  </div>
                </div>
              ) : block.type === "metrics" ? (
                <MetricTable key={index} metrics={block.metrics} />
              ) : (
                <section key={index} className="my-6 border-y py-4">
                  <Link
                    prefetch={false}
                    href={`/docs/${block.componentSlug}/`}
                    className="text-primary"
                  >
                    <SiteText messageKey="site.optimization.currentDemo" /> ·{" "}
                    {block.componentSlug}
                  </Link>
                  <p className="my-2 text-xs text-muted-foreground">
                    <SiteText messageKey="site.optimization.currentDemoNote" />
                  </p>
                  <DemoLoader slug={block.componentSlug} />
                </section>
              ),
            )}
          </div>
          <section
            aria-labelledby="blog-evidence"
            className="mt-10 border-t pt-6"
          >
            <h2 id="blog-evidence" className="text-xl font-semibold">
              <SiteText messageKey="site.optimization.evidence" />
            </h2>
            {post.evidence.length ? (
              <ul className="mt-4 divide-y">
                {post.evidence.map((item) => (
                  <li key={item.id} className="py-4">
                    <time
                      dateTime={item.capturedAt}
                      className="block text-xs text-muted-foreground"
                    >
                      {item.capturedAt}
                    </time>
                    <a href={item.file} download className="text-primary">
                      <SiteText messageKey="site.optimization.downloadReport" />{" "}
                      · {item.id}
                    </a>
                    <p>
                      <BlogText value={item.scope} />
                    </p>
                    <dl className="mt-2 text-xs break-words text-muted-foreground">
                      <div>
                        <dt className="inline">
                          <SiteText messageKey="site.optimization.environment" />
                          :{" "}
                        </dt>
                        <dd className="inline">{item.environment}</dd>
                      </div>
                      <div>
                        <dt className="inline">
                          <SiteText messageKey="site.optimization.method" />
                          :{" "}
                        </dt>
                        <dd className="inline">{item.method}</dd>
                      </div>
                      <div>
                        <dt className="inline">
                          <SiteText messageKey="site.optimization.sampleCount" />
                          :{" "}
                        </dt>
                        <dd className="inline">{item.sampleCount}</dd>
                      </div>
                      <div className="break-all">
                        <dt className="inline">
                          <SiteText messageKey="site.optimization.sourceSnapshot" />
                          :{" "}
                        </dt>
                        <dd className="inline">{item.sourceSnapshotId}</dd>
                      </div>
                    </dl>
                    <code className="block overflow-x-auto text-xs">
                      {item.command}
                    </code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-muted-foreground">
                <SiteText messageKey="site.optimization.pendingEvidence" />
              </p>
            )}
          </section>
          <section className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold">
              <SiteText messageKey="site.optimization.limitations" />
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {post.limitations.map((item, i) => (
                <li key={i}>
                  <BlogText value={item} />
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold">
              <SiteText messageKey="site.optimization.related" />
            </h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {post.relatedComponents.map((slug) => (
                <Link
                  key={slug}
                  href={`/docs/${slug}/`}
                  prefetch={false}
                  className="text-primary"
                >
                  {slug}
                </Link>
              ))}
              {post.relatedPosts.map((slug) => (
                <Link
                  prefetch={false}
                  key={slug}
                  href={`/blog/${slug}/`}
                  className="text-primary"
                >
                  {slug}
                </Link>
              ))}
            </div>
          </section>
        </article>
        <SiteElement
          as="nav"
          textProps={{ "aria-label": { key: "site.optimization.contents" } }}
          className="row-start-1 border-b pb-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-auto lg:self-start lg:border-b-0"
        >
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            <SiteText messageKey="site.optimization.contents" />
          </p>
          <ol className="space-y-2">
            {headings.map((block) => (
              <li key={block.id}>
                <a
                  href={`#${block.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <BlogText value={block.text} />
                </a>
              </li>
            ))}
          </ol>
        </SiteElement>
      </div>
    </main>
  )
}
