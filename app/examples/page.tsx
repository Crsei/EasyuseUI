import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Item } from "@/components/ui/item"
import { SiteText } from "@/components/site/site-i18n"

export const metadata: Metadata = {
  title: "组件示例",
  description: "通过完整交互示例了解 EasyuseUI 组件的组合方式。",
}

export default function ExamplesPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8"
    >
      <h1 className="text-2xl font-semibold tracking-tight">
        <SiteText messageKey="site.examples.title" />
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        <SiteText messageKey="site.examples.description" />
      </p>
      <ul className="mt-8 divide-y border-y">
        <li>
          <Link
            prefetch={false}
            href="/examples/work-items/"
            aria-label="Work Items"
            className="block py-3 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Item
              title="Work Items"
              description={
                <SiteText messageKey="site.examples.workItemsDescription" />
              }
              trailing={<ArrowUpRight size={16} aria-hidden="true" />}
            />
          </Link>
        </li>
      </ul>
      <Link
        prefetch={false}
        href="/components/"
        className="mt-6 inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <SiteText messageKey="site.browseComponents" />
      </Link>
    </main>
  )
}
