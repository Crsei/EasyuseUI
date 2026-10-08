import { expect, test, type Page } from "@playwright/test"
import {
  createTranslator,
  resolveUiMessage,
  uiMessage,
  UiError,
} from "../lib/i18n-core"
import {
  describeValidateCanvasConfig,
  validateCanvasConfig,
  parseCanvasDocument,
} from "../lib/canvas-validation"
import { applyCanvasCommand } from "../lib/canvas-commands"
import {
  createCanvasDocument,
  type CanvasNodeDefinition,
} from "../lib/canvas-model"
import { createCanvasPersistence } from "../lib/canvas-services"

const chooseEnglish = (page: Page) =>
  page.getByRole("combobox", { name: "语言", exact: true }).selectOption("en")
const chooseChinese = (page: Page) =>
  page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("zh-CN")
async function selectNode(page: Page, title: string) {
  await page
    .getByRole("button", { name: "查找图中节点", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  const dialog = page.getByRole("dialog")
  await dialog
    .getByRole("button", { name: `定位 ${title}`, exact: true })
    .click()
  await dialog.getByRole("button", { name: "关闭弹窗" }).click()
}

test("typed messages interpolate nested diagnostics, pluralize and fall back", () => {
  const t = createTranslator("en")
  expect(t("i18n.items", { count: 1 })).toBe("1 item")
  expect(t("i18n.items", { count: 2 })).toBe("2 items")
  expect(
    t("canvas.problemContext", {
      context: "用户正文",
      problem: uiMessage("common.language"),
    }),
  ).toBe("用户正文: Language")
  const fallback = createTranslator("en", {
    "zh-CN": { label: "默认 {name}" },
    en: {},
  })
  expect(fallback("label", { name: "Original" })).toBe("默认 Original")
})

test("library diagnostics retain legacy strings and external validation errors", () => {
  const definition: CanvasNodeDefinition = {
    type: "test",
    label: "Caller",
    category: "Caller",
    ports: [],
    defaults: {},
    fields: [{ key: "name", label: "业务字段", kind: "text", required: true }],
    validate: () => ["调用方错误：保持原文"],
  }
  const node = {
    id: "one",
    type: "test",
    title: "业务标题",
    position: { x: 0, y: 0 },
    config: {},
  }
  const messages = describeValidateCanvasConfig(node, definition)
  expect(validateCanvasConfig(node, definition).name).toBe("业务字段不能为空。")
  expect(typeof messages.name).toBe("object")
  expect(
    resolveUiMessage(
      "en",
      typeof messages.name === "object" ? messages.name : undefined,
    ),
  ).toContain("业务字段")
  expect(messages["custom-0"]).toBe("调用方错误：保持原文")
  const structured = describeValidateCanvasConfig(
    { ...node, config: { schema: { type: "invalid" } } },
    {
      ...definition,
      fields: [{ key: "schema", label: "业务Schema", kind: "schema" }],
    },
  ).schema
  const structuredText =
    typeof structured === "string"
      ? structured
      : resolveUiMessage("en", structured)
  expect(structuredText).toContain("业务Schema: Schema")
  expect(structuredText).not.toContain("[object Object]")
  const doc = createCanvasDocument()
  const result = applyCanvasCommand(
    doc,
    { type: "delete-note", noteId: "absent" },
    [],
    { readOnly: true },
  )
  expect(result.document).toBe(doc)
  expect(resolveUiMessage("en", result.messageI18n)).toContain("read-only")
  expect(() => parseCanvasDocument('{"schemaVersion":2}', [])).toThrow(UiError)
})

test("stored save feedback resolves in both languages without another write", async () => {
  const doc = createCanvasDocument("saved")
  let writes = 0
  const session = createCanvasPersistence(doc, "v1", {
    save: async () => {
      writes++
      return { kind: "unknown" }
    },
    querySave: async () => ({ kind: "rejected", message: "外部服务拒绝原因" }),
  })
  session.setDocument({ ...doc, revision: 1 })
  await session.save()
  const before = session.getSnapshot()
  expect(resolveUiMessage("en", before.messageI18n)).toContain("unknown")
  expect(resolveUiMessage("zh-CN", before.messageI18n)).toBe(before.message)
  expect(session.getSnapshot()).toBe(before)
  expect(writes).toBe(1)
  await session.query()
  expect(session.getSnapshot().message).toBe("外部服务拒绝原因")
  expect(session.getSnapshot().messageI18n).toBeUndefined()
})

test("default Chinese, English navigation and reload keep existing URLs", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN")
  await chooseEnglish(page)
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible()
  await expect(page).toHaveTitle("EasyuseUI — Make usability the default")
  expect(new URL(page.url()).pathname).toBe("/")
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Documentation", exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/?$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Introduction",
  )
  await page.reload()
  await expect(
    page.getByRole("combobox", { name: "Language", exact: true }),
  ).toHaveValue("en")
  expect(errors).toEqual([])
})

