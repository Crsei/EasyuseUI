import { test, expect } from "@playwright/test"
import {
  initialExample,
  exampleReducer,
} from "@/components/examples/agent-workbench/reducer"
import {
  regionDefinitions,
  showcaseScenarios,
  parseShowcaseQuery,
  showcaseHref,
  prepareShowcaseScenario,
  readPanelPreferences,
  savePanelPreferences,
  removePanelPreferences,
} from "@/components/examples/agent-workbench/showcase-model"
const id = "session-filter"
test("all region cases have unique shareable IDs, bilingual labels and existing component mappings", () => {
  expect(regionDefinitions).toHaveLength(10)
  expect(new Set(showcaseScenarios.map((s) => s.id)).size).toBe(
    showcaseScenarios.length,
  )
  for (const definition of regionDefinitions)
    for (const scenario of definition.cases) {
      expect(
        showcaseScenarios.find((s) => s.id === scenario)?.label.en,
      ).toBeTruthy()
      expect(
        parseShowcaseQuery(
          new URLSearchParams({ region: definition.id, scenario }),
          [id],
          ["project-demo"],
        ).errors,
      ).toEqual([])
    }
  expect(
    parseShowcaseQuery(
      new URLSearchParams("scenario=evil&project=unknown"),
      [id],
      ["project-demo"],
    ).errors,
  ).toEqual(expect.arrayContaining(["scenario", "project"]))
  expect(
    showcaseHref("app", {
      session: id,
      project: "project-demo",
      scenario: "queue",
      draft: "SECRET",
      token: "SECRET",
    }),
  ).not.toContain("SECRET")
})
for (const scenario of showcaseScenarios.filter(
  (s) =>
    ![
      "default",
      "loading",
      "empty",
      "partial",
      "error",
      "long",
      "unknown",
      "disconnected",
      "limited",
    ].includes(s.id),
)) {
  test(`fixture case ${scenario.id} retains drafts and other objects and prepares once`, () => {
    const state = initialExample()
    state.drafts[id].text = "保留用户草稿"
    const next = prepareShowcaseScenario(state, id, scenario.id)
    expect(next.drafts[id].text).toBe("保留用户草稿")
    expect(next.sessions[1]).toBe(state.sessions[1])
    expect(next.drafts["session-report"]).toBe(state.drafts["session-report"])
    expect(prepareShowcaseScenario(next, id, scenario.id)).toBe(next)
  })
}
test("context retry binds its reference, waits for confirmation and rejects duplicate or late replacements", () => {
  let state = prepareShowcaseScenario(initialExample(), id, "context-failed")
  state = exampleReducer(state, {
    type: "retry-context",
    id,
    referenceId: "showcase-reference",
  })
  expect(state.drafts[id].context[0].availability).toBe("uploading")
  expect(
    exampleReducer(state, {
      type: "retry-context",
      id,
      referenceId: "showcase-reference",
    }),
  ).toBe(state)
  const requestId = state.receipts.at(-1)!.requestId
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: { ...state.drafts[id], text: "new text", version: 9 },
  })
  const confirmed = exampleReducer(state, {
    type: "settle",
    requestId,
    state: "confirmed",
  })
  expect(confirmed.drafts[id].context[0].availability).toBe("available")
  expect(confirmed.drafts[id].text).toBe("new text")
  const replaced = prepareShowcaseScenario(state, id, "context-stale")
  const late = exampleReducer(replaced, {
    type: "settle",
    requestId,
    state: "confirmed",
  })
  expect(late.drafts[id].context[0].availability).toBe("stale")
})
test("project creation is confirmed in the selected repository and preserves newer draft content", () => {
  let state = initialExample()
  state.drafts.new.text = "Research task"
  expect(
    exampleReducer(state, {
      type: "begin",
      id: "new",
      action: "create",
      projectId: "project-empty",
    }),
  ).toBe(state)
  expect(
    exampleReducer(state, {
      type: "begin",
      id: "new",
      action: "create",
      projectId: "nonexistent",
    }),
  ).toBe(state)
  state = exampleReducer(state, {
    type: "begin",
    id: "new",
    action: "create",
    projectId: "project-new",
  })
  const requestId = state.receipts.at(-1)!.requestId
  expect(state.sessions).toHaveLength(3)
  state = exampleReducer(state, {
    type: "draft",
    id: "new",
    draft: { ...state.drafts.new, text: "Newer input", version: 20 },
  })
  state = exampleReducer(state, {
    type: "settle",
    requestId,
    state: "confirmed",
  })
  expect(state.sessions[0].projectId).toBe("project-new")
  expect(state.sessions[0].changes.repositoryId).toBe("repo-new")
  expect(state.sessions[0].environment.branch).toBeUndefined()
  expect(state.drafts.new.text).toBe("Newer input")
})
test("panel storage whitelists UI preferences and tolerates malformed and unavailable storage", () => {
  let value =
    '{"inspectorWidth":999,"bottomHeight":0,"sidebarCollapsed":true,"selectedFileId":"secret","draft":"secret"}'
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => value,
      setItem: (_: string, v: string) => {
        value = v
      },
      removeItem: () => {
        value = "null"
      },
    },
  })
  expect(readPanelPreferences()).toEqual({
    inspectorWidth: 360,
    bottomHeight: 200,
    sidebarCollapsed: true,
  })
  savePanelPreferences(initialExample().panels)
  expect(value).not.toContain("selectedFileId")
  removePanelPreferences()
  expect(readPanelPreferences()).toBeUndefined()
  value = "invalid"
  expect(readPanelPreferences()).toBeUndefined()
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Denied")
    },
  })
  expect(() => savePanelPreferences(initialExample().panels)).not.toThrow()
  expect(() => removePanelPreferences()).not.toThrow()
  expect(readPanelPreferences()).toBeUndefined()
  delete (globalThis as { localStorage?: Storage }).localStorage
})

test("context confirmation retains a changed inclusion choice without changing its source", () => {
  const id = "session-filter"
  let state = prepareShowcaseScenario(initialExample(), id, "context-failed")
  state = exampleReducer(state, {
    type: "retry-context",
    id,
    referenceId: "showcase-reference",
  })
  const requestId = state.receipts.at(-1)!.requestId
  state = exampleReducer(state, {
    type: "draft",
    id,
    draft: {
      ...state.drafts[id],
      version: 5,
      context: state.drafts[id].context.map((r) => ({ ...r, included: false })),
    },
  })
  state = exampleReducer(state, {
    type: "settle",
    requestId,
    state: "confirmed",
  })
  expect(state.drafts[id].context[0].availability).toBe("available")
  expect(state.drafts[id].context[0].included).toBe(false)
})
