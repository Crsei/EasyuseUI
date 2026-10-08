"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NodePalette } from "@/components/blocks/node-palette"
import {
  canvasId,
  type CanvasCommand,
  type CanvasDocument,
  type CanvasEdgeRecord,
  type CanvasNodeDefinition,
} from "@/lib/canvas-model"
import { validateCanvasConnection } from "@/lib/canvas-validation"
import styles from "./canvas-controls.module.css"

/** Internal workspace form: keyboard/touch equivalent of connecting and reconnecting handles. */
export function CanvasConnectionForm({
  document,
  definitions,
  edge,
  onCommand,
  readOnly,
}: {
  document: CanvasDocument
  definitions: CanvasNodeDefinition[]
  edge?: CanvasEdgeRecord
  onCommand: (command: CanvasCommand) => void
  readOnly: boolean
}) {
  const choices = (direction: "input" | "output") =>
    document.nodes.flatMap((node) =>
      (definitions.find((item) => item.type === node.type)?.ports ?? [])
        .filter((port) => port.direction === direction)
        .map((port) => ({
          value: `${node.id}:${port.id}`,
          label: `${node.title} / ${port.label} (${port.type})`,
          nodeId: node.id,
          port,
        })),
    )
  const outputs = choices("output"),
    inputs = choices("input")
  const [source, setSource] = useState(
    edge ? `${edge.source}:${edge.sourcePort}` : (outputs[0]?.value ?? ""),
  )
  const [target, setTarget] = useState(
    edge ? `${edge.target}:${edge.targetPort}` : (inputs[0]?.value ?? ""),
  )
  const [error, setError] = useState("")
  const [inserting, setInserting] = useState(false)
  const from = outputs.find((item) => item.value === source),
    to = inputs.find((item) => item.value === target)
  const newEdge =
    from && to
      ? {
          id: edge?.id ?? "pending",
          source: from.nodeId,
          sourcePort: from.port.id,
          target: to.nodeId,
          targetPort: to.port.id,
        }
      : undefined
  const reason = newEdge
    ? validateCanvasConnection(document, definitions, newEdge, edge?.id)
    : "请选择来源和目标端口。"
  return (
    <div className={styles.stack}>
      <label className={styles.field}>
        来源输出端口
        <select
          aria-label="来源输出端口"
          value={source}
          disabled={readOnly}
          onChange={(event) => {
            setSource(event.target.value)
            setError("")
          }}
        >
          <option value="">请选择来源</option>
          {outputs.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        目标输入端口
        <select
          aria-label="目标输入端口"
          value={target}
          disabled={readOnly}
          onChange={(event) => {
            setTarget(event.target.value)
            setError("")
          }}
        >
          <option value="">请选择目标</option>
          {inputs.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {reason && <p className={styles.muted}>{reason}</p>}
      <Button
        disabled={readOnly}
        onClick={() => {
          if (reason || !newEdge) {
            setError(reason ?? "端口无效。")
            return
          }
          onCommand(
            edge
              ? {
                  type: "reconnect",
                  edgeId: edge.id,
                  edge: { ...newEdge, id: edge.id },
                }
              : { type: "connect", edge: { ...newEdge, id: canvasId("edge") } },
          )
        }}
      >
        {edge ? "应用重连" : "建立连接"}
      </Button>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {edge && (
        <>
          <div className={styles.actions}>
            <Button
              variant="outline"
              disabled={readOnly}
              onClick={() =>
                onCommand({
                  type: "delete",
                  selection: { nodeIds: [], edgeIds: [edge.id] },
                })
              }
            >
              断开连线
            </Button>
            <Button
              variant="outline"
              disabled={readOnly}
              onClick={() => setInserting((value) => !value)}
            >
              在连线中插入节点
            </Button>
          </div>
          {inserting && (
            <NodePalette
              definitions={definitions.filter(
                (item) =>
                  item.ports.some((port) => port.direction === "input") &&
                  item.ports.some((port) => port.direction === "output"),
              )}
              readOnly={readOnly}
              onAdd={(definition) => {
                const sourceNode = document.nodes.find(
                    (node) => node.id === edge.source,
                  )!,
                  targetNode = document.nodes.find(
                    (node) => node.id === edge.target,
                  )!
                const output = definitions
                  .find((item) => item.type === sourceNode.type)
                  ?.ports.find((port) => port.id === edge.sourcePort)
                const input = definitions
                  .find((item) => item.type === targetNode.type)
                  ?.ports.find((port) => port.id === edge.targetPort)
                const inputPort = definition.ports.find(
                    (port) =>
                      port.direction === "input" && port.type === output?.type,
                  ),
                  outputPort = definition.ports.find(
                    (port) =>
                      port.direction === "output" && port.type === input?.type,
                  )
                if (!inputPort || !outputPort) {
                  setError("此节点两侧端口不兼容；原连线保留。")
                  return
                }
                onCommand({
                  type: "insert",
                  edgeId: edge.id,
                  inputPort: inputPort.id,
                  outputPort: outputPort.id,
                  node: {
                    id: canvasId("node"),
                    type: definition.type,
                    title: definition.label,
                    position: {
                      x: (sourceNode.position.x + targetNode.position.x) / 2,
                      y:
                        (sourceNode.position.y + targetNode.position.y) / 2 +
                        160,
                    },
                    config: structuredClone(definition.defaults),
                  },
                })
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
