import { test } from "node:test"
import assert from "node:assert/strict"
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  statSync,
  rmSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { request } from "node:http"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { createPiHost, type HostConfig } from "../src/host.ts"
import {
  readHistory,
  historyPage,
  projectHistory,
  type RawMessage,
} from "../src/history.ts"
import type { DriverEvent, DriverFactory } from "../src/sdk.ts"
import type {
  PiCommand,
  PiReceipt,
} from "../../../lib/pi-workspace-protocol.ts"

const token = "test-only-credential-000000000000000"
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
async function eventually(condition: () => boolean) {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (condition()) return
    await sleep(10)
  }
  assert.fail("condition did not settle")
}
function fixture(startupDelay = 0) {
  const dir = mkdtempSync(join(tmpdir(), "easyuse-pi-")),
    cwd = join(dir, "project"),
    other = join(dir, "other"),
    external = join(dir, "external")
  for (const path of [cwd, other, external]) mkdirSync(path)
  const config: HostConfig = {
    port: 0,
    token,
    dataDir: join(dir, "host"),
    allowedOrigins: ["http://127.0.0.1:3011"],
    projects: [
      { projectId: "first", name: "First", cwd, sessionDirs: [external] },
      {
        projectId: "second",
        name: "Second",
        cwd: other,
        sessionDirs: [external],
      },
    ],
  }
  let prompts = 0
  const contexts: string[] = []
  const factory: DriverFactory = async ({ file }) => {
    if (startupDelay) await sleep(startupDelay)
    const manager = SessionManager.open(file),
      listeners = new Set<(e: DriverEvent) => void>()
    const emit = (event: DriverEvent) => {
      for (const listener of listeners) listener(event)
    }
    let release: (() => void) | undefined,
      aborted = false
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
        prompts++
        contexts.push(JSON.stringify(manager.buildSessionContext().messages))
        emit({ type: "agent_start" })
        persist({
          role: "user",
          timestamp: Date.now(),
          content: [{ type: "text", text }],
        })
        await sleep(20)
        const timestamp = Date.now()
        const assistant: RawMessage = {
          role: "assistant",
          timestamp,
          content: [
            {
              type: "thinking",
              thinking: "never publish this private reasoning",
            },
            { type: "text", text: "Before read" },
            {
              type: "toolCall",
              id: `call-${prompts}`,
              name: "read",
              arguments: { path: "fixture.txt", apiKey: "private-credential" },
            },
          ],
        }
        emit({ type: "message_start", message: assistant })
        emit({ type: "message_update", message: assistant })
        await sleep(80)
        persist({ ...assistant, stopReason: "toolUse" })
        persist({
          role: "toolResult",
          timestamp: Date.now(),
          toolCallId: `call-${prompts}`,
          toolName: "read",
          isError: text.includes("tool-fail"),
          content: [
            {
              type: "text",
              text: "fixture result authorization=private-value",
            },
          ],
        })
        if (text.includes("hold"))
          await new Promise<void>((resolve) => {
            release = resolve
            if (aborted) resolve()
          })
        persist({
          role: "assistant",
          timestamp: Date.now(),
          content: [
            { type: "text", text: aborted ? "Stopped partial" : "After read" },
          ],
          stopReason: aborted ? "aborted" : "stop",
        })
        emit({ type: "agent_settled" })
      },
    }
  }
  const host = createPiHost(
    config,
    [{ id: "fake/model", label: "Controlled test model" }],
    factory,
  )
  return {
    dir,
    cwd,
    other,
    external,
    config,
    factory,
    host,
    contexts,
    get prompts() {
      return prompts
    },
  }
}
async function create(
  f: ReturnType<typeof fixture>,
  requestId = "create-0001",
) {
  const receipt = await f.host.command("create", "first", { requestId })
  assert.equal(receipt.state, "confirmed")
  return receipt.sessionId!
}
function send(
  id: string,
  text = "test",
  requestId = "send-0000001",
): PiCommand {
  return {
    requestId,
    text,
    draftId: id,
    draftVersion: 1,
    modelId: "fake/model",
  }
}

