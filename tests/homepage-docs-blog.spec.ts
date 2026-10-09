import { createHash } from "node:crypto"
import { expect, test } from "@playwright/test"
import { homepageAndDocs } from "../content/blog/homepage-and-docs"

test("redesign article binds real screenshot pairs and scoped production observations", async ({
  page,
  request,
}) => {
  await page.goto("/blog/homepage-and-docs/")
  await expect(
    page.getByRole("heading", {
      name: homepageAndDocs.title["zh-CN"],
      exact: true,
    }),
  ).toBeVisible()
  for (const phase of ["before", "after"] as const) {
    const response = await request.get(`/blog/homepage-and-docs/${phase}.json`)
    expect(response.ok()).toBe(true)
    const report = await response.json()
    expect(report.sampleCount).toBe(3)
    expect(report.samples).toHaveLength(24)
    expect(report.screenshots).toHaveLength(32)
    expect(
      createHash("sha256")
        .update(JSON.stringify(report.source.files))
        .digest("hex"),
    ).toBe(report.source.id)
    expect(
      homepageAndDocs.evidence.find((item) => item.id === phase)
        ?.sourceSnapshotId,
    ).toBe(report.source.id)
    for (const route of new Set(
      report.samples.map((item: { route: string }) => item.route),
    ))
      expect(
        report.samples.filter(
          (item: { route: string }) => item.route === route,
        ),
      ).toHaveLength(3)
    if (phase === "after") {
      expect(homepageAndDocs.sourceSnapshotId).toBe(report.source.id)
      for (const sample of report.samples)
        expect(sample.engineDownloaded).toBe(false)
    }
    const comparisons = homepageAndDocs.body.filter(
      (block) => block.type === "comparison",
    )
    expect(comparisons).toHaveLength(4)
    for (const comparison of comparisons) {
      expect(comparison.before?.viewport).toEqual(comparison.after?.viewport)
      expect(comparison.before?.theme).toBe(comparison.after?.theme)
      expect(comparison.before?.locale).toBe(comparison.after?.locale)
      const picture = comparison[phase]!
      expect(picture.sourceSnapshotId).toBe(report.source.id)
      const image = await request.get(picture.src)
      expect(image.ok()).toBe(true)
      expect(image.headers()["content-type"]).toContain("image/jpeg")
    }
  }
  const verification = await request.get(
    "/blog/homepage-and-docs/verification.json",
  )
  expect(verification.ok()).toBe(true)
})
