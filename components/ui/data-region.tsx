"use client"
import { useI18n } from "@/lib/i18n-provider"
import { localizeStaticData } from "@/lib/i18n-core"
import type { UiMessage } from "@/lib/i18n-core"
import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DataState, ErrorCategory } from "@/lib/runtime-status"
import styles from "./data-region.module.css"

export type RegionError = {
  category: ErrorCategory
  messageI18n?: UiMessage
  reasonI18n?: UiMessage
  message: string
  reason: string
}
export type DataRegionProps = {
  state?: DataState
  children?: ReactNode
  hasContent?: boolean
  refreshing?: boolean
  updatedAt?: string
  error?: RegionError
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  partialDescription?: string
  onLoadMore?: () => void
  loadingLabel?: string
  rowHeight?: number
}
const categories: Record<ErrorCategory, string> = {
  validation: "校验错误",
  request: "请求错误",
  runtime: "运行错误",
  agent: "Agent 错误",
  permission: "权限错误",
  network: "网络错误",
}
export function DataRegion({
  state = "success",
  children,
  hasContent = false,
  refreshing,
  updatedAt,
  error,
  onRetry,
  emptyTitle: providedEmptyTitle,
  emptyDescription: providedEmptyDescription,
  emptyAction,
  partialDescription: providedPartialDescription,
  onLoadMore,
  loadingLabel: providedLoadingLabel,
  rowHeight = 56,
}: DataRegionProps) {
  const { t, locale, resolve } = useI18n()
  const emptyTitle = providedEmptyTitle ?? t("workspaceShellDemo.noContentYet")
  const emptyDescription =
    providedEmptyDescription ??
    t("dataRegion.noDataInThisScopeAdjustTheFilters")
  const partialDescription =
    providedPartialDescription ??
    t("dataRegion.partialDataMissingFieldsAppearAs")
  const loadingLabel = providedLoadingLabel ?? t("dataRegion.loading")
  const localizedCategories = localizeStaticData(categories, locale)

  return (
    <div
      className={styles.region}
      aria-busy={state === "loading" || refreshing}
      data-data-state={state}
    >
      {state === "loading" && !hasContent ? (
        <div aria-label={loadingLabel} className={styles.skeletons}>
          {[0, 1, 2].map((key) => (
            <div key={key} style={{ minHeight: rowHeight }}>
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : (
        <>
          {(refreshing || (state === "loading" && hasContent)) && (
            <p role="status" className={styles.notice}>
              {t("dataRegion.updatingExistingContentPreserved")}
            </p>
          )}
          {state === "error" && (
            <div role="alert" className={styles.error}>
              <div>
                <p>
                  {localizedCategories[error?.category ?? "request"]}：
                  {resolve(
                    error?.messageI18n,
                    error?.message ?? t("dataRegion.couldNotReadData"),
                  )}
                </p>
                <p>
                  {resolve(
                    error?.reasonI18n,
                    error?.reason ??
                      t("dataRegion.theCauseIsUnconfirmedInspectTheDetailsOr"),
                  )}
                  {hasContent &&
                    t("dataRegion.existingContentIsPreservedAndMayBeOut")}
                </p>
                {updatedAt && (
                  <p>
                    {t("dataRegion.lastUpdated")}
                    {updatedAt}
                  </p>
                )}
              </div>
              {onRetry && (
                <Button size="sm" variant="secondary" onClick={onRetry}>
                  {t("workspaceShellDemo.retryRead")}
                </Button>
              )}
            </div>
          )}
          {state === "partial" && (
            <p className={styles.notice}>{partialDescription}</p>
          )}
          {state === "empty" ? (
            <div className={styles.empty}>
              <Inbox size={20} aria-hidden="true" />
              <h3>{emptyTitle}</h3>
              <p>{emptyDescription}</p>
              {emptyAction}
            </div>
          ) : (
            (state !== "error" || hasContent) && children
          )}
          {state === "partial" && onLoadMore && (
            <Button variant="secondary" size="sm" onClick={onLoadMore}>
              {t("dataRegion.loadMore")}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