test("persistent creation, idempotent sends, source acceptance, tools, ordered parts and native context on restart", async () => {
  const f = fixture()
  try {
    const id = await create(f)
    assert.equal(
      await f.host
        .command("create", "first", { requestId: "create-0001" })
        .then((r) => r.sessionId),
      id,
    )
    const body = send(id, "unique-fact-724")
    await Promise.all([
      f.host.command("send", id, body),
      f.host.command("send", id, body),
    ])
    await eventually(() => f.host.snapshot(id).session.status === "completed")
    assert.equal(f.prompts, 1)
    assert.equal(
      f.host.store.data.operations[body.requestId].receipt.state,
      "confirmed",
    )
    const snapshot = f.host.snapshot(id)
    assert.equal(snapshot.history.messages.length, 3)
    assert.deepEqual(
      snapshot.history.messages[1].parts.map((p) => p.kind),
      ["text", "phase", "tool"],
    )
    assert.deepEqual(
      snapshot.history.messages[2].parts.map((p) => p.kind),
      ["phase", "text"],
    )
    assert.equal(snapshot.history.tools[0].status, "completed")
    assert.doesNotMatch(
      JSON.stringify(snapshot),
      /private-credential|private-value|private reasoning/,
    )
    await assert.rejects(
      f.host.command("send", id, { ...body, text: "different" }),
      /request_id_conflict/,
    )
    await f.host.close()
    const restarted = createPiHost(
      f.config,
      [{ id: "fake/model", label: "Fixture" }],
      f.factory,
    )
    try {
      assert.deepEqual(
        restarted.snapshot(id).history.messages,
        snapshot.history.messages,
      )
      await restarted.command(
        "send",
        id,
        send(id, "Recall unique fact", "send-0000002"),
      )
      await eventually(
        () => restarted.snapshot(id).session.status === "completed",
      )
      assert.match(f.contexts[1], /unique-fact-724/)
    } finally {
      await restarted.close()
    }
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})

test("stops wait for source settlement, stale run IDs cannot cancel later work, global busy and external IDs reject writes", async () => {
  const f = fixture()
  try {
    const id = await create(f),
      other = await create(f, "create-0002")
    const first = await f.host.command(
      "send",
      id,
      send(id, "hold", "send-hold-001"),
    )
    await eventually(() => f.host.snapshot(id).session.status === "running")
    assert.equal(
      (
        await f.host.command(
          "send",
          other,
          send(other, "test", "send-busy-001"),
        )
      ).reason,
      "host_busy",
    )
    assert.equal(
      (
        await f.host.command("interrupt", id, {
          requestId: "stop-stale-001",
          runId: "wrong",
        })
      ).reason,
      "stale_run_id",
    )
    await f.host.command("interrupt", id, {
      requestId: "stop-valid-001",
      runId: first.runId,
    })
    await eventually(() => f.host.snapshot(id).session.status === "cancelled")
    assert.equal(f.host.snapshot(id).history.tools[0].status, "completed")
    assert.equal(
      f.host.snapshot(id).history.messages.at(-1)?.state,
      "cancelled",
    )
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})

test("shutdown waits for an initializing run and durable source settlement before releasing the writer lock", async () => {
  const f = fixture(100)
  try {
    const id = await create(f)
    const sending = f.host.command(
      "send",
      id,
      send(id, "hold", "shutdown-send-001"),
    )
    const closing = f.host.close()
    assert.throws(
      () => createPiHost(f.config, [], f.factory),
      /managed_directory_locked/,
    )
    await Promise.all([sending, closing])
    const restarted = createPiHost(f.config, [], f.factory)
    try {
      assert.equal(restarted.snapshot(id).session.status, "cancelled")
      assert.equal(
        restarted.store.data.operations["shutdown-send-001"].receipt.state,
        "confirmed",
      )
      assert.match(
        JSON.stringify(restarted.snapshot(id).history),
        /Stopped partial/,
      )
    } finally {
      await restarted.close()
    }
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})

test("read-only external source and copy preserve bytes/mtime, branch selection, compaction and project isolation", async () => {
  const f = fixture()
  try {
    const file = join(f.external, "external.jsonl")
    const entries = [
      {
        type: "session",
        version: 3,
        id: "native-external",
        cwd: f.cwd,
        timestamp: "2026-01-01T00:00:00Z",
      },
      {
        type: "message",
        id: "a",
        parentId: null,
        message: { role: "user", content: "original fact", timestamp: 1 },
      },
      {
        type: "message",
        id: "abandoned",
        parentId: "a",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "abandoned branch" }],
          timestamp: 2,
        },
      },
      {
        type: "message",
        id: "chosen",
        parentId: "a",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "active branch" }],
          timestamp: 3,
        },
      },
      {
        type: "compaction",
        id: "compact",
        parentId: "chosen",
        summary: "saved fact",
        firstKeptEntryId: "chosen",
        tokensBefore: 99,
        timestamp: "2026-01-01T00:00:01Z",
      },
      {
        type: "custom_message",
        id: "hidden",
        parentId: "compact",
        display: false,
        content: "secret extension data",
      },
    ]
    writeFileSync(
      file,
      entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n",
    )
    const before = readFileSync(file),
      mtime = statSync(file).mtimeMs
    const parsed = readHistory(file),
      projection = projectHistory(parsed, "opaque")
    assert.equal(parsed.branchCount, 2)
    assert.doesNotMatch(
      JSON.stringify(projection),
      /abandoned branch|secret extension/,
    )
    assert.match(JSON.stringify(projection), /original fact|saved fact/)
    await new Promise<void>((resolve) =>
      f.host.server.listen(0, "127.0.0.1", resolve),
    )
    const address = f.host.server.address()
    assert.ok(address && typeof address !== "string")
    const api = async (path: string) =>
      (
        await fetch(`http://127.0.0.1:${address.port}/api/pi/${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).json()
    const list = await api("projects/first/sessions")
    assert.equal(list.sessions.length, 1)
    assert.equal((await api("projects/second/sessions")).sessions.length, 0)
    const externalId = list.sessions[0].sessionId
    assert.equal(
      (await f.host.command("send", externalId, send(externalId))).reason,
      "external_session_read_only",
    )
    const copied = await f.host.command("copy", externalId, {
      requestId: "copy-0000001",
    })
    assert.equal(copied.state, "confirmed")
    assert.equal(
      f.host.snapshot(copied.sessionId!).session.originId,
      externalId,
    )
    assert.deepEqual(readFileSync(file), before)
    assert.equal(statSync(file).mtimeMs, mtime)
    assert.equal(f.host.snapshot(copied.sessionId!).history.messages.length, 3)
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})

test("1000-entry paging is stable, bounded and cursor rejects modified snapshots; corrupt tail preserves data", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-history-")),
    file = join(dir, "history.jsonl")
  try {
    const lines = [
      JSON.stringify({ type: "session", version: 3, id: "native", cwd: dir }),
    ]
    for (let n = 0; n < 1000; n++)
      lines.push(
        JSON.stringify({
          type: "message",
          id: `m-${n}`,
          parentId: n ? `m-${n - 1}` : null,
          message: {
            role: n % 2 ? "assistant" : "user",
            timestamp: n,
            content: [{ type: "text", text: `message-${n}` }],
          },
        }),
      )
    writeFileSync(file, lines.join("\n") + "\n")
    const parsed = readHistory(file)
    let page = historyPage(parsed, "stable", {}),
      ids = page.messages.map((m) => m.id),
      totalBytes = 0
    const stale = page.cursor!
    while (page.cursor) {
      totalBytes += Buffer.byteLength(JSON.stringify(page))
      page = historyPage(parsed, "stable", {}, undefined, page.cursor)
      ids = [...page.messages.map((m) => m.id), ...ids]
    }
    assert.equal(ids.length, 1000)
    assert.equal(new Set(ids).size, 1000)
    assert.equal(ids[0], "m-0")
    assert.ok(totalBytes < 512 * 1024)
    writeFileSync(file, readFileSync(file, "utf8") + '{"type":')
    const partial = readHistory(file)
    assert.deepEqual(partial.diagnostics, ["incomplete_tail"])
    assert.equal(projectHistory(partial, "stable").messages.length, 1000)
    assert.throws(
      () => historyPage(partial, "stable", {}, undefined, stale),
      /history_cursor_expired/,
    )
    assert.throws(
      () => historyPage(parsed, "other", {}, undefined, stale),
      /history_cursor_expired/,
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("single writer lock, durable pending survives restart as unknown and prevents duplicate execution", async () => {
  const f = fixture()
  try {
    const id = await create(f)
    assert.throws(
      () => createPiHost(f.config, [], f.factory),
      /managed_directory_locked/,
    )
    f.host.store.data.sessions[id].status = "running"
    const receipt: PiReceipt = {
      requestId: "crashed-request",
      action: "send",
      targetId: id,
      state: "pending",
    }
    f.host.store.data.operations[receipt.requestId] = {
      receipt,
      digest: "crashed",
    }
    f.host.store.save()
    await f.host.close()
    const restarted = createPiHost(
      f.config,
      [{ id: "fake/model", label: "Fixture" }],
      f.factory,
    )
    try {
      assert.equal(restarted.snapshot(id).session.status, "unknown")
      assert.equal(
        restarted.store.data.operations[receipt.requestId].receipt.state,
        "unknown",
      )
      assert.equal(
        (
          await restarted.command(
            "send",
            id,
            send(id, "again", "fresh-request"),
          )
        ).reason,
        "reconcile_required",
      )
      assert.equal(f.prompts, 0)
    } finally {
      await restarted.close()
    }
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})

test("a single oversized message and many tool results stay bounded, redacted and explicitly partial", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-bounded-history-")),
    file = join(dir, "history.jsonl")
  try {
    const entries: unknown[] = [
      { type: "session", version: 3, id: "native", cwd: dir },
    ]
    const content: unknown[] = [
      {
        type: "unrecognized-public-block",
        value: "do not silently invent a preview",
      },
    ]
    for (let n = 0; n < 40; n++)
      content.push({
        type: "toolCall",
        id: `call-${n}`,
        name: "read",
        arguments: { path: `file-${n}`, apiKey: "secret-value" },
      })
    entries.push({
      type: "message",
      id: "calls",
      parentId: null,
      message: { role: "assistant", content, timestamp: 1 },
    })
    for (let n = 0; n < 40; n++)
      entries.push({
        type: "message",
        id: `result-${n}`,
        parentId: n ? `result-${n - 1}` : "calls",
        message: {
          role: "toolResult",
          toolCallId: `call-${n}`,
          toolName: "read",
          isError: n === 0,
          content: `authorization=secret-value\n${"界".repeat(100000)}`,
          timestamp: n + 2,
        },
      })
    writeFileSync(
      file,
      entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n",
    )
    const page = historyPage(readHistory(file), "opaque", {})
    const bytes = JSON.stringify(page)
    assert.ok(Buffer.byteLength(bytes) < 512 * 1024)
    assert.match(
      bytes,
      /message_size_limit|truncated|unsupported content block/,
    )
    assert.doesNotMatch(bytes, /secret-value/)
    assert.equal(page.tools[0].status, "failed")
    assert.ok(Buffer.byteLength(page.tools[0].output ?? "") < 33000)
    assert.ok(page.tools.length > 0 && page.tools.length < 40)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("HTTP denies invalid Host, Origin and auth; SSE validates snapshot boundary and epoch", async () => {
  const f = fixture()
  try {
    const id = await create(f)
    await new Promise<void>((resolve) =>
      f.host.server.listen(0, "127.0.0.1", resolve),
    )
    const address = f.host.server.address()
    assert.ok(address && typeof address !== "string")
    const base = `http://127.0.0.1:${address.port}/api/pi`
    assert.equal((await fetch(`${base}/health`)).status, 401)
    assert.equal(
      (
        await fetch(`${base}/health`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Origin: "https://malicious.test",
          },
        })
      ).status,
      403,
    )
    const invalidHost = await new Promise<number | undefined>(
      (resolve, reject) => {
        const req = request(
          `${base}/health`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Host: "malicious.test",
            },
          },
          (res) => {
            res.resume()
            resolve(res.statusCode)
          },
        )
        req.on("error", reject)
        req.end()
      },
    )
    assert.equal(invalidHost, 403)
    const controller = new AbortController()
    const stream = await fetch(
      `${base}/sessions/${id}/events?epoch=old&after=0`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      },
    )
    const first = await stream.body!.getReader().read()
    assert.match(new TextDecoder().decode(first.value), /resync/)
    controller.abort()
    const snap = f.host.snapshot(id)
    const controller2 = new AbortController()
    const response = await fetch(
      `${base}/sessions/${id}/events?epoch=${snap.session.hostEpoch}&after=${snap.session.sequence}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller2.signal,
      },
    )
    const reader = response.body!.getReader()
    await f.host.command("send", id, send(id, "tool-fail", "http-send-001"))
    const event = new TextDecoder().decode((await reader.read()).value)
    assert.match(event, /snapshot/)
    controller2.abort()
    await eventually(() => f.host.snapshot(id).session.status === "completed")
    assert.equal(f.host.snapshot(id).history.tools[0].status, "failed")
  } finally {
    await f.host.close()
    rmSync(f.dir, { recursive: true, force: true })
  }
})
