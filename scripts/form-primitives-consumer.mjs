import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

export const formPrimitivesRegistryItems = [
  "textarea",
  "label",
  "native-select",
  "switch",
  "radio-group",
]

export async function createFormPrimitivesConsumer(fixture) {
  await mkdir(path.join(fixture, "app/form-primitives"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/form-primitives/page.tsx"),
    `"use client"
import {useRef,useState} from "react"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {NativeSelect,NativeSelectOption,NativeSelectOptGroup} from "@/components/ui/native-select"
import {Switch} from "@/components/ui/switch"
import {RadioGroup,RadioGroupItem} from "@/components/ui/radio-group"
import {Field} from "@/components/ui/field"
import {ThemeBoundary} from "@/components/ui/theme-boundary"
import {I18nProvider,useI18n} from "@/lib/i18n-provider"
function Preview(){
 const {locale,setLocale}=useI18n();const ref=useRef<HTMLTextAreaElement>(null)
 const [draft,setDraft]=useState("");const [checked,setChecked]=useState(false);const [error,setError]=useState(false);const [receipt,setReceipt]=useState("")
 return <ThemeBoundary mode="host" className="grid gap-3 p-4"><h1>Installed form primitives</h1>
 <button onClick={()=>setLocale(locale === "en" ? "zh-CN" : "en")}>Change locale</button><output data-locale>{locale}</output>
 <form className="grid gap-3" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setReceipt(JSON.stringify({...Object.fromEntries(data),labels:data.getAll("labels")}))}}>
 <Label htmlFor="installed-project">Project</Label><input id="installed-project" name="project" defaultValue="caller-project"/>
 <Field label="Draft" description="Caller text" error={error ? "Review without clearing" : undefined}>{props=><Textarea {...props} ref={ref} name="draft" required value={draft} onChange={e=>setDraft(e.target.value)}/>}</Field>
 <Label htmlFor="installed-scope">Scope</Label><NativeSelect id="installed-scope" name="scope" defaultValue="project"><NativeSelectOptGroup label="Available"><NativeSelectOption value="project">Project label</NativeSelectOption><NativeSelectOption value="workspace">Workspace label</NativeSelectOption><NativeSelectOption disabled value="locked">Locked</NativeSelectOption></NativeSelectOptGroup></NativeSelect>
 <NativeSelect aria-label="Labels" name="labels" multiple size={3} defaultValue={["alpha"]}><NativeSelectOption value="alpha">Alpha</NativeSelectOption><NativeSelectOption value="beta">Beta</NativeSelectOption><NativeSelectOption value="gamma">Gamma</NativeSelectOption></NativeSelect>
 <label><Switch name="notifications" checked={checked} onCheckedChange={setChecked} value="enabled" uncheckedValue="disabled"/>Notifications</label>
 <Switch name="locked" disabled defaultChecked aria-label="Disabled setting"/><Switch name="readonly" readOnly defaultChecked aria-label="Read-only setting"/>
 <RadioGroup name="mode" defaultValue="manual" aria-label="Mode"><label><RadioGroupItem value="manual"/>Manual</label><label><RadioGroupItem value="automatic"/>Automatic</label><label><RadioGroupItem value="locked" disabled/>Locked mode</label></RadioGroup>
 <button type="button" onClick={()=>setError(!error)}>Toggle error</button><button type="button" onClick={()=>ref.current?.focus()}>Focus draft ref</button><button type="submit">Read form</button>
 <output data-form-values>{receipt}</output></form></ThemeBoundary>
}
export default function Page(){return <I18nProvider><Preview/></I18nProvider>}
`,
  )
}

export async function verifyFormPrimitivesConsumer(page, origin) {
  await page.goto(`${origin}/form-primitives/`)
  const draft = page.getByRole("textbox", { name: "Draft", exact: true })
  await draft.fill("Caller 中文\nkept draft")
  await page.getByRole("button", { name: "Toggle error" }).click()
  assert.equal(await draft.getAttribute("aria-invalid"), "true")
  assert.match(await draft.getAttribute("aria-describedby"), /error/)
  await page.getByRole("button", { name: "Focus draft ref" }).click()
  assert.equal(
    await draft.evaluate((element) => element === document.activeElement),
    true,
  )
  await page.getByRole("button", { name: "Change locale" }).click()
  assert.equal(await page.locator("[data-locale]").textContent(), "en")
  assert.equal(await draft.inputValue(), "Caller 中文\nkept draft")
  const scope = page.getByRole("combobox", { name: "Scope", exact: true })
  await scope.selectOption("workspace")
  await page
    .getByRole("listbox", { name: "Labels" })
    .selectOption(["alpha", "beta"])
  const notifications = page.getByRole("switch", {
    name: "Notifications",
    exact: true,
  })
  await notifications.focus()
  await page.keyboard.press("Space")
  assert.equal(await notifications.getAttribute("aria-checked"), "true")
  const readonly = page.getByRole("switch", { name: "Read-only setting" })
  await readonly.focus()
  await page.keyboard.press("Space")
  assert.equal(await readonly.getAttribute("aria-checked"), "true")
  assert.equal(
    await page.getByRole("switch", { name: "Disabled setting" }).isDisabled(),
    true,
  )
  await page.getByRole("radio", { name: "Manual", exact: true }).focus()
  await page.keyboard.press("ArrowDown")
  assert.equal(
    await page
      .getByRole("radio", { name: "Automatic", exact: true })
      .getAttribute("aria-checked"),
    "true",
  )
  await page.getByRole("button", { name: "Read form", exact: true }).click()
  assert.deepEqual(
    JSON.parse(await page.locator("[data-form-values]").textContent()),
    {
      project: "caller-project",
      draft: "Caller 中文\nkept draft",
      scope: "workspace",
      labels: ["alpha", "beta"],
      notifications: "enabled",
      readonly: "on",
      mode: "automatic",
    },
  )
  await page.getByText("Project", { exact: true }).click()
  assert.equal(
    await page
      .getByRole("textbox", { name: "Project", exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  )
  console.log(
    "PASS: installed Textarea/Label/NativeSelect/Switch/RadioGroup, form values, ref, keyboard, readonly/disabled, locale and draft preservation",
  )
}
