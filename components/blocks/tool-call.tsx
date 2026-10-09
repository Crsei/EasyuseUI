"use client"
import { useUiFeedback } from "@/lib/i18n-provider"
import { uiMessage, type UiMessage } from "@/lib/i18n-core"
import { useI18n } from "@/lib/i18n-provider"

import { useId, useState } from "react"
import { ChevronRight, Terminal, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { previewText, redact } from "@/lib/redact"
import styles from "./tool-call.module.css"

export type ToolCallRecord = {
  id: string
  name: string
  status: string
  target?: string
  arguments?: unknown
  output?: unknown
  stage?: string
  elapsed?: string
  duration?: string
  exitCode?: number
  error?: string
  outputTruncated?: boolean
  outcome?: "known" | "unknown"
  receipt?: string
}
type Operation = () => void | Promise<void>
export type ToolCallProps = {
  call: ToolCallRecord
  defaultExpanded?: boolean
  data?: Omit<DataRegionProps, "children" | "hasContent">
  permission?: {
    scope: string
    risk: string
    onApprove?: Operation
    onReject?: Operation
  }
  onCancel?: Operation
  onRetry?: Operation
  onReconcile?: Operation
  onDownload?: (redactedOutput: string) => void
}
export function ToolCall({
  call,
  defaultExpanded = false,
  data,
  permission,
  onCancel,
  onRetry,
  onReconcile,
  onDownload,
}: ToolCallProps) {
  const { t, resolve } = useI18n()

  const id = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [full, setFull] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState<{
    key: string
    label: UiMessage
  }>()
  const [feedback, setFeedback] = useUiFeedback("")
  const [actionError, setActionError] = useUiFeedback("")
  const [uncertainKey, setUncertainKey] = useState<string>()
  const key = `${call.id}:${call.status}:${call.outcome ?? "known"}:${permission?.scope ?? ""}`
  const waitingConfirmation = submitted?.key === key
  const output = redact(call.output)
  const preview = previewText(output)
  const unknown = call.outcome === "unknown" || uncertainKey === key
  async function operate(label: UiMessage, action: Operation) {
    if (pending || waitingConfirmation) return
    setPending(true)
    setActionError("")
    try {
      await action()
      setSubmitted({ key, label })
      setFeedback(
        uiMessage("common.valueRequestSubmittedWaitingForSourceConfirmation", {
          value0: label,
        }),
      )
    } catch {
      setUncertainKey(key)
      setActionError(
        uiMessage("common.valueRequestFailedTheOutcomeIsUnknownQuery", {
          value0: label,
        }),
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <div className={styles.call} data-call-id={call.id}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        aria-controls={`${id}-body`}
        onClick={() => setExpanded(!expanded)}
      >
        <Terminal size={16} aria-hidden="true" />
        <span className={styles.name}>{redact(call.name)}</span>
        {call.target && (
          <span className={styles.target}>{redact(call.target)}</span>
        )}
        <RuntimeStatusBadge status={call.status} />
        {unknown && (
          <span className={styles.warning}>{t("toolCall.outcomeUnknown")}</span>
        )}
        <span className={styles.duration}>
          {redact(call.duration ?? call.elapsed ?? "—")}
        </span>
        <ChevronRight
          size={16}
          className={styles.chevron}
          data-open={expanded}
          aria-hidden="true"
        />
      </button>
      {!expanded && call.error && (
        <p className={styles.notice} role="alert">
          {redact(call.error).slice(0, 256)}
        </p>
      )}
      {expanded && (
        <div id={`${id}-body`} className={styles.body}>
          <DataRegion
            {...data}
            error={
              data?.error
                ? {
                    ...data.error,
                    message: redact(
                      resolve(data.error.messageI18n, data.error.message),
                    ),
                    messageI18n: undefined,
                    reason: redact(
                      resolve(data.error.reasonI18n, data.error.reason),
                    ),
                    reasonI18n: undefined,
                  }
                : undefined
            }
            hasContent={
              call.arguments !== undefined || call.output !== undefined
            }
            partialDescription={t(
              "toolCall.partialOutputStillReceivingOrNotFullyLoaded",
            )}
            loadingLabel={t("toolCall.loadingToolDetails")}
          >
            {(call.stage || call.elapsed) && (
              <p className={styles.stage}>
                {redact(call.stage ?? t("toolCall.currentStageNotProvided"))} ·{" "}
                {redact(call.elapsed ?? t("toolCall.durationUnknown"))}
              </p>
            )}
            {unknown && (
              <div className={styles.notice}>
                <p>{t("toolCall.outcomeUnknownQueryOrReconcileFirstDoNot")}</p>
                {call.receipt && <p>Receipt：{redact(call.receipt)}</p>}
                {onReconcile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={pending}
                    disabled={waitingConfirmation}
                    onClick={() =>
                      operate(uiMessage("toolCall.queryResult"), onReconcile)
                    }
                  >
                    {t("toolCall.queryResult")}
                  </Button>
                )}
              </div>
            )}
            <section>
              <h4>{t("styleWorkbench.parameter")}</h4>
              <pre>
                {call.arguments === undefined
                  ? t("toolCall.argumentsNotProvided")
                  : redact(call.arguments)}
              </pre>
            </section>
            <section>
              <div className={styles.sectionHeader}>
                <h4>{t("toolCall.output")}</h4>
                {output && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("toolCall.copyRedactedOutput")}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(output)
                        setFeedback(uiMessage("toolCall.redactedOutputCopied"))
                      } catch {
                        setFeedback(
                          uiMessage(
                            "toolCall.clipboardUnavailableCopyTheRedactedContentManually",
                          ),
                        )
                      }
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                )}
              </div>
              <pre>
                {output
                  ? full
                    ? output
                    : preview.text
                  : t("toolCall.theToolReturnedNoTextOutput")}
              </pre>
              {(preview.truncated || call.outputTruncated) && (
                <div className={styles.notice}>
                  <p>
                    {t("toolCall.outputTruncated")}
                    {preview.truncated
                      ? t("toolCall.previewLimitedTo200Lines32kib")
                      : t("toolCall.theSourceSuppliedOnlyPartialOutput")}
                  </p>
                  {preview.truncated && !call.outputTruncated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFull(!full)}
                    >
                      {full
                        ? t("toolCall.collapseFullOutput")
                        : t("toolCall.expandFullOutput")}
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDownload(output)}
                    >
                      {t("toolCall.downloadRedactedOutput")}
                      {call.outputTruncated ? t("toolCall.fragment") : ""}
                    </Button>
                  )}
                </div>
              )}
            </section>
            {call.exitCode !== undefined && (
              <p className={styles.stage}>Exit code：{call.exitCode}</p>
            )}
            {call.error && (
              <p role="alert" className={styles.error}>
                {redact(call.error)}
              </p>
            )}
            {!unknown && call.status === "waiting" && permission && (
              <section
                className={styles.permission}
                aria-label={t("toolCall.toolPermissionRequest")}
              >
                <h4>{t("toolCall.explicitAuthorizationRequired")}</h4>
                <p>
                  {t("toolCall.scope")}
                  {redact(permission.scope)}
                </p>
                <p>
                  {t("toolCall.risk")}
                  {redact(permission.risk)}
                </p>
                <div className={styles.actions}>
                  {permission.onApprove && (
                    <Button
                      size="sm"
                      loading={pending}
                      disabled={waitingConfirmation}
                      onClick={() =>
                        operate(
                          uiMessage("toolCall.approve"),
                          permission.onApprove!,
                        )
                      }
                    >
                      {t("toolCall.approve")}
                    </Button>
                  )}
                  {permission.onReject && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending || waitingConfirmation}
                      onClick={() =>
                        operate(
                          uiMessage("toolCall.reject"),
                          permission.onReject!,
                        )
                      }
                    >
                      {t("toolCall.reject")}
                    </Button>
                  )}
                </div>
              </section>
            )}
            <div className={styles.actions}>
              {!unknown &&
                onCancel &&
                ["queued", "starting", "running", "waiting"].includes(
                  call.status,
                ) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={pending}
                    disabled={waitingConfirmation}
                    onClick={() =>
                      operate(uiMessage("toolCall.cancel"), onCancel)
                    }
                  >
                    {waitingConfirmation &&
                    submitted.label.key === "toolCall.cancel"
                      ? t("toolCall.cancelling")
                      : t("toolCall.cancelExecution")}
                  </Button>
                )}
              {!unknown && call.status === "failed" && onRetry && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={pending}
                  disabled={waitingConfirmation}
                  onClick={() => operate(uiMessage("taskPanel.retry"), onRetry)}
                >
                  {t("toolCall.safeRetry")}
                </Button>
              )}
            </div>
          </DataRegion>
          <p role="status" className={styles.feedback}>
            {feedback}
          </p>
          {actionError && (
            <p role="alert" className={styles.error}>
              {actionError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
