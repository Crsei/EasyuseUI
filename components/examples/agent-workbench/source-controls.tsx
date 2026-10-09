"use client"
import Link from "next/link"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-provider"
import type { SessionSnapshot } from "@/lib/agent-workbench-model"
import { useWorkbenchExample } from "./provider"
import { exampleMessages } from "./messages"
import {
  showcaseHref,
  showcaseScenarios,
  commonScenarios,
  regionDefinitions,
} from "./showcase-model"
import type { WorkbenchViewProps } from "./view-props"
import styles from "./demo.module.css"

export function SourceControls({
  session,
  draft,
  setDraft,
  query,
  navigate,
  preferences,
  projectId,
  current,
  level,
  narrow,
  setNarrow,
}: WorkbenchViewProps & {
  preferences: ReactNode
  projectId: string
  current: SessionSnapshot
  level: "overview" | "regions" | "layouts" | "app"
  narrow: boolean
  setNarrow: (value: boolean) => void
}) {
  const { locale, t } = useI18n()
  const x = exampleMessages[locale]
  const { state, dispatch } = useWorkbenchExample()

  return (
    <div className={styles.controls}>
      <p className={styles.meta}>{x.sourceOnly}</p>
      <div className={styles.row}>
        <Link
          prefetch={false}
          href={showcaseHref("regions", {
            region: "sidebar",
            session: session.sessionId,
            scenario: query.scenario,
            project: projectId,
          })}
        >
          {x.regions}
        </Link>
        <Link
          prefetch={false}
          href={showcaseHref("layouts", {
            layout: "conversation",
            session: session.sessionId,
            scenario: query.scenario,
            project: projectId,
          })}
        >
          {x.layouts}
        </Link>
      </div>
      {preferences}
      <label className={styles.label}>
        {x.scenario}
        <select
          value={query.scenario}
          onChange={(e) => {
            const scenario = e.target.value
            navigate({ scenario })
          }}
        >
          {showcaseScenarios
            .filter(
              (s) =>
                level !== "regions" ||
                commonScenarios.includes(s.id) ||
                (
                  regionDefinitions.find((r) => r.id === query.region)
                    ?.cases as readonly string[] | undefined
                )?.includes(s.id) ||
                s.id === query.scenario,
            )
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.label[locale]}
              </option>
            ))}
        </select>
      </label>
      <label className={styles.row}>
        <input
          type="checkbox"
          checked={narrow}
          onChange={(e) => setNarrow(e.target.checked)}
        />
        {x.narrow}
      </label>
      <Button
        variant="secondary"
        onClick={() => dispatch({ type: "advance", id: session.sessionId })}
      >
        {x.advance}
      </Button>
      <Button
        variant="ghost"
        onClick={() => dispatch({ type: "revision", id: session.sessionId })}
      >
        {x.revision}
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          const message = session.messages[0]
          if (message)
            dispatch({
              type: "event",
              id: session.sessionId,
              cursor: 0,
              message: {
                ...message,
                revision: 999,
                parts: [
                  {
                    partId: "late",
                    sequence: 1,
                    revision: 1,
                    kind: "text",
                    text: "STALE RESPONSE MUST NOT APPEAR",
                  },
                ],
              },
            })
        }}
      >
        {x.staleEvent}
      </Button>
      <Button
        variant="ghost"
        onClick={() => dispatch({ type: "long", id: session.sessionId })}
      >
        {x.longHistory}
      </Button>
      {draft.context.some((r) => r.availability === "uploading") && (
        <Button
          variant="secondary"
          onClick={() =>
            setDraft({
              ...draft,
              version: draft.version + 1,
              context: draft.context.map((r) =>
                r.availability === "uploading"
                  ? { ...r, availability: "available", reason: undefined }
                  : r,
              ),
            })
          }
        >
          {x.uploadReady}
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          dispatch({ type: "reset" })
          navigate(
            {
              session: "session-filter",
              project: "project-demo",
              scenario: "default",
              page: "home",
            },
            true,
          )
        }}
      >
        {x.reset}
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          const previous = current.messages.find(
            (m) => m.messageId === `stream-${current.sessionId}`,
          )
          dispatch({
            type: "event",
            id: current.sessionId,
            cursor: current.cursor + 1,
            message: {
              messageId: `stream-${current.sessionId}`,
              turnId: `stream-turn-${current.sessionId}`,
              role: "agent",
              sequence: 100,
              revision: (previous?.revision ?? 0) + 1,
              state: "streaming",
              parts: [
                {
                  partId: `stream-part-${current.sessionId}`,
                  sequence: 1,
                  revision: (previous?.revision ?? 0) + 1,
                  kind: "text",
                  text: `Streaming source update ${(previous?.revision ?? 0) + 1}`,
                },
              ],
            },
          })
        }}
      >
        {x.appendEvent}
      </Button>
      <h3>{x.receipts}</h3>
      {state.receipts.map((r) => (
        <section
          key={r.requestId}
          className={styles.receipt}
          data-state={r.state}
          data-request-id={r.requestId}
        >
          <p>
            {r.requestId} · {r.targetId} · {r.action}
          </p>
          <p role="status">{t(`workbench.${r.state}`)}</p>
          {(r.state === "pending" || r.state === "unknown") && (
            <div className={styles.row}>
              <Button
                size="sm"
                onClick={() =>
                  dispatch({
                    type: "settle",
                    requestId: r.requestId,
                    state: "confirmed",
                  })
                }
              >
                {x.confirm}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: "settle",
                    requestId: r.requestId,
                    state: "failed",
                  })
                }
              >
                {x.fail}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  dispatch({
                    type: "settle",
                    requestId: r.requestId,
                    state: "unknown",
                  })
                }
              >
                {r.state === "unknown" ? x.stillUnknown : x.lose}
              </Button>
            </div>
          )}
          {r.receipt && <p className={styles.meta}>{r.receipt}</p>}
        </section>
      ))}
    </div>
  )
}
