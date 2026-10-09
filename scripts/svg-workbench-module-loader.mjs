import ts from "typescript"
import { readFile } from "node:fs/promises"
const root = new URL("../", import.meta.url)
export async function loadSvgModules() {
  const compile = async (name, replacements = {}) => {
    let source = await readFile(new URL(`lib/${name}.ts`, root), "utf8")
    for (const [specifier, url] of Object.entries(replacements))
      source = source.replaceAll(`"${specifier}"`, JSON.stringify(url))
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
    return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  }
  const modelUrl = await compile("svg-workbench-model")
  const parseUrl = await compile("svg-workbench-parse", {
    "./svg-workbench-model": modelUrl,
    saxes: import.meta.resolve("saxes"),
  })
  return { model: await import(modelUrl), parser: await import(parseUrl) }
}
