"use client"

import { useState, type ComponentProps } from "react"
import { WorkbenchPanelTabs } from "@/components/blocks/agent-workbench/panels"

/** Keep visited panels mounted; unopened panels do not render or load modules. */
export function DeferredWorkbenchPanels(
  props: ComponentProps<typeof WorkbenchPanelTabs>,
) {
  const [visited, setVisited] = useState(() => new Set([props.value]))
  if (!visited.has(props.value)) setVisited(new Set([...visited, props.value]))
  return (
    <WorkbenchPanelTabs
      {...props}
      panels={props.panels.map((panel) => ({
        ...panel,
        render: () =>
          visited.has(panel.id) || panel.id === props.value
            ? panel.render()
            : null,
      }))}
    />
  )
}
