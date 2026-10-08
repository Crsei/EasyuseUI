"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import { Slider } from "@/components/ui/slider"
export function SliderDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState(4)
  const [committed, setCommitted] = useState(4)
  return (
    <div className="w-full max-w-sm">
      <Slider
        label={t("site.commonComponents.slider")}
        min={1}
        max={16}
        step={1}
        value={value}
        onChange={setValue}
        onCommit={setCommitted}
      />
      <p role="status">
        {t("site.commonComponents.committed", { value: committed })}
      </p>
    </div>
  )
}
