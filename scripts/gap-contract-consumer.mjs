import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
export const gapRegistryItems = [
  "toolbar",
  "command-toolbar",
  "data-table-controls",
  "data-table-model",
  "resizable",
  "chart",
  "pagination",
  "tooltip",
  "alert-dialog",
]
export async function createGapConsumer(root) {
  await mkdir(path.join(root, "app/contracts"), { recursive: true })
  await writeFile(
    path.join(root, "app/contracts/page.tsx"),
    `"use client"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogBody,DialogFooter} from "@/components/ui/dialog"
import {Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetBody} from "@/components/ui/sheet"
import {CommandToolbar} from "@/components/blocks/command-toolbar"
import {DataTableControls} from "@/components/blocks/data-table-controls"
import {DataTable} from "@/components/blocks/data-table"
import {Chart} from "@/components/blocks/chart"
import {Resizable} from "@/components/ui/resizable"
import {Pagination} from "@/components/ui/pagination"
import {type DataTableColumnConfig,createDataTableQuerySession} from "@/lib/data-table-model"
// Base UI forwards payload identity through its store. Keep caller data stable
// across the Root render function rather than creating a new object per render.
const dialogPayload={title:"Installed typed payload"}
export default function Page(){const [count,setCount]=useState(0),[config,setConfig]=useState<DataTableColumnConfig>({}),[width,setWidth]=useState(160);return <main>
<CommandToolbar label="Installed commands" actions={[{id:"save",label:"Installed save",onInvoke:()=>setCount(n=>n+1)}]}/><output>{count}</output>
<Sheet><SheetTrigger render={<Button/>}>Installed sheet</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Installed outer</SheetTitle></SheetHeader><SheetBody><Dialog><DialogTrigger render={<Button/>}>Installed dialog</DialogTrigger><DialogContent><DialogTitle>Installed inner</DialogTitle><DialogBody><p>{"Long body ".repeat(100)}</p></DialogBody><DialogFooter><Button>Installed submit</Button></DialogFooter></DialogContent></Dialog></SheetBody></SheetContent></Sheet>
<DataTableControls columns={[{id:"name",label:"Name"}]} value={config} onValueChange={setConfig}/><DataTable caption="Installed query" rows={[{id:"one"}]} getRowId={r=>r.id} getRowLabel={r=>r.id} columnConfig={config} activationMode="separate" onActivateRow={()=>{}} columns={[{id:"name",header:"Name",cell:r=><Button>{r.id}</Button>}]}/>
<div style={{width:600,height:200}}><Resizable label="Installed split" value={width} onValueChange={setWidth} min={100} max={400} first={<p>First</p>} second={<p>Second</p>}/></div>
<Pagination page={1} hasNext onPageChange={()=>{}}/><Chart label="Installed chart" data={[{id:"zero",label:"Zero",value:0},{id:"gap",label:"Gap",value:null,missingReason:"gap"}]}/>
<Dialog<{title:string}>>{({payload})=><><DialogTrigger payload={dialogPayload} render={<Button/>}>Installed payload</DialogTrigger><DialogContent><DialogTitle>{payload?.title}</DialogTitle></DialogContent></>}</Dialog>
<Button onClick={()=>{const session=createDataTableQuerySession({errorMessage:"Failed"});session.dispose()}}>Installed query session</Button>
</main>}
`,
  )
}
export async function verifyGapConsumer(page, origin) {
  await page.goto(`${origin}/contracts/`)
  await page
    .getByRole("button", { name: "Installed save", exact: true })
    .click()
  assert.equal(await page.locator("output").textContent(), "1")
  const handle = page.getByRole("separator", { name: "Installed split" })
  await handle.focus()
  await page.keyboard.press("End")
  assert.equal(await handle.getAttribute("aria-valuenow"), "400")
  assert.equal(await page.locator("button button").count(), 0)
  await page.setViewportSize({ width: 390, height: 320 })
  await page
    .getByRole("button", { name: "Installed sheet", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Installed dialog", exact: true })
    .click()
  const dialog = page.getByRole("dialog", { name: "Installed inner" }),
    submit = dialog.getByRole("button", { name: "Installed submit" })
  await submit.waitFor()
  assert.ok(
    await submit.evaluate((el) => {
      const b = el.getBoundingClientRect()
      return (
        b.top >= 0 &&
        b.bottom <= innerHeight &&
        el.contains(
          document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
        )
      )
    }),
  )
  await page.keyboard.press("Escape")
  await page.getByRole("dialog", { name: "Installed outer" }).waitFor()
  await page.keyboard.press("Escape")
  assert.ok(
    await page
      .getByRole("table")
      .filter({ hasText: "Zero" })
      .textContent()
      .then((text) => text.includes("0")),
  )
  await page
    .getByRole("button", { name: "Installed payload", exact: true })
    .click()
  await page.getByRole("dialog", { name: "Installed typed payload" }).waitFor()
  await page.keyboard.press("Escape")
  await page.setViewportSize({ width: 1440, height: 1000 })
  console.log(
    "PASS: installed contract layers, short dialog, command toolbar, split keyboard, table cell and chart alternative",
  )
}