test("dictionary search, category, selection and bilingual terms survive locale changes", async ({
  page,
}) => {
  await page.goto("/dictionary/")
  await page.getByRole("searchbox").fill("Chip")
  await expect(
    page.getByRole("button", { name: "查看 Chip · 可操作胶囊", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "查看 Chip · 可操作胶囊", exact: true })
    .click()
  await chooseEnglish(page)
  await expect(page.getByRole("searchbox")).toHaveValue("Chip")
  await expect(page.locator("#dictionary-detail h2")).toHaveText("Chip")
  await expect(page.locator("#dictionary-detail")).toContainText("When to use")
  await expect(page.locator("#dictionary-detail")).toContainText("可操作胶囊")
  await chooseChinese(page)
  await expect(page.locator("#dictionary-detail h2")).toHaveText("Chip")
})

test("scoped provider preserves draft and does not change the site's locale", async ({
  page,
}) => {
  await page.goto("/docs/i18n/")
  const preview = page.locator("[data-i18n-preview]")
  await preview.getByRole("textbox", { name: "Draft" }).fill("保留 my draft")
  await preview.getByRole("combobox").selectOption("en")
  await expect(preview).toContainText("1 item / 2 items")
  await expect(preview).toContainText("January 2, 2026")
  await expect(preview.getByRole("textbox", { name: "Draft" })).toHaveValue(
    "保留 my draft",
  )
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN")
  await expect(preview.getByRole("status")).toHaveCount(0)
})

test("cross-tab preference updates an open dialog without losing its JSON draft", async ({
  page,
  context,
}) => {
  await page.goto("/workspace/canvas/")
  await page
    .getByRole("button", { name: "JSON", exact: true })
    .filter({ visible: true })
    .first()
    .click()
  const dialog = page.getByRole("dialog")
  const draft = dialog.getByRole("textbox", { name: "图文档内容", exact: true })
  await draft.fill("{ invalid 中文 draft")
  const other = await context.newPage()
  await other.goto("/dictionary/")
  await chooseEnglish(other)
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole("textbox", {
      name: "Graph document content",
      exact: true,
    }),
  ).toHaveValue("{ invalid 中文 draft")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
})

test("Canvas selection, inspector draft, graph and undo survive locale change", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await selectNode(page, "Tool")
  const inspector = page.locator('[data-inspector-object="tool"]')
  await inspector.getByLabel("节点名称", { exact: true }).fill("业务新标题")
  await inspector.getByRole("button", { name: "应用配置", exact: true }).click()
  await inspector.getByLabel("节点名称", { exact: true }).fill("未提交 draft")
  const viewport = await page
    .locator(".react-flow__viewport")
    .getAttribute("style")
  const graph = page.locator("[data-canvas-workspace]")
  const count = await graph.getAttribute("data-node-count")
  await chooseEnglish(page)
  await expect(inspector.getByLabel("Node name", { exact: true })).toHaveValue(
    "未提交 draft",
  )
  await expect(graph).toHaveAttribute("data-node-count", count!)
  await expect(page.locator(".react-flow__viewport")).toHaveAttribute(
    "style",
    viewport!,
  )
  await expect(page.locator('[data-canvas-node="tool"]')).toContainText(
    "业务新标题",
  )
  await page.getByRole("button", { name: "Undo edit", exact: true }).click()
  await expect(page.locator('[data-canvas-node="tool"]')).toContainText("Tool")
})

