import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { openSync, closeSync } from "node:fs"
import {
  mkdir,
  copyFile,
  readFile,
  writeFile,
  symlink,
  mkdtemp,
  lstat,
} from "node:fs/promises"
import path from "node:path"
const root = path.resolve(import.meta.dirname, "..")
const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : await mkdtemp(path.join(path.dirname(root), ".tmp/easyuseui-opt-after-"))
if (target === root || target.startsWith(`${root}${path.sep}`))
  throw new Error("Source snapshots must live outside the shared checkout")
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
const deletedFiles = []
for (const filename of names) {
  if (
    path.basename(filename).startsWith(".env") ||
    path.basename(filename) === "github_token.txt" ||
    /^(node_modules|\.next|out|test-results|playwright-report)\//.test(filename)
  )
    continue
  try {
    const stat = await lstat(path.join(root, filename))
    if (!stat.isFile()) continue
  } catch (error) {
    if (error.code !== "ENOENT") throw error
    deletedFiles.push(filename)
    continue
  }
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
  deletedFiles,
  status: execFileSync("git", ["status", "--short"], { cwd: root }).toString(),
  environment: { node: process.version, platform: process.platform },
}
await writeFile(
  path.join(target, "source-snapshot.json"),
  JSON.stringify(manifest, null, 2) + "\n",
)
const patchFile = openSync(path.join(target, "source.patch"), "w")
try {
  execFileSync(
    "git",
    [
      "diff",
      "HEAD",
      "--binary",
      "--",
      ".",
      ":(exclude)**/.env*",
      ":(exclude)**/github_token.txt",
      ":(exclude)node_modules/**",
      ":(exclude).next/**",
      ":(exclude)out/**",
      ":(exclude)test-results/**",
      ":(exclude)playwright-report/**",
    ],
    {
      cwd: root,
      stdio: ["ignore", patchFile, "pipe"],
    },
  )
} finally {
  closeSync(patchFile)
}
console.log(target)
