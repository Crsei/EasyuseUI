"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tree, type TreeNode } from "@/components/ui/tree"
import { upstreamCanvasNodes } from "@/lib/canvas-validation"
import type {
  CanvasDocument,
  CanvasNodeDefinition,
  CanvasPortType,
  CanvasVariable,
} from "@/lib/canvas-model"
import styles from "./canvas-controls.module.css"

export type VariablePickerProps = {
  document: CanvasDocument
  definitions: CanvasNodeDefinition[]
  targetId: string
  expectedType?: CanvasPortType
  onInsert: (reference: CanvasVariable) => void
  readOnly?: boolean
}
export function VariablePicker({
  document,
  definitions,
  targetId,
  expectedType,
  onInsert,
  readOnly,
}: VariablePickerProps) {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>()
  const [path, setPath] = useState("")
  const refs = new Map<string, CanvasVariable>()
  const upstream = upstreamCanvasNodes(document, targetId)
  const nodes: TreeNode[] = document.nodes
    .filter((node) => upstream.has(node.id))
    .flatMap((node) => {
      const ports =
        definitions
          .find((item) => item.type === node.type)
          ?.ports.filter(
            (port) =>
              port.direction === "output" &&
              (!expectedType || port.type === expectedType) &&
              `${node.title} ${port.label} ${port.type}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
          ) ?? []
      if (!ports.length) return []
      return [
        {
          id: `node:${node.id}`,
          label: node.title,
          children: ports.map((port) => {
            const id = `port:${node.id}:${port.id}`
            refs.set(id, {
              nodeId: node.id,
              portId: port.id,
              type: port.type,
              path: [],
            })
            return { id, label: port.label, metadata: port.type }
          }),
        },
      ]
    })
  const selected = selectedId ? refs.get(selectedId) : undefined
  return (
    <div className={styles.stack}>
      <Input
        aria-label="搜索上游变量"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索来源、端口或类型"
      />
      {nodes.length ? (
        <Tree
          key={query}
          nodes={nodes}
          label="可达上游变量"
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          defaultExpandedIds={nodes.map((node) => node.id)}
        />
      ) : (
        <p className={styles.muted}>没有兼容的上游输出。请先连接来源节点。</p>
      )}
      {selected && (
        <>
          <p className={styles.muted}>
            来源：
            {document.nodes.find((node) => node.id === selected.nodeId)?.title}{" "}
            / {selected.portId} · {selected.type}
            <br />
            <code>{selected.nodeId}</code>
          </p>
          {["object", "array"].includes(selected.type) && (
            <label className={styles.field}>
              字段路径（以点分隔，可留空）
              <Input
                value={path}
                onChange={(event) => setPath(event.target.value)}
              />
            </label>
          )}
        </>
      )}
      <Button
        disabled={readOnly || !selected}
        onClick={() => {
          if (selected && !readOnly)
            onInsert({
              ...selected,
              path: ["object", "array"].includes(selected.type)
                ? path.split(".").filter(Boolean)
                : [],
            })
        }}
      >
        插入变量引用
      </Button>
    </div>
  )
}