test("unknown storage outcome remains blocked and feedback changes language", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/services/")
  await page.getByLabel("保存 fixture", { exact: true }).selectOption("unknown")
  await selectNode(page, "Tool")
  const inspector = page.locator('[data-inspector-object="tool"]')
  await inspector
    .getByLabel("节点名称", { exact: true })
    .fill("Original业务draft")
  await inspector.getByRole("button", { name: "应用配置", exact: true }).click()
  await page.getByRole("button", { name: "保存文档", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "保存文档", exact: true }),
  ).toBeDisabled()
  await chooseEnglish(page)
  await expect(
    page.getByRole("button", { name: "Save document", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "Query save receipt", exact: true }),
  ).toBeEnabled()
  await expect(page.getByText(/Save response lost/)).toBeVisible()
  await expect(inspector.getByLabel("Node name", { exact: true })).toHaveValue(
    "Original业务draft",
  )
})

test("invalid preference falls back and denied storage still allows language changes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("easyuseui-locale", "invalid")
  })
  await page.goto("/")
  await expect(
    page.getByRole("combobox", { name: "语言", exact: true }),
  ).toHaveValue("zh-CN")
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Denied")
    }
    Storage.prototype.getItem = () => {
      throw new Error("Denied")
    }
  })
  await chooseEnglish(page)
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible()
})

test("style edits, baseline and sample input survive English switch and dark theme", async ({
  page,
}) => {
  await page.goto("/style-workbench/")
  const radius = page.getByRole("spinbutton", { name: "圆角数值", exact: true })
  await radius.fill("20")
  await radius.press("Enter")
  const a = page.locator('[data-style-sample="baseline"]')
  const b = page.locator('[data-style-sample="modified"]')
  await a
    .getByRole("textbox", { name: "示例输入", exact: true })
    .fill("用户 sample")
  await chooseEnglish(page)
  await expect(a).toHaveCSS("border-radius", "6px")
  await expect(b).toHaveCSS("border-radius", "20px")
  await expect(b.getByRole("textbox")).toHaveValue("用户 sample")
  await expect(
    page.getByRole("region", { name: "Parameter differences" }),
  ).toContainText("20px")
  await page
    .getByRole("button", { name: "Toggle light and dark theme", exact: true })
    .click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(b).toHaveCSS("border-radius", "20px")
})

test("workspace chat draft and selected object survive switching language", async ({
  page,
}) => {
  await page.goto("/workspace/")
  await page
    .getByRole("navigation", { name: "工作台页面" })
    .getByRole("button", { name: "Chat", exact: true })
    .click()
  const composer = page.getByRole("textbox", { name: "消息输入", exact: true })
  await composer.fill("My 未发送 draft")
  const selected = await page
    .locator("[data-inspector-object]")
    .getAttribute("data-inspector-object")
  await chooseEnglish(page)
  await expect(
    page.getByRole("textbox", { name: "Message input", exact: true }),
  ).toHaveValue("My 未发送 draft")
  await expect(page.locator("[data-inspector-object]")).toHaveAttribute(
    "data-inspector-object",
    selected!,
  )
})

test("English static pages, Catalog prose and code preview hydrate without errors", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await chooseEnglish(page)
  for (const path of [
    "/components/",
    "/docs/installation/",
    "/docs/button/",
    "/scroll/",
    "/workspace/canvas/stress/",
  ]) {
    await page.goto(path)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached()
    if (path === "/docs/button/") {
      await expect(page).toHaveTitle("Button · EasyuseUI")
      await expect(
        page.getByRole("heading", { name: "Installation", exact: true }),
      ).toBeVisible()
      await expect(page.locator("tbody")).toContainText("loading")
    }
  }
  expect(errors).toEqual([])
})

test("English language picker works on touch with reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    colorScheme: "dark",
  })
  const page = await context.newPage()
  await page.goto("http://127.0.0.1:3011/dictionary/")
  const picker = page.getByRole("combobox", { name: "语言", exact: true })
  expect((await picker.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await picker.selectOption("en")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: "test-results/i18n-mobile-english.png",
    fullPage: true,
  })
  await context.close()
})
