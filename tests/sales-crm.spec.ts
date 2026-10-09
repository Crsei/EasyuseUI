import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import {
  companiesFixture,
  defaultDraft,
  defaultFilters,
} from "../components/examples/sales-crm/fixtures"
import {
  activitySeries,
  companyFromDraft,
  draftErrors,
  selectCompanies,
  summarize,
  visibleTags,
} from "../components/examples/sales-crm/selectors"
import { companiesCsv, csvCell } from "../components/examples/sales-crm/export"

async function demo(page: Page) {
  await page.addInitScript({
    content: "localStorage.setItem('easyuseui-locale', 'en')",
  })
  await page.goto("/examples/sales-crm/")
  await expect(page.locator("[data-sales-crm]")).toHaveAttribute(
    "data-locale",
    "en",
  )
  await expect(page.locator("tbody tr")).toHaveCount(18)
}
async function choose(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
}
async function about(page: Page) {
  await page
    .getByRole("button", { name: "Demo information & scenarios", exact: true })
    .click()
  return page.getByRole("dialog", {
    name: "Demo information & scenarios",
    exact: true,
  })
}
async function scenario(page: Page, option: string) {
  const panel = await about(page)
  await panel.locator("summary").click()
  await choose(page, "Data scenario", option)
  await panel.getByRole("button", { name: "Close dialog", exact: true }).click()
}
async function close(page: Page) {
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close dialog", exact: true })
    .click()
}

test("CRM selectors, windows, raw validation and CSV safety are deterministic", () => {
  const rows = selectCompanies(companiesFixture, defaultFilters, {
    columnId: "pipelineValue",
    direction: "desc",
  })
  expect(rows[0].name).toBe("Apple")
  expect(summarize(rows)).toMatchObject({ count: 18, pipeline: 5138594 })
  expect(
    selectCompanies(
      companiesFixture,
      { owner: "Sarah Nguyen", stage: "Renewal", activity: 90 },
      null,
    ).map((c) => c.id),
  ).toEqual(["lvmh"])
  expect(
    selectCompanies(
      companiesFixture,
      { ...defaultFilters, activity: 7 },
      null,
    ).map((c) => c.id),
  ).toEqual(["snowflake", "hubspot"])
  expect(visibleTags(["Enterprise", "Upsell", "Expansion", "Renewal"])).toEqual(
    { visible: ["Enterprise", "Upsell"], hidden: 2 },
  )
  expect(activitySeries(rows[0], 7)).toHaveLength(7)
  expect(activitySeries(rows[0], 30)).toHaveLength(14)
  expect(activitySeries(rows[0], 90)).toHaveLength(28)
  for (const value of [
    "",
    "NaN",
    "Infinity",
    "-1",
    "1e309",
    "9007199254740992",
  ])
    expect(
      draftErrors({ ...defaultDraft, name: "Acme", pipelineValue: value })
        .pipelineValue,
    ).toBe("numberError")
  expect(
    draftErrors({
      ...defaultDraft,
      name: "Acme",
      openDeals: "1.5",
      winProbability: "101",
      date: "2026-02-30",
    }),
  ).toMatchObject({
    openDeals: "numberError",
    winProbability: "numberError",
    date: "dateError",
  })
  const draft = {
    ...defaultDraft,
    name: ' =SUM(1,2)\n"Acme"',
    date: "2026-09-14",
  }
  expect(draftErrors(draft)).toEqual({})
  expect(companyFromDraft(draft, "local-fixture").activityDays).toBe(0)
  expect(csvCell("\t=1+1")).toBe('"\'\t=1+1"')
  expect(csvCell("  @cmd")).toBe('"\'  @cmd"')
  const csv = companiesCsv(
    [companyFromDraft(draft, "local-fixture", "data:image/png;base64,private")],
    ["Company"],
  )
  expect(csv).toContain('"\'=SUM(1,2)\n""Acme"""')
  expect(csv).not.toContain("data:image")
})

