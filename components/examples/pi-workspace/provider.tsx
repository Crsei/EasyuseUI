"use client"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { DraftState } from "@/lib/agent-workbench-model"
import { acknowledgeDraft } from "@/lib/agent-workbench-model"
import type {
  PiProject,
  PiModel,
  PiSession,
  PiSnapshot,
  PiHistory,
  PiReceipt,
  PiCommand,
} from "@/lib/pi-workspace-protocol"
import { PiClient, PiHttpError, abortableDelay } from "./client"
import { emptyDraft, mergeSnapshot } from "./model"

type Connection = "connected" | "disconnected" | "connecting"
type WorkspaceValue = {
  endpoint: string
  connection: Connection
  error?: string
  projects: PiProject[]
  models: PiModel[]
  sessions: PiSession[]
  projectId: string
  selectedId: string
  cache: Record<string, PiSnapshot>
  drafts: Record<string, DraftState>
  receipts: PiReceipt[]
  listLoading: boolean
  historyLoading: boolean
  openingSession: boolean
  listCursor?: string
  connect: (endpoint: string, token: string) => Promise<boolean>
  selectProject: (id: string) => void
  selectSession: (id: string) => void
  updateDraft: (id: string, draft: DraftState) => void
  createSession: () => Promise<void>
  copySession: () => Promise<void>
  send: (draft: DraftState) => Promise<void>
  interrupt: () => Promise<void>
  refresh: () => Promise<void>
  loadHistory: () => Promise<void>
  loadSessions: () => Promise<void>
  reconcile: (receipt: PiReceipt) => Promise<void>
}
const Context = createContext<WorkspaceValue | null>(null)
const storageKey = (endpoint: string, kind: string) =>
  `easyuse:pi:${endpoint}:${kind}`
