"use client"
import { DataTable } from "@/components/blocks/data-table"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-provider"
import { formatChartValue } from "@/lib/chart-format"
import {
  chartData,
  type ChartDatum,
  type ChartSelection,
} from "@/lib/chart-model"
import type { AnalyticsResult } from "@/lib/analytics-model"
export function ChartDataTable({
  result,
  selection,
  onSelect,
}: {
  result: AnalyticsResult
  selection?: ChartSelection
  onSelect?: (datum: ChartDatum) => void
}) {
  const { t, locale } = useI18n()
  return (
    <DataTable
      rows={chartData(result)}
      caption={`${t("analytics.table")} · ${result.snapshotId}`}
      getRowId={(row) => row.key}
      getRowLabel={(row) => `${row.series.label} ${row.point.label}`}
      activeRowId={
        selection
          ? JSON.stringify([selection.seriesId, selection.bucketId])
          : null
      }
      columns={[
        {
          id: "series",
          header: t("analytics.series"),
          cell: (row) => row.series.label,
        },
        {
          id: "bucket",
          header: t("analytics.bucket"),
          cell: (row) => (
            <>
              {row.point.label}
              {row.point.unfinished && ` · ${t("analytics.unfinished")}`}
            </>
          ),
        },
        {
          id: "value",
          header: t("analytics.value"),
          align: "right",
          cell: (row) => formatChartValue(row.point.value, locale, result.unit),
        },
        {
          id: "source",
          header: t("analytics.source"),
          cell: (row) =>
            onSelect && row.point.drilldown ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSelect(row)}
                aria-label={`${t("analytics.open")} ${row.point.label}`}
              >
                {t("analytics.open")}
              </Button>
            ) : (
              t("analytics.noDrilldown")
            ),
        },
      ]}
    />
  )
}
