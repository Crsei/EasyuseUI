"use client"
import { useEffect, useId, useRef, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChatComposer } from "@/components/blocks/chat-message"
import { useI18n } from "@/lib/i18n-provider"
import {
  draftCanSubmit,
  activeReceipt,
  type DraftState,
  type SessionSnapshot,
  type WorkbenchChoice,
  type OperationReceipt,
} from "@/lib/agent-workbench-model"
import styles from "./workbench.module.css"
export type ComposerControlsProps = {
  draft: DraftState
  onChange: (draft: DraftState) => void
  models: readonly WorkbenchChoice[]
  permissions: readonly WorkbenchChoice[]
  environments: readonly WorkbenchChoice[]
  session: SessionSnapshot
}
export function ComposerControls({
  draft,
  onChange,
  models,
  permissions,
  environments,
  session,
}: ComposerControlsProps) {
  const { t } = useI18n()
  const id = useId()
  const fields = [
    { key: "modelId", label: t("workbench.model"), choices: models },
    {
      key: "permissionId",
      label: t("workbench.permission"),
      choices: permissions,
    },
    {
      key: "environmentId",
      label: t("workbench.environment"),
      choices: environments,
    },
  ] as const
  return (
    <div className={styles.controls}>
      {fields.map((f) => (
        <label className={styles.label} key={f.key} htmlFor={`${id}-${f.key}`}>
          {f.label}
          <select
            className={styles.select}
            id={`${id}-${f.key}`}
            value={draft[f.key]}
            onChange={(e) =>
              onChange({
                ...draft,
                [f.key]: e.target.value,
                version: draft.version + 1,
              })
            }
          >
            {f.choices.map((choice) => (
              <option
                key={choice.id}
                value={choice.id}
                disabled={Boolean(choice.disabledReason)}
              >
                {choice.label}
                {choice.disabledReason ? ` · ${choice.disabledReason}` : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className={styles.label} htmlFor={`${id}-mode`}>
        {t("workbench.inputMode")}
        <select
          className={styles.select}
          id={`${id}-mode`}
          value={draft.mode}
          onChange={(e) =>
            onChange({
              ...draft,
              mode: e.target.value as DraftState["mode"],
              version: draft.version + 1,
            })
          }
        >
          {(["send", "queue", "steer"] as const).map((mode) => (
            <option
              key={mode}
              value={mode}
              disabled={!session.capabilities[mode]}
            >
              {t(`workbench.${mode}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
export type AgentComposerProps = ComposerControlsProps & {
  receipts: readonly OperationReceipt[]
  onSubmit: (draft: DraftState) => void | Promise<void>
  onInterrupt?: () => void
  onReconcile?: (receipt: OperationReceipt) => void
  onFiles?: (files: File[]) => void
  attachments?: ReactNode
}
export function AgentComposer({
  draft,
  onChange,
  models,
  permissions,
  environments,
  session,
  receipts,
  onSubmit,
  onInterrupt,
  onReconcile,
  onFiles,
  attachments,
}: AgentComposerProps) {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let frame = 0
    const revealFocusedInput = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const input = root.querySelector("textarea")
        if (
          !input ||
          document.activeElement !== input ||
          !root.getClientRects().length
        )
          return
        const bounds = root.getBoundingClientRect(),
          field = input.getBoundingClientRect()
        const top = bounds.top + root.clientTop + 2
        const bottom = bounds.top + root.clientTop + root.clientHeight - 2
        if (field.top < top) root.scrollTop -= Math.ceil(top - field.top)
        else if (field.bottom > bottom)
          root.scrollTop += Math.ceil(field.bottom - bottom)
      })
    }
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(revealFocusedInput)
    observer?.observe(root)
    window.addEventListener("resize", revealFocusedInput)
    root.addEventListener("focusin", revealFocusedInput)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", revealFocusedInput)
      root.removeEventListener("focusin", revealFocusedInput)
      cancelAnimationFrame(frame)
    }
  }, [])
  const receipt = activeReceipt(receipts, session.sessionId)
  const connected = session.environment.connection === "connected"
  const canSubmit = draftCanSubmit(session, draft, receipts)
  const validChoices = [
    models.some((m) => m.id === draft.modelId && !m.disabledReason),
    permissions.some((p) => p.id === draft.permissionId && !p.disabledReason),
    environments.some((e) => e.id === draft.environmentId && !e.disabledReason),
  ].every(Boolean)
  return (
    <section
      ref={rootRef}
      className={styles.composer}
      aria-label={t("workbench.inputMode")}
      data-draft-id={draft.draftId}
    >
      <details className={styles.composerSettings} data-composer-settings>
        <summary>
          {t("workbench.composerSettings")}
          <span className={styles.meta}>
            {models.find((model) => model.id === draft.modelId)?.label} ·{" "}
            {t(`workbench.${draft.mode}`)}
          </span>
        </summary>
        <div className={styles.composerOptions}>
          <ComposerControls
            {...{ draft, onChange, models, permissions, environments, session }}
          />
          {attachments}
          {onFiles && (
            <label className={styles.attachmentInput}>
              {t("workbench.attachments")}
              <input
                type="file"
                multiple
                onChange={(e) => {
                  onFiles(Array.from(e.target.files ?? []))
                  e.target.value = ""
                }}
              />
            </label>
          )}
        </div>
      </details>
      <ChatComposer
        value={draft.text}
        onChange={(text) =>
          onChange({ ...draft, text, version: draft.version + 1 })
        }
        onSend={() => {
          if (canSubmit && validChoices) return onSubmit(draft)
        }}
        sendDisabled={!canSubmit || !validChoices}
        pending={receipt?.state === "pending"}
        disabled={!connected}
        attachments={
          receipt || (!canSubmit && draft.text.trim()) || !validChoices ? (
            <>
              {receipt && (
                <div className={styles.row} role="status">
                  {t(`workbench.${receipt.state}`)}
                  {receipt.state === "unknown" && onReconcile && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onReconcile(receipt)}
                    >
                      {t("workbench.reconcile")}
                    </Button>
                  )}
                </div>
              )}
              {!canSubmit && draft.text.trim() && (
                <p className={styles.meta}>
                  {receipt
                    ? t("workbench.draftRetained")
                    : !connected
                      ? t("workbench.disconnected")
                      : draft.context.some(
                            (r) => r.included && r.availability !== "available",
                          )
                        ? t("workbench.blockedContext")
                        : t("workbench.noCapability")}
                </p>
              )}
              {!validChoices && (
                <p role="alert">{t("workbench.unavailable")}</p>
              )}
            </>
          ) : undefined
        }
      />
      {onInterrupt && session.capabilities.interrupt && (
        <div className={styles.toolbar}>
          <Button
            size="sm"
            variant="secondary"
            onClick={onInterrupt}
            disabled={Boolean(receipt)}
          >
            {t("workbench.interrupt")}
          </Button>
        </div>
      )}
    </section>
  )
}
