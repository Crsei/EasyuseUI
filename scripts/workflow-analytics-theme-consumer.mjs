import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

export async function createAnalyticsThemeConsumer(fixture, mode) {
  await mkdir(path.join(fixture, "app/analytics"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/analytics/page.tsx"),
    `"use client"
import {ThemeBoundary} from "@/components/ui/theme-boundary"
import {StatisticalChart} from "@/components/blocks/charts/statistical-chart"
import {analyticsQueryKey} from "@/lib/analytics-query"
import type {AnalyticsQuery,AnalyticsResult} from "@/lib/analytics-model"
const query:AnalyticsQuery={source:"theme",scope:{id:"p",permissionVersion:"v1",projectIds:["p"]},measureId:"status-distribution",measureVersion:1,dimension:"category",timeField:"asOf",range:{from:"2026-10-01T00:00:00Z",to:"2026-10-09T00:00:00Z"},bucket:"day",timeZone:"UTC",filters:[]}
const result:AnalyticsResult={queryKey:analyticsQueryKey(query),snapshotId:"theme",asOf:query.range.to,computedAt:query.range.to,unit:"items",coverage:null,total:2,completeness:"complete",limitations:[],series:[{id:"items",label:"Series",color:"1",points:[{bucketId:"a",label:"Alpha",value:1},{bucketId:"completed",label:"Completed",value:1}]}]}
export default function Page(){return <><div id="host">Host sentinel</div>{(["light","dark"] as const).map(theme=><ThemeBoundary key={theme} id={theme} mode="${mode}" theme={theme}><StatisticalChart widgetId={theme} kind="bar" title="Installed chart" description="Private category and semantic colors" query={query} result={result}/></ThemeBoundary>)}</>}
`,
  )
}

export async function verifyAnalyticsThemeConsumer(page, origin) {
  await page.goto(origin + "/analytics/")
  for (const theme of ["light", "dark"]) {
    const bars = page.locator(`#${theme} .recharts-bar-rectangle path`)
    await bars.first().waitFor()
    assert.equal(await bars.count(), 2)
    for (const [index, token] of [
      "--eu-chart-1",
      "--eu-chart-completed",
    ].entries()) {
      assert.equal(
        await bars.nth(index).evaluate((element, token) => {
          const reference = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
          )
          reference.style.fill = `var(${token})`
          element.parentElement.appendChild(reference)
          const expected = getComputedStyle(reference).fill
          const actual = getComputedStyle(element).fill
          reference.remove()
          return expected !== "rgb(0, 0, 0)" && actual === expected
        }, token),
        true,
        `${theme} chart resolves private token ${token}`,
      )
    }
  }
  console.log(
    "PASS: installed chart category/semantic colors resolve private host/scoped tokens.",
  )
}
