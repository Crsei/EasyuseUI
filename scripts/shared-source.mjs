import path from "node:path"
import { existsSync } from "node:fs"
/** Canonical repo sources; Registry destinations keep existing consumer paths. */
export function sharedSource(root, source) {
  const candidate = path.join(root, "packages/ui", source)
  return existsSync(candidate) ? candidate : path.join(root, source)
}
