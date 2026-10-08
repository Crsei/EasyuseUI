import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { catalog } from "@/lib/catalog"

export const metadata = { title: "组件目录" }

export default function ComponentsPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <p className="mb-4 font-mono text-xs tracking-widest text-primary">
        THE COLLECTION
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">
        挑一个，开始构建。
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        {catalog.filter((entry) => entry.category === "基础组件").length}{" "}
        个基础组件与{" "}
        {catalog.filter((entry) => entry.category === "组合模块").length}{" "}
        个组合模块。每个组件都有可运行的演示、使用说明和完整源码。
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {catalog.map(({ slug, name, category, description, Demo }) => (
          <article
            key={slug}
            className="flex min-w-0 flex-col overflow-hidden rounded-xl border"
          >
            <div className="flex min-h-72 items-center justify-center bg-muted/20 p-7">
              <div className="w-full max-w-md">
                <Demo />
              </div>
            </div>
            <Link
              href={`/docs/${slug}`}
              className="flex items-start justify-between gap-4 border-t p-6"
            >
              <div>
                <p className="mb-2 text-xs text-muted-foreground">{category}</p>
                <h2 className="text-lg font-semibold">{name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
              <ArrowUpRight size={18} className="mt-1 shrink-0" />
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
