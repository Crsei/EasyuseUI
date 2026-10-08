"use client"

import { useI18n } from "@/lib/i18n-provider"
import { type Locale } from "@/lib/i18n-core"

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()
  return (
    <select
      aria-label={t("common.language")}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="h-8 max-w-28 rounded-md border bg-background px-2 text-xs outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring [@media(pointer:coarse)]:min-h-11"
    >
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  )
}
