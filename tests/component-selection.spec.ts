import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { componentSelectionTemplate as template } from "../components/examples/component-selection/template"
import {
  createSelectionDraft,
  parseSelectionDraft,
} from "../lib/component-selection-model"

const storageKey = "easyuseui:component-selection:new-project-starter@1"
test.beforeEach(async ({ page }) => {
  await page.goto("/component-selection/")
  await expect(
    page.getByRole("heading", { level: 1, name: "组件选择模板" }),
  ).toBeVisible()
})

test("all live previews mount; preview selection is independent of component decisions", async ({
  page,
}) => {
  await expect(page.locator("[data-candidate]")).toHaveCount(6)
  const item = page.locator('[data-candidate="item"]')
  await item.getByRole("button", { name: /Beta/ }).click()
  await expect(item.getByRole("button", { name: /Beta/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  const tree = page.locator('[data-candidate="tree"]')
  await tree.getByRole("treeitem", { name: "Project", exact: true }).focus()
  await page.keyboard.press("Home")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(tree.getByText("当前预览: 任务", { exact: true })).toBeVisible()
  const tabs = page.locator('[data-candidate="tabs"]')
  await tabs.getByRole("tab", { name: "任务", exact: true }).click()
  await expect(tabs.getByRole("tabpanel")).toContainText("任务")
  for (const name of ["Tree", "Tabs", "Item", "DataTable", "Inspector", "Card"])
    await expect(
      page.getByRole("combobox", { name: `${name} 选择`, exact: true }),
    ).toHaveValue("undecided")
  await page
    .getByRole("combobox", { name: "Tree 选择", exact: true })
    .selectOption("preferred")
  await page
    .getByRole("combobox", { name: "Tabs 选择", exact: true })
    .selectOption("preferred")
  await expect(
    page.getByRole("combobox", { name: "Tree 选择", exact: true }),
  ).toHaveValue("alternative")
  await expect(tabs.getByRole("tabpanel")).toContainText("任务")
  await expect(item.getByRole("button", { name: /Beta/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
})

test("full handoff exports preserve notes, exclusions and unresolved groups; JSON round trip", async ({
  page,
}) => {
  await page
    .getByRole("textbox", { name: "项目名称", exact: true })
    .fill("测试项目")
  await page
    .getByRole("textbox", { name: "项目目标 / 主要流程", exact: true })
    .fill("创建任务并检查进度")
  await page
    .getByRole("textbox", { name: "技术与设计约束", exact: true })
    .fill("React；必须保留用户草稿")
  await page
    .locator('[data-selection-group="navigation"]')
    .getByRole("textbox", { name: "本模块需求 / 验收要求", exact: true })
    .fill("需要两级导航")
  await page
    .getByRole("textbox", { name: "Tree 批注", exact: true })
    .fill("保留键盘移动\n来源必须可核实")
  await page
    .getByRole("combobox", { name: "Tree 选择", exact: true })
    .selectOption("preferred")
  await page
    .getByRole("combobox", { name: "Tabs 选择", exact: true })
    .selectOption("rejected")
  const jsonEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "导出方案 JSON", exact: true }).click()
  const jsonDownload = await jsonEvent
  const serialized = await readFile((await jsonDownload.path())!, "utf8")
  const handoff = JSON.parse(serialized)
  expect(handoff.projectName).toBe("测试项目")
  expect(handoff.catalog).toHaveLength(3)
  expect(handoff.unresolvedGroupIds).toEqual(["collection", "details"])
  expect(handoff.groups[0].candidates[0]).toMatchObject({
    decision: "preferred",
    note: "保留键盘移动\n来源必须可核实",
  })
  expect(handoff.groups[0].candidates[1].decision).toBe("rejected")
  const markdownEvent = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "导出交接 Markdown", exact: true })
    .click()
  const markdown = await readFile((await (await markdownEvent).path())!, "utf8")
  expect(markdown).toContain("Tree [首选]")
  expect(markdown).toContain("Tabs [暂不采用]")
  expect(markdown).toContain("packages/ui/components/ui/tree.tsx")
  expect(markdown).toContain("> 来源必须可核实")
  expect(markdown).toContain("未决模块进入比较/验证任务")
  await page
    .getByRole("textbox", { name: "项目名称", exact: true })
    .fill("当前草稿")
  await page.getByLabel("导入方案 JSON", { exact: true }).setInputFiles({
    name: "plan.json",
    mimeType: "application/json",
    buffer: Buffer.from(serialized),
  })
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(
    page.getByRole("textbox", {
      name: "项目名称",
      exact: true,
      includeHidden: true,
    }),
  ).toHaveValue("当前草稿")
  await page.getByRole("button", { name: "确认替换", exact: true }).click()
  await expect(
    page.getByRole("textbox", { name: "项目名称", exact: true }),
  ).toHaveValue("测试项目")
  await expect(
    page.getByRole("textbox", { name: "Tree 批注", exact: true }),
  ).toHaveValue("保留键盘移动\n来源必须可核实")
})

test("explicit save survives reload; restore and new plan require replacement and preserve on cancel", async ({
  page,
}) => {
  const project = page.getByRole("textbox", { name: "项目名称", exact: true })
  await project.fill("已保存项目")
  await page
    .getByRole("textbox", { name: "Item 批注", exact: true })
    .fill("保存这条批注")
  await page.getByRole("button", { name: "保存到本机", exact: true }).click()
  await page.reload()
  await expect(project).toHaveValue("已保存项目")
  await expect(
    page.getByRole("textbox", { name: "Item 批注", exact: true }),
  ).toHaveValue("保存这条批注")
  await project.fill("未保存项目")
  await page.getByRole("button", { name: "恢复本机方案", exact: true }).click()
  await page.getByRole("button", { name: "取消", exact: true }).click()
  await expect(project).toHaveValue("未保存项目")
  await expect(
    page.getByRole("button", { name: "恢复本机方案", exact: true }),
  ).toBeFocused()
  await page.getByRole("button", { name: "恢复本机方案", exact: true }).click()
  await page.getByRole("button", { name: "确认替换", exact: true }).click()
  await expect(project).toHaveValue("已保存项目")
  await page.getByRole("button", { name: "新建方案", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(project).toHaveValue("已保存项目")
  await page.getByRole("button", { name: "新建方案", exact: true }).click()
  await page.getByRole("button", { name: "确认替换", exact: true }).click()
  await expect(project).toHaveValue("")
  await expect(
    page.getByRole("textbox", { name: "Item 批注", exact: true }),
  ).toHaveValue("")
})

test("invalid imports retain the draft; imported source metadata is never used", async ({
  page,
}) => {
  await page
    .getByRole("textbox", { name: "项目名称", exact: true })
    .fill("保留当前内容")
  const importInput = page.getByLabel("导入方案 JSON", { exact: true })
  const invalid = [
    "{broken",
    JSON.stringify({
      ...createSelectionDraft(template),
      templateRevision: "other",
    }),
    "x".repeat(128 * 1024 + 1),
  ]
  for (const source of invalid) {
    await importInput.setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(source),
    })
    await expect(
      page.locator("[data-component-selection] > [role=alert]"),
    ).toBeVisible()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(
      page.getByRole("textbox", { name: "项目名称", exact: true }),
    ).toHaveValue("保留当前内容")
  }
  const source = JSON.stringify({
    ...createSelectionDraft(template),
    catalog: [{ source: "attacker/source.tsx" }],
  })
  await importInput.setInputFiles({
    name: "metadata.json",
    mimeType: "application/json",
    buffer: Buffer.from(source),
  })
  await page.getByRole("button", { name: "确认替换", exact: true }).click()
  await page.getByText("查看交接正文", { exact: true }).click()
  await expect(
    page.getByRole("textbox", { name: "交接正文", exact: true }),
  ).toHaveValue(/packages\/ui\/components\/ui\/tree.tsx/)
  await expect(
    page.getByRole("textbox", { name: "交接正文", exact: true }),
  ).not.toHaveValue(/attacker/)
})

test("locale, theme, resizing, reduced motion and keyboard preserve decisions and annotations", async ({
  page,
}) => {
  await page
    .getByRole("textbox", { name: "Tree 批注", exact: true })
    .fill("用户原文保留")
  await page
    .getByRole("combobox", { name: "Tree 选择", exact: true })
    .selectOption("preferred")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    page.getByRole("textbox", { name: "Tree annotation", exact: true }),
  ).toHaveValue("用户原文保留")
  await expect(
    page.getByRole("combobox", { name: "Tree decision", exact: true }),
  ).toHaveValue("preferred")
  await expect(page).toHaveTitle(/Component selection template/)
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" })
  await page.evaluate(() => document.documentElement.classList.add("dark"))
  for (const width of [1440, 1024, 720, 390]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await expect(page.locator("[data-candidate]")).toHaveCount(6)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  expect(
    await page
      .getByRole("textbox", { name: "Project name", exact: true })
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBe(32)
  // 200% browser zoom halves the CSS viewport and doubles its pixel ratio.
  const metrics = await page.context().newCDPSession(page)
  await metrics.send("Emulation.setDeviceMetricsOverride", {
    width: 720,
    height: 450,
    deviceScaleFactor: 2,
    mobile: false,
  })
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await expect(
    page.getByRole("textbox", { name: "Tree annotation", exact: true }),
  ).toHaveValue("用户原文保留")
  await metrics.send("Emulation.clearDeviceMetricsOverride")
  await metrics.detach()
  await page.getByText("View handoff text", { exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("textbox", { name: "Handoff text", exact: true }),
  ).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .include("[data-component-selection]")
        .analyze()
    ).violations,
  ).toEqual([])
  await page.screenshot({
    path: "test-results/component-selection-dark-en.png",
    fullPage: true,
  })
})

test("blocked storage and clipboard remain recoverable through editable draft and visible handoff", async ({
  page,
}) => {
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error("blocked")
      return original.call(this, name, value)
    }
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("blocked")
        },
      },
    })
  }, storageKey)
  await page
    .getByRole("textbox", { name: "项目名称", exact: true })
    .fill("仍可编辑")
  await page.getByRole("button", { name: "保存到本机", exact: true }).click()
  await expect(
    page.locator("[data-component-selection] > [role=alert]"),
  ).toContainText("本机存储不可用")
  await page.getByRole("button", { name: "复制交接内容", exact: true }).click()
  await expect(
    page.locator("[data-component-selection] > [role=alert]"),
  ).toContainText("剪贴板不可用")
  await page.getByText("查看交接正文", { exact: true }).click()
  await expect(
    page.getByRole("textbox", { name: "交接正文", exact: true }),
  ).toHaveValue(/仍可编辑/)
})

test("bounded draft parser rejects unknown IDs, duplicate IDs and conflicting preferred choices", async () => {
  for (const mutate of [
    (draft: ReturnType<typeof createSelectionDraft>) => {
      draft.groups[0].candidates[0].id = "unknown"
    },
    (draft: ReturnType<typeof createSelectionDraft>) => {
      draft.groups[0].candidates[1].id = draft.groups[0].candidates[0].id
    },
    (draft: ReturnType<typeof createSelectionDraft>) => {
      draft.groups[0].candidates.forEach(
        (candidate) => (candidate.decision = "preferred"),
      )
    },
    (draft: ReturnType<typeof createSelectionDraft>) => {
      draft.groups[0].candidates[0].note = "x".repeat(4001)
    },
  ]) {
    const draft = createSelectionDraft(template)
    mutate(draft)
    expect(parseSelectionDraft(JSON.stringify(draft), template)).toEqual({
      ok: false,
      error: "invalid",
    })
  }
})
