import { SiteRootText, SiteRootLink } from "@/components/site/site-root-text"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-5 px-5 py-24"
    >
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">
        <SiteRootText messageKey="site.noComponentHereYet" />
      </h1>
      <SiteRootLink
        href="/components"
        className="text-sm text-primary underline underline-offset-4"
      >
        <SiteRootText messageKey="site.backToTheComponentCatalog" />
      </SiteRootLink>
    </main>
  )
}
