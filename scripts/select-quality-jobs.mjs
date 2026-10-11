import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"
export function selectQualityJobs(files) {
  const jobs = { docs: false, host: false }
  for (const file of files) {
    if (file.startsWith("services/pi-host/")) jobs.host = true
    else if (
      /^(packages\/|components\/(ui|blocks)\/|styles\/|pnpm-|package\.json$|tsconfig|next\.config|postcss|eslint|scripts\/|\.github\/)/.test(
        file,
      )
    )
      Object.assign(jobs, { docs: true, host: true })
    else jobs.docs = true
  }
  return jobs
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--self-test")) {
    assert.deepEqual(
      selectQualityJobs(["examples/agent-workspace/src/providers.tsx"]),
      { docs: true, host: false },
    )
    assert.deepEqual(selectQualityJobs(["packages/ui/lib/runtime-status.ts"]), {
      docs: true,
      host: true,
    })
    assert.deepEqual(selectQualityJobs(["lib/example-manifest.ts"]), {
      docs: true,
      host: false,
    })
    assert.deepEqual(selectQualityJobs(["pnpm-lock.yaml"]), {
      docs: true,
      host: true,
    })
    console.log("Quality selection: four change classes passed")
  } else {
    const base = process.env.QUALITY_BASE_SHA
    const head = process.env.QUALITY_HEAD_SHA || "HEAD"
    const files =
      base && !/^0+$/.test(base)
        ? execFileSync("git", ["diff", "--name-only", base, head], {
            encoding: "utf8",
          })
            .trim()
            .split("\n")
            .filter(Boolean)
        : ["pnpm-lock.yaml"]
    for (const [job, enabled] of Object.entries(selectQualityJobs(files)))
      console.log(`${job}=${enabled}`)
  }
}
