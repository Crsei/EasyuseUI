import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export const workItemsRegistryItems = [
  "work-items-workspace",
  "work-items-board-base",
]
export async function createWorkItemsConsumer(fixture) {
  await mkdir(path.join(fixture, "app/work-items"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/work-items/page.tsx"),
    `"use client"
import {useState} from "react"
import {WorkItemsWorkspace} from "@/components/blocks/work-items-workspace"
import {I18nProvider} from "@/lib/i18n-provider"
import {defaultWorkItemsView,type WorkItemsViewState,type WorkItemRecord,type MutationState} from "@/lib/work-items-model"
import {groupWorkItems,applyLocalMove} from "@/lib/work-items-view"
const catalog={states:[{id:"inbox",label:"Inbox"},{id:"done",label:"Done"}],priorities:[{id:"normal",label:"Normal"}],assignees:[{id:"one",label:"Alex"},{id:"two",label:"Sam"}],labels:[{id:"a",label:"Design"}]}
const initial:WorkItemRecord[]=[{id:"one",projectId:"installed",identifier:"I-1",title:"Installed work item",stateId:"inbox",priorityId:"normal",assigneeIds:[],labelIds:[],dueDate:null,revision:1}]
export default function InstalledWorkItems(){
const [items,setItems]=useState(initial);const [view,setView]=useState<WorkItemsViewState>(defaultWorkItemsView);const [selected,setSelected]=useState<string[]>([]);const [active,setActive]=useState<string|null>(null);const [mutations,setMutations]=useState<Record<string,MutationState>>({})
const capabilities={canCreate:false,canEditField:()=>true,canMove:()=>true}
return <I18nProvider><main style={{height:"100dvh"}}><WorkItemsWorkspace title="Installed work items" sidebar={<p>Portable consumer</p>} catalog={catalog} items={items} groups={groupWorkItems(items,catalog,view,"installed")} view={view} onViewChange={setView} queryKey="installed" interaction={{selectedIds:selected,activeItemId:active,collapsedGroupIds:[]}} onSelectionChange={setSelected} activeItem={items.find(i=>i.id===active)} onCloseItem={()=>setActive(null)} canMove={item=>!mutations[item.id]||mutations[item.id].status!=="unknown"} onMove={intent=>{setMutations({...mutations,[intent.itemId]:{operationId:"installed",itemId:intent.itemId,baseRevision:1,status:"unknown"}})}} getPresentation={item=>({catalog,visibleProperties:view.visibleProperties,capabilities,mutation:mutations[item.id],onOpen:()=>setActive(item.id),onPatchItem:(row,patch)=>setItems(before=>before.map(i=>i.id===row.id?{...i,...patch,revision:i.revision+1}:i)),onReconcile:()=>{setItems(before=>applyLocalMove(before,{itemId:item.id,sourceGroup:"inbox",targetGroup:"done",operationId:"installed",baseRevision:item.revision,queryKey:"installed"},"state"));setMutations({})}})}/></main></I18nProvider>}
`,
  )
}
export async function verifyWorkItemsConsumer(page, origin) {
  await page.goto(`${origin}/work-items/`)
  await page.locator('[data-work-item="one"]').waitFor()
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await page.getByRole("button", { name: "移动 I-1", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Done", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.locator('[data-mutation="unknown"]').waitFor()
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await page.getByRole("button", { name: "查询结果", exact: true }).click()
  assert.ok(
    (await page.locator('[data-row-id="one"]').innerText()).includes("Done"),
  )
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await page
    .locator('[data-work-item="one"] button')
    .filter({ hasText: "Installed work item" })
    .click()
  const detail = page.locator('[data-detail-item="one"]')
  await detail
    .getByLabel("标题", { exact: true })
    .fill("Installed edited title")
  await detail.getByRole("button", { name: "保存标题", exact: true }).click()
  assert.ok(
    (await page.locator('[data-work-item="one"]').innerText()).includes(
      "Installed edited title",
    ),
  )
  console.log(
    "PASS: installed Work Items list/board/table, unknown outcome survives layout change, reconciliation and detail editing",
  )
}
