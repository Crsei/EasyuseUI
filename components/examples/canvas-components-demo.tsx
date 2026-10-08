"use client"
import { useState } from "react"
import { CanvasFrame } from "@/components/blocks/canvas-frame"
import { CanvasNote } from "@/components/blocks/canvas-note"
import { NodePalette } from "@/components/blocks/node-palette"
import { NodeInspector } from "@/components/blocks/node-inspector"
import { VariablePicker } from "@/components/blocks/variable-picker"
import { useCanvasEditor } from "@/lib/use-canvas-editor"
import { basicCanvasDocument, canvasDefinitions } from "./canvas-fixtures"
export function CanvasFrameDemo() {
  return (
    <CanvasFrame
      frame={{
        id: "demo-frame",
        title: "检索与摘要",
        position: { x: 0, y: 0 },
        width: 320,
        height: 160,
      }}
      selected
    />
  )
}
export function CanvasNoteDemo() {
  return (
    <CanvasNote
      note={{
        id: "demo-note",
        text: "流程说明只帮助理解，不参与执行。",
        position: { x: 0, y: 0 },
      }}
    />
  )
}
export function NodePaletteDemo() {
  const [feedback, setFeedback] = useState("")
  return (
    <div className="max-w-sm">
      <NodePalette
        definitions={canvasDefinitions}
        onAdd={(definition) =>
          setFeedback(`选中 ${definition.label}；实际新增由调用方命令处理。`)
        }
      />
      <p role="status">{feedback}</p>
    </div>
  )
}
export function NodeInspectorDemo() {
  const [initial] = useState(basicCanvasDocument)
  const editor = useCanvasEditor(initial, canvasDefinitions)
  return (
    <div className="max-w-sm">
      <NodeInspector
        {...editor}
        definitions={canvasDefinitions}
        nodeId="agent"
      />
      <p role="status">{editor.feedback}</p>
    </div>
  )
}
export function VariablePickerDemo() {
  const [document] = useState(basicCanvasDocument)
  const [reference, setReference] = useState("")
  return (
    <div className="max-w-sm">
      <VariablePicker
        document={document}
        definitions={canvasDefinitions}
        targetId="agent"
        expectedType="string"
        onInsert={(value) => setReference(JSON.stringify(value))}
      />
      <p role="status" className="break-all">
        {reference}
      </p>
    </div>
  )
}
