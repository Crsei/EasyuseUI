"use client"
import { useSiteI18n } from "./site-i18n"
import type { SiteLocalizedText } from "@/lib/example-manifest"
export function SiteLocalized({ value }: { value: SiteLocalizedText }) {
  const { locale } = useSiteI18n()
  return value[locale]
}
