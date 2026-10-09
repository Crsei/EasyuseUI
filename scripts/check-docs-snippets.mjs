import assert from "node:assert/strict"
import { mkdtemp, writeFile, rm, symlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import ts from "typescript"
import { componentManifest } from "../lib/component-manifest.ts"
import { docGuides } from "../lib/doc-guides.ts"
const root = path.resolve(import.meta.dirname, "..")
const folder = await mkdtemp(path.join(tmpdir(), "easyuseui-doc-snippets-"))
const sources = componentManifest
  .filter((entry) => entry.variants?.length)
  .flatMap((entry) => [
    { id: `${entry.slug}-usage`, code: entry.usage },
    ...entry.variants.map((variant, index) => ({
      id: `${entry.slug}-variant-${index}`,
      code: variant.code,
    })),
  ])
for (const guide of docGuides)
  for (const section of guide.sections) {
    if (section.code && section.language !== "bash")
      sources.push({ id: `${guide.slug}-${section.id}`, code: section.code })
  }
try {
  await symlink(path.join(root,"node_modules"),path.join(folder,"node_modules"),"dir")
  const filenames = [path.join(root,"next-env.d.ts")]
  for (const source of sources) {
    const file = path.join(folder, `${source.id}.tsx`)
    await writeFile(file, source.code)
    filenames.push(file)
  }
  const config = ts.readConfigFile(
    path.join(root, "tsconfig.json"),
    ts.sys.readFile,
  )
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const program = ts.createProgram(filenames, {
    ...parsed.options,
    incremental: false,
    paths: { "@/*": [`${root}/*`] },
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  if (diagnostics.length)
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (file) => file,
        getNewLine: () => "\n",
      }),
    )
  assert.equal(
    diagnostics.length,
    0,
    "Documented snippets must compile against the actual exported APIs",
  )
  console.log(
    `Documentation snippets checked: ${sources.length} usage, variant and guide examples`,
  )
} finally {
  await rm(folder, { recursive: true, force: true })
}
