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
export default function Page(){const [view,setView]=useState(defaultAgentBoardView);const [selected,setSelected]=useState<string|null>(null);return <AgentBoardWorkspace records={[run]} attention={[]} viewState={view} selectedRunId={selected} onViewChange={setView} onOpen={setSelected} connection={{state:"connected",updatedAt:run.updatedAt}} scopeLabel="Independent installed sample" detail={selected?{run,attention:[],artifacts:[],steps:[],events:[],relationships:[]}:null}/>}
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
  console.log(
    "PASS: independent installed Agent workspace, selection, Sheet, List, Insights and missing usage.",
  )
}
