import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export async function createAgentBoardConsumer(fixture) {
  await mkdir(path.join(fixture, "app/agents"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/agents/page.tsx"),
    `"use client"
import {useState} from "react"
import {AgentBoardWorkspace} from "@/components/blocks/agent-board-workspace"
import {defaultAgentBoardView} from "@/lib/agent-board-model"
import type {AgentRunSnapshot} from "@/lib/agent-board-model"
const run:AgentRunSnapshot={runId:"installed-run",title:"Installed Agent run",agentId:"builder",agentName:"Installed Agent",runtimeStatus:"completed",revision:1,source:"consumer-fixture",completeness:"complete",updatedAt:"2026-10-08T08:00:00Z",review:{state:"unreviewed",acceptance:"pending"}}
export default function Page(){const [view,setView]=useState(defaultAgentBoardView);const [selected,setSelected]=useState<string|null>(null);return <AgentBoardWorkspace records={[run]} attention={[]} viewState={view} selectedRunId={selected} onViewChange={setView} onOpen={setSelected} connection={{state:"connected",updatedAt:run.updatedAt}} dependencies={[{dependencyId:"installed-dependency",revision:1,prerequisiteRunId:"installed-run",dependentRunId:"missing-source",label:"Installed source dependency",state:"unknown"}]} history={[{pointId:"installed-history",revision:1,runId:run.runId,metric:"tokens",value:0,intervalStart:"2026-10-08T07:55:00Z",timestamp:"2026-10-08T08:00:00Z"}]} scopeLabel="Independent installed sample" detail={selected?{run,attention:[],artifacts:[],steps:[],events:[],relationships:[]}:null}/>}
`,
  )
  await mkdir(path.join(fixture, "app/agent-virtual"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/agent-virtual/page.tsx"),
    `"use client"
import {AgentRunVirtualList} from "@/components/blocks/agent-run-virtual-list"
const records=Array.from({length:1000},(_,i)=>({runId:"installed-"+i,title:"Installed source "+i,agentId:"builder",agentName:"Installed Agent",runtimeStatus:"waiting",revision:1,source:"consumer-fixture",completeness:"complete" as const,updatedAt:"2026-10-08T08:00:00Z"}))
export default function Page(){return <AgentRunVirtualList records={records} onOpen={()=>{}}/>}
`,
  )
}
export async function verifyAgentBoardConsumer(page, origin) {
  await page.goto(`${origin}/agents/`)
  await page.locator('[data-run-id="installed-run"] button').click()
  await page.locator('[data-agent-inspector="installed-run"]').waitFor()
  assert.match(
    await page.locator("[data-agent-inspector]").innerText(),
    /未审阅/,
  )
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "列表", exact: true }).click()
  assert.equal(await page.locator('[data-run-id="installed-run"]').count(), 1)
  await page.getByRole("radio", { name: "统计", exact: true }).click()
  assert.match(await page.locator("body").innerText(), /来源未提供用量/)
  await page.getByRole("radio", { name: "依赖关系", exact: true }).click()
  await page.locator(".react-flow").waitFor()
  assert.match(
    await page.locator("[data-agent-dependencies]").innerText(),
    /missing-source/,
  )
  await page.getByRole("radio", { name: "统计", exact: true }).click()
  await page.locator("[data-agent-history] circle").waitFor()
  assert.equal(await page.locator("[data-agent-history] circle").count(), 1)
  await page.goto(`${origin}/agent-virtual/`)
  const viewport = page.getByRole("region", {
    name: "虚拟运行列表",
    exact: true,
  })
  await viewport.waitFor()
  assert.ok((await page.locator("[data-run-id]").count()) < 25)
  await viewport.focus()
  await page.keyboard.press("End")
  await page.locator('[data-run-id="installed-999"] button').waitFor()
  assert.equal(
    await page
      .locator('[data-run-id="installed-999"] button')
      .evaluate((element) => element === document.activeElement),
    true,
  )
  console.log(
    "PASS: independent installed Agent workspace, source dependencies/Canvas, zero history observation and 1000 virtual rows with keyboard navigation.",
  )
}
