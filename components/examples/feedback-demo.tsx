"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Progress, Meter } from "@/components/ui/progress"
import { ToastProvider, Toaster, useToastManager } from "@/components/ui/toast"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
export function SkeletonDemo() {
  const { t } = useSiteI18n()
  return (
    <div
      className="grid w-full max-w-md gap-3"
      role="group"
      aria-busy="true"
      aria-label={t("site.completion.loading")}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-2 border-b py-3">
          <Skeleton className="w-2/3" />
          <Skeleton className="w-2/5" />
        </div>
      ))}
    </div>
  )
}
export function SpinnerDemo() {
  return <Spinner />
}
export function EmptyDemo() {
  const { t } = useSiteI18n()
  return (
    <Empty
      title={t("site.completion.empty")}
      description={t("site.completion.emptyHint")}
      action={
        <Button
          variant="secondary"
          onClick={() => document.getElementById("empty-example-next")?.focus()}
        >
          {t("site.completion.next")}
        </Button>
      }
    >
      <a
        id="empty-example-next"
        href="#empty-example-next"
        className="text-xs text-primary"
      >
        {t("site.completion.hint")}
      </a>
    </Empty>
  )
}
export function AlertDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="grid gap-3">
      <Alert tone="error">
        <AlertTitle>{t("site.completion.error")}</AlertTitle>
        <AlertDescription>{t("site.completion.hint")}</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertTitle>{t("site.completion.pending")}</AlertTitle>
      </Alert>
    </div>
  )
}
export function ProgressDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="grid w-full max-w-md gap-4">
      <Progress value={40} label={t("site.completion.loading")} />
      <Progress value={null} label={t("site.completion.pending")} />
      <label className="grid gap-2 text-xs">
        CPU
        <Meter min={0} max={100} value={64} />
      </label>
      <p className="text-xs text-muted-foreground">
        {t("site.completion.hint")}
      </p>
    </div>
  )
}
function ToastActions() {
  const { t } = useSiteI18n()
  const manager = useToastManager()
  return (
    <div className="grid gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          manager.add({
            id: "example-request",
            title: t("site.completion.pending"),
            description: t("site.completion.hint"),
            timeout: 0,
          })
        }
      >
        {t("site.completion.open")}
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          manager.update("example-request", {
            title: t("site.completion.error"),
            type: "error",
            timeout: 0,
          })
        }
      >
        {t("site.completion.error")}
      </Button>
      <Toaster />
    </div>
  )
}
export function ToastDemo() {
  return (
    <ThemeBoundary>
      <ToastProvider limit={3}>
        <ToastActions />
      </ToastProvider>
    </ThemeBoundary>
  )
}
export const SonnerDemo = ToastDemo
