"use client"
import { useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
export function DropdownMenuDemo() {
  const { t } = useSiteI18n()
  const [show, setShow] = useState(true)
  const [density, setDensity] = useState("compact")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        {t("site.commonComponents.menu")}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={show}
          onCheckedChange={setShow}
          closeOnClick={false}
        >
          {t("site.commonComponents.showTrend")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
          <DropdownMenuRadioItem value="compact">
            {t("site.commonComponents.compact")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">
            {t("site.commonComponents.comfortable")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuItem disabled>
          {t("site.commonComponents.disabled")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