function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback
  } catch {
    return fallback
  }
}
function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage may be disabled; the active draft stays in memory. */
  }
}
export function PiWorkspaceProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState("http://127.0.0.1:3012")
  const [connection, setConnection] = useState<Connection>("disconnected")
  const [error, setError] = useState<string>()
  const [projects, setProjects] = useState<PiProject[]>([]),
    [models, setModels] = useState<PiModel[]>([])
  const [sessions, setSessions] = useState<PiSession[]>([]),
    [projectId, setProjectId] = useState(""),
    [selectedId, setSelectedId] = useState("")
  const [cache, setCache] = useState<Record<string, PiSnapshot>>({}),
    [drafts, setDrafts] = useState<Record<string, DraftState>>({}),
    [receipts, setReceipts] = useState<PiReceipt[]>([])
  const [listLoading, setListLoading] = useState(false),
    [historyLoading, setHistoryLoading] = useState(false),
    [listCursor, setListCursor] = useState<string>()
  const clientRef = useRef<PiClient | null>(null),
    endpointRef = useRef(endpoint)
  const selectedRef = useRef(""),
    projectRef = useRef(""),
    cacheRef = useRef(cache),
    draftsRef = useRef(drafts),
    receiptsRef = useRef(receipts)
  const listGeneration = useRef(0),
    historyGeneration = useRef(0),
    connectGeneration = useRef(0)
  const viewGeneration = useRef(0)
  const [viewVersion, setViewVersion] = useState(0)
  const openingRef = useRef<{ requestId: string; view: number } | null>(null)
  const [opening, setOpening] = useState<{
    requestId: string
    view: number
  } | null>(null)
  const [clientVersion, setClientVersion] = useState(0)
  const navigate = useCallback(
    (project: string, session: string, replace = false) => {
      viewGeneration.current++
      setViewVersion(viewGeneration.current)
      projectRef.current = project
      selectedRef.current = session
      setProjectId(project)
      setSelectedId(session)
      setError(undefined)
      const url = new URL(window.location.href)
      if (project) url.searchParams.set("project", project)
      else url.searchParams.delete("project")
      if (session) url.searchParams.set("session", session)
      else url.searchParams.delete("session")
      window.history[replace ? "replaceState" : "pushState"]({}, "", url)
      saveStored(storageKey(endpointRef.current, "selection"), {
        projectId: project,
        sessionId: session,
      })
    },
    [],
  )
  const updateDraft = useCallback((id: string, draft: DraftState) => {
    const next = { ...draftsRef.current, [id]: draft }
    draftsRef.current = next
    setDrafts(next)
    saveStored(storageKey(endpointRef.current, "drafts"), next)
  }, [])
  const recordReceipt = useCallback(
    (receipt: PiReceipt) => {
      const next = [
        ...receiptsRef.current.filter((r) => r.requestId !== receipt.requestId),
        receipt,
      ].slice(-200)
      receiptsRef.current = next
      setReceipts(next)
      saveStored(storageKey(endpointRef.current, "receipts"), next)
      const draft = draftsRef.current[receipt.targetId]
      if (draft && receipt.action === "send" && receipt.state === "confirmed")
        updateDraft(receipt.targetId, acknowledgeDraft(draft, receipt))
    },
    [updateDraft],
  )
  const applySnapshot = useCallback(
    (snapshot: PiSnapshot) => {
      const id = snapshot.session.sessionId
      const merged = mergeSnapshot(cacheRef.current[id], snapshot)
      const next = { ...cacheRef.current, [id]: merged }
      cacheRef.current = next
      setCache(next)
      setSessions((current) => {
        if (projectRef.current !== snapshot.session.projectId) return current
        return [
          snapshot.session,
          ...current.filter((s) => s.sessionId !== id),
        ].sort(
          (a, b) =>
            b.updatedAt.localeCompare(a.updatedAt) ||
            a.sessionId.localeCompare(b.sessionId),
        )
      })
      if (!draftsRef.current[id])
        updateDraft(
          id,
          emptyDraft(id, snapshot.session.modelId, snapshot.session.projectId),
        )
    },
    [updateDraft],
  )
  const reconcile = useCallback(
    async (receipt: PiReceipt) => {
      const client = clientRef.current
      if (!client) return
      const view = viewGeneration.current
      try {
        const result = await client.request<PiReceipt>(
          `operations/${encodeURIComponent(receipt.requestId)}`,
        )
        if (client !== clientRef.current) return
        recordReceipt(result)
        if (result.state === "confirmed") setError(undefined)
        if (
          result.sessionId &&
          result.state === "confirmed" &&
          ["create", "copy"].includes(result.action)
        ) {
          const snap = await client.request<PiSnapshot>(
            `sessions/${encodeURIComponent(result.sessionId)}`,
          )
          if (client !== clientRef.current) return
          applySnapshot(snap)
          if (
            view === viewGeneration.current &&
            projectRef.current === snap.session.projectId &&
            (selectedRef.current === result.targetId || !selectedRef.current)
          )
            navigate(snap.session.projectId, result.sessionId)
        }
      } catch (reason) {
        if (client !== clientRef.current) return
        setError(
          reason instanceof PiHttpError
            ? reason.message
            : "operation_query_failed",
        )
        // A missing receipt is not proof that a prior write never happened.
      }
    },
    [applySnapshot, navigate, recordReceipt],
  )
  const fetchSessions = useCallback(
    async (project: string, cursor?: string, preferredId?: string) => {
      const client = clientRef.current
      if (!client || !project) return
      const generation = ++listGeneration.current
      setListLoading(true)
      try {
        const result = await client.request<{
          sessions: PiSession[]
          cursor?: string
          diagnostics: string[]
        }>(
          `projects/${encodeURIComponent(project)}/sessions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
        )
        if (
          generation !== listGeneration.current ||
          client !== clientRef.current ||
          projectRef.current !== project
        )
          return
        setSessions((current) =>
          cursor
            ? [
                ...new Map(
                  [...current, ...result.sessions].map((s) => [s.sessionId, s]),
                ).values(),
              ]
            : result.sessions,
        )
        setListCursor(result.cursor)
        if (result.diagnostics.length) setError(result.diagnostics.join(", "))
        if (preferredId) navigate(project, preferredId, true)
        else if (!selectedRef.current && result.sessions.length)
          navigate(project, result.sessions[0].sessionId, true)
      } catch (reason) {
        if (generation === listGeneration.current)
          setError(
            reason instanceof Error ? reason.message : "list_read_failed",
          )
      } finally {
        if (generation === listGeneration.current) setListLoading(false)
      }
    },
    [navigate],
  )
  const connect = useCallback(
    async (address: string, token: string) => {
      const generation = ++connectGeneration.current
      setConnection("connecting")
      setError(undefined)
      try {
        const client = new PiClient(address, token)
        const health = await client.request<{ protocolVersion: number }>(
          "health",
        )
        if (health.protocolVersion !== 1)
          throw new Error("protocol_version_unsupported")
        const result = await client.request<{
          projects: PiProject[]
          models: PiModel[]
        }>("projects")
        if (generation !== connectGeneration.current) return false
        endpointRef.current = new URL(address).origin
        setEndpoint(endpointRef.current)
        clientRef.current = client
        openingRef.current = null
        setOpening(null)
        listGeneration.current++
        historyGeneration.current++
        cacheRef.current = {}
        setCache({})
        setSessions([])
        setListCursor(undefined)
        setProjects(result.projects)
        setModels(result.models)
        try {
          sessionStorage.setItem(
            "easyuse:pi:connection",
            JSON.stringify({ endpoint: endpointRef.current, token }),
          )
        } catch {
          /* Credentials can remain in memory. */
        }
        const savedDrafts = readStored<Record<string, DraftState>>(
          storageKey(endpointRef.current, "drafts"),
          {},
        )
        const safeDrafts = Object.fromEntries(
          Object.entries(savedDrafts).filter(
            ([, value]) =>
              value &&
              typeof value.text === "string" &&
              value.text.length <= 32768 &&
              Number.isInteger(value.version) &&
              typeof value.draftId === "string",
          ),
        )
        draftsRef.current = safeDrafts
        setDrafts(safeDrafts)
        const savedReceipts = readStored<PiReceipt[]>(
          storageKey(endpointRef.current, "receipts"),
          [],
        ).filter((r) => r && typeof r.requestId === "string")
        receiptsRef.current = savedReceipts
        setReceipts(savedReceipts)
        const saved = readStored<{ projectId: string; sessionId: string }>(
          storageKey(endpointRef.current, "selection"),
          { projectId: "", sessionId: "" },
        )
        const query = new URL(window.location.href).searchParams
        const preferredProject = query.get("project") ?? saved.projectId
        const project = result.projects.some(
          (p) => p.projectId === preferredProject,
        )
          ? preferredProject
          : (result.projects[0]?.projectId ?? "")
        const id =
          preferredProject === project
            ? (query.get("session") ?? saved.sessionId)
            : ""
        navigate(project, id, true)
        setConnection("connected")
        setClientVersion((v) => v + 1)
        await fetchSessions(project, undefined, id)
        for (const receipt of savedReceipts)
          if (["pending", "unknown"].includes(receipt.state))
            void reconcile(receipt)
        return true
      } catch (reason) {
        if (generation === connectGeneration.current) {
          setConnection("disconnected")
          setError(
            reason instanceof Error ? reason.message : "connection_failed",
          )
        }
        return false
      }
    },
    [fetchSessions, navigate, reconcile],
  )
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("easyuse:pi:connection") ?? "null",
        )
        if (saved?.endpoint && saved?.token)
          void connect(saved.endpoint, saved.token)
      } catch {
        /* Start disconnected when saved settings are invalid. */
      }
    })
    const changed = () => {
      viewGeneration.current++
      setViewVersion(viewGeneration.current)
      const query = new URL(window.location.href).searchParams,
        project = query.get("project") ?? projectRef.current,
        id = query.get("session") ?? ""
      projectRef.current = project
      selectedRef.current = id
      setProjectId(project)
      setSelectedId(id)
      void fetchSessions(project)
    }
    const storageChanged = (event: StorageEvent) => {
      if (event.key === storageKey(endpointRef.current, "receipts")) {
        const next = readStored<PiReceipt[]>(event.key, [])
        receiptsRef.current = next
        setReceipts(next)
      }
    }
    window.addEventListener("popstate", changed)
    window.addEventListener("storage", storageChanged)
    return () => {
      window.removeEventListener("popstate", changed)
      window.removeEventListener("storage", storageChanged)
    }
  }, [connect, fetchSessions])
  useEffect(() => {
    const client = clientRef.current
    if (!client || !selectedId) return
    const controller = new AbortController(),
      id = selectedId
    const generation = ++historyGeneration.current
    let epoch = "",
      sequence = 0,
      backoff = 500
    const sync = async () => {
      const snapshot = await client.request<PiSnapshot>(
        `sessions/${encodeURIComponent(id)}`,
        undefined,
        controller.signal,
      )
      if (
        controller.signal.aborted ||
        client !== clientRef.current ||
        selectedRef.current !== id ||
        generation !== historyGeneration.current
      )
        return
      if (snapshot.session.projectId !== projectRef.current)
        throw new Error("session_project_mismatch")
      applySnapshot(snapshot)
      epoch = snapshot.session.hostEpoch
      sequence = snapshot.session.sequence
      setConnection("connected")
      setError(undefined)
      setHistoryLoading(false)
    }
    void (async () => {
      setHistoryLoading(true)
      while (!controller.signal.aborted) {
        try {
          await sync()
          for (const receipt of receiptsRef.current)
            if (["pending", "unknown"].includes(receipt.state))
              void reconcile(receipt)
          backoff = 500
          await client.events(
            id,
            epoch,
            sequence,
            controller.signal,
            async (event) => {
              if (
                controller.signal.aborted ||
                client !== clientRef.current ||
                selectedRef.current !== id
              )
                return
              if (
                event.type === "resync" ||
                event.hostEpoch !== epoch ||
                event.sequence > sequence + 1
              ) {
                await sync()
                return
              }
              if (event.sequence <= sequence) return
              if (event.payload) {
                sequence = event.sequence
                applySnapshot(event.payload)
                setConnection("connected")
              }
            },
          )
        } catch (reason) {
          if (controller.signal.aborted) return
          setConnection("disconnected")
          setHistoryLoading(false)
          setError(
            reason instanceof Error ? reason.message : "history_read_failed",
          )
          await abortableDelay(controller.signal, backoff)
          backoff = Math.min(backoff * 2, 5000)
        }
      }
    })()
    return () => controller.abort()
  }, [selectedId, clientVersion, applySnapshot, reconcile])
  useEffect(() => {
    const timer = setInterval(() => {
      for (const receipt of receiptsRef.current)
        if (receipt.state === "pending") void reconcile(receipt)
    }, 1000)
    return () => clearInterval(timer)
  }, [reconcile])
  const runCommand = useCallback(
    async (
      action: PiReceipt["action"],
      targetId: string,
      body: Omit<PiCommand, "requestId"> = {},
    ) => {
      const client = clientRef.current
      if (
        !client ||
        (action !== "interrupt" &&
          openingRef.current?.view === viewGeneration.current) ||
        receiptsRef.current.some(
          (r) =>
            r.targetId === targetId && ["pending", "unknown"].includes(r.state),
        )
      )
        return
      const requestId = crypto.randomUUID()
      const view = viewGeneration.current,
        address = endpointRef.current
      if (action === "create" || action === "copy") {
        openingRef.current = { requestId, view }
        setOpening(openingRef.current)
      }
      const initial: PiReceipt = {
        requestId,
        targetId,
        action,
        state: "pending",
        draftId: body.draftId,
        draftVersion: body.draftVersion,
      }
      recordReceipt(initial)
      setError(undefined)
      try {
        const path =
          action === "create"
            ? `projects/${encodeURIComponent(targetId)}/sessions`
            : `sessions/${encodeURIComponent(targetId)}/${action === "send" ? "messages" : action}`
        const receipt = await client.command(path, { ...body, requestId })
        if (client !== clientRef.current) {
          const key = storageKey(address, "receipts")
          saveStored(
            key,
            [
              ...readStored<PiReceipt[]>(key, []).filter(
                (r) => r.requestId !== requestId,
              ),
              receipt,
            ].slice(-200),
          )
          return
        }
        recordReceipt(receipt)
        if (receipt.state === "failed")
          setError(receipt.reason ?? "operation_failed")
        if (
          receipt.sessionId &&
          receipt.state === "confirmed" &&
          ["create", "copy"].includes(action)
        ) {
          const snapshot = await client.request<PiSnapshot>(
            `sessions/${encodeURIComponent(receipt.sessionId)}`,
          )
          if (client !== clientRef.current) return
          applySnapshot(snapshot)
          if (view === viewGeneration.current)
            navigate(snapshot.session.projectId, snapshot.session.sessionId)
        }
        if (receipt.state === "pending") void reconcile(receipt)
      } catch (reason) {
        if (client !== clientRef.current) return
        const rejected =
          reason instanceof PiHttpError &&
          reason.status >= 400 &&
          reason.status < 500
        recordReceipt({
          ...initial,
          state: rejected ? "failed" : "unknown",
          reason: rejected ? reason.message : "network_outcome_unknown",
        })
        setError(reason instanceof Error ? reason.message : "operation_failed")
      } finally {
        if (openingRef.current?.requestId === requestId) {
          openingRef.current = null
          setOpening(null)
        }
      }
    },
    [applySnapshot, navigate, reconcile, recordReceipt],
  )
  const selectProject = useCallback(
    (id: string) => {
      navigate(id, "")
      setSessions([])
      setListCursor(undefined)
      void fetchSessions(id)
    },
    [fetchSessions, navigate],
  )
  const selectSession = useCallback(
    (id: string) => navigate(projectRef.current, id),
    [navigate],
  )
  const refresh = useCallback(async () => {
    await fetchSessions(projectRef.current)
    const client = clientRef.current,
      id = selectedRef.current
    if (!client || !id) return
    try {
      const snapshot = await client.request<PiSnapshot>(
        `sessions/${encodeURIComponent(id)}`,
      )
      if (client === clientRef.current && selectedRef.current === id) {
        applySnapshot(snapshot)
        setError(undefined)
      }
    } catch (reason) {
      if (client !== clientRef.current || selectedRef.current !== id) return
      setError(reason instanceof Error ? reason.message : "history_read_failed")
    }
  }, [applySnapshot, fetchSessions])
  const loadHistory = useCallback(async () => {
    const client = clientRef.current,
      id = selectedRef.current,
      previous = cacheRef.current[id]
    const generation = historyGeneration.current
    if (!client || !previous?.history.cursor || historyLoading) return
    setHistoryLoading(true)
    try {
      const params = new URLSearchParams({
        before: previous.history.messages[0].id,
        revision: previous.history.revision,
      })
      const history = await client.request<PiHistory>(
        `sessions/${encodeURIComponent(id)}/history?${params}`,
      )
      if (
        client !== clientRef.current ||
        selectedRef.current !== id ||
        generation !== historyGeneration.current
      )
        return
      const current = cacheRef.current[id]
      // Paging belongs to the exact snapshot requested; late pages never replace a newer stream.
      if (current.history.revision !== previous.history.revision) {
        setError("history_cursor_expired")
        return
      }
      const seen = new Set(current.history.messages.map((m) => m.id)),
        next = {
          ...current,
          history: {
            ...current.history,
            messages: [
              ...history.messages.filter((m) => !seen.has(m.id)),
              ...current.history.messages,
            ],
            tools: [
              ...new Map(
                [...history.tools, ...current.history.tools].map((t) => [
                  t.id,
                  t,
                ]),
              ).values(),
            ],
            cursor: history.cursor,
          },
        }
      cacheRef.current = { ...cacheRef.current, [id]: next }
      setCache(cacheRef.current)
      setError(undefined)
    } catch (reason) {
      if (
        client === clientRef.current &&
        selectedRef.current === id &&
        generation === historyGeneration.current
      )
        setError(
          reason instanceof Error ? reason.message : "history_read_failed",
        )
    } finally {
      if (generation === historyGeneration.current) setHistoryLoading(false)
    }
  }, [historyLoading])
  return (
    <Context.Provider
      value={{
        endpoint,
        connection,
        error,
        projects,
        models,
        sessions,
        projectId,
        selectedId,
        cache,
        drafts,
        receipts,
        listLoading,
        historyLoading,
        openingSession: opening?.view === viewVersion,
        listCursor,
        connect,
        selectProject,
        selectSession,
        updateDraft,
        createSession: () => runCommand("create", projectRef.current),
        copySession: () => runCommand("copy", selectedRef.current),
        send: (draft) =>
          runCommand("send", selectedRef.current, {
            text: draft.text,
            draftVersion: draft.version,
            draftId: draft.draftId,
            modelId: draft.modelId,
          }),
        interrupt: () =>
          runCommand("interrupt", selectedRef.current, {
            runId: cacheRef.current[selectedRef.current]?.session.runId,
          }),
        refresh,
        loadHistory,
        loadSessions: () => fetchSessions(projectRef.current, listCursor),
        reconcile,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function usePiWorkspace() {
  const context = useContext(Context)
  if (!context) throw new Error("PiWorkspaceProvider missing")
  return context
}
