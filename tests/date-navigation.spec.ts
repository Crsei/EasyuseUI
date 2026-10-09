import { expect, test } from "@playwright/test"
import {
  addDateDays,
  addDateMonths,
  parseDateKey,
} from "@/lib/date-calendar-model"
test("civil date arithmetic handles leap years, month ends and DST without local-time parsing", () => {
  expect(addDateDays("2024-02-28", 1)).toBe("2024-02-29")
  expect(addDateDays("2024-02-29", 1)).toBe("2024-03-01")
  expect(addDateDays("2026-03-08", 1)).toBe("2026-03-09")
  expect(addDateMonths("2024-01-31", 1)).toBe("2024-02-29")
  expect(addDateMonths("2026-01-31", 1)).toBe("2026-02-28")
  expect(parseDateKey("2026-02-29")).toBeNull()
  expect(parseDateKey("2026-13-01")).toBeNull()
  expect(parseDateKey("0001-01-01")?.getUTCFullYear()).toBe(1)
})
test("calendar supports roving focus, disabled dates, month navigation and ranges", async ({
  page,
}) => {
  await page.goto("/docs/date-calendar/")
  const root = page.locator('[data-demo-loader="date-calendar"]')
  const single = root.locator('[aria-label="单选"]')
  await single.locator('[data-date="2026-10-11"]').focus()
  await page.keyboard.press("ArrowRight")
  await expect(single.locator('[data-date="2026-10-12"]')).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(root.locator("[data-single-date]")).toHaveText("2026-10-09")
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Enter")
  await expect(root.locator("[data-single-date]")).toHaveText("2026-10-13")
  await page.keyboard.press("PageDown")
  await expect(single.locator('[data-date="2026-11-13"]')).toBeFocused()
  const range = root.locator('[aria-label="多选"]')
  await range.locator('[data-date="2026-10-10"]').click()
  await range.locator('[data-date="2026-10-14"]').click()
  await expect(root.locator("[data-date-range]")).toHaveText(
    '{"from":"2026-10-14","to":null}',
  )
  await range.locator('[data-date="2026-10-15"]').click()
  await expect(root.locator("[data-date-range]")).toHaveText(
    '{"from":"2026-10-14","to":"2026-10-15"}',
  )
  await expect(range.locator('td[aria-selected="true"]')).toHaveCount(2)
})
test("date picker closes after selection and restores its trigger", async ({
  page,
}) => {
  await page.goto("/docs/date-picker/")
  const root = page.locator('[data-demo-loader="date-picker"]')
  const trigger = root.getByRole("button", { name: "项目详情" })
  await trigger.click()
  await page.locator('[data-date="2026-10-19"]').click()
  await expect(root.locator("output")).toHaveText("2026-10-19")
  await expect(trigger).toBeFocused()
  await expect(page.getByRole("grid")).not.toBeVisible()
})
test("date selections are identical in different browser time zones", async ({
  browser,
  baseURL,
}) => {
  for (const timezoneId of ["America/Los_Angeles", "Asia/Shanghai"]) {
    const context = await browser.newContext({ baseURL, timezoneId })
    try {
      const page = await context.newPage()
      await page.goto("/docs/date-calendar/")
      const root = page.locator('[data-demo-loader="date-calendar"]')
      await root.locator('[aria-label="单选"] [data-date="2026-10-09"]').click()
      await expect(root.locator("[data-single-date]")).toHaveText("2026-10-09")
    } finally {
      await context.close()
    }
  }
})
test("pagination requests known and unknown pages without fabricating a total", async ({
  page,
}) => {
  await page.goto("/docs/pagination/")
  const root = page.locator('[data-demo-loader="pagination"]')
  const known = root.getByRole("navigation", { name: "项目详情" })
  await expect(known.getByRole("button", { name: "上一页" })).toBeDisabled()
  await known.getByRole("button", { name: "下一页" }).click()
  await expect(known.locator('[aria-current="page"]')).toHaveText("2")
  const unknown = root.getByRole("navigation", { name: "待确认" })
  await expect(unknown.getByRole("button", { name: /第 .* 页/ })).toHaveCount(1)
  await unknown.getByRole("button", { name: "下一页" }).click()
  await unknown.getByRole("button", { name: "下一页" }).click()
  await expect(unknown.getByRole("button", { name: "下一页" })).toBeDisabled()
  await expect(root.locator("output")).toHaveText('{"page":2,"unknown":3}')
})
test("menubar, navigation menu and direction retain keyboard semantics", async ({
  page,
}) => {
  await page.goto("/docs/menubar/")
  const root = page.locator('[data-demo-loader="menubar"]')
  await root.getByRole("menuitem", { name: "项目详情", exact: true }).click()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.getByRole("menuitem", { name: "读取表单值", exact: true }).click()
  await expect(root.locator("output")).toHaveText("read")
  await page.goto("/docs/navigation-menu/")
  const nav = page.locator('[data-demo-loader="navigation-menu"]')
  await nav.getByRole("button", { name: "项目详情" }).click()
  await expect(
    nav.getByRole("link", { name: "DateCalendar", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(nav.getByRole("button", { name: "项目详情" })).toBeFocused()
  await page.goto("/docs/direction/")
  const rtl = page.locator('[data-demo-loader="direction"]')
  const bold = rtl.getByRole("button", { name: "粗体" })
  await bold.focus()
  await page.keyboard.press("ArrowLeft")
  await expect(rtl.getByRole("button", { name: "斜体" })).toBeFocused()
})
