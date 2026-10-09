"use client"
import Link from "next/link"
import { Info } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useCallback, useRef, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import {
  AgentWorkbench,
  SessionNavigator,
  ProjectSwitcher,
  SessionHeader,
  AgentConversation,
  AgentComposer,
  ContextPanel,
  ContextPicker,
  ChangeReviewPanel,
  ExecutionOutputPanel,
  PreviewPanel,
  MessageContent,
  WorkbenchPanelTabs,
  TaskInbox,
  type WorkbenchPanelDescriptor,
} from "@/components/blocks/agent-workbench"
import { AgentRunInspector } from "@/components/blocks/agent-run-inspector"
import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"
import { ArtifactList } from "@/components/blocks/artifact-list"
import type { ConversationActions } from "@/components/blocks/chat-message"
import { ExecutionTraceTree } from "@/components/blocks/execution-trace-tree"
import { ToolCall } from "@/components/blocks/tool-call"
import { CommandPalette } from "@/components/blocks/command-palette"
import { FormSection } from "@/components/blocks/form-section"
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { DataRegion } from "@/components/ui/data-region"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { runtimeStatusMeta, type RuntimeStatus } from "@/lib/runtime-status"
import { useI18n } from "@/lib/i18n-provider"
import {
  workbenchLayouts,
  workbenchTemplates,
  workbenchPages,
  workbenchPanels,
  sessionRun,
  type SessionSnapshot,
  type WorkbenchLayout,
  type WorkbenchPanelId,
  type DraftState,
  type MessagePart,
  type ContextReference,
} from "@/lib/agent-workbench-model"
import { useWorkbenchExample } from "./provider"
import {
  models,
  permissions,
  environments,
  references,
  reportBody,
} from "./fixtures"
import { exampleMessages } from "./messages"
import { RegionLab } from "./region-lab"
import {
  parseShowcaseQuery,
  showcaseHref,
  showcaseScenarios,
  commonScenarios,
  regionDefinitions,
} from "./showcase-model"
import styles from "./demo.module.css"

