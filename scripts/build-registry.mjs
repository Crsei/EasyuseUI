import { readFile, mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { registrySchema, registryItemSchema } from "shadcn/schema"

const root = path.resolve(import.meta.dirname, "..")
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name)
  if (existsSync(file)) process.loadEnvFile(file)
}
const origin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010",
)
if (!["http:", "https:"].includes(origin.protocol))
  throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL")
const site = origin.href.replace(/\/$/, "")
const registry = registrySchema.parse(
  JSON.parse(await readFile(path.join(root, "registry.json"), "utf8")),
)
const names = new Set(registry.items.map((item) => item.name))
if (names.size !== registry.items.length)
  throw new Error("Registry item names must be unique")
const output = path.join(root, "public/r")
await mkdir(output, { recursive: true })

const theme = await readFile(path.join(root, "styles/theme.css"), "utf8")
function tokens(selector) {
  const body = theme.match(new RegExp(`${selector}\\s*\\{([^}]+)\\}`))?.[1]
  if (!body) throw new Error(`Missing theme selector: ${selector}`)
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  )
}

const built = []
for (const item of registry.items) {
  const result = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    ...(item.name === "theme"
      ? {
          cssVars: {
            theme: tokens("@theme inline"),
            light: tokens(":root"),
            dark: tokens("\\.dark"),
          },
        }
      : {}),
    registryDependencies: (item.registryDependencies || []).map(
      (dependency) => {
        if (!names.has(dependency))
          throw new Error(`${item.name}: unknown dependency ${dependency}`)
        return `${site}/r/${dependency}.json`
      },
    ),
    files: await Promise.all(
      (item.files || []).map(async (file) => ({
        ...file,
        content: await readFile(path.join(root, file.path), "utf8"),
      })),
    ),
  })
  await writeFile(
    path.join(output, `${item.name}.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  )
  built.push(result)
}
const index = registrySchema.parse({
  ...registry,
  homepage: site,
  items: built.map(({ files, ...item }) => ({
    ...item,
    files: files?.map((file) => ({ ...file, content: undefined })),
  })),
})
await writeFile(
  path.join(output, "registry.json"),
  `${JSON.stringify(index, null, 2)}\n`,
)
console.log(`EasyuseUI: built ${built.length} registry items at ${site}/r`)
