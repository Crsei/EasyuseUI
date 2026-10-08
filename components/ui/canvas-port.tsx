"use client"

import { Handle, Position } from "@xyflow/react"
import type { CanvasPortDefinition } from "@/lib/canvas-model"
import styles from "./canvas-node.module.css"

/** Engine adapter; render inside a React Flow custom node. Keyboard connection uses the workspace form. */
export function CanvasPort({
  port,
  readOnly = false,
  unknownType = false,
}: {
  port: CanvasPortDefinition
  readOnly?: boolean
  unknownType?: boolean
}) {
  return (
    <div className={styles.port} data-direction={port.direction}>
      <Handle
        id={port.id}
        type={port.direction === "input" ? "target" : "source"}
        position={port.direction === "input" ? Position.Left : Position.Right}
        isConnectable={!readOnly}
        aria-label={`${port.label} ${port.direction === "input" ? "输入" : "输出"} ${unknownType ? "类型未定义" : port.type}`}
      />
      <span>{port.label}</span>
      <code>{unknownType ? "类型未定义" : port.type}</code>
    </div>
  )
}
