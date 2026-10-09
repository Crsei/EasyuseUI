"use client"
import type { ReactNode } from "react"
import { FormSection } from "@/components/blocks/form-section"
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { DataRegion } from "@/components/ui/data-region"
import { workbenchTemplates } from "@/lib/agent-workbench-model"
import { useI18n } from "@/lib/i18n-provider"
import { useWorkbenchExample } from "./provider"
import { models, environments, permissions } from "./fixtures"
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
  retryRead,
}: WorkbenchViewProps & { preferences: ReactNode; retryRead: () => void }) {
  const { locale, t } = useI18n()
  const x = exampleMessages[locale]
  const { dispatch } = useWorkbenchExample()

  return (
    <section className={styles.section} data-workbench-view="settings">
      <h1 className={styles.title}>{x.settings}</h1>
      <p className={styles.meta}>{x.settingsScope}</p>
      <FormSection title={x.capabilities}>
        <Field label={t("workbench.model")}>
          {(props) => (
            <select
              {...props}
              className="h-8 border rounded-md px-2"
              value={draft.modelId}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  modelId: e.target.value,
                  version: draft.version + 1,
                })
              }
            >
              <option value="">{x.chooseModel}</option>
              {models.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  disabled={Boolean(m.disabledReason)}
                >
                  {m.label} {m.disabledReason}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t("workbench.environment")}>
          {(props) => (
            <select
              {...props}
              className="h-8 border rounded-md px-2"
              value={draft.environmentId}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  environmentId: e.target.value,
                  version: draft.version + 1,
                })
              }
            >
              <option value="">{x.noEnvironment}</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        {(!draft.environmentId || !draft.modelId) && (
          <p role="status">{x.invalidConfig}</p>
        )}
        <Field label={t("workbench.permission")}>
          {(props) => (
            <select
              {...props}
              className="h-8 border rounded-md px-2"
              value={draft.permissionId}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  permissionId: e.target.value,
                  version: draft.version + 1,
                })
              }
            >
              {permissions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <p>{session.environment.capabilities.join(", ") || x.noService}</p>
        <p>{x.noService}</p>
        {session.dataState === "error" && (
          <DataRegion
            state="error"
            hasContent
            error={{
              category: "network",
              message: session.error || x.readError,
              reason: x.readError,
            }}
            onRetry={retryRead}
          >
            <p>{x.settingsRetained}</p>
          </DataRegion>
        )}
      </FormSection>
      {preferences}
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
