"use client"
import { useRef, useState } from "react"
import { useSiteI18n } from "@/components/site/site-i18n"

import { CommandPalette } from "@/components/blocks/command-palette"
import { Button } from "@/components/ui/button"
import { DataStateSelect, type ExampleDataState } from "./data-state-select"
import { Input } from "@/components/ui/input"
export function CommandPaletteDemo() {
  const { t } = useSiteI18n()
  const scope = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ExampleDataState>("success")
  const [draft, setDraft] = useState("")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  const items = [
    {
      id: "workers",
      label: t("site.commonComponents.openWorkers"),
      shortcut: "G W",
    },
    { id: "activity", label: t("site.commonComponents.openActivity") },
    {
      id: "disabled",
      label: t("site.commonComponents.disabled"),
      disabled: true,
    },
  ]
  return (
    <div ref={scope} className="space-y-3">
      <DataStateSelect value={state} onChange={setState} partial={false} />
      <Input
        aria-label={t("site.commonComponents.draft")}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t("site.commonComponents.openCommands")}
      </Button>
      <p role="status">{selected}</p>
      <CommandPalette
        shortcut={{ key: "k", scope }}
        loading={state === "loading"}
        error={
          state === "error" ? t("site.commonComponents.readFailure") : undefined
        }
        onRetry={() => setState("success")}
        open={open}
        onOpenChange={setOpen}
        title={t("site.commonComponents.commands")}
        description={t("site.commonComponents.description")}
        query={query}
        onQueryChange={setQuery}
        groups={[
          {
            id: "navigate",
            label: t("site.commonComponents.navigate"),
            items: items.filter((item) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
            ),
          },
        ]}
        onSelect={(item) => setSelected(item.label)}
      />
    </div>
  )
}
