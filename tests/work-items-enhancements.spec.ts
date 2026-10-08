import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import {
  indexWorkItemHierarchy,
  hierarchyVisibleIds,
  groupWorkItemLanes,
} from "../lib/work-items-view"
import { defaultWorkItemsView } from "../lib/work-items-model"
import {
  catalog,
  makeHierarchyWorkItems,
} from "../components/examples/work-items/fixtures"
async function start(page: Page, query = "") {
  await page.goto(`/examples/work-items/${query}`)
  await expect(page.locator("[data-work-items-ready]")).toHaveAttribute(
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
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
}
async function select(page: Page, id: string) {
  await page.locator(`[data-work-item="${id}"]`).getByRole("checkbox").check()
}
async function savedViews(page: Page) {
  await page.getByRole("button", { name: "保存的视图", exact: true }).click()
}

test("hierarchy index handles cycles, duplicates, foreign parents and filtered orphans without dropping entities", () => {
  const rows = makeHierarchyWorkItems()
  const broken = [
    { ...rows[0], parentId: rows[1].id },
    { ...rows[1], parentId: rows[0].id },
    { ...rows[2], parentId: rows[2].id },
    { ...rows[3], parentId: rows[4].id, projectId: "foreign" },
    rows[4],
    rows[4],
  ]
  const index = indexWorkItemHierarchy(broken)
  const visible = hierarchyVisibleIds([...index.byId.keys()], broken, [
    ...index.byId.keys(),
  ])
  expect(visible.size).toBe(5)
  expect(index.parentById.has(rows[2].id)).toBe(false)
  expect(index.parentById.has(rows[3].id)).toBe(false)
  expect(indexWorkItemHierarchy([rows[1]]).parentById.size).toBe(0)
  const lanes = groupWorkItemLanes(
    rows,
    catalog,
    { ...defaultWorkItemsView, subGroupBy: "priority" },
    "q",
  )
  expect(
    new Set(
      lanes.flatMap((lane) => lane.groups.flatMap((group) => group.itemIds)),
    ).size,
  ).toBe(24)
  expect(
    groupWorkItemLanes(
      rows,
      catalog,
      { ...defaultWorkItemsView, subGroupBy: "state" },
      "q",
    ),
  ).toEqual([])
})

test("swimlane moves preserve the lane, share fields with Table, and retain URL preferences", async ({
  page,
}) => {
  await start(page, "?layout=board&lane=priority")
  await expect(page.locator("[data-work-items-lane]")).toHaveCount(4)
  const lane = page.locator('[data-work-items-lane="p0"]')
  await lane.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    lane.locator('[data-board-group="todo"] [data-work-item="wi-001"]'),
  ).toBeVisible()
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await expect(page.locator('[data-row-id="wi-001"]')).toContainText("Todo")
  await expect(page.locator('[data-row-id="wi-001"]')).toContainText("Urgent")
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await expect(page.locator("[data-work-items-lane]")).toHaveCount(4)
  await page.reload()
  await expect(page.locator("[data-work-items-lane]")).toHaveCount(4)
  await page.getByRole("button", { name: "显示", exact: true }).click()
  await page.getByLabel("分组", { exact: true }).selectOption("priority")
  await expect(page.getByLabel("泳道", { exact: true })).toHaveValue("none")
})

test("pointer drop cannot cross swimlanes and unknown lane moves reconcile in the same lane", async ({
  page,
}) => {
  await start(page, "?layout=board&lane=priority")
  const source = page.locator(
    '[data-work-items-lane="p0"] [data-board-group="backlog"] [data-work-item="wi-001"]',
  )
  const handle = page.getByRole("button", { name: "拖动 WI-001", exact: true })
  await handle.scrollIntoViewIfNeeded()
  const from = (await handle.boundingBox())!
  const target = (await page
    .locator('[data-work-items-lane="p1"] [data-board-group="backlog"]')
    .boundingBox())!
  await page.mouse.move(from.x + 8, from.y + 8)
  await page.mouse.down()
  await page.mouse.move(target.x + 40, target.y + 60, { steps: 5 })
  await page.mouse.up()
  await expect(source).toHaveCount(1)
  await scenario(page, "unknown")
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(source.locator('[data-mutation="unknown"]')).toBeVisible()
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await page
    .locator('[data-work-item="wi-001"]')
    .getByRole("button", { name: "查询结果", exact: true })
    .click()
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await expect(
    page.locator(
      '[data-work-items-lane="p0"] [data-board-group="todo"] [data-work-item="wi-001"]',
    ),
  ).toBeVisible()
})

