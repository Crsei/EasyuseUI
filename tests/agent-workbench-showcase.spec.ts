import { readFile } from "node:fs/promises"
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { regionDefinitions } from "@/components/examples/agent-workbench/showcase-model"
const root = "/examples/agent-workbench"
const preview = (page: import("@playwright/test").Page) =>
  page.locator("[data-preview-container]")
const input = (page: import("@playwright/test").Page) =>
  page.getByRole("textbox", { name: "消息输入", exact: true })
test("project environment details do not borrow a different project's session", async ({
  page,
}) => {
  await page.goto(
    `${root}/app/?page=project&project=project-new&session=session-filter`,
  )
  await page.getByRole("button", { name: "环境详情", exact: true }).click()
  const details = page.getByRole("dialog")
  await expect(details).toContainText("New research project")
  await expect(details).toContainText("尚未选择环境")
  await expect(details).not.toContainText("main")
  await expect(details).not.toContainText("Local fixture environment")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "环境详情", exact: true }),
  ).toBeFocused()
})
test("project status filtering distinguishes no matches from an empty project", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=project&project=project-demo`)
  await page
    .getByRole("combobox", { name: "运行状态筛选", exact: true })
    .selectOption("completed")
  await expect(
    page.getByText("没有符合筛选条件的任务", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("此项目尚无任务", { exact: true })).toHaveCount(0)
  await page
    .getByRole("combobox", { name: "运行状态筛选", exact: true })
    .selectOption("all")
  await expect(
    page.getByText("没有符合筛选条件的任务", { exact: true }),
  ).toHaveCount(0)
})
test("artifact navigation scopes a previous session to the newly selected project", async ({
  page,
}) => {
  await page.goto(
    `${root}/app/?template=artifacts&page=artifacts&session=session-report`,
  )
  await expect(
    page.getByRole("button", { name: "下载本地产物", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "项目", exact: true })
    .selectOption("project-new")
  await expect(page).toHaveURL(/project=project-new/)
  await page.getByRole("button", { name: "产物", exact: true }).first().click()
  await expect(page).toHaveURL(/page=artifacts/)
  await expect(page.getByText("此项目尚无任务", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "下载本地产物", exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole("combobox", { name: "项目", exact: true })
    .selectOption("project-demo")
  await page.getByRole("button", { name: /summary\.md/ }).click()
  await expect(page).toHaveURL(/session=session-report/)
  await expect(
    page.getByRole("button", { name: "下载本地产物", exact: true }),
  ).toBeVisible()
})
for (const [width, height] of [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
]) {
  test(`lab directory, controls and contracts work at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.goto(`${root}/regions/?region=composer&scenario=queue`)
    await input(page).fill("Persistent lab draft")
    await input(page).evaluate((el) =>
      el.setAttribute("data-instance", "stable"),
    )
    if (width < 768) {
      await page.getByRole("button", { name: "示例设置", exact: true }).click()
      await expect(page.getByRole("dialog")).toBeVisible()
    } else {
      await page
        .getByRole("button", { name: "收起场景控制", exact: true })
        .click()
      await expect(
        page.getByRole("combobox", { name: "展示场景", exact: true }),
      ).toHaveCount(0)
      await page
        .getByRole("button", { name: "展开场景控制", exact: true })
        .click()
    }
    await page.getByRole("checkbox", { name: "窄容器", exact: true }).check()
    if (width < 768) {
      await page.keyboard.press("Escape")
      await expect(
        page.getByRole("button", { name: "示例设置", exact: true }),
      ).toBeFocused()
    }
    await expect(input(page)).toHaveValue("Persistent lab draft")
    await expect(input(page)).toHaveAttribute("data-instance", "stable")
    for (const label of ["组件映射", "数据合同", "验收说明"]) {
      const disclosure = page
        .locator("details")
        .filter({ has: page.locator("summary", { hasText: label }) })
      await expect(disclosure).not.toHaveAttribute("open")
      await disclosure.locator("summary").click()
      await expect(disclosure).toHaveAttribute("open")
    }
    const href = await page
      .getByRole("link", { name: "在组合布局查看", exact: true })
      .getAttribute("href")
    expect(href).toContain("scenario=queue")
    expect(href).toContain("session=session-filter")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false)
  })
}
const caseAssertions: Record<string, string | RegExp> = {
  "no-projects": /暂无项目|尚无项目/,
  "no-sessions": /没有匹配的会话/,
  "long-title": /normalize-and-match/,
  unread: /修复大小写/,
  archived: /最近|归档/,
  readonly: /只读|新任务/,
  "context-uploading": /上传中/,
  "context-failed": /失败/,
  "context-stale": /失效/,
  "context-denied": /无权限|拒绝/,
  "context-unknown": /未知/,
  "context-over-limit": /1800|1,800/,
  "context-truncated": /10–30|10-30/,
  "context-duplicates": /normalize-and-match/,
  streaming: /生成中|Plan/,
  cancelled: /已停止/,
  "late-event": /Plan/,
  submitting: /等待|提交/,
  queue: /发送/,
  steer: /发送/,
  "no-environment": /未知|尚未选择/,
  "interrupt-pending": /停止|中断/,
  "expired-approval": /过期/,
  "approval-unknown": /结果待确认/,
  "tool-long": /run_tests/,
  "tool-empty": /run_tests/,
  "tool-failed": /run_tests/,
  "file-variants": /src\/filter/,
  "files-long": /截断|部分/,
  binary: /二进制/,
  "version-changed": /版本已变化|版本/,
  "no-changes": /没有变更/,
  conflict: /部分/,
  "output-truncated": /截断/,
  "output-empty": /暂无|输出/,
  "test-failed": /FAIL/,
  "preview-unavailable": /暂无可用/,
  "preview-report": /过滤逻辑分析|Filtering/,
  unplanned: /尚未提供计划/,
  "plan-running": /执行中/,
  unreviewed: /未审阅/,
  "reviewed-unaccepted": /审阅通过/,
  "no-attention": /当前没有关注项/,
  "invalid-config": /配置有效/,
  "refresh-error": /读取失败|refresh failed/,
  "artifact-unavailable": /暂无可用/,
  "artifact-unsupported": /此格式尚未提供/,
  "artifact-variants": /source-export.bin/,
}
for (const definition of regionDefinitions)
  for (const scenario of definition.cases) {
    test(`region ${definition.id} renders the ${scenario} source case`, async ({
      page,
    }) => {
      await page.goto(
        `${root}/regions/?region=${definition.id}&scenario=${scenario}`,
      )
      await expect(page.locator("[data-region-lab]")).toHaveAttribute(
        "data-scenario",
        scenario,
      )
      await expect(preview(page)).toContainText(caseAssertions[scenario])
      if (scenario === "cancelled")
        await expect(
          preview(page).locator('[data-message-state="cancelled"]'),
        ).toBeVisible()
      if (scenario === "approval-unknown") {
        await expect(
          preview(page).getByRole("button", { name: "批准", exact: true }),
        ).toHaveCount(0)
        await expect(
          preview(page)
            .getByRole("button", { name: "查询结果", exact: true })
            .first(),
        ).toBeVisible()
      }
      if (["tool-long", "output-truncated"].includes(scenario))
        await expect(preview(page)).not.toContainText("secret-showcase-value")
      if (scenario === "reviewed-unaccepted")
        await expect(preview(page)).toContainText("业务验收: 待验收")
      await expect(
        page.getByRole("combobox", { name: "展示场景", exact: true }),
      ).toHaveValue(scenario)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false)
    })
  }
