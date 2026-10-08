import { readFile, mkdir, writeFile, readdir } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import assert from "node:assert/strict"

export function pinRegistryItem(item, origin, version, mode = "") {
  return {
    ...item,
    registryDependencies: item.registryDependencies?.map((value) => {
      const url = new URL(value)
      const suffix = url.pathname.replace(/^\/r\/(?:host\/|scoped\/)?/, "")
      assert.ok(/^[\w-]+\.json$/.test(suffix), `Invalid dependency: ${value}`)
      return `${origin}/r/${version}/${mode ? `${mode}/` : ""}${suffix}`
    }),
  }
}
export async function snapshotRegistry({ source, output, origin, version }) {
  assert.match(
    version,
    /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/,
    "Use a semantic version",
  )
  assert.ok(["http:", "https:"].includes(new URL(origin).protocol))
  const files = new Map()
  for (const mode of ["", "host", "scoped"]) {
    const directory = path.join(source, mode)
    for (const name of (await readdir(directory))
      .filter((value) => value.endsWith(".json") && value !== "registry.json")
      .sort()) {
      const item = JSON.parse(
        await readFile(path.join(directory, name), "utf8"),
      )
      item.dependencies = await Promise.all(
        (item.dependencies ?? []).map(async (dependency) => {
          const index = dependency.lastIndexOf("@")
          const name = index > 0 ? dependency.slice(0, index) : dependency
          const installed = JSON.parse(
            await readFile(
              path.resolve(
                import.meta.dirname,
                "../node_modules",
                name,
                "package.json",
              ),
              "utf8",
            ),
          )
          return `${name}@${installed.version}`
        }),
      )
      files.set(
        path.join(mode, name),
        JSON.stringify(pinRegistryItem(item, origin, version, mode), null, 2) +
          "\n",
      )
    }
  }
  const hashes = Object.fromEntries(
    [...files].map(([file, content]) => [
      file,
      createHash("sha256").update(content).digest("hex"),
    ]),
  )
  files.set(
    "snapshot.json",
    JSON.stringify({ version, origin, files: hashes }, null, 2) + "\n",
  )
  const directory = path.join(output, version)
  // Verify the entire snapshot before writing anything. Equal bytes are idempotent.
  for (const [file, content] of files) {
    const existing = await readFile(path.join(directory, file), "utf8").catch(
      (error) => {
        if (error.code !== "ENOENT") throw error
        return undefined
      },
    )
    assert.ok(
      existing === undefined || existing === content,
      `Immutable Registry collision: ${version}/${file}. Choose a new version.`,
    )
  }
  for (const [file, content] of files) {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true })
    try {
      await writeFile(path.join(directory, file), content, { flag: "wx" })
    } catch (error) {
      if (error.code !== "EEXIST") throw error
      assert.equal(await readFile(path.join(directory, file), "utf8"), content)
    }
  }
  return { directory, files: files.size - 1, version }
}
if (process.argv[1] === import.meta.filename) {
  const options = Object.fromEntries(
    process.argv
      .slice(2)
      .map((value, index, args) =>
        value.startsWith("--") ? [value.slice(2), args[index + 1]] : [],
      )
      .filter((entry) => entry.length),
  )
  const root = path.resolve(import.meta.dirname, "..")
  console.log(
    await snapshotRegistry({
      source: path.join(root, "public/r"),
      output: options.output ?? path.join(root, "public/r"),
      origin: (
        options.origin ??
        process.env.NEXT_PUBLIC_SITE_URL ??
        "http://localhost:3010"
      ).replace(/\/$/, ""),
      version: options.version,
    }),
  )
}
