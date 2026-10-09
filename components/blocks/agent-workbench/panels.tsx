"use client"
import { useId, useState, type ReactNode } from "react"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uiMessage } from "@/lib/i18n-core"
import { useUiFeedback } from "@/lib/i18n-provider"
import { useI18n } from "@/lib/i18n-provider"
import { redact } from "@/lib/redact"
import type { WorkbenchPanelId } from "@/lib/agent-workbench-model"
import styles from "./workbench.module.css"
export type WorkbenchPanelDescriptor = {
  id: WorkbenchPanelId
  label: ReactNode
  available: boolean
  reason?: string
  badge?: string | number
  render: () => ReactNode
}
export function WorkbenchPanelTabs({
  panels,
  value,
  onChange,
}: {
  panels: readonly WorkbenchPanelDescriptor[]
  value: WorkbenchPanelId
  onChange: (id: WorkbenchPanelId) => void
}) {
  const { t } = useI18n()
  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        if (panels.some((p) => p.id === v)) onChange(v as WorkbenchPanelId)
      }}
    >
      <TabsList className={styles.tabs}>
        {panels.map((p) => (
          <TabsTab key={p.id} value={p.id}>
            {p.label}
            {p.badge !== undefined && ` (${p.badge})`}
          </TabsTab>
        ))}
      </TabsList>
      {panels.map((p) => (
        <BaseTabs.Panel
          key={p.id}
          value={p.id}
          keepMounted
          className={styles.tabPanel}
        >
          {p.available ? (
            p.render()
          ) : (
            <p className={styles.section}>
              {p.reason ?? t("workbench.noCapability")}
            </p>
          )}
        </BaseTabs.Panel>
      ))}
    </Tabs>
  )
}
export function ExecutionOutputPanel({
  text,
  source,
  timestamp,
  truncated,
  connected = true,
  onReconnect,
  terminal,
}: {
  text: string
  source: string
  timestamp: string
  truncated?: boolean
  connected?: boolean
  onReconnect?: () => void
  terminal?: ReactNode
}) {
  const { t } = useI18n()
  const [filter, setFilter] = useState("")
  const [feedback, setFeedback] = useUiFeedback("")
  const safe = redact(text)
  const lines = safe.split("\n")
  const bounded = lines.slice(0, 200).join("\n").slice(0, 32768)
  const shown = bounded
    .split("\n")
    .filter((line) => line.toLowerCase().includes(filter.toLowerCase()))
    .join("\n")
  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <span className={styles.meta}>
          {source} · <time>{timestamp}</time>
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shown)
              setFeedback(uiMessage("workbench.copied"))
            } catch {
              setFeedback(uiMessage("workbench.copyFailed"))
            }
          }}
        >
          {t("workbench.copy")}
        </Button>
      </div>
      <Input
        aria-label={t("workbench.outputFilter")}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {!connected && (
        <p role="status">
          {t("workbench.disconnected")}{" "}
          {onReconnect && (
            <Button size="sm" onClick={onReconnect}>
              {t("workbench.retry")}
            </Button>
          )}
        </p>
      )}
      {terminal ?? (
        <>
          <p className={styles.meta}>{t("workbench.noPty")}</p>
          <pre className={styles.code} tabIndex={0}>
            {shown || t("workbench.emptyOutput")}
          </pre>
        </>
      )}
      {(truncated || bounded.length < safe.length) && (
        <p role="status">{t("workbench.truncated")}</p>
      )}
      <span role="status">{feedback}</span>
    </section>
  )
}
export function PreviewPanel({
  url,
  allowed = false,
  reason,
  children,
}: {
  url?: string
  allowed?: boolean
  reason?: string
  children?: ReactNode
}) {
  const { t } = useI18n()
  const id = useId()
  let safe: string | undefined
  try {
    const parsed = new URL(url ?? "")
    if (
      ["https:", "http:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password
    )
      safe = parsed.href
  } catch {}
  return (
    <section aria-label={t("workbench.preview")} className={styles.section}>
      {children ??
        (safe && allowed ? (
          <iframe
            title={`${t("workbench.preview")} ${id}`}
            className={styles.preview}
            src={safe}
            sandbox=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <p>
            {reason ??
              t(url ? "workbench.previewBlocked" : "workbench.noPreview")}
          </p>
        ))}
    </section>
  )
}