test("nine business columns, exact compact geometry, selection and activation stay separate", async ({
  page,
}) => {
  await demo(page)
  await expect(page.getByRole("columnheader")).toHaveCount(10)
  await expect(page.locator("tbody tr").first()).toContainText("Apple")
  await expect(page.locator("[data-crm-pipeline]")).toHaveText("$5,138,594")
  await expect(
    page.getByRole("checkbox", { name: "Select Microsoft", exact: true }),
  ).toBeChecked()
  await page
    .getByRole("checkbox", { name: "Select Apple", exact: true })
    .check()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(
    page.getByRole("checkbox", { name: "Select visible selectable rows" }),
  ).toHaveAttribute("aria-checked", "mixed")
  const row = page.locator('[data-row-id="apple"]')
  expect((await row.boundingBox())?.height).toBe(42)
  expect((await page.locator("thead").boundingBox())?.height).toBe(38)
  await page.getByRole("button", { name: "View Apple", exact: true }).click()
  await expect(row).toHaveAttribute("data-active", "true")
  await expect(page.getByRole("dialog")).toContainText("Apple")
  expect((await page.getByRole("dialog").boundingBox())?.width).toBe(560)
  await close(page)
  await expect(
    page.getByRole("button", { name: "View Apple", exact: true }),
  ).toBeFocused()
  await page
    .getByRole("button", { name: "Actions for Apple", exact: true })
    .click()
  await page.getByRole("menuitem", { name: "View owner" }).click()
  await expect(page.getByRole("dialog")).toContainText("Alex Santos")
})

test("filters, visible select-all, stable sorting and summaries share the export view", async ({
  page,
}) => {
  await demo(page)
  await choose(page, "Account Owner", "Alex Santos")
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.locator("[data-crm-count]")).toHaveText("1")
  await expect(page.locator("[data-crm-pipeline]")).toHaveText("$530,111")
  await page
    .getByRole("checkbox", { name: "Select visible selectable rows" })
    .check()
  await expect(page.locator("[data-crm-selection]")).toHaveText("2 selected")
  await page
    .getByRole("checkbox", { name: "Select visible selectable rows" })
    .uncheck()
  await expect(page.locator("[data-crm-selection]")).toHaveText("1 selected")
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export", exact: true }).click()
  const download = await downloadPromise
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream!) chunks.push(chunk)
  const csv = Buffer.concat(chunks).toString()
  expect(csv).toContain('"Apple"')
  expect(csv).not.toContain('"Microsoft"')
  await choose(page, "Stage", "Renewal")
  await expect(page.locator("[data-data-state=empty]")).toContainText(
    "No companies match",
  )
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .last()
    .click()
  await expect(
    page.getByRole("checkbox", { name: "Select Microsoft", exact: true }),
  ).toBeChecked()
  await page
    .getByRole("columnheader", { name: "Companies", exact: true })
    .getByRole("button")
    .click()
  await expect(page.locator("tbody tr").first()).toContainText("Airbnb")
  await expect(
    page.getByRole("columnheader", { name: "Companies", exact: true }),
  ).toHaveAttribute("aria-sort", "ascending")
})

test("detail windows change data, owner navigation uses complete snapshots and restores a useful focus", async ({
  page,
}) => {
  await demo(page)
  await page.getByRole("button", { name: "View Apple", exact: true }).click()
  const dialog = page.getByRole("dialog")
  const trend = dialog.locator("svg[role=img]")
  await expect(trend.locator("rect")).toHaveCount(14)
  await choose(page, "Activity window", "7 Days")
  await expect(trend.locator("rect")).toHaveCount(7)
  await choose(page, "Activity window", "90 Days")
  await expect(trend.locator("rect")).toHaveCount(28)
  await dialog
    .getByRole("button", { name: "Open profile for Alex Santos" })
    .click()
  await expect(dialog).toContainText("alex.santos@example.invalid")
  await expect(dialog).not.toContainText("Sarah Nguyen")
  await dialog.getByRole("button", { name: "Open Apple", exact: true }).click()
  await expect(dialog).toContainText("Companies Detail")
  await dialog
    .getByRole("button", { name: "Open profile for Alex Santos" })
    .click()
  await dialog.getByRole("button", { name: "Show accounts in list" }).click()
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(await page.evaluate(() => document.activeElement?.isConnected)).toBe(
    true,
  )
})

