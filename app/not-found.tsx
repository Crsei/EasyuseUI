import { SiteText } from "@/components/site/site-i18n"
import Link from "next/link"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-5 px-5 py-24"
    >
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">
        <SiteText messageKey="site.noComponentHereYet" />
      </h1>
      <Link
        href="/components"
        className="text-sm text-primary underline underline-offset-4"
      >
        <SiteText messageKey="site.backToTheComponentCatalog" />
      </Link>
    </main>
  )
}
