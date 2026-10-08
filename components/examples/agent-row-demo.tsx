"use client"
import { useSiteFeedback, siteMessage } from "@/components/site/site-i18n"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useState } from "react"
import { AgentRow } from "@/components/blocks/agent-row"
export function AgentRowDemo() {
  const { t } = useSiteI18n()

  const [selected, setSelected] = useState("builder")
  const [feedback, setFeedback] = useSiteFeedback("")
  return (
    <div>
      <AgentRow
        agent={{
          id: "builder",
          name: "Builder",
          model: t("site.localDemoModel"),
          status: "thinking",
          stage: t("site.organizeComponents"),
          activeSessionCount: 2,
          aggregate: true,
        }}
        selected={selected === "builder"}
        onSelect={() => setSelected("builder")}
      />
      <AgentRow
        agent={{ id: "reviewer", name: "Reviewer", status: "idle" }}
        selected={selected === "reviewer"}
        onSelect={() => setSelected("reviewer")}
        action={{
          label: t("site.configuration"),
          onAction: () =>
            setFeedback(siteMessage("site.openConfigurationLocalDemoCallback")),
        }}
      />
      <AgentRow
        agent={{
          id: "offline",
          name: "断线的 Agent",
          model: t("site.localDemoModel"),
          status: "running",
          offline: true,
          updatedAt: "16:42:08",
        }}
        action={{
          label: t("site.pause2"),
          onAction: () => {},
          disabledReason: t("site.offlineRestoreTheConnectionFirst"),
        }}
      />
      <p role="status" className="mt-3 text-xs text-text-secondary">
        {feedback}
      </p>
    </div>
  )
}
