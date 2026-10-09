import { createHash, randomUUID, timingSafeEqual } from "node:crypto"
import { createServer, type ServerResponse } from "node:http"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs"
import { join, resolve } from "node:path"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import {
  PI_PROTOCOL_VERSION,
  type PiCommand,
  type PiEvent,
  type PiModel,
  type PiReceipt,
  type PiSession,
  type PiSnapshot,
} from "../../../lib/pi-workspace-protocol.ts"
import {
  HostError,
  contentText,
  historyPage,
  readHistory,
  record,
  safeText,
  type RawMessage,
} from "./history.ts"
import { Store, type ManagedSession } from "./store.ts"
import type { Driver, DriverFactory } from "./sdk.ts"

export type ProjectConfig = {
  projectId: string
  name: string
  cwd: string
  sessionDirs?: string[]
}
export type HostConfig = {
  port: number
  dataDir: string
  allowedOrigins: string[]
  projects: ProjectConfig[]
  token: string
  defaultModel?: string
}
type External = { sessionId: string; projectId: string; file: string }
type Run = {
  driver?: Driver
  runId: string
  requestId: string
  live?: { id: string; message: RawMessage }
  count: number
  liveIds: Map<number, string>
  sourceAborted?: boolean
  stopped: boolean
  timer?: ReturnType<typeof setTimeout>
  unsub?: () => void
  initialized: Promise<void>
  finishInitialization: () => void
  settled?: Promise<void>
}

