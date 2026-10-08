"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { RatingDisplay } from "@/components/ui/rating-display"
export function RatingDisplayDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <>
        <RatingDisplay label={t("site.commonComponents.rating")} value={4.5} />
        <RatingDisplay label="Unknown rating" value={null} />
      </>
    </div>
  )
}
