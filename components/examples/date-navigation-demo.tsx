"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"
import { DateCalendar, type DateRange } from "@/components/ui/date-calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { Pagination } from "@/components/ui/pagination"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { DirectionProvider } from "@/components/ui/direction"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ThemeBoundary } from "@/components/ui/theme-boundary"
import { Button } from "@/components/ui/button"
export function DateCalendarDemo() {
  const { t } = useSiteI18n()
  const [date, setDate] = useState<string | null>("2026-10-09")
  const [range, setRange] = useState<DateRange>({ from: null, to: null })
  return (
    <div className="flex flex-wrap gap-6">
      <div className="grid gap-2">
        <DateCalendar
          aria-label={t("site.completion.single")}
          today="2026-10-09"
          defaultMonth="2026-10"
          value={date}
          onValueChange={setDate}
          isDateDisabled={(key) => key === "2026-10-12"}
        />
        <output data-single-date>{date}</output>
      </div>
      <div className="grid gap-2">
        <DateCalendar
          aria-label={t("site.completion.multiple")}
          mode="range"
          today="2026-10-09"
          defaultMonth="2026-10"
          value={range}
          onValueChange={setRange}
          isDateDisabled={(key) => key === "2026-10-12"}
        />
        <output data-date-range>{JSON.stringify(range)}</output>
      </div>
    </div>
  )
}
export function DatePickerDemo() {
  const { t } = useSiteI18n()
  const [date, setDate] = useState<string | null>(null)
  return (
    <ThemeBoundary>
      <div className="grid justify-items-start gap-3">
        <DatePicker
          label={t("site.completion.title")}
          value={date}
          onValueChange={setDate}
          today="2026-10-09"
          defaultMonth="2026-10"
          min="2026-10-01"
          max="2026-10-31"
        />
        <output>{date}</output>
      </div>
    </ThemeBoundary>
  )
}
export function PaginationDemo() {
  const { t } = useSiteI18n()
  const [page, setPage] = useState(1)
  const [unknown, setUnknown] = useState(1)
  return (
    <div className="grid gap-3">
      <Pagination
        aria-label={t("site.completion.title")}
        page={page}
        pageCount={25}
        onPageChange={setPage}
      />
      <Pagination
        aria-label={t("site.completion.pending")}
        page={unknown}
        hasNext={unknown < 3}
        onPageChange={setUnknown}
      />
      <output>{JSON.stringify({ page, unknown })}</output>
    </div>
  )
}
export function BreadcrumbDemo() {
  const { t } = useSiteI18n()
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs/">
            {t("site.completion.title")}
          </BreadcrumbLink>
          <BreadcrumbSeparator />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{t("site.completion.content")}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
export function MenubarDemo() {
  const { t } = useSiteI18n()
  const [action, setAction] = useState("")
  return (
    <ThemeBoundary>
      <Menubar aria-label={t("site.completion.actions")}>
        <MenubarMenu>
          <MenubarTrigger render={<Button variant="ghost" />}>
            {t("site.completion.title")}
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setAction("read")}>
              {t("site.completion.read")}
            </MenubarItem>
            <MenubarItem disabled>{t("site.completion.disabled")}</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger render={<Button variant="ghost" />}>
            {t("site.completion.actions")}
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setAction("next")}>
              {t("site.completion.next")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <output className="block">{action}</output>
    </ThemeBoundary>
  )
}
export function NavigationMenuDemo() {
  const { t } = useSiteI18n()
  return (
    <ThemeBoundary>
      <NavigationMenu aria-label={t("site.completion.actions")}>
        <NavigationMenuList>
          <NavigationMenuItem value="details">
            <NavigationMenuTrigger>
              {t("site.completion.title")}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/docs/date-calendar/">
                DateCalendar
              </NavigationMenuLink>
              <NavigationMenuLink href="/docs/pagination/">
                Pagination
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs/">
              {t("site.completion.actions")}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </ThemeBoundary>
  )
}
export function DirectionDemo() {
  const { t } = useSiteI18n()
  return (
    <DirectionProvider direction="rtl">
      <ToggleGroup
        aria-label={t("site.completion.single")}
        defaultValue={["bold"]}
      >
        <ToggleGroupItem value="bold">
          {t("site.completion.bold")}
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          {t("site.completion.italic")}
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="mt-2 text-xs">RTL</p>
    </DirectionProvider>
  )
}
