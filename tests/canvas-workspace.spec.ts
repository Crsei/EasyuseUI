import { expect, test, type Page } from "@playwright/test"
const workspace = (page: Page) => page.locator("[data-canvas-workspace]")
async function connect(page: Page, source: string, target: string) {
  await page.getByRole("button", { name: "连接端口", exact: true }).click()
  const dialog = page.getByRole("dialog")
  const select = async (label: string, text: string) => {
    const field = dialog.getByLabel(label)
    const option = field.locator("option").filter({ hasText: text }).first()
    await field.selectOption((await option.getAttribute("value"))!)
  }
  await select("来源输出端口", source)
  await select("目标输入端口", target)
  await dialog.getByRole("button", { name: "建立连接", exact: true }).click()
  await dialog.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(dialog).toBeHidden()
}
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
  await expect(dialog).toBeHidden()
}
async function inspector(page: Page) {
  if (!(await page.locator("[data-inspector-docked]").count()))
    await page
      .getByRole("button", { name: "打开 Inspector", exact: true })
      .click()
  return page.locator("[data-inspector-object]")
}
test("build from empty, keyboard connection, edge insert, atomic undo and redo", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/workspace/canvas/")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "空图", exact: true }).click()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await expect(page.getByText("从一个节点开始构图")).toBeVisible()
  for (const type of ["Input", "Agent", "Tool", "Output"]) {
    await page.getByRole("button", { name: "添加节点", exact: true }).click()
    await page
      .getByRole("dialog")
      .getByRole("button", { name: `添加 ${type}`, exact: true })
      .click()
  }
  await connect(page, "Input / 文本", "Agent / 输入")
  await connect(page, "Agent / 结果", "Tool / 输入")
  await connect(page, "Tool / 结果", "Output / 输入")
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "3")
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "2")
  await page.getByRole("button", { name: "重做编辑", exact: true }).click()
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "3")
  const edge = page.locator(".react-flow__edge").first()
  await edge.focus()
  await edge.press("Enter")
  const panel = await inspector(page)
  await panel.getByRole("button", { name: "在连线中插入节点" }).click()
  await panel.getByRole("button", { name: "添加 Tool", exact: true }).click()
  await expect(workspace(page)).toHaveAttribute("data-node-count", "5")
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "4")
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "3")
  expect(errors).toEqual([])
})
test("configuration drafts survive object switches, invalid JSON is retained and text shortcuts do not delete nodes", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await selectNode(page, "Tool")
  let panel = await inspector(page)
  await panel.getByLabel("参数 JSON *", { exact: true }).fill('{"invalid":')
  await panel.getByRole("button", { name: "应用配置" }).click()
  await expect(panel.getByText("参数 JSON不是有效 JSON。")).toBeVisible()
  await panel.getByLabel("工具 ID *", { exact: true }).press("Backspace")
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  await selectNode(page, "Agent")
  panel = await inspector(page)
  await expect(panel.getByLabel("指令 *", { exact: true })).toHaveValue(
    "分析输入并生成摘要",
  )
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  await selectNode(page, "Tool")
  panel = await inspector(page)
  await expect(panel.getByLabel("参数 JSON *", { exact: true })).toHaveValue(
    '{"invalid":',
  )
  await panel.getByRole("button", { name: "放弃修改" }).click()
  await expect(panel.getByLabel("参数 JSON *", { exact: true })).toHaveValue(
    JSON.stringify({ mode: "preview" }, null, 2),
  )
})
test("variable selection is structured, survives rename and reports deleted source", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await selectNode(page, "Agent")
  const panel = await inspector(page)
  await panel.getByRole("button", { name: "选择指令变量" }).click()
  await page.getByRole("treeitem").filter({ hasText: "文本" }).last().click()
  await page.getByRole("button", { name: "插入变量引用" }).click()
  await panel.getByRole("button", { name: "应用配置" }).click()
  await expect(panel.getByText("引用：Input / text · string")).toBeVisible()
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  await selectNode(page, "Input")
  const inputPanel = await inspector(page)
  await inputPanel.getByLabel("节点名称", { exact: true }).fill("Renamed Input")
  await inputPanel.getByRole("button", { name: "应用配置" }).click()
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  await selectNode(page, "Agent")
  const agentPanel = await inspector(page)
  await expect(
    agentPanel.getByText("引用：Renamed Input / text · string"),
  ).toBeVisible()
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  await selectNode(page, "Renamed Input")
  await page.getByRole("button", { name: "打开画布操作", exact: true }).click()
  await page.getByRole("button", { name: "删除选中对象", exact: true }).click()
  await page.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.getByRole("button", { name: /^文档校验/ }).click()
  await expect(
    page.getByRole("button").filter({ hasText: "变量来源节点已不存在" }),
  ).toBeVisible()
})
test("malformed import preserves draft, replacement can undo, export downloads a versioned document", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  const dialog = page.getByRole("dialog")
  const original = JSON.parse(
    await dialog.getByLabel("图文档内容").inputValue(),
  )
  await dialog
    .getByLabel("图文档内容")
    .fill(JSON.stringify({ ...original, schemaVersion: 99 }))
  await dialog.getByRole("button", { name: "校验并替换草稿" }).click()
  await expect(dialog.getByRole("alert")).toContainText("schemaVersion")
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await dialog
    .getByLabel("图文档内容")
    .fill(JSON.stringify({ ...original, nodes: [], edges: [] }))
  await dialog.getByRole("button", { name: "校验并替换草稿" }).click()
  await expect(workspace(page)).toHaveAttribute("data-node-count", "0")
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "下载 JSON" }).click()
  expect((await download).suggestedFilename()).toBe("agent-workflow.json")
})
test("read-only blocks toolbar, configuration, shortcuts and import while refresh failure retains graph", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByRole("button", { name: "只读模式", exact: true }).click()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await expect(
    page.getByRole("button", { name: "添加节点", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "连接端口", exact: true }),
  ).toBeDisabled()
  await selectNode(page, "Agent")
  const panel = await inspector(page)
  await expect(panel.getByRole("button", { name: "应用配置" })).toBeDisabled()
  if (await page.getByRole("dialog").count())
    await page
      .getByRole("button", { name: "关闭 Inspector", exact: true })
      .click()
  const node = page.locator('.react-flow__node[data-id="agent"]')
  await node.focus()
  await node.press("Delete")
  await node.press("Control+v")
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "校验并替换草稿" }),
  ).toBeDisabled()
  await page.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await page.locator("[data-canvas-fixtures] > summary").click()
  await page.getByLabel("Canvas 数据场景").selectOption("error")
  await page.locator("[data-canvas-fixtures] > summary").click()
  await expect(workspace(page).getByRole("alert")).toContainText(
    "已有内容已保留",
  )
  await expect(page.locator("[data-canvas-node]")).toHaveCount(4)
  await page.getByRole("button", { name: "重试读取", exact: true }).click()
  await expect(workspace(page).getByRole("alert")).toHaveCount(0)
})
test("keyboard move, batch copy, note, responsive inspector and bottom resize work", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await selectNode(page, "Agent")
  const zoomBefore = Number(
    (await page.getByLabel("画布缩放比例").textContent())!.replace("%", ""),
  )
  await page.getByRole("button", { name: "放大画布", exact: true }).click()
  await expect
    .poll(async () =>
      Number(
        (await page.getByLabel("画布缩放比例").textContent())!.replace("%", ""),
      ),
    )
    .toBeGreaterThan(zoomBefore)
  await page.getByRole("button", { name: "适应全部节点", exact: true }).click()
  await expect
    .poll(async () =>
      Number(
        (await page.getByLabel("画布缩放比例").textContent())!.replace("%", ""),
      ),
    )
    .toBeLessThan(zoomBefore)
  const node = page.locator('.react-flow__node[data-id="agent"]')
  await node.focus()
  await node.press("ArrowRight")
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  const document = JSON.parse(await page.getByLabel("图文档内容").inputValue())
  expect(
    document.nodes.find((node: { id: string }) => node.id === "agent").position
      .x,
  ).toBe(408)
  await page.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await node.focus()
  await node.press("Control+a")
  await node.press("Control+c")
  await node.press("Control+v")
  await expect(workspace(page)).toHaveAttribute("data-node-count", "8")
  await expect(workspace(page)).toHaveAttribute("data-edge-count", "6")
  await page.getByRole("button", { name: "展开底部面板", exact: true }).click()
  const separator = page.getByRole("separator", { name: "调整底部面板高度" })
  await separator.focus()
  await separator.press("End")
  await expect(separator).toHaveAttribute("aria-valuenow", "400")
  await separator.press("Home")
  await expect(separator).toHaveAttribute("aria-valuenow", "200")
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(page.locator("[data-inspector-docked]")).toHaveCount(0)
  await page
    .getByRole("button", { name: "打开 Inspector", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "打开 Inspector", exact: true }),
  ).toBeFocused()
  await page.screenshot({
    path: "test-results/canvas-mobile.png",
    fullPage: true,
  })
})