test("nested sub-items load with retry, preserve hidden selection and survive flat layout switches", async ({
  page,
}) => {
  await start(page, "?children=1")
  await scenario(page, "hierarchy")
  await expect(page.locator('[data-work-item="wi-002"]')).toHaveCount(0)
  await page
    .getByRole("button", { name: "展开或折叠 WI-001 的子项", exact: true })
    .click()
  await expect(page.locator('[data-work-item="wi-002"]')).toBeVisible()
  await page
    .getByRole("button", { name: "展开或折叠 WI-002 的子项", exact: true })
    .click()
  await expect(page.locator('[data-work-item="wi-004"]')).toBeVisible()
  await select(page, "wi-004")
  await page.getByRole("button", { name: "加载更多", exact: true }).click()
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "示例：加载更多失败，已加载项保留。" }),
  ).toBeVisible()
  await expect(page.locator('[data-work-item="wi-002"]')).toBeVisible()
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(page.locator('[data-work-item="wi-003"]')).toBeVisible()
  await page
    .getByRole("button", { name: "展开或折叠 WI-001 的子项", exact: true })
    .click()
  await expect(
    page.getByText("已选 1 项 · 隐藏 1 项", { exact: true }),
  ).toBeVisible()
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await expect(
    page.locator('[data-row-id="wi-004"]').getByRole("checkbox"),
  ).toBeChecked()
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await expect(page.locator('[data-work-item="wi-004"]')).toHaveCount(0)
  await page
    .getByRole("button", { name: "展开或折叠 WI-001 的子项", exact: true })
    .click()
  await expect(
    page.locator('[data-work-item="wi-004"]').getByRole("checkbox"),
  ).toBeChecked()
  // A matching child with a filtered-out parent stays accessible as a root.
  await page
    .getByRole("textbox", { name: "搜索标题或编号", exact: true })
    .fill("WI-004")
  await expect(page.locator('[data-work-item="wi-004"]')).toBeVisible()
})

test("batch preview includes hidden selections, skips denied items and reconciles mixed per-item outcomes", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "batch-mixed")
  for (const id of ["wi-001", "wi-002", "wi-003", "wi-004"])
    await select(page, id)
  await page
    .getByRole("textbox", { name: "搜索标题或编号", exact: true })
    .fill("WI-001")
  await expect(
    page.getByText("已选 4 项 · 隐藏 3 项", { exact: true }),
  ).toBeVisible()
  const batch = page.getByLabel("批量修改", { exact: true })
  await batch.getByRole("combobox", { name: "状态", exact: true }).click()
  await page.getByRole("option", { name: "Done", exact: true }).click()
  await batch.getByRole("button", { name: "预览批量修改", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("将修改 3 项，跳过 1 项")
  await expect(dialog).toContainText("WI-004 · 无字段修改权限，跳过")
  await dialog
    .getByRole("button", { name: "确认修改 3 项", exact: true })
    .click()
  await expect(batch).toContainText("已确认 1 · 拒绝 1 · 提交中 0 · 待确认 1")
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await batch.getByRole("button", { name: "查询结果", exact: true }).click()
  await expect(batch).toContainText("已确认 2 · 拒绝 1 · 提交中 0 · 待确认 0")
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await expect(page.locator('[data-row-id="wi-001"]')).toContainText("Done")
  await expect(page.locator('[data-row-id="wi-002"]')).toContainText("Todo")
  await expect(page.locator('[data-row-id="wi-003"]')).toContainText("Done")
  await expect(page.locator('[data-row-id="wi-004"]')).toContainText(
    "In review",
  )
})

test("batch unknown remains locked after switching layout and read-only excludes every selection", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "unknown")
  await select(page, "wi-001")
  const batch = page.getByLabel("批量修改", { exact: true })
  await batch.getByRole("button", { name: "预览批量修改", exact: true }).click()
  await page.getByRole("button", { name: "确认修改 1 项", exact: true }).click()
  await expect(batch).toContainText("待确认 1")
  await page.getByRole("radio", { name: "看板", exact: true }).check()
  await expect(
    batch.getByRole("button", { name: "预览批量修改", exact: true }),
  ).toBeDisabled()
  await scenario(page, "readonly")
  await select(page, "wi-001")
  await expect(
    batch.getByRole("button", { name: "预览批量修改", exact: true }),
  ).toBeDisabled()
})

