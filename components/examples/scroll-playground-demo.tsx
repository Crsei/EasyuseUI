"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import {
  ScrollPlayground,
  type ScrollPattern,
} from "@/components/blocks/scroll-playground"

export function ScrollPlaygroundDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [pattern, setPattern] = useState<ScrollPattern>("triggered")
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="text-xs text-muted-foreground">
          {t("site.selectScrollEffect")}
        </label>
        <select
          id={id}
          value={pattern}
          onChange={(event) => setPattern(event.target.value as ScrollPattern)}
          className="min-w-0 rounded-md border bg-background px-3 py-2 text-xs"
        >
          <option value="triggered">01 · Scroll-triggered</option>
          <option value="linked">02 · Scroll-linked</option>
          <option value="parallax">03 · Parallax</option>
          <option value="sticky">04 · Sticky</option>
          <option value="snap">05 · Scroll Snap</option>
          <option value="horizontal">06 · Horizontal Scroll</option>
        </select>
      </div>
      <ScrollPlayground pattern={pattern} />
    </div>
  )
}
