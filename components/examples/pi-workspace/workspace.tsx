"use client"
import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import {
  Settings,
  Languages,
  SunMoon,
  MessageSquare,
  RefreshCw,
} from "lucide-react"
import {
  AgentWorkbench,
  AgentComposer,
  SessionNavigator,
  SessionHeader,
} from "@/components/blocks/agent-workbench"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { DataRegion } from "@/components/ui/data-region"
import type { ConversationActions } from "@/components/blocks/chat-message"
import { useI18n } from "@/lib/i18n-provider"
import type { PanelState } from "@/lib/agent-workbench-model"
import type { PiSession } from "@/lib/pi-workspace-protocol"
import { PiWorkspaceProvider, usePiWorkspace } from "./provider"
import { emptyDraft, workbenchSnapshot } from "./model"
import { piMessages } from "./messages"
import referenceTokens from "../agent-workspace/reference-tokens.module.css"
import styles from "./workspace.module.css"

const panelDefaults: PanelState = {
  activePanel: "context",
  sidebarCollapsed: false,
  inspectorOpen: false,
  bottomOpen: false,
  inspectorWidth: 320,
  bottomHeight: 240,
}
export function PiWorkspace() {
  return (
    <PiWorkspaceProvider>
      <WorkspaceView />
    </PiWorkspaceProvider>
  )
}
function WorkspaceView() {
  const state = usePiWorkspace(),
    { locale, setLocale } = useI18n(),
    x = piMessages[locale]
  const { resolvedTheme, setTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(true),
    [address, setAddress] = useState("http://127.0.0.1:3012"),
    [token, setToken] = useState("")
  const [panels, setPanels] = useState(panelDefaults)
  const root = useRef<HTMLDivElement>(null),
    conversation = useRef<ConversationActions | null>(null)
  const reading = useRef(
    new Map<string, { id?: string; start?: number; end?: number }>(),
  )
  const [localError, setLocalError] = useState<string>()
  const snapshot = state.cache[state.selectedId]
  const hasSnapshot = Boolean(snapshot)
  const project = state.projects.find((p) => p.projectId === state.projectId)
  const summary: PiSession = snapshot?.session ??
    state.sessions.find((s) => s.sessionId === state.selectedId) ?? {
      sessionId: state.selectedId,
      projectId: state.projectId,
      title: x.choose,
      source: "managed",
      status: "idle",
      updatedAt: "",
      branchId: null,
      branchCount: 0,
      revision: "",
      diagnostics: [],
      capabilities: { send: false, interrupt: false, copy: false },
      modelId: state.models[0]?.id ?? "",
      sequence: 0,
      hostEpoch: "",
    }
  const session = workbenchSnapshot(
    summary,
    project,
    snapshot,
    state.connection === "connected"
      ? "connected"
      : state.connection === "connecting"
        ? "unknown"
        : "disconnected",
  )
  session.capabilities.send = session.capabilities.send && !state.openingSession
  // UI revisions include history paging even when the Host event sequence stays unchanged.
  session.revision = summary.sequence * 10000 + session.messages.length
  session.history.loading = state.historyLoading
  if (state.historyLoading && !session.messages.length && state.selectedId)
    session.dataState = "loading"
  if (state.error && state.selectedId) {
    session.dataState = session.messages.length ? "partial" : "error"
    session.error = state.error
  }
  const draft =
    state.drafts[state.selectedId] ??
    emptyDraft(
      state.selectedId,
      summary.modelId || state.models[0]?.id || "",
      state.projectId,
    )
  const activeReceipts = state.receipts.filter(
    (r) =>
      ["pending", "unknown"].includes(r.state) &&
      (r.targetId === state.selectedId || r.targetId === state.projectId),
  )
  const remember = () => {
    const viewport = root.current
      ?.querySelector<HTMLElement>("[data-follow-tail-list]")
      ?.closest<HTMLElement>("[tabindex='0']")
    const input = root.current?.querySelector<HTMLTextAreaElement>("textarea")
    if (!viewport) return
    const top = viewport.getBoundingClientRect().top
    const entry = [
      ...viewport.querySelectorAll<HTMLElement>("[data-follow-tail-id]"),
    ].find((entry) => entry.getBoundingClientRect().bottom > top + 4)
    const following =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 64
    reading.current.set(state.selectedId, {
      id: following ? undefined : entry?.dataset.followTailId,
      start: input?.selectionStart,
      end: input?.selectionEnd,
    })
  }
  useLayoutEffect(() => {
    const saved = reading.current.get(state.selectedId)
    if (!saved) {
      conversation.current?.jumpToLatest()
      return
    }
    if (saved.id) conversation.current?.scrollToMessage(saved.id)
    else conversation.current?.jumpToLatest()
    const input = root.current?.querySelector<HTMLTextAreaElement>("textarea")
    if (input && saved.start !== undefined)
      input.setSelectionRange(saved.start, saved.end ?? saved.start)
  }, [state.selectedId, hasSnapshot])
  useEffect(() => {
    const saved = sessionStorage.getItem("easyuse:pi:connection")
    if (saved)
      void Promise.resolve().then(() => {
        try {
          const value = JSON.parse(saved)
          setAddress(value.endpoint)
          setToken(value.token)
          setSettingsOpen(false)
        } catch {
          /* Settings stay open. */
        }
      })
  }, [])
  const errorLabel =
    state.error === "invalid_endpoint"
      ? x.invalidEndpoint
      : state.error === "unauthorized" ||
          state.error === "origin_denied" ||
          state.error === "host_denied"
        ? x.noPermission
        : state.error === "history_cursor_expired"
          ? x.staleHistory
          : state.error
            ? `${x.errors} · ${state.error}`
            : localError
  const navigation = (
    <div className={styles.navigator}>
      <SessionNavigator
        projects={state.projects.map((p) => ({
          ...p,
          repositoryId: p.projectId,
        }))}
        sessions={state.sessions.map((s) =>
          workbenchSnapshot(
            s,
            state.projects.find((p) => p.projectId === s.projectId),
          ),
        )}
        projectId={state.projectId}
        selectedId={state.selectedId}
        onProjectChange={(id) => {
          remember()
          state.selectProject(id)
        }}
        onSelect={(id) => {
          remember()
          state.selectSession(id)
        }}
        onNew={() => void state.createSession()}
        newLabel={x.newSession}
        newDisabled={
          !state.projectId ||
          state.openingSession ||
          state.connection !== "connected" ||
          activeReceipts.some((r) => r.targetId === state.projectId)
        }
        filters="runtime"
        data={{
          state: state.listLoading
            ? "loading"
            : state.error && !state.sessions.length
              ? "error"
              : state.sessions.length
                ? "success"
                : "empty",
          onRetry: () => void state.refresh(),
        }}
        footer={
          <>
            <p className={styles.meta}>{x.local}</p>
            {state.listCursor && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void state.loadSessions()}
              >
                {x.more}
              </Button>
            )}
            <Link prefetch={false} href="/examples/agent-workbench/">
              {x.back}
            </Link>
          </>
        }
      />
    </div>
  )
  return (
    <main
      className={`${styles.root} ${referenceTokens.tokens}`}
      ref={root}
      data-pi-workspace
      data-connection={state.connection}
    >
      {settingsOpen && (
        <section className={styles.connection} aria-label={x.settings}>
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              if (await state.connect(address, token)) setSettingsOpen(false)
            }}
          >
            <Field label={x.endpoint}>
              {(props) => (
                <Input
                  {...props}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              )}
            </Field>
            <Field label={x.credential}>
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              )}
            </Field>
            <Button
              type="submit"
              disabled={!token.trim()}
              loading={state.connection === "connecting"}
            >
              {x.connect}
            </Button>
          </form>
          <p className={styles.meta}>
            {x.noService} {x.keepCredential}
          </p>
        </section>
      )}
      <div className={styles.product}>
        <AgentWorkbench
          session={session}
          layout="conversation"
          className={styles.shell}
          panelState={panels}
          onPanelStateChange={setPanels}
          navigation={navigation}
          showViewSwitch={false}
          workspace={null}
          activityBar={
            <nav className={styles.rail} aria-label={x.title}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={x.title}
                aria-pressed
                onClick={() => root.current?.querySelector("textarea")?.focus()}
              >
                <MessageSquare size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={x.settings}
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <Settings size={18} />
              </Button>
            </nav>
          }
          header={
            <div className={styles.global}>
              <strong>{x.title}</strong>
              <span>{project?.name ?? "—"}</span>
              <span className={styles.path} title={project?.directory}>
                {project?.directory}
              </span>
            </div>
          }
          toolbar={
            <div className={styles.sessionHeader}>
              {state.selectedId ? (
                <SessionHeader
                  session={session}
                  presentation="workspace"
                  actions={
                    <>
                      {summary.capabilities.copy && (
                        <Button
                          size="sm"
                          onClick={() => void state.copySession()}
                          disabled={activeReceipts.length > 0}
                          title={x.copyHint}
                        >
                          {x.copy}
                        </Button>
                      )}
                      <span className={styles.meta}>
                        {summary.source === "external" ? x.external : x.managed}
                      </span>
                    </>
                  }
                />
              ) : (
                <span>{x.choose}</span>
              )}
              <div className={styles.actions}>
                <span className={styles.meta} role="status">
                  {state.connection === "connected"
                    ? x.connected
                    : state.connection === "connecting"
                      ? x.connecting
                      : x.disconnected}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={x.refresh}
                  onClick={() => void state.refresh()}
                  disabled={!state.projectId}
                >
                  <RefreshCw size={16} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={x.settings}
                  onClick={() => setSettingsOpen((v) => !v)}
                >
                  <Settings size={16} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={x.locale}
                  onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}
                >
                  <Languages size={16} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={x.theme}
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  <SunMoon size={16} />
                </Button>
              </div>
            </div>
          }
          composer={
            state.selectedId ? (
              <div className={styles.dock}>
                {errorLabel && (
                  <p className={styles.notice} role="alert">
                    {errorLabel}
                  </p>
                )}
                {summary.status === "unknown" && (
                  <p className={styles.notice} role="alert">
                    {x.viewUnknown}
                  </p>
                )}
                {!state.models.length && (
                  <p className={styles.notice}>{x.noModels}</p>
                )}
                {summary.diagnostics.length > 0 && (
                  <p className={styles.notice}>
                    {x.historyPartial} · {summary.diagnostics.join(", ")}
                  </p>
                )}
                {activeReceipts
                  .filter(
                    (r) =>
                      r.targetId !== state.selectedId || r.action !== "send",
                  )
                  .map((r) => (
                    <div
                      key={r.requestId}
                      className={styles.notice}
                      role="status"
                    >
                      {x.unknown} · {r.requestId}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void state.reconcile(r)}
                      >
                        {x.reconcile}
                      </Button>
                    </div>
                  ))}
                {summary.source === "managed" && (
                  <AgentComposer
                    session={session}
                    draft={draft}
                    onChange={(next) => {
                      if (next.text.length > 32768) setLocalError(x.draftLimit)
                      else {
                        setLocalError(undefined)
                        state.updateDraft(state.selectedId, next)
                      }
                    }}
                    receipts={state.receipts}
                    models={state.models}
                    permissions={[{ id: "read-only", label: x.readonly }]}
                    environments={[
                      {
                        id: state.projectId,
                        label: project?.name ?? state.projectId,
                      },
                    ]}
                    modes={["send"]}
                    editableOffline
                    onSubmit={state.send}
                    onInterrupt={state.interrupt}
                    onReconcile={(r) => {
                      const source = state.receipts.find(
                        (p) => p.requestId === r.requestId,
                      )
                      if (source) void state.reconcile(source)
                    }}
                  />
                )}
              </div>
            ) : (
              <div className={styles.notice}>
                <DataRegion
                  state={errorLabel ? "error" : "empty"}
                  emptyTitle={x.choose}
                  emptyDescription={x.noService}
                  error={
                    errorLabel
                      ? {
                          category: "network",
                          message: errorLabel,
                          reason: errorLabel,
                        }
                      : undefined
                  }
                  onRetry={() => setSettingsOpen(true)}
                />
              </div>
            )
          }
          conversation={{
            presentation: "workspace",
            groupTools: true,
            deferOffscreen: true,
            actionsRef: conversation,
            onLoadHistory: () => void state.loadHistory(),
            onRetry: () => void state.refresh(),
          }}
        />
      </div>
    </main>
  )
}
