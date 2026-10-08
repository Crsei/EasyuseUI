"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Segmented, SegmentedItem } from "@/components/ui/segmented"
import { useState } from "react"
export function SegmentedDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState("list")
  return (
    <Segmented
      aria-label={t("site.optimization.displayMode")}
      value={value}
      onValueChange={setValue}
    >
      <SegmentedItem value="list">
        {t("site.optimization.listView")}
      </SegmentedItem>
      <SegmentedItem value="grid">
        {t("site.optimization.gridView")}
      </SegmentedItem>
    </Segmented>
  )
}
