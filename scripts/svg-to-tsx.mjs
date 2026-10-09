/** Optional Node adapter. No API server or upstream workspace path is needed. */
import { readFile, writeFile } from "node:fs/promises"
import { transform } from "@svgr/core"
import jsx from "@svgr/plugin-jsx"
import { loadSvgModules } from "./svg-workbench-module-loader.mjs"
const [input, output] = process.argv.slice(2)
if (!input || !output || input === output)
  throw new Error("Usage: pnpm svg:tsx input.svg output.tsx (distinct paths)")
const { parser, model } = await loadSvgModules()
const parsed = parser.parseSvg(await readFile(input, "utf8"))
if (!parsed.document) throw new Error(JSON.stringify(parsed.diagnostics))
const code = await transform(
  model.serializeSvg(parsed.document),
  { plugins: [jsx], typescript: true, runtimeConfig: false },
  { componentName: "SvgArtwork" },
)
// Never overwrite an existing consumer file.
await writeFile(output, code, { flag: "wx" })
console.log("Created validated SVG component using SVGR 8.1.0")
