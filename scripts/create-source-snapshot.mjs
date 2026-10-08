import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
  mkdir,
  copyFile,
  readFile,
  writeFile,
  symlink,
  mkdtemp,
} from "node:fs/promises"
import path from "node:path"
const root = path.resolve(import.meta.dirname, "..")
const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : await mkdtemp(path.join(path.dirname(root), ".tmp/easyuseui-opt-after-"))
await mkdir(target, { recursive: true })
const names = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root },
)
  .toString()
  .split("\0")
  .filter(Boolean)
const files = {}
for (const filename of names) {
  if (
    path.basename(filename).startsWith(".env") ||
    path.basename(filename) === "github_token.txt"
  )
    continue
  const output = path.join(target, filename)
  await mkdir(path.dirname(output), { recursive: true })
  await copyFile(path.join(root, filename), output)
  files[filename] = createHash("sha256")
    .update(await readFile(output))
    .digest("hex")
}
try {
  await symlink(
    path.join(root, "node_modules"),
    path.join(target, "node_modules"),
    "dir",
  )
} catch (error) {
  if (error.code !== "EEXIST") throw error
}
const manifest = {
  head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root })
    .toString()
    .trim(),
  snapshotId: createHash("sha256")
    .update(JSON.stringify(Object.entries(files).sort()))
    .digest("hex"),
  capturedAt: new Date().toISOString(),
  files,
}
await writeFile(
  path.join(target, "source-snapshot.json"),
  JSON.stringify(manifest, null, 2) + "\n",
)
await writeFile(
  path.join(target, "source.patch"),
  execFileSync("git", ["diff", "--binary"], { cwd: root }),
)
console.log(target)