export function createPiHost(
  config: HostConfig,
  models: PiModel[],
  factory: DriverFactory,
) {
  if (!config.token || config.token.length < 24)
    throw new HostError("service_token_required")
  const projects = config.projects.map((p) => ({
    ...p,
    cwd: realpathSync(p.cwd),
    sessionDirs: (p.sessionDirs ?? []).map((dir) => realpathSync(dir)),
  }))
  if (
    new Set(projects.map((p) => p.projectId)).size !== projects.length ||
    projects.some((p) => !/^[\w-]+$/.test(p.projectId))
  )
    throw new HostError("invalid_project_id")
  const store = new Store(resolve(config.dataDir)),
    hostEpoch = randomUUID()
  const external = new Map<string, External>(),
    runs = new Map<string, Run>()
  let closing: Promise<void> | undefined
  const sequences = new Map<string, number>(),
    buffers = new Map<string, PiEvent[]>(),
    clients = new Map<string, Set<ServerResponse>>()
  const project = (id: string) => {
    const p = projects.find((p) => p.projectId === id)
    if (!p) throw new HostError("project_not_found", 404)
    return p
  }
  const get = (id: string): ManagedSession | External => {
    const value = Object.hasOwn(store.data.sessions, id)
      ? store.data.sessions[id]
      : external.get(id)
    if (!value) throw new HostError("session_not_found", 404)
    project(value.projectId)
    return value
  }
  const isManaged = (
    value: ManagedSession | External,
  ): value is ManagedSession => "aliases" in value
  function scan(projectId: string) {
    const p = project(projectId)
    for (const [id, entry] of external)
      if (entry.projectId === projectId) external.delete(id)
    const diagnostics: string[] = []
    for (const dir of p.sessionDirs ?? []) {
      for (const name of readdirSync(dir)
        .filter((name) => name.endsWith(".jsonl"))
        .slice(0, 5000)) {
        const file = join(dir, name)
        try {
          // Reject symlink escapes and mismatched project headers; the browser supplies opaque IDs only.
          if (realpathSync(file) !== file) {
            diagnostics.push("symlink_session_ignored")
            continue
          }
          const parsed = readHistory(file)
          if (resolve(parsed.header.cwd!) !== p.cwd) continue
          const id = `external-${createHash("sha256").update(`${p.projectId}:${file}`).digest("hex").slice(0, 24)}`
          external.set(id, { sessionId: id, projectId: p.projectId, file })
        } catch {
          diagnostics.push("unreadable_session")
        }
      }
    }
    return [...new Set(diagnostics)]
  }
  function snapshot(id: string, cursor?: string): PiSnapshot {
    const value = get(id),
      managed = isManaged(value),
      parsed = readHistory(value.file),
      run = runs.get(id)
    const history = historyPage(
      parsed,
      id,
      managed ? value.aliases : {},
      run?.live,
      cursor,
    )
    const status = managed ? value.status : "idle"
    const locked = Object.values(store.data.operations).some(
      ({ receipt: r }) =>
        r.targetId === id && ["unknown", "pending"].includes(r.state),
    )
    const title = managed
      ? value.title
      : (parsed.branch.findLast((e) => e.type === "session_info" && e.name)
          ?.name ??
        contentText(
          parsed.branch.find((e) => e.message?.role === "user")?.message
            ?.content,
        ))
    const session: PiSession = {
      sessionId: id,
      projectId: value.projectId,
      title: safeText(title || "Pi Session", 120),
      source: managed ? "managed" : "external",
      originId: managed ? value.originId : undefined,
      updatedAt: managed
        ? value.updatedAt
        : (parsed.branch.at(-1)?.timestamp ?? parsed.header.timestamp ?? ""),
      status,
      runId: managed ? value.runId : undefined,
      branchId: parsed.leaf,
      branchCount: parsed.branchCount,
      revision: `${parsed.revision}:${sequences.get(id) ?? 0}`,
      diagnostics: history.diagnostics,
      capabilities: {
        send:
          managed &&
          models.length > 0 &&
          !locked &&
          status !== "unknown" &&
          !runs.has(id) &&
          !parsed.diagnostics.length,
        interrupt: Boolean(run?.driver) && !locked,
        copy: !managed && !parsed.diagnostics.length,
      },
      modelId: managed ? value.modelId : "",
      sequence: sequences.get(id) ?? 0,
      hostEpoch,
    }
    return { session, history }
  }
  function emit(id: string) {
    sequences.set(id, (sequences.get(id) ?? 0) + 1)
    const payload = snapshot(id)
    const event: PiEvent = {
      protocolVersion: PI_PROTOCOL_VERSION,
      hostEpoch,
      sessionId: id,
      runId: payload.session.runId,
      sequence: sequences.get(id)!,
      revision: payload.session.revision,
      type: "snapshot",
      payload,
    }
    const buffer = buffers.get(id) ?? []
    buffer.push(event)
    // Replay retains authoritative snapshots, including tools/receipts; slow readers resync after disconnect.
    while (buffer.length > 32) buffer.shift()
    buffers.set(id, buffer)
    for (const client of clients.get(id) ?? []) {
      if (
        !client.write(
          `id: ${hostEpoch}:${event.sequence}\ndata: ${JSON.stringify(event)}\n\n`,
        )
      )
        client.destroy()
    }
  }
  function confirm(requestId: string, patch: Partial<PiReceipt>) {
    const operation = store.data.operations[requestId]
    operation.receipt = { ...operation.receipt, ...patch }
    store.save()
    if (store.data.sessions[operation.receipt.targetId])
      emit(operation.receipt.targetId)
    return operation.receipt
  }
  async function command(
    action: PiReceipt["action"],
    targetId: string,
    body: PiCommand,
  ): Promise<PiReceipt> {
    if (closing) throw new HostError("host_closing", 503)
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/.test(body.requestId ?? ""))
      throw new HostError("invalid_request_id")
    const digest = createHash("sha256")
      .update(
        JSON.stringify([
          action,
          targetId,
          body.text,
          body.draftId,
          body.draftVersion,
          body.runId,
          body.modelId,
        ]),
      )
      .digest("hex")
    const previous = Object.hasOwn(store.data.operations, body.requestId)
      ? store.data.operations[body.requestId]
      : undefined
    if (previous) {
      if (previous.digest !== digest)
        throw new HostError("request_id_conflict", 409)
      return previous.receipt
    }
    const receipt: PiReceipt = {
      requestId: body.requestId,
      targetId,
      action,
      state: "pending",
      draftId: body.draftId,
      draftVersion: body.draftVersion,
    }
    store.data.operations[body.requestId] = { digest, receipt }
    store.save()
    try {
      if (action === "create" || action === "copy") {
        const source = action === "copy" ? get(targetId) : undefined
        const p = project(source?.projectId ?? targetId)
        if (
          source &&
          (isManaged(source) || readHistory(source.file).diagnostics.length)
        )
          throw new HostError("copy_unavailable", 409)
        const dir = join(config.dataDir, "sessions", p.projectId)
        mkdirSync(dir, { recursive: true, mode: 0o700 })
        // forkFrom reads the source without opening it as a writable manager.
        let manager = source
          ? SessionManager.forkFrom(source.file, p.cwd, dir)
          : SessionManager.create(p.cwd, dir)
        const file = manager.getSessionFile()!
        if (!existsSync(file)) {
          writeFileSync(file, `${JSON.stringify(manager.getHeader())}\n`, {
            flag: "wx",
            mode: 0o600,
          })
          manager = SessionManager.open(file)
        }
        const id = manager.getSessionId()
        const defaultModel = config.defaultModel
          ? models.some((m) => m.id === config.defaultModel)
            ? config.defaultModel
            : ""
          : (models[0]?.id ?? "")
        store.data.sessions[id] = {
          sessionId: id,
          projectId: p.projectId,
          file,
          title: source
            ? `Pi · ${snapshot(targetId).session.title}`
            : "Pi Session",
          updatedAt: new Date().toISOString(),
          status: "idle",
          modelId: defaultModel,
          aliases: {},
          originId: source?.sessionId,
        }
        return confirm(body.requestId, { state: "confirmed", sessionId: id })
      }
      const value = get(targetId)
      if (!isManaged(value))
        throw new HostError("external_session_read_only", 403)
      if (action === "interrupt") {
        const run = runs.get(targetId)
        if (!run?.driver || body.runId !== run.runId)
          throw new HostError("stale_run_id", 409)
        run.stopped = true
        await run.driver.abort()
        // This confirms submission; runtime becomes cancelled only after prompt settles.
        return confirm(body.requestId, {
          state: "confirmed",
          sessionId: targetId,
          runId: run.runId,
        })
      }
      if (
        Object.values(store.data.operations).some(
          ({ receipt: r }) =>
            r.requestId !== body.requestId &&
            r.targetId === targetId &&
            ["pending", "unknown"].includes(r.state),
        ) ||
        value.status === "unknown"
      )
        throw new HostError("reconcile_required", 409)
      if (runs.size) throw new HostError("host_busy", 409)
      if (
        typeof body.text !== "string" ||
        !body.text.trim() ||
        body.text.length > 32768 ||
        !Number.isInteger(body.draftVersion) ||
        !body.draftId
      )
        throw new HostError("invalid_message")
      if (!models.some((m) => m.id === body.modelId))
        throw new HostError("model_unavailable", 409)
      if (readHistory(value.file).diagnostics.length)
        throw new HostError("history_incomplete", 409)
      let markInitialized!: () => void
      const runId = randomUUID(),
        run: Run = {
          runId,
          requestId: body.requestId,
          count: 0,
          liveIds: new Map(),
          stopped: false,
          initialized: new Promise<void>((resolve) => {
            markInitialized = resolve
          }),
          finishInitialization: () => markInitialized(),
        }
      runs.set(targetId, run)
      value.runId = runId
      value.status = "starting"
      value.modelId = body.modelId!
      if (value.title === "Pi Session")
        value.title = safeText(body.text.trim(), 120)
      value.updatedAt = new Date().toISOString()
      confirm(body.requestId, { runId, sessionId: targetId })
      try {
        run.driver = await factory({
          cwd: project(value.projectId).cwd,
          file: value.file,
          modelId: body.modelId!,
        })
      } catch (error) {
        markInitialized()
        runs.delete(targetId)
        value.status = "failed"
        store.save()
        throw error
      }
      run.driver.manager.appendCustomEntry("easyuse-ui-command", {
        requestId: body.requestId,
        runId,
        draftVersion: body.draftVersion,
      })
      run.unsub = run.driver.subscribe((event) => {
        if (
          event.type === "message_start" &&
          event.message?.role === "assistant"
        ) {
          run.live = {
            id: `${runId}:message:${++run.count}`,
            message: event.message,
          }
          if (typeof event.message.timestamp === "number")
            run.liveIds.set(event.message.timestamp, run.live.id)
        }
        if (
          event.type === "message_update" &&
          event.message?.role === "assistant" &&
          run.live
        )
          run.live.message = event.message
        if (event.type === "message_end")
          setImmediate(() => {
            if (!runs.has(targetId)) return
            const parsed = readHistory(value.file)
            const entry = parsed.entries.findLast(
              (entry) =>
                entry.type === "message" &&
                entry.message?.timestamp === event.message?.timestamp &&
                entry.message?.role === event.message?.role,
            )
            if (event.message?.role === "user" && entry)
              confirm(body.requestId, { state: "confirmed" })
            const liveId =
              event.message?.timestamp === undefined
                ? undefined
                : run.liveIds.get(event.message.timestamp)
            if (event.message?.role === "assistant" && entry && liveId) {
              value.aliases[entry.id!] = liveId
              if (run.live?.message.timestamp === event.message.timestamp)
                run.live = undefined
              store.save()
            }
            emit(targetId)
          })
        if (event.type === "agent_start") value.status = "running"
        if (event.type === "agent_settled") run.sourceAborted = event.aborted
        if (!run.timer)
          run.timer = setTimeout(() => {
            run.timer = undefined
            if (runs.has(targetId)) emit(targetId)
          }, 50)
      })
      emit(targetId)
      run.settled = run.driver
        .prompt(body.text)
        .then(() => {
          const parsed = readHistory(value.file)
          const markerIndex = parsed.branch.findIndex(
            (entry) =>
              entry.type === "custom" &&
              record(entry.data).requestId === body.requestId,
          )
          const last = parsed.branch
            .slice(markerIndex + 1)
            .findLast(
              (entry) =>
                entry.type === "message" && entry.message?.role === "assistant",
            )
          value.status =
            run.sourceAborted || last?.message?.stopReason === "aborted"
              ? "cancelled"
              : last?.message?.stopReason === "error" || !last
                ? "failed"
                : "completed"
          if (
            store.data.operations[body.requestId].receipt.state === "pending"
          ) {
            // A finalized user entry under this run proves acceptance, independent of final model success.
            const markerIndex = parsed.branch.findIndex(
              (entry) =>
                entry.type === "custom" &&
                record(entry.data).requestId === body.requestId,
            )
            const accepted =
              markerIndex >= 0 &&
              parsed.branch
                .slice(markerIndex + 1)
                .some(
                  (entry) =>
                    entry.type === "message" && entry.message?.role === "user",
                )
            confirm(body.requestId, {
              state: accepted ? "confirmed" : "failed",
              reason: accepted ? undefined : "user_message_not_accepted",
            })
          }
        })
        .catch(() => {
          value.status = "failed"
          if (store.data.operations[body.requestId].receipt.state === "pending")
            confirm(body.requestId, {
              state: "unknown",
              reason: "execution_acknowledgement_missing",
            })
        })
        .finally(() => {
          run.unsub?.()
          if (run.timer) clearTimeout(run.timer)
          if (run.live) {
            const entry = readHistory(value.file).entries.findLast(
              (e) =>
                e.type === "message" &&
                e.message?.timestamp === run.live?.message.timestamp &&
                e.message?.role === "assistant",
            )
            if (entry) value.aliases[entry.id!] = run.live.id
          }
          run.driver?.dispose()
          runs.delete(targetId)
          value.updatedAt = new Date().toISOString()
          store.save()
          emit(targetId)
        })
      markInitialized()
      return store.data.operations[body.requestId].receipt
    } catch (error) {
      const run = runs.get(targetId)
      if (run?.requestId === body.requestId && !run.settled) {
        run.finishInitialization()
        run.driver?.dispose()
        runs.delete(targetId)
        store.data.sessions[targetId].status = "failed"
      }
      return confirm(body.requestId, {
        state: "failed",
        reason:
          error instanceof HostError ? error.message : "host_operation_failed",
      })
    }
  }
  const server = createServer(async (req, res) => {
    const json = (body: unknown, status = 200) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      })
      res.end(JSON.stringify(body))
    }
    try {
      const host = req.headers.host?.split(":")[0]
      if (!["127.0.0.1", "localhost"].includes(host ?? ""))
        throw new HostError("host_denied", 403)
      const origin = req.headers.origin
      if (origin && !config.allowedOrigins.includes(origin))
        throw new HostError("origin_denied", 403)
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin)
        res.setHeader("Vary", "Origin")
      }
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        })
        res.end()
        return
      }
      const token = req.headers.authorization?.replace(/^Bearer /, "") ?? ""
      if (
        Buffer.byteLength(token) !== Buffer.byteLength(config.token) ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(config.token))
      )
        throw new HostError("unauthorized", 401)
      const url = new URL(req.url ?? "/", "http://localhost"),
        path = url.pathname.split("/").filter(Boolean)
      if (path[0] !== "api" || path[1] !== "pi")
        throw new HostError("not_found", 404)
      if (req.method === "GET" && path[2] === "health") {
        json({
          protocolVersion: PI_PROTOCOL_VERSION,
          hostEpoch,
          sdkVersion: "1.1.0",
          models,
        })
        return
      }
      if (req.method === "GET" && path[2] === "projects" && path.length === 3) {
        json({
          projects: projects.map((p) => ({
            projectId: p.projectId,
            name: p.name,
            directory: p.cwd,
          })),
          models,
        })
        return
      }
      if (path[2] === "operations" && req.method === "GET") {
        const receipt = store.data.operations[path[3]]?.receipt
        if (!receipt) throw new HostError("operation_not_found", 404)
        json(receipt)
        return
      }
      if (path[2] === "projects" && path[4] === "sessions") {
        if (req.method === "GET") {
          const diagnostics = scan(path[3])
          const all = [
            ...Object.values(store.data.sessions),
            ...external.values(),
          ].filter((s) => s.projectId === path[3])
          const summaries: PiSession[] = []
          for (const value of all) {
            try {
              summaries.push(snapshot(value.sessionId).session)
            } catch {
              diagnostics.push("unreadable_session")
            }
          }
          summaries.sort(
            (a, b) =>
              b.updatedAt.localeCompare(a.updatedAt) ||
              a.sessionId.localeCompare(b.sessionId),
          )
          const offset = Number(url.searchParams.get("cursor") ?? 0)
          if (!Number.isInteger(offset) || offset < 0)
            throw new HostError("invalid_list_cursor")
          json({
            sessions: summaries.slice(offset, offset + 100),
            cursor:
              offset + 100 < summaries.length
                ? String(offset + 100)
                : undefined,
            diagnostics: [...new Set(diagnostics)],
          })
          return
        }
      }
      if (path[2] === "sessions" && req.method === "GET") {
        const id = path[3]
        get(id)
        if (path[4] === "history") {
          const value = get(id),
            before = url.searchParams.get("before")
          json(
            historyPage(
              readHistory(value.file),
              id,
              isManaged(value) ? value.aliases : {},
              runs.get(id)?.live,
              url.searchParams.get("cursor") ?? undefined,
              before
                ? { before, revision: url.searchParams.get("revision") ?? "" }
                : undefined,
            ),
          )
          return
        }
        if (path[4] === "events") {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
          })
          res.flushHeaders()
          const epoch = url.searchParams.get("epoch"),
            after = Number(url.searchParams.get("after") ?? 0),
            buffer = buffers.get(id) ?? []
          const latest = sequences.get(id) ?? 0
          if (
            epoch !== hostEpoch ||
            !Number.isInteger(after) ||
            after > latest ||
            after < (buffer[0]?.sequence ?? latest + 1) - 1
          )
            res.write(
              `data: ${JSON.stringify({ protocolVersion: PI_PROTOCOL_VERSION, hostEpoch, sessionId: id, sequence: latest, revision: snapshot(id).session.revision, type: "resync" })}\n\n`,
            )
          else
            for (const event of buffer)
              if (event.sequence > after)
                res.write(`data: ${JSON.stringify(event)}\n\n`)
          const set = clients.get(id) ?? new Set()
          set.add(res)
          clients.set(id, set)
          const heartbeat = setInterval(
            () => res.write(": heartbeat\n\n"),
            15000,
          )
          req.on("close", () => {
            clearInterval(heartbeat)
            set.delete(res)
          })
          return
        }
        json(snapshot(id))
        return
      }
      if (req.method === "POST") {
        let body = ""
        for await (const chunk of req) {
          body += chunk
          if (Buffer.byteLength(body) > 65536)
            throw new HostError("request_too_large", 413)
        }
        let input: PiCommand
        try {
          input = record(JSON.parse(body)) as PiCommand
        } catch {
          throw new HostError("invalid_json")
        }
        const action =
          path[2] === "projects" && path[4] === "sessions"
            ? "create"
            : path[2] === "sessions"
              ? (
                  {
                    messages: "send",
                    copy: "copy",
                    interrupt: "interrupt",
                  } as const
                )[path[4] as "messages"]
              : undefined
        if (!action) throw new HostError("not_found", 404)
        json(await command(action, path[3], input))
        return
      }
      throw new HostError("not_found", 404)
    } catch (error) {
      json(
        {
          error:
            error instanceof HostError ? error.message : "host_read_failed",
        },
        error instanceof HostError ? error.status : 500,
      )
    }
  })
  return {
    server,
    hostEpoch,
    store,
    snapshot,
    command,
    close() {
      closing ??= (async () => {
        // Keep the writer lock until startup and all source writes have settled.
        for (const run of runs.values()) {
          await run.initialized
          await run.driver?.abort()
          await run.settled
        }
        for (const set of clients.values())
          for (const client of set) client.destroy()
        server.closeAllConnections()
        await new Promise<void>((resolveClose) =>
          server.close(() => resolveClose()),
        )
        store.close()
      })()
      return closing
    },
  }
}
