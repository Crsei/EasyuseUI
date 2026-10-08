"use client"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { BlogImage } from "@/lib/blog-model"
import { useI18n } from "@/lib/i18n-provider"
import { useSiteI18n } from "@/components/site/site-i18n"
import type { BlogText as Text } from "@/lib/blog-model"
export function BlogText({ value }: { value: Text }) {
  const { locale } = useI18n()
  return value[locale] ?? value["zh-CN"]
}
export function OriginalLanguageNotice({
  hasEnglishBody,
}: {
  hasEnglishBody: boolean
}) {
  const { locale, t } = useSiteI18n()
  return locale === "en" && !hasEnglishBody ? (
    <p
      className="my-6 border-l-2 border-primary pl-4 text-sm leading-6 text-muted-foreground"
      role="note"
    >
      {t("site.optimization.originalBody")}
    </p>
  ) : null
}

export function BlogPicture({ image }: { image: BlogImage }) {
  const { locale } = useI18n()
  const { t } = useSiteI18n()
  const [failedSource, setFailedSource] = useState<string | null>(null)
  if (failedSource === image.src)
    return (
      <div
        className="flex min-h-32 flex-col items-start justify-center gap-3 rounded-lg border border-dashed p-4"
        role="status"
      >
        <p>{t("site.optimization.imageUnavailable")}</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFailedSource(null)}
        >
          {t("site.retry")}
        </Button>
      </div>
    )
  return (
    <Image
      src={image.src}
      alt={image.alt[locale] ?? image.alt["zh-CN"]}
      width={image.viewport.width}
      height={image.viewport.height}
      className="h-auto w-full rounded-lg border"
      onError={() => setFailedSource(image.src)}
    />
  )
}
