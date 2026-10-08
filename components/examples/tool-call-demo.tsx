"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import { ToolCall } from "@/components/blocks/tool-call"
import { runtimeStatuses, type RuntimeStatus } from "@/lib/runtime-status"
import { Button } from "@/components/ui/button"
export function ToolCallDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [status, setStatus] = useState<RuntimeStatus>("waiting")
  const [unknown, setUnknown] = useState(false)
  const [long, setLong] = useState(false)
  const [feedback, setFeedback] = useSiteFeedback("")
  const [loseCancel, setLoseCancel] = useState(false)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={loseCancel}
          onClick={() => setLoseCancel(!loseCancel)}
        >
          {t("site.simulateALostCancellationResponse")}
        </Button>
        <label htmlFor={id} className="text-xs">
          {t("site.toolRuntimeStatus")}
        </label>
        <select
          id={id}
          value={status}
          onChange={(event) => setStatus(event.target.value as RuntimeStatus)}
          className="h-8 max-w-full rounded-md border bg-surface px-2 text-xs"
        >
          {runtimeStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <Button size="sm" variant="ghost" onClick={() => setUnknown(!unknown)}>
          {t("site.toggleUnknownOutcome")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setLong(!long)}>
          {t("site.toggleLongOutput")}
        </Button>
      </div>
      <ToolCall
        call={{
          id: "call-local",
          name: "write_file",
          target: "components/example.tsx",
          status,
          arguments: {
            path: "components/example.tsx",
            api_key: "demo-api-secret",
            headers: {
              Authorization: "Bearer demo-auth-secret",
              Cookie: "session=demo-cookie-secret",
            },
          },
          output: long
            ? Array.from(
                { length: 240 },
                (_, index) => `line ${index + 1}: local output`,
              ).join("\n")
            : t("site.authorizationBearerDemoOutputSecret"),
          outcome: unknown ? "unknown" : "known",
          receipt: "local-receipt-01",
          stage:
            status === "running" ? t("site.writeLocalDemoFile") : undefined,
          elapsed: "00:24",
        }}
        defaultExpanded
        permission={{
          scope: t("site.writeComponentsExampleTsxLocalUiDemoOnly"),
          risk: t("site.overwriteTheExistingFileContentThisExampleDoesNot"),
          onApprove: () => {
            setStatus("running")
            setFeedback(siteMessage("site.approveCallbackFiredOnceLocalDemo"))
          },
          onReject: () => {
            setStatus("cancelled")
            setFeedback(siteMessage("site.rejectCallbackFiredLocalDemo"))
          },
        }}
        onCancel={() => {
          if (loseCancel)
            return Promise.reject(new Error("Local demo lost response"))
          setFeedback(
            siteMessage(
              "site.cancellationRequestedWaitingForConfirmationStatusDoesNotChange",
            ),
          )
        }}
        onRetry={() => {
          setStatus("running")
          setFeedback(siteMessage("site.safeRetryCallbackLocalDemo"))
        }}
        onReconcile={() => {
          setUnknown(false)
          if (loseCancel) setStatus("cancelled")
          setFeedback(
            siteMessage("site.queryCallbackLocalKnownOutcomeRestored"),
          )
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback ||
          t("site.localRecordExplicitCallbacksHandleEveryActionNoReal")}
      </p>
    </div>
  )
}
