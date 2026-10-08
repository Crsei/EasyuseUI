import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import {
  isScheduleDate,
  addScheduleDays,
  addScheduleMonths,
  scheduleDayDifference,
  todayInTimeZone,
  scheduleDateError,
} from "../lib/schedule-date-utils"
import {
  normalizeTimeline,
  normalizeCalendar,
  timelineViewport,
  calendarViewport,
  validateScheduleChange,
  workItemDates,
  scheduleIntersects,
  mergeSchedulePage,
  type ScheduleChangeIntent,
} from "../lib/schedule-view-model"
import { defaultWorkItemsView } from "../lib/work-items-model"
import { normalizeWorkItemsView } from "../lib/work-items-view"
import { makeWorkItems } from "../components/examples/work-items/fixtures"
test("civil dates cover leap years, invalid dates, inclusive spans, DST and opposite timezone days", () => {
  expect(isScheduleDate("2024-02-29")).toBe(true)
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "2026-1-01",
    "0000-01-01",
    "2026-13-01",
  ])
    expect(isScheduleDate(value)).toBe(false)
  expect(addScheduleDays("2024-02-28", 2)).toBe("2024-03-01")
  expect(addScheduleDays("2026-12-31", 1)).toBe("2027-01-01")
  expect(addScheduleMonths("2024-01-31", 1)).toBe("2024-02-29")
  expect(scheduleDayDifference("2026-03-09", "2026-03-07")).toBe(2)
  expect(scheduleDayDifference("2026-10-09", "2026-10-09") + 1).toBe(1)
  expect(
    todayInTimeZone("America/Los_Angeles", new Date("2026-03-08T09:30Z")),
  ).toBe("2026-03-08")
  expect(
    todayInTimeZone("Pacific/Kiritimati", new Date("2026-10-09T11:30Z")),
  ).toBe("2026-10-10")
  expect(
    todayInTimeZone("Pacific/Honolulu", new Date("2026-10-09T01:30Z")),
  ).toBe("2026-10-08")
  expect(
    scheduleDateError({ startDate: "2026-10-10", dueDate: "2026-10-09" }),
  ).toBe("invalidRange")
})
test("viewport migration, whole weeks and intersection retain spans that start before the viewport", () => {
  expect(normalizeWorkItemsView(defaultWorkItemsView).layout).toBe("list")
  expect(
    normalizeTimeline({ anchorDate: "bad", scale: "nonsense" as "week" })
      .anchorDate,
  ).toBe("2026-10-09")
  const quarter = timelineViewport(
    normalizeTimeline({ anchorDate: "2027-01-10", scale: "quarter" }),
  )
  expect([quarter.rangeStart, quarter.rangeEnd]).toEqual([
    "2027-01-01",
    "2027-03-31",
  ])
  const month = calendarViewport(
    normalizeCalendar({ anchorDate: "2026-10-09", weekStartsOn: 1 }),
  )
  expect([month.rangeStart, month.rangeEnd]).toEqual([
    "2026-09-28",
    "2026-11-01",
  ])
  const item = {
    ...makeWorkItems(1)[0],
    startDate: "2026-09-20",
    dueDate: "2026-11-20",
  }
  expect(scheduleIntersects(item, month)).toBe(true)
  expect(
    scheduleIntersects(
      { ...item, startDate: null, dueDate: null },
      month,
      "exclude",
    ),
  ).toBe(false)
  const page = {
    date: "2026-10-09",
    queryKey: "q",
    itemIds: ["a"],
    loadedCount: 1,
    totalCount: null,
    dataState: "partial" as const,
  }
  expect(
    mergeSchedulePage(page, { ...page, itemIds: ["a", "b"] }).itemIds,
  ).toEqual(["a", "b"])
  expect(mergeSchedulePage(page, { ...page, queryKey: "late" })).toBe(page)
  expect(mergeSchedulePage(page, { ...page, date: "2026-10-10" })).toBe(page)
})
test("atomic schedule validation rejects permissions, stale versions, unknown, no-op and invalid single-end shifts", () => {
  const item = {
    ...makeWorkItems(1)[0],
    startDate: "2026-10-08",
    dueDate: "2026-10-09",
  }
  const intent: ScheduleChangeIntent = {
    itemId: item.id,
    operationId: "op",
    baseRevision: item.revision,
    queryKey: "q",
    kind: "shift",
    previousDates: workItemDates(item),
    nextDates: { startDate: "2026-10-09", dueDate: "2026-10-10" },
  }
  const context = {
    item,
    queryKey: "q",
    capabilities: {
      canCreate: false,
      canMove: () => false,
      canEditField: () => true,
    },
  }
  expect(validateScheduleChange(intent, context)).toBeNull()
  expect(validateScheduleChange({ ...intent, baseRevision: 0 }, context)).toBe(
    "stale",
  )
  expect(
    validateScheduleChange(intent, {
      ...context,
      capabilities: {
        ...context.capabilities,
        canEditField: (_, field) => field !== "startDate",
      },
    }),
  ).toBe("denied")
  expect(
    validateScheduleChange(intent, {
      ...context,
      mutation: {
        operationId: "old",
        itemId: item.id,
        baseRevision: 1,
        status: "unknown",
      },
    }),
  ).toBe("locked")
  expect(
    validateScheduleChange(
      { ...intent, nextDates: workItemDates(item) },
      context,
    ),
  ).toBe("noop")
  expect(
    validateScheduleChange({ ...intent, kind: "setDueDate" }, context),
  ).toBe("invalidRange")
  const single = { ...item, startDate: null }
  expect(
    validateScheduleChange(
      { ...intent, previousDates: workItemDates(single) },
      { ...context, item: single },
    ),
  ).toBe("invalidRange")
  expect(
    validateScheduleChange(
      {
        ...intent,
        kind: "resizeEnd",
        nextDates: { ...workItemDates(item), dueDate: "2026-10-07" },
      },
      context,
    ),
  ).toBe("invalidRange")
})
async function start(page: Page, query = "layout=timeline") {
  await page.goto(`/workspace/work-items/?${query}`)
  await expect(page.locator("[data-work-items-ready]")).toHaveAttribute(
    "data-work-items-ready",
    "true",
  )
}
async function scenario(page: Page, value: string) {
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  await page.getByLabel("示例场景", { exact: true }).selectOption(value)
  await page.getByRole("button", { name: "收起底部面板", exact: true }).click()
}
async function dates(page: Page, id = "wi-004") {
  await page
    .locator(`[data-timeline-row="${id}"]`)
    .getByRole("button", {
      name: `修改 ${id.toUpperCase()} 的日期`,
      exact: true,
    })
    .click()
  return page.locator(`[data-schedule-form="${id}"]`)
}
async function drag(
  page: Page,
  target: ReturnType<Page["locator"]>,
  delta: number,
  cancel = false,
) {
  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box!.x + box!.width / 2 + delta,
    box!.y + box!.height / 2,
    { steps: 5 },
  )
  if (cancel) await page.keyboard.press("Escape")
  await page.mouse.up()
}
test("Timeline native shift, both resize handles and Escape produce distinct inclusive changes", async ({
  page,
}) => {
  await start(page)
  const row = page.locator('[data-timeline-row="wi-004"]'),
    bar = row.locator("[data-schedule-start]")
  await drag(page, row.locator("[data-draggable]"), 40)
  await expect(bar).toHaveAttribute("data-schedule-start", "2026-10-06")
  await expect(bar).toHaveAttribute("data-schedule-end", "2026-10-09")
  await drag(
    page,
    row.getByRole("button", { name: "调整开始日期 WI-004", exact: true }),
    40,
  )
  await expect(bar).toHaveAttribute("data-schedule-start", "2026-10-07")
  await expect(bar).toHaveAttribute("data-schedule-end", "2026-10-09")
  await drag(
    page,
    row.getByRole("button", { name: "调整截止日期 WI-004", exact: true }),
    40,
  )
  await expect(bar).toHaveAttribute("data-schedule-end", "2026-10-10")
  await drag(page, row.locator("[data-draggable]"), 40, true)
  await expect(bar).toHaveAttribute("data-schedule-end", "2026-10-10")
})
test("three scales, sidebar alignment, readonly handles, exact form dates and independent anchors", async ({
  page,
}) => {
  await start(
    page,
    "layout=timeline&scale=quarter&date=2026-10-09&lane=priority",
  )
  await expect(page.locator("[data-timeline-scale]")).toHaveAttribute(
    "data-timeline-scale",
    "quarter",
  )
  const form = await dates(page)
  await form.getByLabel("开始日期", { exact: true }).fill("2026-10-08")
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-08")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-timeline-row="wi-004"] [data-schedule-start]'),
  ).toHaveAttribute("data-schedule-start", "2026-10-08")
  for (const scale of ["week", "month"]) {
    await page.getByLabel("时间刻度", { exact: true }).selectOption(scale)
    await expect(page.locator("[data-timeline-scale]")).toHaveAttribute(
      "data-timeline-scale",
      scale,
    )
  }
  const aligned = await page
    .locator('[data-timeline-row="wi-004"]')
    .evaluate((el) => {
      const [sidebar, track] = el.children
      return (
        Math.abs(
          sidebar.getBoundingClientRect().height -
            track.getBoundingClientRect().height,
        ) < 1
      )
    })
  expect(aligned).toBe(true)
  await page.getByRole("radio", { name: "日历", exact: true }).check()
  await page.getByLabel("定位日期", { exact: true }).fill("2026-11-10")
  await page.getByRole("radio", { name: "时间线", exact: true }).check()
  await expect(page.getByLabel("定位日期", { exact: true })).toHaveValue(
    "2026-10-09",
  )
  await expect(page).toHaveURL(/lane=priority/)
  await scenario(page, "readonly")
  await expect(page.locator("[data-draggable]")).toHaveCount(0)
  await expect(page.getByRole("button", { name: /^调整开始日期/ })).toHaveCount(
    0,
  )
})
test("rejected and unknown date drafts survive layout and locale changes; reconciliation preserves confirmed dates", async ({
  page,
}) => {
  await start(page)
  await scenario(page, "unknown")
  const form = await dates(page)
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-15")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await expect(
    form.getByRole("button", { name: "确认日期", exact: true }),
  ).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(
    page.locator('[data-timeline-row="wi-004"] [data-schedule-start]'),
  ).toHaveAttribute("data-schedule-end", "2026-10-08")
  await page.getByRole("radio", { name: "日历", exact: true }).check()
  await page.getByRole("button", { name: "2026-10-08", exact: true }).click()
  const agenda = page.locator("[data-calendar-agenda]")
  await expect(agenda.locator('[data-mutation="unknown"]')).toBeVisible()
  await agenda.getByRole("button", { name: "查询结果", exact: true }).click()
  await page.getByRole("radio", { name: "时间线", exact: true }).check()
  await expect(
    page.locator('[data-timeline-row="wi-004"] [data-schedule-start]'),
  ).toHaveAttribute("data-schedule-end", "2026-10-15")
  await scenario(page, "rejected")
  const rejected = await dates(page)
  await rejected.getByLabel("截止日期", { exact: true }).fill("2026-10-17")
  await rejected.getByRole("button", { name: "确认日期", exact: true }).click()
  await expect(
    page.locator('[data-timeline-row="wi-004"] [data-mutation="rejected"]'),
  ).toBeVisible()
  await expect(rejected.getByLabel("截止日期", { exact: true })).toHaveValue(
    "2026-10-17",
  )
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await page.getByRole("radio", { name: "时间线", exact: true }).check()
  const retained = await dates(page)
  await expect(retained.getByLabel("截止日期", { exact: true })).toHaveValue(
    "2026-10-17",
  )
  await page.getByRole("button", { name: "English", exact: true }).click()
  await page
    .locator('[data-timeline-row="wi-004"]')
    .getByRole("button", { name: "Edit dates for WI-004", exact: true })
    .click()
  await expect(retained.getByLabel("Due date", { exact: true })).toHaveValue(
    "2026-10-17",
  )
})
test("Calendar due-only form and native drop reject dates before start and share results with all layouts", async ({
  page,
}) => {
  await start(page, "layout=calendar")
  await page.getByRole("button", { name: "2026-10-08", exact: true }).click()
  const entry = page.locator(
    '[data-calendar-agenda] [data-calendar-entry="wi-004"]',
  )
  await entry
    .getByRole("button", { name: "修改 WI-004 的日期", exact: true })
    .click()
  const form = page.locator('[data-schedule-form="wi-004"]')
  await expect(form.getByLabel("开始日期", { exact: true })).toHaveCount(0)
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-04")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await expect(form.getByRole("alert")).toContainText("不能早于")
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-12")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "时间线", exact: true }).check()
  const bar = page.locator('[data-timeline-row="wi-004"] [data-schedule-start]')
  await expect(bar).toHaveAttribute("data-schedule-start", "2026-10-05")
  await expect(bar).toHaveAttribute("data-schedule-end", "2026-10-12")
  await page.getByRole("radio", { name: "日历", exact: true }).check()
  const source = page.locator(
    '[data-calendar-day="2026-10-12"] [data-calendar-entry="wi-004"]',
  )
  await source.dragTo(page.locator('[data-calendar-day="2026-10-13"]'))
  await expect(
    page.locator(
      '[data-calendar-day="2026-10-13"] [data-calendar-entry="wi-004"]',
    ),
  ).toBeVisible()
  for (const name of ["列表", "看板", "表格"]) {
    await page.getByRole("radio", { name, exact: true }).check()
    await expect(
      page.locator('[data-work-item="wi-004"], [data-row-id="wi-004"]').first(),
    ).toBeVisible()
  }
})
test("Calendar keyboard, weekends, day paging errors and preset-only creation", async ({
  page,
}) => {
  await start(page, "layout=calendar")
  const date = page.getByRole("button", { name: "2026-10-09", exact: true })
  await date.focus()
  await page.keyboard.press("ArrowRight")
  await expect(
    page.getByRole("button", { name: "2026-10-10", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Home")
  await expect(
    page.getByRole("button", { name: "2026-10-05", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("End")
  await expect(
    page.getByRole("button", { name: "2026-10-11", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.locator("[data-calendar-agenda]")).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "2026-10-11", exact: true }),
  ).toBeFocused()
  await page.getByLabel("显示周末", { exact: true }).uncheck()
  await expect(page.locator('[data-calendar-day="2026-10-11"]')).toHaveCount(0)
  await page.getByText("周末工作项", { exact: true }).click()
  await expect(page.locator("[data-calendar-agenda]")).toContainText(
    "2026-10-11",
  )
  await page.getByLabel("日历视图", { exact: true }).selectOption("week")
  await expect(page.locator("[data-calendar-day]")).toHaveCount(5)
  await page.getByLabel("日历视图", { exact: true }).selectOption("month")
  await scenario(page, "partial")
  await page.getByRole("button", { name: "2026-10-06", exact: true }).click()
  const agenda = page.locator("[data-calendar-agenda]")
  await agenda
    .getByRole("button", { name: "加载此日期更多工作项", exact: true })
    .click()
  await expect(agenda.getByRole("alert")).toBeVisible()
  await agenda.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(agenda.locator("[data-calendar-entry]")).toHaveCount(2)
  await agenda
    .getByRole("button", { name: "在 2026-10-06 新建工作项", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("2026-10-06")
  await page.keyboard.press("Escape")
  await expect(agenda.locator("[data-calendar-entry]")).toHaveCount(2)
})
test("Timeline range paging retains rows, retries unknown totals and selection stays hidden outside date range", async ({
  page,
}) => {
  await start(page)
  await page
    .locator('[data-timeline-row="wi-004"]')
    .getByRole("checkbox")
    .check()
  await page.getByLabel("定位日期", { exact: true }).fill("2027-01-09")
  await expect(
    page.getByText("已选 1 项 · 隐藏 1 项", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("定位日期", { exact: true }).fill("2026-10-09")
  await scenario(page, "partial")
  await expect(page.locator("[data-timeline-row]")).toHaveCount(8)
  await page.getByRole("button", { name: "加载更多", exact: true }).click()
  await expect(page.getByRole("alert")).toBeVisible()
  await expect(page.locator("[data-timeline-row]")).toHaveCount(8)
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(page.locator("[data-timeline-row]")).toHaveCount(24)
})
test("390px touch agenda, minimum date targets, themes, locale, no nested controls and accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await start(page, "layout=calendar")
  await page.getByRole("button", { name: "2026-10-08", exact: true }).click()
  await expect(
    page.locator('[data-calendar-agenda] [data-calendar-entry="wi-004"]'),
  ).toBeVisible()
  const size = await page
    .getByRole("button", { name: "2026-10-08", exact: true })
    .boundingBox()
  expect(size!.height).toBeGreaterThanOrEqual(44)
  await expect(page.locator("button button, a button, button a")).toHaveCount(0)
  const violations = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
  expect(violations.violations).toEqual([])
  await page.getByRole("button", { name: "English", exact: true }).click()
  for (const name of ["List", "Board", "Table", "Timeline", "Calendar"]) {
    const target = page.getByRole("radio", { name, exact: true })
    const rect = await target.boundingBox()
    expect(rect!.x).toBeGreaterThanOrEqual(0)
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(390)
    await expect(target).toBeVisible()
  }
})
test("non-WorkItem scheduling docs install generic containers and work item adapters", async ({
  page,
  request,
}) => {
  for (const slug of [
    "timeline",
    "calendar",
    "schedule-view-controls",
    "work-item-date-range-field",
    "work-items-schedule",
    "work-item-timeline",
    "work-item-calendar",
  ]) {
    const doc = await request.get(`/docs/${slug}/`)
    expect(doc.ok()).toBe(true)
    expect(await doc.text()).toContain(`/r/${slug}.json`)
    expect((await request.get(`/r/${slug}.json`)).ok()).toBe(true)
  }
  await page.goto("/docs/timeline/")
  await expect(
    page.locator('[data-demo-loader="timeline"] [data-timeline-row="release"]'),
  ).toContainText("Release window")
  await page.goto("/docs/calendar/")
  await expect(
    page.locator(
      '[data-demo-loader="calendar"] [data-calendar-day="2026-10-09"]',
    ),
  ).toContainText("Release checklist")
})

test("manual Timeline row ordering is independent of dates and disabled under automatic sort", async ({
  page,
}) => {
  await start(page)
  const row = page.locator('[data-timeline-row="wi-004"]')
  await row
    .getByRole("button", { name: "手动顺序 WI-004", exact: true })
    .click()
  await page.getByRole("button", { name: "上移", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-timeline-row]").nth(2)).toHaveAttribute(
    "data-timeline-row",
    "wi-004",
  )
  await expect(row.locator("[data-schedule-start]")).toHaveAttribute(
    "data-schedule-end",
    "2026-10-08",
  )
  await page.getByRole("button", { name: "显示", exact: true }).click()
  await page.getByLabel("排序", { exact: true }).selectOption("dueDate")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "手动顺序 WI-004", exact: true }),
  ).toHaveCount(0)
})

test("unscheduled existing item receives paired dates without creation and clears back to one queue record", async ({
  page,
}) => {
  await start(page)
  await page.locator("[data-unscheduled] summary").click()
  const queue = page.locator('[data-unscheduled] [data-work-item="wi-001"]')
  await queue
    .getByRole("button", { name: "修改 WI-001 的日期", exact: true })
    .click()
  const form = page.locator('[data-schedule-form="wi-001"]')
  await form.getByLabel("开始日期", { exact: true }).fill("2026-10-10")
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-12")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-timeline-row]")).toHaveCount(24)
  await expect(queue).toHaveCount(0)
  const saved = await dates(page, "wi-001")
  await saved.getByRole("button", { name: "清空日期", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(queue).toHaveCount(1)
})

test("historical invalid dates and one-endpoint markers stay readable with explicit correction", async ({
  page,
}) => {
  await page.goto("/docs/work-item-timeline/")
  const demo = page.locator('[data-demo-loader="work-item-timeline"]')
  await expect(
    demo.locator('[data-timeline-row="wi-003"] [data-single="true"]'),
  ).toContainText("缺少开始日期")
  await expect(
    demo.locator('[data-timeline-row="wi-005"] [data-single="true"]'),
  ).toContainText("缺少截止日期")
  await expect(demo.locator('[data-timeline-row="wi-006"]')).toContainText(
    "截止日期不能早于开始日期",
  )
  await demo
    .locator('[data-timeline-row="wi-006"]')
    .getByRole("button", { name: "修改 WI-006 的日期", exact: true })
    .click()
  await expect(page.locator('[data-schedule-form="wi-006"]')).toContainText(
    "原始日期",
  )
})

test("unsent date drafts survive layout and locale switches without submitting a write", async ({
  page,
}) => {
  await start(page)
  const form = await dates(page)
  await form.getByLabel("截止日期", { exact: true }).fill("2026-10-19")
  await page.keyboard.press("Escape")
  await page.getByRole("radio", { name: "表格", exact: true }).check()
  await page.getByRole("radio", { name: "时间线", exact: true }).check()
  await expect(
    page.locator('[data-timeline-row="wi-004"] [data-schedule-start]'),
  ).toHaveAttribute("data-schedule-end", "2026-10-08")
  const retained = await dates(page)
  await expect(retained.getByLabel("截止日期", { exact: true })).toHaveValue(
    "2026-10-19",
  )
  await page.getByRole("button", { name: "English", exact: true }).click()
  await page
    .locator('[data-timeline-row="wi-004"]')
    .getByRole("button", { name: "Edit dates for WI-004", exact: true })
    .click()
  await expect(retained.getByLabel("Due date", { exact: true })).toHaveValue(
    "2026-10-19",
  )
  await expect(page.locator("[data-mutation]")).toHaveCount(0)
})

test("Timeline clips cross-month and cross-year ranges while full dates remain available", async ({
  page,
}) => {
  await start(page)
  let form = await dates(page)
  await form.getByLabel("开始日期", { exact: true }).fill("2026-09-28")
  await form.getByLabel("截止日期", { exact: true }).fill("2026-11-06")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  const bar = page.locator('[data-timeline-row="wi-004"] [data-schedule-start]')
  await expect(bar).toHaveAttribute("data-clip-start", "true")
  await expect(bar).toHaveAttribute("data-clip-end", "true")
  await expect(bar).toHaveAttribute("title", /2026-09-28.*2026-11-06/)
  form = await dates(page)
  await form.getByLabel("开始日期", { exact: true }).fill("2026-12-25")
  await form.getByLabel("截止日期", { exact: true }).fill("2027-01-10")
  await form.getByRole("button", { name: "确认日期", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByLabel("定位日期", { exact: true }).fill("2027-01-09")
  await expect(bar).toHaveAttribute("data-clip-start", "true")
  await expect(bar).toHaveAttribute("data-schedule-end", "2027-01-10")
})

test("coarse pointer schedule targets stay disjoint and date forms replace Timeline handles", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await start(page, "layout=calendar")
    const date = page.getByRole("button", { name: "2026-10-08", exact: true })
    await date.tap()
    const box = await date.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await page.getByRole("radio", { name: "时间线", exact: true }).check()
    const row = page.locator('[data-timeline-row="wi-004"]')
    await expect(
      row.getByRole("button", { name: "调整开始日期 WI-004", exact: true }),
    ).toBeHidden()
    const change = row.getByRole("button", {
      name: "修改 WI-004 的日期",
      exact: true,
    })
    const action = await change.boundingBox(),
      select = await row.getByRole("checkbox").boundingBox()
    expect(action!.height).toBeGreaterThanOrEqual(44)
    expect(action!.x).toBeGreaterThanOrEqual(select!.x + select!.width)
    await change.tap()
    await expect(page.locator('[data-schedule-form="wi-004"]')).toBeVisible()
  } finally {
    await context.close()
  }
})
