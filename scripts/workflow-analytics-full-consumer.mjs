import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export async function createFullAnalyticsConsumer(fixture) {
  await mkdir(path.join(fixture, "app/analytics-full"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/analytics-full/page.tsx"),
    `"use client"
import {useState} from "react"
import {Heatmap} from "@/components/blocks/charts/heatmap"
import {DashboardLayoutEditor} from "@/components/blocks/dashboard/dashboard-layout-editor"
import {DashboardEditSession} from "@/lib/dashboard-edit-session"
import {WorkDependencyView} from "@/components/blocks/analytics/work-dependency-view"
import {AnalyticsBuilder} from "@/components/blocks/analytics/analytics-builder"
import {BurndownChart} from "@/components/blocks/charts/workflow-history-charts"
import {ForecastChart} from "@/components/blocks/charts/forecast-chart"
import {AgentOperationsDashboard} from "@/components/blocks/analytics/agent-operations-dashboard"
import {ResourceAllocationView} from "@/components/blocks/analytics/resource-allocation-view"
import {computeWorkload} from "@/lib/analytics-resource-model"
import {computeHistoricalMetric} from "@/lib/analytics-history-metrics"
import {validateAnalyticsBuilder} from "@/lib/analytics-builder-model"
import {analyticsSvgExport} from "@/lib/analytics-image-export"
const query={source:"installed",scope:{id:"p",permissionVersion:"v1",projectIds:["p"]},measureId:"burndown",measureVersion:1,dimension:"time",timeField:"asOf" as const,range:{from:"2026-10-01T00:00:00Z",to:"2026-10-09T00:00:00Z"},bucket:"day" as const,timeZone:"UTC",filters:[]}
export default function Page(){const [session]=useState(()=>new DashboardEditSession({schemaVersion:1,id:"installed",revision:0,templateId:"copy",globalFilters:[],widgets:[]},{save:async i=>({operationId:i.operationId,outcome:"unknown"}),reconcile:async i=>({operationId:i.operationId,outcome:"confirmed",definition:{...i.definition,revision:1}})},()=>"installed-op"));const cells=computeWorkload([],[{resourceId:"Lin",bucketId:"2026-10-09",available:0,unit:"hours",calendarVersion:"v1"}],"hours");return <main style={{padding:16}}><Heatmap cells={cells}/><DashboardLayoutEditor session={session} templates={[{id:"burndown",label:"Installed widget",create:id=>({id,templateId:"burndown",query,width:6,height:240})}]} createWidgetId={()=>"installed-widget"} renderWidget={w=><BurndownChart query={w.query} result={null} widgetId={w.id}/>}/><ResourceAllocationView cells={cells} selection={null} onSelectionChange={()=>{}}/><WorkDependencyView dependencies={[]}/><AgentOperationsDashboard intervals={[]} range={query.range} runs={[]} observations={[]}/><p>{[typeof ForecastChart,typeof AnalyticsBuilder,typeof computeHistoricalMetric,typeof validateAnalyticsBuilder,typeof analyticsSvgExport].join(" ")}</p></main>}
`,
  )
}
export async function verifyFullAnalyticsConsumer(page, origin) {
  await page.goto(origin + "/analytics-full/")
  await page
    .getByRole("button", { name: "Installed widget", exact: true })
    .click()
  await page.getByRole("button", { name: "保存布局", exact: true }).click()
  assert.match(await page.locator("main").innerText(), /保存结果未知/)
  assert.equal(
    await page
      .getByRole("button", { name: "保存布局", exact: true })
      .isDisabled(),
    true,
  )
  await page.getByRole("button", { name: "核对保存结果", exact: true }).click()
  await page.getByText("已确认保存", { exact: true }).waitFor()
  console.log(
    "PASS: full installed analytics models, heatmap, history chart, retained unknown layout save and reconciliation.",
  )
}