test("drag commits once, frame and note edits can undo without deleting grouped nodes", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  const node = page.locator('[data-canvas-node="agent"] header')
  await expect(node).toBeVisible()
  const bounds = (await node.boundingBox())!
  const revision = Number(await workspace(page).getAttribute("data-revision"))
  await page.mouse.move(bounds.x + 32, bounds.y + 16)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 112, bounds.y + 64, { steps: 12 })
  await page.mouse.up()
  await expect(workspace(page)).toHaveAttribute(
    "data-revision",
    String(revision + 1),
  )
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await selectNode(page, "Agent")
  await page.getByRole("button", { name: "打开画布操作", exact: true }).click()
  await page
    .getByRole("button", { name: "将选中节点分组", exact: true })
    .click()
  await page.getByRole("button", { name: "添加便笺", exact: true }).click()
  await page.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(page.getByRole("dialog")).toBeHidden()
  await expect(page.locator("[data-canvas-frame]")).toHaveCount(1)
  await expect(page.locator("[data-canvas-note]")).toHaveCount(1)
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(page.locator("[data-canvas-note]")).toHaveCount(0)
  await page.getByRole("button", { name: "撤销编辑", exact: true }).click()
  await expect(page.locator("[data-canvas-frame]")).toHaveCount(0)
  await expect(workspace(page)).toHaveAttribute("data-node-count", "4")
})

