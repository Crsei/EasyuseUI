import {
  createFullAnalyticsConsumer,
  verifyFullAnalyticsConsumer,
} from "./workflow-analytics-full-consumer.mjs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export const workflowAnalyticsRegistryItems = [
  "analytics-resource-model",
  "analytics-history-metrics",
  "analytics-builder-model",
  "dashboard-edit-session",
  "analytics-image-export",
  "heatmap",
  "resource-allocation-view",
  "agent-execution-timeline",
  "workflow-history-charts",
  "forecast-chart",
  "agent-operations-dashboard",
  "work-dependency-view",
  "dashboard-layout-editor",
  "analytics-builder",

  "analytics-model",
  "chart-model",
  "chart-frame",
  "chart-data-table",
  "statistical-chart",
  "chart-drilldown-panel",
  "workflow-metric",
  "workflow-charts",
  "risk-evidence-list",
  "work-traceability-view",
  "work-items-view-adapter",
  "dashboard",
  "project-overview-dashboard",
]
export async function createWorkflowAnalyticsConsumer(fixture) {
  await mkdir(path.join(fixture, "app/analytics"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/analytics/page.tsx"),
    `"use client"
import {useState} from "react"
import {StatisticalChart} from "@/components/blocks/charts/statistical-chart"
import {ChartDrilldownPanel} from "@/components/blocks/charts/chart-drilldown-panel"
import {ProjectOverviewDashboard} from "@/components/blocks/dashboard/project-overview-dashboard"
import {I18nProvider} from "@/lib/i18n-provider"
import {analyticsQueryKey} from "@/lib/analytics-query"
import type {AnalyticsQuery,AnalyticsResult,DrilldownSelection} from "@/lib/analytics-model"
const query:AnalyticsQuery={source:"installed",scope:{id:"p",permissionVersion:"v1",projectIds:["p"]},measureId:"status-distribution",measureVersion:1,dimension:"category",timeField:"asOf",range:{from:"2026-10-01T00:00:00Z",to:"2026-10-09T00:00:00Z"},bucket:"day",timeZone:"UTC",filters:[]}
const result:AnalyticsResult={queryKey:analyticsQueryKey(query),snapshotId:"installed-analytics",asOf:query.range.to,computedAt:query.range.to,unit:"items",coverage:null,total:2,completeness:"complete",limitations:[],series:[{id:"items",label:"Installed series",color:"1",points:[{bucketId:"a",label:"Alpha",value:2,x:1,drilldown:{queryKey:analyticsQueryKey(query),snapshotId:"installed-analytics",seriesId:"items",bucketId:"a",predicate:[],targetKind:"workItem",totalCount:2,membership:"snapshot"}},{bucketId:"b",label:"Missing",value:null,x:5}]}]}
export default function Page(){const [selection,setSelection]=useState<DrilldownSelection|null>(null);const [locale,setLocale]=useState<"zh-CN"|"en">("zh-CN");return <I18nProvider locale={locale}><button onClick={()=>setLocale(locale==="en"?"zh-CN":"en")}>Installed locale</button><div style={{maxWidth:900,padding:16}}>{(["bar","line","scatter"] as const).map(kind=><StatisticalChart key={kind} widgetId={kind} kind={kind} xType="number" query={query} result={result} title={kind} description="Independent installed fixture" onDrilldown={setSelection}/>)}<ProjectOverviewDashboard widgets={[]} riskEvidence={[]}/><ChartDrilldownPanel selection={selection} onClose={()=>setSelection(null)} definition="Installed definition" response={selection?{...selection,records:[{entityRef:{kind:"workItem",sourceId:"installed",projectId:"p",entityId:"w1"},title:"Installed source"}]}:undefined}/></div></I18nProvider>}
`,
  )
  await createFullAnalyticsConsumer(fixture)
}
export async function verifyWorkflowAnalyticsConsumer(page, origin) {
  await page.goto(origin + "/analytics/")
  await page.locator(".recharts-bar-rectangle").first().waitFor()
  assert.equal(await page.locator("[data-chart-frame]").count(), 3)
  await page
    .getByRole("button", { name: "数据表", exact: true })
    .first()
    .click()
  await page
    .getByRole("button", { name: "查看来源 Alpha", exact: true })
    .click()
  await page.getByRole("dialog").waitFor()
  assert.match(await page.getByRole("dialog").innerText(), /已加载 1 \/ 2/)
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Installed locale" }).click()
  await page
    .getByRole("button", { name: "Data table", exact: true })
    .first()
    .waitFor()
  assert.equal(
    await page
      .locator(".recharts-scatter-symbol circle[data-chart-point]")
      .count(),
    1,
  )
  await verifyFullAnalyticsConsumer(page, origin)
  console.log(
    "PASS: installed analytics types, Recharts bar/line/scatter, snapshot drilldown and portable locale.",
  )
}
