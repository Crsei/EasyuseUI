import { createHash } from "node:crypto"
import { openSync, closeSync, readSync, statSync } from "node:fs"
import type {
  PiHistory,
  PiMessage,
  PiPart,
  PiTool,
} from "../../../lib/pi-workspace-protocol.ts"

export type RawEntry = {
  type: string
  id?: string
  parentId?: string | null
  timestamp?: string
  cwd?: string
  version?: number
  message?: RawMessage
  customType?: string
  data?: unknown
  content?: unknown
  display?: boolean
  summary?: string
  name?: string
}
export type RawMessage = {
  role: string
  content?: unknown
  timestamp?: number
  toolCallId?: string
  toolName?: string
  isError?: boolean
  stopReason?: string
  errorMessage?: string
}
export type ParsedHistory = {
  header: RawEntry
  entries: RawEntry[]
  branch: RawEntry[]
  leaf: string | null
  branchCount: number
  revision: string
  diagnostics: string[]
}
export class HostError extends Error {
  status: number
  constructor(code: string, status = 400) {
    super(code)
    this.status = status
  }
}
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
/** Shared bounds apply before transport, rendering, copy and export. No hidden thinking. */
export function safeText(value: unknown, maximum = 32768): string {
  const text = typeof value === "string" ? value : (JSON.stringify(value) ?? "")
  const redacted = text
    .replace(
      /("?(?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|authorization|secret)"?\s*[:=]\s*)("[^"]*"|[^\s,}\n]+)/gi,
      "$1[REDACTED]",
    )
    .replace(
      /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{16,}|Bearer\s+[A-Za-z0-9._-]+)/g,
      "[REDACTED]",
    )
  if (Buffer.byteLength(redacted) <= maximum) return redacted
  let bytes = 0,
    prefix = ""
  for (const character of redacted) {
    const size = Buffer.byteLength(character)
    if (bytes + size > maximum) break
    bytes += size
    prefix += character
  }
  return `${prefix}\n[truncated]`
}
export function contentText(content: unknown): string {
  if (typeof content === "string") return safeText(content)
  if (!Array.isArray(content)) return ""
  return safeText(
    content
      .filter((p) => record(p).type === "text")
      .map((p) => record(p).text ?? "")
      .join("\n"),
  )
}
const cache = new Map<string, ParsedHistory>()
const cacheBytes = new Map<string, number>()
export function readHistory(file: string): ParsedHistory {
  const stat = statSync(file)
  if (!stat.isFile()) throw new HostError("not_a_session_file")
  const revision = createHash("sha256")
    .update(
      `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`,
    )
    .digest("hex")
  const cached = cache.get(file)
  if (cached?.revision === revision) return cached
  const maximum = 64 * 1024 * 1024
  const buffer = Buffer.alloc(Math.min(stat.size, maximum))
  const fd = openSync(file, "r")
  try {
    readSync(fd, buffer, 0, buffer.length, 0)
  } finally {
    closeSync(fd)
  }
  const diagnostics: string[] = stat.size > maximum ? ["file_size_limit"] : []
  const lines = buffer.toString("utf8").split("\n")
  const values: RawEntry[] = []
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue
    try {
      const value = record(JSON.parse(lines[index]))
      if (typeof value.type !== "string") throw new Error()
      values.push(value as RawEntry)
    } catch {
      diagnostics.push(
        index === lines.length - 1 ? "incomplete_tail" : "invalid_line",
      )
    }
  }
  const header = values[0]
  if (
    header?.type !== "session" ||
    typeof header.id !== "string" ||
    typeof header.cwd !== "string"
  )
    throw new HostError("invalid_session_header")
  if (header.version !== 3) throw new HostError("unsupported_session_version")
  const entries = values
    .slice(1)
    .filter((entry) => typeof entry.id === "string")
  if (entries.length !== values.length - 1) diagnostics.push("missing_entry_id")
  const byId = new Map(entries.map((entry) => [entry.id!, entry]))
  if (byId.size !== entries.length) diagnostics.push("duplicate_entry_id")
  const branch: RawEntry[] = []
  let leaf = entries.at(-1)?.id ?? null
  const seen = new Set<string>()
  while (leaf) {
    if (seen.has(leaf)) {
      diagnostics.push("cyclic_parent_chain")
      break
    }
    seen.add(leaf)
    const entry = byId.get(leaf)
    if (!entry) {
      diagnostics.push("missing_parent")
      break
    }
    branch.push(entry)
    leaf = entry.parentId ?? null
  }
  const parents = new Set(entries.map((e) => e.parentId))
  const result = {
    header,
    entries,
    branch: branch.reverse(),
    leaf: entries.at(-1)?.id ?? null,
    branchCount: entries.filter((e) => !parents.has(e.id)).length,
    revision,
    diagnostics: [...new Set(diagnostics)],
  }
  cache.delete(file)
  cacheBytes.delete(file)
  const budget = 32 * 1024 * 1024
  while (
    cache.size >= 64 ||
    [...cacheBytes.values()].reduce((a, b) => a + b, 0) + stat.size > budget
  ) {
    const oldest = cache.keys().next().value
    if (!oldest) break
    cache.delete(oldest)
    cacheBytes.delete(oldest)
  }
  if (stat.size <= budget) {
    cache.set(file, result)
    cacheBytes.set(file, stat.size)
  }
  return result
}
export function projectHistory(
  parsed: ParsedHistory,
  sessionId: string,
  aliases: Record<string, string> = {},
  live?: { id: string; message: RawMessage },
): { messages: PiMessage[]; tools: PiTool[] } {
  const messages: PiMessage[] = [],
    tools = new Map<string, PiTool>()
  let turnId = sessionId,
    phase: "action" | "output" | undefined
  const projectMessage = (entry: RawEntry, id: string, streaming = false) => {
    const raw = entry.message!
    if (raw.role === "toolResult") {
      const tool = tools.get(raw.toolCallId ?? "")
      if (tool)
        tools.set(tool.id, {
          ...tool,
          status: raw.isError ? "failed" : "completed",
          output: contentText(raw.content),
          error: raw.isError ? contentText(raw.content) : undefined,
          outcome: "known",
        })
      return
    }
    if (!["user", "assistant"].includes(raw.role)) return
    if (raw.role === "user") {
      turnId = id
      phase = undefined
    }
    const parts: PiPart[] = []
    const blocks =
      typeof raw.content === "string"
        ? [{ type: "text", text: raw.content }]
        : Array.isArray(raw.content)
          ? raw.content
          : []
    blocks.forEach((block, index) => {
      const p = record(block),
        partId = `${id}:p:${index}`
      if (p.type === "text" && typeof p.text === "string" && p.text) {
        if (raw.role === "assistant" && phase && phase !== "output")
          parts.push({ id: `${partId}:phase`, kind: "phase", phase: "output" })
        if (raw.role === "assistant") phase = "output"
        parts.push({ id: partId, kind: "text", text: safeText(p.text) })
      } else if (
        p.type === "toolCall" &&
        typeof p.id === "string" &&
        typeof p.name === "string"
      ) {
        if (phase !== "action")
          parts.push({ id: `${partId}:phase`, kind: "phase", phase: "action" })
        phase = "action"
        tools.set(p.id, {
          id: p.id,
          name: p.name,
          status: streaming ? "running" : "waiting",
          arguments: safeText(p.arguments ?? {}, 8192),
          outcome: streaming ? "known" : "unknown",
        })
        parts.push({ id: partId, kind: "tool", toolCallId: p.id })
      } else if (
        typeof p.type === "string" &&
        !["thinking", "text"].includes(p.type)
      ) {
        parts.push({
          id: partId,
          kind: "text",
          text: `[unsupported content block: ${safeText(p.type, 80)}]`,
        })
      }
    })
    if (raw.stopReason === "error" && raw.errorMessage)
      parts.push({
        id: `${id}:error`,
        kind: "text",
        text: safeText(raw.errorMessage),
      })
    messages.push({
      id,
      role: raw.role === "user" ? "user" : "agent",
      turnId,
      timestamp: new Date(
        raw.timestamp ?? (Date.parse(entry.timestamp ?? "") || 0),
      ).toISOString(),
      state: streaming
        ? "streaming"
        : raw.stopReason === "error"
          ? "failed"
          : raw.stopReason === "aborted"
            ? "cancelled"
            : "completed",
      parts,
    })
  }
  for (const entry of parsed.branch) {
    const id = aliases[entry.id!] ?? entry.id!
    if (entry.type === "message" && entry.message) projectMessage(entry, id)
    else if (entry.type === "custom_message" && entry.display)
      messages.push({
        id,
        role: "system",
        timestamp: entry.timestamp ?? "",
        turnId,
        state: "completed",
        parts: [
          { id: `${id}:text`, kind: "text", text: contentText(entry.content) },
        ],
      })
    else if (entry.type === "compaction" || entry.type === "branch_summary")
      messages.push({
        id,
        role: "system",
        timestamp: entry.timestamp ?? "",
        turnId,
        state: "completed",
        parts: [
          {
            id: `${id}:text`,
            kind: "text",
            text: `${entry.type}\n${safeText(entry.summary ?? "")}`,
          },
        ],
      })
  }
  if (live && !messages.some((m) => m.id === live.id))
    projectMessage({ type: "message", message: live.message }, live.id, true)
  return { messages, tools: [...tools.values()] }
}
export function historyPage(
  parsed: ParsedHistory,
  sessionId: string,
  aliases: Record<string, string>,
  live?: { id: string; message: RawMessage },
  cursor?: string,
  anchor?: { before: string; revision: string },
): PiHistory {
  const projection = projectHistory(parsed, sessionId, aliases, live)
  const toolsById = new Map(projection.tools.map((tool) => [tool.id, tool]))
  const maximum = 496 * 1024 // Leave room for the page envelope and cursor.
  const diagnostics = [...parsed.diagnostics]
  const messageBytes = (message: PiMessage) =>
    Buffer.byteLength(JSON.stringify(message)) +
    message.parts.reduce(
      (bytes, part) =>
        bytes +
        (part.kind === "tool"
          ? Buffer.byteLength(
              JSON.stringify(toolsById.get(part.toolCallId) ?? null),
            )
          : 0),
      0,
    )
  projection.messages = projection.messages.map((message) => {
    if (messageBytes(message) <= maximum) return message
    const bounded = { ...message, parts: [] as PiPart[] }
    let bytes = messageBytes(bounded)
    for (const part of message.parts) {
      const size =
        Buffer.byteLength(JSON.stringify(part)) +
        (part.kind === "tool"
          ? Buffer.byteLength(
              JSON.stringify(toolsById.get(part.toolCallId) ?? null),
            )
          : 0)
      if (bytes + size > maximum - 1024) break
      bytes += size + 1
      bounded.parts.push(part)
    }
    bounded.parts.push({
      id: `${message.id}:preview-limit`,
      kind: "text",
      text: "[truncated: message preview size limit]",
    })
    diagnostics.push("message_size_limit")
    return bounded
  })
  let end = projection.messages.length
  if (anchor) {
    const index = projection.messages.findIndex(
      (message) => message.id === anchor.before,
    )
    if (anchor.revision !== parsed.revision || index < 0)
      throw new HostError("history_cursor_expired", 409)
    end = index
  }
  if (cursor) {
    try {
      const value = JSON.parse(Buffer.from(cursor, "base64url").toString())
      if (
        value.sessionId !== sessionId ||
        value.revision !== parsed.revision ||
        value.leaf !== parsed.leaf ||
        !Number.isInteger(value.end) ||
        value.end < 0 ||
        value.end > end
      )
        throw new Error()
      end = value.end
    } catch {
      throw new HostError("history_cursor_expired", 409)
    }
  }
  let start = end,
    bytes = 0
  while (start > 0 && end - start < 50) {
    const size = messageBytes(projection.messages[start - 1]) + 1
    if (bytes + size > maximum && start < end) break
    bytes += size
    start--
  }
  const messages = projection.messages.slice(start, end)
  const toolIds = new Set(
    messages.flatMap((m) =>
      m.parts
        .filter((p) => p.kind === "tool")
        .map((p) => (p.kind === "tool" ? p.toolCallId : "")),
    ),
  )
  return {
    sessionId,
    revision: parsed.revision,
    branchId: parsed.leaf,
    messages,
    tools: projection.tools.filter((t) => toolIds.has(t.id)),
    diagnostics: [...new Set(diagnostics)],
    cursor: start
      ? Buffer.from(
          JSON.stringify({
            sessionId,
            revision: parsed.revision,
            leaf: parsed.leaf,
            end: start,
          }),
        ).toString("base64url")
      : undefined,
  }
}
