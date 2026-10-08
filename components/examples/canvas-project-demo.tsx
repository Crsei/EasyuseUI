"use client"
import { useState } from "react"
import { CanvasProjectWorkspace } from "@/components/blocks/canvas-project-workspace"
import {
  advancedCanvasDefinitions,
  nestedCanvasProject,
} from "./canvas-project-fixtures"
export function CanvasProjectDemo({
  layout = "preview",
}: { layout?: "preview" | "fill" } = {}) {
  const [project, setProject] = useState(nestedCanvasProject)
  return (
    <CanvasProjectWorkspace
      layout={layout}
      project={project}
      definitions={advancedCanvasDefinitions}
      onChange={setProject}
    />
  )
}
