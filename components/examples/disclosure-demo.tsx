"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ThemeBoundary } from "@/components/ui/theme-boundary"

export function SeparatorDemo() {
  const { t } = useSiteI18n()
  return (
    <div className="grid w-full gap-3">
      <p>{t("site.completion.title")}</p>
      <Separator decorative={false} />
      <p>{t("site.completion.content")}</p>
    </div>
  )
}
export function CollapsibleDemo() {
  const { t } = useSiteI18n()
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger render={<Button variant="secondary" />}>
        {t("site.completion.show")}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="py-3">{t("site.completion.content")}</p>
      </CollapsibleContent>
    </Collapsible>
  )
}
export function AccordionDemo() {
  const { t } = useSiteI18n()
  return (
    <Accordion className="w-full max-w-md" multiple defaultValue={["one"]}>
      <AccordionItem value="one">
        <AccordionTrigger>{t("site.completion.title")}</AccordionTrigger>
        <AccordionContent>{t("site.completion.content")}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>{t("site.completion.actions")}</AccordionTrigger>
        <AccordionContent>{t("site.completion.hint")}</AccordionContent>
      </AccordionItem>
      <AccordionItem value="locked" disabled>
        <AccordionTrigger>{t("site.completion.disabled")}</AccordionTrigger>
        <AccordionContent>locked</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
export function TooltipDemo() {
  const { t } = useSiteI18n()
  return (
    <ThemeBoundary>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>
          {t("site.completion.title")}
        </TooltipTrigger>
        <TooltipContent>{t("site.completion.content")}</TooltipContent>
      </Tooltip>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("site.completion.content")}
      </p>
    </ThemeBoundary>
  )
}
export function AlertDialogDemo() {
  const { t } = useSiteI18n()
  const [requested, setRequested] = useState(false)
  return (
    <ThemeBoundary>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="secondary" />}>
          {t("site.completion.open")}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-medium">
            {t("site.completion.confirm")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("site.completion.warning")}
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel render={<Button variant="secondary" />}>
              {t("site.completion.cancel")}
            </AlertDialogCancel>
            <Button disabled={requested} onClick={() => setRequested(true)}>
              {t("site.completion.confirm")}
            </Button>
          </div>
          {requested && <p role="status">{t("site.completion.pending")}</p>}
        </AlertDialogContent>
      </AlertDialog>
    </ThemeBoundary>
  )
}
export function HoverCardDemo() {
  const { t } = useSiteI18n()
  return (
    <ThemeBoundary>
      <HoverCard>
        <HoverCardTrigger
          href="#hover-card-details"
          className="rounded-control text-primary underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("site.completion.title")}
        </HoverCardTrigger>
        <HoverCardContent>{t("site.completion.content")}</HoverCardContent>
      </HoverCard>
      <p id="hover-card-details" className="mt-3 text-sm">
        {t("site.completion.content")}
      </p>
    </ThemeBoundary>
  )
}
export function ContextMenuDemo() {
  const { t } = useSiteI18n()
  const [action, setAction] = useState("")
  const items = (
    <>
      <ContextMenuItem onClick={() => setAction("read")}>
        {t("site.completion.read")}
      </ContextMenuItem>
      <ContextMenuItem disabled>
        {t("site.completion.disabled")}
      </ContextMenuItem>
    </>
  )
  return (
    <ThemeBoundary>
      <div className="grid gap-3">
        <ContextMenu>
          <ContextMenuTrigger
            tabIndex={0}
            className="rounded-control border p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("site.completion.title")}
          </ContextMenuTrigger>
          <ContextMenuContent>{items}</ContextMenuContent>
        </ContextMenu>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" />}>
            {t("site.completion.actions")}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAction("read")}>
              {t("site.completion.read")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              {t("site.completion.disabled")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <output>{action}</output>
      </div>
    </ThemeBoundary>
  )
}
