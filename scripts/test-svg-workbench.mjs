import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "typescript"
import { optimize } from "svgo/browser"
import { transform } from "@svgr/core"
import jsx from "@svgr/plugin-jsx"
import { loadSvgModules } from "./svg-workbench-module-loader.mjs"
const { model: m, parser: p } = await loadSvgModules()
const valid = (text) => {
  const r = p.parseSvg(text)
  assert.ok(r.document, JSON.stringify(r.diagnostics))
  return r.document
}
const rejected = (text, code) => {
  const r = p.parseSvg(text)
  assert.equal(r.document, undefined)
  assert.ok(
    r.diagnostics.some((d) => d.code === code),
    JSON.stringify(r.diagnostics),
  )
}
const icon = valid(
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path id="check" d="M20 6 9 17l-5-5"/></svg>',
)
const source = {
  collection: "lucide",
  iconName: "check",
  style: "outline",
  repository: "https://github.com/lucide-icons/lucide.git",
  commit: "55b9969b82776bb1412e29fc5cdc7535bfd69533",
  assetPath: "icons/check.svg",
  licenseRef: "LICENSE",
  license: "ISC + MIT",
  modified: false,
  usage: { package: "lucide-react", version: "0.577.0", component: "Check" },
}
icon.sources = [source]
assert.match(m.originalIconUsage(icon), /import \{ Check \}/)
const recolored = m.applySvgCommand(icon, {
  type: "update",
  ids: ["check"],
  attrs: { stroke: "#ff0000" },
})
assert.equal(recolored.revision, 1)
assert.equal(m.originalIconUsage(recolored), undefined)
assert.equal(icon.nodes[0].attrs.stroke, undefined)
assert.equal(valid(m.serializeSvg(recolored)).nodes[0].attrs.stroke, "#ff0000")
const a = {
    id: "a",
    tag: "rect",
    attrs: { x: "0", width: "4", height: "4" },
    children: [],
  },
  b = { ...a, id: "b" },
  c = { ...a, id: "c" }
