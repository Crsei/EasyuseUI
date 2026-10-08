"use client"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { I18nProvider } from "@/lib/i18n-provider"
import { SheetDemo } from "./sheet-demo"
import { SelectDemo } from "./select-demo"
import { CommandPaletteDemo } from "./command-palette-demo"
export function CommonComponentsPreview() {
  return (
    <div className="space-y-4">
      {(["light", "dark"] as const).map((theme, index) => (
        <ThemeBoundary
          key={theme}
          mode="scoped"
          legacyAliases
          theme={theme}
          data-common-scope={theme}
          className="rounded-md border p-4"
        >
          <I18nProvider locale={index === 0 ? "zh-CN" : "en"}>
            <h2 className="mb-3 text-base font-medium">{theme}</h2>
            <div className="space-y-4">
              <SheetDemo />
              <SelectDemo />
              <CommandPaletteDemo />
            </div>
          </I18nProvider>
        </ThemeBoundary>
      ))}
    </div>
  )
}
