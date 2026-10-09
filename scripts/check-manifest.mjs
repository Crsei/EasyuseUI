import assert from "node:assert/strict"
import ts from "typescript"
import fs from "node:fs"
import path from "node:path"
import { componentManifest } from "../lib/component-manifest.ts"
import { siteMessages } from "../lib/site-i18n-messages.ts"

const root = path.resolve(import.meta.dirname, "..")
const registry = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf8"),
)
const items = new Map(registry.items.map((item) => [item.name, item]))
const seen = new Set()
for (const entry of componentManifest) {
  assert.ok(!seen.has(entry.slug), `Duplicate component slug: ${entry.slug}`)
  seen.add(entry.slug)
  assert.equal(entry.docPath, `/docs/${entry.slug}/`)
  assert.ok(
    ["interaction", "data", "agent", "canvas", "workspace", "other"].includes(
      entry.docGroup,
    ),
  )
  assert.ok(Number.isInteger(entry.docOrder))
  const item = items.get(entry.registryId)
  assert.ok(item, `Missing Registry item: ${entry.registryId}`)
  assert.equal(entry.installType, item.type.split(":")[1])
  assert.deepEqual(
    [...entry.registryDependencies].sort(),
    [...(item.registryDependencies ?? [])].sort(),
  )
  for (const file of [
    entry.source,
    entry.example,
    ...(entry.relatedSources ?? []),
  ])
    assert.ok(
      fs.existsSync(path.join(root, file)),
      `Missing component source: ${file}`,
    )
  assert.ok(
    item.files.some((file) => file.path === entry.source),
    `${entry.slug}: source missing from Registry`,
  )
}
for (const entry of componentManifest)
  for (const slug of entry.related ?? [])
    assert.ok(
      seen.has(slug),
      `${entry.slug}: unknown related component ${slug}`,
    )
const source = fs.readFileSync(
  path.join(root, "lib/component-manifest.ts"),
  "utf8",
)
assert.ok(
  !/^import\s.*from\s+["'](?:react|next|@\/components|.*i18n-provider)/m.test(
    source,
  ),
  "Manifest must contain data only",
)
const loaders = fs.readFileSync(
  path.join(root, "components/docs/demo-loader.tsx"),
  "utf8",
)
for (const slug of seen)
  assert.ok(
    loaders.includes(`"${slug}":`) || loaders.includes(`  ${slug}:`),
    `Missing demo loader: ${slug}`,
  )
// Verify changed explicit pattern APIs; inherited primitive APIs stay with Base UI.
const apiContracts = {
  "components/blocks/workspace-shell.tsx": [
    "sidebarCollapsed",
    "defaultSidebarCollapsed",
    "onSidebarCollapsedChange",
    "inspectorOpen",
    "defaultInspectorOpen",
    "onInspectorOpenChange",
    "inspectorWidth",
    "defaultInspectorWidth",
    "onInspectorWidthChange",
    "bottomPanelOpen",
    "defaultBottomPanelOpen",
    "onBottomPanelOpenChange",
    "bottomPanelHeight",
    "defaultBottomPanelHeight",
    "onBottomPanelHeightChange",
    "inspectorOverlayOpen",
    "onInspectorOverlayOpenChange",
  ],
  "components/blocks/chat-message.tsx": ["revision", "deferOffscreen"],
  "components/blocks/activity-timeline.tsx": ["revision", "deferOffscreen"],
  "components/blocks/workflow-canvas.tsx": ["onMeasurementsChange"],
  "components/blocks/canvas-workspace.tsx": ["fixedNodeIds"],
}
for (const [file, properties] of Object.entries(apiContracts)) {
  const ast = ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const declared = new Set()
  function visit(node) {
    if (ts.isPropertySignature(node) && node.name)
      declared.add(node.name.getText(ast))
    ts.forEachChild(node, visit)
  }
  visit(ast)
  for (const property of properties)
    assert.ok(
      declared.has(property),
      `${file}: missing documented API ${property}`,
    )
}
const index = componentManifest.map((entry) => ({
  ...Object.fromEntries(
    Object.entries(entry).filter(
      ([key]) => !["props", "relatedSources", "notes"].includes(key),
    ),
  ),
  notes: entry.notes.slice(0, 1),
}))
const messageKeys = Object.keys(siteMessages["zh-CN"])
assert.deepEqual(messageKeys.toSorted(), Object.keys(siteMessages.en).toSorted())
const outputs = {
  "site-i18n-compact.json": {
    keys: messageKeys,
    values: {
      "zh-CN": messageKeys.map((key) => siteMessages["zh-CN"][key]),
      en: messageKeys.map((key) => siteMessages.en[key]),
    },
  },
  "component-index.json": index,
  "component-navigation.json": componentManifest.map(
    ({
      slug,
      name,
      category,
      docPath,
      displayCategory,
      docGroup,
      docOrder,
    }) => ({
      slug,
      name,
      category,
      docPath,
      displayCategory,
      docGroup,
      docOrder,
    }),
  ),
  "component-preview.json": componentManifest.map(({ slug, widePreview }) => ({
    slug,
    ...(widePreview ? { widePreview } : {}),
  })),
  "component-vocabulary.json": componentManifest.map(
    ({ slug, name, category, description, source, usage, notes }) => ({
      slug,
      name,
      category,
      description,
      source,
      usage,
      notes: notes.slice(0, 1),
    }),
  ),
  "component-directory.json": componentManifest.map(
    ({
      slug,
      name,
      description,
      displayCategory,
      docPath,
      installType,
      registryId,
      docGroup,
      docOrder,
    }) => ({
      slug,
      name,
      description,
      displayCategory,
      docPath,
      installType,
      registryId,
      docGroup,
      docOrder,
    }),
  ),
}
for (const [name, data] of Object.entries(outputs)) {
  const filename = path.join(root, "lib", name)
  if (process.argv.includes("--write"))
    fs.writeFileSync(filename, JSON.stringify(data, null, 2) + "\n")
  else
    assert.deepEqual(
      JSON.parse(fs.readFileSync(filename, "utf8")),
      JSON.parse(JSON.stringify(data)),
      `${name} is stale; run pnpm manifest:build`,
    )
}
console.log(
  `Manifest checked: ${seen.size} components, Registry files/dependencies and lazy loaders`,
)
