import { defineConfig } from "@playwright/test"
import base from "./playwright.config"
export default defineConfig({ ...base, testDir: "./examples/agent-workspace/tests", testMatch: /pi-workspace(?:-real)?\.spec\.ts/, workers: 1, fullyParallel: false, use: { ...base.use, baseURL: process.env.PI_BROWSER_BASE_URL ?? "http://127.0.0.1:3021" }, webServer: process.env.PI_BROWSER_BASE_URL ? undefined : { command: "pnpm --filter @easyuse-ui/example-agent-workspace preview", url: "http://127.0.0.1:3021", reuseExistingServer: false } })
