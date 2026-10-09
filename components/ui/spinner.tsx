"use client"
import type { ComponentProps } from "react"
import { useI18n } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"
export function Spinner({
  label,
  className,
  ...props
}: ComponentProps<"span"> & { label?: string }) {
  const { t } = useI18n()
  return (
    <span
      {...props}
      role="status"
      className={cn(
        "inline-flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="size-4 animate-spin motion-reduce:animate-none"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          opacity=".25"
        />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span>{label ?? t("dataRegion.loading")}</span>
    </span>
  )
}
