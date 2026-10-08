"use client"
import { useSiteI18n } from "@/components/site/site-i18n"
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu"
import { useState } from "react"
import { Button } from "@/components/ui/button"
export function MenuDemo() {
  const { t } = useSiteI18n()
  const [count, setCount] = useState(0)
  return (
    <>
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>
          {t("site.optimization.actions")}
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => setCount((value) => value + 1)}>
            {t("site.optimization.increment")}
          </MenuItem>
          <MenuItem disabled>{t("site.optimization.unavailable")}</MenuItem>
        </MenuContent>
      </Menu>
      <output aria-live="polite">{count}</output>
    </>
  )
}
