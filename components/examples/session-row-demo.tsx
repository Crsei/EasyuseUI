"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import { SessionRow } from "@/components/blocks/session-row"
export function SessionRowDemo() {
  const { t } = useSiteI18n()

  const [selected, setSelected] = useState("session-one")
  const [feedback, setFeedback] = useSiteFeedback("")
  return (
    <div>
      <SessionRow
        session={{
          id: "session-one",
          title: "实现组件构造",
          status: "running",
          updatedAt: "16:42",
          stage: t("site.validateDimensions"),
          elapsed: "02:18",
        }}
        selected={selected === "session-one"}
        onSelect={() => setSelected("session-one")}
      />
      <SessionRow
        session={{
          id: "session-two",
          title: "",
          status: "paused",
          updatedAt: "16:40",
          waitingReason: t("site.waitingToContinue"),
        }}
        selected={selected === "session-two"}
        onSelect={() => setSelected("session-two")}
        action={{
          label: t("site.continue"),
          onAction: () =>
            setFeedback(
              siteMessage("site.continueRequestedLocalDemoRuntimeWasNotCalled"),
            ),
        }}
      />
      <SessionRow
        compact
        session={{
          id: "session-three",
          title: "紧凑 Session",
          status: "failed",
          updatedAt: "16:38",
        }}
        disabled
        onSelect={() => {}}
        action={{
          label: t("site.retry"),
          onAction: () => {},
          disabledReason: t("site.retryPermissionMissing"),
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback}
      </p>
    </div>
  )
}
