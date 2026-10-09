import { expect, test } from "@playwright/test"
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { componentManifest } from "../lib/component-manifest"
for (const [site, local, valid] of [
  ["", "", false],
  ["http://localhost:3010", "", false],
  ["http://127.0.0.1:3011", "1", true],
  ["https://ui.example.com", "", true],
  ["https://user:password@example.com", "", false],
] as const) {
  test(`public build URL guard ${site || "missing"} local=${local}`, () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/validate-site-url.mjs"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          NEXT_PUBLIC_SITE_URL: site,
          EASYUSEUI_LOCAL_BUILD: local,
        },
      },
    )
    expect(result.status === 0).toBe(valid)
  })
}
test("all Manifest documents preserve anchors, install IDs and canonical metadata", async ({
  request,
}) => {
  for (const entry of componentManifest) {
    const response = await request.get(entry.docPath)
    expect(response.ok(), entry.slug).toBe(true)
    const html = await response.text()
    for (const anchor of ["installation", "usage", "api", "example", "source"])
      expect(html, entry.slug).toContain(`id="${anchor}"`)
    expect(html, entry.slug).toContain(`/r/${entry.registryId}.json`)
    expect(html, entry.slug).toContain('rel="canonical"')
  }
})
test("lazy code assets contain the complete formal file and a matching source ID", () => {
  const index = JSON.parse(
    readFileSync("lib/docs-code-index.json", "utf8"),
  ) as Record<string, { id: string; path: string; url: string }[]>
  const seen = new Set<string>()
  for (const entries of Object.values(index))
    for (const entry of entries) {
      if (seen.has(entry.id)) continue
      seen.add(entry.id)
      const resource = JSON.parse(readFileSync("public" + entry.url, "utf8"))
      expect(resource.id).toBe(entry.id)
      expect(resource.path).toBe(entry.path)
      expect(resource.code).toBe(readFileSync(entry.path, "utf8"))
      expect(resource.html).toContain("shiki")
    }
})
