"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  WorkbenchFilePreview,
  WorkbenchDocumentTabs,
} from "@/components/blocks/workbench-file-preview"
import { ExecutionSessionList } from "@/components/blocks/agent-workbench/panels"
import {
  openDocument,
  closeDocument,
  type ResourceSnapshot,
  type WorkbenchDocuments,
} from "@/lib/workbench-resource-model"
import { useI18n } from "@/lib/i18n-provider"
import { initialWorkbench } from "./fixtures"
import { workbenchResourceFixtures, commandFixtures } from "./resource-fixtures"
const session = initialWorkbench().sessions[1]
const resources = workbenchResourceFixtures(session)
export function ResourcePreviewDemo() {
  const { t } = useI18n()
  const [resource, setResource] = useState<ResourceSnapshot>()
  const [state, setState] = useState<WorkbenchDocuments>({ documents: [] })
  const [commandId, setCommandId] = useState<string>()
  return (
    <div className="space-y-3">
      <p>{t("workbench.readOnly")} · Local fixture</p>
      <div className="flex flex-wrap gap-2">
        {resources.map((r) => (
          <Button
            key={r.resourceId}
            size="sm"
            variant="secondary"
            onClick={() => {
              setResource(r)
              setState(openDocument(state, r))
            }}
          >
            {r.name}
          </Button>
        ))}
      </div>
      <WorkbenchFilePreview
        open={Boolean(resource)}
        resource={resource}
        onOpenChange={(open) => {
          if (!open) setResource(undefined)
        }}
        onPin={(r) => {
          setState(openDocument(state, r, true))
          setResource(undefined)
        }}
      />
      <WorkbenchDocumentTabs
        state={state}
        onSelect={(activeKey) => setState({ ...state, activeKey })}
        onClose={(key) => setState(closeDocument(state, key))}
        onPin={(r) => setState(openDocument(state, r, true))}
      />
      <ExecutionSessionList
        commands={commandFixtures(session)}
        selectedId={commandId}
        onSelect={setCommandId}
      />
    </div>
  )
}
