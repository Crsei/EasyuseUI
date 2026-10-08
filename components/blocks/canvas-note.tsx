import type { CanvasNoteRecord } from "@/lib/canvas-model"
import { redactText } from "@/lib/redact"
import styles from "./canvas-annotations.module.css"

/** An annotation, with no discussion thread or execution semantics. */
export function CanvasNote({
  note,
  selected,
}: {
  note: CanvasNoteRecord
  selected?: boolean
}) {
  return (
    <section
      className={styles.note}
      data-selected={selected || undefined}
      data-canvas-note={note.id}
    >
      <strong>流程说明</strong>
      <p>{redactText(note.text)}</p>
    </section>
  )
}
