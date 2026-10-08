import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export async function createScheduleConsumer(fixture) {
  await mkdir(path.join(fixture, "app/schedule"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/schedule/page.tsx"),
    `"use client"
import {useState} from "react"
import {WorkItemTimeline} from "@/components/blocks/work-item-timeline"
import {WorkItemCalendar} from "@/components/blocks/work-item-calendar"
import {Timeline} from "@/components/blocks/timeline"
import {Calendar} from "@/components/blocks/calendar"
import {I18nProvider} from "@/lib/i18n-provider"
import {normalizeTimeline,normalizeCalendar,calendarViewport,timelineViewport,validateScheduleChange,type ScheduleChangeIntent} from "@/lib/schedule-view-model"
import {scheduleDates} from "@/lib/schedule-date-utils"
import type {WorkItemRecord} from "@/lib/work-items-model"
const catalog={states:[{id:"todo",label:"Todo"}],priorities:[{id:"normal",label:"Normal"}],assignees:[],labels:[]}
const capabilities={canCreate:false,canEditField:()=>true,canMove:()=>false}
export default function ScheduleConsumer(){
 const [item,setItem]=useState<WorkItemRecord>({id:"portable",projectId:"installed",identifier:"S-1",title:"Portable schedule",stateId:"todo",priorityId:"normal",assigneeIds:[],labelIds:[],startDate:"2026-10-05",dueDate:"2026-10-09",revision:1})
 const [calendar,setCalendar]=useState(normalizeCalendar()),[layout,setLayout]=useState("timeline"),timeline=normalizeTimeline()
 const buckets=scheduleDates(calendarViewport(calendar).rangeStart,calendarViewport(calendar).rangeEnd).map(date=>({date,queryKey:"installed",itemIds:date===item.dueDate?[item.id]:[],loadedCount:date===item.dueDate?1:0,totalCount:date===item.dueDate?1:0,dataState:"success" as const}))
 const props={items:[item],groups:[],queryKey:"installed",interaction:{selectedIds:[],activeItemId:null,collapsedGroupIds:[]},getPresentation:()=>({catalog,visibleProperties:[] as const,capabilities}),onScheduleChange:(intent:ScheduleChangeIntent)=>{if(!validateScheduleChange(intent,{item,queryKey:"installed",capabilities}))setItem({...item,...intent.nextDates,revision:item.revision+1})},buckets}
 return <I18nProvider><main><button onClick={()=>setLayout(layout==="timeline"?"calendar":"timeline")}>Switch schedule</button><output>{item.startDate} / {item.dueDate}</output>{layout==="timeline"?<WorkItemTimeline {...props} settings={timeline} today="2026-10-09"/>:<WorkItemCalendar {...props} settings={calendar} onSettingsChange={setCalendar} today="2026-10-09"/>}<section aria-label="Generic scheduling"><Timeline items={[{id:"release",label:"Installed release",startDate:"2026-10-01",dueDate:"2026-10-10"}]} viewport={timelineViewport(timeline)} scale="month" today="2026-10-09" queryKey="generic" renderSidebar={row=><span>{row.label}</span>}/><Calendar value={calendar} onChange={setCalendar} buckets={buckets} queryKey="installed" today="2026-10-09" getItem={id=>id===item.id?{id,label:"Installed note"}:undefined} renderEntry={row=><span>{row.label}</span>}/></section></main></I18nProvider>
}
`,
  )
}
export async function verifyScheduleConsumer(page, origin) {
  await page.goto(`${origin}/schedule/`)
  await page
    .locator('[data-timeline-row="portable"]')
    .getByRole("button", { name: "修改 S-1 的日期", exact: true })
    .click()
  const form = page.locator('[data-schedule-form="portable"]')
  await form.getByLabel("开始日期", { exact: true }).fill("2026-10-06")
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-12")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  assert.equal(
    await page.locator("output").innerText(),
    "2026-10-06 / 2026-10-12",
  )
  await page
    .getByRole("button", { name: "Switch schedule", exact: true })
    .click()
  await page
    .locator("[data-calendar-mode]")
    .first()
    .getByRole("button", { name: "2026-10-12", exact: true })
    .click()
  const entry = page.locator(
    '[data-calendar-agenda] [data-calendar-entry="portable"]',
  )
  await entry
    .getByRole("button", { name: "修改 S-1 的日期", exact: true })
    .click()
  const due = page.locator('[data-schedule-form="portable"]')
  assert.equal(await due.getByLabel("开始日期", { exact: true }).count(), 0)
  await due.getByLabel("截止日期", { exact: true }).fill("2026-10-13")
  await due.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  assert.equal(
    await page.locator("output").innerText(),
    "2026-10-06 / 2026-10-13",
  )
  assert.equal(
    await page
      .getByLabel("Generic scheduling")
      .locator('[data-timeline-row="release"]')
      .count(),
    1,
  )
  console.log(
    "PASS: installed standalone Timeline/Calendar and WorkItem adapters, paired dates and due-only edits",
  )
}
