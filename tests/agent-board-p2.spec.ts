import { expect, test } from "@playwright/test"
import {
  prepareAgentDependencies,
  prepareAgentUsageHistory,
  historySegments,
  virtualWindow,
} from "../lib/agent-board-p2"
import { createAgentBoardFixtures } from "../components/examples/agent-board/fixtures"
import {
  agentDependencies,
  agentHistory,
} from "../components/examples/agent-board/p2-fixtures"

test("explicit dependencies retain stale arbitration, missing endpoints and unresolved topology without implying satisfaction", () => {
  const runs = createAgentBoardFixtures().runs
  const model = prepareAgentDependencies(runs, [
    ...agentDependencies,
    { ...agentDependencies[0], revision: 1, state: "satisfied" },
  ])
  expect(
    model.relevant.find(
      (edge) => edge.dependencyId === agentDependencies[0].dependencyId,
    )?.state,
  ).toBe("blocked")
  expect(model.missing).toHaveLength(1)
  const scoped = prepareAgentDependencies(runs, agentDependencies, ["run-5"])
  expect(scoped.visible).toHaveLength(1)
  expect(scoped.outsideScope).toHaveLength(2)
  expect(scoped.drawable).toHaveLength(0)
  const cyclic = prepareAgentDependencies(runs, [
    ...agentDependencies,
    {
      dependencyId: "cycle",
      revision: 1,
      prerequisiteRunId: "run-8",
      dependentRunId: "run-5",
      label: "source cycle",
      state: "unknown",
    },
  ])
  expect(cyclic.unresolved.has("run-5")).toBe(true)
  expect(cyclic.unresolved.has("run-11")).toBe(true)
  expect(
    prepareAgentDependencies(runs, agentDependencies, undefined, 2).omitted,
  ).toBe(9)
  expect(prepareAgentDependencies([], agentDependencies).missing).toHaveLength(
    4,
  )
  expect(runs.find((run) => run.runId === "run-8")?.runtimeStatus).toBe(
    "completed",
  )
  expect(
    model.relevant.find((edge) => edge.prerequisiteRunId === "run-8")?.state,
  ).toBe("blocked")
})
test("timestamped history separates currencies and runs, retains unknown/zero, and never bridges missing intervals", () => {
  const tokens = prepareAgentUsageHistory(agentHistory, "tokens")
  expect(tokens.count).toBe(6)
  expect(
    historySegments(tokens.series[0].points).map((segment) => segment.length),
  ).toEqual([2, 3])
  const costs = prepareAgentUsageHistory(agentHistory, "cost")
  expect(costs.series.map((series) => series.currency)).toEqual(["USD", "EUR"])
  expect(
    prepareAgentUsageHistory(agentHistory, "cost", ["run-5"]).series,
  ).toHaveLength(1)
  expect(
    prepareAgentUsageHistory(agentHistory, "durationMs").series[0].points[3],
  ).toMatchObject({ value: 0, valid: true })
  const revised = prepareAgentUsageHistory(
    [...agentHistory, { ...agentHistory[0], revision: 2, value: undefined }],
    "tokens",
  )
  expect(revised.count).toBe(6)
  expect(revised.series[0].points[0].valid).toBe(false)
  const gap = prepareAgentUsageHistory(
    [
      { ...agentHistory[0], pointId: "a" },
      {
        ...agentHistory[0],
        pointId: "b",
        intervalStart: "2026-10-08T09:00:00Z",
        timestamp: "2026-10-08T09:05:00Z",
      },
    ],
    "tokens",
  )
  expect(historySegments(gap.series[0].points)).toHaveLength(2)
  expect(
    prepareAgentUsageHistory(
      [{ ...agentHistory[0], timestamp: "2026-10-08T08:00:00" }],
      "tokens",
    ).series[0].points[0].valid,
  ).toBe(false)
})
test("virtual range handles variable row heights and viewport boundaries", () => {
  expect(virtualWindow([0, 40, 100, 300, 340, 400], 0, 80, 1)).toEqual({
    start: 0,
    end: 3,
  })
  expect(virtualWindow([0, 40, 100, 300, 340, 400], 310, 40, 1)).toEqual({
    start: 2,
    end: 5,
  })
  expect(virtualWindow([0], 0, 560, 3)).toEqual({ start: 0, end: 0 })
})
test("dependency view loads the read-only Canvas on demand and preserves source context under filtering", async ({
  page,
}) => {
  await page.goto("/workspace/agents/")
  await expect(page.locator(".react-flow")).toHaveCount(0)
  await page.getByRole("radio", { name: "依赖关系", exact: true }).click()
  await expect(page).toHaveURL(/view=dependencies/)
  await expect(
    page.locator("[data-agent-dependencies] .react-flow"),
  ).toBeVisible()
  const list = page.getByRole("list", { name: "来源依赖列表" })
  await expect(
    list.getByText("来源运行未加载 · external-run-not-loaded"),
  ).toBeVisible()
  await page
    .getByRole("textbox", { name: "搜索运行", exact: true })
    .fill("run-5")
  await expect(page.locator("[data-canvas-node]")).toHaveCount(1)
  await expect(
    page.getByText(
      "2 条依赖涉及筛选范围外的已加载运行；在下方列表保留上下文。",
    ),
  ).toBeVisible()
  await list
    .locator('[data-dependency-id="dependency-plan-build"]')
    .getByRole("button")
    .first()
    .click()
  await expect(page.locator('[data-agent-inspector="run-1"]')).toBeVisible()
  await expect(
    page.getByText("选中的运行不在当前筛选结果中，详情保持打开。"),
  ).toBeVisible()
  await page.goBack()
  await expect(page.locator("[data-agent-inspector]")).toHaveCount(0)
  await expect(page.locator("[data-canvas-node]")).toHaveCount(1)
})
test("history charts retain real gaps, separate currencies and keep metric choice across locale changes", async ({
  page,
}) => {
  await page.goto("/workspace/agents/?view=insights")
  const history = page.locator("[data-agent-history]")
  await expect(history.locator("[data-history-segment]")).toHaveCount(2)
  await expect(history.locator("circle")).toHaveCount(5)
  await history.getByRole("radio", { name: "费用", exact: true }).click()
  await expect(history.locator("figure")).toHaveCount(2)
  await expect(history.locator("figcaption").first()).toHaveText("run-5 · USD")
  await expect(history.locator("figcaption").last()).toHaveText("run-8 · EUR")
  await history.getByRole("radio", { name: "耗时 (ms)", exact: true }).click()
  await expect(history.locator('circle[cy="120"]')).toHaveCount(1)
  await page.getByRole("button", { name: "Language", exact: true }).click()
  await expect(
    history.getByRole("radio", { name: "Duration (ms)", exact: true }),
  ).toHaveAttribute("aria-checked", "true")
  await expect(history.locator("circle")).toHaveCount(6)
})
test("large lists bound mounted rows and support keyboard navigation, activation and focus restoration", async ({
  page,
}) => {
  await page.goto("/workspace/agents/scale/?mode=virtual")
  const viewport = page.getByRole("region", {
    name: "虚拟运行列表",
    exact: true,
  })
  await expect(viewport).toBeVisible()
  await expect
    .poll(() => page.locator("[data-run-id]").count())
    .toBeLessThan(25)
  await viewport.focus()
  await page.keyboard.press("End")
  const last = page.locator('[data-run-id="bulk-1000"] button')
  await expect(last).toBeFocused()
  await expect(page.locator('[data-virtual-run="bulk-1000"]')).toHaveAttribute(
    "aria-posinset",
    "1000",
  )
  await last.press("Enter")
  await expect(page.locator('[data-agent-inspector="bulk-1000"]')).toBeVisible()
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await expect(last).toBeFocused()
  await page.keyboard.press("Home")
  await expect(page.locator('[data-run-id="bulk-0001"] button')).toBeFocused()
  await page.keyboard.press("PageDown")
  await expect(page.locator("[data-agent-inspector]")).toHaveCount(0)
  await expect
    .poll(() => page.locator("[data-run-id]").count())
    .toBeLessThan(25)
  await page.getByRole("button", { name: "Language", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Virtual run list", exact: true }),
  ).toBeVisible()
  await expect(page.locator("[data-run-id]").first()).toHaveAttribute(
    "data-run-id",
    /^bulk-/,
  )
})
test("virtual rows remain readable on a narrow touch viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  await page.goto(
    new URL(
      "/workspace/agents/scale/?mode=virtual",
      test.info().project.use.baseURL as string,
    ).href,
  )
  const viewport = page.getByRole("region", {
    name: "虚拟运行列表",
    exact: true,
  })
  await viewport.focus()
  await page.keyboard.press("End")
  const last = page.locator('[data-run-id="bulk-1000"] button')
  await expect(last).toBeFocused()
  await last.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(last).toBeFocused()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await context.close()
})

