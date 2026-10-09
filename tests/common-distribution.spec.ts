import { expect, test } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
const root = path.resolve(import.meta.dirname, "..")
const registry = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf8"),
) as {
  items: {
    name: string
    files: { path: string }[]
    registryDependencies?: string[]
    dependencies?: string[]
  }[]
}
const items = new Map(registry.items.map((item) => [item.name, item]))
const ids = [
  "button-group",
  "input-group",
  "toggle",
  "toggle-group",
  "input-otp",
  "separator",
  "collapsible",
  "accordion",
  "tooltip",
  "alert-dialog",
  "hover-card",
  "context-menu",
  "skeleton",
  "spinner",
  "empty",
  "alert",
  "progress",
  "toast",
  "sonner",
  "date-calendar",
  "date-picker",
  "pagination",
  "breadcrumb",
  "menubar",
  "navigation-menu",
  "direction",
  "attachment",
  "marker",
  "questionnaire",
  "bubble",
  "card",
  "aspect-ratio",
  "carousel",
  "chart",
  "form",
  "sidebar",
  "resizable",
  "scroll-area",
  "command",
  "drawer",

  "textarea",
  "label",
  "native-select",
  "switch",
  "radio-group",
  "checkbox",
  "table",
  "data-table",
  "avatar",
  "segment-bar",
  "sparkline",
  "dropdown-menu",
  "sheet",
  "command-palette",
  "kbd",
  "field",
  "form-section",
  "slider",
  "image-upload",
  "filter-toolbar",
  "metric-summary",
  "rating-display",
]
for (const id of ids)
  test(`${id} has its own complete source, CSS and package dependency closure`, () => {
    const reached = new Set<string>(),
      files = new Set<string>(),
      packages = new Set(["react", "react-dom"])
    function collect(name: string) {
      if (reached.has(name)) return
      reached.add(name)
      const item = items.get(name)
      expect(item, `${id}: missing item ${name}`).toBeDefined()
      for (const file of item!.files) files.add(file.path)
      for (const dependency of item!.dependencies ?? []) {
        const version = dependency.lastIndexOf("@")
        packages.add(version > 0 ? dependency.slice(0, version) : dependency)
      }
      for (const dependency of item!.registryDependencies ?? [])
        collect(dependency)
    }
    collect(id)
    for (const file of files) {
      if (!/\.tsx?$/.test(file)) continue
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(path.join(root, file), "utf8"),
        ts.ScriptTarget.Latest,
        true,
      )
      for (const node of source.statements) {
        const specifierNode =
          ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
            ? node.moduleSpecifier
            : undefined
        if (!specifierNode || !ts.isStringLiteral(specifierNode)) continue
        const specifier = specifierNode.text
        expect(specifier).not.toMatch(
          /(?:components\/site|lib\/site-|^next(?:\/|$))/,
        )
        if (specifier.startsWith("@/") || specifier.startsWith(".")) {
          const base = specifier.startsWith("@/")
            ? specifier.slice(2)
            : path.normalize(path.join(path.dirname(file), specifier))
          const resolved = [
            base,
            `${base}.ts`,
            `${base}.tsx`,
            `${base}/index.ts`,
            `${base}/index.tsx`,
          ].find((candidate) => fs.existsSync(path.join(root, candidate)))
          expect(
            resolved,
            `${id}: unresolved ${specifier} in ${file}`,
          ).toBeDefined()
          expect(
            files.has(resolved!),
            `${id}: ${resolved} is missing from its independent installation closure`,
          ).toBe(true)
        } else {
          const pkg = specifier.startsWith("@")
            ? specifier.split("/").slice(0, 2).join("/")
            : specifier.split("/")[0]
          expect(packages.has(pkg), `${id}: missing npm package ${pkg}`).toBe(
            true,
          )
        }
      }
    }
  })
