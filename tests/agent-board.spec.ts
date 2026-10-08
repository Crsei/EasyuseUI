import { test, expect, type Page } from "@playwright/test"
import { defaultAgentBoardView } from "../lib/agent-board-model"
import {
  filterAgentRuns,
  mergeRunSnapshots,
  dedupeAttention,
  parseAgentBoardQuery,
  runGroup,
  safeArtifactHref,
  summarizeUsage,
} from "../lib/agent-board-view"
import { createAgentBoardFixtures } from "../components/examples/agent-board/fixtures"
const route = "/workspace/agents/"
async function scenario(page: Page, value: string) {
  const controls = page.locator("[data-example-controls]")
  await controls.locator("summary").click()
  await page.getByLabel("切换场景", { exact: true }).selectOption(value)
}
async function openRun(page: Page, id = "run-5") {
  await page.locator(`[data-run-id="${id}"] button`).first().click()
  await expect(page.locator(`[data-agent-inspector="${id}"]`)).toBeVisible()
}
test("grouping retains ten statuses and unknown values", () => {
  const fixture = createAgentBoardFixtures()
  expect(fixture.runs).toHaveLength(11)
  expect(runGroup("idle")).toBe("other")
  expect(runGroup("provider-future")).toBe("other")
  expect(runGroup("failed")).toBe("ended")
  expect(
    filterAgentRuns(fixture.runs, {
      ...defaultAgentBoardView,
      query: "run-3",
    }).map((run) => run.runId),
  ).toEqual(["run-3"])
})
test("snapshot revisions and request IDs reject stale duplicates", () => {
  const fixture = createAgentBoardFixtures()
  const run = fixture.runs[2]
  const merged = mergeRunSnapshots(fixture.runs, [
    { ...run, revision: 3, title: "new" },
    { ...run, revision: 2, title: "stale" },
  ])
  expect(merged.find((item) => item.runId === run.runId)?.title).toBe("new")
  const request = fixture.attention[0]
  expect(
    dedupeAttention([
      request,
      { ...request, revision: 3, title: "new" },
      { ...request, revision: 2 },
    ]),
  ).toEqual([{ ...request, revision: 3, title: "new" }])
})
test("usage deduplicates sources, excludes descendants and separates currencies and unknowns", () => {
  const fixture = createAgentBoardFixtures()
  const summary = summarizeUsage(
    [...fixture.usage, fixture.usage[0]],
    fixture.runs,
  )
  expect(summary.tokens).toBe(12000)
  expect([...summary.currencies]).toEqual([
    ["USD", 0.12],
    ["EUR", 0.08],
  ])
  expect(summary.excluded.map((item) => item.observationId)).toEqual([
    "usage-child",
    "usage-unknown",
  ])
  expect(summarizeUsage([], fixture.runs).tokens).toBeUndefined()
  expect(summarizeUsage(fixture.usage, [fixture.runs[3]]).tokens).toBe(2000)
})
test("invalid URL values fall back and artifact URLs cannot execute code", () => {
  expect(
    parseAgentBoardQuery(
      new URLSearchParams("view=invalid&status=madeup&kind=invalid"),
    ).viewState,
  ).toEqual(defaultAgentBoardView)
  expect(safeArtifactHref("javascript:alert(1)")).toBeUndefined()
  expect(safeArtifactHref("//evil.test")).toBeUndefined()
  expect(safeArtifactHref("/report/")).toBe("/report/")
})
test("four views share filters and selection with browser history", async ({
  page,
}) => {
  await page.goto(route)
  await expect(page.locator("[data-run-id]")).toHaveCount(11)
  await openRun(page)
  await page.getByRole("radio", { name: "列表", exact: true }).click()
  await expect(page.locator("[data-run-id]")).toHaveCount(11)
  await expect(page.locator('[data-agent-inspector="run-5"]')).toBeVisible()
  await page.getByLabel("搜索运行", { exact: true }).fill("no-match")
  await expect(
    page.getByText("选中的运行不在当前筛选结果中，详情保持打开。"),
  ).toBeVisible()
  await expect(page.getByText("没有匹配的运行", { exact: true })).toBeVisible()
  await page.getByLabel("搜索运行", { exact: true }).fill("")
  await page.getByRole("radio", { name: "统计", exact: true }).click()
  await expect(
    page.getByRole("definition").filter({ hasText: "12,000" }),
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole("radio", { name: "列表", exact: true }),
  ).toHaveAttribute("data-checked", "")
  await page.goForward()
  await expect(
    page.getByRole("radio", { name: "统计", exact: true }),
  ).toHaveAttribute("data-checked", "")
})
test("Inbox counts requests independently of runs and opens the source run", async ({
  page,
}) => {
  await page.goto(route + "?view=inbox")
  await expect(page.locator("[data-attention-id]")).toHaveCount(5)
  await expect(
    page.getByText("5 个关注项 · 涉及 4 次运行").first(),
  ).toBeVisible()
  await page.locator('[data-attention-id="attention-input"] button').click()
  await expect(page.locator('[data-agent-inspector="run-6"]')).toBeVisible()
  await expect(
    page.locator("[data-agent-inspector] [data-attention-id]"),
  ).toHaveCount(2)
})
test("unknown tool receipt remains locked across closing and must reconcile", async ({
  page,
}) => {
  await page.goto(route)
  await scenario(page, "unknown")
  await openRun(page)
  const panel = page.locator('[data-attention-id="attention-approval"]')
  await panel.getByRole("button", { name: "批准", exact: true }).click()
  await expect(panel.getByText("结果待确认；先核对再操作。")).toBeVisible()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await openRun(page)
  await expect(
    panel.getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
  await panel.getByRole("button", { name: "查询结果", exact: true }).click()
  await expect(
    panel.getByText("已确认请求响应；运行状态仍以来源为准。"),
  ).toBeVisible()
  await expect(panel.locator('[data-runtime-status="waiting"]')).toBeVisible()
  await expect(panel.locator('[data-runtime-status="completed"]')).toHaveCount(
    0,
  )
})
test("rejected, expired and read-only approvals retain readable content", async ({
  page,
}) => {
  await page.goto(route + "?run=run-5")
  await scenario(page, "rejected")
  const panel = page.locator('[data-attention-id="attention-approval"]')
  await panel.getByRole("button", { name: "批准", exact: true }).click()
  await expect(panel.getByText("已拒绝", { exact: false })).toBeVisible()
  await page.getByLabel("切换场景", { exact: true }).selectOption("expired")
  await expect(panel.getByText("请求已过期")).toBeVisible()
  await expect(
    panel.getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
  await page.getByLabel("切换场景", { exact: true }).selectOption("readonly")
  await expect(panel.getByText("只读；调用方未提供处理能力。")).toBeVisible()
  await expect(
    panel.getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
})
test("late receipt after a generation reset cannot change the new request", async ({
  page,
}) => {
  await page.clock.install()
  await page.goto(route + "?run=run-5")
  await scenario(page, "unknown")
  const panel = page.locator('[data-attention-id="attention-approval"]')
  await panel.getByRole("button", { name: "批准", exact: true }).click()
  await page.getByRole("button", { name: "恢复初始数据", exact: true }).click()
  await page.clock.fastForward(1000)
  await expect(
    panel.getByRole("button", { name: "批准", exact: true }),
  ).toBeVisible()
  await expect(panel.getByText("结果待确认；先核对再操作。")).toHaveCount(0)
  await expect(
    panel.getByRole("button", { name: "批准", exact: true }),
  ).toBeEnabled()
})
test("input drafts survive locale and run switches without translating caller data", async ({
  page,
}) => {
  await page.goto(route + "?run=run-6")
  const response = page.getByLabel("回复或编辑内容", { exact: true })
  await response.fill("caller 中文 draft")
  await page.getByRole("button", { name: "Language", exact: true }).click()
  await expect(
    page.getByRole("textbox", {
      name: "Response or edited content",
      exact: true,
    }),
  ).toHaveValue("caller 中文 draft")
  await page
    .getByRole("button", { name: "Close Inspector", exact: true })
    .click()
  await openRun(page, "run-6")
  await expect(
    page.getByRole("textbox", {
      name: "Response or edited content",
      exact: true,
    }),
  ).toHaveValue("caller 中文 draft")
  await expect(
    page.getByText("确认目标 API 范围", { exact: true }),
  ).toBeVisible()
})
test("refresh failures and disconnect preserve snapshots and artifacts", async ({
  page,
}) => {
  await page.goto(route + "?run=run-8")
  await scenario(page, "error")
  await expect(page.locator("[data-run-id]")).toHaveCount(11)
  await expect(page.getByText("快照刷新失败", { exact: false })).toBeVisible()
  await page.getByRole("radio", { name: "产物", exact: true }).click()
  await expect(page.getByText("组件实现报告.md", { exact: true })).toBeVisible()
  await page
    .getByLabel("切换场景", { exact: true })
    .selectOption("disconnected")
  await expect(
    page.getByText("来源已断开；保留最后快照。", { exact: false }),
  ).toBeVisible()
  await expect(page.locator('[data-run-id="run-4"]')).toContainText("执行中")
  await expect(page.getByText("组件实现报告.md", { exact: true })).toBeVisible()
})
test("completion, PR, review and acceptance remain independent", async ({
  page,
}) => {
  await page.goto(route + "?run=run-8")
  const inspector = page.locator("[data-agent-inspector]")
  await expect(inspector).toContainText("已完成")
  await expect(inspector).toContainText("未审阅")
  await expect(inspector).toContainText("待验收")
  await expect(inspector.getByRole("link", { name: "PR 已创建" })).toBeVisible()
  await page.getByRole("radio", { name: "产物", exact: true }).click()
  await expect(inspector).toContainText("已移除")
  await expect(
    inspector.getByRole("link", { name: "查看 旧版截图.png" }),
  ).toHaveCount(0)
})
test("trace output is bounded and secrets are redacted", async ({ page }) => {
  await page.goto(route + "?run=run-5")
  await page.getByRole("radio", { name: "执行", exact: true }).click()
  await page.getByRole("treeitem").first().focus()
  await page.keyboard.press("ArrowRight")
  await page.getByRole("treeitem", { name: /写入报告/ }).click()
  await expect(page.locator('[data-call-id="trace-write"]')).toBeVisible()
  await expect(page.locator('[data-call-id="trace-write"]')).not.toContainText(
    "private-trace-secret",
  )
  await expect(page.locator('[data-call-id="trace-write"]')).toContainText(
    "[REDACTED]",
  )
  await expect(page.locator('[data-call-id="trace-write"]')).toContainText(
    "200",
  )
})
test("duplicate events and stale snapshots do not replace current data", async ({
  page,
}) => {
  await page.goto(route + "?run=run-5")
  await scenario(page, "normal")
  await page.getByRole("button", { name: "推进示例事件" }).click()
  await expect(page.locator('[data-run-id="run-3"]')).toContainText(
    "来源阶段 1",
  )
  await expect(page.getByText("STALE RESPONSE")).toHaveCount(0)
  await page.getByRole("radio", { name: "执行", exact: true }).click()
  await expect(page.locator('[data-event-id="event-1"]')).toHaveCount(1)
})
for (const width of [390, 768, 1440])
  test(`layout and details remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(route)
    await page.getByRole("radio", { name: "列表", exact: true }).click()
    await openRun(page)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    if (width < 1280) {
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("dialog")).toHaveCount(0)
      await expect(
        page.locator('[data-run-id="run-5"] button').first(),
      ).toBeFocused()
    } else {
      await page
        .getByRole("button", { name: "关闭 Inspector", exact: true })
        .click()
      await expect(
        page.locator('[data-run-id="run-5"] button').first(),
      ).toBeFocused()
    }
  })
test("data states and deleted deep link remain recoverable", async ({
  page,
}) => {
  await page.goto(route + "?view=list&run=removed")
  await expect(
    page.getByText("该运行已不可用；可重新读取或选择其他运行。"),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await scenario(page, "loading")
  await expect(page.locator('[data-data-state="loading"]')).toBeVisible()
  await page.getByLabel("切换场景", { exact: true }).selectOption("empty")
  await expect(page.getByText("没有运行记录", { exact: true })).toBeVisible()
  await page.getByLabel("切换场景", { exact: true }).selectOption("partial")
  await expect(page.getByText("显示 11 · 已加载 11 / 总数 20")).toBeVisible()
})
test("generic Board has keyboard move alternative and agent Board is read only", async ({
  page,
}) => {
  await page.goto("/docs/item-board/")
  await page
    .getByRole("button", { name: "移动 Independent note", exact: true })
    .click()
  await page
    .getByRole("button", { name: "移动到 Group B", exact: true })
    .click()
  await expect(
    page
      .getByRole("region", { name: "Group B" })
      .locator('[data-board-item="note"]'),
  ).toBeVisible()
  await page.goto(route)
  await expect(page.locator('[draggable="true"]')).toHaveCount(0)
})
test("touch targets and dark English layout remain readable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto(route)
  await page.getByRole("button", { name: "Language", exact: true }).click()
  await page.getByRole("button", { name: "Theme", exact: true }).click()
  await page.getByRole("radio", { name: "List", exact: true }).click()
  expect(
    (await page
      .getByRole("radio", { name: "List", exact: true })
      .boundingBox())!.height,
  ).toBeGreaterThanOrEqual(44)
  await openRun(page, "run-6")
  const input = page.getByRole("textbox", {
    name: "Response or edited content",
    exact: true,
  })
  await input.fill("Touch draft")
  await expect(input).toHaveValue("Touch draft")
  await expect(
    page.getByRole("button", { name: "Respond", exact: true }),
  ).toBeEnabled()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await context.close()
})
