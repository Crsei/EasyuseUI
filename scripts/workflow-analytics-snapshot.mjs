import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
const root = path.resolve(import.meta.dirname, "..")
export async function analyticsSourceSnapshot() {
  const files = []
  async function walk(dir) {
    for (const entry of await fs.readdir(path.join(root, dir), {
      withFileTypes: true,
    })) {
      const f = dir + "/" + entry.name
      if (entry.isDirectory()) await walk(f)
      else if (/\.(tsx?|css|mjs|json)$/.test(f)) files.push(f)
    }
  }
  for (const dir of [
    "components/blocks/analytics",
    "components/blocks/charts",
    "components/blocks/dashboard",
    "components/examples/workflow-analytics",
    "app/examples/workflow-analytics",
  ])
    await walk(dir)
  for (const f of await fs.readdir(path.join(root, "lib")))
    if (/^(analytics-|dashboard-|chart-)/.test(f) && f.endsWith(".ts"))
      files.push("lib/" + f)
  for (const f of await fs.readdir(path.join(root, "tests")))
    if (f.startsWith("workflow-analytics") && f.endsWith(".spec.ts"))
      files.push("tests/" + f)
  for (const f of await fs.readdir(path.join(root, "scripts")))
    if (f.startsWith("workflow-analytics") && f.endsWith(".mjs"))
      files.push("scripts/" + f)
  files.push(
    "scripts/check-install.mjs",
    "scripts/check-theme-install.mjs",
    "lib/component-manifest.ts",
    "lib/site-i18n-messages.ts",
  )
  files.push(
    "components/ui/chart.tsx",
    "components/ui/chart.module.css",
    "lib/i18n-messages.ts",
    "styles/theme.css",
    "registry.json",
    "pnpm-lock.yaml",
    "scripts/capture-workflow-analytics.mjs",
    "scripts/workflow-analytics-snapshot.mjs",
    "scripts/measure-workflow-analytics.mjs",
    "playwright.workflow-analytics.config.ts",
    "package.json",
    "lib/example-manifest.ts",
  )
  const hashes = {}
  for (const f of [...new Set(files)].sort())
    hashes[f] = createHash("sha256")
      .update(await fs.readFile(path.join(root, f)))
      .digest("hex")
  return {
    sourceSnapshotId: createHash("sha256")
      .update(JSON.stringify(hashes))
      .digest("hex"),
    hashes,
  }
}
