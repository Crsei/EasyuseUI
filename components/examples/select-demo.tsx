"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectGroup,
  SelectGroupLabel,
} from "@/components/ui/select"
import { useState } from "react"
export function SelectDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState<string | null>("alpha")
  return (
    <Select name="example-workspace" value={value} onValueChange={setValue}>
      <SelectTrigger aria-label={t("site.optimization.chooseWorkspace")}>
        <SelectValue placeholder={t("site.optimization.chooseWorkspace")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel className="px-3 py-2 text-xs text-muted-foreground">
            {t("site.commonComponents.available")}
          </SelectGroupLabel>
          {["alpha", "beta"].map((item) => (
            <SelectItem key={item} value={item}>
              <SelectItemText>{item}</SelectItemText>
            </SelectItem>
          ))}
          <SelectItem value="unavailable" disabled>
            {t("site.commonComponents.disabled")}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
