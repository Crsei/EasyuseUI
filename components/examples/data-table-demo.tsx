"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/blocks/data-table"
import { Avatar } from "@/components/ui/avatar"
import { SegmentBar } from "@/components/ui/segment-bar"
import { Sparkline } from "@/components/ui/sparkline"
import { RatingDisplay } from "@/components/ui/rating-display"
import { FilterToolbar } from "@/components/blocks/filter-toolbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { MetricSummary } from "@/components/blocks/metric-summary"
import { DataStateSelect, type ExampleDataState } from "./data-state-select"
type Worker = {
  id: string
  name: string
  owner: string
  workspace: string
  tasks: number
  health: number | null
  trend: (number | null)[]
  rating: number
  updated: string
  disabled?: boolean
}
const workers: Worker[] = [
  {
    id: "alpha",
    name: "Alpha worker",
    owner: "Ada Lovelace",
    workspace: "Research",
    tasks: 42,
    health: 84,
    trend: [2, 4, null, 3, 8, 5],
    rating: 4.5,
    updated: "2026-10-08",
  },
  {
    id: "beta",
    name: "Beta worker with a very long descriptive name",
    owner: "Grace Hopper",
    workspace: "Engineering",
    tasks: 18,
    health: null,
    trend: [1, 1, 1, 1],
    rating: 3,
    updated: "—",
  },
  {
    id: "gamma",
    name: "Gamma worker",
    owner: "Lin Chen",
    workspace: "Research",
    tasks: 0,
    health: 0,
    trend: [],
    rating: 0,
    updated: "2026-10-07",
    disabled: true,
  },
]
export function DataTableDemo() {
  const { t } = useSiteI18n()
  const [selected, setSelected] = useState<string[]>(["hidden-worker"])
  const [active, setActive] = useState<string | null>(null)
  const [sort, setSort] = useState<DataTableSort>(null)
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<string | null>("all")
  const [empty, setEmpty] = useState(false)
  const [error, setError] = useState(false)
  const [dataState, setDataState] = useState<ExampleDataState>("success")
  const rows =
    empty || dataState === "loading"
      ? []
      : workers
          .filter(
            (row) =>
              row.name.toLowerCase().includes(query.toLowerCase()) &&
              (scope !== "available" || !row.disabled),
          )
          .toSorted((a, b) =>
            !sort
              ? 0
              : (sort.direction === "asc" ? 1 : -1) *
                (sort.columnId === "tasks"
                  ? a.tasks - b.tasks
                  : a.name.localeCompare(b.name)),
          )
  const columns: DataTableColumn<Worker>[] = [
    {
      id: "name",
      header: t("site.commonComponents.name"),
      sortable: true,
      primary: true,
      cell: (row) => (
        <span className="flex items-center gap-2">
          <Avatar name={row.name} size={24} />
          {row.name}
        </span>
      ),
    },
    {
      id: "owner",
      header: t("site.commonComponents.owner"),
      cell: (row) => (
        <a href="#worker-summary" className="underline">
          {row.owner}
        </a>
      ),
    },
    {
      id: "workspace",
      header: t("site.commonComponents.workspace"),
      cell: (row) => row.workspace,
    },
    {
      id: "tasks",
      header: t("site.commonComponents.tasks"),
      align: "right",
      sortable: true,
      cell: (row) => row.tasks,
    },
    {
      id: "health",
      header: t("site.commonComponents.health"),
      cell: (row) => (
        <SegmentBar label={`${row.name} health`} value={row.health} />
      ),
    },
    {
      id: "trend",
      header: t("site.commonComponents.trend"),
      cell: (row) => (
        <Sparkline label={`${row.name} trend`} values={row.trend} />
      ),
    },
    {
      id: "rating",
      header: t("site.commonComponents.rating"),
      cell: (row) => (
        <RatingDisplay label={`${row.name} rating`} value={row.rating} />
      ),
    },
    {
      id: "updated",
      header: t("site.commonComponents.updated"),
      cell: (row) => row.updated,
    },
    {
      id: "actions",
      header: t("site.commonComponents.actions"),
      cell: (row) => (
        <Button variant="ghost" onClick={() => setActive(row.id)}>
          {t("site.commonComponents.details")}
        </Button>
      ),
    },
  ]
  return (
    <div data-common-table>
      <FilterToolbar
        label={t("site.commonComponents.toolbar")}
        search={
          <Input
            aria-label={t("site.commonComponents.filter")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-48"
          />
        }
        filters={
          <>
            <DataStateSelect
              value={dataState}
              onChange={(next) => {
                setDataState(next)
                setError(next === "error")
              }}
            />
            <Select
              value={scope}
              onValueChange={setScope}
              items={{
                all: t("site.commonComponents.all"),
                available: t("site.commonComponents.available"),
              }}
            >
              <SelectTrigger aria-label={t("site.commonComponents.scope")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("site.commonComponents.all")}
                </SelectItem>
                <SelectItem value="available">
                  {t("site.commonComponents.available")}
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        summary={t("site.commonComponents.selected", {
          count: selected.length,
        })}
        actions={
          <>
            <Button variant="secondary" onClick={() => setError(true)}>
              {t("site.commonComponents.refreshError")}
            </Button>
            <Button variant="ghost" onClick={() => setEmpty((v) => !v)}>
              {t("site.commonComponents.empty")}
            </Button>
          </>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        caption={t("site.commonComponents.records")}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        selectedIds={selected}
        onSelectionChange={setSelected}
        isRowSelectable={(row) => !row.disabled}
        activeRowId={active}
        onActivateRow={(row) => setActive(row.id)}
        sort={sort}
        onSortChange={setSort}
        stickyHeader
        maxHeight={400}
        data={
          error
            ? {
                state: "error",
                error: {
                  category: "network",
                  message: t("site.commonComponents.readFailure"),
                  reason: t("site.commonComponents.readReason"),
                },
                onRetry: () => {
                  setError(false)
                  setDataState("success")
                },
              }
            : dataState === "success"
              ? undefined
              : { state: dataState }
        }
        footer={<span data-selection-ids>{selected.join(", ")}</span>}
      />
      <p role="status" className="py-3 text-xs" data-active-row>
        {t("site.commonComponents.active", {
          name: active ?? t("site.commonComponents.none"),
        })}
      </p>
      <div id="worker-summary">
        <MetricSummary
          items={[
            {
              id: "workers",
              label: t("site.commonComponents.count"),
              value: rows.length,
            },
            {
              id: "tasks",
              label: t("site.commonComponents.runs"),
              value: rows.reduce((sum, row) => sum + row.tasks, 0),
              unit: t("site.commonComponents.units"),
            },
          ]}
        />
      </div>
    </div>
  )
}
