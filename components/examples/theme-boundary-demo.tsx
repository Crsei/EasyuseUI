"use client"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSiteI18n } from "@/components/site/site-i18n"
export function ThemeBoundaryDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <ThemeBoundary
          key={theme}
          mode="scoped"
          theme={theme}
          legacyAliases
          className="rounded-lg border p-4"
          data-theme-example={theme}
        >
          <p className="mb-4 text-sm font-semibold">{theme}</p>
          <div className="flex flex-wrap items-center gap-3">
            <RuntimeStatusBadge status="running" />
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                {t("site.optimization.openThemeDialog")}
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>
                  {t("site.optimization.themeScope")} · {theme}
                </DialogTitle>
                <DialogDescription>
                  {t("site.optimization.portalScopeNote")}
                </DialogDescription>
                <Button>{t("site.optimization.exampleAction")}</Button>
              </DialogContent>
            </Dialog>
          </div>
        </ThemeBoundary>
      ))}
    </div>
  )
}
