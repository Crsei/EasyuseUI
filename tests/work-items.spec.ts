import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import {
  makeWorkItems,
  catalog,
} from "../components/examples/work-items/fixtures"
import {
  applyLocalMove,
  groupWorkItems,
  mergeGroupPage,
  selectWorkItems,
  validateMove,
} from "../lib/work-items-view"
import { defaultWorkItemsView, isOverdue } from "../lib/work-items-model"
async function start(page: Page, query = "") {
  await page.goto(`/workspace/work-items/${query}`)
  await expect(page.locator("[data-work-items-ready] ")).toHaveAttribute(
    "data-work-items-ready",
    "true",
  )
}
async function scenario(page: Page, value: string) {
  const field = page.getByLabel("示例场景", { exact: true })
  if (!(await field.isVisible()))
    await page
      .getByRole("button", { name: "展开底部面板", exact: true })
      .click()
  await field.selectOption(value)
}
async function openFirst(page: Page) {
  await page.locator('[data-work-item="wi-001"] a').click()
  return page.locator('[data-detail-item="wi-001"]')
}

test("query helpers preserve server order, deduplicate pages, reject stale moves and respect local dates", () => {
  const items = makeWorkItems()
  const view = {
    ...defaultWorkItemsView,
    filters: {
      state: ["backlog", "todo"],
      priority: ["p0"],
      assignees: [],
      labels: [],
    },
  }
  expect(
    selectWorkItems(items, view).every(
      (item) =>
        ["backlog", "todo"].includes(item.stateId) && item.priorityId === "p0",
    ),
  ).toBe(true)
  const groups = groupWorkItems(items, catalog, defaultWorkItemsView, "q")
  const page = {
    ...groups[0],
    itemIds: [items[0].id, items[5].id],
    loadedCount: 2,
    totalCount: null,
  }
  expect(
    mergeGroupPage({ ...page, itemIds: [items[0].id], loadedCount: 1 }, page)
      .itemIds,
  ).toEqual(page.itemIds)
  expect(mergeGroupPage(page, { ...page, queryKey: "late" })).toBe(page)
  const intent = {
    operationId: "one",
    itemId: "wi-001",
    sourceGroup: "backlog",
    targetGroup: "todo",
    baseRevision: 1,
    queryKey: "q",
    beforeId: "wi-002",
  }
  const context = {
    items,
    groups,
    groupBy: "state" as const,
    sort: "manual" as const,
    queryKey: "q",
    capabilities: {
      canCreate: true,
      canMove: () => true,
      canEditField: () => true,
    },
  }
  expect(validateMove(intent, context)).toBeNull()
  expect(validateMove({ ...intent, baseRevision: 0 }, context)).toBe("conflict")
  expect(validateMove({ ...intent, queryKey: "late" }, context)).toBe("stale")
  expect(validateMove({ ...intent, beforeId: "not-loaded" }, context)).toBe(
    "boundary",
  )
  expect(
    validateMove(
      {
        ...intent,
        sourceGroup: "backlog",
        targetGroup: "backlog",
        beforeId: "wi-006",
      },
      { ...context, sort: "dueDate" },
    ),
  ).toBe("automatic")
  expect(
    validateMove(
      { ...intent, beforeId: undefined },
      { ...context, groups: groups.map((g) => ({ ...g, hasMore: true })) },
    ),
  ).toBe("boundary")
  expect(
    validateMove(intent, {
      ...context,
      capabilities: { ...context.capabilities, canMove: () => false },
    }),
  ).toBe("locked")
  const moved = applyLocalMove(items, intent, "state")
  expect(moved.find((i) => i.id === "wi-001")?.stateId).toBe("todo")
  expect(moved[0].id).toBe("wi-001")
  expect(isOverdue("2026-10-07", "2026-10-08")).toBe(true)
  expect(isOverdue("2026-10-08", "2026-10-08")).toBe(false)
})

