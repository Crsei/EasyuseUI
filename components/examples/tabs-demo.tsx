"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
export function TabsDemo() {
  const { t } = useSiteI18n()
  return (
    <Tabs defaultValue="summary">
      <TabsList aria-label={t("site.optimization.details")}>
        <TabsTab value="summary">{t("site.optimization.summaryTab")}</TabsTab>
        <TabsTab value="evidence">{t("site.optimization.evidenceTab")}</TabsTab>
        <TabsTab value="disabled" disabled>
          {t("site.commonComponents.disabled")}
        </TabsTab>
      </TabsList>
      <TabsPanel value="summary">
        {t("site.optimization.localExample")}
      </TabsPanel>
      <TabsPanel value="evidence">
        {t("site.optimization.evidenceExample")}
      </TabsPanel>
    </Tabs>
  )
}
