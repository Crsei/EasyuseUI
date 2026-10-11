/** Browser-safe Host protocol. SDK and filesystem types stay in services/pi-host. */
export const PI_PROTOCOL_VERSION = 1 as const
export type PiProject = { projectId: string; name: string; directory: string }
export type PiModel = { id: string; label: string }
export type PiTool = {
  id: string
  name: string
  status: string
  arguments?: unknown
  output?: string
  error?: string
  outcome?: "known" | "unknown"
}
export type PiPart =
  | { id: string; kind: "text"; text: string }
  | { id: string; kind: "tool"; toolCallId: string }
  | { id: string; kind: "phase"; phase: "action" | "output" }
export type PiMessage = {
  id: string
  role: "user" | "agent" | "system"
  timestamp: string
  state: "streaming" | "completed" | "failed" | "cancelled"
  turnId: string
  parts: PiPart[]
}
export type PiSession = {
  sessionId: string
  projectId: string
  title: string
  source: "managed" | "external"
  updatedAt: string
  status: string
  runId?: string
  originId?: string
  branchId: string | null
  branchCount: number
  revision: string
  diagnostics: string[]
  capabilities: { send: boolean; interrupt: boolean; copy: boolean }
  modelId: string
  sequence: number
  hostEpoch: string
}
export type PiHistory = {
  sessionId: string
  revision: string
  branchId: string | null
  messages: PiMessage[]
  tools: PiTool[]
  cursor?: string
  diagnostics: string[]
}
export type PiSnapshot = { session: PiSession; history: PiHistory }
export type PiReceipt = {
  requestId: string
  action: "create" | "copy" | "send" | "interrupt"
  targetId: string
  state: "pending" | "confirmed" | "failed" | "unknown"
  sessionId?: string
  runId?: string
  draftVersion?: number
  draftId?: string
  reason?: string
}
export type PiEvent = {
  protocolVersion: typeof PI_PROTOCOL_VERSION
  hostEpoch: string
  sessionId: string
  runId?: string
  sequence: number
  revision: string
  type: "snapshot" | "resync"
  payload?: PiSnapshot
}
export type PiCommand = {
  requestId: string
  text?: string
  draftVersion?: number
  draftId?: string
  runId?: string
  modelId?: string
}