test("create and edit in List, move in Board, verify Table and preserve selection", async ({
  page,
}) => {
  await start(page)
  await page.getByRole("button", { name: "新建工作项", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("新工作项标题").fill("Shared acceptance item")
  await dialog.getByRole("button", { name: "新建工作项", exact: true }).click()
  await expect(dialog).not.toBeVisible()
  const row = page.locator('[data-work-item="wi-025"]')
  await expect(row).toContainText("Shared acceptance item")
  await row.getByRole("checkbox").check()
  await row.getByRole("link").click()
  const detail = page.locator('[data-detail-item="wi-025"]')
  await detail.getByLabel("标题", { exact: true }).fill("Edited shared item")
  await detail.getByRole("button", { name: "保存标题" }).click()
  await expect(row).toContainText("Edited shared item")
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await page.getByRole("button", { name: "移动 WI-025", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-board-group="todo"] [data-work-item="wi-025"]'),
  ).toBeVisible()
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await expect(page.locator('[data-row-id="wi-025"]')).toContainText(
    "Edited shared item",
  )
  await expect(page.locator('[data-row-id="wi-025"]')).toContainText("Todo")
  await expect(
    page.locator('[data-row-id="wi-025"] input[type="checkbox"]'),
  ).toBeChecked()
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await expect(page.locator('[data-work-item="wi-025"]')).toBeVisible()
})

test("unknown field write remains locked across layout and locale until reconciliation", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "unknown")
  const detail = await openFirst(page)
  await detail.getByLabel("标题", { exact: true }).fill("Uncertain 中文 draft")
  await detail.getByRole("button", { name: "保存标题" }).click()
  await expect(detail.locator('[data-mutation="unknown"]')).toBeVisible()
  await expect(detail.getByRole("button", { name: "保存标题" })).toBeDisabled()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await expect(
    page.locator('[data-work-item="wi-001"] [data-mutation="unknown"]'),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "移动 WI-001", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "English", exact: true }).click()
  await expect(page.locator('[data-work-item="wi-001"]')).toContainText(
    "Uncertain 中文 draft",
  )
  await page
    .locator('[data-work-item="wi-001"]')
    .getByRole("button", { name: "Query outcome" })
    .click()
  await expect(
    page.locator('[data-work-item="wi-001"] [data-mutation="unknown"]'),
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Move WI-001", exact: true }),
  ).toBeVisible()
})

