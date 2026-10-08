"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import { Inspector } from "@/components/blocks/inspector"
import { Button } from "@/components/ui/button"
import type { DataState } from "@/lib/runtime-status"
export function InspectorDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [selected, setSelected] = useState<string | null>("session-one")
  const [state, setState] = useState<DataState>("success")
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setSelected(
              selected === "session-one" ? "agent-two" : "session-one",
            )
          }
        >
          {t("site.switchObject")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
          {t("site.clearSelection")}
        </Button>
        <label className="sr-only" htmlFor={id}>
          {t("site.objectDataState")}
        </label>
        <select
          id={id}
          value={state}
          onChange={(event) => setState(event.target.value as DataState)}
          className="h-8 max-w-full rounded-md border bg-surface px-2 text-xs"
        >
          {["success", "loading", "partial", "error"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <Inspector
        object={
          selected
            ? {
                id: selected,
                title:
                  selected === "session-one"
                    ? t("site.sessionComponentImplementation")
                    : "Agent / Reviewer",
                kind: selected === "session-one" ? "Session" : "Agent",
                status: selected === "session-one" ? "running" : "idle",
                metadata: [
                  { label: "ID", value: selected, copyValue: selected },
                  { label: t("site.model"), value: "未配置模型" },
                  { label: "Tokens" },
                ],
              }
            : null
        }
        state={state}
        error={{
          category: "permission",
          message: t("site.couldNotReadCompleteDetails"),
          reason: t("site.permissionToViewRelatedLogsIsMissing"),
        }}
        onRetry={() => setState("success")}
      />
    </div>
  )
}
