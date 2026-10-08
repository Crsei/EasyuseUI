import { SiteText } from "@/components/site/site-i18n"
import { ComponentBrowser } from "@/components/docs/component-browser"

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
        <SiteText messageKey="site.pickOneAndStartBuilding" />
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        <SiteText messageKey="site.optimization.catalogIntro" />
      </p>
      <ComponentBrowser />
    </main>
  )
}
