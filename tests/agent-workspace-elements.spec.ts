import { expect, test, type Page } from "@playwright/test"

const route = "/examples/agent-workbench/elements/"

async function ready(page: Page) {
  await page.goto(route)
  const gallery = page.locator("[data-element-gallery]")
  // The first successful client state transition establishes hydration before
  // testing draft and focus retention.
  const specification = gallery.getByRole("tab", { name: "设计规范" })
  await specification.click()
  await expect(specification).toHaveAttribute("data-active", "")
  const presentation = gallery.getByRole("tab", { name: "展示效果" })
  await presentation.click()
  await expect(presentation).toHaveAttribute("data-active", "")
  return gallery
}

async function choose(page: Page, label: string, value: string) {
  const trigger = page.locator("[data-element-gallery]").getByRole("combobox", { name: label })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await page.locator('[role="listbox"]:visible').getByRole("option", { name: value, exact: true }).click()
}

test("all 17 actual modules are visible together at desktop, tablet and phone widths", async ({ page }) => {
  const gallery = await ready(page)
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(gallery.locator("[data-gallery-module]")).toHaveCount(17)
    for (let number = 1; number <= 17; number++) {
      const id = `MD${String(number).padStart(2, "0")}`
      const tile = gallery.locator(`[data-gallery-module="${id}"]`)
      await expect(tile).toBeVisible()
      await expect(tile.locator("[data-preview-viewport] > fieldset > :not(legend)").first()).toBeVisible()
    }
    const result = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((element) => element.id)
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      }
    })
    expect(result.overflow, `page overflow at ${width}px`).toBeLessThanOrEqual(0)
    expect(result.duplicateIds).toEqual([])
  }
  await expect(gallery.locator('[data-gallery-module="MD16"] [data-code-preview]').first()).toBeVisible()
})

test("view, locale and theme changes retain the composer node, draft and caret", async ({ page }) => {
  const gallery = await ready(page)
  const composer = gallery.locator('[data-gallery-module="MD12"] textarea')
  await composer.fill("fixture draft stays here")
  await composer.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement
    textarea.setSelectionRange(3, 9)
    // Keep the node reference to detect a remount that leaves text looking intact.
    ;(window as typeof window & { __galleryComposer?: HTMLTextAreaElement }).__galleryComposer = textarea
  })
  const specification = gallery.getByRole("tab", { name: "设计规范" })
  await specification.scrollIntoViewIfNeeded()
  await specification.click()
  await expect(specification).toHaveAttribute("data-active", "")
  await expect(gallery.getByRole("heading", { name: /MD12.*输入区/ })).toBeVisible()
  const technology = gallery.getByRole("tab", { name: "技术栈" })
  await technology.click()
  await expect(technology).toHaveAttribute("data-active", "")
  await expect(gallery.getByText("CodeMirror 6", { exact: true })).toBeVisible()
  const presentation = gallery.getByRole("tab", { name: "展示效果" })
  await presentation.click()
  await expect(presentation).toHaveAttribute("data-active", "")

  await choose(page, "语言", "English")
  await expect(gallery.getByRole("heading", { name: "Agent Workspace elements" })).toBeVisible()
  await choose(page, "Theme", "Dark")
  await expect(page.locator("html")).toHaveClass(/dark/)
  expect(await composer.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement
    const saved = (window as typeof window & { __galleryComposer?: HTMLTextAreaElement }).__galleryComposer
    return {
      same: saved === textarea,
      value: textarea.value,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    }
  })).toEqual({ same: true, value: "fixture draft stays here", start: 3, end: 9 })
})

test("repeated file navigation focuses the linked Diff and fixture data recovers", async ({ page }) => {
  const gallery = await ready(page)
  const fileChange = gallery.locator('[data-gallery-module="MD10"]').getByRole("button", { name: /src\/filter\.ts \+1/ })
  const diffHeading = gallery.locator('[data-gallery-module="MD16"] h3[tabindex="-1"]')
  await fileChange.click()
  await expect(diffHeading).toBeFocused()
  await fileChange.click()
  await expect(diffHeading).toBeFocused()

  await choose(page, "数据状态", "error")
  await expect(page.locator('[data-reference-version="V2"]')).toHaveAttribute("data-data-state", "error")
  await expect(gallery.locator('[data-gallery-module="MD16"]')).toBeVisible()
  await expect(gallery.getByText(/fixture 刷新失败；保留原快照/)).toBeVisible()
  await choose(page, "数据状态", "empty")
  await expect(gallery.locator('[data-gallery-module="MD16"]')).toBeHidden()
  await choose(page, "数据状态", "success")
  await expect(gallery.locator('[data-gallery-module="MD16"]')).toBeVisible()
})
