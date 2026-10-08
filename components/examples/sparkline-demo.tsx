"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Sparkline } from "@/components/ui/sparkline"
export function SparklineDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <>
        <Sparkline
          label={t("site.commonComponents.sparkline")}
          values={[2, 5, null, 4, 8, 0, -2]}
        />
        <Sparkline label="Equal values" values={[3, 3, 3]} />
        <Sparkline label="Empty values" values={[]} />
      </>
    </div>
  )
}