for (const definition of regionDefinitions) {
  test(`region ${definition.id} has initial loading, empty, partial and retained error presentation`, async ({
    page,
  }) => {
    for (const scenario of ["loading", "empty", "partial", "error"]) {
      await page.goto(
        `${root}/regions/?region=${definition.id}&scenario=${scenario}`,
      )
      const region = preview(page)
        .locator(`[data-data-state="${scenario}"]`)
        .first()
      await expect(region).toBeVisible()
      if (scenario === "loading") {
        await expect(region).toHaveAttribute("aria-busy", "true")
        await expect(
          preview(page)
            .getByRole("group", { name: "正在加载", exact: true })
            .first(),
        ).toBeVisible()
      } else
        await expect(preview(page)).toContainText(
          scenario === "empty"
            ? /暂无|没有|尚无|开始一段对话/
            : scenario === "partial"
              ? /部分/
              : /读取失败/,
        )
    }
  })
}
test("empty project selection creates only after confirmation and browser history restores project", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=new`)
  await page
    .getByRole("combobox", { name: "项目", exact: true })
    .last()
    .selectOption("project-new")
  await input(page).fill("Selected project research")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await expect(page).toHaveURL(/page=new/)
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "确认回执", exact: true })
    .last()
    .click()
  await page.keyboard.press("Escape")
  await expect(page).toHaveURL(/project=project-new/)
  await expect(page).toHaveURL(/session=session-created-/)
  await page.getByRole("button", { name: "项目", exact: true }).first().click()
  await expect(
    page
      .getByText("Selected project research", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  await page.goBack()
  await expect(input(page)).toBeVisible()
})
test("project scope, review filtering and sort retain selection without approving", async ({
  page,
}) => {
  await page.goto(
    `${root}/app/?template=console&page=inbox&session=session-report`,
  )
  await page
    .getByRole("combobox", { name: "待办筛选", exact: true })
    .selectOption("review")
  await expect(
    page
      .getByText("分析资料并整理报告", { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "排序", exact: true })
    .selectOption("title")
  await expect(page.locator("main[data-session-id]")).toHaveAttribute(
    "data-session-id",
    "session-report",
  )
  await page
    .getByRole("combobox", { name: "项目", exact: true })
    .selectOption("project-empty")
  await page
    .getByRole("button", { name: "收件箱", exact: true })
    .first()
    .click()
  await expect(
    page
      .getByText("Write report artifact", { exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "批准", exact: true }),
  ).toHaveCount(0)
})
test("artifact source focuses the correct message and local download produces actual report bytes", async ({
  page,
}) => {
  await page.goto(
    `${root}/app/?template=artifacts&page=artifacts&session=session-report`,
  )
  const downloadEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "下载本地产物", exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe("summary.md")
  const file = await download.path()
  expect(file).toBeTruthy()
  expect(await readFile(file!, "utf8")).toContain("# 过滤逻辑分析报告")
  await page.getByRole("button", { name: "定位来源引用", exact: true }).click()
  await expect(
    page.locator('[data-follow-tail-id="artifact-source-session-report"]'),
  ).toBeFocused()
})
test("plan locates the specific tool without starting a request", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session&panel=plan`)
  await page.getByRole("button", { name: "对象属性", exact: true }).click()
  await page
    .getByRole("button", { name: /Run focused tests/ })
    .filter({ visible: true })
    .first()
    .click()
  await expect(page).toHaveURL(/panel=activity/)
  await expect(
    page.locator('[data-tool-target="tool-session-filter"]'),
  ).toBeFocused()
  await expect(page.getByText("request-1", { exact: false })).toHaveCount(0)
})
test("preferences retain panels through refresh and clear safely without clearing drafts", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=session`)
  await input(page).fill("Do not persist this draft")
  await page.getByRole("button", { name: "运行面板", exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("easyuseui-workbench-panels")),
    )
    .toContain('"bottomOpen":true')
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "Do not persist",
  )
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "清除本地偏好", exact: true })
    .click()
  await page.keyboard.press("Escape")
  await expect(input(page)).toHaveValue("Do not persist this draft")
  await page.reload()
  await expect(input(page)).toHaveValue("")
  await expect(
    page.getByRole("button", { name: "运行面板", exact: true }),
  ).toHaveAttribute("aria-pressed", "false")
})
test("English, dark mode, zoom, reduced motion and coarse targets remain accessible", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 720, height: 450 },
    hasTouch: true,
    colorScheme: "dark",
    reducedMotion: "reduce",
  })
  await context.addInitScript(() => {
    localStorage.setItem("theme", "dark")
    localStorage.setItem("easyuseui-locale", "en")
  })
  const page = await context.newPage()
  await page.goto(`${root}/regions/?region=composer`)
  await expect(
    page.getByRole("button", { name: "Example settings", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Example settings", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([])
  const box = await page
    .getByRole("combobox", { name: "Region laboratory", exact: true })
    .boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false)
  await context.close()
})
test("sidebar search recovers from an empty filter and collapse retains the query", async ({
  page,
}) => {
  await page.goto(`${root}/regions/?region=sidebar`)
  const search = page.getByRole("textbox", { name: "搜索会话", exact: true })
  await search.fill("does-not-exist")
  await expect(preview(page)).toContainText(/没有数据|暂无会话/)
  await page.getByRole("button", { name: "收起会话侧栏", exact: true }).click()
  await page.getByRole("button", { name: "展开会话侧栏", exact: true }).click()
  await expect(search).toHaveValue("does-not-exist")
  await search.clear()
  await expect(
    page.getByRole("button", { name: /修复大小写过滤逻辑/ }).first(),
  ).toBeVisible()
})
test("context source retry waits for its receipt and removal does not allow a late confirmation to reinsert it", async ({
  page,
}) => {
  await page.goto(`${root}/regions/?region=context&scenario=context-failed`)
  const reference = preview(page).locator(
    '[data-context-id="showcase-reference"]',
  )
  await reference.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(reference).toContainText("上传中")
  await reference.getByRole("button", { name: /移除/ }).click()
  await page.getByRole("button", { name: "确认回执", exact: true }).click()
  await expect(reference).toHaveCount(0)
  await expect(page.locator('[data-state="confirmed"]')).toBeVisible()
})
test("output reconnect and preview switch perform local read navigation and retain available output", async ({
  page,
}) => {
  await page.goto(`${root}/regions/?region=output&scenario=disconnected`)
  await preview(page)
    .getByRole("button", { name: "重试读取", exact: true })
    .click()
  await expect(page).toHaveURL(/scenario=default/)
  await expect(preview(page)).toContainText("Awaiting source test result")
  await page
    .getByRole("combobox", { name: "展示场景", exact: true })
    .selectOption("preview-report")
  await expect(preview(page)).toContainText("过滤逻辑分析报告")
  await preview(page)
    .getByRole("combobox", { name: "预览类型", exact: true })
    .selectOption("browser")
  await expect(preview(page)).toContainText(
    "真实模型、文件、Git、PTY 和浏览器服务尚未连接。",
  )
})
test("settings retry retains configuration and enables a valid next request without sending it", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=settings&scenario=refresh-error`)
  const model = page
    .getByRole("combobox", { name: "模型（下次发送）", exact: true })
    .filter({ visible: true })
  await expect(model).toHaveValue("fixture-model")
  await page
    .getByRole("button", { name: /重试/ })
    .filter({ visible: true })
    .first()
    .click()
  await expect(model).toHaveValue("fixture-model")
  await expect(page.getByText("request-1", { exact: false })).toHaveCount(0)
  await page
    .getByRole("combobox", { name: "环境（下次发送）", exact: true })
    .filter({ visible: true })
    .selectOption("")
  await expect(
    page.getByText("请配置有效的模型和环境后再提交", { exact: true }),
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "环境（下次发送）", exact: true })
    .filter({ visible: true })
    .selectOption("local-demo")
  await expect(
    page.getByText("请配置有效的模型和环境后再提交", { exact: true }),
  ).toHaveCount(0)
})

