"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import { DataRegion } from "@/components/ui/data-region"
import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import type { DataState } from "@/lib/runtime-status"
export function DataRegionDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [state, setState] = useState<DataState>("success")
  return (
    <div className="space-y-4">
      <label htmlFor={id} className="text-xs">
        {t("site.dataState")}{" "}
      </label>
      <select
        id={id}
        value={state}
        onChange={(event) => setState(event.target.value as DataState)}
        className="h-8 max-w-full rounded-md border bg-surface px-2 text-xs"
      >
        {["loading", "empty", "partial", "error", "success"].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <DataRegion
        state={state}
        hasContent={state === "error"}
        error={{
          category: "network",
          message: t("site.refreshFailed"),
          reason: t("site.demoConnectionUnavailable"),
        }}
        updatedAt="16:42:08"
        onRetry={() => setState("success")}
        onLoadMore={() => setState("success")}
        emptyDescription={t("site.noSessionsCreatedYetRestoreLocalDemoDataTo")}
        emptyAction={
          <Button onClick={() => setState("success")}>
            {t("site.restoreData")}
          </Button>
        }
      >
        <Item
          title={t("site.previouslyLoadedSession")}
          description={t("site.stillVisibleAfterRefreshFailureLocalDemo")}
        />
      </DataRegion>
    </div>
  )
}
