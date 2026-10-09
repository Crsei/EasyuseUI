"use client"
import { Calendar, Ellipsis } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/blocks/data-table"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SegmentBar } from "@/components/ui/segment-bar"
import { Sparkline } from "@/components/ui/sparkline"
import { Tag } from "@/components/ui/tag"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import type { DataRegionProps } from "@/components/ui/data-region"
import type { Company, Sort } from "./model"
import { CompanyTags } from "./controls"
import { summarize, visibleTags } from "./selectors"
import { useCrmI18n } from "./i18n"
import styles from "./sales-crm-theme.module.css"
export function SalesCrmTable({
  rows,
  selectedIds,
  onSelection,
  activeId,
  onCompany,
  onPerson,
  sort,
  onSort,
  data,
}: {
  rows: readonly Company[]
  selectedIds: readonly string[]
  onSelection: (ids: string[]) => void
  activeId: string | null
  onCompany: (id: string) => void
  onPerson: (name: string) => void
  sort: Sort
  onSort: (sort: Sort) => void
  data: Omit<DataRegionProps, "children" | "hasContent">
}) {
  const { t, locale } = useCrmI18n()
  const money = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(value + "T00:00:00Z"))
  const columns: DataTableColumn<Company>[] = [
    {
      id: "name",
      header: t("crm.companies"),
      sortable: true,
      className: styles.nameCell,
      cell: (c) => (
        <span className={styles.companyName}>
          {c.logo && <Avatar name={c.name} src={c.logo} size={24} />}
          {c.name}
        </span>
      ),
    },
    {
      id: "tags",
      header: t("crm.segmentStage"),
      cell: (c) => {
        const tags = visibleTags(c.tags)
        return (
          <span className={styles.tags}>
            <CompanyTags tags={tags.visible} />
            {tags.hidden > 0 && (
              <Tag
                className={styles.tag}
                title={c.tags.slice(tags.visible.length).join(", ")}
              >
                +{tags.hidden}
              </Tag>
            )}
          </span>
        )
      },
    },
    {
      id: "owner",
      header: t("crm.owner"),
      cell: (c) => (
        <Button
          variant="ghost"
          className={styles.owner}
          onClick={() => onPerson(c.owner)}
          aria-label={t("crm.openProfile", { name: c.owner })}
        >
          <Avatar name={c.owner} size={24} />
          {c.owner}
        </Button>
      ),
    },
    {
      id: "openDeals",
      header: t("crm.openDeals"),
      align: "right",
      sortable: true,
      cell: (c) => c.openDeals,
    },
    {
      id: "pipelineValue",
      header: t("crm.pipelineValue"),
      align: "right",
      sortable: true,
      cell: (c) => money(c.pipelineValue),
    },
    {
      id: "winProbability",
      header: t("crm.winProbability"),
      sortable: true,
      cell: (c) => (
        <SegmentBar
          label={`${c.name} · ${t("crm.winProbability")}`}
          value={c.winProbability}
          valueText={`${c.winProbability}%`}
          segments={18}
          className={styles.win}
          color="var(--crm-trend)"
        />
      ),
    },
    {
      id: "trend",
      header: t("crm.trend"),
      cell: (c) => (
        <Sparkline
          label={`${c.name} · ${t("crm.trend")}`}
          values={c.trend}
          color={(v, i) =>
            i % 3 === 0 ? "var(--crm-trend-muted)" : "var(--crm-trend)"
          }
          className={styles.sparkline}
        />
      ),
    },
    {
      id: "lastInteraction",
      header: t("crm.lastInteraction"),
      sortable: true,
      cell: (c) => (
        <span className={styles.interaction}>
          <Calendar size={13} aria-hidden="true" />
          {date(c.lastInteraction.date)}
          <span className={styles.interactionDivider} />
          {c.lastInteraction.label}
        </span>
      ),
    },
    {
      id: "action",
      header: t("crm.action"),
      align: "center",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("crm.rowActions", { name: c.name })}
              />
            }
          >
            <Ellipsis aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onCompany(c.id)}>
              {t("crm.viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPerson(c.owner)}>
              {t("crm.viewOwner")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
  const summary = summarize(rows)
  return (
    <div className={styles.tableArea}>
      <DataTable
        className={styles.dataTable}
        rows={rows}
        columns={columns}
        caption={t("crm.selectionHint")}
        getRowId={(c) => c.id}
        getRowLabel={(c) => c.name}
        selectedIds={selectedIds}
        onSelectionChange={onSelection}
        activeRowId={activeId}
        onActivateRow={(c) => onCompany(c.id)}
        sort={sort}
        onSortChange={onSort}
        stickyHeader
        data={data}
      />
      <footer className={styles.summary} aria-label={t("crm.sampleStats")}>
        <span>
          <b data-crm-count>{summary.count}</b> {t("crm.companiesInView")}
          <small data-crm-selection>
            {t("crm.selected", { count: selectedIds.length })}
          </small>
        </span>
        <span>
          {t("crm.pipelineSum")}{" "}
          <b data-crm-pipeline>{money(summary.pipeline)}</b>
        </span>
        <span>
          {t("crm.avgWin")}{" "}
          <b>{summary.win === null ? "—" : `${Math.round(summary.win)}%`}</b>
        </span>
        <span aria-disabled="true">＋ {t("crm.addCalculation")}</span>
      </footer>
    </div>
  )
}
