"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { MetricSummary } from "@/components/blocks/metric-summary"
export function MetricSummaryDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <MetricSummary
        items={[
          { id: "workers", label: t("site.commonComponents.count"), value: 3 },
          {
            id: "tasks",
            label: t("site.commonComponents.runs"),
            value: 60,
            unit: t("site.commonComponents.units"),
          },
        ]}
      />
    </div>
  )
}
