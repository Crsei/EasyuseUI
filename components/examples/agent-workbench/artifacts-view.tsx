"use client"
import type { Dispatch, SetStateAction } from "react"
import { ArtifactList } from "@/components/blocks/artifact-list"
import { PreviewPanel } from "@/components/blocks/agent-workbench/panels"
import { WorkbenchResourceContent } from "@/components/blocks/workbench-file-preview"
import type { ResourceSnapshot } from "@/lib/workbench-resource-model"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { useI18n } from "@/lib/i18n-provider"
import { useWorkbenchExample } from "./provider"
import { exampleMessages } from "./messages"
import type { WorkbenchViewProps } from "./view-props"
import styles from "./demo.module.css"

export function ArtifactsView({
  session,
  draft,
  setDraft,
  query,
  navigate,
  projectId,
  level,
  selectedArtifacts,
  setSelectedArtifacts,
  openSession,
  locateMessage,
  resources,
  onOpenResource,
}: WorkbenchViewProps & {
  resources: readonly ResourceSnapshot[]
  onOpenResource: (resource: ResourceSnapshot) => void
  projectId: string
  level: "overview" | "regions" | "layouts" | "app"
  selectedArtifacts: Record<string, string>
  setSelectedArtifacts: Dispatch<SetStateAction<Record<string, string>>>
  openSession: (id: string, page?: string) => void
  locateMessage: (sessionId: string, messageId: string) => void
}) {
  const { locale, t } = useI18n()
  const x = exampleMessages[locale]
  const { state } = useWorkbenchExample()

  if (level === "app" && session.projectId !== projectId) {
    const owned = state.sessions.filter((s) => s.projectId === projectId)
    return (
      <section className={styles.section} data-workbench-view="artifacts">
        <h1 className={styles.title}>{x.artifacts}</h1>
        <p>{owned.length ? x.chooseProjectSession : x.noTasks}</p>
        {owned.map((s) => (
          <Item
            key={s.sessionId}
            title={s.title}
            description={s.artifacts.map((a) => a.name).join(", ") || "—"}
            onSelect={() => openSession(s.sessionId, "artifacts")}
          />
        ))}
      </section>
    )
  }
  const records = query.scenario === "empty" ? [] : session.artifacts
  const selected =
    records.find(
      (a) => a.artifactId === selectedArtifacts[session.sessionId],
    ) ?? records[0]
  const resource = resources.find((r) => r.resourceId === selected?.artifactId)
  const body =
    selected?.availability === "available" ? resource?.text : undefined
  const source = session.messages.find((m) =>
    m.parts.some(
      (part) =>
        part.kind === "artifact" && part.referenceId === selected?.artifactId,
    ),
  )
  return (
    <div className={styles.section} data-workbench-view="artifacts">
      {records.length > 1 && (
        <label className={styles.label}>
          {x.artifactSelection}
          <select
            value={selected?.artifactId ?? ""}
            onChange={(e) =>
              setSelectedArtifacts((before) => ({
                ...before,
                [session.sessionId]: e.target.value,
              }))
            }
          >
            {records.map((a) => (
              <option key={a.artifactId} value={a.artifactId}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <ArtifactList records={records} />
      {selected && (
        <>
          <PreviewPanel>
            <h3>{x.previewSource}</h3>
            {selected.availability !== "available" ? <p>{x.noPreview}</p> : resource?.renderer === "unsupported" && !resource.download ? <p>{x.unsupportedArtifact}</p> : null}
            {resource ? (
              <WorkbenchResourceContent resource={resource} />
            ) : (
              <p>
                {selected.availability === "available"
                  ? x.unsupportedArtifact
                  : `${x.noPreview} · ${t(`agentBoard.${selected.availability}`)}`}
              </p>
            )}
          </PreviewPanel>
          <div className={styles.row}>
            {resource && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onOpenResource(resource)}
              >
                {t("workbench.preview")}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={!source}
              onClick={() => {
                if (source) locateMessage(session.sessionId, source.messageId)
              }}
            >
              {x.sourceLink}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                navigate({
                  page: "review",
                  layout: "review",
                  panel: "changes",
                  ...(level === "regions" ? { region: "files" } : {}),
                })
              }
            >
              {x.reviewFiles}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDraft({
                  ...draft,
                  text: draft.text
                    ? `${draft.text}\n\n${x.reportComment}`
                    : x.reportComment,
                  version: draft.version + 1,
                })
                navigate({ page: "session", layout: "conversation" })
              }}
            >
              {x.feedback}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={body === undefined}
              onClick={async () => {
                if (body !== undefined)
                  await navigator.clipboard.writeText(body).catch(() => {})
              }}
            >
              {t("workbench.copy")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={
                selected.availability !== "available" || !resource?.download
              }
              onClick={async () => {
                if (!resource?.download) return
                const url = URL.createObjectURL(await resource.download())
                const a = document.createElement("a")
                a.href = url
                a.download = selected.name
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              {x.download}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
