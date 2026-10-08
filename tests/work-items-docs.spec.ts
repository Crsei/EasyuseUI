import { expect, test } from "@playwright/test"

test("every Work Items documentation install command resolves its Registry item", async ({
  request,
}) => {
  const entries = {
    "grouped-list": "grouped-list",
    "work-items-board-base": "work-items-board-base",
    "work-item-properties": "work-item-properties",
    "work-item-row": "work-item",
    "work-item-card": "work-item",
    "work-item-list": "work-items-views",
    "work-item-board": "work-items-views",
    "work-item-table": "work-items-views",
    "work-items-toolbar": "work-items-toolbar",
    "work-item-detail": "work-item-detail",
    "work-items-workspace": "work-items-workspace",
  }
  for (const [slug, registryId] of Object.entries(entries)) {
    const doc = await request.get(`/docs/${slug}/`)
    expect(doc.ok()).toBe(true)
    expect(await doc.text()).toContain(`/r/${registryId}.json`)
    const item = await request.get(`/r/${registryId}.json`)
    expect(item.ok()).toBe(true)
    expect((await item.json()).name).toBe(registryId)
  }
})

test("independent Board moves an idea into another group", async ({ page }) => {
  await page.goto("/docs/work-items-board-base/")
  const demo = page.locator('[data-demo-loader="work-items-board-base"]')
  await expect(demo.locator('[data-board-group="inbox"]')).toContainText(
    "Explore a new idea",
  )
  await demo
    .getByRole("button", { name: "移动 Explore a new idea", exact: true })
    .click()
  await page.getByRole("button", { name: "移动到 review", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(demo.locator('[data-board-group="review"]')).toContainText(
    "Explore a new idea",
  )
  await expect(
    demo.locator('[data-board-group="inbox"] [data-board-item]'),
  ).toHaveCount(0)
})

test("manual reordering changes the actual order; moving into a filtered empty group retains the filter", async ({
  page,
}) => {
  await page.goto("/workspace/work-items/?layout=board")
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "下移", exact: true }).click()
  await page.keyboard.press("Escape")
  const ids = page.locator('[data-board-group="backlog"] [data-work-item]')
  await expect(ids.first()).toHaveAttribute("data-work-item", "wi-006")
  await expect(ids.nth(1)).toHaveAttribute("data-work-item", "wi-001")
  await page.goto(
    "/workspace/work-items/?layout=board&group=priority&state=backlog&priority=p0",
  )
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await expect(
    page.locator('[data-board-group="p1"] [data-work-item]'),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "移动 WI-001", exact: true }).click()
  await page.getByRole("button", { name: "移动到 High", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(page.locator('[data-work-item="wi-001"]')).toHaveCount(0)
  await expect(page).toHaveURL(/priority=p0/)
  await page.getByRole("button", { name: "清除筛选", exact: true }).click()
  await expect(
    page.locator('[data-board-group="p1"] [data-work-item="wi-001"]'),
  ).toBeVisible()
})

test("automatic sorting can move into a partially loaded group through the keyboard menu", async ({
  page,
}) => {
  await page.goto("/workspace/work-items/?layout=board&sort=dueDate")
  await page.locator('[data-work-items-ready="true"]').waitFor()
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  await page.getByLabel("示例场景", { exact: true }).selectOption("partial")
  await page.getByRole("button", { name: "移动 WI-006", exact: true }).click()
  await page.getByRole("button", { name: "移动到 Todo", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByText("示例已确认修改。", { exact: true }).first(),
  ).toBeVisible()
  const group = page.locator('[data-board-group="todo"]')
  await group.getByRole("button", { name: "加载更多", exact: true }).click()
  await group.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(group.locator('[data-work-item="wi-006"]')).toBeVisible()
})

test("a portable Table without URLs exposes a keyboard-accessible activation button", async ({
  page,
}) => {
  await page.goto("/docs/work-item-table/")
  const title = page.locator('[data-row-id="wi-001"]').getByRole("button", {
    name: "WI-001 · Unify work item properties across views",
    exact: true,
  })
  await title.focus()
  await expect(title).toBeFocused()
  await title.press("Enter")
  await expect(page.locator('[data-row-id="wi-001"]')).toHaveAttribute(
    "data-active",
    "true",
  )
})

test("Work Items article keeps performance evidence separate and loads its screenshots on demand", async ({
  page,
  request,
}) => {
  await page.goto("/blog/work-items-shared-views/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Work Items 的 List、Board 与 Table 如何共享组件",
  )
  await expect(page.locator("article")).toContainText("1000")
  await expect(page.locator('[data-demo-mounted="true"]')).toHaveCount(0)
  const picture = page.locator("article img").first()
  await picture.scrollIntoViewIfNeeded()
  await expect(picture).toBeVisible()
  await expect
    .poll(() =>
      picture.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)
  const measurements = await request.get("/blog/work-items/measurements.json")
  expect(measurements.ok()).toBe(true)
  expect(
    (await measurements.json()).measurements.map(
      (m: { count: number }) => m.count,
    ),
  ).toEqual([50, 200, 1000])
})
