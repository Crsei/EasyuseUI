import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"
import { formPrimitivesRegistryItems, createFormPrimitivesConsumer, verifyFormPrimitivesConsumer } from "./form-primitives-consumer.mjs"
export const commonRegistryItems = [
  ...formPrimitivesRegistryItems,
  "checkbox",
  "table",
  "data-table",
  "avatar",
  "segment-bar",
  "sparkline",
  "dropdown-menu",
  "sheet",
  "command-palette",
  "kbd",
  "field",
  "form-section",
  "slider",
  "image-upload",
  "filter-toolbar",
  "metric-summary",
  "rating-display",
]
export async function createCommonConsumer(fixture) {
  await createFormPrimitivesConsumer(fixture)
  await mkdir(path.join(fixture, "app/common"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/common/page.tsx"),
    `"use client"
import {useState} from "react"
import {DataTable} from "@/components/blocks/data-table"
import {WorkspaceShell} from "@/components/blocks/workspace-shell"
import {Avatar} from "@/components/ui/avatar"
import {SegmentBar} from "@/components/ui/segment-bar"
import {Sparkline} from "@/components/ui/sparkline"
import {RatingDisplay} from "@/components/ui/rating-display"
import {MetricSummary} from "@/components/blocks/metric-summary"
import {FilterToolbar} from "@/components/blocks/filter-toolbar"
import {Field} from "@/components/ui/field"
import {FormSection} from "@/components/blocks/form-section"
import {Slider} from "@/components/ui/slider"
import {ImageUpload} from "@/components/blocks/image-upload"
import {CommandPalette} from "@/components/blocks/command-palette"
import {Kbd} from "@/components/ui/kbd"
import {Checkbox} from "@/components/ui/checkbox"
import {Sheet,SheetTrigger,SheetContent,SheetHeader,SheetTitle,SheetBody,SheetFooter,SheetClose} from "@/components/ui/sheet"
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuCheckboxItem,DropdownMenuRadioGroup,DropdownMenuRadioItem} from "@/components/ui/dropdown-menu"
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select"
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle} from "@/components/ui/popover"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {ThemeBoundary} from "@/components/ui/theme-boundary"
export default function CommonPage(){
const [selected,setSelected]=useState<string[]>(["hidden"]);const [active,setActive]=useState<string|null>(null);const [open,setOpen]=useState(false);const [query,setQuery]=useState("");const [command,setCommand]=useState("");const [draft,setDraft]=useState("");const [value,setValue]=useState(2);const [commit,setCommit]=useState(2);const [image,setImage]=useState<File|null>(null);const [checked,setChecked]=useState(false);const [mode,setMode]=useState("one")
const [width,setWidth]=useState(254)
const rows=[{id:"one",name:"Worker one"},{id:"two",name:"Worker two"}]
return <ThemeBoundary mode="host" className="p-4"><h1>Installed common components</h1>
<FilterToolbar label="Installed filters" search={<Input aria-label="Filter" value={draft} onChange={e=>setDraft(e.target.value)}/>} filters={<Select defaultValue="all" items={{all:"All",one:"One"}}><SelectTrigger aria-label="Scope"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="one">One</SelectItem></SelectContent></Select>} summary={selected.length}/>
<DataTable stickyHeader maxHeight={120} rows={rows} caption="Installed workers" columns={[{id:"name",header:"Name",cell:r=><span><Avatar name={r.name} size={24}/>{r.name}</span>},{id:"health",header:"Health",cell:()=> <SegmentBar label="Health" value={70}/>},{id:"trend",header:"Trend",cell:()=> <Sparkline label="Trend" values={[1,null,3]}/>},{id:"rating",header:"Rating",cell:()=> <RatingDisplay label="Rating" value={4.5}/>}]} getRowId={r=>r.id} getRowLabel={r=>r.name} selectedIds={selected} onSelectionChange={setSelected} activeRowId={active} onActivateRow={r=>setActive(r.id)} footer={<output data-selected>{selected.join(",")}</output>}/><output data-active>{active}</output>
<MetricSummary items={[{id:"workers",label:"Workers",value:rows.length}]}/>
<FormSection title="Installed form"><Field label="Draft" description="Keep caller text" required error={draft ? undefined : "Name required"}>{props=><Input {...props} value={draft} onChange={e=>setDraft(e.target.value)}/>}</Field><Slider label="Limit" value={value} onChange={setValue} onCommit={setCommit} min={1} max={10}/><output data-commit>{commit}</output><Checkbox aria-label="Notifications" checked={checked} onCheckedChange={setChecked}/><ImageUpload label="Image" value={image} onValueChange={setImage}/></FormSection>
<Button onClick={()=>setOpen(true)}>Commands <Kbd>Ctrl K</Kbd></Button><output data-command>{command}</output><CommandPalette open={open} onOpenChange={setOpen} title="Commands" query={query} onQueryChange={setQuery} groups={[{id:"main",label:"Navigate",items:[{id:"one",label:"Open worker"}].filter(i=>i.label.toLowerCase().includes(query.toLowerCase()))}]} onSelect={i=>setCommand(i.id)}/>
<Sheet><SheetTrigger render={<Button/>}>Details</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Worker details</SheetTitle></SheetHeader><SheetBody><Input aria-label="Sheet draft" value={draft} onChange={e=>setDraft(e.target.value)}/><Select defaultValue="one" items={{one:"One",two:"Two"}}><SelectTrigger aria-label="Sheet scope"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="one">One</SelectItem><SelectItem value="two">Two</SelectItem></SelectContent></Select><Popover><PopoverTrigger render={<Button/>}>More</PopoverTrigger><PopoverContent><PopoverTitle>Supplement</PopoverTitle></PopoverContent></Popover></SheetBody><SheetFooter><SheetClose render={<Button/>}>Done</SheetClose></SheetFooter></SheetContent></Sheet>
<DropdownMenu><DropdownMenuTrigger render={<Button/>}>Options</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>Notifications</DropdownMenuCheckboxItem><DropdownMenuRadioGroup value={mode} onValueChange={setMode}><DropdownMenuRadioItem value="one">One</DropdownMenuRadioItem><DropdownMenuRadioItem value="two">Two</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
<WorkspaceShell title="Installed shell" sidebar={<p>Navigation</p>} sidebarResizable sidebarWidth={width} onSidebarWidthChange={setWidth} sidebarMinWidth={200} sidebarMaxWidth={400}><p>Main content</p></WorkspaceShell>
</ThemeBoundary>}
`,
  )
}
export async function verifyCommonConsumer(page, origin) {
  await verifyFormPrimitivesConsumer(page, origin)
  await page.goto(`${origin}/common/`)
  await page
    .getByRole("checkbox", { name: "选择 Worker one", exact: true })
    .check()
  assert.equal(
    await page.locator("output[data-selected]").textContent(),
    "hidden,one",
  )
  assert.equal(await page.locator("output[data-active]").textContent(), "")
  await page
    .getByRole("button", { name: "查看 Worker one", exact: true })
    .click()
  assert.equal(await page.locator("output[data-active]").textContent(), "one")
  const container = page
    .getByRole("table", { name: "Installed workers" })
    .locator("..")
  await container.focus()
  await page.keyboard.press("End")
  await page.waitForFunction(() => {
    const table = document.querySelector("table")
    const area = table?.parentElement
    const header = table?.querySelector("thead")
    return (
      area &&
      header &&
      area.scrollTop > 0 &&
      Math.abs(
        header.getBoundingClientRect().top - area.getBoundingClientRect().top,
      ) <= 2
    )
  })
  const geometry = await container.evaluate((area) => ({
    top: area.getBoundingClientRect().top,
    header: area.querySelector("thead").getBoundingClientRect().top,
  }))
  assert.ok(
    Math.abs(geometry.header - geometry.top) <= 2,
    "Installed table header remains sticky during native keyboard scrolling",
  )
  await page.keyboard.press("Home")
  const slider = page.getByRole("slider", { name: "Limit" })
  await slider.focus()
  await page.keyboard.press("End")
  assert.equal(await slider.inputValue(), "10")
  assert.equal(await page.locator("[data-commit]").textContent(), "10")
  await page.getByRole("button", { name: "Commands", exact: false }).click()
  await page.getByRole("combobox", { name: "搜索命令" }).fill("worker")
  await page.keyboard.press("Enter")
  await page.locator('[role="dialog"]').waitFor({ state: "hidden" })
  assert.equal(await page.locator("[data-command]").textContent(), "one")
  await page.getByRole("button", { name: "Details", exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Worker details" })
  await sheet
    .getByRole("textbox", { name: "Sheet draft" })
    .fill("Local draft 中文")
  await sheet.getByRole("combobox", { name: "Sheet scope" }).click()
  await page.getByRole("option", { name: "Two", exact: true }).click()
  await page.keyboard.press("Escape")
  await sheet.waitFor({ state: "hidden" })
  assert.equal(
    await page
      .getByRole("textbox", { name: "Draft", exact: true })
      .inputValue(),
    "Local draft 中文",
  )
  await page.getByRole("button", { name: "Options", exact: true }).click()
  await page.getByRole("menuitemradio", { name: "Two", exact: true }).click()
  assert.equal(
    await page
      .getByRole("menuitemradio", { name: "Two", exact: true })
      .getAttribute("aria-checked"),
    "true",
  )
  await page.keyboard.press("Escape")
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lH8AAAAASUVORK5CYII=",
    "base64",
  )
  await page
    .getByRole("group", { name: "Image", exact: true })
    .locator('input[type="file"]')
    .setInputFiles({
      name: "installed.png",
      mimeType: "image/png",
      buffer: png,
    })
  await page.getByRole("img", { name: "installed.png" }).waitFor()
  const resize = page.getByRole("separator", { name: "调整导航栏宽度" })
  await resize.focus()
  await page.keyboard.press("End")
  assert.equal(await resize.getAttribute("aria-valuenow"), "400")
  await page.keyboard.press("Home")
  assert.equal(await resize.getAttribute("aria-valuenow"), "200")
  await page.screenshot({
    path: path.join(
      process.env.COMMON_CONSUMER_EVIDENCE_DIR || "/tmp",
      "common-installed.png",
    ),
    fullPage: true,
  })
  console.log(
    "PASS: installed common components, hidden row selection, activation, Slider commit, command search, nested Sheet/Select, menu radio and local image preview",
  )
}