test("a failed dependency chunk preserves the workspace and retries without changing source data", async ({
  page,
}) => {
  await page.goto("/workspace/agents/")
  await page.waitForLoadState("networkidle")
  await page.route("**/_next/static/chunks/*.js", (route) =>
    route.abort("failed"),
  )
  await page.getByRole("radio", { name: "依赖关系", exact: true }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "依赖视图加载失败" }),
  ).toBeVisible()
  await expect(
    page.getByRole("textbox", { name: "搜索运行", exact: true }),
  ).toBeVisible()
  await page.unroute("**/_next/static/chunks/*.js")
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(page.locator(".react-flow")).toBeVisible()
  await expect(page.locator("[data-canvas-node]")).toHaveCount(11)
})

test("filtering away a virtual opener preserves detail and closes to a connected workspace target", async ({
  page,
}) => {
  await page.goto("/workspace/agents/scale/?mode=virtual")
  await page.locator('[data-run-id="bulk-0001"] button').click()
  await page
    .getByRole("textbox", { name: "搜索运行", exact: true })
    .fill("bulk-0999")
  await expect(page.locator('[data-agent-inspector="bulk-0001"]')).toBeVisible()
  await expect(page.locator('[data-run-id="bulk-0001"]')).toHaveCount(0)
  await page
    .getByRole("button", { name: "关闭 Inspector", exact: true })
    .click()
  await expect(page.locator("[data-agent-workspace-main]")).toBeFocused()
})