test("late creation confirmation updates its project without redirecting a different open session", async ({
  page,
}) => {
  await page.goto(
    `${root}/app/?page=new&layout=&panel=&draft=discard-on-navigation`,
  )
  await input(page).fill("Late creation stays scoped")
  await page.getByRole("button", { name: "发送", exact: true }).click()
  await page
    .getByRole("button", { name: /修复大小写过滤逻辑/ })
    .first()
    .click()
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "确认回执", exact: true })
    .last()
    .click()
  await page.keyboard.press("Escape")
  await expect(page).toHaveURL(/session=session-filter/)
  expect(new URL(page.url()).searchParams.has("draft")).toBe(false)
  await expect(
    page.getByRole("button", { name: /Late creation stays scoped/ }).first(),
  ).toBeVisible()
})
test("lab reference metadata restores focus and locates the related file without pretending to read its body", async ({
  page,
}) => {
  await page.goto(`${root}/regions/?region=context`)
  const source = preview(page)
    .getByRole("button", { name: /src\/filter\.ts/ })
    .first()
  await source.click()
  await expect(page.getByRole("dialog")).toContainText("来源版本")
  await expect(page.getByRole("dialog")).toContainText("a1")
  await expect(page.getByRole("dialog")).toContainText(
    "来源正文尚未通过宿主读取",
  )
  await page.keyboard.press("Escape")
  await expect(source).toBeFocused()
  await source.click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "查看关联变更", exact: true })
    .click()
  await expect(page.locator("[data-region-lab]")).toHaveAttribute(
    "data-region",
    "files",
  )
  await expect(preview(page)).toContainText("src/filter.ts")
})
test("lab artifact and plan links display their specific source destinations", async ({
  page,
}) => {
  await page.goto(`${root}/regions/?region=artifacts&session=session-report`)
  await preview(page)
    .getByRole("button", { name: "定位来源引用", exact: true })
    .click()
  await expect(page.locator("[data-region-lab]")).toHaveAttribute(
    "data-region",
    "conversation",
  )
  await expect(
    page.locator('[data-follow-tail-id="artifact-source-session-report"]'),
  ).toBeFocused()
  await page.goBack()
  await preview(page)
    .getByRole("button", { name: /Generate report artifact/ })
    .first()
    .click()
  await expect(page.locator("[data-region-lab]")).toHaveAttribute(
    "data-region",
    "tools",
  )
  await expect(
    page.locator('[data-tool-target="tool-session-report"]'),
  ).toBeFocused()
})

test("artifact selection gates preview, copy and download by the actual local content", async ({
  page,
}) => {
  await page.goto(`${root}/app/?page=artifacts&scenario=artifact-variants`)
  const select = page.getByRole("combobox", { name: "选择产物", exact: true })
  const download = page.getByRole("button", {
    name: "下载本地产物",
    exact: true,
  })
  await expect(download).toBeEnabled()
  await select.selectOption("artifact-unsupported-session-filter")
  await expect(download).toBeDisabled()
  await expect(
    page.getByText("此格式尚未提供本地预览与下载内容", { exact: true }),
  ).toBeVisible()
  await select.selectOption("artifact-unavailable-session-filter")
  await expect(download).toBeDisabled()
  await select.selectOption("artifact-report")
  await expect(download).toBeEnabled()
})
