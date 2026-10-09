"use client"
import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { owners, STAGES } from "./fixtures"
import type { Filters, Sort } from "./model"
import { CrmSelect } from "./controls"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function SalesCrmToolbar({
  filters,
  onFilters,
  sort,
  onSort,
  onExport,
  onNew,
}: {
  filters: Filters
  onFilters: (filters: Filters) => void
  sort: Sort
  onSort: (sort: Sort) => void
  onExport: () => void
  onNew: () => void
}) {
  const { t } = useCrmI18n()
  const sortControl = (
    <CrmSelect
      label={t("crm.sort")}
      prefix={t("crm.sort")}
      value={sort?.columnId ?? "none"}
      options={[
        { value: "pipelineValue", label: t("crm.pipelineValue") },
        { value: "name", label: t("crm.companyName") },
        { value: "openDeals", label: t("crm.openDeals") },
        { value: "winProbability", label: t("crm.winProbability") },
        { value: "lastInteraction", label: t("crm.lastInteraction") },
        { value: "none", label: "—" },
      ]}
      onChange={(columnId) =>
        onSort(
          columnId === "none"
            ? null
            : { columnId, direction: columnId === "name" ? "asc" : "desc" },
        )
      }
    />
  )
  return (
    <FilterToolbar
      className={styles.toolbar}
      label={t("crm.filters")}
      filterTitle={t("crm.filters")}
      filterDescription={t("crm.filtersDescription")}
      sort={sortControl}
      filters={
        <>
          <div className={styles.mobileSort}>{sortControl}</div>
          <CrmSelect
            label={t("crm.owner")}
            prefix={t("crm.ownerFilter")}
            value={filters.owner}
            options={[
              { value: "all", label: t("crm.allOwners") },
              ...owners.map((p) => ({ value: p.name, label: p.name })),
            ]}
            onChange={(owner) => onFilters({ ...filters, owner })}
          />
          <CrmSelect
            label={t("crm.stage")}
            prefix={t("crm.stage")}
            value={filters.stage}
            options={[
              { value: "any", label: t("crm.anyStage") },
              ...STAGES.map((stage) => ({ value: stage, label: stage })),
            ]}
            onChange={(stage) => onFilters({ ...filters, stage })}
          />
          <CrmSelect
            label={t("crm.activity")}
            prefix={t("crm.activity")}
            value={String(filters.activity)}
            options={[7, 30, 90].map((days) => ({
              value: String(days),
              label: t("crm.days", { count: days }),
            }))}
            onChange={(activity) =>
              onFilters({ ...filters, activity: Number(activity) })
            }
          />
          {(filters.owner !== "all" ||
            filters.stage !== "any" ||
            filters.activity !== 90) && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("crm.resetFilters")}
              onClick={() =>
                onFilters({ owner: "all", stage: "any", activity: 90 })
              }
            >
              ×
            </Button>
          )}
        </>
      }
      actions={
        <>
          <Button variant="outline" onClick={onExport}>
            <Download aria-hidden="true" />
            <span>{t("crm.export")}</span>
          </Button>
          <Button onClick={onNew}>
            <Plus aria-hidden="true" />
            {t("crm.newCompany")}
          </Button>
        </>
      }
    />
  )
}