test("keyboard search finds companies, owners and stages without intercepting draft editing", async ({
  page,
}) => {
  await demo(page)
  await page.locator("[data-sales-crm]").focus()
  await page.keyboard.press("Control+k")
  const dialog = page.getByRole("dialog")
  const search = dialog.getByRole("combobox")
  await expect(dialog.getByRole("option", { name: /LVMH/ })).toContainText(
    "$420,000",
  )
  await expect
    .poll(() =>
      dialog.evaluate((node) => Math.round(node.getBoundingClientRect().width)),
    )
    .toBe(960)
  await expect(dialog.getByRole("option", { name: /LVMH/ })).toContainText("+2")
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([])
  await search.fill("no such company")
  await expect(dialog).toContainText("No matches")
  await search.fill("Pilot")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowUp")
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toContainText("Companies Detail")
  await close(page)
  await page.getByRole("button", { name: "Search", exact: true }).click()
  await page.getByRole("dialog").getByRole("combobox").fill("Grace Miller")
  await page
    .getByRole("option", { name: /Grace Miller/ })
    .last()
    .click()
  await expect(page.getByRole("dialog")).toContainText(
    "grace.miller@example.invalid",
  )
  await close(page)
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page.getByRole("textbox", { name: "Company name" }).fill("Retain me")
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await expect(page.getByRole("textbox", { name: "Company name" })).toHaveValue(
    "Retain me",
  )
  await close(page)
  await page.getByRole("button", { name: "Search", exact: true }).click()
  await page.getByRole("dialog").getByRole("combobox").fill("New Company")
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("textbox", { name: "Company name" }),
  ).toBeFocused()
  await expect(page.getByRole("textbox", { name: "Company name" })).toHaveValue(
    "Retain me",
  )
})

test("new company validates raw input, retains cancelled drafts, prevents duplicates and explains filtered creation", async ({
  page,
}) => {
  await demo(page)
  await choose(page, "Account Owner", "Alex Santos")
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Company name" }),
  ).toHaveAttribute("aria-invalid", "true")
  await page.getByRole("textbox", { name: "Company name" }).fill("Local Acme")
  await page.getByRole("textbox", { name: "Open Deals" }).fill("1.5")
  await page.getByRole("textbox", { name: "Pipeline Value" }).fill("not money")
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Pipeline Value" }),
  ).toHaveValue("not money")
  await expect(
    page.getByRole("textbox", { name: "Open Deals" }),
  ).toHaveAttribute("aria-invalid", "true")
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "Company name" })).toHaveValue(
    "Local Acme",
  )
  await page.getByRole("textbox", { name: "Open Deals" }).fill("2")
  await page.getByRole("textbox", { name: "Pipeline Value" }).fill("250000")
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .evaluate((button: HTMLButtonElement) => {
      button.click()
      button.click()
    })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("status")).toContainText(
    "current filters hide it",
  )
  await expect(page.locator("tbody tr")).toHaveCount(1)
  await page.getByRole("button", { name: "View new company" }).click()
  await expect(page.getByRole("dialog")).toContainText("Local Acme")
  await close(page)
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .first()
    .click()
  await expect(page.locator("tbody tr")).toHaveCount(19)
  await expect(
    page.getByRole("button", { name: "View Local Acme", exact: true }),
  ).toHaveCount(1)
  await page.reload()
  await expect(page.locator("tbody tr")).toHaveCount(18)
})

test("file rejection, creation failure and download failure preserve data and drafts", async ({
  page,
}) => {
  await demo(page)
  const panel = await about(page)
  await panel.locator("summary").click()
  await panel
    .getByRole("checkbox", { name: "Simulate creation failure" })
    .check()
  await panel
    .getByRole("checkbox", { name: "Simulate download failure" })
    .check()
  await close(page)
  await page.getByRole("button", { name: "Export", exact: true }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "CSV download failed" }),
  ).toBeVisible()
  await expect(page.locator("tbody tr")).toHaveCount(18)
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page.getByRole("textbox", { name: "Company name" }).fill("Retry Acme")
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  })
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveCount(1)
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Local creation failed")
  await expect(page.getByRole("textbox", { name: "Company name" })).toHaveValue(
    "Retry Acme",
  )
  await close(page)
  const settings = await about(page)
  await settings.locator("summary").click()
  await settings
    .getByRole("checkbox", { name: "Simulate creation failure" })
    .uncheck()
  await close(page)
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .click()
  await expect(page.locator("tbody tr")).toHaveCount(19)
})

