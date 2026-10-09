import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import assert from "node:assert/strict"

export const completionRegistryItems = [
  "button-group",
  "input-group",
  "toggle",
  "toggle-group",
  "input-otp",
  "separator",
  "collapsible",
  "accordion",
  "tooltip",
  "alert-dialog",
  "hover-card",
  "context-menu",
  "skeleton",
  "spinner",
  "empty",
  "alert",
  "progress",
  "toast",
  "sonner",
  "date-calendar",
  "date-picker",
  "pagination",
  "breadcrumb",
  "menubar",
  "navigation-menu",
  "direction",
  "attachment",
  "marker",
  "questionnaire",
  "bubble",
  "card",
  "aspect-ratio",
  "carousel",
  "chart",
  "form",
  "sidebar",
  "resizable",
  "scroll-area",
  "command",
  "drawer",
]

export async function createCompletionConsumer(fixture) {
  await mkdir(path.join(fixture, "app/completion"), { recursive: true })
  await writeFile(
    path.join(fixture, "app/completion/page.tsx"),
    `"use client"
import {useRef,useState} from "react"
import {I18nProvider,useI18n} from "@/lib/i18n-provider"
import {ThemeBoundary} from "@/components/ui/theme-boundary"
import {Button} from "@/components/ui/button"
import {ButtonGroup} from "@/components/ui/button-group"
import {InputGroup,InputGroupAddon,InputGroupInput,InputGroupTextarea} from "@/components/ui/input-group"
import {Toggle} from "@/components/ui/toggle"
import {ToggleGroup,ToggleGroupItem} from "@/components/ui/toggle-group"
import {InputOTP} from "@/components/ui/input-otp"
import {Separator} from "@/components/ui/separator"
import {Collapsible,CollapsibleTrigger,CollapsibleContent} from "@/components/ui/collapsible"
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from "@/components/ui/accordion"
import {Tooltip,TooltipTrigger,TooltipContent} from "@/components/ui/tooltip"
import {AlertDialog,AlertDialogTrigger,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel} from "@/components/ui/alert-dialog"
import {HoverCard,HoverCardTrigger,HoverCardContent} from "@/components/ui/hover-card"
import {ContextMenu,ContextMenuTrigger,ContextMenuContent,ContextMenuItem} from "@/components/ui/context-menu"
import {Skeleton} from "@/components/ui/skeleton"
import {Spinner} from "@/components/ui/spinner"
import {Empty} from "@/components/ui/empty"
import {Alert,AlertTitle,AlertDescription} from "@/components/ui/alert"
import {Progress,Meter} from "@/components/ui/progress"
import {ToastProvider,useToastManager,Toaster} from "@/components/ui/toast"
import {Toaster as SonnerToaster} from "@/components/ui/sonner"
import {DateCalendar,type DateRange} from "@/components/ui/date-calendar"
import {DatePicker} from "@/components/ui/date-picker"
import {Pagination} from "@/components/ui/pagination"
import {Breadcrumb,BreadcrumbList,BreadcrumbItem,BreadcrumbLink,BreadcrumbPage} from "@/components/ui/breadcrumb"
import {Menubar,MenubarMenu,MenubarTrigger,MenubarContent,MenubarItem} from "@/components/ui/menubar"
import {NavigationMenu,NavigationMenuList,NavigationMenuItem,NavigationMenuTrigger,NavigationMenuContent,NavigationMenuLink,NavigationMenuViewport} from "@/components/ui/navigation-menu"
import {DirectionProvider} from "@/components/ui/direction"
import {Attachment} from "@/components/ui/attachment"
import {Marker,MarkerContent} from "@/components/ui/marker"
import {Questionnaire,type QuestionnaireAnswers} from "@/components/blocks/questionnaire"
import {Bubble,BubbleContent,BubbleAttribution} from "@/components/ui/bubble"
import {Card,CardHeader,CardTitle,CardContent} from "@/components/ui/card"
import {AspectRatio} from "@/components/ui/aspect-ratio"
import {Carousel} from "@/components/ui/carousel"
import {Chart} from "@/components/blocks/chart"
import {Form,FormField} from "@/components/ui/form"
import {Sidebar,SidebarHeader,SidebarTrigger,SidebarContent,SidebarLink} from "@/components/blocks/sidebar"
import {Resizable} from "@/components/ui/resizable"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Command} from "@/components/blocks/command"
import {Drawer,DrawerTrigger,DrawerContent,DrawerHeader,DrawerTitle,DrawerBody,DrawerClose} from "@/components/ui/drawer"
import {Conversation,type ConversationActions} from "@/components/blocks/chat-message"
function Notifications(){const manager=useToastManager();return <><Button onClick={()=>manager.add({id:"caller-receipt",title:"Awaiting confirmation",timeout:0})}>Notify</Button><SonnerToaster/></>}
function Preview(){const {locale,setLocale}=useI18n();const [draft,setDraft]=useState("");const [receipt,setReceipt]=useState("");const [pressed,setPressed]=useState(false);const [values,setValues]=useState<string[]>([]);const [date,setDate]=useState<string|null>(null);const [range,setRange]=useState<DateRange>({from:null,to:null});const [page,setPage]=useState(1);const [answers,setAnswers]=useState<QuestionnaireAnswers>({});const [busy,setBusy]=useState(false);const [query,setQuery]=useState("");const [command,setCommand]=useState("");const [width,setWidth]=useState(180);const [attachment,setAttachment]=useState(true);const [opened,setOpened]=useState(false);const actions=useRef<ConversationActions>(null)
return <ThemeBoundary mode="host" className="grid gap-6 p-4"><h1>Installed completion components</h1><Button onClick={()=>setLocale(locale==="en"?"zh-CN":"en")}>Change locale</Button><output data-locale>{locale}</output>
<Form onSubmit={e=>{e.preventDefault();setReceipt(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))))}}><FormField label="Draft">{props=><InputGroup><InputGroupAddon>@</InputGroupAddon><InputGroupInput {...props} name="draft" value={draft} onChange={e=>setDraft(e.target.value)}/><InputGroupAddon><Button type="submit">Read installed form</Button></InputGroupAddon></InputGroup>}</FormField><label>OTP<InputOTP name="otp" required pattern="[0-9]{6}"/></label><InputGroup><InputGroupTextarea aria-label="Notes" defaultValue="caller-notes"/></InputGroup><output data-form>{receipt}</output></Form>
<ButtonGroup aria-label="Actions"><Button variant="secondary" onClick={()=>setPressed(!pressed)}>Related action</Button><Button disabled>Unavailable action</Button></ButtonGroup><Toggle pressed={pressed} onPressedChange={setPressed}>Standalone toggle</Toggle><ToggleGroup multiple aria-label="Formats" value={values} onValueChange={setValues}><ToggleGroupItem value="bold">Bold</ToggleGroupItem><ToggleGroupItem value="italic">Italic</ToggleGroupItem></ToggleGroup><output data-toggles>{values.join(",")}</output>
<Separator decorative={false}/><Collapsible><CollapsibleTrigger render={<Button/>}>Expand installed details</CollapsibleTrigger><CollapsibleContent>Installed details</CollapsibleContent></Collapsible><Accordion multiple><AccordionItem value="one"><AccordionTrigger>Installed section</AccordionTrigger><AccordionContent>Installed panel</AccordionContent></AccordionItem></Accordion>
<Tooltip><TooltipTrigger render={<Button/>}>Installed tooltip</TooltipTrigger><TooltipContent>Supplemental explanation</TooltipContent></Tooltip><AlertDialog><AlertDialogTrigger render={<Button/>}>Request confirmation</AlertDialogTrigger><AlertDialogContent><AlertDialogTitle>Confirm request</AlertDialogTitle><AlertDialogDescription>Review the caller target</AlertDialogDescription><AlertDialogCancel render={<Button/>}>Cancel confirmation</AlertDialogCancel><Button onClick={()=>setBusy(true)} disabled={busy}>Confirm pending</Button>{busy&&<p role="status">Pending receipt</p>}</AlertDialogContent></AlertDialog>
<HoverCard><HoverCardTrigger href="#installed-preview">Preview link</HoverCardTrigger><HoverCardContent>Supplemental preview</HoverCardContent></HoverCard><p id="installed-preview">Accessible preview content</p><ContextMenu><ContextMenuTrigger tabIndex={0}>Installed context</ContextMenuTrigger><ContextMenuContent><ContextMenuItem onClick={()=>setCommand("context")}>Context action</ContextMenuItem></ContextMenuContent></ContextMenu>
<div aria-busy="true"><Skeleton className="w-40"/></div><Spinner/><Empty title="Installed empty" description="Caller explanation"/><Alert tone="error"><AlertTitle>Caller error</AlertTitle><AlertDescription>Existing content remains</AlertDescription></Alert><Progress label="Known progress" value={42}/><Progress label="Unknown progress" value={null}/><label>Utilization<Meter min={0} max={100} value={64}/></label><ToastProvider><Notifications/></ToastProvider>
<DateCalendar defaultMonth="2026-10" today="2026-10-09" value={date} onValueChange={setDate}/><output data-date>{date}</output><section data-calendar-boundaries><DateCalendar aria-label="Earliest calendar" weekStartsOn={0} defaultMonth="0001-01" today="2026-10-09"/><DateCalendar aria-label="Latest calendar" defaultMonth="9999-12" today="2026-10-09"/></section><DatePicker label="Installed range" mode="range" defaultMonth="2026-10" today="2026-10-09" value={range} onValueChange={setRange}/><output data-range>{JSON.stringify(range)}</output><Pagination aria-label="Installed pages" page={page} hasNext={page<3} onPageChange={setPage}/><output data-page>{page}</output>
<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#installed-preview">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><Menubar aria-label="Installed menubar"><MenubarMenu><MenubarTrigger render={<Button/>}>File</MenubarTrigger><MenubarContent><MenubarItem onClick={()=>setCommand("menu")}>Read item</MenubarItem></MenubarContent></MenubarMenu></Menubar><NavigationMenu><NavigationMenuList><NavigationMenuItem value="section"><NavigationMenuTrigger>Resources</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="#installed-preview">Preview resource</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList><NavigationMenuViewport/></NavigationMenu>
<DirectionProvider direction="rtl"><ToggleGroup aria-label="RTL formats"><ToggleGroupItem value="a">RTL A</ToggleGroupItem><ToggleGroupItem value="b">RTL B</ToggleGroupItem></ToggleGroup></DirectionProvider>
{attachment&&<Attachment name="caller.txt" onOpen={()=>setOpened(true)} onRemove={()=>setAttachment(false)}/>}<Attachment name="unknown.txt" status="unknown" onRemove={()=>{}}/><output data-opened>{String(opened)}</output><Marker variant="separator"><MarkerContent>Caller marker</MarkerContent></Marker><Bubble><BubbleContent>Caller quotation</BubbleContent><BubbleAttribution>Caller source</BubbleAttribution></Bubble>
<Questionnaire questions={[{id:"choice",title:"Choose mode",type:"single",required:true,options:[{value:"manual",label:"Manual"},{value:"auto",label:"Automatic"}]},{id:"notes",title:"Question notes",type:"text"}]} value={answers} onValueChange={setAnswers} onSubmit={()=>setBusy(true)}/><output data-answers>{JSON.stringify(answers)}</output>
<Card><CardHeader><CardTitle>Independent overview</CardTitle></CardHeader><CardContent><AspectRatio ratio={2} className="max-w-xs border">2:1</AspectRatio></CardContent></Card><Carousel label="Installed slides" items={[<p key="a">Slide A</p>,<p key="b">Slide B</p>]}/><Chart label="Installed chart" data={[{id:"a",label:"Negative",value:-8},{id:"b",label:"Missing",value:null},{id:"c",label:"Extreme",value:1e308}]}/>
<div className="flex h-48"><Sidebar label="Installed navigation"><SidebarHeader><SidebarTrigger/></SidebarHeader><SidebarContent><SidebarLink label="Overview" href="#installed-preview" active/></SidebarContent></Sidebar><p>Workspace</p></div><Resizable className="h-48" first={<p>First pane</p>} second={<p>Second pane</p>} value={width} min={120} max={320} onValueChange={setWidth} label="Resize installed panes"/><output data-width>{width}</output><ScrollArea label="Installed scroll" className="h-40">{Array.from({length:40},(_,i)=><p key={i}>Row {i}</p>)}</ScrollArea>
<Command title="Installed commands" query={query} onQueryChange={setQuery} groups={[{id:"actions",label:"Actions",items:[{id:"read",label:"Read command"}].filter(item=>item.label.includes(query))}]} onSelect={item=>setCommand(item.id)}/><output data-command>{command}</output>
<Drawer><DrawerTrigger render={<Button/>}>Installed drawer</DrawerTrigger><DrawerContent swipeToClose><DrawerHeader><DrawerTitle>Drawer details</DrawerTitle></DrawerHeader><DrawerBody>Caller content</DrawerBody><DrawerClose render={<Button/>}>Close installed drawer</DrawerClose></DrawerContent></Drawer>
<Button onClick={()=>actions.current?.scrollToMessage("installed-0",{focus:true})}>Locate first message</Button><Conversation actionsRef={actions} messages={Array.from({length:20},(_,i)=>({id:"installed-"+i,role:"system" as const,content:"Message "+i}))}/>
</ThemeBoundary>}
export default function Page(){return <I18nProvider><Preview/></I18nProvider>}
`,
  )
}

