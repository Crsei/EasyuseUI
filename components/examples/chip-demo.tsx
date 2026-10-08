"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"

export function ChipDemo() {
  const { t } = useSiteI18n()

  const [selected, setSelected] = useState(false)
  const [languageSelected, setLanguageSelected] = useState(false)
  const [removed, setRemoved] = useState(false)
  const reset = useRef<HTMLButtonElement>(null)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label={t("site.activeOnly")}
          selected={selected}
          onSelectedChange={setSelected}
        />
        {!removed && (
          <Chip
            label="TypeScript"
            selected={languageSelected}
            onSelectedChange={setLanguageSelected}
            onRemove={() => {
              setRemoved(true)
              reset.current?.focus()
            }}
          />
        )}
        <Chip
          label={t("site.unavailable3")}
          disabled
          onSelectedChange={() => {}}
          onRemove={() => {}}
        />
        <Chip
          label={t("site.saving")}
          busy
          onSelectedChange={() => {}}
          onRemove={() => {}}
        />
      </div>
      <p role="status" className="text-xs leading-5 text-text-secondary">
        {removed
          ? t("site.typescriptRemoved")
          : selected
            ? t("site.activeFilterSelected")
            : t("site.activeFilterNotSelected")}{" "}
        {t("site.localInteractionExample")}
      </p>
      <Button
        ref={reset}
        size="sm"
        variant="secondary"
        onClick={() => {
          setSelected(false)
          setLanguageSelected(false)
          setRemoved(false)
        }}
      >
        {t("site.resetExample")}
      </Button>
    </div>
  )
}
