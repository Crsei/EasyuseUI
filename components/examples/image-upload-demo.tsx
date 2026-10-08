"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import { ImageUpload } from "@/components/blocks/image-upload"
export function ImageUploadDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState<File | null>(null)
  return (
    <ImageUpload
      label={t("site.commonComponents.image")}
      value={value}
      onValueChange={setValue}
      maxBytes={1024 * 1024}
      accept="image/png,image/jpeg"
    />
  )
}
