"use client"
import Link from "next/link"
import { Info, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react"
import { useTheme } from "next-themes"
import {
  SessionNavigator,
  ProjectSwitcher,
  SessionHeader,
} from "@/components/blocks/agent-workbench/navigation"
import { AgentComposer } from "@/components/blocks/agent-workbench/composer"
import {
  ContextPanel,
  ContextPicker,
} from "@/components/blocks/agent-workbench/context"
import type { WorkbenchPanelDescriptor } from "@/components/blocks/agent-workbench/panels"
import { ApprovalRequestPanel } from "@/components/blocks/approval-request-panel"
import type { ConversationActions } from "@/components/blocks/chat-message"
import { ToolCall } from "@/components/blocks/tool-call"
import { CommandPalette } from "@/components/blocks/command-palette"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { DataRegion } from "@/components/ui/data-region"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import {
  WorkbenchFilePreview,
  WorkbenchDocumentTabs,
} from "@/components/blocks/workbench-file-preview"
import { ExecutionSessionList } from "@/components/blocks/agent-workbench/panels"
import {
  openDocument,
  closeDocument,
  resourceKey,
  acceptResourceRead,
  type ResourceSnapshot,
  type WorkbenchDocuments,
} from "@/lib/workbench-resource-model"
import { ActivityNavigation, type ActivityArea } from "./activity-navigation"
import { FileNavigation } from "./file-navigation"
import { SettingsDialog } from "./settings-dialog"
import {
  workbenchResourceFixtures,
  resourceForReference,
  commandFixtures,
} from "./resource-fixtures"
import enhancementStyles from "./enhancement.module.css"
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
import { parseShowcaseQuery, showcaseHref } from "./showcase-model"
import { lazyExample } from "./lazy-module"
import { WorkbenchFrame } from "./workbench-frame"
import { DeferredWorkbenchPanels } from "./deferred-panels"
import { RuntimePanel } from "../agent-workspace/runtime-panel"
import referenceTokens from "../agent-workspace/reference-tokens.module.css"
import styles from "./demo.module.css"

const AgentConversation = lazyExample<
  ComponentProps<
    typeof import("@/components/blocks/agent-workbench/conversation").AgentConversation
  >
>("conversation", () =>
  import("@/components/blocks/agent-workbench/conversation").then((module) => ({
    default: module.AgentConversation,
  })),
)
const MessageContent = lazyExample<
  ComponentProps<
    typeof import("@/components/blocks/agent-workbench/conversation").MessageContent
  >
>("message-preview", () =>
  import("@/components/blocks/agent-workbench/conversation").then((module) => ({
    default: module.MessageContent,
  })),
)
const TaskInbox = lazyExample<
  ComponentProps<typeof import("@/components/blocks/agent-workbench").TaskInbox>
>("inbox", () =>
  import("@/components/blocks/agent-workbench").then((module) => ({
    default: module.TaskInbox,
  })),
)
const PreviewPanel = lazyExample<
  ComponentProps<
    typeof import("@/components/blocks/agent-workbench/panels").PreviewPanel
  >
>("preview", () =>
  import("@/components/blocks/agent-workbench/panels").then((module) => ({
    default: module.PreviewPanel,
  })),
)
const AgentRunInspector = lazyExample<
  ComponentProps<
    typeof import("@/components/blocks/agent-run-inspector").AgentRunInspector
  >
>("run-inspector", () =>
  import("@/components/blocks/agent-run-inspector").then((module) => ({
    default: module.AgentRunInspector,
  })),
)
const ExecutionTraceTree = lazyExample<
  ComponentProps<
    typeof import("@/components/blocks/execution-trace-tree").ExecutionTraceTree
  >
>("plan", () =>
  import("@/components/blocks/execution-trace-tree").then((module) => ({
    default: module.ExecutionTraceTree,
  })),
)
const RegionLab = lazyExample<
  ComponentProps<typeof import("./region-lab").RegionLab>
>("regions", () =>
  import("./region-lab").then((module) => ({ default: module.RegionLab })),
)
const ArtifactsView = lazyExample<
  ComponentProps<typeof import("./artifacts-view").ArtifactsView>
>("artifacts", () =>
  import("./artifacts-view").then((module) => ({
    default: module.ArtifactsView,
  })),
)
const SourceControls = lazyExample<
  ComponentProps<typeof import("./source-controls").SourceControls>
>("scenario-controls", () =>
  import("./source-controls").then((module) => ({
    default: module.SourceControls,
  })),
)
const SettingsView = lazyExample<
  ComponentProps<typeof import("./settings-view").SettingsView>
>("settings", () =>
  import("./settings-view").then((module) => ({
    default: module.SettingsView,
  })),
)
const ReviewView = lazyExample<
  ComponentProps<typeof import("./review-view").ReviewView>
>("review", () =>
  import("./review-view").then((module) => ({ default: module.ReviewView })),
)

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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [area, setArea] = useState<ActivityArea>("sessions")
  const viewKey = JSON.stringify([
    current.sessionId,
    query.page,
    params.get("layout"),
  ])
  const [paneSelection, setPaneSelection] = useState<{
    key: string
    view: "conversation" | "workspace"
  }>()
  const activeView =
    paneSelection?.key === viewKey
      ? paneSelection.view
      : query.page === "review" || params.get("layout") === "review"
        ? "workspace"
        : "conversation"
  const setActiveView = useCallback(
    (view: "conversation" | "workspace") =>
      setPaneSelection({ key: viewKey, view }),
    [viewKey],
  )
  const [openedResources, setOpenedResources] = useState<
    Record<string, ResourceSnapshot | undefined>
  >({})
  const [documentStates, setDocumentStates] = useState<
    Record<string, WorkbenchDocuments>
  >({})
  const [selectedCommands, setSelectedCommands] = useState<
    Record<string, string>
  >({})
  const mainRef = useRef<HTMLElement>(null)
  const previewFocus = useRef<HTMLElement | null>(null)
  const resourceReadSequence = useRef(0)
  const resourceReadScope = useRef(current.sessionId)
  const settingsFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    resourceReadSequence.current++
    resourceReadScope.current = current.sessionId
  }, [current.sessionId])
  const resources = useMemo(() => workbenchResourceFixtures(current), [current])
  const documentState = documentStates[current.sessionId] ?? { documents: [] }
  const openedResource = openedResources[current.sessionId]
  const [resourceRanges, setResourceRanges] = useState<
    Record<string, { start: number; end: number } | undefined>
  >({})
  const openResource = useCallback(
    (resource: ResourceSnapshot, range?: { start: number; end: number }) => {
      if (
        resource.sessionId !== current.sessionId ||
        resource.projectId !== current.projectId
      )
        return
      previewFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : mainRef.current
      setResourceRanges((before) => ({ ...before, [current.sessionId]: range }))
      const sequence = ++resourceReadSequence.current
      const scope = current.sessionId
      setOpenedResources((before) => ({
        ...before,
        [scope]: {
          ...resource,
          text: undefined,
          image: undefined,
          diff: undefined,
          dataState: "loading",
        },
      }))
      // Fixture read delays exercise the same identity/cancellation gate as a host adapter.
      setTimeout(
        () => {
          if (
            sequence !== resourceReadSequence.current ||
            resourceReadScope.current !== scope
          )
            return
          setOpenedResources((before) => ({
            ...before,
            [scope]: acceptResourceRead(resource, resource, before[scope]),
          }))
        },
        resource.resourceId === "file-filter" ? 120 : 20,
      )
      setDocumentStates((before) => ({
        ...before,
        [current.sessionId]: openDocument(
          before[current.sessionId] ?? { documents: [] },
          resource,
          false,
          range,
        ),
      }))
    },
    [current.sessionId, current.projectId],
  )
  function dockResource(resource: ResourceSnapshot, pinned = true) {
    // The fixture source already has bytes; never pin the delayed quick-look loading shell.
    resource =
      resources.find(
        (candidate) => resourceKey(candidate) === resourceKey(resource),
      ) ?? resource
    resourceReadSequence.current++
    if (!previewFocus.current?.isConnected)
      previewFocus.current = mainRef.current
    setDocumentStates((before) => ({
      ...before,
      [current.sessionId]: openDocument(
        before[current.sessionId] ?? { documents: [] },
        resource,
        pinned,
        resourceRanges[current.sessionId],
      ),
    }))
    setOpenedResources((before) => ({
      ...before,
      [current.sessionId]: undefined,
    }))
    setActiveView("workspace")
    navigate({
      page: "session",
      layout: "review",
      panel: "files",
      ...(level === "regions" ? { region: "files" } : {}),
    })
  }
  function openSettings() {
    settingsFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : mainRef.current
    setSettingsOpen(true)
  }

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
  useEffect(() => {
    let frame = 0
    const revealEditor = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const editor = document.activeElement
        if (
          editor instanceof HTMLTextAreaElement &&
          composerRef.current?.contains(editor)
        )
          editor.scrollIntoView({ block: "nearest", inline: "nearest" })
      })
    }
    window.addEventListener("resize", revealEditor)
    window.visualViewport?.addEventListener("resize", revealEditor)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", revealEditor)
      window.visualViewport?.removeEventListener("resize", revealEditor)
    }
  }, [])
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
      if ("page" in patch || "layout" in patch) setPaneSelection(undefined)
      navigationSnapshot.current = next
      const url = `?${next}`
      if (replace) router.replace(url, { scroll: false })
      else router.push(url, { scroll: false })
    },
    [params, router],
  )
  function openReference(part: MessagePart) {
    if (part.kind === "plan") {
      setActiveView("workspace")
      navigate({ panel: "plan", layout: "review" })
      return
    }
    const resource = resources.find(
      (resource) =>
        resource.resourceId === ("referenceId" in part ? part.referenceId : ""),
    )
    if (resource) openResource(resource)
    else {
      setActiveView("workspace")
      navigate({
        panel: part.kind === "artifact" ? "artifacts" : "files",
        layout: "review",
      })
    }
  }
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
      setActiveView("conversation")
      navigate({
        session: sessionId,
        page: "session",
        layout: "conversation",
        panel: "context",
        ...(level === "regions" ? { region: "conversation" } : {}),
      })
    },
    [navigate, level, setActiveView],
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
  const focusPendingMessage = useCallback(
    (actions: ConversationActions | null = conversationActions.current) => {
      const target = pendingMessage.current
      if (
        target?.sessionId === current.sessionId &&
        (query.page === "session" ||
          (level === "regions" && query.region === "conversation")) &&
        actions?.scrollToMessage(target.messageId, {
          focus: true,
        })
      )
        pendingMessage.current = null
    },
    [current.sessionId, query.page, query.region, level],
  )
  const retainConversationActions = useCallback(
    (actions: ConversationActions | null) => {
      conversationActions.current = actions
      focusPendingMessage(actions)
    },
    [focusPendingMessage],
  )
  // A deferred conversation can mount after the navigation effect has run.
  // Deliver pending focus when its actual actions become available as well.
  useEffect(() => {
    focusPendingMessage()
  }, [focusPendingMessage, query.layout, activePanel])
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
  const onPanels = useCallback(
    (panels: typeof state.panels) => {
      dispatch({ type: "panels", panels })
      if (panels.activePanel !== activePanel)
        navigate({ panel: panels.activePanel })
    },
    [dispatch, activePanel, navigate, state],
  )
  const referenceIdentity = (r: ContextReference) =>
    JSON.stringify([r.kind, r.source ?? r.id, r.version, r.range])
  const pickMany = (picked: ContextReference[]) => {
    const identities = new Set(draft.context.map(referenceIdentity))
    const added = picked.filter((reference) => {
      const key = referenceIdentity(reference)
      if (identities.has(key)) return false
      identities.add(key)
      return true
    })
    if (added.length)
      setDraft({
        ...draft,
        context: [
          ...draft.context,
          ...added.map((r) => ({
            ...structuredClone(r),
            included: true,
            removable: true,
          })),
        ],
        version: draft.version + 1,
      })
  }
  const pick = (reference: ContextReference) => pickMany([reference])
  const availableReferences = [
    ...references,
    ...resources.flatMap((resource) =>
      resource.context ? [resource.context] : [],
    ),
  ].filter(
    (r, index, all) =>
      all.findIndex(
        (other) => referenceIdentity(other) === referenceIdentity(r),
      ) === index &&
      !draft.context.some((c) => referenceIdentity(c) === referenceIdentity(r)),
  )
  function openContextReference(reference: ContextReference) {
    const resource = resourceForReference(resources, reference)
    if (resource && reference.availability === "available")
      openResource(resource, reference.range)
    else setOpenedContext({ sessionId: session.sessionId, reference })
  }
  function sourceForResource(resource: ResourceSnapshot) {
    resourceReadSequence.current++
    if (resource.source?.messageId) {
      setOpenedResources((before) => ({
        ...before,
        [session.sessionId]: undefined,
      }))
      locateMessage(session.sessionId, resource.source.messageId)
    } else if (resource.source?.toolCallId) {
      setOpenedResources((before) => ({
        ...before,
        [session.sessionId]: undefined,
      }))
      setLocatedTool(resource.source.toolCallId)
      setActiveView("workspace")
      navigate({ panel: "activity", layout: "review" })
    }
  }
  const fileDocuments = (
    <WorkbenchDocumentTabs
      state={documentState}
      onSelect={(key) =>
        setDocumentStates((before) => ({
          ...before,
          [session.sessionId]: { ...documentState, activeKey: key },
        }))
      }
      onClose={(key) =>
        setDocumentStates((before) => ({
          ...before,
          [session.sessionId]: closeDocument(documentState, key),
        }))
      }
      onPin={(resource) =>
        setDocumentStates((before) => ({
          ...before,
          [session.sessionId]: openDocument(documentState, resource, true),
        }))
      }
    />
  )
  const commands = commandFixtures(session)
  function openCommandOutput(commandId: string) {
    setSelectedCommands((before) => ({
      ...before,
      [session.sessionId]: commandId,
    }))
    if (level !== "regions") {
      dispatch({
        type: "panels",
        panels: { ...state.panels, bottomOpen: true },
      })
      return
    }
    setActiveView("workspace")
    navigate({
      panel: "terminal",
      layout: "review",
      ...(level === "regions" ? { region: "output" } : {}),
    })
  }
  const commandOutput = (
    <ExecutionSessionList
      commands={commands}
      selectedId={selectedCommands[session.sessionId]}
      onSelect={(id) =>
        setSelectedCommands((before) => ({
          ...before,
          [session.sessionId]: id,
        }))
      }
      onOpenTool={(id) => {
        setLocatedTool(id)
        setActiveView("workspace")
        navigate({
          panel: "activity",
          layout: "review",
          ...(level === "regions" ? { region: "tools" } : {}),
        })
      }}
      onOpenResource={(id) => {
        const resource = resources.find((r) => r.resourceId === id)
        if (resource) openResource(resource)
      }}
      onSource={(messageId) => locateMessage(session.sessionId, messageId)}
      onReconnect={() => retryRead()}
    />
  )
  const runtimePanel = (
    <RuntimePanel
      session={session}
      commands={commands}
      selectedId={selectedCommands[session.sessionId]}
      onSelect={(id) =>
        setSelectedCommands((before) => ({
          ...before,
          [session.sessionId]: id,
        }))
      }
      onOpenTool={(id) => {
        setLocatedTool(id)
        setActiveView("workspace")
        navigate({ panel: "activity", layout: "review", page: "session" })
      }}
      onOpenResource={(id) => {
        const resource = resources.find((r) => r.resourceId === id)
        if (resource) dockResource(resource)
      }}
      onSource={(messageId) => locateMessage(session.sessionId, messageId)}
      onReconnect={retryRead}
    />
  )
  const contextPanel = (
    <>
      <div className={styles.top}>
        <ContextPicker
          references={availableReferences}
          onPick={pick}
          onPickMany={pickMany}
          searchable
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
        onOpen={openContextReference}
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
        onOpenContext={() => setContextOpen(true)}
        onCommandMenu={() => setCommandOpen(true)}
        onOpenSettings={openSettings}
        referenceStrip={
          <div
            className={enhancementStyles.referenceStrip}
            data-composer-references
          >
            {draft.context.map((reference) => (
              <div
                key={reference.id}
                className={enhancementStyles.reference}
                data-invalid={reference.availability !== "available"}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openContextReference(reference)}
                >
                  {reference.label} · {t(`workbench.${reference.availability}`)}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`${t("workbench.remove")} ${reference.label}`}
                  disabled={!reference.removable}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      context: draft.context.filter(
                        (r) => r.id !== reference.id,
                      ),
                      version: draft.version + 1,
                    })
                  }
                >
                  <X />
                </Button>
                {["stale", "missing", "error", "unknown"].includes(
                  reference.availability,
                ) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      dispatch({
                        type: "retry-context",
                        id: session.sessionId,
                        referenceId: reference.id,
                      })
                    }
                    disabled={state.receipts.some(
                      (r) =>
                        r.targetId === `${session.sessionId}:${reference.id}` &&
                        ["pending", "unknown"].includes(r.state),
                    )}
                  >
                    {t("workspaceShellDemo.retryRead")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        }
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
              onPickMany={pickMany}
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
  const sessionNavigation = (
    <SessionNavigator
      newLabel={locale === "en" ? "New session" : "新建会话"}
      newDisabled={readOnly}
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
        <>
          {readOnly && <p className={styles.meta}>{x.readOnly}</p>}
          {level === "app" ? (
            <div className={styles.row}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAppPage("home")}
              >
                {x.home}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAppPage("project")}
              >
                {x.project}
              </Button>
            </div>
          ) : (
            <div className={styles.row}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAppPage("inbox")}
              >
                {x.inbox}
              </Button>
              <Button size="sm" variant="ghost" onClick={openSettings}>
                {x.settings}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchOpen(true)}
              >
                {t("workbench.searchSessions")}
              </Button>
            </div>
          )}
        </>
      }
    />
  )
  const toolRecords = (
    <div className={styles.section}>
      {session.tools.map((tool) => (
        <div
          key={tool.id}
          tabIndex={-1}
          data-tool-target={tool.id}
          data-located={locatedTool === tool.id}
          ref={(node) => {
            toolTargets.current[tool.id] = node
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openCommandOutput(`command-${tool.id}`)}
          >
            {t("resource.commands")}
          </Button>
          {resources
            .filter((r) => r.source?.toolCallId === tool.id)
            .map((r) => (
              <Button
                key={r.resourceId}
                variant="ghost"
                size="sm"
                onClick={() => openResource(r)}
              >
                {r.name}
              </Button>
            ))}
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
    </div>
  )
  const attentionRecords = (
    <div className={styles.section}>
      {session.attention.map((request) => (
        <ApprovalRequestPanel
          key={request.attentionId}
          request={{
            ...request,
            tool: request.tool
              ? {
                  ...request.tool,
                  ...session.tools.find((tool) => tool.id === request.tool?.id),
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
  const toolRegion = (
    <>
      {toolRecords}
      {attentionRecords}
    </>
  )
  function review(fileOnly = false) {
    return (
      <ReviewView
        session={session}
        draft={draft}
        setDraft={setDraft}
        query={query}
        navigate={navigate}
        fileOnly={fileOnly}
        mode={mode}
        onModeChange={setMode}
      />
    )
  }
  function artifacts() {
    return (
      <ArtifactsView
        session={session}
        draft={draft}
        setDraft={setDraft}
        query={query}
        navigate={navigate}
        projectId={projectId}
        level={level}
        selectedArtifacts={selectedArtifacts}
        setSelectedArtifacts={setSelectedArtifacts}
        openSession={openSession}
        locateMessage={locateMessage}
        resources={resources}
        onOpenResource={openResource}
      />
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
      <SettingsView
        session={session}
        draft={draft}
        setDraft={setDraft}
        query={query}
        navigate={navigate}
        preferences={preferences()}
        retryRead={retryRead}
      />
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
        id === "context"
          ? contextPanel
          : id === "files"
            ? fileDocuments
            : id === "changes"
              ? review()
              : id === "artifacts"
                ? artifacts()
                : id === "plan"
                  ? plan()
                  : id === "activity"
                    ? toolRegion
                    : id === "terminal"
                      ? commandOutput
                      : preview(),
    }),
  )
  const workspace = (
    <DeferredWorkbenchPanels
      panels={panelDescriptors}
      primaryPanels={["changes", "files", "plan"]}
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
  function openChange(fileId: string) {
    dispatch({
      type: "panels",
      panels: { ...state.panels, selectedFileId: fileId },
    })
    setActiveView("workspace")
    navigate({ page: "review", panel: "changes", layout: "review" })
  }
  const resourceSidebar = (
    <DeferredWorkbenchPanels
      panels={panelDescriptors.map((panel) => ({
        ...panel,
        render: () =>
          panel.id === "changes" ? (
            <DataRegion
              state={session.changes.files.length ? session.dataState : "empty"}
              hasContent={session.changes.files.length > 0}
              emptyTitle={t("workbench.noChanges")}
              error={{
                category: "network",
                message: session.error ?? x.readError,
                reason: x.readError,
              }}
              onRetry={retryRead}
            >
              {session.changes.files.map((file) => (
                <Item
                  key={file.fileId}
                  title={file.path}
                  description={`${file.kind} · ${session.changes.revision}`}
                  onSelect={() => openChange(file.fileId)}
                />
              ))}
            </DataRegion>
          ) : panel.id === "files" ? (
            <FileNavigation
              resources={resources}
              onOpen={openResource}
              onPin={(resource) => dockResource(resource)}
            />
          ) : (
            panel.render()
          ),
      }))}
      value={activePanel}
      primaryPanels={["changes", "files", "plan"]}
      onChange={(panel) => navigate({ panel })}
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
          <Link prefetch={false} href="/workspace/agents/">
            {x.agentBoard}
          </Link>
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
      <SourceControls
        session={session}
        draft={draft}
        setDraft={setDraft}
        query={query}
        navigate={navigate}
        preferences={preferences()}
        projectId={projectId}
        current={current}
        level={level}
        narrow={narrow}
        setNarrow={setNarrow}
      />
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
      <Link prefetch={false} href="/examples/agent-workbench/">
        {x.overview}
      </Link>
      <Link
        prefetch={false}
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
        prefetch={false}
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
        prefetch={false}
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
  const navigation =
    area === "files" ? (
      <FileNavigation
        resources={resources}
        selectedId={
          documentState.documents.find(
            (d) => resourceKey(d.resource) === documentState.activeKey,
          )?.resource.resourceId
        }
        onOpen={openResource}
        onPin={(resource) => dockResource(resource)}
      />
    ) : (
      sessionNavigation
    )
  const activityBar = (
    <ActivityNavigation
      area={area}
      page={query.page}
      href={(page) =>
        showcaseHref("app", {
          template: query.template,
          page,
          session: session.sessionId,
          project: projectId,
          scenario: query.scenario,
          ...(page === "review" ? { layout: "review", panel: "changes" } : {}),
        })
      }
      onNavigate={(page) => {
        navigate({
          page,
          ...(page === "review"
            ? { layout: "review", panel: "changes" }
            : page === "session"
              ? { layout: "conversation" }
              : {}),
        })
      }}
      onArea={(value) => {
        setArea(value)
        onPanels({ ...state.panels, sidebarCollapsed: false })
        if (value === "files") {
          setActiveView("workspace")
          navigate({ page: "session", layout: "review", panel: "files" })
        }
      }}
      onSearch={() => setCommandOpen(true)}
      onSettings={openSettings}
      onHelp={() => setHelpOpen(true)}
      settingsOpen={settingsOpen}
      taskCount={
        session.attention.filter((a) => a.operation?.state !== "confirmed")
          .length
      }
      changeCount={session.changes.files.length}
      artifactCount={session.artifacts.length}
    />
  )
  const overlays = (
    <>
      <SettingsDialog
        session={session}
        draft={draft}
        setDraft={setDraft}
        query={query}
        navigate={navigate}
        preferences={preferences()}
        open={settingsOpen}
        onOpenChange={(value) => {
          if (!value && !settingsFocus.current?.isConnected)
            settingsFocus.current = mainRef.current
          setSettingsOpen(value)
        }}
        finalFocus={settingsFocus}
      />
      <WorkbenchFilePreview
        resource={openedResource}
        range={resourceRanges[session.sessionId]}
        open={Boolean(openedResource)}
        onOpenChange={(value) => {
          if (!value) {
            resourceReadSequence.current++
            if (!previewFocus.current?.isConnected)
              previewFocus.current = mainRef.current
            setOpenedResources((before) => ({
              ...before,
              [session.sessionId]: undefined,
            }))
          }
        }}
        onPin={dockResource}
        onExpand={(resource) => dockResource(resource, false)}
        onAddContext={(resource) => {
          if (resource.context) pick(resource.context)
        }}
        onSource={sourceForResource}
        latestRevision={
          resources.find(
            (resource) => resource.resourceId === openedResource?.resourceId,
          )?.revision
        }
        onReview={
          openedResource &&
          session.changes.files.some(
            (file) => file.path === openedResource.path,
          )
            ? () => {
                resourceReadSequence.current++
                setOpenedResources((before) => ({
                  ...before,
                  [session.sessionId]: undefined,
                }))
                dispatch({
                  type: "panels",
                  panels: {
                    ...state.panels,
                    selectedFileId: session.changes.files.find(
                      (file) => file.path === openedResource.path,
                    )?.fileId,
                    activePanel: "changes",
                  },
                })
                setActiveView("workspace")
                navigate({ page: "review", layout: "review", panel: "changes" })
              }
            : undefined
        }
        finalFocus={previewFocus}
      />
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
        finalFocus={mainRef}
      />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title={t("resource.commandMenu")}
        groups={[
          {
            id: "files",
            label: t("workbench.files"),
            items: resources.map((r) => ({
              id: `file:${r.resourceId}`,
              label: r.path,
              description: r.revision,
            })),
          },
          {
            id: "sessions",
            label: t("workbench.searchSessions"),
            items: state.sessions
              .filter((s) => s.projectId === projectId)
              .map((s) => ({ id: `session:${s.sessionId}`, label: s.title })),
          },
          {
            id: "commands",
            label: t("resource.commands"),
            items: commands.map((c) => ({
              id: `command:${c.commandId}`,
              label: c.command,
              description: c.status,
            })),
          },
          {
            id: "actions",
            label: t("workbench.details"),
            items: [
              { id: "settings", label: t("resource.settings") },
              { id: "plan", label: t("workbench.plan") },
              { id: "context", label: t("workbench.context") },
            ],
          },
        ]}
        onSelect={(item) => {
          if (item.id.startsWith("file:")) {
            const resource = resources.find(
              (r) => r.resourceId === item.id.slice(5),
            )
            if (resource) openResource(resource)
          } else if (item.id.startsWith("session:"))
            openSession(item.id.slice(8))
          else if (item.id.startsWith("command:"))
            openCommandOutput(item.id.slice(8))
          else if (item.id === "settings") openSettings()
          else {
            setActiveView("workspace")
            navigate({ panel: item.id, layout: "review" })
          }
        }}
        finalFocus={mainRef}
      />
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogTitle>
            {locale === "en" ? "Keyboard shortcuts" : "快捷键说明"}
          </DialogTitle>
          <DialogDescription>
            <Kbd>Mod+K</Kbd> {t("workbench.searchSessions")} · <Kbd>Escape</Kbd>{" "}
            {locale === "en" ? "Close the topmost overlay" : "关闭最上层弹窗"}
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <div hidden={!contextOpen}>
        {contextOpen && (
          <ContextPicker
            references={availableReferences}
            onPick={pick}
            onPickMany={pickMany}
            searchable
            open={contextOpen}
            onOpenChange={setContextOpen}
          />
        )}
      </div>
    </>
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
        <Link prefetch={false} href="/blog/agent-workbench-showcase/">
          {x.verification}
        </Link>
        <div className={styles.overview}>
          <Link
            prefetch={false}
            href="/examples/agent-workbench/regions/reference/"
          >
            <strong>
              {locale === "en" ? "Complete reference states" : "完整参考状态"}
            </strong>
            <span>MD01–MD17 · V2 · fixture</span>
          </Link>
          <Link prefetch={false} href="/examples/agent-workbench/pi/">
            <strong>Pi Workspace</strong>
            <span>
              {locale === "en"
                ? "Real local service · conversation and history"
                : "真实本地服务 · 对话与历史"}
            </span>
          </Link>
          <Link
            prefetch={false}
            href="/examples/agent-workbench/regions/?region=sidebar"
          >
            <strong>{x.regions}</strong>
            <span>R1–R10</span>
          </Link>
          <Link
            prefetch={false}
            href="/examples/agent-workbench/layouts/?layout=conversation"
          >
            <strong>{x.layouts}</strong>
            <span>L1–L3</span>
          </Link>
          {workbenchTemplates.map((template) => (
            <Link
              prefetch={false}
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
        presentation="workspace"
        session={session}
        actionsRef={retainConversationActions}
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
    tools: toolRegion,
    files: (
      <>
        <FileNavigation
          resources={resources}
          onOpen={openResource}
          onPin={(resource) => dockResource(resource)}
        />
        {fileDocuments}
        {review()}
      </>
    ),
    output: (
      <>
        {commandOutput}
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
        {overlays}
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
      id="main-content"
      ref={mainRef}
      tabIndex={-1}
      className={`${styles.root} ${referenceTokens.tokens}`}
      data-workbench-template={query.template}
      data-workbench-page={query.page}
      data-session-id={session.sessionId}
    >
      {sourceSheet}
      {overlays}
      {!isSession && (
        <div className={styles.top}>
          {level === "app" ? (
            <Link prefetch={false} href="/examples/agent-workbench/">
              EasyuseUI · Agent
            </Link>
          ) : (
            links
          )}
          <span className={styles.meta}>{x.local}</span>
          {controls}
        </div>
      )}
      <div className={styles.product}>
        <WorkbenchFrame
          sessionActive={isSession}
          session={session}
          presentation="workspace"
          className={styles.referenceShell}
          inspectorMode="resource"
          inspectorTitle={locale === "en" ? "Session resources" : "会话资源"}
          header={
            !isSession ? (
              <span>
                {x[query.page as keyof typeof x]} ·{" "}
                {state.projects.find((p) => p.projectId === projectId)?.name}
              </span>
            ) : (
              <div className={styles.globalIdentity}>
                <Link prefetch={false} href="/examples/agent-workbench/">
                  EasyuseUI
                </Link>
                <small>{x.local}</small>
                <strong>{project?.name}</strong>
                <span>
                  {session.environment.name} ·{" "}
                  {session.environment.branch ?? "—"}
                </span>
                {controls}
              </div>
            )
          }
          layout={isSession ? selectedLayout : "tasks"}
          panelState={{ ...state.panels, activePanel }}
          reviewSplit={state.panels.reviewSplit}
          onReviewSplitChange={(reviewSplit) =>
            onPanels({ ...state.panels, reviewSplit })
          }
          onPanelStateChange={onPanels}
          navigation={navigation}
          activityBar={activityBar}
          activeView={query.page === "review" ? "workspace" : activeView}
          showViewSwitch={level !== "app"}
          onActiveViewChange={setActiveView}
          composer={composer}
          workspace={main}
          inspector={resourceSidebar}
          bottom={isSession ? runtimePanel : undefined}
          bottomBadge={
            commands.filter(
              (command) =>
                command.status === "failed" || command.outcome === "unknown",
            ).length
          }
          toolbar={
            <div className={styles.row}>
              {isSession && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveView("workspace")
                      navigate({ panel: "context", layout: "review" })
                    }}
                  >
                    {t("workbench.context")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveView("workspace")
                      navigate({ panel: "plan", layout: "review" })
                    }}
                  >
                    {t("workbench.plan")}
                  </Button>
                </>
              )}
              {isSession &&
                workbenchLayouts
                  .filter(
                    (layout) => level !== "app" || layout === "conversation",
                  )
                  .map((layout) => (
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
            presentation: "workspace",
            actionsRef: retainConversationActions,
            attention: attentionRecords,
            deferOffscreen: true,
            onLoadHistory: () =>
              dispatch({ type: "history", id: session.sessionId }),
            onRetry: retryRead,
            onOpenReference: openReference,
            groupTools: true,
            onOpenTool: (id) => openCommandOutput(`command-${id}`),
            onOpenChange: openChange,
          }}
        />
      </div>
    </main>
  )
}
