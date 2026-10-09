/** Controlled browser backend. This is never used by pi:host. */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { createPiHost } from "../src/host.ts"
import type { DriverEvent, DriverFactory } from "../src/sdk.ts"
import type { RawMessage } from "../src/history.ts"

const dir = mkdtempSync(join(tmpdir(), "easyuse-pi-browser-")),
  cwd = join(dir, "project"),
  other = join(dir, "other"),
  external = join(dir, "external")
for (const path of [cwd, other, external]) mkdirSync(path)
const token = "controlled-browser-service-token-0000000000"
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const factory: DriverFactory = async ({ file }) => {
  const manager = SessionManager.open(file),
    listeners = new Set<(e: DriverEvent) => void>()
  let aborted = false,
    release: (() => void) | undefined
  const emit = (event: DriverEvent) => {
    for (const listener of listeners) listener(event)
  }
  const persist = (message: RawMessage) => {
    manager.appendMessage(
      message as Parameters<SessionManager["appendMessage"]>[0],
    )
    emit({ type: "message_end", message })
  }
  return {
    manager,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    dispose: () => {},
    abort: async () => {
      aborted = true
      release?.()
    },
    prompt: async (text) => {
      emit({ type: "agent_start" })
      persist({ role: "user", content: text, timestamp: Date.now() })
      await pause(100)
      const timestamp = Date.now(),
        callId = `call-${timestamp}`
      const streaming: RawMessage = {
        role: "assistant",
        timestamp,
        content: [
          { type: "text", text: "Fixture streaming answer" },
          {
            type: "toolCall",
            id: callId,
            name: "read",
            arguments: { path: "fixture.txt" },
          },
        ],
      }
      emit({ type: "message_start", message: streaming })
      emit({ type: "message_update", message: streaming })
      await pause(200)
      persist({ ...streaming, stopReason: "toolUse" })
      persist({
        role: "toolResult",
        timestamp: Date.now(),
        toolCallId: callId,
        toolName: "read",
        isError: text.includes("tool-fail"),
        content: [
          {
            type: "text",
            text: text.includes("tool-fail")
              ? "fixture read failed"
              : "fixture read result",
          },
        ],
      })
      if (text.includes("hold"))
        await new Promise<void>((resolve) => {
          release = resolve
          if (aborted) resolve()
        })
      else for (let i = 0; i < 5 && !aborted; i++) await pause(100)
      persist({
        role: "assistant",
        timestamp: Date.now(),
        content: [
          {
            type: "text",
            text: aborted ? "Fixture stopped partial" : "Fixture final output",
          },
        ],
        stopReason: aborted ? "aborted" : "stop",
      })
      emit({ type: "agent_settled" })
    },
  }
}
const host = createPiHost(
  {
    port: Number(process.env.PI_BROWSER_HOST_PORT ?? 3013),
    dataDir: join(dir, "host"),
    token,
    allowedOrigins: ["http://127.0.0.1:3010", "http://127.0.0.1:3011"],
    projects: [
      {
        projectId: "first",
        name: "Fixture project",
        cwd,
        sessionDirs: [external],
      },
      { projectId: "second", name: "Other project", cwd: other },
    ],
  },
  [{ id: "fixture/model", label: "Controlled fixture model" }],
  factory,
)
const receipt = await host.command("create", "first", {
  requestId: "fixture-create-001",
})
const managed = host.store.data.sessions[receipt.sessionId!]
managed.title = "Fixture long history"
const manager = SessionManager.open(managed.file)
for (let i = 0; i < 1000; i++)
  manager.appendMessage({
    role: i % 2 ? "assistant" : "user",
    content: [
      {
        type: "text",
        text: `History record ${i} · ${"readable history ".repeat(10)}`,
      },
    ],
    timestamp: 1700000000000 + i,
  } as Parameters<SessionManager["appendMessage"]>[0])
host.store.save()
writeFileSync(
  join(external, "external.jsonl"),
  [
    {
      type: "session",
      version: 3,
      id: "external-native",
      cwd,
      timestamp: "2026-01-01T00:00:00Z",
    },
    {
      type: "message",
      id: "external-user",
      parentId: null,
      message: {
        role: "user",
        content: "External historical fact",
        timestamp: 1,
      },
    },
  ]
    .map((entry) => JSON.stringify(entry))
    .join("\n") + "\n",
)
host.server.listen(
  Number(process.env.PI_BROWSER_HOST_PORT ?? 3013),
  "127.0.0.1",
  () => console.log("Browser fixture Host ready"),
)
process.on("SIGTERM", () => {
  void host.close().then(() => {
    rmSync(dir, { recursive: true, force: true })
  })
})
