import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"
const route = "/examples/workflow-analytics/"
async function ready(page: Page, query = "") {
  await page.goto(route + query)
  await expect(page.locator("[data-showcase-view]")).toBeVisible()
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
}
test("overview stays bounded; KPI, detail and five layouts retain the same snapshot", async ({
  page,
}) => {
  await ready(page)
  await expect(page.locator("[data-chart-frame]")).toHaveCount(2)
  await page
    .getByRole("button", { name: "查看来源", exact: true })
    .nth(3)
    .click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("来源记录")
  await expect(dialog).toContainText("Alpha · Workflow")
  const first = dialog.getByRole("button", { name: /Alpha · Workflow/ }).first()
  const title = await first.innerText()
  await first.click()
  await expect(page.getByRole("dialog").last()).toContainText(title)
  await page.keyboard.press("Escape")
  await page
    .getByRole("dialog")
    .first()
    .getByRole("button", { name: "打开工作视图", exact: true })
    .click()
  for (const layout of ["列表", "看板", "表格", "时间线", "日历"]) {
    await page.getByRole("radio", { name: layout, exact: true }).click()
    await expect(page.locator("body")).toContainText("WF-")
  }
  await page.getByRole("button", { name: "返回分析", exact: true }).click()
  await expect(page.locator("[data-chart-frame]")).toHaveCount(2)
})
test("URL refresh and browser back restore project, cohort, chart and bucket", async ({
  page,
}) => {
  await ready(page, "?view=flow&project=beta&range=90d&tz=UTC")
  await expect(page.getByLabel("项目", { exact: true })).toHaveValue("beta")
  await page.getByLabel("项目", { exact: true }).selectOption("alpha")
  await expect(page.getByLabel("项目", { exact: true })).toHaveValue("alpha")
  await page.goBack()
  await expect(page.getByLabel("项目", { exact: true })).toHaveValue("beta")
  await page.reload()
  await expect(page.getByLabel("时区", { exact: true })).toHaveValue("UTC")
  await ready(page, "?view=unsupported&credential=ignored")
  await expect(page.getByText(/部分 URL 参数无效/)).toBeVisible()
})
test("chart directory mounts only an explicitly selected preview and has five readable tabs", async ({
  page,
}) => {
  await ready(page, "?view=charts&chart=cycle-time&range=90d")
  await expect(page.locator("[data-chart-frame]")).toHaveCount(0)
  await page.getByRole("button", { name: "加载此图预览", exact: true }).click()
  await expect(page.locator("[data-chart-frame]")).toHaveCount(1)
  await expect(page.locator(".recharts-scatter")).toBeVisible()
  await page.getByRole("button", { name: "聚合数据表", exact: true }).click()
  await expect(page.getByRole("table")).toBeVisible()
  await page.getByRole("button", { name: "口径说明", exact: true }).click()
  await expect(page.locator("pre")).toContainText("completedAt")
  await page.getByRole("button", { name: "最小用法", exact: true }).click()
  await expect(page.locator("pre")).toContainText("onDrilldown")
})
test("rejected draft survives; unknown save stays locked after remount and reconciles", async ({
  page,
}) => {
  await ready(page, "?view=custom")
  await page
    .getByLabel("本地保存回执", { exact: true })
    .selectOption("rejected")
  await page
    .getByRole("button", { name: "列宽: 6", exact: true })
    .first()
    .click()
  await page.getByRole("button", { name: "保存布局", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "保存被拒绝，草稿保留" }),
  ).toBeVisible()
  await page.getByLabel("本地保存回执", { exact: true }).selectOption("unknown")
  await page.getByRole("button", { name: "保存布局", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "保存布局", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "项目概览", exact: true }).click()
  await page.getByRole("button", { name: "自定义布局", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "保存结果未知，先核对" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "取消草稿", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "核对保存结果", exact: true }).click()
  await expect(page.getByText("已确认保存", { exact: true })).toBeVisible()
})
test("builder requires current compatible preview before apply and cancels without overwriting applied analysis", async ({
  page,
}) => {
  await ready(page, "?view=builder")
  await expect(
    page.getByRole("button", { name: "应用分析", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "预览查询", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "应用分析", exact: true }),
  ).toBeEnabled()
  await page.getByRole("button", { name: "应用分析", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "已应用分析", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "单位", exact: true })
    .selectOption("USD")
  await expect(
    page.getByRole("alert").filter({ hasText: "单位与图型不兼容" }),
  ).toContainText("单位与图型不兼容")
  await expect(
    page.getByRole("button", { name: "预览查询", exact: true }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "取消草稿", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "已应用分析", exact: true }),
  ).toBeVisible()
})
test("resource capacity, run acceptance, forecast evidence and business dependency remain distinct", async ({
  page,
}) => {
  await ready(page, "?view=resources")
  await page
    .getByRole("button", { name: /Lin|lin/ })
    .first()
    .click()
  await expect(page.getByRole("table")).toBeVisible()
  await page.getByRole("button", { name: "打开排期视图", exact: true }).click()
  await expect(
    page.getByRole("radio", { name: "时间线", exact: true }),
  ).toBeVisible()
  await ready(page, "?view=agents")
  await expect(page.getByText("产物验收", { exact: true })).toBeVisible()
  await expect(page.locator("body")).toContainText("EUR")
  await expect(page.locator("body")).toContainText("不是墙钟耗时")
  await ready(page, "?view=risk&range=90d")
  await expect(page.locator("body")).toContainText("滚动回测")
  await expect(page.locator("body")).toContainText("真实环路数: 1")
  await page.getByRole("button", { name: "预览依赖图", exact: true }).click()
  await expect(page.locator(".react-flow")).toBeVisible()
})
test("refresh failure retains data, delayed scope cannot overwrite new scope, revoked details disappear", async ({
  page,
}) => {
  await ready(page)
  await page.getByText("模拟说明与异常场景", { exact: true }).click()
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("error")
  await expect(
    page.getByText("网络错误：模拟刷新失败", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("[data-chart-frame]")).toHaveCount(2)
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("late-response")
  await page.getByLabel("项目", { exact: true }).selectOption("beta")
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("success")
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
  await page.waitForTimeout(1000)
  await expect(page.getByLabel("项目", { exact: true })).toHaveValue("beta")
  await page
    .getByRole("button", { name: "查看来源", exact: true })
    .first()
    .click()
  await expect(page.getByRole("dialog")).toContainText("Beta")
  await page.keyboard.press("Escape")
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("denied")
  await expect(page.getByText(/权限错误：无权查看此范围/)).toBeVisible()
  await expect(page.locator("[data-chart-frame]")).toHaveCount(0)
})
test("CSV and image exports identify the same authorized fixture snapshot", async ({
  page,
}) => {
  await ready(page)
  const chart = page.locator('[data-widget="overview-trend"]')
  const csvDownload = page.waitForEvent("download")
  await chart.getByRole("button", { name: "导出 CSV", exact: true }).click()
  const csv = await csvDownload
  expect(csv.suggestedFilename()).toBe("completion-trend.csv")
  const svgDownload = page.waitForEvent("download")
  await chart.getByRole("button", { name: "导出图像", exact: true }).click()
  const svg = await svgDownload
  expect(svg.suggestedFilename()).toBe("completion-trend.svg")
})

test("forecast examples expose insufficient samples and stale models without future tasks", async ({
  page,
}) => {
  await ready(page, "?view=risk&range=90d")
  await page.getByText("模拟说明与异常场景", { exact: true }).click()
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("forecast-insufficient")
  await expect(page.getByText(/样本不足、历史不完整或范围不稳定/)).toBeVisible()
  await page
    .getByLabel("模拟说明与异常场景", { exact: true })
    .selectOption("forecast-stale")
  await expect(
    page.getByText("模型已过期，需重新计算", { exact: true }),
  ).toBeVisible()
})

test("large aggregate tables page records and image export follows chart visibility", async ({
  page,
}) => {
  await ready(page)
  const chart = page.locator('[data-widget="overview-trend"]')
  await chart.getByRole("button", { name: "数据表", exact: true }).click()
  await expect(
    chart.getByRole("button", { name: "导出图像", exact: true }),
  ).toBeDisabled()
  await page.goto(route + "benchmark/")
  await page.getByLabel("Points", { exact: true }).selectOption("1000")
  const first = page.locator('[data-widget="bench-0"]')
  await first.getByRole("button", { name: "数据表", exact: true }).click()
  await expect(first.locator("tbody tr")).toHaveCount(50)
  await first.getByRole("button", { name: "下一页", exact: true }).click()
  await expect(
    first.getByText("聚合点 51–100 / 250", { exact: true }),
  ).toBeVisible()
})

test("burnup scope drilldown explains the bucket's actual scope changes", async ({ page }) => {
  await ready(page, "?view=delivery&range=90d&widget=burnup&series=scope&bucketId=2026-07-31")
  const changes = page.locator("[data-scope-changes]")
  await expect(changes).toContainText('"inScope":true')
  await changes.getByRole("button", { name: "WF-24 · scope", exact: true }).click()
  await expect(page.getByRole("dialog").last()).toContainText("Alpha · Workflow 24")
  await expect(page.getByRole("dialog").last()).toContainText('"kind": "scope"')
})

test("narrow navigation uses labeled icons without clipped titles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await ready(page)
  const navigation = page.getByRole("navigation", { name: "工作流分析", exact: true })
  const risk = navigation.getByRole("button", { name: "风险分析", exact: true })
  await expect(risk.locator("svg")).toBeVisible()
  await expect(risk.locator("span")).toBeHidden()
  await risk.click()
  await expect(page.locator("[data-showcase-view]")).toHaveAttribute("data-showcase-view", "risk")
  await expect(risk).toHaveAttribute("aria-current", "page")
})
