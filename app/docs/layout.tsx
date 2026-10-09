import docs from "@/lib/docs-index.json"
import guides from "@/lib/guide-navigation.json"
import { Sidebar } from "@/components/docs/sidebar"
import { DocsDirectory } from "@/components/docs/docs-directory"
import styles from "@/components/docs/docs.module.css"
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigation = {
    components: docs.map(({ name, docPath, docGroup, aliases }) => ({
      name,
      docPath,
      docGroup,
      aliases,
    })),
    guides: guides.map(({ slug, title }) => ({ slug, title })),
  }
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} data-docs-sidebar>
        <Sidebar {...navigation} />
      </aside>
      <main id="main-content" className="min-w-0">
        <div className={styles.mobileDirectory}>
          <DocsDirectory {...navigation} />
        </div>
        {children}
      </main>
    </div>
  )
}
