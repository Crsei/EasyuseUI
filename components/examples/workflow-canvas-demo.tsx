"use client"
import { uiMessage } from "@/lib/i18n-core"

import { useState } from "react"
import { WorkflowCanvas } from "@/components/blocks/workflow-canvas"
import {
  emptyCanvasSelection,
  type CanvasDocument,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"

export const foundationDefinitions: CanvasNodeDefinition[] = [
  {
    type: "input",
    label: "Input",
    category: "输入输出",
    categoryI18n: uiMessage("canvasMetadata.inputsAndOutputs"),
    defaults: {},
    ports: [
      {
        id: "text",
        label: "文本",
        labelI18n: uiMessage("canvasMetadata.text"),
        direction: "output",
        type: "string",
      },
    ],
  },
  {
    type: "output",
    label: "Output",
    category: "输入输出",
    categoryI18n: uiMessage("canvasMetadata.inputsAndOutputs"),
    defaults: {},
    ports: [
      {
        id: "text",
        label: "文本",
        labelI18n: uiMessage("canvasMetadata.text"),
        direction: "input",
        type: "string",
        maxConnections: 1,
      },
    ],
  },
]
export const foundationDocument: CanvasDocument = {
  schemaVersion: 1,
  id: "foundation",
  revision: 0,
  frames: [],
  notes: [],
  nodes: [
    {
      id: "input",
      type: "input",
      title: "用户输入",
      position: { x: 0, y: 80 },
      config: {},
    },
    {
      id: "output",
      type: "output",
      title: "结果输出",
      position: { x: 360, y: 80 },
      config: {},
    },
  ],
  edges: [
    {
      id: "input-output",
      source: "input",
      sourcePort: "text",
      target: "output",
      targetPort: "text",
      label: "string",
    },
  ],
}
export function WorkflowCanvasDemo() {
  const [selection, setSelection] = useState(emptyCanvasSelection)
  return (
    <div style={{ height: 400 }}>
      <WorkflowCanvas
        document={foundationDocument}
        definitions={foundationDefinitions}
        selection={selection}
        onSelectionChange={setSelection}
      />
    </div>
  )
}
