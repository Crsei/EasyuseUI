import { writeFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import budgets from "../config/performance-budgets.json" with { type: "json" }
for (const kind of ["conversation", "activity"]) {
  test(`@performance 5000 ${kind} append with explicit revisions`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000)
    await page.goto("/benchmarks/streams/")
    await page.waitForFunction(() => !!Reflect.get(window, "streamFixture"))
    const result = await page.evaluate(
      async ({ kind, count, samples }) => {
        const fixture = Reflect.get(window, "streamFixture")
        const paint = () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          )
        fixture.configure(count, kind, true)
        await paint()
        const values = []
        for (let index = 0; index < samples; index++) {
          const start = performance.now()
          fixture.update("append", index)
          await paint()
          values.push(performance.now() - start)
          if (
            !document.querySelector(
              `[data-message-id="new-${index}"], [data-event-id="new-${index}"]`,
            )
          )
            throw new Error("Append did not commit")
        }
        return {
          values,
          p95: values.slice().sort((a, b) => a - b)[
            Math.ceil(values.length * 0.95) - 1
          ],
        }
      },
      { kind, count: budgets.streams.count, samples: budgets.streams.samples },
    )
    const file = testInfo.outputPath(`${kind}-append.json`)
    await writeFile(
      file,
      JSON.stringify(
        {
          profile: process.env.PERF_PROFILE ?? "shared-host-observation",
          kind,
          budget: budgets.streams,
          ...result,
        },
        null,
        2,
      ),
    )
    await testInfo.attach(`${kind}-append.json`, {
      path: file,
      contentType: "application/json",
    })
    const baseline = budgets.streams.ciBaselineP95Ms as number | null
    if (
      process.env.PERF_PROFILE === "ci" &&
      (baseline === null ||
        result.p95 > baseline * budgets.streams.relativeRegressionLimit)
    )
      expect(result.p95).toBeLessThanOrEqual(budgets.streams.appendP95Ms)
  })
}
test("activity retains every unread ID when several commits arrive in one frame", async ({
  page,
}) => {
  await page.goto("/benchmarks/streams/")
  await page.waitForFunction(() => !!Reflect.get(window, "streamFixture"))
  await page.evaluate(() =>
    Reflect.get(window, "streamFixture").configure(1000, "activity", true),
  )
  const history = page.locator('[aria-label="Activity 时间线"]')
  await history.focus()
  await page.keyboard.press("Control+Home")
  await expect
    .poll(() => history.evaluate((element) => element.scrollTop))
    .toBe(0)
  await page.evaluate(() => {
    const fixture = Reflect.get(window, "streamFixture")
    for (let index = 0; index < 10; index++) fixture.update("append", index)
  })
  await expect(page.getByRole("button", { name: /10.*新事件/ })).toBeVisible()
  await expect
    .poll(() => history.evaluate((element) => element.scrollTop))
    .toBe(0)
})
test("deferred messages keep full text, browser find and prepend anchor", async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.goto("/benchmarks/streams/")
  await page.waitForFunction(() => !!Reflect.get(window, "streamFixture"))
  await page.evaluate(() =>
    Reflect.get(window, "streamFixture").configure(5000, "conversation", true),
  )
  await expect(page.locator("[data-message-id]")).toHaveCount(5000)
  expect(
    await page.evaluate(() =>
      Reflect.get(window, "find").call(window, "Record 2048 fixed content"),
    ),
  ).toBe(true)
  const found = page.locator('[data-message-id="item-2048"]')
  // window.find selects the match; reveal it to exercise the reading anchor separately.
  await found.scrollIntoViewIfNeeded()
  await expect(found).toBeInViewport()
  await page.evaluate(() => window.getSelection()?.removeAllRanges())
  const before = (await found.boundingBox())!.y
  await page.evaluate(() =>
    Reflect.get(window, "streamFixture").update("prepend", 0),
  )
  await expect
    .poll(async () => Math.abs((await found.boundingBox())!.y - before))
    .toBeLessThan(4)
})
