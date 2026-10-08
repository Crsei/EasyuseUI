import { expect, test } from "@playwright/test"
import { writeFile } from "node:fs/promises"

test("record warm 50/200-node fixture navigation and inspector update baseline", async ({
  page,
}, testInfo) => {
  await page.goto("/workspace/canvas/")
  const measurements: Record<string, unknown> = {
    context:
      "warm fixture switch; Google Chrome; see canvas-implementation-log.md; shared-host load",
    samples: {},
  }
  for (const size of [50, 200]) {
    await page.locator("[data-canvas-fixtures] > summary").click()
    const start = Date.now()
    await page
      .getByRole("button", { name: `${size} 节点`, exact: true })
      .click()
    await page.locator("[data-canvas-fixtures] > summary").click()
    await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute(
      "data-node-count",
      String(size),
    )
    await expect(page.locator("[data-canvas-workspace]")).toHaveAttribute(
      "data-edge-count",
      String(size === 50 ? 73 : 298),
    )
    await expect(page.locator(".react-flow__edge-path").first()).toBeAttached()
    measurements[`switch${size}Ms`] = Date.now() - start
    const times: number[] = []
    for (const index of [1, 12, 25, 3, 18, 36, 5, 40, 10, 49]) {
      const elapsed = await page.evaluate(async (index) => {
        const button = [
          ...document.querySelectorAll<HTMLButtonElement>("button"),
        ].find(
          (button) =>
            button.getAttribute("aria-label") === `定位 节点 ${index}`,
        )!
        const start = performance.now()
        button.click()
        await new Promise<void>((resolve) => {
          const check = () => {
            if (
              document.querySelector(
                `[data-inspector-object="node-${index - 1}"]`,
              )
            )
              resolve()
            else requestAnimationFrame(check)
          }
          requestAnimationFrame(check)
        })
        return performance.now() - start
      }, index)
      times.push(Math.round(elapsed * 10) / 10)
    }
    const sorted = [...times].sort((a, b) => a - b)
    measurements[`inspector${size}SamplesMs`] = times
    measurements[`inspector${size}P95Ms`] =
      sorted[Math.ceil(sorted.length * 0.95) - 1]
  }
  const file = testInfo.outputPath("canvas-performance.json")
  await writeFile(file, JSON.stringify(measurements, null, 2))
  await testInfo.attach("canvas-performance", {
    path: file,
    contentType: "application/json",
  })
  await page.screenshot({
    path: "test-results/canvas-200-nodes.png",
    fullPage: true,
  })
  // The next test separately measures cold startup and sustained drag FPS.
  console.log(JSON.stringify(measurements))
})

test("measure cold 200-node readiness and sustained drag frames", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  const page = await context.newPage()
  await page.goto("http://127.0.0.1:3011/workspace/canvas/stress/")
  await expect(page.locator('[aria-label="流程画布"]')).toHaveAttribute(
    "data-canvas-ready",
    "true",
  )
  await page.evaluate(() => {
    document
      .querySelector<HTMLButtonElement>('button[aria-label="定位 节点 1"]')!
      .click()
  })
  await expect(page.locator('[data-inspector-object="node-0"]')).toBeVisible()
  const coldMs = await page.evaluate(() => performance.now())
  const node = page.locator('.react-flow__node[data-id="node-0"]')
  await expect(node).toBeVisible()
  const bounds = (await node.boundingBox())!
  const x = bounds.x + 80,
    y = bounds.y + 20
  await page.mouse.move(x, y)
  await page.evaluate(() => {
    const record = window as unknown as {
      canvasFrames: number[]
      canvasRecording: boolean
    }
    record.canvasFrames = []
    record.canvasRecording = true
    const collect = (time: number) => {
      record.canvasFrames.push(time)
      if (record.canvasRecording) requestAnimationFrame(collect)
    }
    requestAnimationFrame(collect)
  })
  await page.mouse.down()
  for (let step = 1; step <= 60; step++)
    await page.mouse.move(x + step * 2, y + step / 4)
  await page.mouse.up()
  const frames = await page.evaluate(() => {
    const record = window as unknown as {
      canvasFrames: number[]
      canvasRecording: boolean
    }
    record.canvasRecording = false
    return record.canvasFrames
  })
  const fps = ((frames.length - 1) * 1000) / (frames.at(-1)! - frames[0])
  const measurement = {
    context:
      "production, fresh browser context, navigation through measured nodes and first selection; 60 mouse moves with rAF timestamps",
    cold200OperableMs: Math.round(coldMs),
    dragFrames: frames.length,
    dragDurationMs: Math.round(frames.at(-1)! - frames[0]),
    dragFps: Math.round(fps * 10) / 10,
  }
  const file = testInfo.outputPath("canvas-cold-drag.json")
  await writeFile(file, JSON.stringify(measurement, null, 2))
  await testInfo.attach("canvas-cold-drag", {
    path: file,
    contentType: "application/json",
  })
  console.log(JSON.stringify(measurement))
  await context.close()
})
