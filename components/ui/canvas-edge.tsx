"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react"
import { redactText } from "@/lib/redact"

/** Rendered through WorkflowCanvas's edgeTypes; no execution is inferred from node status. */
export function CanvasEdge(props: EdgeProps) {
  const [path, x, y] = getBezierPath(props)
  const status =
    typeof props.data?.status === "string" ? props.data.status : undefined
  return (
    <>
      <BaseEdge
        id={props.id}
        data-execution-status={status}
        path={path}
        markerEnd={props.markerEnd}
        interactionWidth={24}
        style={{
          stroke: props.selected
            ? "var(--canvas-selection)"
            : status === "failed"
              ? "var(--status-error)"
              : status === "completed"
                ? "var(--status-success)"
                : status === "running"
                  ? "var(--status-info)"
                  : "var(--canvas-edge)",
          strokeWidth: props.selected ? 2 : 1.5,
        }}
      />
      {(props.label || status) && (
        <EdgeLabelRenderer>
          <span
            className="nodrag nopan"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              padding: "4px 8px",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            {redactText(String(props.label ?? ""))}
            {status ? ` · ${redactText(status)}` : ""}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
