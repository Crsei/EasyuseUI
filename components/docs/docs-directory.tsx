"use client"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Sidebar, type DocsNavigation } from "./sidebar"
const NavigationDrawer = dynamic(
  () =>
    import("@/components/site/navigation-drawer").then(
      (module) => module.NavigationDrawer,
    ),
  { ssr: false },
)
export function DocsDirectory(navigation: DocsNavigation) {
  const { t } = useSiteI18n(),
    [loaded, setLoaded] = useState(false),
    [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setLoaded(true)
          setOpen(true)
        }}
      >
        <Menu size={16} />
        {t("site.redesign.docsMenu")}
      </Button>
      {loaded && (
        <NavigationDrawer
          open={open}
          onOpenChange={setOpen}
          title={t("site.redesign.docsMenu")}
          description={t("site.redesign.filterDocs")}
        >
          <Sidebar {...navigation} onNavigate={() => setOpen(false)} />
        </NavigationDrawer>
      )}
    </>
  )
}
