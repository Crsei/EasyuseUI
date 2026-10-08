"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import { Checkbox } from "@/components/ui/checkbox"
export function CheckboxDemo() {
  const { t } = useSiteI18n()
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-1">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        {t("site.commonComponents.check")}
      </label>
      <Checkbox indeterminate aria-label={t("site.commonComponents.mixed")} />
      <Checkbox disabled aria-label={t("site.commonComponents.disabled")} />
    </div>
  )
}
