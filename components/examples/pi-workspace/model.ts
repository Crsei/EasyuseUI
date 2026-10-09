import type {
  PiSnapshot,
  PiSession,
  PiProject,
} from "@/lib/pi-workspace-protocol"
import type { DraftState, SessionSnapshot } from "@/lib/agent-workbench-model"

export function mergeSnapshot(
  previous: PiSnapshot | undefined,
  next: PiSnapshot,
): PiSnapshot {
  if (!previous || previous.session.sessionId !== next.session.sessionId)
    return next
  if (
    previous.session.hostEpoch === next.session.hostEpoch &&
    previous.session.sequence > next.session.sequence
  )
    return previous
  const incoming = new Set(next.history.messages.map((m) => m.id))
  const overlap = previous.history.messages.findIndex((m) => incoming.has(m.id))
  const earlier =
    overlap >= 0 ? previous.history.messages.slice(0, overlap) : []
  const messages = [...earlier, ...next.history.messages]
  const usedTools = new Set(
    messages.flatMap((m) =>
      m.parts.flatMap((p) => (p.kind === "tool" ? [p.toolCallId] : [])),
    ),
  )
  const tools = new Map(
    [...previous.history.tools, ...next.history.tools].map((t) => [t.id, t]),
  )
  return {
    ...next,
    history: {
      ...next.history,
      messages,
      tools: [...tools.values()].filter((t) => usedTools.has(t.id)),
      cursor: earlier.length ? previous.history.cursor : next.history.cursor,
    },
  }
}
export function workbenchSnapshot(
  summary: PiSession,
  project?: PiProject,
  snapshot?: PiSnapshot,
  connection: "connected" | "disconnected" | "unknown" = "connected",
): SessionSnapshot {
  return {
    sessionId: summary.sessionId,
    projectId: summary.projectId,
    source: summary.source,
    agent: { id: "pi", name: "Pi" },
    title: summary.title,
    activeRunId: summary.runId ?? "",
    revision: summary.sequence,
    cursor: summary.sequence,
    status: summary.status,
    updatedAt: summary.updatedAt,
    environment: {
      environmentId: summary.projectId,
      name: project?.name ?? summary.projectId,
      worktree: project?.directory,
      connection,
      capabilities: ["read-only"],
    },
    capabilities: {
      send: summary.capabilities.send,
      interrupt: summary.capabilities.interrupt,
      queue: false,
      steer: false,
    },
    contextSources: [],
    attention: [],
    artifacts: [],
    plan: [],
    changes: {
      repositoryId: summary.projectId,
      scope: "unavailable",
      base: "",
      head: "",
      revision: "",
      files: [],
    },
    output: { text: "", source: "Pi", timestamp: summary.updatedAt },
    dataState: summary.diagnostics.length
      ? "partial"
      : snapshot?.history.messages.length
        ? "success"
        : "empty",
    history: {
      hasMore: Boolean(snapshot?.history.cursor),
      cursor: snapshot?.history.cursor,
    },
    tools: snapshot?.history.tools ?? [],
    messages:
      snapshot?.history.messages.map((m, index) => ({
        messageId: m.id,
        turnId: m.turnId,
        role: m.role,
        sequence: index,
        revision: summary.sequence,
        state: m.state,
        timestamp: m.timestamp,
        parts: m.parts.map((part, partIndex) => ({
          partId: part.id,
          sequence: partIndex,
          revision: summary.sequence,
          ...(part.kind === "text"
            ? { kind: "text" as const, text: part.text }
            : part.kind === "phase"
              ? { kind: "phase" as const, phase: part.phase, label: part.phase }
              : {
                  kind: "tool" as const,
                  referenceId: part.toolCallId,
                  label:
                    snapshot.history.tools.find((t) => t.id === part.toolCallId)
                      ?.name ?? "Tool",
                }),
        })),
      })) ?? [],
  }
}
export function emptyDraft(
  id: string,
  modelId: string,
  projectId: string,
): DraftState {
  return {
    draftId: `draft-${id}`,
    version: 0,
    text: "",
    context: [],
    mode: "send",
    modelId,
    permissionId: "read-only",
    environmentId: projectId,
  }
}
