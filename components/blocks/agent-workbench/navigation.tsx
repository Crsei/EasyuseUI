"use client"
import { useId, useState, type ReactNode } from "react"
import { Plus, Star, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataRegion, type DataRegionProps } from "@/components/ui/data-region"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { SessionRow } from "@/components/blocks/session-row"
import { useI18n } from "@/lib/i18n-provider"
import type {
  EnvironmentRef,
  ProjectRef,
  SessionSnapshot,
  OperationReceipt,
} from "@/lib/agent-workbench-model"
import { activeReceipt } from "@/lib/agent-workbench-model"
import { cn } from "@/lib/utils"
import styles from "./workbench.module.css"
export function ProjectSwitcher({
  projects,
  value,
  onChange,
}: {
  projects: readonly ProjectRef[]
  value: string
  onChange: (id: string) => void
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <label className={styles.label} htmlFor={id}>
      {t("workbench.project")}
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!projects.length}
      >
        {!projects.length && (
          <option value="">{t("workbench.noProjects")}</option>
        )}
        {projects.map((p) => (
          <option key={p.projectId} value={p.projectId}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  )
}
export type SessionNavigatorProps = {
  projects: readonly ProjectRef[]
  sessions: readonly SessionSnapshot[]
  projectId: string
  selectedId?: string
  onProjectChange: (id: string) => void
  onSelect: (id: string) => void
  onNew: () => void
  newLabel?: string
  newDisabled?: boolean
  filters?: "all" | "runtime"
  onUpdate?: (
    id: string,
    patch: Partial<Pick<SessionSnapshot, "title" | "favorite" | "archived">>,
  ) => void
  data?: Omit<DataRegionProps, "children" | "hasContent">
  footer?: ReactNode
  receipts?: readonly OperationReceipt[]
  onReconcile?: (receipt: OperationReceipt) => void
}
export function SessionNavigator({
  projects,
  sessions,
  projectId,
  selectedId,
  onProjectChange,
  onSelect,
  onNew,
  newLabel,
  newDisabled = false,
  filters = "all",
  onUpdate,
  data,
  footer,
  receipts = [],
  onReconcile,
}: SessionNavigatorProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [archived, setArchived] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [runningOnly, setRunningOnly] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [name, setName] = useState("")
  const filtered = sessions.filter(
    (s) =>
      s.projectId === projectId &&
      Boolean(s.archived) === archived &&
      (!favoritesOnly || s.favorite) &&
      (!runningOnly ||
        ["running", "starting", "thinking", "queued", "waiting"].includes(
          s.status,
        )) &&
      s.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <nav className={styles.nav} aria-label={t("workbench.recent")}>
      <Button
        className={styles.newButton}
        onClick={onNew}
        aria-label={newLabel ?? t("workbench.newTask")}
        disabled={newDisabled}
      >
        <Plus size={16} />
        {newLabel ?? t("workbench.newTask")}
      </Button>
      <ProjectSwitcher
        projects={projects}
        value={projectId}
        onChange={onProjectChange}
      />
      <Input
        aria-label={t("workbench.searchSessions")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className={styles.row}>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!archived && !runningOnly}
          onClick={() => {
            setArchived(false)
            setRunningOnly(false)
          }}
        >
          {t("workbench.recent")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={runningOnly}
          onClick={() => {
            setArchived(false)
            setRunningOnly(true)
          }}
        >
          {t("agentBoard.active")}
        </Button>
        {filters === "all" && (
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={archived}
            onClick={() => {
              setArchived(true)
              setRunningOnly(false)
            }}
          >
            {t("workbench.archived")}
          </Button>
        )}
        {filters === "all" && (
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            {t("workbench.favorites")}
          </Button>
        )}
      </div>
      <DataRegion
        state={filtered.length ? "success" : "empty"}
        {...data}
        hasContent={filtered.length > 0}
        emptyTitle={t("workbench.noSessions")}
      >
        {filtered.map((s) => {
          const operation = activeReceipt(receipts, s.sessionId)
          const update = receipts.findLast(
            (receipt) =>
              receipt.targetId === s.sessionId &&
              receipt.action === "update-session",
          )
          return (
            <div
              key={s.sessionId}
              className={styles.navGroup}
              data-session-id={s.sessionId}
            >
              <SessionRow
                session={{
                  id: s.sessionId,
                  title: `${s.favorite ? "★ " : ""}${s.title}`,
                  status: s.status,
                  updatedAt: s.updatedAt,
                  stage: s.unread ? t("workbench.unread") : undefined,
                }}
                selected={selectedId === s.sessionId}
                onSelect={() => onSelect(s.sessionId)}
              />
              {onUpdate && (
                <details>
                  <summary className={styles.meta}>
                    {t("workbench.actions")}
                  </summary>
                  <div className={styles.row}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t(
                        s.favorite
                          ? "workbench.unfavorite"
                          : "workbench.favorite",
                      )}
                      disabled={Boolean(operation)}
                      onClick={() =>
                        onUpdate(s.sessionId, { favorite: !s.favorite })
                      }
                    >
                      <Star size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t(
                        s.archived ? "workbench.restore" : "workbench.archive",
                      )}
                      disabled={Boolean(operation)}
                      onClick={() =>
                        onUpdate(s.sessionId, { archived: !s.archived })
                      }
                    >
                      <Archive size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={Boolean(operation)}
                      onClick={() => {
                        setRenaming(s.sessionId)
                        setName(s.title)
                      }}
                    >
                      {t("workbench.rename")}
                    </Button>
                  </div>
                  {renaming === s.sessionId && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (name.trim())
                          onUpdate(s.sessionId, { title: name.trim() })
                        setRenaming(null)
                      }}
                    >
                      <Input
                        autoFocus
                        aria-label={t("workbench.newName")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Button type="submit" size="sm">
                        {t("workbench.rename")}
                      </Button>
                    </form>
                  )}
                </details>
              )}
              {update && (
                <p className={styles.meta} role="status">
                  {t(`workbench.${update.state}`)}
                  {update.state === "unknown" && onReconcile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReconcile(update)}
                    >
                      {t("workbench.reconcile")}
                    </Button>
                  )}
                </p>
              )}
            </div>
          )
        })}
      </DataRegion>
      {footer}
    </nav>
  )
}
export function SessionHeader({
  session,
  environment = session.environment,
  onRename,
  onInterrupt,
  actions,
  presentation = "default",
}: {
  session: SessionSnapshot
  environment?: EnvironmentRef
  onRename?: (title: string) => void
  onInterrupt?: () => void
  actions?: ReactNode
  presentation?: "default" | "workspace"
}) {
  const { t } = useI18n()
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState("")
  return (
    <div
      className={cn(
        styles.row,
        presentation === "workspace" && styles.sessionHeader,
      )}
    >
      {editing === session.sessionId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) onRename?.(name.trim())
            setEditing(null)
          }}
        >
          <Input
            aria-label={t("workbench.newName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" size="sm">
            {t("workbench.rename")}
          </Button>
        </form>
      ) : (
        <>
          <span className={styles.heading}>{session.title}</span>
          {onRename && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(session.title)
                setEditing(session.sessionId)
              }}
            >
              {t("workbench.rename")}
            </Button>
          )}
        </>
      )}
      <RuntimeStatusBadge status={session.status} />
      <span className={styles.meta}>
        {environment.name} · {environment.branch ?? "—"} ·{" "}
        {environment.connection === "connected"
          ? t("workbench.connectionConnected")
          : environment.connection === "disconnected"
            ? t("workbench.disconnected")
            : t("workbench.connectionUnknown")}
      </span>
      {onInterrupt && (
        <Button
          size="sm"
          variant="secondary"
          disabled={!session.capabilities.interrupt}
          onClick={onInterrupt}
        >
          {t("workbench.interrupt")}
        </Button>
      )}
      {actions}
    </div>
  )
}
