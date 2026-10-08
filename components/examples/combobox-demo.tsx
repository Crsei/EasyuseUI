"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
export function ComboboxDemo() {
  const { t } = useSiteI18n()
  const items = ["alpha", "beta", "gamma"]
  return (
    <Combobox items={items}>
      <ComboboxInput aria-label={t("site.optimization.findWorkspace")} />
      <ComboboxContent>
        <ComboboxEmpty>{t("site.noMatchingEntries")}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
