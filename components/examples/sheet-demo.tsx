"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover"
export function SheetDemo() {
  const { t } = useSiteI18n()
  const [draft, setDraft] = useState("Alpha worker")
  return (
    <div className="flex flex-wrap gap-2">
      {(["left", "right", "bottom"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="secondary" />}>
            {t("site.commonComponents.sheet")} · {side}
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>
                {t("site.commonComponents.details")} · {side}
              </SheetTitle>
              <SheetDescription>
                {t("site.commonComponents.description")}
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              <Field label={t("site.commonComponents.draft")}>
                {(props) => (
                  <Input
                    {...props}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                )}
              </Field>
              <div className="my-4">
                <Select
                  defaultValue="alpha"
                  items={{ alpha: "Alpha", beta: "Beta" }}
                >
                  <SelectTrigger
                    aria-label={t("site.commonComponents.workspace")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha">Alpha</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <PopoverTrigger render={<Button variant="ghost" />}>
                  {t("site.commonComponents.details")}
                </PopoverTrigger>
                <PopoverContent className="p-3">
                  <PopoverTitle>
                    {t("site.commonComponents.description")}
                  </PopoverTitle>
                </PopoverContent>
              </Popover>
              <div className="mt-4 space-y-3">
                {Array.from({ length: 40 }, (_, i) => (
                  <p key={i}>Worker metadata {i + 1}</p>
                ))}
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose render={<Button />}>
                {t("site.commonComponents.save")}
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