const doc = { ...m.blankSvgDocument(), nodes: [a, b, c] }
assert.deepEqual(
  m
    .applySvgCommand(doc, { type: "reorder", id: "a", direction: 1 })
    .nodes.map((n) => n.id),
  ["b", "a", "c"],
)
assert.deepEqual(
  m
    .applySvgCommand(doc, { type: "reorder", id: "c", direction: -1 })
    .nodes.map((n) => n.id),
  ["a", "c", "b"],
)
const grouped = m.applySvgCommand(doc, {
  type: "group",
  ids: ["a", "b"],
  id: "group",
})
const moved = m.applySvgCommand(grouped, {
  type: "transform",
  ids: ["group", "a"],
  transform: "translate(2 3)",
})
assert.equal(m.findSvgNode(moved, "a").attrs.transform, undefined)
const ungrouped = m.applySvgCommand(moved, { type: "ungroup", id: "group" })
assert.equal(m.findSvgNode(ungrouped, "a").attrs.transform, "translate(2 3)")
const locked = m.applySvgCommand(grouped, {
  type: "update",
  ids: ["group"],
  locked: true,
})
assert.equal(m.applySvgCommand(locked, { type: "remove", ids: ["a"] }), locked)
const batch = m.applySvgCommand(doc, {
  type: "transaction",
  commands: [
    { type: "transform", ids: ["a"], transform: "translate(1 0)" },
    { type: "transform", ids: ["b"], transform: "translate(1 0)" },
  ],
})
assert.equal(batch.revision, doc.revision + 1)
const reference = valid(
  '<svg><defs><linearGradient id="gradient"><stop offset="0" stop-color="red"/></linearGradient><path id="shape" d="M0 0L10 10"/></defs><use href="#shape" stroke="url(#gradient)"/></svg>',
)
const copies = {
  ...m.blankSvgDocument(),
  nodes: [
    ...m.copySvgNodes(reference, "one"),
    ...m.copySvgNodes(reference, "two"),
  ],
}
valid(m.serializeSvg(copies))
const occupied = valid(
  '<svg><rect id="asset-1-1-root"/><rect id="asset-1-1-1-root"/></svg>',
)
const uniqueCopy = m.copySvgNodes(
  reference,
  m.uniqueSvgId(occupied, "asset-1-1"),
)
valid(
  m.serializeSvg({ ...occupied, nodes: [...occupied.nodes, ...uniqueCopy] }),
)
rejected('<svg id="artwork"><rect width="4" height="4"/></svg>', "unsupported")
const accessible = valid(
  '<svg aria-labelledby="caption" aria-describedby="detail"><title id="caption">Artwork</title><desc id="detail">Description</desc><g fill="#fff" stroke="blue" opacity="0.5"><path id="fff" d="M0 0L2 2"/></g></svg>',
)
const accessibleCopy = m.copySvgNodes(accessible, "copy")
assert.equal(accessibleCopy[0].attrs["aria-labelledby"], "copy-caption")
assert.equal(accessibleCopy[0].children[2].attrs.fill, "#fff")
valid(m.serializeSvg({ ...m.blankSvgDocument(), nodes: accessibleCopy }))
assert.match(m.svgToTsx(accessible), /aria-labelledby=\{prefix \+ "-caption"\}/)
assert.match(m.svgToTsx(accessible), /fill=\{"#fff"\}/)
assert.equal(m.svgPaintValue(accessible, "fff", "fill"), "#fff")
assert.equal(m.svgPaintValue(accessible, "fff", "stroke"), "blue")
assert.equal(m.svgPaintValue(accessible, "fff", "stroke-width"), "1")
assert.equal(m.svgPaintValue(accessible, "fff", "opacity"), "1")
rejected("<svg><script>alert(1)</script></svg>", "unsupported")
rejected('<svg onload="alert(1)"/>', "unsafe")
rejected('<svg><path d="M2"/></svg>', "geometry")
rejected('<svg><path d="M0 0A1 1 0 3 0 5 5"/></svg>', "geometry")
rejected("<svg><foreignObject/></svg>", "unsupported")
rejected('<!DOCTYPE svg [<!ENTITY x "evil">]><svg/>', "unsafe")
rejected('<svg><use href="&#104;ttps://example.com/a.svg#x"/></svg>', "unsafe")
rejected('<svg><use href="data:image/svg+xml,evil"/></svg>', "unsafe")
rejected('<svg><path id="same"/><path id="same"/></svg>', "reference")
rejected('<svg><use id="loop" href="#loop"/></svg>', "reference")
rejected('<svg><g id="a"><use href="#a"/></g></svg>', "reference")
rejected('<svg><rect fill="url(#missing)"/></svg>', "reference")
rejected('<svg aria-labelledby="missing"><rect/></svg>', "reference")
rejected('<svg style="background:url(https://example.com)"/>', "unsafe")
rejected("<svg>" + "<rect/>".repeat(2000) + "</svg>", "capacity")
rejected("<svg>" + " ".repeat(1024 * 1024) + "</svg>", "capacity")
rejected('<svg><path d="M' + "1 ".repeat(40000) + '"/></svg>', "capacity")
assert.ok(
  p
    .parseSvg("<svg><rect/></svg>", "timeout", -1)
    .diagnostics.some((d) => d.code === "timeout"),
)
valid('<svg><rect id="svg-n1"/><circle/></svg>')
const largest =
  "<svg>" +
  Array.from(
    { length: 1999 },
    (_, i) => `<rect x="${i}" width="1" height="1"/>`,
  ).join("") +
  "</svg>"
const start = performance.now()
valid(largest)
const parseMs = performance.now() - start
assert.ok(parseMs < 1000, `Capacity parse ${parseMs}ms`)
const code = m.svgToTsx(reference)
const compiled = ts.transpileModule(code, {
  reportDiagnostics: true,
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
})
assert.deepEqual(compiled.diagnostics, [])
assert.match(code, /useId/)
assert.match(code, /stroke=\{"url\(#" \+ prefix/)
const svgr = await transform(
  m.serializeSvg(icon),
  { plugins: [jsx], typescript: true, runtimeConfig: false },
  { componentName: "SvgrProbe" },
)
assert.match(svgr, /SVGProps/)
valid(
  optimize(m.serializeSvg(reference), {
    plugins: ["removeComments", "removeMetadata", "removeXMLNS", "sortAttrs"],
  }).data,
)
const assetReport = JSON.parse(
  await readFile(
    new URL("../plans/svg-workbench-assets.json", import.meta.url),
    "utf8",
  ),
)
assert.equal(
  assetReport.sources.reduce((count, s) => count + s.count, 0),
  60,
)
assert.ok(
  assetReport.sources.find((s) => s.collection === "lucide").verifiedImports >
    0,
)
for (const set of assetReport.sources) {
  const { assets } = await import(
    new URL(`../lib/svg-assets/${set.collection}.ts`, import.meta.url)
  )
  for (const asset of assets) {
    const document = valid(asset.svg)
    document.sources = [asset.source]
    const copied = {
      ...document,
      attrs: {},
      nodes: m.copySvgNodes(document, "copy"),
    }
    valid(m.serializeSvg(copied))
  }
}
console.log(
  `PASS: SVG safety, references, capacity, command transactions, provenance, TSX AST and SVGR/SVGO execution. 1999-node parse ${parseMs.toFixed(1)}ms.`,
)
