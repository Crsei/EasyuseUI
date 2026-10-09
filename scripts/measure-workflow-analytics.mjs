import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import ts from "typescript"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { gzipSync } from "node:zlib"
const root = path.resolve(import.meta.dirname, "..")
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "analytics-measure-"))
const models = [
  "analytics-model",
  "analytics-query",
  "analytics-history",
  "analytics-metrics",
  "chart-model",
  "chart-format",
]
for (const name of models) {
  const source = await fs.readFile(path.join(root, `lib/${name}.ts`), "utf8")
  const js = ts
    .transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    })
    .outputText.replace(/from "\.\/(.*?)"/g, 'from "./$1.mjs"')
  await fs.writeFile(path.join(tmp, `${name}.mjs`), js)
}
const { replayWorkflowHistory } = await import(
  path.join(tmp, "analytics-history.mjs")
)
const { chartData } = await import(path.join(tmp, "chart-model.mjs"))
const times = (fn) => {
  const samples = []
  for (let n = 0; n < 5; n++) {
    const t = performance.now()
    fn()
    samples.push(performance.now() - t)
  }
  return { samplesMs: samples, medianMs: [...samples].sort((a, b) => a - b)[2] }
}
const ref = {
  kind: "workItem",
  sourceId: "benchmark",
  projectId: "p",
  entityId: "1",
}
const baseline = [
  {
    entityRef: ref,
    title: "Measured fixture",
    stateId: "active",
    category: "active",
    createdAt: "2026-09-01T00:00:00Z",
    actualStartedAt: null,
    completedAt: null,
    estimate: null,
    assigneeIds: [],
    blockers: [],
    inScope: true,
    revision: 1,
  },
]
const coverage = { baselineAsOf: "2026-10-01T00:00:00Z" }
const eventMeasurements = [500, 5000, 50000].map((count) => {
  const events = Array.from({ length: count }, (_, i) => ({
    eventId: `e${i}`,
    entityRef: ref,
    sequence: i,
    occurredAt: "2026-10-02T00:00:00Z",
    recordedAt: "2026-10-02T00:00:00Z",
    sourceVersion: "v1",
    kind: "estimate",
    after: { estimate: { amount: i, unit: "hours" } },
  }))
  return {
    count,
    ...times(() =>
      replayWorkflowHistory(
        { baseline, events, coverage },
        "2026-10-09T00:00:00Z",
      ),
    ),
  }
})
const pointMeasurements = [100, 1000, 10000].map((count) => {
  const result = {
    series: [
      {
        id: "s1",
        label: "s1",
        color: "1",
        points: Array.from({ length: count }, (_, i) => ({
          bucketId: String(i),
          label: String(i),
          value: i % 10,
        })),
      },
    ],
  }
  return { count, ...times(() => chartData(result)) }
})
const files = [
  ...models.map((name) => `lib/${name}.ts`),
  "components/ui/chart.tsx",
  "components/ui/chart.module.css",
  ...(await fs
    .readdir(path.join(root, "components/blocks/charts"))
    .then((names) => names.map((name) => `components/blocks/charts/${name}`))),
  ...(await fs
    .readdir(path.join(root, "components/blocks/analytics"))
    .then((names) =>
      names.map((name) => `components/blocks/analytics/${name}`),
    )),
  ...(await fs
    .readdir(path.join(root, "components/blocks/dashboard"))
    .then((names) =>
      names.map((name) => `components/blocks/dashboard/${name}`),
    )),
  "lib/dashboard-model.ts",
  ...(await fs
    .readdir(path.join(root, "components/examples/workflow-analytics"))
    .then((names) =>
      names.map((name) => `components/examples/workflow-analytics/${name}`),
    )),
  "app/examples/workflow-analytics/page.tsx",
  "lib/example-manifest.ts",
  "tests/workflow-analytics-model.spec.ts",
  "tests/workflow-analytics.spec.ts",
  "playwright.workflow-analytics.config.ts",
  "scripts/measure-workflow-analytics.mjs",
  "scripts/workflow-analytics-consumer.mjs",
  "scripts/workflow-analytics-theme-consumer.mjs",
  "scripts/check-theme-install.mjs",
  "styles/theme.css",
  "package.json",
  "pnpm-lock.yaml",
]
const hashes = Object.fromEntries(
  await Promise.all(
    files.sort().map(async (file) => [
      file,
      createHash("sha256")
        .update(await fs.readFile(path.join(root, file)))
        .digest("hex"),
    ]),
  ),
)
const snapshotId = createHash("sha256")
  .update(JSON.stringify(hashes))
  .digest("hex")
const referenceRoot = path.resolve(root, "../UI-package")
const references = {}
for (const name of [
  "mantine",
  "tremor",
  "fluent-ui",
  "chakra-ui",
  "shadcn-ui",
  "hextaui",
]) {
  try {
    references[name] = execFileSync(
      "git",
      ["-C", path.join(referenceRoot, name), "rev-parse", "HEAD"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim()
  } catch {
    references[name] = "unavailable"
  }
}
const recharts = JSON.parse(
  await fs.readFile(
    path.join(root, "node_modules/recharts/package.json"),
    "utf8",
  ),
)
const umd = await fs.readFile(
  path.join(root, "node_modules/recharts/umd/Recharts.js"),
)
const report = {
  snapshotId,
  capturedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  method:
    "5 pure-function samples; medians; no rendering or service capacity claim",
  eventMeasurements,
  pointMeasurements,
  engine: {
    version: recharts.version,
    license: recharts.license,
    umdBytes: umd.length,
    umdGzipBytes: gzipSync(umd).length,
    note: "UMD package reference, not the application chunk size",
  },
  references,
  hashes,
}
await fs.writeFile(
  path.join(root, "public/blog/workflow-analytics/measurements.json"),
  JSON.stringify(report, null, 2) + "\n",
)
await fs.rm(tmp, { recursive: true })
console.log(
  JSON.stringify({
    snapshotId,
    eventMeasurements: eventMeasurements.map(({ count, medianMs }) => ({
      count,
      medianMs,
    })),
    pointMeasurements: pointMeasurements.map(({ count, medianMs }) => ({
      count,
      medianMs,
    })),
    engine: report.engine,
  }),
)
