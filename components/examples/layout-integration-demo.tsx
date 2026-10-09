"use client"
import { useRef, useState } from "react"
import { Home, Settings } from "lucide-react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarLink,
} from "@/components/blocks/sidebar"
import { Resizable } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command } from "@/components/blocks/command"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import {
  Conversation,
  type ConversationActions,
} from "@/components/blocks/chat-message"
export function FormDemo() {
  const { t } = useSiteI18n()
  const [draft, setDraft] = useState("")
  const [receipt, setReceipt] = useState("")
  return (
    <Form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault()
        setReceipt(String(new FormData(event.currentTarget).get("draft")))
      }}
    >
      <FormField label={t("site.completion.draft")} required>
        {(props) => (
          <Input
            {...props}
            name="draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        )}
      </FormField>
      <Button type="submit">{t("site.completion.read")}</Button>
      <output>{receipt}</output>
    </Form>
  )
}
export function SidebarDemo() {
  const { t } = useSiteI18n()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-64 w-full border">
      <Sidebar
        label={t("site.completion.title")}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarLink
            label={t("site.completion.title")}
            href="#sidebar-example"
            icon={<Home size={16} />}
            active
          />
          <SidebarLink
            label={t("site.completion.actions")}
            href="#sidebar-example"
            icon={<Settings size={16} />}
          />
        </SidebarContent>
        <SidebarFooter>
          <span className={collapsed ? "sr-only" : "text-xs"}>
            workspace-alpha
          </span>
        </SidebarFooter>
      </Sidebar>
      <div id="sidebar-example" className="min-w-0 flex-1 p-3 text-sm">
        {t("site.completion.content")}
      </div>
    </div>
  )
}
export function ResizableDemo() {
  const { t } = useSiteI18n()
  const [value, setValue] = useState(200)
  return (
    <div className="grid w-full gap-2">
      <Resizable
        className="h-48 border"
        label={t("site.completion.title")}
        min={120}
        max={320}
        value={value}
        onValueChange={setValue}
        first={<p className="p-3 text-sm">{t("site.completion.title")}</p>}
        second={<p className="p-3 text-sm">{t("site.completion.content")}</p>}
      />
      <output>{value}</output>
    </div>
  )
}
export function ScrollAreaDemo() {
  const { t } = useSiteI18n()
  return (
    <ScrollArea
      label={t("site.completion.title")}
      className="h-48 w-full border"
    >
      <ol className="min-w-[640px]">
        {Array.from({ length: 40 }, (_, i) => (
          <li key={i} className="border-b px-3 py-2 text-xs">
            {i + 1} · {t("site.completion.content")}
          </li>
        ))}
      </ol>
    </ScrollArea>
  )
}
export function CommandDemo() {
  const { t } = useSiteI18n()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  return (
    <div className="grid w-full max-w-md gap-2">
      <Command
        title={t("site.completion.actions")}
        query={query}
        onQueryChange={setQuery}
        groups={[
          {
            id: "main",
            label: t("site.completion.title"),
            items: [
              { id: "read", label: t("site.completion.read") },
              { id: "next", label: t("site.completion.next") },
              {
                id: "locked",
                label: t("site.completion.disabled"),
                disabled: true,
              },
            ].filter((item) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
            ),
          },
        ]}
        onSelect={(item) => setSelected(item.id)}
      />
      <output>{selected}</output>
    </div>
  )
}
export function DrawerDemo() {
  const { t } = useSiteI18n()
  return (
    <ThemeBoundary>
      <Drawer>
        <DrawerTrigger render={<Button variant="secondary" />}>
          {t("site.completion.open")}
        </DrawerTrigger>
        <DrawerContent swipeToClose>
          <DrawerHeader>
            <DrawerTitle>{t("site.completion.title")}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Input
              aria-label={t("site.completion.draft")}
              defaultValue="caller-draft"
            />
            <p className="mt-3 text-sm">{t("site.completion.hint")}</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="secondary" />}>
              {t("site.completion.cancel")}
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ThemeBoundary>
  )
}
export function ConversationNavigationDemo() {
  const { t } = useSiteI18n()
  const actions = useRef<ConversationActions>(null)
  return (
    <section data-conversation-navigation className="mt-6 grid gap-3">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            actions.current?.scrollToMessage("nav-0", { focus: true })
          }
        >
          {t("site.completion.previous")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => actions.current?.jumpToLatest()}
        >
          {t("site.completion.next")}
        </Button>
      </div>
      <Conversation
        actionsRef={actions}
        messages={Array.from({ length: 24 }, (_, i) => ({
          id: `nav-${i}`,
          role: "system" as const,
          content: `${i + 1} · ${t("site.completion.content")}`,
        }))}
      />
    </section>
  )
}
