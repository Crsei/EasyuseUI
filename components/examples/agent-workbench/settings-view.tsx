"use client"
import type { ReactNode } from "react"
import { SettingsForm } from "./settings-form"
import { Button } from "@/components/ui/button"
import { workbenchTemplates } from "@/lib/agent-workbench-model"
import { useI18n } from "@/lib/i18n-provider"
import { useWorkbenchExample } from "./provider"
import { exampleMessages } from "./messages"
import type { WorkbenchViewProps } from "./view-props"
import styles from "./demo.module.css"

export function SettingsView({
  session,
  draft,
  setDraft,
  query,
  navigate,
  preferences,
}: WorkbenchViewProps & { preferences: ReactNode; retryRead: () => void }) {
  const { locale } = useI18n()
  const x = exampleMessages[locale]
  const { dispatch } = useWorkbenchExample()

  return (
    <section className={styles.section} data-workbench-view="settings">
      <h1 className={styles.title}>{x.settings}</h1>
      <p className={styles.meta}>{x.settingsScope}</p>
      <SettingsForm
        {...{ session, draft, setDraft, query, navigate, preferences }}
      />
      <label className={styles.label}>
        {x.mode}
        <select
          value={query.template}
          onChange={(e) =>
            navigate({
              template: e.target.value,
              page: e.target.value === "console" ? "inbox" : "home",
            })
          }
        >
          {workbenchTemplates.map((template) => (
            <option key={template} value={template}>
              {template === "coding"
                ? x.coding
                : template === "artifacts"
                  ? x.artifactTemplate
                  : x.console}
            </option>
          ))}
        </select>
      </label>
      <Button
        variant="secondary"
        onClick={() => {
          dispatch({ type: "reset" })
          navigate({
            session: "session-filter",
            project: "project-demo",
            scenario: "default",
          })
        }}
      >
        {x.reset}
      </Button>
    </section>
  )
}
