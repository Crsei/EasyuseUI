"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { SegmentBar } from "@/components/ui/segment-bar"
export function SegmentBarDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <>
        <SegmentBar label={t("site.commonComponents.meter")} value={72} />
        <SegmentBar label="Unknown health" value={null} />
      </>
    </div>
  )
}
