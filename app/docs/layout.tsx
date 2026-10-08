import { Sidebar } from "@/components/docs/sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14 lg:py-12">
      <aside className="min-w-0">
        <Sidebar />
      </aside>
      <main id="main-content" className="min-w-0 max-w-3xl pb-16">
        {children}
      </main>
    </div>
  )
}
