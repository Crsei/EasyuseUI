"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import { FileText, MoreHorizontal } from "lucide-react"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"

export function ItemDemo() {
  const { t } = useSiteI18n()

  const [selected, setSelected] = useState("spec")
  const [message, setMessage] = useSiteFeedback("")
  return (
    <div className="w-full space-y-2">
      <Item
        title="Component Specification"
        description={t("site.twoLineItem56px")}
        leading={<FileText />}
        selected={selected === "spec"}
        onSelect={() => setSelected("spec")}
        trailing={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("site.inspectSpecificationAction")}
            onClick={() =>
              setMessage(
                siteMessage("site.thisIsAnIndependentTrailingActionItDoesNot"),
              )
            }
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <Item
        title="Design Rules"
        leading={<FileText />}
        selected={selected === "rules"}
        onSelect={() => setSelected("rules")}
      />
      <Item
        title={t("site.staticInformationDoesNotReceiveClicks")}
        density="compact"
      />
      <Item
        title={t("site.notSelectable")}
        onSelect={() => setSelected("disabled")}
        disabled
      />
      <Item
        title={t("site.readingObject")}
        loading
        onSelect={() => setSelected("loading")}
      />
      <Item
        title={t("site.previouslyReadContentPreserved")}
        error={t(
          "site.requestErrorDemoReadInterruptedExistingContentPreservedRetry",
        )}
        onSelect={() => setSelected("error")}
      />
      <p role="status" className="text-xs text-muted-foreground">
        {message || t("site.currentSelectionValue", { value0: selected })}
      </p>
    </div>
  )
}
