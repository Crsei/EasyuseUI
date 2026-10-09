import { readFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import assert from "node:assert/strict"
import ts from "typescript"
import { format } from "prettier"
import { loadSvgModules } from "./svg-workbench-module-loader.mjs"
const root = path.resolve(import.meta.dirname, ".."),
  archive = path.resolve(root, "../UI-package")
const manifest = JSON.parse(
  await readFile(path.join(archive, "icon-sources-manifest.json"), "utf8"),
)
const {
  parser: { parseSvg },
  model: { flattenSvgNodes },
} = await loadSvgModules()
const names = [
  "check",
  "x",
  "arrow-up-right",
  "search",
  "plus",
  "minus",
  "circle",
  "square",
  "triangle",
  "move",
  "copy",
  "download",
  "upload",
  "folder",
  "file",
  "settings",
  "heart",
  "star",
  "house",
  "menu",
  "eye",
  "lock",
  "lock-open",
  "trash",
  "undo",
  "redo",
  "zoom-in",
  "zoom-out",
  "code",
  "image",
  "chevron-left",
  "chevron-right",
]
const sets = [
  {
    collection: "lucide",
    directory: "lucide",
    style: "outline",
    paths: names.map((n) => `icons/${n}.svg`),
    licensePath: "LICENSE",
    license: "ISC + MIT (Feather-derived assets)",
  },
  {
    collection: "tabler",
    directory: "tabler-icons",
    style: "outline",
    paths: [
      "check",
      "x",
      "search",
      "plus",
      "circle",
      "square",
      "heart",
      "star",
    ].map((n) => `icons/outline/${n}.svg`),
    licensePath: "LICENSE",
    license: "MIT",
  },
  {
    collection: "phosphor",
    directory: "phosphor-core",
    style: "regular",
    paths: [
      "check",
      "x",
      "magnifying-glass",
      "plus",
      "circle",
      "square",
      "heart",
      "star",
    ].map((n) => `assets/regular/${n}.svg`),
    licensePath: "LICENSE",
    license: "MIT",
  },
  {
    collection: "simple-icons",
    directory: "simple-icons",
    style: "brand",
    paths: ["github", "figma", "react", "typescript"].map(
      (n) => `icons/${n}.svg`,
    ),
    licensePath: "LICENSE.md",
    license: "CC0-1.0",
    notice:
      "Brand names and marks remain subject to their owners' guidelines; CC0 does not grant trademark rights.",
  },
  {
    collection: "lobe",
    directory: "lobe-icons",
    style: "brand",
    paths: ["openai", "claude-color", "deepseek-color", "gemini-color"].map(
      (n) => `packages/static-svg/icons/${n}.svg`,
    ),
    licensePath: "LICENSE",
    license: "MIT",
    notice:
      "Provider identity artwork only. Review the brand owner's usage guidelines.",
  },
  {
    collection: "iconify-lucide",
    directory: "iconify-icon-sets",
    style: "outline",
    paths: ["check", "x", "search", "plus"].map((n) => `json/lucide.json#${n}`),
    licensePath: "json/lucide.json > info.license + upstream Lucide LICENSE",
    license: "ISC + MIT (Lucide upstream notice retained)",
  },
]
const reports = [],
  allIds = new Set()
for (const set of sets) {
  const entry = manifest.sources.find((s) => s.directory === set.directory)
  assert.ok(entry && /^[a-f0-9]{40}$/.test(entry.commit))
  const repo = path.join(archive, set.directory)
  assert.equal(
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repo,
      encoding: "utf8",
    }).trim(),
    entry.commit,
  )
  const blob = (asset) => {
    assert.ok(!asset.includes("..") && !path.isAbsolute(asset))
    return execFileSync("git", ["show", `${entry.commit}:${asset}`], {
      cwd: repo,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    })
  }
  const licenseText =
    set.collection === "iconify-lucide"
      ? await readFile(path.join(archive, "lucide/LICENSE"), "utf8")
      : blob(set.licensePath)
  const assets = []
  for (const assetPath of set.paths) {
    let raw, iconName
    if (set.collection === "iconify-lucide") {
      iconName = assetPath.split("#")[1]
      const json = JSON.parse(blob("json/lucide.json"))
      assert.equal(json.info.license.spdx, "ISC")
      raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${json.width} ${json.height}">${json.icons[iconName].body}</svg>`
    } else {
      raw = blob(assetPath)
      iconName = path.basename(assetPath, ".svg")
    }
    const adaptations = []
    let svg = raw
    if (set.collection === "lobe") {
      svg = svg
        .replace(/ style="flex:none;line-height:1"/g, "")
        .replace(/(width|height)="1em"/g, '$1="24"')
      adaptations.push(
        "Removed root layout-only style; resolved 1em dimensions to 24. Geometry and paint retained.",
      )
    }
    const parsed = parseSvg(svg)
    assert.ok(
      parsed.document,
      `${assetPath}: ${JSON.stringify(parsed.diagnostics)}`,
    )
    const id = `${set.collection}:${iconName}`
    assert.ok(!allIds.has(id))
    allIds.add(id)
    let tags = [iconName],
      categories = [set.style],
      usage
    if (set.collection === "lucide") {
      const meta = JSON.parse(blob(`icons/${iconName}.json`))
      tags = [...tags, ...meta.tags]
      categories = meta.categories
      // Only offer an import when the installed package's actual node geometry matches.
      try {
        const installed = await readFile(
          path.join(
            root,
            `node_modules/lucide-react/dist/esm/icons/${iconName}.js`,
          ),
          "utf8",
        )
        const version = JSON.parse(
          await readFile(
            path.join(root, "node_modules/lucide-react/package.json"),
            "utf8",
          ),
        ).version
        const ast = ts.createSourceFile(
          "icon.js",
          installed,
          ts.ScriptTarget.Latest,
          true,
        )
        const declaration = ast.statements
          .filter(ts.isVariableStatement)
          .flatMap((n) => n.declarationList.declarations)
          .find((n) => n.name.getText(ast) === "__iconNode")
        const literal = (node) => {
          if (ts.isStringLiteralLike(node)) return node.text
          if (ts.isNumericLiteral(node)) return Number(node.text)
          if (ts.isArrayLiteralExpression(node))
            return node.elements.map(literal)
          if (ts.isObjectLiteralExpression(node))
            return Object.fromEntries(
              node.properties.map((p) => [p.name.text, literal(p.initializer)]),
            )
          throw new Error("Nonliteral icon node")
        }
        const canonical = (attrs) =>
          Object.fromEntries(
            Object.entries(attrs)
              .filter(([k]) => k !== "key")
              .sort(([a], [b]) => a.localeCompare(b)),
          )
        if (declaration) {
          const expected = literal(declaration.initializer).map(
            ([tag, attrs]) => [tag, canonical(attrs)],
          )
          const actual = flattenSvgNodes(parsed.document.nodes).map((n) => [
            n.tag,
            canonical(n.attrs),
          ])
          if (JSON.stringify(expected) === JSON.stringify(actual))
            usage = {
              package: "lucide-react",
              version,
              component: iconName
                .split("-")
                .map((n) => n[0].toUpperCase() + n.slice(1))
                .join(""),
            }
        }
      } catch {
        /* New archive icons can have no installed-package equivalent. */
      }
    }
    const source = {
      collection: set.collection,
      iconName,
      style: set.style,
      repository: entry.repository,
      commit: entry.commit,
      assetPath,
      licenseRef: set.licensePath,
      license: set.license,
      licenseText,
      modified: adaptations.length > 0,
      assetSha256: createHash("sha256").update(raw).digest("hex"),
      ...(set.notice ? { notice: set.notice } : {}),
      ...(usage ? { usage } : {}),
    }
    assets.push({
      id,
      name: iconName,
      tags,
      categories,
      svg,
      source,
      licenseText,
      adaptations,
    })
  }
  const code = await format(
    `// Generated by scripts/build-svg-assets.mjs from frozen Git blobs.\nimport type { SvgIconAsset } from "../svg-workbench-assets"\nexport const assets: SvgIconAsset[] = ${JSON.stringify(assets, null, 2)}\n`,
    { parser: "typescript", semi: false },
  )
  const output = path.join(root, `lib/svg-assets/${set.collection}.ts`)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, code)
  reports.push({
    collection: set.collection,
    commit: entry.commit,
    count: assets.length,
    bytes: Buffer.byteLength(code),
    verifiedImports: assets.filter((a) => a.source.usage).length,
    license: set.license,
    assetPaths: set.paths,
  })
}
await writeFile(
  path.join(root, "plans/svg-workbench-assets.json"),
  JSON.stringify({ schemaVersion: 1, sources: reports }, null, 2) + "\n",
)
console.log(
  JSON.stringify(
    reports.map((r) => ({
      collection: r.collection,
      count: r.count,
      bytes: r.bytes,
      verifiedImports: r.verifiedImports,
      commit: r.commit,
      license: r.license,
    })),
    null,
    2,
  ),
)
