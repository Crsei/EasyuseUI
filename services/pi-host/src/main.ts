import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"
import { randomBytes } from "node:crypto"
import { createPiHost, type HostConfig } from "./host.ts"
import { sdkRuntime } from "./sdk.ts"

const root = resolve(import.meta.dirname, "../../..")
const expand = (path: string) =>
  path.startsWith("~/") ? join(homedir(), path.slice(2)) : resolve(root, path)
const file = process.env.PI_HOST_CONFIG
  ? expand(process.env.PI_HOST_CONFIG)
  : join(root, "services/pi-host/config.local.json")
const input = existsSync(file)
  ? JSON.parse(readFileSync(file, "utf8"))
  : {
      dataDir: ".local/pi-host",
      agentDir: "~/.pi/agent",
      port: 3012,
      projects: [
        {
          projectId: "easyuse-ui",
          name: "EasyuseUI",
          cwd: root,
          sessionDirs: [],
        },
      ],
      allowedOrigins: [
        "http://127.0.0.1:3010",
        "http://localhost:3010",
        "http://127.0.0.1:3011",
        "http://localhost:3011",
      ],
    }
const dataDir = expand(input.dataDir)
mkdirSync(dataDir, { recursive: true, mode: 0o700 })
const tokenPath = join(dataDir, "service-token")
if (!existsSync(tokenPath))
  writeFileSync(tokenPath, randomBytes(32).toString("base64url"), {
    mode: 0o600,
    flag: "wx",
  })
const token =
  process.env.PI_HOST_TOKEN ?? readFileSync(tokenPath, "utf8").trim()
const config: HostConfig = {
  ...input,
  token,
  dataDir,
  port: Number(process.env.PI_HOST_PORT ?? input.port),
  projects: input.projects.map(
    (p: { cwd: string; sessionDirs?: string[] }) => ({
      ...p,
      cwd: expand(p.cwd),
      sessionDirs: p.sessionDirs?.map(expand),
    }),
  ),
}
const agentDir = expand(input.agentDir ?? "~/.pi/agent")
const settingsFile = join(agentDir, "settings.json")
if (!config.defaultModel && existsSync(settingsFile)) {
  const settings = JSON.parse(readFileSync(settingsFile, "utf8"))
  if (settings.defaultProvider && settings.defaultModel)
    config.defaultModel = `${settings.defaultProvider}/${settings.defaultModel}`
}
const runtime = await sdkRuntime(agentDir)
const host = createPiHost(config, runtime.models, runtime.factory)
host.server.on("error", (error: NodeJS.ErrnoException) => {
  host.store.close()
  console.error(`Pi Host failed: ${error.code ?? "listen_error"}`)
  process.exitCode = 1
})
host.server.listen(config.port, "127.0.0.1", () =>
  console.log(
    `Pi Host http://127.0.0.1:${config.port} · SDK 1.1.0 · ${runtime.models.length} available models\nCredential file: ${tokenPath}`,
  ),
)
let closing = false
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    if (closing) return
    closing = true
    void host.close().then(() => {
      process.exitCode = 0
    })
  })
