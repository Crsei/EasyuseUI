"use client"

import { useState } from "react"
import { I18nProvider, useI18n } from "@/lib/i18n-provider"
import { type Locale } from "@/lib/i18n-core"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion } from "@/components/ui/data-region"
import { Input } from "@/components/ui/input"

function LocalizedPreview() {
  const { locale, setLocale, t, number, date } = useI18n()
  const [draft, setDraft] = useState("")
  return (
    <div className="space-y-4" data-i18n-preview>
      <label className="flex items-center gap-3 text-sm">
        {t("common.language")}
        <select
          aria-label={t("common.language")}
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          className="h-8 rounded-md border bg-background px-2"
        >
          <option value="zh-CN">简体中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <Input
        aria-label="Draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <RuntimeStatusBadge status="running" />
      <p>
        {t("i18n.items", { count: 1 })} / {t("i18n.items", { count: 2 })}
      </p>
      <p>
        {number(1234.5)} ·{" "}
        {date(Date.UTC(2026, 0, 2), {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
      </p>
      <DataRegion state="empty" />
    </div>
  )
}
export function I18nDemo() {
  return (
    <I18nProvider>
      <LocalizedPreview />
    </I18nProvider>
  )
}
