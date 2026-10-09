import { expect, test } from "@playwright/test"
import {
  configuredColumns,
  columnWidth,
  createDataTableQuerySession,
  dataTableQueryKey,
  type DataTablePage,
} from "../lib/data-table-model"
import { allocateCommands } from "../lib/command-toolbar-model"
import { checkDictionary } from "../scripts/ui-contracts-model.mjs"

test("query sessions reject late and mismatched responses and retain refresh data", async () => {
  const session = createDataTableQuerySession<string>({
    errorMessage: "Read failed",
  })
  const query = { scope: "one", filter: "A", sort: null, page: 1, pageSize: 2 }
  let finish!: (value: DataTablePage<string>) => void
  let oldSignal!: AbortSignal
  const old = session.request(query, (_, ctx) => {
    oldSignal = ctx.signal
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  const next = { ...query, filter: "B", cursor: "next" }
  expect(
    await session.request(next, async (_, ctx) => ({
      queryKey: ctx.queryKey,
      rows: ["B"],
      hasNext: true,
    })),
  ).toBe(true)
  expect(oldSignal.aborted).toBe(true)
  finish({ queryKey: dataTableQueryKey(query), rows: ["A"], hasNext: false })
  expect(await old).toBe(false)
  expect(session.getSnapshot().rows).toEqual(["B"])
  expect(session.getSnapshot().total).toBeUndefined()
  await session.request(next, async () => {
    throw new Error("secret transport")
  })
  expect(session.getSnapshot()).toMatchObject({
    rows: ["B"],
    state: "error",
    error: "Read failed",
  })
  await session.request(
    { ...next, sort: { columnId: "name", direction: "asc" } },
    async () => ({ queryKey: "wrong", rows: ["wrong"], hasNext: false }),
  )
  expect(session.getSnapshot().rows).toEqual([])
  const disposed = session.request(
    query,
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  session.dispose()
  finish({ queryKey: dataTableQueryKey(query), rows: ["late"], hasNext: false })
  expect(await disposed).toBe(false)
})
test("column and command models preserve order, limits and unique identity", () => {
  const columns = [
    { id: "name", hideable: false, minWidth: 100, maxWidth: 300 },
    { id: "status" },
  ]
  expect(
    configuredColumns(columns, {
      order: ["missing", "status"],
      hiddenIds: ["name"],
    }).map((c) => c.id),
  ).toEqual(["status", "name"])
  expect(columnWidth(columns[0], { widths: { name: 900 } })).toBe(300)
  expect(columnWidth(columns[0], { widths: { name: NaN } })).toBeUndefined()
  expect(() => configuredColumns([{ id: "same" }, { id: "same" }])).toThrow()
  const actions = [
    { id: "first", width: 100 },
    { id: "save", width: 100, priority: 10 },
    { id: "last", width: 100 },
  ]
  expect(allocateCommands(actions, 170).visible.map((a) => a.id)).toEqual([
    "save",
  ])
  expect(allocateCommands(actions, 400).visible.map((a) => a.id)).toEqual([
    "first",
    "save",
    "last",
  ])
  expect(() => allocateCommands([{ id: "a" }, { id: "a" }], 400)).toThrow()
})
test("availability validation detects an intentionally stale dictionary row", () => {
  const entries = [{ slug: "button", name: "Button" }]
  expect(() =>
    checkDictionary("| Button / Icon Button | action | 待实现 |", entries),
  ).toThrow("Availability mismatch: button")
  expect(() =>
    checkDictionary("| Button / Icon Button | action | 已有 Button |", entries),
  ).not.toThrow()
  expect(() =>
    checkDictionary("| ImaginaryWidget | action | 已有 |", entries),
  ).toThrow("no component mapping")
})
