import { test, expect } from "@playwright/test"

const input = (page: import("@playwright/test").Page) =>
  page.getByRole("textbox", { name: "消息输入", exact: true })

test("A2-01/06: aligned desktop composer, growing draft and compact controls", async ({
  page,
}, info) => {
  for (const width of [1440, 2048, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    await expect(input(page)).toBeVisible()
    const messages = await page.locator("[data-follow-tail-list]").boundingBox()
    const composer = await page.locator("[data-draft-id]").boundingBox()
    expect(messages).not.toBeNull()
    expect(composer).not.toBeNull()
    expect(Math.abs(messages!.x - composer!.x)).toBeLessThan(2)
    expect(Math.abs(messages!.width - composer!.width)).toBeLessThan(2)
    expect(composer!.width).toBeLessThanOrEqual(760)
    const initial = await input(page).boundingBox()
    await input(page).fill(
      Array(18).fill("保留草稿，按内容自动增高").join("\n"),
    )
    await expect
      .poll(async () => (await input(page).boundingBox())!.height)
      .toBeGreaterThan(initial!.height)
    expect((await input(page).boundingBox())!.height).toBeLessThanOrEqual(300)
    await input(page).fill("检查布局和来源")
    await expect(
      page
        .getByRole("combobox", { name: "模型（下次发送）", exact: true })
        .filter({ visible: true }),
    ).toBeVisible()
    await page.screenshot({ path: info.outputPath(`desktop-${width}.png`) })
  }
})

test("A2-07: running actions reflect mode and pending differs from unknown", async ({
  page,
}) => {
  await page.goto("/")
  const field = input(page)
  await field.fill("保留这个输入")
  const identity = await field.getAttribute("id")
  const mode = page.getByRole("combobox", { name: "输入模式", exact: true })
  await mode.selectOption("queue")
  await expect(
    page.getByRole("button", { name: "加入队列", exact: true }),
  ).toBeEnabled()
  await mode.selectOption("steer")
  await expect(field).toHaveAttribute("id", identity!)
  await expect(field).toHaveValue("保留这个输入")
  const stop = await page
    .getByRole("button", { name: "请求停止本轮", exact: true })
    .boundingBox()
  const form = await page
    .locator("form[data-presentation=workspace]")
    .boundingBox()
  expect(stop!.y + stop!.height).toBeLessThanOrEqual(form!.y)
  await page.getByRole("button", { name: "立即引导", exact: true }).click()
  await expect(page.locator("[data-draft-id]")).toContainText(
    "等待来源确认本次请求",
  )
  await expect(page.locator("[data-draft-id]")).not.toContainText(
    "未知结果须先查询",
  )
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog
    .getByRole("button", { name: "确认丢失", exact: true })
    .last()
    .click()
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-draft-id]")).toContainText(
    "未知结果须先查询",
  )
  await expect(field).toHaveValue("保留这个输入")
  await expect(
    page.getByRole("button", { name: "立即引导", exact: true }),
  ).toBeDisabled()
})

test("A2-04/05: tool summaries and change review keep source and draft", async ({
  page,
}, info) => {
  await page.goto("/")
  await input(page).fill("审阅后继续")
  await expect(page.locator("[data-change-summary]")).toContainText(
    "5 个文件变更",
  )
  await expect(page.locator("[data-change-summary]")).toContainText("快速预览")
  // Actual source association, not a decorative count or a second file list.
  await expect(
    page.locator('[data-call-id][data-presentation="activity"]').first(),
  ).toBeAttached()
  await page
    .locator("[data-change-summary]")
    .getByRole("button", { name: /filter.ts/ })
    .first()
    .click()
  await expect(page).toHaveURL(/page=review/)
  await page.locator('[data-sidebar-session-view="conversation"]').click()
  await expect(input(page)).toHaveValue("审阅后继续")
  await page.getByRole("button", { name: "示例设置", exact: true }).click()
  await page
    .getByRole("combobox", { name: "外观", exact: true })
    .selectOption("dark")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await page.keyboard.press("Escape")
  await expect(page.locator("[data-draft-id] textarea")).toHaveValue(
    "审阅后继续",
  )
  await page.screenshot({ path: info.outputPath("dark-en.png") })
})
