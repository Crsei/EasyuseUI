import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

async function demo(page: Page, slug: string) {
  await page.goto(`/docs/${slug}/`)
  const root = page.locator(`[data-demo-loader="${slug}"]`)
  await expect(root).toHaveAttribute("data-demo-mounted", "true")
  return root
}

test("textarea keeps its draft and DOM through validation and locale changes, and submits caller text", async ({
  page,
}) => {
  const root = await demo(page, "textarea")
  const draft = root.locator('textarea[name="draft"]')
  await draft.fill("Caller 中文\nsecond line")
  const element = await draft.elementHandle()
  await root.getByRole("button", { name: "切换校验错误" }).click()
  await expect(draft).toHaveAttribute("aria-invalid", "true")
  await expect(draft).toHaveAccessibleDescription(/草稿已保留/)
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(draft).toHaveValue("Caller 中文\nsecond line")
  expect(await element!.evaluate((node) => node.isConnected)).toBe(true)
  await expect(draft).toHaveAccessibleName("Description draft")
  await root.getByRole("button", { name: "Read form values" }).click()
  await expect(root.locator("output")).toHaveText(
    JSON.stringify({ draft: "Caller 中文\nsecond line" }),
  )
  await expect(
    root.getByRole("textbox", { name: "Disabled description" }),
  ).toBeDisabled()
})

test("native Label focuses its associated input", async ({ page }) => {
  const root = await demo(page, "label")
  await root.getByText("项目名称", { exact: true }).click()
  await expect(
    root.getByRole("textbox", { name: "项目名称", exact: true }),
  ).toBeFocused()
})

test("native select separates translated labels from stable submitted values", async ({
  page,
}) => {
  const root = await demo(page, "native-select")
  const select = root.locator('select[name="scope"]')
  await select.selectOption("workspace")
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(select).toHaveValue("workspace")
  await expect(select.locator('option[value="workspace"]')).toHaveText(
    "Entire workspace",
  )
  await expect(select.locator('option[value="unavailable"]')).toBeDisabled()
  await expect(
    root.getByRole("combobox", { name: "Disabled scope" }),
  ).toBeDisabled()
  await root.getByRole("button", { name: "Read form values" }).click()
  await expect(root.locator("output")).toHaveText('{"scope":"workspace"}')
})

test("switch supports controlled and uncontrolled keyboard changes, readonly/disabled and form values", async ({
  page,
}) => {
  const root = await demo(page, "switch")
  const controlled = root.getByRole("switch", { name: "启用通知", exact: true })
  await root.getByRole("button", { name: "读取表单值" }).click()
  await expect(root.locator("output")).toHaveText(
    '{"notifications":"disabled"}',
  )
  await controlled.focus()
  await page.keyboard.press("Space")
  await expect(controlled).toBeChecked()
  await root.getByRole("button", { name: "读取表单值" }).click()
  await expect(root.locator("output")).toHaveText('{"notifications":"enabled"}')
  const uncontrolled = root.getByRole("switch", {
    name: "非受控开关",
    exact: true,
  })
  await uncontrolled.focus()
  await page.keyboard.press("Space")
  await expect(uncontrolled).not.toBeChecked()
  const readonly = root.getByRole("switch", { name: "只读开关", exact: true })
  await readonly.focus()
  await page.keyboard.press("Space")
  await expect(readonly).toBeChecked()
  await expect(
    root.getByRole("switch", { name: "禁用开关", exact: true }),
  ).toBeDisabled()
})

test("radio group keyboard skips disabled choices and submits stable values across locales", async ({
  page,
}) => {
  const root = await demo(page, "radio-group")
  const group = root.locator('[role="radiogroup"]').first()
  await group.getByRole("radio", { name: "手动", exact: true }).focus()
  await page.keyboard.press("ArrowDown")
  await expect(
    group.getByRole("radio", { name: "自动", exact: true }),
  ).toBeChecked()
  await page.keyboard.press("ArrowDown")
  await expect(
    group.getByRole("radio", { name: "手动", exact: true }),
  ).toBeChecked()
  await page.keyboard.press("ArrowDown")
  await expect(
    group.getByRole("radio", { name: "自动", exact: true }),
  ).toBeChecked()
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en")
  await expect(
    group.getByRole("radio", { name: "Automatic", exact: true }),
  ).toBeChecked()
  await expect(
    group.getByRole("radio", { name: "Unavailable option", exact: true }),
  ).toBeDisabled()
  await root.getByRole("button", { name: "Read form values" }).click()
  await expect(root.locator("output")).toHaveText('{"mode":"automatic"}')
})

test("coarse pointer controls keep 44px targets at 390px", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    for (const [slug, selector] of [
      ["switch", '[role="switch"]'],
      ["radio-group", '[role="radio"]'],
      ["native-select", 'select[name="scope"]'],
    ] as const) {
      const root = await demo(page, slug)
      const target = root.locator(selector).first()
      const box = await target.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    }
    const root = await demo(page, "textarea")
    expect(
      (await root.locator('textarea[name="draft"]').boundingBox())!.height,
    ).toBeGreaterThanOrEqual(80)
  } finally {
    await context.close()
  }
})

test("switch preserves selected styling and focus in dark theme with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  const root = await demo(page, "switch")
  await page.locator("html").evaluate((node) => node.classList.add("dark"))
  const target = root.getByRole("switch", { name: "启用通知", exact: true })
  await target.focus()
  await page.keyboard.press("Space")
  await expect(target).toBeChecked()
  await expect(target).toBeFocused()
  const styles = await target.evaluate((node) => {
    const track = node.querySelector('span[aria-hidden="true"]')!
    const thumb = track.firstElementChild!
    return {
      track: getComputedStyle(track).backgroundColor,
      thumb: getComputedStyle(thumb).backgroundColor,
      transition: getComputedStyle(thumb).transitionProperty,
      focus: getComputedStyle(node).boxShadow,
    }
  })
  expect(styles.track).not.toBe(styles.thumb)
  expect(styles.transition).toBe("none")
  expect(styles.focus).not.toBe("none")
})

test("form primitive demos have no scoped automated accessibility violations", async ({
  page,
}) => {
  for (const slug of [
    "textarea",
    "label",
    "native-select",
    "switch",
    "radio-group",
  ]) {
    await demo(page, slug)
    const result = await new AxeBuilder({ page })
      .include(`[data-demo-loader="${slug}"]`)
      .analyze()
    expect(result.violations, slug).toEqual([])
  }
})
