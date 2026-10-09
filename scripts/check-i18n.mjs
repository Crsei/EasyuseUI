import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "..")
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
function resources(file) {
  const root = ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true,
  )
  const initializer = root.statements.find(ts.isVariableStatement)
    .declarationList.declarations[0].initializer
  function literal(node) {
    if (ts.isAsExpression(node)) return literal(node.expression)
    if (ts.isStringLiteralLike(node)) return node.text
    if (ts.isObjectLiteralExpression(node))
      return Object.fromEntries(
        node.properties.map((prop) => [
          prop.name.text,
          literal(prop.initializer),
        ]),
      )
    throw new Error(`${file}: messages must be literal strings or plural forms`)
  }
  return literal(initializer)
}
const core = resources("lib/i18n-messages.ts")
const svg = resources("lib/i18n-svg-messages.ts")
const site = resources("lib/site-i18n-messages.ts")
const crm = resources("lib/site-crm-messages.ts")
const compact = JSON.parse(read("lib/site-i18n-compact.json"))
const decoded = Object.fromEntries(
  ["zh-CN", "en"].map((locale) => [
    locale,
    Object.fromEntries(
      compact.keys.map((key, index) => [
        key.startsWith("!") ? key.slice(1) : compact.prefix + key,
        compact.values[locale][index] ?? core[locale][compact.shared[index]],
      ]),
    ),
  ]),
)
assert.deepEqual(
  decoded,
  site,
  "Compact site dictionary must restore every key and locale exactly",
)
for (const [index, key] of Object.entries(compact.shared)) {
  for (const locale of ["zh-CN", "en"]) {
    assert.equal(
      typeof core[locale][key],
      "string",
      `Invalid shared portable key: ${key}`,
    )
    assert.equal(
      compact.values[locale][index],
      null,
      `Shared value must be absent: ${index}`,
    )
  }
}
const placeholders = (value) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
for (const [name, messages] of [
  ["components", core],
  ["SVG components", svg],
  ["site", site],
  ["CRM example", crm],
]) {
  assert.deepEqual(
    Object.keys(messages.en).sort(),
    Object.keys(messages["zh-CN"]).sort(),
    `${name}: locale keys differ`,
  )
  for (const [key, chinese] of Object.entries(messages["zh-CN"])) {
    const english = messages.en[key]
    assert.equal(
      typeof chinese,
      typeof english,
      `${key}: resource shapes differ`,
    )
    const forms =
      typeof chinese === "string"
        ? [[chinese, english]]
        : ["one", "other"].map((form) => [chinese[form], english[form]])
    for (const [zh, en] of forms) {
      assert.ok(zh && en, `${key}: empty message`)
      assert.deepEqual(
        placeholders(zh),
        placeholders(en),
        `${key}: placeholder mismatch`,
      )
    }
  }
}
const normalize = (value) => value.replace(/\s+/g, " ").trim()
const sources = new Set(
  Object.values(site["zh-CN"])
    .filter((value) => typeof value === "string")
    .map(normalize),
)
function parse(file) {
  return ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
}
function visit(node, callback) {
  callback(node)
  ts.forEachChild(node, (child) => visit(child, callback))
}
// Catalog prose is always translated; API identifiers, defaults and code remain source content.
visit(parse("lib/component-manifest.ts"), (node) => {
  if (!ts.isPropertyAssignment(node)) return
  const name = node.name.getText().replace(/["']/g, "")
  if (!["description", "notes"].includes(name)) return
  visit(node.initializer, (literal) => {
    if (
      ts.isStringLiteralLike(literal) &&
      /[\p{Script=Han}]/u.test(literal.text)
    )
      assert.ok(
        sources.has(normalize(literal.text)),
        `Missing catalog translation: ${literal.text}`,
      )
  })
})
// Dictionary explanatory prose and implementation labels; bilingual term names stay intact.
visit(parse("lib/visual-dictionary.ts"), (node) => {
  if (ts.isCallExpression(node) && node.expression.getText() === "term") {
    for (const arg of node.arguments.slice(5, 8))
      if (ts.isStringLiteralLike(arg))
        assert.ok(
          sources.has(normalize(arg.text)),
          `Missing dictionary prose: ${arg.text}`,
        )
  }
})
const registry = JSON.parse(read("registry.json"))
for (const item of registry.items) {
  for (const file of item.files ?? []) {
    if (!file.path.match(/\.[jt]sx?$/)) continue
    const source = read(file.path)
    assert.ok(
      !source.includes("@/components/site/") && !source.includes("site-i18n"),
      `${file.path}: site dependency in portable source`,
    )
    if (/from\s*["']@\/lib\/i18n-/.test(source))
      assert.ok(
        item.name === "i18n" || item.registryDependencies?.includes("i18n"),
        `${item.name}: missing i18n Registry dependency`,
      )
    visit(parse(file.path), (node) => {
      if (ts.isJsxText(node) && /[\p{Script=Han}]/u.test(node.text))
        assert.fail(
          `${file.path}: move built-in JSX prose to a message key: ${normalize(node.text)}`,
        )
      if (
        !ts.isCallExpression(node) ||
        !["t", "uiMessage"].includes(node.expression.getText())
      )
        return
      const key = node.arguments[0]
      if (key && ts.isStringLiteralLike(key))
        assert.ok(
          Object.hasOwn(
            source.includes('from "@/lib/i18n-svg"')
              ? svg["zh-CN"]
              : core["zh-CN"],
            key.text,
          ),
          `${file.path}: unknown component key ${key.text}`,
        )
    })
  }
}
console.log(
  `i18n checked: ${Object.keys(core.en).length} portable + ${Object.keys(svg.en).length} scoped SVG + ${Object.keys(site.en).length} site + ${Object.keys(crm.en).length} CRM messages, Catalog, dictionary and Registry closure.`,
)
