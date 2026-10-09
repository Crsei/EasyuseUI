"use client"
import { useId } from "react"
import { Button } from "@/components/ui/button"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { Item } from "@/components/ui/item"
import { useI18n } from "@/lib/i18n-provider"
import type { ContextReference } from "@/lib/agent-workbench-model"
import styles from "./workbench.module.css"
export function ContextPicker({
  references,
  onPick,
}: {
  references: readonly ContextReference[]
  onPick: (reference: ContextReference) => void
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <label className={styles.label} htmlFor={id}>
      {t("workbench.pickReference")}
      <select
        id={id}
        className={styles.select}
        value=""
        onChange={(e) => {
          const r = references.find((r) => r.id === e.target.value)
          if (r) onPick(r)
        }}
      >
        <option value="">{t("workbench.addContext")}</option>
        {references.map((r) => (
          <option
            key={r.id}
            value={r.id}
            disabled={r.availability === "denied"}
          >
            {r.label} · {t(`workbench.${r.availability}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
export function ContextPanel({
  references,
  onRemove,
  onInclude,
  onRetry,
  onOpen,
  data,
  limit,
}: {
  references: readonly ContextReference[]
  onRemove?: (id: string) => void
  onInclude?: (id: string, included: boolean) => void
  onRetry?: (id: string) => void
  onOpen?: (reference: ContextReference) => void
  data?: Omit<DataRegionProps, "children" | "hasContent">
  limit?: number
}) {
  const { t } = useI18n()
  const included = references.filter((r) => r.included)
  const usage =
    included.length &&
    included.every(
      (r) =>
        r.usage?.unit === "tokens" &&
        Number.isFinite(r.usage.value) &&
        r.usage.value >= 0,
    )
      ? included.reduce((a, r) => a + (r.usage?.value ?? 0), 0)
      : undefined
  return (
    <section aria-label={t("workbench.context")}>
      <p className={styles.status}>
        {usage === undefined
          ? t("workbench.usageUnknown")
          : `${t("workbench.usage")}: ${usage}${limit === undefined ? "" : ` / ${limit}`}`}
        {included.some((r) => r.usage?.estimated) &&
          ` · ${t("workbench.estimated")}`}
        {usage !== undefined && limit !== undefined && usage > limit && (
          <span role="alert"> · {t("workbench.limit")}</span>
        )}
      </p>
      <DataRegion
        state={references.length ? "success" : "empty"}
        {...data}
        hasContent={references.length > 0}
        emptyTitle={t("workbench.emptyContext")}
      >
        {references.map((r) => (
          <div
            className={styles.context}
            key={r.id}
            data-context-id={r.id}
            data-invalid={r.availability !== "available"}
          >
            <Item
              title={r.label}
              description={`${r.kind} · ${r.source ?? "—"}${r.version ? ` @${r.version}` : ""}`}
              onSelect={onOpen ? () => onOpen(r) : undefined}
              trailing={
                onRemove && r.removable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${t("workbench.remove")} ${r.label}`}
                    onClick={() => onRemove(r.id)}
                  >
                    {t("workbench.remove")}
                  </Button>
                ) : undefined
              }
            />
            <div className={styles.row}>
              <span className={styles.meta}>
                {t(`workbench.${r.availability}`)}
                {r.reason && ` · ${r.reason}`}
              </span>
              {onInclude && (
                <label className={styles.meta}>
                  <input
                    type="checkbox"
                    checked={r.included}
                    onChange={(e) => onInclude(r.id, e.target.checked)}
                  />{" "}
                  {t("workbench.included")}
                </label>
              )}
              {onRetry &&
                ["failed", "stale", "unknown"].includes(r.availability) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onRetry(r.id)}
                  >
                    {t("workbench.retry")}
                  </Button>
                )}
            </div>
            {r.usage && (
              <p className={styles.meta}>
                {r.usage.value} {r.usage.unit} · {r.usage.source}
                {r.usage.estimated ? ` · ${t("workbench.estimated")}` : ""}
              </p>
            )}
          </div>
        ))}
      </DataRegion>
    </section>
  )
}