test("notifications keep reading separate from opening and explain missing targets", async ({
  page,
}) => {
  await demo(page)
  await page
    .getByRole("button", { name: "Notifications, 3 unread", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Mark as read · Microsoft", exact: true })
    .click()
  await expect(page.locator("[data-crm-object]")).toHaveCount(0)
  await page.getByRole("button", { name: "Open LVMH", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("LVMH")
  await close(page)
  await page
    .getByRole("button", { name: "Notifications, 2 unread", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Mark all as read", exact: true })
    .click()
  await page.getByRole("tab", { name: "Unread (0)", exact: true }).click()
  await expect(
    page.getByText("No unread notifications", { exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  const panel = await about(page)
  await panel.locator("summary").click()
  await panel
    .getByRole("button", { name: "Add a missing-target notification" })
    .click()
  await close(page)
  await page
    .getByRole("button", { name: "Notifications, 1 unread", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Open removed-company", exact: true })
    .click()
  await expect(
    page.getByRole("alert").filter({ hasText: "no longer exists" }),
  ).toBeVisible()
  await expect(page.locator("[data-crm-object]")).toHaveCount(0)
})

test("all five data states recover and refresh failure preserves existing rows", async ({
  page,
}) => {
  await demo(page)
  for (const [label, state, count] of [
    ["Initial loading", "loading", 0],
    ["Empty data", "empty", 0],
    ["Partial data", "partial", 6],
    ["Initial read failure", "error", 0],
    ["Refresh failure (preserve rows)", "error", 18],
  ] as const) {
    await scenario(page, label)
    await expect(page.locator(`[data-data-state="${state}"]`)).toBeVisible()
    await expect(page.locator("tbody tr")).toHaveCount(count)
    if (state === "error") {
      await page
        .getByRole("button", { name: "Retry read", exact: true })
        .click()
      await expect(page.locator("tbody tr")).toHaveCount(18)
    }
  }
  await scenario(page, "Success")
  await expect(page.locator('[data-data-state="success"]')).toBeVisible()
})

test("locale updates preserve selection, open-object identity and raw drafts; theme stays isolated", async ({
  page,
}) => {
  await demo(page)
  const hostBefore = await page
    .locator("body")
    .evaluate((e) => getComputedStyle(e).backgroundColor)
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page
    .getByRole("textbox", { name: "Company name" })
    .fill("Untranslated Acme")
  await page.getByRole("textbox", { name: "Pipeline Value" }).fill("1.2.3")
  await page.evaluate(() => {
    localStorage.setItem("easyuseui-locale", "zh-CN")
    window.dispatchEvent(
      new StorageEvent("storage", { key: "easyuseui-locale" }),
    )
  })
  await expect(page.getByRole("textbox", { name: "公司名称" })).toHaveValue(
    "Untranslated Acme",
  )
  await expect(page.getByRole("textbox", { name: "销售管道金额" })).toHaveValue(
    "1.2.3",
  )
  await page.getByRole("button", { name: "取消", exact: true }).click()
  await expect(
    page.getByRole("checkbox", { name: "选择 Microsoft", exact: true }),
  ).toBeChecked()
  await page.getByRole("button", { name: "查看 Apple", exact: true }).click()
  await page.evaluate(() => {
    localStorage.setItem("easyuseui-locale", "en")
    window.dispatchEvent(
      new StorageEvent("storage", { key: "easyuseui-locale" }),
    )
  })
  await expect(page.getByRole("dialog")).toContainText("Apple")
  expect(
    await page
      .getByRole("dialog")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe("rgb(22, 22, 22)")
  expect(
    await page
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe(hostBefore)
  await close(page)
  await page.getByRole("link", { name: "Component docs", exact: true }).click()
  await expect(page.locator("[data-sales-crm]")).toHaveCount(0)
  await expect(page.locator("header").first()).toBeVisible()
  expect(
    await page
      .locator("body")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe(hostBefore)
})

test("sidebar pointer/keyboard resizing persists only valid layout preferences", async ({
  page,
}) => {
  await page.addInitScript({
    content:
      "if(!sessionStorage.getItem('crm-width-fixture')){localStorage.setItem('easyuseui:sales-crm:sidebar-width:v1','broken');sessionStorage.setItem('crm-width-fixture','1')}",
  })
  await demo(page)
  const separator = page.getByRole("separator", {
    name: "Resize navigation width",
  })
  await expect(separator).toHaveAttribute("aria-valuenow", "254")
  await separator.focus()
  await page.keyboard.press("ArrowRight")
  await expect(separator).toHaveAttribute("aria-valuenow", "262")
  const box = (await separator.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, 300)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 40, 300)
  await page.mouse.up()
  await expect(separator).toHaveAttribute("aria-valuenow", "302")
  // The invalid initial value is written only once; subsequent documents read the saved width.
  expect(
    await page.evaluate(() =>
      localStorage.getItem("easyuseui:sales-crm:sidebar-width:v1"),
    ),
  ).toBe("302")
  await page.reload()
  await expect(separator).toHaveAttribute("aria-valuenow", "302")
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click()
  await expect(page.locator('[data-sidebar-collapsed="true"]')).toBeVisible()
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click()
  await separator.focus()
  await page.keyboard.press("End")
  await expect(separator).toHaveAttribute("aria-valuenow", "400")
  await page.keyboard.press("Home")
  await expect(separator).toHaveAttribute("aria-valuenow", "200")
})

test("local creation uses unique instance IDs without secure-context crypto", async ({
  page,
}) => {
  await page.addInitScript({
    content: "Object.defineProperty(crypto,'randomUUID',{value:undefined})",
  })
  await demo(page)
  for (const name of ["Local One", "Local Two"]) {
    await page.getByRole("button", { name: "New Company", exact: true }).click()
    await page.getByRole("textbox", { name: "Company name" }).fill(name)
    await page
      .getByRole("button", { name: "Add to local demo", exact: true })
      .click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
  await expect(page.locator("tbody tr")).toHaveCount(20)
  const ids = await page
    .locator("tbody tr")
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-row-id")))
  expect(new Set(ids).size).toBe(20)
})

test("valid image creation stays local and a rejected replacement preserves the preview", async ({
  page,
}) => {
  await demo(page)
  await page.getByRole("button", { name: "New Company", exact: true }).click()
  await page.getByRole("textbox", { name: "Company name" }).fill("Logo Acme")
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR3sAAAAASUVORK5CYII=",
    "base64",
  )
  const file = page.locator('input[type="file"]')
  await file.setInputFiles({
    name: "local.png",
    mimeType: "image/png",
    buffer: png,
  })
  await expect(
    page.getByRole("img", { name: "local.png", exact: true }),
  ).toBeVisible()
  await file.setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  })
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible()
  await expect(
    page.getByRole("img", { name: "local.png", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Add to local demo", exact: true })
    .click()
  await expect(page.locator("tbody tr")).toHaveCount(19)
  await page
    .getByRole("button", { name: "View Logo Acme", exact: true })
    .click()
  await expect(
    page
      .getByRole("dialog")
      .getByRole("img", { name: "Logo Acme", exact: true }),
  ).toHaveAttribute("src", /^data:image\/png/)
})

test("storage denial leaves language controls and sidebar resizing usable", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.addInitScript({
    content:
      "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError')}})",
  })
  await page.goto("/examples/sales-crm/")
  await page
    .getByRole("button", { name: "示例说明与状态场景", exact: true })
    .click()
  await choose(page, "语言", "English")
  await close(page)
  await expect(page.locator("[data-sales-crm]")).toHaveAttribute(
    "data-locale",
    "en",
  )
  const separator = page.getByRole("separator", {
    name: "Resize navigation width",
  })
  await separator.focus()
  await page.keyboard.press("ArrowRight")
  await expect(separator).toHaveAttribute("aria-valuenow", "262")
  expect(errors).toEqual([])
})

test("default and object/form overlays pass automated accessibility checks", async ({
  page,
}) => {
  await demo(page)
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  for (const target of [null, "View Apple", "New Company"] as const) {
    if (target)
      await page.getByRole("button", { name: target, exact: true }).click()
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([])
    if (target) await close(page)
  }
  expect(errors).toEqual([])
})

test.describe("CRM touch layouts", () => {
  test.use({ hasTouch: true, reducedMotion: "reduce" })
  for (const width of [390, 768, 1024])
    test(`touch controls, native horizontal scrolling and sheets at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await demo(page)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      for (const label of [
        "Search",
        "Notifications, 3 unread",
        "Open profile for Jensen Ackles",
      ]) {
        const box = (await page
          .getByRole("button", { name: label, exact: true })
          .boundingBox())!
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
      const scroll = page.locator(
        '[aria-label="Use checkboxes to select; open details with the company name."]',
      )
      await scroll.focus()
      await page.keyboard.press("End")
      await page.keyboard.press("ArrowRight")
      await expect
        .poll(() => scroll.evaluate((e) => e.scrollLeft))
        .toBeGreaterThan(0)
      await page
        .getByRole("button", { name: "View Apple", exact: true })
        .click()
      const box = (await page.getByRole("dialog").boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.width).toBeLessThanOrEqual(width)
      await close(page)
      if (width < 1024) {
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click()
        await expect(page.getByRole("dialog")).toContainText("Sales CRM")
        await page.keyboard.press("Escape")
      }
      if (width === 390) {
        await page.getByRole("button", { name: "Filters", exact: true }).click()
        await choose(page, "Sort by", "Company name")
        await expect(page.locator("tbody tr").first()).toContainText("Airbnb")
        await choose(page, "Account Owner", "Alex Santos")
        await page.keyboard.press("Escape")
        await expect(page.locator("tbody tr")).toHaveCount(1)
        await page
          .getByRole("button", { name: "New Company", exact: true })
          .click()
        await page
          .getByRole("textbox", { name: "Company name" })
          .fill("Mobile Acme")
        await close(page)
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
        expect(axe.violations).toEqual([])
      }
    })
})
