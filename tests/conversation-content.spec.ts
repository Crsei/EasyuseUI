import { expect, test } from "@playwright/test"
test("questionnaire validates, skips, goes back, retains drafts and reports submission pending", async ({
  page,
}) => {
  await page.goto("/docs/questionnaire/")
  const root = page.locator('[data-demo-loader="questionnaire"]')
  await root.getByRole("button", { name: "下一题" }).click()
  await expect(root.getByRole("alert")).toHaveText("请先回答此问题。")
  await root.getByRole("radio", { name: "手动", exact: true }).click()
  await root.getByRole("button", { name: "下一题" }).click()
  await root.getByRole("checkbox", { name: "粗体" }).check()
  await root.getByRole("checkbox", { name: "斜体" }).check()
  await root.getByRole("button", { name: "上一题" }).click()
  await expect(
    root.getByRole("radio", { name: "手动", exact: true }),
  ).toBeChecked()
  await root.getByRole("button", { name: "下一题" }).click()
  await expect(root.getByRole("checkbox", { name: "粗体" })).toBeChecked()
  await root.getByRole("button", { name: "跳过", exact: true }).click()
  const draft = root.getByRole("textbox", { name: "补充说明" })
  await draft.fill("Caller 中文")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    root.getByRole("textbox", { name: "Additional notes" }),
  ).toHaveValue("Caller 中文")
  await root.getByRole("button", { name: "Submit answers" }).click()
  await expect(root.getByRole("status").last()).toHaveText(
    "Awaiting confirmation",
  )
  await expect(
    root.getByRole("button", { name: "Submit answers" }),
  ).toBeDisabled()
  await expect(root.locator("[data-answers]")).toHaveText(
    '{"mode":"manual","features":null,"notes":"Caller 中文"}',
  )
})
test("attachment separates open and removal targets and blocks unknown or busy mutations", async ({
  page,
}) => {
  await page.goto("/docs/attachment/")
  const root = page.locator('[data-demo-loader="attachment"]')
  await root.getByRole("button", { name: /附件说明.txt.*可用/ }).click()
  await expect(root.locator("output")).toHaveText("opened")
  await expect(
    root.getByRole("button", { name: "移除 pending.txt", exact: true }),
  ).toBeDisabled()
  await expect(
    root.getByRole("button", { name: "移除 upload.txt", exact: true }),
  ).toBeDisabled()
  await root
    .getByRole("button", { name: "移除 附件说明.txt", exact: true })
    .click()
  await expect(
    root.getByRole("button", { name: "返回", exact: true }),
  ).toBeVisible()
  await expect(root.locator("button button")).toHaveCount(0)
})
test("carousel is manual, supports keyboard, preserves hidden drafts and bounds navigation", async ({
  page,
}) => {
  await page.goto("/docs/carousel/")
  const root = page.locator('[data-demo-loader="carousel"]')
  await root.getByRole("textbox", { name: "草稿 1" }).fill("kept")
  await expect(root.getByRole("button", { name: "上一项" })).toBeDisabled()
  await root.getByRole("button", { name: "下一项" }).click()
  await expect(root.getByRole("textbox", { name: "草稿 1" })).not.toBeVisible()
  await root.getByRole("button", { name: "上一项" }).click()
  await expect(root.getByRole("textbox", { name: "草稿 1" })).toHaveValue(
    "kept",
  )
  const viewport = root.locator('[aria-roledescription] > div[tabindex="0"]')
  await viewport.focus()
  await page.keyboard.press("End")
  await expect(root.getByRole("button", { name: "下一项" })).toBeDisabled()
  await expect(root.getByRole("status")).toHaveText("3 / 3")
  await page.keyboard.press("Home")
  await expect(root.getByRole("status")).toHaveText("1 / 3")
})
test("chart distinguishes missing, negative, zero and empty data with text alternatives", async ({
  page,
}) => {
  await page.goto("/docs/chart/")
  const root = page.locator('[data-demo-loader="chart"]')
  const tables = root.getByRole("table")
  await expect(tables).toHaveCount(2)
  await expect(
    tables.first().getByRole("row").filter({ hasText: "Beta" }),
  ).toContainText("-8")
  await expect(
    tables.first().getByRole("row").filter({ hasText: "Gamma" }),
  ).toContainText("缺失")
  await expect(
    tables.first().getByRole("row").filter({ hasText: "Delta" }),
  ).toContainText("0")
  await expect(
    root.getByRole("heading", { name: "这里暂时没有内容", exact: true }),
  ).toBeVisible()
  const invalid = await root
    .locator("svg rect,svg path,svg circle")
    .evaluateAll((nodes) =>
      nodes.some((n) =>
        [...n.attributes].some((a) => /NaN|Infinity/.test(a.value)),
      ),
    )
  expect(invalid).toBe(false)
})
test("aspect ratio follows its specified dimensions", async ({ page }) => {
  await page.goto("/docs/aspect-ratio/")
  const box = await page
    .locator('[data-demo-loader="aspect-ratio"] [style*="aspect-ratio"]')
    .boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1)
})
