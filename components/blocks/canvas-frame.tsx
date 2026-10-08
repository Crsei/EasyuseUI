import type { CanvasFrameRecord } from "@/lib/canvas-model"
import { redactText } from "@/lib/redact"
import styles from "./canvas-annotations.module.css"

/** Visual grouping only. Coordinates and member movement belong to canvas commands. */
export function CanvasFrame({
  frame,
  selected,
  collapsed,
}: {
  frame: CanvasFrameRecord
  selected?: boolean
  collapsed?: boolean
}) {
  return (
    <section
      className={styles.frame}
      data-selected={selected || undefined}
      data-canvas-frame={frame.id}
      style={{ width: frame.width, height: collapsed ? 64 : frame.height }}
    >
      <strong>{redactText(frame.title)}</strong>
      <small>{collapsed ? "已折叠 · 节点和连线保留" : "视觉分组"}</small>
    </section>
  )
}