export function WorkbenchDemo({
  level = "overview",
}: {
  level?: "overview" | "regions" | "layouts" | "app"
}) {
  const { state, dispatch, clearPanelPreferences } = useWorkbenchExample()
  const { locale, setLocale, t, builtIn } = useI18n()
  const x = exampleMessages[locale]
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const params = useSearchParams()
  const query = parseShowcaseQuery(
    params,
    state.sessions.map((s) => s.sessionId),
    state.projects.map((p) => p.projectId),
  )
  const current =
    state.sessions.find((s) => s.sessionId === query.session) ??
    state.sessions[0]
  const [searchOpen, setSearchOpen] = useState(false)
  const [openedContext, setOpenedContext] = useState<{
    sessionId: string
    reference: ContextReference
  } | null>(null)
  const projectId = query.project || current.projectId
  const project = state.projects.find((p) => p.projectId === projectId)
  const visibleProjects = query.scenario === "no-projects" ? [] : state.projects
  const readOnly = Boolean(project?.readOnly || query.scenario === "readonly")
  const [narrow, setNarrow] = useState(false)
  const [mode, setMode] = useState<"unified" | "split">("unified")
  const [attentionDrafts, setAttentionDrafts] = useState<
    Record<string, string>
  >({})
  const [kind, setKind] = useState("")
  const [sort, setSort] = useState("updated")
  const [projectStatus, setProjectStatus] = useState("all")
  const [selectedArtifacts, setSelectedArtifacts] = useState<
    Record<string, string>
  >({})
  const [outputPreview, setOutputPreview] = useState("report")
  const [locatedTool, setLocatedTool] = useState("")
  const toolTargets = useRef<Record<string, HTMLDivElement | null>>({})
  const conversationActions = useRef<ConversationActions | null>(null)
  const pendingMessage = useRef<{
    sessionId: string
    messageId: string
  } | null>(null)
  const created = useRef<string>(
    state.receipts.findLast(
      (r) => r.targetId === "new" && r.state === "confirmed",
    )?.requestId ?? "",
  )
  const composerRef = useRef<HTMLDivElement>(null)
  const activePanel = (params.get("panel") ||
    state.panels.activePanel) as WorkbenchPanelId
  const navigationSnapshot = useRef<URLSearchParams | null>(null)
  const parameterKey = params.toString()
  useEffect(() => {
    navigationSnapshot.current = new URLSearchParams(parameterKey)
  }, [parameterKey])
  const navigate = useCallback(
    (patch: Record<string, string>, replace = false) => {
      const next = new URLSearchParams(
        [...(navigationSnapshot.current ?? params)].filter(([key]) =>
          [
            "region",
            "layout",
            "template",
            "page",
            "session",
            "panel",
            "scenario",
            "project",
          ].includes(key),
        ),
      )
      for (const [key, value] of Object.entries(patch)) next.set(key, value)
      navigationSnapshot.current = next
      const url = `?${next}`
      if (replace) router.replace(url, { scroll: false })
      else router.push(url, { scroll: false })
    },
    [params, router],
  )
  const openReference = useCallback(
    (part: MessagePart) => {
      if (part.kind === "artifact")
        setSelectedArtifacts((before) => ({
          ...before,
          [current.sessionId]: part.referenceId,
        }))
      navigate({
        layout: "review",
        panel:
          part.kind === "artifact"
            ? "artifacts"
            : part.kind === "plan"
              ? "plan"
              : "files",
      })
    },
    [navigate, current.sessionId, setSelectedArtifacts],
  )
  const createTask = useCallback(() => {
    dispatch({
      type: "begin",
      id: "new",
      action: "create",
      template: query.template,
      projectId: navigationSnapshot.current?.get("project") || projectId,
    })
  }, [dispatch, query.template, projectId])
  const locateMessage = useCallback(
    (sessionId: string, messageId: string) => {
      pendingMessage.current = { sessionId, messageId }
      navigate({
        page: "session",
        layout: "conversation",
        panel: "context",
        ...(level === "regions" ? { region: "conversation" } : {}),
      })
    },
    [navigate, level],
  )
  const retryRead = useCallback(() => {
    dispatch({
      type: "session",
      id: current.sessionId,
      patch: { dataState: "success", error: undefined },
    })
    navigate({ scenario: "default" })
  }, [dispatch, current.sessionId, navigate])
  function openAppPage(page: string) {
    if (level === "app") navigate({ page })
    else
      router.push(
        showcaseHref("app", {
          template: query.template,
          page,
          session: current.sessionId,
          project: projectId,
          scenario: query.scenario,
        }),
        { scroll: false },
      )
  }
  function openSession(id: string, page = "session") {
    const owner =
      state.sessions.find((s) => s.sessionId === id)?.projectId ?? projectId
    navigate({
      session: id,
      project: owner,
      page,
      ...(page === "session" ? { layout: "conversation" } : {}),
    })
  }
  useEffect(() => {
    const receipt = state.receipts.findLast(
      (r) => r.targetId === "new" && r.state === "confirmed",
    )
    if (!receipt) {
      created.current = ""
      return
    }
    if (created.current !== receipt.requestId) {
      const id = `session-created-${receipt.requestId}`
      created.current = receipt.requestId
      if (
        level !== "app" ||
        !["home", "new"].includes(
          navigationSnapshot.current?.get("page") || query.page,
        )
      )
        return
      const next = new URLSearchParams(
        [...params].filter(([key]) =>
          [
            "region",
            "layout",
            "template",
            "page",
            "session",
            "panel",
            "scenario",
            "project",
          ].includes(key),
        ),
      )
      next.set("session", id)
      const owner = state.sessions.find((s) => s.sessionId === id)?.projectId
      if (owner) next.set("project", owner)
      next.set("page", "session")
      router.push(`?${next}`, { scroll: false })
    }
  }, [state.receipts, state.sessions, params, router, level, query.page])
  const queryErrorKey = query.errors.join(",")
  useEffect(() => {
    if (
      !queryErrorKey &&
      ![
        "default",
        "loading",
        "empty",
        "partial",
        "error",
        "disconnected",
        "limited",
      ].includes(query.scenario)
    )
      dispatch({
        type: "scenario",
        id: current.sessionId,
        scenario: query.scenario,
      })
  }, [dispatch, current.sessionId, query.scenario, queryErrorKey])
  useEffect(() => {
    const target = pendingMessage.current
    if (
      target?.sessionId === current.sessionId &&
      (query.page === "session" ||
        (level === "regions" && query.region === "conversation")) &&
      conversationActions.current?.scrollToMessage(target.messageId, {
        focus: true,
      })
    )
      pendingMessage.current = null
  }, [
    current.sessionId,
    query.page,
    query.layout,
    query.region,
    level,
    activePanel,
  ])
  useEffect(() => {
    if (!locatedTool || activePanel !== "activity") return
    const frame = requestAnimationFrame(() => {
      const target = toolTargets.current[locatedTool]
      target?.scrollIntoView({ block: "nearest" })
      target?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [locatedTool, activePanel, query.region])
  const session: SessionSnapshot = {
    ...current,
    dataState: ["loading", "empty", "partial", "error"].includes(query.scenario)
      ? (query.scenario as SessionSnapshot["dataState"])
      : current.dataState,
    error: query.scenario === "error" ? x.readError : current.error,
    messages: ["empty", "loading"].includes(query.scenario)
      ? []
      : current.messages,
    environment:
      query.scenario === "disconnected"
        ? { ...current.environment, connection: "disconnected" }
        : current.environment,
    capabilities:
      query.scenario === "limited" ||
      readOnly ||
      !state.drafts[current.sessionId].modelId ||
      !state.drafts[current.sessionId].environmentId
        ? { send: false, queue: false, steer: false, interrupt: false }
        : { ...current.capabilities, contextLimit: 1200 },
  }
  const draft = state.drafts[current.sessionId]
  const setDraft = (draft: DraftState) =>
    dispatch({ type: "draft", id: current.sessionId, draft })
  const onPanels = (panels: typeof state.panels) => {
    dispatch({ type: "panels", panels })
    if (panels.activePanel !== activePanel)
      navigate({ panel: panels.activePanel })
  }
  const pick = (reference: (typeof references)[number]) => {
    if (!draft.context.some((r) => r.id === reference.id))
      setDraft({
        ...draft,
        context: [...draft.context, structuredClone(reference)],
        version: draft.version + 1,
      })
  }
  const contextPanel = (
    <>
      <div className={styles.top}>
        <ContextPicker
          references={references.filter(
            (r) => !draft.context.some((c) => c.id === r.id),
          )}
          onPick={pick}
        />
      </div>
      <ContextPanel
        references={
          ["empty", "loading"].includes(query.scenario)
            ? []
            : [
                ...new Map(
                  [
                    ...session.contextSources.map((r) => ({
                      ...r,
                      included: false,
                      removable: false,
                    })),
                    ...draft.context,
                  ].map((r) => [r.id, r]),
                ).values(),
              ]
        }
        data={{
          ...(session.dataState === "success"
            ? {}
            : { state: session.dataState }),
          onRetry: retryRead,
          error: session.error
            ? {
                category: "network",
                message: session.error,
                reason: x.readError,
              }
            : undefined,
        }}
        onRemove={(id) =>
          setDraft({
            ...draft,
            context: draft.context.filter((r) => r.id !== id),
            version: draft.version + 1,
          })
        }
        onInclude={(id, included) => {
          const source = session.contextSources.find((r) => r.id === id)
          setDraft({
            ...draft,
            context: draft.context.some((r) => r.id === id)
              ? draft.context.map((r) => (r.id === id ? { ...r, included } : r))
              : source
                ? [...draft.context, { ...source, included, removable: true }]
                : draft.context,
            version: draft.version + 1,
          })
        }}
        onRetry={(id) => {
          const receipt = state.receipts.findLast(
            (r) =>
              r.targetId === `${session.sessionId}:${id}` &&
              r.state === "unknown",
          )
          if (receipt)
            dispatch({
              type: "settle",
              requestId: receipt.requestId,
              state: "confirmed",
            })
          else
            dispatch({
              type: "retry-context",
              id: session.sessionId,
              referenceId: id,
            })
        }}
        onOpen={(reference) =>
          setOpenedContext({ sessionId: session.sessionId, reference })
        }
        limit={1200}
      />
    </>
  )
  const relatedFile = session.changes.files.find(
    (f) =>
      openedContext &&
      (f.path === openedContext.reference.source ||
        f.path === openedContext.reference.label ||
        openedContext.reference.source?.startsWith(`${f.path}:`)),
  )
  const sourceSheet = (
    <Sheet
      open={openedContext?.sessionId === session.sessionId}
      onOpenChange={(open) => {
        if (!open) setOpenedContext(null)
      }}
    >
      <SheetContent side="right">
        <SheetTitle>{x.contextSource}</SheetTitle>
        {openedContext && (
          <div className={styles.section}>
            <p className={styles.meta}>{openedContext.reference.label}</p>
            <dl>
              <dt>{x.sourcePath}</dt>
              <dd className={styles.meta}>
                {openedContext.reference.source ?? "—"}
              </dd>
              <dt>{x.sourceVersion}</dt>
              <dd>{openedContext.reference.version ?? "—"}</dd>
              <dt>{x.sourceAvailability}</dt>
              <dd>{t(`workbench.${openedContext.reference.availability}`)}</dd>
              {openedContext.reference.range && (
                <>
                  <dt>{x.sourceRange}</dt>
                  <dd>
                    {openedContext.reference.range.start}–
                    {openedContext.reference.range.end}
                  </dd>
                </>
              )}
            </dl>
            <p>{x.sourceBodyUnavailable}</p>
            {relatedFile && (
              <Button
                variant="secondary"
                disabled={openedContext.reference.availability !== "available"}
                onClick={() => {
                  setOpenedContext(null)
                  dispatch({
                    type: "panels",
                    panels: {
                      ...state.panels,
                      selectedFileId: relatedFile.fileId,
                      activePanel: "changes",
                    },
                  })
                  navigate({
                    panel: "changes",
                    ...(level === "regions" ? { region: "files" } : {}),
                  })
                }}
              >
                {x.relatedChanges}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
  function environmentDetails(iconOnly = false) {
    const detailsSession =
      level === "app" && !["session", "review"].includes(query.page)
        ? state.sessions.find((s) => s.projectId === projectId)
        : session
    const environment = detailsSession?.environment
    return (
      <Sheet>
        <SheetTrigger
          render={
            <Button
              size={iconOnly ? "icon" : "sm"}
              variant="ghost"
              aria-label={x.environmentDetails}
            />
          }
        >
          {iconOnly ? (
            <Info size={16} aria-hidden="true" />
          ) : (
            x.environmentDetails
          )}
        </SheetTrigger>
        <SheetContent side="right">
          <SheetTitle>{x.environmentDetails}</SheetTitle>
          <dl className={styles.section}>
            <dt>{t("workbench.project")}</dt>
            <dd>{project?.name ?? x.noProjects}</dd>
            <dt>{t("workbench.environment")}</dt>
            <dd>
              {environment?.name || x.noEnvironment} ·{" "}
              {environment?.connection ?? "unknown"}
            </dd>
            <dt>{x.branch}</dt>
            <dd>{environment?.branch ?? "—"}</dd>
            <dt>{x.capabilities}</dt>
            <dd>{environment?.capabilities.join(", ") || x.noService}</dd>
          </dl>
          <p className={styles.meta}>{x.noService}</p>
        </SheetContent>
      </Sheet>
    )
  }
  function preview() {
    const available =
      query.scenario !== "preview-unavailable" &&
      session.artifacts.some(
        (a) =>
          a.availability === "available" &&
          ["summary.md", "analysis-report.md", "filter-report.md"].includes(
            a.name,
          ),
      )
    return (
      <div>
        <label className={styles.label}>
          {x.previewMode}
          <select
            value={outputPreview}
            onChange={(e) => setOutputPreview(e.target.value)}
          >
            <option value="report">{x.previewSource}</option>
            <option value="browser">{t("workbench.browser")}</option>
          </select>
        </label>
        <PreviewPanel>
          {available && outputPreview === "report" ? (
            <MessageContent content={reportBody} />
          ) : (
            <p>{outputPreview === "browser" ? x.noService : x.noPreview}</p>
          )}
        </PreviewPanel>
      </div>
    )
  }
  const composer = (
    <div ref={composerRef} className={styles.composerMount}>
      <AgentComposer
        session={session}
        draft={draft}
        onChange={setDraft}
        models={models}
        permissions={permissions}
        environments={environments}
        receipts={state.receipts}
        onSubmit={(d) =>
          dispatch({ type: "begin", id: session.sessionId, action: d.mode })
        }
        onInterrupt={() =>
          dispatch({
            type: "begin",
            id: session.sessionId,
            action: "interrupt",
          })
        }
        onReconcile={(receipt) =>
          dispatch({
            type: "settle",
            requestId: receipt.requestId,
            state: "confirmed",
          })
        }
        onFiles={(files) =>
          setDraft({
            ...draft,
            version: draft.version + 1,
            context: [
              ...draft.context,
              ...files.map((file, i) => ({
                id: `upload-${draft.version}-${i}`,
                kind: "file" as const,
                label: file.name,
                source: file.name,
                availability: "uploading" as const,
                included: true,
                removable: true,
                reason: t("workbench.notInjected"),
              })),
            ],
          })
        }
        attachments={
          <div className={styles.top}>
            <ContextPicker
              references={references.filter(
                (r) => !draft.context.some((c) => c.id === r.id),
              )}
              onPick={pick}
            />
            <span className={styles.meta}>
              {draft.context.length} {t("workbench.context")}
              {(state.queued[session.sessionId]?.length ?? 0) > 0 &&
                ` · ${x.queueCount}: ${state.queued[session.sessionId].length}`}
            </span>
          </div>
        }
      />
    </div>
  )
  const navigation = (
    <SessionNavigator
      projects={query.scenario === "empty" ? [] : visibleProjects}
      sessions={
        ["empty", "loading", "no-projects", "no-sessions"].includes(
          query.scenario,
        )
          ? []
          : state.sessions
      }
      projectId={projectId}
      selectedId={session.sessionId}
      onProjectChange={(id) => {
        navigate({
          page: "project",
          project: id,
          session:
            state.sessions.find((s) => s.projectId === id)?.sessionId ??
            current.sessionId,
        })
      }}
      onSelect={(id) => openSession(id)}
      onNew={() => openAppPage("new")}
      onUpdate={
        readOnly
          ? undefined
          : (id, patch) => dispatch({ type: "metadata", id, patch })
      }
      receipts={state.receipts}
      onReconcile={(receipt) =>
        dispatch({
          type: "settle",
          requestId: receipt.requestId,
          state: "confirmed",
        })
      }
      data={{
        ...(["no-sessions", "no-projects"].includes(query.scenario)
          ? { state: "empty" as const }
          : session.dataState === "success"
            ? {}
            : { state: session.dataState }),
        onRetry: retryRead,
        error: session.error
          ? { category: "network", message: session.error, reason: x.readError }
          : undefined,
      }}
      footer={
        <div className={styles.row}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openAppPage("inbox")}
          >
            {x.inbox}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openAppPage("settings")}
          >
            {x.settings}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSearchOpen(true)}>
            {t("workbench.searchSessions")}
          </Button>
          <CommandPalette
            open={searchOpen}
            onOpenChange={setSearchOpen}
            title={t("workbench.searchSessions")}
            groups={[
              {
                id: "sessions",
                label: t("workbench.recent"),
                items: state.sessions
                  .filter((s) => s.projectId === projectId)
                  .map((s) => ({
                    id: s.sessionId,
                    label: s.title,
                    description: s.status,
                  })),
              },
            ]}
            onSelect={(item) => openSession(item.id)}
            shortcut={{ key: "k", mod: true }}
          />
        </div>
      }
    />
  )
  function tools(approvalOnly = false) {
    return (
      <div className={styles.section}>
        {!approvalOnly &&
          session.tools.map((tool) => (
            <div
              key={tool.id}
              tabIndex={-1}
              data-tool-target={tool.id}
              data-located={locatedTool === tool.id}
              ref={(node) => {
                toolTargets.current[tool.id] = node
              }}
            >
              <ToolCall
                call={tool}
                onReconcile={
                  tool.outcome === "unknown"
                    ? () => dispatch({ type: "advance", id: session.sessionId })
                    : undefined
                }
              />
            </div>
          ))}
        {session.attention.map((request) => (
          <ApprovalRequestPanel
            key={request.attentionId}
            request={{
              ...request,
              tool: request.tool
                ? {
                    ...request.tool,
                    ...session.tools.find(
                      (tool) => tool.id === request.tool?.id,
                    ),
                  }
                : undefined,
            }}
            draft={attentionDrafts[request.attentionId] ?? ""}
            onDraftChange={(value) =>
              setAttentionDrafts({
                ...attentionDrafts,
                [request.attentionId]: value,
              })
            }
            canReconcile
            onAction={
              readOnly || query.scenario === "limited"
                ? undefined
                : async (action) => {
                    if (action === "reconcile") {
                      const receipt = state.receipts.findLast(
                        (r) => r.targetId === request.attentionId,
                      )
                      if (receipt)
                        dispatch({
                          type: "settle",
                          requestId: receipt.requestId,
                          state: "confirmed",
                        })
                    } else
                      dispatch({
                        type: "begin",
                        id: session.sessionId,
                        attentionId: request.attentionId,
                        action,
                        response: attentionDrafts[request.attentionId],
                      })
                  }
            }
          />
        ))}
      </div>
    )
  }
  function review(fileOnly = false) {
    return (
      <ChangeReviewPanel
        scopeId={session.sessionId}
        changes={
          query.scenario === "empty"
            ? { ...session.changes, files: [] }
            : session.changes
        }
        selectedFileId={state.panels.selectedFileId}
        onSelectFile={(id) =>
          dispatch({
            type: "panels",
            panels: { ...state.panels, selectedFileId: id },
          })
        }
        comments={state.comments[session.sessionId] ?? []}
        onCommentsChange={(comments) =>
          dispatch({ type: "comments", id: session.sessionId, comments })
        }
        onFeedback={(text) => {
          setDraft({
            ...draft,
            text: draft.text ? `${draft.text}\n\n${text}` : text,
            version: draft.version + 1,
          })
          navigate({ page: "session", layout: "conversation" })
        }}
        mode={mode}
        onModeChange={setMode}
        fileOnly={fileOnly}
      />
    )
  }
  function artifacts() {
    if (level === "app" && session.projectId !== projectId) {
      const owned = state.sessions.filter((s) => s.projectId === projectId)
      return (
        <section className={styles.section}>
          <h1 className={styles.title}>{x.artifacts}</h1>
          <p>{owned.length ? x.chooseProjectSession : x.noTasks}</p>
          {owned.map((s) => (
            <Item
              key={s.sessionId}
              title={s.title}
              description={s.artifacts.map((a) => a.name).join(", ") || "—"}
              onSelect={() => openSession(s.sessionId, "artifacts")}
            />
          ))}
        </section>
      )
    }
    const records = query.scenario === "empty" ? [] : session.artifacts
    const selected =
      records.find(
        (a) => a.artifactId === selectedArtifacts[session.sessionId],
      ) ?? records[0]
    const body =
      selected?.availability === "available" &&
      ["summary.md", "analysis-report.md", "filter-report.md"].includes(
        selected.name,
      )
        ? reportBody
        : undefined
    const source = session.messages.find((m) =>
      m.parts.some(
        (part) =>
          part.kind === "artifact" && part.referenceId === selected?.artifactId,
      ),
    )
    return (
      <div className={styles.section}>
        {records.length > 1 && (
          <label className={styles.label}>
            {x.artifactSelection}
            <select
              value={selected?.artifactId ?? ""}
              onChange={(e) =>
                setSelectedArtifacts((before) => ({
                  ...before,
                  [session.sessionId]: e.target.value,
                }))
              }
            >
              {records.map((a) => (
                <option key={a.artifactId} value={a.artifactId}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <ArtifactList records={records} />
        {selected && (
          <>
            <PreviewPanel>
              <h3>{x.previewSource}</h3>
              {body !== undefined ? (
                <MessageContent content={body} />
              ) : (
                <p>
                  {selected.availability === "available"
                    ? x.unsupportedArtifact
                    : `${x.noPreview} · ${t(`agentBoard.${selected.availability}`)}`}
                </p>
              )}
            </PreviewPanel>
            <div className={styles.row}>
              <Button
                size="sm"
                variant="secondary"
                disabled={!source}
                onClick={() => {
                  if (source) locateMessage(session.sessionId, source.messageId)
                }}
              >
                {x.sourceLink}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  navigate({
                    page: "review",
                    layout: "review",
                    panel: "changes",
                    ...(level === "regions" ? { region: "files" } : {}),
                  })
                }
              >
                {x.reviewFiles}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setDraft({
                    ...draft,
                    text: draft.text
                      ? `${draft.text}\n\n${x.reportComment}`
                      : x.reportComment,
                    version: draft.version + 1,
                  })
                  navigate({ page: "session", layout: "conversation" })
                }}
              >
                {x.feedback}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={body === undefined}
                onClick={async () => {
                  if (body !== undefined)
                    await navigator.clipboard.writeText(body).catch(() => {})
                }}
              >
                {t("workbench.copy")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={body === undefined}
                onClick={() => {
                  if (body === undefined) return
                  const url = URL.createObjectURL(
                    new Blob([body], { type: "text/markdown" }),
                  )
                  const a = document.createElement("a")
                  a.href = url
                  a.download = selected.name
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                {x.download}
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }
  function plan() {
    return (
      <section className={styles.section}>
        {!session.plan.length && <p>{x.noPlan}</p>}
        {session.plan.map((step) => (
          <Item
            key={step.id}
            title={step.title}
            description={<RuntimeStatusBadge status={step.status} />}
            onSelect={() => {
              if (!step.toolId) return
              setLocatedTool(step.toolId)
              navigate({
                panel: "activity",
                ...(level === "regions" ? { region: "tools" } : {}),
              })
            }}
          />
        ))}
        <ExecutionTraceTree
          steps={session.plan.map((step) => ({
            stepId: step.id,
            name: step.title,
            status: step.status,
            tool: session.tools.find((tool) => tool.id === step.toolId),
          }))}
        />
      </section>
    )
  }
  function settings() {
    return (
      <section className={styles.section}>
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
        {preferences()}
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
  function preferences() {
    return (
      <div className={styles.row}>
        <label className={styles.label}>
          {x.theme}
          <select
            value={theme === "dark" ? "dark" : "light"}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">{x.light}</option>
            <option value="dark">{x.dark}</option>
          </select>
        </label>
        <label className={styles.label}>
          {x.locale}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "zh-CN" | "en")}
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearPanelPreferences()
            setTheme("light")
            setLocale("zh-CN")
          }}
        >
          {x.clearPrefs}
        </Button>
      </div>
    )
  }
  const panelDescriptors: WorkbenchPanelDescriptor[] = workbenchPanels.map(
    (id) => ({
      id,
      label: t(`workbench.${id}`),
      available: !["git", "pr", "notes", "browser", "editor"].includes(id),
      reason: `${t("workbench.noCapability")} · ${id}`,
      badge: id === "artifacts" ? session.artifacts.length : undefined,
      render: () =>
        id === "context" ? (
          contextPanel
        ) : id === "files" ? (
          review(true)
        ) : id === "changes" ? (
          review()
        ) : id === "artifacts" ? (
          artifacts()
        ) : id === "plan" ? (
          plan()
        ) : id === "activity" ? (
          tools()
        ) : id === "terminal" ? (
          <ExecutionOutputPanel
            {...session.output}
            connected={session.environment.connection === "connected"}
            onReconnect={() => navigate({ scenario: "default" })}
          />
        ) : (
          preview()
        ),
    }),
  )
  const workspace = (
    <WorkbenchPanelTabs
      panels={panelDescriptors}
      value={activePanel}
      onChange={(id) => {
        dispatch({
          type: "panels",
          panels: { ...state.panels, activePanel: id },
        })
        navigate({ panel: id })
      }}
    />
  )
  function inbox() {
    const scoped = ["empty", "no-attention"].includes(query.scenario)
      ? []
      : state.sessions.filter((s) => s.projectId === projectId)
    const filtered = scoped.filter(
      (s) =>
        !kind ||
        (kind === "review"
          ? s.artifacts.some((a) => a.review?.state === "unreviewed")
          : s.attention.some((a) => a.kind === kind)),
    )
    const sorted = [...filtered].sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") ||
          a.sessionId.localeCompare(b.sessionId),
    )
    return (
      <>
        <div className={styles.top}>
          <label className={styles.label}>
            {x.filter}
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {["", "approval", "input", "failure", "review"].map((k) => (
                <option key={k} value={k}>
                  {k
                    ? x[k as "approval" | "input" | "failure" | "review"]
                    : x.all}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            {x.sort}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="updated">{x.sortUpdated}</option>
              <option value="title">{x.sortTitle}</option>
            </select>
          </label>
          <Link href="/workspace/agents/">{x.agentBoard}</Link>
        </div>
        <div className={styles.inboxFrame}>
          <div className={styles.inboxGrid}>
            <TaskInbox
              runs={sorted.map(sessionRun)}
              attention={scoped
                .flatMap((s) => s.attention)
                .filter((a) => !kind || a.kind === kind)}
              selectedRunId={
                sorted.some((s) => s.activeRunId === session.activeRunId)
                  ? session.activeRunId
                  : undefined
              }
              onSelect={(runId) => {
                const s = scoped.find((s) => s.activeRunId === runId)
                if (s) navigate({ session: s.sessionId })
              }}
              onEnter={(runId) => {
                const s = scoped.find((s) => s.activeRunId === runId)
                if (s) openSession(s.sessionId)
              }}
            />
            {sorted.some((s) => s.sessionId === current.sessionId) && (
              <aside aria-label={x.taskDetails}>
                <AgentRunInspector
                  snapshot={{
                    run: sessionRun(current),
                    attention: current.attention,
                    artifacts: current.artifacts,
                    steps: current.plan.map((p) => ({
                      stepId: p.id,
                      name: p.title,
                      status: p.status,
                      tool: current.tools.find((t) => t.id === p.toolId),
                    })),
                    relationships: [],
                    events: [],
                  }}
                />
              </aside>
            )}
          </div>
        </div>
      </>
    )
  }
  function projectView() {
    const owned =
      query.scenario === "no-sessions"
        ? []
        : state.sessions.filter((s) => s.projectId === projectId)
    const environment = owned[0]?.environment
    return (
      <section className={styles.section}>
        <h1 className={styles.title}>{project?.name ?? x.noProjects}</h1>
        <p className={styles.meta}>
          {project?.directory ?? "—"} · {environment?.branch ?? "—"} ·{" "}
          {environment?.name ?? x.noEnvironment}
        </p>
        {environmentDetails()}
        {readOnly && <p>{x.readOnly}</p>}
        <label className={styles.label}>
          {x.runtimeFilter}
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
          >
            {[
              "all",
              "running",
              "waiting",
              "failed",
              "completed",
              "cancelled",
            ].map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? x.all
                  : builtIn(runtimeStatusMeta[status as RuntimeStatus].label)}
              </option>
            ))}
          </select>
        </label>
        {owned
          .filter((s) => projectStatus === "all" || s.status === projectStatus)
          .map((s) => (
            <Item
              key={s.sessionId}
              title={s.title}
              description={<RuntimeStatusBadge status={s.status} />}
              onSelect={() => openSession(s.sessionId)}
            />
          ))}
        {!owned.filter(
          (s) => projectStatus === "all" || s.status === projectStatus,
        ).length && <p>{owned.length ? x.noMatchingTasks : x.noTasks}</p>}
        <Button
          disabled={readOnly || !visibleProjects.length}
          onClick={() => navigate({ page: "new" })}
        >
          {x.new}
        </Button>
        <h2>{x.artifacts}</h2>
        {owned
          .filter((s) => s.artifacts.length)
          .map((s) => (
            <Item
              key={s.sessionId}
              title={s.artifacts.map((a) => a.name).join(", ")}
              description={s.title}
              onSelect={() => openSession(s.sessionId, "artifacts")}
            />
          ))}
      </section>
    )
  }
  function home() {
    const newDraft = state.drafts.new
    const unavailable =
      readOnly ||
      !visibleProjects.length ||
      !newDraft.environmentId ||
      !newDraft.modelId ||
      query.scenario === "no-environment" ||
      query.scenario === "invalid-config"
    const newSession = {
      ...session,
      projectId,
      status: "completed",
      environment: {
        ...session.environment,
        connection: unavailable ? ("unknown" as const) : ("connected" as const),
      },
      capabilities: { ...session.capabilities, send: !unavailable },
    }
    return (
      <section className={styles.section}>
        <h1 className={styles.title}>{x.overview}</h1>
        <p className={styles.meta}>
          {x.local} · {x.createPending}
        </p>
        <ProjectSwitcher
          projects={visibleProjects}
          value={projectId}
          onChange={(project) => navigate({ project })}
        />
        {unavailable && (
          <p role="status">
            {!visibleProjects.length
              ? x.noProjects
              : readOnly
                ? x.readOnly
                : x.invalidConfig}
          </p>
        )}
        {readOnly ? (
          <p>{x.readOnly}</p>
        ) : (
          <div className={styles.homeComposer}>
            <AgentComposer
              session={newSession}
              draft={newDraft}
              onChange={(draft) =>
                dispatch({ type: "draft", id: "new", draft })
              }
              models={models}
              permissions={permissions}
              environments={environments}
              receipts={state.receipts.map((r) =>
                r.targetId === "new"
                  ? { ...r, targetId: session.sessionId }
                  : r,
              )}
              onSubmit={createTask}
              onReconcile={(r) =>
                dispatch({
                  type: "settle",
                  requestId: r.requestId,
                  state: "confirmed",
                })
              }
            />
          </div>
        )}
        <h2 className="text-sm font-medium mt-6 mb-2">
          {t("workbench.recent")}
        </h2>
        {state.sessions
          .filter((s) => s.projectId === projectId && !s.archived)
          .map((s) => (
            <Item
              key={s.sessionId}
              title={s.title}
              description={<RuntimeStatusBadge status={s.status} />}
              onSelect={() => openSession(s.sessionId)}
            />
          ))}
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => openAppPage("inbox")}
        >
          {x.waiting}
        </Button>
      </section>
    )
  }
  function sourceControls() {
    return (
      <div className={styles.controls}>
        <p className={styles.meta}>{x.sourceOnly}</p>
        <div className={styles.row}>
          <Link
            href={showcaseHref("regions", {
              region: "sidebar",
              session: session.sessionId,
              scenario: query.scenario,
              project: projectId,
            })}
          >
            {x.regions}
          </Link>
          <Link
            href={showcaseHref("layouts", {
              layout: "conversation",
              session: session.sessionId,
              scenario: query.scenario,
              project: projectId,
            })}
          >
            {x.layouts}
          </Link>
        </div>
        {preferences()}
        <label className={styles.label}>
          {x.scenario}
          <select
            value={query.scenario}
            onChange={(e) => {
              const scenario = e.target.value
              navigate({ scenario })
            }}
          >
            {showcaseScenarios
              .filter(
                (s) =>
                  level !== "regions" ||
                  commonScenarios.includes(s.id) ||
                  (
                    regionDefinitions.find((r) => r.id === query.region)
                      ?.cases as readonly string[] | undefined
                  )?.includes(s.id) ||
                  s.id === query.scenario,
              )
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label[locale]}
                </option>
              ))}
          </select>
        </label>
        <label className={styles.row}>
          <input
            type="checkbox"
            checked={narrow}
            onChange={(e) => setNarrow(e.target.checked)}
          />
          {x.narrow}
        </label>
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "advance", id: session.sessionId })}
        >
          {x.advance}
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "revision", id: session.sessionId })}
        >
          {x.revision}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const message = session.messages[0]
            if (message)
              dispatch({
                type: "event",
                id: session.sessionId,
                cursor: 0,
                message: {
                  ...message,
                  revision: 999,
                  parts: [
                    {
                      partId: "late",
                      sequence: 1,
                      revision: 1,
                      kind: "text",
                      text: "STALE RESPONSE MUST NOT APPEAR",
                    },
                  ],
                },
              })
          }}
        >
          {x.staleEvent}
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "long", id: session.sessionId })}
        >
          {x.longHistory}
        </Button>
        {draft.context.some((r) => r.availability === "uploading") && (
          <Button
            variant="secondary"
            onClick={() =>
              setDraft({
                ...draft,
                version: draft.version + 1,
                context: draft.context.map((r) =>
                  r.availability === "uploading"
                    ? { ...r, availability: "available", reason: undefined }
                    : r,
                ),
              })
            }
          >
            {x.uploadReady}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            dispatch({ type: "reset" })
            navigate(
              {
                session: "session-filter",
                project: "project-demo",
                scenario: "default",
                page: "home",
              },
              true,
            )
          }}
        >
          {x.reset}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            const previous = current.messages.find(
              (m) => m.messageId === `stream-${current.sessionId}`,
            )
            dispatch({
              type: "event",
              id: current.sessionId,
              cursor: current.cursor + 1,
              message: {
                messageId: `stream-${current.sessionId}`,
                turnId: `stream-turn-${current.sessionId}`,
                role: "agent",
                sequence: 100,
                revision: (previous?.revision ?? 0) + 1,
                state: "streaming",
                parts: [
                  {
                    partId: `stream-part-${current.sessionId}`,
                    sequence: 1,
                    revision: (previous?.revision ?? 0) + 1,
                    kind: "text",
                    text: `Streaming source update ${(previous?.revision ?? 0) + 1}`,
                  },
                ],
              },
            })
          }}
        >
          {x.appendEvent}
        </Button>
        <h3>{x.receipts}</h3>
        {state.receipts.map((r) => (
          <section
            key={r.requestId}
            className={styles.receipt}
            data-state={r.state}
            data-request-id={r.requestId}
          >
            <p>
              {r.requestId} · {r.targetId} · {r.action}
            </p>
            <p role="status">{t(`workbench.${r.state}`)}</p>
            {(r.state === "pending" || r.state === "unknown") && (
              <div className={styles.row}>
                <Button
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: "settle",
                      requestId: r.requestId,
                      state: "confirmed",
                    })
                  }
                >
                  {x.confirm}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    dispatch({
                      type: "settle",
                      requestId: r.requestId,
                      state: "failed",
                    })
                  }
                >
                  {x.fail}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    dispatch({
                      type: "settle",
                      requestId: r.requestId,
                      state: "unknown",
                    })
                  }
                >
                  {r.state === "unknown" ? x.stillUnknown : x.lose}
                </Button>
              </div>
            )}
            {r.receipt && <p className={styles.meta}>{r.receipt}</p>}
          </section>
        ))}
      </div>
    )
  }
  const controls = (
    <Sheet>
      <SheetTrigger render={<Button size="sm" variant="secondary" />}>
        {x.exampleSettings}
      </SheetTrigger>
      <SheetContent side="right">
        <SheetTitle>{x.sourceControls}</SheetTitle>
        {sourceControls()}
      </SheetContent>
    </Sheet>
  )
  const links = (
    <>
      <Link href="/examples/agent-workbench/">{x.overview}</Link>
      <Link
        href={showcaseHref("regions", {
          region: query.region,
          session: session.sessionId,
          scenario: query.scenario,
          project: projectId,
        })}
      >
        {x.regions}
      </Link>
      <Link
        href={showcaseHref("layouts", {
          layout: "conversation",
          session: session.sessionId,
          scenario: query.scenario,
          project: projectId,
        })}
      >
        {x.layouts}
      </Link>
      <Link
        href={showcaseHref("app", {
          template: query.template,
          page: "home",
          session: session.sessionId,
          scenario: query.scenario,
          project: projectId,
        })}
      >
        {x.app}
      </Link>
    </>
  )
  const pageNav = (
    <nav className={styles.pageNav} aria-label={x.app}>
      {workbenchPages.map((page) => (
        <Button
          key={page}
          variant="ghost"
          size="sm"
          aria-current={query.page === page ? "page" : undefined}
          onClick={() =>
            navigate({
              page,
              ...(page === "review"
                ? { layout: "review", panel: "changes" }
                : {}),
            })
          }
        >
          {x[page]}
        </Button>
      ))}
    </nav>
  )
  if (query.errors.length)
    return (
      <main className={styles.section}>
        <h1 className={styles.title}>{x.notFound}</h1>
        <p>{query.errors.join(", ")}</p>
        <Button
          onClick={() =>
            router.replace(
              `/examples/agent-workbench/${level === "overview" ? "" : `${level}/`}`,
              { scroll: false },
            )
          }
        >
          {x.recover}
        </Button>
      </main>
    )
  if (level === "overview")
    return (
      <main className={styles.section}>
        <h1 className={styles.title}>{x.overview}</h1>
        <p>{x.contractBody}</p>
        <p className={styles.meta}>{x.noService}</p>
        <p>{x.showcaseStatus}</p>
        <Link href="/blog/agent-workbench-showcase/">{x.verification}</Link>
        <div className={styles.overview}>
          <Link href="/examples/agent-workbench/regions/?region=sidebar">
            <strong>{x.regions}</strong>
            <span>R1–R10</span>
          </Link>
          <Link href="/examples/agent-workbench/layouts/?layout=conversation">
            <strong>{x.layouts}</strong>
            <span>L1–L3</span>
          </Link>
          {workbenchTemplates.map((template) => (
            <Link
              key={template}
              href={`/examples/agent-workbench/app/?template=${template}&page=${template === "console" ? "inbox" : "home"}`}
            >
              <strong>
                {template === "coding"
                  ? x.coding
                  : template === "artifacts"
                    ? x.artifactTemplate
                    : x.console}
              </strong>
              <span>{x.local}</span>
            </Link>
          ))}
        </div>
      </main>
    )
  const regionViews: Record<string, ReactNode> = {
    sidebar: (
      <div style={{ width: 256, maxWidth: "100%" }}>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={!state.panels.sidebarCollapsed}
          onClick={() =>
            onPanels({
              ...state.panels,
              sidebarCollapsed: !state.panels.sidebarCollapsed,
            })
          }
        >
          {state.panels.sidebarCollapsed ? x.expandSidebar : x.collapseSidebar}
        </Button>
        <div hidden={state.panels.sidebarCollapsed}>{navigation}</div>
      </div>
    ),
    context: contextPanel,
    conversation: (
      <AgentConversation
        session={session}
        actionsRef={conversationActions}
        onLoadHistory={() =>
          dispatch({ type: "history", id: session.sessionId })
        }
        deferOffscreen
        onRetry={retryRead}
        onOpenReference={() => navigate({ panel: "artifacts" })}
      />
    ),
    composer,
    header: (
      <div className={styles.section}>
        {readOnly && <p>{x.readOnly}</p>}
        <SessionHeader
          session={session}
          onRename={
            readOnly
              ? undefined
              : (title) =>
                  dispatch({
                    type: "metadata",
                    id: session.sessionId,
                    patch: { title },
                  })
          }
          onInterrupt={() =>
            dispatch({
              type: "begin",
              id: session.sessionId,
              action: "interrupt",
            })
          }
          actions={
            <div className={styles.row}>
              {environmentDetails()}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ panel: "context" })}
              >
                {t("workbench.context")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ panel: "changes" })}
              >
                {x.reviewFiles}
              </Button>
            </div>
          }
        />
      </div>
    ),
    tools: tools(),
    files: review(),
    output: (
      <>
        <ExecutionOutputPanel
          {...session.output}
          connected={session.environment.connection === "connected"}
          onReconnect={() => {
            dispatch({
              type: "session",
              id: session.sessionId,
              patch: {
                environment: {
                  ...current.environment,
                  connection: "connected",
                },
              },
            })
            navigate({ scenario: "default" })
          }}
        />
        {preview()}
      </>
    ),
    artifacts: (
      <>
        {plan()}
        {artifacts()}
      </>
    ),
    settings: (
      <>
        {inbox()}
        {settings()}
      </>
    ),
  }
  if (level === "regions")
    return (
      <>
        <RegionLab
          region={query.region}
          scenario={query.scenario}
          narrow={narrow}
          navigation={links}
          controls={sourceControls()}
          onRegionChange={(region) => navigate({ region })}
          layoutHref={showcaseHref("layouts", {
            layout: "conversation",
            session: session.sessionId,
            scenario: query.scenario,
            project: projectId,
          })}
          preview={
            ["sidebar", "context", "conversation"].includes(query.region) ? (
              regionViews[query.region]
            ) : (
              <DataRegion
                state={session.dataState}
                hasContent={!["empty", "loading"].includes(query.scenario)}
                error={
                  session.error
                    ? {
                        category: "network",
                        message: session.error,
                        reason: x.readError,
                      }
                    : undefined
                }
                onRetry={retryRead}
              >
                {regionViews[query.region]}
              </DataRegion>
            )
          }
        />
        {sourceSheet}
      </>
    )
  const isSession =
    level === "layouts" || ["session", "review"].includes(query.page)
  const selectedLayout = (
    query.page === "review"
      ? "review"
      : params.get("layout") ||
        (query.template === "console" && query.page !== "session"
          ? "tasks"
          : query.template === "artifacts"
            ? "review"
            : "conversation")
  ) as WorkbenchLayout
  const main = isSession
    ? selectedLayout === "tasks"
      ? inbox()
      : workspace
    : query.page === "inbox"
      ? inbox()
      : query.page === "settings"
        ? settings()
        : query.page === "artifacts"
          ? artifacts()
          : query.page === "project"
            ? projectView()
            : home()
  return (
    <main
      className={styles.root}
      data-workbench-template={query.template}
      data-workbench-page={query.page}
      data-session-id={session.sessionId}
    >
      {sourceSheet}
      <div className={styles.top}>
        {level === "app" ? (
          <Link href="/examples/agent-workbench/">EasyuseUI · Agent</Link>
        ) : (
          links
        )}
        <span className={styles.meta}>{x.local}</span>
        {controls}
      </div>
      {level === "app" && <div className={styles.top}>{pageNav}</div>}
      <div className={styles.product}>
        <AgentWorkbench
          session={session}
          header={
            !isSession ? (
              <span>
                {x[query.page as keyof typeof x]} ·{" "}
                {state.projects.find((p) => p.projectId === projectId)?.name}
              </span>
            ) : undefined
          }
          layout={isSession ? selectedLayout : "tasks"}
          panelState={{ ...state.panels, activePanel }}
          onPanelStateChange={onPanels}
          navigation={navigation}
          composer={composer}
          workspace={main}
          inspector={contextPanel}
          bottom={<ExecutionOutputPanel {...session.output} />}
          toolbar={
            <div className={styles.row}>
              {isSession &&
                workbenchLayouts.map((layout) => (
                  <Button
                    key={layout}
                    size="sm"
                    variant="ghost"
                    aria-pressed={selectedLayout === layout}
                    data-workbench-layout={layout}
                    onClick={() =>
                      navigate({
                        layout,
                        page:
                          layout === "review"
                            ? "review"
                            : layout === "tasks"
                              ? "inbox"
                              : "session",
                        ...(layout === "review" ? { panel: "changes" } : {}),
                      })
                    }
                  >
                    {t(`workbench.${layout}`)}
                  </Button>
                ))}
            </div>
          }
          headerActions={environmentDetails(true)}
          onRename={
            readOnly
              ? undefined
              : (title) =>
                  dispatch({
                    type: "metadata",
                    id: session.sessionId,
                    patch: { title },
                  })
          }
          conversation={{
            actionsRef: conversationActions,
            attention: tools(true),
            deferOffscreen: true,
            onLoadHistory: () =>
              dispatch({ type: "history", id: session.sessionId }),
            onRetry: retryRead,
            onOpenReference: openReference,
          }}
        />
      </div>
    </main>
  )
}