test("rejected create and field saves retain drafts; unknown create survives dialog close", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "rejected")
  await page.getByRole("button", { name: "新建工作项", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("新工作项标题").fill("Retained create draft")
  await dialog.getByRole("button", { name: "新建工作项", exact: true }).click()
  await expect(dialog.getByRole("alert")).toBeVisible()
  await expect(dialog.getByLabel("新工作项标题")).toHaveValue(
    "Retained create draft",
  )
  await page.keyboard.press("Escape")
  const detail = await openFirst(page)
  await detail.getByLabel("标题", { exact: true }).fill("Retained field draft")
  await detail.getByRole("button", { name: "保存标题" }).click()
  await expect(detail.locator('[data-mutation="rejected"]')).toBeVisible()
  await expect(detail.getByLabel("标题", { exact: true })).toHaveValue(
    "Retained field draft",
  )
  await detail
    .getByLabel("描述", { exact: true })
    .fill("Retained description draft")
  await detail.getByRole("button", { name: "保存描述", exact: true }).click()
  await expect(detail.getByLabel("描述", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  )
  await expect(
    detail.getByLabel("描述", { exact: true }),
  ).toHaveAccessibleDescription("示例明确拒绝本次修改，可修改后重试。")
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await scenario(page, "unknown")
  await page.getByRole("button", { name: "新建工作项", exact: true }).click()
  await dialog.getByLabel("新工作项标题").fill("Unknown create")
  await dialog.getByRole("button", { name: "新建工作项", exact: true }).click()
  await expect(
    dialog.getByRole("button", { name: "查询结果", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "新建工作项", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "查询结果", exact: true }).click()
  await expect(page.locator('[data-work-item="wi-025"]')).toContainText(
    "Unknown create",
  )
})

test("partial groups retain items on page failure, retry reads, and hidden selection persists", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "partial")
  const group = page.getByRole("region", { name: "Backlog", exact: true })
  // Native section accessible name is a region.
  await page.locator('[data-work-item="wi-001"]').getByRole("checkbox").check()
  await group.getByRole("button", { name: "加载更多", exact: true }).click()
  await expect(group.getByRole("alert")).toBeVisible()
  await expect(group.locator('[data-work-item="wi-001"]')).toBeVisible()
  await group.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(group.locator("[data-work-item]")).toHaveCount(5)
  await page.getByRole("textbox", { name: "搜索标题或编号" }).fill("WI-002")
  await expect(
    page.getByText("已选 1 项 · 隐藏 1 项", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await expect(
    page.locator('[data-work-item="wi-001"] input[type="checkbox"]'),
  ).toBeChecked()
  await scenario(page, "refresh-error")
  await expect(page.locator("#main-content").getByRole("alert")).toBeVisible()
  await expect(page.locator("[data-work-item]")).toHaveCount(24)
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(page.locator("#main-content").getByRole("alert")).toHaveCount(0)
})

test("read-only project and empty/no-match are distinct; URL refresh and back preserve context", async ({
  page,
}) => {
  await start(page, "?layout=board&group=priority&item=WI-012&q=WI-012")
  await expect(
    page.getByRole("radio", { name: "看板", exact: true }),
  ).toBeChecked()
  await expect(
    page.locator('[data-detail-item="wi-012"]:visible'),
  ).toBeVisible()
  await expect(
    page.getByRole("textbox", { name: "搜索标题或编号" }),
  ).toHaveValue("WI-012")
  await page.reload()
  await expect(
    page.locator('[data-detail-item="wi-012"]:visible'),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await page.goBack()
  await expect(
    page.locator('[data-detail-item="wi-012"]:visible'),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await scenario(page, "readonly")
  await expect(
    page.getByRole("button", { name: "新建工作项", exact: true }),
  ).toBeDisabled()
  await expect(page.getByRole("button", { name: /^移动 WI-/ })).toHaveCount(0)
  await page
    .getByRole("textbox", { name: "搜索标题或编号" })
    .fill("does not exist")
  await expect(page.getByText("暂无匹配工作项", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("textbox", { name: "搜索标题或编号" }),
  ).toHaveValue("does not exist")
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await scenario(page, "empty")
  await page.getByRole("button", { name: "新建工作项", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("pointer drag and keyboard reorder use the same commands; Escape cancels", async ({
  page,
}) => {
  await start(page, "?layout=board")
  const handle = page.getByRole("button", { name: "拖动 WI-001", exact: true })
  const from = await handle.boundingBox()
  const target = await page.locator('[data-board-group="todo"]').boundingBox()
  if (!from || !target) throw Error("Missing drag geometry")
  await page.mouse.move(from.x + 12, from.y + 12)
  await page.mouse.down()
  await page.mouse.move(target.x + target.width / 2, target.y + 120, {
    steps: 8,
  })
  await page.mouse.up()
  await expect(
    page.locator('[data-board-group="todo"] [data-work-item="wi-001"]'),
  ).toBeVisible()
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "下移", exact: true }).click()
  await page.keyboard.press("Escape")
  const ids = await page
    .locator('[data-board-group="todo"] [data-work-item]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-work-item")))
  expect(ids).toContain("wi-001")
  const current = await page
    .getByRole("button", { name: "拖动 WI-001", exact: true })
    .boundingBox()
  if (!current) throw Error("Missing handle")
  await page.mouse.move(current.x + 8, current.y + 8)
  await page.mouse.down()
  await page.keyboard.press("Escape")
  await page.mouse.move(300, 200)
  await page.mouse.up()
  await expect(
    page.locator('[data-board-group="todo"] [data-work-item="wi-001"]'),
  ).toBeVisible()
})

test("mobile touch alternative, nested-target checks, theme and reduced-motion accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await start(page, "?layout=board")
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await page.locator('[data-work-item="wi-001"] a').click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  expect(
    await page.locator("button button, button a, a button, a a").count(),
  ).toBe(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  const results = await new AxeBuilder({ page })
    .include("#main-content")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
  expect(results.violations).toEqual([])
})

test("multi-select properties, display controls and keyboard toolbar preserve caller data", async ({
  page,
}) => {
  await start(page)
  const row = page.locator('[data-work-item="wi-001"]')
  await row.getByRole("combobox", { name: "负责人", exact: true }).click()
  await page.getByRole("option", { name: "Lin Chen", exact: true }).click()
  await expect(
    row.getByRole("combobox", { name: "负责人", exact: true }),
  ).toContainText("Lin Chen")
  await row.getByRole("combobox", { name: "负责人", exact: true }).click()
  await page.getByRole("option", { name: "Maya Patel", exact: true }).click()
  await expect(
    row.getByRole("combobox", { name: "负责人", exact: true }),
  ).toContainText("Maya Patel")
  await row.getByRole("checkbox").check()
  await page.getByRole("button", { name: "显示", exact: true }).click()
  await page.getByLabel("排序", { exact: true }).selectOption("dueDate")
  await expect(
    page.getByText("自动排序：列内自由重排已停用。", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("分组", { exact: true }).selectOption("priority")
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "上移", exact: true }),
  ).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await expect(page.locator('[data-row-id="wi-001"]')).toContainText(
    "Lin Chen, Maya Patel",
  )
})

test("unknown and rejected moves preserve the authoritative group until confirmation", async ({
  page,
}) => {
  await start(page, "?layout=board")
  await scenario(page, "unknown")
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-board-group="backlog"] [data-mutation="unknown"]'),
  ).toBeVisible()
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await page
    .locator('[data-work-item="wi-001"]')
    .getByRole("button", { name: "查询结果", exact: true })
    .click()
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await expect(
    page.locator('[data-board-group="todo"] [data-work-item="wi-001"]'),
  ).toBeVisible()
  await scenario(page, "rejected")
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-board-group="backlog"] [data-mutation="rejected"]'),
  ).toBeVisible()
})

test("touch can move to a group with coarse-pointer targets", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await start(page, "?layout=board")

  const handle = page.getByRole("button", { name: "拖动 WI-001", exact: true })
  const bounds = await handle.boundingBox()
  expect(bounds?.width).toBeGreaterThanOrEqual(44)
  expect(bounds?.height).toBeGreaterThanOrEqual(44)
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).tap()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).tap()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-board-group="todo"] [data-work-item="wi-001"]'),
  ).toBeVisible()
  await context.close()
})

