"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import { Input } from "@/components/ui/input"

export function InputDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [name, setName] = useState("")
  const invalid = name.length > 0 && name.trim().length < 2

  return (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {t("site.projectName")}
      </label>
      <Input
        id={id}
        placeholder={t("site.forExampleMyWorkspace")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-hint`}
      />
      <p
        id={`${id}-hint`}
        className={`text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
      >
        {invalid
          ? t("site.theNameNeedsAtLeast2Characters")
          : name
            ? t("site.aboutToCreateValue", { value0: name })
            : t("site.aClearNameMakesItEasierToFindLater")}
      </p>
    </div>
  )
}
