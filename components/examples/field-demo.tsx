"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export function FieldDemo() {
  const { t } = useSiteI18n()
  const [draft, setDraft] = useState("")
  const [checked, setChecked] = useState(false)
  const [budget, setBudget] = useState("1.5")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setChecked(true)
      }}
      noValidate
      className="space-y-3"
    >
      <Field
        label={t("site.commonComponents.name")}
        description={t("site.commonComponents.description")}
        required
        error={
          checked && !draft.trim()
            ? t("site.commonComponents.required")
            : undefined
        }
      >
        {(props) => (
          <Input
            {...props}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
      </Field>
      <Field
        label={t("site.commonComponents.budget")}
        error={
          checked && !/^\d+(\.\d+)?$/.test(budget)
            ? t("site.commonComponents.budgetError")
            : undefined
        }
      >
        {(props) => (
          <Input
            {...props}
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        )}
      </Field>
      <Button type="submit">{t("site.commonComponents.validate")}</Button>
    </form>
  )
}
