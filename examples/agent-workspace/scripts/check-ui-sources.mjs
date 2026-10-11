import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
const app = path.resolve(import.meta.dirname, "..")
const config = ts.readConfigFile(
  path.join(app, "tsconfig.json"),
  ts.sys.readFile,
)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, app)
const program = ts.createProgram(parsed.fileNames, parsed.options)
const publicComponents = [
  ...new Set(
    program
      .getSourceFiles()
      .map((source) => fs.realpathSync(source.fileName))
      .filter((file) =>
        /\/packages\/ui\/(?:components|lib)\/.*\.tsx?$/.test(file),
      ),
  ),
].sort()
const filename = path.join(app, "app/ui-sources.css")
const source =
  "/* Generated from the resolved Agent public-component dependency graph. */\n" +
  publicComponents
    .map(
      (file) =>
        `@source "${path.relative(path.dirname(filename), file).replaceAll(path.sep, "/")}";`,
    )
    .join("\n") +
  "\n"
if (process.argv.includes("--write")) fs.writeFileSync(filename, source)
else
  assert.equal(
    fs.readFileSync(filename, "utf8"),
    source,
    "Agent Tailwind source list is stale",
  )
console.log(`Agent Tailwind: ${publicComponents.length} actual public sources`)
