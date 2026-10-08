import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { componentManifest } from "../lib/component-manifest.ts"
const root = path.resolve(import.meta.dirname, "..")
const content = path.join(root, "content/blog")
const posts = []
for (const filename of fs
  .readdirSync(content)
  .filter((name) => name.endsWith(".ts"))) {
  const loadedContent = await import(
    pathToFileURL(path.join(content, filename))
  )
  posts.push(...Object.values(loadedContent))
}
const slugs = new Set(),
  components = new Set(componentManifest.map((entry) => entry.slug))
const safeFile = (file) => {
  assert.ok(
    file.startsWith("/blog/") && !file.includes(".."),
    `Unapproved public asset: ${file}`,
  )
  assert.ok(
    fs.existsSync(path.join(root, "public", file)),
    `Missing Blog asset: ${file}`,
  )
}
const text = (value) =>
  assert.ok(
    value && typeof value["zh-CN"] === "string" && value["zh-CN"].trim(),
    "Missing original text",
  )
for (const post of posts) {
  assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.ok(!slugs.has(post.slug), `Duplicate slug: ${post.slug}`)
  slugs.add(post.slug)
  assert.ok(["zh-CN", "en"].includes(post.originalLocale))
  assert.ok(
    ["performance", "design", "reuse", "distribution", "canvas"].includes(
      post.category,
    ),
  )
  text(post.title)
  text(post.summary)
  assert.ok(["draft", "published"].includes(post.visibility))
  assert.ok(
    ["planned", "implementing", "measuring", "verified"].includes(post.status),
  )
  for (const date of [post.publishedAt, post.updatedAt])
    assert.ok(
      /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)),
    )
  assert.ok(post.updatedAt >= post.publishedAt)
  assert.ok(
    post.author &&
      post.optimizationIds.length &&
      post.body.length &&
      post.limitations.length,
  )
  const evidenceIds = new Set()
  for (const item of post.evidence) {
    assert.ok(!evidenceIds.has(item.id))
    evidenceIds.add(item.id)
    assert.ok(
      ["measurement", "screenshot", "test", "source"].includes(item.type),
    )
    safeFile(item.file)
    assert.ok(
      item.capturedAt &&
        item.sourceSnapshotId &&
        item.command &&
        item.environment &&
        item.method &&
        item.sampleCount > 0,
    )
    text(item.scope)
  }
  const headings = new Set()
  const image = (item) => {
    if (!item) return
    safeFile(item.src)
    text(item.alt)
    text(item.caption)
    assert.ok(
      item.sourceSnapshotId &&
        item.capturedAt &&
        item.fixture &&
        item.viewport.width > 0 &&
        item.viewport.height > 0 &&
        ["light", "dark"].includes(item.theme) &&
        ["zh-CN", "en"].includes(item.locale),
    )
  }
  for (const block of post.body) {
    assert.ok(
      [
        "paragraph",
        "link",
        "heading",
        "list",
        "code",
        "image",
        "comparison",
        "metrics",
        "demo",
      ].includes(block.type),
      `Unknown block in ${post.slug}`,
    )
    if (block.type === "heading") {
      text(block.text)
      assert.match(block.id, /^[a-z0-9-]+$/)
      assert.ok(!headings.has(block.id), `Duplicate heading ${block.id}`)
      headings.add(block.id)
    }
    if (block.type === "paragraph") text(block.text)
    if (block.type === "link") {
      text(block.text)
      assert.match(block.href, /^\/(?:examples\/[a-z0-9-]+|workspace\/agents)\/$/)
      assert.ok(
        fs.existsSync(path.join(root, "app", block.href, "page.tsx")),
        `Missing example route: ${block.href}`,
      )
    }
    if (block.type === "list") block.items.forEach(text)
    if (block.type === "image") image(block.image)
    if (block.type === "comparison") {
      image(block.before)
      image(block.after)
    }
    if (block.type === "demo") assert.ok(components.has(block.componentSlug))
    if (block.type === "metrics")
      for (const metric of block.metrics) {
        text(metric.label)
        assert.ok(["lower", "higher"].includes(metric.direction))
        assert.ok(metric.key && metric.unit && metric.statistic)
        for (const value of [metric.before, metric.after, metric.target])
          assert.ok(
            value === null || Number.isFinite(value),
            "Unknown metrics must be null",
          )
        if (metric.evidenceId)
          assert.ok(
            evidenceIds.has(metric.evidenceId),
            `Missing metric evidence ${metric.evidenceId}`,
          )
        if (metric.after !== null)
          assert.ok(
            metric.evidenceId && metric.sampleCount > 0,
            "Measured result requires evidence",
          )
      }
  }
  for (const slug of post.relatedComponents)
    assert.ok(components.has(slug), `Unknown component ${slug}`)
  if (post.status === "verified")
    assert.ok(
      (post.resultVersion || post.sourceSnapshotId) &&
        post.evidence.length &&
        post.body.some(
          (block) =>
            block.type === "metrics" &&
            block.metrics.some(
              (metric) =>
                metric.before !== null &&
                metric.after !== null &&
                metric.evidenceId &&
                metric.beforeContext &&
                metric.beforeContext === metric.afterContext,
            ),
        ),
      `${post.slug}: verified requires measured scoped evidence`,
    )
}
for (const post of posts)
  for (const slug of post.relatedPosts)
    assert.ok(
      slugs.has(slug) &&
        (post.visibility !== "published" ||
          posts.some(
            (candidate) =>
              candidate.slug === slug && candidate.visibility === "published",
          )),
      `Unknown or private related post ${slug}`,
    )
const published = posts.filter((post) => post.visibility === "published")
const index =
  JSON.stringify(
    published.map(({ slug, title, summary }) => ({ slug, title, summary })),
    null,
    2,
  ) + "\n"
const filename = path.join(root, "lib/blog-index.json")
if (process.argv.includes("--write")) fs.writeFileSync(filename, index)
else
  assert.deepEqual(
    JSON.parse(fs.readFileSync(filename, "utf8")),
    JSON.parse(index),
    "Blog index stale; run pnpm blog:build",
  )
if (process.argv.includes("--release")) {
  const origin = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010",
  )
  assert.ok(
    origin.protocol === "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname),
    "Public release needs a configured HTTPS origin",
  )
  assert.ok(
    fs.existsSync(path.join(root, "LICENSE")),
    "Public release requires owner-selected LICENSE",
  )
}
console.log(
  `Blog checked: ${published.length} published, ${posts.length - published.length} drafts; references, assets, metrics and evidence`,
)
