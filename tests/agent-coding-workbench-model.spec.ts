import { test, expect } from "@playwright/test"
import {
  openDocument,
  closeDocument,
  resourceKey,
  acceptResourceRead,
  parseResourceCsv,
  safeResourceImage,
  resourceText,
  resourceCopyText,
  type ResourceSnapshot,
} from "@/lib/workbench-resource-model"
import {
  initialExample,
  exampleReducer,
} from "@/components/examples/agent-workbench/reducer"
import { workbenchResourceFixtures, resourceForReference } from "@/components/examples/agent-workbench/resource-fixtures"
const a: ResourceSnapshot = {
  projectId: "p",
  sessionId: "s",
  resourceId: "a",
  revision: "1",
  path: "src/a.ts",
  name: "a.ts",
  renderer: "text",
  mediaType: "text/plain",
  availability: "available",
  dataState: "success",
  text: "A",
  complete: true,
}
test("document identity preserves pinned revisions and replaces only the transient preview", () => {
  const b = { ...a, resourceId: "b", text: "B" }
  let state = openDocument({ documents: [] }, a, true)
  state = openDocument(state, b)
  state = openDocument(state, { ...a, revision: "2", text: "A2" })
  expect(state.documents).toHaveLength(2)
  expect(state.documents.map((d) => [d.resource.revision, d.pinned])).toEqual([
    ["1", true],
    ["2", false],
  ])
  state = openDocument(state, a)
  expect(state.documents).toHaveLength(2)
  expect(state.documents[0].pinned).toBe(true)
  expect(
    closeDocument(state, resourceKey(a)).documents[0].resource.revision,
  ).toBe("2")
  expect(resourceKey({ ...a, projectId: "other" })).not.toBe(resourceKey(a))
})
test("late and mismatched resource reads cannot replace the selected identity, while refresh failures retain text", () => {
  const b = { ...a, resourceId: "b", text: "B" }
  expect(acceptResourceRead(b, a, b)).toBe(b)
  expect(acceptResourceRead({ ...a, revision: "2" }, a)).toBeUndefined()
  const failed = acceptResourceRead(
    a,
    { ...a, dataState: "error", text: undefined, reason: "offline" },
    a,
  )
  expect(failed?.text).toBe("A")
  expect(failed?.dataState).toBe("error")
  expect(
    acceptResourceRead(a, { ...a, availability: "denied", text: undefined }, a)
      ?.text,
  ).toBeUndefined()
})
test("renderer bounds, quoted CSV and inert image policy reject unsafe or incomplete input", () => {
  const parsed = parseResourceCsv(
    'name,result\n"Alpha, Beta",pass\n"a ""quote""",fail',
  )
  expect(parsed.error).toBeUndefined()
  expect(parsed.rows[1]).toEqual(["Alpha, Beta", "pass"])
  expect(parsed.rows[2][0]).toBe('a "quote"')
  expect(parseResourceCsv('a,b\n"broken').error).toBe("unclosed-quote")
  expect(parseResourceCsv("a,b\n1").error).toBe("column-count")
  expect(parseResourceCsv(Array.from({ length: 65 }, (_, i) => String(i)).join(",")).error).toBe("column-limit")
  expect(
    parseResourceCsv(
      "a\n" + Array.from({ length: 300 }, (_, i) => String(i)).join("\n"),
    ).rows,
  ).toHaveLength(101)
  expect(
    safeResourceImage("data:image/svg+xml;base64,PHN2Zz4="),
  ).toBeUndefined()
  expect(safeResourceImage("https://evil.invalid/image.png")).toBeUndefined()
  expect(
    safeResourceImage("https://user:secret@good.invalid/image.png", [
      "https://good.invalid",
    ]),
  ).toBeUndefined()
  expect(
    resourceText({
      ...a,
      text: Array.from({ length: 1005 }, (_, i) => String(i)).join("\n"),
    }).text.split("\n"),
  ).toHaveLength(1000)
  expect(
    resourceText({ ...a, text: "token=secret\nAuthorization: secret" }).text,
  ).not.toContain("=secret")
})
test("copy includes only the displayed structured rows and redacted formatted JSON", () => {
  const csv = { ...a, renderer: "csv" as const, text: "name\n" + Array.from({ length: 300 }, (_, i) => `row${i}`).join("\n") }
  const copied = resourceCopyText(csv)
  expect(copied.split("\n")).toHaveLength(101)
  expect(copied).not.toContain("row100")
  expect(resourceCopyText({ ...a, renderer: "json", text: '{"value":1,"token":"secret"}' })).toBe('{\n  "value": 1,\n  "token": "[REDACTED]"\n}')
  expect(resourceCopyText({ ...a, availability: "denied" })).toBe("")
})
test("settings cancellation sends no request; unknown locks writes and confirmation preserves newer conversation text", () => {
  let state = initialExample()
  const id = state.sessions[0].sessionId
  const original = state.drafts[id]
  state = exampleReducer(state, {
    type: "settings-draft",
    id,
    configuration: { ...original, permissionId: "read" },
  })
  const cancelled = exampleReducer(state, { type: "settings-cancel", id })
  expect(cancelled.receipts).toHaveLength(0)
  expect(cancelled.drafts[id].permissionId).toBe("ask")
  state = exampleReducer(state, { type: "settings-save", id })
  const request = state.receipts.at(-1)!
  expect(state.drafts[id].permissionId).toBe("ask")
  state = exampleReducer(state, {
    type: "settle",
    requestId: request.requestId,
    state: "unknown",
  })
  expect(exampleReducer(state, { type: "settings-save", id })).toBe(state)
  expect(exampleReducer(state, { type: "settings-cancel", id })).toBe(state)
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: { ...state.drafts[id], text: "Newer message", version: 99 },
  })
  state = exampleReducer(state, {
    type: "settle",
    requestId: request.requestId,
    state: "confirmed",
  })
  expect(state.drafts[id].text).toBe("Newer message")
  expect(state.drafts[id].permissionId).toBe("read")
  expect(state.drafts[state.sessions[1].sessionId].permissionId).toBe("ask")
})
test("settings confirmations detect changed effective configuration instead of overwriting a newer selection", () => {
  let state = initialExample()
  const id = "session-filter"
  state = exampleReducer(state, {
    type: "settings-draft",
    id,
    configuration: { ...state.drafts[id], permissionId: "read" },
  })
  state = exampleReducer(state, { type: "settings-save", id })
  const request = state.receipts.at(-1)!
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: { ...state.drafts[id], modelId: "newer-choice", version: 2 },
  })
  state = exampleReducer(state, {
    type: "settle",
    requestId: request.requestId,
    state: "confirmed",
  })
  expect(state.receipts.at(-1)?.state).toBe("failed")
  expect(state.drafts[id].modelId).toBe("newer-choice")
  expect(state.settingsDrafts[id].configuration.permissionId).toBe("read")
})
test("typed artifact sources provide actual downloadable fixture bytes without using filename switches", async () => {
  const session = initialExample().sessions[1]
  session.artifacts[0] = { ...session.artifacts[0], name: "renamed.anything" }
  const resources = workbenchResourceFixtures(session)
  const file = resources.find((r) => r.resourceId === "file-filter")!
  expect(resourceForReference(resources, { ...file.context!, version: "older-revision" })).toBeUndefined()
  expect(resourceForReference(resources, file.context!)).toBe(file)
  const report = resources.find((r) => r.resourceId === "artifact-report")!
  expect(report.renderer).toBe("markdown")
  expect(await (await report.download!()).text()).toBe(report.text)
  const image = resources.find((r) => r.resourceId === "artifact-image")!
  const bytes = new Uint8Array(await (await image.download!()).arrayBuffer())
  expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(
    resources.find((r) => r.resourceId === "resource-denied")?.download,
  ).toBeUndefined()
})
