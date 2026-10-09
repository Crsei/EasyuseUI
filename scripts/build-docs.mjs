import assert from "node:assert/strict"
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { getSingletonHighlighter, createJavaScriptRegexEngine } from "shiki"
import { componentManifest } from "../lib/component-manifest.ts"
import { docGuides } from "../lib/doc-guides.ts"
import { exampleManifest } from "../lib/example-manifest.ts"
import { siteMessages } from "../lib/site-i18n-messages.ts"
const root = path.resolve(import.meta.dirname, "..")
const write = process.argv.includes("--write")
const translations = new Map(
  Object.entries(siteMessages["zh-CN"]).map(([key, value]) => [
    value,
    siteMessages.en[key],
  ]),
)
const bilingual = (text) => ({
  "zh-CN": text,
  en: translations.get(text) ?? text,
})
const ids = new Set(componentManifest.map((entry) => entry.slug))
const guideIds = new Set()
for (const guide of docGuides) {
  assert.ok(
    !ids.has(guide.slug) && !guideIds.has(guide.slug),
    `Guide/component conflict: ${guide.slug}`,
  )
  guideIds.add(guide.slug)
  const sections = new Set()
  for (const section of guide.sections) {
    assert.match(section.id, /^[a-z0-9-]+$/)
    assert.ok(
      !sections.has(section.id),
      `Duplicate section: ${guide.slug}/${section.id}`,
    )
    sections.add(section.id)
    for (const locale of ["zh-CN", "en"])
      assert.ok(section.title[locale]?.trim() && section.body[locale]?.trim())
  }
}
for (const example of exampleManifest) {
  assert.ok(example.href.startsWith("/") && !example.href.startsWith("//"))
  for (const slug of example.components)
    assert.ok(ids.has(slug), `Unknown example component ${slug}`)
}
const groupOrder = [
  "interaction",
  "data",
  "agent",
  "canvas",
  "workspace",
  "other",
]
const docs = componentManifest
  .map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    docPath: entry.docPath,
    description: bilingual(entry.description),
    docGroup: entry.docGroup,
    docOrder: entry.docOrder,
    aliases: entry.aliases ?? [],
  }))
  .sort(
    (a, b) =>
      groupOrder.indexOf(a.docGroup) - groupOrder.indexOf(b.docGroup) ||
      a.docOrder - b.docOrder,
  )
const fileIndex = {},
  resources = new Map()
