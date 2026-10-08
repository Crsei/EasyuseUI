"use client"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useSiteI18n } from "@/components/site/site-i18n"
export type ExampleDataState = "success" | "loading" | "partial" | "error"
export function DataStateSelect({
  value,
  onChange,
  partial = true,
}: {
  value: ExampleDataState
  onChange: (state: ExampleDataState) => void
  partial?: boolean
}) {
  const { t } = useSiteI18n()
  return (
    <Select
      items={Object.fromEntries(
        (["success", "loading", "partial", "error"] as const).map((state) => [
          state,
          t(`site.commonComponents.${state}`),
        ]),
      )}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger aria-label={t("site.commonComponents.dataState")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["success", "loading", "partial", "error"] as const)
          .filter((state) => partial || state !== "partial")
          .map((state) => (
            <SelectItem key={state} value={state}>
              {t(`site.commonComponents.${state}`)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