test("saved views capture configuration, update with revisions, apply and delete without storing work items", async ({
  page,
}) => {
  await start(page, "?layout=board&lane=priority&children=1&defer=1")
  await select(page, "wi-001")
  await savedViews(page)
  await page
    .getByRole("textbox", { name: "视图名称", exact: true })
    .fill("我的泳道")
  await page.getByRole("button", { name: "另存当前视图", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "我的泳道", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "列表", exact: true }).check()
  await savedViews(page)
  await page.getByRole("button", { name: "我的泳道", exact: true }).click()
  await expect(page).toHaveURL(/layout=board/)
  await expect(page).toHaveURL(/lane=priority/)
  await expect(
    page.getByText("已选 1 项 · 隐藏 0 项", { exact: true }),
  ).toBeVisible()
  await page
    .getByRole("textbox", { name: "视图名称", exact: true })
    .fill("重命名视图")
  await page
    .getByRole("button", { name: "更新当前保存视图", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "重命名视图", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "删除视图 重命名视图", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "删除视图", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.reload()
  await savedViews(page)
  await expect(page.getByText("暂无保存的视图", { exact: true })).toBeVisible()
  await expect(
    page.getByText("已选 0 项 · 隐藏 0 项", { exact: true }),
  ).toBeVisible()
})

test("saved view rejection keeps the name and unknown remains locked across popover remount and locale change", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "rejected")
  await savedViews(page)
  await page
    .getByRole("textbox", { name: "视图名称", exact: true })
    .fill("draft saved view")
  await page.getByRole("button", { name: "另存当前视图", exact: true }).click()
  await expect(
    page.getByRole("textbox", { name: "视图名称", exact: true }),
  ).toHaveValue("draft saved view")
  await expect(
    page.getByRole("button", { name: "draft saved view", exact: true }),
  ).toHaveCount(0)
  await page.keyboard.press("Escape")
  await scenario(page, "unknown")
  await savedViews(page)
  await page
    .getByRole("textbox", { name: "视图名称", exact: true })
    .fill("uncertain view")
  await page.getByRole("button", { name: "另存当前视图", exact: true }).click()
  await expect(page.locator('[data-mutation="unknown"]')).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "English", exact: true }).click()
  await page.getByRole("button", { name: "Saved views", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Save current view as new", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "Query outcome", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "uncertain view", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", {
      name: "Update current saved view",
      exact: true,
    }),
  ).toBeEnabled()
})

test("offscreen layout retains 200 real entities, focus, selection and field edits", async ({
  page,
}) => {
  test.setTimeout(60_000)
  await start(page, "?defer=1")
  await scenario(page, "200")
  await expect(page.locator("[data-work-item]")).toHaveCount(200)
  await expect(
    page.locator('[data-work-item-editors="ready"]'),
  ).not.toHaveCount(200)
  const last = page.locator('[data-work-item="wi-200"]')
  await last.getByRole("checkbox").focus()
  await expect(last.getByRole("checkbox")).toBeFocused()
  await expect(last.locator("..")).toHaveAttribute(
    "data-work-item-editors",
    "ready",
  )
  await last.getByRole("checkbox").check()
  await last.getByRole("combobox", { name: "优先级", exact: true }).click()
  await page.getByRole("option", { name: "Urgent", exact: true }).click()
  await expect(
    last.getByRole("combobox", { name: "优先级", exact: true }),
  ).toContainText("Urgent")
  expect(
    await last
      .locator("..")
      .evaluate((element) => getComputedStyle(element).contentVisibility),
  ).toBe("auto")
})

test("enhancements are accessible at narrow coarse-pointer sizes without nested targets", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await start(page, "?children=1")
  await scenario(page, "hierarchy")
  const toggle = page.getByRole("button", {
    name: "展开或折叠 WI-001 的子项",
    exact: true,
  })
  const box = await toggle.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  await toggle.tap()
  await select(page, "wi-002")
  await page.getByRole("button", { name: "预览批量修改", exact: true }).tap()
  await expect(page.getByRole("dialog")).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.keyboard.press("Escape")
  expect(await page.locator("button button, a button, button a").count()).toBe(
    0,
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await context.close()
})