const highlighter = await getSingletonHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["tsx", "css", "json", "bash"],
  engine: createJavaScriptRegexEngine(),
})
for (const entry of componentManifest) {
  fileIndex[entry.slug] = []
  for (const [file, kind] of [
    [entry.source, "source"],
    [entry.example, "example"],
    ...(entry.relatedSources ?? []).map((file) => [file, "related"]),
  ]) {
    const full = path.resolve(root, file)
    assert.ok(
      full.startsWith(root + path.sep),
      "Source path outside repository",
    )
    const code = await readFile(full, "utf8")
    const id = createHash("sha256")
      .update(file + "\0" + code)
      .digest("hex")
    const resource = `/docs-code/${id}.json`
    fileIndex[entry.slug].push({
      id,
      path: file,
      kind,
      url: resource,
      lines: code.split("\n").length,
    })
    if (!resources.has(resource))
      resources.set(resource, {
        schemaVersion: 1,
        id,
        path: file,
        code,
        html: highlighter.codeToHtml(code, {
          lang: file.endsWith(".css") ? "css" : "tsx",
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        }),
      })
  }
}
const sectionLabels = {
  installation: { "zh-CN": "安装", en: "Installation" },
  usage: { "zh-CN": "使用", en: "Usage" },
  api: { "zh-CN": "API", en: "API" },
  states: { "zh-CN": "状态与交互", en: "States and interaction" },
  example: { "zh-CN": "完整示例", en: "Complete example" },
  source: { "zh-CN": "源码", en: "Source" },
}
const search = []
for (const entry of docs) {
  search.push({
    id: entry.slug,
    kind: "components",
    title: bilingual(entry.name),
    summary: entry.description,
    href: entry.docPath,
    keywords: [entry.slug, ...entry.aliases, entry.docGroup].join(" "),
  })
  for (const [id, label] of Object.entries(sectionLabels))
    search.push({
      id: `${entry.slug}-${id}`,
      kind: "components",
      title: {
        "zh-CN": `${entry.name} · ${label["zh-CN"]}`,
        en: `${entry.name} · ${label.en}`,
      },
      summary: entry.description,
      href: `${entry.docPath}#${id}`,
      keywords: [entry.slug, ...entry.aliases, label["zh-CN"], label.en].join(
        " ",
      ),
    })
}
for (const guide of docGuides) {
  search.push({
    id: guide.slug,
    kind: "guides",
    title: guide.title,
    summary: guide.summary,
    href: `/docs/${guide.slug}/`,
    keywords: guide.slug,
  })
  for (const section of guide.sections)
    search.push({
      id: `${guide.slug}-${section.id}`,
      kind: "guides",
      title: {
        "zh-CN": `${guide.title["zh-CN"]} · ${section.title["zh-CN"]}`,
        en: `${guide.title.en} · ${section.title.en}`,
      },
      summary: section.body,
      href: `/docs/${guide.slug}/#${section.id}`,
      keywords: guide.slug,
    })
}
for (const example of exampleManifest)
  search.push({
    id: example.id,
    kind: "examples",
    title: example.title,
    summary: example.description,
    href: example.href,
    keywords: example.components.join(" "),
  })
const blogs = JSON.parse(
  await readFile(path.join(root, "lib/blog-index.json"), "utf8"),
)
for (const post of blogs)
  search.push({
    id: post.slug,
    kind: "articles",
    title: {
      "zh-CN": post.title["zh-CN"],
      en: post.title.en ?? post.title["zh-CN"],
    },
    summary: {
      "zh-CN": post.summary["zh-CN"],
      en: post.summary.en ?? post.summary["zh-CN"],
    },
    href: `/blog/${post.slug}/`,
    keywords: post.slug,
  })
for (const example of exampleManifest) {
  assert.ok(
    blogs.some((post) => post.slug === example.article),
    `Missing public example article: ${example.article}`,
  )
  for (const thumbnail of Object.values(example.thumbnail)) {
    assert.ok(
      thumbnail.startsWith("/site/scenes/") && !thumbnail.includes(".."),
    )
    await readFile(path.join(root, "public", thumbnail))
  }
}
const outputs = new Map([
  [
    "lib/guide-navigation.json",
    docGuides.map(({ slug, title, summary, sections }) => ({
      slug,
      title,
      summary,
      sections: sections.map(({ id, title }) => ({ id, title })),
    })),
  ],
  ["lib/docs-index.json", docs],
  ["lib/docs-code-index.json", fileIndex],
  ["public/docs-search.json", { schemaVersion: 1, items: search }],
])
for (const [url, resource] of resources) outputs.set("public" + url, resource)
for (const [filename, data] of outputs) {
  const target = path.join(root, filename),
    content = JSON.stringify(data, null, 2) + "\n"
  if (write) {
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content)
  } else
    assert.equal(
      await readFile(target, "utf8"),
      content,
      `${filename} is stale; run pnpm docs:build`,
    )
}
if (write) {
  const directory = path.join(root, "public/docs-code")
  for (const filename of await readdir(directory)) {
    if (
      /^[a-f0-9]{64}\.json$/.test(filename) &&
      !outputs.has(`public/docs-code/${filename}`)
    )
      await unlink(path.join(directory, filename))
  }
}
console.log(
  `Docs checked: ${docs.length} components, ${docGuides.length} guides, ${resources.size} lazy source resources, ${search.length} search entries`,
)
