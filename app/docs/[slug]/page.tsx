import { readFile } from "node:fs/promises"
import path from "node:path"
import { notFound } from "next/navigation"
import { CodeBlock } from "@/components/docs/code-block"
import { catalog } from "@/lib/catalog"
import { registryUrl } from "@/lib/site"

export const dynamicParams = false
export function generateStaticParams() {
  return catalog.map(({ slug }) => ({ slug }))
}
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const entry = catalog.find((item) => item.slug === slug)
  return { title: entry?.name || "组件" }
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params
  const entry = catalog.find((item) => item.slug === slug)
  if (!entry) notFound()
  const { name, category, description, usage, Demo, props, notes } = entry
  const [source, example, ...related] = await Promise.all(
    [entry.source, entry.example, ...(entry.relatedSources || [])].map((file) =>
      readFile(path.join(process.cwd(), file), "utf8"),
    ),
  )

  return (
    <>
      <p className="mb-3 text-xs font-medium text-primary">{category}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <section
        aria-label={`${name} 交互演示`}
        className="mt-8 flex min-h-64 items-center justify-center rounded-xl border bg-muted/20 p-6 sm:p-9"
      >
        <div
          className={entry.widePreview ? "w-full min-w-0" : "w-full max-w-md"}
        >
          <Demo />
        </div>
      </section>
      <h2 id="installation" className="mt-12 mb-4 text-xl font-semibold">
        安装
      </h2>
      <CodeBlock
        lang="bash"
        title="Terminal"
        code={`pnpm dlx shadcn@latest add ${registryUrl}/${slug}.json`}
      />
      <h2 id="usage" className="mt-12 mb-4 text-xl font-semibold">
        使用
      </h2>
      <CodeBlock code={usage} />
      <h2 id="api" className="mt-12 mb-4 text-xl font-semibold">
        API
      </h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-130 text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="p-4 font-medium">
                属性
              </th>
              <th scope="col" className="p-4 font-medium">
                类型与默认值
              </th>
              <th scope="col" className="p-4 font-medium">
                说明
              </th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} className="border-b last:border-0">
                <th
                  scope="row"
                  className="p-4 align-top font-mono text-xs font-normal"
                >
                  {prop.name}
                </th>
                <td className="p-4 align-top font-mono text-xs leading-6">
                  {prop.type}
                  {prop.default && (
                    <p className="text-muted-foreground">
                      默认：{prop.default}
                    </p>
                  )}
                </td>
                <td className="p-4 align-top text-xs leading-6 text-muted-foreground">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <h2 id="example" className="mt-12 mb-4 text-xl font-semibold">
        完整示例
      </h2>
      <p className="mb-4 text-sm leading-7 text-muted-foreground">
        下面的代码就是本页交互演示使用的文件。
      </p>
      <CodeBlock code={example} title={entry.example} />
      <h2 id="source" className="mt-12 mb-4 text-xl font-semibold">
        组件源码
      </h2>
      <CodeBlock code={source} title={entry.source} />
      {entry.relatedSources?.map((file, index) => (
        <div key={file} className="mt-5">
          <CodeBlock
            code={related[index]}
            lang={file.endsWith(".css") ? "css" : "tsx"}
            title={file}
          />
        </div>
      ))}
    </>
  )
}