export async function verifyCompletionConsumer(page, origin) {
  await page.goto(origin + "/completion/")
  const earliest = page.locator('[aria-label="Earliest calendar"]')
  assert.equal(await earliest.locator('[data-date="0001-01-01"]').count(), 1)
  assert.equal(
    await earliest.getByRole("button", { name: "上个月" }).isDisabled(),
    true,
  )
  const latest = page.locator('[aria-label="Latest calendar"]')
  assert.equal(await latest.locator('[data-date="9999-12-31"]').count(), 1)
  assert.equal(
    await latest.getByRole("button", { name: "下个月" }).isDisabled(),
    true,
  )
  const draft = page.getByRole("textbox", { name: "Draft", exact: true })
  await draft.fill("Caller 中文")
  await page.getByRole("textbox", { name: "OTP", exact: true }).fill("123456")
  await page.getByRole("button", { name: "Read installed form" }).click()
  assert.deepEqual(
    JSON.parse(await page.locator("[data-form]").textContent()),
    { draft: "Caller 中文", otp: "123456" },
  )
  await page.getByRole("button", { name: "Change locale" }).click()
  assert.equal(await page.locator("[data-locale]").textContent(), "en")
  assert.equal(await draft.inputValue(), "Caller 中文")
  await page.getByRole("button", { name: "Standalone toggle" }).click()
  assert.equal(
    await page
      .getByRole("button", { name: "Standalone toggle" })
      .getAttribute("aria-pressed"),
    "true",
  )
  await page
    .getByRole("group", { name: "Formats", exact: true })
    .getByRole("button", { name: "Bold" })
    .click()
  await page
    .getByRole("group", { name: "Formats", exact: true })
    .getByRole("button", { name: "Italic" })
    .click()
  assert.equal(
    await page.locator("[data-toggles]").textContent(),
    "bold,italic",
  )
  await page.getByRole("button", { name: "Expand installed details" }).click()
  assert.equal(
    await page.getByText("Installed details", { exact: true }).isVisible(),
    true,
  )
  await page.getByRole("button", { name: "Installed section" }).click()
  assert.equal(
    await page.getByText("Installed panel", { exact: true }).isVisible(),
    true,
  )
  await page.getByRole("button", { name: "Installed tooltip" }).hover()
  await page.getByRole("tooltip").waitFor()
  assert.equal(
    await page.getByRole("tooltip").textContent(),
    "Supplemental explanation",
  )
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Request confirmation" }).click()
  await page.getByRole("button", { name: "Confirm pending" }).click()
  assert.equal(await page.getByRole("alertdialog").isVisible(), true)
  assert.equal(
    await page.getByText("Pending receipt", { exact: true }).isVisible(),
    true,
  )
  await page.getByRole("button", { name: "Cancel confirmation" }).click()
  await page.getByRole("button", { name: "Notify", exact: true }).click()
  assert.equal(
    await page.getByText("Awaiting confirmation", { exact: true }).isVisible(),
    true,
  )
  await page.getByRole("button", { name: "Dismiss notification" }).click()
  await page.locator('[data-date="2026-10-19"]').first().click()
  assert.equal(
    await page.locator("output[data-date]").textContent(),
    "2026-10-19",
  )
  await page.getByRole("button", { name: "Installed range" }).click()
  const popup = page.getByRole("dialog")
  await popup.locator('[data-date="2026-10-20"]').click()
  await popup.locator('[data-date="2026-10-22"]').click()
  assert.deepEqual(
    JSON.parse(await page.locator("[data-range]").textContent()),
    { from: "2026-10-20", to: "2026-10-22" },
  )
  await page
    .getByRole("navigation", { name: "Installed pages" })
    .getByRole("button", { name: "Next page" })
    .click()
  assert.equal(await page.locator("[data-page]").textContent(), "2")
  await page.getByRole("button", { name: /caller.txt.*Available/ }).click()
  assert.equal(await page.locator("[data-opened]").textContent(), "true")
  assert.equal(
    await page.getByRole("button", { name: "Remove unknown.txt" }).isDisabled(),
    true,
  )
  await page.getByRole("radio", { name: "Manual", exact: true }).click()
  await page
    .locator("form")
    .filter({ has: page.getByRole("radio", { name: "Manual", exact: true }) })
    .getByRole("button", { name: "Next", exact: true })
    .click()
  await page.getByRole("textbox", { name: "Question notes" }).fill("kept notes")
  assert.deepEqual(
    JSON.parse(await page.locator("[data-answers]").textContent()),
    { choice: "manual", notes: "kept notes" },
  )
  const carousel = page.getByRole("region", { name: "Installed slides" })
  await carousel.getByRole("button", { name: "Next", exact: true }).click()
  assert.equal(
    await page.getByText("Slide B", { exact: true }).isVisible(),
    true,
  )
  assert.equal(
    await page
      .getByRole("table", { name: "Installed chart data table" })
      .getByText("-8", { exact: true })
      .isVisible(),
    true,
  )
  const handle = page.getByRole("separator", { name: "Resize installed panes" })
  await handle.focus()
  await page.keyboard.press("ArrowRight")
  assert.equal(await page.locator("[data-width]").textContent(), "188")
  const command = page.getByRole("region", { name: "Installed commands" })
  const commandInput = command.getByRole("combobox")
  await commandInput.focus()
  await commandInput.press("Enter")
  assert.equal(await page.locator("[data-command]").textContent(), "read")
  await page
    .getByRole("button", { name: "Installed drawer", exact: true })
    .click()
  await page.getByRole("button", { name: "Close installed drawer" }).click()
  await page.getByRole("button", { name: "Locate first message" }).click()
  assert.equal(
    await page
      .locator('[data-follow-tail-id="installed-0"]')
      .evaluate((el) => el === document.activeElement),
    true,
  )
  console.log(
    "PASS: installed 40 completion entries, portable locale and drafts, native forms, overlays, calendar boundaries/ranges, notifications, questionnaire, chart, layout and message navigation",
  )
}
