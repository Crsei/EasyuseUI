"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
export function PopoverDemo() {
  const { t } = useSiteI18n()
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        {t("site.optimization.details")}
      </PopoverTrigger>
      <PopoverContent className="max-w-xs p-4">
        <PopoverTitle>{t("site.optimization.details")}</PopoverTitle>
        <PopoverDescription>
          {t("site.optimization.localExample")}
        </PopoverDescription>
        <PopoverClose render={<Button variant="outline" />}>
          {t("site.optimization.closePreview")}
        </PopoverClose>
      </PopoverContent>
    </Popover>
  )
}
