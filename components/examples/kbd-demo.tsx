"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Kbd } from "@/components/ui/kbd"
export function KbdDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span>
        {t("site.commonComponents.shortcut")}{" "}
        <Kbd aria-label="Control K">Ctrl K</Kbd>
      </span>
    </div>
  )
}