test.describe("coarse pointer and reduced motion", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  })
  test("touch targets, palette search, keyboard alternative and theme stay usable on mobile", async ({
    page,
  }) => {
    await page.goto("/workspace/canvas/")
    await page.getByRole("button", { name: "添加节点", exact: true }).tap()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("搜索节点类型").fill("no-such-node")
    await expect(dialog.getByRole("status")).toContainText("没有匹配")
    await dialog.getByLabel("搜索节点类型").fill("Model")
    const add = dialog.getByRole("button", { name: "添加 Model", exact: true })
    expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await add.tap()
    await expect(workspace(page)).toHaveAttribute("data-node-count", "5")
    await expect
      .poll(async () =>
        Number(
          (await page.getByLabel("画布缩放比例").textContent())?.replace(
            "%",
            "",
          ),
        ),
      )
      .toBeGreaterThan(25)
    for (const handle of await page.locator(".react-flow__handle").all())
      await expect(handle).toHaveCSS("height", "44px")
    await page.getByRole("button", { name: "切换深浅主题", exact: true }).tap()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await page.getByRole("button", { name: "连接端口", exact: true }).tap()
    await expect(
      page.getByRole("dialog").getByLabel("来源输出端口"),
    ).toBeVisible()
    await page.getByRole("button", { name: "关闭弹窗" }).tap()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: "test-results/canvas-touch-dark.png",
      fullPage: true,
    })
  })
})

test("unknown node import keeps config and existing edges; export failure and leaving preserve draft", async ({
  page,
}) => {
  await page.goto("/workspace/canvas/")
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  let dialog = page.getByRole("dialog")
  const document = JSON.parse(
    await dialog.getByLabel("图文档内容").inputValue(),
  )
  document.nodes[1].type = "future-agent"
  document.nodes[1].config.custom = { nested: [1, 2, 3] }
  await dialog.getByLabel("图文档内容").fill(JSON.stringify(document))
  await dialog.getByRole("button", { name: "校验并替换草稿" }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('[data-canvas-node="agent"]')).toHaveAttribute(
    "data-unknown",
    "true",
  )
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(3)
  await page.getByRole("button", { name: "JSON", exact: true }).click()
  dialog = page.getByRole("dialog")
  const exported = JSON.parse(
    await dialog.getByLabel("图文档内容").inputValue(),
  )
  expect(exported.nodes[1].config.custom).toEqual({ nested: [1, 2, 3] })
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("blocked")) },
    })
  })
  await dialog.getByRole("button", { name: "复制脱敏 JSON" }).click()
  await expect(dialog.getByRole("alert")).toContainText("复制失败，草稿已保留")
  await dialog.getByRole("button", { name: "关闭弹窗" }).click()
  await expect(dialog).toBeHidden()
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("未导出")
    await dialog.dismiss()
  })
  await page.getByRole("link", { name: "EasyuseUI 首页", exact: true }).click()
  await expect(page).toHaveURL(/workspace\/canvas/)
  await expect(page.locator('[data-canvas-node="agent"]')).toHaveAttribute(
    "data-unknown",
    "true",
  )
})
