"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { metricChange, type Metric } from "@/lib/blog-model"
import { BlogText } from "./blog-text"
export function MetricTable({ metrics }: { metrics: Metric[] }) {
  const { t, number } = useSiteI18n()
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-140 text-left text-sm">
        <caption className="mb-3 text-left text-xs text-muted-foreground">
          {t("site.optimization.measured")} ·{" "}
          {t("site.optimization.notMeasured")}: —
        </caption>
        <thead>
          <tr>
            {["metric", "before", "after", "target", "change"].map((key) => (
              <th key={key} scope="col" className="border-b p-3 font-medium">
                {t(`site.optimization.${key}` as "site.optimization.metric")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => {
            const change = metricChange(metric)
            return (
              <tr key={metric.key}>
                <th scope="row" className="border-b p-3 font-normal">
                  <BlogText value={metric.label} />
                  <small className="mt-1 block text-muted-foreground">
                    {metric.unit} · {metric.statistic} · n={metric.sampleCount}
                  </small>
                </th>
                {[metric.before, metric.after, metric.target].map(
                  (value, i) => (
                    <td key={i} className="border-b p-3 font-mono">
                      {value === null
                        ? "—"
                        : number(value, { maximumFractionDigits: 2 })}
                    </td>
                  ),
                )}
                <td
                  className="border-b p-3"
                  data-change={
                    change === null
                      ? "unknown"
                      : change < 0
                        ? "regressed"
                        : change > 0
                          ? "improved"
                          : "unchanged"
                  }
                >
                  {change === null ? (
                    <span title={t("site.optimization.incompatible")}>—</span>
                  ) : (
                    <span
                      className={change < 0 ? "text-destructive" : undefined}
                    >
                      {t(
                        change < 0
                          ? "site.optimization.regressed"
                          : change > 0
                            ? "site.optimization.improved"
                            : "site.optimization.unchanged",
                      )}{" "}
                      {number(Math.abs(change), { maximumFractionDigits: 1 })}%
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
