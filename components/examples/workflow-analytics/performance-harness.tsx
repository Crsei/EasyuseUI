"use client"
import { useState, Profiler, useEffect } from "react"
import { StatisticalChart } from "@/components/blocks/charts/statistical-chart"
import { ChartDrilldownPanel } from "@/components/blocks/charts/chart-drilldown-panel"
import {
  DashboardGrid,
  DashboardWidget,
} from "@/components/blocks/dashboard/dashboard"
import { Button } from "@/components/ui/button"
import { analyticsQueryKey } from "@/lib/analytics-query"
import type { AnalyticsResult, DrilldownSelection } from "@/lib/analytics-model"
import { fixtureQuery } from "./fixtures"
export function AnalyticsPerformanceHarness() {
  const [count, setCount] = useState(100),
    [widgets, setWidgets] = useState(4),
    [version, setVersion] = useState(0),
    [filter, setFilter] = useState(false),
    [selection, setSelection] = useState<DrilldownSelection | null>(null),
    [commits, setCommits] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setCommits(version + 1)),
    )
    return () => cancelAnimationFrame(id)
  }, [version])
  const q = {
      ...fixtureQuery("status-distribution"),
      measureId: "benchmark-score",
      dimension: "index",
    },
    key = analyticsQueryKey(q),
    result = (index: number): AnalyticsResult => ({
      queryKey: key,
      snapshotId: "performance-fixture",
      asOf: q.range.to,
      computedAt: q.range.to,
      unit: "score",
      total: count,
      limitations: [],
      coverage: null,
      completeness: "complete",
      series: [
        {
          id: "s",
          label: "Fixture",
          color: "1",
          points: Array.from(
            { length: Math.ceil(count / widgets) },
            (_, i) => ({
              bucketId: String(index * Math.ceil(count / widgets) + i),
              label: String(i),
              value: filter ? i % 5 : i % 11,
              x: i,
              drilldown: {
                queryKey: key,
                snapshotId: "performance-fixture",
                seriesId: "s",
                bucketId: String(index * Math.ceil(count / widgets) + i),
                targetKind: "workItem",
                predicate: [],
                entityRefs: [
                  {
                    sourceId: "fixture",
                    projectId: "alpha",
                    kind: "workItem",
                    entityId: String(i),
                  },
                ],
                totalCount: 1,
                membership: "snapshot",
              },
            }),
          ),
        },
      ],
    })
  return (
    <main
      data-performance-ready={commits}
      data-points={count}
      data-widgets={widgets}
      style={{ padding: 16 }}
    >
      <p>
        Read-only local benchmark · total points distributed across widgets · no
        service capacity claim
      </p>
      <label>
        Points
        <select
          aria-label="Points"
          value={count}
          onChange={(e) => {
            setCount(Number(e.target.value))
            setVersion((v) => v + 1)
          }}
        >
          {[100, 1000, 10000].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        Widgets
        <select
          aria-label="Widgets"
          value={widgets}
          onChange={(e) => {
            setWidgets(Number(e.target.value))
            setVersion((v) => v + 1)
          }}
        >
          {[4, 8, 12].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <Button
        onClick={() => {
          setFilter((v) => !v)
          setVersion((v) => v + 1)
        }}
      >
        Filter benchmark
      </Button>
      <Profiler
        id="charts"
        onRender={(id, phase, duration) => {
          if (typeof window !== "undefined") {
            const target = window as unknown as {
              analyticsCommits?: { phase: string; duration: number }[]
            }
            ;(target.analyticsCommits ??= []).push({ phase, duration })
          }
        }}
      >
        <DashboardGrid>
          {Array.from({ length: widgets }, (_, i) => (
            <DashboardWidget key={i} id={`bench-${i}`} title={`Fixture ${i}`}>
              <StatisticalChart
                widgetId={`bench-${i}`}
                title={`Fixture ${i}`}
                description="Explicit synthetic point benchmark"
                query={q}
                result={result(i)}
                kind="line"
                xType="number"
                onDrilldown={setSelection}
              />
            </DashboardWidget>
          ))}
        </DashboardGrid>
      </Profiler>
      <ChartDrilldownPanel
        selection={selection}
        onClose={() => setSelection(null)}
        definition="Synthetic exact membership"
        response={
          selection
            ? {
                ...selection,
                records: selection.entityRefs!.map((entityRef) => ({
                  entityRef,
                  title: entityRef.entityId,
                })),
              }
            : undefined
        }
      />
    </main>
  )
}