test("another confirmed field does not clear a rejected title draft or its error", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "field-rejected")
  const detail = await openFirst(page)
  await detail.getByLabel("标题", { exact: true }).fill("Rejected draft stays")
  await detail.getByRole("button", { name: "保存标题", exact: true }).click()
  await expect(detail.locator('[data-mutation="rejected"]')).toBeVisible()
  await detail.getByRole("combobox", { name: "优先级", exact: true }).click()
  await page.getByRole("option", { name: "High", exact: true }).click()
  await expect(
    detail.getByRole("combobox", { name: "优先级", exact: true }),
  ).toContainText("High")
  await expect(detail.getByLabel("标题", { exact: true })).toHaveValue(
    "Rejected draft stays",
  )
  await expect(detail.getByLabel("标题", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  )
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await page.locator('[data-work-item="wi-001"] a').click()
  await expect(detail.getByLabel("标题", { exact: true })).toHaveValue(
    "Rejected draft stays",
  )
})

test("workspace fills the viewport and preserves one vertical scroll owner", async ({
  page,
}) => {
  await start(page)
  const geometry = await page
    .locator("[data-work-items-scroll]")
    .evaluate((element) => {
      const shell = element.closest("[data-sidebar-collapsed]")!
      return {
        height: shell.getBoundingClientRect().height,
        viewport: window.innerHeight,
        outerScroll:
          element.parentElement!.parentElement!.scrollHeight -
          element.parentElement!.parentElement!.clientHeight,
      }
    })
  expect(geometry.height).toBe(geometry.viewport)
  expect(geometry.outerScroll).toBeLessThanOrEqual(1)
})
