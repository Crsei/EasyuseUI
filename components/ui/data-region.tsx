import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DataState, ErrorCategory } from "@/lib/runtime-status"
import styles from "./data-region.module.css"

export type RegionError = {
  category: ErrorCategory
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
  emptyTitle = "这里暂时没有内容",
  emptyDescription = "当前范围没有数据，请调整筛选条件。",
  emptyAction,
  partialDescription = "当前为部分数据，缺失字段显示「—」。",
  onLoadMore,
  loadingLabel = "正在加载",
  rowHeight = 56,
}: DataRegionProps) {
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
              更新中 · 已有内容保留
            </p>
          )}
          {state === "error" && (
            <div role="alert" className={styles.error}>
              <div>
                <p>
                  {categories[error?.category ?? "request"]}：
                  {error?.message ?? "无法读取数据"}
                </p>
                <p>
                  {error?.reason ?? "原因尚未确认，请查看详情或重新读取。"}
                  {hasContent && " 已有内容已保留，可能不是最新数据。"}
                </p>
                {updatedAt && <p>最后更新：{updatedAt}</p>}
              </div>
              {onRetry && (
                <Button size="sm" variant="secondary" onClick={onRetry}>
                  重试读取
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
              加载更多
            </Button>
          )}
        </>
      )}
    </div>
  )
}
