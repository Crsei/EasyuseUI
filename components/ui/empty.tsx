"use client"
import type { ComponentProps, ReactNode } from "react"
import { Inbox } from "lucide-react"
import { useI18n } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"
export type EmptyProps = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
}
export function Empty({
  title,
  description,
  icon,
  action,
  className,
  children,
  ...props
}: EmptyProps) {
  const { t } = useI18n()
  return (
    <div
      {...props}
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center",
        className,
      )}
    >
      {icon ?? <Inbox aria-hidden="true" size={20} />}
      <h3 className="text-sm font-medium leading-5">
        {title ?? t("workspaceShellDemo.noContentYet")}
      </h3>
      <p className="max-w-xs text-[13px] leading-5 text-muted-foreground">
        {description ?? t("dataRegion.noDataInThisScopeAdjustTheFilters")}
      </p>
      {action}
      {children}
    </div>
  )
}
