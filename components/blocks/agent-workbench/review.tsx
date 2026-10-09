"use client"
import { useId, useState } from "react"
import { Tree } from "@/components/ui/tree"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { useI18n } from "@/lib/i18n-provider"
import type {
  ChangedFile,
  ChangeSet,
  ReviewComment,
} from "@/lib/agent-workbench-model"
import styles from "./workbench.module.css"
import { redactText } from "@/lib/redact"
import type { ResourceSnapshot } from "@/lib/workbench-resource-model"
import { reviewCommentIsCurrent } from "@/lib/agent-workbench-model"
export function FileViewer({
  file,
  resource,
  range,
  revision,
  maximumLines = 1000,
}: {
  file?: ChangedFile
  resource?: Pick<ResourceSnapshot, "path" | "text" | "complete">
  range?: { start: number; end: number }
  revision: string
  maximumLines?: number
}) {
  const { t } = useI18n()
  if (!file && !resource)
    return <p className={styles.section}>{t("workbench.noFile")}</p>
  const path = resource?.path ?? file!.path
  const lines = redactText(
    resource?.text ??
      file!.content ??
      file!.lines
        .filter((l) => l.kind !== "remove")
        .map((l) => l.text)
        .join("\n"),
  ).split("\n")
  const maximum = Math.max(1, Math.min(5000, maximumLines))
  return (
    <section className={styles.section} aria-label={path}>
      <h3 className={styles.heading}>{path}</h3>
      <p className={styles.meta}>
        {t("workbench.revision")}: {revision} · {t("workbench.readOnly")}
      </p>
      {file?.kind === "binary" ? (
        <p>{t("workbench.binary")}</p>
      ) : (
        <pre className={styles.code} tabIndex={0}>
          {lines.slice(0, maximum).map((text, i) => (
            <div
              key={i}
              data-file-line={i + 1}
              data-highlighted={Boolean(
                range && i + 1 >= range.start && i + 1 <= range.end,
              )}
            >
              <span aria-hidden="true">{String(i + 1).padStart(4, " ")} </span>
              {text.slice(0, 8192)}
            </div>
          ))}
        </pre>
      )}
      {(file?.truncated ||
        (resource && !resource.complete) ||
        lines.length > maximum ||
        lines.some((l) => l.length > 8192)) && (
        <p role="status">{t("workbench.truncated")}</p>
      )}
    </section>
  )
}
export function DiffViewer({
  file,
  mode = "unified",
  onComment,
  maximumLines = 1000,
}: {
  file: ChangedFile
  mode?: "unified" | "split"
  onComment?: (lineId: string) => void
  maximumLines?: number
}) {
  const { t } = useI18n()
  const maximum = Math.max(1, Math.min(5000, maximumLines))
  if (file.kind === "binary")
    return <p className={styles.section}>{t("workbench.binary")}</p>
  return (
    <>
      <div
        className={styles.diff}
        data-mode={mode}
        tabIndex={0}
        aria-label={`${t("workbench.changes")} ${file.path}`}
      >
        <table>
          <tbody>
            {file.lines.slice(0, maximum).map((line) => (
              <tr key={line.id} data-kind={line.kind} data-line-id={line.id}>
                <td>
                  {line.oldLine ?? "—"} {line.newLine ?? "—"}
                </td>
                {mode === "split" ? (
                  <>
                    <td>
                      {line.kind !== "add"
                        ? redactText(line.text).slice(0, 8192)
                        : ""}
                    </td>
                    <td data-new>
                      {line.kind !== "remove"
                        ? redactText(line.text).slice(0, 8192)
                        : ""}
                    </td>
                  </>
                ) : (
                  <td>
                    {line.kind === "add"
                      ? "+"
                      : line.kind === "remove"
                        ? "−"
                        : " "}{" "}
                    {redactText(line.text).slice(0, 8192)}
                  </td>
                )}
                <td>
                  {onComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${t("workbench.comment")} ${line.newLine ?? line.oldLine}`}
                      onClick={() => onComment(line.id)}
                    >
                      {t("workbench.comment")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(file.truncated ||
        file.lines.length > maximum ||
        file.lines.some((l) => l.text.length > 8192)) && (
        <p className={styles.status}>{t("workbench.truncated")}</p>
      )}
    </>
  )
}
export type ChangeReviewPanelProps = {
  changes: ChangeSet
  /** Stable review owner, such as session ID; keeps unsubmitted feedback scoped. */
  scopeId?: string
  selectedFileId?: string
  onSelectFile: (id: string) => void
  comments: readonly ReviewComment[]
  onCommentsChange: (comments: ReviewComment[]) => void
  onFeedback?: (text: string) => void
  mode?: "unified" | "split"
  onModeChange?: (mode: "unified" | "split") => void
  fileOnly?: boolean
}
export function ChangeReviewPanel({
  changes,
  scopeId,
  selectedFileId,
  onSelectFile,
  comments,
  onCommentsChange,
  onFeedback,
  mode = "unified",
  onModeChange,
  fileOnly = false,
}: ChangeReviewPanelProps) {
  const { t } = useI18n()
  const id = useId()
  const file =
    changes.files.find((f) => f.fileId === selectedFileId) ?? changes.files[0]
  const draftKey = `${scopeId ?? `${changes.repositoryId}:${changes.scope}`}:${file?.fileId ?? ""}`
  const versionKey = JSON.stringify([
    changes.repositoryId,
    changes.base,
    changes.head,
    changes.revision,
  ])
  const [drafts, setDrafts] = useState<
    Record<string, { lineId?: string; text: string; versionKey: string }>
  >({})
  const editor = drafts[draftKey] ?? { text: "", versionKey }
  const lineId = editor.lineId
  const text = editor.text
  const editorStale = Boolean(lineId && editor.versionKey !== versionKey)
  function setLineId(value: string | undefined) {
    setDrafts((before) => ({
      ...before,
      [draftKey]: {
        ...before[draftKey],
        text: before[draftKey]?.text ?? "",
        lineId: value,
        versionKey,
      },
    }))
  }
  function setText(value: string) {
    setDrafts((before) => ({
      ...before,
      [draftKey]: {
        ...before[draftKey],
        versionKey: before[draftKey]?.versionKey ?? versionKey,
        text: value,
      },
    }))
  }
  const stale = comments.some(
    (comment) => !reviewCommentIsCurrent(changes, comment),
  )
  return (
    <section>
      <header className={styles.section}>
        <h3 className={styles.heading}>{t("workbench.changes")}</h3>
        <p className={styles.meta}>
          {changes.scope} · {changes.base} → {changes.head} · {changes.revision}
        </p>
        {onModeChange && (
          <div className={styles.row}>
            {(["unified", "split"] as const).map((m) => (
              <Button
                key={m}
                size="sm"
                variant="ghost"
                aria-pressed={mode === m}
                onClick={() => onModeChange(m)}
              >
                {t(`workbench.${m}`)}
              </Button>
            ))}
          </div>
        )}
        {changes.partial && <p role="status">{t("workbench.truncated")}</p>}
      </header>
      <DataRegion
        state={
          changes.files.length
            ? changes.partial
              ? "partial"
              : "success"
            : "empty"
        }
        hasContent={changes.files.length > 0}
        emptyTitle={t("workbench.noChanges")}
      >
        <div className={styles.fileLayout}>
          <div className={styles.fileNav}>
            <Tree
              label={t("workbench.files")}
              nodes={changes.files.map((f) => ({
                id: f.fileId,
                label: f.path,
                metadata: f.previousPath
                  ? `${f.previousPath} → ${f.kind}`
                  : f.kind,
              }))}
              selectedId={file?.fileId}
              onSelect={(node) => {
                onSelectFile(node.id)
              }}
            />
          </div>
          <div>
            {file &&
              (fileOnly ? (
                <FileViewer file={file} revision={changes.revision} />
              ) : (
                <DiffViewer
                  file={file}
                  mode={mode}
                  onComment={(lineId) => {
                    setLineId(lineId)
                  }}
                />
              ))}
          </div>
        </div>
      </DataRegion>
      {file && !fileOnly && (
        <div className={styles.section}>
          {lineId && (
            <form
              className={styles.stack}
              onSubmit={(e) => {
                e.preventDefault()
                const line = file.lines.find((l) => l.id === lineId)
                if (!line || !text.trim() || editorStale) return
                onCommentsChange([
                  ...comments,
                  {
                    commentId: `${id}-${comments.length}-${lineId}`,
                    repositoryId: changes.repositoryId,
                    base: changes.base,
                    head: changes.head,
                    fileId: file.fileId,
                    lineId,
                    oldLine: line.oldLine,
                    newLine: line.newLine,
                    revision: changes.revision,
                    text: text.trim(),
                  },
                ])
                setText("")
                setLineId(undefined)
              }}
            >
              <label htmlFor={`${id}-feedback`}>
                {t("workbench.feedback")} · {file.path} : {lineId}
              </label>
              <textarea
                id={`${id}-feedback`}
                autoFocus
                className={styles.feedback}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {editorStale && <p role="alert">{t("workbench.relocate")}</p>}
              <Button
                type="submit"
                size="sm"
                disabled={!text.trim() || editorStale}
              >
                {t("workbench.comment")}
              </Button>
            </form>
          )}
          {comments.map((comment) => (
            <div key={comment.commentId} className={styles.context}>
              <p className={styles.meta}>
                {comment.fileId}:{comment.newLine ?? comment.oldLine} @{" "}
                {comment.revision}
              </p>
              <textarea
                className={styles.feedback}
                aria-label={t("workbench.feedback")}
                value={comment.text}
                onChange={(e) =>
                  onCommentsChange(
                    comments.map((c) =>
                      c.commentId === comment.commentId
                        ? { ...c, text: e.target.value }
                        : c,
                    ),
                  )
                }
              />
              {!reviewCommentIsCurrent(changes, comment) && (
                <p role="alert">
                  {t("workbench.relocate")}{" "}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={
                      !lineId || !file.lines.some((l) => l.id === lineId)
                    }
                    onClick={() => {
                      const line = file.lines.find((l) => l.id === lineId)
                      if (line)
                        onCommentsChange(
                          comments.map((c) =>
                            c.commentId === comment.commentId
                              ? {
                                  ...c,
                                  repositoryId: changes.repositoryId,
                                  base: changes.base,
                                  head: changes.head,
                                  fileId: file.fileId,
                                  lineId: line.id,
                                  oldLine: line.oldLine,
                                  newLine: line.newLine,
                                  revision: changes.revision,
                                }
                              : c,
                          ),
                        )
                    }}
                  >
                    {t("workbench.relocate")}
                  </Button>
                </p>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onCommentsChange(
                    comments.filter((c) => c.commentId !== comment.commentId),
                  )
                }
              >
                {t("workbench.remove")}
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            onClick={() =>
              onFeedback?.(
                comments
                  .map(
                    (c) =>
                      `${c.repositoryId} ${c.base} → ${c.head}\n${changes.files.find((f) => f.fileId === c.fileId)?.path ?? c.fileId}:${c.newLine ?? c.oldLine} @${c.revision}\n${c.text}`,
                  )
                  .join("\n\n"),
              )
            }
            disabled={!onFeedback || !comments.length || stale}
          >
            {t("workbench.sendFeedback")}
          </Button>
        </div>
      )}
    </section>
  )
}
