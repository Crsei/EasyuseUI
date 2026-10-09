import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SettingsManager,
  SessionManager,
} from "@earendil-works/pi-coding-agent"
import { join } from "node:path"
import type { PiModel } from "../../../lib/pi-workspace-protocol.ts"
import type { RawMessage } from "./history.ts"
import { HostError } from "./history.ts"

export type DriverEvent = {
  type: string
  message?: RawMessage
  aborted?: boolean
}
export type Driver = {
  manager: SessionManager
  prompt: (text: string) => Promise<void>
  abort: () => Promise<void>
  dispose: () => void
  subscribe: (listener: (event: DriverEvent) => void) => () => void
}
export type DriverFactory = (options: {
  cwd: string
  file: string
  modelId: string
}) => Promise<Driver>
export async function sdkRuntime(
  agentDir: string,
): Promise<{ models: PiModel[]; factory: DriverFactory }> {
  const runtime = await ModelRuntime.create({
    authPath: join(agentDir, "auth.json"),
    modelsPath: join(agentDir, "models.json"),
    modelsStorePath: join(agentDir, "models-store.json"),
    allowModelNetwork: false,
  })
  const available = runtime.getAvailableSnapshot()
  const models = available.map((model) => ({
    id: `${model.provider}/${model.id}`,
    label: `${model.provider} · ${model.name}`,
  }))
  return {
    models,
    factory: async ({ cwd, file, modelId }) => {
      const model = available.find((m) => `${m.provider}/${m.id}` === modelId)
      if (!model) throw new HostError("model_unavailable", 409)
      const settingsManager = SettingsManager.inMemory({
        compaction: { enabled: false },
        retry: { enabled: false },
      })
      const loader = new DefaultResourceLoader({
        cwd,
        agentDir,
        settingsManager,
        noExtensions: true,
        noSkills: true,
        noPromptTemplates: true,
        noThemes: true,
        noContextFiles: true,
      })
      await loader.reload()
      const { session } = await createAgentSession({
        cwd,
        agentDir,
        model,
        modelRuntime: runtime,
        thinkingLevel: "off",
        settingsManager,
        resourceLoader: loader,
        sessionManager: SessionManager.open(file),
        tools: ["read", "grep", "find", "ls"],
      })
      const tools = session.getActiveToolNames()
      if (
        tools.some((name) => !["read", "grep", "find", "ls"].includes(name))
      ) {
        session.dispose()
        throw new HostError("unexpected_tool_capability", 500)
      }
      return {
        manager: session.sessionManager,
        prompt: (text) =>
          session.prompt(text, { expandPromptTemplates: false }),
        abort: () => session.abort(),
        dispose: () => session.dispose(),
        subscribe: (listener) => session.subscribe((event) => listener(event)),
      }
    },
  }
}
