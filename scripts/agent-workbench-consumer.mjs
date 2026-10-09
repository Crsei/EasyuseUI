import { mkdir, writeFile, readFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export const workbenchRegistryItems = [
  "workbench-resource-model",
  "workbench-file-preview",
  "agent-workbench",
  "agent-workbench-model",
  "session-navigator",
  "project-switcher",
  "session-header",
  "agent-conversation",
  "message-content",
  "agent-composer",
  "composer-controls",
  "context-panel",
  "context-picker",
  "workbench-panel-tabs",
  "file-viewer",
  "diff-viewer",
  "change-review-panel",
  "execution-output-panel",
  "preview-panel",
  "task-inbox",
]
export async function createWorkbenchConsumer(fixture) {
  const directory = path.join(fixture, "app/workbench")
  await mkdir(directory, { recursive: true })
  await writeFile(
    path.join(directory, "page.tsx"),
    String.raw`"use client"
import { useState } from "react"
import { AgentWorkbench, AgentComposer, SessionNavigator, ContextPanel, ContextPicker, ChangeReviewPanel, MessageContent, ExecutionOutputPanel, PreviewPanel } from "@/components/blocks/agent-workbench"
import { I18nProvider, useI18n } from "@/lib/i18n-provider"
import { acknowledgeDraft, type SessionSnapshot, type DraftState, type PanelState, type ReviewComment } from "@/lib/agent-workbench-model"
const snapshot:SessionSnapshot={sessionId:"consumer-session",projectId:"consumer-project",activeRunId:"consumer-run",threadId:"consumer-thread",source:"independent consumer fixture",agent:{id:"consumer-agent",name:"Consumer agent"},title:"Installed workbench",revision:1,cursor:1,status:"completed",updatedAt:"2026-10-09T10:00:00Z",environment:{environmentId:"fixture",name:"Consumer fixture",branch:"main",connection:"connected",capabilities:[]},capabilities:{send:true,queue:false,steer:false,interrupt:false},contextSources:[],messages:[{messageId:"consumer-message",turnId:"consumer-turn",sequence:1,revision:1,state:"completed",role:"agent",parts:[{partId:"consumer-part",sequence:1,revision:1,kind:"text",text:"## Installed source\n\nSafe code and HTML text: <script>text</script>"}]}],history:{hasMore:false},tools:[],attention:[],artifacts:[],changes:{repositoryId:"consumer-repo",scope:"consumer",base:"a",head:"b",revision:"r1",files:[{fileId:"consumer-file",path:"src/example.ts",kind:"modified",lines:[{id:"consumer-line",kind:"add",text:"export const installed = true",newLine:1}]}]},plan:[],output:{text:"token=private-value\nPASS local fixture",source:"consumer source",timestamp:"2026-10-09"},dataState:"success"}
const initial:DraftState={draftId:"consumer-draft",version:1,text:"",context:[],modelId:"fixture",permissionId:"ask",environmentId:"fixture",mode:"send"}
function Preview(){const {locale,setLocale}=useI18n();const [draft,setDraft]=useState(initial);const [receipt,setReceipt]=useState<"pending"|"unknown"|"confirmed"|null>(null);const [submitted,setSubmitted]=useState(initial);const [panels,setPanels]=useState<PanelState>({activePanel:"changes",selectedFileId:"consumer-file",sidebarCollapsed:false,inspectorOpen:true,inspectorWidth:320,bottomOpen:false,bottomHeight:240});const [comments,setComments]=useState<ReviewComment[]>([]);const [change,setChange]=useState(snapshot.changes);const [layout,setLayout]=useState<"conversation"|"review">("conversation");const choices=[{id:"fixture",label:"Caller model"}];const composer=<AgentComposer session={snapshot} draft={draft} onChange={setDraft} models={choices} permissions={[{id:"ask",label:"Caller permission"}]} environments={choices} receipts={receipt?[{requestId:"consumer-request",targetId:snapshot.sessionId,action:"send",state:receipt,draftId:submitted.draftId,draftVersion:submitted.version}]:[]} onSubmit={value=>{setSubmitted(value);setReceipt("pending")}} onReconcile={()=>{setReceipt("confirmed");setDraft(current=>acknowledgeDraft(current,{requestId:"consumer-request",targetId:snapshot.sessionId,action:"send",state:"confirmed",draftId:submitted.draftId,draftVersion:submitted.version}))}}/>
return <><div><button onClick={()=>setLocale(locale==="en"?"zh-CN":"en")}>Consumer locale</button><button onClick={()=>setLayout(layout==="conversation"?"review":"conversation")}>Consumer layout</button><button onClick={()=>setReceipt("unknown")}>Consumer lose receipt</button><button onClick={()=>setChange({...change,head:"consumer-next-head"})}>Consumer change head</button></div><div style={{height:700}}><AgentWorkbench session={snapshot} layout={layout} panelState={panels} onPanelStateChange={setPanels} navigation={<SessionNavigator projects={[{projectId:"consumer-project",repositoryId:"consumer-repo",name:"Consumer project"}]} sessions={[snapshot]} projectId="consumer-project" onProjectChange={()=>{}} onSelect={()=>{}} onNew={()=>setDraft({...draft,text:"New consumer task",version:draft.version+1})}/>} composer={composer} workspace={<ChangeReviewPanel changes={change} selectedFileId="consumer-file" onSelectFile={()=>{}} comments={comments} onCommentsChange={setComments} onFeedback={text=>setDraft({...draft,text:draft.text ? draft.text + "\n\n" + text : text,version:draft.version+1})}/>} inspector={<><ContextPicker references={[{id:"consumer-ref",kind:"file",label:"src/example.ts",availability:"available",included:true,removable:true}]} onPick={reference=>setDraft({...draft,context:[reference],version:draft.version+1})}/><ContextPanel references={draft.context} onRemove={()=>setDraft({...draft,context:[],version:draft.version+1})}/></>} bottom={<ExecutionOutputPanel {...snapshot.output}/>}/></div><PreviewPanel><MessageContent content="Caller report preview"/></PreviewPanel><output data-consumer-draft>{draft.text}</output><output data-consumer-receipt>{receipt}</output></>}
export default function Page(){return <I18nProvider><Preview/></I18nProvider>}
`,
  )
  await mkdir(path.join(fixture, "app/workbench-resource"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/workbench-resource/page.tsx"),
    String.raw`"use client"
import { useState } from "react"
import { I18nProvider, useI18n } from "@/lib/i18n-provider"
import { WorkbenchFilePreview, WorkbenchDocumentTabs } from "@/components/blocks/workbench-file-preview"
import { ExecutionSessionList } from "@/components/blocks/agent-workbench/panels"
import { openDocument, closeDocument, type ResourceSnapshot, type WorkbenchDocuments } from "@/lib/workbench-resource-model"
const resource: ResourceSnapshot = { projectId:"p",sessionId:"s",resourceId:"portable-json",revision:"v1",name:"installed.json",path:"fixture/installed.json",mediaType:"application/json",renderer:"json",availability:"available",dataState:"success",text:'{"installed":true,"token":"private-value"}',complete:true,download:()=>new Blob(['{"installed":true,"token":"[REDACTED]"}'],{type:"application/json"}) }
function Preview(){const {locale,setLocale}=useI18n();const [open,setOpen]=useState(false);const [docs,setDocs]=useState<WorkbenchDocuments>({documents:[]});return <><button onClick={()=>setLocale(locale==="en"?"zh-CN":"en")}>Portable locale</button><button onClick={()=>{setDocs(openDocument(docs,resource));setOpen(true)}}>Portable preview</button><WorkbenchFilePreview open={open} onOpenChange={setOpen} resource={resource} onPin={r=>{setDocs(openDocument(docs,r,true));setOpen(false)}}/><WorkbenchDocumentTabs state={docs} onSelect={activeKey=>setDocs({...docs,activeKey})} onClose={key=>setDocs(closeDocument(docs,key))} onPin={r=>setDocs(openDocument(docs,r,true))}/><ExecutionSessionList commands={[{commandId:"cmd",sessionId:"s",runId:"r",command:"installed command",cwd:"fixture",status:"waiting",startedAt:"2026-10-09",outcome:"unknown",connection:"disconnected",output:{text:"token=private-output",source:"fixture",timestamp:"2026-10-09"}}]} onSelect={()=>{}}/></>}
export default function Page(){return <I18nProvider><Preview/></I18nProvider>}`,
  )
}
export async function verifyWorkbenchConsumer(page, origin) {
  await page.goto(origin + "/workbench/")
  await page.getByText("Installed source", { exact: true }).waitFor()
  const input = page.getByRole("textbox", { name: "消息输入", exact: true })
  await input.fill("Submitted consumer text")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await input.fill("New consumer draft")
  await page.getByRole("button", { name: "Consumer lose receipt" }).click()
  assert.equal(
    await page.getByRole("button", { name: "发送", exact: true }).isDisabled(),
    true,
  )
  await page.getByRole("button", { name: "Consumer layout" }).click()
  await page.getByRole("button", { name: "Consumer layout" }).click()
  assert.equal(await input.inputValue(), "New consumer draft")
  await page.getByRole("button", { name: "Consumer locale" }).click()
  assert.equal(
    await page
      .getByRole("textbox", { name: "Message input", exact: true })
      .inputValue(),
    "New consumer draft",
  )
  await page
    .getByRole("button", { name: "Reconcile operation", exact: true })
    .click()
  assert.equal(
    await page
      .getByRole("textbox", { name: "Message input", exact: true })
      .inputValue(),
    "New consumer draft",
  )
  await page.getByRole("button", { name: "Consumer layout" }).click()
  await page
    .getByRole("button", { name: "Add line feedback 1", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: /Review feedback draft/ })
    .fill("Consumer review")
  await page
    .getByRole("button", { name: "Add line feedback", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Consumer change head", exact: true })
    .click()
  assert.equal(
    await page
      .getByRole("button", {
        name: "Add feedback to conversation draft",
        exact: true,
      })
      .isDisabled(),
    true,
  )
  await page
    .getByRole("button", { name: "Add line feedback 1", exact: true })
    .click()
  await page
    .getByRole("button", {
      name: "Revision changed; relocate feedback",
      exact: true,
    })
    .click()
  await page
    .getByRole("button", {
      name: "Add feedback to conversation draft",
      exact: true,
    })
    .click()
  assert.ok(
    (await page.locator("[data-consumer-draft]").textContent()).includes(
      "Consumer review",
    ),
  )
  assert.equal(await page.locator("article script").count(), 0)
  console.log(
    "PASS: independently installed Agent workbench regions, draft version guards, unknown reconciliation, locale/layout retention and revision-bound review feedback",
  )
  await page.goto(origin + "/workbench-resource/")
  await page
    .getByRole("button", { name: "Portable preview", exact: true })
    .click()
  let preview = page.getByRole("dialog")
  assert.ok((await preview.textContent()).includes("[REDACTED]"))
  assert.ok(!(await preview.textContent()).includes("private-value"))
  const downloadWait = page.waitForEvent("download")
  await preview.getByRole("button", { name: "下载源文件", exact: true }).click()
  const download = await downloadWait
  assert.ok(
    (await readFile(await download.path(), "utf8")).includes(
      '"installed":true',
    ),
  )
  await preview.getByRole("button", { name: "固定标签", exact: true }).click()
  assert.equal(
    await page.getByRole("tab", { name: /installed.json @v1/ }).count(),
    1,
  )
  await page
    .getByRole("button", { name: "Portable locale", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Portable preview", exact: true })
    .click()
  preview = page.getByRole("dialog")
  await preview.getByRole("button", { name: "Close", exact: true }).click()
  assert.ok(
    (await page.locator('[data-command-id="cmd"]').textContent()).includes(
      "Outcome unconfirmed",
    ),
  )
  assert.ok(
    !(await page.locator('[data-command-id="cmd"]').textContent()).includes(
      "private-output",
    ),
  )
}
