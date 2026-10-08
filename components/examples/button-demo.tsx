"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  const { t } = useSiteI18n()

  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle")
  const [selected, setSelected] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function save() {
    setStatus("loading")
    timer.current = setTimeout(() => setStatus("saved"), 800)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button loading={status === "loading"} onClick={save}>
          {status === "loading"
            ? t("site.saving2")
            : status === "saved"
              ? t("site.savedSaveAgain")
              : t("site.saveChanges")}
        </Button>
        <Button variant="outline">{t("site.secondaryAction")}</Button>
        <Button variant="ghost">{t("site.lightweightAction")}</Button>
        <Button disabled>{t("site.unavailable3")}</Button>
      </div>
      <div
        aria-label={t("site.buttonSizesAndSelection")}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Button size="sm" variant="secondary">
          {t("site.small28")}
        </Button>
        <Button variant="secondary">{t("site.standard32")}</Button>
        <Button size="lg" variant="secondary">
          {t("site.large36")}
        </Button>
        <Button
          variant="ghost"
          aria-pressed={selected}
          onClick={() => setSelected(!selected)}
        >
          {t("site.toggleSelection")}
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {status === "saved"
          ? t("site.demoSettingsSaved")
          : t("site.clickSaveToTryLoadingAndDisabledStates")}
      </p>
    </div>
  )
}
