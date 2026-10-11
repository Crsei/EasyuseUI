import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
const root = path.resolve(import.meta.dirname, "..")
function sources(config) {
  const file = path.join(root, config)
  const loaded = ts.readConfigFile(file, ts.sys.readFile)
  assert.equal(loaded.error, undefined)
  const parsed = ts.parseJsonConfigFileContent(
    loaded.config,
    ts.sys,
    path.dirname(file),
  )
  assert.equal(parsed.errors.length, 0)
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  return program
    .getSourceFiles()
    .map((source) => fs.realpathSync(source.fileName))
}
const docs = sources("tsconfig.json")
const privateApp = path.join(root, "examples/")
assert.ok(
  !docs.some((file) => file.startsWith(privateApp)),
  "docs compile private example source",
)
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(file)
    else if (/\.tsx?$/.test(entry.name)) {
      const source = fs.readFileSync(file, "utf8")
      assert.ok(!/['"]@\//.test(source), `App-root alias in UI source: ${file}`)
      assert.ok(
        !/(?:from\s*|import\s*\()\s*['"](?:next(?:\/[^'"]*)?|@easyuse-ui\/example[^'"]*)['"]/.test(
          source,
        ),
        `UI reverse dependency: ${file}`,
      )
    }
  }
}
visit(path.join(root, "packages/ui"))
const report = {
  docsFiles: docs.length,
  docsPrivateExampleFiles: 0,
  source: "TypeScript resolved graph + public source imports",
}
fs.mkdirSync(path.join(root, ".local/agent-migration"), { recursive: true })
fs.writeFileSync(
  path.join(root, ".local/agent-migration/boundaries.json"),
  JSON.stringify(report, null, 2),
)
console.log(report)
